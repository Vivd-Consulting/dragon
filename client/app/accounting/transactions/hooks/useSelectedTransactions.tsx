'use client';

import { create } from 'zustand';

interface SelectedTransactionsState {
  transactions: any[];
  type: 'personal' | 'business' | null;
  bulkSelectTransactions: any[];
  setSelectedTransactions: (data: { transactions: any[]; type: 'personal' | 'business' }) => void;
  setBulkSelectTransactions: (transactions: any[]) => void;
}

const useSelectedTransactions = create<SelectedTransactionsState>((set) => ({
  transactions: [],
  type: null,
  bulkSelectTransactions: [],
  setSelectedTransactions: (data) => set(data),
  setBulkSelectTransactions: (transactions) => set({ bulkSelectTransactions: transactions }),
}));

export default useSelectedTransactions;

