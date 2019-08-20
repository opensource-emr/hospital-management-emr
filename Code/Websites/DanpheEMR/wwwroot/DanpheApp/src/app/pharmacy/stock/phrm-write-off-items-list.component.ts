import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMWriteOffModel } from "../shared/phrm-write-off.model";
import { PHRMWriteOffItemModel } from "../shared/phrm-write-off-items.model"
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
@Component({
    templateUrl:'../../view/pharmacy-view/Stock/PHRMWriteOffList.html' // "/PharmacyView/PHRMWriteOffList"
})
export class PHRMWriteOffListComponent {
    ///For Binding WriteOff List
    public writeOffList: Array<PHRMWriteOffModel> = new Array<PHRMWriteOffModel>();
    ///For Binding Grid Column
    public writeOffListGridColumns: Array<any> = null;
    ///variable to show-hide Popup box
    public showWriteoffItemsbyWriteoffId: boolean = false;

    ////variable to Bind All WriteOffItemList
    public PHRMWriteOffItemsList: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();
    ///variable to push WriteOffItemList to this variable because we have to minimize server call
    public localWriteOffDatalist: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();
    ///final stored List to bind by locally stored data to view
    public selectedWriteOffDatalist: Array<PHRMWriteOffItemModel> = new Array<PHRMWriteOffItemModel>();

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        /////Grid Coloumn Variable
        this.writeOffListGridColumns = PHRMGridColumns.PHRMWriteOffList;
        ////Get All Write Off List With Its All Item 
        this.getWriteOffList();
    }
    ///GET: List Of All WriteOff With SUM of Total Qty and Order by Desending WriteOffId
    public getWriteOffList() {
        try {
            this.pharmacyBLService.GetWriteOffList()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.writeOffList = res.Results;
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["Failed to get WriteOff List. " + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get WriteOff List. " + err.ErrorMessage]);
                });
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }

    ////Grid Action Method
    WriteOffGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "view": {
                this.ShowRetSuppItemsDetailsByRetSuppId($event.Data.WriteOffId);
                break;
            }
            default:
                break;
        }
    }


    ///this function is for when enduser Clicks on View in WriteOffList 
    ShowRetSuppItemsDetailsByRetSuppId(writeOffId) {

        try {
            this.showWriteoffItemsbyWriteoffId = false;
            this.changeDetector.detectChanges();
            ///After ChangeDetection We r changing showWriteoffItemsbyWriteoffId=true because we have to display ModelPopupBox Based on this Flag
            this.showWriteoffItemsbyWriteoffId = true;

            //////Here is Logic To Minimize the Server Call on Each request : Umed-04Jan2017
            /////Every New Request We go to Server 
            ////After that we can store Result data to some varible and Once again if same request is come  then we can display data from locally store varible (without making new Server call)
            //localWriteOffDatalist is Array of WriteOffItem in this variable we are storing Response Data


            //len is local varibale deceleration
            var len = this.localWriteOffDatalist.length;
            ///lopping Each Locally store data and if perticular data is found on selected writeOffId , then we can push selected data to selectedWriteOffDatalist array
            for (var i = 0; i < len; i++) {
                let selectedDataset = this.localWriteOffDatalist[i];
                if (selectedDataset.WriteOffId == writeOffId) {
                    this.selectedWriteOffDatalist.push(selectedDataset);
                }
            }
            ///if we have some selectedWriteOffDatalist then we can display that on View
            if (this.selectedWriteOffDatalist[0] && writeOffId) {
                ///storing selectedWriteOffDatalist to PHRMWriteOffItemsList to Display in View
                this.PHRMWriteOffItemsList = this.selectedWriteOffDatalist;
                ///after passing data to View - we have to make sure that selectedWriteOffDatalist should be Empty
                this.selectedWriteOffDatalist = new Array<PHRMWriteOffItemModel>();

            }
            else {
                (   /////making new server call through BL and DL service By Passing writeOffId
                    this.pharmacyBLService.GetWriteOffItemsByWriteOffId(writeOffId)
                        .subscribe(res => {
                            if (res.Status == "OK") {
                                ////this is the final data and we have stored in PHRMWriteOffItemsList because we have to display data in View
                                this.PHRMWriteOffItemsList = res.Results;
                                ///After that we are passing same Results To localWriteOffDatalist to minimize the server call and once same request is come, then display data in view by using that
                                ///insted of making server call we can fatch data from Local 
                                this.PHRMWriteOffItemsList.forEach(itm => { this.localWriteOffDatalist.push(itm); });

                            } else {
                                this.msgBoxServ.showMessage("failed", ['Failed to get WriteOffItemList.' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ['Failed to get WriteOffItemList.' + err.ErrorMessage]);
                        }
                        )
                )
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    /////For Closing ModelBox Popup
    Close() {
        try {
            this.showWriteoffItemsbyWriteoffId = false;
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }

    ////This function only for show catch messages in console 
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
}

