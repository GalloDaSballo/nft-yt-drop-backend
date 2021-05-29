import express from "express";

const router = express.Router();
export default router;

let lastId = 1;
const list = [{ id: lastId, value: "Hey Hey hey Heeeey" }];

/**
 * Retrieve all
 */
router.get("/", (req, res) => {
  res.send(list);
});

/**
 * Retrieve one
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const index = list.findIndex((element) => element.id === parseInt(id, 10));
  res.send(list[index]);
});

/**
 * Create new element
 */
router.post("/", (req, res) => {
  const { value } = req.body;

  const newEntry = {
    value,
    id: (lastId += 1),
  };

  list.push(newEntry);
  res.send(list);
});

/**
 * Delete one
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = list.findIndex((element) => element.id === parseInt(id, 10));
  list.splice(index, 1);
  res.send(list);
});

/**
 * Update one
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { value } = req.body;
  const index = list.findIndex((element) => element.id === parseInt(id, 10));
  list[index].value = value;
  res.send(list);
});
