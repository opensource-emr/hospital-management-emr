import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { BillItemPriceModel } from '../../shared/bill-item-price.model';
import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { ImagingType } from "../../../radiology/shared/imaging-type.model";
import { ImagingItem } from "../../../radiology/shared/imaging-item.model";
import { LabTest } from "../../../labs/shared/lab-test.model";
import { CoreService } from "../../../core/shared/core.service";
import { LabComponentModel } from "../../../labs/shared/lab-component-json.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { BillItemPrice } from "../../../billing/shared/billitem-price.model";
import { SettingsService } from "../../shared/settings-service";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { forEach } from "@angular/router/src/utils/collection";

@Component({
  selector: "billingItem-add",
  templateUrl: "./billing-item-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})
export class BillingItemAddComponent {
  //declare boolean loading variable for disable the double click event of button
  public loading: boolean = false;
  public CurrentBillingItem: BillItemPriceModel = new BillItemPriceModel();
  //public ImagingItem: ImagingItem = new ImagingItem();
  //public LabItem: LabTest = new LabTest();

  public Category: Array<string> = new Array<string>();
  public showAddServiceDepartmentPopUp: boolean = false;


  @Input("selectedItem")
  public selectedItem: BillItemPriceModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  @Input("billingItemList")
  public billingItemList: Array<BillItemPriceModel>;
  public update: boolean = false;
  public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public imgTypeList: Array<ImagingType> = new Array<ImagingType>();
  //public labTestGroupList: Array<LabTestGroup> = new Array<LabTestGroup>();

  public allEmployeeList: Array<any> = [];
  public docterList: Array<any> = [];
  public defaultDoctorList: string;
  public PreSelectedDoctors: Array<any> = [];
  public maxItemCode: Array<any> = [];

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService, public settingsService: SettingsService) {
    this.GetSrvDeptList();
    this.GetImagingTypeList();
    //this.GetLabTestGroupList();
    this.AutomaticPriceCalculationRatio();

    this.allEmployeeList = DanpheCache.GetData(MasterType.Employee, null);
    this.docterList = this.allEmployeeList.filter(a => a.IsAppointmentApplicable == true);
    this.GoToNextInput("ServiceDepartmentName");
  }

  ngOnInit() {

    this.loading = false;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentBillingItem = Object.assign(this.CurrentBillingItem, this.selectedItem);

      if (this.CurrentBillingItem.DefaultDoctorList && this.CurrentBillingItem.DefaultDoctorList.length) {
        this.AssignPreSelectedDocter();
      }
      
      this.selectedSrvDept = this.CurrentBillingItem.ServiceDepartmentName;//this will set value to srv-dept autocomplete.
      this.CurrentBillingItem.EnableControl("ServiceDepartmentId", false);//this will disable changing service departmentid.
      this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.ConditionalValidationGovtPrice(); //to show validation for Government Insurance Price while updating 
    }
    else {
      this.CurrentBillingItem = new BillItemPriceModel();
      this.selectedSrvDept = null;
      this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
      this.billingItemList.forEach(a => {
        this.maxItemCode.push(+a.ItemCode);
      });
      this.CurrentBillingItem.ItemCode = (Math.max(...this.maxItemCode)+1).toString();
      this.update = false;
    }
  }


  public GetSrvDeptList() {
    try {
      this.settingsBLService.GetServiceDepartments()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.srvdeptList = res.Results;
              //this.srvdeptList = this.srvdeptList.filter(t => t.DepartmentName == this.selectedDepName);
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
      this.ShowCatchErrMessage(exception);
    }

  }
  //get all imaging type
  GetImagingTypeList() {
    try {
      this.settingsBLService.GetImgTypes()
        .subscribe(res => {
          if (res.Status == 'OK') {
            if (res.Results.length) {
              this.imgTypeList = res.Results;
            }
            else {
              this.showMessageBox("failed", "Check log for error message.");
              this.logError(res.ErrorMessage);
            }
          }
        },
          err => {
            this.showMessageBox("Failed to get wards", "Check log for error message.");
            this.logError(err.ErrorMessage);
          });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //GetLabTestGroupList() {
  //    try {
  //        this.settingsBLService.GetLabTestGroupList()
  //            .subscribe(res => {
  //                if (res.Status == 'OK') {
  //                    if (res.Results.length) {
  //                        this.labTestGroupList = res.Results;
  //                    }
  //                    else {
  //                        this.showMessageBox("Failed", "Check log for error message.");
  //                        this.logError(res.ErrorMessage);
  //                    }
  //                }
  //            },
  //            err => {
  //                this.showMessageBox("Failed to get wards", "Check log for error message.");
  //                this.logError(err.ErrorMessage);
  //            });
  //    } catch (exception) {
  //        this.ShowCatchErrMessage(exception);
  //    }
  //}

  //it is the centralized function to check validations.
  CheckValidations(): boolean {
    let isValid: boolean = true;


    for (var i in this.CurrentBillingItem.BillingItemValidator.controls) {
      this.CurrentBillingItem.BillingItemValidator.controls[i].markAsDirty();
      this.CurrentBillingItem.BillingItemValidator.controls[i].updateValueAndValidity();
    }
    isValid = this.CurrentBillingItem.IsValidCheck(undefined, undefined);

    //finally check the validation of Servicedepartmentid as well.
    isValid = isValid && this.isSrvDeptValid;

    return isValid;
  }

  Add() {
    if (this.CheckValidations() && !this.loading) {
      this.loading = true;

      //NBB- commented because now we are taking ItemId after adding Item to Radiology/Lab and get response and add ItemId                
      //this.CurrentBillingItem.ItemId = this.GetItemId(this.CurrentBillingItem.ServiceDepartmentId);
      //this.SetTax();
      //First Add Item to Lab or Radiology/Imaging then get it back and add to BillingItem
      //first need to get department name Radiology or Lab
      let integrationName = this.srvdeptList.find(dep => dep.ServiceDepartmentId == this.CurrentBillingItem.ServiceDepartmentId).IntegrationName;
      this.CurrentBillingItem.ServiceDepartmentName = this.srvdeptList.find(dep => dep.ServiceDepartmentId == this.CurrentBillingItem.ServiceDepartmentId).ServiceDepartmentName;

      this.CurrentBillingItem.DefaultDoctorList = this.defaultDoctorList ? this.defaultDoctorList : null;

      if (integrationName && integrationName.toLowerCase() == "lab") {
        //map and make lab Model object
        let labTestItem = this.settingsService.MAP_GetLabTestFromBillItem(this.CurrentBillingItem);

        //this.GetLabModelWithData(this.CurrentBillingItem);
        //add item to lab first then billing
        labTestItem.ReportTemplateId = 6;
        labTestItem.LabTestCategoryId = 7;
        this.settingsBLService.AddLabItem(labTestItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status == 'OK') {
                this.CallBackDepartmentItemAdd(res.Results, "Lab");
                this.loading = false;

              }
              else {
                this.showMessageBox("error", "Check log for details");
                console.log(res.ErrorMessage);
                this.loading = false;
              }
            },
            err => {
              this.logError(err);
              this.loading = false;
            });
      }
      else if (integrationName && integrationName.toLowerCase() == "radiology") {
        //map and make radiology Model object
        let imgTypeId = this.imgTypeList.find(imgitm => imgitm.ImagingTypeName.toUpperCase() == this.CurrentBillingItem.ServiceDepartmentName.toUpperCase()).ImagingTypeId;
        let imagingItem = this.settingsService.MAP_GetRadiologyItemFromBillItem(this.CurrentBillingItem, imgTypeId);

        //add item to radiology/imaging first then billing
        this.settingsBLService.AddImagingItem(imagingItem)
          .subscribe(
            res => {
              if (res.Status == 'OK') {
                this.loading = false;
                this.CallBackDepartmentItemAdd(res.Results, "Radiology");
              }
              else {
                this.loading = false;
                this.showMessageBox("error", "Check log for details");
                console.log(res.ErrorMessage);
              }
            },
            err => {
              this.loading = false;
              this.logError(err);
            });

      }
      //doubtfull ItemId and ProcedureCode for all other Item 
      else if (integrationName && integrationName.toLowerCase() == "bed charges") {

        let bedFeatureItem = this.settingsService.MAP_GetBedFeatureFromBillItem(this.CurrentBillingItem);

        ///this.settingsBLService.AddBedFeature
        //note: We're using BedFeature since it handles both billing and ADt part.
        this.settingsBLService.AddBedFeature(bedFeatureItem)
          .subscribe(
            res => {
              if (res.Status == 'OK') {
                this.loading = false;
                //let bilItemPrice = res.Results.BillItemPrice;
                this.CallBackDepartmentItemAdd(res.Results, "BedCharges");
              }
              else {
                this.loading = false;
                this.showMessageBox("error", "Check log for details");
                console.log(res.ErrorMessage);
              }
            },
            err => {
              this.loading = false;
              this.logError(err);
            });
      }

      else {
        //when Item is not in : Radilogy, Lab or BedCharges, then call below function directly, here departmentname will be All
        this.CallBackDepartmentItemAdd(this.CurrentBillingItem, "All");
        this.loading = false;
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields."]);
    }
  }

  public selectedSrvDept: any = null;
  public isSrvDeptValid: boolean = true;
  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  OnSrvDeptValueChanged() {
    let srvDept = null;
    if (!this.selectedSrvDept) {
      this.CurrentBillingItem.ServiceDepartmentId = null;
      this.isSrvDeptValid = false;
    }
    else if (typeof (this.selectedSrvDept) == 'string') {
      srvDept = this.srvdeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedSrvDept.toLowerCase());
    }
    else if (typeof (this.selectedSrvDept) == "object") {
      srvDept = this.selectedSrvDept;
    }

    if (srvDept) {
      this.CurrentBillingItem.ServiceDepartmentId = srvDept.ServiceDepartmentId;
      this.isSrvDeptValid = true;
    }
    else {
      this.CurrentBillingItem.ServiceDepartmentId = null;
      this.isSrvDeptValid = false;
    }


    //if (this.DiscountScheme == "") {
    //  this.DiscountPercentSchemeValid = false;
    //  return;
    //}
    //if (this.DiscountScheme) {
    //  if (typeof (this.DiscountScheme) == 'string') {
    //    discSchemeType = this.MembershipTypeList.find(a => a.MembershipTypeName == this.DiscountScheme);
    //  }
    //  else if (typeof (this.DiscountScheme) == 'object') {
    //    discSchemeType = this.DiscountScheme;
    //  }
    //  if (discSchemeType) {
    //    this.DiscountPercentSchemeValid = true;
    //    this.currMemDiscountPercent = discSchemeType.DiscountPercent;

    //    //sud:29Aug'19-we've to set remarks as that of discount percent
    //    if (this.currMemDiscountPercent && this.currMemDiscountPercent != 0) {
    //      this.model.Remarks = discSchemeType.MembershipTypeName;
    //    }
    //    else {
    //      this.model.Remarks = null;
    //    }

    //  } else {
    //    this.model.Remarks = null;//sud:29Aug'19-we've to set remarks as that of discount percent
    //    this.DiscountPercentSchemeValid = false;
    //    return;
    //  }
    //}


    //if (this.selectedSrvDept) {
    //  this.CurrentBillingItem.ServiceDepartmentId = this.selectedSrvDept.ServiceDepartmentId;
    //}

    //this.GetSrvDeptList();        
    //this.srvdeptList = this.srvdeptList.filter(t => t.DepartmentName == selectedDep);
  }


  Update() {
    if (this.CheckValidations()) {
      if (!this.loading) {
        this.loading = true;
        //this.SetTax();
        let integrationName = this.srvdeptList.find(dep => dep.ServiceDepartmentId == this.CurrentBillingItem.ServiceDepartmentId).IntegrationName;

        this.CurrentBillingItem.DefaultDoctorList = this.defaultDoctorList ? this.defaultDoctorList : null;

        this.settingsBLService.UpdateBillingItem(this.CurrentBillingItem)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status == "OK") {
                this.showMessageBox("success", "Billing Item Details Updated");
                this.CallBackAddUpdate(res.Results);

              }
              else {
                this.showMessageBox("failed", "Failed updating Billing Item, check log for details");
              }


              this.CurrentBillingItem = new BillItemPriceModel();
              this.loading = false;
            },
            err => {
              this.logError(err);
              this.loading = false;
            });

      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields."]);
    }
  }


  //after Add Lab or Radiology call this for add Billing
  CallBackDepartmentItemAdd(result, depName: string) {
    try {
      if (depName == "Lab") {
        this.CurrentBillingItem.ItemId = result.LabTestId;
        this.CurrentBillingItem.ProcedureCode = result.ProcedureCode;
      }
      else if (depName == "Radiology") {
        this.CurrentBillingItem.ItemId = result.ImagingItemId;
        this.CurrentBillingItem.ProcedureCode = result.ImagingItemId;
      }
      else if (depName == "BedCharges") {
        this.CurrentBillingItem.ItemId = result.BedFeatureId;
        this.CurrentBillingItem.ProcedureCode = result.BedFeatureId;
      }

      this.settingsBLService.AddBillingItem(this.CurrentBillingItem)
        .subscribe(
          (res: DanpheHTTPResponse) => {

            if (res.Status == "OK") {

              this.showMessageBox("success", "Billing Item Added");

              this.CallBackAddUpdate(res.Results);
              this.CurrentBillingItem = new BillItemPriceModel();

            }
            else {
              this.showMessageBox("error", "Check log for details");
              console.log(res.ErrorMessage);
            }


          },
          err => {
            this.logError(err);
          });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }


  CallBackAddUpdate(bilItem: BillItemPriceModel) {

    let updatedItem: BillItemPriceModel = bilItem;

    var item: BillItemPriceModel = new BillItemPriceModel();
    item.BillItemPriceId = updatedItem.BillItemPriceId;
    item.ServiceDepartmentId = updatedItem.ServiceDepartmentId;
    item.ItemName = updatedItem.ItemName;
    item.ProcedureCode = updatedItem.ProcedureCode;
    item.Price = updatedItem.Price;
    item.ItemId = updatedItem.ItemId;
    item.TaxApplicable = updatedItem.TaxApplicable;
    item.DiscountApplicable = updatedItem.DiscountApplicable;
    item.Description = updatedItem.Description;
    item.IsActive = updatedItem.IsActive;
    item.CreatedOn = updatedItem.CreatedOn;
    item.CreatedBy = updatedItem.CreatedBy;
    item.DisplaySeq = updatedItem.DisplaySeq;//sud-21Aug'18
    item.IsDoctorMandatory = updatedItem.IsDoctorMandatory;
    item.IsFractionApplicable = updatedItem.IsFractionApplicable;
    item.AllowMultipleQty = updatedItem.AllowMultipleQty;//pratik 18 oct'19
    item.ItemCode = updatedItem.ItemCode;
    item.InsuranceApplicable = updatedItem.InsuranceApplicable;
    item.GovtInsurancePrice = updatedItem.GovtInsurancePrice;

    item.IsNormalPriceApplicable = updatedItem.IsNormalPriceApplicable;
    item.NormalPrice = updatedItem.Price;

    item.IsEHSPriceApplicable = updatedItem.IsEHSPriceApplicable;
    item.EHSPrice = updatedItem.EHSPrice;

    item.IsForeignerPriceApplicable = updatedItem.IsForeignerPriceApplicable;
    item.ForeignerPrice = updatedItem.ForeignerPrice;

    item.IsSAARCPriceApplicable = updatedItem.IsSAARCPriceApplicable;
    item.SAARCCitizenPrice = updatedItem.SAARCCitizenPrice;

    item.IsInsForeignerPriceApplicable = updatedItem.IsInsForeignerPriceApplicable;
    item.InsForeignerPrice = updatedItem.InsForeignerPrice;
    item.IsErLabApplicable = updatedItem.IsErLabApplicable;

    let srvDept = this.srvdeptList.find(a => a.ServiceDepartmentId == updatedItem.ServiceDepartmentId);
    item.ServiceDepartmentName = srvDept ? srvDept.ServiceDepartmentName : "";
    
    this.callbackAdd.emit({ action: this.update ? "update" : "add", item: item });

  }


  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.CurrentBillingItem = new BillItemPriceModel;
    this.selectedItem = null;
    this.callbackAdd.emit({ action: "close", item: null });
    this.update = false;
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }
  //NBB- No need to below function now
  GetItemId(srvId: number): number {
    var srvItems: Array<BillItemPriceModel> = this.billingItemList.filter(a => a.ServiceDepartmentId == srvId).sort(function (a, b) { return Number(a.ItemId) - Number(b.ItemId) });
    return srvItems.length > 0 ? srvItems[srvItems.length - 1].ItemId + 1 : 1;
  }
  //SetTax() {
  //    if (this.CurrentBillingItem.TaxApplicable)
  //        this.CurrentBillingItem.TaxPercent = 5;
  //    else
  //        this.CurrentBillingItem.TaxPercent = 0;
  //}
  //This function only for show catched error messages to console
  ShowCatchErrMessage(exception) {
    try {
      if (exception) {
        let ex: Error = exception;
        console.log("Error Messsage =>  " + ex.message);
        console.log("Stack Details =>   " + ex.stack);
      }
    } catch (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  //conditional validation for insurance applicable and govt insurance price
  ConditionalValidationGovtPrice() {
    if (this.CurrentBillingItem.InsuranceApplicable == true) {
      let onOff = "on";
      let formControlName = "GovtInsurancePrice";
      this.CurrentBillingItem.UpdateValidator(onOff, formControlName);

    }
    else {

      this.CurrentBillingItem.GovtInsurancePrice = 0;
      this.CurrentBillingItem.IsInsurancePackage = false;
      let onOff = 'off';
      let formControlName = "GovtInsurancePrice";
      this.CurrentBillingItem.UpdateValidator(onOff, formControlName);

    }
  }
  onOTClicked() {
    this.CurrentBillingItem.IsProc = false;
    this.CurrentBillingItem.Category = null;
  }
  onProcClick() {
    this.CurrentBillingItem.IsOT = false;
    this.CurrentBillingItem.Category = null;
  }
  //for ServiceDepartment add popup
  AddServiceDepartmentPopUp() {
    this.showAddServiceDepartmentPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddServiceDepartmentPopUp = true;
  }

  OnNewServiceDepartmentAdded($event) {
    if ($event.action == "add") {
      var serviceDepartment = $event.servDepartment;
      this.srvdeptList.push(serviceDepartment);
      this.srvdeptList = this.srvdeptList.slice();

      //Once a servicedepartment is added, assign the value and call its change function.
      //so that it'll be automatically selected.
      this.selectedSrvDept = serviceDepartment.ServiceDepartmentName;
      this.OnSrvDeptValueChanged();

    }

    this.showAddServiceDepartmentPopUp = false;
  }

  public ratioSettings = { AutomaticRatioEnabled: false, EHS: 0, SAARC: 1.5, Foreigner: 2.5, InsForeigner: 4 };

  PriceCategoryChkOnChange(category: string) {
    switch (category) {
      case "EHS": {
        if (this.CurrentBillingItem.IsEHSPriceApplicable && this.ratioSettings.AutomaticRatioEnabled) {
          if (this.ratioSettings.EHS && this.ratioSettings.EHS > 0) {
            this.CurrentBillingItem.EHSPrice = this.ratioSettings.EHS * this.CurrentBillingItem.Price;
          }
        }
        break;
      }
      case "Foreigner": {
        if (this.CurrentBillingItem.IsForeignerPriceApplicable && this.ratioSettings.AutomaticRatioEnabled) {
          if (this.ratioSettings.Foreigner && this.ratioSettings.Foreigner > 0) {
            this.CurrentBillingItem.ForeignerPrice = this.ratioSettings.Foreigner * this.CurrentBillingItem.Price;
          }
        }
        break;
      }
      case "SAARC": {
        if (this.CurrentBillingItem.IsSAARCPriceApplicable && this.ratioSettings.AutomaticRatioEnabled) {
          if (this.ratioSettings.SAARC && this.ratioSettings.SAARC > 0) {
            this.CurrentBillingItem.SAARCCitizenPrice = this.ratioSettings.SAARC * this.CurrentBillingItem.Price;
          }
        }
        break;
      }
      case "InsForeigner": {
        if (this.CurrentBillingItem.IsInsForeignerPriceApplicable && this.ratioSettings.AutomaticRatioEnabled) {
          if (this.ratioSettings.InsForeigner && this.ratioSettings.InsForeigner > 0) {
            this.CurrentBillingItem.InsForeignerPrice = this.ratioSettings.InsForeigner * this.CurrentBillingItem.Price;
          }
        }
        break;
      }
      default: {
        console.log("IsEHSPriceApplicable is false");
        break;
      }
    }
  }

  NormalPriceOnChange() {

    if (this.ratioSettings.AutomaticRatioEnabled) {
      if (this.CurrentBillingItem.IsEHSPriceApplicable && this.ratioSettings.EHS && this.ratioSettings.EHS > 0) {
        this.CurrentBillingItem.EHSPrice = this.ratioSettings.EHS * this.CurrentBillingItem.Price;
      }

      if (this.CurrentBillingItem.IsForeignerPriceApplicable && this.ratioSettings.Foreigner && this.ratioSettings.Foreigner > 0) {
        this.CurrentBillingItem.ForeignerPrice = this.ratioSettings.Foreigner * this.CurrentBillingItem.Price;
      }
      if (this.CurrentBillingItem.IsSAARCPriceApplicable && this.ratioSettings.SAARC && this.ratioSettings.SAARC > 0) {
        this.CurrentBillingItem.SAARCCitizenPrice = this.ratioSettings.SAARC * this.CurrentBillingItem.Price;
      }

      if (this.CurrentBillingItem.IsInsForeignerPriceApplicable && this.ratioSettings.InsForeigner && this.ratioSettings.InsForeigner > 0) {
        this.CurrentBillingItem.InsForeignerPrice = this.ratioSettings.InsForeigner * this.CurrentBillingItem.Price;
      }
    }
  }


  public AutomaticPriceCalculationRatio() {
    //below is the format we're storing this paramter.
    // { AutomaticRatioEnabled: true, EHS: 0, SAARC: 1.5, Foreigner: 2.5, InsForeigner: 4 }
    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "PriceCategoryRatioSettings");
    if (param) {
      let paramJson = JSON.parse(param.ParameterValue);
      this.ratioSettings.AutomaticRatioEnabled = paramJson.AutomaticRatioEnabled;
      this.ratioSettings.EHS = paramJson.EHS;
      this.ratioSettings.SAARC = paramJson.SAARC;
      this.ratioSettings.Foreigner = paramJson.Foreigner;
      this.ratioSettings.InsForeigner = paramJson.InsForeigner;
    }

  }

  public AssignDefaultDocter($event) {
    this.defaultDoctorList;
    let defDocListString = [];
    let selectedDoc = $event;
    selectedDoc.forEach(x => {
      defDocListString.push(x.EmployeeId);
    });

    var DocListString = defDocListString.join(",");
    if (defDocListString) {
      this.defaultDoctorList = "[" + DocListString + "]";
    }

  }

  public AssignPreSelectedDocter() {
    var str = JSON.parse(this.CurrentBillingItem.DefaultDoctorList);
    str.forEach(a => {
      var abd = this.docterList.find(b => b.EmployeeId == a);
      this.PreSelectedDoctors.push(abd);
    });
  }

  public GoToNextInput(id: string) {
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
