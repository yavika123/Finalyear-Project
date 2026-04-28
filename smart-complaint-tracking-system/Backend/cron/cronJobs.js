const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Complaint = require('../models/complaint');
const User = require('../models/user');
require('dotenv').config(); // Ensure environment variables are loaded

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// Function to send an email safely
const sendEmail = async (mailOptions) => {
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.response}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
  }
};

// Cron Job to Check for Unresolved Complaints Every 2 Minutes
const start = () => {
  try {
    cron.schedule('*/1 * * * *', async () => {
      console.log('🔍 Checking for unresolved complaints...');
      const twoMinutesAgo = new Date();
      twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

      // Fetch unresolved complaints
      const unresolvedComplaints = await Complaint.find({ 
        status: 'Pending', 
        createdAt: { $lt: twoMinutesAgo } 
      }).populate('user'); // Populate user details

      console.log('🟡 Unresolved complaints:', unresolvedComplaints.length);

      if (unresolvedComplaints.length > 0) {
        const superAdmin = await User.findOne({ role: 'superadmin' });
        const adminUsers = await User.find({ role: 'admin' }); // Fetch all admins

        if (superAdmin) {
          // Email to super admin about unresolved complaints
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: superAdmin.email,
            subject: '🚨 Unresolved Complaints Alert',
            text: `The following complaints have not been addressed:\n\n` +
                  unresolvedComplaints.map(c => `ID: ${c._id}, Description: ${c.description}`).join('\n')
          };
          await sendEmail(mailOptions);

          // Email to super admin about inactive admins
          if (adminUsers.length > 0) {
            const adminMail = {
              from: process.env.EMAIL_USER,
              to: superAdmin.email,
              subject: '⚠️ Complaint About Inactive Admins',
              text: `The following admins have not been addressing complaints:\n\n` +
                    adminUsers.map(a => `ID: ${a._id}, Email: ${a.email}`).join('\n')
            };
            await sendEmail(adminMail);
            console.log('✅ Email sent to super admin about inactive admins.');
          }
        } else {
          console.log('❌ No super admin found.');
        }

        // Send email to users who raised complaints
        for (const complaint of unresolvedComplaints) {
          if (complaint.user && complaint.user.email) {
            const userMailOptions = {
              from: process.env.EMAIL_USER,
              to: complaint.user.email,
              subject: '📢 Complaint Escalation Notice',
              text: `Your complaint has been escalated to the super admin.\n\n` +
                    `Complaint ID: ${complaint._id}\nDescription: ${complaint.description}`
            };
            await sendEmail(userMailOptions);
          }
        }
      } else {
        console.log('✅ No unresolved complaints found.');
      }
    });
  } catch (error) {
    console.error('❌ Error starting cron job:', error);
  }
};

module.exports = { start };
