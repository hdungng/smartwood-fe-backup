import { PCWeightTicket, PCWeightTicketItem } from 'types/contracts/purchase/weight-slip';

export interface TWeightSlipState {
  weightTicket: Partial<PCWeightTicket>;
  weightTicketItem: Partial<PCWeightTicketItem>;
  weightTicketItems: PCWeightTicketItem[];
  loading: boolean;
  error: string;
  success: boolean;
}
