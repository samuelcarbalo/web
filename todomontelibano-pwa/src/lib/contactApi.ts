export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  organization?: string | null;
  organization_name?: string | null;
  user?: string | null;
  user_email?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendContactMessageResponse {
  message: string;
  data: ContactMessage;
}
