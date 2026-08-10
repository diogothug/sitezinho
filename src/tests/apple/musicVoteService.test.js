import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInitialSongs,
  sortSongsByVotes,
  voteForSong,
  addCustomSong,
  searchSongs,
  calculateVotePercentage,
  getStoredUserVotes,
  saveUserVotes,
  saveSongsState
} from '../../shared/utils/musicVoteService';

describe('Apple-Style Test Suite: musicVoteService (Votação da Música do Café da Manhã)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockSongs = [
    { id: 's1', title: 'Forró Pé de Serra', votes: 4 },
    { id: 's2', title: 'Bossa Nova ao Vivo', votes: 7 },
    { id: 's3', title: 'MPB Clássica', votes: 5 }
  ];

  it('deve ordenar as músicas em ordem decrescente pelo número de votos', () => {
    const sorted = sortSongsByVotes(mockSongs);
    expect(sorted[0].title).toBe('Bossa Nova ao Vivo');
    expect(sorted[0].votes).toBe(7);
    expect(sorted[1].title).toBe('MPB Clássica');
    expect(sorted[2].title).toBe('Forró Pé de Serra');
  });

  it('deve desempatar músicas com a mesma quantidade de votos pelo título alfabético', () => {
    const tiedSongs = [
      { id: 's1', title: 'Reggae na Praia', votes: 5 },
      { id: 's2', title: 'Bossa Nova ao Vivo', votes: 5 }
    ];
    const sorted = sortSongsByVotes(tiedSongs);
    expect(sorted[0].title).toBe('Bossa Nova ao Vivo');
    expect(sorted[1].title).toBe('Reggae na Praia');
  });

  it('deve incrementar o número de votos de uma música corretamente', () => {
    const result = voteForSong(mockSongs, 's1', []);
    expect(result.success).toBe(true);
    expect(result.updatedUserVotes).toContain('s1');
    const updatedS1 = result.updatedSongs.find(s => s.id === 's1');
    expect(updatedS1.votes).toBe(5);
  });

  it('deve impedir que o mesmo hóspede vote mais de uma vez na mesma música', () => {
    const result = voteForSong(mockSongs, 's1', ['s1']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('já votou');
  });

  it('deve permitir adicionar uma nova música personalizada com 1 voto inicial', () => {
    const result = addCustomSong(mockSongs, 'Samba de Arame', 'Artista Baiano', []);
    expect(result.success).toBe(true);
    expect(result.newSong.title).toBe('Samba de Arame');
    expect(result.newSong.votes).toBe(1);
    expect(result.updatedUserVotes).toContain(result.newSong.id);
  });

  it('deve redirecionar para voto se a música sugerida já existir na lista', () => {
    const result = addCustomSong(mockSongs, 'bossa nova ao vivo', '', []);
    expect(result.success).toBe(true);
    const bossa = result.updatedSongs.find(s => s.id === 's2');
    expect(bossa.votes).toBe(8);
  });

  it('deve filtrar músicas por busca sem considerar maiúsculas nem acentos', () => {
    const searchResult = searchSongs(mockSongs, 'bossa');
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].title).toBe('Bossa Nova ao Vivo');

    const searchResultAccent = searchSongs(mockSongs, 'pe de serra');
    expect(searchResultAccent.length).toBe(1);
    expect(searchResultAccent[0].title).toBe('Forró Pé de Serra');
  });

  it('deve calcular a porcentagem de votos da música com precisão e segurança', () => {
    expect(calculateVotePercentage(5, 20)).toBe(25);
    expect(calculateVotePercentage(0, 0)).toBe(0);
    expect(calculateVotePercentage(10, 10)).toBe(100);
  });

  it('deve recuperar a lista inicial de músicas do localStorage quando disponível', () => {
    saveSongsState(mockSongs);
    saveUserVotes(['s2']);
    const loadedSongs = getInitialSongs();
    const loadedUserVotes = getStoredUserVotes();
    expect(loadedSongs.length).toBe(3);
    expect(loadedUserVotes).toEqual(['s2']);
  });
});
