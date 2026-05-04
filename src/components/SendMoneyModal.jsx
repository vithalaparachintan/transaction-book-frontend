import React, { useState } from "react";
import API from "../api/api";
import toast from "react-hot-toast";
import { useDarkMode } from "../context/DarkModeContext";

export default function SendMoneyModal({ isOpen, onClose, contact, onSuccess }) {
  const { dark: isDarkMode } = useDarkMode();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter valid amount");
      return;
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">

    if (!contact?._id) {
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
            } rounded-lg shadow-xl w-full max-w-md transition-colors duration-300`}
    }

    setLoading(true);
    try {
      const response = await API.post("/wallet/send-to-contact", {
        contactId: contact._id,
        amount: parseFloat(amount),
        note: note || ""
      });

      toast.success(
        `₹${amount} sent successfully to ${contact.name}!`
      );

      // Reset form
      setAmount("");
      setNote("");
      onClose();

      // Callback for parent to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Send money error:", err);
      toast.error(
        err.response?.data?.message || "Failed to send money"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-xl w-full max-w-md`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Send Money
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                To: {contact?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-2xl ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSendMoney} className="space-y-4">
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Amount (₹)
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                autoFocus
                required
              />
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="note"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Note (Optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this transfer"
                rows="3"
                className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition resize-none ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Info Alert */}
            <div
              className={`p-4 rounded-lg text-sm ${
                isDarkMode
                  ? "bg-blue-900 text-blue-100 border border-blue-800"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <p className="font-medium">Direct Transfer</p>
              <p className="mt-1 opacity-90">
                This is an instant transfer to your contact with no fees or verification required.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? "Sending..." : "Send Money"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
