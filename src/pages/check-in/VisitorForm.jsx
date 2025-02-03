// src/components/visitor/VisitorForm.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorService } from '../../services/visitorService';
import { DEPARTMENTS, ERROR_MESSAGES } from '../../utils/constants';

const VisitorForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [availableCards, setAvailableCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [hasLaptop, setHasLaptop] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    identityNumber: '',
    gender: '',
    phoneNumber: '',
    visitorCard: '',
    department: '',
    purpose: '',
    items: '',
    laptopBrand: '',
    laptopSerial: ''
  });
  
  const [errors, setErrors] = useState({});

  // Load visitor data and department cards
  useEffect(() => {
    const initializeForm = async () => {
      const { visitor, isPassport } = location.state || {};
      
      if (!visitor && !isPassport) {
        navigate('/check-in');
        return;
      }

      if (visitor) {
        setFormData(prev => ({
          ...prev,
          fullName: visitor.fullName || '',
          identityNumber: visitor.identityNumber || '',
          gender: visitor.gender || '',
          phoneNumber: visitor.phoneNumber || '',
        }));
        setPhotoUrl(visitor.photoUrl || null);
      }
    };

    initializeForm();
  }, [location.state, navigate]);

  // Load available cards when department changes
  useEffect(() => {
    const loadAvailableCards = async () => {
      if (!selectedDepartment) return;
      
      try {
        const cards = await visitorService.getAvailableCards(selectedDepartment);
        setAvailableCards(cards);
      } catch (error) {
        console.error('Error loading cards:', error);
        setErrors(prev => ({
          ...prev,
          visitorCard: 'Failed to load available cards'
        }));
      }
    };

    loadAvailableCards();
  }, [selectedDepartment]);

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setFormData(prev => ({ ...prev, department: deptId, visitorCard: '' }));
    setErrors(prev => ({ ...prev, department: '', visitorCard: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = ERROR_MESSAGES.REQUIRED;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = ERROR_MESSAGES.REQUIRED;
    } else if (!formData.phoneNumber.match(/^250\d{9}$/)) {
      newErrors.phoneNumber = ERROR_MESSAGES.INVALID_PHONE;
    }

    if (!formData.department) newErrors.department = ERROR_MESSAGES.REQUIRED;
    if (!formData.visitorCard) newErrors.visitorCard = ERROR_MESSAGES.REQUIRED;
    if (!formData.purpose) newErrors.purpose = ERROR_MESSAGES.REQUIRED;

    if (hasLaptop) {
      if (!formData.laptopBrand) newErrors.laptopBrand = ERROR_MESSAGES.REQUIRED;
      if (!formData.laptopSerial) newErrors.laptopSerial = ERROR_MESSAGES.REQUIRED;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const username = 'current-user'; // Replace with actual user management
      await visitorService.checkInVisitor(formData, username);
      navigate('/check-in', { state: { success: true }});
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: ERROR_MESSAGES.SERVER_ERROR }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Panel - Photo and Personal Info */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6 space-y-6"
              >
                {/* Photo Section */}
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Visitor" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-20 h-20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.fullName ? 'border-red-500' : 'border-gray-200'}
                                focus:ring-2 focus:ring-black focus:border-transparent`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Phone Number (250...)"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'}
                                focus:ring-2 focus:ring-black focus:border-transparent`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 
                             focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <input
                    type="text"
                    value={formData.identityNumber}
                    readOnly
                    placeholder="ID Number (Auto-filled)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 
                             bg-gray-50 text-gray-500"
                  />
                </div>
              </motion.div>
            </div>

            {/* Right Panel - Visit Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Department and Card Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Department & Card</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={formData.department}
                      onChange={handleDepartmentChange}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.department ? 'border-red-500' : 'border-gray-200'}
                                focus:ring-2 focus:ring-black focus:border-transparent`}
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-500">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <select
                      value={formData.visitorCard}
                      onChange={(e) => setFormData({ ...formData, visitorCard: e.target.value })}
                      disabled={!selectedDepartment || availableCards.length === 0}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.visitorCard ? 'border-red-500' : 'border-gray-200'}
                                focus:ring-2 focus:ring-black focus:border-transparent
                                disabled:bg-gray-50 disabled:text-gray-500`}
                    >
                      <option value="">Select Visitor Card</option>
                      {availableCards.map(card => (
                        <option key={card} value={card}>{card}</option>
                      ))}
                    </select>
                    {errors.visitorCard && (
                      <p className="mt-1 text-sm text-red-500">{errors.visitorCard}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Purpose and Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Visit Details</h2>
                <div className="space-y-4">
                  <div>
                    <textarea
                      placeholder="Purpose of Visit"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.purpose ? 'border-red-500' : 'border-gray-200'}
                                focus:ring-2 focus:ring-black focus:border-transparent
                                min-h-[100px]`}
                    />
                    {errors.purpose && (
                      <p className="mt-1 text-sm text-red-500">{errors.purpose}</p>
                    )}
                  </div>

                  <div>
                    <textarea
                      placeholder="Items Brought (Optional)"
                      value={formData.items}
                      onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 
                               focus:ring-2 focus:ring-black focus:border-transparent
                               min-h-[100px]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Laptop Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Laptop Information</h2>
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
                          setErrors(prev => ({
                            ...prev,
                            laptopBrand: '',
                            laptopSerial: ''
                          }));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-black 
                               focus:ring-black"
                    />
                    <span className="text-sm text-gray-600">
                      Visitor has a laptop
                    </span>
                  </label>
                </div>

                <AnimatePresence>
                  {hasLaptop && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="Laptop Brand"
                          value={formData.laptopBrand}
                          onChange={(e) => setFormData({ ...formData, laptopBrand: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border 
                                    ${errors.laptopBrand ? 'border-red-500' : 'border-gray-200'}
                                    focus:ring-2 focus:ring-black focus:border-transparent`}
                        />
                        {errors.laptopBrand && (
                          <p className="mt-1 text-sm text-red-500">{errors.laptopBrand}</p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Serial Number"
                          value={formData.laptopSerial}
                          onChange={(e) => setFormData({ ...formData, laptopSerial: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border 
                                    ${errors.laptopSerial ? 'border-red-500' : 'border-gray-200'}
                                    focus:ring-2 focus:ring-black focus:border-transparent`}
                        />
                        {errors.laptopSerial && (
                          <p className="mt-1 text-sm text-red-500">{errors.laptopSerial}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Form Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end space-x-4 pt-4"
              >
                <button
                  type="button"
                  onClick={() => navigate('/check-in')}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-lg border border-gray-200 
                           text-gray-700 hover:bg-gray-50
                           transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 rounded-lg bg-black text-white 
                           hover:bg-gray-800 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Complete Check-In</span>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </form>

        {/* Error Toast */}
        <AnimatePresence>
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              {errors.submit}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisitorForm;
