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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [location, setLocation] = useState(null); // Store GPS location
  const [updating, setUpdating] = useState(false); // Track update status

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

  const markAsCompleted = async () => {
    if (!location) {
      setImageError("GPS location is required to mark as completed!");
      return;
    }
  
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/complaints/complaint/user/${id}`,
        {
          userLat: location.latitude,
          userLong: location.longitude,
          status: "On Progress",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      alert(res.data.message); // ✅ Show success message
      fetchComplaint();
    } catch (error) {
      console.error("Error updating status:", error);
      
      // ✅ Correct error handling
      alert(error.response?.data?.message || "Failed to update complaint status");
  
      setError("Failed to update complaint status");
    } finally {
      setUpdating(false);
    }
  };
  
  

  const convertDMSToDD = (dms, direction) => {
    const degrees = dms[0];
    const minutes = dms[1] / 60;
    const seconds = dms[2] / 3600;
    let decimal = degrees + minutes + seconds;
    if (direction === "S" || direction === "W") {
      decimal *= -1;
    }
    return decimal;
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

              <img src={`http://localhost:5000${complaint.image}`} alt="Complaint" />
   
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
            <UploadSection>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                required
              />
              <UploadButton onClick={() => document.getElementById("imageInput").click()}>
                <FaCamera size={18} /> Upload Image
              </UploadButton>
            </UploadSection>
            <MarkCompleteButton onClick={markAsCompleted} disabled={!location || updating}>
              {updating ? "Updating..." : "Mark as Completed"}
            </MarkCompleteButton>
          </DetailsSection>
        </Content>
      </CenteredContainer>
    </PageWrapper>
  );
};


// Styled Components
const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;

  img {
    width: 100%;
    max-height: 80%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  padding: 5px;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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

const ErrorText = styled.p`
  color: red;
  font-size: 16px;
  margin-top: 10px;
`;

const UploadSection = styled.div`
  margin-top: 15px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #0056b3;
  }
`;
const MarkCompleteButton = styled.button`
  margin-top: 15px;
  padding: 10px 15px;
  font-size: 16px;
  color: white;
  background: green;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: darkgreen;
  }
  &:disabled {
    background: gray;
    cursor: not-allowed;
  }
`;
const Message = styled.p`
  text-align: center;
  font-size: 20px;
  color: #ff4444;
  margin-top: 20px;
`;

export default ComplaintDetail;
