export const purchaseOrderCost = {
    logistics: {
      TotalFreightEbs: "Tổng cước biển + EBS",
      TruckingCost: "Trucking từ kho ra cảng",
      // LocalCharges: "Chi phí địa phương - Local charge (chưa VAT)",
      EarlyUnloadingFee: "Phí hạ sớm",
      // ThcFee: "Phí xếp dỡ tại cảng (THC)",
      SealFee: "Phí chì",
      InfrastructureFee: "Phí hạ tầng",
      CustomsSupervisionFee: "Phí giám sát hải quan",
      FumigationPerContainer: "Phí hun trùng theo cont",
      FumigationPerLot: "Phí hun trùng theo lô",
      QuarantineFee: "Phí kiểm dịch",
      // TtFee: "Phí T/T",
      CoFee: "Phí C/O",
      DoFee: "Phí DO",
      PalletFee: "Phí pallet",
      JumboBagFee: "Phí bao jumbo",
      AmsFee: "Phí AMS",
    },
    customs: {
      CustomsTeamFee: "Phí đội hải quan",
      CustomsReceptionFee: "Phí đội tiếp nhận HQ",
      ClearanceCost: "Chi phí đi thông quan",
    },
    finance: {
      InterestCost: "Chi phí lãi vay",
      VatInterestCost: "Chi phí lãi vay thuế VAT",
      ExchangeRateCost: "Chi phí chênh lệch tỷ giá",
      DhlFee: "BIDV thu phí DHL",
      BrokerageFee: "BIDV thu phí tiền",
      TaxRefundCost: "Chi phí hoàn thuế",
    },
    management: {
      QcCost: "Chi phí QC",
      // BrokerageCost: "Chi phí môi giới",
      // CommissionCost: "Chi phí commision",
      // GeneralManagementCost: "Chi phí quản lý chung",
    },
    other: {
      OtherCost: "Chi phí khác",
    }
};

// Tạo danh sách options cho form
export const costItemOptions = Object.entries(purchaseOrderCost).flatMap(([category, items]) =>
  Object.entries(items).map(([value, label]) => ({
    value,
    label,
    category
  }))
);

// Danh sách nhóm chi phí chính (group)
export const costGroupOptions = [
  { value: 'purchaseOrder', label: 'Chi phí hợp đồng mua' },
  { value: 'other', label: 'Chi phí khác' }
];

// Danh sách loại danh mục (category/codeType)
export const categoryOptions = [
  { value: 'logistics', label: 'Logistics' },
  { value: 'customs', label: 'Customs' },
  { value: 'finance', label: 'Finance' },
  { value: 'management', label: 'Management' },
  { value: 'other', label: 'Other' }
];

// Giữ nguyên export cũ cho tương thích nếu nơi khác còn dùng
export const costTypeOptions = costGroupOptions;

// Export default để sử dụng trực tiếp
export default purchaseOrderCost;
  