import { Resend } from "resend";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    private static instance: EmailService;
    private resend: Resend;
    private fromEmail: string;

    private constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    private async send(options: EmailOptions): Promise<boolean> {
        try {
            const { error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            if (error) {
                console.error("[EmailService] Send error:", error);
                return false;
            }

            return true;
        } catch (error) {
            console.error("[EmailService] Exception:", error);
            return false;
        }
    }

    public async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #00d4ff; margin-bottom: 30px; }
            h1 { color: #ffffff; margin-bottom: 20px; }
            p { color: #b0b0b0; line-height: 1.8; }
            .highlight { color: #00d4ff; font-weight: 600; }
            .button { display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🛡️ ApniSec</div>
            <h1>Welcome to Trackify, ${name || "there"}!</h1>
            <p>Thank you for joining <span class="highlight">ApniSec's Trackify</span> platform. You now have access to our powerful security issue tracking system.</p>
            <p>With Trackify, you can:</p>
            <ul style="color: #b0b0b0;">
              <li>Track Cloud Security issues</li>
              <li>Manage VAPT assessments</li>
              <li>Coordinate Red Team activities</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} ApniSec. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return this.send({
            to,
            subject: "Welcome to ApniSec Trackify! 🛡️",
            html,
        });
    }

    public async sendIssueCreatedEmail(
        to: string,
        issue: { type: string; title: string; description: string }
    ): Promise<boolean> {
        const typeLabels: Record<string, string> = {
            CLOUD_SECURITY: "Cloud Security",
            RETEAM_ASSESSMENT: "Red Team Assessment",
            VAPT: "VAPT",
        };

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #00d4ff; margin-bottom: 30px; }
            h1 { color: #ffffff; margin-bottom: 20px; }
            p { color: #b0b0b0; line-height: 1.8; }
            .issue-card { background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; }
            .issue-type { display: inline-block; background: #00d4ff; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
            .issue-title { color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 10px; }
            .issue-desc { color: #999; font-size: 14px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🛡️ ApniSec Trackify</div>
            <h1>New Issue Created</h1>
            <p>A new security issue has been created in your account:</p>
            <div class="issue-card">
              <span class="issue-type">${typeLabels[issue.type] || issue.type}</span>
              <div class="issue-title">${issue.title}</div>
              <div class="issue-desc">${issue.description}</div>
            </div>
            <p>You can view and manage this issue from your dashboard.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ApniSec. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return this.send({
            to,
            subject: `New Issue: ${issue.title}`,
            html,
        });
    }

    public async sendProfileUpdatedEmail(to: string, name: string): Promise<boolean> {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #00d4ff; margin-bottom: 30px; }
            h1 { color: #ffffff; margin-bottom: 20px; }
            p { color: #b0b0b0; line-height: 1.8; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🛡️ ApniSec</div>
            <h1>Profile Updated</h1>
            <p>Hi ${name || "there"},</p>
            <p>Your profile has been successfully updated. If you didn't make this change, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ApniSec. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        return this.send({
            to,
            subject: "Profile Updated - ApniSec Trackify",
            html,
        });
    }
}
