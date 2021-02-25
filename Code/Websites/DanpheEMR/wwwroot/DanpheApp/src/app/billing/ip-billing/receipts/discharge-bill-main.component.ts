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
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
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
  public showDischargeBillSummary: boolean = true;
  public showDischargeBillBreakup: boolean = false;
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
  @Input("LastBedQty")
  public LastBedQty: number = 0;
  @Input("LastBedItem")
  public LastBedItem: number = 0;
  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public AmountType: string = "";//this.billStatus.toLocaleLowerCase() != "paid" ? "Amount to be Paid" : "Paid Amount";
  public ServiceDepartmentIdFromParametes: number = 0;
  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public CoreService: CoreService,
  ) {
    this.setCheckOutParameter();
    this.ServiceDepartmentIdFromParametes = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "Bed_Charges_SevDeptId").ParameterValue;
    this.SetAutoBedAndAutoBillItemParameters();
  }

  //this is the expected format of the autobed parameter.. 
  public autoBedBillParam = { DoAutoAddBillingItems: false, DoAutoAddBedItem: false, ItemList: [] };
  //sud"7-Oct-2020: This parameter value will be used for bed duration calculation
  SetAutoBedAndAutoBillItemParameters() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "AutoAddBillingItems");
    if (param && param.ParameterValue) {
      this.autoBedBillParam = JSON.parse(param.ParameterValue);
    }
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
          if (this.dischargeBill.BillingTransactionDetail != null) {

            if (this.dischargeBill.BillingTransactionDetail.ExchangeRate != null && this.dischargeBill.BillingTransactionDetail.ExchangeRate != 0) {
              this.ExchangeRate = this.dischargeBill.BillingTransactionDetail.ExchangeRate;
              this.TotalAmountInUSD = (this.dischargeBill.BillingTransactionDetail.TotalAmount / this.ExchangeRate);
            }

            if (this.dischargeBill.BillingTransactionDetail.PaymentMode && this.dischargeBill.BillingTransactionDetail.PaymentMode.toLocaleLowerCase() != "credit") {
              this.AmountType = "Paid Amount";
            } else {
              this.AmountType = "Amount to be Paid";
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
          this.UpdateLastBedQty();
          this.GroupItems();
          //console.log(this.dischargeBill);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
          //console.log(res.ErrorMessage);
        }
      });
  }
  public UpdateLastBedQty() {
    for (var i = 0; i < this.billItems.length; i++) {
      // Dinesh/ Sanjit: Previously only compared with itemid, now compared with servicedepartmentId too
      if (this.billItems[i].ServiceDepartmentId == this.ServiceDepartmentIdFromParametes && this.billItems[i].ItemId == this.LastBedItem && this.billItems[i].IsEdited == false) {
        this.billItems[i].Quantity = this.LastBedQty;
        this.billItems[i].SubTotal = this.billItems[i].Price * this.billItems[i].Quantity;
        this.billItems[i].TotalAmount = this.billItems[i].Price * this.billItems[i].Quantity;
      }
      if (this.billItems[i].ItemGroupName == "MEDICAL RESIDENT AND NURSING" && this.billItems[i].IsEdited == false) {
        this.billItems[i].Quantity = this.LastBedQty;
        this.billItems[i].SubTotal = this.billItems[i].Price * this.billItems[i].Quantity;
        this.billItems[i].TotalAmount = this.billItems[i].Price * this.billItems[i].Quantity;
      }

      if (this.billItems[i].Quantity == 0) {
        this.billItems.splice(i, 1);
        i--;
      }
    }
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
      //if (itemGroup.ItemGroupName.toLowerCase() == "doctor visit charges") {
      //  item = itemGroup.Items.find(a => a.DoctorId == billItem.DoctorId);
      //}
      //else {
      //  item = itemGroup.Items.find(a => a.ItemId == billItem.ItemId);
      //}
      if (itemGroup.ItemGroupName != 'BED CHARGES') {
        item = itemGroup.Items.find(a => a.DoctorId == billItem.DoctorId && a.ItemId == billItem.ItemId);
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

      //console.log("logged from : ip-discharge bill main for testing: ");
      //console.log(this.dischargeBill.BillingTransactionDetail);
      //console.log(this.billingTxnId);

      //sud:30Sept'19--send billingtxn id instead of receipt number.
      this.billingBLService.PutPrintCount(printCount, this.billingTxnId)
        .subscribe(res => {
          if (res.Status == "OK") {

          }
          else {

            //this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
  }
  LoadPatientBillingSummary(patientId: number, patientVisitId: number) {
    this.dlService.Read("/api/IpBilling?reqType=pat-pending-items&patientId=" + this.patientId + "&ipVisitId=" + this.ipVisitId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.admissionInfo = res.Results.AdmissionInfo;
          this.admissionInfo.AdmittedOn = this.admissionInfo.AdmittedOn;
          this.admissionInfo.DischargedOn = moment(this.admissionInfo.DischargedOn).format('YYYY-MM-DDTHH:mm:ss');
          this.filteredPendingItems = res.Results.PendingBillItems;
        }
        else {
          this.msgBoxServ.showMessage("failed", [" Unable to get bill summary."]);
          console.log(res.ErrorMessage);
        }
      });
  }


  public calculateAdmittedDays() {
    //calculate the days again only if DoAutoAddBedItem is true..
    if (this.autoBedBillParam.DoAutoAddBedItem) {
      let dischargeDate = this.dischargeBill.AdmissionDetail.DischargeDate;
      if (this.billType == "estimation") {
        dischargeDate = this.estDischargeDate;
      }
      this.checkouttimeparameter = moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("HH:mm");

      let onedayformatparameter = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "OneDayFormat").ParameterValue;

      var duration;
      if (onedayformatparameter === "00:00") {
        duration = CommonFunctions.calculateADTBedDuration(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
      }
      if (onedayformatparameter === "24:00") {
        duration = this.calculateADTBedDurations(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
      }
      if (onedayformatparameter === "skip") {
        duration = this.calculateADTBedDurationSkip(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
      }


      // remove hour from length of stay
      let checkouttime = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime").ParameterValue;
      let checkouttimeincrement = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTimeIncremental").ParameterValue;
      let checkouttimeincremental = parseFloat(checkouttimeincrement);
      //let bedEndDate = moment(dischargeDate).format("YYYY-MM-DD HH:mm");
      let bedEndDate = moment(dischargeDate).format("HH:mm");
      let bedEndTimeValues: Array<string> = bedEndDate.split(":");
      let bedEndHour = parseInt(bedEndTimeValues[0]);
      let chkOutTimeValues: Array<string> = checkouttime.split(":");
      let chkOutHour = parseInt(chkOutTimeValues[0]);

      let StartEndDateDay = parseInt(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format('D'));
      let date = new Date();
      let newdate = moment(date).format('YYYY-MM-DD HH:mm');
      let day = parseInt(moment(newdate).format('D'));

      if (bedEndHour >= chkOutHour && StartEndDateDay != day) {
        if (duration.days > 0 && duration.hours)
          this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + checkouttimeincremental + ' day ';

        else if (duration.days && !duration.hours)
          this.dischargeBill.AdmissionDetail.LengthOfStay = (duration.days + checkouttimeincremental).toString() + ' day';

        else
          this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';
      }
      else {
        if (duration.days > 0 && duration.hours)
          this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + ' day  ';
        else if (duration.days && !duration.hours)
          this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days.toString() + ' day';

        else
          this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';
      }
    }
  }

  public calculateADTBedDurations(inDate, ipCheckoutDate, checkouttimeparameter): { days: number, hours: number, checkouttimeparameter: string } {
    //let checkoutDate = ipCheckoutDate;
    let chkOutTimeValues: Array<string> = checkouttimeparameter.split(":");
    let chkOutHour = parseInt(chkOutTimeValues[0]);
    let chkOutMinute = chkOutTimeValues.length > 1 ? parseInt(chkOutTimeValues[1]) : 0;
    var totalDays = 1;
    if (!ipCheckoutDate) {
      ipCheckoutDate = moment(new Date);
      totalDays = 1;
    }
    let InDate = moment(inDate).format('YYYY-MM-DD HH:mm');
    let InDateYear = moment(InDate).year();
    let InDateMonth = parseInt(moment(InDate).format('M'));
    let InDateDay = parseInt(moment(InDate).format('D'));
    let CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
    let CheckoutYear = moment(CheckoutDate).year();
    let CheckoutMonth = parseInt(moment(CheckoutDate).format('M'));
    let CheckoutDay = parseInt(moment(CheckoutDate).format('D'));
    if (CheckoutYear == InDateYear && CheckoutMonth == InDateMonth && CheckoutDay == InDateDay) {
      CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
    }
    else {
      //CheckoutDate = moment(ipCheckoutDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
      InDate = moment(inDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
      CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
    }
    for (let indate = moment(InDate); indate.diff(moment(CheckoutDate), 'days') < 0; indate.add(1, 'days')) {
      let admittedDate = moment(indate).format("HH:mm");
      let admittedDateValues: Array<string> = admittedDate.split(":");
      let admittedHour = parseInt(admittedDateValues[0]);
      for (let hr = admittedHour; (24 - hr) >= 0; hr++) {
        if (24 - hr == 0) {
          totalDays += 1;
        }
      }

    }
    return { days: totalDays, hours: 0, checkouttimeparameter };
  }
  public calculateADTBedDurationSkip(inDate, ipCheckoutDate, checkouttimeparameter): { days: number, hours: number, checkouttimeparameter: string } {
    // let checkoutDate = ipCheckoutDate;
    let chkOutTimeValues: Array<string> = checkouttimeparameter.split(":");
    let chkOutHour = parseInt(chkOutTimeValues[0]);
    let chkOutMinute = chkOutTimeValues.length > 1 ? parseInt(chkOutTimeValues[1]) : 0;
    var totalDays = 1;
    if (!ipCheckoutDate) {
      ipCheckoutDate = moment(new Date);
      totalDays = 1;
    }
    let InDate = moment(inDate).format('YYYY-MM-DD HH:mm');
    let InDateYear = moment(InDate).year();
    let InDateMonth = parseInt(moment(InDate).format('M'));
    let InDateDay = parseInt(moment(InDate).format('D'));
    let CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
    let CheckoutYear = moment(CheckoutDate).year();
    let CheckoutMonth = parseInt(moment(CheckoutDate).format('M'));
    let CheckoutDay = parseInt(moment(CheckoutDate).format('D'));
    if (CheckoutYear == InDateYear && CheckoutMonth == InDateMonth && CheckoutDay == InDateDay) {
      CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
    }
    else {

      CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
      InDate = moment(InDate).add(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
    }
    for (let indate = moment(InDate); indate.diff(moment(CheckoutDate), 'days') < 0; indate.add(1, 'days')) {
      let admittedDate = moment(indate).format("HH:mm");
      let admittedDateValues: Array<string> = admittedDate.split(":");
      let admittedHour = parseInt(admittedDateValues[0]);
      for (let hr = admittedHour; (24 - hr) >= 0; hr++) {
        if (24 - hr == 0) {
          totalDays += 1;
        }
      }

    }
    return { days: totalDays, hours: 0, checkouttimeparameter };
  }
}
