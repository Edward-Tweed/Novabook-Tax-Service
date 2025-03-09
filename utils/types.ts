export type ISODateString = string;

export type SaleItem = {
  itemId: string;
  cost: number;
  taxRate: number;
};

export type SaleTransaction = {
  readonly eventType: "SALES";
  readonly date: ISODateString;
  readonly invoiceId: string;
  items: SaleItem[];
};

export type TaxPaymentTransaction = {
  readonly eventType: "TAX_PAYMENT";
  readonly date: ISODateString;
  readonly paymentAmount: number;
};

export type Transaction = SaleTransaction | TaxPaymentTransaction;

export type ValidationResult = { isValid: boolean; error?: string };
