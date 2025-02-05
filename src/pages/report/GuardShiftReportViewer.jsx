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
  Search,
  User, 
  Clock, 
  UserCircle,
  Power,
  Droplets,
  Building2,
  Car,
  X,
  Camera,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import * as XLSX from 'xlsx';

const GuardShiftReportViewer = () => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    startDate: getFiveDaysAgo(),
    endDate: new Date().toISOString().split('T')[0],
    shiftType: '',
    hasIncident: '',
    guard: '',
    location: ''
  });

  // Stats State
  const [stats, setStats] = useState({
    totalReports: 0,
    incidentReports: 0,
    uniqueGuards: 0,
    totalLocations: 0
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Helper Functions
  function getFiveDaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    return date.toISOString().split('T')[0];
  }

  // Helper Components
  const StatusCard = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center p-4 rounded-lg border ${color} bg-opacity-10`}>
      <div className={`p-3 rounded-full ${color} bg-opacity-20 mr-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  const DetailSection = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const StatusBadge = ({ status, type }) => {
    let color;
    switch (status?.toLowerCase()) {
      case 'normal':
        color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
        break;
      case 'issues':
      case 'issues present':
        color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
        break;
      case 'offline':
      case 'outage':
      case 'not working':
        color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
        break;
      default:
        color = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }

    return (
      <div className="flex items-center space-x-2">
        {type === 'electricity' && <Power className="w-4 h-4" />}
        {type === 'water' && <Droplets className="w-4 h-4" />}
        {type === 'office' && <Building2 className="w-4 h-4" />}
        {type === 'parking' && <Car className="w-4 h-4" />}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {status || 'N/A'}
        </span>
      </div>
    );
  };

  // Function to check if a report has issues
  const hasIssues = (report) => {
    return report.electricity_status === 'issues' ||
           report.water_status === 'issues' ||
           report.office_status === 'issues' ||
           report.parking_status === 'issues' ||
           Object.values(report.remote_locations_checked || {})
             .some(loc => loc.status === 'issues');
  };

  // Load initial data
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters, currentPage, reportsPerPage]);

