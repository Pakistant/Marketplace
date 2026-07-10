const bcrypt = require("bcryptjs");
const { run, get } = require("./database");

const producers = [
  { name: "Cooperative Mont Manengouba", email: "ouest@marketdouala.cm", password: "password123", city: "Dschang" },
  { name: "Fumoirs du Wouri", email: "wouri@marketdouala.cm", password: "password123", city: "Douala" },
  { name: "Terroirs du Septentrion", email: "nord@marketdouala.cm", password: "password123", city: "Garoua" }
];

const products = [
  ["Miel de l'Ouest", "Miel floral recolte en altitude.", 4500, 20, 1, "Epicerie"],
  ["Poivre de Penja", "Poivre blanc IGP aux notes boisees.", 3200, 35, 1, "Epices"],
  ["Cafe arabica de Dschang", "Cafe moulu artisanal en sachet de 250 g.", 3800, 18, 1, "Boissons"],
  ["Poisson fume de Douala", "Bar fume au bois local, pret a cuisiner.", 6500, 12, 2, "Poissonnerie"],
  ["Crevettes sechees du Wouri", "Crevettes sechees pour sauces traditionnelles.", 5200, 15, 2, "Poissonnerie"],
  ["Baton de manioc", "Lot de batons frais prepares a Douala.", 1500, 40, 2, "Frais"],
  ["Karite pur du Nord", "Beurre de karite brut pour cuisine et soin.", 2800, 25, 3, "Bien-etre"],
  ["Arachides grillees de Garoua", "Arachides croquantes legerement salees.", 1200, 50, 3, "Snack"],
  ["Huile d'arachide artisanale", "Huile pressee localement en bouteille 1 L.", 4300, 22, 3, "Epicerie"],
  ["Sorgho rouge", "Sorgho trie pour bouillies et boissons locales.", 2100, 30, 3, "Cereales"]
];

async function migrate() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    city TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'producer',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK(price >= 0),
    quantity INTEGER NOT NULL CHECK(quantity >= 0),
    category TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(producer_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    producer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(producer_id) REFERENCES users(id)
  )`);
}

async function seed() {
  const existing = await get("SELECT id FROM users LIMIT 1");
  if (existing) return;

  for (const producer of producers) {
    const hash = await bcrypt.hash(producer.password, 10);
    await run(
      "INSERT INTO users (name, email, password_hash, city) VALUES (?, ?, ?, ?)",
      [producer.name, producer.email, hash, producer.city]
    );
  }

  for (const product of products) {
    await run(
      "INSERT INTO products (name, description, price, quantity, producer_id, category) VALUES (?, ?, ?, ?, ?, ?)",
      product
    );
  }
}

async function initDb() {
  await migrate();
  await seed();
}

if (require.main === module) {
  initDb()
    .then(() => {
      console.log("Database ready with MarketDouala mock data.");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initDb };

