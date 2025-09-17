import React from 'react';
import { Box, Button } from '@mui/material';
import { PlusOutlined as AddIcon } from '@ant-design/icons';

interface TruckScheduleToolbarProps {
  handleAddRow: () => void;
  handleSaveRows: () => void;
  editedRowsCount: number;
}

export const TruckScheduleToolbar: React.FC<TruckScheduleToolbarProps> = ({
  handleAddRow,
  handleSaveRows,
  editedRowsCount
}) => {
  return (
    <Box sx={{ display: 'flex', gap: '0.5rem' }}>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        tabIndex={12}
      >
        Thêm xe mới
      </Button>
      <Button
        variant="contained"
        onClick={handleSaveRows}
        disabled={editedRowsCount === 0}
        tabIndex={13}
      >
        Lưu thay đổi ({editedRowsCount})
      </Button>
    </Box>
  );
};
