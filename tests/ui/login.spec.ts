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

  test('a slow user still reaches the products page', async ({ loginPage, inventoryPage }) => {
    test.slow(); // performance_glitch_user is deliberately delayed by the site
    await loginPage.login(users.slow.username, users.slow.password);
    await expect(inventoryPage.title).toHaveText('Products', { timeout: 15_000 });
  });

  test('the error message can be dismissed', async ({ loginPage }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await expect(loginPage.error).toBeVisible();
    await loginPage.errorClose.click();
    await expect(loginPage.error).toBeHidden();
  });

  test('the password field hides what is typed', async ({ loginPage }) => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  const negativeCases = [
    { name: 'a locked out user', user: users.locked, message: 'locked out' },
    { name: 'a wrong password', user: users.invalid, message: 'do not match' },
    { name: 'an empty username', user: { username: '', password: 'secret_sauce' }, message: 'Username is required' },
    { name: 'an empty password', user: { username: 'standard_user', password: '' }, message: 'Password is required' },
    { name: 'an unknown user', user: { username: 'no_such_user', password: 'secret_sauce' }, message: 'do not match' },
  ];

  for (const c of negativeCases) {
    test(`rejects ${c.name}`, async ({ loginPage }) => {
      await loginPage.login(c.user.username, c.user.password);
      await expect(loginPage.error).toContainText(c.message);
    });
  }
});
