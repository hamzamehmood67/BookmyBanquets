
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { AlertContext } from "../context/AlertContext"
import { useContext } from "react"
import { useAuth } from "../context/AuthContext"
import {
  Calendar,
  Clock,
  Users,
  Package,
  ChevronDown,
  Search,
  CalendarIcon,
  User,
  Home,
  BookOpen,
  Settings,
  Phone,
  Check,
  X,
  Info,
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
// import "./fonts.css"

// API Configuration
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

// Sample customer data
const customerData = {
  id: "CUST1001",
  name: "Imran Ahmed",
  email: "imran.ahmed@gmail.com",
  phone: "+92 333 1234567",
  address: "45 Garden Town, Lahore",
  memberSince: "January 2023",
}

// Sample bookings data
const bookingsData = [
  {
    id: "BK2001",
    eventType: "Wedding Reception",
    date: "2025-08-15",
    time: "Evening (7:30 PM - 11:30 PM)",
    guestCount: 250,
    package: "Premium Package",
    status: "confirmed",
    amount: "PKR 225,000",
    paymentStatus: "paid",
    createdAt: "2025-05-20",
    notes: "Need special flower arrangements",
    hallId: "hall1",
  },
  {
    id: "BK2002",
    eventType: "Engagement Ceremony",
    date: "2025-09-10",
    time: "Afternoon (3:00 PM - 7:00 PM)",
    guestCount: 150,
    package: "Essential Package",
    status: "pending",
    amount: "PKR 125,000",
    paymentStatus: "partial",
    createdAt: "2025-05-25",
    notes: "Will confirm final guest count 2 weeks before event",
    hallId: "hall2",
  },
  {
    id: "BK2003",
    eventType: "Birthday Celebration",
    date: "2025-07-05",
    time: "Afternoon (3:00 PM - 7:00 PM)",
    guestCount: 80,
    package: "Essential Package",
    status: "completed",
    amount: "PKR 125,000",
    paymentStatus: "paid",
    createdAt: "2025-04-15",
    notes: "Birthday cake was arranged by the venue",
    hallId: "hall3",
  },
]

// Package options
const packageOptions = [
  {
    id: "PKG001",
    name: "Essential Package",
    price: "PKR 125,000",
    features: ["Basic Hall Decoration", "Standard Lighting", "Buffet Service for 100 Guests"],
    description: "Perfect for smaller gatherings and simple celebrations.",
  },
  {
    id: "PKG002",
    name: "Premium Package",
    price: "PKR 225,000",
    features: ["Enhanced Hall Decoration", "Premium Lighting", "Buffet Service for 200 Guests", "DJ and Sound System"],
    description: "Our most popular package for medium-sized events with enhanced services.",
  },
  {
    id: "PKG003",
    name: "Royal Package",
    price: "PKR 350,000",
    features: [
      "Luxury Hall Decoration",
      "Customizable Lighting",
      "Buffet Service for 300 Guests",
      "Live Band",
      "Photography and Videography",
    ],
    description: "The ultimate luxury experience for your special day with all premium services included.",
  },
]

// Hall options with better images
const hallOptions = [
  {
    id: "hall1",
    name: "Royal Grand Hall",
    capacity: 500,
    description:
      "Our largest and most luxurious hall with elegant décor and state-of-the-art facilities. Perfect for grand weddings and large corporate events.",
    images: [
      "/placeholder.svg?height=600&width=800&text=Royal+Grand+Hall",
      "/placeholder.svg?height=600&width=800&text=Royal+Grand+Hall+2",
      "/placeholder.svg?height=600&width=800&text=Royal+Grand+Hall+3",
    ],
    basePrice: "PKR 150,000",
    features: [
      "500 Guest Capacity",
      "Grand Stage",
      "Premium Sound System",
      "Bridal Room",
      "VIP Lounge",
      "Valet Parking",
    ],
    size: "10,000 sq. ft.",
  },
  {
    id: "hall2",
    name: "Crystal Palace Hall",
    capacity: 350,
    description:
      "A medium-sized hall with beautiful crystal chandeliers and modern amenities. Ideal for medium-sized weddings and corporate functions.",
    images: [
      "/placeholder.svg?height=600&width=800&text=Crystal+Palace+Hall",
      "/placeholder.svg?height=600&width=800&text=Crystal+Palace+Hall+2",
      "/placeholder.svg?height=600&width=800&text=Crystal+Palace+Hall+3",
    ],
    basePrice: "PKR 120,000",
    features: ["350 Guest Capacity", "Crystal Chandeliers", "Modern Sound System", "Bridal Room", "Ample Parking"],
    size: "7,500 sq. ft.",
  },
  {
    id: "hall3",
    name: "Emerald Garden Hall",
    capacity: 200,
    description:
      "An intimate hall with garden-themed décor, perfect for smaller gatherings. Features a beautiful outdoor area for ceremonies and photography.",
    images: [
      "/placeholder.svg?height=600&width=800&text=Emerald+Garden+Hall",
      "/placeholder.svg?height=600&width=800&text=Emerald+Garden+Hall+2",
      "/placeholder.svg?height=600&width=800&text=Emerald+Garden+Hall+3",
    ],
    basePrice: "PKR 90,000",
    features: ["200 Guest Capacity", "Garden Theme", "Outdoor Ceremony Area", "Intimate Setting", "Private Parking"],
    size: "5,000 sq. ft.",
  },
]

// Hall amenities
const hallAmenities = [
  { name: "Air Conditioning", available: true },
  { name: "Parking Space", available: true },
  { name: "WiFi", available: true },
  { name: "Sound System", available: true },
  { name: "Stage", available: true },
  { name: "Catering", available: true },
  { name: "Decoration", available: true },
  { name: "Valet Parking", available: true },
  { name: "Bridal Room", available: true },
  { name: "Projector", available: true },
  { name: "Backup Generator", available: true },
  { name: "Prayer Room", available: true },
]

// Available dates (just for demo)
const availableDates = [
  "2025-07-01",
  "2025-07-02",
  "2025-07-03",
  "2025-07-05",
  "2025-07-06",
  "2025-07-08",
  "2025-07-09",
  "2025-07-10",
  "2025-07-12",
  "2025-07-15",
  "2025-07-18",
  "2025-07-20",
  "2025-07-22",
  "2025-07-25",
  "2025-07-28",
  "2025-07-30",
  "2025-08-01",
  "2025-08-03",
  "2025-08-05",
  "2025-08-08",
  "2025-08-10",
  "2025-08-12",
  "2025-08-15",
  "2025-08-18",
  "2025-08-20",
  "2025-08-22",
  "2025-08-25",
  "2025-08-28",
  "2025-08-30",
]

// Time slots
const timeSlots = [
  { id: "morning", label: "Morning (10:00 AM - 2:00 PM)" },
  { id: "afternoon", label: "Afternoon (3:00 PM - 7:00 PM)" },
  { id: "evening", label: "Evening (7:30 PM - 11:30 PM)" },
]

const CustomerDashboard = () => {
  const { user } = useAuth()
  const { showAlert } = useContext(AlertContext);
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancelBookingModal, setCancelBookingModal] = useState({
    isOpen: false,
    booking: null,
    isLoading: false
  })
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)
  const [halls, setHalls] = useState([])
  const [hallsLoading, setHallsLoading] = useState(true)
  const [hallsError, setHallsError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedHall, setSelectedHall] = useState(null)
  const [currentHallImageIndex, setCurrentHallImageIndex] = useState(0)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingForm, setBookingForm] = useState({
    eventType: "",
    date: "",
    time: "",
    guestCount: "",
    package: "",
    hallId: "",
    notes: "",
  })

  // Fetch user's bookings from the API
  const fetchBookings = async () => {
    if (!user) return

    try {
      setBookingsLoading(true)
      setBookingsError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get(`${API}/booking/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.status === 'success') {
        setBookings(response.data.data || [])
      } else {
        throw new Error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookingsError(error.message || 'Failed to load bookings')
      setBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }

  // Fetch halls data from the API
  const fetchHalls = async () => {
    try {
      setHallsLoading(true)
      setHallsError(null)
      
      const response = await axios.get(`${API}/hall`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Halls API response:', response.data)

      // Handle the actual API response format - it has a venues array
      if (response.data && response.data.venues && Array.isArray(response.data.venues)) {
        // Only show first 3 halls
        setHalls(response.data.venues.slice(0, 3))
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array format
        setHalls(response.data.slice(0, 3))
      } else if (response.data.status === 'success' && response.data.data) {
        // Fallback for expected format
        setHalls(response.data.data.slice(0, 3) || [])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching halls:', error)
      setHallsError(error.response?.data?.error || error.message || 'Failed to load halls')
      setHalls([])
    } finally {
      setHallsLoading(false)
    }
  }

  // Fetch bookings when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  // Fetch halls when component mounts
  useEffect(() => {
    fetchHalls()
  }, [])

  // Helper function to parse booking details
  const parseBookingDetails = (bookingDetailsString) => {
    try {
      return JSON.parse(bookingDetailsString || '{}')
    } catch {
      return {}
    }
  }

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const details = parseBookingDetails(booking.bookingDetails)
    const searchLower = searchQuery.toLowerCase()
    return (
      (details.eventType?.toLowerCase() || '').includes(searchLower) ||
      (booking.bookingId?.toLowerCase() || '').includes(searchLower) ||
      (booking.hall?.name?.toLowerCase() || '').includes(searchLower)
    )
  })

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.startDate)
    const today = new Date()
    return (booking.status === "approved" || booking.status === "pending") && bookingDate >= today
  })

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-IN", options)
  }

  const openBookingModal = (booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingForm({
      ...bookingForm,
      [name]: value,
    })
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setBookingForm({
      ...bookingForm,
      package: pkg.name,
    })
  }

  const handleHallSelect = (hall) => {
    setSelectedHall(hall)
    setBookingForm({
      ...bookingForm,
      hallId: hall.id,
    })
    setCurrentHallImageIndex(0)
  }

  const nextHallImage = () => {
    if (selectedHall) {
      setCurrentHallImageIndex((prevIndex) => (prevIndex === selectedHall.images.length - 1 ? 0 : prevIndex + 1))
    }
  }

  const prevHallImage = () => {
    if (selectedHall) {
      setCurrentHallImageIndex((prevIndex) => (prevIndex === 0 ? selectedHall.images.length - 1 : prevIndex - 1))
    }
  }

  const nextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    }
  }

  const prevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1)
    }
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send the booking request to the server
    alert("Booking request submitted! Our team will review and confirm your booking soon.")
    setBookingForm({
      eventType: "",
      date: "",
      time: "",
      guestCount: "",
      package: "",
      hallId: "",
      notes: "",
    })
    setSelectedPackage(null)
    setSelectedHall(null)
    setBookingStep(1)
  }

  const openCancelModal = (bookingId) => {
    const booking = bookings.find(b => b.bookingId === bookingId)
    setCancelBookingModal({
      isOpen: true,
      booking: booking,
      isLoading: false
    })
  }

  const closeCancelModal = () => {
    setCancelBookingModal({
      isOpen: false,
      booking: null,
      isLoading: false
    })
  }

  const confirmCancelBooking = async () => {
    if (!cancelBookingModal.booking) return

    setCancelBookingModal(prev => ({ ...prev, isLoading: true }))

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showAlert('Please login to cancel booking', 'failure')
        closeCancelModal()
        return
      }

      const response = await axios.delete(`${API}/booking/${cancelBookingModal.booking.bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        // Success case: Show message and close modal
        showAlert('Booking cancelled successfully', 'success')
        closeCancelModal()
        setIsModalOpen(false) // Close details modal if open
        
        // Refresh bookings in background (don't await to avoid delay)
        fetchBookings()
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data
        
        if (errorData.error === "Cancellation not allowed within 24 hours") {
          showAlert(
            `${errorData.message}\n\nYour event is only ${errorData.hoursUntilEvent || 0} hours away.`,
            'failure'
          )
        } else {
          showAlert(errorData.error || 'Cannot cancel this booking', 'failure')
        }
      } else if (error.response?.status === 403) {
        showAlert('You are not authorized to cancel this booking', 'failure')
      } else if (error.response?.status === 404) {
        showAlert('Booking not found', 'failure')
      } else {
        showAlert(
          error.response?.data?.error || 'Failed to cancel booking. Please try again.',
          'failure'
        )
      }
      
      // Error case: Only reset loading state (keep modal open for user to see error)
      setCancelBookingModal(prev => ({ ...prev, isLoading: false }))
    }
  }

  const getHallById = (id) => {
    return hallOptions.find((hall) => hall.id === id) || null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#FF477E]">Lahore Royal Palace</h1>
            <span className="ml-2 text-gray-500">Customer Portal</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#FF477E] text-white flex items-center justify-center font-medium">
                  {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                  <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex px-6 border-t border-gray-100">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "dashboard" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </div>
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "mybookings" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("mybookings")}
          >
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              My Bookings
            </div>
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "account" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("account")}
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              My Account
            </div>
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "support" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("support")}
          >
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support
            </div>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.name || 'User'}</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Upcoming Events</h3>
                  <Calendar className="h-5 w-5 text-[#FF477E]" />
                </div>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start animate-pulse">
                        <div className="flex-shrink-0 bg-gray-200 p-2 rounded-lg mr-3">
                          <div className="h-5 w-5 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookingsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-500 text-sm">{bookingsError}</p>
                    <button
                      onClick={fetchBookings}
                      className="mt-2 text-[#FF477E] hover:text-[#9D2235] font-medium text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 3).map((booking) => {
                      const details = parseBookingDetails(booking.bookingDetails)
                      return (
                        <div key={booking.bookingId} className="flex items-start">
                        <div className="flex-shrink-0 bg-[#FF477E]/10 p-2 rounded-lg mr-3">
                          <CalendarIcon className="h-5 w-5 text-[#FF477E]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{details.eventType || 'Event'}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.startDate)}</p>
                            <p className="text-xs text-gray-500 mt-1">{booking.timeSlotLabel}</p>
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full 
                              ${
                                  booking.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                    <button
                      className="text-[#FF477E] hover:text-[#9D2235] font-medium text-sm"
                      onClick={() => setActiveTab("mybookings")}
                    >
                      View All Bookings
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No upcoming events</p>
                    <p className="mt-2 text-gray-400 text-sm">
                      Contact us to book your next event
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Quick Actions</h3>
                  <Settings className="h-5 w-5 text-[#FF477E]" />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("mybookings")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-[#FF477E] mr-3" />
                      <span className="text-sm font-medium">View My Bookings</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab("mybookings")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-[#FF477E] mr-3" />
                      <span className="text-sm font-medium">View My Bookings</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-[#FF477E] mr-3" />
                      <span className="text-sm font-medium">My Account</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-[#FF477E] mr-3" />
                      <span className="text-sm font-medium">Contact Support</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hall Gallery Preview */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Our Halls</h3>
              </div>
              <div className="p-6">
                {hallsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg overflow-hidden shadow-md animate-pulse">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-4 bg-white">
                          <div className="flex justify-between items-center mb-2">
                            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded mb-3"></div>
                          <div className="h-8 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : hallsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{hallsError}</p>
                    <button
                      onClick={fetchHalls}
                      className="px-4 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : halls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {halls.map((hall) => {
                      // Parse hall images - API returns comma-separated URLs in 'image' field
                      const hallImages = hall.image ? 
                        hall.image.split(',').map(url => url.trim()).filter(url => url) : 
                        ["/placeholder.svg"]
                      
                      return (
                    <div key={hall.id} className="rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden">
                        <img
                              src={hallImages[0] || "/placeholder.svg"}
                          alt={hall.name}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg"
                              }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-4 text-white">
                            <h4 className="font-semibold text-lg">{hall.name}</h4>
                            <p className="text-sm opacity-90">Up to {hall.capacity} guests</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-900">PKR {hall.price?.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">{hall.location}</span>
                        </div>
                            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                                <span className="text-yellow-400 text-sm">★</span>
                                <span className="text-sm text-gray-600 ml-1">
                                  {hall.rating > 0 ? hall.rating.toFixed(1) : 'No rating'}
                                </span>
                                <span className="text-xs text-gray-400 ml-1">
                                  ({hall.reviewCount} reviews)
                                </span>
                </div>
                              {hall.featured && (
                                <span className="text-xs bg-[#FF477E] text-white px-2 py-1 rounded">
                                  Featured
                                </span>
                            )}
                          </div>
                            <a
                              href={`/hall/${hall.id}`}
                              className="block w-full py-2 bg-[#FF477E] text-white rounded-md font-medium text-sm hover:bg-[#9D2235] transition-colors text-center"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      )
                    })}
                      </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No halls available at the moment.</p>
              </div>
            )}
                </div>
                      </div>
                    </div>
        )}


        {activeTab === "mybookings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">All Bookings</h3>
                </div>
              
              {bookingsLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            </div>
                          ))}
                        </div>
                      </div>
              ) : bookingsError ? (
                <div className="py-8 text-center">
                  <p className="text-red-500">{bookingsError}</p>
                    <button
                    onClick={fetchBookings}
                    className="mt-4 px-4 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                  >
                    Retry Loading
                    </button>
                  </div>
              ) : (
                <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hall
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guests
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => {
                          const details = parseBookingDetails(booking.bookingDetails)
                          return (
                            <tr key={booking.bookingId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.bookingId.substring(0, 8)}...
                              </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {details.eventType || 'Event'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.hall?.name || "N/A"}
                        </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  <div>{formatDate(booking.startDate)}</div>
                                  <div className="text-xs text-gray-400">{booking.timeSlotLabel}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.guests}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                PKR {booking.price?.toLocaleString()}
                              </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                                    booking.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                        : booking.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : booking.status === "cancelled"
                                            ? "bg-gray-100 text-gray-700"
                                            : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="text-[#FF477E] hover:text-[#9D2235] font-medium mr-3"
                            onClick={() => openBookingModal(booking)}
                          >
                            View
                          </button>
                                {(booking.status === "approved" || booking.status === "pending") && (
                            <button
                              className="text-red-600 hover:text-red-800 font-medium"
                                    onClick={() => openCancelModal(booking.bookingId)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                          )
                        })}
                  </tbody>
                </table>
              </div>
                  {filteredBookings.length === 0 && !bookingsLoading && (
                <div className="py-8 text-center">
                      <p className="text-gray-500">
                        {searchQuery ? "No bookings found matching your search." : "No bookings found."}
                      </p>
                      {searchQuery && (
                            <button
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-[#FF477E] hover:text-[#9D2235] font-medium text-sm"
                        >
                          Clear search
                            </button>
                      )}
                          </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}


        {activeTab === "account" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Account</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
                  </div>
                  <div className="p-6">
                    <form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            defaultValue={user?.name || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            defaultValue={user?.email || ''}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            defaultValue={user?.phone || ''}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            value={user?.role || 'Customer'}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                        >
                          Update Information
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Change Password</h3>
                  </div>
                  <div className="p-6">
                    <form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="md:col-span-2"></div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                        >
                          Change Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Account Summary</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-[#FF477E] text-white flex items-center justify-center text-xl font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-800">{user?.name || 'User'}</h4>
                        <p className="text-sm text-gray-500">Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Bookings</span>
                        <span className="text-sm font-medium text-gray-900">{bookings.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Upcoming Events</span>
                        <span className="text-sm font-medium text-gray-900">{upcomingBookings.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Approved Events</span>
                        <span className="text-sm font-medium text-gray-900">
                          {bookings.filter((b) => b.status === "approved").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Pending Events</span>
                        <span className="text-sm font-medium text-gray-900">
                          {bookings.filter((b) => b.status === "pending").length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3">
                        <span className="text-sm text-gray-600">Cancelled Events</span>
                        <span className="text-sm font-medium text-gray-900">
                          {bookings.filter((b) => b.status === "cancelled").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            className="h-4 w-4 text-[#FF477E] focus:ring-[#FF477E] border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                            Email Notifications
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="sms-notifications"
                            type="checkbox"
                            className="h-4 w-4 text-[#FF477E] focus:ring-[#FF477E] border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                            SMS Notifications
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="promotional-emails"
                            type="checkbox"
                            className="h-4 w-4 text-[#FF477E] focus:ring-[#FF477E] border-gray-300 rounded"
                          />
                          <label htmlFor="promotional-emails" className="ml-2 block text-sm text-gray-700">
                            Promotional Emails
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="px-6 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235] w-full">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Support & Help</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Contact Us</h3>
                  </div>
                  <div className="p-6">
                    <form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            defaultValue={user?.name || ''}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            defaultValue={user?.email || ''}
                            readOnly
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            placeholder="Enter subject"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                            rows="6"
                            placeholder="How can we help you?"
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Contact Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-[#FF477E] mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Phone</p>
                          <p className="text-sm text-gray-600">+92 300 1234567</p>
                          <p className="text-sm text-gray-600">+92 42 35678901</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-[#FF477E] mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Email</p>
                          <p className="text-sm text-gray-600">support@royalpalace.pk</p>
                          <p className="text-sm text-gray-600">info@royalpalace.pk</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-[#FF477E] mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Support Hours</p>
                          <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                          <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                          <p className="text-sm text-gray-600">Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">FAQs</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">How do I book the hall?</h4>
                        <p className="text-sm text-gray-600">
                          You can book the hall by filling out the booking form in the "Book Hall" section. Our team
                          will review your request and confirm availability.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">What is the cancellation policy?</h4>
                        <p className="text-sm text-gray-600">
                          Full refund if cancelled 30+ days before event, 50% refund if cancelled 15-29 days before
                          event, and no refund for cancellations less than 15 days before event.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">Can I customize the packages?</h4>
                        <p className="text-sm text-gray-600">
                          Yes, all our packages can be customized to suit your specific requirements. Please contact our
                          team for personalized options.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-1">
                          Is catering included in the packages?
                        </h4>
                        <p className="text-sm text-gray-600">
                          Yes, all packages include catering services with various menu options. You can discuss
                          specific dietary requirements with our team.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a href="#" className="text-[#FF477E] hover:text-[#9D2235] font-medium text-sm">
                        View All FAQs
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Booking Details</h3>
            </div>
            <div className="p-6">
              {(() => {
                const details = parseBookingDetails(selectedBooking.bookingDetails)
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking ID</p>
                      <p className="text-gray-800">{selectedBooking.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                      <p className="text-gray-800">{details.eventType || 'Event'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hall</p>
                      <p className="text-gray-800">{selectedBooking.hall?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-gray-800">{formatDate(selectedBooking.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                      <p className="text-gray-800">{selectedBooking.timeSlotLabel}</p>
                </div>
                <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-gray-800">{selectedBooking.duration} hours</p>
                </div>
                <div>
                      <p className="text-sm font-medium text-gray-500">Guest Count</p>
                      <p className="text-gray-800">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-gray-800">PKR {selectedBooking.price?.toLocaleString()}</p>
                </div>
                <div>
                      <p className="text-sm font-medium text-gray-500">Booking Date</p>
                      <p className="text-gray-800">{formatDate(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-gray-800">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                            selectedBooking.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedBooking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                                : selectedBooking.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : selectedBooking.status === "cancelled"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </p>
                </div>
                    {details.contactName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Name</p>
                        <p className="text-gray-800">{details.contactName}</p>
                      </div>
                    )}
                    {details.contactPhone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                        <p className="text-gray-800">{details.contactPhone}</p>
                      </div>
                    )}
                <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500">Special Requests</p>
                      <p className="text-gray-800">{details.specialRequests || "No special requests"}</p>
                </div>
              </div>
                )
              })()}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <div>
                {(selectedBooking.status === "approved" || selectedBooking.status === "pending") && (
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    onClick={() => {
                      openCancelModal(selectedBooking.bookingId)
                    }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg flex items-center"
                  onClick={() => {
                    // In a real app, this would generate and download an invoice
                    alert("Invoice download functionality would be implemented here")
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoice
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancelBookingModal.isOpen && cancelBookingModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Cancel Booking</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              {(() => {
                const bookingDetails = parseBookingDetails(cancelBookingModal.booking.bookingDetails)
                return (
                  <>
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Event:</span>
                        <span className="text-sm text-gray-900">{bookingDetails.eventType || 'Event'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(cancelBookingModal.booking.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Time:</span>
                        <span className="text-sm text-gray-900">{cancelBookingModal.booking.timeSlotLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          cancelBookingModal.booking.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cancelBookingModal.booking.status.charAt(0).toUpperCase() + cancelBookingModal.booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Amount:</span>
                        <span className="text-sm text-gray-900 font-medium">PKR {cancelBookingModal.booking.price?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Policy Notice */}
                    <div className={`rounded-lg p-3 mb-4 ${
                      cancelBookingModal.booking.status === 'approved' 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-start">
                        <svg className={`w-5 h-5 mt-0.5 mr-2 ${
                          cancelBookingModal.booking.status === 'approved' ? 'text-amber-600' : 'text-blue-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className={`text-sm font-medium ${
                            cancelBookingModal.booking.status === 'approved' ? 'text-amber-800' : 'text-blue-800'
                          }`}>
                            {cancelBookingModal.booking.status === 'approved' 
                              ? 'Cancellation Policy' 
                              : 'Cancellation Info'
                            }
                          </p>
                          <p className={`text-sm ${
                            cancelBookingModal.booking.status === 'approved' ? 'text-amber-700' : 'text-blue-700'
                          }`}>
                            {cancelBookingModal.booking.status === 'approved' 
                              ? 'Approved bookings cannot be cancelled within 24 hours of the event.' 
                              : 'Pending bookings can be cancelled anytime without restrictions.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={closeCancelModal}
                disabled={cancelBookingModal.isLoading}
              >
                Keep Booking
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirmCancelBooking}
                disabled={cancelBookingModal.isLoading}
              >
                {cancelBookingModal.isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard
