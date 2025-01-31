import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/layout/Sidebar';

const CheckOut = () => {
  const [visitors, setVisitors] = useState([]);
  const [limit, setLimit] = useState(10);
  const [selectedVisitors, setSelectedVisitors] = useState({});

  // Simulated data - Replace with your actual API call
  useEffect(() => {
    const fetchVisitors = async () => {
      // This would be your API call
      const mockData = [
        {
          id: 1,
          name: "John Doe",
          id_passport: "1234567890",
          phone_number: "250700000000",
          visitor_card: "VISITOR-001",
          entry_timestamp: "2024-03-20 09:00:00",
          exit_timestamp: null,
          department: "IT"
        },
        // Add more mock data as needed
      ];
      setVisitors(mockData);
    };

    fetchVisitors();
  }, [limit]);

  const handleCheckout = async (visitorId) => {
    if (!selectedVisitors[visitorId]) {
      alert('Please select the visitor to check out.');
      return;
    }

    try {
      // This would be your API call
      // await checkoutVisitor(visitorId);
      
      // Remove the visitor from the list
      setVisitors(prev => prev.filter(v => v.id !== visitorId));
      // Clear the selection
      setSelectedVisitors(prev => {
        const newSelection = { ...prev };
        delete newSelection[visitorId];
        return newSelection;
      });
    } catch (error) {
      console.error('Error checking out visitor:', error);
      alert('Failed to check out visitor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="pl-64">
        <div className="p-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
            {/* Table Header */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Active Visitors
                </h2>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={10}>Show 10</option>
                  <option value={30}>Show 30</option>
                  <option value={50}>Show 50</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="w-12 p-4 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-black focus:ring-black
                                   dark:border-gray-600 dark:bg-gray-700"
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Full Name</th>
                      <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">ID/Passport</th>
                      <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Phone Number</th>
                      <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Visitor Card</th>
                      <th className="p-4 text-left font-medium text-gray-600 dark:text-gray-200">Entry Time</th>
                      <th className="p-4 text-center font-medium text-gray-600 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor) => (
                      <motion.tr
                        key={visitor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={!!selectedVisitors[visitor.id]}
                            onChange={(e) => setSelectedVisitors(prev => ({
                              ...prev,
                              [visitor.id]: e.target.checked
                            }))}
                            className="rounded border-gray-300 text-black focus:ring-black
                                     dark:border-gray-600 dark:bg-gray-700"
                          />
                        </td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.name}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.id_passport}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.phone_number}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.visitor_card}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{visitor.entry_timestamp}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleCheckout(visitor.id)}
                            disabled={!selectedVisitors[visitor.id]}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              selectedVisitors[visitor.id]
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                            }`}
                          >
                            Exit
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckOut;
