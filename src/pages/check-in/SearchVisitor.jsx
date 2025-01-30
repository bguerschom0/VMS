import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorsDump } from '../../data/visitorsDump';

const formatInput = (input) => {
  // Remove any non-numeric characters
  const numericOnly = input.replace(/\D/g, '');
  
  // Check if it looks like an ID (12-13 digits)
  if (numericOnly.length >= 12) {
    // Format as ID: 1234-5678-9012
    return numericOnly.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  
  // Format as phone number: 0712-345-678
  return numericOnly.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
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
    <div className="min-h-[calc(100vh-theme(space.16))] bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Animated background circles */}
      <FloatingCircle size={160} initialX={-100} initialY={-50} duration={8} />
      <FloatingCircle size={120} initialX={400} initialY={200} duration={10} />
      <FloatingCircle size={100} initialX={-50} initialY={150} duration={7} />
      <FloatingCircle size={140} initialX={350} initialY={-100} duration={9} />

      {/* Search Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          className="relative z-10 w-full max-w-xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <form onSubmit={handleSearch} className="relative group">
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
              placeholder="Enter ID (12-13 digits) or Phone (10 digits)"
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

            {/* Format Guide */}
            <motion.div
              className="absolute bottom-0 translate-y-full mt-8 text-center w-full text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="mt-4">Format examples:</p>
              <p>ID: 1234-5678-9012</p>
              <p>Phone: 0712-345-678</p>
              <p>Quick entry: #00</p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchVisitor;
