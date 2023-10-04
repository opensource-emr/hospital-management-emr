import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { Rank_ApfHospital } from '../../../appointments/visit/visit-patient-info.component';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { CoreService } from "../../../core/shared/core.service";
import { MembershipType } from '../../../patients/shared/membership-type.model';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { User } from '../../../security/shared/user.model';
import { Membership } from '../../../settings-new/shared/membership.model';
import { ServiceDepartment } from '../../../settings-new/shared/service-department.model';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillDetailModel } from './bill-detail.model';

@Component({
  templateUrl: "./bill-detail.component.html"
})
export class BillDetailComponent {
  public dlService: DLService = null;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";
  public billstatus: string = "";
  public selectedServiceDepartment: ServiceDepartment = null;
  public itemname: string = "";
  selectedItem: BillItem = null;
  public BillDetailReportColumns: Array<any> = Array<any>();
  public BillDetailReportData: BillDetailModel[] = [];
  public serDeptList: ServiceDepartment[] = [];
  public BillItemList: BillItem[] = [];
  selBillingTypeName: string = 'all';
  public loading: boolean = false;
  selectedUser: User = null;

  public summary_new = {
    Cash: new BillSummaryFields(),
    CashReturn: new BillSummaryFields(),
    Credit: new BillSummaryFields(),
    CreditReturn: new BillSummaryFields(),
    GrossSales: 0,
    TotalDiscount: 0,
    TotalSalesReturn: 0,
    TotalReturnDiscount: 0,
    NetSales: 0,
    TotalSalesQty: 0,
    TotalReturnSalesQty: 0,
    NetQuantity: 0
  }
  public userList: User[] = [];
  selectedMembershipType: MembershipType = null;
  selectedRank: Rank_ApfHospital = null;


  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();//sud:7June'20

