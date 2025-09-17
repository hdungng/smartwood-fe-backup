export const CONTRACT_WEIGHT = {
  COMMON: 'api/salecontractweightticketexport',
  DELETE: (id: number) => `api/salecontractweightticketexport/${id}`
};

export const SALE_CONTRACT = {
  COMMON: 'api/salecontract',
  BULK: 'api/salecontract/bulk',
  GET_BY_ID: (id: number) => `api/salecontract/${id}`,
  UPDATE: (id: number) => `api/salecontract/${id}`
};

export const SALE_CONTRACT_GOOD = {
  COMMON: 'api/salecontractgood'
};
