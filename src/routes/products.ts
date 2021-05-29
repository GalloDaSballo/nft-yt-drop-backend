import express from "express";
import db from "../db";

const router = express.Router();

export default router;

interface Product {
  name: string;
  price: string;
}

router.get("/", async (req, res) => {
  const result = await db.select<Product>().table("products");
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db<Product>("products").where("id", id);
  res.send(result);
});

router.post("/", async (req, res) => {
  const { name, price } = req.body;
  if (!name) {
    return res.status(400).send("Please have a product name");
  }

  if (!price) {
    return res.status(400).send("Please have a product price");
  }

  const result = await db<Product>("products")
    .insert({ name, price })
    .returning("*");

  res.send(result);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const toUpdate = {
    name: "",
    price: "",
  };

  if (!name && !price) {
    return res.status(400).send("Please have either a name or a price change");
  }

  if (name) {
    toUpdate.name = name;
  }

  if (price) {
    toUpdate.price = price;
  }

  const updated = await db<Product>("products")
    .where("id", "=", id)
    .update(toUpdate)
    .returning("*");

  res.send(updated);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db<Product>("products")
    .where("id", "=", id)
    .del()
    .returning("*");

  res.send(result);
});
