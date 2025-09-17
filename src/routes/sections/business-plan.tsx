import { PageGuard } from 'components/guards';
import { routing } from '../routing';
import Loadable from 'components/Loadable';
import { lazy } from 'react';

const BusinessPlanManage = Loadable(lazy(() => import('pages/business-plan/manage')));
const BusinessPlanList = Loadable(lazy(() => import('pages/business-plan/list')));
const BusinessPlanApproval = Loadable(lazy(() => import('pages/business-plan/approval')));

export const businessPlanRoutes = [
  {
    path: routing.businessPlan.list,
    element: (
      <PageGuard permission="BUSINESS_PLAN_VIEW">
        <BusinessPlanList />
      </PageGuard>
    )
  },
  {
    path: routing.businessPlan.create(),
    element: (
      <PageGuard permission="BUSINESS_PLAN_CREATE">
        <BusinessPlanManage mode="create" />
      </PageGuard>
    )
  },
  {
    path: routing.businessPlan.edit(),
    element: (
      <PageGuard permission="BUSINESS_PLAN_UPDATE">
        <BusinessPlanManage mode="edit" />
      </PageGuard>
    )
  },
  {
    path: routing.businessPlan.detail(),
    element: (
      <PageGuard permission="BUSINESS_PLAN_VIEW">
        <BusinessPlanManage mode="view" />
      </PageGuard>
    )
  },
  {
    path: routing.businessPlan.approval,
    element: (
      <PageGuard permission="BUSINESS_PLAN_APPROVE">
        <BusinessPlanApproval />
      </PageGuard>
    )
  }
];