  public footerContent = '';
  MembershipTypeList: Membership[] = [];
  RankList: Rank_ApfHospital[] = [];
  ServiceDepartmentId: number = null;
  ItemId: number = null;
  MembershipTypeId: number = null;
  RankName: string = null;
  UserId: number;
  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public billingBlService: BillingBLService,
    public reportServ: ReportingService,
    public settingsBLService: SettingsBLService,
  ) {
    this.dlService = _dlService;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
    this.loadDepartments();
    this.LoadAllBillingItems();
    this.LoadMembershipType();
    this.LoadUser();
    this.GetRank();
    this.BillDetailReportColumns = this.reportServ.reportGridCols.BillDetailReport;
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.footerContent = document.getElementById("id_div_summary_bill_detail_report").innerHTML;
  }

  gridExportOptions = {
    fileName: 'BillDetailReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.loading = true;
    this.BillDetailReportData = [];
    this.dlService.LoadBillDetailReportData(this.fromDate, this.toDate, this.selBillingTypeName, this.ItemId, this.UserId, this.RankName, this.MembershipTypeId, this.ServiceDepartmentId).finally(() => {
      this.loading = false;
      this.Reset();
    }).subscribe(res =>
      this.Success(res),
      res => this.Error(res)
    );

  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {

      this.BillDetailReportData = res.Results;
      this.CalculateSummaryofDifferentColoumnForSum();
      this.footerContent = document.getElementById("id_div_summary_bill_detail_report").innerHTML;
    }
    else if (res.Status == "OK" && res.Results.length == 0)
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
    else
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  OnGridExport($event: GridEmitModel) {
    // let jsonStrSummary = JSON.stringify(this.summary_new);//this.summary
    // let summaryHeader = "Total Items Bill Report Summary";
    // this.dlService.ReadExcel("/ReportingNew/ExportToExcelTotalItemsBill?FromDate="
    //   + this.fromDate + "&ToDate=" + this.toDate
    //   + "&BillStatus=" + this.CurrentBillDetail.billstatus + "&ServiceDepartmentName=" + this.CurrentBillDetail.servicedepartment +
    //   "&ItemName=" + this.CurrentBillDetail.itemname + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader)
    //   .map(res => res)
    //   .subscribe(data => {
    //     let blob = data;
    //     let a = document.createElement("a");
    //     a.href = URL.createObjectURL(blob);
    //     a.download = "TotalItemsBill_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
    //     document.body.appendChild(a);
    //     a.click();
    //   },
    //     res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  CalculateSummaryofDifferentColoumnForSum() {
    this.summary_new.Cash = new BillSummaryFields();
    this.summary_new.CashReturn = new BillSummaryFields();
    this.summary_new.Credit = new BillSummaryFields();
    this.summary_new.CreditReturn = new BillSummaryFields();

    this.summary_new.GrossSales = this.summary_new.TotalDiscount = this.summary_new.TotalSalesReturn = this.summary_new.TotalReturnDiscount =
      this.summary_new.NetSales = this.summary_new.TotalSalesQty = this.summary_new.TotalReturnSalesQty = this.summary_new.NetQuantity = 0;
    if (this.BillDetailReportData && this.BillDetailReportData.length > 0) {

      this.BillDetailReportData.forEach(itm => {
        switch (itm.BillingType) {
          case "CashSales": {
            this.summary_new.Cash.TotalQty += itm.Quantity;
            this.summary_new.Cash.SubTotal += itm.SubTotal;
            this.summary_new.Cash.Discount += itm.DiscountAmount;
            this.summary_new.Cash.TotalAmount += itm.TotalAmount;
            break;
          }
          case "ReturnCashSales": {
            this.summary_new.CashReturn.TotalQty += itm.Quantity;
            this.summary_new.CashReturn.SubTotal += itm.SubTotal;
            this.summary_new.CashReturn.Discount += itm.DiscountAmount;
            this.summary_new.CashReturn.TotalAmount += itm.TotalAmount;
            break;
          }
          case "CreditSales": {
            this.summary_new.Credit.TotalQty += itm.Quantity;
            this.summary_new.Credit.SubTotal += itm.SubTotal;
            this.summary_new.Credit.Discount += itm.DiscountAmount;
            this.summary_new.Credit.TotalAmount += itm.TotalAmount;
            break;
          }
          case "ReturnCreditSales": {
            this.summary_new.CreditReturn.TotalQty += itm.Quantity;
            this.summary_new.CreditReturn.SubTotal += itm.SubTotal;
            this.summary_new.CreditReturn.Discount += itm.DiscountAmount;
            this.summary_new.CreditReturn.TotalAmount += itm.TotalAmount;
            break;
          }
          default:
            break;
        }
      });

      this.summary_new.GrossSales = this.summary_new.Cash.SubTotal + this.summary_new.Credit.SubTotal;
      this.summary_new.TotalDiscount = this.summary_new.Cash.Discount + this.summary_new.Credit.Discount;
      this.summary_new.TotalSalesReturn = this.summary_new.CashReturn.SubTotal + this.summary_new.CreditReturn.SubTotal;
      this.summary_new.TotalReturnDiscount = this.summary_new.CashReturn.Discount + this.summary_new.CreditReturn.Discount;
      this.summary_new.TotalSalesQty = this.summary_new.Cash.TotalQty + this.summary_new.Credit.TotalQty;
      this.summary_new.TotalReturnSalesQty = this.summary_new.CashReturn.TotalQty + this.summary_new.CreditReturn.TotalQty;
      this.summary_new.NetQuantity = this.summary_new.TotalSalesQty - this.summary_new.TotalReturnSalesQty;
      this.summary_new.NetSales = this.summary_new.GrossSales - this.summary_new.TotalDiscount - this.summary_new.TotalSalesReturn + this.summary_new.TotalReturnDiscount;
    }

  }

  loadDepartments(): void {
    this.dlService.Read("/BillingReports/GetServiceDeptList")
      .map(res => res).subscribe(res => {
        if (res.Status == "OK") {
          this.serDeptList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.serDeptList, "ServiceDepartmentName");
        }
      });
  }

  ServiceDepartmentListFormatter(data: any): string {
    let html = data["ServiceDepartmentName"];
    return html;
  }

  ItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  OnDepartmentChanged(): void {
    this.ServiceDepartmentId = this.selectedServiceDepartment ? this.selectedServiceDepartment.ServiceDepartmentId : null;
  }

  ItemNameChanged(): void {
    this.ItemId = this.selectedItem ? this.selectedItem.ItemId : null;
  }

  OnFromToDateChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
      this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }
  }

  public LoadAllBillingItems(): void {
    this.billingBlService.GetBillItemList()
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.BillItemList = res.Results;
        }
      });
  }

  LoadUser(): void {
    this.settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
        }
        else {
          console.log(res.ErrorMessage);
        }
      });
  }
  OnUserChanged(): void {
    this.UserId = this.selectedUser ? this.selectedUser.EmployeeId : null;
  }
  UserListFormatter(data: User): string {
    return data["EmployeeName"];
  }

  LoadMembershipType(): void {
    this.MembershipTypeList = this.coreService.AllMembershipTypes;
  }

  MembershipTypeListFormatter(data: Membership): string {
    return data["MembershipTypeName"];
  }
  OnMembershipTypeChanged(): void {
    this.MembershipTypeId = this.selectedMembershipType ? this.selectedMembershipType.MembershipTypeId : null;
  }
  public GetRank(): void {
    this.dlService.GetRank()
      .map(res => res)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.RankList = res.Results;
        }
        else {
          console.log(res.ErrorMessage);
        }
      },
        err => {
          console.log(err);
        });
  }

  RankFormatter(data: Rank_ApfHospital): string {
    return data["RankName"];
  }
  OnRankChange(): void {
    this.RankName = this.selectedRank ? this.selectedRank.RankName : null;
  }
  Reset() {
    this.RankName = null;
    this.selectedRank = null;
    this.UserId = null;
    this.selectedUser = null;
    this.MembershipTypeId = null;
    this.selectedMembershipType = null;
    this.ServiceDepartmentId = null;
    this.selectedServiceDepartment = null;
    this.ItemId = null;
    this.selectedItem = null;
    this.selBillingTypeName = 'all';
  }
}

export class BillSummaryFields {
  TotalQty: number = 0;
  SubTotal: number = 0;
  Discount: number = 0;
  TotalAmount: number = 0;
}
export class BillItem {
  ItemId: number = null;
  ItemName: string = "";
}
