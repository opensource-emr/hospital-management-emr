import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../../shared/common.functions';
import { DanpheCache, MasterType } from '../../../../shared/danphe-cache-service-utility/cache-services';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  selector: 'app-phrm-ins-bima-report',
  templateUrl: './phrm-ins-bima-report.component.html',
  styles: []
})
export class PhrmInsBimaReportComponent implements OnInit {
  InsBimaColumn: Array<any> = null;
  InsBimaData: Array<any> = [];
  fromDate: string;
  toDate: string;
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  UserId: number = null;
  CounterId: number = null;
  ClaimCode: number = null;
  NSHINumber: string = '';
  counterlist: any[] = [];
  userList: any[] = [];
  selectedUser: any = { EmployeeId: null, EmployeeName: 'All' };
  grandTotal: number = 0;
  public footerContent = '';
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  public loading: boolean = false;

  constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, public settingBLService: SettingsBLService, public changeDetector: ChangeDetectorRef) {
    this.InsBimaColumn = PHRMReportsGridColumns.PHRMINSPatientBima
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
    this.LoadCounter();
    this.LoadUser();
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.footerContent = document.getElementById("print_summary").innerHTML;
  }
  LoadReport() {
    this.loading = true;
    this.InsBimaData = [];
    this.grandTotal = 0;
    this.pharmacyBLService.getInsPatientBimaReport(this.fromDate, this.toDate, this.CounterId, this.UserId, this.ClaimCode, this.NSHINumber)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.InsBimaData = res.Results;
          this.grandTotal = this.InsBimaData.reduce((a, b) => a + b.TotalAmount, 0);
          this.changeDetector.detectChanges();
          this.footerContent = document.getElementById("print_summary").innerHTML;
        }
        else {
          this.InsBimaData = null;
          this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
        }
        this.loading = false;
      });
  }
  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.PhrmCounter, null);
  }

  LoadUser() {

    this.settingBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          this.userList.unshift({ EmployeeId: null, EmployeeName: 'All' })
          CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  UserListFormatter(data: any): string {
    return data["EmployeeName"];
  }
  OnUserChange() {
    let user = null;
    if (!this.selectedUser) {
      this.UserId = null;
    }
    else if (typeof (this.selectedUser) == 'string') {
      user = this.userList.find(a => a.EmployeeName.toLowerCase() == this.selectedUser.toLowerCase());
    }
    else if (typeof (this.selectedUser) == "object") {
      user = this.selectedUser;
    }
    if (user) {
      this.UserId = user.EmployeeId;
    }
    else {
      this.UserId = null;
    }
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyINSPatientBimaReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

}
