import axios from 'axios';
import { ReportItem } from './response';

export const getReportList = async () => {
  return axios.get<ReportItem[]>('/api/report'); // Có thể xóa file này nếu không dùng nữa
};
