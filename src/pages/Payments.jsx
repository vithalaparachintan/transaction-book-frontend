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
  const [stats, setStats] = useState({ sent: { totalAmount: 0, count: 0 }, received: { totalAmount: 0, count: 0 } });
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

  // Load Razorpay script on mount for Add Money feature
  useEffect(() => {
    fetchData();
    
    // Load Razorpay script for Add Money functionality
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch all data on component load
  const fetchData = async () => {
    try {
      const [usersRes, paymentsRes, balanceRes, statsRes] = await Promise.all([
        API.get("/payments/users/all").catch(err => ({ data: { users: [] }, error: err })),
        API.get("/payments/history").catch(err => ({ data: { payments: [] }, error: err })),
        API.get("/payments/balance").catch(err => ({ data: { balance: 0 }, error: err })),
        API.get("/payments/stats/summary").catch(err => ({ data: { statistics: { sent: { totalAmount: 0, count: 0 }, received: { totalAmount: 0, count: 0 } } }, error: err }))
      ]);

      setUsers(usersRes.data?.users || []);
      setPayments(paymentsRes.data?.payments || []);
      setWalletBalance(balanceRes.data?.balance || 0);
      setStats(statsRes.data?.statistics || { sent: { totalAmount: 0, count: 0 }, received: { totalAmount: 0, count: 0 } });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Calculate fees when amount changes
  const handleAmountChange = (value) => {
    setAmount(value);
    // NO FEES for direct user-to-user transfer
    setFee(0);
    setTax(0);
  };

  // Send money directly to user (NO Razorpay - direct wallet transfer)
  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      toast.error("Please select user and enter valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/wallet/send-to-user", {
        receiverId: selectedUser._id,
        amount: parseFloat(amount),
        note: note || ""
      });

      toast.success(`₹${amount} sent successfully to ${selectedUser.name}!`);
      
      // Reset form
      setShowPaymentModal(false);
      setSelectedUser(null);
      setAmount("");
      setNote("");
      
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error("Send money error:", err);
      toast.error(err.response?.data?.message || "Failed to send money");
    } finally {
      setLoading(false);
    }
  };

  // Handle add money with Razorpay checkout
  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    setLoading(true);
    try {
      // Call backend to create Razorpay order for adding money
      const res = await API.post("/wallet/add-money", {
        amount: parseFloat(addAmount),
        paymentMethod: "razorpay"
      });

      const { success, order, transaction, transactionId } = res.data;

      // Check if it's mock mode (testing) - directly credits wallet
      if (transaction?.gatewayMode === "mock") {
        toast.success(`₹${addAmount} added to wallet successfully!`);
        setShowAddMoneyModal(false);
        setAddAmount("");
        await fetchData();
        setLoading(false);
        return;
      }

      // Live mode - show Razorpay checkout
      if (!order || !order.orderId || !order.key) {
        toast.error("Failed to create payment order. Missing order details.");
        console.error("Order details:", order);
        setLoading(false);
        return;
      }

      if (!window.Razorpay) {
        toast.error("Razorpay library not loaded. Please refresh page.");
        setLoading(false);
        return;
      }

      const options = {
        key: order.key,
        amount: Math.round(order.amount * 100), // Convert to paise and ensure integer
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "Transaction Book",
        description: `Add ₹${addAmount} to Wallet`,
        handler: (response) => handleAddMoneySuccess(response, transactionId),
        prefill: {
          name: authState?.user?.name || "",
          email: authState?.user?.email || ""
        },
        theme: {
          color: dark ? "#1f2937" : "#3b82f6"
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Add money error:", err);
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      console.error("Full error:", err.response?.data);
      setLoading(false);
    }
  };

  // Handle successful add money payment
  const handleAddMoneySuccess = async (response, transactionId) => {
    try {
      // Verify the payment
      const verifyRes = await API.post("/wallet/add-money/verify", {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        transactionId: transactionId
      });

      toast.success(`₹${addAmount} added to wallet successfully!`);
      setShowAddMoneyModal(false);
      setAddAmount("");
      await fetchData();
    } catch (err) {
      console.error("Payment verification error:", err);
      toast.error(err.response?.data?.message || "Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Get status badge styling
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
        {/* Header Section */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-8 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-1">
              <h1 className={`text-4xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                Payments
              </h1>
              <p className={`mt-2 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Professional Payment Gateway
              </p>
            </div>

            {/* Wallet Balance Card */}
            <div className={`${dark ? "bg-gradient-to-br from-blue-900 to-blue-800" : "bg-gradient-to-br from-blue-500 to-blue-600"} rounded-lg p-6 text-white shadow-lg`}>
              <p className="text-sm font-medium opacity-90">Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">₹{walletBalance.toFixed(2)}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
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

          {/* Action Buttons */}
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

        {/* Transaction History */}
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
            <div className="space-y-3 overflow-x-auto">
              {payments.map((payment) => {
                const isSent = payment.sender?._id === currentUserId;
                const otherUser = isSent ? payment.receiver : payment.sender;

                return (
                  <div
                    key={payment._id}
                    className={`${
                      dark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"
                    } p-5 rounded-lg flex justify-between items-center transition-colors`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          isSent ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
                          {isSent ? "Sent to" : "Received from"} {otherUser?.name}
                        </p>
                        <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isSent ? "text-red-500" : "text-green-500"}`}>
                        {isSent ? "-" : "+"}₹{payment.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send Money Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
              Send Money
            </h3>

            <form onSubmit={handleInitiatePayment} className="space-y-4">
              {/* User Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Select Recipient
                </label>
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - ₹{user.walletBalance?.toFixed(2) || "0.00"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max="100000"
                  step="0.01"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Fee Breakdown - NO FEES for direct transfer */}
              {amount && (
                <div className={`${dark ? "bg-gray-700" : "bg-gray-100"} p-4 rounded-lg`}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Amount:</span>
                    <span>₹{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Fee:</span>
                    <span>₹0.00 (No fees for direct transfer)</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-500 pt-2 mt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">₹{parseFloat(amount).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Note Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    dark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedUser || !amount}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
              Add Money to Wallet
            </h3>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max="100000"
                  step="0.01"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    dark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddAmount("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    dark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !addAmount}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Add Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
