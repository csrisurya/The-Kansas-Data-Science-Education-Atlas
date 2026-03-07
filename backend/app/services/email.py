"""
Email service for the Kansas Data Science Education Atlas.

Supports two backends (chosen automatically based on env vars):
  1. SendGrid  – if SENDGRID_API_KEY is set
  2. SMTP      – fallback using SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD

All public functions handle errors gracefully and never raise to the caller.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# HTML template
# ---------------------------------------------------------------------------

def _build_confirmation_html(
    recipient_name: str,
    request_id: str,
    datasets: List[str],
    intended_use: str = "",
    download_url: str = "",
) -> str:
    """Return a styled HTML email body for data-request confirmations."""

    dataset_items = "".join(f"<li>{ds}</li>" for ds in datasets) if datasets else "<li>—</li>"

    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f7;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#512888;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">
              Kansas Data Science Education Atlas
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;margin-top:0;">Hi {recipient_name},</p>

            <p style="font-size:15px;">
              Thank you for your data request! We've received your submission and
              it is now being processed.
            </p>

            <!-- Request summary -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8f5ff;border-radius:6px;padding:16px;margin:20px 0;">
              <tr><td style="padding:16px;">
                <p style="margin:0 0 8px;font-weight:bold;color:#512888;">Request Summary</p>
                <p style="margin:4px 0;font-size:14px;">
                  <strong>Request&nbsp;ID:</strong> <code>{request_id}</code>
                </p>
                <p style="margin:4px 0 2px;font-size:14px;"><strong>Datasets Requested:</strong></p>
                <ul style="margin:4px 0 8px 20px;padding:0;font-size:14px;">
                  {dataset_items}
                </ul>
                {f'<p style="margin:4px 0;font-size:14px;"><strong>Intended Use:</strong> {intended_use}</p>' if intended_use else ''}
              </td></tr>
            </table>

            <!-- Download link -->
            {f'''
            <div style="text-align:center;margin:24px 0;">
              <a href="{download_url}"
                 style="display:inline-block;background:#512888;color:#ffffff;font-size:16px;font-weight:bold;padding:14px 36px;border-radius:6px;text-decoration:none;letter-spacing:0.5px;">
                📥 Download Your Datasets
              </a>
            </div>
            <p style="font-size:13px;color:#888;text-align:center;margin-top:0;">
              Or copy this link: <a href="{download_url}" style="color:#512888;word-break:break-all;">{download_url}</a>
            </p>
            ''' if download_url else '''
            <p style="font-size:15px;">
              ⏱️ <strong>Estimated processing time:</strong> 2–3 business days.<br>
              You will receive another email with a <strong>download link</strong>
              once your data is ready.
            </p>
            '''}

            <!-- Citation -->
            <div style="background:#fffbe6;border-left:4px solid #f7941d;padding:12px 16px;margin:20px 0;border-radius:4px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#b8860b;">
                📌 Citation Information
              </p>
              <p style="margin:0;font-size:13px;font-style:italic;color:#555;">
                Chandramouli S. (2026). The Kansas Data Science Education Atlas.
                Kansas State University.
                <a href="https://github.com/csrisurya/The-Kansas-Data-Science-Education-Atlas"
                   style="color:#512888;">GitHub Repository</a>
              </p>
            </div>

            <!-- Contact -->
            <p style="font-size:14px;color:#666;">
              Questions? Reply to this email or contact us at
              <a href="mailto:csrisurya@gmail.com" style="color:#512888;">csrisurya@gmail.com</a>.
            </p>

            <p style="font-size:15px;margin-bottom:0;">
              Best regards,<br>
              <strong>Kansas Data Science Education Atlas Team</strong><br>
              <span style="font-size:13px;color:#888;">Kansas State University</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f7;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
            Kansas State University · Manhattan, KS 66506<br>
            <a href="https://github.com/csrisurya/The-Kansas-Data-Science-Education-Atlas"
               style="color:#512888;text-decoration:none;">GitHub</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# SendGrid backend
# ---------------------------------------------------------------------------

def _send_via_sendgrid(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """Send email via SendGrid API. Returns True on success."""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Content, Email, Mail, To

        sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
        message = Mail(
            from_email=Email(settings.FROM_EMAIL),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_body),
        )
        response = sg.client.mail.send.post(request_body=message.get())
        logger.info(
            "SendGrid email sent to %s — status %s", to_email, response.status_code
        )
        return 200 <= response.status_code < 300
    except ImportError:
        logger.warning("sendgrid package not installed; falling back to SMTP.")
        return False
    except Exception:
        logger.exception("SendGrid email failed for %s", to_email)
        return False


# ---------------------------------------------------------------------------
# SMTP backend
# ---------------------------------------------------------------------------

def _send_via_smtp(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """Send email via SMTP. Returns True on success."""
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        smtp_host = settings.SMTP_HOST
        smtp_port = settings.SMTP_PORT

        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.ehlo()
            server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

        server.sendmail(settings.FROM_EMAIL, [to_email], msg.as_string())
        server.quit()

        logger.info("SMTP email sent to %s via %s:%s", to_email, smtp_host, smtp_port)
        return True
    except Exception:
        logger.exception("SMTP email failed for %s", to_email)
        return False


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_data_request_confirmation(
    recipient_email: str,
    recipient_name: str,
    request_id: str,
    datasets: List[str],
    intended_use: str = "",
    download_url: str = "",
) -> bool:
    """
    Send a data-request confirmation email with a download link.

    Tries SendGrid first (if ``SENDGRID_API_KEY`` is configured), then falls
    back to SMTP.  Returns ``True`` if the email was sent, ``False`` otherwise.
    Errors are logged but never raised.
    """
    subject = "Kansas Atlas – Your Datasets Are Ready!"
    html_body = _build_confirmation_html(
        recipient_name=recipient_name,
        request_id=request_id,
        datasets=datasets,
        intended_use=intended_use,
        download_url=download_url,
    )

    # Try SendGrid first
    if settings.SENDGRID_API_KEY:
        success = _send_via_sendgrid(recipient_email, subject, html_body)
        if success:
            return True
        logger.warning("SendGrid failed; attempting SMTP fallback for %s", recipient_email)

    # Fallback to SMTP
    if settings.SMTP_HOST:
        return _send_via_smtp(recipient_email, subject, html_body)

    # No email backend configured
    logger.warning(
        "No email backend configured (SENDGRID_API_KEY or SMTP_HOST). "
        "Confirmation email to %s was NOT sent.",
        recipient_email,
    )
    return False
