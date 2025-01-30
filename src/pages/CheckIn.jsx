import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card  from '../components/common/Card';
import  Input  from '../components/common/Input';
import  Select  from '../components/common/Select';
import  Button  from '../components/common/Button';
import { visitorsDump, departmentsDump } from '../data/visitorsDump';

// Floating Circle Component
const FloatingCircle = ({ size, initialX, initialY, duration }) => (
  <motion.div
    className={`absolute rounded-full bg-gray-100/50`}
    style={{
      width: size,
      height: size,
    }}
    initial={{ x: initialX, y: initialY }}
    animate={{
      x: [initialX - 20, initialX + 20, initialX],
      y: [initialY - 20, initialY + 20, initialY],
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
  const [formData, setFormData] = useState({
    fullName: '',
    identityNumber: '',
    gender: '',
    phoneNumber: '',
    otherNumber: '',
    department: '',
    purpose: '',
    items: '',
    photoUrl: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
    timeOfArrival: new Date().toLocaleTimeString('en-US', { hour12: false })
  });
  const [isEditable, setIsEditable] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(false);

    if (searchInput === '#00') {
      setIsEditable(true);
      setFormData({
        ...formData,
        fullName: '',
        identityNumber: '',
        gender: '',
        phoneNumber: '',
        otherNumber: '',
        photoUrl: 'IMG_0676.JPG'
      });
      return;
    }

    const visitor = visitorsDump.find(v => 
      v.identityNumber === searchInput || 
      v.phoneNumber === searchInput
    );
    
    if (visitor) {
      setFormData({
        ...formData,
        ...visitor,
        department: '',
        purpose: '',
        items: ''
      });
      setErrors({});
    } else {
      setErrors({ search: 'No visitor found' });
      setIsSearching(true);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <AnimatePresence>
        {isSearching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            {/* Animated Background Circles */}
            <FloatingCircle size={160} initialX={-100} initialY={-50} duration={8} />
            <FloatingCircle size={120} initialX={400} initialY={200} duration={10} />
            <FloatingCircle size={100} initialX={-50} initialY={150} duration={7} />
            <FloatingCircle size={140} initialX={350} initialY={-100} duration={9} />

            <div className="w-full max-w-md relative z-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
                  Visitor Check-In
                </h2>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        className="w-full h-[50px] pl-5 pr-12 rounded-full border-2 border-gray-200 
                                 focus:outline-none focus:border-black transition-colors
                                 text-gray-800 text-lg bg-white"
                        placeholder="Enter ID or Phone Number"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        autoFocus
                      />
                      <div className="absolute right-4 flex items-center">
                        <svg 
                          className="w-5 h-5 text-gray-400" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      </div>
                    </div>
                    {errors.search && (
                      <p className="mt-2 text-sm text-red-500 text-center">{errors.search}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[50px] bg-black text-white rounded-full text-lg 
                             hover:bg-gray-800 transition-colors duration-200
                             flex items-center justify-center space-x-2"
                  >
                    <span>Search</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          // Your existing visitor form code here
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            <Card>
              <form className="space-y-6">
                {/* Existing form fields */}
                {/* ... */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsSearching(true);
                      setSearchInput('');
                    }}
                  >
                    New Search
                  </Button>
                  <Button type="submit">
                    Complete Check-In
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckIn;
