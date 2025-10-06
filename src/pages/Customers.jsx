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