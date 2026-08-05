/**
 * Gerencia votos de música do café da manhã.
 * Persiste no localStorage do dispositivo do hóspede (votação simples, sem backend).
 */

const VOTES_KEY = 'mdm_breakfast_song_votes';
const VOTED_KEY = 'mdm_breakfast_song_voted_ids';

export function loadStoredVotes(baseSongs) {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return baseSongs;
    const stored = JSON.parse(raw);
    return baseSongs.map(song => ({
      ...song,
      votes: typeof stored[song.id] === 'number' ? stored[song.id] : song.votes
    }));
  } catch (e) {
    return baseSongs;
  }
}

export function persistVotes(songs) {
  try {
    const map = {};
    songs.forEach(s => { map[s.id] = s.votes; });
    localStorage.setItem(VOTES_KEY, JSON.stringify(map));
  } catch (e) {
    /* localStorage indisponível, ignora silenciosamente */
  }
}

export function getVotedIds() {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markAsVoted(songId) {
  try {
    const current = getVotedIds();
    if (!current.includes(songId)) {
      localStorage.setItem(VOTED_KEY, JSON.stringify([...current, songId]));
    }
  } catch (e) {
    /* ignora silenciosamente */
  }
}
