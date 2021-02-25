
import { Component, ChangeDetectorRef, AfterViewInit, Input, Output, ViewEncapsulation, EventEmitter } from "@angular/core";
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { PharmacyBLService } from "../../pharmacy/shared/pharmacy.bl.service"
import { PatientService } from "../../patients/shared/patient.service";
import { PHRMGoodsReceiptItemsModel } from "../../pharmacy/shared/phrm-goods-receipt-items.model";
import { RouteFromService } from "../../shared/routefrom.service";
import { CallbackService } from '../../shared/callback.service';
import { Patient } from "../../patients/shared/patient.model";
import { Visit } from '../../appointments/shared/visit.model';
import { VisitService } from '../../appointments/shared/visit.service';
import { DrugsRequisitonModel } from "../shared/drugs-requsition.model";
import { DrugsRequistionItemModel } from "../shared/drugs-requistion-items.model";
import { NursingBLService } from "../shared/nursing.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ServiceDepartmentVM } from "../../shared/common-masters.model";
import { CoreService } from "../../core/shared/core.service";
import { EmergencyPatientModel } from "../../emergency/shared/emergency-patient.model";

@Component({
    selector: "drugs-request",
    templateUrl: "./drugs-request.html"
})
export class DrugsRequestComponent {
    
    public currentPat: Patient = new Patient();
    public currentVisit: Visit = new Visit(); 
    
    public currSale: DrugsRequisitonModel = new DrugsRequisitonModel();
    public currSaleItems: Array<DrugsRequistionItemModel> = new Array<DrugsRequistionItemModel>();

    public ItemTypeListWithItems: Array<any> = new Array<any>();
    public ItemListForSale: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

    @Input("moduleName") moduleName: string = null;
    @Input("selectedPatient") selectedERPatient: EmergencyPatientModel = null;
    @Input("patient") patient: Patient = null;
    @Input("visit") visit: Visit = null;

    @Output("successCallBack") successCallBack: EventEmitter<object> = new EventEmitter<object>();

    public itemIdGRItemsMapData = new Array<{ ItemId: number, GRItems: Array<PHRMGoodsReceiptItemsModel> }>();
    
