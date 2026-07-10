const express = require("express");
const { all, get, getDb, run } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", async (req, res, next) => {
  const db = getDb();
  try {
    const { customerName, customerPhone, items } = req.body;
    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Client et lignes de commande requis." });
    }

    await run("BEGIN TRANSACTION");
    let total = 0;
    const normalizedItems = [];

    for (const item of items) {
      const product = await get("SELECT * FROM products WHERE id = ?", [item.productId]);
      const quantity = Number(item.quantity || 0);
      if (!product) throw Object.assign(new Error("Produit introuvable."), { status: 404 });
      if (quantity <= 0) throw Object.assign(new Error("Quantite invalide."), { status: 400 });
      if (product.quantity < quantity) {
        throw Object.assign(new Error(`Stock insuffisant pour ${product.name}.`), { status: 409 });
      }
      total += product.price * quantity;
      normalizedItems.push({ product, quantity });
    }

    const order = await run(
      "INSERT INTO orders (customer_name, customer_phone, total) VALUES (?, ?, ?)",
      [customerName, customerPhone, total]
    );

    for (const item of normalizedItems) {
      await run(
        "INSERT INTO order_items (order_id, product_id, producer_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
        [order.id, item.product.id, item.product.producer_id, item.quantity, item.product.price]
      );
      await run("UPDATE products SET quantity = quantity - ? WHERE id = ?", [item.quantity, item.product.id]);
    }

    await run("COMMIT");
    return res.status(201).json({ id: order.id, customerName, customerPhone, total, status: "pending", items: normalizedItems.length });
  } catch (error) {
    db.run("ROLLBACK");
    return res.status(error.status || 500).json({ message: error.message || "Erreur commande." });
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const rows = await all(
      `SELECT orders.id, orders.customer_name, orders.customer_phone, orders.status, orders.created_at,
        order_items.quantity, order_items.unit_price, products.name AS product_name
       FROM orders
       JOIN order_items ON order_items.order_id = orders.id
       JOIN products ON products.id = order_items.product_id
       WHERE order_items.producer_id = ?
       ORDER BY orders.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "shipped"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Statut invalide." });

    const ownsOrder = await get(
      "SELECT id FROM order_items WHERE order_id = ? AND producer_id = ? LIMIT 1",
      [req.params.id, req.user.id]
    );
    if (!ownsOrder) return res.status(404).json({ message: "Commande introuvable pour ce producteur." });

    await run("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    return res.json({ id: Number(req.params.id), status: req.body.status });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

