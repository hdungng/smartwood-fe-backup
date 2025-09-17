// Define the form values interface
export interface LogisticFormValues {
    containerQuantity: number | undefined;
    availableContainerQuantity: number | undefined;
    etaDate: Date | null;
    etdDate: Date | null;
    shipName: string;
    forwarderName: string | number;
    shippingLine: string | number;
    firstContainerDropDate: Date | null;
    cutoffDate: Date | null;
    region: string;
    exportPort: string | { code: string; name: string; country: string };
    importPort: string | { code: string; name: string; country: string };
    goodId: number | undefined;
    goodType: string; // Quality type
    codeBooking: string;
    bookingNumber: string;
    notes: string;
    saleContractId: number | undefined;
  }
  
  // Props interface
  export interface LogisticFormProps {
    initialValues?: LogisticFormValues;
    editingId?: string | null;
    onEditComplete?: () => void;
  }
  
  export type OptionType = {
    key: string;
    value: string;
  };
  
  // Interface for selected sale contract with customer code
  export interface SelectedSaleContract {
    id?: number;
    goodId?: number;
    goodName?: string;
    goodType?: string;
    availableContainer?: number;
    transportInfo?: any[];
    customerCode?: string;
    [key: string]: any; // Allow other properties
  }