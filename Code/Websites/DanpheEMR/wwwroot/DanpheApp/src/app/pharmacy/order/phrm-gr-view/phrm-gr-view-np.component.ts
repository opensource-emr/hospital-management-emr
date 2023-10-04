import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PharmacyService } from '../../shared/pharmacy.service';
import { PHRMGoodsReceiptModel } from '../../shared/phrm-goods-receipt.model';


@Component({
      selector: 'app-phrm-gr-view-np',
      templateUrl: './phrm-gr-view-np.component.html',
      styleUrls: ['./phrm-gr-view-np.component.css'],
      host: { '(window:keydown)': 'hotkeys($event)' }
})

export class PhrmGRViewNpComponent implements OnInit, OnDestroy {

      @Input("goodsReceiptId") goodsReceiptId: number;
      @Input("showPopUp") showPopUp: boolean;
      @Output('gr-cancel-event') grCancelEvent: EventEmitter<Object> = new EventEmitter<Object>();
      @Output('popup-close-event') popUpCloseEvent: EventEmitter<Object> = new EventEmitter<Object>();
      @Input("canUserModify") canUserModify: boolean;
      @Input("isGRCancelled") isGRCancelled: boolean;
      public currentGR: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
      public showPrint: boolean;
      public showConfirmationPopUp: boolean = false;
      public printDetaiils: any;
      public cancelForm = new FormGroup({ CancelRemarks: new FormControl('', Validators.required) });
      cancelRemarks: string = "";
      public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

      constructor(public pharmacyBLService: PharmacyBLService, public msgBox: MessageboxService, public pharmacyService: PharmacyService, public router: Router, public coreService: CoreService) {

      }
      ngOnInit() {
            this.GetGoodsReceiptDetail();
            this.SetFocusById("btnPrintRecipt");
            this.GetPharmacyReceiptHeaderParameter();
      }
      ngOnDestroy(): void {
            this.showPrint = false;
      }
      Close() {
            //TODO: Close the pop up and throw the output event to the parent component
            this.showPopUp = false;
            //this.currentGR = null;
            this.popUpCloseEvent.emit();
      }
      GetGoodsReceiptDetail() {
            this.pharmacyBLService.GetGRDetailsByGRId(this.goodsReceiptId, this.isGRCancelled)
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.currentGR = res.Results.goodReceipt;
                              this.currentGR.GoodReceiptDate = moment(this.currentGR.GoodReceiptDate).format('YYYY-MM-DD');
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
      print() {
            this.printDetaiils = document.getElementById("printpage");
            this.showPrint = true;
      }
      callBackPrint() {
            this.printDetaiils = null;
            this.showPrint = false;
      }
      public hotkeys(event) {
            //For ESC key => close the pop up
            if (event.keyCode == 27) {
                  this.Close();
            }
      }
      SetFocusById(IdToBeFocused: string) {
            window.setTimeout(function () {
                  let elemToFocus = document.getElementById(IdToBeFocused);
                  if (elemToFocus != null && elemToFocus != undefined) {
                        elemToFocus.focus();
                  }
            }, 20);
      }
      //Confirmation for Good Receipt Cancel
      // cancelGoodsReciept() {
      //       let printAgain: boolean = true;
      //       let cancel_msg = "NOTE !!! Do you want to cancel Good Receipt?";
      //       printAgain = window.confirm(cancel_msg);
      //       if (printAgain) {
      //             this.cancelGR();
      //       }
      // }

      // Confirmation for Good Receipt Cancel
      cancelGoodsReciept() {
            this.showConfirmationPopUp = true;
      }

      //Good Receipt Cancellation Method
      cancelGR() {
            for (var b in this.cancelForm.controls) {
                  this.cancelForm.controls[b].markAsDirty();
                  this.cancelForm.controls[b].updateValueAndValidity();
            }
            if (this.cancelForm.invalid) {
                  this.msgBox.showMessage("Failed", ["Remarks is required for cancelling."])
            }
            else {
                  this.cancelRemarks = this.cancelForm.get('CancelRemarks').value;
                  this.pharmacyBLService.PostGoodsReceiptCancelDetail(this.goodsReceiptId, this.cancelRemarks)
                        .subscribe(
                              res => {
                                    if (res.Status == "OK") {
                                          this.currentGR.IsCancel = true;
                                          this.msgBox.showMessage("success", ["Goods Receipt Cancelled."]);
                                          this.grCancelEvent.emit({ event: 'grCancel', goodsReceiptId: this.goodsReceiptId});
                                          this.showConfirmationPopUp = false;
                                          this.isGRCancelled = true;
                                          this.GetGoodsReceiptDetail();
                                    } else {
                                          var errorMessage = res.ErrorMessage as string;
                                          errorMessage = errorMessage.substring(0, 200);
                                          this.msgBox.showMessage("error", [errorMessage + ".."]);
                                    }
                              },
                              err => {
                                    this.msgBox.showMessage("error", [err.ErrorMessage]);
                              });
            }
      }

      
      editReceipt(flag: boolean) {
            if (flag) {
                  this.msgBox.showMessage("Access Denied", ["This receipt has been transfered to accounting.", "Further editing is forbidden."]);
            }
            else {
                  this.pharmacyService.GRId = this.goodsReceiptId;
                  this.router.navigate(['/Pharmacy/Order/GoodsReceiptItems']);
            }
      }

      //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
      GetPharmacyReceiptHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
        if (paramValue)
          this.headerDetail = JSON.parse(paramValue);
        else
          this.msgBox.showMessage("error", ["Please enter parameter values for Pharmacy receipt Header"]);
      }
    
}