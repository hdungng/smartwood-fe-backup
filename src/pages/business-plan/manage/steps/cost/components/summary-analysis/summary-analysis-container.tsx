import React, { useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { useBoolean, useIsTablet } from 'hooks';
import { useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH } from 'config';

const HEIGHT_SCROLL = 230;
const PADDING = 69;
const HEIGHT_HEADER = 60;

type Props = {
  children: React.ReactNode;
};

const SummaryAnalysisContainer = ({ children }: Props) => {
  const isSticky = useBoolean();
  const { menuMaster } = useGetMenuMaster();
  const isTablet = useIsTablet();
  const drawerOpen = useMemo(() => menuMaster.isDashboardDrawerOpened, [menuMaster.isDashboardDrawerOpened]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      isSticky.setValue(scrollTop > HEIGHT_SCROLL);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        position: isSticky.value ? 'fixed' : 'relative',
        top: isSticky.value ? HEIGHT_HEADER : 'auto',
        left: isSticky.value ? (drawerOpen ? DRAWER_WIDTH + PADDING : HEIGHT_HEADER + PADDING) : 'auto',
        right: isSticky.value ? PADDING : 'auto',
        zIndex: (theme) => (isSticky.value ? theme.zIndex.appBar - 1 : 'auto'),
        transition: (theme) =>
          theme.transitions.create('all', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard
          }),
        ...(isTablet && {
          left: isSticky.value ? (drawerOpen ? HEIGHT_HEADER + PADDING : PADDING) : 'auto'
        })
      }}
    >
      {children}
    </Box>
  );
};

export default SummaryAnalysisContainer;
