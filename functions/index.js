const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

// --- Secrets (configurados via `firebase functions:secrets:set NOME`) ---
const YOUTUBE_API_KEY = defineSecret('YOUTUBE_API_KEY');
const YT_OAUTH_CLIENT_ID = defineSecret('YT_OAUTH_CLIENT_ID');
const YT_OAUTH_CLIENT_SECRET = defineSecret('YT_OAUTH_CLIENT_SECRET');
const YT_OAUTH_REFRESH_TOKEN = defineSecret('YT_OAUTH_REFRESH_TOKEN');
const YT_PLAYLIST_ID = defineSecret('YT_PLAYLIST_ID');

// Guarda simples contra spam de busca: 1 busca por hóspede a cada 3s.
// Memória da instância — suficiente na escala de uma pousada (e protege
// a quota diária da YouTube Data API: busca custa 100 units, limite ~10k/dia).
const lastSearchByUid = new Map();
const SEARCH_MIN_INTERVAL_MS = 3000;

/**
 * Monta um client OAuth2 autenticado como o dono da playlist (a pousada),
 * usando o refresh token obtido uma única vez no setup (veja SETUP_YOUTUBE.md).
 */
function getAuthenticatedYoutubeClient() {
  const oauth2Client = new google.auth.OAuth2(
    YT_OAUTH_CLIENT_ID.value(),
    YT_OAUTH_CLIENT_SECRET.value()
  );
  oauth2Client.setCredentials({ refresh_token: YT_OAUTH_REFRESH_TOKEN.value() });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

/**
 * Tenta inserir a música na playlist. Em caso de falha, marca o doc com
 * playlistError pra nunca falhar em silêncio — o próximo voto tenta de novo.
 * Retorna { ok, playlistItemId }.
 */
async function addToPlaylist(videoId, songRef) {
  try {
    const youtube = getAuthenticatedYoutubeClient();
    const { data: playlistItem } = await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: YT_PLAYLIST_ID.value(),
          resourceId: { kind: 'youtube#video', videoId }
        }
      }
    });

    await songRef.update({
      addedToPlaylist: true,
      playlistItemId: playlistItem.id,
      playlistError: false,
      playlistErrorAt: admin.firestore.FieldValue.delete()
    });
    return { ok: true, playlistItemId: playlistItem.id };
  } catch (err) {
    // A música continua valendo o voto no app mesmo se a chamada à playlist
    // falhar (ex: refresh token expirado) — mas agora fica MARCADA no
    // Firestore e logada com marcador, pra dar pra detectar e retentar.
    await songRef.update({
      playlistError: true,
      playlistErrorAt: admin.firestore.FieldValue.serverTimestamp(),
      lastPlaylistError: String(err.message || err).slice(0, 300)
    }).catch(() => {});
    console.error(`[PLAYLIST-FALHA] videoId=${videoId} erro=${err.message}`);
    return { ok: false };
  }
}

/**
 * searchYoutubeSongs — busca músicas no YouTube (usada pelo campo de busca
 * da seção "Música do Café da Manhã"). Usa só uma API key simples, sem OAuth,
 * porque busca é dado público.
 */
exports.searchYoutubeSongs = onCall(
  { secrets: [YOUTUBE_API_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'É preciso estar autenticado para buscar.');
    }
    const uid = request.auth.uid;

    const now = Date.now();
    const last = lastSearchByUid.get(uid) || 0;
    if (now - last < SEARCH_MIN_INTERVAL_MS) {
      throw new HttpsError('resource-exhausted', 'Calma aí, uma busca por vez.');
    }
    lastSearchByUid.set(uid, now);

    const query = (request.data?.query || '').trim().slice(0, 80);
    if (!query) {
      throw new HttpsError('invalid-argument', 'Informe um termo de busca.');
    }

    const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY.value() });

    const { data } = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      videoCategoryId: '10', // Música
      maxResults: 8,
      safeSearch: 'moderate'
    });

    return {
      results: (data.items || []).map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || ''
      }))
    };
  }
);

/**
 * voteSong — registra o voto de um hóspede numa música. Na primeira vez que
 * a música recebe um voto, ela já é adicionada à playlist real do YouTube
 * Music da pousada. Um mesmo hóspede (identificado pelo uid anônimo do
 * Firebase Auth) só pode votar uma vez em cada música.
 */
exports.voteSong = onCall(
  { secrets: [YT_OAUTH_CLIENT_ID, YT_OAUTH_CLIENT_SECRET, YT_OAUTH_REFRESH_TOKEN, YT_PLAYLIST_ID] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'É preciso estar autenticado para votar.');
    }

    const { videoId, title, channelTitle, thumbnailUrl } = request.data || {};
    if (!videoId || !title) {
      throw new HttpsError('invalid-argument', 'Dados da música incompletos.');
    }

    const uid = request.auth.uid;
    const songRef = db.collection('songVotes').doc(videoId);

    const { needsPlaylistAdd, newVoteCount, alreadyVoted } = await db.runTransaction(async (tx) => {
      const doc = await tx.get(songRef);

      if (!doc.exists) {
        tx.set(songRef, {
          videoId,
          title,
          channelTitle: channelTitle || '',
          thumbnailUrl: thumbnailUrl || '',
          votes: 1,
          voterIds: [uid],
          addedToPlaylist: false,
          playlistError: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { needsPlaylistAdd: true, newVoteCount: 1, alreadyVoted: false };
      }

      const current = doc.data();
      if ((current.voterIds || []).includes(uid)) {
        return { needsPlaylistAdd: false, newVoteCount: current.votes, alreadyVoted: true };
      }

      const updatedVotes = (current.votes || 0) + 1;
      tx.update(songRef, {
        votes: updatedVotes,
        voterIds: admin.firestore.FieldValue.arrayUnion(uid)
      });

      // Primeiro voto SEMPRE adiciona. Se a música já tinha falhado ao entrar
      // na playlist, o próximo voto tenta de novo (auto-cura depois do fix).
      const needsAdd = current.addedToPlaylist ? false : true;
      return { needsPlaylistAdd: needsAdd, newVoteCount: updatedVotes, alreadyVoted: false };
    });

    if (alreadyVoted) {
      throw new HttpsError('already-exists', 'Você já votou nessa música.');
    }

    // Só adiciona na playlist quando necessário (1º voto ou retry de falha).
    let addedToPlaylist = false;
    if (needsPlaylistAdd) {
      const res = await addToPlaylist(videoId, songRef);
      addedToPlaylist = res.ok;
    }

    return { votes: newVoteCount, addedToPlaylist };
  }
);
