// Cuba's country code. Local mobile numbers are 8 digits starting with 5 (e.g. 5555 5555).
const CUBA_CODE = "53";

/**
 * Digits only, with the country code WhatsApp needs. People type numbers the
 * way they dial them locally ("5555 5555", "(53) 5555 5555", "+53 5555 5555",
 * "0053..."), but wa.me only opens the right chat for the full international form.
 */
export function whatsappDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length === 8 && digits.startsWith("5")) return CUBA_CODE + digits;
  return digits;
}

/** A wa.me link to chat with `number`, optionally with the message prefilled. */
export function whatsappChatUrl(number: string, message?: string): string {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** A wa.me link that lets the person pick who to send `message` to. */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
