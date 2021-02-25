import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import * as moment from "moment/moment";
import { BillItemPriceModel } from "../../settings-new/shared/bill-item-price.model";
export class Employee {
  public EmployeeId: number = 0;
  public FirstName: string = null;
  public MiddleName: string = null;
  public LastName: string = null;
  public ImageFullPath: string = null;
  public ImageName: string = null;
  public DateOfBirth: string = null;
  public DateOfJoining: string = null;
  public ContactNumber: string = null;
  public Email: string = null;
  public ContactAddress: string = null;
  public IsActive: boolean = true;
  public Salutation: string = null;
  public EmployeeRoleId: number = null;
  public EmployeeTypeId: number = null;
  public DepartmentId: number = null;
  public FullName: string = null;
  public Gender: string = null;
  public Extension: number = null;
  public SpeedDial: number = null;
  public OfficeHour: string = null;
  public RoomNo: string = null;
  public MedCertificationNo: string = null;
  public Signature: string = null;
  public LongSignature: string = null;
  public RadiologySignature: string = null;
  public BloodGroup: string = null;
  public DriverLicenseNo: string = null;
  public NursingCertificationNo: string = null;
  public HealthProfessionalCertificationNo: string = null;

  public CreatedBy: number = null;
  public ModifiedBy: number = null;

  public CreatedOn: string = null;
  public ModifiedOn: string = null;

  //added: sud:14Jun'18--
  public IsAppointmentApplicable: boolean = null;
  public LabSignature: string = null;

  public DisplaySequence: number = 0;

  public SignatoryImageBase64: string = null;
  public SignatoryImageName: string = null;

  public EmployeeValidator: FormGroup = null;
  public IsExternal: boolean = false;

  public Show: boolean = false;

  public ServiceItemsList: Array<BillItemPriceModel> = [];

  public EmployeeRoleName: string = null; //sud:24Oct'19--Used Only in Cient Side.
  public EmployeeTypeName: string = null; //sud:24Oct'19--Used Only in Cient Side.
  public DepartmentName: string = null; //sud:24Oct'19--Used Only in Cient Side.

  public TDSPercent: number = 0; //pratik:14April'2020
  public PANNumber: string = null; //pratik:14April'2020
  public IsIncentiveApplicable: boolean = false; //pratik:14April'2020

  constructor() {
    var _formBuilder = new FormBuilder();
    this.EmployeeValidator = _formBuilder.group({
      FirstName: [
        "",
        Validators.compose([Validators.required, Validators.maxLength(30)]),
      ],
      LastName: [
        "",
        Validators.compose([Validators.required, Validators.maxLength(30)]),
      ],
      EmployeeDepartment: ["", Validators.compose([Validators.required])],
      Gender: ["", Validators.compose([Validators.required])],
      Email: [
        "",
        Validators.compose([
          Validators.pattern(
            "^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$"
          ),
        ]),
      ],
      DateOfBirth: [
        "",
        Validators.compose([Validators.required, this.dateValidator]),
      ],
      MedCertificationNo: ["", Validators.compose([Validators.maxLength(20)])],
      NursingCertificationNo: ["", Validators.compose([Validators.maxLength(20)])],
      HealthProfessionalCertificationNo: ["", Validators.compose([Validators.maxLength(20)])],
      DriverLicenseNo: ["", Validators.compose([Validators.maxLength(20)])],
      Signature: ["", Validators.compose([Validators.maxLength(200)])],
      LongSignature: ["", Validators.compose([Validators.maxLength(500)])],
    });
  }
  dateValidator(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format("YYYY-MM-DD");
    if (control.value) {
      //if positive then selected date is of future else it of the past
      if (
        moment(control.value).diff(currDate) > 0 ||
        moment(control.value).diff(currDate, "years") < -200
      )
        // this will not allow the age diff more than 200 is past
        return { wrongDate: true };
    } else return { wrongDate: true };
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) return this.EmployeeValidator.dirty;
    else return this.EmployeeValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.EmployeeValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.EmployeeValidator.valid;
    } else return !this.EmployeeValidator.hasError(validator, fieldName);
  }
}
