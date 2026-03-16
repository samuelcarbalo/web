// src/types/index.ts

// Perfil completo (lo que retorna /auth/me/)
// types/profile.ts (o donde tengas definido Profile)
export interface Profile {
  id: string;
  user_name: string;
  user_email: string;
  user: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  organization: string;
  organization_name: string;
  email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  
  // Campos opcionales que pueden no venir del backend aún
  avatar?: string;
  bio?: string;
  location?: string;
  department?: string;
  job_title?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string;
  completion_percentage?: number;
  preferences?: Record<string, unknown>;
}

// User básico (para auth simple)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string; // user_name del perfil
  phone?: string;
  organization?: string;
  organization_name?: string;
  role: 'user' | 'manager' | 'admin';
  user_type: 'person' | 'company';
  avatar?: string;
  bio?: string;
  location?: string;
  job_title?: string;
  completion_percentage?: number;
}

// Para login/register (respuesta simple)
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_type: string;
}

// Resto de tipos...
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  plan?: Plan;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  features: string[];
  max_job_posts: number;
  max_events: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  category: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  organization: Organization;
  posted_by: User;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  applications_count: number;
  is_featured: boolean;
  is_active: boolean;
  company_name: string;
  currency: string;
  posted_at: string;
  logo?: string;
}

export interface JobApplication {
  id: number;
  job: Job;
  applicant: User;
  cover_letter?: string;
  resume?: string;
  status: 'applied' | 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | 'interview';
  applied_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: 'sports' | 'real_estate' | 'community' | 'business';
  start_date: string;
  end_date: string;
  location: string;
  image?: string;
  price?: number;
  max_attendees?: number;
  organization: Organization;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Application {
  id: string;
  company_name?: string;
  locatinon?: string;
  offer_id? :string;
  views_count?: string;
  application_count?: string;
  offer_title: string;
  applicant: string;        // UUID del aplicante
  applicant_name: string;   // Nombre completo (ej: Samuel Reyes)
  applicant_email: string;  // Email de contacto
  cv_file: string;          // URL completa al archivo PDF
  cover_letter: string;     // Texto de presentación
  status: "applied" | "interview" | "hired" | "rejected" | "pending" | "reviewing" | "shortlisted";// Union type para los estados
  recruiter_notes: string | null; // Notas internas (puede ser nulo)
  applied_at: string;       // Timestamp en formato ISO
}

export interface PaginatedResponse<Application> {
  links:{
    next: string | null;
    previous: string | null;
  }
  count: number;
  results: Application[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  organization_slug?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'person' | 'company';
  organization_name?: string;
  organization_slug?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}