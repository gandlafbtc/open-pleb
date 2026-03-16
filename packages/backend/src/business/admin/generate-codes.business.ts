import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";
import { InsertUser } from "common/db/schema";
import { getUnixNow } from "common/util";
import { insertCodes } from "../../repository/admin/user.admin.repository";

export const generateCodes = async (count: number, expiresAt?: number): Promise<InsertUser[]> => {
  validateInputs(count, expiresAt)
  const codes: InsertUser[] = []
  for (let i = 0; i < count; i++) {
    const codeBytes = randomBytes(16)
    const code = bytesToHex(codeBytes).toUpperCase()
    const insertUser: InsertUser = {
      codeCreatedAt: getUnixNow(),
      inviteCode: code,
      codeExpiresAt: expiresAt,
    }
    codes.push(insertUser)
  }
  const inserted = await insertCodes(codes)
  return inserted;
}

const validateInputs = (count: number, expiresAt?: number): void => {
  const MAX_CODES = 100
  // Validate count is a positive number
  if (!Number.isInteger(count) || count <= 0 || count >  MAX_CODES) {
    throw new Error("Count must be a positive integer below or equal 100");
  }

  // Validate expiresAt if provided
  if (expiresAt !== undefined) {
    // Check if it's a valid number
    if (!Number.isInteger(expiresAt) || expiresAt <= 0) {
      throw new Error("ExpiresAt must be a valid Unix timestamp");
    }

    // Check if it's in the future
    if (expiresAt <= getUnixNow()) {
      throw new Error("ExpiresAt must be a Unix timestamp in the future");
    }
  }
}