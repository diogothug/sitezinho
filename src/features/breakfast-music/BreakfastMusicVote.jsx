import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Music, Search, Check, ListMusic } from 'lucide-react';
import { db, isFirebaseConfigured, ensureAnonymousAuth, callSearchYoutubeSongs, callVoteSong } from '../../shared/lib/firebase';
import { collection, onSnapshot, orderBy, query as firestoreQuery } from 'firebase/firestore';

export default function BreakfastMusicVote({ onShowToast }) {
  const [ready, setReady] = useState(false);
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [myVotes, setMyVotes] = useState([]);
  const lastSearchAt = useRef(0);

  // Autentica o hóspede anonimamente assim que a seção monta
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    ensureAnonymousAuth()
      .then(() => setReady(true))
      .catch(err => console.error('Falha ao autenticar hóspede:', err));
  }, []);

  // Escuta o placar em tempo real — todo mundo vê os mesmos votos
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const q = firestoreQuery(collection(db, 'songVotes'), orderBy('votes', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setSongs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim();
    if (!term) return;
    const now = Date.now();
    if (now - lastSearchAt.current < 1500) {
      if (onShowToast) onShowToast('Calma aí, uma busca por vez...', 'info');
      return;
    }
    lastSearchAt.current = now;
    setSearching(true);
    try {
      const { data } = await callSearchYoutubeSongs(term);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast('Não consegui buscar agora, tenta de novo.', 'error');
    } finally {
      setSearching(false);
    }
  }, [searchTerm, onShowToast]);

  const handleVote = async (song) => {
    if (!ready) return;
    setVotingId(song.videoId);
    try {
      await callVoteSong(song);
      setMyVotes(prev => [...prev, song.videoId]);
      setSearchResults(prev => prev.filter(r => r.videoId !== song.videoId));
      setSearchTerm('');
      if (onShowToast) onShowToast(`Voto registrado para "${song.title}"! 🎶`, 'success');
    } catch (err) {
      if (err.code === 'functions/already-exists') {
        setMyVotes(prev => [...prev, song.videoId]);
        if (onShowToast) onShowToast('Você já tinha votado nessa música!', 'info');
      } else {
        console.error(err);
        if (onShowToast) onShowToast('Não consegui registrar o voto, tenta de novo.', 'error');
      }
    } finally {
      setVotingId(null);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="breakfast-music-section fade-in">
        <div className="section-header">
          <h2 className="section-title"><Music size={18} className="inline-icon" /> Música do Café da Manhã</h2>
          <p className="section-subtitle">Busque e vote nas músicas de amanhã de manhã</p>
        </div>
        <div className="info-box">
          Essa seção depende do Firebase configurado (veja <code>SETUP_YOUTUBE.md</code> no repositório). Assim que as variáveis de ambiente e as Cloud Functions estiverem no ar, a busca e a votação aparecem aqui automaticamente.
        </div>
      </div>
    );
  }

  const totalVotes = songs.reduce((acc, s) => acc + s.votes, 0) || 1;

  return (
    <div className="breakfast-music-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Music size={18} className="inline-icon" /> Música do Café da Manhã</h2>
        <p className="section-subtitle">Busque no YouTube e vote — a mais votada entra na nossa playlist!</p>
      </div>

      <div className="vote-suggest-row">
        <input
          type="text"
          placeholder="Buscar música ou artista..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary btn-suggest" onClick={handleSearch} disabled={searching || !ready}>
          <Search size={16} />
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results-list">
          {searchResults.map(song => (
            <div key={song.videoId} className="search-result-row glass-panel">
              {song.thumbnailUrl && <img src={song.thumbnailUrl} alt="" className="search-result-thumb" />}
              <div className="search-result-info">
                <div className="vote-song-name">{song.title}</div>
                <div className="vote-count">{song.channelTitle}</div>
              </div>
              <button
                className="btn-vote"
                onClick={() => handleVote(song)}
                disabled={!ready || votingId === song.videoId || myVotes.includes(song.videoId)}
              >
                {votingId === song.videoId ? '...' : 'Votar ▲'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="vote-list-header">
        <ListMusic size={14} /> Mais votadas
      </div>

      <div className="vote-list">
        {songs.length === 0 && (
          <p className="empty-note">Ainda não tem música sugerida — seja o primeiro a buscar e votar!</p>
        )}
        {songs.map(song => {
          const pct = Math.round((song.votes / totalVotes) * 100);
          const alreadyVoted = myVotes.includes(song.id);
          return (
            <div key={song.id} className="vote-row glass-panel">
              <div className="vote-row-top">
                <span className="vote-song-name">
                  {song.title} {song.addedToPlaylist && <Check size={13} className="playlist-check" />}
                </span>
                <span className="vote-count">{song.votes} voto{song.votes === 1 ? '' : 's'}</span>
              </div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <button
                className={`btn-vote ${alreadyVoted ? 'voted' : ''}`}
                onClick={() => handleVote(song)}
                disabled={!ready || votingId === song.id || alreadyVoted}
              >
                {alreadyVoted ? <><Check size={14} /> Você votou</> : 'Votar ▲'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