    //constructor of class
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public patientService: PatientService,
        public visitService: VisitService,
        public nursingBLServiec: NursingBLService,
        public changeDetectorRef: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public routeFromService: RouteFromService,
        public messageboxService: MessageboxService,
        public coreService: CoreService,
        public router: Router
  
     ) {
        this.LoadItemTypeList();
        this.currentPat = this.patientService.globalPatient; 
        this.currentVisit = this.visitService.globalVisit;
      
    }

    ngOnInit() {
        if (!this.moduleName) {
            this.currentPat = this.patientService.globalPatient;
            this.currentVisit = this.visitService.globalVisit;
        } else {
            if (this.patient && this.visit) {
                this.currentPat.PatientId = this.patient.PatientId;
                this.currentPat.PatientCode = this.patient.PatientCode;
                this.currentPat.ShortName = this.patient.ShortName;
                this.currentPat.DateOfBirth = this.patient.DateOfBirth;
                this.currentPat.Gender = this.patient.Gender;
                this.currentPat.Age = this.patient.Age;

                this.currentVisit.PatientVisitId = this.visit.PatientVisitId;
                this.currentVisit.PatientId = this.visit.PatientId;
                this.currentVisit.ProviderId = this.visit.ProviderId;
            }
        }
    }
    
    switchTextBox(index) {
        window.setTimeout(function () {
            document.getElementById('qty-box' + index).focus();
        }, 0);
    }
  
   // Load Item List 
    LoadItemTypeList(): void {
        try {
            this.pharmacyBLService.GetItemTypeListWithItems()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
  

    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.ItemListForSale = new Array<PHRMGoodsReceiptItemsModel>();
                    this.ItemListForSale = res.Results;
                    this.AddRowRequest(0);
                }
            }
            else {
                err => {
                    this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
  
    //This method calls when Item selection changed
    onChangeItem($event, index) {
        try {
        
            if ($event.ItemId > 0) {
                let itemId = $event.ItemId;
                this.currSaleItems[index].selectedItem = Object.assign(this.currSaleItems[index].selectedItem, $event);
                this.currSaleItems[index].Quantity = $event.Quantity;
                this.currSaleItems[index].BatchNo = $event.BatchNo;
                this.currSaleItems[index].ExpiryDate = $event.ExpiryDate;
                let ItemWiseGRItems = this.itemIdGRItemsMapData.find(a => a.ItemId == itemId);

                if (ItemWiseGRItems && itemId) {
                    this.currSaleItems[index].GRItems = ItemWiseGRItems.GRItems;
                }
                else {
                    //Get GrItems details by ItemId only available stock details
                    this.pharmacyBLService.GetGRItemsByItemId(itemId)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                
                                this.currSaleItems[index].GRItems = res.Results;
                                let itemWiseGRItems = { ItemId: itemId, GRItems: res.Results };
                                this.itemIdGRItemsMapData.push(itemWiseGRItems);
                            }
                            else {
                                this.messageboxService.showMessage("error", ["stock not available."]);
                            }
                        });
                }

            }
            else {
                this.currSaleItems[index].GRItems = [];
            }

        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ValueChanged(index) {
        try {
            if (this.currSaleItems[index].Quantity > this.currSaleItems[index].TotalQty) {
                this.currSaleItems[index].IsDirty('Quantity');
            }
         }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
  
    //Add New row into list
    AddRowRequest(index) {
        try {
            var tempSale: DrugsRequistionItemModel = new DrugsRequistionItemModel();
            var new_index = index + 1;
            this.currSaleItems.push(tempSale);
            if (this.currSaleItems.length == 0) {
                this.currSaleItems.push(tempSale);

            } else {

            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    AddRowRequestOnClick(index) {
        try {
            var tempSale: DrugsRequistionItemModel = new DrugsRequistionItemModel();
            var new_index = index + 1;
            this.currSaleItems.push(tempSale);
            if (this.currSaleItems.length == 0) {
                this.currSaleItems.push(tempSale);

            } else {

            }
            window.setTimeout(function () {
                document.getElementById('item-box' + new_index).focus();
            }, 0);
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //to delete the row
    DeleteRow(index) {
        try {
            this.currSaleItems.splice(index, 1);
            if (index == 0 && this.currSaleItems.length == 0) {
                this.AddRowRequest(0);
                // this.itemTypeId = 0;
            }
            else {
                this.changeDetectorRef.detectChanges();
            }
         
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
  
    CheckValidaiton(): boolean {
        try {
            let flag: boolean = true;
            for (var i = 0; i < this.currSaleItems.length; i++) {

                if (!this.currSaleItems[i].selectedItem && !this.currSaleItems[i].ItemName) {
                    this.messageboxService.showMessage("notice", ["Please select Medicine of " + (i + 1).toString() + " rows"]);
                    flag = false;
                    break;
                }
                
            }
            return flag;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    //used to format display of item in ng-autocomplete
    myItemListFormatter(data: any): string {
        let html = data["GenericName"] + "||" + data["ItemName"] 
        return html;
    }

    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);

        }
    }

    Close()
    {
      this.router.navigate(['/Nursing/InPatient']);
      //navigate to Nursing/InPatient
        //if (this.currSaleItems.length == 0) {
        //    this.AddRowRequest(0);
        //}
    }
    AssignAllValues() {
        try {
            let patientId = this.currentPat.PatientId;
            this.currSale.PatientId = patientId;
            let visitId = this.currentVisit.PatientVisitId;
            this.currSale.VisitId = visitId;
          
            for (var i = 0; i < this.currSaleItems.length; i++) {
                
                if (this.currSaleItems[i].enableItmSearch) {
                    this.currSaleItems[i].ItemId = this.currSaleItems[i].selectedItem.ItemId;
                    this.currSaleItems[i].ItemName = this.currSaleItems[i].selectedItem.ItemName;
                    this.currSaleItems[i].PatientId = patientId; // this.currSaleItems[i].selectedItem.PatientId;
                    this.currSaleItems[i].BatchNo = this.currSaleItems[i].selectedItem.BatchNo;
                    this.currSaleItems[i].ExpiryDate = this.currSaleItems[i].selectedItem.ExpiryDate;
                    this.currSaleItems[i].ItemName = this.currSaleItems[i].selectedItem.ItemName;
                }
                else {

                    let curItmId = this.currSaleItems[i].ItemId;
                    let curItm = this.ItemTypeListWithItems.find(itm => itm.ItemId == curItmId);
             
                }
            }
            
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    drugsRequest() {
        try {

            let check: boolean = true;
            for (var j = 0; j < this.currSaleItems.length; j++) {
                for (var i in this.currSaleItems[j].DrugsRequestValidator.controls) {
                    this.currSaleItems[j].DrugsRequestValidator.controls[i].markAsDirty();
                    this.currSaleItems[j].DrugsRequestValidator.controls[i].updateValueAndValidity();
                }

            }
            if (check) {
                if (this.CheckValidaiton()) {
                    this.AssignAllValues();
                    this.currSale.RequisitionItems = this.currSaleItems;
                    let invoicedetails = this.currSale;
                    this.nursingBLServiec.PostDrugsRequisition(this.currSale).
                        subscribe(res => {
                            if (res.Status == "OK") {
                                if (!this.moduleName) {
                                    this.msgBoxServ.showMessage("success", ["Drugs Request successfully"]);
                                    this.router.navigate(["/Nursing/RequisitionList"]);
                                } else {
                                    this.successCallBack.emit({ submit: true });
                                    this.currSaleItems = new Array<DrugsRequistionItemModel>();
                                    this.AddRowRequest(0);
                                    this.msgBoxServ.showMessage("success", ["Drugs Request successfully"]);
                                }
                            } else {                                
                                this.msgBoxServ.showMessage("Failed", ["Failed to Nursing Drugs Request "]);
                            }
                        });
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

}




