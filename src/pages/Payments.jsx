import React, { useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";
import { useDarkMode } from "../context/DarkModeContext";

export default function Payments() {
  const { dark } = useDarkMode();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [addAmount, setAddAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, paymentsRes, balanceRes] = await Promise.all([
        API.get("/payments/users"),
        API.get("/payments/history"),
        API.get("/payments/balance")
      ]);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setWalletBalance(balanceRes.data.balance);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    }
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) {
      toast.error("Please select user and enter valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/payments/send", {
        receiverId: selectedUser._id,
        amount: Number(amount),
        note
      });
      toast.success(`₹${amount} sent to ${selectedUser.name}`);
      setWalletBalance(res.data.newBalance);
      setPayments([res.data.payment, ...payments]);
      setShowSendModal(false);
      setSelectedUser(null);
      setAmount("");
      setNote("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!addAmount || addAmount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/payments/add-money", {
        amount: Number(addAmount)
      });
      toast.success(`₹${addAmount} added to wallet`);
      setWalletBalance(res.data.newBalance);
      setShowAddMoneyModal(false);
      setAddAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = payments.length > 0 
    ? (payments[0].sender?._id || payments[0].receiver?._id) 
    : null;

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-900" : "bg-gray-50"} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Balance */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                Payments
              </h1>
              <p className={`mt-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Send and receive money from other users
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Wallet Balance
              </p>
              <p className="text-3xl font-bold text-green-600">
                ₹{walletBalance.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowSendModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              Send Money
            </button>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              Add Money
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
            Transaction History
          </h2>
          
          {payments.length === 0 ? (
            <p className={`text-center py-8 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              No payment history yet
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const isSent = payment.sender?._id === currentUserId || 
                              (payment.sender && !currentUserId);
                const otherUser = isSent ? payment.receiver : payment.sender;
                
                return (
                  <div
                    key={payment._id}
                    className={`${
                      dark ? "bg-gray-700" : "bg-gray-50"
                    } p-4 rounded-lg flex justify-between items-center`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          isSent ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {isSent ? "−" : "+"}
                      </div>
                      <div>
                        <p className={`font-medium ${dark ? "text-white" : "text-gray-900"}`}>
                          {isSent ? "Sent to" : "Received from"} {otherUser?.name || "Unknown"}
                        </p>
                        {payment.note && (
                          <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                            {payment.note}
                          </p>
                        )}
                        <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                          {new Date(payment.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          isSent ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isSent ? "−" : "+"}₹{payment.amount.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
              Send Money
            </h3>
            <form onSubmit={handleSendPayment} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Select Recipient
                </label>
                {users.length === 0 ? (
                  <div className={`p-4 rounded-lg border ${
                    dark ? "bg-gray-700 border-gray-600" : "bg-yellow-50 border-yellow-300"
                  }`}>
                    <p className={`text-sm ${dark ? "text-yellow-300" : "text-yellow-800"} font-medium mb-2`}>
                      No other users available
                    </p>
                    <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                      To send payments, you need other registered user accounts. Create a new account (Register page) to test payments between users.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedUser?._id || ""}
                    onChange={(e) => {
                      const user = users.find(u => u._id === e.target.value);
                      setSelectedUser(user);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      dark
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - ₹{user.walletBalance?.toFixed(2) || "0.00"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Add a note"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSendModal(false);
                    setSelectedUser(null);
                    setAmount("");
                    setNote("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    dark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || users.length === 0}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
              Add Money to Wallet
            </h3>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddAmount("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    dark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
