import { BaseService, getEndpoints } from 'services/core';
import {
  BusinessPlan,
  BusinessPlanBasic,
  BusinessPlanSupplier,
  CreateBusinessPlanResponse,
  DetailBusinessPlanCostResponse
} from './response';
import {
  CreateBusinessPlanRequest,
  ListBusinessPlanBasicRequest,
  StoreBusinessPlanSupplierRequest,
  UpdateBusinessPlanCostRequest,
  UpdateBusinessPlanRequest
} from './request';
import { BusinessPlanStatus } from '../../redux/BusinessPLan/constant';

class Service extends BaseService {
  createBusinessPlan = (payload: CreateBusinessPlanRequest) =>
    this.post<CreateBusinessPlanRequest, CreateBusinessPlanResponse>(getEndpoints().businessPlans.createBusinessPlan, payload);

  listBusinessPlanBasic = (request?: ListBusinessPlanBasicRequest) =>
    this.get<BusinessPlanBasic[]>(getEndpoints().businessPlans.listBusinessPlanBasic, request);

  updateBusinessPlanTransactionInfo = (payload: UpdateBusinessPlanRequest) =>
    this.put<Omit<UpdateBusinessPlanRequest, 'id'>, ApiResultEmpty>(
      getEndpoints().businessPlans.updateBusinessPlanTransactionInfo(payload.id),
      {
        ...payload
      }
    );

  getDetailBusinessPlan = (id: number) => this.get<BusinessPlan>(getEndpoints().businessPlans.getDetailBusinessAPlan(id));

  requestApprovalBusinessPlan = (businessPlanId: number) =>
    this.put<DynamicObject>(getEndpoints().businessPlans.requestApproval(businessPlanId), {
      status: BusinessPlanStatus.REQUESTAPPROVE
    });

  listSupplierOfBusinessPlan = (businessPlanId: number) =>
    this.get<BusinessPlanSupplier[]>(getEndpoints().businessPlans.listSupplierOfBusinessPlan, {
      businessPlanId
    });

  getBusinessPlanCost = (businessPlanId: number) =>
    this.get<DetailBusinessPlanCostResponse[]>(getEndpoints().businessPlans.getCost, { businessPlanId });

  updateBusinessPlanCost = (request: Nullable<UpdateBusinessPlanCostRequest>) =>
    this.post<Nullable<UpdateBusinessPlanCostRequest>, ApiResultEmpty>(getEndpoints().businessPlans.updateCost, request);

  storeSupplier = (request: StoreBusinessPlanSupplierRequest) =>
    this.post<StoreBusinessPlanSupplierRequest, ApiResultEmpty>(getEndpoints().businessPlans.storeSupplier, request);
}

export default new Service();
