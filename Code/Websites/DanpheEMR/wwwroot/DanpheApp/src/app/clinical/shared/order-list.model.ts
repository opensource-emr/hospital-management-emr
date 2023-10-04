import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";

export class PatientOrderListModel { 

    //public Type: string = null;
    //public ItemId: number = null;
    //public ItemName: string = '';
    //public FormattedName: string = null;
    //public PreferenceType: string = null;
    //public IsPreference: boolean = false;
    //public IsSelected: boolean = false;
     
    //public GenericId: null = null;
    //public IsGeneric: boolean = false;
    //public Dosage: string = null;
    //public Route: string = null;
    //public Frequency: number = null;
    //public FreqInWords: string = null;
    //public Duration: number = null; 
    //public Remarks: string = null;
    //public BrandName: string = null;

    public Order: any = null;
    public GenericId: null = null;
    public IsGeneric: boolean = false;
    public Dosage: string = null;
    public Route: string = null;
    public Frequency: number = null;
    public FreqInWords: string = null;
    public Duration: number = null; 
    public Remarks: string = null;
    public BrandName: string = null;
    public IsActive: boolean = true;
}
