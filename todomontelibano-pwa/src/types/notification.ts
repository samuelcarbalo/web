export interface Notification {
  id: string;
  type: 'chat_message' | 'job_status_change';
  message: string;
  read_at: string | null;
  is_read: boolean;
  extra_data: {
    link?: string;
    application_id?: string;
    status?: string;
  };
  created_at: string;
}
