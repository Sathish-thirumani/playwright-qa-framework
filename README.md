# Playwright QA Framework

API and UI test automation in TypeScript with Playwright, run in CI with GitHub Actions. It tests two public practice sites, so anyone can clone it and run it.

## What is tested

| Layer | Target | Coverage |
|---|---|---|
| UI | [Sauce Demo](https://www.saucedemo.com) | Login (valid, locked-out user, wrong password, empty fields), add to cart, checkout, checkout validation |
| API | [Restful-Booker](https://restful-booker.herokuapp.com) | Create and fetch a booking, token auth, authorised and unauthorised update, delete, invalid payload |

## Tech

Playwright, TypeScript, dotenv, GitHub Actions.

## Project structure

```text
.
├── .github/workflows/playwright.yml   CI: runs the suite and uploads the HTML report
├── src/
│   ├── api/booking.client.ts          API client (the API equivalent of a page object)
│   ├── config/env.ts                  Reads and validates environment variables
│   ├── data/users.ts                  Test data kept apart from the tests
│   ├── fixtures/test.ts               Fixtures that create page objects for each test
│   └── pages/                         Page objects: login, inventory, checkout
├── tests/
│   ├── api/booking.spec.ts            API tests
│   └── ui/                            UI tests: login, checkout
├── .env.example                       Template for environment values
└── playwright.config.ts               UI (Chromium, Firefox) and API projects
```

## Setup and run

```bash
npm ci
npx playwright install --with-deps chromium firefox
cp .env.example .env

npm test            # everything
npm run test:ui     # UI tests in Chromium and Firefox
npm run test:api    # API tests
npm run report      # open the HTML report
```

The values in `.env.example` are the demo credentials the practice sites publish. Do not put real credentials in this repository.

## Design decisions

- **Page Object Model.** Locators and actions live in `src/pages`, so a selector change is fixed in one place and tests read as behaviour.
- **Fixtures.** Playwright fixtures create the page objects each test needs, which keeps setup out of the tests.
- **Data-driven negative cases.** Login failures are one table of cases, so adding a case is one line.
- **Independent tests.** Each test sets up its own state, so tests run in parallel and in any order.
- **Stable waits.** Web-first assertions and Playwright's auto-waiting replace fixed sleeps. Retries are enabled only in CI, and a trace is captured on the first retry.
- **Config outside the code.** Base URLs and credentials come from environment variables, with a committed `.env.example` and no secrets in the repo.

## Continuous integration

`.github/workflows/playwright.yml` runs the full suite on every push and pull request to `main` and uploads the HTML report as a build artifact. Add `API_USERNAME` and `API_PASSWORD` as repository secrets (Settings, Secrets and variables, Actions) before the first run.

## Findings on the sites under test

- Restful-Booker answers a successful delete with `201 Created` instead of `204 No Content`.
- Restful-Booker typically returns `500` for an invalid payload instead of a `400`, so the invalid-payload test asserts only that the request is not accepted.

## Limitations

The target sites are public and shared, so they can change or be briefly unavailable, which can fail a test through no fault of the framework. This repository does not include database validation, because the public APIs do not expose a database.
