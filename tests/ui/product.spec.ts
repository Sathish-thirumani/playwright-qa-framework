import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';

test.describe('Product details', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
  });

  test('the detail page shows the same name and price as the list', async ({ inventoryPage, productPage }) => {
    const listPrice = await inventoryPage.priceOf(products.backpack.name);
    await inventoryPage.openProduct(products.backpack.name);
    await expect(productPage.name).toHaveText(products.backpack.name);
    await expect(productPage.price).toHaveText(`$${listPrice}`);
  });

  test('back to products returns to the list', async ({ inventoryPage, productPage }) => {
    await inventoryPage.openProduct(products.backpack.name);
    await productPage.backToProducts.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
