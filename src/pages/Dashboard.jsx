import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle 
} from 'lucide-react';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon, change, changeType }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
        {icon}
      </div>
    </div>
    {change && (
      <div className="mt-4 flex items-center">
        <span className={`text-sm ${
          changeType === 'increase' ? 'text-green-500' : 'text-red-500'
        }`}>
          {changeType === 'increase' ? '↑' : '↓'} {change}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
      </div>
    )}
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisitors: 0,
    scheduledVisits: 0,
    completedVisits: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total visitors
      const { count: totalVisitors } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' });

      // Fetch active visitors
      const { count: activeVisitors } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .is('exit_timestamp', null);

      // Fetch scheduled visits
      const { count: scheduledVisits } = await supabase
        .from('scheduled_visitors')
        .select('*', { count: 'exact' })
        .gte('visit_end_date', new Date().toISOString());

      // Fetch department statistics
      const { data: deptStats } = await supabase
        .from('visitors')
        .select('department')
        .not('department', 'is', null);

      // Process department stats
      const deptCounts = deptStats.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {});

      setDepartmentStats(
        Object.entries(deptCounts).map(([name, value]) => ({
          name,
          value
        }))
      );

      // Fetch monthly statistics
      const { data: monthlyData } = await supabase
        .from('visitors')
        .select('entry_timestamp')
        .gte('entry_timestamp', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

      // Process monthly stats
      const monthlyVisits = monthlyData.reduce((acc, curr) => {
        const month = new Date(curr.entry_timestamp).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      setMonthlyStats(
        Object.entries(monthlyVisits).map(([month, visits]) => ({
          month,
          visits
        }))
      );

      setStats({
        totalVisitors,
        activeVisitors,
        scheduledVisits,
        completedVisits: totalVisitors - activeVisitors
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.username || 'User'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Here's what's happening with your visitors today
              </p>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Visitors"
              value={stats.totalVisitors}
              icon={
                <Users 
                  size={24}
                  className="text-gray-600 dark:text-gray-300" 
                />
              }
              change={12}
              changeType="increase"
            />
            <StatCard
              title="Active Visitors"
              value={stats.activeVisitors}
              icon={
                <UserCheck 
                  size={24}
                  className="text-gray-600 dark:text-gray-300" 
                />
              }
            />
            <StatCard
              title="Scheduled Visits"
              value={stats.scheduledVisits}
              icon={
                <Calendar 
                  size={24}
                  className="text-gray-600 dark:text-gray-300" 
                />
              }
              change={5}
              changeType="increase"
            />
            <StatCard
              title="Completed Visits"
              value={stats.completedVisits}
              icon={
                <CheckCircle 
                  size={24}
                  className="text-gray-600 dark:text-gray-300" 
                />
              }
            />
          </div>

{/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Monthly Visits Chart */}
  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
      Monthly Visits
    </h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="visits" fill="#000000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Department Distribution */}
  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
      Visits by Department
    </h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={departmentStats}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {departmentStats.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            {/* Add recent activity table here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
