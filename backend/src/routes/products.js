const express = require("express");
const { all, get, run } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const publicProductQuery = `SELECT products.*, users.name AS producer_name, users.city AS producer_city
  FROM products JOIN users ON users.id = products.producer_id`;

router.get("/", async (req, res, next) => {
  try {
    const clauses = [];
    const params = [];
    if (req.query.search) {
      clauses.push("products.name LIKE ?");
      params.push(`%${req.query.search}%`);
    }
    if (req.query.producerId) {
      clauses.push("products.producer_id = ?");
      params.push(req.query.producerId);
    }

    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const rows = await all(`${publicProductQuery}${where} ORDER BY products.created_at DESC`, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const rows = await all("SELECT * FROM products WHERE producer_id = ? ORDER BY created_at DESC", [req.user.id]);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await get(`${publicProductQuery} WHERE products.id = ?`, [req.params.id]);
    if (!product) return res.status(404).json({ message: "Produit introuvable." });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    if (!name || !description || price == null || quantity == null || !category) {
      return res.status(400).json({ message: "Champs produit incomplets." });
    }
    const result = await run(
      "INSERT INTO products (producer_id, name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, name, description, Number(price), Number(quantity), category]
    );
    const created = await get("SELECT * FROM products WHERE id = ?", [result.id]);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const existing = await get("SELECT * FROM products WHERE id = ? AND producer_id = ?", [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ message: "Produit introuvable pour ce producteur." });

    const updated = {
      name: req.body.name ?? existing.name,
      description: req.body.description ?? existing.description,
      price: req.body.price ?? existing.price,
      quantity: req.body.quantity ?? existing.quantity,
      category: req.body.category ?? existing.category
    };

    await run(
      "UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, category = ? WHERE id = ?",
      [updated.name, updated.description, Number(updated.price), Number(updated.quantity), updated.category, req.params.id]
    );
    return res.json(await get("SELECT * FROM products WHERE id = ?", [req.params.id]));
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await run("DELETE FROM products WHERE id = ? AND producer_id = ?", [req.params.id, req.user.id]);
    if (!result.changes) return res.status(404).json({ message: "Produit introuvable pour ce producteur." });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

