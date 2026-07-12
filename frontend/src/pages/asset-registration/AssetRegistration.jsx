import { useState } from "react";

// ============== Mock Data ==============
const assetCategories = [
  "All Categories",
  "IT Equipment",
  "Furniture",
  "Vehicles",
  "Office Equipment",
  "Audio Visual",
  "Machinery",
];

const departments = [
  "All Departments",
  "Engineering",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "IT",
  "Administration",
];

const statuses = [
  "All Statuses",
  "Available",
  "Booked",
  "Allocated",
  "Under Maintenance",
  "Lost",
  "Retired",
  "Disposed",
  "Reserved",
];

const conditions = [
  "All Conditions",
  "New",
  "Good",
  "Fair",
  "Poor",
  "Damaged",
];

const locations = [
  "All Locations",
  "Building A - Floor 1",
  "Building A - Floor 2",
  "Building B - Floor 1",
  "Building B - Floor 2",
  "Warehouse",
  "Offsite Storage",
];

const mockAssets = [
  {
    id: 1,
    assetTag: "AST-001",
    assetName: "Dell Precision 5820",
    serialNumber: "SN-DELL-48291",
    category: "IT Equipment",
    department: "Engineering",
    assignedEmployee: "John Doe",
    purchaseDate: "2024-01-15",
    condition: "Good",
    status: "Allocated",
    location: "Building A - Floor 2",
    photoUrl: "",
  },
  {
    id: 2,
    assetTag: "AST-002",
    assetName: "Mercedes-Benz Sprinter",
    serialNumber: "SN-MBZ-77341",
    category: "Vehicles",
    department: "Operations",
    assignedEmployee: "Sarah Smith",
    purchaseDate: "2023-11-20",
    condition: "Good",
    status: "Available",
    location: "Parking Lot A",
    photoUrl: "",
  },
  {
    id: 3,
    assetTag: "AST-003",
    assetName: "HP LaserJet Pro M404",
    serialNumber: "SN-HP-19482-A",
    category: "Office Equipment",
    department: "Finance",
    assignedEmployee: "Mike Johnson",
    purchaseDate: "2024-03-10",
    condition: "Fair",
    status: "Booked",
    location: "Building B - Floor 1",
    photoUrl: "",
  },
  {
    id: 4,
    assetTag: "AST-004",
    assetName: "Conference Table - Oak",
    serialNumber: "SN-FRN-00234",
    category: "Furniture",
    department: "Administration",
    assignedEmployee: "Emily Clark",
    purchaseDate: "2022-08-05",
    condition: "Good",
    status: "Available",
    location: "Building A - Floor 1",
    photoUrl: "",
  },
  {
    id: 5,
    assetTag: "AST-005",
    assetName: "Canon EOS R5 Camera",
    serialNumber: "SN-CAN-55678",
    category: "Audio Visual",
    department: "Marketing",
    assignedEmployee: "Lisa Wang",
    purchaseDate: "2024-06-01",
    condition: "New",
    status: "Under Maintenance",
    location: "Building A - Floor 2",
    photoUrl: "",
  },
  {
    id: 6,
    assetTag: "AST-006",
    assetName: "Cisco Meraki MX100",
    serialNumber: "SN-CISCO-8843B",
    category: "IT Equipment",
    department: "IT",
    assignedEmployee: "Tom Chen",
    purchaseDate: "2024-02-14",
    condition: "Good",
    status: "Allocated",
    location: "Server Room B",
    photoUrl: "",
  },
  {
    id: 7,
    assetTag: "AST-007",
    assetName: "Ford Transit Connect",
    serialNumber: "SN-FORD-5512X",
    category: "Vehicles",
    department: "Operations",
    assignedEmployee: "Unassigned",
    purchaseDate: "2023-05-22",
    condition: "Poor",
    status: "Lost",
    location: "Unknown",
    photoUrl: "",
  },
  {
    id: 8,
    assetTag: "AST-008",
    assetName: "Epson WorkForce Pro",
    serialNumber: "SN-EPSON-00991",
    category: "Office Equipment",
    department: "Marketing",
    assignedEmployee: "Unassigned",
    purchaseDate: "2024-09-01",
    condition: "New",
    status: "Pending Approval",
    location: "Building B - Floor 2",
    photoUrl: "",
  },
  {
    id: 9,
    assetTag: "AST-009",
    assetName: "ThinkPad X1 Carbon Gen 11",
    serialNumber: "SN-LEN-77421",
    category: "IT Equipment",
    department: "IT",
    assignedEmployee: "Rachel Green",
    purchaseDate: "2024-04-20",
    condition: "Good",
    status: "In Use",
    location: "Building A - Floor 1",
    photoUrl: "",
  },
  {
    id: 10,
    assetTag: "AST-010",
    assetName: "Sony 85\" BRAVIA Display",
    serialNumber: "SN-SONY-33218",
    category: "Audio Visual",
    department: "Marketing",
    assignedEmployee: "Unassigned",
    purchaseDate: "2023-12-01",
    condition: "Good",
    status: "Reserved",
    location: "Building A - Floor 2",
    photoUrl: "",
  },
  {
    id: 11,
    assetTag: "AST-011",
    assetName: "Toyota Hilux Double Cab",
    serialNumber: "SN-TOY-66190",
    category: "Vehicles",
    department: "Operations",
    assignedEmployee: "David Miller",
    purchaseDate: "2022-03-15",
    condition: "Fair",
    status: "Allocated",
    location: "Parking Lot B",
    photoUrl: "",
  },
  {
    id: 12,
    assetTag: "AST-012",
    assetName: "Herman Miller Aeron Chair",
    serialNumber: "SN-HM-44832",
    category: "Furniture",
    department: "Engineering",
    assignedEmployee: "Alex Kim",
    purchaseDate: "2024-07-10",
    condition: "New",
    status: "Available",
    location: "Building B - Floor 1",
    photoUrl: "",
  },
  {
    id: 13,
    assetTag: "AST-013",
    assetName: "MacBook Pro 16\" M3 Max",
    serialNumber: "SN-APP-99201",
    category: "IT Equipment",
    department: "Engineering",
    assignedEmployee: "Priya Sharma",
    purchaseDate: "2024-08-05",
    condition: "New",
    status: "Transfer Pending",
    location: "Building A - Floor 2",
    photoUrl: "",
  },
  {
    id: 14,
    assetTag: "AST-014",
    assetName: "Server Rack - Dell PowerEdge",
    serialNumber: "SN-SRV-11223",
    category: "IT Equipment",
    department: "IT",
    assignedEmployee: "Tom Chen",
    purchaseDate: "2021-09-20",
    condition: "Poor",
    status: "Damaged",
    location: "Server Room A",
    photoUrl: "",
  },
  {
    id: 15,
    assetTag: "AST-015",
    assetName: "Xerox AltaLink C8130",
    serialNumber: "SN-XRX-77654",
    category: "Office Equipment",
    department: "Administration",
    assignedEmployee: "Unassigned",
    purchaseDate: "2020-06-30",
    condition: "Poor",
    status: "Retired",
    location: "Offsite Storage",
    photoUrl: "",
  },
  {
    id: 16,
    assetTag: "AST-016",
    assetName: "Industrial Pallet Racking",
    serialNumber: "SN-WHS-00441",
    category: "Machinery",
    department: "Operations",
    assignedEmployee: "Unassigned",
    purchaseDate: "2019-11-10",
    condition: "Damaged",
    status: "Disposed",
    location: "Warehouse",
    photoUrl: "",
  },
];

