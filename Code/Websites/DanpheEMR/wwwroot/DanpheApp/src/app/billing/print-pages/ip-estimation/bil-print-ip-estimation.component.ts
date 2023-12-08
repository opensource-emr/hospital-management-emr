import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_Country, ENUM_DanpheHTTPResponseText, ENUM_MembershipTypeName } from "../../../shared/shared-enums";
import { DischargeBillVM } from "../../ip-billing/shared/discharge-bill.view.models";
import { BillingTransactionItem } from "../../shared/billing-transaction-item.model";
import { BillingBLService } from "../../shared/billing.bl.service";
import { BillingService } from "../../shared/billing.service";
import { PharmacyBillItemVM } from "../../shared/discharge-bill.view.model";
import { BillTransactionItemsEstimation_DTO } from "../../shared/dto/bill-transaction-items-estimation.dto";
import { BilPrintBillingSummaryVM } from "../../shared/invoice-print-vms";

@Component({
  selector: "bil-print-ip-estimation",
  templateUrl: "./bil-print-ip-estimation.html"
})
export class BIL_Print_IP_Estimation {

  @Input("patientId")
  public patientId: number;
  @Input("ipVisitId")
  public ipVisitId: number;

  public dischargeBill: DischargeBillVM = new DischargeBillVM();
  // public billItems: Array<BillItemVM>;
  public billItems = new Array<BillTransactionItemsEstimation_DTO>()
  public showDischargeBillSummary: boolean = true;
  public showDischargeBillBreakup: boolean = false;

  public printDate: string;
  public patientQRCodeInfo: string = "";
  public showQrCode: boolean = false;
  public showDate: boolean = false;
  @Input("estimated-dischargeDate")
  public estDischargeDate: string;

  @Input('estimated-discountPercent')
  public estimatedDiscountPercent: number = 0;

  public showReturnWaterMark: boolean = false;
  public checkouttimeparameter: string;//sud:8Feb2019--its format example is: 13:00 (string)
  //for the foreigner customers
  @Input("TotalAmountInUSD")
  public TotalAmountInUSD: number = 0;
  @Input("ExchangeRate")
  public ExchangeRate: number = 0;


  @Output("closeEstimationBill")
  public closeEstimationeBill: EventEmitter<object> = new EventEmitter<object>();

  @Input("DepositBalance")
  public DepositBalance: number = 0;

  @Input("IsDischarged")
  public IsDischarged: boolean = false;
  @Input("is-provisional-discharge")
  public IsProvisionalDischarge: boolean = false;

  public filteredPendingItems: Array<BillingTransactionItem> = [];
  public AmountType: string = "";//this.billStatus.toLocaleLowerCase() != "paid" ? "Amount to be Paid" : "Paid Amount";
  public ServiceDepartmentIdFromParametes: number = 0;

