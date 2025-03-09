import {
  Transaction,
  SaleTransaction,
  TaxPaymentTransaction,
  SaleItem,
  ValidationResult,
  ISODateString,
} from "./types";

export function validateTransaction(event: Transaction): ValidationResult {
  if (!event || typeof event !== "object" || !("eventType" in event)) {
    return { isValid: false, error: "Missing or invalid event type" };
  }

  if (event.eventType === "SALES") {
    return validateSaleTransaction(event as SaleTransaction);
  } else if (event.eventType === "TAX_PAYMENT") {
    return validateTaxPaymentTransaction(event as TaxPaymentTransaction);
  }

  console.warn(
    `[WARN] Unknown event type encountered: ${JSON.stringify(event)}`
  );
  return { isValid: false, error: "Unknown event type" };
}

export function validateSaleAmendment(
  event: SaleTransaction
): ValidationResult {
  if (!event.eventType || event.eventType !== "SALES") {
    return {
      isValid: false,
      error: "Missing or invalid event type in sale amendment",
    };
  }

  const dateValidation = isValidISODate(event.date);
  if (!dateValidation.isValid) return dateValidation;

  if (!event.invoiceId) {
    return { isValid: false, error: "Missing invoiceId in sale amendment" };
  }

  return validateSaleItems(event.items);
}

export function validateTaxPositionQuery(date: unknown): ValidationResult {
  if (typeof date !== "string") {
    return { isValid: false, error: "Invalid date parameter" };
  }

  return isValidISODate(date as ISODateString);
}

function validateSaleTransaction(event: SaleTransaction): ValidationResult {
  const dateValidation = isValidISODate(event.date);
  if (!dateValidation.isValid) return dateValidation;

  if (!event.invoiceId) {
    return { isValid: false, error: "Missing invoiceId in sale transaction" };
  }

  return validateSaleItems(event.items);
}

function validateTaxPaymentTransaction(
  event: TaxPaymentTransaction
): ValidationResult {
  const dateValidation = isValidISODate(event.date);
  if (!dateValidation.isValid) return dateValidation;

  if (typeof event.paymentAmount !== "number" || event.paymentAmount < 0) {
    return { isValid: false, error: "Invalid tax payment amount" };
  }

  return { isValid: true };
}

function validateSaleItems(items: SaleItem[]): ValidationResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, error: "Event must have at least one item" };
  }

  for (const item of items) {
    const itemValidation = validateSaleItem(item);
    if (!itemValidation.isValid) return itemValidation;
  }

  return { isValid: true };
}

function validateSaleItem(item: SaleItem): ValidationResult {
  if (!item.itemId) {
    return { isValid: false, error: "Missing itemId in item" };
  }

  if (typeof item.cost !== "number" || item.cost < 0) {
    return { isValid: false, error: "Invalid cost value in item" };
  }

  if (
    typeof item.taxRate !== "number" ||
    item.taxRate < 0 ||
    item.taxRate > 1
  ) {
    return { isValid: false, error: "Invalid tax rate in item" };
  }

  return { isValid: true };
}

function isValidISODate(dateString: ISODateString): ValidationResult {
  if (!dateString) {
    return { isValid: false, error: "Missing date parameter" };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  return { isValid: true };
}
