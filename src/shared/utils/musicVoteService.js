import initialSongsData from '../../data/json/breakfastSongs.json';

const STORAGE_SONGS_KEY = 'pousada_mar_morere_song_votes';
const STORAGE_MY_VOTES_KEY = 'pousada_mar_morere_my_song_votes';

/**
 * Obtém a lista inicial de músicas (do localStorage ou fallback para breakfastSongs.json).
 * @param {Array} [fallbackList] 
 * @returns {Array} Lista de músicas tratadas e ordenadas
 */
export function getInitialSongs(fallbackList = initialSongsData.songs) {
  try {
    const saved = localStorage.getItem(STORAGE_SONGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortSongsByVotes(parsed);
      }
    }
  } catch (e) {
    console.error('Erro ao ler músicas salvas no localStorage:', e);
  }
  return sortSongsByVotes(fallbackList || []);
}

/**
 * Obtém a lista de IDs de músicas que o hóspede já votou.
 * @returns {Array<string>}
 */
export function getStoredUserVotes() {
  try {
    const saved = localStorage.getItem(STORAGE_MY_VOTES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Salva a lista de votos do usuário no localStorage.
 * @param {Array<string>} userVotes 
 */
export function saveUserVotes(userVotes) {
  try {
    localStorage.setItem(STORAGE_MY_VOTES_KEY, JSON.stringify(userVotes));
  } catch (e) {
    console.error('Erro ao salvar votos do usuário:', e);
  }
}

/**
 * Salva a lista de músicas e contagens no localStorage.
 * @param {Array} songs 
 */
export function saveSongsState(songs) {
  try {
    localStorage.setItem(STORAGE_SONGS_KEY, JSON.stringify(songs));
  } catch (e) {
    console.error('Erro ao salvar estado das músicas:', e);
  }
}

/**
 * Ordena as músicas em ordem decrescente pelo número de votos.
 * Em caso de empate, ordena alfabeticamente por título.
 * @param {Array} songs 
 * @returns {Array} Nova lista de músicas ordenada
 */
export function sortSongsByVotes(songs = []) {
  if (!Array.isArray(songs)) return [];
  return [...songs].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return (a.title || '').localeCompare(b.title || '');
  });
}

/**
 * Registra o voto de um usuário para uma música específica.
 * @param {Array} songs Lista atual de músicas
 * @param {string} songId ID da música a ser votada
 * @param {Array<string>} userVotedIds Lista de IDs em que o usuário já votou
 * @returns {{ updatedSongs: Array, updatedUserVotes: Array, success: boolean, message: string }}
 */
export function voteForSong(songs = [], songId = '', userVotedIds = []) {
  if (!songId) {
    return { updatedSongs: songs, updatedUserVotes: userVotedIds, success: false, message: 'ID da música não informado.' };
  }

  if (userVotedIds.includes(songId)) {
    return { updatedSongs: songs, updatedUserVotes: userVotedIds, success: false, message: 'Você já votou nesta música!' };
  }

  let found = false;
  const updatedSongs = songs.map(song => {
    if (song.id === songId || song.videoId === songId) {
      found = true;
      return { ...song, votes: (song.votes || 0) + 1 };
    }
    return song;
  });

  if (!found) {
    return { updatedSongs: songs, updatedUserVotes: userVotedIds, success: false, message: 'Música não encontrada na lista.' };
  }

  const sorted = sortSongsByVotes(updatedSongs);
  const updatedUserVotes = [...userVotedIds, songId];

  saveSongsState(sorted);
  saveUserVotes(updatedUserVotes);

  return {
    updatedSongs: sorted,
    updatedUserVotes,
    success: true,
    message: 'Voto registrado com sucesso!'
  };
}

/**
 * Adiciona uma nova música sugerida pelo hóspede (com 1 voto inicial).
 * @param {Array} songs Lista atual de músicas
 * @param {string} title Título da música
 * @param {string} [artist=''] Artista ou canal
 * @param {Array<string>} userVotedIds Lista de votos do usuário
 * @returns {{ updatedSongs: Array, updatedUserVotes: Array, newSong: Object, success: boolean, message: string }}
 */
export function addCustomSong(songs = [], title = '', artist = '', userVotedIds = []) {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return { updatedSongs: songs, updatedUserVotes: userVotedIds, newSong: null, success: false, message: 'Informe o título da música.' };
  }

  // Verifica duplicidade por nome (case-insensitive)
  const normalizedTitle = cleanTitle.toLowerCase();
  const existing = songs.find(s => s.title.toLowerCase() === normalizedTitle);

  if (existing) {
    // Se a música já existir, redireciona para o voto
    return voteForSong(songs, existing.id, userVotedIds);
  }

  const newSong = {
    id: `custom_${Date.now()}`,
    title: cleanTitle,
    artist: artist.trim() || 'Sugerida por hóspede',
    votes: 1,
    addedToPlaylist: false
  };

  const updatedSongs = sortSongsByVotes([...songs, newSong]);
  const updatedUserVotes = [...userVotedIds, newSong.id];

  saveSongsState(updatedSongs);
  saveUserVotes(updatedUserVotes);

  return {
    updatedSongs,
    updatedUserVotes,
    newSong,
    success: true,
    message: `Música "${cleanTitle}" adicionada e votada!`
  };
}

/**
 * Filtra músicas por título ou artista ignorando acentos e maiúsculas/minúsculas.
 * @param {Array} songs 
 * @param {string} query 
 * @returns {Array} Lista filtrada de músicas
 */
export function searchSongs(songs = [], query = '') {
  if (!query || typeof query !== 'string') return songs;
  
  const normalize = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const term = normalize(query.trim());
  if (!term) return songs;

  return songs.filter(song => {
    const titleMatch = song.title && normalize(song.title).includes(term);
    const artistMatch = song.artist && normalize(song.artist).includes(term);
    const channelMatch = song.channelTitle && normalize(song.channelTitle).includes(term);
    return titleMatch || artistMatch || channelMatch;
  });
}

/**
 * Calcula a porcentagem do total de votos de uma música.
 * @param {number} votes Número de votos da música
 * @param {number} totalVotes Total acumulado de votos
 * @returns {number} Porcentagem arredondada (0 a 100)
 */
export function calculateVotePercentage(votes = 0, totalVotes = 0) {
  if (!totalVotes || totalVotes <= 0) return 0;
  const pct = Math.round((votes / totalVotes) * 100);
  return Math.min(100, Math.max(0, pct));
}
