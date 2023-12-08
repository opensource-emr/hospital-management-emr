import { Component, Directive, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { InvoiceDetailsModel } from '../shared/invoice-details.model'
import { CommonFunctions } from '../../shared/common.functions';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { PhrmInvoiceDetailsModel } from '../shared/phrm-invoice-details.model'
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
@Component({
  selector: 'new-sales-book',
  templateUrl: './new-sales-book.component.html',
  styleUrls: ['./new-sales-book.component.css']
})
export class NewSalesBookComponent implements OnInit {

  public fromDate: string = null;
  public toDate: string = null;
  public displayStartDate: string = "";
  public displayEndDate: string = "";
  public calType: string = "en,np";
  public sumTotalAmount: number = 0;
  public sumDiscountAmount: number = 0;
  public sumTaxableAmount: number = 0;
  public sumTaxableTAX: number = 0;
  public sumNONTaxableSales: number = 0;
  public sumExportSales: number = 0;
  public displayReport: boolean = false;
  public systemAdminBLService: SystemAdminBLService = null;
  public curtSalesBookDetail: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
  public curtPhrmSalesBookDetail: Array<PhrmInvoiceDetailsModel> = new Array<PhrmInvoiceDetailsModel>();
  public finalData: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public GeneralFieldLabel = new GeneralFieldLabels();
  constructor(
    public _systemAdminBLService: SystemAdminBLService,
    private messageBoxService: MessageboxService,
    private changeDetectorRef: ChangeDetectorRef,
    public coreService: CoreService,
    private npCalService: NepaliCalendarService) {
    this.systemAdminBLService = _systemAdminBLService;
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.LoadCalendarTypes();
    this.GetBillingHeaderParameter();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
  }

  ngOnInit() {
  }

  public OnFromToDateChange($event): void {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
  }

  public LoadCalendarTypes(): void {
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterGroupName === "SysAdmin" && parms.ParameterName === "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.IRDSalesBook;
  }

  public GetInvoiceDetails(): void {
    this.displayStartDate = this.fromDate;
    this.displayEndDate = this.toDate;
    this.GetBillingInvoiceDetails();
  }

  public GetBillingInvoiceDetails(): void {
    this.systemAdminBLService.GetAllInvoiceDetails(this.displayStartDate, this.displayEndDate).
      subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.finalData = new Array<InvoiceDetailsModel>();
          let salesDetails: Array<any> = res.Results;
          salesDetails.forEach(itm => {
            itm.BillDate_Np = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
            itm.BillDate = moment(itm.BillDate).format("YYYY-MM-DD");
          });

          salesDetails.forEach((result, index) => {
            const itemNameQuantity = JSON.parse(result.ItemNameAndQuantity);
            salesDetails[index].ItemDetails = itemNameQuantity.map(item => ({
              ItemName: item.ItemName,
              Quantity: item.Quantity,
              UOM: item.UOM
            }));
          });

          this.curtSalesBookDetail = salesDetails;
          this.curtSalesBookDetail.forEach(itm => {
            var amt = 0;
            itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
            itm.Taxable_Amount = CommonFunctions.parseAmount(itm.Taxable_Amount);
            itm.Tax_Amount = CommonFunctions.parseAmount(itm.Tax_Amount);
            itm.Total_Amount = CommonFunctions.parseAmount(itm.Total_Amount);
            itm.Bill_No_Str = itm.Bill_No.toString();
            itm.NonTaxable_Amount = CommonFunctions.parseAmount(itm.Total_Amount - itm.Taxable_Amount);
          });
          this.Calculation();
          this.finalData = Object.assign(this.finalData, this.curtSalesBookDetail);
        }
        else if (res.Status === ENUM_DanpheHTTPResponses.Failed) {
          console.log(res.ErrorMessage);
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['error please check console log for details']);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to take database backup Log.']);
        });
  }

  public callBackBillingInvoiceDetails(): void {
    this.systemAdminBLService.GetPhrmInvoiceDetails(this.displayStartDate, this.displayEndDate).
      subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          let salesDetails: Array<any> = res.Results;
          salesDetails.forEach(itm => {
            itm.BillDate_Np = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
          });
          this.curtPhrmSalesBookDetail = salesDetails;
          this.curtPhrmSalesBookDetail.forEach(itm => {
            itm.Bill_No = this.ExtractBillNumbers(itm.Bill_No);
            itm.Total_Amount = CommonFunctions.parseAmount(itm.Total_Amount);
            itm.DiscountAmount = CommonFunctions.parseAmount(itm.DiscountAmount);
            itm.Taxable_Amount = CommonFunctions.parseAmount(itm.Taxable_Amount);
            itm.Tax_Amount = CommonFunctions.parseAmount(itm.Tax_Amount);
            itm.NonTaxable_Amount = CommonFunctions.parseAmount(itm.NonTaxable_Amount);
            itm.Bill_No_Str = "PH" + itm.Bill_No;
          }
          );
          this.Calculation();
          Array.prototype.push.apply(this.curtSalesBookDetail, this.curtPhrmSalesBookDetail);
          this.curtSalesBookDetail.sort(function (a, b) {
            return +new Date(b.BillDate) - +new Date(a.BillDate)
          });
          this.finalData = Object.assign(this.finalData, this.curtSalesBookDetail);
          this.changeDetectorRef.detectChanges();
        }
        else if (res.Status === ENUM_DanpheHTTPResponses.Failed) {
          console.log(res.ErrorMessage);
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['error please check console log for details']);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to take database backup Log.']);
        });
  }
  
  public ExtractBillNumbers(value: any): number {
    if (!value) return 0;
    let number = value;
    if (isNaN(value)) {
      number = value.toString().replace(/[^\d.-]/g, '');
    }
    return Number(number);
  }

  public Calculation(): void {
    if (this.fromDate !== null && this.toDate !== null) {
      this.displayReport = true;
      this.sumDiscountAmount = 0;
      this.sumTaxableAmount = 0;
      this.sumTaxableTAX = 0;
      this.sumTotalAmount = 0;
      this.sumNONTaxableSales = 0;
      this.sumExportSales = 0;
      if (this.curtSalesBookDetail !== null) {
        for (let i = 0; i < this.curtSalesBookDetail.length; i++) {
          this.sumTotalAmount = CommonFunctions.parseAmount(this.sumTotalAmount + this.curtSalesBookDetail[i].Total_Amount);
          this.sumDiscountAmount = CommonFunctions.parseAmount(this.sumDiscountAmount + this.curtSalesBookDetail[i].DiscountAmount);
          this.sumTaxableAmount = CommonFunctions.parseAmount(this.sumTaxableAmount + this.curtSalesBookDetail[i].Taxable_Amount);
          this.sumTaxableTAX = CommonFunctions.parseAmount(this.sumTaxableTAX + this.curtSalesBookDetail[i].Tax_Amount);
          this.sumNONTaxableSales = CommonFunctions.parseAmount(this.sumNONTaxableSales + this.curtSalesBookDetail[i].NonTaxable_Amount);
        }
      }
      if (this.curtPhrmSalesBookDetail !== null) {
        for (let i = 0; i < this.curtPhrmSalesBookDetail.length; i++) {
          this.sumTotalAmount = CommonFunctions.parseAmount(this.sumTotalAmount + this.curtPhrmSalesBookDetail[i].Total_Amount);
          this.sumDiscountAmount = CommonFunctions.parseAmount(this.sumDiscountAmount + this.curtPhrmSalesBookDetail[i].DiscountAmount);
          this.sumTaxableAmount = CommonFunctions.parseAmount(this.sumTaxableAmount + this.curtPhrmSalesBookDetail[i].Taxable_Amount);
          this.sumTaxableTAX = CommonFunctions.parseAmount(this.sumTaxableTAX + this.curtPhrmSalesBookDetail[i].Tax_Amount);
          this.sumNONTaxableSales = CommonFunctions.parseAmount(this.sumNONTaxableSales + (this.curtPhrmSalesBookDetail[i].Total_Amount - (this.curtPhrmSalesBookDetail[i].Taxable_Amount + this.curtPhrmSalesBookDetail[i].Tax_Amount)))

        }
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['please Provide Dates'])
    }

  }

  public PrintReport(): void {
    let popupWinindow;
    var printContents = document.getElementById("dvReport").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
    popupWinindow.document.close();
  }

  public GetBillingHeaderParameter(): void {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    if (this.headerDetail !== null) {
      this.headerDetail.CustomerRegNo = this.ExtractCustomerRegNoFromCustomerRegLabel(this.headerDetail.CustomerRegLabel);
    }
    else
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please enter parameter values for BillingHeader"]);
  }

  public ExtractCustomerRegNoFromCustomerRegLabel(inputString: string): string {
    const numberRegex = /\d+/g;
    const numbers = inputString.match(numberRegex);
    if (numbers && numbers.length > 0) {
      return numbers.join('');
    } else {
      return '';
    }
  }

}
