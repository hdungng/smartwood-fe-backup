import moment from 'moment';
import { STATUS_TRANSPORT } from 'utils';

export const defaultPCTruck = {
  code: '',
  status: STATUS_TRANSPORT.PENDING,
  purchaseContractId: 0,
  goodsType: '',
  quantity: 0,
  pickupDate: moment().format('dd/MM/yyyy'),
  deliveryDate: moment().format('dd/MM/yyyy'),
  vehicleType: '',
  transportCompany: '',
  pickupLocation: '',
  deliveryLocation: '',
  region: '',
  qualityType: '',
  transportFee: 0,
  notes: '',
  factory: ''
};
