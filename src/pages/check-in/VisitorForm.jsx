import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { departmentsDump } from '../../data/visitorsDump';
import Sidebar from '../../components/layout/Sidebar';

const VisitorForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    identityNumber: '',
    gender: '',
    phoneNumber: '',
    otherNumber: '',
    // Additional Information
    department: '',
    purpose: '',
    items: '',
    equipment: '',
    photoUrl: 'IMG_0676.JPG'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const { visitor, isNewVisitor } = location.state || {};
    
    if (!visitor && !isNewVisitor) {
      navigate('/check-in');
      return;
    }

    if (visitor) {
      setFormData(prev => ({
        ...prev,
        ...visitor
      }));
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.identityNumber) newErrors.identityNumber = 'Required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Required';
    if (!formData.department) newErrors.department = 'Required';
    if (!formData.purpose) newErrors.purpose = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Add timestamp here before sending to backend
      const submitData = {
        ...formData,
        dateOfVisit: new Date().toISOString(),
        timeOfArrival: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };

      // Here you would send data to your backend
      console.log('Form submitted:', submitData);
      navigate('/check-in');
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="pl-64">
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
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} 
                             focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white`}
                  />
                  
                  <input
                    type="text"
                    placeholder="Identity Number"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.identityNumber ? 'border-red-500' : 'border-gray-200'}
                             focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white`}
                  />
                  
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'}
                             focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white`}
                  />
                  
                  <input
                    type="text"
                    placeholder="Other Contact Number"
                    value={formData.otherNumber}
                    onChange={(e) => setFormData({ ...formData, otherNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             dark:bg-gray-700 dark:text-white"
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
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-200'}
                             focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white`}
                  >
                    <option value="">Select Department</option>
                    {departmentsDump.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </motion.div>

                {/* Purpose of Visit */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Purpose of Visit</h3>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.purpose ? 'border-red-500' : 'border-gray-200'}
                             focus:outline-none focus:ring-2 focus:ring-black min-h-[100px] dark:bg-gray-700 dark:text-white`}
                    placeholder="Enter purpose of visit"
                  />
                </motion.div>

                {/* Items and Equipment */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Items & Equipment</h3>
                  <textarea
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px] mb-4 dark:bg-gray-700 dark:text-white"
                    placeholder="List any items brought"
                  />
                  <div className="space-y-4">
                    <h4 className="font-medium dark:text-white">Equipment Details</h4>
                    <textarea
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black
                               min-h-[100px] dark:bg-gray-700 dark:text-white"
                      placeholder="Enter equipment details (e.g., laptop serial number)"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/check-in')}
                className="px-6 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 
                         dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Complete Check-In
              </button>
            </div>

            {errors.submit && (
              <p className="mt-4 text-center text-red-500">{errors.submit}</p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default VisitorForm;
