import React, { useState, useEffect } from "react";
import API from "../api/api";
import toast from "react-hot-toast";
import { useDarkMode } from "../context/DarkModeContext";
import { useAuth } from "../context/AuthContext";

export default function Payments() {
  const { dark } = useDarkMode();
  const { authState } = useAuth();
  const currentUserId = authState?.user?._id;
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stats, setStats] = useState({ sent: {}, received: {} });
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [fee, setFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchData();
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, paymentsRes, balanceRes, statsRes] = await Promise.all([
        API.get("/payments/users/all"),
        API.get("/payments/history"),
        API.get("/payments/balance"),
        API.get("/payments/stats/summary")
      ]);
      setUsers(usersRes.data.users || []);
      setPayments(paymentsRes.data.payments || []);
      setWalletBalance(balanceRes.data.balance || 0);
      setStats(statsRes.data.statistics || { sent: {}, received: {} });
    } catch (err) {
      console.error("Fetch error:", err);
      const message = err.response?.data?.message;
      if (message && message.toLowerCase().includes("token")) {
        // Silent auth error - will be handled by API interceptor
      } else {
        toast.error(message || "Failed to load payment data");
      }
    }
  };

  // Calculate fees when amount changes
  const handleAmountChange = (value) => {
    setAmount(value);
    if (value) {
      const calculatedFee = Math.round((value * 0.02 + 2) * 100) / 100;
      const calculatedTax = Math.round(calculatedFee * 0.18 * 100) / 100;
      setFee(calculatedFee);
      setTax(calculatedTax);
    } else {
      setFee(0);
      setTax(0);
    }
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) {
      toast.error("Please select user and enter valid amount");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order on backend
      const res = await API.post("/payments/initiate", {
        receiverId: selectedUser._id,
        amount: Number(amount),
        note
      });

      const { razorpayOrder, razorpayKey, payment } = res.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.orderId,
        name: "Transaction Book",
        description: `Payment to ${selectedUser.name}`,
        notes: {
          note: note,
          recipient: selectedUser.name
        },
        handler: async (response) => {
          await handlePaymentSuccess(response, payment._id);
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || ""
        },
        theme: {
          color: dark ? "#1f2937" : "#3b82f6"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response, paymentDbId) => {
    setProcessingPayment(paymentDbId);
    try {
      // Step 3: Verify payment on backend
      const res = await API.post("/payments/verify", {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature
      });

      toast.success("Payment completed successfully!");
      setWalletBalance(res.data.payment.amount);
      
      // Refresh data
      fetchData();
      
      // Reset form
      setShowPaymentModal(false);
      setSelectedUser(null);
      setAmount("");
      setNote("");
      setFee(0);
      setTax(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment verification failed");
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRefundRequest = async (paymentId) => {
    const reason = prompt("Enter refund reason:");
    if (!reason) return;

    try {
      await API.post(`/payments/${paymentId}/refund`, { reason });
      toast.success("Refund requested successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
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
      toast.success(`₹${addAmount} added to wallet successfully!`);
      setWalletBalance(res.data.newBalance);
      setShowAddMoneyModal(false);
      setAddAmount("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      initiated: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      processing: "bg-cyan-100 text-cyan-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800"
    };
    const texts = {
      initiated: "Initiated",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded"
    };
    return (
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[status] || colors.initiated}`}>
        {texts[status] || status}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-900" : "bg-gray-50"} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-8 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h1 className={`text-4xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                Payments
              </h1>
              <p className={`mt-2 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Professional Payment Gateway
              </p>
            </div>

            {/* Wallet Balance Card */}
            <div className={`${dark ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-500 to-blue-600"} rounded-lg p-6 text-white`}>
              <p className="text-sm font-medium opacity-90">Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">₹{walletBalance.toFixed(2)}</p>
            </div>

            {/* Quick Stats */}
            <div className={`grid grid-cols-2 gap-4`}>
              <div className={`${dark ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-4`}>
                <p className={`text-xs font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  Total Sent
                </p>
                <p className={`text-lg font-bold mt-1 ${dark ? "text-white" : "text-gray-900"}`}>
                  ₹{(stats.sent?.totalAmount || 0).toFixed(0)}
                </p>
              </div>
              <div className={`${dark ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-4`}>
                <p className={`text-xs font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  Total Received
                </p>
                <p className={`text-lg font-bold mt-1 ${dark ? "text-white" : "text-gray-900"}`}>
                  ₹{(stats.received?.totalAmount || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
            >
              Send Money
            </button>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              Add Money (Test)
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
            Transaction History
          </h2>

          {payments.length === 0 ? (
            <div className={`text-center py-12 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-sm mt-1">Send your first payment using the button above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => {
                const isSent = payment.sender?._id === currentUserId;
                const otherUser = isSent ? payment.receiver : payment.sender;

                return (
                  <div
                    key={payment._id}
                    className={`${
                      dark ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
                    } p-5 rounded-lg flex justify-between items-center transition-colors`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-white ${
                          isSent ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600"
                        }`}
                      >
                        {isSent ? "−" : "+"}
                      </div>
                      <div>
                        <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
                          {isSent ? "Sent to" : "Received from"} <span className="font-bold">{otherUser?.name || "Unknown"}</span>
                        </p>
                        {payment.note && (
                          <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                            "{payment.note}"
                          </p>
                        )}
                        <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"} mt-1`}>
                          Transaction ID: <span className="font-mono">{payment.transactionId?.slice(-8) || "N/A"}</span>
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
                      <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                        {payment.fee > 0 && `Fee: ₹${payment.fee.toFixed(2)}`}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(payment.status)}
                      </div>
                      {payment.status === "completed" && (
                        <button
                          onClick={() => handleRefundRequest(payment._id)}
                          className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Request Refund
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl p-8 w-full max-w-md max-h-96 overflow-y-auto`}>
            <h3 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
              Send Money
            </h3>
            <form onSubmit={handleInitiatePayment} className="space-y-5">
              {/* Recipient Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Select Recipient
                </label>
                {users.length === 0 ? (
                  <div className={`p-4 rounded-lg border-2 ${
                    dark ? "bg-red-900 border-red-700" : "bg-red-50 border-red-300"
                  }`}>
                    <p className={`text-sm font-bold ${dark ? "text-red-200" : "text-red-800"}`}>
                      ⚠️ No Other Users Found
                    </p>
                    <p className={`text-xs mt-2 ${dark ? "text-red-300" : "text-red-700"}`}>
                      You need at least 2 registered users to send money. Ask others to create accounts and register in the application first.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                      }}
                      className={`mt-3 text-sm w-full px-3 py-2 rounded ${
                        dark 
                          ? "bg-red-800 hover:bg-red-700 text-red-100" 
                          : "bg-red-200 hover:bg-red-300 text-red-900"
                      } font-medium transition-colors`}
                    >
                      Close
                    </button>
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
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  >
                    <option value="">Choose a recipient...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email || user.phone || "no contact"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max="100000"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter amount (min ₹10)"
                  required
                />
                <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  Minimum ₹10 • Maximum ₹100,000
                </p>
              </div>

              {/* Fee Breakdown */}
              {amount && (
                <div className={`p-4 rounded-lg ${dark ? "bg-gray-700" : "bg-blue-50"}`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={dark ? "text-gray-400" : "text-gray-600"}>Amount</span>
                      <span className={dark ? "text-white" : "text-gray-900"}>₹{parseFloat(amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={dark ? "text-gray-400" : "text-gray-600"}>Fee (2% + ₹2)</span>
                      <span className={dark ? "text-white" : "text-gray-900"}>₹{fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={dark ? "text-gray-400" : "text-gray-600"}>GST (18%)</span>
                      <span className={dark ? "text-white" : "text-gray-900"}>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className={`border-t pt-2 flex justify-between font-bold ${dark ? "border-gray-600" : "border-blue-200"}`}>
                      <span>Recipient Gets</span>
                      <span className="text-green-600">₹{(parseFloat(amount || 0) - fee - tax).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
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
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Add a note (e.g., 'Lunch money')"
                  maxLength="100"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                    setAmount("");
                    setNote("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    dark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedUser || !amount || users.length === 0 || processingPayment}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  {loading ? "Loading..." : processingPayment ? "Processing..." : "Pay with Razorpay"}
                </button>
              </div>
              <p className={`text-xs text-center ${dark ? "text-gray-400" : "text-gray-600"}`}>
                🔒 Secure payment powered by Razorpay
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl p-8 w-full max-w-md`}>
            <h3 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
              Add Money to Wallet
            </h3>
            <form onSubmit={handleAddMoney} className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="100000"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="Enter amount (for testing)"
                  required
                />
                <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  For testing purposes only - No real charge
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddAmount("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    dark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !addAmount}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
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
