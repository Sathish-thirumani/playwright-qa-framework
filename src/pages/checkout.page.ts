import { Page, Locator } from '@playwright/test';

/** Reads a money amount such as "Item total: $29.99" as a number. */
function amount(text: string): number {
  const match = text.match(/\$([\d.]+)/);
  if (!match) throw new Error(`No amount in "${text}"`);
  return Number(match[1]);
}

export class CheckoutPage {
  readonly checkoutButton: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly confirmation: Locator;
  readonly backHome: Locator;
  readonly error: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.checkoutButton = page.getByTestId('checkout');
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
    this.confirmation = page.getByTestId('complete-header');
    this.backHome = page.getByTestId('back-to-products');
    this.error = page.getByTestId('error');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
  }

  async fillDetails(first: string, last: string, postal: string) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(postal);
    await this.continueButton.click();
  }

  /** Amounts shown on the overview page. */
  async summary() {
    const prices = (await this.itemPrices.allTextContents()).map(amount);
    return {
      prices,
      subtotal: amount((await this.subtotal.textContent()) ?? ''),
      tax: amount((await this.tax.textContent()) ?? ''),
      total: amount((await this.total.textContent()) ?? ''),
    };
  }
}
