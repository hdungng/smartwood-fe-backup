import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const handleDownloadExcel = (data: any, filename: string) => {
    if (!Array.isArray(data)) {
        data = [data];
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Infor');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(file, `CO_${filename}.xlsx`);
};