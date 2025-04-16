export type UserRole = "job_seeker" | "employer" | "moderator"

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  phone?: string
  city?: string
  experience?: string
  skills?: string
  resume_url?: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  type: string
  employer_id: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  user_id: string
  status: "pending" | "accepted" | "rejected"
  message?: string
  created_at: string
  updated_at: string
}

export interface Vacancy {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  salary_range?: string;
  requirements: string[];
  status: 'pending' | 'approved' | 'rejected';
  employer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  title: string;
  description: string;
  experience: string[];
  skills: string[];
  education: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
} 