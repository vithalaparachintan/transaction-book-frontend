
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

export default function Profile() {
  const { logout, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  const userName = user?.name || user?.email?.split('@')[0] || "User";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50'}`}>
      <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent' : 'bg-gradient-to-r from-gray-800 via-gray-700 to-cyan-700 bg-clip-text text-transparent'}`}>
            Profile & Settings
          </h1>
          <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account for {userName}</p>
        </div>

        {/* Main Settings Card */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          <button className={`group w-full text-left p-5 transition-all duration-200 border-b flex items-center justify-between ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold text-lg transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Change Password</h3>
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your account password</p>
              </div>
            </div>
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className={`group w-full text-left p-5 transition-all duration-200 border-b flex items-center justify-between ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-semibold text-lg transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>App Settings</h3>
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customize your preferences</p>
              </div>
            </div>
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={toggleDarkMode}
            className={`group w-full text-left p-5 transition-all duration-200 border-b flex items-center justify-between ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-gray-100'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                {isDarkMode ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`font-semibold text-lg transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dark Mode</h3>
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </p>
              </div>
            </div>
            <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </div>
          </button>

          <button 
            onClick={handleLogout}
            className={`group w-full text-left p-5 transition-all duration-200 flex items-center justify-between ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 text-lg">Logout</h3>
                <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign out of your account</p>
              </div>
            </div>
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-red-200 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-grow">
                <h3 className="font-bold text-gray-800 text-lg mb-1">Delete Account</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all data. This action cannot be undone.
                </p>
              </div>
              <button className="group bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}