import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { BillingItem } from '../shared/billing-item.model';
import { ServiceDepartment } from '../shared/service-department.model';
import { SettingsBLService } from '../shared/settings.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';
import { ImagingType } from "../../radiology/shared/imaging-type.model";
import { ImagingItem } from "../../radiology/shared/imaging-item.model";
import { LabTest } from "../../labs/shared/lab-test.model";
//import { LabTestGroup } from "../../labs/shared/lab-testgroup.model";
import { CoreService } from "../../core/shared/core.service";
import { LabComponentModel } from "../../labs/shared/lab-component-json.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
//import { loadavg } from "os";
@Component({
    selector: "billingItem-add",
    templateUrl: "./billingItem-add.html"

})
export class BillingItemAddComponent {
    //declare boolean loading variable for disable the double click event of button
    public loading: boolean = false;
    public CurrentBillingItem: BillingItem = new BillingItem();
    public ImagingItem: ImagingItem = new ImagingItem();
    public LabItem: LabTest = new LabTest();

    public Category: Array<string> = new Array<string>();
    public showAddServiceDepartmentPopUp: boolean = false;

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: BillingItem;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Input("billingItemList")
    public billingItemList: Array<BillingItem>;
    public update: boolean = false;
    public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
    public imgTypeList: Array<ImagingType> = new Array<ImagingType>();
    //public labTestGroupList: Array<LabTestGroup> = new Array<LabTestGroup>();
    constructor(
        public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public coreService: CoreService) {
        this.GetSrvDeptList();
        this.GetImagingTypeList();
        //this.GetLabTestGroupList();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        this.loading = false;
        if (this.selectedItem) {
            this.update = true;
            this.CurrentBillingItem = Object.assign(this.CurrentBillingItem, this.selectedItem);
            //this.CurrentBillingItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            //this.CurrentBillingItem.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
            this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
            this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.ConditionalValidationGovtPrice(); //to show validation for Government Insurance Price while updating 
        }
        else {
            this.CurrentBillingItem = new BillingItem();
            this.CurrentBillingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentBillingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
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
            if (integrationName && integrationName.toLowerCase() == "lab") {
                //map and make lab Model object                
                this.GetLabModelWithData(this.CurrentBillingItem);
                //add item to lab first then billing
                this.settingsBLService.AddLabItem(this.LabItem)
                    .subscribe(
                        res => {
                            if (res.Status == 'OK') {
                                this.CallBackLabRadiologyAdd(res, "Lab");
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
                this.GetRadiologyModelWithData(this.CurrentBillingItem);
                //add item to radiology/imaging first then billing
                this.settingsBLService.AddImagingItem(this.ImagingItem)
                    .subscribe(
                        res => {
                            if (res.Status == 'OK') {
                                this.loading = false;
                                this.CallBackLabRadiologyAdd(res, "Radiology");
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
            else {
                //when Item is not Radiology nor Lab then get Itemid using below fun

                //yubaraj: 28Sep2018
                //this.CurrentBillingItem.ItemId = this.GetItemId(this.CurrentBillingItem.ServiceDepartmentId);
                //this.CurrentBillingItem.ProcedureCode = this.CurrentBillingItem.ItemId.toString();
                this.CallBackLabRadiologyAdd(this.CurrentBillingItem, "All");
                this.loading = false;
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Please fill all mandatory fields."]);
        }
    }


    Update() {
        if (this.CheckValidations()) {
            if (!this.loading) {
                this.loading = true;
                //this.SetTax();
                this.settingsBLService.UpdateBillingItem(this.CurrentBillingItem)
                    .subscribe(
                        res => {
                            this.showMessageBox("success", "Billing Item Details Updated");
                            this.CallBackAddUpdate(res)
                            this.CurrentBillingItem = new BillingItem();
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
    CallBackLabRadiologyAdd(res, depName: string) {
        try {
            if (depName == "Lab") {
                this.CurrentBillingItem.ItemId = res.Results.LabTestId;
                this.CurrentBillingItem.ProcedureCode = res.Results.ProcedureCode;
            } else if (depName == "Radiology") {
                this.CurrentBillingItem.ItemId = res.Results.ImagingItemId;
                this.CurrentBillingItem.ProcedureCode = res.Results.ImagingItemId;
            }
            this.settingsBLService.AddBillingItem(this.CurrentBillingItem)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Billing Item Added");
                        this.CallBackAddUpdate(res)
                        this.CurrentBillingItem = new BillingItem();
                    },
                    err => {
                        this.logError(err);
                    });
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //this function map and make imagin object data
    GetRadiologyModelWithData(billingItem: BillingItem) {
        try {
            if (billingItem) {
                //this.ImagingItem.ImagingItemId
                this.ImagingItem.ImagingItemName = billingItem.ItemName;
                //department name and imaging typep name is  same so we are matchin dept name 
                this.ImagingItem.ImagingTypeId = this.imgTypeList.find(imgitm => imgitm.ImagingTypeName.toUpperCase() == billingItem.ServiceDepartmentName.toUpperCase()).ImagingTypeId;
                this.ImagingItem.IsActive = true;
                this.ImagingItem.ProcedureCode = null;
                this.ImagingItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
                this.ImagingItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    //this function map and make lab object data
    GetLabModelWithData(billingItem: BillingItem) {
        try {
            if (billingItem) {
                this.LabItem.LabSequence = 0;
                this.LabItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                this.LabItem.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
                this.LabItem.IsActive = true;
                this.LabItem.IsValidSampling = true;
                this.LabItem.LabTestCode = null;
                this.LabItem.LabTestComponentsJSON = null;
                //sud: lab-refactoring:23May'18
                //this.LabItem.LabTestGroupId = this.labTestGroupList.find(itm => itm.LabTestGroupName == "MNKGroup").LabTestGroupId;
                this.LabItem.LabTestSpecimen = null;
                this.LabItem.LabTestName = billingItem.ItemName;
                this.LabItem.Description = billingItem.Description;
                //set default values. These will be updated by lab admin later on (NEEDS REVISION)--sud 11April'18
                this.LabItem.LabTestSpecimen = '["Blood"]';
                this.LabItem.LabTestSpecimenSource = "Peripheral Vein";
                //these values will also be updated by lab admin..
                let componentJSON = new LabComponentModel();                
                componentJSON.ComponentName = this.LabItem.LabTestName;
                this.LabItem.LabTestComponentsJSON.push(componentJSON);
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

  CallBackAddUpdate(res: DanpheHTTPResponse) {
    if (res.Status == "OK") {
      let updatedItem: BillingItem = res.Results;

      var item: BillingItem = new BillingItem();
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



            for (let srv of this.srvdeptList) {
                if (srv.ServiceDepartmentId == res.Results.ServiceDepartmentId) {
                    item.ServiceDepartmentName = srv.ServiceDepartmentName;
                    break;
                }
            };

            this.callbackAdd.emit({ item: item });
        }
        else {
            this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }
    logError(err: any) {
        console.log(err);
    }
    Close() {
        this.CurrentBillingItem = new BillingItem;
        this.selectedItem = null;
        this.update = false;
        this.showAddPage = false;
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }
    //NBB- No need to below function now
    GetItemId(srvId: number): number {
        var srvItems: Array<BillingItem> = this.billingItemList.filter(a => a.ServiceDepartmentId == srvId).sort(function (a, b) { return Number(a.ItemId) - Number(b.ItemId) });
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
    onProcClick(){
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
      this.showAddServiceDepartmentPopUp = false;
      var serviceDepartment = $event.servDepartment;
      this.srvdeptList.push(serviceDepartment);
      this.srvdeptList = this.srvdeptList.slice();
    }
}
