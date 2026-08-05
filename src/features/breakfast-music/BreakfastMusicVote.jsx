import React, { useState } from 'react';
import { Music, Plus, Check } from 'lucide-react';
import songsData from '../../data/json/breakfastSongs.json';
import { loadStoredVotes, persistVotes, getVotedIds, markAsVoted } from '../../shared/utils/votingService';

export default function BreakfastMusicVote({ onShowToast }) {
  const [songs, setSongs] = useState(() => loadStoredVotes(songsData.songs));
  const [votedIds, setVotedIds] = useState(() => getVotedIds());
  const [suggestion, setSuggestion] = useState('');

  const totalVotes = songs.reduce((acc, s) => acc + s.votes, 0) || 1;
  const sortedSongs = [...songs].sort((a, b) => b.votes - a.votes);

  const handleVote = (song) => {
    if (votedIds.includes(song.id)) return;

    const updated = songs.map(s => s.id === song.id ? { ...s, votes: s.votes + 1 } : s);
    setSongs(updated);
    persistVotes(updated);

    markAsVoted(song.id);
    setVotedIds(prev => [...prev, song.id]);

    if (onShowToast) onShowToast(`Voto registrado para "${song.title}"! 🎶`, 'success');
  };

  const handleSuggest = () => {
    const title = suggestion.trim();
    if (!title) return;

    const newSong = { id: `custom_${Date.now()}`, title, votes: 1 };
    const updated = [...songs, newSong];
    setSongs(updated);
    persistVotes(updated);
    markAsVoted(newSong.id);
    setVotedIds(prev => [...prev, newSong.id]);
    setSuggestion('');

    if (onShowToast) onShowToast('Sugestão adicionada à votação!', 'success');
  };

  return (
    <div className="breakfast-music-section fade-in">
      <div className="section-header">
        <h2 className="section-title"><Music size={18} className="inline-icon" /> Música do Café da Manhã</h2>
        <p className="section-subtitle">Vote na trilha sonora de amanhã. A mais votada toca no café!</p>
      </div>

      <div className="vote-list">
        {sortedSongs.map(song => {
          const pct = Math.round((song.votes / totalVotes) * 100);
          const alreadyVoted = votedIds.includes(song.id);
          return (
            <div key={song.id} className="vote-row glass-panel">
              <div className="vote-row-top">
                <span className="vote-song-name">{song.title}</span>
                <span className="vote-count">{song.votes} voto{song.votes === 1 ? '' : 's'}</span>
              </div>
              <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <button
                className={`btn-vote ${alreadyVoted ? 'voted' : ''}`}
                onClick={() => handleVote(song)}
                disabled={alreadyVoted}
              >
                {alreadyVoted ? <><Check size={14} /> Você votou</> : 'Votar ▲'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="vote-suggest-row">
        <input
          type="text"
          placeholder="Sugerir uma música ou estilo..."
          value={suggestion}
          onChange={e => setSuggestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSuggest()}
        />
        <button className="btn-primary btn-suggest" onClick={handleSuggest}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
