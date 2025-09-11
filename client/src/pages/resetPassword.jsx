import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import InputField from "../components/InputField";
import { AlertContext } from "../context/AlertContext";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useContext(AlertContext);
  const [showPassword, setShowPassword] = useState(false);

  const [token, setToken] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      showAlert("Invalid or missing token.", "failure");
      navigate("/login");
    }
  }, [location.search, navigate, showAlert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match.", "failure");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://13.53.187.108:3000/api/v1/user/reset-password/${token}`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );
      showAlert("Password reset successfully! Please login.", "success");
      navigate("/login");
    } catch (err) {
      console.error("Error resetting password:", err);
      showAlert("Failed to reset password. Try again.", "failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-700">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          <InputField
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password"
            required={true}
            isPassword={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <InputField
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required={true}
            isPassword={true}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 text-white focus:outline-none ${
              loading ? "bg-gray-400" : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
