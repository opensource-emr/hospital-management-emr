import {FormBuilder,FormControl,FormGroup,Validators} from "@angular/forms"
import { ItemMaster } from "../../inventory/shared/item-master.model";


export class WardSupplyAssetRequisitionItemsModel {
    public RequisitionItemId: number = 0;
    public ItemId: number = 0;
    public Quantity: number = 0;
    public RequisitionId:number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public ReceivedQuantity =0;
    public PendingQuantity =0; 
    public RequisitionItemStatus = '';
    public Remark = '';
    public IssueNo =0;
    public CancelQuantity = 0;
    public CancelBy =0;
    public CancelOn = '';
    public IsActive:any;
    public ModifiedOn = '';
    public ModifiedBy = 0;
    public CancelRemarks = '';
    public RequisitionItemValidator:any;
    public IsEditApplicable: boolean = true;
    public RequisitionNo: number = 0;
    public ReceivedBy: string = "";
    public SubstoreName:string="";



    public SelectedItem: ItemMaster = null;

     //ItemName only for display purpose
  public ItemName: string = "";
  public Code: string = ""
  public RequestedByName: string = null;
  public CreatedByName: string = null;
  public DispatchedByName: string = null;
  public UOMName: string = null;
  public Remarks: string = null; //this is the main remark against requisition.
  public MatIssueTo: string = null;
  public MatIssueDate: Date = null;

constructor() {

    var _formBuilder = new FormBuilder();
    this.RequisitionItemValidator = _formBuilder.group({
      'ItemId': ['', Validators.compose([Validators.required])],
      'Quantity': ['', Validators.compose([this.positiveNumberValidator])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RequisitionItemValidator.dirty;
    else
      return this.RequisitionItemValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.RequisitionItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.RequisitionItemValidator.valid;
    }
    else
      return !(this.RequisitionItemValidator.hasError(validator, fieldName));
  }

  positiveNumberValidator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }

}
}
