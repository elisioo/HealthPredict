/** Strip HTML/script tags from a string to prevent XSS in user inputs. */
export default function stripTags(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
}

/** Allow only letters, spaces, hyphens, periods, and apostrophes in name fields. */
export function sanitizeName(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿÑñ\s'.,-]/g, "");
}
