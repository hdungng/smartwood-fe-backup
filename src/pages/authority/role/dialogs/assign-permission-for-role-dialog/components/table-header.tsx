import { PERMISSION_LABELS, PERMISSIONS, SCREEN_GROUPS } from '../../../../../../constants/authority';
import { TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

const TableHeader = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Màn hình</TableCell>
        {PERMISSIONS.map((permission) => (
          <TableCell key={permission} sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: 80 }}>
            {PERMISSION_LABELS[permission] || permission}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
