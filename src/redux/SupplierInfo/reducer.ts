import { RESET_SUPPLIER_INFO_FORM, SET_SUPPLIER_INFO_FORM, UPDATE_SUPPLIER_INFO_FIELD } from './action';

const getCurrentDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export type TSupplierInfo = {
  code: string;
  status: number;
  lastUpdatedProgram: string;
  businessPlanId: number;
  supplierId: number;
  goodId: number;
  shippingCompany: string;
  coveringCompany: string;
  region: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  expectedDeliveryDate: string;
  quantityType: number;
  level: number;
};

const initialState: TSupplierInfo[] = [
  {
    supplierId: 1,
    goodId: 1,
    shippingCompany: '',
    coveringCompany: '',
    region: '1',
    quantity: 0,
    purchasePrice: 0,
    totalAmount: 0,
    expectedDeliveryDate: getCurrentDate(),
    code: '',
    status: 0,
    lastUpdatedProgram: '',
    businessPlanId: 1,
    quantityType: 0,
    level: 0
  }
];

export const supplierInfoReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_SUPPLIER_INFO_FORM:
      return [
        {
          ...state[0],
          ...action.payload
        }
      ];
    case UPDATE_SUPPLIER_INFO_FIELD:
      return [
        {
          ...state[0],
          [action.payload.field]: action.payload.value
        }
      ];
    case RESET_SUPPLIER_INFO_FORM:
      return initialState;
    default:
      return state;
  }
};
