process.env.DATABASE_FILE = ":memory:";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const { app, initDb } = require("../src/app");

async function login() {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "ouest@marketdouala.cm", password: "password123" });
  return response.body.token;
}

beforeAll(async () => {
  await initDb();
});

test("producer can create a product", async () => {
  const token = await login();
  const response = await request(app)
    .post("/api/products")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Ndole frais", description: "Feuilles triees", price: 1700, quantity: 8, category: "Frais" });

  expect(response.status).toBe(201);
  expect(response.body.producer_id).toBe(1);
});

test("order validation rejects quantities above stock", async () => {
  const response = await request(app)
    .post("/api/orders")
    .send({ customerName: "Awa", customerPhone: "+237699000000", items: [{ productId: 1, quantity: 999 }] });

  expect(response.status).toBe(409);
});

test("allows common localhost frontend origins", async () => {
  const response = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:3000");

  expect(response.status).toBe(200);
  expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
});

