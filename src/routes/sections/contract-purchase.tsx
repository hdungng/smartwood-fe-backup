import { PageGuard } from 'components/guards';
import { routing } from '../routing';
import Loadable from 'components/Loadable';
import { lazy } from 'react';

const ContractPurchaseManage = Loadable(lazy(() => import('pages/contract/purchase/manage')));
const ContractPurchaseList = Loadable(lazy(() => import('pages/contract/purchase/list')));
const ContractPurchaseApproval = Loadable(lazy(() => import('pages/contract/purchase/approval')));

export const contractPurchaseRoutes = [
  {
    path: routing.contractPurchase.list,
    element: (
      <PageGuard permission="PURCHASE_ORDER_VIEW">
        <ContractPurchaseList />
      </PageGuard>
    )
  },
  {
    path: routing.contractPurchase.create,
    element: (
      <PageGuard permission="PURCHASE_ORDER_CREATE">
        <ContractPurchaseManage mode="create" />
      </PageGuard>
    )
  },
  {
    path: routing.contractPurchase.edit(),
    element: (
      <PageGuard permission="PURCHASE_ORDER_UPDATE">
        <ContractPurchaseManage mode="edit" />
      </PageGuard>
    )
  },
  {
    path: routing.contractPurchase.detail(),
    element: (
      <PageGuard permission="PURCHASE_ORDER_VIEW">
        <ContractPurchaseManage mode="view" />
      </PageGuard>
    )
  },
  {
    path: routing.contractPurchase.approval,
    element: (
      <PageGuard permission="PURCHASE_ORDER_APPROVE">
        <ContractPurchaseApproval />
      </PageGuard>
    )
  }
];
