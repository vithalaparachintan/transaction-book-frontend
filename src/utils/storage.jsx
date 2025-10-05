export const TX_KEY = "tb_transactions_v1";
export const CUST_KEY = "tb_customers_v1";

export function loadTransactions() {
  try { return JSON.parse(localStorage.getItem(TX_KEY) || "[]"); }
  catch { return []; }
}
export function saveTransactions(list) {
  localStorage.setItem(TX_KEY, JSON.stringify(list));
}

export function loadCustomers() {
  try { return JSON.parse(localStorage.getItem(CUST_KEY) || "[]"); }
  catch { return []; }
}
export function saveCustomers(list) {
  localStorage.setItem(CUST_KEY, JSON.stringify(list));
}
