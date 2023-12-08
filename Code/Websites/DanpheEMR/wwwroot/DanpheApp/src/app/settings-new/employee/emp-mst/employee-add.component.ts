import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";

import * as moment from 'moment/moment';
import { BillServiceItem_DTO } from "../../../billing/shared/dto/bill-service-item.dto";
import { CoreService } from "../../../core/shared/core.service";
import { EmployeeRole } from "../../../employee/shared/employee-role.model";
import { EmployeeType } from "../../../employee/shared/employee-type.model";
import { Employee } from "../../../employee/shared/employee.model";
import { SecurityService } from '../../../security/shared/security.service';
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { OPDServiceDetails_DTO } from "../../shared/DTOs/opd-service-details.dto";
import { OPDServiceItem_DTO } from "../../shared/DTOs/opd-service-item.dto";
import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

@Component({
  selector: "employee-add",
  templateUrl: "./employee-add.html",
  host: { '(window:keyup)': 'hotkeys($event)' }
})
export class EmployeeAddComponent {

  public opdServicesDetails: Array<OPDServiceDetails_DTO> = [];
  public allItemsList: Array<BillServiceItem_DTO> = new Array<BillServiceItem_DTO>();
  public checkAptApplicable: boolean = true;
  public CurrentEmployee: Employee = new Employee();
  public showAddPage: boolean = false;
  @Input("selected-employee")
  public selectedEmployee: Employee;
  @Output("callback-add")
  public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;
  public empRoleList: Array<EmployeeRole> = new Array<EmployeeRole>();
  public empTypeList: Array<EmployeeType> = new Array<EmployeeType>();
  public deptList: Array<Department> = new Array<Department>();
  //added: sud-14Jun'18--lab signature is different many times, so added it separately
  //check if we can re-use existing signature fields properly.
  public showLabSignature: boolean = false;
  public openPhotoCropper: boolean = false;
  public maintainAspectRatio: boolean = false;
  public useWebCam: boolean = false;
  public actionType: string = "add-new";
  public loading: boolean = false;
  public opdServiceItems: Array<OPDServiceItem_DTO> = new Array<OPDServiceItem_DTO>();
  public OpdNewService = new OPDServiceDetails_DTO();
  public OpdFollowupService = new OPDServiceDetails_DTO();
  public OpdOldService = new OPDServiceDetails_DTO();
  public OpdInternalReferral = new OPDServiceDetails_DTO();
  public selectedOpdNewServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public selectedOpdFollowupServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public selectedOpdOldServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public selectedOpdInternalReferralServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public isServiceItemsDetailsValid: boolean = false;
  public onApptApplicable: boolean = false;

  public GeneralFieldLabel = new GeneralFieldLabels();
  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {

    //vishal-20-11-2023-- Employee label chenge
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();


    this.InitializeServices_TEMP();
    this.GetOPDServiceItems();
    this.GetEmpRoleList();
    this.GetEmpTypeList();
    this.GetDepartmentList();
  }
  lableChange() {
    let label = this.coreService.GetFieldLabelParameter();
  }
  ngOnInit() {
    if (this.selectedEmployee) {
      this.update = true;
      this.CurrentEmployee = new Employee();
      this.CurrentEmployee = Object.assign(this.CurrentEmployee, this.selectedEmployee);
      if (this.selectedEmployee.DateOfBirth)
        this.CurrentEmployee.DateOfBirth = moment(this.selectedEmployee.DateOfBirth).format('YYYY-MM-DD');
      if (this.selectedEmployee.DateOfJoining)
        this.CurrentEmployee.DateOfJoining = moment(this.selectedEmployee.DateOfJoining).format('YYYY-MM-DD');
      this.CurrentEmployee.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployee.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
      //in edit mode get all details and assign it
      this.GetSignatoryImage(this.CurrentEmployee.EmployeeId);
    }
    else {
      this.CurrentEmployee = new Employee();
      this.CurrentEmployee.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployee.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.CurrentEmployee.DateOfJoining = moment().format('YYYY-MM-DD');
      this.CurrentEmployee.DateOfBirth = moment().format('YYYY-MM-DD');
      this.update = false;
    }
    this.FocusElementById('Salutation');
  }

