import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Shield, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { StatCard } from '../../components/StatCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeGuards: 0,
    incidentReports: 0,
    openAlerts: 0,
    performance: 0
  });
  const [guardActivity, setGuardActivity] = useState([]);
  const [shiftDistribution, setShiftDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisorDashboardData();
  }, []);

  const fetchSupervisorDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch active guards count
      const { count: activeGuards } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'security-guard')
        .eq('status', 'active');

      // Fetch incident reports
      const { count: incidentReports } = await supabase
        .from('incident_reports')
        .select('*', { count: 'exact' })
        .eq('status', 'open');

      // Fetch open alerts
      const { count: openAlerts } = await supabase
        .from('alerts')
        .select('*', { count: 'exact' })
        .eq('status', 'open');

      // Fetch guard activity
      const { data: activityData } = await supabase
        .from('guard_activity')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      // Fetch shift distribution
      const { data: shiftData } = await supabase
        .from('guard_shifts')
        .select('shift_type');

      // Process shift distribution data
      const shiftCounts = shiftData.reduce((acc, { shift_type }) => {
        acc[shift_type] = (acc[shift_type] || 0) + 1;
        return acc;
      }, {});

      const shiftStatsArray = Object.entries(shiftCounts).map(([name, value]) => ({
        name,
        value
      }));

      setGuardActivity(activityData || []);
      setShiftDistribution(shiftStatsArray);
      setStats({
        activeGuards,
        incidentReports,
        openAlerts,
        performance: 92 // Example static value
      });

    } catch (error) {
      console.error('Error fetching supervisor dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
                Welcome, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Security team overview and management
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Guards"
                value={stats.activeGuards}
                icon={<Shield size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Incident Reports"
                value={stats.incidentReports}
                icon={<AlertTriangle size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Open Alerts"
                value={stats.openAlerts}
                icon={<Activity size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Team Performance"
                value={`${stats.performance}%`}
                icon={<Users size={24} className="text-gray-600 dark:text-gray-300" />}
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shift Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Shift Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shiftDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {shiftDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Guard Activity Log */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Recent Guard Activity
                </h3>
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Guard
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {guardActivity.map((activity, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {activity.guard_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.activity_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
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

export default SupervisorDashboard;
