import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import PHRMReportsGridColumns from '../../shared/phrm-reports-grid-columns';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DispensaryService } from '../../../dispensary/shared/dispensary.service';

@Component({
  selector: 'app-return-from-customer',
  templateUrl: './return-from-customer.component.html',
  styleUrls: ['./return-from-customer.component.css']
})
export class ReturnFromCustomerComponent implements OnInit {
  fromDate: string;
  toDate: string;
  userList: Array<any>;
  selectedUser: any = null;
  userId: number;
  ReportResult: Array<any> = new Array<any>();
  ReturnFromCustomerColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  grandTotalAmount: number;
  dispensaryList: any;
  selectedDispensary: any = null;
  dispensaryId: number;
  public dateRange: string = "";
  public footerContent: string = '';
  public pharmacy: string = "pharmacy";
  public loading: boolean = false;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, private _dispensaryService: DispensaryService,
    public changeDetector: ChangeDetectorRef) {
    this.ReturnFromCustomerColumns = PHRMReportsGridColumns.ReturnFromCustomerReportList;
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
    this.getPharmacyUsers();
    this.GetActiveDispensarylist();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("ReturnedDate", false));
  }
  getPharmacyUsers() {
    this.pharmacyBLService.getPharmacyUsers()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
        }
      })
  }
  GetActiveDispensarylist() {
    this._dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.dispensaryList = res.Results;
        }
      })
  }

  ngOnInit() {
  }
  LoadReport() {
    this.loading = true;
    this.ReportResult = [];
    this.grandTotalAmount = 0;
    let user = this.selectedUser;
    let selectedDispensary = this.selectedDispensary;
    this.userId = user == undefined ? null : user.userId;
    this.dispensaryId = selectedDispensary == undefined ? null : selectedDispensary.StoreId;
    this.pharmacyBLService.getReturnFromCustomerReport(this.userId, this.dispensaryId, this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.ReportResult = res.Results;
          this.grandTotalAmount = this.ReportResult.reduce((a, b) => a + b.TotalAmount, 0);
          this.changeDetector.detectChanges();
          this.footerContent = document.getElementById("print_summary").innerHTML;
        }
        else {
          this.ReportResult = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.loading = false;

      });

  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyInvoiceSaleReturnReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
