import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: env.email.port === 465, // true for 465, false for other ports
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready to send messages');
  }
});

export const sendVerificationEmail = async (email, name, code) => {
  const verificationUrl = `${env.frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
  
  const mailOptions = {
    from: env.email.from,
    to: email,
    subject: 'Verify Your Email - RecipeNest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to RecipeNest, ${name}!</h2>
        <p>Thank you for signing up! Please verify your email address to start exploring delicious recipes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or use this verification code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account with RecipeNest, please ignore this email.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">RecipeNest - Where every recipe tells a story</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: env.email.from,
    to: email,
    subject: 'Password Reset Request - RecipeNest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">RecipeNest - Where every recipe tells a story</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};