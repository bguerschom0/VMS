import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import Sidebar from '../../components/layout/Sidebar';

const UploadCard = ({ title, icon, description, onClick, buttonText }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 cursor-pointer
             hover:shadow-2xl transition-all duration-300"
    onClick={onClick}
  >
    <div className="flex flex-col items-center text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
      >
        {icon}
      </motion.div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 max-w-sm">
        {description}
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800
                 transition-colors duration-200 font-medium"
      >
        {buttonText}
      </motion.button>
    </div>
  </motion.div>
);

const BulkVisitorUpload = () => {
  const { user } = useAuth();
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const clearData = () => {
    setPreviewData([]);
    setFileName('');
    setError('');
    setSuccess('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setError('');
    setSuccess('');

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
          setError('Error reading Excel file. Please ensure it follows the template format.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setError('Error processing file');
    }
  };

const handleSubmit = async () => {
  if (!previewData.length) {
    setError('Please upload a file first');
    return;
  }

  const invalidRows = previewData.filter(row => !row.isValid);
  if (invalidRows.length > 0) {
    setError(`Please fix errors in rows: ${invalidRows.map(row => row.rowNumber).join(', ')}`);
    return;
  }

  setLoading(true);
  try {
    // Get current session using getSession
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user?.id) {
      throw new Error('Please sign in to upload visitors');
    }

    const userId = session.user.id;

    const visitorsToInsert = previewData.map(row => ({
      full_name: row['Full Name'],
      identity_number: row['ID/Passport Number'],
      phone_number: row['Phone Number'],
      department: row['Department'],
      purpose: row['Purpose of Visit'],
      visit_start_date: new Date(row['Visit Start Date']).toISOString(),
      visit_end_date: new Date(row['Visit End Date']).toISOString(),
      items: row['Items/Equipment'] || null,
      laptop_brand: row['Laptop Brand'] || null,
      laptop_serial: row['Laptop Serial'] || null,
      status: 'pending',
      created_by: user?.username,
      notes: null,
      arrival_time: null,
      departure_time: null
    }));

    const { data, error } = await supabase
      .from('scheduled_visitors')
      .insert(visitorsToInsert)
      .select();

    if (error) {
      console.error('Detailed error:', error);
      throw error;
    }
    
    setSuccess(`Successfully uploaded ${previewData.length} visitor${previewData.length > 1 ? 's' : ''}!`);
    clearData();
  } catch (error) {
    console.error('Full error object:', error);
    setError('Error uploading visitors: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        <div className="p-8">

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

          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
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
          </AnimatePresence>

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
                      onClick={handleSubmit}
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
        </div>
    </div>
  );
};

export default BulkVisitorUpload;
