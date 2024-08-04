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
        <h1>Welcome to ai_place_finder!</h1>
        <p>Your OTP code is <strong>${otp}</strong>. It is valid for 2 minutes.</p>
        <img src="https://www.oneclickitsolution.com/blog/wp-content/uploads/2021/06/Role-of-Artificial-Intelligence-AI-in-the-Travel-Industry.png" alt="Your Image" style="width:100%; max-width:600px;" />
        <p>Thank you for using ai_place_finder. We are dedicated to helping you find the best travel options.</p>
        <hr />
        <h2>Contact Us</h2>
        <p>If you have any questions or need assistance, please reach out to us at:</p>
        <ul>
          <li><strong>Email:</strong> bikashmalu1@gmail.com</li>
          <li><strong>Phone:</strong>+91-9583856595</li>
          <li><strong>Address:</strong> Bhubaneswar,Odisha</li>
        </ul>
        <p>Visit our website: <a href="https://tarvel-suggestion-ai.vercel.app/">www.ai_place_finder.com</a></p>
      </body>
    </html>
  `;

  transporter.sendMail({
    from: process.env.EMAIL_USER, // Use environment variable
    to: email,
    subject: 'Your OTP Code from ai_place_finder',
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

  res.json({ 
    message: 'OTP sent successfully from ai_place_finder', 
    contact: {
      email: 'bikashmalu1@gmail.com',
      phone: '+91-9583856595',
      address: 'Bhubaneswar,Odisha',
      website: 'https://tarvel-suggestion-ai.vercel.app/'
    }
  });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const otpData = otpStorage[email];
  
  if (!otpData) {
    return res.status(400).json({ 
      error: 'OTP not sent or expired from ai_place_finder',
      contact: {
        email: 'bikashmalu1@gmail.com',
        phone: '+91-9583856595',
        address: 'Bhubaneswar,Odisha',
        website: 'https://tarvel-suggestion-ai.vercel.app/'
      }
    });
  }

  const { otp: storedOtp, timestamp } = otpData;
  const currentTime = Date.now();
  const timeElapsed = (currentTime - timestamp) / 1000; // Time in seconds

  if (timeElapsed > 120) { // 2 minutes
    delete otpStorage[email];
    return res.status(400).json({ 
      error: 'OTP expired from ai_place_finder',
      contact: {
        email: 'bikashmalu1@gmail.com',
        phone: '+91-9583856595',
        address: 'Bhubaneswar,Odisha',
        website: 'https://tarvel-suggestion-ai.vercel.app/'
      }
    });
  }

  if (storedOtp === otp) {
    delete otpStorage[email]; // OTP should be used only once
    res.json({ 
      message: 'OTP verified successfully from ai_place_finder',
      contact: {
        email: 'bikashmalu1@gmail.com',
        phone: '+91-9583856595',
        address: 'Bhubaneswar,Odisha',
        website: 'https://www.ai_place_finder.com'
      }
    });
  } else {
    res.status(400).json({ 
      error: 'Invalid OTP from ai_place_finder',
      contact: {
        email: 'bikashmalu1@gmail.com',
        phone: '+91-9583856595',
        address: 'Bhubaneswar,Odisha',
        website: 'https://www.ai_place_finder.com'
      }
    });
  }
});

app.get('/hello', (req, res) => {
  res.send('Hello from ai_place_finder!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
