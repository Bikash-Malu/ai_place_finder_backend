const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors({
  origin: 'https://tarvel-suggestion-ai.vercel.app', // Replace with your React app's URL
}));

app.use(bodyParser.json());

let otpStorage = {}; // Temporary storage for OTPs

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASS  // Use environment variable
  }
});

// Helper function to send OTP email
const sendOtpEmail = (email, otp) => {
  const htmlContent = `
    <html>
      <body>
        <h1>Your OTP Code</h1>
        <p>Your OTP code is <strong>${otp}</strong>. It is valid for 2 minutes.</p>
        <img src="https://www.oneclickitsolution.com/blog/wp-content/uploads/2021/06/Role-of-Artificial-Intelligence-AI-in-the-Travel-Industry.png" alt="Your Image" style="width:100%; max-width:600px;" />
        <p>Thank you for using our service.</p>
      </body>
    </html>
  `;

  transporter.sendMail({
    from: process.env.EMAIL_USER, // Use environment variable
    to: email,
    subject: 'Your OTP Code',
    html: htmlContent // Use HTML content
  }, (error, info) => {
    if (error) {
      console.error('Error sending OTP:', error);
    }
  });
};

// Endpoint to send OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });

  const currentTime = Date.now();
  otpStorage[email] = { otp, timestamp: currentTime };

  sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent successfully' });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const otpData = otpStorage[email];
  
  if (!otpData) {
    return res.status(400).json({ error: 'OTP not sent or expired' });
  }

  const { otp: storedOtp, timestamp } = otpData;
  const currentTime = Date.now();
  const timeElapsed = (currentTime - timestamp) / 1000; // Time in seconds

  if (timeElapsed > 120) { // 2 minutes
    delete otpStorage[email];
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (storedOtp === otp) {
    delete otpStorage[email]; // OTP should be used only once
    res.json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});
app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
