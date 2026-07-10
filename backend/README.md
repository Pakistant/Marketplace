MarketDouala - Backend

Prérequis:
- Node.js 18+

Installation:

```bash
cd backend
npm install
```

Initialiser la base de données mock:

```bash
npm run seed
```

Démarrer en mode développement:

```bash
npm run dev
```

Principaux endpoints:
- POST /api/auth/login  -> { email, password } renvoie JWT
- GET /api/products
- POST /api/products  -> requires Bearer token (producer)
- GET /api/products/:id
- POST /api/orders -> passer une commande (public)
- GET /api/orders -> liste des commandes pour le producteur connecté (requires Bearer token)

Configuration:
- Utiliser `.env` (voir `.env.example`) pour `PORT`, `JWT_SECRET`, `DATABASE_FILE`, `CORS_ORIGIN`.

Seed data: 3 producteurs et 10 produits pré-remplis.
