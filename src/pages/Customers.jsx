import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import toast from "react-hot-toast";
import { useDarkMode } from "../context/DarkModeContext";

const CustomerModal = ({ isOpen, onClose, onChange, onSubmit, customerData }) => {
  const { isDarkMode } = useDarkMode();
  const [phoneError, setPhoneError] = useState("");
  
  if (!isOpen) return null;
  const isEditMode = customerData._id;
  
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    onChange(e);
    
    if (value && !/^[0-9]{10}$/.test(value)) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if phone is empty
    if (!customerData.phone || customerData.phone.trim() === "") {
      setPhoneError("Please enter phone number");
      return;
    }
    
    // Check if phone format is valid
    if (!/^[0-9]{10}$/.test(customerData.phone)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }
    
    setPhoneError("");
    onSubmit(e);
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className={`rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
              {isEditMode ? "✎" : "+"}
            </span>
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input 
              id="name" 
              type="text" 
              name="name" 
              value={customerData.name} 
              onChange={onChange} 
              className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 transition-all outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500 focus:ring-cyan-900' : 'bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'}`}
              placeholder="Enter customer name"
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="phone" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              id="phone" 
              type="tel" 
              name="phone" 
              value={customerData.phone} 
              onChange={handlePhoneChange} 
              className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 transition-all outline-none ${phoneError ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500 focus:ring-cyan-900' : 'bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'}`}
              placeholder="Enter exactly 10-digit phone number"
              maxLength="10"
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-500">{phoneError}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className={`flex-1 font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {isEditMode ? "Save Changes" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerActionsMenu = ({ onEdit, onDelete }) => {
  const { isDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) { setIsOpen(false); } };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuRef]);
  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-32 rounded-lg shadow-xl py-1 z-50 animate-slideDown ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <button 
            onClick={() => { onEdit(); setIsOpen(false); }} 
            className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 w-full text-left transition-colors font-medium"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button 
            onClick={() => { onDelete(); setIsOpen(false); }} 
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 w-full text-left transition-colors font-medium"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const Balance = ({ amount }) => {
  const { isDarkMode } = useDarkMode();
  const isCredit = amount >= 0;
  const symbol = isCredit ? '₹' : '-₹';
  
  return (
    <div className={`px-4 py-2 rounded-xl font-bold text-lg transition-colors duration-300 ${
      isCredit 
        ? isDarkMode 
          ? 'text-green-400 bg-green-900/30 border border-green-800' 
          : 'text-green-600 bg-green-50'
        : isDarkMode 
          ? 'text-red-400 bg-red-900/30 border border-red-800' 
          : 'text-red-600 bg-red-50'
    }`}>
      {symbol}{Math.abs(amount).toLocaleString('en-IN')}
    </div>
  );
};

export default function Customers() {
  const { isDarkMode } = useDarkMode();
  const [summary, setSummary] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({ name: "", phone: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [summaryRes, cRes] = await Promise.all([ API.get("/transactions/summary"), API.get("/customers") ]);
      setSummary(summaryRes.data);
      setCustomers(cRes.data);
    } catch (error) { console.error("Failed to load data:", error); }
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const isEditMode = currentCustomer._id;
    try {
      if (isEditMode) {
        await API.put(`/customers/${currentCustomer._id}`, currentCustomer);
      } else {
        await API.post("/customers", currentCustomer);
      }
      toast.success(isEditMode ? "Customer updated!" : "Customer added!");
      setIsModalOpen(false);
      await load();
    } catch (error) {
      const message = error.response?.data?.message || "An unknown error occurred.";
      toast.error(message);
    }
  };

  const openAddModal = () => { setCurrentCustomer({ name: "", phone: "" }); setIsModalOpen(true); };
  const openEditModal = (customerToEdit) => { setCurrentCustomer(customerToEdit); setIsModalOpen(true); };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await API.delete(`/customers/${customerId}`);
        toast.success("Customer deleted!");
        await load();
      } catch (error) { toast.error("Failed to delete customer."); }
    }
  };

  const handleModalChange = (e) => { setCurrentCustomer({ ...currentCustomer, [e.target.name]: e.target.value }); };
  
  const mergedCustomers = customers.map(customer => {
    const summaryData = summary.find(s => s.customerName === customer.name);
    return {
      ...customer,
      balance: summaryData ? summaryData.balance : 0,
      lastTransactionDate: summaryData ? summaryData.lastTransactionDate : customer.createdAt
    };
  });

  const filteredCustomers = mergedCustomers.filter(cust => 
    cust.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50'}`}>
      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onChange={handleModalChange} onSubmit={handleModalSubmit} customerData={currentCustomer} />
      
      <div className="max-w-6xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-gray-800 via-gray-700 to-cyan-700 bg-clip-text text-transparent'}`}>
                Customers
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your customer relationships</p>
            </div>
            <button 
              onClick={openAddModal} 
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <svg className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search customers by name..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 transition-all outline-none shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500 focus:ring-cyan-900' : 'bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'}`}
            />
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid gap-4">
          {filteredCustomers.map(cust => (
            <div 
              key={cust._id} 
              className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative z-10 hover:z-20 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                <Link 
                  to={`/customers/${encodeURIComponent(cust.name)}`} 
                  className="flex items-center gap-4 flex-grow min-w-0"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                    {cust.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Customer Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className={`font-bold text-lg truncate group-hover:text-cyan-600 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {cust.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last entry: {new Date(cust.lastTransactionDate).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
                
                {/* Balance and Actions */}
                <div className="flex items-center gap-3 flex-shrink-0 relative">
                  <Balance amount={cust.balance} />
                  <CustomerActionsMenu 
                    onEdit={() => openEditModal(cust)} 
                    onDelete={() => handleDeleteCustomer(cust._id)} 
                  />
                </div>
              </div>
            </div>
          ))}
          
          {filteredCustomers.length === 0 && (
            <div className={`rounded-2xl p-12 text-center shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No customers found</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {query ? "Try adjusting your search" : "Get started by adding your first customer"}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}