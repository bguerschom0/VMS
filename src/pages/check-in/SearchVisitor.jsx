// src/components/visitor/SearchVisitor.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorService } from '../../services/visitorService';
import { useAuth } from '../../hooks/useAuth';

// Alert/Popup Component
const Alert = ({ message, type = 'error', onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`}
  >
    <div className="flex items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:text-gray-200">
        ✕
      </button>
    </div>
  </motion.div>
);

const SearchVisitor = () => {
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Handle phone number starting with 250
    if (value.startsWith('250')) {
      value = value.slice(0, 12);
    } 
    // Handle ID number
    else if (value !== '#00') {
      value = value.slice(0, 16); 
    }

    setSearchInput(value);
    setError('');
    setShowAlert(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchInput.trim() === '') {
      setError('Please enter an ID or Phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Handle passport case
      if (searchInput === '#00') {
        navigate('/check-in/form', { 
          state: { 
            isPassport: true,
            isNewVisitor: true 
          } 
        });
        return;
      }

      // Validate input format
      if (searchInput.startsWith('250') && searchInput.length !== 12) {
        throw new Error('Phone number must be 12 digits including 250');
      } else if (!searchInput.startsWith('250') && searchInput.length !== 16) {
        throw new Error('ID number must be 16 digits');
      }

      const result = await visitorService.searchVisitor(searchInput);
      
      if (!result || result.error) {
        const message = searchInput.startsWith('250') 
          ? 'Phone number not found'
          : 'ID number not found';
        setShowAlert(true);
        setError(message);
        return;
      }

      navigate('/check-in/form', { 
        state: { 
          visitor: result,
          isNewVisitor: !result.isExisting 
        } 
      });

    } catch (error) {
      setError(error.message);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnimatePresence>
        {showAlert && error && (
          <Alert 
            message={error} 
            onClose={() => setShowAlert(false)}
          />
        )}
      </AnimatePresence>

      <main>
      <div className="h-screen flex items-center justify-center">
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
          maxLength={16}
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
          disabled={isLoading}
          autoFocus
        />
         <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                           w-8 h-8 flex items-center justify-center
                           text-gray-400 dark:text-gray-500 
                           hover:text-black dark:hover:text-white 
                           transition-colors"
                >
                  {isLoading ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
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
                  )}
                </button>

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

              {/* Search Guide */}
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
    </div>
  );
};

export default SearchVisitor;
