import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { DLService } from "../../../shared/dl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DischargeBillVM, BillItemVM, BillItemSummary } from "../shared/discharge-bill.view.models";
import { BillingBLService } from "../../shared/billing.bl.service";
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service"
import { BillingReceiptModel } from '../../shared/billing-receipt.model';
@Component({
  selector: "discharge-bill-main",
  templateUrl: "./discharge-bill-main.html"
})
export class DischargeBillMainComponent implements OnInit {

  @Input("receipt")
  public receipt: BillingReceiptModel = new BillingReceiptModel();
  @Input("admissionInfo")
  public admissionInfo: any = null;
  @Input("patientId")
  public patientId: number;// = 15202;
  @Input("ipVisitId")
  public ipVisitId: number;// = 17830;
  @Input("billingTxnId")
  public billingTxnId: number = null;
  @Input("billStatus")
  public billStatus: string;
  @Input("admissionInfo")

  public dischargeBill: DischargeBillVM = new DischargeBillVM();
  public billItems: Array<BillItemVM>;
  public showDischargeBillSummary: boolean = false;
  public showDischargeBillBreakup: boolean = true;
  @Input("billType")
  public billType: string;
  public printDate: string;


  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public showDate: boolean = false;
  @Input("estimated-dischargeDate")
  public estDischargeDate: string;

