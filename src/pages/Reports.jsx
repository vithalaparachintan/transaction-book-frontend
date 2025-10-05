
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useDarkMode } from "../context/DarkModeContext";

const Spinner = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading reports...</p>
    </div>
  );
};

export default function Reports() {
  const { isDarkMode } = useDarkMode();
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      let url = "/transactions";
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const txRes = await API.get(url);
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const handleFilter = (e) => {
    e.preventDefault();
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return alert("Start date cannot be after end date.");
    }
    load();
  }
  
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    async function loadAll() {
      setLoading(true);
      try {
        const txRes = await API.get("/transactions");
        setTransactions(txRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }

  const totalCredit = transactions.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const totalDebit = transactions.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalCredit - totalDebit;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30'}`}>
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-gray-800 to-cyan-600 bg-clip-text text-transparent'}`}>
            Transaction Reports
          </h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filter and analyze your transactions</p>
        </div>

        {/* Filter Section */}
        <form onSubmit={handleFilter} className={`rounded-2xl shadow-sm p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Filter by Date Range</h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select start and end dates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="startDate" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className={`w-full border-2 rounded-xl px-4 py-2.5 transition-all outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-900' : 'border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'}`}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
              <input 
                type="date" 
                id="endDate" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className={`w-full border-2 rounded-xl px-4 py-2.5 transition-all outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-900' : 'border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200'}`}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-3">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                Apply Filter
              </button>
              <button 
                type="button" 
                onClick={clearFilters} 
                className={`font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Clear
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Total Credit */}
              <div className={`group relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Income</span>
                  </div>
                  <div className={`text-sm mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Credit</div>
                  <div className="text-3xl font-bold text-green-600 mb-1">₹{totalCredit.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-500">Money received</div>
                </div>
              </div>

              {/* Total Debit */}
              <div className={`group relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">Expense</span>
                  </div>
                  <div className={`text-sm mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Debit</div>
                  <div className="text-3xl font-bold text-red-600 mb-1">₹{totalDebit.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-500">Money given</div>
                </div>
              </div>

              {/* Net Balance */}
              <div className={`group relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden sm:col-span-2 lg:col-span-1 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${balance >= 0 ? 'bg-gradient-to-br from-blue-400/20 to-cyan-500/20' : 'bg-gradient-to-br from-orange-400/20 to-amber-500/20'} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${balance >= 0 ? 'from-blue-400 to-cyan-500' : 'from-orange-400 to-amber-500'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold ${balance >= 0 ? 'text-cyan-600 bg-cyan-50' : 'text-orange-600 bg-orange-50'} px-3 py-1 rounded-full`}>
                      {balance >= 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className={`text-sm mb-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Balance</div>
                  <div className={`text-3xl font-bold mb-1 ${balance >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                    ₹{Math.abs(balance).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {balance >= 0 ? 'You will receive' : 'You need to pay'}
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className={`rounded-2xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Transactions in Period</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {transactions.map(tx => (
                  <div key={tx._id} className={`group rounded-xl transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' : 'bg-gray-50 hover:bg-white border border-gray-100 hover:border-cyan-200'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <svg className={`w-5 h-5 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tx.type === 'credit' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                            )}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold mb-1 truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx.customerName || "Cash Transaction"}</div>
                          {tx.note && <div className={`text-sm mb-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tx.note}</div>}
                          <div className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold text-xl ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your date filter or clear filters to see all transactions</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}