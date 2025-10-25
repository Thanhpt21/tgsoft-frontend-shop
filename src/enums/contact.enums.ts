export enum ContactStatus {
  PENDING = "PENDING",       // Đang chờ xử lý
  PROCESSING = "PROCESSING", // Đang xử lý
  COMPLETED = "COMPLETED",   // Hoàn tất
  FAILED = "FAILED"          // Thất bại
}

export enum ContactType {
  CONTACT = "CONTACT",    // Liên hệ chung (hỏi đáp, hỗ trợ)
  PROMOTION = "PROMOTION", // Đăng ký nhận khuyến mãi/bản tin
  OTHER = "OTHER"      // Các loại khác (tùy chọn)
}