import { create } from 'zustand';

// Enum for the type of transactions selected
export enum TransactionType {
  Business = 'Business',
  Personal = 'Personal'
}

const selectedTransactionsStore = create(set => ({
  bulkSelectTransactions: [],
  setBulkSelectTransactions: (transactions: any[]) => set({ bulkSelectTransactions: transactions }),

  categoryTransactions: { transactions: [], type: '' },
  setSelectedTransactions: ({ transactions, type }) =>
    set({ categoryTransactions: { transactions, type } }),
  resetSelectedTransactions: () =>
    set({ bulkSelectTransactions: [], categoryTransactions: { transactions: [], type: '' } }),
  hasSelectedTransactions: () => {
    return (
      (selectedTransactionsStore as any).getState().categoryTransactions?.transactions.length > 0
    );
  }
}));

export default function useSelectedTransactions() {
  const {
    bulkSelectTransactions,
    setBulkSelectTransactions,

    categoryTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  } = selectedTransactionsStore() as {
    bulkSelectTransactions: any[];
    setBulkSelectTransactions: (transactions: any[]) => void;

    categoryTransactions: any;
    setSelectedTransactions: (categoryTransactions: any) => void;
    resetSelectedTransactions: () => void;
    hasSelectedTransactions: () => boolean;
  };

  return {
    bulkSelectTransactions,
    setBulkSelectTransactions,

    categoryTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  };
}
