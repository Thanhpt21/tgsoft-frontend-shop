export interface Province {
  code: string; // Hoặc number, tùy thuộc vào API trả về
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  districts?: any[]; // Có thể là một mảng rỗng hoặc không có.
                     // Chúng ta không cần định nghĩa chi tiết ở đây vì chúng ta fetch riêng
}

// Nếu bạn muốn định nghĩa luôn cho districts và wards:
export interface District {
  code: string;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  province_code: string;
  wards?: any[];
}

export interface Ward {
  code: string;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  district_code: string;
}