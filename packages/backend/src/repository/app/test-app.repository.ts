// Test file for app repository
// This should be allowed to import db
import { db } from "../../db/db";

export class TestAppRepository {
  async testMethod() {
    // This is allowed - repository can access db
    return db;
  }
}
