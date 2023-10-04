import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { OPDServiceDetails_DTO } from "../../shared/DTOs/opd-service-details.dto";
import { OPDServiceItem_DTO } from "../../shared/DTOs/opd-service-item.dto";
import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

@Component({
  selector: "department-add",
  templateUrl: "./department-add.html"

})

export class DepartmentAddComponent {


  public opdServicesDetails: Array<OPDServiceDetails_DTO> = [];
  public showAddPage: boolean = false;
  @Input("selected-department")
  public selectedDepartment: Department;
  @Input("isAppointable")
  public isAppointable: boolean = true;
  @Output("callback-add")
  public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;
  public CurrentDepartment: Department;
  public completeDeptList: Array<Department> = new Array<Department>();
  public deptList: Array<Department> = new Array<Department>();
  public disableBtn: boolean = false;
  public opdServiceItems: Array<OPDServiceItem_DTO> = new Array<OPDServiceItem_DTO>();
  public OpdNewService = new OPDServiceDetails_DTO();
  public OpdFollowupService = new OPDServiceDetails_DTO();
  public OpdOldService = new OPDServiceDetails_DTO();
  public selectedOpdNewServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public selectedOpdFollowupServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public selectedOpdOldServiceItem: OPDServiceItem_DTO = new OPDServiceItem_DTO();
  public isServiceItemsDetailsValid: boolean = false;

  constructor(
    private settingsBLService: SettingsBLService,
    private securityService: SecurityService,
    private coreService: CoreService,
    private messageBoxService: MessageboxService) {
    this.GetDepartments();
    this.GetOPDServiceItems();
    this.InitializeServices_TEMP();
  }

