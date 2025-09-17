import { BaseService, getEndpoints, PaginationResult } from 'services/core';
import {
  ApprovalContractPurchaseRequest,
  CreateContractPurchaseWeightTicketRequest,
  CreatePurchaseContractRequest,
  ListPurchaseContractRequest,
  RejectContractPurchaseRequest,
  RequestApprovalContractPurchaseRequest,
  UpdatePurchaseContractRequest
} from './request';
import { CreatePurchaseContractResponse, GetDetailPurchaseContractWeightTicketResponse, PurchaseContractDetailResponse } from './response';
import { CommonStatus } from '../../utils';

class PurchaseService extends BaseService {
  listPurchaseContract = (request: ListPurchaseContractRequest) =>
    this.get<PaginationResult<PurchaseContractDetailResponse>>(getEndpoints().contracts.listPurchaseContract, request);

  deleteContractPurchase = (id: number) => this.delete<ApiResultEmpty>(getEndpoints().contracts.deletePurchaseContract(id));

  getDetailPurchaseContract = (id: number) =>
    this.get<PurchaseContractDetailResponse>(getEndpoints().contracts.getDetailPurchaseContract(id));

  createPurchaseContract = (payload: CreatePurchaseContractRequest) =>
    this.post<CreatePurchaseContractRequest, CreatePurchaseContractResponse>(getEndpoints().contracts.createPurchaseContract, payload);

  updatePurchaseContract = (payload: UpdatePurchaseContractRequest) =>
    this.put<Omit<UpdatePurchaseContractRequest, 'id'>, CreatePurchaseContractResponse>(
      getEndpoints().contracts.updatePurchaseContract(payload.id),
      payload
    );

  approvalContractPurchase = (payload: Omit<ApprovalContractPurchaseRequest, 'status' | 'note'> & { note?: string }) =>
    this.put<Omit<ApprovalContractPurchaseRequest, 'id'>, ApiResultEmpty>(
      getEndpoints().contracts.actionPurchaseContract(payload.id, CommonStatus.Approved),
      {
        note: payload.note
      }
    );

  rejectContractPurchase = (payload: Omit<RejectContractPurchaseRequest, 'status' | 'note'> & { note: string }) =>
    this.put<Omit<RejectContractPurchaseRequest, 'id'>, ApiResultEmpty>(
      getEndpoints().contracts.actionPurchaseContract(payload.id, CommonStatus.Rejected),
      {
        note: payload.note
      }
    );

  requestApprovalContractPurchase = (payload: Omit<RequestApprovalContractPurchaseRequest, 'status' | 'note'> & { note?: string }) =>
    this.put<Omit<RequestApprovalContractPurchaseRequest, 'id'>, ApiResultEmpty>(
      getEndpoints().contracts.actionPurchaseContract(payload.id, CommonStatus.RequestApproval),
      {
        note: payload.note
      }
    );

  createContractPurchaseWeightTicket = (payload: CreateContractPurchaseWeightTicketRequest) =>
    this.post<CreateContractPurchaseWeightTicketRequest, ApiResultEmpty>(
      getEndpoints().contracts.createPurchaseContractWeightTicket,
      payload
    );

  getDetailContractPurchaseWeightTicket = (purchaseContractId: number) =>
    this.get<GetDetailPurchaseContractWeightTicketResponse[]>(getEndpoints().contracts.getDetailPurchaseContractWeightTicket, {
      purchaseContractId
    });
}

export default new PurchaseService();
