import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "../../utils/store";
import { SaleTransaction, ISODateString } from "../../utils/types";
import { validateSaleAmendment } from "../../utils/validators";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    console.warn(`[WARN] Invalid request method: ${req.method}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const amendment: SaleTransaction = req.body;

  const { isValid, error } = validateSaleAmendment(amendment);
  if (!isValid) {
    console.warn(
      `[WARN] Invalid sale amendment received: ${JSON.stringify(amendment)} - Error: ${error}`
    );
    return res.status(400).json({ error });
  }

  const transactions = store.getTransactions();

  const existingSaleIndex = transactions.findIndex(
    (event) =>
      event.eventType === "SALES" && event.invoiceId === amendment.invoiceId
  );

  if (existingSaleIndex !== -1) {
    const existingSale = transactions[existingSaleIndex] as SaleTransaction;

    const updatedSale: SaleTransaction = {
      ...existingSale,
      items: mergeSaleItems(existingSale.items, amendment.items),
      date: existingSale.date as ISODateString,
    };

    transactions[existingSaleIndex] = updatedSale;

    console.log(`[INFO] Sale amended: ${JSON.stringify(updatedSale)}`);
  } else {
    store.addAmendment(amendment);

    console.warn(
      `[WARN] Sale amendment stored separately (invoice not found): ${JSON.stringify(amendment)}`
    );
  }

  return res.status(202).json({ message: "Sale amendment received" });
}

function mergeSaleItems(
  existingItems: SaleTransaction["items"],
  amendedItems: SaleTransaction["items"]
): SaleTransaction["items"] {
  const updatedItems = [...existingItems];

  amendedItems.forEach((amendedItem) => {
    const existingItemIndex = updatedItems.findIndex(
      (item) => item.itemId === amendedItem.itemId
    );

    if (existingItemIndex !== -1) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        ...amendedItem,
      };
    } else {
      updatedItems.push(amendedItem);
    }
  });

  return updatedItems;
}
