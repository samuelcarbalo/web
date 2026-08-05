export interface Notification {
  id: string;
  type:
    | 'chat_message'
    | 'job_status_change'
    | 'payment_success'
    | 'payment_pending'
    | 'payment_failed';
  message: string;
  read_at: string | null;
  is_read: boolean;
  extra_data: {
    link?: string;
    application_id?: string;
    status?: string;
    order_id?: string;
    mp_payment_id?: string;
    credits?: number;
  };
  created_at: string;
}
