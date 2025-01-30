import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorsDump } from '../../data/visitorsDump';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';

const formatInput = (input) => {
  // Remove any non-numeric characters
  const numericOnly = input.replace(/\D/g, '');
  
  // Check if it looks like an ID (16 digits)
  if (numericOnly.length > 10) {
    // Limit to 16 digits for ID
    return numericOnly.slice(0, 16);
  }
  
  // For phone number (12 digits: 25 + 10 digits)
  if (numericOnly.startsWith('25')) {
    return numericOnly.slice(0, 12);
  } else if (numericOnly.length > 0) {
    // Automatically add 25 prefix if not present
    return '25' + numericOnly.slice(0, 10);
  }
  
  return numericOnly;
};

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

  // ... rest of your state and handlers ...

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <Sidebar />
      
      <main className="pl-64 pr-4"> {/* Adjust padding to account for sidebar */}
        <div className="pt-16 pb-16"> {/* Adjust padding for header and footer */}
          <div className="h-[calc(100vh-8rem)] relative flex items-center justify-center">
            {/* Search Guide Card */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 
                          bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 
                          border border-gray-200 dark:border-gray-700 
                          max-w-md w-full mx-auto">
              <h3 className="text-center font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Guide
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>• ID: requires 16 digits</p>
                <p>• Phone Number: 2507********</p>
                <p>• For Passport users: #00</p>
              </div>
            </div>

            {/* Centered container for search and floating circles */}
            <div className="relative w-full max-w-xl h-96 flex items-center justify-center">
              {/* Animated background circles */}
              <FloatingCircle size={120} initialX={-150} initialY={-50} duration={8} />
              <FloatingCircle size={100} initialX={150} initialY={-80} duration={10} />
              <FloatingCircle size={80} initialX={-100} initialY={50} duration={7} />
              <FloatingCircle size={90} initialX={120} initialY={80} duration={9} />

              {/* Search Form */}
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
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchVisitor;
