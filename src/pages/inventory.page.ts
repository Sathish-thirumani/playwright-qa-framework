import { Page, Locator } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortSelect: Locator;
  readonly itemPrices: Locator;
  readonly itemNames: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async addToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async removeFromCart(productSlug: string) {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }

  async openCart() {
    await this.cartLink.click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  /** Prices shown on the page, in display order, as numbers. */
  async prices(): Promise<number[]> {
    const texts = await this.itemPrices.allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }

  async openProduct(name: string) {
    await this.itemNames.filter({ hasText: name }).click();
  }

  /** Price shown for one product on the list, as a number. */
  async priceOf(name: string): Promise<number> {
    const item = this.page.getByTestId('inventory-item').filter({ hasText: name });
    const text = await item.getByTestId('inventory-item-price').textContent();
    return Number((text ?? '').replace('$', ''));
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
