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

  async createToken(): Promise<string> {
    const res = await this.request.post('/auth', {
      data: { username: env.apiUser, password: env.apiPassword },
    });
    const body = await res.json();
    return body.token;
  }

  create(booking: Booking) {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  update(id: number, booking: Booking, token: string) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }

  remove(id: number, token: string) {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
