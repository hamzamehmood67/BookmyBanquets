import { useState, useEffect, useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  FiHome,
  FiGrid,
  FiUsers,
  FiBarChart,
  FiSettings,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiEye,
  FiMail,
  FiPhone
} from "react-icons/fi";
import axios from "axios";

const AdminDashboard = () => {
  const { showAlert } = useContext(AlertContext);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalHalls: 0,
    pendingHalls: 0,
    approvedHalls: 0,
    rejectedHalls: 0,
    totalBookings: 0,
    totalUsers: 0
  });
  
  // Halls management
  const [halls, setHalls] = useState([]);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [hallsError, setHallsError] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API = 'http://13.53.187.108:3000/api/v1';

  // Navigation tabs
  const navigationTabs = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "halls", label: "Hall Approvals", icon: FiGrid },
    { id: "users", label: "Users", icon: FiUsers },
    { id: "analytics", label: "Analytics", icon: FiBarChart },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [hallsResponse, bookingsResponse, usersResponse] = await Promise.all([
        axios.get(`${API}/admin/halls/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/bookings/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDashboardStats({
        totalHalls: hallsResponse.data.total || 0,
        pendingHalls: hallsResponse.data.pending || 0,
        approvedHalls: hallsResponse.data.approved || 0,
        rejectedHalls: hallsResponse.data.rejected || 0,
        totalBookings: bookingsResponse.data.total || 0,
        totalUsers: usersResponse.data.total || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use mock data if API fails
      setDashboardStats({
        totalHalls: 25,
        pendingHalls: 8,
        approvedHalls: 15,
        rejectedHalls: 2,
        totalBookings: 156,
        totalUsers: 89
      });
    }
  };

  // Fetch halls for approval
  const fetchHalls = async (status = 'all') => {
    try {
      setHallsLoading(true);
      setHallsError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/halls?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHalls(response.data.halls || []);
    } catch (error) {
      console.error('Error fetching halls:', error);
      setHallsError('Failed to fetch halls');
      // Mock data for development
      setHalls([
        {
          id: '1',
          name: 'Royal Banquet Hall',
          location: 'Lahore, Punjab',
          capacity: 500,
          price: 150000,
          status: 'pending',
          imageURLs: 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
          description: 'A luxurious banquet hall perfect for weddings and events.',
          manager: { name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '03001234567' },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Grand Palace Events',
          location: 'Karachi, Sindh',
          capacity: 800,
          price: 200000,
          status: 'pending',
          imageURLs: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg',
          description: 'An elegant venue for grand celebrations.',
          manager: { name: 'Sara Ali', email: 'sara@example.com', phone: '03009876543' },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setHallsLoading(false);
    }
  };

  // Handle hall approval/rejection
  const handleHallAction = async (hallId, action) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API}/admin/halls/${hallId}/status`, {
        status: action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert(`Hall ${action} successfully!`, 'success');
      setIsModalOpen(false);
      setSelectedHall(null);
      fetchHalls(); // Refresh halls list
      fetchDashboardStats(); // Refresh stats
    } catch (error) {
      console.error(`Error ${action} hall:`, error);
      showAlert(`Failed to ${action} hall. Please try again.`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'halls') {
      fetchHalls();
    }
  }, [activeTab]);

  const openHallModal = (hall) => {
    setSelectedHall(hall);
    setIsModalOpen(true);
  };

  const closeHallModal = () => {
    setSelectedHall(null);
    setIsModalOpen(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'rejected': return <FiXCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}! Here's your platform overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Halls</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalHalls}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiGrid className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pendingHalls}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Halls</p>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.approvedHalls}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.totalBookings}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600">{dashboardStats.totalUsers}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <FiUsers className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected Halls</p>
              <p className="text-3xl font-bold text-red-600">{dashboardStats.rejectedHalls}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('halls')}
            className="px-4 py-2 bg-[#FF477E] text-white rounded-lg font-medium hover:bg-[#FF477E]/90 transition-colors"
          >
            Review Pending Halls
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  // Render Halls Approval Tab
  const renderHallsApproval = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hall Approvals</h2>
          <p className="text-gray-600">Review and approve hall listings from managers.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchHalls('pending')}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
          >
            Pending Only
          </button>
          <button
            onClick={() => fetchHalls('all')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            All Halls
          </button>
        </div>
      </div>

      {hallsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-3"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : hallsError ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">⚠️ {hallsError}</div>
          <button
            onClick={() => fetchHalls()}
            className="px-4 py-2 bg-[#FF477E] text-white rounded-lg font-medium hover:bg-[#FF477E]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : halls.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No halls found</h3>
          <p className="text-gray-600">All halls have been reviewed or no halls are available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {halls.map((hall) => (
            <motion.div
              key={hall.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="relative h-48">
                <img
                  src={hall.imageURLs?.split(',')[0] || 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg'}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(hall.status)}`}>
                  {getStatusIcon(hall.status)}
                  {hall.status.charAt(0).toUpperCase() + hall.status.slice(1)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{hall.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{hall.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="w-4 h-4 mr-2" />
                    <span className="text-sm">Capacity: {hall.capacity} guests</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Submitted: {formatDate(hall.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#FF477E]">
                    {formatPrice(hall.price)}
                  </span>
                  <span className="text-sm text-gray-600">/event</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openHallModal(hall)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <FiEye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  {hall.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleHallAction(hall.id, 'active')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleHallAction(hall.id, 'rejected')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <FiXCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Render placeholder for other tabs
  const renderPlaceholder = (tabName) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{tabName} Coming Soon</h3>
      <p className="text-gray-600">This section is under development.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your platform efficiently</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#FF477E] border-b-2 border-[#FF477E] bg-pink-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'halls' && renderHallsApproval()}
          {activeTab === 'users' && renderPlaceholder('User Management')}
          {activeTab === 'analytics' && renderPlaceholder('Analytics')}
          {activeTab === 'settings' && renderPlaceholder('Settings')}
        </motion.div>
      </div>

      {/* Hall Detail Modal */}
      {isModalOpen && selectedHall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Hall Details</h2>
                <button
                  onClick={closeHallModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Hall Images */}
              <div className="mb-6">
                <img
                  src={selectedHall.imageURLs?.split(',')[0] || 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg'}
                  alt={selectedHall.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Hall Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedHall.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedHall.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">{selectedHall.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Capacity</p>
                    <p className="text-gray-900">{selectedHall.capacity} guests</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="text-gray-900">{formatPrice(selectedHall.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedHall.status)}`}>
                      {getStatusIcon(selectedHall.status)}
                      {selectedHall.status.charAt(0).toUpperCase() + selectedHall.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Manager Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Manager Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FiUser className="w-4 h-4 mr-2" />
                      <span>{selectedHall.manager?.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiMail className="w-4 h-4 mr-2" />
                      <span>{selectedHall.manager?.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="w-4 h-4 mr-2" />
                      <span>{selectedHall.manager?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedHall.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleHallAction(selectedHall.id, 'active')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <FiCheckCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve Hall'}
                  </button>
                  <button
                    onClick={() => handleHallAction(selectedHall.id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <FiXCircle className="w-4 h-4 mr-2" />
                    {actionLoading ? 'Processing...' : 'Reject Hall'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
