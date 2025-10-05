import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const nav = useNavigate();

  const validateIdentifier = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!value) {
      return "Email or phone number is required";
    }
    
    if (value.includes('@')) {
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    } else {
      if (!phoneRegex.test(value)) {
        return "Phone number must be 10 digits";
      }
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateName = (value) => {
    if (!value || value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm({ ...form, [name]: value });
    
    // Clear validation error for this field when user types
    setValidationErrors({ ...validationErrors, [name]: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields
    const nameError = validateName(form.name);
    const identifierError = validateIdentifier(form.identifier);
    const passwordError = validatePassword(form.password);
    
    if (nameError || identifierError || passwordError) {
      setValidationErrors({
        name: nameError,
        identifier: identifierError,
        password: passwordError
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      localStorage.setItem("tb_user", JSON.stringify({ token: data.token, user: data.user }));
      nav("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* LOGO CHANGED HERE */}
      <div className="mx-auto h-16 w-16 flex items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl text-white font-bold text-3xl shadow-md">
  TB
</div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1">
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  required 
                  value={form.name} 
                  onChange={handleInputChange} 
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Email or Phone Number</label>
              <div className="mt-1">
                <input 
                  id="identifier" 
                  name="identifier" 
                  type="text" 
                  required 
                  value={form.identifier} 
                  onChange={handleInputChange} 
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm ${
                    validationErrors.identifier ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email or 10-digit phone"
                />
                {validationErrors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.identifier}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={form.password} 
                  onChange={handleInputChange} 
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm ${
                    validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
                </div>
              </div>
            )}

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}