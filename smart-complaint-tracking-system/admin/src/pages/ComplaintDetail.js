import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { FaCamera } from "react-icons/fa";
import EXIF from "exif-js"; // Import EXIF reader

const ComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [location, setLocation] = useState(null); // Store GPS location


  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaint(response.data);
      setStatus(response.data.status);
    } catch (err) {
      setError("Failed to fetch complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const image = new Image();
        image.src = e.target.result;

        image.onload = function () {
          EXIF.getData(image, async function () {
            console.log("EXIF Data:", EXIF.getAllTags(this));

            const gpsLat = EXIF.getTag(this, "GPSLatitude");
            const gpsLon = EXIF.getTag(this, "GPSLongitude");
            const gpsLatRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const gpsLonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

            if (gpsLat && gpsLon) {
              const latitude = convertDMSToDD(gpsLat, gpsLatRef);
              const longitude = convertDMSToDD(gpsLon, gpsLonRef);
              console.log("Extracted GPS:", latitude, longitude);

              setSelectedImage(URL.createObjectURL(file));
              setLocation({ latitude, longitude });
              setImageError("");
            } else {
              setImageError("Only images with location (GPS) data are allowed!");
              setSelectedImage(null);
              setLocation(null);
            }
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };
  const convertDMSToDD = (dms, direction) => {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      dd *= -1;
    }
    return dd;
  };
  

  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(  // 🔥 Changed to PUT request
        `http://localhost:5000/complaints/complaint/admin/${id}`,
        { status, adminLat: location?.latitude, adminLong: location?.longitude }, // ✅ Sending admin's lat/long
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert(res.data.message); // ✅ Corrected alert message
      fetchComplaint(); // ✅ Refresh complaint data
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update complaint status"); // ✅ Fixed error handling
      console.error("Error updating complaint status:", err);
    }
  };


  if (loading) return <Message>Loading...</Message>;
  if (error) return <Message>{error}</Message>;
  if (!complaint) return <Message>No complaint found.</Message>;

  return (
    <PageWrapper>
      <Overlay />
      <CenteredContainer>
        <Title>Complaint Details</Title>
        <Content>
          <ImageSection>
            {complaint.image && <img src={`http://localhost:5000${complaint.image}`} alt="Complaint" />}
          </ImageSection>
          <DetailsSection>
            <h3>{complaint.title || "No Title"}</h3>
            <p><strong>Description:</strong> {complaint.description}</p>
            <p><strong>Status:</strong> {complaint.status}</p>
            <p><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
            {location && (
              <p><strong>Location:</strong> {location.latitude}, {location.longitude}</p>
            )}
            {imageError && <ErrorText>{imageError}</ErrorText>}

              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <UploadButton onClick={() => document.getElementById("imageInput").click()}>
                <FaCamera size={18} /> Upload Image with GPS
              </UploadButton>

            <StatusDropdown value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="On Progress">On Progress</option>
              <option value="Resolved">Solved</option>
            </StatusDropdown>
            <UpdateButton onClick={updateStatus}>Update Status</UpdateButton>
          </DetailsSection>
        </Content>
      </CenteredContainer>
    </PageWrapper>
  );
};

const UploadSection = styled.div`
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  border: 1px solid red; 
  padding: 10px;
`;

const Message = styled.p`
  text-align: center;
  font-size: 20px;
  color: #ff4444;
  margin-top: 20px;
`;

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CenteredContainer = styled.div`
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 800px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
  color: #222;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const ImageSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  img {
    width: 100%;
    max-height: 80%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  h3 {
    color: #333;
    font-size: 24px;
    margin-bottom: 10px;
  }

  p {
    font-size: 18px;
    color: #555;
    margin-bottom: 8px;
  }

  strong {
    color: #222;
  }
`;

const StatusDropdown = styled.select`
  margin-top: 20px;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: white;
`;

const UpdateButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 10px;
`;

const UploadButton = styled.button`
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background: green;
  display: flex; /* Ensure button content is visible */
  align-items: center;
  gap: 8px; /* Add space between icon and text */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: darkgreen;
  }
`;


export default ComplaintDetail;
