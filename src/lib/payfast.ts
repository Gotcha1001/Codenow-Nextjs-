import crypto from "crypto";

export const PAYFAST_URL = "https://www.payfast.co.za/eng/process";

export function getPayfastConfig() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const salt = process.env.PAYFAST_SALT_PASSPHRASE;

  if (!merchantId || !merchantKey) {
    throw new Error("Missing PAYFAST_MERCHANT_ID or PAYFAST_MERCHANT_KEY");
  }

  return {
    merchantId,
    merchantKey,
    salt: salt ?? null,
  };
}

/** PayFast MD5 signature (same field order as the old server). */
export function generateSignature(
  data: Record<string, string | number | undefined | null>,
  passPhrase: string | null = null,
): string {
  const keys = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "name_last",
    "email_address",
    "cell_number",
    "m_payment_id",
    "amount",
    "item_name",
    "item_description",
    "custom_int1",
    "custom_int2",
    "custom_int3",
    "custom_int4",
    "custom_int5",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_str4",
    "custom_str5",
    "email_confirmation",
    "confirmation_address",
    "payment_method",
  ];

  let pfOutput = "";
  for (const key of keys) {
    const raw = data[key];
    if (raw !== undefined && raw !== null && String(raw) !== "") {
      const encoded = encodeURIComponent(String(raw).trim()).replace(
        /%20/g,
        "+",
      );
      pfOutput += `${key}=${encoded}&`;
    }
  }

  let getString = pfOutput.slice(0, -1);
  if (passPhrase) {
    getString += `&passphrase=${passPhrase}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
