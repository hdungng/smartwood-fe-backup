export type ListConfigRequest = {
  code?: string;
  status?: number;
  lastUpdatedProgram?: string;
  name?: string;
  description?: string;
  codeType?: string;
  isSystemCode?: number;
  sortOrder?: number;
  screenName?: string;
  page?: number;
  size?: number;
};
