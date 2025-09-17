import Loadable from '../../components/Loadable';
import { lazy } from 'react';
import { routing } from '../routing';
import { PageGuard } from 'components/guards';

const POList = Loadable(lazy(() => import('pages/apps/po/list')));
const POUpdateOrCreate = Loadable(lazy(() => import('pages/apps/po/UpdateOrCreate')));
const POUpdate = Loadable(lazy(() => import('pages/apps/po/Edit')));
const POApprove = Loadable(lazy(() => import('pages/apps/po/approve')));

export const poRouters = [
  {
    path: routing.po.list,
    element: (
      <PageGuard permission="DRAFT_PO_VIEW">
        <POList />
      </PageGuard>
    )
  },
  {
    path: routing.po.create,
    element: (
      <PageGuard permission="DRAFT_PO_CREATE">
        <POUpdateOrCreate />
      </PageGuard>
    )
  },
  {
    path: routing.po.edit(),
    element: (
      <PageGuard permission="DRAFT_PO_UPDATE">
        <POUpdate />
      </PageGuard>
    )
  },
  {
    path: routing.po.view(),
    element: (
      <PageGuard permission="DRAFT_PO_VIEW">
        <POUpdate />
      </PageGuard>
    )
  },
  {
    path: routing.po.approval,
    element: (
      <PageGuard permission="DRAFT_PO_APPROVE">
        <POApprove />
      </PageGuard>
    )
  }
];
