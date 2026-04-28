import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/Auth.js";

const Navbar = () => {
  const  navigate = useNavigate();

    const {admin  , logout} = useAuth();
    // navigate("/"); // Redirect to home after logout
  const handlelogout =() => {
    logout();
    navigate("/");
  }

  return (
    <NavContainer>
      <h2 className="logo">CMS ADIMN</h2>
      <nav>
        <NavLink to="/" exact>Home</NavLink>
        <NavLink to="/complaint">Complaints</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
      {admin ? (<LogoutButton onClick={handlelogout}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M10 2H14V4H10V2M12 6C8.1 6 5 9.1 5 13V17H3V20H9V17H7V13C7 10.2 9.2 8 12 8C14.8 8 17 10.2 17 13V17H15V20H21V17H19V13C19 9.1 15.9 6 12 6Z" />
        </svg>
        Logout
      </LogoutButton>) : (
        <NavLink to="/login">Login</NavLink>
      )}
    </NavContainer>
  );
};

const NavContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #007dab;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
  }

  nav {
    display: flex;
    gap: 20px;
  }

  a {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: 0.3s;
  }

  a:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  a.active {
    background: white;
    color: #007dab;
    font-weight: bold;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  gap: 8px;
  font-weight: bold;

  &:hover {
    background: #d63031;
  }
`;

export default Navbar;
