import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  Shield, 
  Building2,
  Power,
  Droplets,
  Car,
  Bell,
  FileClock
} from 'lucide-react';

// Remote locations to monitor
const REMOTE_LOCATIONS = [
  { id: 'loc1', name: 'Head Quaters - Nyarutarama' },
  { id: 'loc2', name: 'Remera Innovation HUB - Remera' },
  { id: 'loc3', name: 'Kigali - Service Centers' },
  { id: 'loc4', name: 'Eastern - Service Centers' },
  { id: 'loc5', name: 'Gahengeri - Switch' },
  { id: 'loc6', name: 'Norther - Service Centers' },
  { id: 'loc7', name: 'Gicumbi - Switch' },
  { id: 'loc8', name: 'Southern - Service Centers' },
  { id: 'loc9', name: 'Nyanza - Switch' },
  { id: 'loc10', name: 'Western - Service Centers' },
  { id: 'loc11', name: 'Karongi - Switch' },
 
];


const GuardShiftReport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Shift Information
    shiftType: '',
    shiftStartTime: '',
    shiftEndTime: '',
    
    // Main Premises Security
    premisesSecure: true,
    gatesLocked: true,
    cctvFunctional: true,
    
    // Remote CCTV Monitoring
    remoteLocationsChecked: REMOTE_LOCATIONS.reduce((acc, loc) => ({
      ...acc,
      [loc.id]: { checked: false, status: 'normal', notes: '' }
    }), {}),
    remoteCctvIssues: '',

    // Utility Status
    electricityStatus: 'normal',
    waterSupplyStatus: 'normal',
    generatorStatus: 'normal',
    upsStatus: 'normal',

    // Security Equipment
    securityEquipment: {
      cameras: 'functional',
      alarms: 'functional',
      motionSensors: 'functional',
      accessControls: 'functional',
      walkieTalkies: 'functional',
      emergencyPhones: 'functional'
    },

    // Incident Details
    incidentOccurred: false,
    incidentType: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',
    actionTaken: '',

    // Additional Checks
    parkingAreaStatus: 'normal',
    exteriorLighting: 'functional',
    suspiciousActivity: false,
    suspiciousActivityDetails: '',

    // Environmental Systems
    fireExtinguishers: 'checked',
    emergencyExits: 'clear',
    hvacSystem: 'normal',

    // Notes and Handover
    generalObservations: '',
    recommendedActions: '',
    pendingTasks: '',

  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: submitError } = await supabase
        .from('security_reports')
        .insert([
          {
            ...formData,
            guard_id: user.id,
            guard_name: user.username,
            remote_locations_checked: formData.remoteLocationsChecked,
            building_areas_checked: formData.buildingAreasChecked,
            security_equipment_status: formData.securityEquipment,
            submitted_at: new Date().toISOString()
          }
        ]);

      if (submitError) throw submitError;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset form
      setFormData({
        // ... reset to initial state
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Security Shift Report
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Submit detailed report of your shift observations and any incidents
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <FileClock className="w-4 h-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shift Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Shift Information
            </h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.shiftType}
                onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="">Select Shift</option>
                <option value="day">Day Shift</option>
                <option value="night">Night Shift</option>
              </select>

              <input
                type="datetime-local"
                value={formData.shiftStartTime}
                onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                required
              />

              <input
                type="datetime-local"
                value={formData.shiftEndTime}
                onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </motion.div>

          {/* Remote CCTV Monitoring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Remote CCTV Monitoring
            </h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {REMOTE_LOCATIONS.map(location => (
                <div key={location.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.remoteLocationsChecked[location.id].checked}
                        onChange={(e) => setFormData({
                          ...formData,
                          remoteLocationsChecked: {
                            ...formData.remoteLocationsChecked,
                            [location.id]: {
                              ...formData.remoteLocationsChecked[location.id],
                              checked: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{location.name}</span>
                    </label>
                    
                    <select
                      value={formData.remoteLocationsChecked[location.id].status}
                      onChange={(e) => setFormData({
                        ...formData,
                        remoteLocationsChecked: {
                          ...formData.remoteLocationsChecked,
                          [location.id]: {
                            ...formData.remoteLocationsChecked[location.id],
                            status: e.target.value
                          }
                        }
                      })}
                      className="px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="normal">Normal</option>
                      <option value="issues">Issues</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  
                  {formData.remoteLocationsChecked[location.id].status !== 'normal' && (
                    <input
                      type="text"
                      placeholder="Enter notes about issues..."
                      value={formData.remoteLocationsChecked[location.id].notes}
                      onChange={(e) => setFormData({
                        ...formData,
                        remoteLocationsChecked: {
                          ...formData.remoteLocationsChecked,
                          [location.id]: {
                            ...formData.remoteLocationsChecked[location.id],
                            notes: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Utility Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Power className="w-5 h-5 mr-2" />
              Utility Status
            </h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Electricity Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Electricity Status
                </label>
                <select
                  value={formData.electricityStatus}
                  onChange={(e) => setFormData({ ...formData, electricityStatus: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="normal">Normal</option>
                  <option value="issues">Issues Present</option>
                  <option value="outage">Power Outage</option>
                </select>
              </div>

              {/* Water Supply */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Water Supply
                </label>
                <select
                  value={formData.waterSupplyStatus}
                  onChange={(e) => setFormData({ ...formData, waterSupplyStatus: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="normal">Normal</option>
                  <option value="issues">Issues Present</option>
                  <option value="outage">No Water Supply</option>
                </select>
              </div>

              {/* Generator Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generator Status
                </label>
                <select
                  value={formData.generatorStatus}
                  onChange={(e) => setFormData({ ...formData, generatorStatus: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="normal">Operational</option>
                  <option value="issues">Needs Maintenance</option>
                  <option value="not-working">Not Working</option>
                </select>
              </div>

              {/* UPS Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UPS Status
                </label>
                <select
                  value={formData.upsStatus}
                  onChange={(e) => setFormData({ ...formData, upsStatus: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="normal">Operational</option>
                  <option value="issues">Issues Present</option>
                  <option value="not-working">Not Working</option>
                </select>
              </div>
            </div>
          </motion.div>

            {/* Incident Reporting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Incident Report
                </h2>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.incidentOccurred}
                    onChange={(e) => setFormData({ ...formData, incidentOccurred: e.target.checked })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Incident Occurred</span>
                </label>
              </div>

              {formData.incidentOccurred && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.incidentType}
                      onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                      required={formData.incidentOccurred}
                    >
                      <option value="">Select Incident Type</option>
                      <option value="security-breach">Security Breach</option>
                      <option value="theft">Theft</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="fire">Fire</option>
                      <option value="water-damage">Water Damage</option>
                      <option value="power-issue">Power Issue</option>
                      <option value="suspicious-activity">Suspicious Activity</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      type="datetime-local"
                      value={formData.incidentTime}
                      onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                      required={formData.incidentOccurred}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Incident Location"
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required={formData.incidentOccurred}
                  />

                  <textarea
                    placeholder="Detailed description of the incident..."
                    value={formData.incidentDescription}
                    onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                    required={formData.incidentOccurred}
                  />

                  <textarea
                    placeholder="Actions taken in response..."
                    value={formData.actionTaken}
                    onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                    required={formData.incidentOccurred}
                  />
                </div>
              )}
            </motion.div>

            {/* Additional Notes and Handover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Additional Notes and Handover
              </h2>

              <div className="space-y-4">
                <textarea
                  placeholder="General observations..."
                  value={formData.generalObservations}
                  onChange={(e) => setFormData({ ...formData, generalObservations: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                           min-h-[100px]"
                />

                <textarea
                  placeholder="Pending tasks for next shift..."
                  value={formData.pendingTasks}
                  onChange={(e) => setFormData({ ...formData, pendingTasks: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                           min-h-[100px]"
                />
 
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700"
              >
                Report submitted successfully!
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
              >
                {error}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GuardShiftReport;
