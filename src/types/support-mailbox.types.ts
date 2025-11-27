import { SupportStatus } from "@/enums/support-mailbox.enums";


export interface SupportMailbox {
  id: number;
  title: string;
  description?: string;
  images?: any;
  status: SupportStatus;
  
  // Phản hồi từ admin
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: number;
  replier?: {
    id: number;
    name: string;
    email: string;
  };
  
  // Phản hồi từ shop
  shopReply?: string;
  shopRepliedAt?: string;
  
  // Thông tin cơ bản
  createdBy: number;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SupportMailboxApiResponse {
  data: SupportMailbox[];
  total: number;
  page: number;
  pageCount: number;
}

export interface CreateSupportMailboxPayload {
  title: string;
  description?: string;
  images?: any;
  status?: SupportStatus; // Có thể bỏ qua nếu backend tự động đặt mặc định PENDING
}

export interface UpdateSupportMailboxPayload {
  title?: string;
  description?: string;
  images?: any;
  status?: SupportStatus;
  shopReply?: string;
}

export interface AdminReplyPayload {
  adminReply: string;
  status?: SupportStatus;
}

// Response interfaces
export interface SupportMailboxListResponse {
  success: boolean;
  message: string;
  data: SupportMailboxApiResponse;
}

export interface SupportMailboxDetailResponse {
  success: boolean;
  message: string;
  data: SupportMailbox;
}

export interface SupportMailboxCreateResponse {
  success: boolean;
  message: string;
  data: SupportMailbox;
}

export interface SupportMailboxUpdateResponse {
  success: boolean;
  message: string;
  data: SupportMailbox;
}

export interface SupportMailboxDeleteResponse {
  success: boolean;
  message: string;
}

export interface SupportMailboxAdminReplyResponse {
  success: boolean;
  message: string;
  data: SupportMailbox;
}

export interface CreateSupportMailboxDto {
  title: string;
  description?: string;
  images?: any;
  status?: SupportStatus;
}

export interface UpdateSupportMailboxDto {
  title?: string;
  description?: string;
  images?: any;
  status?: SupportStatus;
  shopReply?: string;
}

export interface AdminReplyDto {
  adminReply: string;
  status?: SupportStatus;
}