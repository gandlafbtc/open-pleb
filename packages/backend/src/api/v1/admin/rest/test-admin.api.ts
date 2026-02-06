// Test file for admin API layer
// This should be allowed to import from business/admin
import { TestAdminBusiness } from "../../../../business/admin/test-admin.business";

export class TestAdminApi {
  private business = new TestAdminBusiness();

  async testEndpoint() {
    // This is allowed - API can use business
    return this.business.testMethod();
  }
}
