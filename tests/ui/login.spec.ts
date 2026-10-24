import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid user reaches the products page', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(users.valid.username, users.valid.password);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  const negativeCases = [
    { name: 'a locked out user', user: users.locked, message: 'locked out' },
    { name: 'a wrong password', user: users.invalid, message: 'do not match' },
    { name: 'an empty username', user: { username: '', password: 'secret_sauce' }, message: 'Username is required' },
    { name: 'an empty password', user: { username: 'standard_user', password: '' }, message: 'Password is required' },
  ];

  for (const c of negativeCases) {
    test(`rejects ${c.name}`, async ({ loginPage }) => {
      await loginPage.login(c.user.username, c.user.password);
      await expect(loginPage.error).toContainText(c.message);
    });
  }
});
