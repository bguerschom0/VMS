import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { StatCard } from '../components/StatCard';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingVisits: 0,
    completedVisits: 0,
    totalHours: 0,
    pendingRequests: 0
  });
  const [visitHistory, setVisitHistory] = useState([]);
  const [monthlyVisits, setMonthlyVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch upcoming visits
      const { count: upcomingVisits } = await supabase
        .from('scheduled_visitors')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gt('visit_date', new Date().toISOString());

      // Fetch completed visits
      const { count: completedVisits } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .not('check_out_time', 'is', null);

      // Fetch pending requests
      const { count: pendingRequests } = await supabase
        .from('visit_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      // Fetch visit history
      const { data: historyData } = await supabase
        .from('visitors')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in_time', { ascending: false })
        .limit(10);

      // Fetch monthly visits data
      const { data: monthlyData } = await supabase
        .from('visitors')
        .select('check_in_time')
        .eq('user_id', user.id)
        .gte('check_in_time', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      // Process monthly data
      const monthlyStats = monthlyData.reduce((acc, visit) => {
        const month = new Date(visit.check_in_time).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyVisitsArray = Object.entries(monthlyStats).map(([month, visits]) => ({
        month,
        visits
      }));

      setVisitHistory(historyData || []);
      setMonthlyVisits(monthlyVisitsArray);
      setStats({
        upcomingVisits,
        completedVisits,
        totalHours: calculateTotalHours(historyData || []),
        pendingRequests
      });

    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = (visits) => {
    return visits.reduce((total, visit) => {
      if (visit.check_in_time && visit.check_out_time) {
        const duration = new Date(visit.check_out_time) - new Date(visit.check_in_time);
        return total + (duration / (1000 * 60 * 60));
      }
      return total;
    }, 0).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track your visits and requests
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Upcoming Visits"
                value={stats.upcomingVisits}
                icon={<Calendar size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Completed Visits"
                value={stats.completedVisits}
                icon={<CheckCircle size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Total Hours"
                value={`${stats.totalHours}h`}
                icon={<Clock size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                icon={<AlertCircle size={24} className="text-gray-600 dark:text-gray-300" />}
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Visits Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Monthly Visits
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyVisits}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Visit History */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Visit History
                </h3>
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {visitHistory.map((visit, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(visit.check_in_time).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visit.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visit.check_out_time ? 
                              `${((new Date(visit.check_out_time) - new Date(visit.check_in_time)) / (1000 * 60 * 60)).toFixed(1)}h` 
                              : 'In Progress'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              visit.check_out_time ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {visit.check_out_time ? 'Completed' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
