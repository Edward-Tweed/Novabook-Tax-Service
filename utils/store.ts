import { Transaction, SaleTransaction } from "./types";

declare global {
  var _transactions: Transaction[] | undefined;
  var _amendments: SaleTransaction[] | undefined;
}

const transactions: Transaction[] = global._transactions || [];
global._transactions = transactions;

const amendments: SaleTransaction[] = global._amendments || [];
global._amendments = amendments;

export const store = {
  getTransactions: () => transactions,
  addTransaction: (transaction: Transaction) => {
    transactions.push(transaction);
    console.log(`[INFO] Transaction added: ${JSON.stringify(transaction)}`);
  },
  getAmendments: () => amendments,
  addAmendment: (amendment: SaleTransaction) => {
    amendments.push(amendment);
    console.log(`[INFO] Sale amendment added: ${JSON.stringify(amendment)}`);
  },
  clearStore: () => {
    global._transactions = [];
    global._amendments = [];
    console.log("[INFO] Store cleared");
  },
};
