import { Component } from "@angular/core";
import * as moment from "moment";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { FixedAssetsReportModel } from "../../shared/fixed-assets-report.model";
import { FixedAssetBLService } from "../../shared/fixed-asset.bl.service";

@Component({

  templateUrl: "./fixed-assets-movement.html"

})
export class FixedAssetsMovementComponent {

  public assetReportObj: FixedAssetsReportModel = new FixedAssetsReportModel();
  FixedAssetsMovementColumn: Array<any> = null;
  FixedAssetsMovementData: Array<any> = new Array<FixedAssetsReportModel>();
  //duplicateFixedAssetsMovementData: Array<any> = new Array<FixedAssetsReportModel>();
  filteredEmployee: Array<any> = new Array<FixedAssetsReportModel>();
  public employeeList: any[] = [];
  public departmentList: any[] = [];
  public itemsList: any[] = [];
  //public SelectedEmployeeId: number = 0;

  constructor(public fixedBLService: FixedAssetBLService,
    public settingsBLService: SettingsBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.FixedAssetsMovementColumn = this.reportServ.reportGridCols.FixedAssetsMovementReport;
    this.GetEmployeeList();
    this.GetAllDepartments();
    this.GetAllItems();
  }

  ngOnInit(){
    this.assetReportObj.FromDate = moment().format('YYYY-MM-DD');
    this.assetReportObj.ToDate = moment().format('YYYY-MM-DD');
    this.assetReportObj.EmployeeId = null;
    this.assetReportObj.ItemId = null;
    this.assetReportObj.DepartmentId = null;
    this.assetReportObj.ReferenceNumber = "";
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'FixedAssetsList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public validDate: boolean = true;
  selectDate(event) {
      if (event) {
        this.assetReportObj.FromDate = event.fromDate;
        this.assetReportObj.ToDate = event.toDate;
        this.validDate = true;
      }
      else {
          this.validDate = false;
      }
  }

  private GetEmployeeList() {
    this.fixedBLService.GetAllEmployeeList().subscribe(res => {
      if (res.Status == "OK") {
        this.employeeList = res.Results;    
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load employee list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load employee list."]);
    });
  }

  private GetAllDepartments() {
    this.fixedBLService.GetAllDepartments().subscribe(res => {
      if (res.Status == "OK") {
        this.departmentList = res.Results;    
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Department list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Department list."]);
    });
  }

  private GetAllItems() {
    this.fixedBLService.GetAllItems().subscribe(res => {
      if (res.Status == "OK") {
        this.itemsList = res.Results;    
      }
      else {
        this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Items list."]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load Items list."]);
    });
  }


  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }


  Load() {
    this.fixedBLService.ShowFixedAssetsMovement(this.assetReportObj)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
  }

  Success(res) {
    this.FixedAssetsMovementData = new Array<FixedAssetsReportModel>();
    //this.duplicateFixedAssetsMovementData = new Array<FixedAssetsReportModel>();
    if (res.Status == "OK" && res.Results.length > 0) {

      this.FixedAssetsMovementColumn = this.reportServ.reportGridCols.FixedAssetsMovementReport;
      this.FixedAssetsMovementData = res.Results;
      //this.duplicateFixedAssetsMovementData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  // OnEmployeeChange(data) {
  //   this.filteredEmployee = new Array<FixedAssetsReportModel>();
  //   this.filteredEmployee = JSON.parse(JSON.stringify(this.FixedAssetsMovementData));//deepcopy
  //   //  this.duplicateFixedAssetsMovementData = (data == 0) ?this.FixedAssetsMovementData : this.filteredEmployee.filter(s=>s.EmployeeId == data)
  //   if (data == "AllEmployee") {
  //     this.duplicateFixedAssetsMovementData = this.filteredEmployee;
  //   } else {
  //     this.duplicateFixedAssetsMovementData = this.filteredEmployee.filter(
  //       (a) => a.AssetHolder == data);
  //   }
  // }

}