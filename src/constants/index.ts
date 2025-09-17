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

export const TODO_LIST_STATUS = [
  {
    id: 1,
    label: 'todo_tab_type1',
    color: 'info'
  },
  {
    id: 2,
    label: 'todo_tab_type2',
    color: 'success'
  },
  {
    id: 3,
    label: 'todo_tab_type3',
    color: 'error'
  },
  {
    id: 4,
    label: 'todo_tab_type4',
    color: 'warning'
  },
  {
    id: 5,
    label: 'todo_tab_type5',
    color: 'info'
  },
  {
    id: 6,
    label: 'todo_tab_type6',
    color: 'success'
  },
  {
    id: 7,
    label: 'todo_tab_type7',
    color: 'error'
  },
  {
    id: 8,
    label: 'todo_tab_type8',
    color: 'error'
  }
]