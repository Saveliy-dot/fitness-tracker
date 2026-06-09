import crypto from "crypto";

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      const hash = derivedKey.toString("hex");
      resolve(`${salt}:${hash}`);
    });
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, storedHash] = hash.split(":");
    if (!salt || !storedHash) {
      resolve(false);
      return;
    }

    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      const computedHash = derivedKey.toString("hex");
      resolve(computedHash === storedHash);
    });
  });
}