  @Input("isDuplicate")
  public isDuplicate: boolean = false;
  @Input()
  public estimatedDiscountPercent: number = 0;
  @Input()
  public procedureType: string;
  public showReturnWaterMark: boolean = false;
  public checkouttimeparameter: string;//sud:8Feb2019--its format example is: 13:00 (string)
  //for the foreigner customers
  @Input("TotalAmountInUSD")
  public TotalAmountInUSD: number = 0;
  @Input("ExchangeRate")
  public ExchangeRate: number = 0;
  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public CoreService: CoreService,
  ) {
    this.setCheckOutParameter();
  }

  setCheckOutParameter() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime");
    if (param) {
      this.checkouttimeparameter = param.ParameterValue;
    }
  }
  ngOnInit() {
    if (this.patientId && this.ipVisitId) {
      this.GetADTNDepositDetails();
      this.GetDischargeBill();
      this.printDate = moment().format('YYYY-MM-DD HH:mm');
    }
  }
  public GetADTNDepositDetails() {
    this.billingBLService.GetAdditionalInfoForDischarge(this.ipVisitId, this.billingTxnId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.dischargeBill.AdmissionDetail = res.Results.AdmissionInfo;
          this.dischargeBill.DepositDetails = res.Results.DepositInfo;
          this.dischargeBill.BillingTransactionDetail = res.Results.BillingTxnDetail;
          if(this.dischargeBill.BillingTransactionDetail!=null){

          if (this.dischargeBill.BillingTransactionDetail.ExchangeRate != null && this.dischargeBill.BillingTransactionDetail.ExchangeRate != 0) {
            this.ExchangeRate = this.dischargeBill.BillingTransactionDetail.ExchangeRate;
            this.TotalAmountInUSD = (this.dischargeBill.BillingTransactionDetail.TotalAmount / this.ExchangeRate);
          }
}
          this.dischargeBill.PatientDetail = res.Results.PatientDetail;
          this.calculateAdmittedDays();
          if (this.dischargeBill.DepositDetails.length) {
            this.dischargeBill.DepositBalance = this.dischargeBill.DepositDetails[this.dischargeBill.DepositDetails.length - 1].Balance;
          }
          this.setQRValues();
          this.showReturnWaterMark = this.dischargeBill.BillingTransactionDetail ? this.dischargeBill.BillingTransactionDetail.ReturnStatus : false;
          this.dischargeBill.AdmissionDetail.ProcedureType = this.procedureType ? this.procedureType : this.dischargeBill.AdmissionDetail.ProcedureType;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public setQRValues() {
    if (this.billType == "invoice") {
      this.patientQRCodeInfo = `Name: ` + this.dischargeBill.PatientDetail.PatientName + `
            Hospital No: `+ '[' + this.dischargeBill.PatientDetail.HospitalNo + ']' + `
            Invoice No: ` + this.dischargeBill.BillingTransactionDetail.FiscalYear + ` - ` + this.dischargeBill.BillingTransactionDetail.InvoiceNumber;
      this.showQrCode = true;
    }
    else if (this.billType == "estimation") {
      this.patientQRCodeInfo = `Name: ` + this.dischargeBill.PatientDetail.PatientName + `
            Hospital No: `+ '[' + this.dischargeBill.PatientDetail.HospitalNo + ']';
      this.showQrCode = true;
    }

  }
  public GetDischargeBill() {
    this.billingBLService.GetBillItemsForIPReceipt(this.patientId, this.billingTxnId, this.billStatus)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.billItems = res.Results;
          this.GroupItems();
          console.log(this.dischargeBill);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GroupItems() {
    this.billItems.forEach(billItem => {
      let itemGroup = this.dischargeBill.BillItemSummary.find(a => a.ItemGroupName == billItem.ItemGroupName);
      if (!itemGroup) {
        itemGroup = new BillItemSummary();
        itemGroup.ItemGroupName = billItem.ItemGroupName;
        this.dischargeBill.BillItemSummary.push(itemGroup);
      }

      billItem.TotalAmount = CommonFunctions.parseAmount(billItem.SubTotal - billItem.DiscountAmount);
      let invoiceDiscount = CommonFunctions.parseAmount(billItem.TotalAmount * (this.estimatedDiscountPercent / 100));
      billItem.TotalAmount = CommonFunctions.parseAmount(billItem.TotalAmount - (invoiceDiscount ? invoiceDiscount : 0));
      billItem.DiscountAmount = CommonFunctions.parseAmount(billItem.DiscountAmount + (invoiceDiscount ? invoiceDiscount : 0));



      this.dischargeBill.TotalAmount += billItem.TotalAmount;
      itemGroup.TotalAmount += billItem.TotalAmount;
      this.dischargeBill.SubTotal += billItem.SubTotal;
      itemGroup.SubTotal += billItem.SubTotal;
      this.dischargeBill.Tax += billItem.TaxAmount;
      itemGroup.Tax += billItem.TaxAmount;
      this.dischargeBill.Quantity += billItem.Quantity;
      itemGroup.Quantity += billItem.Quantity;
      this.dischargeBill.DiscountAmount += billItem.DiscountAmount;
      itemGroup.DiscountAmount += billItem.DiscountAmount;
      itemGroup.TotalPrice += billItem.Price;
      let item;
      if (itemGroup.ItemGroupName.toLowerCase() == "doctor visit charges") {
        item = itemGroup.Items.find(a => a.DoctorId == billItem.DoctorId);
      }
      else {
        item = itemGroup.Items.find(a => a.ItemId == billItem.ItemId);
      }
      if (item) {
        item.Quantity += billItem.Quantity;
        item.DiscountAmount += billItem.DiscountAmount;
        item.SubTotal += billItem.SubTotal;
        item.TotalAmount += billItem.TotalAmount;
        item.TaxAmount += billItem.TaxAmount;
      }
      else {
        itemGroup.Items.push(billItem);
      }
    });

    this.dischargeBill.TotalAmount = CommonFunctions.parseAmount(this.dischargeBill.TotalAmount);
    this.dischargeBill.SubTotal = CommonFunctions.parseAmount(this.dischargeBill.SubTotal);
    this.dischargeBill.Tax = CommonFunctions.parseAmount(this.dischargeBill.Tax);
    this.dischargeBill.DiscountAmount = CommonFunctions.parseAmount(this.dischargeBill.DiscountAmount);

    this.dischargeBill.BillItemSummary.forEach(group => {
      group.DiscountAmount = CommonFunctions.parseAmount(group.DiscountAmount);
      group.SubTotal = CommonFunctions.parseAmount(group.SubTotal);
      group.Tax = CommonFunctions.parseAmount(group.Tax);
      group.TotalAmount = CommonFunctions.parseAmount(group.TotalAmount);
      group.TotalPrice = CommonFunctions.parseAmount(group.TotalPrice);
    });
  }

  ToggleView() {
    this.showDischargeBillSummary = !this.showDischargeBillSummary;
    this.showDischargeBillBreakup = !this.showDischargeBillBreakup;
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();

    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'


    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();

    //add 1 to existing printcount.
    if (this.dischargeBill.BillingTransactionDetail) { //Yubraj: 18th March 2019
      let printCount = this.dischargeBill.BillingTransactionDetail.PrintCount + 1;
      let recptNo = this.dischargeBill.BillingTransactionDetail.ReceiptNo;


      this.billingBLService.PutPrintCount(printCount, recptNo)
        .subscribe(res => {
          if (res.Status == "OK") {

          }
          else {

            //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
  }

  public calculateAdmittedDays() {
    let dischargeDate = this.dischargeBill.AdmissionDetail.DischargeDate;
    if (this.billType == "estimation") {
      dischargeDate = this.estDischargeDate;
    }
    var duration = CommonFunctions.calculateADTBedDuration(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
    //if (duration.days > 0 && duration.hours)
    //    this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + ' day + ' + duration.hours + ' hour';
    //else if (duration.days && !duration.hours)
    //    this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days.toString() + ' day';
    //else if (!duration.days && duration.hours)
    //    this.dischargeBill.AdmissionDetail.LengthOfStay = duration.hours + ' hour';
    //else
    //    this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';

    // remove hour from length of stay
    if (duration.days > 0 && duration.hours)
      this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + ' day  ';
    else if (duration.days && !duration.hours)
      this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days.toString() + ' day';

    else
      this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';
  }
}
