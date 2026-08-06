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
 * searchYoutubeSongs — busca músicas no YouTube (usada pelo campo de busca
 * da seção "Música do Café da Manhã"). Usa só uma API key simples, sem OAuth,
 * porque busca é dado público.
 */
exports.searchYoutubeSongs = onCall(
  { secrets: [YOUTUBE_API_KEY] },
  async (request) => {
    const query = (request.data?.query || '').trim();
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
      safeSearch: 'none'
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

    const { isFirstVoteEver, newVoteCount, alreadyVoted } = await db.runTransaction(async (tx) => {
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
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { isFirstVoteEver: true, newVoteCount: 1, alreadyVoted: false };
      }

      const current = doc.data();
      if ((current.voterIds || []).includes(uid)) {
        return { isFirstVoteEver: false, newVoteCount: current.votes, alreadyVoted: true };
      }

      const updatedVotes = (current.votes || 0) + 1;
      tx.update(songRef, {
        votes: updatedVotes,
        voterIds: admin.firestore.FieldValue.arrayUnion(uid)
      });
      return { isFirstVoteEver: false, newVoteCount: updatedVotes, alreadyVoted: false };
    });

    if (alreadyVoted) {
      throw new HttpsError('already-exists', 'Você já votou nessa música.');
    }

    // Só na primeira vez que a música é sugerida, ela entra na playlist real.
    if (isFirstVoteEver) {
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
          playlistItemId: playlistItem.id
        });
      } catch (err) {
        // A música continua valendo o voto no app mesmo se a chamada à
        // playlist falhar (ex: token expirado) — não derruba a votação do
        // hóspede. O erro fica registrado nos logs pra investigação.
        console.error('Falha ao adicionar música à playlist do YouTube:', err.message);
      }
    }

    return { votes: newVoteCount, addedToPlaylist: isFirstVoteEver };
  }
);
