import { Moon, Sun, ChevronDown, LayoutDashboard, LogIn, LogOut, History, Users, Calendar, BarChart, User, Users2, ClipboardList } from 'lucide-react'

export const roleBasedNavigation = {
  admin: [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Guard Shift Report', 
      path: '/GuardShiftReport', 
      icon: ClipboardList
    },
    { 
      name: 'User Management', 
      path: '/user-management', 
      icon: Users2 
    },
    {
      name: 'Visitor Management',
      icon: Users,
      children: [
        { name: 'Check In', path: '/check-in', icon: LogIn },
        { name: 'Check Out', path: '/check-out', icon: LogOut },
        { name: 'Visitor History', path: '/visitor-history', icon: History },
      ]
    },
    {
      name: 'Visitor Scheduling',
      icon: Calendar,
      children: [
        { name: 'Bulk Visitor', path: '/bulkvisitors', icon: Users },
        { name: 'Scheduled Visitor', path: '/scheduled-visitors', icon: Calendar },
      ]
    },
    {
      name: 'Reports & History',
      icon: BarChart,
      children: [
        { name: 'Check In & Out Report', path: '/reports', icon: BarChart },
        { name: 'Guard Shift Report', path: '/GuardShiftReportViewer', icon: BarChart },
        { name: 'Scheduled Visitor Report', path: '/scheduled-report', icon: BarChart },
      ]
    },
  ],
  supervisor: [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Guard Shift Report', 
      path: '/GuardShiftReport', 
      icon: ClipboardList
    },
    {
      name: 'Visitor Management',
      icon: Users,
      children: [
        { name: 'Check In', path: '/check-in', icon: LogIn },
        { name: 'Check Out', path: '/check-out', icon: LogOut },
        { name: 'Visitor History', path: '/visitor-history', icon: History },
      ]
    },
    {
      name: 'Scheduled Visitors',
      path: '/scheduled-visitors',
      icon: Calendar,
    },

  ],
  security_guard: [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    {
      name: 'Visitor Management',
      icon: Users,
      children: [
        { name: 'Check In', path: '/check-in', icon: LogIn },
        { name: 'Check Out', path: '/check-out', icon: LogOut },
        { name: 'Visitor History', path: '/visitor-history', icon: History },
      ]
    },
    {
      name: 'Scheduled Visitors',
      path: '/scheduled-visitors',
      icon: Calendar,
    },
  ],
  user: [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Guard Shift Report', 
      path: '/GuardShiftReport', 
      icon: ClipboardList
    },
    {
      name: 'Visitor Management',
      icon: Users,
      children: [
        { name: 'Check In', path: '/check-in', icon: LogIn },
        { name: 'Check Out', path: '/check-out', icon: LogOut },
        { name: 'Visitor History', path: '/visitor-history', icon: History },
      ]
    },
    {
      name: 'Visitor Scheduling',
      icon: Calendar,
      children: [
        { name: 'Bulk Visitor', path: '/bulkvisitors', icon: Users },
        { name: 'Scheduled Visitor', path: '/scheduled-visitors', icon: Calendar },
      ]
    },
    {
      name: 'Reports & History',
      icon: BarChart,
      children: [
        { name: 'Check In & Out Report', path: '/reports', icon: BarChart },
        { name: 'Guard Shift Report', path: '/GuardShiftReportViewer', icon: BarChart },
        { name: 'Scheduled Visitor Report', path: '/scheduled-report', icon: BarChart },
      ]
    },
  ]
};
