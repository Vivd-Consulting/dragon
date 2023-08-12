import express from "express";

// import knex from "./db.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  res.json({});
});

export default router;
