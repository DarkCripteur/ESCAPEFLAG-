# Escape Flag

Application React/Vite avec API Express sécurisée et base PostgreSQL Supabase.

## Démarrage local

1. Créez un projet sur [Supabase](https://supabase.com), puis exécutez `supabase/migrations/001_initial_schema.sql` dans le SQL Editor.
2. Copiez `.env.example` vers `.env` et renseignez `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`. Ne publiez jamais la clé `SERVICE_ROLE` dans le navigateur.
3. Dans Supabase Auth, activez l’authentification e-mail (et Phone si souhaitée). Pour les tests locaux, désactivez la confirmation e-mail ou confirmez les e-mails créés.
4. Lancez l’API et le client dans deux terminaux :

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

Configurez les mêmes variables d’environnement sur Render (API) et ajoutez `VITE_API_URL` sur Vercel (frontend). Définissez également `CLIENT_URL` sur l’URL publique exacte du frontend.

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










