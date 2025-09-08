
"use client"

import { useState } from "react"
import { AlertContext } from "../context/AlertContext"
import { useContext } from "react"
import {
  Calendar,
  DollarSign,
  XCircle,
  AlertCircle,
  ChevronDown,
  Filter,
  Search,
  BarChart2,
  TrendingUp,
  CalendarIcon,
  Upload,
  X,
} from "lucide-react"
import axios from "axios"
import { useEffect } from "react"
// Update the bookingsData array with Pakistani names, numbers, and prices
const bookingsData = [
  {
    id: "BK1001",
    customerName: "Ahmed Khan",
    eventType: "Wedding Reception",
    date: "2025-06-15",
    time: "Evening (7:30 PM - 11:30 PM)",
    guestCount: "300-400",
    package: "Premium Package",
    status: "pending",
    amount: "PKR 225,000",
    createdAt: "2025-05-20",
    contactInfo: {
      email: "ahmed.khan@gmail.com",
      phone: "+92 301 2345678",
    },
  },
  {
    id: "BK1002",
    customerName: "Fatima Malik",
    eventType: "Corporate Event",
    date: "2025-06-22",
    time: "Morning (10:00 AM - 2:00 PM)",
    guestCount: "100-200",
    package: "Essential Package",
    status: "approved",
    amount: "PKR 125,000",
    createdAt: "2025-05-18",
    contactInfo: {
      email: "fatima.malik@gmail.com",
      phone: "+92 333 8765432",
    },
  },
  {
    id: "BK1003",
    customerName: "Usman Ali",
    eventType: "Birthday Celebration",
    date: "2025-07-05",
    time: "Afternoon (3:00 PM - 7:00 PM)",
    guestCount: "50-100",
    package: "Essential Package",
    status: "rejected",
    amount: "PKR 125,000",
    createdAt: "2025-05-15",
    contactInfo: {
      email: "usman.ali@gmail.com",
      phone: "+92 321 7654321",
    },
    rejectionReason: "Double booking conflict",
  },
  {
    id: "BK1004",
    customerName: "Ayesha Imran",
    eventType: "Engagement",
    date: "2025-07-12",
    time: "Evening (7:30 PM - 11:30 PM)",
    guestCount: "200-300",
    package: "Royal Package",
    status: "pending",
    amount: "PKR 350,000",
    createdAt: "2025-05-22",
    contactInfo: {
      email: "ayesha.imran@gmail.com",
      phone: "+92 345 6543210",
    },
  },
  {
    id: "BK1005",
    customerName: "Zain Mahmood",
    eventType: "Wedding",
    date: "2025-07-18",
    time: "Morning (10:00 AM - 2:00 PM)",
    guestCount: "400-500",
    package: "Royal Package",
    status: "approved",
    amount: "PKR 350,000",
    createdAt: "2025-05-10",
    contactInfo: {
      email: "zain.mahmood@gmail.com",
      phone: "+92 300 5432109",
    },
  },
  {
    id: "BK1006",
    customerName: "Sana Riaz",
    eventType: "Corporate Event",
    date: "2025-07-25",
    time: "Afternoon (3:00 PM - 7:00 PM)",
    guestCount: "100-200",
    package: "Essential Package",
    status: "pending",
    amount: "PKR 125,000",
    createdAt: "2025-05-25",
    contactInfo: {
      email: "sana.riaz@gmail.com",
      phone: "+92 311 4321098",
    },
  },
]


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [bookings, setBookings] = useState(bookingsData)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [hallImages, setHallImages] = useState([
    "/placeholder.svg?height=300&width=500",
    "/placeholder.svg?height=300&width=500",
  ])
  const [name, setName] = useState("Lahore Royal Palace Banquet Hall")
  const [contactEmail, setContactEmail] = useState("contact@royalpalace.pk")
  const [contactPhone, setContactPhone] = useState("+92 300 1234567")
  const [description, setDescription] = useState("Lahore Royal Palace Banquet Hall has been ...")
  const [addressLine, setAddressLine] = useState("123 Main Street, Model Town")
  const [city, setCity] = useState("Lahore")
  const [stateProv, setStateProv] = useState("Punjab")
  const [postalCode, setPostalCode] = useState("54000")
  const [capacity, setCapacity] = useState(300)
  const [price, setPrice] = useState(225000)
  const { showAlert } = useContext(AlertContext);
  const [myHalls, setMyHalls] = useState([]);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [deletingHallId, setDeletingHallId] = useState(null);
  // EDIT state
  const [editHallId, setEditHallId] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [originalAddressId, setOriginalAddressId] = useState(null);
  // Base API
  const API = 'http://localhost:3000/api/v1';


  // IMPORTANT: load real amenities from backend
  const [amenities, setAmenities] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const asArray = (imageURLs) =>
  Array.isArray(imageURLs)
    ? imageURLs
    : String(imageURLs || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const approvedBookings = bookings.filter((booking) => booking.status === "approved")
  const rejectedBookings = bookings.filter((booking) => booking.status === "rejected")


  const handleApproveBooking = (id) => {
    setBookings(bookings.map((booking) => (booking.id === id ? { ...booking, status: "approved" } : booking)))
    setIsModalOpen(false)
  }

  const loadHallForEdit = async (rowHall) => {
    try {
      setLoadingEdit(true);
      setEditHallId(rowHall.hallId);
      setActiveTab('editHall'); // navigate to the Edit tab

      // 1) Get fresh hall (in case list is light)
      const { data: hallData } = await axios.get(`${API}/hall/${rowHall.hallId}`);
      const hall = hallData?.hall ?? hallData;

      // 2) Address info (either in hall.address or fetch)
      let addr = hall?.address;
      if (!addr?.addressId && hall?.addressId) {
        const { data } = await axios.get(`${API}/address/${hall.addressId}`);
        addr = data?.address ?? data;
      }

      // 3) Hall amenities (ids only)
      const { data: amData } = await axios.get(`${API}/hall/${rowHall.hallId}/amenities`);
      const hallAmenityIds = (amData?.amenities ?? amData ?? []).map((a) =>
        a.amenityId || a.amenity?.amenityId
      );

      // 4) Fill your existing state (reusing the Create form state)
      setName(hall?.name || '');
      setDescription(hall?.description || '');
      setCapacity(hall?.capacity ?? 0);
      setPrice(hall?.price ?? 0);
      setHallImages(asArray(hall?.imageURLs)); // make it string[]

      setAddressLine(addr?.addressLine || '');
      setCity(addr?.city || '');
      setStateProv(addr?.state || '');
      setPostalCode(addr?.postalCode || ''); // if you store it
      setOriginalAddressId(addr?.addressId || hall?.addressId || null);

      // all amenities list should already be loaded in useEffect; if not, fetch here too
      if (amenities.length === 0) {
        const { data } = await axios.get(`${API}/amenity`);
        setAmenities(data?.amenities ?? data ?? []);
      }
      setSelectedAmenities(hallAmenityIds);
    } catch (e) {
      console.error(e);
      showAlert('Failed to load hall for edit.', 'failure');
      setActiveTab('myhalls');
    } finally {
      setLoadingEdit(false);
    }
  };


  const handleRejectBooking = (id) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setBookings(
      bookings.map((booking) => (booking.id === id ? { ...booking, status: "rejected", rejectionReason } : booking)),
    )
    setIsModalOpen(false)
    setRejectionReason("")
  }

  const openBookingModal = (booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-IN", options)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // enforce 5-image cap
    if (hallImages.length + files.length > 5) {
      showAlert(`You can upload ${5 - hallImages.length} more image(s).`, "failure");
      return;
    }

    // optional type/size guard in FE too
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        showAlert(`Invalid type for ${f.name}. Only JPG/PNG/WEBP allowed.`, "failure");
        return;
      }
      if (f.size > 2 * 1024 * 1024) {
        showAlert(`${f.name} is larger than 2MB.`, "failure");
        return;
      }
    }

    try {
      const form = new FormData();
      files.forEach(f => form.append('images', f));

      const res = await axios.post(
        'http://localhost:3000/api/v1/upload/hall-images',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const urls = res.data?.urls ?? [];
      if (!urls.length) {
        showAlert("No images uploaded.", "failure");
        return;
      }
      // store real public URLs
      setHallImages(prev => [...prev, ...urls].slice(0, 5));
      showAlert("Images uploaded.", "success");
    } catch (err) {
      console.error(err);
      showAlert("Failed to upload images.", "failure");
    }
  };

  const handleDeleteHall = async (hall) => {
    if (!token) { showAlert("You must be logged in as Hall Manager.", "failure"); return; }
    const ok = confirm(`Delete hall "${hall.name}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingHallId(hall.hallId);

    // Optimistic UI: remove immediately
    const prev = [...myHalls];
    setMyHalls(myHalls.filter(h => h.hallId !== hall.hallId));

    try {
      // 1) Delete hall in backend
      await axios.delete(`${API}/hall/${hall.hallId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert("Hall deleted.", "success");
    } catch (err) {
      console.error(err);
      // Rollback on failure
      setMyHalls(prev);
      const msg = err?.response?.data?.error || "Failed to delete hall";
      showAlert(msg, "failure");
    } finally {
      setDeletingHallId(null);
    }
  };

  const handleUpdate = async () => {
  if (!token) { showAlert("You must be logged in as Hall Manager.", "failure"); return; }
  if (!editHallId) { showAlert("No hall selected.", "failure"); return; }
  if (!name.trim() || !description.trim() || !addressLine.trim()) {
    showAlert("Please fill all required fields.", "failure"); return;
  }
  if (selectedAmenities.length === 0) {
    const ok = confirm("No amenities selected. Continue?");
    if (!ok) return;
  }

  setSaving(true);
  try {
    // 1) Update address (idempotent; safer than diffing for viva)
    if (!originalAddressId) {
      showAlert("Missing address id on hall.", "failure");
      setSaving(false);
      return;
    }
    const addrPayload = {
      addressLine,
      city,
      state: stateProv,
      country: "Pakistan",
      postalCode
    };
    await axios.put(`${API}/address/${originalAddressId}`, addrPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2) Update hall
    const payload = {
      name,
      description,
      capacity: Number.isFinite(capacity) ? capacity : 0,
      price: Number.isFinite(price) ? price : 0,
      imageURLs: hallImages,            // string[]
      addressId: originalAddressId,     // keep linkage
      amenities: selectedAmenities      // string[] amenityIds
      // status: (optional) keep as-is or expose a selector
    };

    await axios.put(`${API}/hall/${editHallId}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    showAlert("Hall updated successfully!", "success");
    // Refresh list and go back
    await fetchOwnedHalls();
    setActiveTab('myhalls');
  } catch (err) {
    console.error(err);
    const msg = err?.response?.data?.error || "Failed to update hall";
    showAlert(msg, "failure");
  } finally {
    setSaving(false);
  }
};



  const removeImage = async (index) => {
    const url = hallImages[index];
    // If it's a server URL, ask backend to delete the file
    const looksServerHosted = typeof url === 'string' && url.includes('/uploads/halls/');

    // Optimistic UI update
    const prev = [...hallImages];
    const updated = [...hallImages];
    updated.splice(index, 1);
    setHallImages(updated);

    if (!looksServerHosted) return; // placeholders / local previews don't need server delete

    try {
      await axios.post(
        'http://localhost:3000/api/v1/upload/hall-images/delete',
        { urls: [url] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('Image removed.', 'success');
    } catch (err) {
      console.error(err);
      // Rollback
      setHallImages(prev);
      showAlert('Failed to delete image on server.', 'failure');
    }
  };


  // Helper: PKR format
  const pkr = (n) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(n || 0));

  // Helper: first image (backend stores comma-separated string)
  const firstImage = (imageURLs) => {
    if (!imageURLs) return '/placeholder.svg?height=80&width=120';
    if (Array.isArray(imageURLs)) return imageURLs[0] || '/placeholder.svg?height=80&width=120';
    const first = String(imageURLs).split(',').map(s => s.trim()).filter(Boolean)[0];
    return first || '/placeholder.svg?height=80&width=120';
  };

  // NEW: fetch owned halls
  const fetchOwnedHalls = async () => {
    if (!token) { showAlert("You must be logged in as Hall Manager.", "failure"); return; }
    setHallsLoading(true);
    try {
      const { data } = await axios.get(`${API}/hall/owned/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // depending on your controller shape
      const halls = data?.halls ?? data ?? [];
      setMyHalls(halls);
    } catch (e) {
      console.error(e);
      showAlert("Failed to load your halls.", "failure");
    } finally {
      setHallsLoading(false);
    }
  };

  // auth (adjust to your actual auth storage)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/v1/amenity")
        setAmenities(data?.amenities ?? data) // depending on your controller shape
        console.log(amenities)
        // (optionally) pre-select some:
        // setSelectedAmenities(data.slice(0,6).map((a:any)=>a.amenityId))
      } catch (e) {
        console.error("Failed to load amenities", e)
        alert("Could not load amenities. Please refresh.")
      }
    }
    loadAmenities()

    if (activeTab === 'myhalls') fetchOwnedHalls();
  }, [activeTab])

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!token) { alert("You must be logged in as Hall Manager."); return }
    if (!name.trim() || !description.trim() || !addressLine.trim()) {
      alert("Please fill all required fields."); return
    }
    if (selectedAmenities.length === 0) {
      if (!confirm("No amenities selected. Continue?")) return
    }
    setSaving(true)
    try {
      // 1) Create/ensure Address
      const addrPayload = {
        addressLine,
        city,
        state: stateProv,
        country: "Pakistan",
        postalCode
      }
      const addrRes = await axios.post("http://localhost:3000/api/v1/address", addrPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const addressId = addrRes.data?.address?.addressId ?? addrRes.data.newAddress?.addressId

      // 2) Prepare hall payload (controller joins array to comma-separated string)
      const payload = {
        name,
        description,
        capacity: Number.isFinite(capacity) ? capacity : 0,
        price: Number.isFinite(price) ? price : 0,
        imageURLs: hallImages, // string[]
        addressId,
        status: "pending",
        amenities: selectedAmenities // string[] of amenityId
      }

      const hallRes = await axios.post("http://localhost:3000/api/v1/hall", payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showAlert("Hall created successfully!", "success")
      // TODO: navigate to your “Owned Halls” or reset form
    } catch (err) {
      console.error(err)
      // Surface server message if available
      showAlert("Failed to create Hall", "failure")
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#FF477E]">Lahore Royal Palace</h1>
            <span className="ml-2 text-gray-500">Hall Manager</span>
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
              <img
                src="/placeholder.svg?height=40&width=40"
                alt="Admin"
                className="h-10 w-10 rounded-full border-2 border-[#FF477E]"
              />
              <div>
                <p className="font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Hall Manager</p>
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
            Dashboard
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "bookings" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "settings" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("settings")}
          >
            Create Hall
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === "myhalls" ? "text-[#FF477E] border-b-2 border-[#FF477E]" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("myhalls")}
          >
            Manage Halls
          </button>

        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>12% increase this month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{pendingBookings.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-yellow-600">
                  <button
                    className="underline"
                    onClick={() => {
                      setActiveTab("bookings")
                      setFilterStatus("pending")
                    }}
                  >
                    Review pending bookings
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>8% increase this month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg. Booking Value</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
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
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.eventType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="text-[#FF477E] hover:text-[#9D2235] font-medium"
                            onClick={() => openBookingModal(booking)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  className="text-[#FF477E] hover:text-[#9D2235] font-medium text-sm"
                  onClick={() => setActiveTab("bookings")}
                >
                  View All Bookings
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-gray-900">{approvedBookings.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(approvedBookings.length / bookings.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Pending</span>
                      <span className="text-sm font-medium text-gray-900">{pendingBookings.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(pendingBookings.length / bookings.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Rejected</span>
                      <span className="text-sm font-medium text-gray-900">{rejectedBookings.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(rejectedBookings.length / bookings.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Popular Event Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FF477E] mr-2"></div>
                    <span className="text-sm text-gray-600">Wedding Reception</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#9D2235] mr-2"></div>
                    <span className="text-sm text-gray-600">Corporate Event</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">25%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Birthday Celebration</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">15%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">10%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Other</span>
                    <span className="ml-auto text-sm font-medium text-gray-900">5%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {approvedBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-start">
                      <div className="flex-shrink-0 bg-[#FF477E]/10 p-2 rounded-lg mr-3">
                        <CalendarIcon className="h-5 w-5 text-[#FF477E]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.eventType}</p>
                        <p className="text-xs text-gray-500">{formatDate(booking.date)}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.customerName}</p>
                      </div>
                    </div>
                  ))}

                  <button
                    className="text-[#FF477E] hover:text-[#9D2235] font-medium text-sm"
                    onClick={() => setActiveTab("calendar")}
                  >
                    View Full Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Bookings</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Bookings</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">More Filters</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package
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
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.eventType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.package}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
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
                          {booking.status === "pending" && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800 font-medium mr-3"
                                onClick={() => handleApproveBooking(booking.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 font-medium"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsModalOpen(true)
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No bookings found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Hall Settings</h2>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Hall Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input type="number" min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E]"
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value || "0"))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (PKR)</label>
                    <input type="number" min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E]"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value || "0"))}
                    />
                  </div>



                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      rows={4}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Lahore Royal Palace Banquet Hall has been creating memorable celebrations for over a decade. Established in 2010, our venue has hosted more than 3,000 successful events including glamorous weddings, corporate galas, and milestone celebrations. Located in the heart of Lahore, we pride ourselves on exceptional service and attention to detail."
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Address Line</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          placeholder="123 Main Street, Model Town"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">City</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          defaultValue="Lahore"
                        >
                          <option value="Karachi">Karachi</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Multan">Multan</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Quetta">Quetta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">State/Province</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          defaultValue="Punjab"
                        >
                          <option value="Punjab">Punjab</option>
                          <option value="Sindh">Sindh</option>
                          <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                          <option value="Balochistan">Balochistan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          placeholder="54000"
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          value="Pakistan"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Hall Amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {amenities.map((amenity) => {
                      const checked = selectedAmenities.includes(amenity.amenityId)
                      return (
                        <div key={amenity.amenityId} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity.amenityId}`}
                            checked={checked}
                            onChange={() => {
                              setSelectedAmenities(checked
                                ? selectedAmenities.filter(id => id !== amenity.amenityId)
                                : [...selectedAmenities, amenity.amenityId])
                            }}
                            className="mt-1"
                          />
                          <label htmlFor={`amenity-${amenity.amenityId}`} className="text-sm">
                            <div className="font-medium text-gray-800">{amenity.name}</div>
                            <div className="text-xs text-gray-500">{amenity.description}</div>
                          </label>
                        </div>
                      )
                    })}
                  </div>

                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Hall Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hallImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Hall image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {hallImages.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48 bg-gray-50">
                        <label className="cursor-pointer flex flex-col items-center p-4">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload Image</span>
                          <span className="text-xs text-gray-400 mt-1">({5 - hallImages.length} remaining)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            multiple={5 - hallImages.length > 1}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 5 images of your hall. Recommended size: 1200x800 pixels.
                  </p>
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="px-6 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>


          </div>
        )}

        {activeTab === "myhalls" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Halls</h2>
              <button
                onClick={fetchOwnedHalls}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {hallsLoading && (
                      <tr>
                        <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>Loading your halls…</td>
                      </tr>
                    )}

                    {!hallsLoading && myHalls.length === 0 && (
                      <tr>
                        <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>No halls yet. Create one from “Create Hall”.</td>
                      </tr>
                    )}

                    {!hallsLoading && myHalls.map((h) => (
                      <tr key={h.hallId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={firstImage(h.imageURLs)}
                              alt={h.name}
                              className="h-16 w-24 object-cover rounded border border-gray-200 mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{h.name}</div>
                              <div className="text-xs text-gray-500">{h.address?.city || h.address?.state || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{h.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{pkr(h.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${h.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : h.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"}`}>
                            {h.status || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            className="mr-3 text-blue-600 hover:text-blue-800 font-medium"
                            onClick={() => loadHallForEdit(h)}
                          >
                            Edit
                          </button>

                          <button
                            className={`text-red-600 hover:text-red-800 font-medium ${deletingHallId === h.hallId ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={deletingHallId === h.hallId}
                            onClick={() => handleDeleteHall(h)}
                          >
                            {deletingHallId === h.hallId ? 'Deleting…' : 'Delete'}
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "editHall" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {loadingEdit ? 'Loading…' : `Edit Hall`}
              </h2>
              <div className="space-x-2">
                <button
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setActiveTab('myhalls')}
                >
                  Back to My Halls
                </button>
                <button
                  className="px-4 py-2 bg-[#FF477E] text-white rounded-lg hover:bg-[#9D2235]"
                  disabled={saving || loadingEdit || !editHallId}
                  onClick={() => handleUpdate()}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>



            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Hall Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                   
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input type="number" min={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E]"
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value || "0"))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (PKR)</label>
                    <input type="number" min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E]"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value || "0"))}
                    />
                  </div>



                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                      rows={4}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Address Line</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                         value={addressLine}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">City</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          defaultValue="Lahore"
                        >
                          <option value="Karachi">Karachi</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Multan">Multan</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Quetta">Quetta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">State/Province</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          defaultValue="Punjab"
                        >
                          <option value="Punjab">Punjab</option>
                          <option value="Sindh">Sindh</option>
                          <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                          <option value="Balochistan">Balochistan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          defaultValue="54000"
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                          value="Pakistan"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Hall Amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {amenities.map((amenity) => {
                      const checked = selectedAmenities.includes(amenity.amenityId)
                      return (
                        <div key={amenity.amenityId} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={`amenity-${amenity.amenityId}`}
                            checked={checked}
                            onChange={() => {
                              setSelectedAmenities(checked
                                ? selectedAmenities.filter(id => id !== amenity.amenityId)
                                : [...selectedAmenities, amenity.amenityId])
                            }}
                            className="mt-1"
                          />
                          <label htmlFor={`amenity-${amenity.amenityId}`} className="text-sm">
                            <div className="font-medium text-gray-800">{amenity.name}</div>
                            <div className="text-xs text-gray-500">{amenity.description}</div>
                          </label>
                        </div>
                      )
                    })}
                  </div>

                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Hall Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hallImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Hall image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {hallImages.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48 bg-gray-50">
                        <label className="cursor-pointer flex flex-col items-center p-4">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Upload Image</span>
                          <span className="text-xs text-gray-400 mt-1">({5 - hallImages.length} remaining)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            multiple={5 - hallImages.length > 1}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload up to 5 images of your hall. Recommended size: 1200x800 pixels.
                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking ID</p>
                  <p className="text-gray-800">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                  <p className="text-gray-800">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                  <p className="text-gray-800">{selectedBooking.eventType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-gray-800">
                    {formatDate(selectedBooking.date)}, {selectedBooking.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Guest Count</p>
                  <p className="text-gray-800">{selectedBooking.guestCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Package</p>
                  <p className="text-gray-800">{selectedBooking.package}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-gray-800">{selectedBooking.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-gray-800">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedBooking.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedBooking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-800">{selectedBooking.contactInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-800">{selectedBooking.contactInfo.phone}</p>
                </div>
                {selectedBooking.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                    <p className="text-gray-800">{selectedBooking.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                onClick={() => {
                  setIsModalOpen(false)
                  setRejectionReason("")
                }}
              >
                Close
              </button>
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    onClick={() => handleApproveBooking(selectedBooking.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    onClick={() => {
                      if (selectedBooking) {
                        setSelectedBooking(selectedBooking)
                        setIsModalOpen(true)
                      }
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
            {selectedBooking.status === "pending" && (
              <div className="px-6 py-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                  Rejection Reason:
                </label>
                <textarea
                  id="rejectionReason"
                  rows="3"
                  className="shadow-sm focus:ring-[#FF477E] focus:border-[#FF477E] mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this booking."
                ></textarea>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    onClick={() => handleRejectBooking(selectedBooking.id)}
                  >
                    Reject Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

