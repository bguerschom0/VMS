import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  // Helper function to get week dates
  const getWeekDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  // State Management
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter States with initial week dates
  const weekDates = getWeekDates();
  const [filters, setFilters] = useState({
    startDate: weekDates.startDate,
    endDate: weekDates.endDate,
    shiftType: '',
    hasIncident: '',
    guard: ''
  });

  // Stats State
  const [stats, setStats] = useState({
    totalReports: 0,
    incidentReports: 0
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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

    const Icon = type === 'electricity' ? Power :
                 type === 'water' ? Droplets :
                 type === 'office' ? Building2 :
                 type === 'parking' ? Car : null;

    return (
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {status || 'N/A'}
        </span>
      </div>
    );
  };

  // Data Fetching Functions
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
      const weekDates = getWeekDates();
      
      // Get total reports for the week
      const { count: totalCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .gte('created_at', `${weekDates.startDate}T00:00:00`)
        .lte('created_at', `${weekDates.endDate}T23:59:59`);

      // Get incident reports for the week
      const { count: incidentCount } = await supabase
        .from('guard_shift_reports')
        .select('*', { count: 'exact' })
        .eq('incident_occurred', true)
        .gte('created_at', `${weekDates.startDate}T00:00:00`)
        .lte('created_at', `${weekDates.endDate}T23:59:59`);

      setStats({
        totalReports: totalCount || 0,
        incidentReports: incidentCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Export Functions
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

const exportDetailedReport = async (report) => {
  try {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.width = '800px';
    tempContainer.style.padding = '40px'; 
    tempContainer.style.backgroundColor = 'white';
    document.body.appendChild(tempContainer);

    // Add content with proper spacing
tempContainer.innerHTML = `
  <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(75, 85, 99)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">Detailed Guard Shift Report</h1>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; color: #6b7280; font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            ${new Date(report.created_at).toLocaleString()}
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            ${report.submitted_by}
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Info Grid -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Shift Type</p>
        <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">${report.shift_type.toUpperCase()}</p>
      </div>
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Team Size</p>
        <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">${report.team_members?.length || 0} Members</p>
      </div>
      <div style="padding: 16px; border: 1px solid ${report.incident_occurred ? '#fecaca' : '#e5e7eb'}; border-radius: 8px; background: ${report.incident_occurred ? '#fef2f2' : 'white'};">
        <p style="font-size: 14px; color: ${report.incident_occurred ? '#dc2626' : '#6b7280'}; margin: 0 0 4px 0;">Status</p>
        <p style="font-size: 18px; font-weight: 600; color: ${report.incident_occurred ? '#dc2626' : '#111827'}; margin: 0;">
          ${report.incident_occurred ? 'Incident Reported' : 'Normal'}
        </p>
      </div>
    </div>

    <!-- CCTV Section -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; items-center; gap: 8px; margin-bottom: 16px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">CCTV Monitoring Status</h3>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 500; color: #6b7280;">Main Location:</span>
          <span style="font-weight: 500; color: #111827;">${report.monitoring_location}</span>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${Object.entries(report.remote_locations_checked || {}).map(([location, data]) => `
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${data.notes ? '8px' : '0'};">
              <span style="font-weight: 500; color: #111827;">${location}</span>
              <span style="padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; 
                          ${data.status === 'normal' 
                            ? 'background: #dcfce7; color: #166534;'
                            : data.status === 'issues'
                            ? 'background: #fef9c3; color: #854d0e;'
                            : 'background: #fee2e2; color: #dc2626;'
                          }">
                ${data.status}
              </span>
            </div>
            ${data.notes ? `<p style="margin: 0; font-size: 14px; color: #6b7280;">${data.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Utility Status -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; items-center; gap: 8px; margin-bottom: 16px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Utility Status</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
        ${[
          { label: 'Electricity', status: report.electricity_status, icon: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>' },
          { label: 'Water', status: report.water_status, icon: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>' },
          { label: 'Office', status: report.office_status, icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
          { label: 'Parking', status: report.parking_status, icon: '<path d="M5 17h14M5 12h14M5 7h14"/>' }
        ].map(item => `
          <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">${item.label}</p>
                <p style="font-size: 14px; font-weight: 500; color: #111827; margin: 0;">${item.status}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                ${item.icon}
              </svg>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Team Members -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; items-center; gap: 8px; margin-bottom: 16px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Security Team</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        ${(report.team_members || []).map(member => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div>
              <p style="font-weight: 500; color: #111827; margin: 0;">${member.name}</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">ID: ${member.id}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    ${report.incident_occurred ? `
      <!-- Incident Report -->
      <div style="border: 2px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 24px; background: #fef2f2;">
        <div style="display: flex; items-center; gap: 8px; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h3 style="font-size: 18px; font-weight: 600; color: #dc2626; margin: 0;">Incident Report</h3>
        </div>
        
        <div style="margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
              <p style="font-size: 14px; color: #dc2626; margin: 0 0 4px 0;">Incident Type</p>
              <p style="font-size: 18px; font-weight: 500; color: #991b1b; margin: 0;">${report.incident_type}</p>
            </div>
            <div>
              <p style="font-size: 14px; color: #dc2626; margin: 0 0 4px 0;">Time of Incident</p>
              <p style="font-size: 18px; font-weight: 500; color: #991b1b; margin: 0;">
                ${report.incident_time ? new Date(report.incident_time).toLocaleString() : 'Not specified'}
              </p>
            </div>
          </div>
        </div>
        <div>
          <p style="font-size: 14px; color: #dc2626; margin: 0 0 4px 0;">Description</p>
          <p style="padding: 16px; background: white; border: 1px solid #fecaca; border-radius: 8px; color: #111827; margin: 0;">
            ${report.incident_description}
          </p>
        </div>

        <div style="margin-top: 16px;">
          <p style="font-size: 14px; color: #dc2626; margin: 0 0 4px 0;">Action Taken</p>
          <p style="padding: 16px; background: white; border: 1px solid #fecaca; border-radius: 8px; color: #111827; margin: 0;">
            ${report.action_taken}
          </p>
        </div>
      </div>
    ` : ''}

    ${report.notes ? `
      <!-- Additional Notes -->
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <div style="display: flex; items-center; gap: 8px; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0;">Additional Notes</h3>
        </div>
        
        <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="color: #4b5563; margin: 0; white-space: pre-wrap;">${report.notes}</p>
        </div>
      </div>
    ` : ''}
  </div>
`;

    // Convert to PDF using html2canvas and jsPDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`Security_Report_${report.submitted_by}_${new Date(report.created_at).toLocaleDateString()}.pdf`);

    // Clean up
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error exporting report:', error);
  }
};

  // Load initial data
  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters, currentPage, reportsPerPage]);

  // Helper function to check if a report has any issues
  const hasIssues = (report) => {
    return report.electricity_status === 'issues' ||
           report.water_status === 'issues' ||
           report.office_status === 'issues' ||
           report.parking_status === 'issues' ||
           Object.values(report.remote_locations_checked || {})
             .some(loc => loc.status === 'issues');
  };

  // Dashboard Header Component
  const DashboardHeader = () => (
    <>
      {/* Page Title and Export Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Reports Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Monitor and manage security shift reports
          </p>
        </div>
        
        <button
          onClick={exportAllReports}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 
                   text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 
                   transition-colors"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Export All Reports</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatusCard
          icon={FileText}
          label="Total Reports (Last 7 Days)"
          value={stats.totalReports}
          color="text-blue-600 dark:text-blue-500"
        />
        <StatusCard
          icon={AlertCircle}
          label="Incidents (Last 7 Days)"
          value={stats.incidentReports}
          color="text-red-600 dark:text-red-500"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div className="mb-4 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                       dark:focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                       dark:focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shift Type
            </label>
            <select
              value={filters.shiftType}
              onChange={(e) => setFilters({ ...filters, shiftType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                       dark:focus:ring-gray-400"
            >
              <option value="">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.hasIncident}
              onChange={(e) => setFilters({ ...filters, hasIncident: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                       dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                       dark:focus:ring-gray-400"
            >
              <option value="">All Reports</option>
              <option value="true">With Incidents</option>
              <option value="false">Without Incidents</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Guard Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="     Search guard..."
                value={filters.guard}
                onChange={(e) => setFilters({ ...filters, guard: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                         dark:focus:ring-gray-400"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              startDate: getWeekDates().startDate,
              endDate: getWeekDates().endDate,
              shiftType: '',
              hasIncident: '',
              guard: ''
            })}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900
                     dark:hover:text-white transition-colors border border-gray-200 
                     dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </>
  );

  // Reports Table Component
  const ReportsTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Submitted By
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Location
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
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
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>

                  {/* Guard Column */}
                  <td className="px-2 py-4">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.submitted_by}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {report.shift_type === 'day' ? 'Day Shift' : 'Night Shift'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {report.monitoring_location}
                      </span>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-4">
                    {report.incident_occurred ? (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium 
                                     bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Incident Reported
                      </span>
                    ) : hasIssues(report) ? (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium 
                                     bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Issues Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium 
                                     bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Normal
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="px-2 py-4 text-right">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportModal(true);
                        }}
                        className="inline-flex items-center px-2 py-1.5 rounded-lg text-sm
                                 bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 
                                 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Details
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
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                     dark:focus:ring-gray-400"
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
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     text-gray-700 dark:text-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     text-gray-700 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

    const UtilityStatus = ({ icon: Icon, label, status }) => {
    const getStatusStyles = () => {
      switch (status?.toLowerCase()) {
        case 'normal':
          return {
            container: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20',
            text: 'text-green-800 dark:text-green-200',
            icon: 'text-green-500 dark:text-green-400'
          };
        case 'issues':
          return {
            container: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: 'text-yellow-500 dark:text-yellow-400'
          };
        default:
          return {
            container: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
            text: 'text-red-800 dark:text-red-200',
            icon: 'text-red-500 dark:text-red-400'
          };
      }
    };

    const styles = getStatusStyles();

    return (
      <div className={`p-4 rounded-lg border ${styles.container}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-white dark:bg-gray-800`}>
              <Icon className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className={`text-sm font-medium ${styles.text}`}>
                {status || 'N/A'}
              </p>
            </div>
          </div>
          <div className={`h-2 w-2 rounded-full ${
            status === 'normal' 
              ? 'bg-green-500' 
              : status === 'issues' 
              ? 'bg-yellow-500' 
              : 'bg-red-500'
          }`} />
        </div>
      </div>
    );
  };
  
  // Detailed Report Modal Component
  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full relative">
            {/* Modal Header - Fixed */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-700 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-gray-600" />
                    <h2 className="text-2xl font-bold dark:text-white">Detailed Guard Shift Report</h2>
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
                    onClick={() => exportDetailedReport(report)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Export Report"
                  >
                    <Download className="w-6 h-6 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Close"
                  >
                    <X className="w-6 h-6 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div id="report-modal-content" className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-500">Shift Type</p>
                  <p className="text-lg font-semibold dark:text-white">
                    {report.shift_type.toUpperCase()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-500">Team Size</p>
                  <p className="text-lg font-semibold dark:text-white">
                    {report.team_members?.length || 0} Members
                  </p>
                </div>
                <div className={`p-4 border rounded-lg ${
                  report.incident_occurred 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'dark:border-gray-700'
                }`}>
                  <p className={`text-sm ${
                    report.incident_occurred 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-500'
                  }`}>Status</p>
                  <p className={`text-lg font-semibold ${
                    report.incident_occurred 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'dark:text-white'
                  }`}>
                    {report.incident_occurred ? 'Incident Reported' : 'Normal'}
                  </p>
                </div>
              </div>

              {/* CCTV Monitoring Status */}
              <div className="border rounded-lg dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <Camera className="w-5 h-5 mr-2 text-gray-500" />
                  <h3 className="text-lg font-semibold dark:text-white">CCTV Monitoring Status</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Main Location:</span>
                    <span className="font-medium dark:text-white">
                      {report.monitoring_location}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(report.remote_locations_checked || {}).map(([location, data]) => (
                      <div key={location} 
                           className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="font-medium dark:text-white">{location}</span>
                          <StatusBadge status={data.status} />
                        </div>
                        {data.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {data.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Utility Status */}
              <div className="border rounded-lg dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <Activity className="w-5 h-5 mr-2 text-gray-500" />
                  <h3 className="text-lg font-semibold dark:text-white">Utility Status</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <UtilityStatus icon={Power} label="Electricity" status={report.electricity_status} />
                  <UtilityStatus icon={Droplets} label="Water" status={report.water_status} />
                  <UtilityStatus icon={Building2} label="Office" status={report.office_status} />
                  <UtilityStatus icon={Car} label="Parking" status={report.parking_status} />
                </div>
              </div>

              {/* Team Members */}
              <div className="border rounded-lg dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  <h3 className="text-lg font-semibold dark:text-white">Security Team</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.team_members?.map((member, index) => (
                    <div key={index} 
                         className="flex items-center space-x-3 p-4 border rounded-lg dark:border-gray-700">
                      <UserCircle className="w-10 h-10 text-gray-400" />
                      <div>
                        <p className="font-medium dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-500">ID: {member.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident Report */}
              {report.incident_occurred && (
                <div className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                      Incident Report
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400">Incident Type</p>
                        <p className="mt-1 text-lg font-medium text-red-700 dark:text-red-300">
                          {report.incident_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400">Time of Incident</p>
                        <p className="mt-1 text-lg font-medium text-red-700 dark:text-red-300">
                          {report.incident_time ? 
                            new Date(report.incident_time).toLocaleString() : 
                            'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">Description</p>
                      <p className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 
                                  dark:border-red-800 text-gray-900 dark:text-red-100">
                        {report.incident_description}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">Action Taken</p>
                      <p className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 
                                  dark:border-red-800 text-gray-900 dark:text-red-100">
                        {report.action_taken}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {report.notes && (
                <div className="border rounded-lg dark:border-gray-700 p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                    <h3 className="text-lg font-semibold dark:text-white">Additional Notes</h3>
                  </div>
                  <div className="p-4 border rounded-lg dark:border-gray-700">
                    <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {report.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Reports Table */}
        <ReportsTable />

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
    </div>
  );
};

export default GuardShiftReportViewer;
