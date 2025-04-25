import { useState } from "react";
import InputField from "../components/InputField";
import CombineButtons from "../components/CombineButtons";
import LogoComponent from "../components/LogoComponent";
import SliderComponent from "../components/SliderComponent";
import SubheadingComponent from "../components/SubheadingComponent";
import HeadingComponent from "../components/HeadingComponent";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Ensure the path is correct
import { AlertContext } from "../context/AlertContext"; // Ensure the path is correct
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    userType: "customer",
  });
  const { login } = useAuth();
  const { showAlert } = useContext(AlertContext); // Access the AlertContext
  const navigate = useNavigate(); // Use the useNavigate hook

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        userType: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/login",
        formData
      );
      console.log("Response:", res);
      if (res.status === 200) {
        console.log("Login successful:", res.data);
        login(res.data.user, res.data.token);
        showAlert("Login successful!", "success"); // Use showAlert here
        navigate("/"); // Redirect to the home page after successful login
      }
    } catch (e) {
      console.error("Error:", e);
      showAlert(`${e.response.data.error}`, "failure"); // Use showAlert here
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Left side - Image Slider */}
      <div className="relative hidden w-2/5 overflow-hidden bg-gray-100 md:block">
        <SliderComponent></SliderComponent>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex w-full flex-col justify-center px-4 md:w-3/5 md:px-12 lg:px-20">
        <LogoComponent />

        <div className="mx-auto w-full max-w-md">
          <HeadingComponent />
          <CombineButtons />
          <SubheadingComponent
            text1="Ready to Book Your Dream Venue?"
            text2="MyBanquets"
            text3="Makes It Easy and Hassle-Free!"
          />

          <form onSubmit={handleSubmit}>
            <InputField
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required={true}
            />

            <InputField
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required={true}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isPassword={true}
            />
            {/* Forgot Password Link */}
            <div className="mb-4 mt-2 text-right">
              <a
                href="/forgot-password" // You can change this to use
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full rounded-lg bg-pink-500 py-2 text-white hover:bg-pink-600 focus:outline-none"
            >
              {isSubmitted ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
