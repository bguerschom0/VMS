import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../config/supabase';

const ItemsCheckoutModal = ({ isOpen, visitor, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md m-4"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Check-out
            </h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Items Brought:</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300">
                {visitor.items || 'No items recorded'}
              </div>
              
              {visitor.hasLaptop && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Laptop Details:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300">
                    <p>Brand: {visitor.laptopBrand}</p>
                    <p>Serial: {visitor.laptopSerial}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Please ensure visitor is leaving with all recorded items.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                         hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
              >
                Confirm Check-out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CheckOut = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, [currentPage, limit, searchTerm]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('visitor_logs')
        .select('*, visitors(*)', { count: 'exact' })
        .is('exit_timestamp', null)
        .order('entry_timestamp', { ascending: false });

      if (searchTerm) {
        query = query.or(`
          visitors.full_name.ilike.%${searchTerm}%,
          visitors.identity_number.ilike.%${searchTerm}%,
          visitors.phone_number.ilike.%${searchTerm}%,
          department.ilike.%${searchTerm}%,
          visitor_card.ilike.%${searchTerm}%
        `);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (error) throw error;

      setVisitors(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (visitor) => {
    setSelectedVisitor(visitor);
    setShowModal(true);
  };

  const confirmCheckout = async () => {
    try {
      const { error } = await supabase
        .from('visitor_logs')
        .update({ 
          exit_timestamp: new Date().toISOString(),
          exit_username: 'current_user' // Replace with actual logged-in user
        })
        .eq('id', selectedVisitor.id);

      if (error) throw error;

      setShowModal(false);
      setSelectedVisitor(null);
      fetchVisitors(); // Refresh the list
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="pl-64">
        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search by name, ID, phone, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* ... table header ... */}
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      </td>
                    </tr>
                  ) : visitors.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No active visitors found
                      </td>
                    </tr>
                  ) : (
                    visitors.map((visitor) => (
                      /* ... visitor rows ... */
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Limit Controls */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {currentPage} of {totalPages} pages
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ItemsCheckoutModal
        isOpen={showModal}
        visitor={selectedVisitor}
        onClose={() => {
          setShowModal(false);
          setSelectedVisitor(null);
        }}
        onConfirm={confirmCheckout}
      />
    </div>
  );
};

export default CheckOut;
