import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SecurityService } from '../../../security/shared/security.service';
import { Employee } from "../../../employee/shared/employee.model";
import { User } from "../../../security/shared/user.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: "user-add",
  templateUrl: "./user-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }

})
export class UserAddComponent {

  public CurrentUser: User = new User();

  public showAddPage: boolean = false;
  public selectedItem: User = null;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public update: boolean = false;
  public empList: Array<Employee> = new Array<Employee>();
  public filteredEmpList: Array<Employee> = new Array<Employee>();

  @Input("userList")
  public userList: Array<User> = new Array<User>();

  public selEmployee: User = null;
  public user: User = new User();

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.GetEmpList();
    this.selectedItem = new User();
    this.GoToNextInput("EmployeeId");
  }


  //@Input("showAddPage")
  //public set value(val: boolean) {
  //  this.showAddPage = val;
  //  this.FilterEmployeeList();
  //  this.CurrentUser = new User();
  //  this.CurrentUser.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //  this.CurrentUser.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
  //  this.update = false;

  //}
  ngOnInit() {
    this.FilterEmployeeList();
    this.CurrentUser = new User();
    this.CurrentUser.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.CurrentUser.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
    this.update = false;
  }

  ///geting Emp list for DropDown Employee selection 
  public GetEmpList() {
    //this.empList = DanpheCache.GetData(MasterType.Employee,null);
    this.settingsBLService.GetEmployeeList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.empList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.empList, "FullName");//this sorts the empList by FullName.

          }
          else {
            this.msgBoxServ.showMessage("Failed to get Employee List", ['Check log for error message.']);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage("Failed to get EmpRoleList", ['Check log for error message.']);
          this.logError(err.ErrorMessage);
        });
  }

  Add(): void {

    //set ConfirmPassword = Password from code since we're not asking user to type ConfirmPassword from the frontend.
    this.CurrentUser.UserProfileValidator.controls["ConfirmPassword"].setValue(this.CurrentUser.Password);

    //checking Validation message 
    for (var i in this.CurrentUser.UserProfileValidator.controls) {
      this.CurrentUser.UserProfileValidator.controls[i].markAsDirty();
      this.CurrentUser.UserProfileValidator.controls[i].updateValueAndValidity();
    }

    ////if the current user enter is validated the update else through error message
    if ((this.CurrentUser.IsValidCheck(undefined, undefined) && !this.CheckUserNameAndEmail())) {
      this.settingsBLService.AddUser(this.CurrentUser)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['User Added Successfully.']);
              this.CurrentUser = new User();
              
              this.GetEmpList();
              //we're getting new user as res.Results.
              let newUser: User = res.Results;
              this.callbackAdd.emit({ user: newUser });
              this.selEmployee = null;
              this.Close();

            }else if(res.Status == "Failed"){
              this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
              console.log(res.ErrorMessage);
            }
            else {
             
              this.msgBoxServ.showMessage("Failed", ["UserName or email already exists"]);

            }

          },
          err => {
            this.logError(err);

          });
    }
  }


  CheckUserNameAndEmail() {
    var matched = this.userList.filter(user => (user.UserName == this.CurrentUser.UserName));
    if (matched.length) {
      if (this.update)
        if (this.CurrentUser.UserName == this.selectedItem.UserName)
          return false;
      this.msgBoxServ.showMessage("Failed", ["UserName already exists"]);
      return true;
    }
    matched = this.userList.filter(user => (user.Email == this.CurrentUser.Email));
    if (matched.length) {
      if (this.update)
        if (this.CurrentUser.Email == this.selectedItem.Email)
          return false;
      this.msgBoxServ.showMessage("Failed", ["Email Id already exists"]);
      return true;
    }
  }
  FilterEmployeeList() {
    this.filteredEmpList = this.empList
    this.userList.forEach(user => {
      this.filteredEmpList = this.filteredEmpList.filter(emp => (emp.EmployeeId != user.EmployeeId));
    });

  }
  GetEmail(empId) {
    this.filteredEmpList.forEach(emp => {
      if (emp.EmployeeId == empId)
        this.CurrentUser.Email = emp.Email;
    });
  }

  logError(err: any) {
    console.log(err);
  }

  Close() {
    this.selEmployee = null;
    this.selectedItem = null;
    this.update = false;
    this.showAddPage = false;
    this.callbackAdd.emit({  });
  }
  public AssignSelectedEmployee() {
    try {
      if (this.selEmployee.EmployeeId) {
        if ((this.selEmployee.EmployeeId != 0) && (this.selEmployee.EmployeeId != null)) {
          this.CurrentUser.EmployeeId = this.selEmployee.EmployeeId;
          this.user.UserName = this.selEmployee.UserName;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  EmployeeListFormatter(data: any): string {
    return data["FullName"];
  }

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
   GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event){
    if(event.keyCode == 27){ // For ESCAPE_KEY =>close pop up
      this.Close(); 
    }
  }

}
