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

  test.beforeEach(({ request }) => {
    client = new BookingClient(request);
  });

  test('a created booking can be fetched with the same data', async () => {
    const created = await client.create(validBooking);
    expect(created.status()).toBe(200);
    const { bookingid, booking } = await created.json();
    expect(booking).toMatchObject(validBooking);

    const fetched = await client.get(bookingid);
    expect(fetched.ok()).toBeTruthy();
    expect(await fetched.json()).toMatchObject(validBooking);
  });

  test('an update without a valid token is rejected', async () => {
    const { bookingid } = await (await client.create(validBooking)).json();
    const res = await client.update(bookingid, { ...validBooking, totalprice: 300 }, 'invalid-token');
    expect(res.status()).toBe(403);
  });

  test('an authorised update changes the price', async () => {
    const { bookingid } = await (await client.create(validBooking)).json();
    const token = await client.createToken();
    const res = await client.update(bookingid, { ...validBooking, totalprice: 300 }, token);
    expect(res.status()).toBe(200);
    expect((await res.json()).totalprice).toBe(300);
  });

  test('a deleted booking can no longer be fetched', async () => {
    const { bookingid } = await (await client.create(validBooking)).json();
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
