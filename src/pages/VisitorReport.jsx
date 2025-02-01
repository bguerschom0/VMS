import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { supabase } from '../config/supabase';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [visitorStats, setVisitorStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Get date range
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

      // Fetch visitor statistics
      const { data: visitors } = await supabase
        .from('visitors')
        .select('*')
        .gte('entry_timestamp', startDate.toISOString());

      if (!visitors) return;

      // Process visitor data for different charts
      processVisitorData(visitors);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processVisitorData = (visitors) => {
    // Daily/Monthly visitor count
    const visitorCount = visitors.reduce((acc, visitor) => {
      const date = new Date(visitor.entry_timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    setVisitorStats(Object.entries(visitorCount).map(([date, count]) => ({
      date,
      count
    })));

    // Department distribution
    const deptCount = visitors.reduce((acc, visitor) => {
      acc[visitor.department] = (acc[visitor.department] || 0) + 1;
      return acc;
    }, {});

    setDepartmentStats(Object.entries(deptCount).map(([name, value]) => ({
      name,
      value
    })));

    // Time of day statistics
    const timeCount = visitors.reduce((acc, visitor) => {
      const hour = new Date(visitor.entry_timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    setTimeStats(Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      visits: timeCount[i] || 0
    })));
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Visitor Statistics
    const visitorWS = XLSX.utils.json_to_sheet(visitorStats);
    XLSX.utils.book_append_sheet(wb, visitorWS, "Visitor Statistics");

    // Department Statistics
    const deptWS = XLSX.utils.json_to_sheet(departmentStats);
    XLSX.utils.book_append_sheet(wb, deptWS, "Department Statistics");

    // Time Statistics
    const timeWS = XLSX.utils.json_to_sheet(timeStats);
    XLSX.utils.book_append_sheet(wb, timeWS, "Time Statistics");

    XLSX.writeFile(wb, `visitor_report_${dateRange}.xlsx`);
  };

  const exportToPDF = async () => {
    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`visitor_report_${dateRange}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Visitor Reports
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>

              {/* Export Buttons */}
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 space-x-2 bg-green-600 text-white rounded-lg
                         hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet size={18} />
                <span>Export Excel</span>
              </button>

              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 space-x-2 bg-red-600 text-white rounded-lg
                         hover:bg-red-700 transition-colors"
              >
                <FileText size={18} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div ref={chartRef} className="space-y-8">
            {/* Visitor Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Visitor Trends
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitorStats}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" tick={{ fill: '#666' }} />
                    <YAxis tick={{ fill: '#666' }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#000000" 
                      strokeWidth={2} 
                      dot={{ fill: '#000000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department and Time Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Visits by Time of Day
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeStats}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fill: '#666' }}
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis tick={{ fill: '#666' }} width={30} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        labelFormatter={(hour) => `${hour}:00`}
                      />
                      <Bar 
                        dataKey="visits" 
                        fill="#000000" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
