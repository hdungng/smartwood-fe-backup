// Vietnamese location data for cascading autocomplete
export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Province {
  code: string;
  name: string;
  regionCode: string;
}

export interface Region {
  code: string;
  name: string;
}

export const vietnamRegions: Region[] = [
  { code: 'NORTH', name: 'Miền Bắc' },
  { code: 'CENTRAL', name: 'Miền Trung' },
  { code: 'SOUTH', name: 'Miền Nam' }
];

export const vietnamProvinces: Province[] = [
  // Northern Region
  { code: 'HN', name: 'Hà Nội', regionCode: 'NORTH' },
  { code: 'HP', name: 'Hải Phòng', regionCode: 'NORTH' },
  { code: 'QN', name: 'Quảng Ninh', regionCode: 'NORTH' },
  { code: 'BN', name: 'Bắc Ninh', regionCode: 'NORTH' },
  { code: 'HB', name: 'Hòa Bình', regionCode: 'NORTH' },
  { code: 'TB', name: 'Thái Bình', regionCode: 'NORTH' },
  { code: 'NB', name: 'Ninh Bình', regionCode: 'NORTH' },
  { code: 'HY', name: 'Hưng Yên', regionCode: 'NORTH' },
  { code: 'HD', name: 'Hải Dương', regionCode: 'NORTH' },
  { code: 'VPH', name: 'Vĩnh Phúc', regionCode: 'NORTH' },

  // Central Region
  { code: 'TTH', name: 'Thừa Thiên Huế', regionCode: 'CENTRAL' },
  { code: 'DN', name: 'Đà Nẵng', regionCode: 'CENTRAL' },
  { code: 'QNA', name: 'Quảng Nam', regionCode: 'CENTRAL' },
  { code: 'QNG', name: 'Quảng Ngãi', regionCode: 'CENTRAL' },
  { code: 'BD', name: 'Bình Định', regionCode: 'CENTRAL' },
  { code: 'PY', name: 'Phú Yên', regionCode: 'CENTRAL' },
  { code: 'KH', name: 'Khánh Hòa', regionCode: 'CENTRAL' },
  { code: 'NT', name: 'Ninh Thuận', regionCode: 'CENTRAL' },
  { code: 'BT', name: 'Bình Thuận', regionCode: 'CENTRAL' },
  { code: 'KT', name: 'Kon Tum', regionCode: 'CENTRAL' },

  // Southern Region
  { code: 'HCM', name: 'Hồ Chí Minh', regionCode: 'SOUTH' },
  { code: 'BD', name: 'Bình Dương', regionCode: 'SOUTH' },
  { code: 'DNai', name: 'Đồng Nai', regionCode: 'SOUTH' },
  { code: 'BPhuoc', name: 'Bình Phước', regionCode: 'SOUTH' },
  { code: 'TN', name: 'Tây Ninh', regionCode: 'SOUTH' },
  { code: 'LAN', name: 'Long An', regionCode: 'SOUTH' },
  { code: 'TG', name: 'Tiền Giang', regionCode: 'SOUTH' },
  { code: 'BT', name: 'Bến Tre', regionCode: 'SOUTH' },
  { code: 'VL', name: 'Vĩnh Long', regionCode: 'SOUTH' },
  { code: 'AG', name: 'An Giang', regionCode: 'SOUTH' },
  { code: 'DT', name: 'Đồng Tháp', regionCode: 'SOUTH' },
  { code: 'CT', name: 'Cần Thơ', regionCode: 'SOUTH' },
  { code: 'KG', name: 'Kiên Giang', regionCode: 'SOUTH' },
  { code: 'CM', name: 'Cà Mau', regionCode: 'SOUTH' }
];

