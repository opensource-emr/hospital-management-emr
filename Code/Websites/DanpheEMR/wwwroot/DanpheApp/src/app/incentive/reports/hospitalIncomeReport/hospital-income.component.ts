import { Component } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import * as moment from "moment";
import { CommonFunctions } from "../../../shared/common.functions";
import * as _ from 'lodash';

@Component({
    selector:"hospital-income",
    templateUrl:"hospital-income.html"
})
export class INCTV_RPT_HospitalIncomeComponent{

    public fromDate:any;
    public toDate:any;
    public serviceDepartmentsList:any = [];
    public reportData:any = [];
    public hospitalIncomeReportColumns:any;
    public preSelectedData:any = [];
    public SelectedServiceDepartments:any;
    public allcategories:any = [];

    public summary = {
     tot_NetSales: 0,
     tot_RefCommission: 0, 
     tot_GrossIncome: 0, 
     tot_OtherIncentive: 0,
     tot_HospitalNetIncome: 0
   };

   public rowData:any;
   public isServiceDepartmentWise:boolean = false;

    public selectedServiceDepartmentKey:string = "selected-serviceDepartment-hospital-income"
    constructor(private dlService:DLService,private msgBoxServ:MessageboxService) {

    }
    ngOnInit(){
        this.LoadServiceDepartments();
    }

    LoadServiceDepartments(){
      this.dlService.Read("/BillingReports/GetServiceDeptList")
      .map(res => res).subscribe(res => {
          if (res.Status == "OK") {
              this.serviceDepartmentsList = res.Results;

              this.serviceDepartmentsList.forEach(p =>{
                let val = _.cloneDeep(p);
                this.preSelectedData.push(val);
              });
        }
     });
    }

    LoadHospitalIncomeReport(){
        this.dlService
        .Read(
          "/Reporting/HospitalIncomeIncentiveReport?FromDate=" +
            this.fromDate +
            "&ToDate="+this.toDate+
            "&ServiceDepartments=" +
            this.SelectedServiceDepartments
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (err) => this.Error(err)
        );
    }

    Error(err) {
        this.msgBoxServ.showMessage("error", ["Problem in fetching data."]);
        this.reportData = [];
      }
    
      Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
         this.reportData = res.Results;
         this.CalculateTotals(this.reportData);
        } else {
          this.msgBoxServ.showMessage("notice", ["No data found!"]);
          this.reportData = [];
        }
      }

      CalculateTotals(data:any){
        this.summary.tot_NetSales = data.reduce((acc,curr) => acc + curr.NetSales,0);
        this.summary.tot_RefCommission = data.reduce((acc,curr) => acc + curr.ReferralCommission,0);
        this.summary.tot_GrossIncome = data.reduce((acc,curr) => acc + curr.GrossIncome,0);
        this.summary.tot_OtherIncentive = data.reduce((acc,curr) => acc + curr.OtherIncentive,0);
        this.summary.tot_HospitalNetIncome = data.reduce((acc,curr) => acc + curr.HospitalNetIncome,0);

        this.summary.tot_NetSales = CommonFunctions.parseAmount(this.summary.tot_NetSales);
        this.summary.tot_RefCommission = CommonFunctions.parseAmount(this.summary.tot_RefCommission);
        this.summary.tot_GrossIncome = CommonFunctions.parseAmount(this.summary.tot_GrossIncome);
        this.summary.tot_OtherIncentive = CommonFunctions.parseAmount(this.summary.tot_OtherIncentive);
        this.summary.tot_HospitalNetIncome = CommonFunctions.parseAmount(this.summary.tot_HospitalNetIncome);



      }


      LoadServiceDepartmentWiseItems(row:any){
        if(row){
          let rowData:any = {
            FromDate: this.fromDate,
            ToDate: this.toDate,
            ServiceDepartmentId:row.ServiceDepartmentId,
            ServiceDepartmentName: row.ServiceDepartmentName
          }
          this.rowData = rowData;
          this.isServiceDepartmentWise = true;
        }
      }
      OnDateRangeChange($event:any){
        if ($event) {
          this.fromDate = $event.fromDate;
          this.toDate = $event.toDate;
        }
      }

      ExportToExcel(tableId:any){
        if (tableId) {
          let workSheetName = 'Hospital Income Report';
          let Heading = 'Hospital Income Report';
          let filename = 'HospitalIncomeReport';

          CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,Heading, filename);
      }
    }

    ServiceDepartmentOnChange($event:any){
      let defServiceDepartments = [];
      $event.forEach(x => {
        defServiceDepartments.push(x.ServiceDepartmentId);
      });
      let ServiceDepartmentLists = defServiceDepartments.join(",");
      this.SelectedServiceDepartments = ServiceDepartmentLists;
    }
    GoBacktoGrid(){
      this.isServiceDepartmentWise = false;
      this.reportData = [];
    }
}