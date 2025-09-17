import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import useCost from 'api/cost';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
}

export default function AlertCostDelete({ id, title, open, handleClose }: Props) {
  const { delete: deleteCost } = useCost();
  const handleDelete = () => {
    deleteCost(id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} keepMounted>
      <DialogTitle>Delete Cost</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete cost {title}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}


