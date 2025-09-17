import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';
import { SortDirection } from '@tanstack/react-table';
// ==============================|| SORT HEADER ||============================== //

  enum SortType {
    ASC = 'asc',
    DESC = 'desc'
  }

  function SortToggler({ type }: { type?: SortType }) {
    return (
      <Stack
        sx={{
          fontSize: '0.625rem',
          color: 'secondary.light',
          ...(type === SortType.ASC && { '& .caret-up': { color: 'secondary.main' } }),
          ...(type === SortType.DESC && { '& .caret-down': { color: 'secondary.main' } })
        }}
      >
        <CaretUpOutlined className="caret-up" />
        <CaretDownOutlined className="caret-down" style={{ marginTop: -2 }} />
      </Stack>
    );
  }

  interface HeaderSortProps {
    sorted?: SortDirection |false; // 'asc' | 'desc' | false
    onClick?: () => void;
  }
  export default function HeaderSort({ sorted, onClick }: HeaderSortProps) {
    let type: SortType | undefined;
    if (sorted === 'asc') type = SortType.ASC;
    if (sorted === 'desc') type = SortType.DESC;
    
    return (
      <Box onClick={onClick} className="cursor-pointer prevent-select" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <SortToggler type={type} />
      </Box>
    );
  }
