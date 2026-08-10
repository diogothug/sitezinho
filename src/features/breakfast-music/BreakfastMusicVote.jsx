import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Music, Search, Check, ListMusic, PlusCircle } from 'lucide-react';
import { db, isFirebaseConfigured, ensureAnonymousAuth, callSearchYoutubeSongs, callVoteSong } from '../../shared/lib/firebase';
import { collection, onSnapshot, orderBy, query as firestoreQuery } from 'firebase/firestore';
import {
  getInitialSongs,
  getStoredUserVotes,
  voteForSong,
  addCustomSong,
  searchSongs,
  calculateVotePercentage
} from '../../shared/utils/musicVoteService';

export default function BreakfastMusicVote({ onShowToast }) {
  const [ready, setReady] = useState(!isFirebaseConfigured);
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [myVotes, setMyVotes] = useState([]);
  const lastSearchAt = useRef(0);

  // Inicialização no modo local ou Firebase
  useEffect(() => {
    if (isFirebaseConfigured) {
      ensureAnonymousAuth()
        .then(() => setReady(true))
        .catch(err => console.error('Falha ao autenticar hóspede:', err));
    } else {
      setSongs(getInitialSongs());
      setMyVotes(getStoredUserVotes());
      setReady(true);
    }
  }, []);

  // Escuta placar em tempo real se Firebase estiver ativado
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
    if (!term) {
      setSearchResults([]);
      return;
    }

    if (isFirebaseConfigured) {
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
        if (onShowToast) onShowToast('Não consegui buscar no YouTube agora. Filtrando localmente...', 'info');
        setSearchResults(searchSongs(songs, term));
      } finally {
        setSearching(false);
      }
    } else {
      const filtered = searchSongs(songs, term);
      setSearchResults(filtered);
    }
  }, [searchTerm, songs, onShowToast]);

  const handleVote = async (song) => {
    if (!ready) return;
    const songId = song.id || song.videoId;
    setVotingId(songId);

    if (isFirebaseConfigured) {
      try {
        await callVoteSong(song);
        setMyVotes(prev => [...prev, songId]);
        setSearchResults(prev => prev.filter(r => (r.id || r.videoId) !== songId));
        setSearchTerm('');
        if (onShowToast) onShowToast(`Voto registrado para "${song.title}"! 🎶`, 'success');
      } catch (err) {
        if (err.code === 'functions/already-exists') {
          setMyVotes(prev => [...prev, songId]);
          if (onShowToast) onShowToast('Você já tinha votado nessa música!', 'info');
        } else {
          console.error(err);
          if (onShowToast) onShowToast('Não consegui registrar o voto, tenta de novo.', 'error');
        }
      } finally {
        setVotingId(null);
      }
    } else {
      // Modo Local/Offline
      const result = voteForSong(songs, songId, myVotes);
      if (result.success) {
        setSongs(result.updatedSongs);
        setMyVotes(result.updatedUserVotes);
        setSearchResults(prev => prev.filter(r => (r.id || r.videoId) !== songId));
        if (onShowToast) onShowToast(`Voto registrado para "${song.title}"! 🎶`, 'success');
      } else {
        if (onShowToast) onShowToast(result.message, 'info');
      }
      setVotingId(null);
    }
  };

  const handleAddCustomSong = () => {
    const term = searchTerm.trim();
    if (!term) {
      if (onShowToast) onShowToast('Digite o nome da música para sugerir.', 'info');
      return;
    }

    const result = addCustomSong(songs, term, 'Sugerida por você', myVotes);
    if (result.success) {
      setSongs(result.updatedSongs);
      setMyVotes(result.updatedUserVotes);
      setSearchTerm('');
      setSearchResults([]);
      if (onShowToast) onShowToast(result.message, 'success');
    } else {
      if (onShowToast) onShowToast(result.message, 'info');
    }
  };

  const totalVotes = songs.reduce((acc, s) => acc + (s.votes || 0), 0) || 1;

  return (
    <div className="breakfast-music-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Music size={18} className="inline-icon" /> Música do Café da Manhã</h2>
        <p className="section-subtitle">
          {isFirebaseConfigured
            ? 'Busque no YouTube e vote — a mais votada entra na nossa playlist!'
            : 'Vote nas suas músicas favoritas para a playlist do café da manhã!'}
        </p>
      </div>

      <div className="vote-suggest-row">
        <input
          type="text"
          placeholder="Buscar ou sugerir música..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            if (!isFirebaseConfigured) {
              setSearchResults(searchSongs(songs, e.target.value));
            }
          }}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary btn-suggest" onClick={handleSearch} disabled={searching || !ready} title="Buscar">
          <Search size={16} />
        </button>
      </div>

      {searchTerm.trim() && (
        <div className="custom-suggest-action style-fade-in" style={{ marginTop: '8px', marginBottom: '12px' }}>
          <button className="btn-secondary btn-small" onClick={handleAddCustomSong} style={{ width: '100%', gap: '6px' }}>
            <PlusCircle size={14} /> Sugerir "{searchTerm}" como nova música
          </button>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results-list">
          {searchResults.map(song => {
            const songId = song.id || song.videoId;
            const isVoted = myVotes.includes(songId);
            return (
              <div key={songId} className="search-result-row glass-panel">
                {song.thumbnailUrl && <img src={song.thumbnailUrl} alt="" className="search-result-thumb" />}
                <div className="search-result-info">
                  <div className="vote-song-name">{song.title}</div>
                  <div className="vote-count">{song.artist || song.channelTitle || 'Música do Café'}</div>
                </div>
                <button
                  className={`btn-vote ${isVoted ? 'voted' : ''}`}
                  onClick={() => handleVote(song)}
                  disabled={!ready || votingId === songId || isVoted}
                >
                  {votingId === songId ? '...' : isVoted ? <Check size={14} /> : 'Votar ▲'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="vote-list-header">
        <ListMusic size={14} /> Mais Votadas para Amanhã
      </div>

      <div className="vote-list">
        {songs.length === 0 && (
          <p className="empty-note">Ainda não tem música sugerida — seja o primeiro a buscar e votar!</p>
        )}
        {songs.map(song => {
          const songId = song.id || song.videoId;
          const pct = calculateVotePercentage(song.votes || 0, totalVotes);
          const alreadyVoted = myVotes.includes(songId);
          return (
            <div key={songId} className="vote-row glass-panel">
              <div className="vote-row-top">
                <span className="vote-song-name">
                  {song.title} {song.addedToPlaylist && <Check size={13} className="playlist-check" title="Adicionada à playlist" />}
                </span>
                <span className="vote-count">{song.votes || 0} voto{song.votes === 1 ? '' : 's'}</span>
              </div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <button
                className={`btn-vote ${alreadyVoted ? 'voted' : ''}`}
                onClick={() => handleVote(song)}
                disabled={!ready || votingId === songId || alreadyVoted}
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
