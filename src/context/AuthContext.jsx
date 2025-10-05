
import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/api"; 

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ token: null, user: null });

  useEffect(() => {
    // Check local storage for existing session
    const raw = localStorage.getItem("transactionbook_user");
    if (raw) {
      const data = JSON.parse(raw);
      // Set the auth state and also update the API header for subsequent requests
      setAuthState(data);
      API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await API.post("/auth/login", { identifier, password });
      
      // Store the entire response { token, user } in local storage
      localStorage.setItem("transactionbook_user", JSON.stringify(response.data));
      
      // Set the auth state for the application
      setAuthState(response.data);

      // Update the default header for all future API calls
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response; 
    } catch (err) {
      throw err; 
    }
  };

  const register = async (name, identifier, password) => {
    try {
      const response = await API.post("/auth/register", { name, identifier, password });
      
      localStorage.setItem("transactionbook_user", JSON.stringify(response.data));
      setAuthState(response.data);
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("transactionbook_user");
    setAuthState({ token: null, user: null });
    delete API.defaults.headers.common['Authorization'];
  };
  
  const value = {
    user: authState.user,
    token: authState.token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}