import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../security/shared/security.service';
import { Employee } from "../../employee/shared/employee.model";
import { Department } from '../shared/department.model';
import { EmployeeRole } from "../../employee/shared/employee-role.model";
import { EmployeeType } from "../../employee/shared/employee-type.model";
import { SettingsBLService } from '../shared/settings.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingItem } from "../../settings/shared/billing-item.model";
import * as moment from 'moment/moment';
@Component({
  selector: "employee-add",
  templateUrl: "./employee-add.html"

})
export class EmployeeAddComponent {
  public OPDService: boolean = false;
  public Item: any = "";
  public Price: number = null;
  public EHSPrice: number = null;
  public SAARCCitizenPrice: number = null;
  public ForeignerPrice: number = null;

  public itemList: Array<BillingItem> = new Array<BillingItem>();
  public bilItem: BillingItem = new BillingItem();
  public checkAptApplicable: boolean = true;
  public IsAddBilItemPrice: boolean = false;
  public priceRequired: boolean = true;
  public pricePositive: boolean = true;
  public itemRequired: boolean = true;
  public EHSPricePositive: boolean = true;
  public SAARCPricePositive: boolean = true;
  public ForeignerPricePositive: boolean = true;


  public CurrentEmployee: Employee = new Employee();

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: Employee;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
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

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.GetBilPriceConfItemsByServDeptName();
    this.GetEmpRoleList();
    this.GetEmpTypeList();
    this.GetDepartmentList();
  }



  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentEmployee = new Employee();
      this.CurrentEmployee = Object.assign(this.CurrentEmployee, this.selectedItem);

      if (this.selectedItem.DateOfBirth)
        this.CurrentEmployee.DateOfBirth = moment(this.selectedItem.DateOfBirth).format('YYYY-MM-DD');
      if (this.selectedItem.DateOfJoining)
        this.CurrentEmployee.DateOfJoining = moment(this.selectedItem.DateOfJoining).format('YYYY-MM-DD');
      this.CurrentEmployee.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployee.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
      //in edit mode get all details and assign it
      this.GetBilItemPriceDetails(this.CurrentEmployee.EmployeeId, "OPD");
      this.GetSignatoryImage(this.CurrentEmployee.EmployeeId);
    }
    else {
      this.CurrentEmployee = new Employee();
      this.CurrentEmployee.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployee.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.CurrentEmployee.DateOfJoining = moment().format('YYYY-MM-DD');
      this.update = false;
    }
  }

  public GetEmpRoleList() {
    this.settingsBLService.GetEmployeeRoleList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.empRoleList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get EmpRoleList' + res.ErrorMessage]);

        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get EmpRoleList.' + err.ErrorMessage]);
        });
  }
  public GetEmpTypeList() {
    this.settingsBLService.GetEmployeeTypeList(true)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.empTypeList = res.Results;
          }
          //write some else logi if needed here.. 

        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get EmpTypeList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get EmpTypeList.' + err.ErrorMessage]);
        });
  }
  public GetDepartmentList() {
    this.settingsBLService.GetDepartments()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.deptList = res.Results;
            //call department onchange function once departmentlist is loaded. 
            this.DepartmentOnChange();
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get DeptList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get DeptList.' + err.ErrorMessage]);
        });
  }

  //to show/hide lab signature acc to selected department.
  //Note: The name of lab-department in MST_Department table should always be 'Lab' else it won't work
  DepartmentOnChange() {
    let currDeptId = this.CurrentEmployee.DepartmentId;

    let currDept = this.deptList.find(dept => dept.DepartmentId == currDeptId);
    if (currDept) {
      if (currDept.DepartmentName.toLowerCase() == "lab" || currDept.DepartmentName.toLowerCase() == "pathology") {
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

        if (this.CurrentEmployee.IsAppointmentApplicable == null) {
          if (currDept && currDept.IsAppointmentApplicable) {
            this.CurrentEmployee.IsAppointmentApplicable = true;
          } else {
            this.CurrentEmployee.IsAppointmentApplicable = false;
          }
        }
      }
    }


  }

  Add() {
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddEmployee(this.CurrentEmployee)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Employee Added."]);
              this.CallBackAddUpdate(res)
              this.CurrentEmployee = new Employee();
            }
            else {
              this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);

          });
    }
  }

  Update() {
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateEmployee(this.CurrentEmployee)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Employee Details Updated.']);
              this.CallBackAddUpdate(res)
              this.CurrentEmployee = new Employee();
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);

          });
    }
  }


  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var employee: any = {};
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
      employee.Signature = res.Results.Signature;
      employee.LongSignature = res.Results.LongSignature;
      employee.LabSignature = res.Results.LabSignature;
      employee.SignatoryImageName = res.Results.SignatoryImageName;
      employee.DisplaySequence = res.Results.DisplaySequence;

      for (let empRole of this.empRoleList) {
        if (empRole.EmployeeRoleId == res.Results.EmployeeRoleId) {
          employee.EmployeeRoleName = empRole.EmployeeRoleName;
          break;
        }
      };
      for (let etype of this.empTypeList) {
        if (etype.EmployeeTypeId == res.Results.EmployeeTypeId) {
          employee.EmployeeTypeName = etype.EmployeeTypeName;
          break;
        }
      };
      for (let dept of this.deptList) {
        if (dept.DepartmentId == res.Results.DepartmentId) {
          employee.DepartmentName = dept.DepartmentName;
        }
      };
      if (this.OPDService) {//if want to save or update BilItemPrice details true
        if (this.update && !this.IsAddBilItemPrice) {//If this is update for employee and also Update for BilItemPrice
          this.updateBilItem();
        } else if (this.update && this.IsAddBilItemPrice) {//If this is update for employee but New add for BillItemPrice
          this.addBilItem(employee);
        } else {//New add billItemPrice details
          this.addBilItem(employee);
        }
      }

      this.callbackAdd.emit({ employee: employee });

    }
    else {
      this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
    }
  }

  Close() {
    this.CloseBilItemPrice();
    this.selectedItem = null;
    this.update = false;
    this.showAddPage = false;
  }
  //initialization of value after BilItemPrice details save
  CloseBilItemPrice() {
    //for bilItem price configuration initial value assigning after close button
    this.OPDService = false;
    this.Item = "";

    this.Price = null;
    this.EHSPrice = null;
    this.SAARCCitizenPrice = null;
    this.ForeignerPrice = null;

    this.bilItem = new BillingItem();
    this.checkAptApplicable = true;
    this.IsAddBilItemPrice = false;
    this.priceRequired = true;
    this.pricePositive = true;
    this.itemRequired = true;
  }
  //used to format display of item in ng-autocomplete.
  myItemListFormatter(data: any): string {
    let html = data["ItemNamePrice"];
    return html;
  }
  //method fires when Billing Item changed
  public ItemChanged() {
    this.itemRequired = true;
    if (typeof (this.Item) == 'object') {
      this.Price = this.Item.Price;
      this.EHSPrice = this.Item.EHSPrice;
      this.SAARCCitizenPrice = this.Item.SAARCCitizenPrice;
      this.ForeignerPrice = this.Item.ForeignerPrice;
    } else if (this.Item) {
      this.Price = 0;
      this.EHSPrice = 0;
      this.SAARCCitizenPrice = 0
      this.ForeignerPrice = 0
    }
  }
  //method fires when check or uncheck OPD service checkbox
  public OPDServiceSelectChange() {
    this.Price = 0;
    this.EHSPrice = 0;
    this.SAARCCitizenPrice = 0
    this.ForeignerPrice = 0
    this.Item = "";
  }

  public GetBilPriceConfItemsByServDeptName() {
    //we are passing OPD as service department for get Items of OPD i.e. OPD ticket and OPD dental
    this.settingsBLService.GetDisBilItemPriceCFGByServDeptName("OPD")
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.itemList = res.Results;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ['Failed to get OPD Bil Item price details.' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get OPD Bil Item price detail.' + err.ErrorMessage]);
        });
  }
  //First Method for save employee
  SaveEmployee() {
    if (this.OPDService) {
      this.ValidServiceCheck();
    } else {
      (this.update == true) ? this.Update() : this.Add();
    }
  }
  //validation check manually for Billing Item Price
  ValidServiceCheck() {
    if (this.OPDService) {
      this.priceRequired = (this.Price) ? true : false;

      this.pricePositive = (this.Price <= 0) ? false : true;
      this.EHSPricePositive = (this.EHSPrice < 0) ? false : true;
      this.SAARCPricePositive = (this.SAARCCitizenPrice < 0) ? false : true;
      this.ForeignerPricePositive = (this.ForeignerPrice < 0) ? false : true;

      this.itemRequired = (typeof (this.Item) == 'object') ? (this.Item.ItemName) ? true : false : (this.Item) ? true : false;
      if (this.priceRequired && this.pricePositive && this.itemRequired && this.EHSPricePositive && this.SAARCPricePositive && this.ForeignerPricePositive) {
        if (this.CurrentEmployee.DepartmentId) {
          let apptDetails = this.deptList.find(a => a.DepartmentId == this.CurrentEmployee.DepartmentId).IsAppointmentApplicable;
          this.checkAptApplicable = apptDetails;
          if (this.checkAptApplicable) {
            this.AssignValueToBillingItemObj();
          }
        } else {
          this.msgBoxServ.showMessage("notice", ["Please select department"]);
        }
      }
    }
  }

  //this method used for assign and make Billing conf object with value
  public AssignValueToBillingItemObj() {
    this.bilItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.bilItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
    this.bilItem.DiscountApplicable = true;
    this.bilItem.ServiceDepartmentId = this.itemList[0].ServiceDepartmentId;///itemList is only for OPD department for now
    this.bilItem.ItemName = (typeof (this.Item) == 'object') ? this.Item.ItemName : this.Item;

    this.bilItem.Price = this.Price;
    this.bilItem.EHSPrice = this.EHSPrice;
    this.bilItem.SAARCCitizenPrice = this.SAARCCitizenPrice;
    this.bilItem.ForeignerPrice = this.ForeignerPrice;

    if (this.bilItem.EHSPrice > 0) {
      this.bilItem.IsEHSPriceApplicable = true;
    }

    if (this.bilItem.SAARCCitizenPrice > 0) {
      this.bilItem.IsSAARCPriceApplicable = true;
    }

    if (this.bilItem.ForeignerPrice > 0) {
      this.bilItem.IsForeignerPriceApplicable = true;
    }

    if (this.Item && this.update == false) {
      this.Add();
    }
    else if (this.Item) {
      // this.bilItem.ItemName = (typeof (this.Item) == 'object') ? this.Item.ItemName : this.Item;

      // this.bilItem.Price = this.Price;
      // this.bilItem.EHSPrice = this.EHSPrice;
      // this.bilItem.SAARCCitizenPrice = this.SAARCCitizenPrice;
      // this.bilItem.ForeignerPrice = this.ForeignerPrice;

      if (this.IsAddBilItemPrice) {
        // this.bilItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        // this.bilItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        // this.bilItem.DiscountApplicable = true;
        // this.bilItem.ServiceDepartmentId = this.itemList[0].ServiceDepartmentId;///itemList is only for OPD department for now                                
        this.Update();
      }
      else {
        this.Update();
      }
    }
  }

  //Add BillItems when you add new employee
  public addBilItem(employee: Employee) {
    this.bilItem.ItemId = employee.EmployeeId;
    this.bilItem.ProcedureCode = employee.EmployeeId.toString();
    //call to server for Insert billItem price configuration record
    this.settingsBLService.AddBillingItem(this.bilItem)
      .subscribe(
        res => {
          if (res.Status != "OK") {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
        });
  }

  //Update billItems when you edit employee details
  public updateBilItem() {
    this.settingsBLService.UpdateBillingItem(this.bilItem)
      .subscribe(
        res => {
          if (res.Status != "OK") {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
          }
        },
        err => {
          this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);

        });
  }

  //Method for get all details of BilItemPrice for Update with employee information
  //get details by EmpId and service dept name 
  //from server take service dept id by this name
  //here employeeId as itemId in db for bilItemPrice
  GetBilItemPriceDetails(itemId: number, servDeptName: string) {
    if (itemId) {
      this.settingsBLService.GetBilItemPriceDetails(itemId, servDeptName)
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results) {
              this.CallBackGetBilItemPriceDetails(res.Results);
            } else {
              this.OPDService = false;
              this.IsAddBilItemPrice = true;
            }
          }
          else {
            this.msgBoxServ.showMessage("failed", ['Failed to get OPD Bil Item price detail.' + res.ErrorMessage]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ['Failed to get OPD Bil Item price detail.' + err.ErrorMessage]);
          });
    }
  }

  GetSignatoryImage(employeeId: number) {
    this.settingsBLService.GetSignatoryImage(employeeId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results) {
            this.CurrentEmployee.SignatoryImageBase64 = res.Results;
          }
        }
      });
  }

  RemoveSignatoryImage() {
    this.CurrentEmployee.SignatoryImageBase64 = null;
    this.CurrentEmployee.SignatoryImageName = null;
  }


  //call back of above function if data is there
  CallBackGetBilItemPriceDetails(bilItemDetails: BillingItem) {
    this.bilItem = Object.assign(this.bilItem, bilItemDetails);
    this.bilItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.bilItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    this.Price = this.bilItem.Price;
    this.EHSPrice = this.bilItem.EHSPrice;
    this.SAARCCitizenPrice = this.bilItem.SAARCCitizenPrice;
    this.ForeignerPrice = this.bilItem.ForeignerPrice;
    this.Item = this.itemList.find(a => a.ItemName == this.bilItem.ItemName);
    this.OPDService = true;
  }

  OpenCropper() {
    this.openPhotoCropper = true;
  }

  EditPhoto() {
    this.actionType = "edit";
    //this.currImageBase64 = "data:image/jpeg;base64," + this.patientFile.FileBase64String;
    this.openPhotoCropper = true;
  }

  OnCropSuccess($event) {
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
      this.msgBoxServ.showMessage("notification", ['Please select proper file format.'])
    }
  }

  OnCropperClosed($event) {
    this.openPhotoCropper = false;
  }

}
