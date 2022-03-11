import { Component } from '@angular/core'
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import * as moment from 'moment/moment';
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { DLService } from "../../../shared/dl.service"
import { ReportingService } from "../../../reporting/shared/reporting-service"
import { PHRMCategoryModel } from '../../shared/phrm-category.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
  selector: "my-app",
  templateUrl: "./phrm-drug-categorywise-report.html"

})

export class PHRMDrugCategoryWiseReportComponent {

  public CategoryList: PHRMCategoryModel = new PHRMCategoryModel();
  public categoryList: Array<any> = new Array<any>();
  public selectedCategory: any;
  public categoryId: number = 0;
  public category: string = '';
  PHRMDrugCategoryWiseReportColumn: Array<any> = null;
  PHRMDrugCategoryWiseReportData: Array<any> = new Array<PHRMReportsModel>();
  public phrmReports: PHRMReportsModel = new PHRMReportsModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public pharmacy:string = "pharmacy";
  
  constructor(
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    _dlService: DLService,

  ) {
    this.PHRMDrugCategoryWiseReportColumn = PHRMReportsGridColumns.PHRMDrugCategoryWiseReport;
    this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
    this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
    this.dlService = _dlService;
    this.GetCategoryListDetails();
    this.Load();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
  };

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'PharmacyDrugCategoryWiseReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };
  public GetCategoryListDetails(): void {
    try {
      this.pharmacyBLService.GetCategoryList()
        .subscribe(res => this.CallBackGetCategoryTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CallBackGetCategoryTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.categoryList = new Array<any>();
          this.categoryList = res.Results;
        }
      }
      else {
        err => {
          this.msgBoxServ.showMessage("failed", ['failed to get items..']);
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }



  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  Load() {
    if (this.phrmReports.FromDate && this.phrmReports.ToDate) {
      this.pharmacyBLService.GetPHRMDrugCategoryWiseReport(this.phrmReports, this.category)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.PHRMDrugCategoryWiseReportData = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
          }
        });
    }
  }



  onChangeCategory() {
    try {
      if (this.selectedCategory.CategoryId > 0) {
        this.categoryId = this.selectedCategory.CategoryId;
        this.category = this.selectedCategory.CategoryName;
      }
      else {
        this.categoryId = 0;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CheckProperSelectedCategory() {
    try {
      if ((typeof this.selectedCategory !== 'object') || (typeof this.selectedCategory === "undefined") || (typeof this.selectedCategory === null)) {
        this.selectedCategory = null;
        this.categoryId = 0;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  myCategoryListFormatter(data: any): string {
    let html = data["CategoryName"];//+ " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
    return html;
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  OnFromToDateChange($event) {
    this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
    this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
  }

}
