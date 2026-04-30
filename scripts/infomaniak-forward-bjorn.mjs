#!/usr/bin/env node

const API = "https://api.infomaniak.com";
const DOMAIN = process.env.SOVAREQ_DOMAIN || "sovareq.com";
const TOKEN = process.env.INFOMANIAK_API_TOKEN;
const MAIL_HOSTING_ID = process.env.INFOMANIAK_MAIL_HOSTING_ID;
const APPLY = process.argv.includes("--apply");

const MAILBOX_NAME = "bjorn";
const TARGET = "brainzzlab@gmail.com";

function usage() {
  console.log(`Usage:
  INFOMANIAK_API_TOKEN=... node scripts/infomaniak-forward-bjorn.mjs
  INFOMANIAK_API_TOKEN=... INFOMANIAK_MAIL_HOSTING_ID=12345 node scripts/infomaniak-forward-bjorn.mjs --apply

Default action:
  Forward ${MAILBOX_NAME}@${DOMAIN} to ${TARGET}

Notes:
  Without --apply this only checks the account and prints what it would do.
  With --apply it adds ${TARGET} as a forwarding address on ${MAILBOX_NAME}@${DOMAIN}.
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
    const code = payload.error?.code;
    const detail = payload.error?.description || payload.error || payload.raw || response.statusText;
    const error = new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${detail}`);
    error.code = code;
    throw error;
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

function extractForwardingAddresses(data) {
  const candidates = [
    data?.redirect_addresses,
    data?.redirection?.redirect_addresses,
    data?.forwarding_addresses,
    data?.addresses,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === "string" ? item : item?.email || item?.address)).filter(Boolean);
    }
  }

  return [];
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

  const path = `/1/mail_hostings/${mailHostingId}/mailboxes/${MAILBOX_NAME}/forwarding_addresses`;
  const forwarding = await api(path);
  const existing = extractForwardingAddresses(forwarding.data);

  console.log(`Mail hosting id: ${mailHostingId}`);
  console.log(`Mailbox: ${MAILBOX_NAME}@${DOMAIN}`);
  console.log(`Target: ${TARGET}`);
  console.log(`Existing forwarding addresses: ${existing.length ? existing.join(", ") : "(none found)"}`);

  if (existing.includes(TARGET)) {
    console.log(`OK already forwards to ${TARGET}`);
    return;
  }

  if (!APPLY) {
    console.log(`Dry-run: would add forwarding ${MAILBOX_NAME}@${DOMAIN} -> ${TARGET}`);
    return;
  }

  try {
    await api(path, {
      method: "POST",
      body: JSON.stringify({ redirect_address: TARGET }),
    });
    console.log(`Created forwarding: ${MAILBOX_NAME}@${DOMAIN} -> ${TARGET}`);
  } catch (error) {
    if (error.code === "redirect_address_already_exists") {
      console.log(`OK already forwards to ${TARGET}`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
