import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import CircularLoader from './CircularLoader';

// ==============================|| HELP MODAL COMPONENT ||============================== //

interface HelpModalProps {
  title?: string;
}

const HelpModal: React.FC<HelpModalProps> = ({ title }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('lg'));

  // Get iframe URL and title based on user role
  // const getIframeConfig = () => {
  //   switch (currentRole) {
  //     case Role.LOGISTIC:
  //       return {
  //         url: 'https://www.mindmeister.com/maps/public_map_shell/3745134373/sw-losgistic?width=600&height=400&z=auto&no_share=1&no_logo=1',
  //         title: 'SW-Logistics'
  //       };
  //     case Role.SALES:
  //       return {
  //         url: 'https://www.mindmeister.com/maps/public_map_shell/3750742117/sw-tmqt?width=600&height=400&z=auto&no_share=1&no_logo=1',
  //         title: 'SW-TMQT'
  //       };
  //     default:
  //       return {
  //         url: 'https://www.mindmeister.com/maps/public_map_shell/3739740272/kh-ch-h-ng-li-n-h-mua-h-ng?width=600&height=400&z=auto&live_update=1&no_share=1&no_logo=1',
  //         title: 'Khách hàng liên hệ mua hàng'
  //       };
  //   }
  // };

  const { url: iframeUrl, title: iframeTitle } = { url: '', title: '' };
  const modalTitle = title || iframeTitle;

  const handleClickOpen = () => {
    setOpen(true);
    setLoading(true); // Reset loading state when opening modal
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <>
      {/* Help Button */}
      <IconButton
        onClick={handleClickOpen}
        size="large"
        sx={{
          color: theme.palette.text.secondary,
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover
          }
        }}
        title="Trợ giúp"
      >
        <QuestionCircleOutlined style={{ fontSize: '20px' }} />
      </IconButton>

      {/* Help Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={true}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            margin: fullScreen ? 0 : 2,
            maxHeight: fullScreen ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}
        >
          {modalTitle}
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: theme.palette.grey[500],
              '&:hover': {
                backgroundColor: theme.palette.grey[100]
              }
            }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden', position: 'relative' }}>
          <Box
            sx={{
              width: '100%',
              height: fullScreen ? 'calc(100vh - 64px)' : '1000px',
              minHeight: '600px',
              position: 'relative'
            }}
          >
            {/* Loading overlay */}
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularLoader />
              </Box>
            )}

            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={iframeUrl}
              scrolling="no"
              style={{
                transform: 'scale(0.8)', // Giảm tỷ lệ xuống 80%
                transformOrigin: '0 0', // Đặt gốc scale ở góc trái trên cùng
                width: '125%', // Bù lại tỷ lệ scale để iframe không bị cắt
                height: '125%',
                border: 'none',
                display: 'block',
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
              title={iframeTitle}
              onLoad={handleIframeLoad}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpModal;
