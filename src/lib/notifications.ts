import nodemailer, { type Transporter } from "nodemailer";

type SendArgs = {
  to: string;
  subject: string;
  body: string;
};

const FROM_NAME = process.env.MAIL_FROM_NAME ?? "Klusblok";
const FROM_EMAIL = process.env.MAIL_FROM ?? "noreply@klusblok.nl";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

function htmlBody(args: SendArgs): string {
  const escapedBody = args.body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html>
<html lang="nl-NL">
  <body style="font-family: -apple-system, system-ui, sans-serif; background:#f6f8fb; padding:24px; margin:0; color:#1a2535;">
    <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(15,37,53,.08);">
      <div style="background:#1e4f70; padding:20px 28px; color:#fff; font-weight:700; font-size:16px;">
        <span style="color:#f7c021;">●</span> Klusblok
      </div>
      <div style="padding:28px; line-height:1.55; white-space:pre-wrap;">
        ${escapedBody}
      </div>
      <div style="padding:18px 28px; border-top:1px solid #eef2f7; color:#5c6878; font-size:12px;">
        Je krijgt deze mail omdat je een Klusblok-account hebt. Vragen?
        Mail <a href="mailto:info@klusblok.nl" style="color:#3586b6;">info@klusblok.nl</a>.
      </div>
    </div>
  </body>
</html>`;
}

export async function sendNotification(args: SendArgs): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[notification:console]", args.to, "—", args.subject);
    console.log(args.body);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: args.to,
      subject: args.subject,
      text: args.body,
      html: htmlBody(args),
    });
  } catch (err) {
    console.error("[notification:error]", args.to, args.subject, err);
    // Niet throwen — een mail-fout mag een claim/registratie niet breken.
  }
}