// ============== Style Helpers ==============
const statusConfig = {
  Available: { color: "gray" },
  Booked: { color: "green" },
  Allocated: { color: "green" },
  "In Use": { color: "green" },
  Waiting: { color: "orange" },
  "Pending Approval": { color: "orange" },
  Reserved: { color: "orange" },
  "Transfer Pending": { color: "orange" },
  "Not Available": { color: "red" },
  "Under Maintenance": { color: "red" },
  Lost: { color: "red" },
  Damaged: { color: "red" },
  Retired: { color: "red" },
  Disposed: { color: "red" },
};

function getStatusStyle(status) {
  const c = statusConfig[status]?.color ?? "gray";
  switch (c) {
    case "green":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "orange":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "red":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getStatusDotColor(status) {
  const c = statusConfig[status]?.color ?? "gray";
  switch (c) {
    case "green":
      return "bg-emerald-500";
    case "orange":
      return "bg-amber-500";
    case "red":
      return "bg-rose-500";
    default:
      return "bg-gray-400";
  }
}

function getRowHighlight(status) {
  const c = statusConfig[status]?.color ?? "gray";
  switch (c) {
    case "green":
      return "bg-emerald-50/60";
    case "orange":
      return "bg-amber-50/60";
    case "red":
      return "bg-rose-50/60";
    default:
      return "bg-white";
  }
}

function getRowHoverHighlight(status) {
  const c = statusConfig[status]?.color ?? "gray";
  switch (c) {
    case "green":
      return "hover:bg-emerald-50";
    case "orange":
      return "hover:bg-amber-50";
    case "red":
      return "hover:bg-rose-50";
    default:
      return "hover:bg-gray-50";
  }
}

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
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Allocate: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Transfer: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  QR: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Box: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  ArrowDown: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  EmptyAssets: () => (
    <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 12l-3-1.5M12 12l3-1.5M12 12v4" />
    </svg>
  ),
};

const navItems = [
  { label: "Dashboard", icon: Icons.Dashboard },
  { label: "Organization Setup", icon: Icons.OrgSetup },
  { label: "Assets", icon: Icons.Assets, active: true },
  { label: "Allocation & Transfer", icon: Icons.Allocation },
  { label: "Resource Booking", icon: Icons.Booking },
  { label: "Maintenance", icon: Icons.Maintenance },
  { label: "Audit", icon: Icons.Audit },
  { label: "Reports", icon: Icons.Reports },
  { label: "Notifications", icon: Icons.Notifications },
];

// ============== KPI Data ==============
const kpiCards = [
  {
    label: "Total Assets",
    count: 284,
    icon: Icons.Box,
    trend: "+12 this month",
    trendUp: true,
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Available Assets",
    count: 142,
    icon: Icons.CheckCircle,
    trend: "50% of total",
    trendUp: true,
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    label: "Booked Assets",
    count: 86,
    icon: Icons.Clock,
    trend: "+8 this week",
    trendUp: true,
    color: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Unavailable Assets",
    count: 56,
    icon: Icons.XCircle,
    trend: "+3 this month",
    trendUp: false,
    color: "from-rose-500 to-rose-600",
    bgLight: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all min-w-[160px]"
      >
        <Icons.Filter />
        <span className="flex-1 text-left truncate">
          {value.startsWith("All ") ? (
            <span className="text-gray-400">{label}</span>
          ) : (
            <span className="text-gray-800 font-medium">{value}</span>
          )}
        </span>
        <Icons.ChevronDown />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === opt
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============== Main Component ==============
export default function AssetRegistration() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDepartment, setSelectedDepartment] = useState(
    "All Departments"
  );
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [assets, setAssets] = useState(mockAssets);

  // Filter logic
  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    if (q) {
      const searchable = `${asset.assetTag} ${asset.assetName} ${asset.serialNumber || ""}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (selectedCategory !== "All Categories" && asset.category !== selectedCategory)
      return false;
    if (selectedStatus !== "All Statuses" && asset.status !== selectedStatus)
      return false;
    if (
      selectedDepartment !== "All Departments" &&
      asset.department !== selectedDepartment
    )
      return false;
    if (
      selectedLocation !== "All Locations" &&
      asset.location !== selectedLocation
    )
      return false;
    if (
      selectedCondition !== "All Conditions" &&
      asset.condition !== selectedCondition
    )
      return false;
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / rowsPerPage));
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function resetFilters() {
    setSelectedCategory("All Categories");
    setSelectedStatus("All Statuses");
    setSelectedDepartment("All Departments");
    setSelectedLocation("All Locations");
    setSelectedCondition("All Conditions");
    setSearchQuery("");
  }

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    selectedStatus !== "All Statuses" ||
    selectedDepartment !== "All Departments" ||
    selectedLocation !== "All Locations" ||
    selectedCondition !== "All Conditions" ||
    searchQuery !== "";

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  // ============== Render ==============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== Sidebar Overlay (mobile) ========== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== Sidebar ========== */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                AssetFlow
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Enterprise Asset Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                item.active
                  ? "bg-gradient-to-r from-indigo-50 to-indigo-50/80 text-indigo-700 shadow-sm border border-indigo-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <span
                className={
                  item.active ? "text-indigo-600" : "text-gray-400"
                }
              >
                <item.icon />
              </span>
              <span>{item.label}</span>
              {item.label === "Notifications" && (
                <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-400 truncate">Admin</p>
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
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Icons.Menu />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Asset Registration & Directory
                </h2>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Manage and track all organizational assets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search icon button (mobile) */}
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors sm:hidden">
                <Icons.Search />
              </button>

              {/* Notification Bell */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                <Icons.Bell />
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  5
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    JD
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    John Doe
                  </span>
                  <Icons.ChevronDown />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Settings
                    </button>
                    <hr className="border-gray-100" />
                    <button className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== Page Content ========== */}
        <main className="p-4 lg:p-8 space-y-6">
          {/* ===== Search & Action Bar ===== */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder='Search by Asset Tag, Asset Name, Serial Number or QR Code...'
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98] transition-all duration-200 shadow-md whitespace-nowrap">
              <Icons.Plus />
              Register Asset
            </button>
          </div>

          {/* ===== Filters ===== */}
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              label="Category"
              value={selectedCategory}
              options={assetCategories}
              onChange={(v) => {
                setSelectedCategory(v);
                setCurrentPage(1);
              }}
            />
            <Dropdown
              label="Status"
              value={selectedStatus}
              options={statuses}
              onChange={(v) => {
                setSelectedStatus(v);
                setCurrentPage(1);
              }}
            />
            <Dropdown
              label="Department"
              value={selectedDepartment}
              options={departments}
              onChange={(v) => {
                setSelectedDepartment(v);
                setCurrentPage(1);
              }}
            />
            <Dropdown
              label="Location"
              value={selectedLocation}
              options={locations}
              onChange={(v) => {
                setSelectedLocation(v);
                setCurrentPage(1);
              }}
            />
            <Dropdown
              label="Condition"
              value={selectedCondition}
              options={conditions}
              onChange={(v) => {
                setSelectedCondition(v);
                setCurrentPage(1);
              }}
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* ===== KPI Cards ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => (
              <div
                key={kpi.label}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1.5 tracking-tight">
                      {kpi.count.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className={
                          kpi.trendUp ? "text-emerald-500" : "text-rose-400"
                        }
                      >
                        {kpi.trendUp ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          kpi.trendUp ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${kpi.iconBg} ${kpi.iconColor} shadow-sm`}
                  >
                    <kpi.icon />
                  </div>
                </div>
                {/* Subtle gradient bar at bottom */}
                <div
                  className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            ))}
          </div>

          {/* ===== Asset Table ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table Header with count */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Asset Directory
                </h3>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                  {filteredAssets.length} assets
                </span>
              </div>
            </div>

            {filteredAssets.length === 0 ? (
              /* ===== Empty State ===== */
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="mb-6 text-gray-200">
                  <Icons.EmptyAssets />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Assets Found
                </h3>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-sm">
                  No assets match your current search or filter criteria. Try
                  adjusting your filters or register a new asset.
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-200/50 active:scale-[0.98] transition-all duration-200 shadow-md">
                  <Icons.Plus />
                  Register Asset
                </button>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {[
                          "Asset Tag",
                          "Asset Image",
                          "Asset Name",
                          "Category",
                          "Department",
                          "Assigned Employee",
                          "Purchase Date",
                          "Condition",
                          "Status",
                          "Location",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          className={`border-b border-gray-50 ${getRowHighlight(
                            asset.status
                          )} ${getRowHoverHighlight(
                            asset.status
                          )} transition-colors`}
                        >
                          {/* Asset Tag */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-mono font-semibold rounded-lg">
                              <Icons.Box />
                              {asset.assetTag}
                            </span>
                          </td>

                          {/* Asset Image */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {asset.photoUrl ? (
                              <img
                                src={asset.photoUrl}
                                alt={asset.assetName}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300">
                                <Icons.ImagePlaceholder />
                              </div>
                            )}
                          </td>

                          {/* Asset Name */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-medium text-gray-900">
                              {asset.assetName}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                            {asset.category}
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
                              {asset.department}
                            </span>
                          </td>

                          {/* Assigned Employee */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-500">
                                {asset.assignedEmployee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              {asset.assignedEmployee}
                            </div>
                          </td>

                          {/* Purchase Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                            {new Date(
                              asset.purchaseDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          {/* Condition */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-lg ${
                                asset.condition === "New"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : asset.condition === "Good"
                                  ? "bg-blue-50 text-blue-700"
                                  : asset.condition === "Fair"
                                  ? "bg-amber-50 text-amber-700"
                                  : asset.condition === "Poor"
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {asset.condition}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                                asset.status
                              )}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(
                                  asset.status
                                )}`}
                              />
                              {asset.status}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                            {asset.location}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {[
                                { icon: Icons.Eye, label: "View" },
                                { icon: Icons.Edit, label: "Edit" },
                                { icon: Icons.Allocate, label: "Allocate" },
                                { icon: Icons.Transfer, label: "Transfer" },
                                { icon: Icons.Wrench, label: "Maintenance" },
                                { icon: Icons.QR, label: "QR Code" },
                                { icon: Icons.Trash, label: "Delete" },
                              ].map((action) => (
                                <button
                                  key={action.label}
                                  title={action.label}
                                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 group relative"
                                >
                                  <action.icon />
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                                    {action.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ===== Pagination ===== */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {[4, 8, 12, 20].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span>
                      {Math.min((currentPage - 1) * rowsPerPage + 1, filteredAssets.length)}
                      -{Math.min(currentPage * rowsPerPage, filteredAssets.length)}{" "}
                      of {filteredAssets.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icons.ChevronLeft />
                    </button>
                    {getPageNumbers().map((page, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          page === "..."
                            ? "text-gray-400 cursor-default"
                            : page === currentPage
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => page !== "..." && goToPage(page)}
                      >
                        {page}
                      </div>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icons.ChevronRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
