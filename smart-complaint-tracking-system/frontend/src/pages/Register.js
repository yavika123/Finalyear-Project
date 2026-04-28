import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../assets/css/register.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate(); // Navigate after successful signup

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/users/register", formData);
      setMessage(response.data.message);
      setFormData({ name: "", email: "", password: "" }); // Clear form after success
      navigate("/login"); // Redirect to login page
    } catch (error) {
      setMessage(error.response?.data.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="container">
      <div className="form_area">
        <p className="title">SIGN UP</p>
        {message && <p className="message">{message}</p>} {/* Display message */}
        <form onSubmit={handleSubmit}>
          <div className="form_group">
            <label className="sub_title" htmlFor="name">Name</label>
            <input
              placeholder="Enter your full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form_style"
              type="text"
              required
            />
          </div>
          <div className="form_group">
            <label className="sub_title" htmlFor="email">Email</label>
            <input
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form_style"
              type="email"
              required
            />
          </div>
          <div className="form_group">
            <label className="sub_title" htmlFor="password">Password</label>
            <input
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form_style"
              type="password"
              required
            />
          </div>
          <div>
            <button className="btn" type="submit">SIGN UP</button>
            <p>Have an Account? <a className="link" href="/login">Login Here!</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
