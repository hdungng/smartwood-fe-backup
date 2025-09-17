import { 
  PaymentRequest, 
  MappedPaymentRequest,
  PaymentRequestApiResponse, 
  PaymentRequestListApiResponse, 
  CodeResponse,
  ContractApiResponse,
  ContractFilter,
  ContractListResponse,
  SingleContractResponse,
  ContractTypeEnum,
  ContractTypeInfo,
  ContractType,
  RequestPaymentPayload,
  SaleContractApiResponse
} from 'types/request-payment';
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import axios, { fetcher } from 'utils/axios';
import { formatDate } from 'utils/formatDate';

const endpoints = {
    key: '/api/requestpayment',
    list: '/',
    list_page: '/page',
    insert: '/',
    update: '/',
    delete: '/',
    getById: '/',
    count: '/count',
    list_request_payment_type: '/api/config',
    listSupplier: '/api/supplier',
    contracts: '/api/contract',
    saleContracts: '/api/salecontract',
    purchaseContracts: '/api/purchasecontract'
} as const;

const mapStatus = (status: number): 'APPROVED' | 'REJECTED' | 'PAID' | 'REQUEST_APPROVAL' => {
    switch (status) {
        case 1:
            return 'REQUEST_APPROVAL';
        case 3:
            return 'APPROVED';
        case 4:
            return 'REJECTED';
        case 5:
            return 'PAID';
        default:
            return 'REQUEST_APPROVAL';
    }
};

export function buildRequestPaymentPayload(formValues: any, mode: 'CONTRACT' | 'SERVICE'): RequestPaymentPayload {
  const payload: RequestPaymentPayload = {};

  if (formValues.amount) {
    const numericAmount = formValues.amount.toString().replace(/[^\d]/g, '');
    payload.cost = Number(numericAmount);
  }
  if (formValues.currency) payload.currency = formValues.currency;
  
  if (formValues.note) payload.note = formValues.note;
  if (formValues.paymentReason) payload.note = formValues.paymentReason;
  
  // if (formValues.reason) payload.reason = formValues.reason;
  if (formValues.supServiceType) payload.supServiceType = formValues.supServiceType;
  if (formValues.paymentCode) payload.paymentCode = formValues.paymentCode;
  payload.status = 1;

  if (mode === 'CONTRACT') {
    if (formValues.contractId) payload.contractId = Number(formValues.contractId);
    if (formValues.contractType) payload.contractType = formValues.contractType;
  }
  
  if (mode === 'SERVICE') {
    if (formValues.supplierId) payload.supplierId = Number(formValues.supplierId);
    if (formValues.serviceType) payload.serviceType = formValues.serviceType;
    // if (formValues.reason) payload.reason = formValues.reason;
    if (formValues.supServiceType) payload.supServiceType = formValues.supServiceType;
  }

  if (formValues.approvalId) payload.approvalId = Number(formValues.approvalId);
  if (formValues.lastUpdatedProgram) payload.lastUpdatedProgram = formValues.lastUpdatedProgram;

  return payload;
}

const mapApiResponseToPaymentRequest = (apiResponse: PaymentRequestApiResponse): MappedPaymentRequest => {      
    const mapped = {
        id: apiResponse.id?.toString() || '0',
        code: apiResponse.code || '',
        serviceProviderName: apiResponse.supplierId ? `Supplier ${apiResponse.supplierId}` : '',
        serviceType: apiResponse.serviceType || '',
        cost: apiResponse.cost || 0,
        contractType: apiResponse.contractType === 'PURCHASE' ? 'PURCHASE' as const : 
                     apiResponse.contractType === 'SALE' ? 'SALE' as const : undefined,
        status: mapStatus(apiResponse.status || 1),
        requestDate: apiResponse.createdAt ? new Date(apiResponse.createdAt) : new Date(),
        notes: apiResponse.note || apiResponse.supServiceType || '',
        createdBy: apiResponse.createdBy?.toString() || '0',
        requesterName: apiResponse.requesterName || '',

        supplierId: typeof apiResponse.supplierId === 'number' ? apiResponse.supplierId : undefined,
        currency: apiResponse.currency || 'VND',
        note: apiResponse.note || '',
        supServiceType: apiResponse.supServiceType || '',
        contractId: typeof apiResponse.contractId === 'number' ? apiResponse.contractId : undefined,
        paymentCode: apiResponse.paymentCode || ''
    };
    
    return mapped;    
};

