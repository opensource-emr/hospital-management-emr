import { Component } from "@angular/core";
import { CoreService } from "../../../../app/core/shared/core.service";
import { DLService } from "../../../../app/shared/dl.service";
import { MessageboxService } from "../../../../app/shared/messagebox/messagebox.service";
import { ReportingService } from "../../shared/reporting-service";
import {
  NepaliDateInGridColumnDetail,
  NepaliDateInGridParams,
} from "../../../../app/shared/danphe-grid/NepaliColGridSettingsModel";
import * as moment from "moment";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { LabTest } from "../../../labs/shared/lab-test.model";
import { LabCategoryModel } from "../../../labs/shared/lab-category.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { forkJoin, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Component({
  selector: "labtype-wise-test-count-report",
  templateUrl: "./labtype-wise-test-count.html",
})
export class RPT_LabTypeWiseTestCountReport {
  public labTypeWiseTestCountReportColumns: Array<any> = null;
  public labTypeWiseTestCountReportData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  public showGrid: boolean = false;
  public category: any ;
  public test: any;
  public selectedTestId:number=null;
  public selectedCategoryId:number=null;
  public categoryList: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public labTestList: Array<LabTest> = new Array<LabTest>();
  public originalTestList:Array<LabTest> = new Array<LabTest>();
  public showSummary :boolean =false;
  public summaryFormatted = {
    TotalOPCount: 0,
    TotalERCount: 0,
    GrandTotal: 0
  }
  public footer: any = null;
  public Lab: string = "lab";
  public dateRange:string="";	
  public statusAbove:number =0;
  public orderStatus={statusList: ''};
  // public NepaliDateInGridSettings: NepaliDateInGridParams =
  //   new NepaliDateInGridParams();
  constructor(
    public nepaliCalendarService:NepaliCalendarService,
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService
  ) {
    this.labTypeWiseTestCountReportColumns =
      this.reportServ.reportGridCols.LabTypeWiseTestCountReport;
    // this.NepaliDateInGridSettings.NepaliDateColumnList.push(
    //   new NepaliDateInGridColumnDetail("CreatedOn", false)
    // );
    var reqs: Observable<any>[] = [];
    reqs.push( this.dlService.getLabTest().pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    reqs.push( this.dlService.getCategory().pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    forkJoin(reqs).subscribe(result => {
      this.loadTest(result[0]);
      this.loadCategory(result[1]);
    });
  }
 loadCategory(res){
    if (res.Status == "OK") {
      this.categoryList = res.Results;
    } else {
      this.msgBoxServ.showMessage("failed", [
        "Cannot Load the Lab Category",
      ]);
      console.log(res.ErrorMessage);
    }
 }

 loadTest(res){ 
      if (res.Status == "OK") {
          this.labTestList = res.Results;
          this.originalTestList=res.Results;
           }
      else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
      }
 }

  ngAfterViewChecked() {
    var myElement = document.getElementById("summaryFooter");
    if (myElement) {
      this.footer = document.getElementById("summaryFooter").innerHTML;
    }
  }

  Load() {
    this.dlService
      .Read(
        "/Reporting/GetLabTypeWiseTestCountReport?testId=" +
          this.selectedTestId +
          "&orderStatus="+this.orderStatus.statusList+
          "&categoryId=" +
          this.selectedCategoryId +
          "&FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate
      )
      .map((res) => res)
      .subscribe(
        (res) => this.Success(res),
        (err) => this.Error(err)
      );
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", ["Problem in fetching data."]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.labTypeWiseTestCountReportData = res.Results;
      for (var i = 0; i < this.labTypeWiseTestCountReportData.length; i++) {
        this.labTypeWiseTestCountReportData[i].Total = this.labTypeWiseTestCountReportData[i]["er-lab"]+this.labTypeWiseTestCountReportData[i]["op-lab"];
    }
      // this.labTypeWiseTestCountReportData.forEach(a=>a.push({'Total' : 'a.er-lab+a.op-lab'}));
       this.labTypeWiseTestCountReportData = this.labTypeWiseTestCountReportData.filter(a=>a.Total!=0);
       
       this.getSummary(this.labTypeWiseTestCountReportData);
       if(this.labTypeWiseTestCountReportData.length>0){
         this.showSummary=true;
       }
      //  var result = [];
      //  var acc = {};

      //  this.labTypeWiseTestCountReportData.forEach(currVal => {
      //    if (acc.hasOwnProperty(currVal.LabTestId)) {
      //      acc[currVal.LabTestId].Total += currVal.Total;
      //    } else {
      //      acc[currVal.LabTestId] = Object.assign({}, currVal);
      //      result.push(acc[currVal.LabTestId]);
      //    }
      //  });
      //  result=result.filter(a=>a.Total>0);
  
      //  console.log(this.labTypeWiseTestCountReportData);
      //  this.labTypeWiseTestCountReportData= this.labTypeWiseTestCountReportData.filter(a=> result.find(b=>b.LabTestId==a.LabTestId));


      
      this.showGrid = true;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.labTypeWiseTestCountReportData=[];
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  gridExportOptions = {
    fileName:
      "LabTypeWiseTestCountReport" + moment().format("YYYY-MM-DD") + ".xls",
  };

  getSummary(data: any) {
    this.summaryFormatted.TotalOPCount = data.reduce(function (acc, obj) { return acc + obj["op-lab"]; }, 0);
    this.summaryFormatted.TotalERCount = data.reduce(function (acc, obj) { return acc + obj["er-lab"]; }, 0);
    this.summaryFormatted.GrandTotal = data.reduce(function (acc, obj) { return acc + obj.Total; }, 0);
  }
  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    let nepFromDate=this.nepaliCalendarService.ConvertEngToNepDateString(this.fromDate);
    let nepToDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.toDate);
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate+"&nbsp;&nbsp;("+nepFromDate+"&nbsp; to &nbsp;"+nepToDate+")";
  }
  categoryListFormatter(data: any): string {
    let html = data["TestCategoryName"];
    return html;
  }
  testListFormatter(data: any): string {
    let html = data["LabTestName"];
    return html;
  }
  assignTestName(){
    if(this.test){
      this.selectedTestId=this.test.LabTestId;
      let category = this.categoryList.find(a=>a.TestCategoryId==this.test.LabTestCategoryId);
      
      if(category){
        this.category=category;
        this.selectedCategoryId= this.category.TestCategoryId;
      }

    }
    else{
      this.selectedTestId=null;
    }
  }
  assignCategory(){
    this.labTestList=this.originalTestList;
  if(this.category){
    this.selectedCategoryId = this.category.TestCategoryId;
    if(this.category.TestCategoryId>0){
     this.labTestList = this.labTestList.filter(a=>a.LabTestCategoryId==this.selectedCategoryId);
    }
  }
  else{
    this.selectedCategoryId=null;
  }

  this.test=null;
  this.selectedTestId=null;

  }
}
