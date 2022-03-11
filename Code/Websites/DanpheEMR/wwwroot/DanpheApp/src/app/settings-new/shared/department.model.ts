
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { BillItemPriceModel } from './bill-item-price.model';
export class Department {
  public DepartmentId: number = 0;
  public DepartmentCode: string = null;

  public DepartmentName: string = null;

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

  public ServiceItemsList: Array<BillItemPriceModel> = [];

  public IsZeroPriceAllowed: boolean=false;//pratik:30march'21  for client side only

  constructor() {

    var _formBuilder = new FormBuilder();
    this.DepartmentValidator = _formBuilder.group({
      'DepartmentCode': ['', Validators.compose([Validators.maxLength(10)])],
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