const UtilityStatus = ({ icon: Icon, label, status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'normal':
          return 'border-green-200 bg-green-50 text-green-700';
        case 'issues':
          return 'border-yellow-200 bg-yellow-50 text-yellow-700';
        default:
          return 'border-red-200 bg-red-50 text-red-700';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="font-semibold capitalize">{status}</p>
          </div>
        </div>
      </div>
    );
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full my-8">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold">Detailed Security Report</h2>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(report.created_at).toLocaleString()}
                </span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {report.submitted_by}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportSingleReport(report)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Export Report"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusCard
                icon={Clock}
                label="Shift Type"
                value={report.shift_type.toUpperCase()}
                color="text-blue-600"
              />
              <StatusCard
                icon={Users}
                label="Team Size"
                value={report.team_members?.length || 0}
                color="text-green-600"
              />
              <StatusCard
                icon={AlertCircle}
                label="Status"
                value={report.incident_occurred ? 'Incident Reported' : 'Normal'}
                color={report.incident_occurred ? 'text-red-600' : 'text-green-600'}
              />
            </div>

            {/* CCTV Monitoring Status */}
            <DetailSection title="CCTV Monitoring Status" icon={Camera}>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Main Location:</span>
                  <span className="text-blue-600 font-medium">
                    {report.monitoring_location}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(report.remote_locations_checked || {}).map(([location, data]) => (
                    <div key={location} 
                         className={`p-4 rounded-lg border ${
                           data.status === 'normal' ? 'border-green-200 bg-green-50' :
                           data.status === 'issues' ? 'border-yellow-200 bg-yellow-50' :
                           'border-red-200 bg-red-50'
                         }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{location}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          data.status === 'normal' ? 'bg-green-100 text-green-800' :
                          data.status === 'issues' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.status}
                        </span>
                      </div>
                      {data.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          Note: {data.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DetailSection>

            {/* Utility Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetailSection title="Utility Status" icon={Activity}>
                <div className="grid grid-cols-2 gap-4">
                  <UtilityStatus
                    icon={Power}
                    label="Electricity"
                    status={report.electricity_status}
                  />
                  <UtilityStatus
                    icon={Droplets}
                    label="Water"
                    status={report.water_status}
                  />
                  <UtilityStatus
                    icon={Building2}
                    label="Office"
                    status={report.office_status}
                  />
                  <UtilityStatus
                    icon={Car}
                    label="Parking"
                    status={report.parking_status}
                  />
                </div>
              </DetailSection>

              {/* Team Members Section */}
              <DetailSection title="Security Team" icon={Users}>
                <div className="space-y-3">
                  {report.team_members?.map((member, index) => (
                    <div key={index} 
                         className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserCircle className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">ID: {member.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            </div>

            {/* Incident Report Section */}
            {report.incident_occurred && (
              <DetailSection 
                title="Incident Report" 
                icon={AlertTriangle}
                className="border-red-200 bg-red-50"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Incident Type</p>
                      <p className="font-semibold text-red-600">
                        {report.incident_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time of Incident</p>
                      <p className="font-semibold">
                        {report.incident_time ? 
                          new Date(report.incident_time).toLocaleString() : 
                          'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="mt-1 p-3 bg-white rounded-lg border border-red-200">
                      {report.incident_description}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Action Taken</p>
                    <p className="mt-1 p-3 bg-white rounded-lg border border-red-200">
                      {report.action_taken}
                    </p>
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Notes Section */}
            {report.notes && (
              <DetailSection title="Additional Notes" icon={FileText}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{report.notes}</p>
                </div>
              </DetailSection>
            )}
          </div>
        </div>
      </div>
    );
  };

const fetchReports = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        const startDateTime = new Date(`${filters.startDate}T00:00:00`);
        query = query.gte('created_at', startDateTime.toISOString());
      }
      
      if (filters.endDate) {
        const endDateTime = new Date(`${filters.endDate}T23:59:59`);
        query = query.lte('created_at', endDateTime.toISOString());
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

      if (filters.location) {
        query = query.eq('monitoring_location', filters.location);
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
      // Get total reports count
      const { count: totalCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' });

      // Get incident reports count
      const { count: incidentCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .eq('incident_occurred', true);

      // Get unique guards and locations
      const { data: reportsData } = await supabase
        .from('guard_shift_reports')
        .select('submitted_by, monitoring_location');

      const uniqueGuards = new Set(reportsData?.map(r => r.submitted_by));
      const uniqueLocations = new Set(reportsData?.map(r => r.monitoring_location));

      setStats({
        totalReports: totalCount || 0,
        incidentReports: incidentCount || 0,
        uniqueGuards: uniqueGuards.size,
        totalLocations: uniqueLocations.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const exportSingleReport = (report) => {
    try {
      const reportData = {
        'Report Date': new Date(report.created_at).toLocaleString(),
        'Submitted By': report.submitted_by,
        'Shift Type': report.shift_type,
        'Monitoring Location': report.monitoring_location,
        'Team Members': report.team_members?.map(m => `${m.name} (${m.id})`).join(', '),
        'Electricity Status': report.electricity_status,
        'Water Status': report.water_status,
        'Office Status': report.office_status,
        'Parking Status': report.parking_status,
        'CCTV Status': Object.entries(report.remote_locations_checked || {})
          .map(([loc, data]) => `${loc}: ${data.status}${data.notes ? ` - ${data.notes}` : ''}`)
          .join('\n'),
        'Incident Occurred': report.incident_occurred ? 'Yes' : 'No',
        'Incident Type': report.incident_type || 'N/A',
        'Incident Time': report.incident_time ? new Date(report.incident_time).toLocaleString() : 'N/A',
        'Incident Description': report.incident_description || 'N/A',
        'Action Taken': report.action_taken || 'N/A',
        'Additional Notes': report.notes || 'N/A'
      };

      const ws = XLSX.utils.json_to_sheet([reportData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(reportData).map(key => 
        Math.min(maxWidth, Math.max(key.length, String(reportData[key]).length))
      );
      ws['!cols'] = colWidths.map(w => ({ wch: w }));

      XLSX.writeFile(wb, `security_report_${report.submitted_by}_${new Date(report.created_at).toLocaleDateString()}.xlsx`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const exportAllReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports without pagination
      const { data, error } = await supabase
        .from('guard_shift_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(report => ({
          'Date': new Date(report.created_at).toLocaleDateString(),
          'Time': new Date(report.created_at).toLocaleTimeString(),
          'Guard': report.submitted_by,
          'Shift Type': report.shift_type,
          'Location': report.monitoring_location,
          'Team Size': report.team_members?.length || 0,
          'Electricity': report.electricity_status,
          'Water': report.water_status,
          'Office': report.office_status,
          'Parking': report.parking_status,
          'Has Incident': report.incident_occurred ? 'Yes' : 'No',
          'Incident Type': report.incident_type || '',
          'Action Taken': report.action_taken || '',
          'Notes': report.notes || ''
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Security Reports');

        // Adjust column widths
        const cols = Object.keys(formattedData[0]).map(() => ({ wch: 20 }));
        ws['!cols'] = cols;

        XLSX.writeFile(wb, `security_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
    } finally {
      setLoading(false);
    }
  };

// Add useEffect for initial data loading
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters, currentPage, reportsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Security Reports Dashboard
            </h1>
            <p className="mt-1 text-gray-500">
              Monitor and manage security shift reports
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportAllReports}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Export All</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 
                       dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatusCard
            icon={FileText}
            label="Total Reports"
            value={stats.totalReports}
            color="text-blue-600"
          />
          <StatusCard
            icon={AlertCircle}
            label="Incidents"
            value={stats.incidentReports}
            color="text-red-600"
          />
          <StatusCard
            icon={Users}
            label="Active Guards"
            value={stats.uniqueGuards}
            color="text-green-600"
          />
          <StatusCard
            icon={Building2}
            label="Locations"
            value={stats.totalLocations}
            color="text-purple-600"
          />
        </div>

        {/* Filters Section */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
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
                  startDate: getFiveDaysAgo(),
                  endDate: new Date().toISOString().split('T')[0],
                  shiftType: '',
                  hasIncident: '',
                  guard: '',
                  location: ''
                })}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900
                         dark:hover:text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Reports Table */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-700">
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
            Date & Time
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
            Guard
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
            Location
          </th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
            Status
          </th>
          <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <tr>
            <td colSpan="5" className="px-4 py-8 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              </div>
            </td>
          </tr>
        ) : reports.length === 0 ? (
          <tr>
            <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No reports found
            </td>
          </tr>
        ) : (
          reports.map((report) => (
            <tr 
              key={report.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Date & Time Column */}
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </td>

              {/* Guard Column */}
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <UserCircle className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {report.submitted_by}
                  </span>
                </div>
              </td>

              {/* Location Column */}
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {report.monitoring_location}
                  </span>
                </div>
              </td>

              {/* Status Column */}
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {report.incident_occurred ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                   bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Incident Reported
                    </span>
                  ) : hasIssues(report) ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                   bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Issues Present
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                   bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Normal
                    </span>
                  )}
                </div>
              </td>

              {/* Actions Column */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowReportModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm
                             bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => exportSingleReport(report)}
                    className="inline-flex items-center p-1 rounded-lg text-gray-500 
                             hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Export Report"
                  >
                    <Download className="w-4 h-4" />
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
            <div className="flex items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * reportsPerPage) + 1} to {Math.min(currentPage * reportsPerPage, totalCount)} of {totalCount} reports
              </span>
              <select
                value={reportsPerPage}
                onChange={(e) => {
                  setCurrentPage(1);
                  setReportsPerPage(Number(e.target.value));
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
                className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
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
        />
      )}
    </div>
  );
};

// Helper function to check if a report has any issues
const hasIssues = (report) => {
  return report.electricity_status === 'issues' ||
         report.water_status === 'issues' ||
         report.office_status === 'issues' ||
         report.parking_status === 'issues' ||
         Object.values(report.remote_locations_checked || {})
           .some(loc => loc.status === 'issues');
};

export default GuardShiftReportViewer;
