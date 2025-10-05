

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/api";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { useDarkMode } from "../context/DarkModeContext";


const EditTransactionModal = ({ isOpen, onClose, txData, onChange, onSubmit }) => {
  const { isDarkMode } = useDarkMode();
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Edit Transaction</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="editAmount" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
            <input id="editAmount" type="number" name="amount" value={txData?.amount || ''} onChange={onChange} className={`w-full border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`} required />
          </div>
          <div className="mb-4">
            <label htmlFor="editType" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
            <select id="editType" name="type" value={txData?.type || 'credit'} onChange={onChange} className={`w-full border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`}>
              <option value="credit">Credit (You Got)</option>
              <option value="debit">Debit (You Gave)</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="editNote" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Note (Optional)</label>
            <input id="editNote" type="text" name="note" value={txData?.note || ''} onChange={onChange} className={`w-full border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={`font-semibold px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Cancel</button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AddTransactionModal = ({ isOpen, onClose, txData, onChange, onSubmit, type }) => {
  const { isDarkMode } = useDarkMode();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 ${type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'credit' ? 'Add Credit (You Got)' : 'Add Debit (You Gave)'}
        </h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
            <input id="amount" type="number" name="amount" value={txData.amount} onChange={onChange} className={`w-full border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`} required autoFocus/>
          </div>
          <div className="mb-6">
            <label htmlFor="note" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Note (Optional)</label>
            <input id="note" type="text" name="note" value={txData.note} onChange={onChange} className={`w-full border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'}`} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={`font-semibold px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Cancel</button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const BalanceSummary = ({ balance }) => {
  const { isDarkMode } = useDarkMode();
  const isPositive = balance >= 0;
  const text = isPositive ? "You will get" : "You have to give";
  return (
    <div className={`p-4 rounded-lg shadow-lg mb-6 text-white ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}>
      <div className="text-sm opacity-90">{text}</div>
      <div className="text-3xl font-bold">₹{Math.abs(balance)}</div>
    </div>
  );
};

export default function CustomerDetail() {
  const { isDarkMode } = useDarkMode();
  const { name } = useParams();
  const customerName = decodeURIComponent(name);

  const [ledger, setLedger] = useState({ balance: 0, transactions: [], customerId: null });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ amount: '', note: '', type: 'credit' });

  async function loadTransactions() {
    try {
      const res = await API.get(`/transactions/customer/${customerName}`);
      setLedger(res.data);
    } catch (error) { 
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions.");
    }
    setLoading(false);
  }

  useEffect(() => { 
    if (customerName) { 
      loadTransactions(); 
    } 
  }, [customerName]);

  const handleDelete = async (txId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await API.delete(`/transactions/${txId}`);
        toast.success("Transaction deleted!");
        loadTransactions();
      } catch (error) { 
        toast.error("Failed to delete transaction."); 
      }
    }
  };
  
  // Edit handlers
  const openEditModal = (tx) => { 
    setEditingTx(tx); 
    setIsEditModalOpen(true); 
  };
  
  const handleEditChange = (e) => { 
    setEditingTx({ ...editingTx, [e.target.name]: e.target.value }); 
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/transactions/${editingTx._id}`, { 
        amount: Number(editingTx.amount), 
        type: editingTx.type, 
        note: editingTx.note 
      });
      toast.success("Transaction updated!");
      setIsEditModalOpen(false);
      setEditingTx(null);
      loadTransactions();
    } catch (error) { 
      toast.error("Failed to update transaction."); 
    }
  };

  // Handlers for the new Add Transaction modal
  const openAddModal = (type) => {
    setNewTransaction({ amount: '', note: '', type });
    setIsAddModalOpen(true);
  };
  
  const handleAddChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };
  
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', {
        ...newTransaction,
        amount: Number(newTransaction.amount),
        customerId: ledger.customerId,
      });
      toast.success("Transaction added!");
      setIsAddModalOpen(false);
      loadTransactions();
    } catch (error) {
      toast.error("Failed to add transaction.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Ledger for ${customerName}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Balance: Rs. ${ledger.balance}`, 14, 30);
    
    const tableData = ledger.transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('en-IN'),
      tx.type === 'credit' ? 'You Got' : 'You Gave',
      `Rs. ${tx.amount}`,
      tx.note || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Type', 'Amount', 'Note']],
      body: tableData,
      startY: 40
    });
    
    doc.save(`${customerName}-ledger.pdf`);
  };

  if (loading) return <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900 text-gray-200' : ''}`}>Loading...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto pt-6 px-4 pb-24">
        <EditTransactionModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          txData={editingTx} 
          onChange={handleEditChange} 
          onSubmit={handleEditSubmit} 
        />
        <AddTransactionModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          txData={newTransaction} 
          onChange={handleAddChange} 
          onSubmit={handleAddSubmit} 
          type={newTransaction.type} 
        />
        
        <Link to="/customers" className={`hover:underline mb-4 inline-block ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>
          &larr; Back to All Customers
        </Link>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Ledger for <span className="text-cyan-600">{customerName}</span>
          </h1>
          <button 
            onClick={generatePDF} 
            className={`font-semibold px-4 py-2 rounded shadow-sm text-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-700 hover:bg-gray-800 text-white'}`}
          >
            📄 Download PDF
          </button>
        </div>
        
        <BalanceSummary balance={ledger.balance} />
        
        <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Entries</h2>
        
        <div className="grid gap-3">
          {ledger.transactions.map(tx => (
            <div key={tx._id} className={`shadow rounded px-4 py-3 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.type === 'credit' ? 'You Got' : 'You Gave'}
                    </span>
                  </div>
                  {tx.note && <div className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tx.note}</div>}
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => openEditModal(tx)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(tx._id)} 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {ledger.transactions.length === 0 && (
            <div className={`rounded p-4 text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              No transactions found for this customer.
            </div>
          )}
        </div>

        {/* Fixed footer with "You Gave" / "You Got" buttons */}
        <div className={`fixed bottom-0 left-0 right-0 border-t p-4 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto grid grid-cols-2 gap-4">
            <button 
              onClick={() => openAddModal('debit')} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
            >
              You Gave ₹
            </button>
            <button 
              onClick={() => openAddModal('credit')} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg"
            >
              You Got ₹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}