export const determineContractType = (categoryCode: string): ContractTypeEnum => {
  const upperCode = categoryCode.toUpperCase();
  
  if (upperCode.includes('SALE_CONTRACT') || upperCode.includes('SALE')) {
    return ContractTypeEnum.SALE;
  } else if (upperCode.includes('PURCHASE_CONTRACT') || upperCode.includes('PURCHASE')) {
    return ContractTypeEnum.PURCHASE;
  } else if (upperCode.includes('CONTRACT')) {
    return ContractTypeEnum.BOTH;
  }
  
  return ContractTypeEnum.BOTH;
};

const mapContractApiResponseToContractType = (contract: ContractApiResponse): ContractType => {
  return {
    id: contract.id.toString(),
    code: contract.code,
    customerName: contract.customerName || 'N/A',
    contractDate: new Date(contract.contractDate),
    label: `${contract.code} - ${new Date(contract.contractDate).toLocaleDateString('vi-VN')}`    
  };
};

const mapSaleContractApiResponseToContractType = (contract: SaleContractApiResponse): ContractType => {
  let calculatedAmount = 0;
  let unitPrice = 0;
  let currency = 'VND';
  
  if (contract.transportInfo && contract.transportInfo.length > 0) {
    const firstGood = contract.transportInfo[0];
    unitPrice = firstGood.unitPrice || 0;
    currency = firstGood.currency || 'VND';
  }
  
  if (contract.totalWeight && unitPrice) {
    calculatedAmount = contract.totalWeight * unitPrice;
  }
  
  return {
    id: contract.id.toString(),
    code: contract.code,
    customerName: contract.customerName || 'N/A',
    contractDate: new Date(contract.contractDate),
    label: `${contract.code} - ${formatDate(contract.contractDate)}`,    
    totalWeight: contract.totalWeight,
    unitPrice: unitPrice,
    currency: currency,
    calculatedAmount: calculatedAmount
  };
};

const mapPurchaseContractApiResponseToContractType = (contract: any): ContractType => {
  let calculatedAmount = 0;
  let currency = 'VND';
  
  if (contract.purchaseContractPackingPlan && 
      contract.purchaseContractPackingPlan.purchaseContractPackingPlanGoodSuppliers) {
    
    const goodSuppliers = contract.purchaseContractPackingPlan.purchaseContractPackingPlanGoodSuppliers;
    
    calculatedAmount = goodSuppliers.reduce(
      (sum: number, item: any) => {
        const itemAmount = (item.unitPrice || 0) * (item.quantity || 0);
        return sum + itemAmount;
      },
      0
    );
    
    if (goodSuppliers.length > 0 && goodSuppliers[0].currency) {
      currency = goodSuppliers[0].currency;
    }
  } 
  else if (contract.purchaseContractPackingPlan && contract.purchaseContractPackingPlan.totalValue) {
    calculatedAmount = contract.purchaseContractPackingPlan.totalValue;
    currency = contract.purchaseContractPackingPlan.currency || 'VND';
  }
  
  const result = {
    id: contract.id.toString(),
    code: contract.code,
    customerName: contract.buyerName || contract.sellerName || 'N/A',
    contractDate: new Date(contract.contractDate),
    label: `${contract.code} - ${formatDate(contract.contractDate)}`,    
    currency: currency,
    calculatedAmount: calculatedAmount
  };
  
  return result;
};

