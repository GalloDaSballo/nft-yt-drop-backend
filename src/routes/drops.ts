import express from "express";
import db from "../db";

const router = express.Router();

export default router;

interface Drop {
  id: string;
  channelId: string;
  channelThumb: string;
  channelName: string;
  imageURI: string;
  endDate: Date;
}

router.get("/", async (req, res) => {
  const result = await db.select<Drop>().table("drops");
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db<Drop>("drops").where("id", id);
  res.send(result);
});

router.post("/", async (req, res) => {
  try {


    const { channelId, imageURI, endDate, channelName, channelThumb } = req.body;
    if (!channelId) {
      return res.status(400).send("Please have a product channelId");
    }
    if (!channelName) {
      return res.status(400).send("Please have a product channelName");
    }
    if (!channelThumb) {
      return res.status(400).send("Please have a product channelName");
    }
    if (!imageURI) {
      return res.status(400).send("Please have a product imageURI");
    }

  if (!endDate) {
    return res.status(400).send("Please have a product endDate");
  }

    const result = await db<Drop>("drops")
      .insert({ channelId, imageURI, endDate, channelName, channelThumb })
      .returning("*");

    res.send(result);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db<Drop>("drops")
    .where("id", "=", id)
    .del()
    .returning("*");

  res.send(result);
});
