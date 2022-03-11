import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { DispensaryService } from '../../../../dispensary/shared/dispensary.service';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../../shared/common.functions';
import { DanpheCache, MasterType } from '../../../../shared/danphe-cache-service-utility/cache-services';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../../shared/pharmacy.bl.service';
import PHRMReportsGridColumns from '../../../shared/phrm-reports-grid-columns';

@Component({
  selector: 'app-patient-sales-detail',
  templateUrl: './phrm-patient-sales-detail.component.html',
  styles: []
})
export class PHRMPatientSalesDetailComponent implements OnInit {
  PatientSalesDetailColumn: Array<any> = null;
  PatientSalesDetailData: Array<any> = [];
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
  storeList: Array<any> = [];
  StoreId: number = null;
  searchedPatient: any;
  PatientId: number = null;
  grandTotal: any = { totalSales: 0, totalRefund: 0, totalNetSales: 0 };
  dynamicQtyColumList: Array<DynamicColumnModel> = new Array<DynamicColumnModel>();
  showGridData: boolean = false;
  public footerContent = '';
  public dateRange: string = "";
  public pharmacy: string = "pharmacy";
  selectedStore: any = null;
  storeDetails: any;
  public loading: boolean = false;

  constructor(private _dispensaryService: DispensaryService, public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService, public settingBLService: SettingsBLService, public ref: ChangeDetectorRef, public changeDetector: ChangeDetectorRef) {
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
    this.LoadCounter();
    this.LoadUser();
    this.GetActiveDispensarylist();
    this.AssignGridColDefaults();
    this.CreateDynamicColumnList();
  }

  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.footerContent = document.getElementById("print_summary").innerHTML;
  }
  private AssignGridColDefaults() {
    this.PatientSalesDetailColumn = [
      { headerName: "Type", field: "Type", width: 150 },
      { headerName: "Bill Date", field: "Date", width: 150, cellRenderer: this.SalesDetailDateRender },
      { headerName: "Bill No", field: "InvoicePrintId", width: 150 },
      { headerName: "Hosp.No.", field: "HospitalNo", width: 150 },
      { headerName: "Patient", field: "ShortName", width: 150 },
      { headerName: "Medicine", field: "ItemName", width: 150 },
      { headerName: "Qty", field: "Quantity", width: 150 },
      { headerName: "S.Price", field: "MRP", width: 150 },
      { headerName: "TotalAmount", field: "TotalAmount", width: 150 },
    ];
  }
  SalesDetailDateRender(params) {
    return moment(params.data.Date).format("YYYY-MM-DD");
  }
  SalesDetailExpiryDateRender(params) {
    return moment(params.data.ExpiryDate).format("YYYY-MM");
  }

  public CreateDynamicColumnList() {
    this.dynamicQtyColumList = [
      { headerName: "GenericName", field: "GenericName", width: 150 },
      { headerName: "Batch", field: "BatchNo", width: 150 },
      { headerName: "Expiry", field: "ExpiryDate", width: 150, cellRenderer: this.SalesDetailExpiryDateRender },
      { headerName: "C.Price", field: "Price", width: 150 },
      { headerName: "NSHI", field: "Ins_NshiNumber", width: 150 },
      { headerName: "ClaimCode", field: "ClaimCode", width: 150 },
      { headerName: "SubTotal", field: "SubTotal", width: 150 },
      { headerName: "User", field: "CreatedByName", width: 150 },
      { headerName: "Counter", field: "CounterName", width: 150 },
    ];
  }
  onChangeColumnSelection($event) {
    this.showGridData = false;
    //remove all qty columns
    this.dynamicQtyColumList.forEach(element => {
      let startIndex = this.PatientSalesDetailColumn.findIndex(s => s.field == element.field);
      if (startIndex != -1) {
        this.PatientSalesDetailColumn.splice(startIndex, 1);
      }
    });
    //add only selected
    if ($event.length > 0) {
      let selectedColumns = new Array<DynamicColumnModel>()
      selectedColumns = $event;
      selectedColumns.forEach(col => {
        this.PatientSalesDetailColumn.push(col);
      });
    }
    this.ref.detectChanges();
    this.showGridData = true;
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.pharmacyBLService.GetPatients(keyword, false);
  }
  patientListFormatter(data: any): string {
    let html = `${data["ShortName"]} [ ${data['PatientCode']} ]`;
    return html;
  }
  onPatientChanged() {
    if (this.searchedPatient == null) return;
    if (typeof (this.searchedPatient) == "string") {
    }
    if (typeof (this.searchedPatient) == "object") {
      this.PatientId = this.searchedPatient.PatientId;
    }
  }
  GetActiveDispensarylist() {
    this._dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.storeList = res.Results;
        }
      })
  }
  LoadReport() {
    this.loading = true;
    if (this.PatientId == null) {
      this.msgBoxServ.showMessage("Failed", ["Patient must be selected."]);
    }
    else {
      this.storeDetails = this.selectedStore;
      this.StoreId = this.storeDetails == undefined ? null : this.storeDetails.StoreId;
      this.PatientSalesDetailData = [];
      this.grandTotal = { totalSales: 0, totalRefund: 0, totalNetSales: 0 };
      this.pharmacyBLService.getPatientSalesDetailReport(this.fromDate, this.toDate, this.PatientId, this.CounterId, this.UserId, this.StoreId)
        .finally(() => {
          this.showGridData = true;
        })
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            this.PatientSalesDetailData = res.Results;
            this.grandTotal.totalSales = this.PatientSalesDetailData.reduce((a, b) => a + (b.Type == 'Sale' ? b.TotalAmount : 0), 0);
            this.grandTotal.totalRefund = this.PatientSalesDetailData.reduce((a, b) => a + (b.Type == 'Sales Refund' ? b.TotalAmount : 0), 0);
            this.grandTotal.totalNetSales = this.grandTotal.totalSales - this.grandTotal.totalRefund;
            this.changeDetector.detectChanges();
            this.footerContent = document.getElementById("print_summary").innerHTML;
          }
          else {
            this.PatientSalesDetailData = [];
            this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
          }
        });
    }
    this.loading = false;
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
    fileName: 'PatientWiseSalesDetailReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}

class DynamicColumnModel {
  public headerName: string = "";
  public field: string = "";
  public width: number = 70; //default width set to 70   
  public cellRenderer?: any = null;
}
