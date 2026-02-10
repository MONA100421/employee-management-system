import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendInviteEmail(email: string, rawToken: string) {
  const registerUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/register?token=${rawToken}&email=${encodeURIComponent(email)}`;
  const transporter = getTransporter();

  const html = `
    <p>You've been invited to register. Click the link below:</p>
    <p><a href="${registerUrl}">${registerUrl}</a></p>
    <p>This link expires in 7 days and can be used only once.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Invitation to register",
    html,
  });
}

export async function sendDocumentRejectedEmail({
  to,
  documentType,
  reviewer,
  feedback,
}: {
  to: string;
  documentType: string;
  reviewer: string;
  feedback?: string;
}) {
  const transporter = getTransporter();

  const html = `
    <p>Your document <strong>${documentType}</strong> was rejected.</p>
    <p>By: ${reviewer}</p>
    <p>Reason: ${feedback ?? "No reason provided."}</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Document Rejected",
    html,
  });
}
