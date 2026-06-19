import sgMail from "@sendgrid/mail";
import { env } from "./env";

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  if (!env.sendgridApiKey && !env.isProduction) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  sgMail.setApiKey(env.sendgridApiKey);

  await sgMail.send({
    to: email,
    from: env.sendgridFromEmail,
    subject: "Verify your email — Deutsches Lernzentrum",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #00695c;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #00695c; letter-spacing: 8px; text-align: center; padding: 16px; background: #e8f5e9; border-radius: 12px; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #78909c;">This code expires in 10 minutes.</p>
        <p style="color: #78909c;">If you did not create an account, please ignore this email.</p>
      </div>
    `,
  });
}
