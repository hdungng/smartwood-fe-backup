import { IntlShape } from 'react-intl';

export enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
  PENDING = 2,
  APPROVED = 3,
  REJECTED = 4,
  REQUEST_APPROVAL = 5
}

export const statusOptions = [
  { value: Status.INACTIVE, label: 'Inactive' },
  { value: Status.ACTIVE, label: 'Active' },
  { value: Status.PENDING, label: 'Pending' }
];

export const getStatusLabel = (status: Status): string => {
  switch (status) {
    case Status.INACTIVE:
      return 'Inactive';
    case Status.ACTIVE:
      return 'Active';
    case Status.PENDING:
      return 'Pending';
    default:
      return 'Unknown';
  }
};

export const getStatusOptions = (intl: IntlShape) => ([
  { value: Status.INACTIVE, label: getStatusLabelIntl(intl, Status.INACTIVE) },
  { value: Status.ACTIVE, label: getStatusLabelIntl(intl, Status.ACTIVE) },
  { value: Status.PENDING, label: getStatusLabelIntl(intl, Status.PENDING) }
]);

export const getStatusLabelIntl = (intl: IntlShape, status: Status): string => {
  switch (status) {
    case Status.INACTIVE: return intl.formatMessage({ id: 'common_status_not_working' });
    case Status.ACTIVE: return intl.formatMessage({ id: 'common_status_working' });
    case Status.PENDING: return intl.formatMessage({ id: 'common_status_wait_for_approved' });
    case Status.APPROVED: return intl.formatMessage({ id: 'common_status_approved' });
    case Status.REJECTED: return intl.formatMessage({ id: 'common_status_rejected' });
    case Status.REQUEST_APPROVAL: return intl.formatMessage({ id: 'request_approval_label' });
    default: return 'Unknown';
  }
};

export const getStatusColor = (status: Status): 'success' | 'error' | 'warning' => {
  switch (status) {
    case Status.ACTIVE:
      return 'success';
    case Status.INACTIVE:
      return 'error';
    case Status.PENDING:
      return 'warning';
    default:
      return 'error';
  }
};
