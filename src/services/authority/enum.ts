export enum Screen {
  // Dashboard
  DashboardMarketOverview = "DASHBOARD_MARKET_OVERVIEW",
  DashboardCustomer = "DASHBOARD_CUSTOMER",
  DashboardSupplier = "DASHBOARD_SUPPLIER",
  DashboardOrderTracking = "DASHBOARD_ORDER_TRACKING",
  DashboardRevenueSummary = "DASHBOARD_REVENUE_SUMMARY",
  DashboardAccountsPayable = "DASHBOARD_ACCOUNTS_PAYABLE",
  DashboardCostSummary = "DASHBOARD_COST_SUMMARY",

  // Draft PO
  DraftPo = "DRAFT_PO",

  // TodoList
  TodoList = "TODO_LIST",

  // Business Plan
  BusinessPlan = "BUSINESS_PLAN",

  // Sale Contract
  SaleContract = "SALE_CONTRACT",

  // Purchase Order
  PurchaseOrder = "PURCHASE_ORDER",

  // Logistics
  LogisticsShip = "LOGISTICS_SHIP",

  LogisticsTruck = "LOGISTICS_TRUCK",

  SeaCustom = "SEA_CUSTOM",

  // Advance Payment
  AdvancePayment = "ADVANCE_PAYMENT",

  // Customs
  Customs = "CUSTOMS",

  // Accounting
  Accounting = "ACCOUNTING",

  // Inventory
  Inventory = "INVENTORY",

  // Quality Control
  Qc = "QC",

  // Payment Request
  PaymentRequest = "PAYMENT_REQUEST",

  // Master Data
  MasterCustomerList = "M_CUSTOMER",
  MasterCustomerFrameContract = "M_CUSTOMER_FRAME_CONTRACT",
  MasterUser = "M_USER",
  MasterSupplier = "M_SUPPLIER",
  MasterPrice = "M_PRICE",
  MasterGood = "M_GOOD",
  MasterPaymentTerm = "M_PAYMENT_TERM",
  MasterDeliveryTerm = "M_DELIVERY_TERM",
  MasterTransportMethod = "M_TRANSPORT_METHOD",
  MasterShippingUnit = "M_SHIPPING_UNIT",
  MasterForwarder = "M_FORWARDER",
  MasterShippingLine = "M_SHIPPING_LINE",
  MasterLogisticsCost = "M_LOGISTICS_COST",

  // System Management
  Role = "ROLE",
  Permission = "PERMISSION",
  CodeManagement = "CODE",
  Stationery = "STATIONERY",

  // Common & Settings
  Dashboard = "DASHBOARD",
  Reports = "REPORTS",
  Settings = "SETTINGS",
  UserProfile = "USER_PROFILE",
  SystemLogs = "SYSTEM_LOGS",
  Notifications = "NOTIFICATIONS",
}

export enum Permission {
  Create = "CREATE",
  Update = "UPDATE",
  View = "VIEW",
  Delete = "DELETE",
  Approve = "APPROVE",
}

export type ScreenPermission =
  `${Screen}_${Permission}`;