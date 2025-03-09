import type { NextApiRequest, NextApiResponse } from "next";
import { store } from "../../utils/store";
import { Transaction } from "../../utils/types";
import { validateTransaction } from "../../utils/validators";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    console.warn(`[WARN] Invalid request method: ${req.method}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const event = req.body as Transaction;

  const { isValid, error } = validateTransaction(event);
  if (!isValid) {
    console.warn(
      `[WARN] Invalid transaction received: ${JSON.stringify(event)} - Error: ${error}`
    );
    return res.status(400).json({ error });
  }

  console.log(
    `[INFO] Adding transaction at ${new Date().toISOString()}: ${JSON.stringify(event)}`
  );

  store.addTransaction(event);

  return res.status(202).json({ message: "Transaction received" });
}
