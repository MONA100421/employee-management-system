import nodemailer from "nodemailer";
import mjml2html from "mjml";
import Handlebars from "handlebars";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail(email: string, rawToken: string) {
  const registerUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/register?token=${rawToken}&email=${encodeURIComponent(email)}`;

  const transporter = getTransporter();

  const html = `
    <p>You've been invited to register.</p>
    <p><a href="${registerUrl}">${registerUrl}</a></p>
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

  const mjml = `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text font-size="18px" font-weight="700">
            Your document was rejected
          </mj-text>
          <mj-text>Document: <strong>{{documentType}}</strong></mj-text>
          <mj-text>Reviewer: {{reviewer}}</mj-text>
          <mj-text>Reason: {{feedback}}</mj-text>
          <mj-button href="{{frontendUrl}}">
            Re-upload document
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
      feedback: feedback ?? "No reason provided.",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    }),
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Document rejected: ${documentType}`,
    html: htmlOutput.html,
  });
}

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
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text font-size="18px" font-weight="700">
            ${decision === "approved" ? "Onboarding Approved" : "Onboarding Requires Changes"}
          </mj-text>

          <mj-text>
            ${decision === "approved" ? "Your onboarding application has been approved." : "Your onboarding application has been reviewed and requires changes."}
          </mj-text>

          <mj-text>
            Reviewer: <strong>{{reviewer}}</strong>
          </mj-text>

          {{#if feedback}}
            <mj-text>Feedback: <strong>{{feedback}}</strong></mj-text>
          {{/if}}

          <mj-button href="{{actionUrl}}">
            View Onboarding
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
    }),
  );

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject:
      decision === "approved"
        ? "Onboarding Approved"
        : "Onboarding Requires Changes",
    html: htmlOutput.html,
  });
}