import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// lazy imports
const ForwarderList = Loadable(lazy(() => import('./List')));
const ForwarderCreate = Loadable(lazy(() => import('./Create')));
const ForwarderEdit = Loadable(lazy(() => import('./Edit')));
const ForwarderView = Loadable(lazy(() => import('./View')));

export { ForwarderList, ForwarderCreate, ForwarderEdit, ForwarderView };
