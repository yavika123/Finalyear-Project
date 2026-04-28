import React from "react";
import "../assets/css/card.css";
import { Link } from "react-router-dom";

const Card = ({ complaint }) => {
  const { _id, title, description, image } = complaint;

  return (
    <Link to={`/complaint/${_id}`} key={_id}>
      <div className="card">
        <div className="card-image-container">
          {image ? (
            <img src={complaint.image} className="image-icon" alt="Complaint" />
          ) : (
            <div className="image-placeholder">No Image</div>
          )}
        </div>
        <p className="card-title">{title || "No Title"}</p>
        <p className="card-des">{description}</p>
      </div>
    </Link>
  );
};

export default Card;
