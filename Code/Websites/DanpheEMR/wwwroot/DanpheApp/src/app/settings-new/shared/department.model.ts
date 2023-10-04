import {
  FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { BillServiceItem_DTO } from '../../billing/shared/dto/bill-service-item.dto';

export class Department {
  public DepartmentId: number = 0;
  public DepartmentCode: string = null;
  public DepartmentName: string = "";
  public Description: string = null;
  public NoticeText: string = null;
  public DepartmentHead: number = 0;
  public IsActive: boolean = true;
  public IsAppointmentApplicable: boolean = false;
  public DepartmentValidator: FormGroup = null;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public ParentDepartmentId: number = null;
  public ParentDepartmentName: string = null;
  public RoomNumber: string = null;
  public ServiceItemsList: Array<BillServiceItem_DTO> = [];
  public IsZeroPriceAllowed: boolean = false;//pratik:30march'21  for client side only
  //Sud:12March'23-- To map DepartmentOpdPrices directly to ServiceItems
  public OpdNewPatientServiceItemId: number = 0;
  public OpdOldPatientServiceItemId: number = 0;
  public FollowupServiceItemId: number = 0;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.DepartmentValidator = _formBuilder.group({
      'DepartmentCode': ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
      'DepartmentName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.DepartmentValidator.dirty;
    else
      return this.DepartmentValidator.controls[fieldName].dirty;
  }
  public IsValid(): boolean { if (this.DepartmentValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.DepartmentValidator.valid;
      //if (this.IsValidTime())
      ////return this.EmployeeValidator.valid;
      //  return this.EmployeeValidator.valid;
      //else
      //   return false;
    }

    else
      return !(this.DepartmentValidator.hasError(validator, fieldName));
  }



}





