import { Component, ChangeDetectorRef, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PHRMSupplierModel } from '../../shared/phrm-supplier.model';
import { PHRMGoodsReceiptItemsModel } from '../../shared/phrm-goods-receipt-items.model';
import { PHRMGoodsReceiptModel } from '../../shared/phrm-goods-receipt.model';
import { Router } from '@angular/router'
import { PharmacyService } from '../../shared/pharmacy.service'
import { CoreService } from '../../../core/shared/core.service'
import { PharmacyBLService } from '../../shared/pharmacy.bl.service'
import * as moment from 'moment';
@Component({
      selector: "goods-receipt-view",
      templateUrl: "./phrm-goods-receipt-view.html",
      styleUrls: ["./phrm-goods-receipt-view.css"]
})
export class PHRMGoodReceiptViewComponent implements OnInit {
      @Input('goodsReceiptId') goodsReceiptId: number;
      @Input("showPopUp") showPopUp: boolean;
      @Input("canUserModify") canUserModify: boolean;
      public showConfirmationBox: boolean;
      @Output("call-back-close") CallBackClose: EventEmitter<any> = new EventEmitter();
      currentGR: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
      headerDetail: { hospitalName, address, email, PANno, tel, DDA };

      isItemLevelDiscountEnabled: boolean;
      IsPackagingItem: boolean;

      constructor(public coreService: CoreService,
            public pharmacyBLService: PharmacyBLService,
            public pharmacyService: PharmacyService,
            public changeDetector: ChangeDetectorRef,
            public msgBox: MessageboxService,
            public router: Router) {
            this.GetGoodsReceiptDetail
            this.GetPharmacyHeaderParameter();
            this.showItemLevelDiscount();
            this.showpacking();
      }
      ngOnInit(): void {
            this.GetGoodsReceiptDetail();
      }
      GetGoodsReceiptDetail() {
            this.pharmacyBLService.GetGRDetailsByGRId(this.goodsReceiptId)
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.currentGR = res.Results.goodReceipt;
                              //this.currentGR.CancelledOn = new Date();
                              this.currentGR.CancelledOn = moment(res.Results.goodReceipt.CancelledOn).format('lll')
                              this.canUserModify = (this.canUserModify && (this.currentGR.IsCancel == false));
                        }
                        else {
                              this.msgBox.showMessage("Failed", ["Failed to load data."]);
                        }
                  }, err => {
                        console.log(err);
                        this.msgBox.showMessage("Failed", ["Failed to load data."]);
                  })
      }

      GetPharmacyHeaderParameter() {
            var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
            if (paramValue) {
                  this.headerDetail = JSON.parse(paramValue);
            }
            else {
                  this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
            }
      }
      Close() {
            this.showPopUp = false;
            this.CallBackClose.emit();
      }

      printGoodReciept() {
            let popupWinindow;
            var printContents = document.getElementById("print-good-reciept").innerHTML;
            popupWinindow = window.open('', '_blank', 'width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();
            popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

            popupWinindow.document.close();


      }


      //show or hide GR item level discount
      showItemLevelDiscount() {
            this.isItemLevelDiscountEnabled = true;
            let itmdis = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyItemlvlDiscount" && p.ParameterGroupName == "Pharmacy").ParameterValue;
            if (itmdis == "true") {
                  this.isItemLevelDiscountEnabled = true;
            } else {
                  this.isItemLevelDiscountEnabled = false;
            }
      }
      // for show and hide packing feature
      showpacking() {
            this.IsPackagingItem = true;
            let pkg = this.coreService.Parameters.find((p) => p.ParameterName == "PharmacyGRpacking" && p.ParameterGroupName == "Pharmacy").ParameterValue;
            if (pkg == "true") {
                  this.IsPackagingItem = true;
            } else {
                  this.IsPackagingItem = false;
            }
      }
      //Confirmation for Good Receipt Cancel
      cancelGoodsReciept() {
            let printAgain: boolean = true;
            this.showConfirmationBox = true;
            // let cancel_msg = "NOTE !!! Do you want to cancel Good Receipt?";
            // printAgain = window.confirm(cancel_msg);
            // if (printAgain) {
            //       this.cancelGR();
            // }
      }
      //Good Receipt Cancellation Method
      cancelGR() {
            this.pharmacyBLService.CancelGoodsReceipt(this.goodsReceiptId, this.currentGR.CancelRemarks)
                  .subscribe(
                        res => {
                              if (res.Status == "OK") {
                                    this.currentGR.IsCancel = true;
                                    this.showConfirmationBox = false;
                                   // this.cancelledByUser = 
                                    this.msgBox.showMessage("success", ["Goods Receipt Canceled."]);
                              } else {
                                    this.msgBox.showMessage("error", ["Goods Receipt Cancelation Failed!!...Some items are already comsumed."]);
                              }
                        },
                        err => {
                              this.msgBox.showMessage("error", [err.ErrorMessage]);
                        });
      }
      editReceipt(flag: boolean) {
            if (flag) {
                  this.msgBox.showMessage("Access Denied", ["This receipt has been transfered to accounting.", "Further editing is forbidden."]);
            }
            else {
                  this.pharmacyService.GRId = this.currentGR.GoodReceiptId;
                  this.router.navigate(['/Pharmacy/Order/GoodsReceiptItems']);
            }
      }
}