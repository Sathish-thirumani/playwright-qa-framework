import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';
import { products } from '../../src/data/products';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.valid.username, users.valid.password);
  });

  test('a logged-in user can buy one item', async ({ inventoryPage, checkoutPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillDetails('Asha', 'Rao', '500001');
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.confirmation).toHaveText('Thank you for your order!');
  });

  const missingFields = [
    { field: 'first name', first: '', last: 'Rao', postal: '500001', message: 'First Name is required' },
    { field: 'last name', first: 'Asha', last: '', postal: '500001', message: 'Last Name is required' },
    { field: 'postal code', first: 'Asha', last: 'Rao', postal: '', message: 'Postal Code is required' },
  ];

  for (const c of missingFields) {
    test(`checkout requires a ${c.field}`, async ({ inventoryPage, checkoutPage }) => {
      await inventoryPage.addToCart(products.backpack.slug);
      await inventoryPage.openCart();
      await checkoutPage.checkoutButton.click();
      await checkoutPage.fillDetails(c.first, c.last, c.postal);
      await expect(checkoutPage.error).toContainText(c.message);
    });
  }

  test('the overview totals add up', async ({ inventoryPage, checkoutPage }) => {
    const expected = [
      await inventoryPage.priceOf(products.backpack.name),
      await inventoryPage.priceOf(products.bikeLight.name),
    ];
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.addToCart(products.bikeLight.slug);
    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillDetails('Asha', 'Rao', '500001');

    const s = await checkoutPage.summary();
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    expect(s.prices).toEqual(expected);
    expect(s.subtotal).toBeCloseTo(sum(expected), 2);
    expect(s.total).toBeCloseTo(s.subtotal + s.tax, 2);
  });

  test('cancel on the details step returns to the cart', async ({ inventoryPage, checkoutPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.cancelButton.click();
    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
  });

  test('after an order the cart is empty and the user is back on products', async ({ inventoryPage, checkoutPage }) => {
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.openCart();
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillDetails('Asha', 'Rao', '500001');
    await checkoutPage.finishButton.click();
    await checkoutPage.backHome.click();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
