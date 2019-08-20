import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMSupplierModel } from "../shared/phrm-supplier.model"
import { PHRMGoodsReceiptModel } from "../shared/phrm-goods-receipt.model"
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model"
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../shared/common.functions"
import * as moment from 'moment/moment';
import { CoreService } from "../../core/shared/core.service";

@Component({
    templateUrl: "../../view/pharmacy-view/Order/PHRMGoodsReceiptList.html" // "/PharmacyView/PHRMGoodsReceiptList"
})
export class PHRMGoodsReceiptListComponent {
    public currentGRdetails: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
    public selectedDatalist: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    public goodsReceiptItemsList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    public goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    public filterGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    public newGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
    //localDatalist is Array of GRItems here we are saving ResponseData
    public localDatalist: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
    public goodsreceiptsGridColumns: Array<any> = null;
    public showGRItemsbyGRId: boolean = false;
    public IsCancelStatus: boolean = false;
    public printGR: boolean = false;
    public fromDate: string;
    public toDate: string;
	public fromDay: number = null;
    public toDay: number = null;
    public supplierId: number = null;
    public totalAmount: number = null;
    public subTotal: number = null;
  public discountTotal: number = null;
  public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  constructor(public coreService: CoreService,
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        //this.fromDate = moment().format('YYYY-MM-DD');
        //this.toDate = moment().format('YYYY-MM-DD');
        this.GetPharmacyHeaderParameter();
        this.goodsreceiptsGridColumns = PHRMGridColumns.PHRMGoodsReceiptList;
        this.getGoodsReceiptList();
        this.GetSupplierData();
    }
     //this function load all suppliers details
    GetSupplierData() {
        try {
            this.pharmacyBLService.GetSupplierList()
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.supplierList = res.Results;
                        } else {
                            this.msgBoxServ.showMessage("failed", ['Failed to get supplier list.' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ['Failed to get supplier list.' + err.ErrorMessage]);
                    }
                );
        }
        catch (exception) {
            console.log(exception);
            this.msgBoxServ.showMessage("error", ['error details see in console log']);
        }
    }
    //used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["SupplierName"];
        return html;
    }
    public getGoodsReceiptList() {
        var todat = new Date(this.toDate);
        this.pharmacyBLService.GetGoodsReceiptList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.newGoodsReceiptList = res.Results;
                    this.goodsReceiptList = res.Results;

                    for (let i = 0; i < this.goodsReceiptList.length; i++) {                    
                        var date2 = new Date(this.goodsReceiptList[i].GoodReceiptDate);
                        var date1 = new Date(moment().format('YYYY-MM-DD'));
                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        this.goodsReceiptList[i].AgingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    }
                    this.filterGoodsReceiptList = new Array<PHRMGoodsReceiptModel>();
                    this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == false);

                    this.totalAmount = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.TotalAmount).reduce((sum, current) => sum + current);
                    this.subTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.SubTotal).reduce((sum, current) => sum + current);
                    this.discountTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.DiscountAmount).reduce((sum, current) => sum + current);

                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
                });
    }
    GoodsReceiptGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "view": {
                //changing datetime format to date only for view
                $event.Data.GoodReceiptDate = moment($event.Data.GoodReceiptDate).format("YYYY-MM-DD");
                this.currentGRdetails = $event.Data;
                this.ShowGRItemsbyGRId(this.currentGRdetails.GoodReceiptId);

                break;
            }
            default:
                break;
        }
    }
    ShowGRItemsbyGRId(goodsreceiptId) {
        this.showGRItemsbyGRId = false;
        this.changeDetector.detectChanges();
        //after changedetection we will make showGRItemsbyGRId=true to show view popup
        this.showGRItemsbyGRId = true;
        //to minimize server call : for every new request we will go to server, then we store result data in local variable and when same request is called data will be displayed using local variable(w/o making call to server)
        var len = this.localDatalist.length;        //local len var for looping
        for (var i = 0; i < len; i++) {
            let selectedDataset = this.localDatalist[i];
            if (selectedDataset.GoodReceiptId == goodsreceiptId) {
                this.selectedDatalist.push(selectedDataset);
            }
        }
        //if required data is found in localdatalist then we will use it to display on view
        if (this.selectedDatalist[0]) {
            //store selectedDataList to goodsReceiptItemsList to display data
            this.goodsReceiptItemsList = this.selectedDatalist;
            //empty the selecetedDataList
            this.selectedDatalist = new Array<PHRMGoodsReceiptItemsModel>();
        }
        else {
            (
                //making server call when required data is not found in localdatalist (ID is passed to fetch specific data)
                this.pharmacyBLService.GetGRItemsByGRId(goodsreceiptId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.goodsReceiptItemsList = res.Results;
                            //changing datetime format to view only date and limitng percentage to 2 decimal
                            this.goodsReceiptItemsList.forEach(gr => {
                                // gr.ManufactureDate = moment(gr.ManufactureDate).format("YYYY-MM-DD");
                                gr.ExpiryDate = moment(gr.ExpiryDate).format("YYYY-MM-DD");
                                gr.VATPercentage = CommonFunctions.parseAmount(gr.VATPercentage);
                            });
                            //passing acquire data to localdatalist to reduce the server load next time
                            this.goodsReceiptItemsList.forEach(itm => { this.localDatalist.push(itm); });
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ['failed to get Goods Receipt Items List. ' + res.ErrorMessage]);
                        }
                    },
                        err => {
                            this.msgBoxServ.showMessage("error", ['failed to get Goods Receipt Items List. ' + err.ErrorMessage]);
                        }
                    )
            )
        }
    }

    SupplierChange($event) {
        this.supplierId = $event.SupplierId;
    }
  public filterlist() {
      this.supplierId = this.currentSupplier.SupplierId;
        if (this.fromDate && this.toDate) {
            this.fromDate = moment(this.fromDate).add(this.fromDay,'days').format('YYYY-MM-DD');
            this.toDate = moment(this.toDate).add(-this.toDay,'days').format('YYYY-MM-DD');
          
            this.newGoodsReceiptList = [];
            this.filterGoodsReceiptList.forEach(list => {
                let selPharmDate = moment(list.CreatedOn).format('YYYY-MM-DD');
                let isGreterThanFrom = selPharmDate <= moment(this.fromDate).format('YYYY-MM-DD');
                let isSmallerThanTo = selPharmDate >= moment(this.toDate).format('YYYY-MM-DD')  
                
               
                if (isGreterThanFrom && isSmallerThanTo && list.SupplierId == this.supplierId) {
                                             
                    var date2 = new Date(list.GoodReceiptDate);
                    var date1 = new Date(moment().format('YYYY-MM-DD'));
                    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                    list.AgingDays= Math.ceil(timeDiff / (1000 * 3600 * 24));
                   
                    this.newGoodsReceiptList.push(list);
                   }
            });
           
            this.totalAmount = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
                .map(c => c.TotalAmount).reduce((sum, current) => sum + current);
            this.subTotal = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
                .map(c => c.SubTotal).reduce((sum, current) => sum + current);
            this.discountTotal = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
                .map(c => c.DiscountAmount).reduce((sum, current) => sum + current);


            this.fromDate = moment().format('YYYY-MM-DD');
            this.toDate = moment().format('YYYY-MM-DD');

        }
        else {

          this.newGoodsReceiptList = this.filterGoodsReceiptList.filter(a => a.SupplierId == this.supplierId);
        }

    }
    gridExportOptions = {
        fileName: 'PharmacyGoodReceiptLists_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Close() {
        this.showGRItemsbyGRId = false;
    }

    printGoodReciept() {
        let popupWinindow;
        var printContents = document.getElementById("print-good-reciept").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

        popupWinindow.document.close();

       
    }

    LoadGoodsReceiptListByStatus(flag) {
        this.filterGoodsReceiptList = new Array<PHRMGoodsReceiptModel>();
        if (flag == true) {
            this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == true);
        }
        else {
            this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == false);
        }
      this.newGoodsReceiptList = this.filterGoodsReceiptList;
    }
    //Confirmation for Good Receipt Cancel
    cancelGoodsReciept() {
        let printAgain: boolean = true;
        let cancel_msg = "NOTE !!! Do you want to cancel Good Receipt?";
        printAgain = window.confirm(cancel_msg);
        if (printAgain) {
            this.cancelGR();
        }
    }
    //Good Receipt Cancellation Method
    cancelGR() {
        this.pharmacyBLService.PostGoodsReceiptCancelDetail(this.currentGRdetails.GoodReceiptId)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.showGRItemsbyGRId = false;
                        this.getGoodsReceiptList();
                        this.msgBoxServ.showMessage("success", ["Goods Receipt Canceled."]);
                    } else {
                        this.msgBoxServ.showMessage("error", [" Sold goods receipt not allowed to cancel"]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
  }
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get customer Header Parameter from Core Service (Database) assign to local variable -- Narayan 08 July 2019
  GetPharmacyHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}

