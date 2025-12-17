// Database table type definitions based on schema

export interface Contact {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: number;
  name: string;
  description?: string | null;
  gpt_persona?: string | null;
  contact_id?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  archived_at?: Date | null;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ContractorRate {
  id: number;
  rate: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Contractor {
  id: number;
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  address: string;
  post_code: string;
  personal_email: string;
  work_email: string;
  gpt_persona?: string | null;
  contact_id?: number | null;
  rate_id: number;
  markup?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  archived_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  image_id?: number | null;
  contract_id?: number | null;
}

export interface DragonUser {
  id: string;
  name: string;
  email: string;
  client_id?: number | null;
  contractor_id?: number | null;
  accepted_tos: boolean;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Media {
  id: number;
  key: string;
  remote_url?: string | null;
  filename: string;
  mimetype?: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  gpt_persona?: string | null;
  github_repo_org?: string | null;
  github_repo_name?: string | null;
  tax_rate: number;
  currency: string;
  client_id: number;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date | null;
}

export interface ProjectContractor {
  contractor_id: number;
  project_id: number;
}

export interface ProjectTime {
  id: number;
  start_time: Date;
  end_time?: Date | null;
  description?: string | null;
  dragon_user_id: string;
  project_id: number;
  new_time?: number | null;
  invoice_id?: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Budget {
  id: number;
  name: string;
  description?: string | null;
  project_id: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  user_id: string;
  priority: number;
  suggested_asignee_id?: string | null;
  project_id: number;
  suggested_estimate_minutes: number;
  estimate_minutes: number;
  is_approved: boolean;
  started_at?: Date | null;
  completed_at?: Date | null;
  due_date?: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface TaskAssignee {
  assignee_id: number;
  task_id: number;
}

export interface TaskViewedBy {
  user_id: string;
  task_id: number;
  viewed_at: Date;
}

export interface Invoice {
  id: number;
  client_id?: number | null;
  contractor_id?: number | null;
  submitted_at?: Date | null;
  due_date?: Date | null;
  paid_at?: Date | null;
  archived_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: number;
  description?: string | null;
  currency: string;
  price: number;
  tax: number;
  invoice_id?: number | null;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Secret {
  path: string;
  description?: string | null;
  project_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Accounting schema types
export interface Bank {
  id: string;
  name: string;
  token?: string | null;
  primary_color?: string | null;
  logo?: string | null;
  cursor?: string | null;
  error?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  id: number;
  name: string;
  account_id: string;
  bank_id: number;
  currency: string;
  balance: number;
  logo_url?: string | null;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Gic {
  id: number;
  name: string;
  code?: number | null;
  type: string;
  is_business: boolean;
}

export interface Transaction {
  id: number;
  tid: number;
  account_id: number;
  date: Date;
  credit?: number | null;
  debit?: number | null;
  description: string;
  notes?: string | null;
  gic_id?: number | null;
  invoice_id?: number | null;
  invoice_item_id?: number | null;
  transaction_type?: string | null;
  applied_rule?: number | null;
  tax_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

export type RuleType = 'CREDIT' | 'DEBIT';

export interface Rule {
  id: number;
  name: string;
  transaction_regex: string;
  rule_type: RuleType;
  gic_id?: number | null;
  tax_id?: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Tax {
  id: number;
  name: string;
  rate: number;
  country: string;
  province: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentInfo {
  id: number;
  contractor_id: number;
  method: string;
  swift?: string | null;
  swift_iban?: string | null;
  ach_routing?: string | null;
  ach_account?: string | null;
  usdt_wallet?: string | null;
}

// Table name mappings for Knex
export const Tables = {
  contact: 'contact',
  client: 'client',
  contractorRate: 'contractor_rate',
  contractor: 'contractor',
  dragonUser: 'dragon_user',
  media: 'media',
  project: 'project',
  projectContractor: 'project_contractor',
  projectTime: 'project_time',
  budget: 'budget',
  task: 'task',
  taskAssignee: 'task_assignee',
  taskViewedBy: 'task_viewed_by',
  invoice: 'invoice',
  invoiceItem: 'invoice_item',
  secret: 'secret',
  bank: 'accounting.bank',
  account: 'accounting.account',
  gic: 'accounting.gic',
  transaction: 'accounting.transactions',
  rule: 'accounting.rules',
  tax: 'accounting.tax',
  paymentInfo: 'accounting.payment_info',
} as const;

