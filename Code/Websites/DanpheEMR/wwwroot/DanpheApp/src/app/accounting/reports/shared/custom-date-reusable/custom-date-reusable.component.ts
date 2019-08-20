import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment/moment';
import { AccountingReportsBLService } from "../../shared/accounting-reports.bl.service";
import { FiscalYearModel } from "../../../settings/shared/fiscalyear.model";

@Component({
    selector: "danphe-cust-date-reusable",
    templateUrl: "./custom-date-reusable.html"
})
export class CustomDateReusableComponent {
    public showSelector: boolean = false;
    public fromDate: string = null;
    public toDate: string = null;
    public rangeType: string ="";
  public showLabel: boolean = false;
  public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
  public isOutOfFiscalYearDate: boolean = false;

    @Output("onDateChange")
    event: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(public accReportBLServ: AccountingReportsBLService) {
    this.GetFiscalYear();
    }
    @Input("rangeType")
    public set value(val: string) {
        this.rangeType = val ? val : "today";
        this.RangeTypeOnChange();
    }
    RangeTypeOnChange() {
      this.showSelector = false;
      this.showLabel = false;
      this.isOutOfFiscalYearDate = false;
        if (this.rangeType == "today") {
            //modify date as we want --> for Today --> 00:00 hrs to 23:59 hrs
            var from = new Date();
            from.setHours(0, 0, 0, 0);
            var to = new Date();
            to.setHours(23, 59, 59, 999);

            this.fromDate = moment(from).format('YYYY-MM-DD');
            this.toDate = moment(to).format('YYYY-MM-DD');
            this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        //else if (this.rangeType == "lastWeek") {
        //    //from --> (-7days) 00:00 hrs, to --> (today) 23:59 hrs
        //    var to = new Date();
        //    to.setHours(23, 59, 59, 999);
        //    var from = new Date(to.getTime() - (7 * 24 * 60 * 60 * 1000));
        //    from.setHours(0, 0, 0, 0);

        //    this.fromDate = moment(from).format('YYYY-MM-DD HH:mm');
        //    this.toDate = moment(to).format('YYYY-MM-DD HH:mm');
        //    this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        //}
        else if (this.rangeType == "thisMonth") { //Original this month
            //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
            var to = new Date();
            to.setHours(23, 59, 59, 999);
            var from = new Date(new Date().setDate(1));
            from.setHours(0, 0, 0, 0);
            
          this.fromDate = moment(from).format('YYYY-MM-DD');
          if (this.currentFiscalYear.StartDate >= this.fromDate) {
            this.fromDate = moment(this.currentFiscalYear.StartDate).format('YYYY-MM-DD');
            this.isOutOfFiscalYearDate = true;
          }
          this.toDate = moment(to).format('YYYY-MM-DD');
          this.showLabel = true;
            this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "last3Months") {
          //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
          var from = new Date();
          from.setHours(0, 0, 0, 0);
          from.setMonth(from.getMonth() - 3);
          //var to = new Date();
          //to.setHours(23, 59, 59, 999);
          //var temp = new Date(new Date().setDate(1));
          //temp.setHours(0, 0, 0, 0);
          //temp.setMonth(temp.getMonth() - 3);
          this.fromDate = moment(from).format('YYYY-MM-DD');
          if (this.currentFiscalYear.StartDate >= this.fromDate) {
            this.fromDate = moment(this.currentFiscalYear.StartDate).format('YYYY-MM-DD');
            this.isOutOfFiscalYearDate = true;
          }
          this.toDate = moment(to).format('YYYY-MM-DD');
          this.showLabel = true;
          this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "last6Months") {
          //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
          var from = new Date();
          from.setHours(0, 0, 0, 0);
          from.setMonth(from.getMonth() - 6);
          //var to = new Date();
          //to.setHours(23, 59, 59, 999);
          //   //if months are the fiscal year
          //var temp = new Date(new Date().setDate(1));
          //temp.setHours(0, 0, 0, 0);
          //temp.setMonth(temp.getMonth() - 6);

          this.fromDate = moment(from).format('YYYY-MM-DD');
          if (this.currentFiscalYear.StartDate >= this.fromDate) {
            this.fromDate = moment(this.currentFiscalYear.StartDate).format('YYYY-MM-DD');
            this.isOutOfFiscalYearDate = true;
          }
          this.toDate = moment(to).format('YYYY-MM-DD');
          this.showLabel = true;
          this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else if (this.rangeType == "currFiscalYear") {
          //from --> start date of fiscal year to current date of fiscal year
          var to = new Date();
          to.setHours(23, 59, 59, 999);
          this.fromDate = moment(this.currentFiscalYear.StartDate).format('YYYY-MM-DD');
          this.toDate = moment(to).format('YYYY-MM-DD');
          this.showLabel = true;
          this.event.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
        else {
            this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
            this.showSelector = true;
            this.event.emit({fromDate:this.fromDate, toDate:this.toDate, type:"custom"});
        }
    }

    ChangeCustomDate() {
        var fDate = moment(this.fromDate).format('YYYY-MM-DD 00:00');
        var tDate = moment(this.toDate).format('YYYY-MM-DD 23:59');
        this.event.emit({ fromDate: fDate, toDate: tDate });
  }

  GetFiscalYear() {
      this.accReportBLServ.GetFiscalYearsList().subscribe(res => {
        if (res.Status == "OK") {
          this.fiscalYearList = res.Results;
          this.currentFiscalYear = this.fiscalYearList.find(x => x.IsActive == true);
        }
      });
  }
}
