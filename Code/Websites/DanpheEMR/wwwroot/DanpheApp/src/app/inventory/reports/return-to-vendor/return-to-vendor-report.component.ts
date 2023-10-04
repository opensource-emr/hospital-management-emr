import { Component, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { ReturnToVendorReport } from '../shared/return-to-vendor-report.model';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/ReturnToVendor.html"
})
export class ReturnToVendorComponent implements OnInit {

  public VendorName: string = null;
  public CurrentVendor: ReturnToVendorReport = new ReturnToVendorReport();
  public VendorList: any[] = [];
  public fromDate: string = null;
  public toDate: string = null;
  public VendorId: number = 0;
  public filteredReturnToVendorReport: any[];

  ReturnToVendorReportColumns: Array<any> = null;
  ReturnToVendorReportData: Array<ReturnToVendorReport> = new Array<ReturnToVendorReport>();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');

  }

  ngOnInit() {
    this.LoadVendorList();
    this.ShowReturnToVendorReport();
    //this.loadReport();
  }

  gridExportOptions = {
    fileName: 'CurrentVendorList' + moment().format('YYYY-MM-DD') + '.xls',
    // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
  };

  //used to format display item in ng-autocomplete
  public myListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }

  LoadVendorList(): void {
    this.inventoryService.GetVendorList()
      .subscribe(
        res =>
          this.CallBackGetVendorList(res));


  }



  CallBackGetVendorList(res) {
    if (res.Status == 'OK') {
      this.VendorList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.VendorList.push({
            "VendorId": a.VendorId, "VendorName": a.VendorName, StandardRate: a.StandardRate, VAT: a.VAT
          });
        });

      }

    }
    else {
      err => {
        this.msgBoxServ.showMessage("failed", ['failed to get Item.. please check log for details.']);

      }
    }
  }

  SelectVendorFromSearchBox(Vendor) {

    this.CurrentVendor.VendorId = Vendor.VendorId;
  }

  ShowReturnToVendorReport() {
    this.filteredReturnToVendorReport = null;    

    this.inventoryBLService.ShowReturnToVendor(this.CurrentVendor.VendorId)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0 ) {
      this.ReturnToVendorReportColumns = this.reportServ.reportGridCols.ReturnToVendorReport;
      this.ReturnToVendorReportData = res.Results;
      this.filteredReturnToVendorReport = this.ReturnToVendorReportData;

    }  
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  // ShowReturnToVendorReport
  loadReport() {
    if (this.fromDate && this.toDate) {
      this.filteredReturnToVendorReport = [];
      this.ReturnToVendorReportData.forEach(rep => {
        let selrepDate = moment(rep.CreatedOn).format('YYYY-MM-DD');
        let isGreaterThanFrom = selrepDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selrepDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreaterThanFrom && isSmallerThanTo) {
          this.filteredReturnToVendorReport.push(rep);
        }
      });
      if (this.filteredReturnToVendorReport.length == 0) {
        this.msgBoxServ.showMessage("Error", ["There is no data available."]);
      }
    }
    else {
      this.filteredReturnToVendorReport = this.ReturnToVendorReportData;
    }

  }

}
