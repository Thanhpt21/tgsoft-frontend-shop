export interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumb?: string | null;
  content: Record<string, any>;

  numberViews: number;
  isPublished: boolean;

  createdById: number;
  createdBy?: {
    id: number;
    name: string;
    avatar: string | null;
  };

  tenantId: number;

  createdAt: string | Date;
  updatedAt: string | Date;
}
