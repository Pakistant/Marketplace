MarketDouala - Monorepo

Dossiers:
- backend: API Node.js + SQLite
- frontend-react: partie publique React
- frontend-angular: tableau de bord producteur Angular

Démarrer le backend:

```bash
cd backend
npm install
npm run seed    # créer la base et les données mock
npm run dev     # ou npm start
```

Notes:
- Le backend utilise JWT pour l'authentification des producteurs.
- Voir `backend/.env.example` pour les variables d'environnement.
