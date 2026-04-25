const nodemailer = require('nodemailer');
const { env } = require('../config/env');

// Create transporter only if email credentials are provided
let transporter = null;

const isEmailConfigured = () => {
  return env.email.user && 
         env.email.pass && 
         env.email.user !== 'test@gmail.com' &&
         env.email.host &&
         env.email.from &&
         env.email.from.includes('.');
};

if (isEmailConfigured()) {
  try {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: {
        user: env.email.user,
        pass: env.email.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service error:', error.message);
        transporter = null;
      } else {
        console.log('✅ Email service ready to send messages');
      }
    });
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    transporter = null;
  }
} else {
  console.log('📧 Email service not configured. Using console logging instead.');
}

// Send verification email
const sendVerificationEmail = async (email, name, code) => {
  const verificationUrl = `${env.frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
  
  const emailContent = {
    to: email,
    subject: 'Verify Your Email - RecipeNest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to RecipeNest, ${name}!</h2>
        <p>Thank you for signing up! Please verify your email address to start exploring delicious recipes.</p>
        <p>use this verification code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">RecipeNest - Where every recipe tells a story</p>
      </div>
    `
  };

  if (transporter && isEmailConfigured()) {
    try {
      await transporter.sendMail({ from: env.email.from, ...emailContent });
      console.log(`📧 Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      console.log('==========================================');
      console.log(`📧 VERIFICATION EMAIL (FALLBACK MODE)`);
      console.log(`To: ${email}`);
      console.log(`Verification Code: ${code}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('==========================================');
      return true;
    }
  } else {
    console.log('==========================================');
    console.log(`📧 VERIFICATION EMAIL (DEV MODE)`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('==========================================');
    return true;
  }
};

// Send password reset OTP
const sendPasswordResetOTP = async (email, name, otp) => {
  const emailContent = {
    to: email,
    subject: 'Password Reset OTP - RecipeNest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Use the following OTP to verify your identity:</p>
        <div style="background-color: #f3f4f6; padding: 20px; font-size: 32px; text-align: center; letter-spacing: 10px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">RecipeNest - Where every recipe tells a story</p>
      </div>
    `
  };

  if (transporter && isEmailConfigured()) {
    try {
      await transporter.sendMail({ from: env.email.from, ...emailContent });
      console.log(`📧 Password reset OTP sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      console.log('==========================================');
      console.log(`📧 PASSWORD RESET OTP (FALLBACK MODE)`);
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('==========================================');
      return true;
    }
  } else {
    console.log('==========================================');
    console.log(`📧 PASSWORD RESET OTP (DEV MODE)`);
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('==========================================');
    return true;
  }
};

// Send password reset success email
const sendPasswordResetSuccess = async (email, name) => {
  const emailContent = {
    to: email,
    subject: 'Password Reset Successful - RecipeNest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Password Reset Successful</h2>
        <p>Hello ${name},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">RecipeNest - Where every recipe tells a story</p>
      </div>
    `
  };

  if (transporter && isEmailConfigured()) {
    try {
      await transporter.sendMail({ from: env.email.from, ...emailContent });
      console.log(`📧 Password reset success email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending success email:', error.message);
      return true;
    }
  } else {
    console.log(`📧 Password reset successful for: ${email}`);
    return true;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetOTP, 
  sendPasswordResetSuccess 
};