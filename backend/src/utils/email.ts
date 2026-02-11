import nodemailer from "nodemailer";
import mjml2html from "mjml";
import Handlebars from "handlebars";

// Initialize the SMTP transporter using environment variables
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Send a warm invitation email to a new employee
export async function sendInviteEmail(
  email: string,
  rawToken: string,
  fullName: string,
) {
  const registerUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/register?token=${rawToken}&email=${encodeURIComponent(email)}`;

  const transporter = getTransporter();

  // MJML
  const mjml = `
  <mjml>
    <mj-head>
      <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700" />
      <mj-attributes>
        <mj-all font-family="Inter, Arial, sans-serif" color="#333333" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f4f7f9">
      <mj-section padding-bottom="0px" background-color="#ffffff">
        <mj-column width="100%">
          <mj-text font-size="24px" font-weight="700" color="#4A90E2">Welcome to the Team! 🚀</mj-text>
        </mj-column>
      </mj-section>
      
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="16px" line-height="1.6">
            Dear <strong>{{fullName}}</strong>,
          </mj-text>
          <mj-text font-size="16px" line-height="1.6">
            We are absolutely thrilled to have you join us! To get you started on your journey with the Employee Management System, please complete your registration by clicking the button below.
          </mj-text>
          <mj-button background-color="#4A90E2" color="white" border-radius="8px" font-size="16px" font-weight="bold" href="{{registerUrl}}" padding="20px 0px">
            Complete My Registration
          </mj-button>
          <mj-text font-size="14px" color="#777777">
            Note: This link is valid for the next 3 hours. If you have any trouble, feel free to reach out to the HR team.
          </mj-text>
          <mj-divider border-color="#eeeeee" border-width="1px" />
          <mj-text font-size="14px">
            Best Regards,<br />
            <strong>The Team</strong>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const template = Handlebars.compile(mjml);
  const htmlOutput = mjml2html(template({ fullName, registerUrl }));

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Warm Welcome, ${fullName}! Complete your registration`,
    html: htmlOutput.html,
  });
}

// Notify employee when a document has been rejected
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

  const mjml = `
  <mjml>
    <mj-body background-color="#f4f7f9">
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="20px" font-weight="700" color="#e74c3c">Document Revision Required</mj-text>
          <mj-text font-size="16px">Hi,</mj-text>
          <mj-text font-size="14px">The following document needs your attention:</mj-text>
          <mj-text font-size="14px"><strong>Type:</strong> {{documentType}}</mj-text>
          <mj-text font-size="14px"><strong>Reviewed by:</strong> {{reviewer}}</mj-text>
          <mj-text font-size="14px"><strong>Feedback:</strong> {{feedback}}</mj-text>
          <mj-button background-color="#e74c3c" color="white" href="{{frontendUrl}}">
            Re-upload Now
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const template = Handlebars.compile(mjml);
  const htmlOutput = mjml2html(
    template({
      documentType,
      reviewer,
      feedback: feedback ?? "No specific reason provided.",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    }),
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Attention Needed: Your ${documentType} requires revision`,
    html: htmlOutput.html,
  });
}

// Notify employee regarding their onboarding decision
export async function sendOnboardingDecisionEmail({
  to,
  decision,
  reviewer,
  onboardingId,
  feedback,
}: {
  to: string;
  decision: "approved" | "rejected";
  reviewer: string;
  onboardingId?: string;
  feedback?: string;
}) {
  const transporter = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const actionUrl = onboardingId
    ? `${frontendUrl}/employee/onboarding`
    : frontendUrl;

  const mjml = `
  <mjml>
    <mj-body background-color="#f4f7f9">
      <mj-section background-color="#ffffff">
        <mj-column>
          <mj-text font-size="20px" font-weight="700" color="{{color}}">
            {{statusTitle}}
          </mj-text>
          <mj-text font-size="16px">{{message}}</mj-text>
          <mj-text font-size="14px">Reviewer: <strong>{{reviewer}}</strong></mj-text>
          {{#if feedback}}
            <mj-text font-size="14px">Notes: {{feedback}}</mj-text>
          {{/if}}
          <mj-button background-color="{{color}}" color="white" href="{{actionUrl}}">
            Check Status
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `;

  const template = Handlebars.compile(mjml);
  const htmlOutput = mjml2html(
    template({
      reviewer,
      feedback: feedback ?? null,
      actionUrl,
      color: decision === "approved" ? "#2ecc71" : "#f39c12",
      statusTitle:
        decision === "approved"
          ? "Onboarding Approved! 🎉"
          : "Onboarding Update Needed",
      message:
        decision === "approved"
          ? "Great news! Your onboarding application has been fully approved. Welcome aboard!"
          : "Your onboarding application has been reviewed, but we need a few more changes before we can move forward.",
    }),
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject:
      decision === "approved"
        ? "Congratulations! Onboarding Approved"
        : "Update: Your Onboarding Status",
    html: htmlOutput.html,
  });
}