  public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true };
  public InvoiceFooterNoteSettings: any = { ShowFooter: true, ShowEnglish: true, ShowNepali: false, EnglishText: "Please bring this invoice on your next visit.", NepaliText: "कृपया अर्को पटक आउँदा यो बिल अनिवार्य रुपमा लिएर आउनुहोला ।" };

  public currTime: string = "";
  public currentUserName: string = "";
  public hospitalCode: string = "";

  public Enable_Dotmatrix_Printer: boolean;
  public Dotmatrix_Printer = { BillingReceipt: "EPSON" };
  public printerNameSelected: any = null;
  public printerName: string = null;
  public showPrinterChange: boolean = false;
  public dotPrinterDimensions: any;
  public billingDotMatrixPrinters: any;
  public showMunicipality: boolean;
  public CountryNepal: string = ENUM_Country.Nepal;
  public SSFMembershipTypeName: string = ENUM_MembershipTypeName.SSF;
  public ECHSMembershipTypeName: string = ENUM_MembershipTypeName.ECHS;
  public pharmacyBillingItems: PharmacyBillItemVM[] = [];
  pharmacyBillingTotal = { Quantity: 0, SubTotal: 0, DiscountAmount: 0, VATAmount: 0, TotalAmount: 0 }
  billingTotal = { Quantity: 0, SubTotal: 0, DiscountAmount: 0, VATAmount: 0, TotalAmount: 0 }
  currDate: string = null;
  public IsDetailedEstimation: boolean = false;
  public IpBillingSummary = new Array<BilPrintBillingSummaryVM>();

  constructor(public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public billingBLService: BillingBLService,
    public nepaliCalendarServ: NepaliCalendarService,
    public CoreService: CoreService,
    public securityService: SecurityService,
    public billingServ: BillingService, public changeDetector: ChangeDetectorRef) {
    this.currTime = moment().format("HH:mm").toString();
    this.currDate = moment().format("YYYY-MM-DD").toString();
    this.setCheckOutParameter();
    this.ServiceDepartmentIdFromParametes = this.CoreService.Parameters.find(p => p.ParameterGroupName === "ADT" && p.ParameterName === "Bed_Charges_SevDeptId").ParameterValue;
    this.SetAutoBedAndAutoBillItemParameters();
    this.InvoiceDisplaySettings = this.CoreService.GetInvoiceDisplaySettings();
    this.InvoiceFooterNoteSettings = this.CoreService.GetInvoiceFooterNoteSettings();
    this.currentUserName = this.securityService.loggedInUser.UserName;
    this.hospitalCode = this.CoreService.GetHospitalCode();
    if (!this.hospitalCode) {
      this.hospitalCode = "default";
    }
    this.showMunicipality = this.CoreService.ShowMunicipality().ShowMunicipality;
  }

  //this is the expected format of the autobed parameter..
  public autoBedBillParam = { DoAutoAddBillingItems: false, DoAutoAddBedItem: false, ItemList: [] };
  //sud"7-Oct-2020: This parameter value will be used for bed duration calculation
  SetAutoBedAndAutoBillItemParameters() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName === "ADT" && p.ParameterName === "AutoAddBillingItems");
    if (param && param.ParameterValue) {
      this.autoBedBillParam = JSON.parse(param.ParameterValue);
    }
  }

  setCheckOutParameter() {
    var param = this.CoreService.Parameters.find(p => p.ParameterGroupName === "ADT" && p.ParameterName === "CheckoutTime");
    if (param) {
      this.checkouttimeparameter = param.ParameterValue;
    }
  }
  ngOnInit() {
    if (this.patientId && this.ipVisitId) {
      // this.GetADTNDepositDetails();
      // this.GetDischargeBill();
      this.GetEstimateBillDetails();

      this.printDate = moment().format('YYYY-MM-DD HH:mm');
    }
  }

  public ResultFromServer: any; //will give a type later;
  public GetEstimateBillDetails() {
    this.billingBLService.GetEstimateBillDetails(this.patientId, this.ipVisitId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          this.ResultFromServer = res.Results;
          this.dischargeBill.PatientDetail = res.Results.PatientDetail;
          this.dischargeBill.AdmissionDetail = res.Results.AdmissionInfo;
          this.billItems = res.Results.BillItems;
          this.pharmacyBillingItems = [];
          this.pharmacyBillingItems = res.Results.PharmacyPendingBillsItems;
          this.IpBillingSummary = res.Results.IpBillingSummary;
          //this.GroupItems();
          this.GroupItems_New();
          this.setQRValues();
          this.CalculateEstimationAmounts();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GroupItems_New() {

  }

  CalculateEstimationAmounts() {
    let subTotal = 0;
    let discountAmount = 0;
    let totalAmount = 0;
    if (this.billItems.length) {

      this.billingTotal.SubTotal = this.billItems.reduce((acc, item) => acc + item.SubTotal, 0);
      this.billingTotal.DiscountAmount = this.billItems.reduce((acc, item) => acc + item.DiscountAmount, 0);
      this.billingTotal.TotalAmount = this.billItems.reduce((acc, item) => acc + item.TotalAmount, 0);


      subTotal += this.billItems.reduce((acc, item) => acc + item.SubTotal, 0);
      discountAmount += this.billItems.reduce((acc, item) => acc + item.DiscountAmount, 0);
      totalAmount += this.billItems.reduce((acc, item) => acc + item.TotalAmount, 0);
    }
    if (this.pharmacyBillingItems.length) {

      this.pharmacyBillingTotal.SubTotal = CommonFunctions.parsePhrmAmount(this.pharmacyBillingItems.reduce((acc, item) => acc + item.SubTotal, 0));
      this.pharmacyBillingTotal.DiscountAmount = CommonFunctions.parsePhrmAmount(this.pharmacyBillingItems.reduce((acc, item) => acc + item.DiscountAmount, 0));
      this.pharmacyBillingTotal.VATAmount = CommonFunctions.parsePhrmAmount(this.pharmacyBillingItems.reduce((acc, item) => acc + item.VATAmount, 0));
      this.pharmacyBillingTotal.TotalAmount = CommonFunctions.parsePhrmAmount(this.pharmacyBillingItems.reduce((acc, item) => acc + item.TotalAmount, 0));


      subTotal += this.pharmacyBillingItems.reduce((acc, item) => acc + item.SubTotal, 0);
      discountAmount += this.pharmacyBillingItems.reduce((acc, item) => acc + item.DiscountAmount, 0);
      totalAmount += this.pharmacyBillingItems.reduce((acc, item) => acc + item.TotalAmount, 0);
    }

    this.dischargeBill.SubTotal = subTotal;
    this.dischargeBill.DiscountAmount = discountAmount
    this.dischargeBill.TotalAmount = totalAmount;
  }

  SwitchEstimationView($event) {
    if ($event) {
      this.IsDetailedEstimation = !this.IsDetailedEstimation;
    }
  }
  // public GetADTNDepositDetails() {
  //   this.billingBLService.GetAdditionalInfoForDischarge(this.ipVisitId, null)
  //     .subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //         this.dischargeBill.AdmissionDetail = res.Results.AdmissionInfo;
  //         //this.dischargeBill.DepositDetails = res.Results.DepositInfo;
  //         this.dischargeBill.BillingTransactionDetail = res.Results.BillingTxnDetail;
  //         if (this.dischargeBill.BillingTransactionDetail !== null) {

  //           if (this.dischargeBill.BillingTransactionDetail.ExchangeRate !== null && this.dischargeBill.BillingTransactionDetail.ExchangeRate !== 0) {
  //             this.ExchangeRate = this.dischargeBill.BillingTransactionDetail.ExchangeRate;
  //             this.TotalAmountInUSD = (this.dischargeBill.BillingTransactionDetail.TotalAmount / this.ExchangeRate);
  //           }

  //           if (this.dischargeBill.BillingTransactionDetail.PaymentMode && this.dischargeBill.BillingTransactionDetail.PaymentMode.toLocaleLowerCase() !== "credit") {
  //             this.AmountType = "Paid Amount";
  //           } else {
  //             this.AmountType = "Amount to be Paid";
  //           }
  //         }
  //         this.dischargeBill.PatientDetail = res.Results.PatientDetail;
  //         //this.calculateAdmittedDays();

  //         this.setQRValues();
  //         this.showReturnWaterMark = this.dischargeBill.BillingTransactionDetail ? this.dischargeBill.BillingTransactionDetail.ReturnStatus : false;
  //       }
  //       else {
  //         this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
  //         console.log(res.ErrorMessage);
  //       }
  //     });
  // }

  public setQRValues() {
    this.patientQRCodeInfo = `Name: ` + this.dischargeBill.PatientDetail.PatientName + `
            Hospital No: `+ '[' + this.dischargeBill.PatientDetail.HospitalNo + ']';
    this.showQrCode = true;

  }

  // public GetDischargeBill() {
  //   this.billingBLService.GetBillItemsForIPReceipt(this.patientId, null, null)
  //     .subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //         this.billItems = res.Results;
  //         //this.GroupItems();
  //       }
  //       else {
  //         this.msgBoxServ.showMessage("failed", ["Unable to get ADT and deposit details"]);
  //         console.log(res.ErrorMessage);
  //       }
  //     });
  // }


  // public GroupItems() {
  //   for (let i = 0; i < this.billItems.length; i++) {
  //     let itemGroup = this.dischargeBill.BillItemSummary.find(a => a.ItemGroupName == this.billItems[i].ItemGroupName);
  //     if (!itemGroup) {
  //       itemGroup = new BillItemSummary();
  //       itemGroup.ItemGroupName = this.billItems[i].ItemGroupName;
  //       this.dischargeBill.BillItemSummary.push(itemGroup);
  //     }

  //     let item;
  //     if (itemGroup.ItemGroupName !== 'BED CHARGES') {
  //       item = itemGroup.Items.find(a => a.DoctorId == this.billItems[i].DoctorId && a.ItemId == this.billItems[i].ItemId);
  //     }
  //     else {
  //       item = itemGroup.Items.find(a => a.ItemId == this.billItems[i].ItemId);
  //     }
  //     if (item) {
  //       item.Quantity += this.billItems[i].Quantity;
  //       item.DiscountAmount += this.billItems[i].DiscountAmount;
  //       item.SubTotal += this.billItems[i].SubTotal;
  //       item.TotalAmount += this.billItems[i].TotalAmount;
  //       item.TaxAmount += this.billItems[i].TaxAmount;
  //       this.billItems[i].ItemName = null;
  //     }
  //     else {
  //       itemGroup.Items.push(this.billItems[i]);
  //     }
  //   }

  //   this.billItems = this.billItems.filter(a => a.ItemName !== null);

  //   this.CalculateTotals();
  // }

  // public CalculateTotals() {
  //   this.billItems.forEach(billItem => {
  //     let itemGroup = this.dischargeBill.BillItemSummary.find(a => a.ItemGroupName === billItem.ItemGroupName);
  //     if (!itemGroup) {
  //       itemGroup = new BillItemSummary();
  //       itemGroup.ItemGroupName = billItem.ItemGroupName;
  //       this.dischargeBill.BillItemSummary.push(itemGroup);
  //     }

  //     this.dischargeBill.TotalAmount += billItem.TotalAmount ? billItem.TotalAmount : 0;
  //     itemGroup.TotalAmount += billItem.TotalAmount;
  //     this.dischargeBill.SubTotal += billItem.SubTotal;
  //     itemGroup.SubTotal += billItem.SubTotal;
  //     this.dischargeBill.Tax += billItem.TaxAmount;
  //     itemGroup.Tax += billItem.TaxAmount;
  //     this.dischargeBill.Quantity += billItem.Quantity;
  //     itemGroup.Quantity += billItem.Quantity;
  //     this.dischargeBill.DiscountAmount += billItem.DiscountAmount;
  //     itemGroup.DiscountAmount += billItem.DiscountAmount;
  //     itemGroup.TotalPrice += billItem.Price;
  //   });

  //   this.dischargeBill.TotalAmount = CommonFunctions.parseAmount(this.dischargeBill.TotalAmount);
  //   this.dischargeBill.SubTotal = CommonFunctions.parseAmount(this.dischargeBill.SubTotal);
  //   this.dischargeBill.Tax = CommonFunctions.parseAmount(this.dischargeBill.Tax);
  //   this.dischargeBill.DiscountAmount = CommonFunctions.parseAmount(this.dischargeBill.DiscountAmount);

  //   this.dischargeBill.BillItemSummary.forEach(group => {

  //     group.DiscountAmount = CommonFunctions.parseAmount(group.DiscountAmount);
  //     group.SubTotal = CommonFunctions.parseAmount(group.SubTotal);
  //     group.Tax = CommonFunctions.parseAmount(group.Tax);
  //     group.TotalAmount = CommonFunctions.parseAmount(group.TotalAmount);
  //     group.TotalPrice = CommonFunctions.parseAmount(group.TotalPrice);
  //   });
  // }

  //we're assigning these values to separate child component afterwards..
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public print() {
    //Open 'Browser Print' if printer not found or selected printing type is Browser.
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("divEstimationBillPrintPage");
      this.openBrowserPrintWindow = true;
      this.changeDetector.detectChanges();
      //this.router.navigate(['/Billing/SearchPatient']);
      this.closeEstimationeBill.emit({ close: true });
    }
    else if (this.selectedPrinter.PrintingType === ENUM_PrintingType.dotmatrix) {
      //-----qz-tray start----->
      this.CoreService.QzTrayObject.websocket.connect()
        .then(() => {
          return this.CoreService.QzTrayObject.printers.find();
        })
        .then(() => {
          var config = this.CoreService.QzTrayObject.configs.create(this.selectedPrinter.PrinterName);

          let dataToPrint = this.MakeReceipt();
          return this.CoreService.QzTrayObject.print(config, CommonFunctions.GetEpsonPrintDataForPage(dataToPrint, this.selectedPrinter.mh, this.selectedPrinter.ml, this.selectedPrinter.ModelName));

        })
        .catch(function (e) {
          console.error(e);
        })
        .finally(() => {
          // this.router.navigate(['/Billing/SearchPatient']);
          return this.CoreService.QzTrayObject.websocket.disconnect();

        });
      //-----qz-tray end----->
      this.closeEstimationeBill.emit({ close: true });
    }
    else {
      this.msgBoxServ.showMessage('error', ["Printer Not Supported."]);
      return;
    }

  }
  public headerRightColLen: number = 32;
  public nline: any = '\n';
  MakeReceipt() {
    let totalHeight_lines = this.selectedPrinter.Height_Lines;
    let headerGap_lines = this.selectedPrinter.HeaderGap_Lines;
    let horizontalCols = this.selectedPrinter.Width_Lines;
    let headerLeftColLen = horizontalCols - this.headerRightColLen;
    let finalDataToPrint = '';

    let hlen_SN = 8;
    let hlen_unit = 8;
    let hlen_price = 10;
    let hlen_amt = 10;
    let hlen_Particular = horizontalCols - (hlen_SN + hlen_unit + hlen_price + hlen_amt);
    let footerRightColLen = hlen_unit + hlen_price + hlen_amt;
    let footerLeftColLen = horizontalCols - footerRightColLen;


    let headerStr = '';
    let duplicatePrintString = (this.dischargeBill.BillingTransactionDetail && this.dischargeBill.BillingTransactionDetail.PrintCount > 0) ? ' | COPY(' + this.dischargeBill.BillingTransactionDetail.PrintCount + ') OF ORIGINAL' : '';
    let invHdrTxt = '';
    let userName = '';

    invHdrTxt = 'Estimation | Provisional Bill';
    userName = this.currentUserName;

    let addressValue: string = "";
    if (this.dischargeBill.PatientDetail.CountryName === ENUM_Country.Nepal) {
      addressValue = ((this.showMunicipality && this.dischargeBill.PatientDetail.MunicipalityName) ? this.dischargeBill.PatientDetail.MunicipalityName + (this.dischargeBill.PatientDetail.WardNumber ? "-" + this.dischargeBill.PatientDetail.WardNumber : "") + ", " : "") + this.dischargeBill.PatientDetail.CountrySubDivision;
    }
    else {
      addressValue = (this.dischargeBill.PatientDetail.Address ? this.dischargeBill.PatientDetail.Address + ", " : "") + this.dischargeBill.PatientDetail.CountrySubDivision + ", " + this.dischargeBill.PatientDetail.CountryName;
    }

    headerStr += CommonFunctions.GetTextCenterAligned(invHdrTxt + duplicatePrintString, horizontalCols) + this.nline;

    var invoiceNumberStr: string = '';
    var invoiceDateStr: string = '';
    var TransactionDateStr: string = "";
    var methodOfPaymentStr: string = "";
    var localDateStr: string = "";

    TransactionDateStr = CommonFunctions.GetTextFIlledToALength('Print Date:' + moment(this.printDate).format('YYYY-MM-DD'), this.headerRightColLen);
    invoiceDateStr = CommonFunctions.GetTextFIlledToALength('Invoice Date:' + moment(this.printDate).format('YYYY-MM-DD'), this.headerRightColLen);
    localDateStr = CommonFunctions.GetTextFIlledToALength("(" + this.GetLocalDate(this.printDate) + ")", this.headerRightColLen);
    headerStr += CommonFunctions.GetTextFIlledToALength('Hospital No: ' + this.dischargeBill.PatientDetail.HospitalNo, headerLeftColLen) + CommonFunctions.GetTextFIlledToALength('IP No: ' + this.dischargeBill.PatientDetail.InpatientNo, this.headerRightColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Patient Name:' + this.dischargeBill.PatientDetail.PatientName, headerLeftColLen) + invoiceNumberStr + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Age/Sex:' + CommonFunctions.GetFormattedAge(this.dischargeBill.PatientDetail.DateOfBirth) + '/' + this.dischargeBill.PatientDetail.Gender, headerLeftColLen) + TransactionDateStr + this.nline;
    headerStr += CommonFunctions.GetTextFilledToALengthForLongString('Address: ' + addressValue, headerLeftColLen) + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('DOA : ' + moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD"), headerLeftColLen) + invoiceDateStr + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('DOD:' + moment(this.estDischargeDate).format("YYYY-MM-DD"), headerLeftColLen) + localDateStr + this.nline;
    headerStr += CommonFunctions.GetTextFIlledToALength('Room Category:' + this.dischargeBill.AdmissionDetail.RoomType, headerLeftColLen) + methodOfPaymentStr + this.nline;

    headerStr += CommonFunctions.GetHorizontalLineOfLength(horizontalCols);
    finalDataToPrint = finalDataToPrint + headerStr + this.nline;

    //Footer Code
    let totAmtInWords = 'In Words : ' + CommonFunctions.GetNumberInWords(this.dischargeBill.TotalAmount);
    var footerStr = CommonFunctions.GetHorizontalLineOfLength(horizontalCols) + this.nline;
    let amtWordLen = totAmtInWords.length;
    let footerRightColArr = [CommonFunctions.GetTextFIlledToALength('Amount:' + parseFloat(this.dischargeBill.SubTotal.toString()).toFixed(2), footerRightColLen), CommonFunctions.GetTextFIlledToALength('Discount:' + parseFloat(this.dischargeBill.DiscountAmount.toString()).toFixed(2), footerRightColLen),
    CommonFunctions.GetTextFIlledToALength('Grand Total:' + '  ' + parseFloat(this.dischargeBill.TotalAmount.toString()).toFixed(2), footerRightColLen),
    (this.DepositBalance > 0 ? CommonFunctions.GetTextFIlledToALength('Deposit Available:' + ' ' + parseFloat(this.DepositBalance.toString()).toFixed(2), footerRightColLen) : '')];

    footerStr += CommonFunctions.GetNewLineRepeat(1);
    for (let i = 0; i < footerRightColArr.length; i++) {
      let startLen = i * (footerLeftColLen - 8);
      footerStr += CommonFunctions.GetTextFIlledToALength(totAmtInWords.substr(startLen, (footerLeftColLen - 8)), footerLeftColLen) + footerRightColArr[i] + this.nline;
    }
    if (this.dischargeBill.BillingTransactionDetail && this.dischargeBill.BillingTransactionDetail.DepositAvailable > 0) {
      var depositinfo: string = '';
      if (this.dischargeBill.BillingTransactionDetail.TotalAmount > this.dischargeBill.BillingTransactionDetail.DepositAvailable) {
        depositinfo = CommonFunctions.GetTextFIlledToALength('To Be Paid: ' + (this.dischargeBill.BillingTransactionDetail.TotalAmount - this.dischargeBill.BillingTransactionDetail.DepositAvailable).toFixed(2), footerRightColLen)
      }
      else if (this.dischargeBill.BillingTransactionDetail.TotalAmount < this.dischargeBill.BillingTransactionDetail.DepositReturnAmount) {
        depositinfo = CommonFunctions.GetTextFIlledToALength('To be Returned: ' + (this.dischargeBill.BillingTransactionDetail.DepositReturnAmount), footerRightColLen)
      }

      footerStr += CommonFunctions.GetTextFIlledToALength('Deposit:  ' + this.dischargeBill.BillingTransactionDetail.DepositAvailable, footerLeftColLen) + depositinfo + this.nline;
    }
    footerStr += CommonFunctions.GetTextFIlledToALength('User:  ' + userName, footerLeftColLen) + this.nline;
    footerStr += CommonFunctions.GetTextFIlledToALength('Time: ' + this.currTime, footerLeftColLen) + this.nline;
    if (this.dischargeBill.BillingTransactionDetail && this.dischargeBill.BillingTransactionDetail.Remarks)
      footerStr += CommonFunctions.GetTextFIlledToALength('Remarks:  ' + this.dischargeBill.BillingTransactionDetail.Remarks, horizontalCols);


    //items listing table
    var tableHead = CommonFunctions.GetTextFIlledToALength('S.N.', hlen_SN) + CommonFunctions.GetTextFIlledToALength('Service Particular(s)', hlen_Particular) + CommonFunctions.GetTextFIlledToALength('Unit', hlen_unit) + CommonFunctions.GetTextFIlledToALength('Amount', hlen_amt) + this.nline;
    var tableBody = '';
    // let billItems = this.receipt.BillingItems;
    for (let i = 0; i < this.billItems.length; i++) {
      var tblRow = '';

      tblRow += CommonFunctions.GetTextFIlledToALength((i + 1).toString(), hlen_SN)
        + CommonFunctions.GetTextFIlledToALength(this.billItems[i].ItemName, hlen_Particular)
        + CommonFunctions.GetTextFIlledToALength(this.billItems[i].Quantity.toString(), hlen_unit)
        + CommonFunctions.GetTextFIlledToALength(parseFloat(this.billItems[i].SubTotal.toString()).toFixed(2), hlen_amt) + this.nline;

      tableBody = tableBody + tblRow;

    }

    finalDataToPrint = finalDataToPrint + tableHead + tableBody + footerStr;


    let finalDataToPrintArr = finalDataToPrint.split("\n");
    let totalRowsToPrint = finalDataToPrint.split("\n").length - 1; //to get the number of lines
    let dataToPrint = '';

    for (let i = 0; i <= totalRowsToPrint; i++) {
      //subtracted 2 for continue
      if ((i % (totalHeight_lines - (headerGap_lines + 5))) === 0) {
        const preContTxt = this.nline + 'Continue...' + '\x0C';  //this is the command to push the postion to next paper head
        const postContTxt = this.nline + 'Continue...' + CommonFunctions.GetNewLineRepeat(2);
        dataToPrint = dataToPrint + ((i > 0) ? preContTxt : '') + CommonFunctions.GetNewLineRepeat(headerGap_lines) + ((i > 0) ? postContTxt : '');
      }
      dataToPrint = dataToPrint + finalDataToPrintArr[i] + this.nline;
    }
    return dataToPrint;
  }



  LoadPatientBillingSummary(patientId: number, patientVisitId: number) {
    this.dlService.Read("/api/IpBilling/InpatientPendingBillItems?patientId=" + this.patientId + "&ipVisitId=" + this.ipVisitId)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results) {
          // this.admissionInfo = res.Results.AdmissionInfo;
          // this.admissionInfo.AdmittedOn = this.admissionInfo.AdmittedOn;
          // this.admissionInfo.DischargedOn = moment(this.admissionInfo.DischargedOn).format('YYYY-MM-DDTHH:mm:ss');
          // this.filteredPendingItems = res.Results.PendingBillItems;
        }
        else {
          this.msgBoxServ.showMessage("failed", [" Unable to get bill summary."]);
          console.log(res.ErrorMessage);
        }
      });
  }


  // public calculateAdmittedDays() {
  //     //calculate the days again only if DoAutoAddBedItem is true..
  //     if (this.autoBedBillParam.DoAutoAddBedItem) {
  //         let dischargeDate = this.dischargeBill.AdmissionDetail.DischargeDate;
  //         dischargeDate = this.estDischargeDate;
  //         this.checkouttimeparameter = moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("HH:mm");

  //         let onedayformatparameter = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "OneDayFormat").ParameterValue;

  //         var duration;
  //         if (onedayformatparameter === "00:00") {
  //             duration = CommonFunctions.calculateADTBedDuration(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
  //         }
  //         if (onedayformatparameter === "24:00") {
  //             duration = this.calculateADTBedDurations(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
  //         }
  //         if (onedayformatparameter === "skip") {
  //             duration = this.calculateADTBedDurationSkip(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format("YYYY-MM-DD HH:mm"), moment(dischargeDate).format("YYYY-MM-DD HH:mm"), this.checkouttimeparameter);
  //         }


  //         // remove hour from length of stay
  //         let checkouttime = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTime").ParameterValue;
  //         let checkouttimeincrement = this.CoreService.Parameters.find(p => p.ParameterGroupName == "ADT" && p.ParameterName == "CheckoutTimeIncremental").ParameterValue;
  //         let checkouttimeincremental = parseFloat(checkouttimeincrement);
  //         //let bedEndDate = moment(dischargeDate).format("YYYY-MM-DD HH:mm");
  //         let bedEndDate = moment(dischargeDate).format("HH:mm");
  //         let bedEndTimeValues: Array<string> = bedEndDate.split(":");
  //         let bedEndHour = parseInt(bedEndTimeValues[0]);
  //         let chkOutTimeValues: Array<string> = checkouttime.split(":");
  //         let chkOutHour = parseInt(chkOutTimeValues[0]);

  //         let StartEndDateDay = parseInt(moment(this.dischargeBill.AdmissionDetail.AdmissionDate).format('D'));
  //         let date = new Date();
  //         let newdate = moment(date).format('YYYY-MM-DD HH:mm');
  //         let day = parseInt(moment(newdate).format('D'));

  //         if (bedEndHour >= chkOutHour && StartEndDateDay != day) {
  //             if (duration.days > 0 && duration.hours)
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + checkouttimeincremental + ' day ';

  //             else if (duration.days && !duration.hours)
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = (duration.days + checkouttimeincremental).toString() + ' day';

  //             else
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';
  //         }
  //         else {
  //             if (duration.days > 0 && duration.hours)
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days + ' day  ';
  //             else if (duration.days && !duration.hours)
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = duration.days.toString() + ' day';

  //             else
  //                 this.dischargeBill.AdmissionDetail.LengthOfStay = String(1) + 'day';
  //         }
  //     }
  // }

  // public calculateADTBedDurations(inDate, ipCheckoutDate, checkouttimeparameter): { days: number, hours: number, checkouttimeparameter: string } {
  //     //let checkoutDate = ipCheckoutDate;
  //     let chkOutTimeValues: Array<string> = checkouttimeparameter.split(":");
  //     let chkOutHour = parseInt(chkOutTimeValues[0]);
  //     let chkOutMinute = chkOutTimeValues.length > 1 ? parseInt(chkOutTimeValues[1]) : 0;
  //     var totalDays = 1;
  //     if (!ipCheckoutDate) {
  //         ipCheckoutDate = moment(new Date);
  //         totalDays = 1;
  //     }
  //     let InDate = moment(inDate).format('YYYY-MM-DD HH:mm');
  //     let InDateYear = moment(InDate).year();
  //     let InDateMonth = parseInt(moment(InDate).format('M'));
  //     let InDateDay = parseInt(moment(InDate).format('D'));
  //     let CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //     let CheckoutYear = moment(CheckoutDate).year();
  //     let CheckoutMonth = parseInt(moment(CheckoutDate).format('M'));
  //     let CheckoutDay = parseInt(moment(CheckoutDate).format('D'));
  //     if (CheckoutYear == InDateYear && CheckoutMonth == InDateMonth && CheckoutDay == InDateDay) {
  //         CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //     }
  //     else {
  //         //CheckoutDate = moment(ipCheckoutDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
  //         InDate = moment(inDate).subtract(1, 'days').set({ hour: chkOutHour, minute: chkOutMinute, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
  //         CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //     }
  //     for (let indate = moment(InDate); indate.diff(moment(CheckoutDate), 'days') < 0; indate.add(1, 'days')) {
  //         let admittedDate = moment(indate).format("HH:mm");
  //         let admittedDateValues: Array<string> = admittedDate.split(":");
  //         let admittedHour = parseInt(admittedDateValues[0]);
  //         for (let hr = admittedHour; (24 - hr) >= 0; hr++) {
  //             if (24 - hr == 0) {
  //                 totalDays += 1;
  //             }
  //         }

  //     }
  //     return { days: totalDays, hours: 0, checkouttimeparameter };
  // }
  // public calculateADTBedDurationSkip(inDate, ipCheckoutDate, checkouttimeparameter): { days: number, hours: number, checkouttimeparameter: string } {
  //     // let checkoutDate = ipCheckoutDate;
  //     let chkOutTimeValues: Array<string> = checkouttimeparameter.split(":");
  //     let chkOutHour = parseInt(chkOutTimeValues[0]);
  //     let chkOutMinute = chkOutTimeValues.length > 1 ? parseInt(chkOutTimeValues[1]) : 0;
  //     var totalDays = 1;
  //     if (!ipCheckoutDate) {
  //         ipCheckoutDate = moment(new Date);
  //         totalDays = 1;
  //     }
  //     let InDate = moment(inDate).format('YYYY-MM-DD HH:mm');
  //     let InDateYear = moment(InDate).year();
  //     let InDateMonth = parseInt(moment(InDate).format('M'));
  //     let InDateDay = parseInt(moment(InDate).format('D'));
  //     let CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //     let CheckoutYear = moment(CheckoutDate).year();
  //     let CheckoutMonth = parseInt(moment(CheckoutDate).format('M'));
  //     let CheckoutDay = parseInt(moment(CheckoutDate).format('D'));
  //     if (CheckoutYear == InDateYear && CheckoutMonth == InDateMonth && CheckoutDay == InDateDay) {
  //         CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //     }
  //     else {

  //         CheckoutDate = moment(ipCheckoutDate).format('YYYY-MM-DD HH:mm');
  //         InDate = moment(InDate).add(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DD HH:mm');
  //     }
  //     for (let indate = moment(InDate); indate.diff(moment(CheckoutDate), 'days') < 0; indate.add(1, 'days')) {
  //         let admittedDate = moment(indate).format("HH:mm");
  //         let admittedDateValues: Array<string> = admittedDate.split(":");
  //         let admittedHour = parseInt(admittedDateValues[0]);
  //         for (let hr = admittedHour; (24 - hr) >= 0; hr++) {
  //             if (24 - hr == 0) {
  //                 totalDays += 1;
  //             }
  //         }

  //     }
  //     return { days: totalDays, hours: 0, checkouttimeparameter };
  // }



  GetLocalDate(engDate: string): string {
    let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
    return npDate + " BS";
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }

}
