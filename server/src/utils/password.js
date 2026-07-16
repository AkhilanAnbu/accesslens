import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedValue) {
  const [salt, storedHash] = storedValue.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  return (
    storedBuffer.length === derivedKey.length && crypto.timingSafeEqual(storedBuffer, derivedKey)
  );
}
