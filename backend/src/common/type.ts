import type { Request } from 'express';
export class ExtendedRequest extends Request {
  user: {
    id: string;
  };
}
