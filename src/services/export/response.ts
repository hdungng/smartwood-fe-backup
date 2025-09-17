import { Entity } from 'services/core';

export type ExportItem = Entity<number> & {
  contractCode: string;
  exportDate: string;
  sealNumber: string;
  vehicleCount: number;
  workerCount: number;
  tonVien: number;
  tonVienAfter: number;
  quanityExport: number;
  material: string;
  destination: string;
  qualityRate: string;
};
