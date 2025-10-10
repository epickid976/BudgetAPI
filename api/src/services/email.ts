import { Resend } from "resend";
import { env } from "../config/env.js";

// Initialize Resend (will use RESEND_API_KEY from env)
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Check if email is configured
const isEmailEnabled = () => !!env.RESEND_API_KEY;

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.APP_URL}/verify-email?token=${token}`;
  
  // If email is not configured, just log to console
  if (!isEmailEnabled() || !resend) {
    console.log(`\n📧 EMAIL NOT CONFIGURED - Verification email would be sent to: ${email}`);
    console.log(`Verification URL: ${verificationUrl}\n`);
    return { id: "dev-mode", url: verificationUrl };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2563eb; margin-top: 0;">Welcome to Budget API!</h1>
              <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
  
  // If email is not configured, just log to console
  if (!isEmailEnabled() || !resend) {
    console.log(`\n📧 EMAIL NOT CONFIGURED - Password reset email would be sent to: ${email}`);
    console.log(`Reset URL: ${resetUrl}\n`);
    return { id: "dev-mode", url: resetUrl };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h1 style="color: #dc2626; margin-top: 0;">Password Reset Request</h1>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log("Password reset email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Send welcome email (optional)
 */
export async function sendWelcomeEmail(email: string) {
  // If email is not configured, just log to console
  if (!isEmailEnabled() || !resend) {
    console.log(`\n📧 EMAIL NOT CONFIGURED - Welcome email would be sent to: ${email}\n`);
    return { id: "dev-mode" };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Budget API!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2563eb; margin-top: 0;">🎉 Welcome to Budget API!</h1>
              <p>Your account has been successfully verified. You're all set to start managing your budget!</p>
              <h2 style="color: #2563eb; font-size: 18px;">What's Next?</h2>
              <ul style="color: #666;">
                <li>Create your first account (checking, savings, or credit)</li>
                <li>Set up expense and income categories</li>
                <li>Start tracking your transactions</li>
                <li>Create monthly budgets to reach your goals</li>
              </ul>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Need help? Reply to this email and we'll be happy to assist you.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw - this is optional
      return null;
    }

    console.log("Welcome email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw - this is optional
    return null;
  }
}

