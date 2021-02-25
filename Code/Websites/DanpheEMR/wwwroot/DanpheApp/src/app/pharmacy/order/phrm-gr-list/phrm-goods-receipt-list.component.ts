import { Component, ChangeDetectorRef, ElementRef, Input, OnInit } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMSupplierModel } from "../../shared/phrm-supplier.model"
import { PHRMGoodsReceiptModel } from "../../shared/phrm-goods-receipt.model"
import { PHRMGoodsReceiptItemsModel } from "../../shared/phrm-goods-receipt-items.model"
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../../shared/common.functions"
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { PharmacyService } from "../../shared/pharmacy.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
      selector: 'good-receipt',
      templateUrl: "./phrm-goods-receipt-list.html"
})

export class PHRMGoodsReceiptListComponent {
      public currentGRdetails: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
      public goodReceiptItems: PHRMGoodsReceiptItemsModel = new PHRMGoodsReceiptItemsModel();
      public selectedDatalist: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
      public goodsReceiptItemsList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
      public goodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
      public filterGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
      public newGoodsReceiptList: Array<PHRMGoodsReceiptModel> = new Array<PHRMGoodsReceiptModel>();
      public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
      public goodsreceiptsGridColumns: Array<any> = null;
      public showGRPopUp: boolean = false;
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
      public grId: any;
      public userName: any;//to show the username who generate the receipt
      public time: any;//to show the time when receipt was created using createdon  
      //for show and hide item level discount features
      IsitemlevlDis: boolean = false;
      //for show and hide packing features
      IsPkgitem: boolean = false;
      constructor(public coreService: CoreService,
            public pharmacyBLService: PharmacyBLService,
            public pharmacyService: PharmacyService,
            public changeDetector: ChangeDetectorRef,
            public msgBoxServ: MessageboxService,
            public router: Router, public route: ActivatedRoute) {
            //this.fromDate = moment().format('YYYY-MM-DD');
            //this.toDate = moment().format('YYYY-MM-DD');
            // this.element = el.nativeElement;
            this.GetPharmacyHeaderParameter();
            this.goodsreceiptsGridColumns = PHRMGridColumns.PHRMGoodsReceiptList;
            this.getGoodsReceiptList();
            this.GetSupplierData();
            this.showitemlvldiscount();
            this.showpacking();
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

      //show or hide GR item level discount
      showitemlvldiscount() {
            this.IsitemlevlDis = true;
            let itmdis = this.coreService.Parameters.find(
                  (p) =>
                        p.ParameterName == "PharmacyItemlvlDiscount" &&
                        p.ParameterGroupName == "Pharmacy"
            ).ParameterValue;
            if (itmdis == "true") {
                  this.IsitemlevlDis = true;
            } else {
                  this.IsitemlevlDis = false;
            }
      }
      // for show and hide packing feature
      showpacking() {
            this.IsPkgitem = true;
            let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
            if (pkg == "true") {
                  this.IsPkgitem = true;
            } else {
                  this.IsPkgitem = false;
                  //this.goodReceiptItems.GoodReceiptItemValidator.controls["PackingQuantity"].disable();
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
                        this.userName = $event.Data.UserName;
                        this.time = $event.Data.CreatedOn;
                        this.showGRPopUp = true;
                        break;
                  }
                  default:
                        break;
            }
      }

      OnGRPopUpClose() {
            this.showGRPopUp = false;
      }

      SupplierChange($event) {
            this.supplierId = $event.SupplierId;
      }
      public filterlist() {
            this.supplierId = this.currentSupplier.SupplierId;
            if (this.fromDate && this.toDate) {
                  this.fromDate = moment(this.fromDate).add(this.fromDay, 'days').format('YYYY-MM-DD');
                  this.toDate = moment(this.toDate).add(-this.toDay, 'days').format('YYYY-MM-DD');

                  this.newGoodsReceiptList = [];
                  this.filterGoodsReceiptList.forEach(list => {
                        let selPharmDate = moment(list.CreatedOn).format('YYYY-MM-DD');
                        let isGreterThanFrom = selPharmDate <= moment(this.fromDate).format('YYYY-MM-DD');
                        let isSmallerThanTo = selPharmDate >= moment(this.toDate).format('YYYY-MM-DD')


                        if (isGreterThanFrom && isSmallerThanTo && list.SupplierId == this.supplierId) {

                              var date2 = new Date(list.GoodReceiptDate);
                              var date1 = new Date(moment().format('YYYY-MM-DD'));
                              var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                              list.AgingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

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
            this.showGRPopUp = false;
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
      //TODO: Edit Receipt is not required, please condfirm and remove this function
      editReceipt(flag: boolean) {
            if (flag) {
                  this.msgBoxServ.showMessage("Access Denied", ["This receipt has been transfered to accounting.", "Further editing is forbidden."]);
            }
            else {
                  this.pharmacyService.GRId = this.currentGRdetails.GoodReceiptId;
                  this.router.navigate(['/Pharmacy/Order/GoodsReceiptItems']);
            }
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

