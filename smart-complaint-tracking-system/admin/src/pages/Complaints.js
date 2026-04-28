import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import styled from "styled-components";

const Complaints = () => {
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [solvedComplaints, setSolvedComplaints] = useState([]);
  const [onprogressComplaints, setOnprogressComplaints] = useState([]);
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get("http://localhost:5000/complaints/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        
        setComplaint(response.data);
        if (response.data && response.data.pending && response.data.solved) {
          setPendingComplaints([...response.data.pending]);
          setSolvedComplaints([...response.data.solved]);
          setOnprogressComplaints([...response.data.onprogress]);
          console.log(solvedComplaints); // 🔍 Debugging
        }

 // ✅ Debugging
      } catch (error) {
        console.error("Error fetching complaints:", error.response?.data || error);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <StyledWrapper>
      <div className="dashboard">
        <h2 className="dash">📊 Dashboard</h2>

        <div className="complaints-container">
        <div className="complaint-category progress">
            <h3>🕒 On Progress Complaints</h3>
            {onprogressComplaints.length > 0 ? (
              <div className="card-container">
                {onprogressComplaints.map((complaint) => (
                  <Card key={complaint._id} complaint={complaint} />
                ))}
              </div>
            ) : (
              <p className="no-complaints">✅ No pending complaints</p>
            )}
          </div>
          {/* Pending Complaints */}
          <div className="complaint-category pending">
            <h3>🕒 Pending Complaints</h3>
            {pendingComplaints.length > 0 ? (
              <div className="card-container">
                {pendingComplaints.map((complaint) => (
                  <Card key={complaint._id} complaint={complaint} />
                ))}
              </div>
            ) : (
              <p className="no-complaints">✅ No pending complaints</p>
            )}
          </div>

          {/* Solved Complaints */}
          <div className="complaint-category solved">
            <h3>✅ Solved Complaints</h3>
            {solvedComplaints.length > 0 ? (
              <div className="card-container">
                {solvedComplaints.map((complaint) => (
                  <Card key={complaint._id} complaint={complaint} />
                ))}
              </div>
            ) : (
              <p className="no-complaints">📌 No solved complaints</p>
            )}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

// 🌟 Styled Components with Modern UI
const StyledWrapper = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;

  .dashboard {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }

  .dash {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    padding-bottom: 12px;
  }

  .complaints-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }

  .complaint-category {
    background: white;
    padding: 16px;
    border-radius: 10px;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
  }

  .complaint-category h3 {
    font-size: 20px;
    margin-bottom: 12px;
    color: #444;
  }

  .pending {
    border-left: 6px solid #ff9800;
  }

  .solved {
    border-left: 6px solid #4caf50;
  }
  .progress{
    border-left: 6px solid rgb(226, 226, 110);
  }
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    padding-top: 10px;
  }

  .no-complaints {
    font-size: 16px;
    color: gray;
    padding: 10px;
  }
`;

export default Complaints;
