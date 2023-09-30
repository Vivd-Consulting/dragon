import express from 'express';

// import knex from './db.js';

import { getTransactions } from './accounting/cibc.js';

const router = express.Router();

// Import transactions from the CIBC database
router.post('/accounting/cibc', async (req, res) => {
  const transactions = await getTransactions(req.body);

  res.status(200).json({ transactions });
});

export default router;
