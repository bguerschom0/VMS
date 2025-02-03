import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { DEPARTMENTS } from '../../utils/constants';

// Alert/Toast Component
const Alert = ({ message, type = 'error', onClose, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg
      ${type === 'success' 
        ? 'bg-black text-white dark:bg-white dark:text-black' 
        : 'bg-red-500 text-white'
      }
      transition-colors duration-300`}
  >
    <div className="flex items-center space-x-4">
      <span>{message}</span>
      {onConfirm && (
        <div className="flex space-x-2">
          <button 
            onClick={onConfirm} 
            className="px-3 py-1 bg-white/30 hover:bg-white/40 rounded-lg"
          >
            Confirm
          </button>
          <button 
            onClick={onClose} 
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}
      {!onConfirm && (
        <button 
          onClick={onClose} 
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg"
        >
          Close
        </button>
      )}
    </div>
  </motion.div>
);

const BulkVisitorUpload = () => {
  const { user } = useAuth();
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [alertConfirmAction, setAlertConfirmAction] = useState(null);
  
  // Manual Entry States
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualVisitor, setManualVisitor] = useState({
    fullName: '',
    identityNumber: '',
    phoneNumber: '',
    department: '',
    purpose: '',
    visitStartDate: '',
    visitEndDate: '',
    items: '',
    laptopBrand: '',
    laptopSerial: ''
  });

  // Show error alert
  const showErrorAlert = (message) => {
    setAlertMessage(message);
    setAlertType('error');
    setShowAlert(true);
    setAlertConfirmAction(null);

    // Automatically remove alert after 3 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // Show success alert
  const showSuccessAlert = (message, confirmAction = null) => {
    setAlertMessage(message);
    setAlertType('success');
    setShowAlert(true);
    setAlertConfirmAction(confirmAction);

    // Automatically remove alert after 3 seconds if no confirm action
    if (!confirmAction) {
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  // Close alert handler
  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertConfirmAction) {
      alertConfirmAction();
    }
  };

  // Download Template Function
  const downloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const templateData = [
      [
        'Full Name',
        'ID/Passport Number',
        'Phone Number',
        'Department',
        'Purpose of Visit',
        'Visit Start Date',
        'Visit End Date',
        'Items/Equipment',
        'Laptop Brand',
        'Laptop Serial'
      ],
      [
        'John Doe',
        '1234567890',
        '2507123456',
        'IT Department',
        'System Maintenance',
        '2024-02-01',
        '2024-02-28',
        'Laptop, Tools',
        'Dell',
        'DL123456'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(template, ws, 'Template');
    XLSX.writeFile(template, 'scheduled_visitors_template.xlsx');
  };

  // Clear Data Function
  const clearData = () => {
    setPreviewData([]);
    setFileName('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array', dateNF: 'yyyy-mm-dd' });
          
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });

          const validatedData = jsonData.map((row, index) => {
            const errors = [];
            
            if (!row['Full Name']) errors.push('Full Name is required');
            if (!row['ID/Passport Number']) errors.push('ID/Passport Number is required');
            if (!row['Phone Number']) errors.push('Phone Number is required');
            if (!row['Department']) errors.push('Department is required');
            if (!row['Visit Start Date']) errors.push('Visit Start Date is required');
            if (!row['Visit End Date']) errors.push('Visit End Date is required');
            
            return {
              ...row,
              rowNumber: index + 2,
              isValid: errors.length === 0,
              errors
            };
          });

          setPreviewData(validatedData);
        } catch (error) {
          showErrorAlert('Error reading Excel file. Please ensure it follows the template format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      showErrorAlert('Error processing file');
    }
  };

  // Bulk Submit Handler
  const handleBulkSubmit = async () => {
    if (!previewData.length) {
      showErrorAlert('Please upload a file first');
      return;
    }

    if (!user?.username) {
      showErrorAlert('User session expired. Please log in again.');
      return;
    }

    const invalidRows = previewData.filter(row => !row.isValid);
    if (invalidRows.length > 0) {
      showErrorAlert(`Please fix errors in rows: ${invalidRows.map(row => row.rowNumber).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const BATCH_SIZE = 50;
      for (let i = 0; i < previewData.length; i += BATCH_SIZE) {
        const batch = previewData.slice(i, i + BATCH_SIZE);
        
        const visitorsToInsert = batch.map(row => ({
          full_name: row['Full Name'],
          identity_number: row['ID/Passport Number'],
          phone_number: row['Phone Number'],
          department: row['Department'],
          purpose: row['Purpose of Visit'] || null,
          visit_start_date: new Date(row['Visit Start Date']).toISOString(),
          visit_end_date: new Date(row['Visit End Date']).toISOString(),
          items: row['Items/Equipment'] || null,
          laptop_brand: row['Laptop Brand'] || null,
          laptop_serial: row['Laptop Serial'] || null,
          status: 'pending',
          created_by: user.username,
          notes: null,
          arrival_time: null,
          departure_time: null
        }));

        const { data, error } = await supabase
          .from('scheduled_visitors')
          .insert(visitorsToInsert)
          .select();

        if (error) {
          console.error(`Batch ${i/BATCH_SIZE + 1} error:`, error);
          throw error;
        }
      }
      
      showSuccessAlert(`Successfully uploaded ${previewData.length} visitor${previewData.length > 1 ? 's' : ''}!`);
      clearData();
    } catch (error) {
      console.error('Full error object:', error);
      showErrorAlert(`Error uploading visitors: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manual Entry Input Change Handler
  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualVisitor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manual Entry Submit Handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = [
      'fullName', 'identityNumber', 'phoneNumber', 
      'department', 'purpose', 'visitStartDate', 'visitEndDate'
    ];
    
    const missingFields = requiredFields.filter(field => !manualVisitor[field]);
    
    if (missingFields.length > 0) {
      showErrorAlert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!user?.username) {
      showErrorAlert('User session expired. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_visitors')
        .insert({
          full_name: manualVisitor.fullName,
          identity_number: manualVisitor.identityNumber,
          phone_number: manualVisitor.phoneNumber,
          department: manualVisitor.department,
          purpose: manualVisitor.purpose,
          visit_start_date: new Date(manualVisitor.visitStartDate).toISOString(),
          visit_end_date: new Date(manualVisitor.visitEndDate).toISOString(),
          items: manualVisitor.items || null,
          laptop_brand: manualVisitor.laptopBrand || null,
          laptop_serial: manualVisitor.laptopSerial || null,
          status: 'pending',
          created_by: user.username,
          notes: null,
          arrival_time: null,
          departure_time: null
        })
        .select();

      if (error) throw error;

      showSuccessAlert('Visitor added successfully!');
      
      // Reset form
      setManualVisitor({
        fullName: '',
        identityNumber: '',
        phoneNumber: '',
        department: '',
        purpose: '',
        visitStartDate: '',
        visitEndDate: '',
        items: '',
        laptopBrand: '',
        laptopSerial: ''
      });
      setShowManualEntry(false);
    } catch (error) {
      console.error('Error inserting visitor:', error);
      showErrorAlert(`Error adding visitor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 relative">
      {/* Alert/Toast Popup */}
      <AnimatePresence>
        {showAlert && (
          <Alert 
            message={alertMessage} 
            type={alertType}
            onClose={handleCloseAlert}
            onConfirm={alertConfirmAction ? handleCloseAlert : null}
          />
        )}
      </AnimatePresence>

          
      {/* Bulk Upload Section */}
      <AnimatePresence mode="wait">
        {!previewData.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            <UploadCard
              title="Download Template"
              icon={
                <svg className="w-12 h-12 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              description="Download our standardized Excel template to ensure your data is formatted correctly"
              onClick={downloadTemplate}
              buttonText="Download Template"
            />

            <UploadCard
              title="Upload Excel File"
              icon={
                <svg className="w-12 h-12 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              description="Upload your completed Excel file with visitor information"
              onClick={() => document.getElementById('file-upload').click()}
              buttonText="Select File"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Manual Entry Section */}
      <div 
        onClick={() => setShowManualEntry(!showManualEntry)}
        className="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-600 dark:text-gray-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Single Visitor
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {showManualEntry ? 'Close' : 'Open'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showManualEntry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6"
          >
            <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={manualVisitor.fullName}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Identity Number</label>
                <input
                  type="text"
                  name="identityNumber"
                  value={manualVisitor.identityNumber}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter ID or Passport number"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={manualVisitor.phoneNumber}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Department</label>
                <select
                  name="department"
                  value={manualVisitor.department}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Purpose of Visit</label>
                <input
                  type="text"
                  name="purpose"
                  value={manualVisitor.purpose}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter purpose of visit"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Visit Start Date</label>
                <input
                  type="date"
                  name="visitStartDate"
                  value={manualVisitor.visitStartDate}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Visit End Date</label>
                <input
                  type="date"
                  name="visitEndDate"
                  value={manualVisitor.visitEndDate}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Items (Optional)</label>
                <input
                  type="text"
                  name="items"
                  value={manualVisitor.items}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter items"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Laptop Brand (Optional)</label>
                <input
                  type="text"
                  name="laptopBrand"
                  value={manualVisitor.laptopBrand}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter laptop brand"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700 dark:text-gray-300">Laptop Serial (Optional)</label>
                <input
                  type="text"
                  name="laptopSerial"
                  value={manualVisitor.laptopSerial}
                  onChange={handleManualInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Enter laptop serial number"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                             text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Add Visitor'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Section for Bulk Upload */}
      <AnimatePresence>
        {previewData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Preview ({previewData.length} records)
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={clearData}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkSubmit}
                  disabled={loading || previewData.some(row => !row.isValid)}
                  className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Visitors'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Row</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Full Name</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">ID/Passport</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Department</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Visit Period</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`border-t border-gray-100 dark:border-gray-700 ${
                        !row.isValid ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <td className="p-4 text-gray-800 dark:text-gray-200">{row.rowNumber}</td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">{row['Full Name']}</td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">{row['ID/Passport Number']}</td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">{row['Department']}</td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">
                        {row['Visit Start Date']} - {row['Visit End Date']}
                      </td>
                      <td className="p-4">
                        {row.isValid ? (
                          <span className="px-2 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/30 
                                       text-green-800 dark:text-green-200">
                            Valid
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-sm rounded-full bg-red-100 dark:bg-red-900/30 
                                       text-red-800 dark:text-red-200">
                            {row.errors.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-200">
                {success}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default BulkVisitorUpload;
