// Types aligned with server/src/modules/auth/session.model.ts

export interface ILocationInfo {
  ip?: string;
  city?: string;
  country?: string;
}

export interface ISession {
  _id: string;
  userId: string;
  deviceInfo?: string;
  userAgent?: string;
  expiresAt: string;
  lastAccessedAt?: string;
  initialLocation?: ILocationInfo;
  currentLocation?: ILocationInfo;
  createdAt: string;
  isCurrent?: boolean;
  endedAt?: string;
  endReason?: 'logout' | 'expired' | 'revoked';
}
