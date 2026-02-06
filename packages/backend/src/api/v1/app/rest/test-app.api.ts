// Test file for app API layer
// This should be allowed to import from business/app
import { TestAppBusiness } from "../../../../business/app/test-app.business";

export class TestAppApi {
  private business = new TestAppBusiness();

  async testEndpoint() {
    // This is allowed - API can use business
    return this.business.testMethod();
  }
}
