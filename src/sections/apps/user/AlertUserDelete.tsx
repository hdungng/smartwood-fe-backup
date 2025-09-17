import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import useUser from 'api/user';

interface Props {
  id: number;
  title: string;
  open: boolean;
  handleClose: () => void;
}

export default function AlertUserDelete({ id, title, open, handleClose }: Props) {
  const { delete: deleteUser } = useUser();
  const handleDelete = () => {
    deleteUser(id);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} keepMounted>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete user {title}?</DialogContentText>
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
