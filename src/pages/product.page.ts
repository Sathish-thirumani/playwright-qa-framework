import { Page, Locator } from '@playwright/test';

/** The single-product detail page. */
export class ProductPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly backToProducts: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.backToProducts = page.getByTestId('back-to-products');
  }
}
