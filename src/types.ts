export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  role?: UserRole;
  createdAt?: any;
}

export type PropertyType = 'venda' | 'aluguel_mensal' | 'aluguel_diario';
export type PropertyCategory = 'casa' | 'quarto' | 'terreno' | 'escritorio';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'pending';

export interface Property {
  id: string;
  ownerUid: string;
  title: string;
  description?: string;
  price: number;
  type: PropertyType;
  category: PropertyCategory;
  city: string;
  location?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  features?: string[];
  status?: PropertyStatus;
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  propertyId: string;
  tenantUid: string;
  ownerUid: string;
  startDate: any;
  endDate: any;
  totalAmount: number;
  status: BookingStatus;
  createdAt?: any;
}

export interface Review {
  id: string;
  targetId: string;
  authorUid: string;
  rating: number;
  comment?: string;
  createdAt?: any;
}

export interface Favorite {
  uid: string;
  propertyId: string;
  createdAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
