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
  const [dateRange, setDateRange] = useState('3months'); // Default to 3 months
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [departmentStats, setDepartmentStats] = useState([]);
  const [rawData, setRawData] = useState([]); // Store raw data for export

  useEffect(() => {
    fetchData();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let startDate = new Date();
      let query = supabase.from('scheduled_visitors').select('*');
      
      switch (dateRange) {
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          query = query.gte('visit_start_date', startDate.toISOString());
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          query = query.gte('visit_start_date', startDate.toISOString());
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          query = query.gte('visit_start_date', startDate.toISOString());
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            query = query
              .gte('visit_start_date', new Date(customStartDate).toISOString())
              .lte('visit_start_date', new Date(customEndDate).toISOString());
          }
          break;
        case 'all':
          // No date filtering for all data
          break;
      }

      const { data: visitors } = await query.order('visit_start_date', { ascending: false });

      if (visitors) {
        setRawData(visitors); // Store raw data for export
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
    if (format === 'excel') {
      // Get all columns dynamically from the first row
      const formatValue = (key, value) => {
        // Format dates if the column name contains 'date' or 'time'
        if (value && (key.toLowerCase().includes('date') || key.toLowerCase().includes('time'))) {
          return new Date(value).toLocaleString();
        }
        return value || '-';
      };

      // Transform raw data for export using all available columns
      const exportData = rawData.map(visitor => {
        const formattedRow = {};
        Object.keys(visitor).forEach(key => {
          // Convert snake_case to Title Case for headers
          const headerName = key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          formattedRow[headerName] = formatValue(key, visitor[key]);
        });
        return formattedRow;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Add some styling to the header
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = { font: { bold: true } };
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Visitor Data');
      
      // Generate filename based on date range
      let filename = 'visitor_data';
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        filename += `_${customStartDate}_to_${customEndDate}`;
      } else {
        filename += `_${dateRange}`;
      }
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visitors Report
          </h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-auto"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">One Year</option>
              <option value="all">All Data</option>
              <option value="custom">Custom Date</option>
            </select>

            {dateRange === 'custom' && (
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}

            <button
              onClick={() => exportData('excel')}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800
                       transition-colors w-full md:w-auto"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          /* Charts Grid */
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
        )}
      </div>
    </div>
  );
};

export default ScheduledVisitorsReport;
