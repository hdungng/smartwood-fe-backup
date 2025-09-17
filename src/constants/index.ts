import { Status } from './status';

export const PAGE_SIZE: number = 0;
export const PAGE_LIMIT: number = 10;

export const LIST_STATUS = [
  {
    id: 100,
    code: 'ALL',
    label: 'Tất cả',
    color: 'default'
  },
  {
    id: 1,
    code: 'ACTIVE',
    label: 'Hoạt động',
    color: 'success'
  },
  {
    id: 2,
    code: 'PENDING',
    label: 'Chờ duyệt',
    color: 'default'
  },
  {
    id: 0,
    code: 'INACTIVE',
    label: 'Không hoạt động',
    color: 'error'
  }
];

export const LIST_STATUS_PO = [
  {
    id: 100,
    code: 'ALL',
    label: 'Tất cả',
    color: 'default'
  },
  {
    id: 1,
    code: 'ACTIVE',
    label: 'Hoạt động',
    color: 'success'
  },
  {
    id: 0,
    code: 'INACTIVE',
    label: 'Không hoạt động',
    color: 'error'
  }
];

export const LIST_STATUS_APPROVAL = [
  {
    id: 100,
    code: 'ALL',
    label: 'all_label',
    color: 100
  },
  {
    id: Status.APPROVED,
    code: 'APPROVED',
    label: 'approval_label',
    color: 3
  },

  {
    id: Status.REQUEST_APPROVAL,
    code: 'REQUEST_APPROVAL',
    label: 'request_approval_label',
    color: 5
  },
  {
    id: Status.REJECTED,
    code: 'REJECTED',
    label: 'rejected_label',
    color: 0
  }
];

export const LIST_STATUS_BUSINESS_PLAN = [
  {
    id: 100,
    code: 'ALL',
    label: 'all_label',
    color: 100
  },
  {
    id: Status.APPROVED,
    code: 'APPROVED',
    label: 'approval_label',
    color: 3
  },
  {
    id: Status.REJECTED,
    code: 'REJECTED',
    label: 'business_plan_rejected',
    color: 0
  },
  {
    id: Status.REQUEST_APPROVAL,
    code: 'REQUEST_APPROVAL',
    label: 'request_approval_label',
    color: 5
  }
];

export const TYPE_ASC_DESC = {
  ASC: 'asc',
  DESC: 'desc'
};

export type TodoCountKey =
  | 'noPoForPAKD'
  | 'noSaleContractForPAKD'
  | 'notPushedToEcus'
  | 'notPlannedLogistics'
  | 'notPlanVessel'
  | 'containerSummary7Days'
  | 'workshopPackingPlan2Days'
  | 'pendingContracts'
  | 'domesticTruckScheduleByLoadingDate'
  | 'domesticTruckPerformance';

export interface TodoListStatusConfig {
  id: number;
  label: string;
  color: string;
  countKey: TodoCountKey;
  columnKey: TodoCountKey;
}

type TodoListRoleStatus = Record<string, TodoListStatusConfig[]>;

export const TODO_LIST_ROLE_STATUS: TodoListRoleStatus = {
  DEFAULT: [
    {
      id: 1,
      label: 'todo_tab_type1',
      color: 'info',
      countKey: 'noPoForPAKD',
      columnKey: 'noPoForPAKD'
    },
    {
      id: 2,
      label: 'todo_tab_type2',
      color: 'success',
      countKey: 'noSaleContractForPAKD',
      columnKey: 'noSaleContractForPAKD'
    },
    {
      id: 3,
      label: 'todo_tab_type3',
      color: 'error',
      countKey: 'notPushedToEcus',
      columnKey: 'notPushedToEcus'
    },
    {
      id: 4,
      label: 'todo_tab_type4',
      color: 'warning',
      countKey: 'notPlannedLogistics',
      columnKey: 'notPlannedLogistics'
    }
  ],
  SALES: [
    {
      id: 1,
      label: 'todo_tab_type1',
      color: 'info',
      countKey: 'noPoForPAKD',
      columnKey: 'noPoForPAKD'
    },
    {
      id: 2,
      label: 'todo_tab_type2',
      color: 'success',
      countKey: 'noSaleContractForPAKD',
      columnKey: 'noSaleContractForPAKD'
    },
    {
      id: 3,
      label: 'todo_tab_type3',
      color: 'error',
      countKey: 'notPushedToEcus',
      columnKey: 'notPushedToEcus'
    },
    {
      id: 4,
      label: 'todo_tab_type8',
      color: 'error',
      countKey: 'pendingContracts',
      columnKey: 'pendingContracts'
    }
  ],
  DOMESTIC: [
    {
      id: 1,
      label: 'todo_tab_type4',
      color: 'warning',
      countKey: 'notPlannedLogistics',
      columnKey: 'notPlannedLogistics'
    },
    {
      id: 2,
      label: 'todo_tab_type9',
      color: 'info',
      countKey: 'domesticTruckScheduleByLoadingDate',
      columnKey: 'domesticTruckScheduleByLoadingDate'
    },
    {
      id: 3,
      label: 'todo_tab_type10',
      color: 'success',
      countKey: 'domesticTruckPerformance',
      columnKey: 'domesticTruckPerformance'
    }
  ],
  LOGISTIC: [
    {
      id: 1,
      label: 'todo_tab_type5',
      color: 'info',
      countKey: 'notPlanVessel',
      columnKey: 'notPlanVessel'
    }
  ],
  QC: [
    {
      id: 1,
      label: 'todo_tab_type6',
      color: 'success',
      countKey: 'containerSummary7Days',
      columnKey: 'containerSummary7Days'
    },
    {
      id: 2,
      label: 'todo_tab_type7',
      color: 'error',
      countKey: 'workshopPackingPlan2Days',
      columnKey: 'workshopPackingPlan2Days'
    }
  ]
};
