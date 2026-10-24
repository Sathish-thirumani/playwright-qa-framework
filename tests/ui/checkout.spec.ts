import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
  });

  test('a logged-in user can buy one item', async ({ inventoryPage, checkoutPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillDetails('Asha', 'Rao', '500001');
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.confirmation).toHaveText('Thank you for your order!');
  });

  test('checkout requires a first name', async ({ inventoryPage, checkoutPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillDetails('', 'Rao', '500001');

    await expect(checkoutPage.error).toContainText('First Name is required');
  });
});
