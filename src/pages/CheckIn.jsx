import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { visitorsDump, departmentsDump } from '../data/visitorsDump';

const CheckIn = () => {
  const [searchInput, setSearchInput] = useState('');
  const [visitorData, setVisitorData] = useState(null);
  const [formData, setFormData] = useState({
    department: '',
    purpose: ''
  });
  const [errors, setErrors] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    // Search in dump by either phone or ID
    const visitor = visitorsDump.find(v => 
      v.phoneNumber === searchInput || 
      v.identityNumber === searchInput
    );
    
    if (visitor) {
      setVisitorData(visitor);
      setErrors({});
    } else {
      setVisitorData(null);
      setErrors({ search: 'No visitor found with this ID/Phone' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!visitorData) return;
    if (!formData.department) {
      setErrors({ department: 'Please select a department' });
      return;
    }
    if (!formData.purpose) {
      setErrors({ purpose: 'Please enter purpose of visit' });
      return;
    }

    // Here you would typically save to your database
    console.log('Check-in:', { ...visitorData, ...formData });
    // Reset form
    setSearchInput('');
    setVisitorData(null);
    setFormData({ department: '', purpose: '' });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Visitor Check-In</h1>

      {/* Search Card */}
      <div className="max-w-md mx-auto mb-6">
        <Card>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              placeholder="Enter National ID or Phone Number"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              error={errors.search}
              className="text-center"
            />
            <Button type="submit" fullWidth>
              Search
            </Button>
          </form>
        </Card>
      </div>

      {/* Visitor Information Card */}
      {visitorData && (
        <Card className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Column */}
            <div className="flex flex-col items-center justify-start">
              <img
                src={visitorData.photoUrl}
                alt="Visitor"
                className="w-40 h-40 rounded-lg object-cover mb-4"
              />
              <h3 className="text-lg font-semibold">
                {visitorData.firstName} {visitorData.lastName}
              </h3>
            </div>

            {/* Details Column */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Identity Type</label>
                <p className="mt-1">{visitorData.identityType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Identity Number</label>
                <p className="mt-1">{visitorData.identityNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                <p className="mt-1">{visitorData.fatherName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                <p className="mt-1">{visitorData.motherName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1">{visitorData.gender}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="mt-1">{visitorData.phoneNumber}</p>
              </div>

              {/* Manual Input Fields */}
              <div className="col-span-2">
                <Select
                  label="Department"
                  options={departmentsDump.map(dept => ({
                    value: dept.id,
                    label: dept.name
                  }))}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  error={errors.department}
                />
              </div>
              
              <div className="col-span-2">
                <Input
                  label="Purpose of Visit"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  error={errors.purpose}
                />
              </div>

              <div className="col-span-2">
                <Button onClick={handleSubmit} fullWidth>
                  Complete Check-In
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CheckIn;
