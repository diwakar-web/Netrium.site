import 'dotenv/config';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let resendClient = null;
let transporter = null;
let isConfigured = false;

// Initialize email services (Resend primary, Nodemailer SMTP secondary)
const initEmailService = () => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && !resendClient) {
    try {
      resendClient = new Resend(resendApiKey);
      isConfigured = true;
      console.log(`[Email Service] Configured with Resend API (${resendApiKey.slice(0, 7)}...)`);
    } catch (e) {
      console.error(`[Resend Init Error]`, e.message);
    }
  }


  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
      isConfigured = true;
      console.log(`[Email Service] Configured with SMTP (${process.env.EMAIL_SERVICE || 'gmail'}) for ${emailUser}`);
    } catch (e) {
      console.error(`[Email Service Error]`, e.message);
    }
  }

  if (!resendClient && !transporter) {
    // Ethereal / simulated mode
    transporter = null;
    isConfigured = false;
    console.log(`[Email Service] Running in Development Mode. Real credentials not provided in .env (will log OTP to console and deliver via simulated carrier).`);
  }
};

initEmailService();

/**
 * Send 6-digit OTP email to user
 * @param {string} toEmail
 * @param {string} otpCode
 * @param {string} userName
 */
export const sendOtpEmail = async (toEmail, otpCode, userName = 'Researcher') => {
  if (!resendClient && !transporter) {
    initEmailService();
  }

  const mailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Netrium Laboratory Access Verification</title>
      <style>
        body { margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; }
        .wrapper { max-width: 580px; margin: 30px auto; background-color: #0a0e1a; border: 1px solid rgba(0, 191, 99, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 0 35px rgba(0, 191, 99, 0.15); }
        .header { background: linear-gradient(180deg, #0f172a 0%, #0a0e1a 100%); padding: 32px 30px; text-align: center; border-bottom: 1px solid rgba(0, 191, 99, 0.2); }
        .badge { display: inline-block; padding: 6px 14px; background: rgba(0, 191, 99, 0.12); border: 1px solid #00bf63; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #00bf63; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }
        .title { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .content { padding: 36px 32px; text-align: center; }
        .greeting { font-size: 16px; color: #cbd5e1; margin-bottom: 18px; }
        .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { display: inline-block; padding: 18px 36px; background: #000000; border: 2px dashed #00bf63; border-radius: 12px; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00bf63; text-shadow: 0 0 20px rgba(0, 191, 99, 0.5); margin-bottom: 24px; }
        .timer-warning { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 8px 16px; margin-bottom: 24px; }
        .footer { background-color: #060911; padding: 22px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="badge">Netrium Systems Laboratory</div>
          <h1 class="title">Account Creation Verification</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello, <strong>${userName}</strong></div>
          <p class="desc">
            You are initiating your primary research terminal on <strong>Netrium</strong>. 
            Use the 6-digit One-Time Passcode (OTP) below to authenticate and provision your account in our database.
          </p>
          <div class="otp-box">${otpCode}</div>
          <div class="timer-warning">
            <strong>Passcode Valid for Exactly 5 Minutes</strong>
          </div>
          <p class="desc" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            If you did not request this account registration, please ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Netrium Systems Platform &bull; Real-Time Systems & Network Visualizations
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log OTP prominently in terminal for instant development & debug verification
  console.log(`\n=============================================================`);
  console.log(`[NETRIUM OTP DISPATCH] -> Target: ${toEmail}`);
  console.log(`[PASSCODE] >>>>>  ${otpCode}  <<<<< (Valid for 5 minutes)`);
  console.log(`=============================================================\n`);

  // Helper for SMTP fallback dispatch
  const sendViaTransporter = async () => {
    try {
      const mailOptions = {
        from: `"Netrium Laboratory Auth" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Netrium Laboratory OTP: ${otpCode} (Valid for 5 mins)`,
        text: `Your Netrium account verification code is: ${otpCode}. Valid for 5 minutes.`,
        html: mailHtml
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent Successfully via SMTP] ID: ${info.messageId} to ${toEmail}`);
      return { success: true, dispatched: true, id: info.messageId, provider: 'nodemailer', otp: otpCode };
    } catch (err) {
      console.error(`[Email Send Error] Failed sending to ${toEmail}: ${err.message}`);
      return { success: true, simulated: true, warning: err.message, otp: otpCode };
    }
  };

  // 1. Prioritize Resend API dispatch if configured
  if (resendClient) {
    try {
      const fromSender = process.env.RESEND_FROM || 'Netrium <onboarding@resend.dev>';
      const { data, error } = await resendClient.emails.send({
        from: fromSender,
        to: [toEmail],
        subject: `Netrium Laboratory OTP: ${otpCode} (Valid for 5 mins)`,
        text: `Your Netrium account verification code is: ${otpCode}. Valid for 5 minutes.`,
        html: mailHtml
      });

      if (error) {
        console.error(`[Resend Send Error] Failed sending to ${toEmail}:`, error.message || error);
        if (transporter) {
          return await sendViaTransporter();
        }
        return { success: true, simulated: true, warning: error.message, otp: otpCode };
      }

      console.log(`[Resend Dispatch Success] ID: ${data?.id} delivered to ${toEmail}`);
      return { success: true, dispatched: true, id: data?.id, provider: 'resend', otp: otpCode };
    } catch (err) {
      console.error(`[Resend Dispatch Exception] ${err.message}`);
      if (transporter) {
        return await sendViaTransporter();
      }
      return { success: true, simulated: true, warning: err.message, otp: otpCode };
    }
  }

  // 2. Transporter fallback if Resend not configured
  if (transporter) {
    return await sendViaTransporter();
  }

  // 3. Fallback simulated dev mode
  return { success: true, simulated: true, otp: otpCode };
};
