import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';

import { SecurityService } from '../../security/shared/security.service';

import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { BillItemPriceVM } from '../../billing/shared/billing-view-models';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { NursingBLService } from "../shared/nursing.bl.service"

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillItemRequisition } from '../../billing/shared/bill-item-requisition.model';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { ServiceDepartmentVM } from '../../shared/common-masters.model';
import { CommonFunctions } from '../../shared/common.functions';
import * as moment from 'moment/moment';

import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';

import { ImagingItemRequisition } from '../../radiology/shared/imaging-item-requisition.model';
import { LabTestRequisition } from '../../labs/shared/lab-requisition.model';
import { BillingService } from '../../billing/shared/billing.service';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ENUM_BillingStatus } from '../../shared/shared-enums';

@Component({
    selector: 'nursing-order',
    templateUrl: "../../view/nursing-view/NursingOrder.html"// "/NursingView/NursingOrder"
})
export class NursingOrderComponent {
    public nursingOrderLabItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//variable for create separate nursing order for lab
    public nursingOrderRadiologyItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//variable for  create separate nursing order for Radiology/imaging
    public nursingOrderItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//This variable store all other than Imaging/Radiology and Lab Nursing Order Items       

    public BillingTransactionItems: Array<BillingTransactionItem> = null;  //initialize the array of object to add the row 
    public CurrentNursingOrderItem: BillingTransactionItem = null;
    public rowCount: number = 0;
    public ItemList: any;
  public serviceDeptItemsMap = new Array<{ ServiceDepartmentId: number, ItemList: Array<BillItemPriceVM> }>();
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    public allServiceDepts: Array<ServiceDepartmentVM> = null;
    public selectedItems: any = [];
    defaultServiceDepartmentId = 12;//THIS IS FOR LABs.. Remove this hardcode soon... 
    public taxPercent: number = 0;

    public selectedAssignedToDr: any = [];
    public doctorsList: any = [];
    public ServiceDepartment: Array<any> = null;
    constructor(public patientService: PatientService,
        public router: Router,
        public patientVisitService: VisitService,
        public billingBLService: BillingBLService,
        public nursingBLService: NursingBLService,
        public changeDetectorRef: ChangeDetectorRef, public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public billingService: BillingService) {
        let currentCounter = this.securityService.getLoggedInCounter().CounterId;
        this.taxPercent = this.billingService.taxPercent;
        if (this.patientService.globalPatient.PatientId) {
            this.BillingTransactionItems = new Array<BillingTransactionItem>();  //array to add the row for billing                        
            this.LoadAllServiceDepts();
            this.GetDoctorsList();
            this.CurrentNursingOrderItem = this.NewBillingTransactionItem(); //method is made to initialize the object
            this.CurrentNursingOrderItem.ServiceDepartmentId = this.defaultServiceDepartmentId;
            this.BillingTransactionItems.push(this.CurrentNursingOrderItem);   // to show the input parameters in a row while loading
            this.CurrentNursingOrderItem.Quantity = 1;
            //To Load items of Default serviceDepartment on Load.. 
            this.GenerateServiceDepartmentItems(0, this.defaultServiceDepartmentId);
            

        }
        else {
            this.msgBoxServ.showMessage("error", ['Please select patient first.']);
            this.router.navigate(['Nursing/InPatient']);
        }
    }


    NewBillingTransactionItem(): BillingTransactionItem {
        let newReq: BillingTransactionItem = new BillingTransactionItem();
        newReq.PatientId = this.patientService.getGlobal().PatientId;
      newReq.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
        return newReq;
    }
    Clear() {
        // this.model = new BillingTransaction();
        //this.selectedAssignedToDr = [];
        this.selectedItems = [];
        this.BillingTransactionItems = new Array<BillingTransactionItem>();
        this.CurrentNursingOrderItem = this.NewBillingTransactionItem();
        this.BillingTransactionItems.push(this.CurrentNursingOrderItem);
        this.changeDetectorRef.detectChanges();
    }
    AddBillRequest(index) {    //method to add the row
        this.rowCount++;
        let department = this.BillingTransactionItems[index].ServiceDepartmentId;
        this.CurrentNursingOrderItem = this.NewBillingTransactionItem();
        this.BillingTransactionItems.push(this.CurrentNursingOrderItem);
        this.CurrentNursingOrderItem.ServiceDepartmentId = department;//by default, next row should have same department as previous row.
        let lastIndex = this.BillingTransactionItems.length - 1;
        if (this.BillingTransactionItems[lastIndex].ServiceDepartmentId)
            this.GenerateServiceDepartmentItems(lastIndex, department);//sending index of last element of array while billing for the ease of user
        this.CurrentNursingOrderItem.Quantity = 1;
        this.CurrentNursingOrderItem.RequestedBy = this.BillingTransactionItems[index].RequestedBy;

    }
    deleteRow(index: number) {
        this.BillingTransactionItems.splice(index, 1);
        this.selectedItems.splice(index, 1);
        //this.selectedAssignedToDr.splice(index, 1);
        if (index == 0 && this.BillingTransactionItems.length == 0) {
            this.CurrentNursingOrderItem = this.NewBillingTransactionItem();
            this.BillingTransactionItems.push(this.CurrentNursingOrderItem);
            this.CurrentNursingOrderItem.Quantity = 1;
            this.changeDetectorRef.detectChanges();
        }
        else
            this.CurrentNursingOrderItem.Quantity = 1;
    }

