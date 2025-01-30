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
    photoUrl: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
    timeOfArrival: new Date().toLocaleTimeString('en-US', { hour12: false })
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    navigate('/check-in');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <Card>
        {/* Your existing form fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form fields here */}
          </div>
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
  );
};

export default VisitorForm;
