import { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';

// Simple StatCard Component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeVisitors: 0,
    scheduledVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchSecurityDashboardData = async () => {
    try {
      const { count: activeVisitors } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .is('check_out_time', null);

      const { count: scheduledVisits } = await supabase
        .from('scheduled_visitors')
        .select('*', { count: 'exact' })
        .gte('visit_end_date', new Date().toISOString());

      setStats({
        activeVisitors: activeVisitors || 0,
        scheduledVisits: scheduledVisits || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Welcome to Visitor Management Platform!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Active Visitors"
                value={stats.activeVisitors}
                icon={<Users size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Scheduled Visits"
                value={stats.scheduledVisits}
                icon={<Calendar size={24} className="text-gray-600 dark:text-gray-300" />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
