// Test file for app business layer
// This should be allowed to import from repository/app
import { TestAppRepository } from "../../repository/app/test-app.repository";

export class TestAppBusiness {
  private repo = new TestAppRepository();

  async testMethod() {
    // This is allowed - business can use repository
    return this.repo.testMethod();
  }
}
