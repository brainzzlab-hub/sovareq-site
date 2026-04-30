#!/usr/bin/env node

const API = "https://api.infomaniak.com";
const DOMAIN = process.env.SOVAREQ_DOMAIN || "sovareq.com";
const TOKEN = process.env.INFOMANIAK_API_TOKEN;
const MAIL_HOSTING_ID = process.env.INFOMANIAK_MAIL_HOSTING_ID;
const APPLY = process.argv.includes("--apply");

const mailboxNames = ["support", "info", "bjorn"];

function usage() {
  console.log(`Usage:
  INFOMANIAK_API_TOKEN=... node scripts/infomaniak-create-mailboxes.mjs
  INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-create-mailboxes.mjs --apply

Defaults:
  Domain: ${DOMAIN}
  Mailboxes: ${mailboxNames.map((name) => `${name}@${DOMAIN}`).join(", ")}

Notes:
  Without --apply this only checks the account and prints what it would do.
  INFOMANIAK_MAIL_HOSTING_ID is optional if the API products list exposes a
  matching ${DOMAIN} mail hosting.
`);
}

async function api(path, options = {}) {
  if (!TOKEN) {
    throw new Error("Missing INFOMANIAK_API_TOKEN.");
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok || payload.result === "error") {
    const detail = payload.error?.description || payload.error || payload.raw || response.statusText;
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${detail}`);
  }

  return payload;
}

function productMatchesDomain(product) {
  const haystack = [
    product.customer_name,
    product.service_name,
    product.name,
    product.display_name,
    product.domain,
    product.title,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(DOMAIN.toLowerCase());
}

async function findMailHostingId() {
  if (MAIL_HOSTING_ID) {
    return MAIL_HOSTING_ID;
  }

  const products = await api("/1/products");
  const list = Array.isArray(products.data) ? products.data : [];
  const candidates = list.filter((product) => {
    const type = String(product.service_name || product.type || product.product_type || "").toLowerCase();
    return type.includes("mail") || type.includes("email");
  });

  const match = candidates.find(productMatchesDomain) || candidates.find((product) => productMatchesDomain(product.product || {}));
  if (!match) {
    console.log("Mail hosting candidates returned by /1/products:");
    for (const product of candidates) {
      console.log(JSON.stringify(product, null, 2));
    }
    throw new Error(
      `Could not auto-detect the mail hosting id for ${DOMAIN}. Set INFOMANIAK_MAIL_HOSTING_ID explicitly.`,
    );
  }

  return match.id || match.product_id || match.service_id;
}

async function mailboxExists(mailHostingId, mailboxName) {
  const payload = await api(`/1/mail_hostings/${mailHostingId}/mailboxes`);
  const list = Array.isArray(payload.data) ? payload.data : [];
  return list.some((mailbox) => {
    const name = mailbox.mailbox_name || mailbox.name || mailbox.email || "";
    return name === mailboxName || name === `${mailboxName}@${DOMAIN}`;
  });
}

async function createMailbox(mailHostingId, mailboxName) {
  return api(`/1/mail_hostings/${mailHostingId}/mailboxes`, {
    method: "POST",
    body: JSON.stringify({
      mailbox_name: mailboxName,
      target: "current_user",
      note: "Created for Sovareq website contact",
    }),
  });
}

async function main() {
  if (process.argv.includes("--help")) {
    usage();
    return;
  }

  if (!TOKEN) {
    usage();
    throw new Error("Set INFOMANIAK_API_TOKEN first.");
  }

  const mailHostingId = await findMailHostingId();
  if (!mailHostingId) {
    throw new Error("Mail hosting id was empty.");
  }

  console.log(`Mail hosting id: ${mailHostingId}`);
  console.log(APPLY ? "Apply mode: creating missing mailboxes." : "Dry-run mode: no changes will be made.");

  for (const mailboxName of mailboxNames) {
    const email = `${mailboxName}@${DOMAIN}`;
    const exists = await mailboxExists(mailHostingId, mailboxName);
    if (exists) {
      console.log(`OK already exists: ${email}`);
      continue;
    }

    if (!APPLY) {
      console.log(`Would create: ${email}`);
      continue;
    }

    await createMailbox(mailHostingId, mailboxName);
    console.log(`Created: ${email}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
