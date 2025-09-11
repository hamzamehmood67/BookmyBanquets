import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { CheckCircle } from "lucide-react";
import { AlertContext } from "../context/AlertContext";

const EmailVerification = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!isVerifying) return; // 🔥 Prevent re-running after initial
    const verifyEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");

      if (!token) {
        showAlert("Invalid verification link.", "failure");
        navigate("/login");
        return;
      }

      try {
        await axios.get(
          `http://13.53.187.108:3000/api/v1/user/verify-email?token=${token}`
        );
        setSuccess(true);
        showAlert("Email verified successfully!", "success");
      } catch (error) {
        console.error("Verification failed:", error);
        showAlert("Failed to verify email. Please try again.", "failure");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [isVerifying, location.search, navigate, showAlert]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader message="Verifying your email..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-10 text-center">
        {success && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now log in.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium"
            >
              Go to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
