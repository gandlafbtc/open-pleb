// Test file for admin repository
// This should be allowed to import db
import { db } from "../../db/db";

export class TestAdminRepository {
  async testMethod() {
    // This is allowed - repository can access db
    return db;
  }
}
