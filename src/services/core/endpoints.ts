import { CommonStatus } from '../../utils';

export enum ApiVersion {
  v1 = '/api'
}

export const getEndpoints = (version: ApiVersion = ApiVersion.v1) => ({
  businessPlans: {
    createBusinessPlan: `${version}/businessplan`,
    updateBusinessPlanTransactionInfo: (id: number) => `${version}/businessplantransactioninfo/${id}`,
    getDetailBusinessAPlan: (id: number) => `${version}/businessplan/${id}`,
    listSupplierOfBusinessPlan: `${version}/businessplansupplier`,
    listBusinessPlanBasic: `${version}/businessplan/basic`,
    storeSupplier: `${version}/businessplansupplier/bulk`,
    getCost: `${version}/businessplancost`,
    updateCost: `${version}/businessplancost`,
    requestApproval: (id: number) => `${version}/businessplan/${id}`
  },
  goods: {
    listSupplierByGood: (id: number) => `${version}/good/${id}/supplier`,
    listGood: `${version}/good`,
    listGoodBySupplier: `${version}/good`
  },
  suppliers: {
    listSuppliers: `${version}/supplier`
  },
  analysis: {
    getSummaryBusinessPlan: (id: number) => `${version}/analysis/businessplan/view/${id}`
  },
  draftPos: {
    getDetailDraftPo: `${version}/draftpo`
  },
  contracts: {
    listPurchaseContract: `${version}/purchasecontract/page`,
    deletePurchaseContract: (id: number) => `${version}/purchasecontract/${id}`,
    getDetailPurchaseContract: (id: number) => `${version}/purchasecontract/${id}`,
    createPurchaseContract: `${version}/purchasecontract`,
    updatePurchaseContract: (id: number) => `${version}/purchasecontract/${id}`,
    listShipPurchaseContract: `${version}/purchasecontractshippingschedule`,

    listPurchaseContractPackingPlan: `${version}/purchasecontractpackingplan`,
    storePurchaseContractPackingPlan: `${version}/purchasecontractpackingplan/bulk`,

    listPurchaseContractApprovalHistory: `${version}/approval`,
    actionPurchaseContract: (id: number, status: CommonStatus) => `${version}/purchasecontract/${id}/${status}`,

    createPurchaseContractWeightTicket: `${version}/purchasecontractweightticket/bulk`,
    getDetailPurchaseContractWeightTicket: `${version}/purchasecontractweightticket`,

    listSalesContract: `${version}/salecontract`,
    listSaleContractAvailable: `${version}/salecontract/available`
  },
  configs: {
    listConfig: `${version}/config`
  },
  regions: {
    listRegion: `${version}/region`
  },
  goodTypes: {
    listGoodType: `${version}/good-type`
  },
  feedbackReports: {
    getAll: `${version}/feedbackreport`,
    getByReportId: (reportId: number) => `${version}/feedbackreport?reportId=${reportId}`,
    create: `${version}/feedbackreport`
  },
  evaluate: {
    getAll: '/api/evaluate',
    create: '/api/evaluate',
    update: (id: number) => `/api/evaluate/${id}`
  },
  account: {
    profile: `${version}/account/me`,
    logIn: `${version}/account/login`,
  },
  good: {
    getAll: `${version}/good`
  },
  feebackreport: {
    getAll: `${version}/feedbackreport`
  },
  codedetail: {
    getAll: `${version}/codedetail`
  },
  code: {
    getAll: `${version}/config`
  },
 report: {
    getAll: `${version}/report` // ⚠️ Nếu đây là typo (report), sửa thành report
  },
  user: {
    getAll: `${version}/user` 
  },
  trucks: {
    listTrucks: `${version}/truck/page`
  },
  roles: {
    listRole: `${version}/role`,
    getRoleDetail: (id: number) => `${version}/role/${id}`,
    createRole: `${version}/role`,
    updateRole: (id: number) => `${version}/role/${id}`,
    deleteRole: (id: number) => `${version}/role/${id}`,
  },
  permissions: {
    listPermission: `${version}/permission`
  },
  userRoles: {
    assignPermission: (userId: number) => `${version}/user/${userId}/assign`,
    getUserRoles: (userId: number) => `${version}/user/${userId}/role`
  }
});
