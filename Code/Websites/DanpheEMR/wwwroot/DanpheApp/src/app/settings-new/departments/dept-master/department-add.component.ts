
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { BillItemPriceModel } from "../../shared/bill-item-price.model";
import * as _ from 'lodash';
import { DanpheHTTPResponse } from "../../../shared/common-models";
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
  selector: "department-add",
  templateUrl: "./department-add.html"

})

export class DepartmentAddComponent {


  public opdServicesDetails: Array<OpdItemDetailVM> = [];

  public allItemsList: Array<BillItemPriceModel> = new Array<BillItemPriceModel>();
  public checkAptApplicable: boolean = true;

  public OpdServicesInfoParam = {
    //DoctorOpdEnabled: false,//This is Mandatory so it's not added in param table.
    DoctorFollowupEnabled: true,
    DoctorOldPatOpdEnabled: true,

    DepartmentOpdEnabled: false,
    DepartmentFollowupEnabled: false,
    DepartmentOldPatOpdEnabled: false
  };


  public showAddPage: boolean = false;
  @Input("selectedDepartment")
  public selectedDepartment: Department;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public CurrentDepartment: Department;

  public completeDeptList: Array<Department> = new Array<Department>();
  public deptList: Array<Department> = new Array<Department>();

  //public IsZeroPriceAllowed: boolean = false;//pratik:16March'21 -as per LPH requirement

  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.GetDepartments();
    this.LoadAllOPDServicesItems();

