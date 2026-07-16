export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  venue_address?: string;
  category_id?: number;
  cover_image_url?: string;
  content?: Record<string, unknown>;
  ticketTiers?: {
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }[];
}

export interface PurchaseTicketRequest {
  eventId: string;
  tierId: string;
  quantity: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  customAnswers?: Record<string, string | boolean>;
  paymentMethod: 'ecocash' | 'card';
  paymentDetails?: {
    phone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
  };
}

export interface VerifyTicketRequest {
  qrCode: string;
  eventId: string;
}
