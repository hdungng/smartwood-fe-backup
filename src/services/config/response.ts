import { EntityWithName } from '../core';

export type ConfigItem = {
  key: string;
  value: string;
  metaData?: Record<string, Dynamic>;
}

export type ConfigCode =
  | 'QUALITY_TYPE'
  | 'UNIT-OF-MEASURE'
  | 'EXPORT_PORT'
  | 'VEHICLE_TYPE'
  | 'REGION'
  | 'PAYMENT-CURRENCY'
  | 'PACKING_METHOD'
  | 'DELIVERY-METHOD'
  | 'PAYMENT_METHOD'
  | 'COUNTRY-IMPORT'
  | 'PORT-DESTINATION'
  | 'SHIPPING_LINE'
  | 'FORWARDER'
  | 'TRANSPORT_UNIT';


export type ListConfigResponse = EntityWithName<number> & {
  code: ConfigCode;
  data: ConfigItem[];
}

export type ExportPortMetaData = {
  region: string
}