const express = require('express');
const Complaint = require('../models/complaint');
const User = require('../models/user');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require("multer");
const router = express.Router();
const path = require("path");
const { title } = require('process');
const mongoose = require('mongoose');
const { get } = require('http');
const user = require('../models/user');
const complaint = require('../models/complaint');

// Raise Complaint (User)
router.post('/', authMiddleware('user'), async (req, res) => {
  const user = await User.findById(req.user.id);
  const complaint = new Complaint({ user: req.user.id, description: req.body.description, district: user.district });
  await complaint.save();
  res.json({ message: 'Complaint raised' });
});

// Get Complaints 
router.get("/:id", authMiddleware(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ message: "Server error" });
  }
});
//Get Complaints for a District (Admin)
router.get("/", authMiddleware(), async (req, res) => {
  try {
    console.log("Logged-in User:", req.user); // 🔍 Debugging log

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;
    const role = req.user.role || "user"; // ✅ Prevent "role is not defined" error

    let complaints = []; // ✅ Ensure `complaints` is always defined

    if (role === "admin") {
      console.log("admin")
      complaints = await Complaint.find(); // ✅ Admin sees all complaints
    } else {
      console.log("user")
      complaints = await Complaint.find({ user: userId }); // ✅ User sees only their complaints
    }

    // ✅ Ensure image field contains full path
    const formattedComplaints = complaints.map((c) => ({
      ...c._doc,
      image: c.image ? `http://localhost:5000${c.image}` : null,
    }));

    res.json({
      pending: formattedComplaints.filter((c) => c.status === "Pending"),
      onprogress: formattedComplaints.filter((c) => c.status === "On Progress"),
      solved: formattedComplaints.filter((c) => c.status === "Resolved"),
    });
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    res.status(500).json({ error: "Error fetching user complaints" });
  }
});




// Set up storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage: storage });

// Submit Complaint (Now with Image Upload)
router.post("/submit", authMiddleware("user"),upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.id; // Extracted from JWT token
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Image path

    if (!description) {
      return res.status(400).json({ message: "Complaint description is required" });
    }
    console.log("Image Path:", imagePath);
    const newComplaint = new Complaint({
      user: userId,
      title: req.body.title || "No Title", // Optional title
      description:description,
      image: imagePath, // Store image path in DB
      status: "Pending", // Default status
      createdAt: Date.now(),
    });

    await newComplaint.save();
    res.status(201).json({ 
      message: "Complaint submitted successfully",
      complaint: newComplaint 
    });

  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve uploaded images statically
router.use("/uploads", express.static("uploads"));

// Update Complaint Status (Admin)
router.put('/:id', authMiddleware(), async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
  if (complaint.district !== req.user.district) return res.status(403).json({ message: 'Unauthorized' });
  const status = req.body.status;
  complaint.status = status;
  if (status === 'Resolved') {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();
  res.json({ message: 'Complaint resolved' });
});




router.post("/complaint/admin/:id", async (req, res) => {
    const { status, adminLat, adminLong } = req.body; // Extract data from request body
    const { id } = req.params;
    if (!adminLat || !adminLong) {
      return res.status(400).json({ message: "GPS location is required to mark as completed!" }); 
    }
    let complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if(status === 'Resolved'){
      
    let userLat =  complaint.userLat;
    let userLong = complaint.userLong;  
    if(!userLat || !userLong){
      complaint.adminLat = adminLat;
      complaint.adminLong = adminLong;
      complaint.status = 'On Progress';
      await complaint.save();
      
      return res.status(400).json({ message: "User needs to confirm the Location" });
    }
    if ( userLat ==adminLat && userLong == adminLong){
      complaint.status = status;
      await complaint.save();

        return res.status(400).json({ message: "Confirmed By both User And Admin , complaint resolved successfully" });
      
    }else{
      return res.status(400).json({ message: "User and Admin location does not match" });
    }
  }
  if(status === 'On Progress'){
    complaint.adminLat = adminLat;
    complaint.adminLong = adminLong;
    complaint.status = status;
    await complaint.save();
    res.status(400).json({ message: "Complaint status updated" });
  }
});

router.post("/complaint/user/:id", async (req, res) => {
  const { status, userLat, userLong } = req.body; // Extract data from request body
  const { id } = req.params;
  if (!userLat || !userLong) {
    return res.status(400).json({ message: "GPS location is required to mark as completed!" });
  }
  let complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }
// if (complaint.adminLat !== null && complaint.adminLong !== null){
//   if (complaint.adminLat == userLat && complaint.adminLong == userLong){
//     complaint.status = "Resolved";
//     await complaint.save();
//     res.json({ message: "Complaint is Resolved" });
//   }
// }else{
  // complaint.status = status;
  // complaint.userLat = userLat;
  // complaint.userLong = userLong;
  // await complaint.save();
  // res.json({ message: "Complaint status updated , Waiting for Admin to Confirm" });
// }
if(!complaint.adminLat){
  complaint.status = status;
  complaint.userLat = userLat;
  complaint.userLong = userLong;
  await complaint.save();
  return res.status(200).json({ message: "Complaint status updated , Waiting for Admin to Confirm" });
}
else{
  if (complaint.adminLat == userLat){
    complaint.status = "Resolved";
    await complaint.save();
    return res.status(200).json({message:"succesfully updated the complaint status"})
  }
}

});
module.exports = router;
