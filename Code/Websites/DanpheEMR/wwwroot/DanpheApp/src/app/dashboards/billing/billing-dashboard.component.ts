import { Component, ElementRef, ViewChild } from '@angular/core'
import * as moment from 'moment/moment';
import { DLService } from "../../shared/dl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { Chart } from 'chart.js';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat } from '../../shared/shared-enums';


@Component({
  templateUrl: "./billing-dashboard.html",
  styleUrls: ['./billing-dashboard.style.css']
})

export class BillingDashboardComponent {

  rankWiseChart: any;
  membershipWiseChart: any;

  @ViewChild("rankWisePatientInvoiceCountRef") rankWisePatientInvoiceCountRef: ElementRef;
  @ViewChild("memberWisePatientInvoiceCountRef") memberWisePatientInvoiceCountRef: ElementRef;

  fromDate = moment(new Date()).format(ENUM_DateTimeFormat.Year_Month_Day);
  toDate = moment(new Date()).format(ENUM_DateTimeFormat.Year_Month_Day);

  fromDateForMembership = '';
  toDateForMembership = '';

  fromDateForRank = '';
  toDateForRank = '';

  fromDateForInpatientCensus = '';
  toDateForInpatientCensus = '';

  totalAdmittedPatients = 0;
  totalDischargedPatients = 0;

  inpatientCensusReport = new Array<BillingDashboardInpatientCensusReport>();

  rankWisePatientInvoiceCount = new Array<RankWisePatientInvoice>();

  membershipWisePatientInvoiceCount = new Array<MembershipWisePatientInvoice>();

  billingDashboardCardSummaryPatientReport = new BillingDashboardCardSummaryPatientReport();
  billingDashboardCardSummaryIncomeReport = new BillingDashboardCardSummaryIncomeReport();
  billingDashboardCardSummaryBillReturnReport = new BillingDashboardCardSummaryBillReturnReport();

  colors = [];

  constructor(private billingBlService: BillingBLService, private dlService: DLService) {
    this.getAllBillingDashboardData();
  }

  ngOnInit(): void {
  }

  getAllBillingDashboardData(): void {
    this.billingBlService.GetAllBillingDashBoardDataCardSummary().subscribe((res: any) => {
      if (res && res.Results) {
        const dashboardCardSummary = res;

        if (dashboardCardSummary && dashboardCardSummary.Results) {
          this.billingDashboardCardSummaryPatientReport = dashboardCardSummary.Results.PatientReport[0];
          this.billingDashboardCardSummaryIncomeReport = dashboardCardSummary.Results.IncomeReport[0];
          this.billingDashboardCardSummaryBillReturnReport = dashboardCardSummary.Results.BillReturnReport[0];
        }
      }
    }, err => {
      console.log(err);
    })
  }

  generateRandomColors(membershipWisePatientInvoice): void {
    if (membershipWisePatientInvoice && membershipWisePatientInvoice.length > 0) {
      for (let i = 0; i < membershipWisePatientInvoice.length; i++) {
        this.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
      }
    }
  }

