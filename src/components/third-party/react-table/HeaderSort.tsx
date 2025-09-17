// material-ui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// assets
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';

// types
import { Column } from '@tanstack/react-table';

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
  column: Column<any, unknown>;
  sort?: boolean;
}

// ==============================|| SORT HEADER ||============================== //

export default function HeaderSort({ column, sort }: HeaderSortProps) {
  return (
    <Box {...(sort && { onClick: column.getToggleSortingHandler(), className: 'cursor-pointer prevent-select' })}>
      {{
        asc: <SortToggler type={SortType.ASC} />,
        desc: <SortToggler type={SortType.DESC} />
      }[column.getIsSorted() as string] ?? <SortToggler />}
    </Box>
  );
}
