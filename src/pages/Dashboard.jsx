
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useDarkMode } from "../context/DarkModeContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const [allTimeTransactions, setAllTimeTransactions] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllTimeData();
    loadChartData();
  }, []);

  async function loadAllTimeData() {
    try {
      const [txRes, custRes] = await Promise.all([
        API.get("/transactions"),
        API.get("/customers")
      ]);
      setAllTimeTransactions(txRes.data);
      setTotalCustomers(custRes.data.length);
    } catch (err) { 
      console.error(err); 
    }
  }

  async function loadChartData() {
    try {
      const res = await API.get("/transactions/monthly-summary");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      const labels = res.data.map(d => `${monthNames[d._id.month - 1]} ${d._id.year}`);
      const creditData = res.data.map(d => d.totalCredit);
      const debitData = res.data.map(d => d.totalDebit);

      setChartData({
        labels,
        datasets: [
          { 
            label: 'Credit (You Got)', 
            data: creditData, 
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderRadius: 8,
            borderWidth: 0,
          },
          { 
            label: 'Debit (You Gave)', 
            data: debitData, 
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderRadius: 8,
            borderWidth: 0,
          },
        ],
      });
      setLoading(false);
    } catch (err) { 
      console.error("Failed to load chart data", err);
      setLoading(false);
    }
  }

  const totalCredit = allTimeTransactions.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const totalDebit = allTimeTransactions.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalCredit - totalDebit;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: isDarkMode ? '#e5e7eb' : '#374151',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          },
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30'}`}>
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 transition-colors ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-gray-800 to-cyan-600 bg-clip-text text-transparent'}`}>
            Dashboard
          </h1>
          <p className={`text-sm sm:text-base transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overview of your financial transactions</p>
        </div>

        {/* All-Time Totals Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Credit Card */}
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
                <div className={`text-sm mb-1 font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Credit</div>
                <div className="text-3xl font-bold text-green-600 mb-1">₹{totalCredit.toLocaleString('en-IN')}</div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Money received</div>
              </div>
            </div>

            {/* Total Debit Card */}
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
                <div className={`text-sm mb-1 font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Debit</div>
                <div className="text-3xl font-bold text-red-600 mb-1">₹{totalDebit.toLocaleString('en-IN')}</div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Money given</div>
              </div>
            </div>

            {/* Net Balance Card */}
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
                <div className={`text-sm mb-1 font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Balance</div>
                <div className={`text-3xl font-bold mb-1 ${balance >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                  ₹{Math.abs(balance).toLocaleString('en-IN')}
                </div>
                <div className={`text-xs transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {balance >= 0 ? 'You will receive' : 'You need to pay'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className={`rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-1 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Last 6 Months Summary</h2>
              <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Credit vs Debit comparison</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
                <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading chart data...</p>
              </div>
            ) : chartData ? (
              <div className="w-full h-[300px] sm:h-[400px]">
                <Bar options={chartOptions} data={chartData} />
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-12 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className={`w-16 h-16 mb-4 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p className="text-sm">No chart data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className={`text-xs mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transactions</div>
            <div className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{allTimeTransactions.length}</div>
          </div>
          <div className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className={`text-xs mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Credit</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{allTimeTransactions.filter(t => t.type === "credit").length > 0 
                ? Math.round(totalCredit / allTimeTransactions.filter(t => t.type === "credit").length).toLocaleString('en-IN')
                : 0}
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className={`text-xs mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Debit</div>
            <div className="text-2xl font-bold text-red-600">
              ₹{allTimeTransactions.filter(t => t.type === "debit").length > 0
                ? Math.round(totalDebit / allTimeTransactions.filter(t => t.type === "debit").length).toLocaleString('en-IN')
                : 0}
            </div>
          </div>
          <div className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            <div className={`text-xs mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Customers</div>
            <div className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {totalCustomers}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}