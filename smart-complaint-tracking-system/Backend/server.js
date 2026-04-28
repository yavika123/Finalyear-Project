require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const path = require("path");

// Middleware
app.use(express.json());
app.use(cors({
  origin: true, // Allow all origins dynamically
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Allow cookies/auth headers
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Import Routes and Cron Jobs
const complaintRoutes = require('./routes/complaintRoutes');
const userRoutes = require('./routes/userRoutes');
const cronJobs = require('./cron/cronJobs');

// Use Routes
app.use('/users', userRoutes);
app.use('/complaints', complaintRoutes);

// Start Cron Jobs
cronJobs.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
