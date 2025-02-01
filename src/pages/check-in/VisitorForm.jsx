import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { departmentsDump } from '../../data/visitorsDump';
import Sidebar from '../../components/layout/Sidebar';

const VisitorForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [hasLaptop, setHasLaptop] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    identityNumber: '',
    gender: '',
    phoneNumber: '',
    otherNumber: '', // This will be user input only
    // Additional Information
    department: '',
    purpose: '',
    items: '',
    photoUrl: '',
    // Laptop Information
    laptopBrand: '',
    laptopSerial: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const { visitor, isNewVisitor } = location.state || {};
    
    if (!visitor && !isNewVisitor) {
      navigate('/check-in');
      return;
    }

    if (visitor) {
      // Don't include otherNumber from visitor data
      const { otherNumber, ...visitorData } = visitor;
      setFormData(prev => ({
        ...prev,
        ...visitorData,
        otherNumber: '', // Keep this empty for user input
      }));
      
      if (visitor.laptopBrand || visitor.laptopSerial) {
        setHasLaptop(true);
      }
    }
  }, [location.state, navigate]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.identityNumber) newErrors.identityNumber = 'ID number is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    
    // Validate laptop fields if laptop checkbox is checked
    if (hasLaptop) {
      if (!formData.laptopBrand) newErrors.laptopBrand = 'Laptop brand is required';
      if (!formData.laptopSerial) newErrors.laptopSerial = 'Serial number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const submitData = {
        ...formData,
        dateOfVisit: new Date().toISOString(),
        timeOfArrival: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        hasLaptop
      };

      // Here you would send data to your backend
      console.log('Form submitted:', submitData);
      navigate('/check-in');
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      
      <main>
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {isDark ? '🌞' : '🌙'}
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-8">
              {/* Left Column - Photo and Personal Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 space-y-6"
              >
                {/* Photo Section */}
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden mb-6">
                    <img
                      src={formData.photoUrl}
                      alt="Visitor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Personal Information Fields */}
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} 
                               focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white
                               dark:border-gray-600 transition-colors duration-200`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Identity Number"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.identityNumber ? 'border-red-500' : 'border-gray-200'}
                               focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white
                               dark:border-gray-600 transition-colors duration-200`}
                    />
                    {errors.identityNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.identityNumber}</p>
                    )}
                  </div>

                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <div>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'}
                               focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white
                               dark:border-gray-600 transition-colors duration-200`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Other Contact Number (Optional)"
                    value={formData.otherNumber}
                    onChange={(e) => setFormData({ ...formData, otherNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors duration-200"
                  />
                </div>
              </motion.div>

              {/* Right Column - Additional Information */}
              <div className="flex-1 space-y-6">
                {/* Department Selection */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Department/Office</h3>
                  <div>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-200'}
                               focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white
                               dark:border-gray-600 transition-colors duration-200`}
                    >
                      <option value="">Select Department</option>
                      {departmentsDump.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                    )}
                  </div>
                </motion.div>

                {/* Purpose of Visit */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Purpose of Visit</h3>
                  <div>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.purpose ? 'border-red-500' : 'border-gray-200'}
                               focus:outline-none focus:ring-2 focus:ring-black min-h-[100px] dark:bg-gray-700 dark:text-white
                               dark:border-gray-600 transition-colors duration-200`}
                      placeholder="Enter purpose of visit"
                    />
                    {errors.purpose && (
                      <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
                    )}
                  </div>
                </motion.div>

                {/* Items and Laptop Section */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Items Brought</h3>
                  <textarea
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px] mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors duration-200"
                    placeholder="List any items brought"
                  />

                  {/* Laptop Checkbox */}
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLaptop}
                        onChange={(e) => {
                          setHasLaptop(e.target.checked);
                          if (!e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              laptopBrand: '',
                              laptopSerial: ''
                            }));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black
                                 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-200">Visitor has a laptop</span>
                    </label>
                  </div>

                  {/* Conditional Laptop Fields */}
                  <AnimatePresence>
                    {hasLaptop && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 mt-4"
                      >
                        <div>
                          <input
                            type="text"
                            placeholder="Laptop Brand"
                            value={formData.laptopBrand}
                            onChange={(e) => setFormData({ ...formData, laptopBrand: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.laptopBrand ? 'border-red-500' : 'border-gray-200'}
                                     focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white
                                     dark:border-gray-600 transition-colors duration-200`}
                          />
                          {errors.laptopBrand && (
                            <p className="mt-1 text-sm text-red-500">{errors.laptopBrand}</p>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Laptop Serial Number"
                            value={formData.laptopSerial}
                            onChange={(e) => setFormData({ ...formData, laptopSerial: e.target.value })}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.laptopSerial ? 'border-red-500' : 'border-gray-200'}
                                     focus:outline-none focus:ring-2 focus:ring-black
                                     dark:bg-gray-700 dark:text-white
                                     dark:border-gray-600 transition-colors duration-200`}
                          />
                          {errors.laptopSerial && (
                            <p className="mt-1 text-sm text-red-500">{errors.laptopSerial}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-4 px-4">
              <button
                type="button"
                onClick={() => navigate('/check-in')}
                className="px-6 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 
                         dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white 
                         transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 
                         transition-colors duration-200"
              >
                Complete Check-In
              </button>
            </div>

            {errors.submit && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-red-500"
              >
                {errors.submit}
              </motion.p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default VisitorForm;
