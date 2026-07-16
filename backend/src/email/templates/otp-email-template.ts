export function otpEmailTemplate(otp: string, firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your Truth Lens account</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Roboto:wght@300;400;500;600&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      background-color: #0e0c08 !important;
      font-family: 'Roboto', sans-serif;
      color: #fdf8f0;
      width: 100% !important;
      height: 100% !important;
    }

    .bg-table {
      width: 100%;
      background-color: #0e0c08;
      border-collapse: collapse;
    }

    .bg-cell {
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 560px;
      margin: 0 auto;
    }

    /* ── Header / Logo ── */
    .header {
      text-align: center;
      margin-bottom: 36px;
    }

    .logo-mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #d97706 0%, #fbbf24 100%);
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon svg {
      width: 20px;
      height: 20px;
    }

    .logo-text {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 22px;
      letter-spacing: -0.3px;
      color: #fdf8f0;
    }

    .logo-text span {
      color: #f59e0b;
    }

    /* ── Card ── */
    .card {
      background: linear-gradient(160deg, #141008 0%, #100d07 100%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 48px 44px;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: -80px;
      right: -80px;
      width: 240px;
      height: 240px;
      background: radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 70%);
      pointer-events: none;
    }

    .card::after {
      content: '';
      position: absolute;
      bottom: -60px;
      left: -60px;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    /* ── Eye decoration ── */
    .eye-deco {
      text-align: center;
      margin-bottom: 28px;
    }

    .eye-ring {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(245,158,11,0.1);
      border: 1.5px solid rgba(245,158,11,0.3);
    }

    /* ── Typography ── */
    .greeting {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 26px;
      line-height: 1.25;
      color: #fdf8f0;
      margin-bottom: 14px;
    }

    .subtext {
      font-size: 15px;
      font-weight: 300;
      color: rgba(253,248,240,0.55);
      line-height: 1.65;
      margin-bottom: 36px;
    }

    /* ── OTP Block ── */
    .otp-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #f59e0b;
      margin-bottom: 12px;
    }

    .otp-block {
      background: rgba(245,158,11,0.06);
      border: 1.5px solid rgba(245,158,11,0.25);
      border-radius: 10px;
      padding: 22px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .otp-digits {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 40px;
      letter-spacing: 10px;
      color: #fdf8f0;
      line-height: 1;
    }

    .otp-copy-hint {
      font-size: 12px;
      color: rgba(253,248,240,0.45);
      text-align: right;
    }

    /* ── Expiry notice ── */
    .expiry-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(245,158,11,0.05);
      border: 1px solid rgba(245,158,11,0.15);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 36px;
    }

    .expiry-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #fbbf24;
      flex-shrink: 0;
    }

    .expiry-text {
      font-size: 13px;
      color: #d9b56a;
      font-weight: 400;
    }

    .expiry-text strong {
      font-weight: 600;
      color: #fbbf24;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      margin: 32px 0;
    }

    /* ── Security note ── */
    .security-note {
      font-size: 13px;
      color: rgba(253,248,240,0.45);
      line-height: 1.6;
    }

    .security-note strong {
      color: rgba(253,248,240,0.7);
      font-weight: 500;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 32px;
      padding: 0 8px;
    }

    .footer-text {
      font-size: 12px;
      color: rgba(253,248,240,0.25);
      line-height: 1.7;
    }

    .footer-text a {
      color: #b8863f;
      text-decoration: none;
    }

    .footer-brand {
      font-family: 'Playfair Display', serif;
      font-weight: 500;
      font-size: 13px;
      color: rgba(253,248,240,0.25);
      margin-top: 16px;
    }
  </style>
</head>
<body style="background-color:#0e0c08; margin:0; padding:0;">
  <table role="presentation" class="bg-table" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0c08" style="background-color:#0e0c08;">
    <tr>
      <td class="bg-cell" align="center" bgcolor="#0e0c08" style="background-color:#0e0c08;">
  <div class="wrapper">

    <!-- Logo -->
    <div class="header">
      <div class="logo-mark">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="12" cy="12" rx="10" ry="6" stroke="#1c1507" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="2.5" fill="#1c1507"/>
            <circle cx="12" cy="12" r="1" fill="#fbbf24"/>
          </svg>
        </div>
        <span class="logo-text">Truth<span>Lens</span></span>
      </div>
    </div>

    <!-- Card -->
    <div class="card">

      <!-- Eye icon -->
      <div class="eye-deco">
        <div class="eye-ring">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke="#f59e0b" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="2.8" fill="#f59e0b" opacity="0.6"/>
            <circle cx="12" cy="12" r="1.2" fill="#fbbf24"/>
          </svg>
        </div>
      </div>

      <p class="greeting">Verify your identity,<br/>${firstName}.</p>

      <p class="subtext">
        You're one step away from accessing Truth Lens. Use the code below
        to complete your email verification. Do not share this with anyone.
      </p>

      <!-- OTP -->
      <div class="otp-label">Your verification code</div>
      <div class="otp-block">
        <div class="otp-digits">${otp}</div>
        <div class="otp-copy-hint">Enter this<br/>in the app</div>
      </div>

      <!-- Expiry -->
      <div class="expiry-row">
        <div class="expiry-dot"></div>
        <div class="expiry-text">
          This code expires in <strong>5 minutes</strong>. Request a new one if it expires.
        </div>
      </div>

      <div class="divider"></div>

      <!-- Security -->
      <p class="security-note">
        <strong>Didn't request this?</strong> If you didn't try to sign in to Truth Lens,
        you can safely ignore this email. Someone may have entered your email by mistake.
        Your account remains secure.
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        This is an automated message from Truth Lens.<br/>
        Please do not reply to this email.
      </p>
      <p class="footer-brand">© ${new Date().getFullYear()} TruthLens. All rights reserved.</p>
    </div>

  </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