    this.InitializeServices_TEMP();

  }

  ngOnInit() {
    this.setFocusById('DepartmentCode');
    if (this.selectedDepartment) {
      this.update = true;
      this.CurrentDepartment = new Department;
      this.CurrentDepartment = Object.assign(this.CurrentDepartment, this.selectedDepartment);
      this.CurrentDepartment.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      if (this.CurrentDepartment.ServiceItemsList && this.CurrentDepartment.ServiceItemsList.length > 0) {
        this.CurrentDepartment.IsZeroPriceAllowed = this.CurrentDepartment.ServiceItemsList.some(a => a.IsZeroPriceAllowed == true) ? true : false;
      }
      this.deptList = this.deptList.filter(dept => (dept.DepartmentId != this.selectedDepartment.DepartmentId));

      //in edit mode get all details and assign it
      this.LoadExistingBillItemsDetails(this.CurrentDepartment.DepartmentId);
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
  }

  public GetDepartments() {
    this.settingsBLService.GetDepartments()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.deptList = res.Results;
            CommonFunctions.SortArrayOfObjects(this.deptList, "DepartmentName");//this sorts the departmentlist by DepartmentName.
            this.deptList.forEach(dept => {
              //needs review to get parent department name
              this.deptList.forEach(parDept => {
                if (dept.ParentDepartmentId == parDept.DepartmentId)
                  dept.ParentDepartmentName = parDept.DepartmentName;
              });
            });
            this.completeDeptList = this.deptList;
          }
        }
        else {
          this.showMessageBox("error", "Check log for error message.");
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.showMessageBox("error", "Failed to get wards. Check log for error message.");
          this.logError(err.ErrorMessage);
        });
  }

  //adding new department
  AddDepartment() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentDepartment.DepartmentValidator.controls) {
      this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
      this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentDepartment.IsValidCheck(undefined, undefined)) {

      this.AssignServiceItemsToDeptObject();

      this.settingsBLService.AddDepartment(this.CurrentDepartment)
        .subscribe(
          res => {
            this.showMessageBox("success", "Department Added");
            this.CurrentDepartment = new Department();
            this.CallBackAddDepartment(res)
          },
          err => {
            this.logError(err);
          });
    }
  }
  //adding new department
  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentDepartment.DepartmentValidator.controls) {
      this.CurrentDepartment.DepartmentValidator.controls[i].markAsDirty();
      this.CurrentDepartment.DepartmentValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentDepartment.IsValidCheck(undefined, undefined)) {

      let valSummary = this.GetValidationSummary_OpdServices();
      if (!valSummary.IsValid) {
        this.msgBoxServ.showMessage("error", valSummary.ErrorMessage);
        return;
      }

      this.AssignServiceItemsToDeptObject();

      this.settingsBLService.UpdateDepartment(this.CurrentDepartment)
        .subscribe(
          res => {
            if (res.Status == "OK" && res.Results) {
              let dept = this.coreService.Masters.Departments.find(dept => dept.DepartmentId == res.Results.DepartmentId);
              if (dept) {
                dept = Object.assign(dept, res.Results)
              }
              this.showMessageBox("success", "Department Updated");
              this.CurrentDepartment = new Department();
              this.CallBackAddDepartment(res)
            }
          },
          err => {
            this.logError(err);
          });
    }
  }


  GetValidationSummary_OpdServices() {
    let validationSummary = { IsValid: true, ErrorMessage: [] };

    if (!this.selectedDepartment.IsAppointmentApplicable) {
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



  Close() {
    this.selectedDepartment = null;
    this.update = false;
    this.deptList = this.completeDeptList;
    this.showAddPage = false;

    this.callbackAdd.emit({ action: "close" });
  }

  //after adding department is succesfully added  then this function is called.
  CallBackAddDepartment(res) {
    if (res.Status == "OK") {
      for (let dept of this.completeDeptList) {
        if (dept.DepartmentId == res.Results.ParentDepartmentId) {
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


      //res.Results.ParentDepartmentName =

    }
    else {
      this.showMessageBox("error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }
  // Automatically capitalized department code when user writes something in that field.
  CapitalizeDeptCode() {

    let depCode = this.CurrentDepartment.DepartmentCode;
    if (depCode) {
      this.CurrentDepartment.DepartmentCode = depCode.toUpperCase();
    }
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
              srv.BillItemPriceList = [];
              if (itmList && itmList.length) {
                srv.ServiceDepartmentId = itmList[0].ServiceDepartmentId;
                srv.BillItemPriceList = itmList;
              }
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


  public onApptApplicable: boolean = false;
  ApptApplicableChkOnChange() {
    if(this.CurrentDepartment.IsAppointmentApplicable != null && this.CurrentDepartment.IsAppointmentApplicable.toString().toLowerCase() == 'true'){
      this.onApptApplicable = true;
    }else{
      this.onApptApplicable = false;
    }
    if (this.onApptApplicable) {
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

  public AssignBillItemOnDDLChange(itemDetailVM: OpdItemDetailVM) {

    let billItem: BillItemPriceModel = new BillItemPriceModel();
    billItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    billItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
    billItem.DiscountApplicable = true;
    billItem.ServiceDepartmentId = itemDetailVM.ServiceDepartmentId;
    billItem.ServiceDepartmentName = itemDetailVM.ServiceDepartmentName;
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

    let currDeptId = this.CurrentDepartment.DepartmentId;
    billItem.ItemId = currDeptId ? currDeptId : 0;
    billItem.ProcedureCode = currDeptId ? currDeptId.toString() : "";

    //once all values are set, we'll assign the whole object to itemDetailVM's BillItem property.
    itemDetailVM.BillItem = billItem;

  }

  //add below variable to parameter. Default values will remain as it is (below).
  public DocOpdServiceDepartNames = { DeptOPD: "Department OPD", DeptFollowUp: "Department Followup Charges", DeptOldPatOpd: "Department OPD Old Patient" };

  InitializeSrvDeptNamesParam() {
   let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "DepartmentOpdServiceDeptNames");
   if (param && param.ParameterValue) {
     this.DocOpdServiceDepartNames = JSON.parse(param.ParameterValue);
   }
  }

  InitializeServices_TEMP() {

    this.InitializeSrvDeptNamesParam();

    this.opdServicesDetails = [];

    let opdServ = new OpdItemDetailVM();
    opdServ.ServiceDisplayName = "OPD (New Patient)";
    opdServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.DeptOPD;
    opdServ.IsServiceEnabled = true;
    opdServ.IsMandatory = true;

    this.opdServicesDetails.push(opdServ);

    let fwupServ = new OpdItemDetailVM();
    fwupServ.ServiceDisplayName = "Followup Charges";
    fwupServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.DeptFollowUp;
    fwupServ.IsServiceEnabled = true;
    this.opdServicesDetails.push(fwupServ);

    let oldPatServ = new OpdItemDetailVM();
    oldPatServ.ServiceDisplayName = "OPD (Old Patient)";
    oldPatServ.ServiceDepartmentName = this.DocOpdServiceDepartNames.DeptOldPatOpd;
    oldPatServ.IsServiceEnabled = true;
    this.opdServicesDetails.push(oldPatServ);

  }

  AssignServiceItemsToDeptObject() {
    if (this.CurrentDepartment.IsAppointmentApplicable) {

      this.CurrentDepartment.ServiceItemsList = [];

      this.opdServicesDetails.forEach(srv => {
        if (srv.BillItem.ItemId != 0) {
          let srvItm: BillItemPriceModel = _.omit(srv.BillItem, ['DepartmentValidator']);
          srvItm.Price = srv.Price;
          srvItm.EHSPrice = srv.EHSPrice;
          srvItm.SAARCCitizenPrice = srv.SAARCCitizenPrice;
          srvItm.ForeignerPrice = srv.ForeignerPrice;
          srvItm.InsForeignerPrice = srv.InsForeignerPrice;
          srvItm.IsZeroPriceAllowed = this.CurrentDepartment.IsZeroPriceAllowed;
          if(srv.IsServiceEnabled){
            srvItm.IsActive=true;
          }
          else{
            srvItm.IsActive=false;
          }
          this.CurrentDepartment.ServiceItemsList.push(srvItm);
        }
      });
    }
    else {
      this.CurrentDepartment.ServiceItemsList = [];
    }

  }


  public ServiceSelectChange(currentItmDetail: OpdItemDetailVM) {
    // currentItmDetail.Price = 0;
    // currentItmDetail.EHSPrice = 0;
    // currentItmDetail.SAARCCitizenPrice = 0;
    // currentItmDetail.ForeignerPrice = 0;
    // currentItmDetail.InsForeignerPrice = 0;
    // currentItmDetail.ItemObj = "";
    // currentItmDetail.isNormalPriceValid = true;
    // currentItmDetail.isItemNameValid = false;
  }


  //Method for get all details of BilItemPrice for Update with employee information
  //get details by EmpId and service dept name 
  //from server take service dept id by this name
  //here employeeId as itemId in db for bilItemPrice
  LoadExistingBillItemsDetails(departmentId: number) {
    if (departmentId) {
      this.settingsBLService.GetBilItemPriceDetails_IntegrationName_ItemId("OPD", departmentId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == 'OK') {
            if (res.Results) {
              let allEmpBillItms: Array<BillItemPriceModel> = res.Results;

              this.opdServicesDetails.forEach(srv => {
                let itm = allEmpBillItms.find(b => b.ServiceDepartmentName == srv.ServiceDepartmentName);
                if (itm) {
                  if(itm.IsActive){
                    srv.IsServiceEnabled = true;
                  }
                  else{
                    srv.IsServiceEnabled = false;
                  }                  
                  srv.isItemNameValid = true;
                  this.CurrentDepartment.IsZeroPriceAllowed = itm.IsZeroPriceAllowed;
                  this.CallBack_SetDepartmentServices(srv, itm);
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
  CallBack_SetDepartmentServices(currServiceItem: OpdItemDetailVM, billItmFromServer: BillItemPriceModel) {
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

  setFocusById(targetId: string, waitingTimeinMS: number = 10) {
    if (targetId == 'AddDepartment') {
      if (this.update) {
        targetId = 'UpdateDepartment'
      }
    }
    var timer = window.setTimeout(function () {
      let htmlObject = document.getElementById(targetId);
      if (htmlObject) {
        htmlObject.focus();
      }
      clearTimeout(timer);
    }, waitingTimeinMS);
  }
}
