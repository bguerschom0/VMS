import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { DEPARTMENTS } from '../../utils/constants';

// Alert Component
const Alert = ({ message, type = 'error', onClose, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg
      ${type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}
    `}
  >
    <div className="flex items-center space-x-4">
      <span>{message}</span>
      {onConfirm ? (
        <div className="flex space-x-2">
          <button onClick={onConfirm} className="px-3 py-1 bg-white/30 hover:bg-white/40 rounded-lg">
            Confirm
          </button>
          <button onClick={onClose} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={onClose} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg">
          Close
        </button>
      )}
    </div>
  </motion.div>
);

// Upload Card Component
const UploadCard = ({ title, icon, description, onClick, buttonText }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex flex-col items-center text-center space-y-4">
      {icon}
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <button
        onClick={onClick}
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const BulkVisitorUpload = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('selection'); // 'selection', 'manual', 'bulk'
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [alertConfirmAction, setAlertConfirmAction] = useState(null);
  
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

  // Clear alert timer on unmount
  useEffect(() => {
    let timer;
    if (showAlert && !alertConfirmAction) {
      timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showAlert, alertConfirmAction]);

  const showErrorAlert = (message) => {
    setAlertMessage(message);
    setAlertType('error');
    setShowAlert(true);
    setAlertConfirmAction(null);
  };

  const showSuccessAlert = (message, confirmAction = null) => {
    setAlertMessage(message);
    setAlertType('success');
    setShowAlert(true);
    setAlertConfirmAction(confirmAction);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (alertConfirmAction) {
      alertConfirmAction();
    }
  };

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

  const validateDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setActiveSection('bulk');

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
            if (!row['Visit Start Date'] || !validateDate(row['Visit Start Date'])) 
              errors.push('Valid Visit Start Date is required');
            if (!row['Visit End Date'] || !validateDate(row['Visit End Date']))
              errors.push('Valid Visit End Date is required');
            
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
          created_by: user.username
        })
        .select();

      if (error) throw error;

      showSuccessAlert('Visitor added successfully!');
      setActiveSection('selection');
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
    } catch (error) {
      showErrorAlert(`Error adding visitor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <AnimatePresence>
        {showAlert && (
          <Alert 
            message={alertMessage} 
            type={alertType}
            onClose={handleCloseAlert}
            onConfirm={alertConfirmAction}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeSection === 'selection' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-6"
          >
            <UploadCard
              title="Download Template"
              icon={
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              description="Download our Excel template"
              onClick={downloadTemplate}
              buttonText="Download Template"
            />

            <UploadCard
              title="Upload Excel File"
              icon={
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
              description="Upload your Excel file"
              onClick={() => document.getElementById('file-upload').click()}
              buttonText="Upload File"
            />

            <UploadCard
              title="Manual Entry"
              icon={
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
              description="Add a single visitor"
              onClick={() => setActiveSection('manual')}
              buttonText="Manual Entry"
            />
          </motion.div>
        )}

        {activeSection === 'manual' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6"
          >
            {/* Manual Entry Form */}
            <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-6">
              {/* Form fields here - similar to original code */}
              <button
                type="button"
                onClick={() => setActiveSection('selection')}
                className="col-span-2 px-4 py-2 bg-gray-200 rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="col-span-2 px-4 py-2 bg-black text-white rounded-lg"
              >
                {loading ? 'Submitting...' : 'Add Visitor'}
              </button>
            </form>
          </motion.div>
        )}

        {activeSection === 'bulk' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            {/* Bulk upload preview table here - similar to original code */}
            <button
              onClick={() => setActiveSection('selection')}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Back
            </button>
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
    </div>
  );
};

export default BulkVisitorUpload;