  public GetEmpRoleList(): void {
    this.settingsBLService.GetEmployeeRoleList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.empRoleList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.empRoleList, "EmployeeRoleName");//this sorts the empRoleList by EmployeeRoleName.
            //console.log(this.empRoleList);
          }
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get EmpRoleList' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get EmpRoleList.' + err.ErrorMessage]);
        });
  }

  public GetEmpTypeList(): void {
    this.settingsBLService.GetEmployeeTypeList(true)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.empTypeList = res.Results;
          }
          //write some else logic if needed here..
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get EmpTypeList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get EmpTypeList.' + err.ErrorMessage]);
        });
  }

  public GetDepartmentList(): void {
    this.settingsBLService.GetDepartments()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.deptList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.deptList, "DepartmentName");//this sorts the departmentlist by DepartmentName.
            //console.log(this.deptList);
            //call department onchange function once departmentlist is loaded.
            this.DepartmentOnChange();
          }
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get DeptList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get DeptList.' + err.ErrorMessage]);
        });
  }

  public DepartmentOnChange(): void {

    if (!this.deptList || this.deptList.length === 0) {
      return;
    }
    let currDeptId = this.CurrentEmployee.DepartmentId;

    let currDept = this.deptList.find(dept => dept.DepartmentId === currDeptId);
    if (currDept) {
      if (currDept.DepartmentName.toLowerCase() === "lab" || currDept.DepartmentName.toLowerCase() === "pathology" || currDept.DepartmentName.toLowerCase() === "laboratory") {
        this.showLabSignature = true;
      }
      else {
        this.showLabSignature = false;
      }
      //for new employee set isappointmentapplicable as per department's property
      if (!this.CurrentEmployee.EmployeeId) {
        if (currDept && currDept.IsAppointmentApplicable) {
          this.CurrentEmployee.IsAppointmentApplicable = true;
        }
        else {
          this.CurrentEmployee.IsAppointmentApplicable = false;
        }
      }
      else {
        //assign default value only if Current Value is null..
        //This means, if appointmentapplicable is set to false, then later on it shouldn't be checked by default.
        if (this.CurrentEmployee.IsAppointmentApplicable === null) {
          if (currDept && currDept.IsAppointmentApplicable) {
            this.CurrentEmployee.IsAppointmentApplicable = true;
          } else {
            this.CurrentEmployee.IsAppointmentApplicable = false;
          }
        }
      }
      this.OnAppointmentApplicableChange();
    }
  }

  public TrimEmpNamesAndAssignFullName(): void {
    //removing extra spaces typed by the users
    this.CurrentEmployee.FirstName = this.CurrentEmployee.FirstName.trim();
    this.CurrentEmployee.MiddleName = this.CurrentEmployee.MiddleName ? this.CurrentEmployee.MiddleName.trim() : null;
    this.CurrentEmployee.LastName = this.CurrentEmployee.LastName.trim();
    //re-assign FullName value of employee here. This doesn't need validation so we can do it after validation succeed.
    let empFullName = (this.CurrentEmployee.Salutation ? this.CurrentEmployee.Salutation + ". " : "");
    empFullName += this.CurrentEmployee.FirstName;
    empFullName += this.CurrentEmployee.MiddleName ? " " + this.CurrentEmployee.MiddleName : "";
    empFullName += " " + this.CurrentEmployee.LastName;
    this.CurrentEmployee.FullName = empFullName.trim();
  }

  public AddEmployee(): void {
    this.loading = true;
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
      this.FocusElementById('Salutation');
    }
    if (this.CurrentEmployee.IsAppointmentApplicable) {
      this.CheckServiceItemsDetailsValidation();
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined) && this.isServiceItemsDetailsValid) {
      this.TrimEmpNamesAndAssignFullName();
      this.settingsBLService.AddEmployee(this.CurrentEmployee)
        .subscribe(
          res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Employee Added."]);
              this.CallBackAddUpdate(res)
              this.CurrentEmployee = new Employee();
            }
            else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong" + res.ErrorMessage]);
              this.loading = false;
              this.FocusElementById('Salutation');
            }
          },
          err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong" + err.ErrorMessage]);
            this.loading = false;
            this.FocusElementById('Salutation');
          });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please check all mandatory fields."]);
      this.loading = false;
      this.FocusElementById('Salutation');
    }
  }

  public UpdateEmployee(): void {
    this.loading = true;
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployee.IsAppointmentApplicable) {
      this.CheckServiceItemsDetailsValidation();
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined) && this.isServiceItemsDetailsValid) {
      let valSummary = this.GetValidationSummary_OpdServices();
      if (!valSummary.IsValid) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, valSummary.ErrorMessage);
        return;
      }
      this.TrimEmpNamesAndAssignFullName();
      this.settingsBLService.UpdateEmployee(this.CurrentEmployee)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Employee Details Updated.']);
              this.CallBackAddUpdate(res)
              this.CurrentEmployee = new Employee();
            }
            else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage]);
              this.loading = false;
            }
          },
          err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Something Wrong " + err.ErrorMessage]);
            this.loading = false;

          });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please check all mandatory fields."]);
      this.loading = false;
    }
  }

  public GetValidationSummary_OpdServices() {
    let validationSummary = { IsValid: true, ErrorMessage: [] };
    if (!this.CurrentEmployee.IsAppointmentApplicable) {
      return validationSummary;
    }
    this.opdServicesDetails.forEach(srv => {
      if (srv.IsServiceEnabled) {
        if (!srv.IsItemNameValid) {
          validationSummary.IsValid = false;
          validationSummary.ErrorMessage.push(srv.OpdServiceName + " is invalid.");
        }
      }
    });
    return validationSummary;
  }


  public CallBackAddUpdate(res: DanpheHTTPResponse): void {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      let employee: Employee = new Employee();
      employee.EmployeeId = res.Results.EmployeeId;
      employee.Salutation = res.Results.Salutation;
      employee.FirstName = res.Results.FirstName;
      employee.FullName = res.Results.FullName;
      employee.MiddleName = res.Results.MiddleName;
      employee.LastName = res.Results.LastName;
      employee.DateOfBirth = res.Results.DateOfBirth;
      employee.DateOfJoining = res.Results.DateOfJoining;
      employee.ContactNumber = res.Results.ContactNumber;
      employee.ContactAddress = res.Results.ContactAddress;
      employee.Email = res.Results.Email;
      employee.IsActive = res.Results.IsActive;
      employee.DepartmentId = res.Results.DepartmentId;
      employee.EmployeeRoleId = res.Results.EmployeeRoleId;
      employee.EmployeeTypeId = res.Results.EmployeeTypeId;
      employee.CreatedOn = res.Results.CreatedOn;
      employee.CreatedBy = res.Results.CreatedBy;
      employee.Gender = res.Results.Gender;
      employee.Extension = res.Results.Extension;
      employee.SpeedDial = res.Results.SpeedDial;
      employee.OfficeHour = res.Results.OfficeHour;
      employee.RoomNo = res.Results.RoomNo;
      employee.MedCertificationNo = res.Results.MedCertificationNo;
      employee.NursingCertificationNo = res.Results.NursingCertificationNo;
      employee.HealthProfessionalCertificationNo = res.Results.HealthProfessionalCertificationNo;
      employee.DriverLicenseNo = res.Results.DriverLicenseNo;
      employee.Signature = res.Results.Signature;
      employee.LongSignature = res.Results.LongSignature;
      employee.LabSignature = res.Results.LabSignature;
      employee.SignatoryImageName = res.Results.SignatoryImageName;
      employee.DisplaySequence = res.Results.DisplaySequence;
      employee.OpdNewPatientServiceItemId = res.Results.OpdNewPatientServiceItemId;
      employee.FollowupServiceItemId = res.Results.FollowupServiceItemId;
      employee.OpdOldPatientServiceItemId = res.Results.OpdOldPatientServiceItemId;

      let empRole = this.empRoleList.find(e => e.EmployeeRoleId === res.Results.EmployeeRoleId);
      employee.EmployeeRoleName = empRole ? empRole.EmployeeRoleName : null;

      let empType = this.empTypeList.find(e => e.EmployeeTypeId === res.Results.EmployeeTypeId);
      employee.EmployeeTypeName = empType ? empType.EmployeeTypeName : null;

      let empDept = this.deptList.find(e => e.DepartmentId === res.Results.DepartmentId);
      employee.DepartmentName = empDept ? empDept.DepartmentName : null;

      this.callbackAdd.emit({ action: "add", employee: employee });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['some error ' + res.ErrorMessage]);
    }
  }

  public Close(): void {
    this.selectedEmployee = null;
    this.update = false;
    this.showAddPage = false;

    this.callbackAdd.emit({ action: "close" });
  }

  public InitializeServices_TEMP(): void {
    this.OpdNewService.OpdServiceName = "OPD-New"
    this.OpdNewService.IsServiceEnabled = true;
    this.OpdNewService.IsMandatory = true;

    this.OpdNewService.OpdServiceName = "OPD-Followup"
    this.OpdNewService.IsServiceEnabled = false;
    this.OpdNewService.IsMandatory = false;

    this.OpdNewService.OpdServiceName = "OPD-Old"
    this.OpdNewService.IsServiceEnabled = false;
    this.OpdNewService.IsMandatory = false;
  }

  //Start: Employee Digital Signature Section
  public GetSignatoryImage(employeeId: number): void {
    this.settingsBLService.GetSignatoryImage(employeeId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results) {
            this.CurrentEmployee.SignatoryImageBase64 = res.Results;
          }
        }
      });
  }

  public RemoveSignatoryImage(): void {
    this.CurrentEmployee.SignatoryImageBase64 = null;
    this.CurrentEmployee.SignatoryImageName = null;
  }

  public OpenCropper(): void {
    this.openPhotoCropper = true;
  }

  public EditPhoto(): void {
    this.actionType = "edit";
    //this.currImageBase64 = "data:image/jpeg;base64," + this.patientFile.FileBase64String;
    this.openPhotoCropper = true;
  }

  public OnCropSuccess($event): void {
    this.openPhotoCropper = false;
    console.log("OnCropSuccess: ");
    console.log($event);
    if ($event) {
      let base64SignatoryImage = $event.base64.split(",");
      this.CurrentEmployee.SignatoryImageBase64 = base64SignatoryImage[1];
      //adds new image file incase of update if SignatoryImageName is null otherwise,
      //it assumes to be using same previous signatory image and so does not update SignatoryImageName
      this.CurrentEmployee.SignatoryImageName = null;
    } else {
      this.messageBoxService.showMessage("notification", ['Please select proper file format.'])
    }
  }

  public OnCropperClosed($event): void {
    this.openPhotoCropper = false;
  }
  //End: Employee Digital Signature Section

  public FocusElementById(id: string): void {
    this.openPhotoCropper = false;
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 10);
  }
  public hotkeys(event): void {
    if (event.keyCode === 27) {
      this.Close()
    }
  }

  public GetOPDServiceItems(): void {
    try {
      this.settingsBLService.GetOPDServiceItems()
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results && res.Results.length) {
            this.opdServiceItems = res.Results;
            if (this.opdServiceItems && this.update) {
              this.AssignSelectedOpdServiceItems();
            }
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed  to get OPD Service Items list"]);
          }
        });
    }
    catch (exception) {
    }
  }

  public myItemListFormatter(data: any): string {
    let html = data['ItemCode'] + '|' + data['ServiceItemName'] + '|' + data['Price'];

    return html;
  }

  public AssignSelectedOpdServiceItems(): void {
    let opdNewPatientServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentEmployee.OpdNewPatientServiceItemId)
    if (opdNewPatientServiceItem) {
      this.OpdNewService.IsServiceEnabled = true;
      this.selectedOpdNewServiceItem = opdNewPatientServiceItem;
      this.NewPatientServiceItemChanged(this.selectedOpdNewServiceItem);
    }

    let followupServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentEmployee.FollowupServiceItemId)
    if (followupServiceItem) {
      this.OpdFollowupService.IsServiceEnabled = true;
      this.selectedOpdFollowupServiceItem = followupServiceItem;
      this.FollowupServiceItemChanged(this.selectedOpdFollowupServiceItem);
    }

    let opdOldPatientServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentEmployee.OpdOldPatientServiceItemId)
    if (opdOldPatientServiceItem) {
      this.OpdOldService.IsServiceEnabled = true;
      this.selectedOpdOldServiceItem = opdOldPatientServiceItem;
      this.OldPatientServiceItemChanged(this.selectedOpdOldServiceItem);
    }

    let opdInternalReferralServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentEmployee.InternalReferralServiceItemId)
    if (opdInternalReferralServiceItem) {
      this.OpdInternalReferral.IsServiceEnabled = true;
      this.selectedOpdInternalReferralServiceItem = opdInternalReferralServiceItem;
      this.OpdInternalReferralServiceItemChanged(this.selectedOpdInternalReferralServiceItem);
    }
  }
  public NewPatientServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdNewService.IsItemNameValid = false;
    this.CurrentEmployee.OpdNewPatientServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdNewService.IsItemNameValid = true;
      this.CurrentEmployee.OpdNewPatientServiceItemId = currentServiceItem.ServiceItemId;
    }
  }

  public FollowupServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdFollowupService.IsItemNameValid = false;
    this.CurrentEmployee.FollowupServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdFollowupService.IsItemNameValid = true;
      this.CurrentEmployee.FollowupServiceItemId = currentServiceItem.ServiceItemId;
    }
  }

  public OldPatientServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdOldService.IsItemNameValid = false;
    this.CurrentEmployee.OpdOldPatientServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdOldService.IsItemNameValid = true;
      this.CurrentEmployee.OpdOldPatientServiceItemId = currentServiceItem.ServiceItemId;
    }
  }
  public OpdInternalReferralServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdInternalReferral.IsItemNameValid = false;
    this.CurrentEmployee.InternalReferralServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdInternalReferral.IsItemNameValid = true;
      this.CurrentEmployee.InternalReferralServiceItemId = currentServiceItem.ServiceItemId;
    }
  }

  public OnAppointmentApplicableChange(): void {
    if (this.CurrentEmployee.IsAppointmentApplicable !== null && this.CurrentEmployee.IsAppointmentApplicable === true) {
      this.onApptApplicable = true;
      this.OpdNewService.IsMandatory = true;
      this.OpdNewService.IsServiceEnabled = true;
      if (this.update && this.selectedOpdNewServiceItem) {
        this.OpdNewService.IsItemNameValid = true;
      }
      else {
        this.OpdNewService.IsItemNameValid = false;
      }
    } else {
      this.onApptApplicable = false;
      this.OpdNewService.IsMandatory = false;
      this.OpdNewService.IsItemNameValid = false;
      this.OpdNewService.IsServiceEnabled = true;
    }
    if (!this.onApptApplicable) {
      this.DisableOpdServiceSelection()
    }
  }

  public DisableOpdServiceSelection(): void {
    this.clearSelectedOpdNewServiceItem();
    this.clearSelectedOpdFollowupServiceItem();
    this.clearSelectedOpdOldServiceItem();
    this.OpdNewService.IsServiceEnabled = false;
    this.OpdFollowupService.IsServiceEnabled = false;
    this.OpdOldService.IsServiceEnabled = false;
  }

  public clearSelectedOpdNewServiceItem(): void {
    this.selectedOpdNewServiceItem = null;
    this.CurrentEmployee.OpdNewPatientServiceItemId = null;
  }

  public clearSelectedOpdFollowupServiceItem(): void {
    this.selectedOpdFollowupServiceItem = null;
    this.CurrentEmployee.FollowupServiceItemId = null;
  }

  public clearSelectedOpdOldServiceItem(): void {
    this.selectedOpdOldServiceItem = null;
    this.CurrentEmployee.OpdOldPatientServiceItemId = null;
  }
  public clearSelectedOpdInternalReferralServiceItem(): void {
    this.selectedOpdInternalReferralServiceItem = null;
    this.CurrentEmployee.InternalReferralServiceItemId = null;
  }

  public opdNewServiceSelectChange(): void {
    if (this.selectedOpdNewServiceItem && this.CurrentEmployee.OpdNewPatientServiceItemId) {
      this.clearSelectedOpdNewServiceItem();
    }
    else {
      this.OpdNewService.IsMandatory = true;
      this.OpdNewService.IsItemNameValid = false;
    }
  }

  public opdFollowupServiceSelectChange(): void {
    if (this.selectedOpdFollowupServiceItem && this.CurrentEmployee.FollowupServiceItemId) {
      this.clearSelectedOpdFollowupServiceItem();
    }
    else {
      this.OpdFollowupService.IsMandatory = true;
      this.OpdFollowupService.IsItemNameValid = false;
    }
  }

  public opdOldServiceSelectChange(): void {
    if (this.selectedOpdOldServiceItem && this.CurrentEmployee.OpdOldPatientServiceItemId) {
      this.clearSelectedOpdOldServiceItem();
    }
    else {
      this.OpdOldService.IsMandatory = true;
      this.OpdOldService.IsItemNameValid = false;
    }
  }
  public opdInternalReferralServiceSelectChange(): void {
    if (this.selectedOpdInternalReferralServiceItem && this.CurrentEmployee.InternalReferralServiceItemId) {
      this.clearSelectedOpdInternalReferralServiceItem();
    }
    else {
      this.OpdInternalReferral.IsMandatory = true;
      this.OpdInternalReferral.IsItemNameValid = false;
    }
  }

  public CheckServiceItemsDetailsValidation(): void {
    if ((this.OpdNewService.IsServiceEnabled && !this.OpdNewService.IsItemNameValid)
      || (this.OpdFollowupService.IsServiceEnabled && !this.OpdFollowupService.IsItemNameValid)
      || (this.OpdOldService.IsServiceEnabled && !this.OpdOldService.IsItemNameValid
        || (this.OpdInternalReferral.IsServiceEnabled && !this.OpdInternalReferral.IsItemNameValid))) {
      this.isServiceItemsDetailsValid = false;
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
  }


}