  loadBillingDashboardMembershipWisePatientInvoiceCount(): void {
    this.billingBlService.GetBillingDashboardMembershipWisePatientInvoice(this.fromDate, this.toDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.membershipWisePatientInvoiceCount = res.Results;
        this.generateRandomColors(this.membershipWisePatientInvoiceCount);
        this.createMembershipWisePatientPie();
      }
    }, err => {
      console.log(err);
    });
  }

  loadBillingDashboardRankWisePatientInvoiceCount(): void {
    this.billingBlService.GetBillingDashboardRankWisePatientInvoice(this.fromDate, this.toDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.rankWisePatientInvoiceCount = res.Results;
        this.createRankWisePatientInvoiceBarChart();
      }
    }, err => {
      console.log(err);
    });
  }

  loadBillingDashboardInpatientCensusReport(): void {
    this.billingBlService.GetBillingDashboardInpatientCensusReport(this.fromDate, this.toDate).subscribe((res: any) =>{
      if(res && res.length > 0){
        this.totalDischargedPatients = res[0].Results.length;
        this.totalAdmittedPatients  = res[1].Results.length; 
        const inpatientCensusWardWise = res[2].Results;
        this.inpatientCensusReport = inpatientCensusWardWise;
      }
    })
  }

  createMembershipWisePatientPie() {
    if(this.membershipWiseChart)
    {
            this.membershipWiseChart.destroy();
    }
    this.membershipWiseChart = new Chart(
      this.memberWisePatientInvoiceCountRef.nativeElement,
      {
        type: 'pie',
        data: {
          datasets: [
            {
              data: this.membershipWisePatientInvoiceCount.map(row => row.Total),
              backgroundColor: this.colors
            },
          ],
          labels: this.membershipWisePatientInvoiceCount.map(row => row.MembershipTypeName),
        },
        options: {
          maintainAspectRatio: true,
          title: {
            text: 'Membership Based Patient Invoice Count',
            display: false,
            fontColor: '#333333',
            fontFamily: '"Nunito Sans", sans-serif',
            position: 'top',
            fontSize: 14,
          },
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              fontSize: 12,
              fontColor: '#333333',
              fontFamily: '"Nunito Sans", sans-serif',
              boxWidth: 8,
              padding: 15
            },
          },
        },

      }
    );
  }

  createRankWisePatientInvoiceBarChart() {
    if(this.rankWiseChart)
    {
            this.rankWiseChart.destroy();
    }
    this.rankWiseChart = new Chart(this.rankWisePatientInvoiceCountRef.nativeElement, {
      type: 'bar',
      data: {
        datasets: [

          {
            label: 'Rank Wise Patient Invoice',
            data: this.rankWisePatientInvoiceCount.map(row => row.Total),
            backgroundColor: '#008FFB',
            order: 3
          }

        ],
        labels: this.rankWisePatientInvoiceCount.map(row => row.Rank)
      },
      options: {

        maintainAspectRatio: true,
        title: {
          text: 'Abnormal Test Result',
          display: false,
          fontColor: '#333333',
          fontFamily: '"Nunito Sans", sans-serif',
          position: 'top',
          fontSize: 14,
        },
        legend: {
          position: 'bottom',
          align: 'center',
          display: false,
          labels: {
            usePointStyle: true,
            boxWidth: 6,
            fontSize: 12,
            padding: 20,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
              },
            },
          ],
        },
      },
    });
  }

  OnFromToDateChanged($event): void{
    this.fromDate = $event ? $event.fromDate: this.fromDate;
    this.toDate = $event ? $event.toDate: this.toDate;
    this.loadBillingDashboardMembershipWisePatientInvoiceCount();
    this.loadBillingDashboardRankWisePatientInvoiceCount();
    this.loadBillingDashboardInpatientCensusReport();
  }

  // OnFromToDateChangeForMembershipWise($event): void {
  //   this.fromDateForMembership = $event ? $event.fromDate : this.fromDateForMembership;
  //   this.toDateForMembership = $event ? $event.toDate : this.toDateForMembership;
  //   this.loadBillingDashboardMembershipWisePatientInvoiceCount()
  // }
  // OnFromToDateChangeForRankWise($event): void {
  //   this.fromDateForRank = $event ? $event.fromDate : this.fromDateForRank;
  //   this.toDateForRank = $event ? $event.toDate : this.toDateForRank;
  //   this.loadBillingDashboardRankWisePatientInvoiceCount();
  // }
  // OnFromToDateChangeForInpatientCensusReport($event): void {
  //   this.fromDateForInpatientCensus = $event ? $event.fromDate : this.fromDateForInpatientCensus;
  //   this.toDateForInpatientCensus = $event ? $event.toDate : this.toDateForInpatientCensus;
  //   this.loadBillingDashboardInpatientCensusReport();
  // }
}

export class MembershipWisePatientInvoice {
  MembershipTypeName: string = '';
  Total: number = 0;
}
export class RankWisePatientInvoice {
  Rank: string = '';
  Total: number = 0;
}
export class BillingDashboardCardSummaryPatientReport {
  Total_Today: number = 0;
  Total_Weekly: number = 0;
  Total_Monthly: number = 0;
}
export class BillingDashboardCardSummaryIncomeReport {
  Total_Today: number = 0;
  Total_Weekly: number = 0;
  Total_Monthly: number = 0;
}
export class BillingDashboardCardSummaryBillReturnReport {
  Total_Today: number = 0;
  Total_Weekly: number = 0;
  Total_Monthly: number = 0;
}

export class BillingDashboardInpatientCensusReport{
  Ward: number = 0;
  InBed: number = 0;
  NewAdmission: number = 0;
  TransIn: number = 0;
  TransOut: number = 0;
  Discharged: number = 0;
  Total: number = 0;
}