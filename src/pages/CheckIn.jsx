import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { visitorsDump, departmentsDump } from '../data/visitorsDump';

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
    timeOfArrival: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
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
        photoUrl: '/api/placeholder/150/150'
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
      setErrors({ search: 'No visitor found with this ID/Phone' });
      setIsSearching(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic here
    console.log('Check-in:', formData);
    // Reset form
    setSearchInput('');
    setFormData({
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
    setIsSearching(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Visitor Check-In
        </h1>

        {isSearching ? (
          <div className="max-w-md mx-auto">
            <Card>
              <form onSubmit={handleSearch} className="space-y-4">
                <Input
                  placeholder="Enter National ID or Phone Number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  error={errors.search}
                  className="text-center text-lg"
                  autoFocus
                />
                <Button type="submit" fullWidth>
                  Search
                </Button>
              </form>
            </Card>
          </div>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo Section */}
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={formData.photoUrl || '/api/placeholder/150/150'}
                    alt="Visitor"
                    className="w-40 h-40 rounded-lg shadow-lg object-cover"
                  />
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
                </div>

                {/* Form Fields */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditable}
                  />
                  
                  <Input
                    label="Identity Number"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    disabled={!isEditable}
                  />
                  
                  <Select
                    label="Gender"
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!isEditable}
                  />
                  
                  <Input
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                  
                  <Input
                    label="Other Phone Number"
                    value={formData.otherNumber}
                    onChange={(e) => setFormData({ ...formData, otherNumber: e.target.value })}
                  />
                  
                  <Select
                    label="Department"
                    options={departmentsDump.map(dept => ({
                      value: dept.id,
                      label: dept.name
                    }))}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Purpose of Visit"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    />
                  </div>
                  
                  <Input
                    label="Date of Visit"
                    type="date"
                    value={formData.dateOfVisit}
                    onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                  />
                  
                  <Input
                    label="Time of Arrival"
                    type="time"
                    value={formData.timeOfArrival}
                    onChange={(e) => setFormData({ ...formData, timeOfArrival: e.target.value })}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Items Brought"
                      value={formData.items}
                      onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                      placeholder="Enter items separated by commas"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">
                  Complete Check-In
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
