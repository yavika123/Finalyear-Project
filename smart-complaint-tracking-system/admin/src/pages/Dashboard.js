import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [onProgressCount, setOnProgressCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

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
  
      console.log("Fetched Complaints:", response.data); // Debugging
  
      if (response.data && typeof response.data === "object") {
        // Flatten pending, on progress, and solved into one array
        const combinedComplaints = [...response.data.pending, ...response.data.onprogress, ...response.data.solved];
  
        setComplaints(combinedComplaints);
        setPendingCount(response.data.pending.length);
        setOnProgressCount(response.data.onprogress.length);
        setSolvedCount(response.data.solved.length);
      } else {
        console.error("Unexpected API response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };
  
  useEffect(() => {
    fetchComplaints();
  }, []); 

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white shadow-md rounded-xl">
          <h2 className="text-lg font-semibold">Total Complaints</h2>
          <p className="text-2xl font-bold">{complaints.length}</p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-xl">
          <h2 className="text-lg font-semibold">Pending Complaints</h2>
          <p className="text-2xl font-bold text-red-500">{pendingCount}</p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-xl">
          <h2 className="text-lg font-semibold">On Progress</h2>
          <p className="text-2xl font-bold text-yellow-500">{onProgressCount}</p>
        </div>
        <div className="p-4 bg-white shadow-md rounded-xl">
          <h2 className="text-lg font-semibold">Solved Complaints</h2>
          <p className="text-2xl font-bold text-green-500">{solvedCount}</p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white p-5 shadow-md rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Complaints List</h2>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint, index) => (
              <tr key={index} className="text-center border-t">
                <td className="border p-2">{complaint._id}</td>
                <td className="border p-2">{complaint.user}</td>
                <td className="border p-2">{complaint.title}</td>
                <td className={`border p-2 font-semibold ${
                  complaint.status === "Pending" ? "text-red-500" : 
                  complaint.status === "On Progress" ? "text-yellow-500" : 
                  "text-green-500"}`}>{complaint.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
