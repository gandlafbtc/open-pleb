// Test file for admin business layer
// This should be allowed to import from repository/admin
import { TestAdminRepository } from "../../repository/admin/test-admin.repository";

export class TestAdminBusiness {
  private repo = new TestAdminRepository();

  async testMethod() {
    // This is allowed - business can use repository
    return this.repo.testMethod();
  }
}
