// services/exportreport/response.ts

import { Entity } from 'services/core';

export type ExportReportItem = Entity<number> & {
  code: string;
  createdAt: string;
  lastUpdatedAt: string;
  createdBy: number;
  lastUpdatedBy: number;
  lastProgramUpdate: string;
  status: number;
  lastUpdatedProgram: string;
  supplierName: string;
  customerName: string;
  orderCode: string;
  tonVien: number;
  materialName: string;
  tonMaterial: number;
  tonVienAfter: number;
  quantityProduced: number;
  qualityRate: string;
  workerCount: number;
  leadCount: number;
  vehicleCount: number;
  destination: string;
  exportDate: string;
  note: string;
};
