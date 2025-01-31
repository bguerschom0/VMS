import { motion } from 'framer-motion';

const VisitorDetailsModal = ({ isOpen, visitor, onClose }) => {
  if (!isOpen || !visitor) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Visitor Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.full_name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID/Passport</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.identity_number}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.phone_number}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.department}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Visit Purpose</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.purpose}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Items Brought</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{visitor.items || 'None'}</p>
            </div>
            
            {visitor.laptop_brand && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Laptop Details</h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  Brand: {visitor.laptop_brand}<br />
                  Serial: {visitor.laptop_serial}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Visit Timeline</h3>
              <div className="mt-1 space-y-1">
                <p className="text-gray-900 dark:text-white">
                  Entered: {new Date(visitor.entry_timestamp).toLocaleString()}
                </p>
                <p className="text-gray-900 dark:text-white">
                  {visitor.exit_timestamp ? 
                    `Exited: ${new Date(visitor.exit_timestamp).toLocaleString()}` : 
                    'Status: Still Active'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                     transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisitorDetailsModal;
