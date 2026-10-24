import { test, expect } from '@playwright/test';
import { BookingClient, Booking } from '../../src/api/booking.client';

const validBooking: Booking = {
  firstname: 'Asha',
  lastname: 'Rao',
  totalprice: 250,
  depositpaid: true,
  bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
  additionalneeds: 'Breakfast',
};

test.describe('Booking API', () => {
  let client: BookingClient;
  let created: number[];

  test.beforeEach(({ request }) => {
    client = new BookingClient(request);
    created = [];
  });

  // Leave the shared public sandbox as we found it.
  test.afterEach(async () => {
    if (created.length === 0) return;
    const token = await client.createToken();
    for (const id of created) {
      await client.remove(id, token);
    }
  });

  async function createBooking(booking: Booking = validBooking): Promise<number> {
    const res = await client.create(booking);
    expect(res.status()).toBe(200);
    const { bookingid } = await res.json();
    created.push(bookingid);
    return bookingid;
  }

  test('the service is up', async () => {
    expect((await client.ping()).status()).toBe(201);
  });

  test('a created booking can be fetched with the same data', async () => {
    const res = await client.create(validBooking);
    expect(res.status()).toBe(200);
    const { bookingid, booking } = await res.json();
    created.push(bookingid);
    expect(booking).toMatchObject(validBooking);

    const fetched = await client.get(bookingid);
    expect(fetched.ok()).toBeTruthy();
    expect(await fetched.json()).toMatchObject(validBooking);
  });

  test('a created booking can be found by guest name', async () => {
    const guest = { ...validBooking, firstname: `Asha${Date.now()}` };
    const id = await createBooking(guest);
    const res = await client.findByName(guest.firstname, guest.lastname);
    expect(res.ok()).toBeTruthy();
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(id);
  });

  test('valid credentials return a token', async () => {
    const token = await client.createToken();
    expect(token).toMatch(/^\w+$/);
  });

  test('wrong credentials do not return a token', async () => {
    const res = await client.auth('admin', 'wrong-password');
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });

  test('an update without a valid token is rejected', async () => {
    const id = await createBooking();
    const res = await client.update(id, { ...validBooking, totalprice: 300 }, 'invalid-token');
    expect(res.status()).toBe(403);
  });

  test('an authorised update changes the price', async () => {
    const id = await createBooking();
    const token = await client.createToken();
    const res = await client.update(id, { ...validBooking, totalprice: 300 }, token);
    expect(res.status()).toBe(200);
    expect((await res.json()).totalprice).toBe(300);
  });

  test('a delete without a valid token is rejected', async () => {
    const id = await createBooking();
    const res = await client.remove(id, 'invalid-token');
    expect(res.status()).toBe(403);
    expect((await client.get(id)).ok()).toBeTruthy();
  });

  test('a deleted booking can no longer be fetched', async () => {
    const res = await client.create(validBooking);
    const { bookingid } = await res.json();
    const token = await client.createToken();
    const del = await client.remove(bookingid, token);
    expect(del.status()).toBe(201);
    expect((await client.get(bookingid)).status()).toBe(404);
  });

  test('a booking with a missing required field is not accepted', async () => {
    const { firstname, ...incomplete } = validBooking;
    const res = await client.create(incomplete as Booking);
    expect(res.ok()).toBeFalsy();
  });
});
