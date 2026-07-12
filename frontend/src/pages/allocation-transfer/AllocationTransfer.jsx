import { useState } from "react";

// ============== SVG Icons ==============
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  OrgSetup: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Assets: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Allocation: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Booking: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Maintenance: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Audit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Notifications: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ImagePlaceholder: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  QRCode: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Paperclip: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

// ============== Nav Items ==============
const navItems = [
  { label: "Dashboard", icon: Icons.Dashboard },
  { label: "Organization Setup", icon: Icons.OrgSetup },
  { label: "Assets", icon: Icons.Assets },
  { label: "Allocation & Transfer", icon: Icons.Allocation, active: true },
  { label: "Resource Booking", icon: Icons.Booking },
  { label: "Maintenance", icon: Icons.Maintenance },
  { label: "Audit", icon: Icons.Audit },
  { label: "Reports", icon: Icons.Reports },
  { label: "Notifications", icon: Icons.Notifications },
];

// ============== Dummy Data ==============
const selectedAsset = {
  image: "",
  assetTag: "AST-001",
  name: "Dell Precision 5820 Tower Workstation",
  category: "IT Equipment",
  department: "Engineering",
  currentHolder: "Priya Shah",
  status: "Allocated",
};

const summaryData = {
  assetValue: "$4,850.00",
  purchaseDate: "15 Jan 2024",
  warrantyExpiry: "15 Jan 2027",
  department: "Engineering",
  assignedEmployee: "Priya Shah",
  maintenanceCount: 3,
  transferCount: 2,
  condition: "Good",
};

const employees = [
  "Select Employee",
  "Arjun Nair",
  "Priya Shah",
  "Rajesh Kumar",
  "Sneha Patel",
  "Vikram Singh",
  "Ananya Reddy",
  "Karthik Iyer",
  "Divya Menon",
];

const activities = [
  {
    id: 1,
    user: "Rajesh Kumar",
    role: "Asset Manager",
    action: "Transfer Request Created",
    timestamp: "2 hours ago",
    initials: "RK",
    color: "bg-blue-500",
  },
  {
    id: 2,
    user: "Ananya Reddy",
    role: "Manager",
    action: "Approved by Manager",
    timestamp: "1 hour ago",
    initials: "AR",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    user: "System",
    role: "Automated",
    action: "Asset Returned — Dell Precision 5820",
    timestamp: "30 mins ago",
    initials: "S",
    color: "bg-amber-500",
  },
  {
    id: 4,
    user: "Priya Shah",
    role: "Employee",
    action: 'Comments Added — "Please schedule delivery to B2 wing"',
    timestamp: "15 mins ago",
    initials: "PS",
    color: "bg-purple-500",
  },
];

const timelineData = [
  {
    id: 1,
    date: "12 Mar 2026",
    title: "Allocated to Priya Shah",
    department: "Engineering Department",
    userInitials: "PS",
    userColor: "bg-blue-500",
    status: "Allocated",
    statusColor: "green",
  },
  {
    id: 2,
    date: "04 Jan 2026",
    title: "Returned by Arjun Nair",
    condition: "Good",
    department: "Engineering Department",
    userInitials: "AN",
    userColor: "bg-amber-500",
    status: "Returned",
    statusColor: "gray",
  },
  {
    id: 3,
    date: "18 Nov 2025",
    title: "Allocated to Finance Team",
    department: "Finance Department",
    userInitials: "FT",
    userColor: "bg-purple-500",
    status: "Transferred",
    statusColor: "orange",
  },
  {
    id: 4,
    date: "02 Sep 2025",
    title: "Allocated to Arjun Nair",
    department: "Engineering Department",
    userInitials: "AN",
    userColor: "bg-amber-500",
    status: "Allocated",
    statusColor: "green",
  },
];

// ============== Status Badge ==============
function StatusBadge({ status }) {
  const colorMap = {
    Available: "bg-gray-100 text-gray-700 border-gray-200 dot:bg-gray-400",
    Allocated: "bg-emerald-100 text-emerald-800 border-emerald-200 dot:bg-emerald-500",
    Booked: "bg-emerald-100 text-emerald-800 border-emerald-200 dot:bg-emerald-500",
    "In Use": "bg-emerald-100 text-emerald-800 border-emerald-200 dot:bg-emerald-500",
    "Waiting Approval": "bg-amber-100 text-amber-800 border-amber-200 dot:bg-amber-500",
    "Transfer Requested": "bg-amber-100 text-amber-800 border-amber-200 dot:bg-amber-500",
    Reserved: "bg-amber-100 text-amber-800 border-amber-200 dot:bg-amber-500",
    "Under Maintenance": "bg-rose-100 text-rose-800 border-rose-200 dot:bg-rose-500",
    Unavailable: "bg-rose-100 text-rose-800 border-rose-200 dot:bg-rose-500",
    Lost: "bg-rose-100 text-rose-800 border-rose-200 dot:bg-rose-500",
    Retired: "bg-rose-100 text-rose-800 border-rose-200 dot:bg-rose-500",
    Damaged: "bg-rose-100 text-rose-800 border-rose-200 dot:bg-rose-500",
    Returned: "bg-gray-100 text-gray-700 border-gray-200 dot:bg-gray-400",
    Transferred: "bg-amber-100 text-amber-800 border-amber-200 dot:bg-amber-500",
    Approved: "bg-emerald-100 text-emerald-800 border-emerald-200 dot:bg-emerald-500",
  };
  const style = colorMap[status] || "bg-gray-100 text-gray-700 border-gray-200 dot:bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.split("dot:")[1] || "bg-gray-400"}`} />
      {status}
    </span>
  );
}

