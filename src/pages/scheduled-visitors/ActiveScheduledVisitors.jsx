import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import Sidebar from '../../components/layout/Sidebar';

const ActiveScheduledVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchActiveVisitors();
  }, [currentPage, limit, searchTerm]);

  const fetchActiveVisitors = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      let query = supabase
        .from('scheduled_visitors')
        .select('*', { count: 'exact' })
        .gte('visit_end_date', now)
        .order('visit_start_date', { ascending: true });

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,` +
          `identity_number.ilike.%${searchTerm}%,` +
          `department.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (error) throw error;

      setVisitors(data);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrival = async (visitorId) => {
    try {
      const { error } = await supabase
        .from('scheduled_visitors')
        .update({
          status: 'arrived',
          arrival_time: new Date().toISOString()
        })
        .eq('id', visitorId);

      if (error) throw error;

      fetchActiveVisitors();
    } catch (error) {
      console.error('Error updating visitor status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      
      <main>
        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search scheduled visitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Table */}
           <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Full Name</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Identity Number</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Phone Number</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Department</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Items</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Purpose</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Visit Period</th>
                    <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Status</th>
                    <th className="p-4 text-center font-medium text-gray-600 dark:text-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      </td>
                    </tr>
                  ) : visitors.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No active scheduled visitors found
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      <motion.tr
                        key={visitor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.full_name}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.identity_number}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.phone_number}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.department}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.items}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.purpose}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">
                          {new Date(visitor.visit_start_date).toLocaleDateString()} - 
                          {new Date(visitor.visit_end_date).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm
                            ${visitor.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                              visitor.status === 'arrived' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'}`}>
                            {visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {visitor.status === 'pending' && (
                            <button
                              onClick={() => handleArrival(visitor.id)}
                              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 
                                       transition-colors duration-200"
                            >
                              Mark Arrived
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Rows per page:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {Math.ceil(totalCount / limit)}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             text-gray-700 dark:text-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / limit), prev + 1))}
                    disabled={currentPage === Math.ceil(totalCount / limit)}
                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             text-gray-700 dark:text-gray-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActiveScheduledVisitors;
