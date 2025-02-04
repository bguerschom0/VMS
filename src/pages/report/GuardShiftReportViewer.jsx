import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Printer,
  Search
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import * as XLSX from 'xlsx';

const GuardShiftReportViewer = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    shiftType: '',
    hasIncident: '',
    guard: ''
  });
  const [stats, setStats] = useState({
    totalReports: 0,
    incidentReports: 0,
    uniqueGuards: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportsPerPage, setReportsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters, currentPage, reportsPerPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('submitted_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('submitted_at', filters.endDate);
      }
      if (filters.shiftType) {
        query = query.eq('shift_type', filters.shiftType);
      }
      if (filters.hasIncident !== '') {
        query = query.eq('incident_occurred', filters.hasIncident === 'true');
      }
      if (filters.guard) {
        query = query.ilike('submitted_by', `%${filters.guard}%`);
      }

      // Pagination
      const start = (currentPage - 1) * reportsPerPage;
      const end = start + reportsPerPage - 1;
      query = query.range(start, end);

      const { data, count, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setReports(data);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / reportsPerPage));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total reports
      const { count: totalCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' });

      // Get incident reports
      const { count: incidentCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .eq('incident_occurred', true);

      // Get unique guards
      const { data: guards } = await supabase
        .from('guard_shift_reports')
        .select('submitted_by')
        .distinct();

      setStats({
        totalReports: totalCount || 0,
        incidentReports: incidentCount || 0,
        uniqueGuards: (guards?.length || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports without pagination
      const { data, error } = await supabase
        .from('guard_shift_reports')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Format data for export
        const formattedData = data.map(report => ({
          'Date Submitted': new Date(report.submitted_at).toLocaleString(),
          'Guard Name': report.submitted_by,
          'Shift Type': report.shift_type,
          'Shift Start': new Date(report.shift_start_time).toLocaleString(),
          'Shift End': new Date(report.shift_end_time).toLocaleString(),
          'Monitoring Location': report.monitoring_location,
          'Incident Occurred': report.incident_occurred ? 'Yes' : 'No',
          'Incident Type': report.incident_type || 'N/A',
          'Incident Time': report.incident_time ? new Date(report.incident_time).toLocaleString() : 'N/A',
          'Incident Location': report.incident_location || 'N/A',
          'Incident Description': report.incident_description || 'N/A',
          'Action Taken': report.action_taken || 'N/A',
          'Electricity Status': report.electricity_status,
          'Water Supply Status': report.water_supply_status,
          'Generator Status': report.generator_status,
          'UPS Status': report.ups_status,
          'Team Members': JSON.stringify(report.team_members || []),
          'Notes': report.notes || 'N/A'
        }));

        // Create workbook
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Security Reports');

        // Adjust column widths
        const cols = Object.keys(formattedData[0]).map(() => ({ wch: 20 }));
        ws['!cols'] = cols;

        // Save file
        XLSX.writeFile(wb, `security_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
    } finally {
      setLoading(false);
    }
  };

      const StatCard = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-black bg-opacity-5 dark:bg-opacity-10 rounded-full">
          {icon}
        </div>
      </div>
    </div>
    );

  // Report Modal Component
  const ReportModal = ({ report, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Submitted By</h3>
              <p className="mt-1">{report.submitted_by}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Shift Type</h3>
              <p className="mt-1 capitalize">{report.shift_type}</p>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Team Members</h3>
            <div className="grid grid-cols-2 gap-4">
              {report.team_members?.map((member, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {member.name} (ID: {member.id})
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Details */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Location Monitoring</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(report.remote_locations_checked || {}).map(([location, data]) => (
                <div key={location} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium">{location}</p>
                  <p>Status: {data.status}</p>
                  {data.notes && <p className="text-sm">Notes: {data.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Utilities Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Electricity</h3>
              <p className="mt-1">{report.electricity_status}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Water Supply</h3>
              <p className="mt-1">{report.water_supply_status}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Generator</h3>
              <p className="mt-1">{report.generator_status}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">UPS</h3>
              <p className="mt-1">{report.ups_status}</p>
            </div>
          </div>

          {/* Incident Information */}
          {report.incident_occurred && (
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Incident Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Type</p>
                    <p>{report.incident_type}</p>
                  </div>
                  <div>
                    <p className="font-medium">Time</p>
                    <p>{new Date(report.incident_time).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Description</p>
                  <p className="mt-1">{report.incident_description}</p>
                </div>
                <div>
                  <p className="font-medium">Action Taken</p>
                  <p className="mt-1">{report.action_taken}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</h3>
            <p className="whitespace-pre-wrap">{report.notes || 'No additional notes'}</p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Reports
          </h1>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={18} />
              <span>Export All</span>
            </button>

            <button
              onClick={() => {
                const filters = document.querySelector('#filters');
                const element = document.createElement('button');
                filters.classList.toggle('hidden');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 
                       dark:hover:bg-gray-600 transition-colors"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon={<Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
          />
          <StatCard
            title="Incident Reports"
            value={stats.incidentReports}
            icon={<AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
          />
          <StatCard
            title="Active Guards"
            value={stats.uniqueGuards}
            icon={<CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
          />
        </div>

        {/* Filters */}
        <div id="filters" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="End Date"
            />
            <select
              value={filters.shiftType}
              onChange={(e) => setFilters({ ...filters, shiftType: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
            </select>
            <select
              value={filters.hasIncident}
              onChange={(e) => setFilters({ ...filters, hasIncident: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">All Reports</option>
              <option value="true">With Incidents</option>
              <option value="false">Without Incidents</option>
            </select>
            <input
              type="text"
              placeholder="Search by guard name..."
              value={filters.guard}
              onChange={(e) => setFilters({ ...filters, guard: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={() => setFilters({
                startDate: '',
                endDate: '',
                shiftType: '',
                hasIncident: '',
                guard: '',
                location: ''
              })}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900
                       dark:hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Guard</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Shift</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Incidents</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr 
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {report.guard_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                        {report.shift_type}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${report.incident_occurred 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          }`}
                        >
                          {report.incident_occurred ? 'Incident Reported' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {report.incident_occurred ? report.incident_type : 'None'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportModal(true);
                            }}
                            className="text-gray-600 dark:text-gray-400 hover:text-black 
                                     dark:hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          <button
                            onClick={() => exportSingleReport(report)}
                            className="text-gray-600 dark:text-gray-400 hover:text-black 
                                     dark:hover:text-white transition-colors"
                            title="Export Report"
                          >
                            <Download size={18} />
                          </button>
                          
                          <button
                            onClick={() => printReport(report)}
                            className="text-gray-600 dark:text-gray-400 hover:text-black 
                                     dark:hover:text-white transition-colors"
                            title="Print Report"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 
                        flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * reportsPerPage) + 1} to {Math.min(currentPage * reportsPerPage, totalCount)} of {totalCount} reports
              </span>
              <select
                value={reportsPerPage}
                onChange={(e) => {
                  setReportsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-200 dark:border-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Report Detail Modal */}
    {showReportModal && selectedReport && (
      <ReportModal 
        report={selectedReport}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReport(null);
        }}
        onPrint={printReport}
        onExport={exportSingleReport}
      />
    )}
  </div>
);


}

  export default GuardShiftReportViewer;                        
