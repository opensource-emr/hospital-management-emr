
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { Department } from '../../shared/department.model';
import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { IntegrationName } from "../../shared/integration-name.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: "service-department-add",
  templateUrl: "./service-department-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})
//testing
export class ServiceDepartmentAddComponent {

  //public showAddPage: boolean = false;
  public needParent: boolean = false;

  @Input("selectedServDepartment")
  public selectedServDepartment: {
    DepartmentId: number,
    DepartmentName: string,
    ServiceDepartmentId: number,
    ServiceDepartmentName: string,
    ServiceDepartmentShortName: string;
    CreatedOn: string,
    CreatedBy: number,
    IntegrationName: string,
    ParentServiceDepartmentId: number,
    IsActive: boolean
  };
  //@Input("selectedServDepartment")
  //checkParent() {
  //  if (this.selectedServDepartment.ParentServiceDepartmentId != null) {
  //    this.needParent = true;
  //    (<HTMLInputElement>document.getElementById("needParent")).checked = true;
  //  }
  //}
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public update: boolean = false;
  public deptList: Array<Department> = new Array<Department>();
  public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public tempsrvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public integrationNameList: Array<IntegrationName> = new Array<IntegrationName>();

  public CurrentServiceDepartment: ServiceDepartment = new ServiceDepartment();

  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.GetDepartments();
    this.LoadIntegrationNameList();
    this.GetSrvDeptList();
    this.GoToNextInput("DepartmentId");
  }

  ngOnInit() {
    if (this.selectedServDepartment && this.selectedServDepartment.ServiceDepartmentId) {
      this.update = true;
      this.mapSelectedWithCurrent();
      this.CurrentServiceDepartment.EnableControl("DepartmentId", false);
      this.CurrentServiceDepartment.EnableControl("ServiceDepartmentName", false);
      this.CurrentServiceDepartment.EnableControl("IntegrationName", false);
    }
    else {
      this.CurrentServiceDepartment = new ServiceDepartment();
      this.CurrentServiceDepartment.IntegrationName = "None";
      this.CurrentServiceDepartment.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
    }
  }


  public mapSelectedWithCurrent() {
    this.needParent = false;
    this.CurrentServiceDepartment.DepartmentId = this.selectedServDepartment.DepartmentId;
    this.CurrentServiceDepartment.ServiceDepartmentName = this.selectedServDepartment.ServiceDepartmentName;
    this.CurrentServiceDepartment.ServiceDepartmentShortName = this.selectedServDepartment.ServiceDepartmentShortName;
    this.CurrentServiceDepartment.ServiceDepartmentId = this.selectedServDepartment.ServiceDepartmentId;
    this.CurrentServiceDepartment.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.CurrentServiceDepartment.CreatedOn = this.selectedServDepartment.CreatedOn;
    this.CurrentServiceDepartment.CreatedBy = this.selectedServDepartment.CreatedBy;
    this.CurrentServiceDepartment.IntegrationName = this.selectedServDepartment.IntegrationName;
    if (this.CurrentServiceDepartment.IntegrationName == null) {
      this.CurrentServiceDepartment.IntegrationName = "None"
    };
    this.CurrentServiceDepartment.ParentServiceDepartmentId = this.selectedServDepartment.ParentServiceDepartmentId;
    this.CurrentServiceDepartment.IsActive = this.selectedServDepartment.IsActive;
    if (this.CurrentServiceDepartment.ParentServiceDepartmentId != null) {
      this.needParent = true;
    }
    this.filterServiceDepartment();
  }

  public GetDepartments() {
    this.settingsBLService.GetDepartments()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.deptList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.deptList, "DepartmentName");//this sorts the deptList by deptList.
          }
        }
        else {
          this.showMessageBox("error", "Check log for error message.");
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.showMessageBox("error", "Failed to get Departments. Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }

  //adding new department
  AddServiceDepartment() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentServiceDepartment.ServiceDepartmentValidator.controls) {
      this.CurrentServiceDepartment.ServiceDepartmentValidator.controls[i].markAsDirty();
      this.CurrentServiceDepartment.ServiceDepartmentValidator.controls[i].updateValueAndValidity();
    }
    //this.CurrentServiceDepartment.IntegrationName = this.GetIntegrationName(this.CurrentServiceDepartment.DepartmentId);
    if (this.CurrentServiceDepartment.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddServiceDepartment(this.CurrentServiceDepartment)
        .subscribe(
          res => {
            //if (res.Status == "OK" && res.Results) {
            //    let dept = this.coreService.Masters.Departments.find(dept => dept.DepartmentId == res.Results.DepartmentId);
            //    if (dept) {
            //        dept = Object.assign(dept, res.Results)
            //    }
            this.showMessageBox("success", "Service Department Added");
            this.CurrentServiceDepartment = new ServiceDepartment();
            this.CallBackAddUpdateSrvDept(res)
            //}
          },
          err => {
            this.logError(err);
          });
    }
  }
  //GET: Integration Name List from Master Table for the Service Department
  LoadIntegrationNameList() {
    this.settingsBLService.GetIntegrationNameList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.integrationNameList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.integrationNameList, "IntegrationName");//this sorts the integrationNameList by IntegrationName.
          }
        }
        else {
          this.showMessageBox("error", "Check log for error message.");
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.showMessageBox("error", "Failed to get Integration Name List. Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }
  //adding new department
  GetIntegrationName(departmentId: number): string {
    let dept = this.deptList.find(a => a.DepartmentId == this.CurrentServiceDepartment.DepartmentId)
    if (dept) {
      if (dept.DepartmentName == "Lab")
        return "LAB";
      else if (dept.DepartmentName == "Radiology")
        return "Radiology";
      else if (dept.DepartmentName == "OPD")
        return "OPD";
    }
    else {
      return null;
    }
  }

  public GetSrvDeptList() {
    try {
      this.settingsBLService.GetServiceDepartments()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.srvdeptList = res.Results;
            }
            else {
              this.showMessageBox("failed", "Check log for error message.");
              this.logError(res.ErrorMessage);
            }
          }
        },
          err => {
            this.showMessageBox("Failed to get service departments", "Check log for error message.");
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.showMessageBox(exception, "check log for error message");
    }
  }

  filterServiceDepartment() {
    this.tempsrvdeptList = this.srvdeptList.filter(a => a.DepartmentId == this.CurrentServiceDepartment.DepartmentId);
  }
  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    this.settingsBLService.UpdateServDepartment(this.CurrentServiceDepartment)
      .subscribe(
        res => {
          //pushing service department in core service-- yubraj 6th Oct '18
          if (res.Status == "OK" && res.Results) {
            this.showMessageBox("success", "Service Department Updated");
            this.CurrentServiceDepartment = new ServiceDepartment();
            this.CallBackAddUpdateSrvDept(res)

          }
        },
        err => {
          this.logError(err);
        });
  }

  Close() {
    this.selectedServDepartment = null;
    this.update = false;
    this.callbackAdd.emit({ action: "close", servDepartment: null });
  }

  //after adding department is succesfully added  then this function is called.
  CallBackAddUpdateSrvDept(res: DanpheHTTPResponse) {
    if (res.Status == "OK") {
      //mapping accordint to the grid model

      let srvDeptFromServer = res.Results;

      var servDept: ServiceDepartment = new ServiceDepartment();
      servDept.RemoveFormValidator();//no need of validator while returning the data.
      servDept.DepartmentId = srvDeptFromServer.DepartmentId;
      servDept.ServiceDepartmentId = srvDeptFromServer.ServiceDepartmentId;
      servDept.ServiceDepartmentName = srvDeptFromServer.ServiceDepartmentName;
      servDept.ServiceDepartmentShortName = srvDeptFromServer.ServiceDepartmentShortName;
      servDept.CreatedOn = srvDeptFromServer.CreatedOn;
      servDept.CreatedBy = srvDeptFromServer.CreatedBy;
      servDept.IntegrationName = srvDeptFromServer.IntegrationName;

      let dept = this.deptList.find(d => d.DepartmentId == srvDeptFromServer.DepartmentId);
      if (dept) {
        servDept.DepartmentName = dept.DepartmentName;
      }

      if (this.update) {
        if (this.coreService.Masters.ServiceDepartments && this.coreService.Masters.ServiceDepartments.length > 0) {
          let indx = this.coreService.Masters.ServiceDepartments.findIndex(s => s.ServiceDepartmentId == srvDeptFromServer.ServiceDepartmentId);
          if (indx > -1) {
            this.coreService.Masters.ServiceDepartments.splice(indx, 1, srvDeptFromServer);
          }
        }

        this.callbackAdd.emit({ action: "edit", servDepartment: servDept });
      }
      else {
        this.coreService.Masters.ServiceDepartments.push(srvDeptFromServer);
        this.callbackAdd.emit({ action: "add", servDepartment: servDept });
      }
    }
    else {
      this.showMessageBox("error", "Check log for errors");
      console.log(res.ErrorMessage);
    }
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }

  GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event) {
    if (event.keyCode == 27) { // For ESCAPE_KEY =>close pop up
      this.Close();
    }
  }
}
