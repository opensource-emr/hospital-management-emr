import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { Employee } from "../../../employee/shared/employee.model";
import { Department } from '../../shared/department.model';
import { EmployeeRole } from "../../../employee/shared/employee-role.model";
import { EmployeeType } from "../../../employee/shared/employee-type.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillItemPriceModel } from "../../shared/bill-item-price.model";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CoreService } from "../../../core/shared/core.service";
import { Console } from "@angular/core/src/console";
import { CommonFunctions } from "../../../shared/common.functions";


export class OpdItemDetailVM {



  public ItemObj: any = null;//it could be string (at the time of assignment) or object (when choosed from dropdown)
  public Price: number = 0;
  public EHSPrice: number = 0;
  public SAARCCitizenPrice: number = 0;
  public ForeignerPrice: number = 0;
  public InsForeignerPrice: number = 0;
  public isNormalPriceValid: boolean = true;
  public isItemNameValid: boolean = true;

  public ServiceDepartmentId: number = 0;//this will be assigned once the items are loaded.

  public BillItem: BillItemPriceModel = new BillItemPriceModel();

  //remove below properties if not required. sud: 25-Oct-2019-2PM
  public ServiceDisplayName: string = null;
  public IsServiceEnabled: boolean = true;
  public BillItemPriceList: Array<BillItemPriceModel> = [];
  public ServiceDepartmentName: string = null;//this are hardcoded since that's the name we've set manually.
  public IsMandatory: boolean = false;

}


@Component({
  selector: "employee-add",
  templateUrl: "./employee-add.html",
  host: { '(window:keyup)': 'hotkeys($event)' }

})
export class EmployeeAddComponent {



  public opdServicesDetails: Array<OpdItemDetailVM> = [];


  public allItemsList: Array<BillItemPriceModel> = new Array<BillItemPriceModel>();
  public checkAptApplicable: boolean = true;
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

  public loading: boolean = false;

  public OpdServicesInfoParam = {
    //DoctorOpdEnabled: false,//This is Mandatory so it's not added in param table.
    DoctorFollowupEnabled: true,
    DoctorOldPatOpdEnabled: true,

    DepartmentOpdEnabled: false,
    DepartmentFollowupEnabled: false,
    DepartmentOldPatOpdEnabled: false
  };


