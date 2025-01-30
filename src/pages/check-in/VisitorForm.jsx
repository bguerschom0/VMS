import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { departmentsDump } from '../../data/visitorsDump';

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
    photoUrl: 'IMG_0676.JPG',
    dateOfVisit: new Date().toISOString().split('T')[0],
    timeOfArrival: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
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
        ...visitor,
        dateOfVisit: new Date().toISOString().split('T')[0],
        timeOfArrival: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }));
    }
  }, [location.state, navigate]);

  const handleSubmit = (e) => {
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

    // Handle form submission
    console.log('Form submitted:', formData);
    // Here you would typically save to your database

    // Navigate back to check-in page
    navigate('/check-in');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo and Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Photo Column */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 rounded-lg overflow-hidden">
                    <img
                      src={formData.photoUrl}
                      alt="Visitor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Basic Info Columns */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <Input
                    label="Purpose of Visit"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    error={errors.purpose}
                  />

                  <Input
                    label="Items Brought"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  />

                  <Input
                    label="Date of Visit"
                    type="date"
                    value={formData.dateOfVisit}
                    onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                    readOnly
                  />

                  <Input
                    label="Time of Arrival"
                    type="time"
                    value={formData.timeOfArrival}
                    onChange={(e) => setFormData({ ...formData, timeOfArrival: e.target.value })}
                    readOnly
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/check-in')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Complete Check-In
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VisitorForm;
