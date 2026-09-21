const fs = require("node:fs");
const crypto = require("node:crypto");
require("dotenv").config({ quiet: true });

if (process.argv.includes("--init-secret") && !process.env.CRON_SECRET) {
  const secret = crypto.randomBytes(32).toString("hex");
  fs.appendFileSync(".env", `\nCRON_SECRET=${secret}\n`);
  process.env.CRON_SECRET = secret;
  console.log("Created CRON_SECRET in the ignored .env file (value hidden).");
}
const required = ["WEB_PUSH_EMAIL", "WEB_PUSH_PUBLIC_KEY", "WEB_PUSH_PRIVATE_KEY", "NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY", "CRON_SECRET"];
let valid = true;
for (const name of required) {
  const present = Boolean(process.env[name]);
  console.log(`${name}: ${present ? "present" : "MISSING"}`);
  valid &&= present;
}
try {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(process.env.WEB_PUSH_PRIVATE_KEY || "", "base64url"));
  if (ecdh.getPublicKey().toString("base64url") !== process.env.WEB_PUSH_PUBLIC_KEY ||
      process.env.WEB_PUSH_PUBLIC_KEY !== process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) throw new Error();
  require("web-push").setVapidDetails(process.env.WEB_PUSH_EMAIL, process.env.WEB_PUSH_PUBLIC_KEY, process.env.WEB_PUSH_PRIVATE_KEY);
  console.log("VAPID key pair, browser key, and subject: valid");
} catch {
  valid = false;
  console.error("VAPID configuration is invalid or keys do not match.");
}
process.exitCode = valid ? 0 : 1;
