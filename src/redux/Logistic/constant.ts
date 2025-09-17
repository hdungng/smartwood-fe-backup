export const defaultPurchaseContractPackingPlan = {
  id: -1,
  createdAt: '',
  lastUpdatedAt: '',
  createdBy: 0,
  lastUpdatedBy: 0,
  lastProgramUpdate: '',
  code: '',
  status: 0,
  lastUpdatedProgram: '',
  totalQuantity: 0,
  totalValue: 0,
  averagePricePerTon: 0,
  currency: '',
  isApprove: 0,
  purchaseContractId: 0
};

export const defaultPurchaseContract = {
  id: -1,
  createdAt: '',
  lastUpdatedAt: '',
  createdBy: 0,
  lastUpdatedBy: 0,
  lastProgramUpdate: '',
  code: '',
  status: 0,
  lastUpdatedProgram: '',
  contractId: 0,
  businessPlanId: 0,
  contractDate: '',
  sellerName: '',
  buyerName: '',
  purchaseContractWeighTicketId: -1,
  purchaseContractPackingPlan: defaultPurchaseContractPackingPlan
};

export const defaultContract = {
  id: -1,
  createdAt: '',
  lastUpdatedAt: '',
  createdBy: 0,
  lastUpdatedBy: 0,
  lastProgramUpdate: '',
  code: '',
  status: 0,
  lastUpdatedProgram: '',
  notes: '',
  businessPlanId: 0,
  draftPoId: 0,
  saleContractId: 0,
  purchaseContractId: 0,
  customerId: 0
};

export const defaultApproval = {
  id: -1,
  createdAt: '',
  lastUpdatedAt: '',
  createdBy: 0,
  lastUpdatedBy: 0,
  lastProgramUpdate: '',
  code: '',
  status: 0,
  lastUpdatedProgram: '',
  requestType: '',
  referId: 0,
  requesterId: 0,
  approverId: 0,
  approvalStatus: '',
  requestDate: '',
  approvalDate: '',
  comments: ''
};
