export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';

  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  });
}

export function parseCurrencyVND(amount: string): number {
  if (isNaN(Number(amount))) return 0;

  const numberString = amount.replace(/[^\d\-]/g, '');

  return parseInt(numberString, 10) || 0;
}

function getCurrencyUnitName(currencyCode: string): string {
  const map: Record<string, string> = {
    VND: 'đồng',
    USD: 'đô la Mỹ',
    EUR: 'euro',
    JPY: 'yên Nhật',
    CNY: 'nhân dân tệ',
    KRW: 'won Hàn Quốc',
    GBP: 'bảng Anh',
    AUD: 'đô la Úc',
    SGD: 'đô la Singapore',
    THB: 'baht Thái',
    KHR: 'riel Campuchia',
    IDR: 'rupiah Indonesia',
    PHP: 'peso Philippines',
    MYR: 'ringgit Malaysia',
    LAK: 'kip Lào'
  };
  const upper = (currencyCode || 'VND').toUpperCase();
  return map[upper] || 'đồng';
}

export function currencyToWords(amount: number, currencyCode: string = 'VND'): string {
  if (amount === 0) return 'Không đồng';
  if (amount < 0) return 'Số tiền không hợp lệ';

  // Mảng chữ số đơn vị
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  // Mảng chữ số chục
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];

  // Mảng đơn vị lớn
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ', 'tỷ tỷ'];

  // Hàm chuyển đổi 3 chữ số thành chữ
  function convertHundreds(num: number): string {
    let result = '';
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    const ten = Math.floor(remainder / 10);
    const unit = remainder % 10;

    // Xử lý hàng trăm
    if (hundred > 0) {
      result += ones[hundred] + ' trăm';
      if (remainder > 0) {
        result += ' ';
      }
    }

    // Xử lý hàng chục và đơn vị
    if (remainder > 0) {
      if (ten === 0) {
        // Số từ 1-9
        if (hundred > 0) {
          result += 'lẻ ' + ones[unit];
        } else {
          result += ones[unit];
        }
      } else if (ten === 1) {
        // Số từ 10-19
        if (unit === 0) {
          result += 'mười';
        } else if (unit === 5) {
          result += 'mười lăm';
        } else {
          result += 'mười ' + ones[unit];
        }
      } else {
        // Số từ 20-99
        result += tens[ten];
        if (unit > 0) {
          if (unit === 1 && ten > 1) {
            result += ' mốt'; // 21, 31, 41, ... đọc là "mốt"
          } else if (unit === 5 && ten > 1) {
            result += ' lăm'; // 25, 35, 45, ... đọc là "lăm"
          } else {
            result += ' ' + ones[unit];
          }
        }
      }
    }

    return result;
  }

  // Làm tròn số để tránh số thập phân
  const roundedAmount = Math.round(amount);

  // Chuyển số thành chuỗi và chia thành các nhóm 3 chữ số
  const numStr = roundedAmount.toString();
  const groups: number[] = [];

  // Chia thành các nhóm 3 chữ số từ phải sang trái
  for (let i = numStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3);
    const group = parseInt(numStr.substring(start, i));
    groups.unshift(group);
  }

  let result = '';
  let hasSignificantPart = false;

  // Xử lý từng nhóm
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const scaleIndex = groups.length - 1 - i;

    if (group > 0) {
      let groupText = convertHundreds(group);

      // Xử lý trường hợp đặc biệt cho "một" ở đầu nhóm nghìn
      if (scaleIndex === 1 && group < 10 && group > 0 && hasSignificantPart) {
        // Ví dụ: 1.001 -> "một triệu không trăm lẻ một" thay vì "một triệu một"
        groupText = 'không trăm lẻ ' + ones[group];
      } else if (scaleIndex === 1 && group >= 10 && group < 20 && hasSignificantPart) {
        // Ví dụ: 1.015 -> "một triệu không trăm mười lăm"
        const unit = group % 10;
        if (unit === 0) {
          groupText = 'không trăm mười';
        } else if (unit === 5) {
          groupText = 'không trăm mười lăm';
        } else {
          groupText = 'không trăm mười ' + ones[unit];
        }
      } else if (scaleIndex === 1 && group >= 20 && group < 100 && hasSignificantPart) {
        // Ví dụ: 1.025 -> "một triệu không trăm hai mười lăm"
        groupText = 'không trăm ' + convertHundreds(group);
      }

      if (result.length > 0) {
        result += ' ';
      }

      result += groupText;

      if (scaleIndex > 0 && scaleIndex < scales.length) {
        result += ' ' + scales[scaleIndex];
      }

      hasSignificantPart = true;
    } else if (hasSignificantPart && scaleIndex > 0) {
      // Thêm "không" cho các nhóm 0 ở giữa
      // Ví dụ: 1.000.001 -> "một triệu không nghìn không trăm lẻ một"
      if (scaleIndex === 1) {
        result += ' không nghìn';
      }
    }
  }

  // Viết hoa chữ cái đầu và thêm đơn vị tiền tệ tương ứng
  if (result) {
    const unit = getCurrencyUnitName(currencyCode);
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' ' + unit;

    // Làm sạch khoảng trắng thừa
    result = result.replace(/\s+/g, ' ').trim();
  }

  return result;
}

/*
EXAMPLES / TEST CASES:
currencyToWords(0) → "Không đồng"
currencyToWords(1) → "Một đồng"
currencyToWords(10) → "Mười đồng"
currencyToWords(15) → "Mười lăm đồng"
currencyToWords(21) → "Hai mười mốt đồng"
currencyToWords(25) → "Hai mười lăm đồng"
currencyToWords(100) → "Một trăm đồng"
currencyToWords(105) → "Một trăm lẻ năm đồng"
currencyToWords(115) → "Một trăm mười lăm đồng"
currencyToWords(125) → "Một trăm hai mười lăm đồng"
currencyToWords(1000) → "Một nghìn đồng"
currencyToWords(1001) → "Một nghìn không trăm lẻ một đồng"
currencyToWords(1015) → "Một nghìn không trăm mười lăm đồng"
currencyToWords(1025) → "Một nghìn không trăm hai mười lăm đồng"
currencyToWords(1100) → "Một nghìn một trăm đồng"
currencyToWords(1125) → "Một nghìn một trăm hai mười lăm đồng"
currencyToWords(10000) → "Mười nghìn đồng"
currencyToWords(100000) → "Một trăm nghìn đồng"
currencyToWords(1000000) → "Một triệu đồng"
currencyToWords(1000001) → "Một triệu không nghìn không trăm lẻ một đồng"
currencyToWords(1001000) → "Một triệu một nghìn đồng"
currencyToWords(1234567) → "Một triệu hai trăm ba mười bốn nghìn năm trăm sáu mười bảy đồng"
currencyToWords(1000000000) → "Một tỷ đồng"
currencyToWords(1234567890) → "Một tỷ hai trăm ba mười bốn triệu năm trăm sáu mười bảy nghìn tám trăm chín mười đồng"
*/
