import { Permission, Screen, ScreenPermission } from 'services/authority';

export const PERMISSION_LABELS = {
  [Permission.Create]: 'Tạo mới',
  [Permission.Update]: 'Cập nhật',
  [Permission.View]: 'Xem',
  [Permission.Delete]: 'Xóa',
  [Permission.Approve]: 'Duyệt'
};

export const SCREEN_PERMISSIONS_DISABLED: ScreenPermission[] = [
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_DELETE',
  'ROLE_VIEW',
  'ROLE_APPROVE',
  'PERMISSION_VIEW',
  'PERMISSION_CREATE',
  'PERMISSION_UPDATE',
  'PERMISSION_DELETE',
  'PERMISSION_APPROVE'
];

export const ROLES_DISABLED: string[] = ['SYSTEM'];

export const PERMISSIONS = Object.values(Permission);

export const SCREEN_GROUPS = {
  'Bảng điều khiển': [
    Screen.Dashboard,
    Screen.DashboardMarketOverview,
    Screen.DashboardCustomer,
    Screen.DashboardSupplier,
    Screen.DashboardOrderTracking,
    Screen.DashboardRevenueSummary,
    Screen.DashboardAccountsPayable,
    Screen.DashboardCostSummary,
    Screen.TodoList,
  ],
  'Hợp đồng': [
    Screen.DraftPo,
    Screen.BusinessPlan,
    Screen.SaleContract,
    Screen.PurchaseOrder,
    Screen.LogisticsShip,
    Screen.LogisticsTruck,
    Screen.SeaCustom,
    Screen.Accounting,
    Screen.Inventory,
    Screen.Qc,
    Screen.PaymentRequest
  ],
  // 'Vận hành': [Screen.AdvancePayment, Screen.Customs],
  Master: [
    Screen.MasterCustomerList,
    Screen.MasterCustomerFrameContract,
    Screen.MasterUser,
    Screen.MasterSupplier,
    Screen.MasterPrice,
    Screen.MasterGood,
    Screen.MasterPaymentTerm,
    Screen.MasterDeliveryTerm,
    Screen.MasterTransportMethod,
    Screen.MasterShippingUnit,
    Screen.MasterForwarder,
    Screen.MasterShippingLine,
    Screen.MasterLogisticsCost
  ],
  'Hệ thống': [
    Screen.Role,
    Screen.Permission,
    Screen.Settings,
  ]
};

export const getScreenDisplayName = (screen: Screen): string => {
  const displayNames: Record<Screen, string> = {
    [Screen.Dashboard]: 'Bảng điều khiển',
    [Screen.DashboardMarketOverview]: 'Tổng hợp thị trường',
    [Screen.DashboardCustomer]: 'Bảng điều khiển khách hàng',
    [Screen.DashboardSupplier]: 'Bảng điều khiển nhà cung cấp',
    [Screen.DashboardOrderTracking]: 'Theo dõi đơn hàng',
    [Screen.DashboardRevenueSummary]: 'Tổng hợp lợi nhuận',
    [Screen.DashboardAccountsPayable]: 'Công nợ phải trả',
    [Screen.DashboardCostSummary]: 'Tổng hợp chi phí',
    [Screen.TodoList]: 'Danh sách công việc',
    [Screen.DraftPo]: 'Draft PO',
    [Screen.BusinessPlan]: 'Phương án kinh doanh',
    [Screen.SaleContract]: 'Hợp đồng bán',
    [Screen.PurchaseOrder]: 'PO mua',
    [Screen.LogisticsShip]: 'Vận chuyển tàu',
    [Screen.LogisticsTruck]: 'Vận chuyển xe',
    [Screen.SeaCustom]: 'Hải quan',
    [Screen.AdvancePayment]: 'Ứng tiền',
    [Screen.Customs]: 'Hải quan',
    [Screen.Accounting]: 'Kế toán',
    [Screen.Inventory]: 'Kho hàng',
    [Screen.Qc]: 'Kiểm tra chất lượng',
    [Screen.PaymentRequest]: 'Đề nghị thanh toán',
    [Screen.MasterCustomerList]: 'Danh sách khách hàng',
    [Screen.MasterCustomerFrameContract]: 'Hợp đồng khung khách hàng',
    [Screen.MasterUser]: 'Quản lý người dùng',
    [Screen.MasterSupplier]: 'Danh sách nhà cung cấp',
    [Screen.MasterPrice]: 'Danh mục giá',
    [Screen.MasterGood]: 'Danh mục sản phẩm',
    [Screen.MasterPaymentTerm]: 'Điều kiện thanh toán',
    [Screen.MasterDeliveryTerm]: 'Điều kiện giao hàng',
    [Screen.MasterTransportMethod]: 'Phương thức vận chuyển',
    [Screen.MasterShippingUnit]: 'Đơn vị vận chuyển',
    [Screen.MasterForwarder]: 'Danh sách Forwarder',
    [Screen.MasterShippingLine]: 'Hãng tàu',
    [Screen.MasterLogisticsCost]: 'Chi phí logistics',
    [Screen.Role]: 'Vai trò',
    [Screen.Permission]: 'Phân quyền',
    [Screen.CodeManagement]: 'Quản lý mã',
    [Screen.Stationery]: 'Văn phòng phẩm',
    [Screen.Reports]: 'Báo cáo',
    [Screen.Settings]: 'Cài đặt',
    [Screen.UserProfile]: 'Hồ sơ người dùng',
    [Screen.SystemLogs]: 'Nhật ký hệ thống',
    [Screen.Notifications]: 'Thông báo'
  };
  return displayNames[screen] || screen;
};