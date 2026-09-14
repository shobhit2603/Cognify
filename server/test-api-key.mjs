/**
 * API Key Tester — supports Mistral and Groq
 * Usage:
 *   node test-api-key.mjs <KEY>           # auto-detects provider by key prefix
 *   node test-api-key.mjs <KEY> mistral   # force Mistral
 *   node test-api-key.mjs <KEY> groq      # force Groq
 */

import https from "https";

const apiKey = process.argv[2];
const forceProvider = process.argv[3]?.toLowerCase();

if (!apiKey) {
  console.error("\n❌  No API key provided.");
  console.error("   Usage: node test-api-key.mjs <YOUR_API_KEY> [mistral|groq]\n");
  process.exit(1);
}

// Auto-detect provider from key prefix
const provider = forceProvider || (apiKey.startsWith("gsk_") ? "groq" : "mistral");

const configs = {
  mistral: {
    hostname: "api.mistral.ai",
    path: "/v1/chat/completions",
    model: "mistral-small-latest",
    label: "Mistral",
  },
  groq: {
    hostname: "api.groq.com",
    path: "/openai/v1/chat/completions",
    model: "groq/compound-mini",
    label: "Groq (Compound Mini)",
  },
};

const cfg = configs[provider];
if (!cfg) {
  console.error(`\n❌  Unknown provider "${provider}". Use "mistral" or "groq".\n`);
  process.exit(1);
}

console.log(`\n🔑  Testing key  : ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
console.log(`🤖  Provider     : ${cfg.label}`);
console.log(`⏳  Sending request...\n`);

const body = JSON.stringify({
  model: cfg.model,
  messages: [{ role: "user", content: "Reply with exactly: OK" }],
  max_tokens: 10,
});

const options = {
  hostname: cfg.hostname,
  path: cfg.path,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    let parsed;
    try { parsed = JSON.parse(data); } catch { parsed = {}; }

    if (res.statusCode === 200) {
      const reply = parsed.choices?.[0]?.message?.content;
      console.log("✅  SUCCESS! Key is valid and working.");
      console.log(`   Model replied  : "${reply}"`);
      console.log(`   Model used     : ${parsed.model}`);
      console.log(`   Tokens used    : ${parsed.usage?.total_tokens}\n`);
      console.log("👉  Add this to your .env:");
      if (provider === "groq") {
        console.log(`   GROQ_API_KEY=${apiKey}\n`);
      } else {
        console.log(`   MISTRAL_API_KEY=${apiKey}\n`);
      }
    } else {
      const errMsg = parsed.error?.message || parsed.message || "Unknown error";
      const errType = parsed.error?.type || parsed.type || "";
      const errCode = parsed.error?.code || parsed.code || res.statusCode;
      console.error(`❌  FAILED with status ${res.statusCode}`);
      console.error(`   Error type  : ${errType}`);
      console.error(`   Message     : ${errMsg}`);
      console.error(`   Code        : ${errCode}\n`);

      if (res.statusCode === 429) {
        console.warn("⚠️   This key/account is RATE LIMITED or QUOTA EXHAUSTED.");
        if (provider === "groq") {
          console.warn("   → Check usage at: https://console.groq.com/usage\n");
        } else {
          console.warn("   → Check usage at: https://console.mistral.ai/usage\n");
        }
      } else if (res.statusCode === 401) {
        console.warn("⚠️   This key is INVALID or REVOKED.\n");
      }
    }
  });
});

req.on("error", (e) => {
  console.error("❌  Network error:", e.message);
});

req.write(body);
req.end();
