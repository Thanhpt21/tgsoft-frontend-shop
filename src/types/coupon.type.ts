interface Coupon {
  id: number;
  title: string;
  code: string;
  discount: number;
  expiresAt: string; // Hoặc Date nếu bạn muốn sử dụng kiểu Date trong TypeScript
  usageLimit: number;
  usedCount: number;
  minOrderValue: number;
  createdAt: string; // Hoặc Date
  updatedAt: string; // Hoặc Date
  // Order?: Order[]; // Nếu bạn muốn bao gồm cả mối quan hệ với Order (tùy chọn vì có thể gây ra circular dependency)
}