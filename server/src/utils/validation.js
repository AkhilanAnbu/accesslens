import { ObjectId } from "mongodb";

export function cleanText(value, maxLength = 500) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function cleanMultiline(value, maxLength = 2000) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/\r\n/g, "\n").slice(0, maxLength);
}

export function cleanStringArray(value, allowedValues = null, maxItems = 12) {
  if (!Array.isArray(value)) {
    return [];
  }

  const cleaned = value
    .map((item) => cleanText(item, 80))
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, maxItems);

  return allowedValues ? cleaned.filter((item) => allowedValues.includes(item)) : cleaned;
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 12, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
