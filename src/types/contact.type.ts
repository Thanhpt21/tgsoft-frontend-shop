import { ContactStatus, ContactType } from "@/enums/contact.enums";

export interface Contact {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  comment: string;
  status: ContactStatus;
  type: ContactType;
  createdAt: string;
  updatedAt: string;
}

export interface ContactApiResponse {
  data: Contact[];
  total: number;
  page: number;
  pageCount: number;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  mobile?: string;
  comment: string;
  status?: ContactStatus; // Có thể bỏ qua nếu backend tự động đặt mặc định PENDING
  type?: ContactType;     // Có thể bỏ qua nếu backend tự động đặt mặc định CONTACT
}


export interface UpdateContactPayload {
  name?: string;
  email?: string;
  mobile?: string;
  comment?: string;
  status?: ContactStatus;
  type?: ContactType;
}