import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText } from '../../../shared/shared-enums';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { PHRMPurchaseOrder } from '../../shared/phrm-purchase-order.model';
import { PHRMSupplierModel } from '../../shared/phrm-supplier.model';
import { PharmacyPOService } from '../pharmacy-po.service';

@Component({
  selector: 'app-phrm-po-view-np',
  templateUrl: './phrm-po-view-np.component.html',
  styleUrls: ['./phrm-po-view-np.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PhrmPoViewNpComponent implements OnInit {

  public PopupClose: boolean;
  @Input("purchaseOrderId") purchaseOrderId: number;
  @Input("showPopUp") showPopUp: boolean;
  @Output("call-back-close") CallBackClose: EventEmitter<any> = new EventEmitter();
  @Output("call-back-edit") CallBackEdit: EventEmitter<any> = new EventEmitter();
  public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
  public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  public showPrint: boolean;
  public printDetaiils: any;
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  constructor(public pharmacyBLService: PharmacyBLService, public pharmacyPOService: PharmacyPOService,
    public router: Router, public coreService: CoreService,
    public msgBox: MessageboxService) {

  }

  ngOnInit() {
    this.GetPurchaseOrderDetail();
    this.GetPharmacyReceiptHeaderParameter();
  }

  Close() {
    this.showPopUp = false;
    this.CallBackClose.emit();
  }
  GetPurchaseOrderDetail() {
    this.pharmacyBLService.GetPHRMPOItemsByPOId(this.purchaseOrderId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.currentPO = res.Results.Order;
          this.currentPO.PHRMPurchaseOrderItems = res.Results.OrderItems;
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load data."]);
        }
      }, err => {
        this.msgBox.showMessage("Failed", ["Failed to load data."]);
      }
      );
  }
  EditPO() {
    this.pharmacyPOService._PurchaseOrderId = this.purchaseOrderId;
    this.CallBackEdit.emit(this.purchaseOrderId);
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
  GetPharmacyReceiptHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for Pharmacy receipt Header"]);
  }
}
