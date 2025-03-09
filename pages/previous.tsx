import { useState, ChangeEvent } from "react";

interface SaleItem {
  itemId: string;
  cost: number | "";
  taxRate: number | "";
}

interface Transaction {
  eventType: "SALES" | "TAX_PAYMENT";
  date: string;
  invoiceId?: string;
  items?: SaleItem[];
  paymentAmount?: string;
}

export default function Home() {
  const [apiResponse, setApiResponse] = useState<null | {
    success: boolean;
    data: any;
  }>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryDate, setQueryDate] = useState<string>("");
  const [activeSection, setActiveSection] = useState<
    "transaction" | "amendment" | "payTax" | "taxQuery"
  >("transaction");

  const initialTransaction: Transaction = {
    eventType: "SALES",
    date: "",
    invoiceId: "",
    items: [{ itemId: "", cost: "", taxRate: "" }],
  };

  const initialTaxPayment: Transaction = {
    eventType: "TAX_PAYMENT",
    date: "",
    paymentAmount: "",
  };

  const [transaction, setTransaction] = useState<Transaction>({
    ...initialTransaction,
  });
  const [amendment, setAmendment] = useState<Transaction>({
    ...initialTransaction,
  });
  const [taxPayment, setTaxPayment] = useState<Transaction>({
    ...initialTaxPayment,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setState: (value: Transaction) => void,
    state: Transaction
  ) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleItemChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
    setState: (value: Transaction) => void,
    state: Transaction
  ) => {
    const updatedItems = [...(state.items || [])];

    const value: string | number =
      e.target.name === "cost" || e.target.name === "taxRate"
        ? e.target.value === ""
          ? ""
          : parseFloat(e.target.value)
        : e.target.value;

    updatedItems[index][e.target.name] = value as SaleItem[keyof SaleItem];

    setState({ ...state, items: updatedItems });
  };

  const addItem = (
    setState: (value: Transaction) => void,
    state: Transaction
  ) => {
    setState({
      ...state,
      items: [...(state.items || []), { itemId: "", cost: "", taxRate: "" }],
    });
  };

  const removeItem = (
    index: number,
    setState: (value: Transaction) => void,
    state: Transaction
  ) => {
    setState({
      ...state,
      items: state.items!.filter((_, i) => i !== index),
    });
  };

  const clearForm = (
    setState: (value: Transaction) => void,
    resetToValue?: Transaction
  ) => {
    setState(!resetToValue ? { ...initialTransaction } : resetToValue);
  };

  const handleApiRequest = async (
    endpoint: string,
    method: "POST" | "PATCH" | "GET",
    body?: Transaction | null
  ) => {
    setLoading(true);
    setApiResponse(null);
    try {
      if (
        body?.eventType === "TAX_PAYMENT" &&
        typeof body.paymentAmount === "string"
      ) {
        body.paymentAmount = parseFloat(body.paymentAmount) || 0;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      setApiResponse({ success: res.ok, data });

      if (res.ok) {
        if (method === "PATCH") clearForm(setAmendment, initialTransaction);
        else if (method === "GET") setQueryDate("");
        else if (method === "POST" && body?.eventType === "TAX_PAYMENT")
          clearForm(setTaxPayment, initialTaxPayment);
        else clearForm(setTransaction, initialTransaction);
      }
    } catch (error) {
      setApiResponse({ success: false, data: "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Novabook Tax Service</h1>

      {/* API Response Section */}
      <div
        className={`p-4 rounded-lg w-full max-w-lg text-white ${
          apiResponse
            ? apiResponse.success
              ? "bg-green-500"
              : "bg-red-500"
            : "bg-gray-300"
        }`}
      >
        {apiResponse ? JSON.stringify(apiResponse.data) : "No response yet"}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 my-4">
        <button
          className={`p-2 rounded ${
            activeSection === "transaction"
              ? "bg-blue-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => setActiveSection("transaction")}
        >
          Record Sale
        </button>
        <button
          className={`p-2 rounded ${
            activeSection === "amendment"
              ? "bg-orange-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => setActiveSection("amendment")}
        >
          Amend Sale
        </button>
        <button
          className={`p-2 rounded ${
            activeSection === "payTax"
              ? "bg-purple-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => setActiveSection("payTax")}
        >
          Pay Tax
        </button>
        <button
          className={`p-2 rounded ${
            activeSection === "taxQuery"
              ? "bg-green-500 text-white"
              : "bg-gray-300"
          }`}
          onClick={() => setActiveSection("taxQuery")}
        >
          Query Tax Position
        </button>
      </div>

      {/* Conditional Rendering Based on Active Section */}
      {activeSection === "transaction" && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-lg mt-6">
          <h2 className="text-lg font-semibold mb-3">Record Sale</h2>
          <input
            className="border p-2 w-full mb-2"
            type="datetime-local"
            name="date"
            value={transaction.date}
            onChange={(e) => handleInputChange(e, setTransaction, transaction)}
          />
          <input
            className="border p-2 w-full mb-2"
            type="text"
            placeholder="Invoice ID"
            name="invoiceId"
            value={transaction.invoiceId}
            onChange={(e) => handleInputChange(e, setTransaction, transaction)}
          />
          {transaction.items?.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                className="border p-2 w-1/3"
                type="text"
                placeholder="Item ID"
                name="itemId"
                value={item.itemId}
                onChange={(e) =>
                  handleItemChange(index, e, setTransaction, transaction)
                }
              />
              <input
                className="border p-2 w-1/3"
                type="number"
                placeholder="Cost"
                name="cost"
                value={item.cost}
                onChange={(e) =>
                  handleItemChange(index, e, setTransaction, transaction)
                }
              />
              <input
                className="border p-2 w-1/3"
                type="number"
                step="0.01"
                placeholder="Tax Rate"
                name="taxRate"
                value={item.taxRate}
                onChange={(e) =>
                  handleItemChange(index, e, setTransaction, transaction)
                }
              />
              {index > 0 && (
                <button
                  className="text-red-500 ml-2"
                  onClick={() => removeItem(index, setTransaction, transaction)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            className="text-blue-500"
            onClick={() => addItem(setTransaction, transaction)}
          >
            + Add Item
          </button>
          <button
            className="bg-blue-500 text-white p-2 w-full mt-3"
            disabled={loading}
            onClick={() =>
              handleApiRequest("/api/transactions", "POST", transaction)
            }
          >
            {loading ? "Submitting..." : "Submit Transaction"}
          </button>
          <button
            className="bg-gray-400 text-white p-2 w-full mt-2"
            onClick={() => clearForm(setTransaction)}
          >
            Clear
          </button>
        </div>
      )}

      {activeSection === "amendment" && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-lg mt-6">
          <h2 className="text-lg font-semibold mb-3">Amend Sale</h2>
          <input
            className="border p-2 w-full mb-2"
            type="datetime-local"
            name="date"
            value={amendment.date}
            onChange={(e) => handleInputChange(e, setAmendment, amendment)}
          />
          <input
            className="border p-2 w-full mb-2"
            type="text"
            placeholder="Invoice ID"
            name="invoiceId"
            value={amendment.invoiceId}
            onChange={(e) => handleInputChange(e, setAmendment, amendment)}
          />
          {amendment.items?.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                className="border p-2 w-1/3"
                type="text"
                placeholder="Item ID"
                name="itemId"
                value={item.itemId}
                onChange={(e) =>
                  handleItemChange(index, e, setAmendment, amendment)
                }
              />
              <input
                className="border p-2 w-1/3"
                type="number"
                placeholder="Cost"
                name="cost"
                value={item.cost}
                onChange={(e) =>
                  handleItemChange(index, e, setAmendment, amendment)
                }
              />
              <input
                className="border p-2 w-1/3"
                type="number"
                step="0.01"
                placeholder="Tax Rate"
                name="taxRate"
                value={item.taxRate}
                onChange={(e) =>
                  handleItemChange(index, e, setAmendment, amendment)
                }
              />
              {index > 0 && (
                <button
                  className="text-red-500 ml-2"
                  onClick={() => removeItem(index, setAmendment, amendment)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            className="text-blue-500"
            onClick={() => addItem(setAmendment, amendment)}
          >
            + Add Item
          </button>
          <button
            className="bg-orange-500 text-white p-2 w-full mt-3"
            disabled={loading}
            onClick={() => handleApiRequest("/api/sale", "PATCH", amendment)}
          >
            {loading ? "Submitting..." : "Submit Amendment"}
          </button>
          <button
            className="bg-gray-400 text-white p-2 w-full mt-2"
            onClick={() => clearForm(setAmendment)}
          >
            Clear
          </button>
        </div>
      )}

      {/* Pay Tax Section */}
      {activeSection === "payTax" && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-lg mt-6">
          <h2 className="text-lg font-semibold mb-3">Pay Tax</h2>
          <input
            className="border p-2 w-full mb-2"
            type="datetime-local"
            name="date"
            value={taxPayment.date}
            onChange={(e) => handleInputChange(e, setTaxPayment, taxPayment)}
          />
          <input
            className="border p-2 w-full mb-2"
            type="number"
            placeholder="Payment Amount"
            name="paymentAmount"
            value={taxPayment.paymentAmount}
            onChange={(e) => handleInputChange(e, setTaxPayment, taxPayment)}
          />
          <button
            className="bg-purple-500 text-white p-2 w-full mt-3"
            disabled={loading}
            onClick={() =>
              handleApiRequest("/api/transactions", "POST", taxPayment)
            }
          >
            {loading ? "Submitting..." : "Submit Tax Payment"}
          </button>
          <button
            className="bg-gray-400 text-white p-2 w-full mt-2"
            onClick={() => clearForm(setTaxPayment, initialTaxPayment)}
          >
            Clear
          </button>
        </div>
      )}

      {activeSection === "taxQuery" && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-lg mt-6">
          <h2 className="text-lg font-semibold mb-3">Query Tax Position</h2>
          <input
            className="border p-2 w-full mb-2"
            type="datetime-local"
            value={queryDate}
            onChange={(e) => setQueryDate(e.target.value)}
          />
          <button
            className="bg-green-500 text-white p-2 w-full"
            disabled={loading}
            onClick={() =>
              handleApiRequest(`/api/tax-position?date=${queryDate}`, "GET")
            }
          >
            {loading ? "Fetching..." : "Get Tax Position"}
          </button>
          <button
            className="bg-gray-400 text-white p-2 w-full mt-2"
            onClick={() => setQueryDate("")}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
