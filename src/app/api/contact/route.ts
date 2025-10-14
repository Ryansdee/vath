import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Configuration email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Templates d'emails HTML avec design
const emailTemplates = {
  photography: {
    subject: "NEW REQUEST — PHOTOGRAPHY",
    html: (name: string, email: string, info: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Photography Service Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                </table>
              </div>
              ${info ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Project Details</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${info.replace(/\n/g, '<br>')}</p>
              </div>
              ` : `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999999; font-size: 12px; font-weight: 300; font-style: italic;">No additional details provided.</p>
              </div>
              `}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin — Photographer</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },
  
  videography: {
    subject: "NEW REQUEST — VIDEOGRAPHY",
    html: (name: string, email: string, info: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Videography Service Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                </table>
              </div>
              ${info ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Project Details</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${info.replace(/\n/g, '<br>')}</p>
              </div>
              ` : `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999999; font-size: 12px; font-weight: 300; font-style: italic;">No additional details provided.</p>
              </div>
              `}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin — Videographer</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },
  
  direction: {
    subject: "NEW REQUEST — DIRECTION",
    html: (name: string, email: string, info: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Direction Service Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                </table>
              </div>
              ${info ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Project Details</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${info.replace(/\n/g, '<br>')}</p>
              </div>
              ` : `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999999; font-size: 12px; font-weight: 300; font-style: italic;">No additional details provided.</p>
              </div>
              `}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin — Director</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  },
  
  portal: {
    subject: "YOUR PORTAL ACCESS — VADIM THEVELIN",
    html: (name: string, email: string, info: string) => {
      const portalId = Buffer.from(`${email}-${Date.now()}`).toString('base64url');
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${portalId}`;
      
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Portal Access Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Portal ID</td>
                    <td style="color: #000000; font-size: 12px; font-weight: 300; font-family: monospace;">${portalId}</td>
                  </tr>
                </table>
              </div>
              ${info ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Additional Information</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${info.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
              <div style="margin-top: 30px; padding: 30px; background-color: #f5f5f5; text-align: center;">
                <p style="margin: 0 0 20px 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Temporary Portal Link</p>
                <a href="${portalUrl}" style="display: inline-block; padding: 15px 30px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Access Portal</a>
                <p style="margin: 20px 0 0 0; color: #999999; font-size: 10px; font-weight: 300; line-height: 1.4;">This link will be replaced with your permanent portal once Vadim uploads your files.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();
    }
  },
  
  general: {
    subject: "NEW REQUEST — GENERAL INQUIRY",
    html: (name: string, email: string, info: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">General Inquiry</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                </table>
              </div>
              ${info ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Message</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${info.replace(/\n/g, '<br>')}</p>
              </div>
              ` : `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999999; font-size: 12px; font-weight: 300; font-style: italic;">No message provided.</p>
              </div>
              `}
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin — Visual Creator</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }
};

export async function POST(request: Request) {
  try {
    const { name, email, service, additionalInfo } = await request.json();

    // Validation
    if (!name || !email || !service) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // CAS SPÉCIAL : Service Portal
    if (service === "portal") {
      // Créer un portail vide dans Firestore
      const portalData = {
        clientName: name,
        clientEmail: email,
        files: [], // Vide au départ, vous ajouterez les fichiers plus tard
        projectName: "Awaiting Files",
        createdAt: Timestamp.now(),
        additionalInfo: additionalInfo || "",
      };

      const portalRef = await addDoc(collection(db, "portals"), portalData);
      const portalId = portalRef.id;
      const portalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/portal/${portalId}`;

      // Envoyer email au client avec lien du portail
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Portal Access — Vadim Thevelin",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Your Portal is Ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Your personal portal has been created. I'll upload your files shortly and you'll be notified when they're ready.</p>
              <p style="margin: 0 0 30px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">You can bookmark this link to access your portal anytime:</p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${portalUrl}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Access Your Portal</a>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Portal ID</p>
                <p style="margin: 0; color: #000000; font-size: 12px; font-weight: 300; font-family: monospace;">${portalId}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      });

      // Envoyer notification à vous
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "NEW PORTAL REQUEST",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Portal Access Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Client Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase; width: 100px;">Name</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Email</td>
                    <td style="color: #000000; font-size: 14px; font-weight: 300;"><a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px; text-transform: uppercase;">Portal ID</td>
                    <td style="color: #000000; font-size: 12px; font-weight: 300; font-family: monospace;">${portalId}</td>
                  </tr>
                </table>
              </div>
              ${additionalInfo ? `
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Additional Information</h2>
                <p style="margin: 0; color: #333333; font-size: 14px; font-weight: 300; line-height: 1.6;">${additionalInfo.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
              <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; text-align: center;">
                <a href="${portalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">View Portal</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Upload files to this portal using the admin panel</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      });

      return NextResponse.json({ success: true, portalId, portalUrl });
    }

    // Pour les autres services (photography, videography, etc.)
    const template = emailTemplates[service as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      );
    }

    const emailBody = template.html(name, email, additionalInfo || "");

    // Envoyer l'email à vous (Vadim)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'contact@vadimthevelin.com',
      subject: template.subject,
      html: emailBody,
      replyTo: email,
    });

    // Email de confirmation au client
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Request Received — Vadim Thevelin",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 40px; background-color: #000000; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase;">Request Received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; background-color: #ffffff; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Thank you for reaching out! I've received your <strong>${service}</strong> service request and will get back to you as soon as possible.</p>
              <p style="margin: 0; color: #000000; font-size: 14px; font-weight: 300; line-height: 1.6;">Best regards,<br>Vadim</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f5f5f5; border: 1px solid #e5e5e5; border-top: none; text-align: center;">
              <p style="margin: 0 0 5px 0; color: #000000; font-size: 12px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Vadim Thevelin</p>
              <p style="margin: 0; color: #666666; font-size: 11px; font-weight: 300; letter-spacing: 1px;">Brussels, Belgium</p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 10px; font-weight: 300; font-style: italic;">This is an automated confirmation email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}