  ngOnInit() {
    this.setFocusById("DepartmentCode");
    if (this.selectedDepartment) {
      this.update = true;
      this.CurrentDepartment = new Department;
      this.CurrentDepartment = Object.assign(this.CurrentDepartment, this.selectedDepartment);
      this.CurrentDepartment.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.deptList = this.deptList.filter(dept => (dept.DepartmentId !== this.selectedDepartment.DepartmentId));
    }
    else {
      this.CurrentDepartment = new Department();
      this.CurrentDepartment.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
      this.CurrentDepartment.ParentDepartmentId = null;
      this.CurrentDepartment.IsActive = true;
      this.CurrentDepartment.IsAppointmentApplicable = false;
      this.CurrentDepartment.IsZeroPriceAllowed = false;
    }
    this.OnAppointmentApplicableChange();
    if (this.isAppointable == false) {
      this.CurrentDepartment.IsAppointmentApplicable = false;
      this.disableBtn = true;
    }
  }
  public GetDepartments(): void {
    this.settingsBLService.GetDepartments()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            this.deptList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.deptList, "DepartmentName");//this sorts the departmentlist by DepartmentName.
            this.deptList.forEach(dept => {
              //needs review to get parent department name
              this.deptList.forEach(parDept => {
                if (dept.ParentDepartmentId === parDept.DepartmentId)
                  dept.ParentDepartmentName = parDept.DepartmentName;
              });
            });
            this.completeDeptList = this.deptList;
          }
        }
        else {
          this.showMessageBox(ENUM_MessageBox_Status.Error, "Check log for error message.");
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.showMessageBox(ENUM_MessageBox_Status.Error, "Failed to get wards. Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }

  //adding new department
  public AddDepartment(): void {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (let i in this.CurrentDepartment.DepartmentValidator.controls) {
      this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
      this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDepartment.IsAppointmentApplicable) {
      this.CheckServiceItemsDetailsValidation();
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
    if (this.CurrentDepartment.IsValidCheck(undefined, undefined) && this.isServiceItemsDetailsValid) {
      this.settingsBLService.AddDepartment(this.CurrentDepartment)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.showMessageBox(ENUM_MessageBox_Status.Success, "Department Added");
              this.CurrentDepartment = new Department();
              this.CallBackAddDepartment(res);
            }
            else {
              this.showMessageBox(ENUM_MessageBox_Status.Error, res.Results);
            }
          },
          err => {
            this.logError(err);
          });
    }
  }

  //updating department
  public Update(): void {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (let i in this.CurrentDepartment.DepartmentValidator.controls) {
      this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
      this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentDepartment.IsAppointmentApplicable) {
      this.CheckServiceItemsDetailsValidation();
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
    if (this.CurrentDepartment.IsValidCheck(undefined, undefined) && this.isServiceItemsDetailsValid) {

      let valSummary = this.GetValidationSummary_OpdServices();
      if (!valSummary.IsValid) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, valSummary.ErrorMessage);
        return;
      }
      this.settingsBLService.UpdateDepartment(this.CurrentDepartment)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
              let dept = this.coreService.Masters.Departments.find(dept => dept.DepartmentId === res.Results.DepartmentId);
              if (dept) {
                dept = Object.assign(dept, res.Results)
              }
              this.showMessageBox(ENUM_MessageBox_Status.Success, "Department Updated");
              this.CurrentDepartment = new Department();
              this.CallBackAddDepartment(res)
            }
          },
          err => {
            this.logError(err);
          });
    }
  }

  public GetValidationSummary_OpdServices() {
    let validationSummary = { IsValid: true, ErrorMessage: [] };
    if (!this.selectedDepartment.IsAppointmentApplicable) {
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

  public Close(): void {
    this.selectedDepartment = null;
    this.update = false;
    this.deptList = this.completeDeptList;
    this.showAddPage = false;
    this.callbackAdd.emit({ action: "close" });
  }

  //after adding department is successfully added  then this function is called.
  public CallBackAddDepartment(res: DanpheHTTPResponse): void {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      for (let dept of this.completeDeptList) {
        if (dept.DepartmentId === res.Results.ParentDepartmentId) {
          res.Results.ParentDepartmentName = dept.DepartmentName;
          break;
        }
      };
      if (this.update) {
        this.callbackAdd.emit({ action: "update", department: res.Results });
      }
      else {//this is when new department is added.
        this.coreService.Masters.Departments.push(res.Results);
        this.callbackAdd.emit({ action: "add", department: res.Results });
      }
    }
    else {
      this.showMessageBox(ENUM_MessageBox_Status.Failed, "Check log for details");
      console.log(res.ErrorMessage);
    }
  }

  public showMessageBox(status: string, message: string): void {
    this.messageBoxService.showMessage(status, [message]);
  }

  public logError(err: any): void {
    console.log(err);
  }
  // Automatically capitalized department code when user writes something in that field.

  public CapitalizeDeptCode(): void {
    let depCode = this.CurrentDepartment.DepartmentCode;
    if (depCode) {
      this.CurrentDepartment.DepartmentCode = depCode.toUpperCase();
    }
  }

  public onApptApplicable: boolean = false;
  public OnAppointmentApplicableChange(): void {
    if (this.CurrentDepartment.IsAppointmentApplicable !== null && this.CurrentDepartment.IsAppointmentApplicable === true) {
      this.onApptApplicable = true;
      this.OpdNewService.IsMandatory = true;
      this.OpdNewService.IsServiceEnabled = true;
      this.OpdNewService.IsItemNameValid = false;
    } else {
      this.onApptApplicable = false;
      this.OpdNewService.IsMandatory = false;
      this.OpdNewService.IsItemNameValid = false;
      this.OpdNewService.IsServiceEnabled = true;
    }
    if (!this.onApptApplicable) {
      this.DisableOpdServiceSelection();
    }
  }

  public myItemListFormatter(data: any): string {
    let html = data["ServiceItemName"];
    return html;
  }

  public NewPatientServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdNewService.IsItemNameValid = false;
    this.CurrentDepartment.OpdNewPatientServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdNewService.IsItemNameValid = true;
      this.CurrentDepartment.OpdNewPatientServiceItemId = currentServiceItem.ServiceItemId;
    }
  }

  public FollowupServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdFollowupService.IsItemNameValid = false;
    this.CurrentDepartment.FollowupServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdFollowupService.IsItemNameValid = true;
      this.CurrentDepartment.FollowupServiceItemId = currentServiceItem.ServiceItemId;
    }
  }

  public OldPatientServiceItemChanged(currentServiceItem: OPDServiceItem_DTO): void {
    this.OpdOldService.IsItemNameValid = false;
    this.CurrentDepartment.OpdOldPatientServiceItemId = null;
    if (currentServiceItem && typeof (currentServiceItem) === "object") {
      this.OpdOldService.IsItemNameValid = true;
      this.CurrentDepartment.OpdOldPatientServiceItemId = currentServiceItem.ServiceItemId;
    }
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

  public setFocusById(targetId: string, waitingTimeInMS: number = 10): void {
    if (targetId === "AddDepartment") {
      if (this.update) {
        targetId = "UpdateDepartment"
      }
    }
    let timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeInMS);
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

  public opdNewServiceSelectChange(): void {
    if (this.selectedOpdNewServiceItem && this.CurrentDepartment.OpdNewPatientServiceItemId) {
      this.clearSelectedOpdNewServiceItem();
    }
    else {
      this.OpdNewService.IsMandatory = true;
      this.OpdNewService.IsItemNameValid = false;
    }
  }

  public opdFollowupServiceSelectChange(): void {
    if (this.selectedOpdFollowupServiceItem && this.CurrentDepartment.FollowupServiceItemId) {
      this.clearSelectedOpdFollowupServiceItem();
    }
    else {
      this.OpdFollowupService.IsMandatory = true;
      this.OpdFollowupService.IsItemNameValid = false;
    }
  }

  public opdOldServiceSelectChange(): void {
    if (this.selectedOpdOldServiceItem && this.CurrentDepartment.OpdOldPatientServiceItemId) {
      this.clearSelectedOpdOldServiceItem();
    }
    else {
      this.OpdOldService.IsMandatory = true;
      this.OpdOldService.IsItemNameValid = false;
    }
  }

  public CheckServiceItemsDetailsValidation(): void {
    if ((this.OpdNewService.IsServiceEnabled && !this.OpdNewService.IsItemNameValid)
      || (this.OpdFollowupService.IsServiceEnabled && !this.OpdFollowupService.IsItemNameValid)
      || (this.OpdOldService.IsServiceEnabled && !this.OpdOldService.IsItemNameValid)) {
      this.isServiceItemsDetailsValid = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Item Name is Required."]);
    }
    else {
      this.isServiceItemsDetailsValid = true;
    }
  }

  public clearSelectedOpdNewServiceItem(): void {
    this.selectedOpdNewServiceItem = null;
    this.CurrentDepartment.OpdNewPatientServiceItemId = null;
  }

  public clearSelectedOpdFollowupServiceItem(): void {
    this.selectedOpdFollowupServiceItem = null;
    this.CurrentDepartment.FollowupServiceItemId = null;
  }

  public clearSelectedOpdOldServiceItem(): void {
    this.selectedOpdOldServiceItem = null;
    this.CurrentDepartment.OpdOldPatientServiceItemId = null;
  }

  public DisableOpdServiceSelection(): void {
    this.clearSelectedOpdNewServiceItem();
    this.clearSelectedOpdFollowupServiceItem();
    this.clearSelectedOpdOldServiceItem();
    this.OpdNewService.IsServiceEnabled = false;
    this.OpdFollowupService.IsServiceEnabled = false;
    this.OpdOldService.IsServiceEnabled = false;
  }

  public AssignSelectedOpdServiceItems(): void {
    let opdNewPatientServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentDepartment.OpdNewPatientServiceItemId)
    if (opdNewPatientServiceItem) {
      this.OpdNewService.IsServiceEnabled = true;
      this.selectedOpdNewServiceItem = opdNewPatientServiceItem;
      this.NewPatientServiceItemChanged(this.selectedOpdNewServiceItem);
    }

    let followupServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentDepartment.FollowupServiceItemId)
    if (followupServiceItem) {
      this.OpdFollowupService.IsServiceEnabled = true;
      this.selectedOpdFollowupServiceItem = followupServiceItem;
      this.FollowupServiceItemChanged(this.selectedOpdFollowupServiceItem);
    }

    let opdOldPatientServiceItem = this.opdServiceItems.find(item => item.ServiceItemId === this.CurrentDepartment.OpdOldPatientServiceItemId)
    if (opdOldPatientServiceItem) {
      this.OpdOldService.IsServiceEnabled = true;
      this.selectedOpdOldServiceItem = opdOldPatientServiceItem;
      this.OldPatientServiceItemChanged(this.selectedOpdOldServiceItem);
    }
  }
}
