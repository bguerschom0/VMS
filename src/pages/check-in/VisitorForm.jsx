import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import  Card  from '../../components/common/Card';
import  Input  from '../../components/common/Input';
import  Select  from '../../components/common/Select';
import  Button  from '../../components/common/Button';
import { departmentsDump } from '../../data/visitorsDump';


const TextArea = ({ label, value, onChange, error, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-3 py-2 rounded-lg border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400
      bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const VisitorForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    identityNumber: '',
    gender: '',
    phoneNumber: '',
    otherNumber: '',
    department: '',
    purpose: '',
    items: '',
    laptopDetails: {
      hasLaptop: false,
      brand: '',
      serialNumber: ''
    },
    photoUrl: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
    timeOfArrival: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  });
  
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const { visitor, isNewVisitor } = location.state || {};
    
    if (!visitor && !isNewVisitor) {
      navigate('/check-in');
      return;
    }

    if (visitor) {
      setFormData(prev => ({
        ...prev,
        ...visitor,
        dateOfVisit: new Date().toISOString().split('T')[0],
        timeOfArrival: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }));
      if (visitor.photoUrl) {
        setPhotoPreview(visitor.photoUrl);
      }
    }
  }, [location.state, navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Here you would typically save to your database
      console.log('Form submitted:', formData);
      navigate('/check-in');
    } catch (error) {
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    }
  };

   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Centered Photo Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Visitor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">No Photo</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-black dark:bg-gray-600 text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                </div>
              </div>

              {/* Form Fields Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                />

                <Input
                  label="Identity Number"
                  value={formData.identityNumber}
                  onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                  error={errors.identityNumber}
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  error={errors.gender}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                  ]}
                />

                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  error={errors.phoneNumber}
                />

                <Input
                  label="Other Number"
                  value={formData.otherNumber}
                  onChange={(e) => setFormData({ ...formData, otherNumber: e.target.value })}
                />

                <Select
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  error={errors.department}
                  options={departmentsDump.map(dept => ({
                    value: dept.id,
                    label: dept.name
                  }))}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Purpose of Visit"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    error={errors.purpose}
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Items Brought"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Laptop Details Section */}
                <div className="md:col-span-2 space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasLaptop"
                      checked={formData.laptopDetails.hasLaptop}
                      onChange={(e) => setFormData({
                        ...formData,
                        laptopDetails: {
                          ...formData.laptopDetails,
                          hasLaptop: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-black dark:text-gray-300 focus:ring-black dark:focus:ring-gray-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="hasLaptop" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Brought Laptop
                    </label>
                  </div>

                  {formData.laptopDetails.hasLaptop && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Laptop Brand"
                        value={formData.laptopDetails.brand}
                        onChange={(e) => setFormData({
                          ...formData,
                          laptopDetails: {
                            ...formData.laptopDetails,
                            brand: e.target.value
                          }
                        })}
                        className="bg-white dark:bg-gray-800"
                      />
                      <Input
                        label="Serial Number"
                        value={formData.laptopDetails.serialNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          laptopDetails: {
                            ...formData.laptopDetails,
                            serialNumber: e.target.value
                          }
                        })}
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  )}
                </div>

                {/* Date and Time fields */}
                <Input
                  label="Date of Visit"
                  type="date"
                  value={formData.dateOfVisit}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                />

                <Input
                  label="Time of Arrival"
                  type="time"
                  value={formData.timeOfArrival}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="text-red-500 dark:text-red-400 text-sm text-center">
                  {errors.submit}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/check-in')}
                  className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-black dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                >
                  Complete Check-In
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  
};

export default VisitorForm;
