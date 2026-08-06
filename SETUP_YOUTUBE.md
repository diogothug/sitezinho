# Configurando a Votação de Música + Playlist do YouTube Music

Essa seção busca músicas no YouTube e, no primeiro voto de cada música,
adiciona ela automaticamente numa playlist real da sua conta do YouTube
Music. Como isso mexe com a sua conta Google, algumas etapas só você
consegue fazer (exigem login). Depois de feitas uma vez, fica tudo automático.

Tempo estimado: uns 20-30 minutos, só na primeira vez.

---

## 1. Ativar a YouTube Data API v3

1. Acesse [console.cloud.google.com](https://console.cloud.google.com/) e selecione o **mesmo projeto** que você já usa no Firebase (canto superior, seletor de projeto).
2. Menu ☰ → **APIs e Serviços** → **Biblioteca**.
3. Busque por **YouTube Data API v3** → clique → **Ativar**.

## 2. Criar a API Key (usada só pra busca)

1. Ainda em APIs e Serviços → **Credenciais** → **Criar Credenciais** → **Chave de API**.
2. Copie a chave gerada. Guarde — vamos usar como `YOUTUBE_API_KEY` no passo 6.
3. (Recomendado) Clique em "Restringir chave" → em "Restrições de API" marque só **YouTube Data API v3**, pra chave não poder ser usada pra mais nada se vazar.

## 3. Criar o OAuth Client (usado pra mexer na playlist)

1. Credenciais → **Criar Credenciais** → **ID do cliente OAuth**.
2. Tipo de aplicativo: **Aplicativo da Web**.
3. Em **URIs de redirecionamento autorizados**, adicione:
   `https://developers.google.com/oauthplayground`
4. Salvar. Copie o **Client ID** e o **Client Secret** gerados — vamos usar nos passos 6 e 7.
   Se aparecer uma tela pedindo pra configurar a "Tela de consentimento OAuth" antes, escolha **Externo**, preencha nome do app (ex: "Mar de Moreré") e seu e-mail, e pode deixar em modo "Teste" — só a conta que vai autorizar (a sua) precisa estar na lista de usuários de teste.

## 4. Criar a playlist no YouTube Music

1. Logado na conta Google **que vai ser dona da playlist** (a da pousada), acesse [music.youtube.com](https://music.youtube.com) ou [youtube.com](https://youtube.com).
2. Crie uma playlist nova, ex: **"Café da Manhã — Mar de Moreré"**.
3. Abra a playlist e copie o ID dela na URL: em
   `...watch?v=...&list=PLxxxxxxxxxxxxxxxx`, o ID é a parte depois de `list=`
   (começa com `PL`). Guarde — é o `YT_PLAYLIST_ID` do passo 6.

## 5. Gerar o Refresh Token (autoriza o app a mexer na playlist por você)

1. Acesse [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground).
2. Clique na ⚙️ (engrenagem, canto superior direito) → marque **"Use your own OAuth credentials"** → cole o **Client ID** e **Client Secret** do passo 3 → feche.
3. Na lista à esquerda, procure **YouTube Data API v3** → marque o escopo:
   `https://www.googleapis.com/auth/youtube`
4. Clique **Authorize APIs** → faça login com a conta dona da playlist → **Permitir**.
5. Você volta pro Playground com um "Authorization code" preenchido. Clique **Exchange authorization code for tokens**.
6. Copie o **Refresh token** que aparece. Guarde — é o `YT_OAUTH_REFRESH_TOKEN` do passo 6.

⚠️ Esse refresh token dá acesso à sua conta do YouTube (só a playlists, pelo escopo escolhido). Trate como senha — não vai colar ele em nenhum arquivo do repositório, só no comando do passo 6.

## 6. Guardar os segredos nas Cloud Functions

No seu computador, com o [Firebase CLI](https://firebase.google.com/docs/cli) instalado (`npm install -g firebase-tools`) e logado (`firebase login`):

```bash
cd sitezinho          # a pasta do projeto
firebase use SEU_PROJECT_ID     # o ID do seu projeto Firebase

firebase functions:secrets:set YOUTUBE_API_KEY
# cole a API Key do passo 2 e aperte Enter

firebase functions:secrets:set YT_OAUTH_CLIENT_ID
# cole o Client ID do passo 3

firebase functions:secrets:set YT_OAUTH_CLIENT_SECRET
# cole o Client Secret do passo 3

firebase functions:secrets:set YT_OAUTH_REFRESH_TOKEN
# cole o Refresh Token do passo 5

firebase functions:secrets:set YT_PLAYLIST_ID
# cole o ID da playlist do passo 4
```

## 7. Publicar as Cloud Functions e as regras do Firestore

```bash
cd functions
npm install
cd ..
firebase deploy --only functions,firestore:rules
```

O terminal vai mostrar duas URLs de função criadas (`searchYoutubeSongs` e
`voteSong`) — não precisa fazer nada com elas, o app já sabe chamá-las.

## 8. Pegar a config do app Web do Firebase

1. No [Console do Firebase](https://console.firebase.google.com/) → seu projeto → ⚙️ **Configurações do projeto**.
2. Em "Seus apps", se não tiver um app Web ainda, clique no ícone `</>` pra criar um (não precisa de Firebase Hosting, é só pra pegar a config).
3. Copie os valores de `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.

## 9. Cadastrar os Secrets no GitHub (pro site publicado funcionar)

No repositório GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, crie um secret pra cada um destes (com os valores do passo 8):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

O workflow de deploy (`.github/workflows/deploy.yml`) já está pronto pra ler esses secrets automaticamente no próximo build.

## 10. Ativar o Firestore e a Authentication anônima

1. Console do Firebase → **Firestore Database** → **Criar banco de dados** (se ainda não existir) → modo produção → região `southamerica-east1` (mesma das functions).
2. Console do Firebase → **Authentication** → **Sign-in method** → ative o provedor **Anônimo**.

---

## Testando localmente (opcional)

```bash
cp .env.example .env.local
# preencha .env.local com os valores do passo 8
npm install
npm run dev
```

## Pronto!

Depois disso, qualquer push na `main` já builda com as chaves certas. A
primeira música votada por um hóspede aparece na sua playlist do YouTube
Music em poucos segundos.
