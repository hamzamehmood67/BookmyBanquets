import { useState, useContext } from "react";
import { AlertContext } from "../context/AlertContext"; // Ensure the path is correct
import axios from "axios";
import InputField from "../components/InputField";
import CombineButtons from "../components/CombineButtons";
import LogoComponent from "../components/LogoComponent";
import SliderComponent from "../components/SliderComponent";
import CheckboxComponent from "../components/Checkbox";
import SubheadingComponent from "../components/SubheadingComponent";
import HeadingComponent from "../components/HeadingComponent";

const Register = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "customer",
  });

  // Access the AlertContext
  const { showAlert } = useContext(AlertContext);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        role: value,
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
    setIsSubmitted(true);
    try {
      const res = await axios.post(
        "http://13.53.187.108:3000/api/v1/user/register",
        formData
      );
      console.log("Response:", res);
      showAlert("Success! Please check your email", "success"); // Use showAlert here
    } catch (error) {
      console.error("Error:", error);
      showAlert("Registration failed. Please try again.", "failure"); // Use showAlert here
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 ">
      {/* Left side - Image Slider */}
      <div className="relative hidden w-2/5  bg-gray-100 md:block">
        <SliderComponent></SliderComponent>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex w-full flex-col justify-center px-4 md:w-3/5 md:px-12 lg:px-20">
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
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required={true}
            />
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

            <div className="mb-8 flex space-x-8">
              <CheckboxComponent
                name="role"
                value="customer"
                checked={formData.role === "customer"}
                onChange={handleChange}
                label="Customer"
              />
              <CheckboxComponent
                name="role"
                value="manager"
                checked={formData.role === "manager"}
                onChange={handleChange}
                label="Hall Manager"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitted}
              className={`w-full rounded-lg  py-2 text-white  focus:outline-none ${
                isSubmitted ? "bg-gray-400" : "bg-pink-500 hover:bg-pink-600"
              }`}
            >
              {isSubmitted ? "Loading..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
