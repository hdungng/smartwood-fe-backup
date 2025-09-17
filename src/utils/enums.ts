export enum Region {
  North = 'NORTH',
  Central = 'Central',
  South = 'SOUTH',
  Mekong = 'MEKONG',
  Highland = 'HIGHLAND'
}

export enum PurchasePoStatus {
  Inactive = 0,
  Active = 1,
  Pending = 2,
  Approval = 3,
}

export enum CommonStatus {
  Inactive = 0,
  Active = 1,
  Pending = 2,
  Approved = 3,
  Rejected = 4,
  RequestApproval = 5,


  All = 100
}

export enum TRANSPORT_TYPE {
  SHIP = 'ship',
  TRUCK = 'truck'
}

export enum STATUS_TRANSPORT {
  REJECT = 0,
  PENDING = 1,
  APPROVED = 3,
  IN_TRANSIT = 4
}

export enum ApprovalStatus {
  Pending = 2,
  Approved = 3,
  Rejected = 4
}
