export const PO_API = {
  GET_PAGE: 'api/draftpo/page',
  COMMON: 'api/draftpo'
};

export const TODO_API = {
  GET_PAGE: '/api/todo',
  GET_COUNT: '/api/todo/count'
};

export const BUSINESS_PLAN_API = {
  COMMON_TRANSACTION_NFO: 'api/businessplantransactioninfo',
  COMMON_COST: '/api/businessplancost',
  ANALYSIS_BUSINESS_PLAN: '/api/analysis/businessplan',
  BUSINESS_PLAN: '/api/businessplan'
};
export const EVALUATE_API = {

    COMMON: '/api/evaluate'

};
export const CODE_API = {
    COMMON: '/api/config',
};
export const REPORT_API = {
    COMMON: '/api/report',
     GET: '/api/report/count',
      CREATE: '/api/report'
};

export const CODEDELTAIL_API = {
    COMMON: '/api/codedetail',
};
export const ACCOUNT_API  = {
  GET_ME: '/api/account/me',
  COMMON: '/api/user'
}
export const USER_API = {
  COMMON: '/api/user'
}
export const GOOD_API = {
  COMMON: '/api/good'
}

export const CONFIG_API = {
  COMMON: 'api/config'
};

export const PURCHASE_CONTRACT_API = {
  GET_LIST: '/api/purchasecontract',
  DELETE: '/api/purchasecontract',
  CREATE: '/api/purchasecontract',
  GET_BY_ID: '/api/purchasecontract'
};
export const SALE_CONTRACT_API = {
  GET_LIST: '/api/salecontract',
  DELETE: '/api/salecontract',
  CREATE: '/api/salecontract',
  GET_BY_ID: '/api/salecontract',
  UPDATE: '/api/salecontract',
  GET_PAGE: '/api/salecontract/page',
  GET_COUNT: '/api/salecontract/count'
};

export const PURCHASE_CONTRACT_GOOD_API = {
  COMMON: '/api/purchasecontractgood'
};
export const SALE_CONTRACT_GOOD_API = {
  COMMON: '/api/salecontractgood'
};

export const SALE_CONTRACT_WEIGHT_TICKET_EXPORT_API = {
  GET_LIST: '/api/salecontractweightticketexport',
};
export const PURCHASE_CONTRACT_WEIGHT_TICKET_DETAIL_API = {
  GET_LIST: '/api/purchasecontractweightticketdetail',
  GET_PAGE: '/api/purchasecontractweightticketdetail/page',
}
export const CONTRACT_API = {
  GET_LIST: '/api/contract',
  GET_LIST_SALE_CONTRACT_IS_NULL: '/api/contract/sale-contract-is-null',
  GET_PAGE: '/api/contract/page',
  GET_COUNT: '/api/contract/count',
};

export const CONTRACT_SELL_API = {
  GET_LIST: '/api/salecontract',
};

export const CONTRACT_PURCHASE_API = {
  GET_LIST: '/api/purchasecontract',
  
};

export const SEA_CUSTOMS_API = {
  GET_LIST: '/api/seacustoms'
};

export const PURCHASE_GOOD_API = {
  COMMON: '/api/purchasecontractgood'
};

export const PURCHASE_CONTRACT_SHIPPING_SCHEDULE = {
  COMMON: '/api/purchasecontractshippingschedule'
};

export const CUSTOMER_API = {
  COMMON: 'api/customer',
  GET_LIST: '/api/customer'
};

export const FORWARDER = {
  COMMON: '/api/forwarder'
};

export const SHIPPING_LINE = {
  COMMON: '/api/shippingline'
};

export const DELIVERY_TERMS_API = {
  COMMON: '/api/deliveryterm'
};

export const PAYMENT_TERMS_API = {
  COMMON: '/api/paymentterm'
};


export const REQUEST_PAYMENT_API = {
  COMMON: '/api/requestpayment',
  GET_BY_ID:  '/api/requestpayment',
};

export const BANK_API = {
  COMMON: '/api/bank',
};

export const SUPPLIER_API = {
  COMMON: '/api/supplier',
};

export const APPROVE_API = {
  COMMON: '/api/approval',
};

export const IMAGE_API = {
  COMMON: '/api/image',
  UPLOAD: '/api/image/upload',
  update: (id: number) => `/api/image/${id}`,
};
export const FEEDBACKREPORT_API = {
    COMMON: '/api/feedbackreport'
};
export const STOCK_API = {
  GET_PAGE: 'api/stock/page',
  COMMON: '/api/stock',
  COUNT: '/api/stock/countStock'
};
export const STOCK_ADJUST_API = {
  GET_PAGE: 'api/stockadjust/page',
  COMMON: 'api/stockadjust',
  COUNT: 'api/stockadjust/count'
};
export const ROLE_API = {
    COMMON: '/api/role'
};