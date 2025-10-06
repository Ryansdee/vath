import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  console.log("API Route called");
  console.log("GMAIL_USER:", process.env.GMAIL_USER);
  console.log("GMAIL_APP_PASSWORD exists:", !!process.env.GMAIL_APP_PASSWORD);
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #090860; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 30px; }
            .field { margin-bottom: 24px; }
            .field-label { margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
            .field-value { margin: 0; padding: 12px 16px; background-color: #f9fafb; border-left: 4px solid #090860; font-size: 16px; color: #111827; }
            .field-value a { color: #090860; text-decoration: none; font-weight: 600; }
            .message-value { white-space: pre-wrap; line-height: 1.6; padding: 16px; }
            .cta { text-align: center; padding: 20px 0; }
            .button { display: inline-block; padding: 14px 32px; background-color: #090860; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; }
            .footer p { margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5; }
            .timestamp { margin-top: 16px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Message</h1>
            </div>
            <div class="content">
              <div class="field">
                <p class="field-label">Name</p>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <p class="field-label">Email</p>
                <div class="field-value">
                  <a href="mailto:${email}">${email}</a>
                </div>
              </div>
              <div class="field">
                <p class="field-label">Message</p>
                <div class="field-value message-value">${message}</div>
              </div>
              <div class="cta">
                <a href="mailto:${email}" class="button">Reply to ${name}</a>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from the contact form on<br><strong>vadimthevelin.com</strong></p>
              <p class="timestamp">${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "contact@vadimthevelin.com",
      subject: `📩 New contact from ${name}`,
      html: emailHTML,
      replyTo: email,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}