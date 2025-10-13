# Mini Bank - Backend (Express)

Ce dossier contient le serveur Express utilisé par le frontend.

## Prérequis

- Node.js 18+
- Une base MongoDB accessible (MongoDB Atlas recommandé)

## Variables d'environnement

A configurer dans Render (ou en local via un fichier `.env` à la racine de `server/`):

- `MONGODB_URI` (obligatoire): URI MongoDB (ex: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`)
- `DB_NAME` (optionnel): nom de la base, par défaut `minibank`
- `COLLECTION_NAME` (optionnel): nom de la collection, par défaut `agents`
- `NODE_ENV` (recommandé): `production`

## Scripts

- `npm run start`: démarre le serveur en production (`node index.js`)
- `npm run dev`: démarre le serveur en développement

## Déploiement sur Render

1. Créez un nouveau "Web Service" (pas un "Static Site").
2. Renseignez le repo GitHub correspondant.
3. Dans "Advanced" / "Root Directory", indiquez `server/` (car le `package.json` backend est ici).
4. "Build Command": `npm install`
5. "Start Command": `npm start`
6. Ajoutez les variables d'environnement listées ci-dessus (au minimum `MONGODB_URI`).
7. Déployez.

## Endpoints

- `GET /health` → `{ ok: true }`
- `POST /agents` → crée un agent. Champs minimum: `agentCode`, `email`. Pour pouvoir se connecter ensuite, ajoutez `password` (comparaison en clair dans la version actuelle).
- `POST /agents/login` → connexion simple par email / mot de passe (non chiffré dans cette version).

## Tests rapides (curl)

```bash
curl -i https://<votre-domaine-render>/health

curl -i -X POST https://<votre-domaine-render>/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agentCode":"AGT-001",
    "email":"user@example.com",
    "password":"123456",
    "firstName":"Prenom",
    "lastName":"Nom"
  }'

curl -i -X POST https://<votre-domaine-render>/agents/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"123456"
  }'
```

## Notes

- La comparaison de mot de passe est en clair (pour démarrer rapidement). Pour la production, il est recommandé d'utiliser `bcrypt` pour le hash et un JWT pour la session.
