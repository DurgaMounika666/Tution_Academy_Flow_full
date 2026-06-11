const nodemailer = require("nodemailer");

class EmailService {
  static transporter = null;

  static async getTransporter() {
    if (this.transporter) return this.transporter;

    // Check if user has SMTP settings in process.env
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      console.log("[EmailService] Using configured SMTP transporter:", host);
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: port == 465, // true for 465, false for other ports
        auth: { user, pass },
      });
    } else {
      console.log("[EmailService] SMTP settings missing. Creating ephemeral Ethereal testing account...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log("[EmailService] Created Ethereal account:", testAccount.user);
      } catch (err) {
        console.error("[EmailService] Failed to create Ethereal account, using console fallback:", err.message);
        // Console fallback transporter
        this.transporter = {
          sendMail: async (mailOptions) => {
            console.log("=========================================");
            console.log("EMAIL CONSOLE FALLBACK:");
            console.log(`TO: ${mailOptions.to}`);
            console.log(`SUBJECT: ${mailOptions.subject}`);
            console.log("BODY:");
            console.log(mailOptions.html || mailOptions.text);
            console.log("=========================================");
            return { messageId: "console-fallback-id" };
          }
        };
      }
    }
    return this.transporter;
  }

  static async sendOtp(email, name, otp) {
    try {
      const transporter = await this.getTransporter();
      const fromEmail = process.env.SMTP_FROM || '"Academy Flow" <noreply@academyflow.com>';

      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: "Your Password Reset OTP - Academy Flow",
        text: `Hello ${name},\n\nYour OTP for resetting your password is: ${otp}.\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nAcademy Flow Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4f46e5; margin: 0;">Academy Flow</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Educational Platform</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
            <p style="font-size: 16px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              We received a request to reset your password. Use the verification code (OTP) below to proceed:
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
              This code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
            <p style="font-size: 12px; text-align: center; color: #94a3b8;">
              © ${new Date().getFullYear()} Academy Flow. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] OTP Email sent successfully to ${email}. Message ID: ${info.messageId}`);
      
      // If using Ethereal, log the preview URL
      if (nodemailer.getTestMessageUrl) {
        const url = nodemailer.getTestMessageUrl(info);
        if (url) {
          console.log(`[EmailService] Preview URL: ${url}`);
          return { success: true, previewUrl: url };
        }
      }
      return { success: true };
    } catch (error) {
      console.error("[EmailService] Error sending OTP email:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }
}

module.exports = { EmailService };
