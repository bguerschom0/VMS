import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import  Card  from '../components/common/Card';
import { visitorsDump, departmentsDump } from '../data/visitorsDump';

const FloatingCircle = ({ size, initialX, initialY, duration }) => (
  <motion.div
    className="absolute rounded-full bg-gray-100/50"
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

const CheckIn = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(true);
  const [formData, setFormData] = useState({/* your initial form state */});
  const inputRef = useRef(null);

  const handleSearch = (e) => {
    if (e.preventDefault) e.preventDefault();
    
    const searchValue = searchInput.trim();
    if (!searchValue) return;

    // Your existing search logic
    if (searchValue === '#00') {
      setIsEditable(true);
      setFormData({
        // ... your reset form data
      });
    } else {
      const visitor = visitorsDump.find(v => 
        v.identityNumber === searchValue || 
        v.phoneNumber === searchValue
      );
      if (visitor) {
        setFormData({
          ...formData,
          ...visitor,
          department: '',
          purpose: '',
          items: ''
        });
      }
    }
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {isSearching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            {/* Animated background circles */}
            <FloatingCircle size={160} initialX={-100} initialY={-50} duration={8} />
            <FloatingCircle size={120} initialX={400} initialY={200} duration={10} />
            <FloatingCircle size={100} initialX={-50} initialY={150} duration={7} />
            <FloatingCircle size={140} initialX={350} initialY={-100} duration={9} />

            {/* Search Input */}
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
                  className="w-full h-16 px-6 pr-12 text-lg bg-white/80 backdrop-blur-sm
                           border-2 border-gray-200 rounded-full shadow-lg
                           focus:outline-none focus:border-black transition-all duration-300
                           hover:shadow-xl"
                  placeholder="Enter ID or Phone Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  autoFocus
                />
                <motion.button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                           w-8 h-8 flex items-center justify-center
                           text-gray-400 hover:text-black transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: searchInput ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </motion.svg>
                </motion.button>

                {/* Animated bottom border */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-black"
                  initial={{ width: '0%' }}
                  animate={{ width: searchInput ? '90%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </form>
            </motion.div>
          </motion.div>
        ) : (
          // Your existing form view with animations
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            {/* Your form content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckIn;
