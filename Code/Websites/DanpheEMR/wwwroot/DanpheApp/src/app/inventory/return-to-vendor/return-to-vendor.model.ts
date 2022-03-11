import { ReturnToVendorItem } from "./return-to-vendor-items.model";

export class ReturnToVendorModel {
  public ReturnToVendorId: number = 0;
  public ReturnDate: string;
  public VendorId: number = null;
  public Remarks: string = null;
  public SubTotal: number = 0;
  public VATTotal: number = 0;
  public DiscountAmount: number = 0;
  public TotalAmount: number = 0;
  public CreditNoteId: number = null;
  public CreditNotePrintNo: number = null;
  public CreatedOn: string = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public itemsToReturn: Array<ReturnToVendorItem> = new Array<ReturnToVendorItem>();
  public StoreId: number;
}
