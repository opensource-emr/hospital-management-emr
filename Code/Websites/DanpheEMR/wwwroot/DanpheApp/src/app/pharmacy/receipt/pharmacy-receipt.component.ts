import { Component, Input, ChangeDetectorRef, EventEmitter, Output } from "@angular/core";
import { PharmacyReceiptModel } from '../shared/pharmacy-receipt.model';
import { CoreService } from "../../core/shared/core.service";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
//import { PharmacyBLService } from "../shared/pharmacy.bl.service";
//import { CFGParameterModel } from "../../settings/shared/cfg-parameter.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { PatientService } from "../../patients/shared/patient.service";
import { PharmacyService } from "../shared/pharmacy.service";
import { PHRMInvoiceReturnItemsModel } from "../shared/phrm-invoice-return-items.model";
import { RouteFromService } from "../../shared/routefrom.service";
import { Router } from '@angular/router'
import { PHRMInvoiceReturnModel } from "../shared/phrm-invoice-return.model ";

@Component({
  selector: "pharmacy-receipt",
  templateUrl: "./pharmacy-receipt.html"
})
export class PharmacyReceiptComponent {
  public BillGenerate: number = 1;
  public patient: any;
  //for show and hide item level discount features
  IsitemlevlDis: boolean = false;
  showDis: boolean;
  //public patientService: PatientService;
  public salesReturn: PHRMInvoiceReturnModel = new PHRMInvoiceReturnModel();
  public saleReturnModelList: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
  @Input("receipt")
  public receipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public receiptPrintNo = null;

  @Input("BillGenerate")
  public set billgenerateindex(val: number) {
    this.BillGenerate = val ? val : 1;
  }

  @Input("showPrintBtn")
  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public msgBoxServ: any;
  public isRealPrint: boolean = false;
  @Output("call-back-print") callBackPrint: EventEmitter<any> = new EventEmitter();
  constructor(public coreService: CoreService,
    public msgserv: MessageboxService,
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public routeFromService: RouteFromService,
    public patientService: PatientService,
    public router: Router, public messageboxService: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.GetPharmacyBillingHeaderParameter();
    this.showitemlvldiscount();

  }

  //sud:08Dec'20--to close the background page on Browser-Popup-Window (similar to accounting.)
  // public showPrintPopup: boolean = false;
  // public printContentForPopup: string = "";

  print() {
    let popupWinindow;
    var printContents = '';
    for (var i = 1; i <= this.BillGenerate; i++) {
      printContents = printContents + document.getElementById("printpage").innerHTML;
    }


    // this.showPrintPopup = false;
    // this.printContentForPopup = null;
    // this.changeDetector.detectChanges();
    // this.printContentForPopup = printContents;
    // this.showPrintPopup = true;


    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();

    let printCount = this.receipt.PrintCount + 1;
    let recptNo = this.receipt.ReceiptNo;
    this.receiptPrintNo = "PH" + this.receipt.ReceiptPrintNo;

    //using same logic as that in billing to update receipt print count.... 
    this.pharmacyBLService.PutPrintCount(printCount, recptNo).finally(() => { this.callBackPrint.emit() })
      .subscribe();

  }

  ngOnInit() {

    this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
            Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFinYear + ` - PH` + this.receipt.ReceiptPrintNo;
    if (this.receipt.Patient.PANNumber == null || this.receipt.Patient.PANNumber == "") {
      this.receipt.Patient.PANNumber = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
    }
    this.showQrCode = true;
    if (this.receipt.DiscountAmount > 0) {
      this.showDis = true;
    }
    for (let index = 0; index < this.receipt.InvoiceItems.length; index++) {
      if (this.receipt.InvoiceItems[index].DiscountAmount > 0) {
        this.showDis = true;
      }
    }

    //call this to show print button, else it's not showing.. 
    this.changeDetector.detectChanges();
    //set focus on print receipt button
    this.SetFocusOnButton('btnPrintPhrmInvoice');

  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let btn = <HTMLInputElement>document.getElementById(idToSelect);
      btn.focus();
    }
  }

  ngOnChange() {
    this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
            Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFinYear + ` - PH` + this.receipt.ReceiptNo;
    this.showQrCode = true;
  }
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetPharmacyBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  //show or hide  item level discount
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

  CreateCopyForResale() {
    try {
      if (this.receipt.Patient) {
        this.patientService.setGlobal(<any>this.receipt.Patient);
        let returnItems = this.pharmacyService.CreateNewGlobalReturnSaleTransaction();
        returnItems = Object.assign(returnItems, this.receipt.InvoiceItems);
        this.routeFromService.RouteFrom = "returnedBill";
        this.router.navigate(['/Pharmacy/Sale/New']);
      } else {
        this.messageboxService.showMessage("notice", ['please select patient or items.']);
      }

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
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


}
