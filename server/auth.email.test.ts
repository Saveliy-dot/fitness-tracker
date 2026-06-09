import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, verifyPassword } from "./_core/password";

describe("Email/Password Authentication", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "test-password-123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain(":");
      expect(hash.split(":")).toHaveLength(2);
    });

    it("should create different hashes for the same password", async () => {
      const password = "test-password-123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify correct password", async () => {
      const password = "test-password-123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "test-password-123";
      const wrongPassword = "wrong-password";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it("should reject invalid hash format", async () => {
      const password = "test-password-123";
      const invalidHash = "invalid-hash-without-colon";
      const isValid = await verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });

    it("should handle empty password", async () => {
      const password = "";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should handle long password", async () => {
      const password = "a".repeat(1000);
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should handle special characters in password", async () => {
      const password = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should handle unicode characters in password", async () => {
      const password = "пароль123!@#";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
