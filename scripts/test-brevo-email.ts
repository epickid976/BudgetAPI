/**
 * Test script to verify Brevo email configuration
 * 
 * Run with: tsx scripts/test-brevo-email.ts your-email@example.com
 */

import { env } from "../api/src/config/env.js";

const testEmail = process.argv[2];

if (!testEmail) {
  console.error("❌ Please provide an email address to test");
  console.log("Usage: tsx scripts/test-brevo-email.ts your-email@example.com");
  process.exit(1);
}

console.log("🔍 Testing Brevo Email Configuration\n");

// Check if Brevo is configured
if (!env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is not configured");
  console.log("Set it in your .env file or environment variables");
  process.exit(1);
}

console.log("✅ BREVO_API_KEY is configured");
console.log(`📧 Sender: ${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`);
console.log(`📨 Recipient: ${testEmail}\n`);

// Test sending email via Brevo API
async function testBrevoEmail() {
  const requestBody = {
    sender: { 
      name: env.EMAIL_FROM_NAME, 
      email: env.EMAIL_FROM 
    },
    to: [{ email: testEmail }],
    subject: "Test Email from Budget API",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #2563eb;">✅ Email Configuration Test</h1>
          <p>This is a test email from your Budget API.</p>
          <p>If you received this, your Brevo email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sender: ${env.EMAIL_FROM}<br>
            Time: ${new Date().toISOString()}
          </p>
        </body>
      </html>
    `
  };

  console.log("🔍 Sending test email to Brevo...\n");
  console.log("Request body:");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log();

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ BREVO API ERROR:");
      console.error(errorText);
      console.error();
      
      try {
        const error = JSON.parse(errorText);
        console.error("Parsed error:", JSON.stringify(error, null, 2));
        
        // Provide specific help based on error
        if (errorText.includes("sender") || errorText.includes("not valid")) {
          console.error("\n❗ SENDER EMAIL NOT VALIDATED");
          console.error(`The sender email "${env.EMAIL_FROM}" is not validated in your Brevo account.`);
          console.error("\nTo fix this:");
          console.error("1. Go to Brevo Dashboard → Senders & IP");
          console.error("2. Add and verify this sender email");
          console.error("OR");
          console.error("3. Change EMAIL_FROM to a validated sender in your environment");
        }
      } catch {
        // Error wasn't JSON
      }
      
      process.exit(1);
    }

    const data = await response.json();
    console.log("✅ SUCCESS! Email sent to Brevo\n");
    console.log("Response data:");
    console.log(JSON.stringify(data, null, 2));
    console.log();
    console.log(`📬 Check ${testEmail} for the test email!`);
    console.log(`Message ID: ${data.messageId || data.messageIds || 'N/A'}`);
    
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

testBrevoEmail();

