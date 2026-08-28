import type { UserProfile } from '../models/domain.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export {};
