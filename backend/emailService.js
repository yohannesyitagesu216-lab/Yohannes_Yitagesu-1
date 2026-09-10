const nodemailer = require('nodemailer');

function getFromAddress() {
  return process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `AgroVision <${process.env.EMAIL_USER}>` : 'AgroVision <noreply@agrovision.com>');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email configuration pending: set EMAIL_USER and EMAIL_PASSWORD in backend/.env to enable sending.');
      return;
    }
    console.log('Email configuration error:', error.message);
  } else if (success) {
    console.log('Email service is ready');
  }
});

async function sendMailMessage(mailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email not sent: missing EMAIL_USER or EMAIL_PASSWORD in backend/.env');
    return false;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: 'AgroVision - Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your AgroVision account.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
      <p>Or copy this link: ${resetLink}</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>AgroVision Team</p>
    `,
  };

  return sendMailMessage(mailOptions);
}

async function sendWelcomeEmail(email, name) {
  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: 'Welcome to AgroVision - Intelligent Farming Solutions',
    html: `
      <h2>Welcome to AgroVision, ${name}!</h2>
      <p>Your account has been successfully created. You can now:</p>
      <ul>
        <li>Analyze crop diseases with AI</li>
        <li>Track your farm analytics</li>
        <li>Access agriculture lessons</li>
        <li>Use farm management tools</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Go to Dashboard
      </a>
      <p>If you have any questions, contact us at support@agrovision.com</p>
      <p>Best regards,<br>AgroVision Team</p>
    `,
  };

  return sendMailMessage(mailOptions);
}

async function sendPredictionNotification(email, cropName, disease) {
  const mailOptions = {
    from: getFromAddress(),
    to: email,
    subject: 'AgroVision - Crop Analysis Results',
    html: `
      <h2>Crop Analysis Complete</h2>
      <p>Your crop analysis is ready!</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Crop:</strong> ${cropName}</p>
        <p><strong>Disease Detected:</strong> ${disease}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/crop-analysis" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Full Results
      </a>
      <p>Log in to your account to see treatment recommendations and prevention strategies.</p>
      <p>Best regards,<br>AgroVision Team</p>
    `,
  };

  return sendMailMessage(mailOptions);
}

async function sendContactEmail(name, email, message) {
  const mailOptions = {
    from: getFromAddress(),
    to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    subject: `Contact Form - ${name}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
    replyTo: email,
  };

  return sendMailMessage(mailOptions);
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPredictionNotification,
  sendContactEmail,
};
