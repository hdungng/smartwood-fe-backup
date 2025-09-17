import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';
import Metrics from 'metrics';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';

// role-provider
import { RoleProvider } from 'contexts/RoleContext';
import { GlobalProvider } from 'contexts/GlobalContext';

// selector
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DialogProvider, RegionProvider, ToastProvider } from 'contexts';

import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { useEffect } from 'react';

dayjs.locale('vi');

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  const handleReloadWhenNewBuild = () => {
    window.location.reload();
  };

  useEffect(() => {
    window.addEventListener('vite:preloadError', handleReloadWhenNewBuild);

    return () => {
      window.removeEventListener('vite:preloadError', handleReloadWhenNewBuild);
    };
  }, []);

  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <RoleProvider>
                  <GlobalProvider>
                    <Notistack>
                      <ToastProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                          <RegionProvider>
                            <DialogProvider>
                              <RouterProvider router={router} />
                              <Snackbar />
                            </DialogProvider>
                          </RegionProvider>
                        </LocalizationProvider>
                      </ToastProvider>
                    </Notistack>
                  </GlobalProvider>
                </RoleProvider>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
      <Metrics />
    </>
  );
}
