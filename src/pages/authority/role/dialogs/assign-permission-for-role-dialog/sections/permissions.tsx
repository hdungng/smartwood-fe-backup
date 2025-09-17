import React from 'react';
import { Table, TableBody, TableContainer, Paper } from '@mui/material';
import { SCREEN_GROUPS } from '../../../../../../constants/authority';
import { GroupPermission } from '../components';
import TableHeader from '../components/table-header';

type Props = {
  roleCode?: string;
};

const PermissionSection = ({ roleCode }: Props) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHeader />

        <TableBody>
          {Object.entries(SCREEN_GROUPS).map(([groupName, screens]) => (
            <GroupPermission key={groupName} groupName={groupName} screens={screens} roleCode={roleCode} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionSection;
