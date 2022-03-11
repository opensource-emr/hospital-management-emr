import { Component, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BillingItemVM, TxnBillItem } from "../../../billing/shared/billing-item.view-model";
import { ServiceDepartment } from "../../../billing/shared/service-department.model";
import * as _ from 'lodash';

@Component({
    selector: 'autoBillingItem-list',
    templateUrl: './auto-billing-item-list.html'
})
export class AutoBillingItemListComponent {
    public autoBillingItemList: BillingItemVM = new BillingItemVM;
    public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>(); //service department list
    public txnItemList: Array<TxnBillItem> = new Array<TxnBillItem>();
    public selectedServDepts: Array<any> = [];
    public selectedBillItems: Array<any> = [];
    public masterItemList: Array<any> = [];
    public showAutoBillingItemPopUp: boolean = false;
    public initialAssign: boolean = false;
    public loading: boolean = false;
    public dbCheckValue: boolean = false;
    public enable: boolean = false;
    public AutoAddBillingItems: boolean = false;
    public AutoAddBedItem: boolean = false;
    public paramterUpdated: boolean = false;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    public check = 0; //used for purpose of focus
    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public renderer: Renderer2,) {
        this.GetBillingItems();
      this.GetSrvDeptList();
      this.SetFocusById("dept0");
        this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
              this.ClosePopUp();
            }
          }); 
    }
    globalListenFunc: Function;
    //Checking if column of AutoBillingItems is available in table 
    checkEnable() {
        this.loading = false;
        if (!this.paramterUpdated)
            this.PostParameterValue();

        this.selectedServDepts = []
        this.selectedBillItems = [];
        this.showAutoBillingItemPopUp = true;
       
        this.autoBillingItemList = new BillingItemVM;
        this.AddRow(-1);
        
    }

    ///getting auto billing items from Core_CFG_Parameter tables
    getAutoBillingItemList() {
      this.settingsBLService.ADT_GetAutoBillingItemList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.autoBillingItemList = res.Results;
                    if (this.autoBillingItemList.ItemList.length) {
                        this.enable = true;
                    }
                    if (this.autoBillingItemList.DoAutoAddBedItem) { //to check and show True or False value in html for Bed item
                        this.AutoAddBedItem = true;
                    }
                    else {
                        this.AutoAddBedItem = false;
                    }
                    if (this.autoBillingItemList.DoAutoAddBillingItems) { //to check and show True or False value in html for Bed item
                        this.AutoAddBillingItems = true;
                    }
                    else {
                        this.AutoAddBillingItems = false;
                    }
                    this.MapWithValidatorModel();
                    this.AssignFromExistingList();
                }

                else {
                    //alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    //Update row in Core_CFG_Parameters table and update a row in table with enpty value[Array]
    PostParameterValue() {
        this.settingsBLService.ADT_PostAutoAddBillItmValues()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.enable = false;
                    this.dbCheckValue = true; 
                    this.paramterUpdated = true; //boolean flag showing row is inserted
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    MapWithValidatorModel() {
        this.txnItemList = new Array<TxnBillItem>();
        this.autoBillingItemList.ItemList.forEach(item => {
            var billItem = new TxnBillItem();
            billItem = Object.assign(billItem, item);
            this.txnItemList.push(billItem);
        });
    }

    //use this during save
    MapWithSaveModel() {
        this.autoBillingItemList.ItemList = [];
        this.txnItemList.forEach(txnItem => {
            let item = Object.assign({}, txnItem);
            item = _.omit(item, ['BillingItemValidator', 'ItemList', 'IsDuplicateItem', 'IsValidSelDepartment', 'IsValidSelItemName', 'ItemName', 'ServiceDepartmentName', 'filteredItem']);
            this.autoBillingItemList.ItemList.push(item);
        });
    }

    //getting service department list
    public GetSrvDeptList() {
        this.settingsBLService.GetBillingServDepartments()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.srvdeptList = res.Results;
                    }
                    else {
                        this.msgBoxServ.showMessage("Failed", ["Check log for error message."]);
                        this.logError(res.ErrorMessage);
                    }
                }
            },
                err => {
                    this.msgBoxServ.showMessage("Failed to get service departments", ["Check log for error message."]);
                    this.logError(err.ErrorMessage);
                });
    }

    //Getting item list 
    public GetBillingItems() {
        this.settingsBLService.GetBillingItemList(true)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.masterItemList = res.Results;
                        this.getAutoBillingItemList();
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Check log for error message."]);
                        this.logError(res.ErrorMessage);
                    }
                }
            },
                err => {
                    this.msgBoxServ.showMessage("Failed to get Billing Items.", ["Check log for details"]);
                    this.logError(err.ErrorMessage);
                });
    }

    logError(err: any) {
        console.log(err);
    }

    //Assigning ItemName
    AssignFromExistingList() {
        for (let i = 0; i < this.txnItemList.length; i++) {
            let autoItem = this.txnItemList[i];
            if (autoItem) {
                let item = this.masterItemList.find(a => a.ItemId == autoItem.ItemId && a.ServiceDepartmentId == autoItem.ServiceDepartmentId);
                if (item) {
                    this.selectedBillItems[i] = item.ItemName;
                    this.txnItemList[i].ItemName = item.ItemName;
                    this.AssignSelectedBillItem(item);
                    this.SetServiceDepartment(i);
                }
            }
            else {
                this.AddRow(-1);
                this.changeDetector.detectChanges();
            }
        }
    }

    //Assigning ServiceDepartmentName
    public SetServiceDepartment(index: number) {
        var srvDept = this.srvdeptList.find(srv => Number(srv.ServiceDepartmentId) == Number(this.txnItemList[index].ServiceDepartmentId));
        if (srvDept) {
            this.selectedServDepts[index] = srvDept;
            this.txnItemList[index].ServiceDepartmentName = srvDept.ServiceDepartmentName;
        }
    }

    public FilterBillItems(index) {
        //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
        // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
        if (!this.initialAssign)
            this.ClearSelectedItemProperties(index);

        if (index == this.autoBillingItemList.ItemList.length - 1)
            this.initialAssign = false;
        this.txnItemList[index].filteredItem = this.masterItemList.filter(a => a.ServiceDepartmentId == this.txnItemList[index].ServiceDepartmentId);

    }

    public ClearSelectedItemProperties(index: number) {
        this.txnItemList[index].ItemId = null;
        this.selectedBillItems[index] = null;
    }

    //assigns service department id and filters item list
    ServiceDeptOnChange(index) {
        let srvDeptObj = null;  
        // check if user has given proper input string for department name 
        //or has selected object properly from the dropdown list.
        if (typeof (this.selectedServDepts[index]) == 'string') {
            if (this.srvdeptList.length && this.selectedServDepts[index])
                srvDeptObj = this.srvdeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedServDepts[index].toLowerCase());
        }
        else if (typeof (this.selectedServDepts[index]) == 'object')
            srvDeptObj = this.selectedServDepts[index];
        //if selection of department from string or selecting object from the list is true
        //then assign proper department name
        if (srvDeptObj) {
            if (this.txnItemList[index].ItemName) {
                this.txnItemList[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
                this.txnItemList[index].IsValidSelDepartment = true;
                this.initialAssign=true;
                this.FilterBillItems(index);
                if(index == this.txnItemList.length-1 && this.check == 0){
                    this.SetFocusById('dept0');
                    this.check++;
                }
                else{
                    this.SetFocusById('itemName'+index);
                }   
            }
            else{
                this.ResetSelectedRow(index);
                this.txnItemList[index].ServiceDepartmentId = srvDeptObj.ServiceDepartmentId;
                this.txnItemList[index].IsValidSelDepartment = true;
                this.SetFocusById('itemName'+index);
                this.FilterBillItems(index);
            }
        }
        else {
            this.txnItemList[index].filteredItem = this.masterItemList;
            this.txnItemList[index].IsValidSelDepartment = false;
        }
    }


    //Changes made since ng autocomplete binds the selected object instead of a single selected property.
    public AssignSelectedBillItem(index) {
        let item = null;
        // check if user has given proper input string for item name
        //or has selected object properly from the dropdown list.
        if (this.selectedBillItems[index]) {
            if (this.selectedBillItems.length) {

                if (typeof (this.selectedBillItems[index]) == 'string' && this.txnItemList[index].filteredItem.length) {
                    item = this.masterItemList.find(a => a.ItemName.toLowerCase() == this.selectedBillItems[index].toLowerCase());
                }
                else if (typeof (this.selectedBillItems[index]) == 'object')
                    item = this.selectedBillItems[index];
                if (item) {
                    this.txnItemList[index].ItemId = item.ItemId;
                    this.txnItemList[index].ServiceDepartmentId = item.ServiceDepartmentId;

                    this.selectedServDepts[index] = item.ServiceDepartmentName;
                    this.txnItemList[index].IsValidSelDepartment = true;

                    let extItem = this.txnItemList.find(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);
                    let extItemIndex = this.txnItemList.findIndex(a => a.ItemId == item.ItemId && a.ServiceDepartmentId == item.ServiceDepartmentId);

                    if (extItem && index != extItemIndex) {
                        this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
                        this.changeDetector.detectChanges();
                        this.txnItemList[index].IsDuplicateItem = true;
                    }
                    else
                        this.txnItemList[index].IsDuplicateItem = false;

                    this.txnItemList[index].IsValidSelDepartment = true;
                    this.txnItemList[index].IsValidSelItemName = true;
                    this.txnItemList[index].filteredItem = this.masterItemList.filter(a => a.ServiceDepartmentId == this.txnItemList[index].ServiceDepartmentId);

                }
                else {
                    this.txnItemList[index].IsValidSelItemName = false;
                }
            }
        }
    }

    //Update Function 
    UpdateAutoBillingItems() {
        this.loading = true;
        var isItemsValid: boolean;
        this.check = 0;
        //Checking validation
        for (var listItem of this.txnItemList) {
            for (var i in listItem.BillingItemValidator.controls) {
                listItem.BillingItemValidator.controls[i].markAsDirty();
                listItem.BillingItemValidator.controls[i].updateValueAndValidity();
             this.SetFocusById('dept0');
            }
            if (listItem.IsValid(undefined, undefined)) {
                isItemsValid = true;
            }
            else {
                isItemsValid = false;
                this.loading = false;
                break;
            }
            this.loading = false;
        }
        if (isItemsValid && this.CheckSelectionFromAutoComplete()) {
            this.MapWithSaveModel();//omitting
            this.settingsBLService.UpdateAutoBillingItems(this.autoBillingItemList)
                .subscribe(
                    res => {
                        if (res.Status == 'OK') {
                            this.msgBoxServ.showMessage("success", ["Auto Billing Items Updated Successsfully."]);
                            this.loading = false;
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Something is wrong, Check log for error message."]);
                            this.logError(res.ErrorMessage);
                            this.SetFocusById("dept0");
                            this.loading = false;
                        }
                        this.autoBillingItemList = new BillingItemVM();
                        this.showAutoBillingItemPopUp = false;
                        this.enable = true;
                        this.getAutoBillingItemList();
                    },
                    err => {
                        this.logError(err);

                    });
        }
    }

    //Checking duplicate value, improper items and empty validationand displaying empty alert
    public CheckSelectionFromAutoComplete(): boolean {
        if (this.txnItemList.length) {
            for (let itm of this.txnItemList) {
                if (!itm.IsValidSelDepartment) {
                    this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
                    this.loading = false;
                    return false;
                }
                if (!itm.IsValidSelItemName) {
                    this.msgBoxServ.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
                    this.loading = false;
                    this.SetFocusById('itemName0')
                    return false;
                }
                if (itm.IsDuplicateItem) {
                    this.msgBoxServ.showMessage("failed", ["Duplicate Item now allowed." + itm.ItemName + " is entered more than once"]);
                    this.loading = false;
                    return false;
                }
            }
            return true;
        }
    }

    //reset Item Selected on service department change
    ResetSelectedRow(index) {
        this.selectedBillItems[index] = null;
    }

    //Close Function
    ClosePopUp() {
        this.check = 0;
        this.showAutoBillingItemPopUp = false;
        this.txnItemList = [];
        this.enable = true;
        this.getAutoBillingItemList();
        if (this.dbCheckValue) {
            this.enable = false;
        }
        else {
            this.enable = true;
        }
    }

    //Delete Row
    public DeleteRow(index) {
        let itemId = this.txnItemList[index].ItemId;
        let srvDeptId = this.txnItemList[index].ServiceDepartmentId;
        this.txnItemList.splice(index, 1);
        this.selectedBillItems.splice(index, 1);
        this.selectedServDepts.splice(index, 1);

        //finding duplicate item 
        let dupItem = this.txnItemList.find(item => item.ServiceDepartmentId == srvDeptId && item.ItemId == itemId);
        if (dupItem) {
            dupItem.IsDuplicateItem = false;
        }
        if (index == 0 && this.txnItemList.length == 0) {
            this.AddRow(-1);
            this.changeDetector.detectChanges();
        }
    }

    //Adding Row
    public AddRow(index) {
        this.SetFocusById("dept"+(index+1));
        let txnItem: TxnBillItem = new TxnBillItem();
        if (index >= 0)
            txnItem.ServiceDepartmentId = this.txnItemList[index].ServiceDepartmentId;

        txnItem.filteredItem = this.masterItemList;
        this.txnItemList.push(txnItem);
    }

    //Display format for ServiceDepartment
    ServiceDeptListFormatter(data: any): string {
        return data["ServiceDepartmentName"];
    }

    //Display format for Item Name
    ItemsListFormatter(data: any): string {
        let html: string = "";
        if (data.ServiceDepartmentName != "OPD") {
            html = data["ServiceDepartmentShortName"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
            html += "(<i>" + data["ServiceDepartmentName"] + "</i>)";
        }
        else {
            let docName = data.Doctor ? data.Doctor.DoctorName : "";
            html = data["ServiceDepartmentShortName"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
            html += "(<i>" + docName + "</i>)";
        }
        return html;
    }
    public SetFocusById(id: string) {
        if(this.selectedBillItems.length>0){
            if(this.selectedBillItems[0] == null || this.selectedBillItems[0] == "" ){
               id="itemName0";
            }
        }
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
            else{
                id="Update"
                let elementToBeFocused = document.getElementById(id);
                if (elementToBeFocused) {
                    elementToBeFocused.focus();
                }
            }
        }, 600);
    }
}
