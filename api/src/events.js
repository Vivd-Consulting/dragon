import express from 'express';

import { backfill } from './accounting/cibc.js';

const router = express.Router();

// Import transactions from the CIBC database
router.post('/accounting/cibc', async (req, res) => {
  const insertedTransactions = await backfill(req.body);
  
  res.status(200).json(insertedTransactions);
});

export default router;
