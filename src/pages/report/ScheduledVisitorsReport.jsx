// src/pages/reports/VisitorsReport.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ScheduledVisitorsReport = () => {
  const [visitorsData, setVisitorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [departmentStats, setDepartmentStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { data: visitors } = await supabase
        .from('scheduled_visitors')
        .select('*')
        .gte('visit_start_date', startDate.toISOString());

      if (visitors) {
        processData(visitors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (visitors) => {
    // Process department statistics
    const deptCount = visitors.reduce((acc, visitor) => {
      acc[visitor.department] = (acc[visitor.department] || 0) + 1;
      return acc;
    }, {});

    setDepartmentStats(
      Object.entries(deptCount).map(([name, value]) => ({
        name,
        value
      }))
    );

    // Process daily statistics
    const dailyVisits = visitors.reduce((acc, visitor) => {
      const date = new Date(visitor.visit_start_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    setVisitorsData(
      Object.entries(dailyVisits).map(([date, count]) => ({
        date,
        visits: count
      }))
    );
  };

  const exportData = (format) => {
    const exportData = visitorsData.map(item => ({
      Date: item.date,
      'Number of Visits': item.visits
    }));

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Visitor Statistics');
      XLSX.writeFile(wb, `visitor_statistics_${dateRange}.xlsx`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visitors Report
          </h1>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>

            <button
              onClick={() => exportData('excel')}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800
                       transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visits Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Visits Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledVisitorsReport;
