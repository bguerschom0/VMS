import { useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
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
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

    const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array', dateNF: 'yyyy-mm-dd' });
          
          // Get first worksheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
          });

          // Validate required fields
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
      const { data, error } = await supabase
        .from('visitors')
        .insert(
          previewData.map(row => ({
            full_name: row['Full Name'],
            identity_number: row['ID/Passport Number'],
            phone_number: row['Phone Number'],
            department: row['Department'],
            purpose: row['Purpose of Visit'],
            visit_start_date: row['Visit Start Date'],
            visit_end_date: row['Visit End Date'],
            items: row['Items/Equipment'] || null,
            laptop_brand: row['Laptop Brand'] || null,
            laptop_serial: row['Laptop Serial'] || null,
            is_scheduled: true,
            status: 'pending'
          }))
        );

      if (error) throw error;
      
      setSuccess('Visitors successfully uploaded!');
      setPreviewData([]);
      setFileName('');
    } catch (error) {
      setError('Error uploading visitors: ' + error.message);
    } finally {
      setLoading(false);
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
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(template, ws, 'Template');
    XLSX.writeFile(template, 'visitor_upload_template.xlsx');
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="pl-64">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Bulk Visitor Upload
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
          </div>

          <input
            type="file"
            id="file-upload"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Preview Section */}
                      {previewData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Preview ({previewData.length} records)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Row</th>
                        <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Full Name</th>
                        <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">ID/Passport</th>
                        <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Department</th>
                        <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-t border-gray-100 dark:border-gray-700 ${
                            !row.isValid ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        >
                          <td className="p-4 text-gray-800 dark:text-gray-200">{row.rowNumber}</td>
                          <td className="p-4 text-gray-800 dark:text-gray-200">{row['Full Name']}</td>
                          <td className="p-4 text-gray-800 dark:text-gray-200">{row['ID/Passport Number']}</td>
                          <td className="p-4 text-gray-800 dark:text-gray-200">{row['Department']}</td>
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

                                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || previewData.some(row => !row.isValid)}
                    className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors duration-200"
                  >
                    {loading ? 'Uploading...' : 'Upload Visitors'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BulkVisitorUpload;
