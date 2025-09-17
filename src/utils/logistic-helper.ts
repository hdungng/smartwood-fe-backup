export const handleStatusVerhicle = (status: number) => {
  switch (status) {
    case 0:
      return 'rejected';
    case 1:
    case 2:
      return 'pending';
    case 3:
      return 'approved';
    case 4:
      return 'in_transit';
    default:
      break;
  }
};

export const handleStatusVerhicleNumber = (status: string) => {
  switch (status) {
    case 'rejected':
      return 0;
    case 'pending':
      return 1;
    case 'approved':
      return 3;
    case 'in_transit':
      return 4;
    default:
      break;
  }
};
