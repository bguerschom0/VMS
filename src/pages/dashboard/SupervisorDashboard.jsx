import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Shield, AlertTriangle, Activity, AlertCircle, Clock, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

// StatCard Component
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {value || 0}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeVisitors: 0,
    scheduledVisits: 0,
    checkInsToday: 0,
    checkOutsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const getTodayDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      start: today.toISOString(),
      end: tomorrow.toISOString()
    };
  };

  const fetchSecurityDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { start: todayStart, end: todayEnd } = getTodayDateRange();

      // Fetch active visitors
      const activeVisitorsResult = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .is('check_out_time', null);

      if (activeVisitorsResult.error) throw activeVisitorsResult.error;

      // Fetch scheduled visits
      const scheduledVisitsResult = await supabase
        .from('scheduled_visitors')
        .select('*', { count: 'exact' })
        .gte('visit_end_date', new Date().toISOString());

      if (scheduledVisitsResult.error) throw scheduledVisitsResult.error;

      // Fetch today's check-ins
      const checkInsTodayResult = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .gte('check_in_time', todayStart)
        .lt('check_in_time', todayEnd);

      if (checkInsTodayResult.error) throw checkInsTodayResult.error;

      // Fetch today's check-outs
      const checkOutsTodayResult = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .gte('check_out_time', todayStart)
        .lt('check_out_time', todayEnd);

      if (checkOutsTodayResult.error) throw checkOutsTodayResult.error;

      console.log('Dashboard Data Fetched:', {
        activeVisitors: activeVisitorsResult.count,
        scheduledVisits: scheduledVisitsResult.count,
        checkInsToday: checkInsTodayResult.count,
        checkOutsToday: checkOutsTodayResult.count
      });

      setStats({
        activeVisitors: activeVisitorsResult.count || 0,
        scheduledVisits: scheduledVisitsResult.count || 0,
        checkInsToday: checkInsTodayResult.count || 0,
        checkOutsToday: checkOutsTodayResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityDashboardData();
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchSecurityDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchSecurityDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
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
                {getGreeting()}, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome to your Visitor Management Dashboard
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Visitors"
                value={stats.activeVisitors}
                icon={<Users size={24} className="text-blue-600" />}
              />
              <StatCard
                title="Scheduled Visits"
                value={stats.scheduledVisits}
                icon={<Calendar size={24} className="text-green-600" />}
              />
              <StatCard
                title="Check-ins Today"
                value={stats.checkInsToday}
                icon={<CheckCircle size={24} className="text-purple-600" />}
              />
              <StatCard
                title="Check-outs Today"
                value={stats.checkOutsToday}
                icon={<Clock size={24} className="text-orange-600" />}
              />
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={fetchSecurityDashboardData}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                disabled={loading}
              >
                <Activity size={20} />
                Refresh Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
