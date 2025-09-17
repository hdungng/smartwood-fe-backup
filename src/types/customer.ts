import { Gender } from 'config';

export interface CustomerProps {
  modal: boolean;
}

export interface CustomerList {
  id?: number;
  avatar: number;
  firstName: string;
  lastName: string;
  fatherName: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  role: string;
  orders: number;
  progress: number;
  status: number;
  orderStatus: string;
  contact: string;
  country: string;
  location: string;
  about: string;
  skills: string[];
  time: string[];
  date: Date | string | number;
}

export interface CustomerFormData {
  code?: string;
  name: string;
  represented: string;
  fax?: string;
  phone: string;
  address: string;
  email: string;
  taxCode: string;
  bankId?: number;
  status: number;
  banks?: any[];
}

export interface Customer extends CustomerFormData {
  id: number;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate?: string | null;
  lastUpdatedProgram?: string | null;
  bank?: any | null;
  banks?: any[];
}

export interface TCustomer extends Customer {}

export interface CustomerParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: number;
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  represented?: string;
  address?: string;
  fax?: string;
  taxCode?: string;
}
