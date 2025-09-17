import { Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  includeHeader?: boolean;
}

export default function TableSkeleton({ rows = 5, columns = 9, includeHeader = true }: TableSkeletonProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 1200 }}>
        {includeHeader && (
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="80%" height={24} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} hover>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === columns - 1 ? (
                    // Actions column - show button skeleton
                    <Skeleton variant="circular" width={32} height={32} />
                  ) : (
                    // Data columns - show text skeleton with varying widths
                    <Skeleton 
                      variant="text" 
                      width={`${60 + Math.random() * 40}%`} 
                      height={20} 
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
