import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// lazy imports
const CustomerList = Loadable(lazy(() => import('./List')));
const CustomerCreate = Loadable(lazy(() => import('./Create')));
const CustomerEdit = Loadable(lazy(() => import('./Edit')));
const CustomerView = Loadable(lazy(() => import('./View')));

export { CustomerList, CustomerCreate, CustomerEdit, CustomerView };
