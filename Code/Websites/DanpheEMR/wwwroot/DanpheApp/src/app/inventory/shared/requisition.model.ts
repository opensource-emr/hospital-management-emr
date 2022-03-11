import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import { RequisitionItems } from "./requisition-items.model";
import * as moment from 'moment/moment';
export class Requisition {
  public RequisitionId: number = 0;
  public RequestFromStoreId: number = null; //substoreId
  public RequestToStoreId: number = null; //inventory/mainstore id
  public DepartmentId: number = null;
  public RequisitionDate: string = moment().format();
  public RequisitionStatus: string = null;
  public RequisitionNo: number = 0;
  public IssueNo: number = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = moment().format('YYYY-MM-DD');
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;
  public CancelRemarks: string = null;
  public RequisitionValidator: FormGroup = null;
  public MSSNO: string = null;
  public MINNo: string = null;
  public StoreName: string = ""; //for displaying and data manipulation purpose : sanjit 31Mar'2020
  public CurrentVerificationLevelCount: number = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
  public CurrentVerificationLevel: number = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
  public MaxVerificationLevel: number = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
  public PermissionId: number = 0; //for displaying and data manipulation purpose : sanjit 31Mar'2020
  public isVerificationAllowed: boolean = false; //for authorization purpose : sanjit 6Apr'2020
  public VerificationStatus: string = null; //for filtering purpose : sanjit 14Apr'2020

  public RequisitionItems: Array<RequisitionItems> = new Array<RequisitionItems>();
  public CancelledItems: Array<RequisitionItems> = new Array<RequisitionItems>();//this is used for cancellation.

  //added for direct dispatch
  public Remarks: string;
  public ReceivedBy: string;

  public canDispatchItem: boolean = false;
  public isReceiveItemsEnabled: boolean = false;
  public NewDispatchAvailable: boolean = false;
  public ReqDisGroupId: number;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.RequisitionValidator = _formBuilder.group({
      'RequestFromStoreId': ['', Validators.compose([Validators.required])],
      'RequestToStoreId': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.RequisitionValidator.dirty;
    else
      return this.RequisitionValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.RequisitionValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.RequisitionValidator.valid;
    }
    else
      return !(this.RequisitionValidator.hasError(validator, fieldName));
  }

}
