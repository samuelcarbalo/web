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
    title?: string;
    link?: string;
    application_id?: string;
    status?: string;
    order_id?: string;
    payment_id?: string;
    mp_payment_id?: string;
    amount?: number | null;
    credits?: number | null;
    credits_added?: number | null;
    user_id?: string;
    date?: string;
  };
  created_at: string;
}
