import { create } from 'zustand';

// Enum for the type of transactions selected
export enum TransactionType {
  Business = 'Business',
  Personal = 'Personal'
}

const selectedTransactionsStore = create(set => ({
  gicTransactions: { transactions: [], type: '' },
  setSelectedTransactions: ({ transactions, type }) =>
    set({ gicTransactions: { transactions, type } }),
  resetSelectedTransactions: () => set({ gicTransactions: { transactions: [], type: '' } }),
  hasSelectedTransactions: () => {
    return (selectedTransactionsStore as any).getState().gicTransactions?.transactions.length > 0;
  }
}));

export default function useSelectedTransactions() {
  const {
    gicTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  } = selectedTransactionsStore() as {
    gicTransactions: any;
    setSelectedTransactions: (gicTransactions: any) => void;
    resetSelectedTransactions: () => void;
    hasSelectedTransactions: () => boolean;
  };

  return {
    gicTransactions,
    setSelectedTransactions,
    resetSelectedTransactions,
    hasSelectedTransactions
  };
}
