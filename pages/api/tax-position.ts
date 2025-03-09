import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "../../utils/store";
import {
  SaleTransaction,
  TaxPaymentTransaction,
  Transaction,
  ISODateString,
} from "../../utils/types";
import { validateTaxPositionQuery } from "../../utils/validators";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    console.warn(`[WARN] Invalid request method: ${req.method}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { date } = req.query;

  const { isValid, error } = validateTaxPositionQuery(date);
  if (!isValid) {
    console.warn(
      `[WARN] Invalid tax position query: ${date} - Error: ${error}`
    );
    return res.status(400).json({ error });
  }

  const queryDate = new Date(date as ISODateString);
  queryDate.setUTCHours(23, 59, 59, 999);

  const transactions = store
    .getTransactions()
    .filter((event: Transaction) => new Date(event.date) <= queryDate);

  let totalTax = 0;
  let totalPayments = 0;

  transactions.forEach((event) => {
    if (event.eventType === "SALES") {
      const saleEvent = event as SaleTransaction;
      const taxCollected = saleEvent.items.reduce(
        (sum, item) => sum + item.cost * item.taxRate,
        0
      );

      totalTax += taxCollected;

      console.log(
        `[INFO] Processed Sale - Invoice ID: ${saleEvent.invoiceId}, Tax: ${taxCollected}`
      );
    } else if (event.eventType === "TAX_PAYMENT") {
      const taxPaymentEvent = event as TaxPaymentTransaction;
      totalPayments += taxPaymentEvent.paymentAmount;

      console.log(
        `[INFO] Processed Tax Payment - Amount: ${taxPaymentEvent.paymentAmount}`
      );
    } else {
      console.warn(
        `[WARN] Unknown event type encountered: ${JSON.stringify(event)}`
      );
    }
  });

  console.log(
    `[INFO] Final Tax Position Calculation for ${queryDate.toISOString()}: Total Sales Tax = ${totalTax}, Total Payments = ${totalPayments}, Net Tax Position = ${totalTax - totalPayments}`
  );

  return res.status(200).json({
    date: date as ISODateString,
    taxPosition: totalTax - totalPayments,
  });
}
