import { AfterViewChecked, ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import * as moment from 'moment/moment';
import { DLService } from '../../../shared/dl.service';
import { User } from '../../../security/shared/user.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  templateUrl: "./department-wise-discount-scheme-report.html"
})
export class RPT_BIL_DepartmentWiseDiscountSchemeReportComponent {
  dlService: DLService = null;

  public DepartmentWiseDiscountSchemeGridColumns: Array<any> = [];
  public DepartmentWiseDiscountSchemeItemsDetailsGridColumns: Array<any> = [];
  public DepartmentWiseDiscountSchemeGridData: Array<any> = new Array<any>();
  public DepartmentWiseDiscountSchemeItemsDetailsGridData: Array<any> = new Array<any>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public toDate: string = '';
  public fromDate: string = '';
  public dateRange: string = '';

  public DiscountSchemeList: Array<User> = new Array<User>();
  public DiscountScheme: any = null;

  public ServiceDepartmentList: Array<any> = new Array<any>();
  public ServiceDepartment: any = null;
  public PaymentMode: string = 'All';
  public BillingTransactionId = 0; 

  public summaryFormatted = {
    TotalAmount: 0,
    TotalDiscount: 0,
    NetRefundAmount: 0,
    HospitalCollection: 0
  }
  public summaryFormattedForItemsReport = {
    TotalAmount: 0,
    TotalDiscount: 0,
    NetRefundAmount: 0,
    HospitalCollection: 0
  }
  public showDetailsPopUp = false;
  public footerContent = '';
  public itemLevelfooterContent = '';


  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService,
    public coreService: CoreService,
    public cdr:ChangeDetectorRef) {
    this.dlService = _dlService;
    // this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.DepartmentWiseDiscountSchemeGridColumns = this.reportServ.reportGridCols.DepartmentWiseDiscountSchemeGridColumns;
    this.DepartmentWiseDiscountSchemeItemsDetailsGridColumns = this.reportServ.reportGridCols.DepartmentWiseDiscountSchemeItemsDetailsGridColumns;
    this.LoadDiscountScheme();
    this.GetAllDepartmentList();
  }

  ngOnInit() {
    this.PaymentMode = 'All';
  }
  
  Load() {
    var membershipTypeId = !!this.DiscountScheme ? this.DiscountScheme.MembershipTypeId : null;
    var serviceDepartmentId = !!this.ServiceDepartment ? this.ServiceDepartment.ServiceDepartmentId : null;
    let payment = (this.PaymentMode != null && this.PaymentMode != 'All') ? this.PaymentMode : ""; 
    this.dlService.Read("/BillingReports/Billing_DepartmentWiseDiscountSchemeReport?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate +  "&MembershipTypeId=" + membershipTypeId+  "&ServiceDepartmentId=" + serviceDepartmentId + "&PaymentMode=" + payment)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }

  Success(res) {
    if (res.Status == "OK") {
      let data = res.Results;
      if (data.length > 0) {
        this.DepartmentWiseDiscountSchemeGridData = null;
        this.DepartmentWiseDiscountSchemeGridData = data;
        this.cdr.detectChanges();
        this.getSummary(this.DepartmentWiseDiscountSchemeGridData);
        this.cdr.detectChanges();
        this.FormatAmountsForGrid(this.DepartmentWiseDiscountSchemeGridData);//pass this data for formatting.
        this.cdr.detectChanges();
        this.footerContent = document.getElementById("summaryFooter").innerHTML;
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.dateRange = "<b>Date:</b><b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  gridAction($event: any) {
    switch ($event.Action) {
      case "viewDetails": {
         let billingTransactionId = $event.Data.BillingTransactionId;
         let membershipTypeId = $event.Data.MembershipTypeId; 
         let serviceDepartmentId = $event.Data.ServiceDepartmentId;
         this.LoadItemLevel(billingTransactionId,membershipTypeId,serviceDepartmentId);
      }
      default:
        break;
    }
  }

    //Function to parse each amount properites of the incomesegregation.
    public FormatAmountsForGrid(ipDataArr: Array<any>) {
      if (ipDataArr && ipDataArr.length) {
        ipDataArr.forEach(itm => {
          itm.TotalAmount = CommonFunctions.parseAmount(itm.TotalAmount);
          itm.TotalDiscount = CommonFunctions.parseAmount(itm.TotalDiscount);
          itm.NetRefundAmount = CommonFunctions.parseAmount(itm.NetRefundAmount);
          itm.DiscountRefund = CommonFunctions.parseAmount(itm.DiscountRefund);
          itm.NetAmount = CommonFunctions.parseAmount(itm.NetAmount);
          itm.TotalQuantity = CommonFunctions.parseAmount(itm.TotalQuantity);
        });
      }
    }

  LoadItemLevel(billingTransactionId:number,membershipTypeId:number,serviceDepartmentId:number) {
    this.dlService.Read("/BillingReports/Billing_ItemLevelDepartmentWiseDiscountSchemeReport?BillingTransactionId=" + billingTransactionId + "&MembershipTypeId=" + membershipTypeId +  "&ServiceDepartmentId=" + serviceDepartmentId)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          let data = res.Results;
          if (data.length > 0) {
            this.showDetailsPopUp = true;
            this.DepartmentWiseDiscountSchemeItemsDetailsGridData = null;
            this.DepartmentWiseDiscountSchemeItemsDetailsGridData = data;
            this.cdr.detectChanges();
            this.getSummaryForItemsReport(this.DepartmentWiseDiscountSchemeItemsDetailsGridData);
            this.cdr.detectChanges();
            this.FormatAmountsForGrid(this.DepartmentWiseDiscountSchemeItemsDetailsGridData);//pass this data for formatting.
            this.cdr.detectChanges();
            this.itemLevelfooterContent = document.getElementById("itemLevelSummaryFooter").innerHTML;
          }
          else {
            this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      },
      err =>{
        this.msgBoxServ.showMessage("error", [err]);
      } );
  }

  gridExportOptions = {
    fileName: 'DepartmentWiseDiscountSchemeReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  gridExportOptionsForItemLevelreport = {
    fileName: 'ItemLevelDetailsDepartmentWiseDiscountSchemeReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Close(){
    this.showDetailsPopUp = false;
  }

  LoadDiscountScheme() {
    this.settingsBLService.GetDiscountScheme()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.DiscountSchemeList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.DiscountSchemeList, "MembershipTypeName");
          //this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }

  DiscountSchemeListFormatter(data: any): string {
    var discountScheme = data["MembershipTypeName"] + ' ( ' + data["DiscountPercent"] + '% )';
    return discountScheme;
  }

  getSummary(data: any) {
    this.summaryFormatted.TotalAmount = 0;
    this.summaryFormatted.TotalDiscount = 0;
    this.summaryFormatted.NetRefundAmount = 0;
    this.summaryFormatted.HospitalCollection = 0;

    data.forEach(a => {
      this.summaryFormatted.TotalAmount += a.TotalAmount;
      this.summaryFormatted.TotalDiscount += a.TotalDiscount;
      this.summaryFormatted.NetRefundAmount += a.NetRefundAmount;
    });
    this.summaryFormatted.TotalAmount = CommonFunctions.parseAmount(this.summaryFormatted.TotalAmount);
    this.summaryFormatted.TotalDiscount = CommonFunctions.parseAmount(this.summaryFormatted.TotalDiscount);
    this.summaryFormatted.NetRefundAmount = CommonFunctions.parseAmount(this.summaryFormatted.NetRefundAmount);
    this.summaryFormatted.HospitalCollection = this.summaryFormatted.TotalAmount - (this.summaryFormatted.TotalDiscount + this.summaryFormatted.NetRefundAmount);
    this.summaryFormatted.HospitalCollection = CommonFunctions.parseAmount(this.summaryFormatted.HospitalCollection);

  }

  getSummaryForItemsReport(data: any) {
    this.summaryFormattedForItemsReport.TotalAmount = 0;
    this.summaryFormattedForItemsReport.TotalDiscount = 0;
    this.summaryFormattedForItemsReport.NetRefundAmount = 0;
    this.summaryFormattedForItemsReport.HospitalCollection = 0;

    data.forEach(a => {
      this.summaryFormattedForItemsReport.TotalAmount += a.TotalAmount;
      this.summaryFormattedForItemsReport.TotalDiscount += a.TotalDiscount;
      this.summaryFormattedForItemsReport.NetRefundAmount += a.NetRefundAmount;
    });
    this.summaryFormattedForItemsReport.TotalAmount = CommonFunctions.parseAmount(this.summaryFormattedForItemsReport.TotalAmount);
    this.summaryFormattedForItemsReport.TotalDiscount = CommonFunctions.parseAmount(this.summaryFormattedForItemsReport.TotalDiscount);
    this.summaryFormattedForItemsReport.NetRefundAmount = CommonFunctions.parseAmount(this.summaryFormattedForItemsReport.NetRefundAmount);
    this.summaryFormattedForItemsReport.HospitalCollection = this.summaryFormattedForItemsReport.TotalAmount - (this.summaryFormattedForItemsReport.TotalDiscount + this.summaryFormattedForItemsReport.NetRefundAmount);
    this.summaryFormattedForItemsReport.HospitalCollection = CommonFunctions.parseAmount(this.summaryFormattedForItemsReport.HospitalCollection);
  }

  private GetAllDepartmentList() {
    this.dlService.Read("/BillingReports/GetAllDepartmentList")
    .map(res => res)
    .subscribe(res => {
        if (res.Status == "OK") {
            this.ServiceDepartmentList = res.Results;    
          }
          else {
            this.msgBoxServ.showMessage("Notice-Message", ["Failed to load department list."]);
          }
  }, err => {
    console.log(err);
    this.msgBoxServ.showMessage("Failed", ["Failed to load department list."]);
  });
}

public ServiceDepartmentListFormatter(data: any): string {
  return data["ServiceDepartmentName"];
}
}
