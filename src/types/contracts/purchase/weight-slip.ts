export interface PCWeightTicket {
  id: number;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  coveredFactory: string;
  coveringFactory: string;
  qualityType: string;
  coverageQuantity: number;
  coverageReason: string;
  coverageDate: string; // ISO 8601 date string
  goodsWeight: number;
  averageUnitPrice: number;
}

export interface PCWeightTicketItem {
  id: number;
  code: string;
  status: number;
  lastUpdatedProgram: string;
  weightTicketId: number;
  goodType: string;
  loadingDate: string; // ISO date string
  factoryName: string;
  actualWeight: number;
  goodPrice: number;
  shippingUnit: string;
  transportPrice: number;
  unloadingYard: string;
  truckNumber: string;
  containerNumber: string;
  sealNumber: string;
}
