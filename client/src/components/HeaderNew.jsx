import { useState } from "react";
import { FiMenu, FiX, FiUser, FiHeart } from "react-icons/fi";
import { motion } from "framer-motion";
import logo from "../../public/favicon.png";
import { useAuth } from "../context/AuthContext"; // Ensure the path is correct}
import { useNavigate } from "react-router-dom";
const Header = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Access the user from AuthContext
  const isLoggedIn = !!user; // Check if the user is logged in
  const navigate = useNavigate(); // Use the useNavigate hook
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Venues", href: "/venues" },
    { name: "Services", href: "/services" },
    { name: "Locations", href: "/locations" },
    { name: "Contact", href: "/contact" },
  ];
  if (isLoggedIn) {
    let dashboardHref = "/customer-dashboard"; // Default
    if (user.role === "admin") {
      dashboardHref = "/admin-dashboard";
    } else if (user.role === "manager") {
      dashboardHref = "/manager-dashboard";
    }
    
    navLinks.push({
      name: "Dashboard",
      href: dashboardHref,
    });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <img
              src={logo || "https://via.placeholder.com/150x50"}
              alt="BookMyBanquets"
              className="h-10"
            />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm  font-medium transition-colors hover:text-gold-500 ${isScrolled ? "text-navy-800" : "text-white"
                }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Navigation - User Actions */}
        <div className="hidden md:flex items-center space-x-6">
          <a
            href="#favorites"
            className={`flex items-center text-sm font-medium transition-colors hover:text-gold-500 ${isScrolled ? "text-navy-800" : "text-white"
              }`}
          >
            <FiHeart className="mr-1" />
            <span>Favorites</span>
          </a>

          {!isLoggedIn && (
            <>
              <a
                href="/login"
                className={`flex items-center text-sm font-medium transition-colors hover:text-gold-500 ${isScrolled ? "text-navy-800" : "text-white"
                  }`}
              >
                <FiUser className="mr-1" />
                <span>Login</span>
              </a>
              <a
                href="/register"
                className={`btn-primary ${isScrolled
                    ? ""
                    : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                  }`}
              >
                Sign Up
              </a>
            </>
          )}

          {isLoggedIn && (
            <button
              onClick={handleLogout} // ✅ FIX: Call the function
              className={`btn-primary ${isScrolled
                  ? ""
                  : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                }`}
            >
              Log Out
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            type="button"
            className={`p-2 rounded-md ${isScrolled ? "text-navy-800" : "text-white"
              }`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <a href="/" className="flex items-center">
                <img
                  src={logo || "https://via.placeholder.com/150x50"}
                  alt="BookMyBanquets"
                  className="h-8"
                />
              </a>
              <button
                type="button"
                className="p-2 text-navy-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-navy-800 text-lg font-medium hover:text-gold-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <a
                  href="#favorites"
                  className="flex items-center text-navy-800 text-lg font-medium hover:text-gold-500"
                >
                  <FiHeart className="mr-2" />
                  <span>Favorites</span>
                </a>

                {!isLoggedIn && (
                  <>
                    <a
                      href="/login"
                      className="flex items-center text-navy-800 text-lg font-medium hover:text-gold-500"
                    >
                      <FiUser className="mr-2" />
                      <span>Login</span>
                    </a>
                    <a
                      href="/register"
                      className="btn-primary w-full justify-center flex items-center"
                    >
                      Sign Up
                    </a>
                  </>
                )}

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false); // Close the mobile menu after logout
                    }}
                    className="btn-primary w-full justify-center flex items-center"
                  >
                    Logout
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
