import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import HelpModal from 'components/HelpModal';
import FullScreen from './FullScreen';
import Localization from './Localization';
import MobileSection from './MobileSection';
import Notification from './Notification';
import Profile from './Profile';
import Search from './Search';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import RegionIndicator from './RegionIndicator';

export default function HeaderContent() {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}

      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <RegionIndicator />
      {!downLG && localization}

      <HelpModal />
      {/*<Notification />*/}
      {/* <Message /> */}
      {!downLG && <FullScreen />}
      {/* <Customization /> */}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
