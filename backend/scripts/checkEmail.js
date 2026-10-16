/**
 * Check the email setup (Hostinger / SMTP) and the domain's anti-spam DNS.
 *
 *   npm run check-email                       → login test + DNS check
 *   npm run check-email -- you@example.com    → also sends a test email
 *
 * Nothing is changed; this only reads settings and DNS.
 */
import dns from "dns/promises";
import dotenv from "dotenv";
import {
  createTransporter,
  isEmailConfigured,
  getSenderEmail,
  getFromAddress,
} from "../services/mailer.js";

dotenv.config();

const ok = (msg) => console.log(`  ✅ ${msg}`);
const warn = (msg) => console.log(`  ⚠️  ${msg}`);
const bad = (msg) => console.log(`  ❌ ${msg}`);

const txt = async (name) => {
  try {
    return (await dns.resolveTxt(name)).map((parts) => parts.join(""));
  } catch {
    return [];
  }
};

const main = async () => {
  console.log("\n1) Email settings");
  if (!isEmailConfigured()) {
    bad("No email settings found. Add SMTP_HOST, SMTP_USER and SMTP_PASS to backend/.env");
    process.exit(1);
  }
  const usingSmtp = !!process.env.SMTP_HOST;
  const sender = getSenderEmail();
  const domain = String(sender).split("@")[1];
  console.log(`  Provider: ${usingSmtp ? process.env.SMTP_HOST : "Gmail (fallback)"}`);
  console.log(`  Sender:   ${getFromAddress()}`);
  if (!usingSmtp) warn("Still using Gmail — add SMTP_* to .env to use your Hostinger mailbox");

  console.log("\n2) SMTP login");
  try {
    await createTransporter().verify();
    ok("Logged in to the mail server");
  } catch (err) {
    bad(`Login failed: ${err.message}`);
    console.log("     Check SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in .env");
    process.exit(1);
  }

  console.log(`\n3) Anti-spam DNS records for ${domain}`);
  if (domain === "gmail.com") {
    warn("Sending from a gmail.com address — DNS is controlled by Google, skipping");
  } else {
    // MX
    let mx = [];
    try {
      mx = await dns.resolveMx(domain);
    } catch {
      /* none */
    }
    mx.length
      ? ok(`MX: ${mx.map((m) => m.exchange).join(", ")}`)
      : bad("MX: no mail server records found");

    // SPF
    const spf = (await txt(domain)).filter((r) => r.startsWith("v=spf1"));
    if (spf.length === 0) bad('SPF: missing — add TXT "v=spf1 include:_spf.mail.hostinger.com ~all"');
    else if (spf.length > 1) bad(`SPF: ${spf.length} records found — there must be exactly ONE (merge them)`);
    else if (!/hostinger/i.test(spf[0])) warn(`SPF: "${spf[0]}" — does not include Hostinger`);
    else ok(`SPF: ${spf[0]}`);

    // DKIM (Hostinger uses these selectors)
    const selectors = ["hostingermail-a", "hostingermail-b", "hostingermail-c"];
    let dkimFound = 0;
    for (const s of selectors) {
      const name = `${s}._domainkey.${domain}`;
      let found = (await txt(name)).some((r) => r.includes("DKIM") || r.includes("p="));
      if (!found) {
        try {
          found = (await dns.resolveCname(name)).length > 0;
        } catch {
          /* none */
        }
      }
      if (found) dkimFound++;
    }
    dkimFound > 0
      ? ok(`DKIM: ${dkimFound} Hostinger key(s) found`)
      : bad("DKIM: not found — enable it in hPanel → Emails → (domain) → DNS settings");

    // DMARC
    const dmarc = (await txt(`_dmarc.${domain}`)).find((r) => r.startsWith("v=DMARC1"));
    dmarc
      ? ok(`DMARC: ${dmarc}`)
      : bad(`DMARC: missing — add TXT at _dmarc.${domain}: "v=DMARC1; p=none; rua=mailto:${sender}"`);
  }

  console.log("\n4) Links in emails");
  const frontendUrl = process.env.FRONTEND_URL || "";
  if (!frontendUrl || /localhost|127\.0\.0\.1/.test(frontendUrl)) {
    warn(`FRONTEND_URL is "${frontendUrl}" — links to localhost look like spam. Use your real https:// address in production.`);
  } else if (!frontendUrl.startsWith("https://")) {
    warn(`FRONTEND_URL "${frontendUrl}" is not https://`);
  } else {
    ok(`FRONTEND_URL: ${frontendUrl}`);
  }

  const testTo = process.argv[2];
  if (testTo) {
    console.log(`\n5) Sending test email to ${testTo}`);
    try {
      const info = await createTransporter().sendMail({
        from: getFromAddress(),
        to: testTo,
        subject: "Xpect Group – email test",
        html: "<p>This is a test email from the Xpect Group portal.</p><p>If you received it in your inbox, the email setup works.</p>",
      });
      ok(`Sent (message id ${info.messageId}) — check the inbox AND the spam folder`);
    } catch (err) {
      bad(`Sending failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("");
};

main();
