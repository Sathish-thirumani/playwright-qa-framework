import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
  });

  test('the badge counts every item added', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.addToCart(products.bikeLight.slug);
    await inventoryPage.addToCart(products.boltTShirt.slug);
    await expect(inventoryPage.cartBadge).toHaveText('3');
  });

  test('the cart lists exactly the items that were added', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.addToCart(products.bikeLight.slug);
    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name, products.bikeLight.name]);
  });

  test('an item can be removed from the cart page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.addToCart(products.bikeLight.slug);
    await inventoryPage.openCart();
    await cartPage.remove(products.backpack.slug);
    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name]);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('the cart keeps its items after a page reload', async ({ inventoryPage, page }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await page.reload();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('continue shopping returns to the products page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.continueShopping.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
