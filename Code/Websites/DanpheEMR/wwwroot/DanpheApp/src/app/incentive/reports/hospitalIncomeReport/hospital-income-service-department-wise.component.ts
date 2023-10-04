import { Component, Input } from "@angular/core";
import { CommonFunctions } from "../../../shared/common.functions";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
    selector:"hospital-income-service-dept-wise",
    templateUrl:"hospital-income-service-department-wise.html"
})
export class INCTV_RPT_HospitalIncomeServiceDeptWiseComponent{

    hospitalIncomeReport:any = [];
    @Input('row-data')
    public rowData:any = {};
    public ServiceDepartmentName:string = "";
    constructor(private dlService:DLService,private msgBoxServ:MessageboxService) {

    } 

    ngOnInit(){
        if(this.rowData){
          this.ServiceDepartmentName = this.rowData.ServiceDepartmentName;
            this.LoadReportData();
        }
    }

    LoadReportData(){
        this.dlService
        .Read(
          "/Reporting/HospitalIncomeIncentiveReportServiceDepartmentWise?FromDate=" +
            this.rowData.FromDate +
            "&ToDate="+this.rowData.ToDate+
            "&ServiceDepartmentId=" +
            this.rowData.ServiceDepartmentId
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (err) => this.Error(err)
        );
    }

    Error(err) {
        this.msgBoxServ.showMessage("error", ["Problem in fetching data."]);
        this.hospitalIncomeReport = [];
      }
    
      Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
         this.hospitalIncomeReport = res.Results;
        } else {
          this.msgBoxServ.showMessage("notice", ["No data found!"]);
          this.hospitalIncomeReport = [];
        }
      }

      ExportToExcel(tableId:any){
        if (tableId) {
          let workSheetName = 'Hospital Income Service Department Report';
          let Heading = 'Hospital Income Service Department Report';
          let filename = 'HospitalIncomeServDeptWiseReport';

          CommonFunctions.ConvertHTMLTableToExcel(tableId, this.rowData.FromDate, this.rowData.ToDate, workSheetName,Heading, filename);
      }
    }

}