import express from "express";
import crypto from "crypto";

import db from "../db";
import passport from "../auth";

const router = express.Router();

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.send(req.user);
});

router.post("/me", (req, res) => {
  const { user } = req;
  res.send(user);
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send("Please use email");
  }

  if (!password) {
    return res.status(400).send("Please use password");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  // Check if user already exists
  const already = await db("users").where({ email }).first();
  if (already) {
    return res.status(400).send("User already exists");
  }

  const insert = await db("users")
    .insert({ email, password: hash, salt })
    .returning(["id", "email"]);

  res.send(insert);
});

export default router;
