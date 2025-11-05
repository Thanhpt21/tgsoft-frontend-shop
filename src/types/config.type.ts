export interface Config {
  id: number;
  tenantId: number;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  address?: string | null;
  googlemap?: string | null;
  facebook?: string | null;
  zalo?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  x?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  banner?: string[] | null;


  VNP_TMN_CODE?: string | null;
  VNP_SECRET?: string | null;
  VNP_API_URL?: string | null;
  EMAIL_USER?: string | null;
  EMAIL_PASS?: string | null;
  EMAIL_FROM?: string | null;

  showEmail: boolean;
  showMobile: boolean;
  showAddress: boolean;
  showGooglemap: boolean;
  showFacebook: boolean;
  showZalo: boolean;
  showInstagram: boolean;
  showTiktok: boolean;
  showYoutube: boolean;
  showX: boolean;
  showLinkedin: boolean;
  createdAt: string; 
  updatedAt: string;
}

export interface CreateConfigDto {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  googlemap?: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  linkedin?: string;

  showEmail?: boolean;
  showMobile?: boolean;
  showAddress?: boolean;
  showGooglemap?: boolean;
  showFacebook?: boolean;
  showZalo?: boolean;
  showInstagram?: boolean;
  showTiktok?: boolean;
  showYoutube?: boolean;
  showX?: boolean;
  showLinkedin?: boolean;

  VNP_TMN_CODE?: string;
  VNP_SECRET?: string;
  VNP_API_URL?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM?: string;

  // logo và banner sẽ gửi qua FormData
}

export interface UpdateConfigDto {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  googlemap?: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  linkedin?: string;

  showEmail?: boolean;
  showMobile?: boolean;
  showAddress?: boolean;
  showGooglemap?: boolean;
  showFacebook?: boolean;
  showZalo?: boolean;
  showInstagram?: boolean;
  showTiktok?: boolean;
  showYoutube?: boolean;
  showX?: boolean;
  showLinkedin?: boolean;

  VNP_TMN_CODE?: string;
  VNP_SECRET?: string;
  VNP_API_URL?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM?: string;

  // logo và banner gửi qua FormData
}
