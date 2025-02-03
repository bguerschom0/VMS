// src/components/visitor/VisitorForm.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorService } from '../../services/visitorService';
import { DEPARTMENTS, ERROR_MESSAGES } from '../../utils/constants';
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

const VisitorForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [availableCards, setAvailableCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [hasLaptop, setHasLaptop] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
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

  // Load visitor data and handle #00 case
  useEffect(() => {
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
      setIsEditable(false); // Disable editing for existing visitor
    } else if (isPassport) {
      // Enable all fields for passport case (#00)
      setIsEditable(true);
    }
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
        setAlertMessage('Failed to load available cards');
        setShowAlert(true);
      }
    };

    loadAvailableCards();
  }, [selectedDepartment]);

  // Handle department change
  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setFormData(prev => ({ ...prev, department: deptId, visitorCard: '' }));
    setErrors(prev => ({ ...prev, department: '', visitorCard: '' }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!formData.phoneNumber.match(/^250\d{9}$/)) {
      newErrors.phoneNumber = 'Phone number must start with 250 followed by 9 digits';
    }

    // For passport users (#00), require identity number
    if (location.state?.isPassport && !formData.identityNumber) {
      newErrors.identityNumber = 'ID or Passport number is required';
    }

    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.visitorCard) newErrors.visitorCard = 'Visitor card is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';

    // Laptop validation
    if (hasLaptop) {
      if (!formData.laptopBrand) newErrors.laptopBrand = 'Laptop brand is required';
      if (!formData.laptopSerial) newErrors.laptopSerial = 'Serial number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlertMessage('Please fill in all required fields');
      setShowAlert(true);
      return;
    }

    if (!user?.username) {
      setAlertMessage('User session expired. Please log in again.');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      await visitorService.checkInVisitor({
        ...formData,
        isPassport: location.state?.isPassport || false
      }, user.username);
      
      navigate('/check-in', { 
        state: { 
          success: true,
          message: 'Visitor checked in successfully'
        }
      });
    } catch (error) {
      console.error('Check-in error:', error);
      setAlertMessage(error.message || 'An error occurred during check-in');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with phone number formatting
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    
    // Only allow digits
    value = value.replace(/\D/g, '');
    
    // Ensure starts with 250
    if (!value.startsWith('250') && value.length > 0) {
      value = '250' + value;
    }
    
    // Limit to 12 digits (250 + 9 digits)
    value = value.slice(0, 12);
    
    setFormData(prev => ({ ...prev, phoneNumber: value }));
    
    // Clear phone number error if valid
    if (value.match(/^250\d{9}$/)) {
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Alert Popup */}
        <AnimatePresence>
          {showAlert && (
            <Alert 
              message={alertMessage} 
              onClose={() => setShowAlert(false)}
            />
          )}
        </AnimatePresence>

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
                                ${!isEditable ? 'bg-gray-50' : 'bg-white'}
                                focus:ring-2 focus:ring-black focus:border-transparent`}
                      readOnly={!isEditable}
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
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith('250')) {
                          setFormData({ 
                            ...formData, 
                            phoneNumber: value.slice(0, 12) 
                          });
                        } else {
                          setFormData({ ...formData, phoneNumber: value });
                        }
                      }}
                      maxLength={12}
                      className={`w-full px-4 py-2 rounded-lg border 
                                ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'}
                                ${!isEditable ? 'bg-gray-50' : 'bg-white'}
                                focus:ring-2 focus:ring-black focus:border-transparent`}
                      readOnly={!isEditable}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border border-gray-200 
                              ${!isEditable ? 'bg-gray-50' : 'bg-white'}
                              focus:ring-2 focus:ring-black focus:border-transparent`}
                    disabled={!isEditable}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  <input
                    type="text"
                    placeholder={isEditable ? "Insert ID or Passport" : "ID Number (Auto-filled)"}
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    maxLength={16}
                    className={`w-full px-4 py-2 rounded-lg border border-gray-200 
                              ${!isEditable ? 'bg-gray-50' : 'bg-white'}
                              text-gray-700 focus:ring-2 focus:ring-black focus:border-transparent`}
                    readOnly={!isEditable}
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
      </div>
    </div>
  );
  };

export default VisitorForm;
