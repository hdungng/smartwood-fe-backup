import { businessPlanRoutes } from './business-plan';
import { poRouters } from './po';
import { contractPurchaseRoutes } from './contract-purchase';
import { systemRoutes } from './system';

const sectionRoutes = [...businessPlanRoutes, ...poRouters, ...contractPurchaseRoutes, ...systemRoutes];

export default sectionRoutes;
