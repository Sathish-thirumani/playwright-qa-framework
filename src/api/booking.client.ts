import { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';

export type Booking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  /** Raw auth call, for tests that check the response itself. */
  auth(username: string, password: string) {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** Returns a token for the configured user, or fails with a clear message. */
  async createToken(): Promise<string> {
    const res = await this.auth(env.apiUser, env.apiPassword);
    if (!res.ok()) {
      throw new Error(`Auth request failed with HTTP ${res.status()}`);
    }
    const body = await res.json();
    if (!body.token) {
      throw new Error(`Auth did not return a token: ${JSON.stringify(body)}`);
    }
    return body.token;
  }

  ping() {
    return this.request.get('/ping');
  }

  create(booking: Booking) {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  list() {
    return this.request.get('/booking');
  }

  findByName(firstname: string, lastname: string) {
    return this.request.get('/booking', { params: { firstname, lastname } });
  }

  update(id: number, booking: Booking, token: string) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }

  partialUpdate(id: number, changes: Partial<Booking>, token: string) {
    return this.request.patch(`/booking/${id}`, {
      data: changes,
      headers: { Cookie: `token=${token}` },
    });
  }

  remove(id: number, token: string) {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