export const vietnamDistricts: District[] = [
  // Hà Nội districts
  { code: 'BA_DINH', name: 'Quận Ba Đình', provinceCode: 'HN' },
  { code: 'HOAN_KIEM', name: 'Quận Hoàn Kiếm', provinceCode: 'HN' },
  { code: 'TAY_HO', name: 'Quận Tây Hồ', provinceCode: 'HN' },
  { code: 'LONG_BIEN', name: 'Quận Long Biên', provinceCode: 'HN' },
  { code: 'CAU_GIAY', name: 'Quận Cầu Giấy', provinceCode: 'HN' },
  { code: 'DONG_DA', name: 'Quận Đống Đa', provinceCode: 'HN' },
  { code: 'HAI_BA_TRUNG', name: 'Quận Hai Bà Trưng', provinceCode: 'HN' },
  { code: 'THANH_XUAN', name: 'Quận Thanh Xuân', provinceCode: 'HN' },
  { code: 'HOANG_MAI', name: 'Quận Hoàng Mai', provinceCode: 'HN' },
  { code: 'NAM_TU_LIEM', name: 'Quận Nam Từ Liêm', provinceCode: 'HN' },
  { code: 'BEI_TU_LIEM', name: 'Quận Bắc Từ Liêm', provinceCode: 'HN' },
  { code: 'HA_DONG', name: 'Quận Hà Đông', provinceCode: 'HN' },

  // Hải Phòng districts
  { code: 'HONG_BANG', name: 'Quận Hồng Bàng', provinceCode: 'HP' },
  { code: 'LE_CHAN', name: 'Quận Lê Chân', provinceCode: 'HP' },
  { code: 'NGAN_THUY', name: 'Quận Ngô Quyền', provinceCode: 'HP' },
  { code: 'KIEN_AN', name: 'Quận Kiến An', provinceCode: 'HP' },
  { code: 'HAI_AN', name: 'Quận Hải An', provinceCode: 'HP' },
  { code: 'DUONG_KINH', name: 'Quận Dương Kinh', provinceCode: 'HP' },

  // Đà Nẵng districts
  { code: 'HAI_CHAU', name: 'Quận Hải Châu', provinceCode: 'DN' },
  { code: 'THANH_KHE', name: 'Quận Thanh Khê', provinceCode: 'DN' },
  { code: 'SON_TRA', name: 'Quận Sơn Trà', provinceCode: 'DN' },
  { code: 'NGU_HANH_SON', name: 'Quận Ngũ Hành Sơn', provinceCode: 'DN' },
  { code: 'LIEN_CHIEU', name: 'Quận Liên Chiểu', provinceCode: 'DN' },
  { code: 'CAM_LE', name: 'Quận Cẩm Lệ', provinceCode: 'DN' },

  // Hồ Chí Minh districts
  { code: 'QUAN_1', name: 'Quận 1', provinceCode: 'HCM' },
  { code: 'QUAN_2', name: 'Quận 2', provinceCode: 'HCM' },
  { code: 'QUAN_3', name: 'Quận 3', provinceCode: 'HCM' },
  { code: 'QUAN_4', name: 'Quận 4', provinceCode: 'HCM' },
  { code: 'QUAN_5', name: 'Quận 5', provinceCode: 'HCM' },
  { code: 'QUAN_6', name: 'Quận 6', provinceCode: 'HCM' },
  { code: 'QUAN_7', name: 'Quận 7', provinceCode: 'HCM' },
  { code: 'QUAN_8', name: 'Quận 8', provinceCode: 'HCM' },
  { code: 'QUAN_9', name: 'Quận 9', provinceCode: 'HCM' },
  { code: 'QUAN_10', name: 'Quận 10', provinceCode: 'HCM' },
  { code: 'QUAN_11', name: 'Quận 11', provinceCode: 'HCM' },
  { code: 'QUAN_12', name: 'Quận 12', provinceCode: 'HCM' },
  { code: 'BINH_THANH', name: 'Quận Bình Thạnh', provinceCode: 'HCM' },
  { code: 'GOV_VAP', name: 'Quận Gò Vấp', provinceCode: 'HCM' },
  { code: 'PHU_NHUAN', name: 'Quận Phú Nhuận', provinceCode: 'HCM' },
  { code: 'TAN_BINH', name: 'Quận Tân Bình', provinceCode: 'HCM' },
  { code: 'TAN_PHU', name: 'Quận Tân Phú', provinceCode: 'HCM' },
  { code: 'BINH_TAN', name: 'Quận Bình Tân', provinceCode: 'HCM' },
  { code: 'THU_DUC', name: 'Thành phố Thủ Đức', provinceCode: 'HCM' },

  // Bình Dương districts
  { code: 'THU_DAU_MOT', name: 'Thành phố Thủ Dầu Một', provinceCode: 'BD' },
  { code: 'DI_AN', name: 'Thành phố Dĩ An', provinceCode: 'BD' },
  { code: 'THUAN_AN', name: 'Thành phố Thuận An', provinceCode: 'BD' },
  { code: 'TAN_UYEN', name: 'Thị xã Tân Uyên', provinceCode: 'BD' },
  { code: 'BEN_CAT', name: 'Thị xã Bến Cát', provinceCode: 'BD' },
  { code: 'BAC_TAN_UYEN', name: 'Huyện Bắc Tân Uyên', provinceCode: 'BD' },
  { code: 'DAU_TIENG', name: 'Huyện Dầu Tiếng', provinceCode: 'BD' },
  { code: 'PHUOC_LONG', name: 'Huyện Phước Long', provinceCode: 'BD' },

  // Đồng Nai
  { code: 'BIEN_HOA', name: 'Thành phố Biên Hòa', provinceCode: 'DNai' },
  { code: 'LONG_KHANH', name: 'Thành phố Long Khánh', provinceCode: 'DNai' },
  { code: 'VINH_CUU', name: 'Huyện Vĩnh Cửu', provinceCode: 'DNai' },
  { code: 'TRANG_BOM', name: 'Huyện Trảng Bom', provinceCode: 'DNai' },
  { code: 'THONG_NHAT', name: 'Huyện Thống Nhất', provinceCode: 'DNai' },
  { code: 'CAM_MY', name: 'Huyện Cẩm Mỹ', provinceCode: 'DNai' },
  { code: 'XUAN_LOC', name: 'Huyện Xuân Lộc', provinceCode: 'DNai' },
  { code: 'DINH_QUAN', name: 'Huyện Định Quán', provinceCode: 'DNai' },
  { code: 'TAN_PHU', name: 'Huyện Tân Phú', provinceCode: 'DNai' },
  { code: 'NHON_TRACH', name: 'Huyện Nhơn Trạch', provinceCode: 'DNai' },

  // Bình Phước
  { code: 'DONG_XOAI', name: 'Thành phố Đồng Xoài', provinceCode: 'BPhuoc' },
  { code: 'PHUOC_LONG', name: 'Thị xã Phước Long', provinceCode: 'BPhuoc' },
  { code: 'BINH_LONG', name: 'Thị xã Bình Long', provinceCode: 'BPhuoc' },
  { code: 'LOC_NINH', name: 'Huyện Lộc Ninh', provinceCode: 'BPhuoc' },
  { code: 'BU_GIA_MAP', name: 'Huyện Bù Gia Mập', provinceCode: 'BPhuoc' },
  { code: 'BU_DANG', name: 'Huyện Bù Đăng', provinceCode: 'BPhuoc' },
  { code: 'BU_DO', name: 'Huyện Bù Đốp', provinceCode: 'BPhuoc' },
  { code: 'CHON_THANH', name: 'Thị xã Chơn Thành', provinceCode: 'BPhuoc' },
  { code: 'HON_QUAN', name: 'Huyện Hớn Quản', provinceCode: 'BPhuoc' },
  { code: 'DONG_PHU', name: 'Huyện Đồng Phú', provinceCode: 'BPhuoc' },

  // Tây Ninh
  { code: 'TAY_NINH', name: 'Thành phố Tây Ninh', provinceCode: 'TN' },
  { code: 'HOA_THANH', name: 'Thị xã Hòa Thành', provinceCode: 'TN' },
  { code: 'GO_DAU', name: 'Huyện Gò Dầu', provinceCode: 'TN' },
  { code: 'BEN_CAU', name: 'Huyện Bến Cầu', provinceCode: 'TN' },
  { code: 'CHAU_THANH', name: 'Huyện Châu Thành', provinceCode: 'TN' },
  { code: 'DUONG_MINH_CHAU', name: 'Huyện Dương Minh Châu', provinceCode: 'TN' },
  { code: 'TAN_BIEN', name: 'Huyện Tân Biên', provinceCode: 'TN' },
  { code: 'TAN_CHAU', name: 'Huyện Tân Châu', provinceCode: 'TN' },
  { code: 'TRANG_BANG', name: 'Thị xã Trảng Bàng', provinceCode: 'TN' },
  { code: 'LOI_THUAN', name: 'Xã Lợi Thuận', provinceCode: 'TN' },

  // Long An
  { code: 'TAN_AN', name: 'Thành phố Tân An', provinceCode: 'LAN' },
  { code: 'KIEU_HUNG', name: 'Huyện Kiến Tường', provinceCode: 'LAN' },
  { code: 'CAN_DUOC', name: 'Huyện Cần Đước', provinceCode: 'LAN' },
  { code: 'CAN_GIUOC', name: 'Huyện Cần Giuộc', provinceCode: 'LAN' },
  { code: 'BEN_LUC', name: 'Huyện Bến Lức', provinceCode: 'LAN' },
  { code: 'DUC_HOA', name: 'Huyện Đức Hòa', provinceCode: 'LAN' },
  { code: 'DUC_HUE', name: 'Huyện Đức Huệ', provinceCode: 'LAN' },
  { code: 'MO_CAI_BAC', name: 'Huyện Mộc Hóa', provinceCode: 'LAN' },
  { code: 'TAN_HUNG', name: 'Huyện Tân Hưng', provinceCode: 'LAN' },
  { code: 'VING_HUNG', name: 'Huyện Vĩnh Hưng', provinceCode: 'LAN' },

  // Tiền Giang
  { code: 'MY_THO', name: 'Thành phố Mỹ Tho', provinceCode: 'TG' },
  { code: 'GO_CONG', name: 'Thị xã Gò Công', provinceCode: 'TG' },
  { code: 'CAI_LAY', name: 'Thị xã Cai Lậy', provinceCode: 'TG' },
  { code: 'GO_CONG_DONG', name: 'Huyện Gò Công Đông', provinceCode: 'TG' },
  { code: 'GO_CONG_TAY', name: 'Huyện Gò Công Tây', provinceCode: 'TG' },
  { code: 'CHAU_THANH', name: 'Huyện Châu Thành', provinceCode: 'TG' },
  { code: 'CAI_BE', name: 'Huyện Cái Bè', provinceCode: 'TG' },
  { code: 'CHAU_THANH_B', name: 'Huyện Châu Thành B', provinceCode: 'TG' },
  { code: 'TAN_PHU_DONG', name: 'Huyện Tân Phú Đông', provinceCode: 'TG' },
  { code: 'CHAU_THANH_C', name: 'Huyện Châu Thành C', provinceCode: 'TG' },

  // Vĩnh Long (VL)
{ code: 'VL_CITY', name: 'Thành phố Vĩnh Long', provinceCode: 'VL' },
{ code: 'BINH_MINH', name: 'Thị xã Bình Minh', provinceCode: 'VL' },
{ code: 'LONG_HO', name: 'Huyện Long Hồ', provinceCode: 'VL' },
{ code: 'MANG_THIT', name: 'Huyện Mang Thít', provinceCode: 'VL' },
{ code: 'TRA_ON', name: 'Huyện Trà Ôn', provinceCode: 'VL' },
{ code: 'VUNG_LIEM', name: 'Huyện Vũng Liêm', provinceCode: 'VL' },
{ code: 'TAM_BINH', name: 'Huyện Tam Bình', provinceCode: 'VL' },
{ code: 'AN_PHU_TAN', name: 'Xã An Phú Tân', provinceCode: 'VL' },
{ code: 'HOA_BINH_PHUOC', name: 'Xã Hòa Bình Phước', provinceCode: 'VL' },
{ code: 'QUOI_AN', name: 'Xã Quới An', provinceCode: 'VL' },

// An Giang (AG)
{ code: 'LONG_XUYEN', name: 'Thành phố Long Xuyên', provinceCode: 'AG' },
{ code: 'CHAU_DOC', name: 'Thành phố Châu Đốc', provinceCode: 'AG' },
{ code: 'AN_PHU', name: 'Huyện An Phú', provinceCode: 'AG' },
{ code: 'TAN_CHAU', name: 'Thị xã Tân Châu', provinceCode: 'AG' },
{ code: 'PHU_TAN', name: 'Huyện Phú Tân', provinceCode: 'AG' },
{ code: 'CHAU_PHU', name: 'Huyện Châu Phú', provinceCode: 'AG' },
{ code: 'CHAU_THANH', name: 'Huyện Châu Thành', provinceCode: 'AG' },
{ code: 'THOAI_SON', name: 'Huyện Thoại Sơn', provinceCode: 'AG' },
{ code: 'TINH_BIEN', name: 'Huyện Tịnh Biên', provinceCode: 'AG' },
{ code: 'TRI_TON', name: 'Huyện Tri Tôn', provinceCode: 'AG' },

// Đồng Tháp (DT)
{ code: 'CAO_LANH', name: 'Thành phố Cao Lãnh', provinceCode: 'DT' },
{ code: 'SA_DEC', name: 'Thành phố Sa Đéc', provinceCode: 'DT' },
{ code: 'HONG_NGU', name: 'Thành phố Hồng Ngự', provinceCode: 'DT' },
{ code: 'TAN_HONG', name: 'Huyện Tân Hồng', provinceCode: 'DT' },
{ code: 'HONG_NGU_DIST', name: 'Huyện Hồng Ngự', provinceCode: 'DT' },
{ code: 'TAM_NONG', name: 'Huyện Tam Nông', provinceCode: 'DT' },
{ code: 'THAP_MUOI', name: 'Huyện Tháp Mười', provinceCode: 'DT' },
{ code: 'CAO_LANH_DIST', name: 'Huyện Cao Lãnh', provinceCode: 'DT' },
{ code: 'LAI_VUNG', name: 'Huyện Lai Vung', provinceCode: 'DT' },
{ code: 'CHAU_THANH_DT', name: 'Huyện Châu Thành', provinceCode: 'DT' },

// Cần Thơ (CT)
{ code: 'NINH_KIEU', name: 'Quận Ninh Kiều', provinceCode: 'CT' },
{ code: 'BINH_THUY', name: 'Quận Bình Thủy', provinceCode: 'CT' },
{ code: 'CAI_RANG', name: 'Quận Cái Răng', provinceCode: 'CT' },
{ code: 'OMON', name: 'Quận Ô Môn', provinceCode: 'CT' },
{ code: 'THOT_NOT', name: 'Quận Thốt Nốt', provinceCode: 'CT' },
{ code: 'PHONG_DIEN', name: 'Huyện Phong Điền', provinceCode: 'CT' },
{ code: 'CO_DO', name: 'Huyện Cờ Đỏ', provinceCode: 'CT' },
{ code: 'THOI_LAI', name: 'Huyện Thới Lai', provinceCode: 'CT' },
{ code: 'Vinh_Thanh', name: 'Huyện Vĩnh Thạnh', provinceCode: 'CT' },
{ code: 'TRUONG_THANH', name: 'Xã Trường Thạnh', provinceCode: 'CT' },

// Kiên Giang (KG)
{ code: 'RACH_GIA', name: 'Thành phố Rạch Giá', provinceCode: 'KG' },
{ code: 'PHU_QUOC', name: 'Thành phố Phú Quốc', provinceCode: 'KG' },
{ code: 'HA_TIEN', name: 'Thành phố Hà Tiên', provinceCode: 'KG' },
{ code: 'AN_MINH', name: 'Huyện An Minh', provinceCode: 'KG' },
{ code: 'AN_BIEN', name: 'Huyện An Biên', provinceCode: 'KG' },
{ code: 'CHAU_THANH_KG', name: 'Huyện Châu Thành', provinceCode: 'KG' },
{ code: 'GIONG_RIENG', name: 'Huyện Giồng Riềng', provinceCode: 'KG' },
{ code: 'HON_DAT', name: 'Huyện Hòn Đất', provinceCode: 'KG' },
{ code: 'KIEN_HAI', name: 'Huyện Kiên Hải', provinceCode: 'KG' },
{ code: 'GO_QUAO', name: 'Huyện Gò Quao', provinceCode: 'KG' },

// Cà Mau (CM)
{ code: 'CA_MAU', name: 'Thành phố Cà Mau', provinceCode: 'CM' },
{ code: 'U_MINH', name: 'Huyện U Minh', provinceCode: 'CM' },
{ code: 'TRAN_VAN_THOI', name: 'Huyện Trần Văn Thời', provinceCode: 'CM' },
{ code: 'THOI_BINH', name: 'Huyện Thới Bình', provinceCode: 'CM' },
{ code: 'CAI_NUOC', name: 'Huyện Cái Nước', provinceCode: 'CM' },
{ code: 'DAM_DOI', name: 'Huyện Đầm Dơi', provinceCode: 'CM' },
{ code: 'NAM_CAN', name: 'Huyện Năm Căn', provinceCode: 'CM' },
{ code: 'NGOC_HIEN', name: 'Huyện Ngọc Hiển', provinceCode: 'CM' },
{ code: 'PHU_TAN_CM', name: 'Huyện Phú Tân', provinceCode: 'CM' },
{ code: 'TAN_HUNG_DONG', name: 'Xã Tân Hưng Đông', provinceCode: 'CM' }

];

// Helper functions to get filtered data based on selection
export const getProvincesByRegion = (regionCode: string): Province[] => {
  return vietnamProvinces.filter((province) => province.regionCode === regionCode);
};

export const getDistrictsByProvince = (provinceCode: string): District[] => {
  return vietnamDistricts.filter((district) => district.provinceCode === provinceCode);
};

// Helper functions to get names by code
export const getRegionByCode = (code: string): Region | undefined => {
  return vietnamRegions.find((region) => region.code === code);
};

export const getProvinceByCode = (code: string): Province | undefined => {
  return vietnamProvinces.find((province) => province.code === code);
};

export const getDistrictByCode = (code: string): District | undefined => {
  return vietnamDistricts.find((district) => district.code === code);
};
