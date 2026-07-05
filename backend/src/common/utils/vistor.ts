import { randomUUID } from 'crypto';

export function ensureVisitorId(req: any, res: any): string {
  let visitorId = req.cookies?.visitorId;

  if (!visitorId) {
    visitorId = randomUUID();

    res.cookie('visitorId', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  }

  return visitorId;
}
