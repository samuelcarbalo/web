export interface ChatUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  company_name?: string;
  user_type?: 'person' | 'company';
}

export interface ConversationContext {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  url_path?: string;
  offer_id?: string;
  application_status?: string;
}

export interface Conversation {
  id: string;
  subject: string;
  conversation_type: 'job' | 'real_estate' | 'general';
  last_message_at: string | null;
  last_message_preview: string;
  participants: ConversationParticipant[];
  other_participant: ChatUser | null;
  unread_count: number;
  context: ConversationContext | null;
  created_at: string;
  updated_at?: string;
}

export interface ConversationParticipant {
  id: string;
  user: ChatUser;
  last_read_at: string | null;
  unread_count: number;
  joined_at: string;
  is_muted: boolean;
}

export interface Message {
  id: string;
  conversation: string;
  sender: ChatUser;
  body: string;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  is_own: boolean;
}

export interface CreateConversationPayload {
  conversation_type?: 'job' | 'real_estate' | 'general';
  content_type_model?: string;
  object_id?: string;
  participant_ids: string[];
  subject?: string;
  initial_message?: string;
}

export interface StartRealEstateChatPayload {
  offer_id: string;
  initial_message?: string;
}

export interface SendMessagePayload {
  body: string;
}

export type ChatWebSocketEvent =
  | { type: 'message.new'; message: Message }
  | { type: 'typing'; user_id: string; username: string; action: 'start' | 'stop' }
  | { type: 'read.update'; user_id: string; read_at: string }
  | { type: 'presence'; user_id: string; status: 'online' | 'offline' }
  | { type: 'error'; message: string };