export const useContractsByType = (contractType: ContractTypeEnum, filter?: ContractFilter) => {
  const queryParams = new URLSearchParams();
  
  if (filter?.page) queryParams.append('page', filter.page.toString());
  if (filter?.size) queryParams.append('size', filter.size.toString());
  
  if (filter?.Code?.trim()) queryParams.append('Code', filter.Code.trim());
  if (filter?.CustomerId) queryParams.append('CustomerId', filter.CustomerId.toString());
  if (filter?.Status !== undefined) queryParams.append('Status', filter.Status.toString());
  if (filter?.BusinessPlanId) queryParams.append('BusinessPlanId', filter.BusinessPlanId.toString());
  if (filter?.DraftPoId) queryParams.append('DraftPoId', filter.DraftPoId.toString());
  if (filter?.SaleContractIsNull !== undefined) queryParams.append('SaleContractIsNull', filter.SaleContractIsNull.toString());
  
  if (filter?.SortBy?.trim()) queryParams.append('SortBy', filter.SortBy.trim());
  if (filter?.SortDirection?.trim()) queryParams.append('SortDirection', filter.SortDirection.trim());

  const queryString = queryParams.toString();
  
  let endpoint: string = endpoints.contracts;
  if (contractType === ContractTypeEnum.SALE) {
    endpoint = endpoints.saleContracts;
  } else if (contractType === ContractTypeEnum.PURCHASE) {
    endpoint = endpoints.purchaseContracts;
  }
  
  const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

  const {
    data,
    isLoading,
    error,
    isValidating,
    mutate: mutateFn
  } = useSWR<ContractListResponse>(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 2,
    errorRetryInterval: 1000
  });

  return useMemo(
    () => ({
      contracts: data?.data ? data.data.map((contract: any) => {
        if (contractType === ContractTypeEnum.SALE) {
          return mapSaleContractApiResponseToContractType(contract as SaleContractApiResponse);
        } else if (contractType === ContractTypeEnum.PURCHASE) {
          return mapPurchaseContractApiResponseToContractType(contract);
        } else {
          return mapContractApiResponseToContractType(contract as ContractApiResponse);
        }
      }) : [],
      contractsLoading: isLoading,
      contractsError: error,
      contractsValidating: isValidating,
      contractsEmpty: !isLoading && !data?.data?.length,
      contractsTotal: data?.meta?.total || 0,
      refetch: mutateFn
    }),
    [data, error, isLoading, isValidating, mutateFn, contractType]
  );
};

export const useContractsByCategoryCode = (categoryCode: string, filter?: ContractFilter) => {
  const contractType = determineContractType(categoryCode);
  return useContractsByType(contractType, filter);
};

export const useAllContracts = (filter?: ContractFilter) => {
  return useContractsByType(ContractTypeEnum.BOTH, filter);
};

export const useSaleContracts = (filter?: ContractFilter) => {
  return useContractsByType(ContractTypeEnum.SALE, filter);
};

export const usePurchaseContracts = (filter?: ContractFilter) => {
  return useContractsByType(ContractTypeEnum.PURCHASE, filter);
};

export const useCurrencyList = () => {
  const {
    data,
    isLoading,
    error,
    mutate: mutateFn
  } = useSWR<CodeResponse>('/api/config?Code=PAYMENT-CURRENCY', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 2,
    errorRetryInterval: 1000
  });

  return useMemo(
    () => ({
      currencies: data?.data || [],
      currenciesLoading: isLoading,
      currenciesError: error,
      refetch: mutateFn
    }),
    [data, error, isLoading, mutateFn]
  );
};

