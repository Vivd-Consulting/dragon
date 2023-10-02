import { create } from 'zustand';

// Enum for the type of transactions selected
export enum TransactionType {
  Business = 'Business',
  Personal = 'Personal'
}

const selectedTransactionsStore = create(set => ({
  bulkSelectTransactions: [],
  setBulkSelectTransactions: (transactions: any[]) => set({ bulkSelectTransactions: transactions }),

  gicTransactions: { transactions: [], type: '' },
  setSelectedTransactions: ({ transactions, type }) =>
    set({ gicTransactions: { transactions, type } }),
  resetSelectedTransactions: () => set({ bulkSelectTransactions: [], gicTransactions: { transactions: [], type: '' } }),
  hasSelectedTransactions: () => {
    return (selectedTransactionsStore as any).getState().gicTransactions?.transactions.length > 0;
  }
}));

export default function useSelectedTransactions() {
  const {
    bulkSelectTransactions,
    setBulkSelectTransactions,

    gicTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  } = selectedTransactionsStore() as {
    bulkSelectTransactions: any[];
    setBulkSelectTransactions: (transactions: any[]) => void;

    gicTransactions: any;
    setSelectedTransactions: (gicTransactions: any) => void;
    resetSelectedTransactions: () => void;
    hasSelectedTransactions: () => boolean;
  };

  return {
    bulkSelectTransactions,
    setBulkSelectTransactions,

    gicTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  };
}
