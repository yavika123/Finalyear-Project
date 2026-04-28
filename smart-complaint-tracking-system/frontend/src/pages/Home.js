import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth"; 
import heroImage from "../assets/img/hero.webp"; // Ensure this path is correct

const HeroSection = () => {
  const { user } = useAuth();  
  const navigate = useNavigate(); // ✅ Correct useNavigate

  return (
    <HeroContainer>
      <div className="overlay" />
      <div className="content">
        <h1>Welcome to MyApp</h1>
        <p>Effortlessly manage complaints and dashboards with ease.</p>
        {user ? (
          <button className="cta-button" onClick={() => navigate("/dashboard")}>
            Get Started
          </button>
        ) : (
          <button className="cta-button" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </HeroContainer>
  );
};

const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh; /* ✅ Ensures full-screen */
  background: url(${heroImage}) center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 125, 171, 0.6); /* Match Navbar Color */
  }

  .content {
    position: relative;
    z-index: 1;
    max-width: 600px;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: bold;
  }

  p {
    font-size: 1.2rem;
    margin: 1rem 0;
  }

  .cta-button {
    background: #ff4d4d;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
  }

  .cta-button:hover {
    background: #d63031;
  }
`;

export default HeroSection;