export default function useRequestPayment() {
  const list = (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());

    if (params?.Code?.trim()) queryParams.append('Code', params.Code.trim());
    if (params?.ContractId) queryParams.append('ContractId', params.ContractId.toString());
    if (params?.ContractType?.trim()) queryParams.append('ContractType', params.ContractType.trim());
    if (params?.SupplierId) queryParams.append('SupplierId', params.SupplierId.toString());
    if (params?.Cost) queryParams.append('Cost', params.Cost.toString());
    if (params?.Currency?.trim()) queryParams.append('Currency', params.Currency.trim());
    if (params?.Note?.trim()) queryParams.append('Note', params.Note.trim());
    if (params?.ServiceType?.trim()) queryParams.append('ServiceType', params.ServiceType.trim());
    // if (params?.Reason?.trim()) queryParams.append('Reason', params.Reason.trim());
    if (params?.SupServiceType?.trim()) queryParams.append('SupServiceType', params.SupServiceType.trim());
    if (params?.PaymentCode?.trim()) queryParams.append('PaymentCode', params.PaymentCode.trim());
    if (params?.Status !== undefined) queryParams.append('Status', params.Status.toString());
    if (params?.ApprovalId) queryParams.append('ApprovalId', params.ApprovalId.toString());
    if (params?.LastUpdatedProgram?.trim()) queryParams.append('LastUpdatedProgram', params.LastUpdatedProgram.trim());

    if (params?.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
    if (params?.SortDirection?.trim()) queryParams.append('SortDirection', params.SortDirection.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<PaymentRequestListResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        requests: data?.data || [],
        requestsLoading: isLoading,
        requestsError: error,
        requestsValidating: isValidating,
        requestsEmpty: !isLoading && !data?.data?.length,
        requestsTotal: data?.data?.length || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const listPage = (params?: { page?: number; size?: number; [key: string]: any }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    
    if (params?.Code?.trim()) queryParams.append('Code', params.Code.trim());
    if (params?.ContractId) queryParams.append('ContractId', params.ContractId.toString());
    if (params?.ContractType?.trim()) queryParams.append('ContractType', params.ContractType.trim());
    if (params?.SupplierId) queryParams.append('SupplierId', params.SupplierId.toString());
    if (params?.Cost) queryParams.append('Cost', params.Cost.toString());
    if (params?.Currency?.trim()) queryParams.append('Currency', params.Currency.trim());
    if (params?.Note?.trim()) queryParams.append('Note', params.Note.trim());
    if (params?.ServiceType?.trim()) queryParams.append('ServiceType', params.ServiceType.trim());
    // if (params?.Reason?.trim()) queryParams.append('Reason', params.Reason.trim());
    if (params?.SupServiceType?.trim()) queryParams.append('SupServiceType', params.SupServiceType.trim());
    if (params?.PaymentCode?.trim()) queryParams.append('PaymentCode', params.PaymentCode.trim());
    if (params?.Status !== undefined) queryParams.append('Status', params.Status.toString());
    if (params?.ApprovalId) queryParams.append('ApprovalId', params.ApprovalId.toString());
    if (params?.LastUpdatedProgram?.trim()) queryParams.append('LastUpdatedProgram', params.LastUpdatedProgram.trim());
    
    if (params?.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
    if (params?.SortDirection?.trim()) queryParams.append('SortDirection', params.SortDirection.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list_page}${queryString ? `?${queryString}` : ''}`;

    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<PaymentRequestListApiResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    });

    return useMemo(
      () => ({
        requests: data?.data ? data.data.map(mapApiResponseToPaymentRequest) : [],
        requestsLoading: isLoading,
        requestsError: error,
        requestsValidating: isValidating,
        requestsEmpty: !isLoading && !data?.data?.length,
        requestsTotal: data?.meta?.total || 0,
        refetch: mutateFn
      }),
      [data, error, isLoading, isValidating, mutateFn]
    );
  };

  const getById = (id: string) => {
    const url = id ? `${endpoints.key}${endpoints.getById}${id}` : null;
    const {
      data,
      isLoading,
      error,
      isValidating,
      mutate: mutateFn
    } = useSWR<SinglePaymentRequestResponse>(url, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 2
    });
    
    const mappedRequest = data?.data ? mapApiResponseToPaymentRequest(data.data) : undefined;
    
    return useMemo(
      () => ({
        request: mappedRequest,
        requestLoading: isLoading,
        requestError: error,
        requestValidating: isValidating,
        refetch: mutateFn
      }),
      [mappedRequest, error, isLoading, isValidating, mutateFn]
    );
  };

  const create = async (newRequest: RequestPaymentPayload): Promise<any> => {
    const response = await axios.post(endpoints.key + endpoints.insert, newRequest);
    return response.data;
  };

  const update = async (requestId: string, updatedData: RequestPaymentPayload): Promise<PaymentRequest> => {
    try {
      const response = await axios.put<SinglePaymentRequestResponse>(`${endpoints.key}${endpoints.update}${requestId}`, updatedData);
      const updatedApiResponse = response.data.data;
      const updatedRequest = mapApiResponseToPaymentRequest(updatedApiResponse);
      
      await mutate(
        (key) => typeof key === 'string' && key.startsWith(endpoints.key + endpoints.list) && !key.match(/\/\d+$/),
        async (currentData: PaymentRequestListApiResponse | undefined) => {
          if (!currentData) return currentData;
          const updatedRequests = currentData.data.map((r) => 
            r.id.toString() === requestId ? updatedApiResponse : r
          );
          return {
            ...currentData,
            data: updatedRequests
          } as PaymentRequestListApiResponse;
        },
        { revalidate: false }
      );
  
      await mutate(
        `${endpoints.key}${endpoints.getById}${requestId}`,
        {
          data: updatedApiResponse,
          meta: { message: 'Request updated successfully' }
        } as SinglePaymentRequestResponse,
        { revalidate: false }
      );
  
      return updatedRequest;
    } catch (error) {
      console.error('Error updating request:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update request');
    }
  };

  const listConfigRequestPaymentType = async (codeType?: string) => {
    const request_payment_type = codeType || 'REQUEST_PAYMENT_TYPE';
    const response = await axios.get<CodeResponse>(`${endpoints.list_request_payment_type}?Code=${request_payment_type}`);
    return response.data;
  };

  const listSupplpier = async () => {
    const response = await axios.get<CodeResponse>(`${endpoints.listSupplier}`);
    return response.data;
  };
  
  const fetchListPage = async (params?: { page?: number; size?: number; [key: string]: any }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    
    if (params?.Search?.trim()) {
      queryParams.append('Search', params.Search.trim());
    }
    
    if (params?.Code?.trim()) queryParams.append('Code', params.Code.trim());
    if (params?.ContractId) queryParams.append('ContractId', params.ContractId.toString());
    if (params?.ContractType?.trim()) queryParams.append('ContractType', params.ContractType.trim());
    if (params?.SupplierId) queryParams.append('SupplierId', params.SupplierId.toString());
    if (params?.Cost) queryParams.append('Cost', params.Cost.toString());
    if (params?.Currency?.trim()) queryParams.append('Currency', params.Currency.trim());
    if (params?.Note?.trim()) queryParams.append('Note', params.Note.trim());
    if (params?.ServiceType?.trim()) queryParams.append('ServiceType', params.ServiceType.trim());
    // if (params?.Reason?.trim()) queryParams.append('Reason', params.Reason.trim());
    if (params?.SupServiceType?.trim()) queryParams.append('SupServiceType', params.SupServiceType.trim());
    if (params?.PaymentCode?.trim()) queryParams.append('PaymentCode', params.PaymentCode.trim());
    if (params?.Status !== undefined) queryParams.append('Status', params.Status.toString());
    if (params?.ApprovalId) queryParams.append('ApprovalId', params.ApprovalId.toString());
    if (params?.LastUpdatedProgram?.trim()) queryParams.append('LastUpdatedProgram', params.LastUpdatedProgram.trim());
    
    if (params?.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
    if (params?.SortDirection?.trim()) queryParams.append('SortDirection', params.SortDirection.trim());

    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.list_page}${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await axios.get<PaymentRequestListApiResponse>(url);
      return {
        requests: response.data?.data ? response.data.data.map(mapApiResponseToPaymentRequest) : [],
        requestsTotal: response.data?.meta?.total || 0,
        requestsEmpty: !response.data?.data?.length
      };
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      throw error;
    }
  };

  const countByStatus = async (params?: any) => {
    const queryParams = new URLSearchParams();
    
    if (params?.Search?.trim()) queryParams.append('Search', params.Search.trim());
    if (params?.Code?.trim()) queryParams.append('Code', params.Code.trim());
    if (params?.ContractId) queryParams.append('ContractId', params.ContractId.toString());
    if (params?.ContractType?.trim()) queryParams.append('ContractType', params.ContractType.trim());
    if (params?.SupplierId) queryParams.append('SupplierId', params.SupplierId.toString());
    if (params?.ServiceType?.trim()) queryParams.append('ServiceType', params.ServiceType.trim());
    
    const queryString = queryParams.toString();
    const url = `${endpoints.key}${endpoints.count}${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await axios.get(url);
      
      return {
        all: response.data?.data?.totalCount || 0,
        requestApproval: response.data?.data?.requestApproveCount || 0,
        approved: response.data?.data?.approvedCount || 0,
        rejected: response.data?.data?.rejectedCount || 0,
        paidCount: response.data?.data?.paid || 0
      };
    } catch (error) {
      console.error('Error counting payment requests by status:', error);
      throw error;
    }
  };

  return {
    list,
    listPage,
    getById,
    create,
    update,
    listConfigRequestPaymentType,  
    listSupplpier,
    determineContractType,
    fetchListPage,
    countByStatus
  };
}

interface PaymentRequestListResponse {
    data: PaymentRequestApiResponse[];
    meta: { message: string };
}
  
interface SinglePaymentRequestResponse {
    data: PaymentRequestApiResponse;
    meta: { message: string };
}