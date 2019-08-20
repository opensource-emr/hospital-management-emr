import { Component, Input, Output } from "@angular/core";
import { PharmacyReceiptModel } from '../shared/pharmacy-receipt.model';
import { CoreService } from "../../core/shared/core.service";
//import { PharmacyBLService } from "../shared/pharmacy.bl.service";
//import { CFGParameterModel } from "../../settings/shared/cfg-parameter.model";
//import { MessageboxService } from "../../shared/messagebox/messagebox.service";

@Component({
  selector: "pharmacy-receipt",
  templateUrl: "./pharmacy-receipt.html"
})
export class PharmacyReceiptComponent {

  @Input("receipt")
  public receipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public receiptPrintNo = null;
  //@Input("parameter")
  //public parameter: CFGParameterModel = new CFGParameterModel();

  @Input("showPrintBtn")
  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
    msgBoxServ: any;
    pharmacyBLService: any;

  constructor(public coreService: CoreService) {
    this.GetPharmacyBillingHeaderParameter();

  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();

    let printCount = this.receipt.PrintCount + 1;
    let recptNo = this.receipt.ReceiptNo;
    this.receiptPrintNo = "PH" + this.receipt.ReceiptPrintNo;

    this.pharmacyBLService.PutPrintCount(printCount, recptNo)
      .subscribe(res => {
        if (res.Status == "OK") {

        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  ngOnInit() {


    this.patientQRCodeInfo = `Name: ` + this.receipt.Patient.ShortName + `
            Hospital No: `+ '[' + this.receipt.Patient.PatientCode + ']' + `
            Invoice No: ` + this.receipt.CurrentFinYear + ` - PH` + this.receipt.ReceiptPrintNo;
    this.showQrCode = true;


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

}