    // to generate the items to after selecting the department 
    GenerateServiceDepartmentItems(index, srvDeptId): void {    //generate item list from department

        //check if itemlist for this srvdept already exists, get from server if not.
        let srvDeptMap = this.serviceDeptItemsMap.find(a => a.ServiceDepartmentId == srvDeptId);

        if (srvDeptMap && srvDeptMap.ServiceDepartmentId) {
            if (this.selectedItems[index])
                this.ClearSelectedItem(index);
            this.BillingTransactionItems[index].ItemList = srvDeptMap.ItemList;
        }
        else {
            this.billingBLService.GetServiceDepartmentItems(srvDeptId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.serviceDeptItemsMap.push({ ServiceDepartmentId: srvDeptId, ItemList: res.Results });

                        this.BillingTransactionItems[index].ItemList = res.Results;
                        if (this.selectedItems[index])
                            this.ClearSelectedItem(index);
                        if (this.BillingTransactionItems[index].ItemId)
                            this.MapSelectedItem(index);

                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage])

                    }
                });
        }
    }


    //Request Button Click Method for Post Nursing Order Requisition
    SubmitNursingOrder(): void {
        let isFormValid = true;
        let flag = true;
        //This check all Transaction item Price and quantity . if Price <=0  then don't post to db
        if (this.BillingTransactionItems.filter(a => a.Quantity <= 0).length > 0) {
            this.msgBoxServ.showMessage("notice", ['Quantity should be greater than zero.']);
            return;
        }

        //Check SelectedItems is correct or not
        if (this.CheckSelectedItems()) {
            //Validation apply only on ItemName,Price and Quantity 
            if (this.BillingTransactionItems.length > 0) {
                for (var t = 0; t < this.BillingTransactionItems.length; t++) {
                    this.BillingTransactionItems[t].RemoveValidators(["ProviderId", "DiscountPercent", "RequestedBy","Price"]);
                    for (var i in this.BillingTransactionItems[t].BillingTransactionItemValidator.controls) {
                        this.BillingTransactionItems[t].BillingTransactionItemValidator.controls[i].markAsDirty();
                        this.BillingTransactionItems[t].BillingTransactionItemValidator.controls[i].updateValueAndValidity();
                    }
                    if (!this.BillingTransactionItems[t].IsValidCheck(undefined, undefined)) {
                        isFormValid = false;
                        this.loading = false;
                    }
                }
            }
            else {
                isFormValid = false;
            }

            //If all validation done well and Checkduplicate item is there or not, duplicate Item not allowed
            if (isFormValid) {
                if (this.CheckDuplicateItem()) {
                    this.loading = true;
                    for (var j = 0; j < this.BillingTransactionItems.length; j++) {
                        this.BillingTransactionItems[j].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
                        this.BillingTransactionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                        this.BillingTransactionItems[j].CounterId = this.securityService.getLoggedInCounter().CounterId;
                        this.BillingTransactionItems[j].CounterDay = moment().format("YYYY-MM-DD");
                        this.BillingTransactionItems[j].ServiceDepartmentName = this.GetServiceDeptNameById(this.BillingTransactionItems[j].ServiceDepartmentId);
                        this.BillingTransactionItems[j].PatientVisitId = this.patientVisitService.globalVisit.PatientVisitId;
                        this.BillingTransactionItems[j].BillingType = "inpatient";
                        //this.BillingTransactionItems[j].ProviderId = this;
                        this.BillingTransactionItems[j].RequestedBy = this.patientVisitService.globalVisit.ProviderId;
                    }
                    //Post Nursing Order Items to respective dept   
                    //billingstatus is "unpaid" when sent from NursingOrder Page.
                    this.billingBLService.PostDepartmentOrders(this.BillingTransactionItems, "active", "unpaid",false)
                        // this.nursingBLService.PostNursingOrderToDept(this.BillingTransactionItems)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                //Call for Post BillRequisitionItems
                                this.CallBackForBillReq(res.Results);
                            } else {
                                alert("failed to Nursing Order");
                            }
                        });
                }
                else {
                    this.msgBoxServ.showMessage("error", ['Duplicate item detected. This test is ordered already.']);
                    this.loading = false;
                    return;
                }
            }
            else {
                this.msgBoxServ.showMessage("error", ['please check all values and  try again.']);
                this.loading = false;
                return;
            }
        }
        else {
            return;
        }

    }
    //Post  NursingOrder Items to Billing Requisition
    public CallBackForBillReq(data: any[]) {
        if (data.length > 0) {
            this.nursingBLService.PostBillingRequisitionItems(data)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["successfully placed nursing order"]);
                        //It navigate to List of NursingOrder against selected patient
                        this.router.navigate(['Nursing/Orders/NursingOrderList']);
                    } else {
                        this.msgBoxServ.showMessage("failed", ['There is something wrong, Please try again.']);
                        this.loading = false;
                    }
                });
        }
    }
    //Local function for return ServiceDepartment Name by ID 
    GetServiceDeptNameById(servDeptId: number): string {
        if (this.allServiceDepts)
            return this.allServiceDepts.filter(a => a.ServiceDepartmentId == servDeptId)[0].ServiceDepartmentName;
    }

    //this will load all service depts
    LoadAllServiceDepts() {
        this.billingBLService.GetServiceDepartments()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allServiceDepts = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessaage], res.ErrorMessaage);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", [err.ErrorMessaage], err.ErrorMessaage);
            }
            );
    }

    //Changes made since ng autocomplete binds the selected object instead of a single selected property.
    public AssignSelectedItem(index) {
        if (this.selectedItems.length) {
            if (this.selectedItems[index]) {
                if (typeof (this.selectedItems[index]) == 'object') {
                    this.BillingTransactionItems[index].ItemId = this.selectedItems[index].ItemId;
                    this.BillingTransactionItems[index].ItemName = this.selectedItems[index].ItemName;
                    this.BillingTransactionItems[index].TaxPercent = this.selectedItems[index].TaxApplicable ? this.taxPercent : 0;
                    this.BillingTransactionItems[index].Price = this.selectedItems[index].ItemPrice;
                    //disable Price Textbox if ItemPrice is already present. 
                    //Price of few billing items are not fixed and has to be assigned by the user themselves and hence was kept as Zero.
                    if (this.selectedItems[index].ItemPrice != 0) {
                        this.BillingTransactionItems[index].EnableControl("Price", false);
                    }
                    else {
                        this.BillingTransactionItems[index].EnableControl("Price", true);
                    }
                    this.BillingTransactionItems[index].ProcedureCode = this.selectedItems[index].ProcedureCode;
                    this.BillingTransactionItems[index].IsDuplicateItem = false;
                }
            }
        }
    }
    //Check duplicate items if duplicate items found then you can't post
    public CheckDuplicateItem(): boolean {
        let flag = true;
        for (var i = 0; i < this.BillingTransactionItems.length; i++) {
            for (var j = i + 1; j < this.BillingTransactionItems.length; j++) {
                if ((this.BillingTransactionItems[i].ServiceDepartmentId == this.BillingTransactionItems[j].ServiceDepartmentId)
                    && (this.BillingTransactionItems[i].ItemId == this.BillingTransactionItems[j].ItemId)) {
                    flag = false;
                    this.BillingTransactionItems[j].IsDuplicateItem = true;
                }
            }
        }
        return flag;

    }

    //validation check if the item is selected from the list
    public CheckSelectedItems(): boolean {
        if (this.selectedItems.length) {
            for (let item of this.selectedItems) {
                if (!item || typeof (item) != 'object') {
                    item = undefined;
                    this.msgBoxServ.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
                    return false;
                }
            }
            return true;
        }
    }

    ClearSelectedItem(index) {
        this.selectedItems[index] = null;
        this.BillingTransactionItems[index].Price = null;
        this.BillingTransactionItems[index].ProcedureCode = null;  //Item Id is for procedureId of the Items at BillItem
        this.BillingTransactionItems[index].ItemId = null;

    }

    MapSelectedItem(index) {
        var item = this.BillingTransactionItems[index].ItemList.find(a => a.ItemId == this.BillingTransactionItems[index].ItemId);
        this.BillingTransactionItems[index].Price = item.Price;
        this.BillingTransactionItems[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
        this.BillingTransactionItems[index].ItemName = item.ItemName;
        this.selectedItems[index] = item.ItemName;
    }

    ItemsListFormatter(data: any): string {
        return data["ItemName"];
    }

    public GetDoctorsList() {
        this.billingBLService.GetDoctorsList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.doctorsList = res.Results;
                        this.ServiceDepartment = this.allServiceDepts.filter(dpt => dpt.ServiceDepartmentName != "OPD");
                    }
                }
            },
            err => {
                this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
            });
    }
    AssignedToDocListFormatter(data: any): string {
        return data["FullName"];
    }
    public AssignSelectedDoctor(index) {
        if (this.selectedAssignedToDr.length) {
            if (typeof (this.selectedAssignedToDr[index]) == 'object') {
                this.BillingTransactionItems[index].ProviderId = this.selectedAssignedToDr[index].EmployeeId;
                this.BillingTransactionItems[index].ProviderName = this.selectedAssignedToDr[index].FullName;
            }
        }
    }
}
