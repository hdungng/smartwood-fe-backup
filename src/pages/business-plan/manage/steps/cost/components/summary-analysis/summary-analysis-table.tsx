import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { numberHelper } from 'utils';
import React, { useMemo } from 'react';
import { useCalculateAnalysis } from '../hook';
import { TableCellProps } from '@mui/material/TableCell';
import { mapUnitsFromConfig } from 'utils/mapUnitsFromConfig';
import { useGlobal } from 'contexts';

const SummaryAnalysisCell = (props: TableCellProps) => <TableCell sx={{ fontWeight: 'bold', ...props?.sx }} {...props} />;

type DataRowKey = 'totalRevenueExcludingVAT' | 'breakEvenPrice' | 'actualBusinessProfit' | 'profitMarginPercentage';

type DataRowProps = {
  key: DataRowKey;
  label: string;
  local: number;
  foreign: number;
  unit: string | number | null;
  isPositive?: boolean;
  isPercentage?: boolean;
};

const SummaryAnalysisTable = () => {
  const { configs } = useGlobal();
  const unitsData = useMemo(() => (configs && configs.length > 0 ? mapUnitsFromConfig(configs) : []), [configs]);
  const { summary } = useCalculateAnalysis();

  // Get unit display name from config
  const unitDisplayName = useMemo(() => {
    if (!summary?.unit || !unitsData.length) return summary?.unit || '';
    const unitConfig = unitsData.find((unit) => unit.code === summary.unit);
    return unitConfig?.name || summary.unit;
  }, [summary?.unit, unitsData]);

  const dataRows = useMemo((): DataRowProps[] => {
    if (!summary) return [];

    return [
      {
        key: 'totalRevenueExcludingVAT',
        label: 'Tổng doanh thu hợp đồng (chưa bao gồm VAT)',
        local: summary.totalRevenueExcludingVAT,
        foreign: summary.totalRevenueExcludingVATSecondaryCurrency,
        unit: summary.totalRevenueExcludingVATSecondaryCurrencyPerUnit,
        isPositive: true
      },
      {
        key: 'breakEvenPrice',
        label: 'Điểm hòa vốn/Giá bán tối thiểu (chưa bao gồm VAT)',
        local: summary.breakEvenPrice,
        foreign: summary.breakEvenPriceSecondaryCurrency,
        unit: null, // No per unit value for break even price
        isPositive: true
      },
      {
        key: 'actualBusinessProfit',
        label: 'Lợi nhuận vận hành thực tế (bao gồm chi phí vận hành + quản lý)',
        local: summary.actualBusinessProfit,
        foreign: summary.actualBusinessProfitSecondaryCurrency,
        unit: summary.actualBusinessProfitSecondaryCurrencyPerUnit,
        isPositive: summary.actualBusinessProfit >= 0
      },
      {
        key: 'profitMarginPercentage',
        label: 'Tỷ suất lợi nhuận',
        local: summary.profitMarginPercentage,
        foreign: summary.profitMarginPercentageSecondaryCurrency,
        unit: '-', // No per unit value for percentage
        isPositive: summary.profitMarginPercentage >= 0,
        isPercentage: true
      }
    ];
  }, [summary]);

  if (!summary) {
    return null;
  }

  return (
    <TableContainer
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        border: '1px solid #d9d9d9',
        borderTop: 'none'
      }}
    >
      <Table sx={{ height: '100%' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <SummaryAnalysisCell sx={{ color: 'white' }}>Tên số liệu</SummaryAnalysisCell>
            <SummaryAnalysisCell sx={{ color: 'white', minWidth: 200, textAlign: 'left' }}>VND</SummaryAnalysisCell>
            <SummaryAnalysisCell sx={{ color: 'white', minWidth: 200, textAlign: 'left' }}>
              {summary?.secondaryCurrency}
            </SummaryAnalysisCell>
            <SummaryAnalysisCell sx={{ color: 'white', minWidth: 200, textAlign: 'left' }}>
              {summary?.secondaryCurrency} / {unitDisplayName}
            </SummaryAnalysisCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataRows.map((row, index) => (
            <TableRow
              key={index}
              hover={false}
              sx={{
                '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' }
              }}
            >
              <SummaryAnalysisCell>{row.label}</SummaryAnalysisCell>
              <SummaryAnalysisCell
                sx={{
                  color: row.isPositive ? 'success.main' : 'error.main',
                  fontWeight: '600'
                }}
              >
                {row.isPercentage
                  ? numberHelper.formatPercent(row.local, { hasSign: true })
                  : numberHelper.formatCurrency(row.local, {
                      currency: 'VND',
                      hasSign: true
                    })}
              </SummaryAnalysisCell>
              <SummaryAnalysisCell
                sx={{
                  color: row.isPositive ? 'success.main' : 'error.main',
                  fontWeight: '600'
                }}
              >
                {row.isPercentage
                  ? numberHelper.formatPercent(row.foreign, { hasSign: true })
                  : numberHelper.formatCurrency(row.foreign, {
                      currency: summary?.secondaryCurrency,
                      hasSign: true
                    })}
              </SummaryAnalysisCell>
              <SummaryAnalysisCell
                sx={{
                  color: row.isPositive ? 'success.main' : 'error.main',
                  fontWeight: '600'
                }}
              >
                {row.unit !== null && !row.isPercentage
                  ? numberHelper.formatCurrency(row.unit, {
                      currency: summary?.secondaryCurrency,
                      hasSign: true
                    })
                  : '-'}
              </SummaryAnalysisCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(SummaryAnalysisTable);
