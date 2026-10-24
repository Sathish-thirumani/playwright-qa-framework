import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

test.describe('Inventory and session', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
  });

  test('removing the only item empties the cart', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.removeFromCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('products can be sorted by price, low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices.length).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('products can be sorted by price, high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('products are listed A to Z by default', async ({ inventoryPage }) => {
    const names = await inventoryPage.itemNames.allTextContents();
    expect(names).toEqual([...names].sort());
  });

  test('products can be sorted by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.itemNames.allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('a user can log out and is returned to the login page', async ({ inventoryPage, loginPage }) => {
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('the inventory page cannot be opened after logging out', async ({ inventoryPage, loginPage, page }) => {
    await inventoryPage.logout();
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText('You can only access');
  });
});

test.describe('Pages that need a login', () => {
  for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html']) {
    test(`${path} redirects a visitor who is not logged in`, async ({ page, loginPage }) => {
      await page.goto(path);
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.error).toContainText('You can only access');
    });
  }
});
