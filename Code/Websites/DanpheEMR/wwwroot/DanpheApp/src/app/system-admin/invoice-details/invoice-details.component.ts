import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SystemAdminBLService } from '../shared/system-admin.bl.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InvoiceDetailsModel } from '../shared/invoice-details.model'
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "../../view/system-admin-view/InvoiceDetails.html" // "/SystemAdminView/InvoiceDetails"
})

export class InvoiceDetailsComponent {

  public curtInvoiceDetail: Array<InvoiceDetailsModel> = new Array<InvoiceDetailsModel>();
  public fromDate:any;
  public toDate: any;
  public bilInvoiceDetailGridColumns: Array<any> = null;
  public systemAdminBLService: SystemAdminBLService = null;
  public hdr: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public exportHeaders: string = null;
  public reportHeaderHtml: string = '';
  public summaryFormatted = {
    TotalSales: 0,
    TotalDiscountAmount: 0,
    TotalTaxableAmount: 0,
    TotalTaxAmount: 0,
    TotalAmount: 0
  };
  public footerContent : string ='';
  public dateRange : string = '';
  nepaliCalendarService: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(_systemAdminBLService: SystemAdminBLService,
    public msgBoxServ: MessageboxService,
    public npCalService: NepaliCalendarService,
    public changeDetectorRef: ChangeDetectorRef,
    public coreService: CoreService) {
    this.systemAdminBLService = _systemAdminBLService;
    this.bilInvoiceDetailGridColumns = GridColumnSettings.BillingInvoiceDetails;
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("BillDate", false));
    //this.GetInvoiceDetails();
    //this.GetBillingHeaderParameter();
  }
  GetInvoiceDetails(): void {
    this.systemAdminBLService.GetInvoiceDetails(this.fromDate, this.toDate).
      subscribe(res => {
        if (res.Status == 'OK') {

          this.reportHeaderHtml = this.coreService.GetReportHeaderParameterHTML(moment(this.fromDate).format('YYYY-MM-DD'),
            moment(this.toDate).format('YYYY-MM-DD'),
            this.coreService.GetReportHeaderTextForProperty('MaterializedViewReportHeader')
          );

          let invDetails: Array<any> = res.Results;
          invDetails.forEach(itm => {
            itm.BillDate_BS = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
            if (itm.Is_Printed == "No") {
              itm.Printed_Time = "";
              itm.Printed_by = "";
            }
          });
          this.curtInvoiceDetail = invDetails;
          this.calculateSummary(this.curtInvoiceDetail);
        }
        else if (res.Status == 'Failed') {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to load records.']);
        });
  }
  // <!-- ramesh/Dev: this fxn is removed as we have merged the IRD Sales Details for BL and PHRM in same SP -->
  //   public callBackBillingInvoiceDetails(invDetailsItems) {
  //   this.systemAdminBLService.GetPhrmInvoiceDetails(this.fromDate, this.toDate).
  //     subscribe(res => {
  //       if (res.Status == 'OK') {
  //         let salesDetails: Array<any> = res.Results;
  //         salesDetails.forEach(itm => {
  //           itm.BillDate_BS = this.npCalService.ConvertEngToNepDateString(itm.BillDate);
  //           // itm.Bill_No = "PH" + itm.Bill_No;
  //           if (itm.Is_Printed == "No") {
  //             itm.Printed_Time = "";
  //             itm.Printed_by = "";
  //           }
  //         });
  //         this.changeDetectorRef.detectChanges();
  //         salesDetails.forEach(itm => {
  //           invDetailsItems.push(itm);
  //         });
  //         invDetailsItems.sort(function (a, b) {
  //           return +new Date(b.BillDate) - +new Date(a.BillDate);
  //         });
  //         this.curtInvoiceDetail = invDetailsItems;
  //         this.changeDetectorRef.detectChanges();
  //       }
  //       else if (res.Status == 'Failed') {
  //         console.log(res.ErrorMessage);
  //         this.msgBoxServ.showMessage("error", ['error please check console log for details']);
  //       }
  //     },
  //       err => {
  //         this.msgBoxServ.showMessage("error", ['Failed to load records.']);
  //       });
  // }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'BillingInvoiceLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
    customHeader: this.GetHeaderText()
  };

  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'BillingInvoiceLogDetails_' + moment().format('YYYY-MM-DD') + '.xls',
      customHeader: this.GetHeaderText()
    };
    return gridExportOptions;
  }

  ngAfterViewChecked() {
    if (document.getElementById("summaryFooter") != null)
      this.footerContent = document.getElementById("summaryFooter").innerHTML;
  }

  calculateSummary(data:any){
    this.summaryFormatted.TotalSales = data.reduce(function (acc, obj) { return acc + obj.Amount; }, 0);
    this.summaryFormatted.TotalDiscountAmount = data.reduce(function (acc, obj) { return acc + obj.DiscountAmount; }, 0);
    this.summaryFormatted.TotalTaxableAmount = data.reduce(function (acc, obj) { return acc + obj.Taxable_Amount; }, 0);
    this.summaryFormatted.TotalTaxAmount = data.reduce(function (acc, obj) { return acc + obj.Tax_Amount; }, 0);
    this.summaryFormatted.TotalAmount = data.reduce(function (acc, obj) { return acc + obj.Total_Amount; }, 0);
  }

  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetHeaderText(): string {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'BillingHeader').ParameterValue;
    var hdrTxt = "";
    if (paramValue) {
      this.hdr = JSON.parse(paramValue);
      hdrTxt = this.hdr.CustomerName + " \n ";
      hdrTxt += this.hdr.Address.toString().replace(",", " ") + " \n ";
      hdrTxt += this.hdr.CustomerRegLabel + "\n"; // + this.hdr.CustomerRegNo + " \n ";
      hdrTxt += "Materialized Sales View" + "\n";
      hdrTxt += "Invoice details From:" + this.fromDate + "  To:" + this.toDate;

    }
    return hdrTxt;
  }

  //Anjana:2020/10/02: reusable from to date selector
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    let nepFromDate=this.npCalService.ConvertEngToNepDateString(this.fromDate);
    let nepToDate = this.npCalService.ConvertEngToNepDateString(this.toDate);
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate+"&nbsp;&nbsp;(B.S. From:"+nepFromDate+"&nbsp; to &nbsp;"+nepToDate+")";
  }


}
