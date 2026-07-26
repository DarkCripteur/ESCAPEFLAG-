# Escape Flag

Application React/Vite avec API Express sécurisée et base PostgreSQL Supabase.

## Démarrage local

1. Créez un projet sur [Supabase](https://supabase.com), puis exécutez **dans l'ordre** `supabase/migrations/001_initial_schema.sql` à `007_suggestions.sql` dans le SQL Editor (connexion par pseudo, amis, historique Undercover, Smash or Pass, bannissement, suggestions — voir plus bas). Pour Smash or Pass, si Supabase est configuré, un bucket de stockage public `smash-pass` est créé automatiquement au premier upload (droits du service role requis) ; sinon les images sont écrites dans `server/uploads/` et servies statiquement.
2. Copiez `.env.example` vers `.env` et renseignez `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`. Ne publiez jamais la clé `SERVICE_ROLE` dans le navigateur.
3. Dans Supabase Auth, activez l’authentification e-mail (et Phone si souhaitée). Pour les tests locaux, désactivez la confirmation e-mail ou confirmez les e-mails créés.
4. Pour la boîte à suggestions, créez un compte [Resend](https://resend.com) et renseignez `RESEND_API_KEY` dans `.env` (jamais codée en dur). Sans cette variable, les suggestions restent enregistrées mais aucun e-mail n'est envoyé.
5. Lancez l’API et le client dans deux terminaux :

```powershell
npm.cmd run server
npm.cmd run dev
```

## Sécurité et données

- Comptes créés dans Supabase Auth avec mots de passe gérés par Supabase.
- Profils et sessions stockés dans PostgreSQL, pas dans un fichier JSON ou `localStorage`.
- API protégée par Helmet, CORS restreint, limitation de débit et validation Zod.
- Les mises à jour de profil et de session sont liées au JWT de l’utilisateur connecté.

## Administration

L’URL `/admin` est invisible pour les joueurs et l’API refuse toute requête qui ne porte pas le rôle `admin` ou `moderator` en base. Après avoir créé votre compte, attribuez le rôle depuis le SQL Editor Supabase :

```sql
update public.profiles set role = 'admin' where id = 'UUID_DU_COMPTE';
```

Reconnectez-vous puis ouvrez `/admin`. La console affiche les comptes, le volume de sessions et les sessions actives, sans exposer les coordonnées privées des joueurs.

## Déploiement

Le cahier des charges laisse le choix entre un backend serverless ou une API Express classique (section 14) : ce projet garde l'API Express telle quelle (déployée sur un hébergeur Node — Render, Railway, Fly.io…), avec **uniquement le frontend sur Vercel**. Réécrire toute l'API en fonctions serverless serait un chantier séparé, plus risqué, pour un bénéfice qui n'était pas demandé explicitement.

### Frontend (Vercel)

* `vercel.json` est déjà configuré (build Vite + réécriture SPA vers `index.html`, nécessaire pour que les routes React Router comme `/admin` ou `/profil` fonctionnent après un rechargement direct au lieu de renvoyer une 404).
* Variable d'environnement à définir sur Vercel : `VITE_API_URL` = l'URL publique de l'API (ex. `https://escapeflag-api.onrender.com`).

### Backend (Render/Railway/Fly…)

* Mêmes variables que `.env.example` : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `CLIENT_URL`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO`.
* `CLIENT_URL` doit être l'URL Vercel exacte du frontend (accepte une liste séparée par des virgules si plusieurs origines doivent être autorisées — ex. domaine de prod + un domaine de preview connu à l'avance ; les URLs de preview Vercel générées à la volée par déploiement ne seront pas automatiquement autorisées par CORS).
* **Important pour Smash or Pass (upload d'images)** : le repli local (`server/uploads/`) suppose un disque persistant entre les requêtes. Sur un hébergeur au système de fichiers éphémère (conteneurs recréés à chaque déploiement, fonctions serverless…), les photos uploadées localement seraient perdues au prochain redéploiement — configurez alors impérativement Supabase (le bucket `smash-pass` est créé automatiquement) plutôt que de compter sur le repli disque.

### Correspondance avec les variables d'exemple du cahier des charges

Le cahier des charges (section 14) liste `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `JWT_SECRET` et `EMAIL_PROVIDER_KEY` à titre d'exemple générique. Ce projet ne les utilise pas telles quelles : le frontend ne parle jamais directement à Supabase (tout passe par l'API Express, donc pas de `VITE_SUPABASE_*` côté client), l'authentification est gérée par Supabase Auth (pas de `JWT_SECRET` maison à définir), et `EMAIL_PROVIDER_KEY` correspond à `RESEND_API_KEY` ici. Utilisez les noms de variables réels ci-dessus plutôt que de copier l'exemple du cahier des charges tel quel.

---

## Mises à jour d'authentification (ESCAPEFLAG UPDATE)

### Étape 1 : Structure générale du projet
* **Remplacement d'assets** : L'ancien logo `vite.svg` a été supprimé et remplacé par `vite.svg.png` dans `src/assets/`.
* **Modifications de structure** : Documentées dans ce fichier.

### Étape 2 : Header
* **Action** : Laissé tel quel (aucun formulaire d'authentification présent dans le composant Header).

### Étape 3 : Footer
* **Action** : Laissé tel quel (aucun formulaire d'authentification ou d'inscription présent dans le composant Footer/bottom-strip).

### Étape 4 : Pages d'authentification
* **Action** : Modifié [src/App.jsx](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/src/App.jsx).
* **Description** : Remplacement des champs d'e-mail et de téléphone séparés par un seul champ unique "Email ou numéro de téléphone" avec détection dynamique de type pour les icônes de formulaire (mail, phone, ou user) en mode connexion. Les champs séparés sont conservés en mode inscription.

### Étape 5 : Composants réutilisables
* **Action** : Laissé tel quel (les icônes existantes de `FieldIcon` ont été réutilisées et adaptées dynamiquement).

### Étape 6 : Context/AuthProvider
* **Action** : Modifié [src/App.jsx](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/src/App.jsx).
* **Description** : Ajout du champ `login` dans la structure d'état d'authentification par défaut (`defaultAuthState`) pour suivre correctement le champ unique du formulaire.

### Étape 7 : Services API
* **Action** : Modifié [src/App.jsx](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/src/App.jsx).
* **Description** : Modification de la fonction `loginAccount` pour extraire la valeur saisie dans `auth.login` et l'envoyer comme champ `login` dans le payload JSON de la requête de connexion POST `/api/auth/login`.

### Étape 8 : Hooks personnalisés
* **Action** : Laissé tel quel (l'application utilise la gestion des états React standard et aucun hook personnalisé n'a besoin d'être adapté).

### Étape 9 : Backend
* **Action** : Modifié [server/index.js](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/server/index.js).
* **Description** : Consolidation du backend pour accepter et traiter les champs `login` et `password` de connexion.

### Étape 10 : Routes API
* **Action** : Modifié [server/index.js](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/server/index.js).
* **Description** : Mise en place de validations Zod et d'une détection robuste pour valider si l'identifiant `login` est un e-mail valide ou un numéro de téléphone, retournant une erreur 400 si le format est invalide.

### Étape 11 : Contrôleurs
* **Action** : Modifié [server/index.js](file:///c:/Users/Fustel_AMIO/Documents/Mes%20projets/Jeux/ESCAPEFLAG/server/index.js).
* **Description** : Ajout d'une vérification de l'existence du compte (e-mail ou téléphone) et d'une vérification spécifique du mot de passe avec des messages d'erreur distincts et explicites ("Le compte n'existe pas" ou "Le mot de passe est incorrect").

### Étape 12 : Middleware
* **Action** : Laissé tel quel (les middlewares de session sont basés sur le jeton JWT et ne dépendent pas du mode de connexion initial).

### Étape 13 : Base de données
* **Action** : Laissée telle quelle (la table `profiles` contient déjà le champ `phone` nécessaire et la table `auth.users` de Supabase contient `email` et `phone`).

### Étape 14 : Tests finaux et validation
* **Action** : Validé et testé (vérification du boot de l'API sans erreur de syntaxe, exécution du linter oxlint avec 0 erreur).

---

## Phase 1 — Fondations et authentification par pseudo

Première étape d'une refonte plus large du projet, menée par phases. Cette phase pose
l'architecture cible et livre l'authentification par pseudo ; les phases suivantes
(invitations entre joueurs, refonte Undercover, quiz enrichi, Smash or Pass, admin,
boîte à suggestions, sélecteur téléphone international, déploiement Vercel) seront
traitées une à une.

### Connexion par pseudo (remplace email/téléphone)

* La connexion (`POST /api/auth/login`) prend désormais uniquement `{ username, password }`. Le pseudo est l'identifiant affiché du joueur.
* L'inscription (`POST /api/auth/register`) demande maintenant nom complet, **pseudo unique**, e-mail, téléphone, pays/indicatif et mot de passe (+ confirmation côté client).
* En interne, Supabase Auth reste basé sur l'e-mail (obligatoire à l'inscription) : le serveur résout `pseudo → e-mail` via `profiles.username`/`profiles.email` (ou `users.json` en mode local) avant d'appeler `signInWithPassword`. Le joueur ne voit jamais son e-mail dans le formulaire de connexion.
* ⚠️ Cassure de compatibilité assumée : les comptes créés avant cette phase n'ont pas de pseudo. Exécutez `002_username_auth.sql`, puis renseignez `username` manuellement (`update public.profiles set username = '...' where id = '...';`) pour les comptes existants, ou en mode local ajoutez `username` dans `data/users.json`/`data/profiles.json`.
* Le compte admin par défaut (`seedAdminUser`) a maintenant pour pseudo `admin` (mot de passe inchangé : `admin123`).

### Nouvelle architecture

* **Frontend** (`src/`) : éclaté de l'ancien composant unique `App.jsx` (1800 lignes) vers `pages/` (une page par écran + Login/Register/Admin), `components/layout` et `components/ui`, `contexts/` + `hooks/` (Auth, Theme, Toast, Quiz, Undercover), `services/` (appels API) et `utils/`. Routing via `react-router-dom` (`/`, `/profil`, `/classement`, `/defis`, `/undercover`, `/admin`). Le lien Admin n'apparaît jamais dans la navigation joueur — `/admin` n'est accessible qu'en tapant l'URL directement.
* **Backend** (`server/`) : éclaté du fichier unique `server/index.js` (927 lignes) vers `routes/`, `controllers/`, `middlewares/`, `validators/`, `services/`. Le pattern Supabase-first / repli JSON est conservé sur toutes les routes existantes.
* **Nouvelles dépendances** : `react-router-dom`, `framer-motion`, `lucide-react`, `styled-components`, `tailwindcss` (v4, chargée sans le reset "preflight" pour ne pas casser le CSS existant — utilisée uniquement en classes utilitaires sur le nouveau code).
* **Boutons animés** : le bouton de connexion utilise un composant "glisser pour valider" (`src/components/ui/SlideToLogin.jsx`, Framer Motion + Lucide) ; un bouton CTA générique à cercles animés (`src/components/ui/AnimatedCta.jsx`, styled-components) est utilisé pour l'inscription et réutilisable ailleurs.

## Phase 2 — Invitations entre joueurs (Amis)

Nouvel onglet **AMIS** dans la navigation : recherche instantanée par pseudo (`GET /api/players/search?q=`), envoi d'invitation, demandes reçues/envoyées avec accepter/refuser, et liste d'amis avec possibilité de retirer un ami.

* Une seule table `public.friend_requests` (migration `003_friend_requests.sql`) sert à la fois de demande en attente et de relation d'amitié : une ligne avec `status='accepted'` EST l'amitié. La retirer (accepter → puis supprimer) revient à se désinviter.
* Nouvelles routes API : `GET/POST /api/friends*`, protégées par `requireUser` (il faut être connecté pour inviter, répondre ou consulter sa liste d'amis).
* Frontend : `src/pages/Amis/AmisPage.jsx`, `src/contexts/FriendsContext.jsx`, `src/services/friendsService.js`.
* Testé de bout en bout en mode JSON local (recherche, envoi, doublon refusé, réponse refusée si on n'est pas le destinataire, acceptation, listes des deux côtés, suppression).

## Phase 3 — Refonte du jeu Undercover

* **Thèmes** (`src/utils/undercoverThemes.js`) : Objets, Animaux, Pays, Métiers, Films — chacun avec une description affichée au distributeur, plus un thème « Personnalisé » qui pioche dans les paires ajoutées par les joueurs. Purement côté client (le serveur ne connaît que les mots finaux, pas les thèmes).
* **Attribution manuelle des rôles**, en plus de l'automatique : le distributeur (local ou en ligne) peut basculer en mode manuel et choisir le rôle de chaque joueur individuellement. Côté serveur, `POST /api/undercover/room/set-words` accepte un champ `assignments` optionnel qui remplace le tirage aléatoire quand il est fourni.
* **Historique des parties** : chaque partie terminée (locale ou en ligne, enregistrée par l'hôte côté en ligne pour éviter les doublons) est sauvegardée via `POST /api/undercover/matches` (nouvelle table `undercover_matches`, migration `004_undercover_matches.sql`) et affichée dans un panneau « Parties récentes ».
* **Invitation par pseudo** : dans le lobby d'un salon en ligne, l'hôte peut inviter directement ses amis (liste issue de la Phase 2) ; l'ami reçoit une bannière app-wide (`GameInviteBanner`, scrutée toutes les 4s) avec un bouton « Rejoindre ».
* **Design** : nouveaux blocs (sélecteur de thème, attribution des rôles, bannière d'invitation) construits avec Tailwind ; le reste de l'écran garde le style existant.
* Testé de bout en bout côté API en mode JSON local (attribution manuelle valide/invalide, enregistrement + lecture de l'historique, envoi/réception/rejet d'invitation). Le rendu de l'interface (sélecteur de thème, bascule auto/manuel, bannière) n'a pas pu être vérifié dans un navigateur réel dans cet environnement — à tester en local avant mise en prod.

## Phase 4 — Quiz enrichi

* **Banque de questions** (`src/data/quizQuestions/`) : passée de 12 à **156 questions** réparties en 10 catégories (Géographie, Histoire, Sciences, Culture générale, Sport, Cinéma, Musique, Littérature, Nature, Technologie), difficulté 1 à 4. Ce n'est pas littéralement « plusieurs centaines » comme demandé en section 7 — à enrichir au fil du temps en ajoutant des questions dans les fichiers de ce dossier (un fichier par catégorie).
* **Manches de 10 questions** (`QUESTIONS_PER_ROUND` dans `utils/quizData.js`), avec un **sélecteur de catégorie** sur la page Jouer qui relance immédiatement une manche filtrée.
* **Badges** (`utils/badges.js`) : 9 badges (séries, nombre de questions réussies, paliers de niveau), mémorisés définitivement par compte dès qu'ils sont atteints (même si la statistique déclenchante redescend ensuite, ex. une série interrompue). Affichés sur la page Profil, avec notification à l'obtention.
* **Animation « Gain de niveau »** (`components/layout/LevelUpBanner.jsx`, Framer Motion), affichée automatiquement dès que le niveau augmente.
* **Deux bugs préexistants critiques découverts et corrigés en testant cette phase dans un vrai navigateur** (présents avant toute modification de ce projet, remontant au fichier `App.jsx` d'origine) :
  1. La sauvegarde d'XP après une bonne réponse échouait **systématiquement** en 400 côté serveur (le champ `level`, pourtant obligatoire dans le schéma de validation, n'était jamais envoyé) — l'échec était avalé silencieusement côté client, donc invisible. L'XP n'était donc jamais réellement persistée en base.
  2. Même quand elle l'était, une reconnexion (login) réaffichait un profil à zéro : le client ne lisait que `data.profile` (fourni uniquement à l'inscription) sans repli sur les statistiques déjà présentes dans `data.user`.
  
  Concrètement, avant ce correctif, la progression d'un joueur semblait repartir de zéro à chaque reconnexion, quelle que soit son activité réelle.

## Phase 5 — Smash or Pass + upload d'images

* Nouvel onglet **SMASH OR PASS** : import de photo (téléphone ou ordinateur, `<input type="file">` natif), pioche de cartes glissables (Framer Motion — glisser à droite = Smash, à gauche = Pass, ou boutons ❤/✕), commentaire facultatif, description du jeu et gestion de ses propres photos (avec décompte ❤/✕) dans le panneau latéral.
* **Upload** (`server/services/uploadService.js`) : Multer en mémoire, type de fichier limité à JPEG/PNG/WEBP/GIF, taille max 5 Mo. Stocke dans Supabase Storage (bucket `smash-pass`, créé automatiquement) si configuré, sinon dans `server/uploads/` servi via `/uploads` (CORP assoupli pour que le client Vite, sur un port différent, puisse charger les images).
* **Modèle de données** : `smash_pass_photos` (le pool à faire tourner) + `smash_pass_votes` (un vote par photo et par joueur, contrainte d'unicité) — normalisation du modèle `SmashPassVote` du cahier des charges (section 16) pour qu'une même photo reçoive plusieurs votes sans dupliquer l'URL.
* On ne peut pas voter sur ses propres photos ; une photo déjà votée ne réapparaît pas dans la pioche.
* Testé de bout en bout côté API (upload, rejet des fichiers non-image, vote, double-vote refusé, tally, suppression avec nettoyage du fichier) et dans un navigateur réel (upload → pioche → vote avec commentaire → décompte à jour côté propriétaire), sans erreur console.

## Phase 6 — Administration

* Console `/admin` réorganisée en 4 onglets : **Tableau de bord** (comptes, sessions, photos, votes, comptes bannis), **Utilisateurs** (recherche par pseudo/nom, changement de rôle réservé aux administrateurs — pas aux modérateurs —, bannissement/débannissement), **Photos** et **Commentaires** (modération du contenu Smash or Pass, suppression par un admin même si ce n'est pas le sien).
* **Bannissement** (`profiles.banned`, migration `006_admin_moderation.sql`) : un compte banni ne peut plus se connecter (message dédié) et perd l'accès immédiatement même avec un jeton déjà émis (vérifié à chaque requête authentifiée via `requireUser`, pas seulement au login). Un administrateur ne peut ni se bannir ni changer son propre rôle.
* Toujours aucun lien Admin dans la navigation joueur ; `/admin` redirige vers `/` pour tout compte connecté qui n'est ni `admin` ni `moderator`.
* Testé de bout en bout côté API (accès refusé aux non-admins, recherche, ban/débannissement avec effet immédiat sur les jetons existants, changement de rôle réservé aux admins, auto-bannissement/auto-changement de rôle bloqués, modération photos/commentaires avec résolution du pseudo de l'auteur) et dans un navigateur réel (les 4 onglets, bannissement via l'UI, blocage de connexion du compte banni), sans erreur console.

## Phase 7 — Boîte à suggestions + envoi e-mail

* Bouton 💡 dans le header (visible une fois connecté) ouvrant une modale de suggestion — pas de nouvel onglet de navigation, pour ne pas surcharger une barre déjà bien remplie.
* **Toujours persisté** (table `suggestions`, migration `007_suggestions.sql`), qu'un e-mail parte ou non : `server/services/emailService.js` tente l'envoi via l'API **Resend** uniquement si `RESEND_API_KEY` est définie dans l'environnement (jamais codée en dur, comme demandé) ; en cas d'absence ou d'échec, la suggestion reste enregistrée et `emailed` passe à `false`, rien n'est perdu.
* Destinataire configurable via `MAIL_TO` (défaut : `fustelamio2208@gmail.com`), expéditeur via `MAIL_FROM` — ni l'un ni l'autre n'est codé en dur, uniquement des variables d'environnement.
* L'e-mail inclut aussi l'adresse IP et le navigateur (User-Agent) de l'auteur de la suggestion, en plus de son nom, son e-mail et la date/heure — extraits de la requête, non stockés en base (seul le message est persisté, comme avant).
* Nouvel onglet **Suggestions** dans la console admin pour consulter les messages reçus, avec leur statut d'envoi.
* Testé de bout en bout côté API (rejet si non connecté, persistance sans clé Resend configurée, lecture admin, accès refusé aux non-admins) et dans un navigateur réel (ouverture de la modale, validation du message, fermeture après envoi, visibilité côté admin), sans erreur console.

## Phase 8 — Sélecteur téléphone international

* `src/data/countries.js` : ~190 pays (nom en français, code ISO 3166-1, indicatif). Les drapeaux ne sont pas stockés en dur : `utils/countryFlag.js` les dérive du code ISO2 (deux "regional indicator symbols" Unicode assemblés), donc pas de fichier d'emojis à maintenir.
* `components/ui/PhoneCountryPicker.jsx` remplace l'ancien `<select>` de 14 pays sur le formulaire d'inscription : recherche par nom **ou** par indicatif, liste déroulante avec drapeaux.
* **Détection automatique** (« si possible », comme précisé dans le cahier des charges) via `navigator.language`/`navigator.languages` — pas d'appel à un service tiers de géolocalisation IP (pas de clé à gérer, pas de fuite d'IP). Repli sur le Sénégal si la détection échoue ou ne correspond à aucun pays de la liste.
* **Deux bugs préexistants corrigés en testant cette phase** : `AuthContext` préremplissait `country: 'Sénégal'` par défaut, ce qui empêchait la détection automatique de jamais s'exécuter (elle ne se déclenche que si aucun pays n'est déjà sélectionné) ; et `persistProfile` envoyait le pays du **formulaire d'inscription** (`auth.country`, vide ou obsolète après une simple connexion) au lieu du pays réellement enregistré sur le compte (`user.country`) à chaque sauvegarde de progression — un bug qui écrasait silencieusement le pays du profil à chaque bonne réponse au quiz.
* Testé dans un navigateur réel avec une locale `fr-CA` : détection automatique du Canada confirmée, recherche par nom et par indicatif, sélection, et persistance correcte du pays choisi jusqu'au profil après inscription — sans erreur console.

## Phase 9 — Finitions dark mode + préparation déploiement Vercel

Dernière phase du cahier des charges.

* **Persistance** (`localStorage`) du thème choisi, avec repli sur `prefers-color-scheme` du système au tout premier chargement (aucune préférence enregistrée) plutôt qu'un mode clair forcé.
* **Transitions douces** (`transition: background-color/color/border-color .25s ease`) sur tous les éléments dont l'apparence change entre les deux thèmes, au lieu d'un basculement instantané.
* Le bouton de thème était déjà tout en haut du header depuis la Phase 1 (section 13). En le testant ici, deux bugs de contraste/accessibilité en mode sombre ont été trouvés et corrigés :
  1. Le bouton était **inutilisable tant qu'on n'était pas connecté** : la fenêtre de connexion (plein écran, `z-index:10`) le recouvrait entièrement. Il passe maintenant au-dessus (`z-index:11`), sans changer le reste du header (les liens de navigation restent bloqués derrière, comme voulu).
  2. Le logo « ESCAPEFLAG » restait en texte sombre sur fond sombre en mode nuit (aucune règle `.theme-dark .brand` n'existait), quasi illisible — corrigé.
* Compatibilité mobile vérifiée dans un navigateur réel (390px de large) : bascule de thème, contraste, superposition de la fenêtre de connexion.
* **Déploiement Vercel** : `vercel.json` (build Vite + réécriture SPA, sinon les routes React Router comme `/admin` renverraient une 404 après un rechargement direct) ; voir la section [Déploiement](#déploiement) plus haut pour le partage frontend (Vercel) / backend (Render ou équivalent) et les variables d'environnement réelles de ce projet (qui ne correspondent pas toutes aux noms d'exemple du cahier des charges).
* Testé de bout en bout dans un navigateur réel : préférence système respectée au premier chargement, bascule manuelle + persistance après rechargement, contraste et bascule sur mobile, réécriture SPA confirmée sur le build de production — sans erreur console.

### Éléments à personnaliser (voir commentaires `TODO(section 19)` dans le code)

Nom du site, couleurs, description des jeux Undercover/Smash or Pass, thèmes Undercover personnalisés, textes header/footer, sélecteur téléphone complet : laissés aux valeurs actuelles avec des `TODO` repérables, en attendant que ces éléments soient précisés.










