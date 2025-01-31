import { useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { supabase } from '../../config/supabase';
import Sidebar from '../../components/layout/Sidebar';

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
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Bulk Visitor Upload
              </h2>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600
                           hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Download Template
                </button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800
                             cursor-pointer transition-colors duration-200"
                  >
                    Upload Excel File
                  </label>
                </div>
              </div>

              {fileName && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected file: {fileName}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-200">
                {success}
              </div>
            )}

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