// ============== Main Component ==============
export default function AllocationTransfer() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferType, setTransferType] = useState("employee");
  const [priority, setPriority] = useState("medium");
  const [transferReason, setTransferReason] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attachment, setAttachment] = useState(null);

  const filteredEmployees = employees.filter(
    (e) => e.toLowerCase().includes(searchTerm.toLowerCase()) && e !== "Select Employee"
  );

  const stageIcons = [Icons.Users, Icons.Check, Icons.Shield, Icons.Allocation];
  const stageLabels = ["Requested", "Manager Review", "Approved", "Asset Reassigned"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ========== Sidebar Overlay ========== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== Sidebar ========== */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">AssetFlow</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Enterprise Asset Management</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <Icons.Close />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.active
                  ? "bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-500 rounded-r-xl rounded-l-none pl-[13px]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <span className={item.active ? "text-emerald-600" : "text-gray-400"}>
                <item.icon />
              </span>
              <span>{item.label}</span>
              {item.label === "Notifications" && (
                <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">Asset Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== Main Content ========== */}
      <div className="lg:pl-64">
        {/* ========== Header ========== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Icons.Menu />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Asset Allocation & Transfer</h2>
                <p className="text-xs text-gray-400 hidden sm:block">Manage asset assignments and transfers between employees and departments</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                <Icons.Search />
              </button>
              <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                <Icons.Bell />
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">5</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">AD</div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
                  <Icons.ChevronDown />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Profile</button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Settings</button>
                    <hr className="border-gray-100" />
                    <button className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2">
                      <Icons.Logout /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== Main Content Area ========== */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* ===== Two Column Layout ===== */}
          <div className="flex flex-col xl:flex-row gap-6">

            {/* ========== LEFT COLUMN (70%) ========== */}
            <div className="xl:w-[70%] space-y-6">

              {/* SECTION 1: Selected Asset */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Selected Asset</h3>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">AST-001</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-32 h-32 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                    <Icons.ImagePlaceholder />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {[
                      ["Asset Name", "Dell Precision 5820 Tower Workstation"],
                      ["Category", "IT Equipment"],
                      ["Department", "Engineering"],
                      ["Current Holder", "Priya Shah"],
                      ["Current Status", null],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        {label === "Current Status" ? (
                          <StatusBadge status="Allocated" />
                        ) : (
                          <p className="font-medium text-gray-800">{value}</p>
                        )}
                      </div>
                    ))}
                    <div className="col-span-2 sm:col-span-1 flex items-end">
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-all">
                        <Icons.QRCode /> QR Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Allocation Warning */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                    <Icons.Warning />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-rose-800 mb-1">Allocation Warning</h4>
                    <p className="text-sm text-rose-700 mb-3">
                      This asset is already allocated to <strong>Priya Shah (Engineering)</strong>.
                      Direct allocation is blocked. Please submit a transfer request.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm font-medium rounded-xl transition-all">
                      <Icons.History /> View Asset History
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Transfer Request Form */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Transfer Request Form</h3>

                <div className="space-y-5">
                  {/* Current Holder (Read Only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Holder</label>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">PS</div>
                      Priya Shah (Engineering)
                    </div>
                  </div>

                  {/* Transfer To */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transfer To</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowEmployeeDropdown(true); }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
                        placeholder="Search employee..."
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icons.ChevronDown />
                      </div>
                    </div>
                    {showEmployeeDropdown && searchTerm && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                          <button
                            key={emp}
                            onMouseDown={() => { setTransferTo(emp); setSearchTerm(emp); setShowEmployeeDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              transferTo === emp ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {emp}
                          </button>
                        )) : (
                          <p className="px-4 py-3 text-sm text-gray-400">No employees found</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Transfer Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Transfer Type</label>
                    <div className="flex gap-3">
                      {["employee", "department"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setTransferType(type)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                            transferType === type
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            transferType === type ? "border-emerald-500" : "border-gray-300"
                          }`}>
                            {transferType === type && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </span>
                          {type === "employee" ? "Employee Transfer" : "Department Transfer"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <div className="flex gap-3">
                      {[
                        { value: "low", label: "Low", color: "bg-gray-100 text-gray-700 border-gray-200 ring-gray-400" },
                        { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500" },
                        { value: "high", label: "High", color: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500" },
                      ].map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                            priority === p.value ? `${p.color} ring-2` : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason for Transfer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Transfer <span className="text-rose-400">*</span></label>
                    <textarea
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      placeholder="Please provide a detailed reason for this transfer request..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                    />
                  </div>

                  {/* Expected Transfer Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Transfer Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icons.Calendar />
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Any additional notes or instructions..."
                      rows={2}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                    />
                  </div>

                  {/* Attachment Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachment <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <label className="flex flex-col items-center justify-center w-full px-4 py-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                      <div className="p-2 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all mb-2">
                        <Icons.Upload />
                      </div>
                      <p className="text-sm text-gray-500 group-hover:text-emerald-700 font-medium transition-all">
                        {attachment ? attachment.name : "Click to upload supporting document"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, PNG up to 10MB</p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                    </label>
                    {attachment && (
                      <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                        <Icons.Paperclip />
                        <span className="flex-1 truncate">{attachment.name}</span>
                        <button onClick={() => setAttachment(null)} className="text-rose-500 hover:text-rose-700 font-medium ml-2">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98] transition-all duration-200 shadow-md">
                      <Icons.Allocation /> Submit Transfer Request
                    </button>
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                      Reset
                    </button>
                    <button className="px-6 py-3 text-gray-400 hover:text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== RIGHT COLUMN (30%) ========== */}
            <div className="xl:w-[30%] space-y-6">

              {/* SUMMARY CARD */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Asset Summary</h3>
                <div className="space-y-3.5">
                  {[
                    { icon: Icons.Dollar, label: "Asset Value", value: summaryData.assetValue },
                    { icon: Icons.Calendar, label: "Purchase Date", value: summaryData.purchaseDate },
                    { icon: Icons.Shield, label: "Warranty Expiry", value: summaryData.warrantyExpiry },
                    { icon: Icons.Building, label: "Department", value: summaryData.department },
                    { icon: Icons.User, label: "Assigned Employee", value: summaryData.assignedEmployee },
                    { icon: Icons.Maintenance, label: "Maintenance Count", value: `${summaryData.maintenanceCount} requests` },
                    { icon: Icons.Allocation, label: "Transfer Count", value: `${summaryData.transferCount} transfers` },
                    { icon: Icons.CheckCircle, label: "Condition", value: summaryData.condition },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-gray-400"><Icon /></span>
                        <span className="text-sm text-gray-500">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURRENT STATUS */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Current Status</h3>
                <div className="flex items-center gap-3">
                  <StatusBadge status="Allocated" />
                  <span className="text-sm text-gray-400">— Currently allocated</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Last updated: 12 Mar 2026</p>
              </div>

              {/* APPROVAL WORKFLOW */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                <div className="space-y-0">
                  {stageLabels.map((label, idx) => {
                    const isCurrent = idx === 1;
                    const isCompleted = idx < 1;
                    const StageIcon = stageIcons[idx];
                    return (
                      <div key={label} className="flex items-start gap-3 relative">
                        {idx < stageLabels.length - 1 && (
                          <div className={`absolute left-[18px] top-9 w-0.5 h-8 ${isCompleted ? "bg-emerald-400" : "bg-gray-200"}`} />
                        )}
                        <div className={`p-2 rounded-xl border-2 flex-shrink-0 ${
                          isCurrent
                            ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                            : isCompleted
                            ? "bg-emerald-50 border-emerald-300 text-emerald-500"
                            : "bg-gray-50 border-gray-200 text-gray-300"
                        }`}>
                          <StageIcon />
                        </div>
                        <div className="flex-1 pb-6">
                          <p className={`text-sm font-medium ${isCurrent ? "text-emerald-700" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                            {label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isCurrent ? "Pending approval" : isCompleted ? "Completed" : "Not started"}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">Current</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BUSINESS RULES */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600 flex-shrink-0">
                    <Icons.Info />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-sky-800 mb-1">Business Rules</h4>
                    <ul className="space-y-1.5">
                      {[
                        "Assets already allocated cannot be directly reassigned.",
                        "Transfer request must be approved by Asset Manager.",
                        "Allocation history updates automatically after approval.",
                      ].map((rule, i) => (
                        <li key={i} className="text-xs text-sky-700 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACTIVITY LOG */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${act.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                        {act.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">{act.user}</p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{act.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{act.role}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{act.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========== BOTTOM SECTION: Timeline ========== */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Allocation History Timeline</h3>
            <div className="space-y-0">
              {timelineData.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-4 relative">
                  {idx < timelineData.length - 1 && (
                    <div className="absolute left-[23px] top-12 w-0.5 h-[calc(100%+0px)] bg-gray-200" />
                  )}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-[46px] h-[46px] rounded-full ${item.userColor} flex items-center justify-center text-white text-xs font-bold shadow-sm z-10`}>
                      {item.userInitials}
                    </div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.date}</span>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.department}</p>
                      {item.condition && (
                        <p className="text-xs text-gray-500 mt-0.5">Condition: <span className="font-medium text-gray-700">{item.condition}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