  ApptApplicableChkOnChange() {
    if (this.CurrentEmployee.IsAppointmentApplicable) {
      this.opdServicesDetails.forEach(srv => {
        ////OPD is mandatory, so it may have different settings than other.
        srv.IsServiceEnabled = srv.IsMandatory;
        if (srv.IsMandatory) {
          if (!srv.ItemObj) {
            srv.isItemNameValid = false;
          }
        }
      });
    }

  }




  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public coreService: CoreService) {

    //this.InitializeSrvDeptNamesParam();
    this.InitializeServices_TEMP();


    this.LoadAllOPDServicesItems();
    this.GetEmpRoleList();
    this.GetEmpTypeList();
    this.GetDepartmentList();
  }


  ngOnInit() {
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
      this.LoadExistingBillItemsDetails(this.CurrentEmployee.EmployeeId);
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

  public GetEmpRoleList() {
    this.settingsBLService.GetEmployeeRoleList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.empRoleList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.empRoleList, "EmployeeRoleName");//this sorts the empRoleList by EmployeeRoleName.
            //console.log(this.empRoleList);
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
            CommonFunctions.SortArrayOfObjects(this.deptList, "DepartmentName");//this sorts the departmentlist by DepartmentName.
            //console.log(this.deptList);

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

  //public sortDeptArray(arr) {
  //  arr.sort((n1, n2) => {
  //    if (n1.DepartmentName > n2.DepartmentName) {
  //      return 1;
  //    }

  //    if (n1.DepartmentName < n2.DepartmentName) {
  //      return -1;
  //    }

  //    return 0;
  //  });
  //}


  //to show/hide lab signature acc to selected department.
  //Note: The name of lab-department in MST_Department table should always be 'Lab' else it won't work
  DepartmentOnChange() {

    if (!this.deptList || this.deptList.length == 0) {
      return;
    }
    let currDeptId = this.CurrentEmployee.DepartmentId;

    let currDept = this.deptList.find(dept => dept.DepartmentId == currDeptId);
    if (currDept) {
      if (currDept.DepartmentName.toLowerCase() == "lab" || currDept.DepartmentName.toLowerCase() == "pathology" || currDept.DepartmentName.toLowerCase() == "laboratory") {
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

      this.ApptApplicableChkOnChange();
    }
  }

  //this is common function to check whether normal price is valid or not for current row.
  //Zero is accepted price for Normal as well as other.
  CheckIfNormalPriceValid(currItm: OpdItemDetailVM) {
    if (currItm.Price != null && currItm.Price != undefined) {
      currItm.isNormalPriceValid = true;
    }
    else {
      currItm.isNormalPriceValid = false;
    }

  }

  //pratik: 12sep-2019
  TrimEmpNamesAndAssignFullName() {
    //removing extra spaces typed by the users
    this.CurrentEmployee.FirstName = this.CurrentEmployee.FirstName.trim();
    this.CurrentEmployee.MiddleName = this.CurrentEmployee.MiddleName ? this.CurrentEmployee.MiddleName.trim() : null;
    this.CurrentEmployee.LastName = this.CurrentEmployee.LastName.trim();


    //re-assign FullName value of employee here. This doesn't need validation so we can do it after validation succeded.
    let empFullName = (this.CurrentEmployee.Salutation ? this.CurrentEmployee.Salutation + ". " : "");
    empFullName += this.CurrentEmployee.FirstName;
    empFullName += this.CurrentEmployee.MiddleName ? " " + this.CurrentEmployee.MiddleName : "";
    empFullName += " " + this.CurrentEmployee.LastName;

    this.CurrentEmployee.FullName = empFullName.trim();
  }


  AddEmployee() {
    this.loading = true;
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
      this.FocusElementById('Salutation');
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined)) {

      this.TrimEmpNamesAndAssignFullName();

      this.AssignServiceItemsToEmpObject();

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
              this.loading = false;
              this.FocusElementById('Salutation');
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
            this.loading = false;
            this.FocusElementById('Salutation');
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please check all mandatory fields."]);
      this.loading = false;
      this.FocusElementById('Salutation');
    }
  }

  UpdateEmployee() {
    this.loading = true;
    for (var i in this.CurrentEmployee.EmployeeValidator.controls) {
      this.CurrentEmployee.EmployeeValidator.controls[i].markAsDirty();
      this.CurrentEmployee.EmployeeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployee.IsValidCheck(undefined, undefined)) {

      let valSummary = this.GetValidationSummary_OpdServices();
      if (!valSummary.IsValid) {
        this.msgBoxServ.showMessage("error", valSummary.ErrorMessage);
        return;
      }

      this.TrimEmpNamesAndAssignFullName();
      this.AssignServiceItemsToEmpObject();

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
              this.loading = false;
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
            this.loading = false;

          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please check all mandatory fields."]);
      this.loading = false;
    }
  }

  GetValidationSummary_OpdServices() {
    let validationSummary = { IsValid: true, ErrorMessage: [] };

    if (!this.CurrentEmployee.IsAppointmentApplicable) {
      return validationSummary;
    }

    this.opdServicesDetails.forEach(srv => {
      if (srv.IsServiceEnabled) {
        if (!srv.isNormalPriceValid || !srv.isItemNameValid) {
          validationSummary.IsValid = false;
          validationSummary.ErrorMessage.push(srv.ServiceDisplayName + " is invalid.");
        }
      }

    });

    return validationSummary;
  }


  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      var employee: Employee = new Employee();

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

      let empRole = this.empRoleList.find(e => e.EmployeeRoleId == res.Results.EmployeeRoleId);
      employee.EmployeeRoleName = empRole ? empRole.EmployeeRoleName : null;

      let empType = this.empTypeList.find(e => e.EmployeeTypeId == res.Results.EmployeeTypeId);
      employee.EmployeeTypeName = empType ? empType.EmployeeTypeName : null;

      let empDept = this.deptList.find(e => e.DepartmentId == res.Results.DepartmentId);
      employee.DepartmentName = empDept ? empDept.DepartmentName : null;


      this.callbackAdd.emit({ action: "add", employee: employee });

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

    this.callbackAdd.emit({ action: "close" });

  }
  //initialization of value after BilItemPrice details save
  CloseBilItemPrice() {
    //for bilItem price configuration initial value assigning after close button
    //this.opdServicesDetails = [];
    //this.serviceList.OPD = false;
    //this.opdItemDetails.OPD.ItemObj = this.opdItemDetails.Followup.ItemObj = this.opdItemDetails.OldPatientOpd.ItemObj = null;
    this.checkAptApplicable = true;
    // this.IsAddBilItemPrice = false;

  }
  //used to format display of item in ng-autocomplete.
  myItemListFormatter(data: any): string {
    let html = data["ItemNamePrice"];
    return html;
  }


  public ItemSelectionChanged(currServiceItm: OpdItemDetailVM) {
    //by default assign all prices to zero on item change.
    currServiceItm.Price = 0;
    currServiceItm.EHSPrice = 0;
    currServiceItm.SAARCCitizenPrice = 0;
    currServiceItm.ForeignerPrice = 0;
    currServiceItm.InsForeignerPrice = 0;

    if (currServiceItm.ItemObj && (typeof (currServiceItm.ItemObj) == 'object')) {
      currServiceItm.Price = currServiceItm.ItemObj.Price ? currServiceItm.ItemObj.Price : 0;//assign zero price if null or undefined.
      currServiceItm.EHSPrice = currServiceItm.ItemObj.EHSPrice;
      currServiceItm.SAARCCitizenPrice = currServiceItm.ItemObj.SAARCCitizenPrice;
      currServiceItm.ForeignerPrice = currServiceItm.ItemObj.ForeignerPrice;
      currServiceItm.InsForeignerPrice = currServiceItm.ItemObj.InsForeignerPrice;
    }

    currServiceItm.isItemNameValid = (currServiceItm.ItemObj != null && currServiceItm.ItemObj != "" && currServiceItm.ItemObj != undefined);
    currServiceItm.isNormalPriceValid = (currServiceItm.Price != null && currServiceItm.Price != undefined);

    this.AssignBillItemOnDDLChange(currServiceItm);
  }



  //method fires when check or uncheck services checkbox.
  //Set Prices and Items to Zero/Empty when checkbox changes for that respective service.
  public ServiceSelectChange(currentItmDetail: OpdItemDetailVM) {
    currentItmDetail.Price = 0;
    currentItmDetail.EHSPrice = 0;
    currentItmDetail.SAARCCitizenPrice = 0;
    currentItmDetail.ForeignerPrice = 0;
    currentItmDetail.InsForeignerPrice = 0;
    currentItmDetail.ItemObj = "";
    currentItmDetail.isNormalPriceValid = true;
    currentItmDetail.isItemNameValid = false;
  }

  public LoadAllOPDServicesItems() {
    //we are passing OPD as service department for get Items of OPD i.e. OPD ticket and OPD dental
    this.settingsBLService.GetDisBilItemPriceCFGByIntegrationName("OPD")
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.allItemsList = res.Results;

            this.opdServicesDetails.forEach(srv => {
              let itmList = this.allItemsList.filter(a => a.ServiceDepartmentName == srv.ServiceDepartmentName);
              srv.ServiceDepartmentId = itmList ? itmList[0].ServiceDepartmentId : 0;
              srv.BillItemPriceList = itmList;
              srv.IsServiceEnabled = itmList && itmList.length > 0;
            });

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


  AssignServiceItemsToEmpObject() {
    if (this.CurrentEmployee.IsAppointmentApplicable) {
      this.CurrentEmployee.ServiceItemsList = [];

      this.opdServicesDetails.forEach(srv => {
        if (srv.IsServiceEnabled) {
          let srvItm: BillItemPriceModel = _.omit(srv.BillItem, ['BillingItemValidator']);
          srvItm.Price = srv.Price;
          srvItm.EHSPrice = srv.EHSPrice;
          srvItm.SAARCCitizenPrice = srv.SAARCCitizenPrice;
          srvItm.ForeignerPrice = srv.ForeignerPrice;
          srvItm.InsForeignerPrice = srv.InsForeignerPrice;

          if (this.CurrentEmployee.IsIncentiveApplicable) {
            srvItm.IsFractionApplicable = true;
          }
          else {
            srvItm.IsFractionApplicable = false;
          }

          this.CurrentEmployee.ServiceItemsList.push(srvItm);
        }
      });

    }
    else {
      this.CurrentEmployee.ServiceItemsList = null;
    }

  }




  public AssignBillItemOnDDLChange(itemDetailVM: OpdItemDetailVM) {

    let billItem: BillItemPriceModel = new BillItemPriceModel();
    billItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    billItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
    billItem.DiscountApplicable = true;
    billItem.ServiceDepartmentId = itemDetailVM.ServiceDepartmentId;
    //when itemObj is not object it's a string, so we can assign it to ItemName
    billItem.ItemName = (itemDetailVM.ItemObj && typeof (itemDetailVM.ItemObj) == 'object') ? itemDetailVM.ItemObj.ItemName : itemDetailVM.ItemObj;
    billItem.Price = itemDetailVM.Price;
    billItem.EHSPrice = itemDetailVM.EHSPrice;
    billItem.SAARCCitizenPrice = itemDetailVM.SAARCCitizenPrice;
    billItem.ForeignerPrice = itemDetailVM.ForeignerPrice;
    billItem.InsForeignerPrice = itemDetailVM.InsForeignerPrice;

    billItem.IsEHSPriceApplicable = billItem.EHSPrice > 0;
    billItem.IsEHSPriceApplicable = billItem.SAARCCitizenPrice > 0;
    billItem.IsForeignerPriceApplicable = billItem.ForeignerPrice > 0;
    billItem.IsInsForeignerPriceApplicable = billItem.InsForeignerPrice > 0;

    let currEmpId = this.CurrentEmployee.EmployeeId;
    billItem.ItemId = currEmpId ? currEmpId : 0;
    billItem.ProcedureCode = currEmpId ? currEmpId.toString() : "";

    //once all values are set, we'll assign the whole object to itemDetailVM's BillItem property.
    itemDetailVM.BillItem = billItem;

  }


  //Method for get all details of BilItemPrice for Update with employee information
  //get details by EmpId and service dept name 
  //from server take service dept id by this name
  //here employeeId as itemId in db for bilItemPrice
  LoadExistingBillItemsDetails(employeeId: number) {
    if (employeeId) {
      this.settingsBLService.GetBilItemPriceDetails_IntegrationName_ItemId("OPD", employeeId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == 'OK') {
            if (res.Results) {
              let allEmpBillItms: Array<BillItemPriceModel> = res.Results;

              this.opdServicesDetails.forEach(srv => {
                let itm = allEmpBillItms.find(b => b.ServiceDepartmentName == srv.ServiceDepartmentName);
                if (itm) {
                  srv.IsServiceEnabled = true;
                  srv.isItemNameValid = true;
                  this.CallBack_SetEmployeeServices(srv, itm);
                }
                else {
                  srv.IsServiceEnabled = false;
                }
              });
            }
            else {
              this.opdServicesDetails.forEach(srv => {
                srv.IsServiceEnabled = false;
              });
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


  //call back of above function if data is there
  CallBack_SetEmployeeServices(currServiceItem: OpdItemDetailVM, billItmFromServer: BillItemPriceModel) {
    currServiceItem.BillItem = Object.assign(new BillItemPriceModel(), billItmFromServer);
    currServiceItem.BillItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    currServiceItem.BillItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    currServiceItem.Price = billItmFromServer.Price;
    currServiceItem.EHSPrice = billItmFromServer.EHSPrice;
    currServiceItem.SAARCCitizenPrice = billItmFromServer.SAARCCitizenPrice;
    currServiceItem.ForeignerPrice = billItmFromServer.ForeignerPrice;
    currServiceItem.InsForeignerPrice = billItmFromServer.InsForeignerPrice;
    currServiceItem.ItemObj = billItmFromServer.ItemName;

  }

  //add below variable to parameter. Default values will remain as it is (below).
  public DocOpdServiceDepartNames = { OPD: "OPD", FollowUp: "Doctor Followup Charges", OldPatOpd: "Doctor OPD Old Patient" };

  InitializeSrvDeptNamesParam() {
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "DocOpdServiceDeptNames");
    if (param && param.ParameterValue) {
      this.DocOpdServiceDepartNames = JSON.parse(param.ParameterValue);
    }
  }


  InitializeServices_TEMP() {

    this.InitializeSrvDeptNamesParam();

    this.opdServicesDetails = [];

    let opdServ = new OpdItemDetailVM();
    opdServ.ServiceDisplayName = "OPD (New Patient)";
    opdServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.OPD;
    opdServ.IsServiceEnabled = true;
    opdServ.IsMandatory = true;

    this.opdServicesDetails.push(opdServ);

    let fwupServ = new OpdItemDetailVM();
    fwupServ.ServiceDisplayName = "Followup Charges";
    fwupServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.FollowUp;
    fwupServ.IsServiceEnabled = true;
    this.opdServicesDetails.push(fwupServ);

    let oldPatServ = new OpdItemDetailVM();
    oldPatServ.ServiceDisplayName = "OPD (Old Patient)";
    oldPatServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.OldPatOpd;
    oldPatServ.IsServiceEnabled = true;
    this.opdServicesDetails.push(oldPatServ);

  }


  //Start: Employee Digital Signature Section
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
  //End: Employee Digital Signature Section

  FocusElementById(id: string) {
    this.openPhotoCropper=false;
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 10);
  }
  hotkeys(event){
    if(event.keyCode==27){
        this.Close()
    }
}
}
