import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorsDump } from '../../data/visitorsDump';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';

const FloatingCircle = ({ size, initialX, initialY, duration }) => (
  <motion.div
    className="absolute rounded-full bg-gray-100/50 dark:bg-gray-800/50"
    style={{ width: size, height: size }}
    initial={{ x: initialX, y: initialY }}
    animate={{
      x: [initialX - 20, initialX + 20, initialX],
      y: [initialY - 20, initialY + 20, initialY],
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }}
  />
);

const SearchVisitor = () => {
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '#00') {
      setSearchInput(value);
    } else {
      setSearchInput(formatInput(value));
    }
    setError('');
  };

  const validateInput = (value) => {
    if (value === '#00') return true;
    const numericValue = value.replace(/\D/g, '');
    
    // Check for valid ID or phone number
    const isValidId = numericValue.length === 12 || numericValue.length === 13;
    const isValidPhone = numericValue.length === 10;
    
    return isValidId || isValidPhone;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = searchInput.replace(/\D/g, '');
    
    if (!validateInput(searchInput)) {
      setError('Please enter a valid ID (12-13 digits) or phone number (10 digits)');
      return;
    }

    if (searchInput === '#00') {
      navigate('/check-in/form', { state: { isNewVisitor: true } });
      return;
    }

    const visitor = visitorsDump.find(v => 
      v.identityNumber.replace(/\D/g, '') === searchValue || 
      v.phoneNumber.replace(/\D/g, '') === searchValue
    );

    if (visitor) {
      navigate('/check-in/form', { state: { visitor } });
    } else {
      setError('No visitor found with this ID/Phone');
    }
  };

 return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      
      <main className="pl-64"> {/* Left padding for sidebar */}
        <div className="h-screen flex items-center justify-center">
          {/* Centered container for search and floating circles */}
          <div className="relative w-full max-w-xl h-96 flex items-center justify-center">
            {/* Animated background circles */}
            <FloatingCircle size={120} initialX={-150} initialY={-50} duration={8} />
            <FloatingCircle size={100} initialX={150} initialY={-80} duration={10} />
            <FloatingCircle size={80} initialX={-100} initialY={50} duration={7} />
            <FloatingCircle size={90} initialX={120} initialY={80} duration={9} />

            {/* Search Form and Guide */}
            <motion.div
              className="z-10 w-full px-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full h-16 px-6 pr-12 text-lg
                           bg-white dark:bg-gray-800 
                           text-gray-900 dark:text-white
                           border-2 border-gray-200 dark:border-gray-700 
                           rounded-full shadow-lg
                           focus:outline-none focus:border-black dark:focus:border-gray-500 
                           transition-all duration-300
                           hover:shadow-xl
                           placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter ID or Phone Number"
                  value={searchInput}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  autoFocus
                />
                
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2
                           w-8 h-8 flex items-center justify-center
                           text-gray-400 dark:text-gray-500 
                           hover:text-black dark:hover:text-white 
                           transition-colors"
                >
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </motion.svg>
                </button>

                {/* Error Message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 text-red-500 dark:text-red-400 text-sm text-center w-full"
                  >
                    {error}
                  </motion.p>
                )}
              </form>

              {/* Search Guide - Now below input */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-gray-700 dark:text-gray-300 mb-2">Search Guide</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• ID: requires 16 digits</p>
                  <p>• Phone Number: 2507********</p>
                  <p>• For Passport users: #00</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-64 right-0 bg-white dark:bg-gray-900 h-8">
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          {/* Footer content if needed */}
        </div>
      </footer>
    </div>
  );
};

export default SearchVisitor;
