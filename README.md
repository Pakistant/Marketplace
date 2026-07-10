# MarketDouala Marketplace POC

Prototype headless pour une marketplace de producteurs locaux camerounais. Le projet est separe en trois applications: API REST, vitrine publique React et tableau de bord producteur Angular.

## Choix techniques

- **Node.js + Express** pour l'API: rapide a prototyper, ecosysteme simple pour JWT, SQLite et tests HTTP.
- **SQLite** pour le POC: aucune dependance serveur, schema SQL clair, migration facile vers MySQL.
- **React** pour la partie publique: experience fluide, panier localStorage, navigation simple avec React Router.
- **Angular** pour le dashboard producteur: structure robuste pour formulaires, services HTTP et interfaces back-office.

## Structure

```text
backend/           API REST Express, JWT, SQLite, tests
frontend-react/    Vitrine publique produits + panier
frontend-angular/  Dashboard producteur
data/              CSV des donnees mock
```

## Installation

Prerequis: Node.js 20+ et npm.

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Dans deux autres terminaux:

```bash
cd frontend-react
cp .env.example .env
npm install
npm run dev
```

```bash
cd frontend-angular
npm install
npm start
```

URLs locales:

- API: `http://localhost:4000/api`
- React public: `http://localhost:5173`
- Angular producteur: `http://localhost:4200`

Comptes producteurs mock, mot de passe commun: `password123`.

- `ouest@marketdouala.cm`
- `wouri@marketdouala.cm`
- `nord@marketdouala.cm`

## Variables d'environnement

Voir `backend/.env.example` et `frontend-react/.env.example`.

```env
PORT=4000
JWT_SECRET=change-me-in-production
DATABASE_FILE=./marketdouala.sqlite
CORS_ORIGIN=http://localhost:5173
```

## Endpoints API

### POST `/api/auth/login`

```json
{ "email": "ouest@marketdouala.cm", "password": "password123" }
```

### GET `/api/products`

Filtres optionnels: `?search=miel&producerId=1`.

### GET `/api/products/:id`

Retourne un produit avec son producteur.

### POST `/api/products`

Authentification producteur requise.

```json
{
  "name": "Ndole frais",
  "description": "Feuilles triees",
  "price": 1700,
  "quantity": 8,
  "category": "Frais"
}
```

### PUT `/api/products/:id` et DELETE `/api/products/:id`

Authentification requise. Un producteur ne peut modifier ou supprimer que ses produits.

### POST `/api/orders`

Valide le stock avant creation et decremente les quantites.

```json
{
  "customerName": "Awa",
  "customerPhone": "+237699000000",
  "items": [{ "productId": 1, "quantity": 2 }]
}
```

### GET `/api/orders`

Authentification producteur requise. Retourne uniquement les lignes de commandes concernant les produits du producteur connecte.

### PATCH `/api/orders/:id/status`

Authentification requise.

```json
{ "status": "confirmed" }
```

## Tests

```bash
cd backend
npm test
```

Deux tests couvrent la creation de produit authentifiee et le refus d'une commande au-dessus du stock.

## Donnees mock

Le fichier `data/mock-data.csv` liste les 3 producteurs et 10 produits de demonstration. La base est automatiquement pre-remplie au demarrage de l'API si elle est vide.

## Git

Le projet est versionne localement avec Git. Pour publier:

```bash
git remote add origin <url-du-repository>
git push -u origin main
```

