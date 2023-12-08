import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ENUM_DanpheHTTPResponseText } from '../../shared/shared-enums';
import { BarchartModel, CardCalculationModel, DateRange, MedicineSaleModel, MembershipwiseMedicineSaleModel } from '../shared/pharmacy-dashboard.model';



@Component({
  templateUrl: "./pharmacy-dashboard.html"
})

export class PharmacyDashboardComponent {

  substoreWiseValue: any;
  dateRange: DateRange = new DateRange();
  SalesData: Array<CardCalculationModel> = new Array<CardCalculationModel>();
  GoodReceiptData: Array<CardCalculationModel> = new Array<CardCalculationModel>();
  SalesDifferenceRate: number | string = 0;
  GoodReceiptDifferenceRate: number | string = 0;
  IsAllDataLoaded: boolean = false;
  DispatchDataDifferenceRate: number | string = 0;
  DispatchData: Array<CardCalculationModel> = new Array<CardCalculationModel>();;
  StockData: Array<CardCalculationModel> = new Array<CardCalculationModel>();;
  BarchartModel: BarchartModel = new BarchartModel();
  MembershipwiseMedicineSales: Array<MembershipwiseMedicineSaleModel> = new Array<MembershipwiseMedicineSaleModel>();
  MedicineSolds: Array<MedicineSaleModel> = new Array<MedicineSaleModel>();

  constructor(public pharmacyBLService: PharmacyBLService) { }

  ngOnInit(): void {
  }

  OnFromToDateChange($event) {
    let dateRange = this.updateDateRange(this.dateRange, $event)
    this.GetPharmacyDashboardCardSummaryCalculation(dateRange.fromDate, dateRange.toDate);
    this.GetPharmacyDashboardSubstoreWiseDispatchValue(dateRange.fromDate, dateRange.toDate);
    this.GetPharmacyDashboardMembershipWiseMedicineSale(dateRange.fromDate, dateRange.toDate);
    this.GetPharmacyDashboardMostSoldMedicine(dateRange.fromDate, dateRange.toDate)
  }
  updateDateRange(dateRange: DateRange, $event: DateRange): DateRange {
    dateRange.fromDate = $event ? $event.fromDate : dateRange.fromDate;
    dateRange.toDate = $event ? $event.toDate : dateRange.toDate;
    dateRange.range = "<b>Date:</b>&nbsp;" + dateRange.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.dateRange.toDate;
    return dateRange;
  }
  createChart(barChartData: BarchartModel) {
    this.substoreWiseValue = new Chart('substoreWiseValue', {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Bar Dataset',
            barPercentage: 1,
            barThickness: 80,
            maxBarThickness: 100,
            minBarLength: 10,
            data: barChartData.DispatchValues,
            backgroundColor: '#14C67C',
            // order: 2,
          },
        ],
        labels: barChartData.Names,
      },
      options: {
        maintainAspectRatio: true,
        title: {
          text: 'Rank Wise Patients',
          fontColor: '#333333',
          fontFamily: '"Nunito Sans", sans-serif',
          display: false,
          position: 'top',
          fontSize: 14,
          lineHeight: 100,
        },
        legend: {
          position: 'bottom',
          display: false,
          align: 'center',
          labels: {
            usePointStyle: true,
            padding: 10,
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                lineWidth: 1,
                zeroLineWidth: 1,
                zeroLineColor: '#666666',
                drawTicks: false
              },
              ticks: {
                padding: 10,
                autoSkip: false,
                maxRotation: 0,
                fontSize: 10,
                lineHeight: 1.6,
                callback(value: string, index, values): any {
                  if (value.length > 10) {
                    var newValue: any = "";
                    var words = value.split(" ");
                    for (var i = 0; i < words.length; i++) {
                      var line = newValue + " " + words[i];
                      if (line.length > 20) {
                        newValue += "\n" + words[i];
                      } else {
                        newValue += " " + words[i];
                      }
                    }
                    newValue = newValue.split("\n");
                    return newValue;
                  } else {
                    return value;
                  }
                }
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
    });
  }

  GetPharmacyDashboardCardSummaryCalculation(FromDate: string, ToDate: string) {
    this.pharmacyBLService.GetPharmacyDashboardCardSummaryCalculation(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.SalesData = res.Results.Sales;
        this.SalesDifferenceRate = ((this.SalesData[4].TotalAmount - this.SalesData[3].TotalAmount) / this.SalesData[3].TotalAmount) * 100;
        if (Math.abs(this.SalesDifferenceRate) === Infinity) {
          this.SalesDifferenceRate = '-';
        }
        this.GoodReceiptData = res.Results.GoodReceipts;
        this.GoodReceiptDifferenceRate = ((this.GoodReceiptData[4].TotalAmount - this.GoodReceiptData[3].TotalAmount) / this.GoodReceiptData[3].TotalAmount) * 100;
        if (Math.abs(this.GoodReceiptDifferenceRate) === Infinity) {
          this.GoodReceiptDifferenceRate = '-';
        }
        this.DispatchData = res.Results.Dispatchs;
        this.DispatchDataDifferenceRate = ((this.DispatchData[4].TotalAmount - this.DispatchData[3].TotalAmount) / this.DispatchData[3].TotalAmount) * 100;
        if (Math.abs(this.DispatchDataDifferenceRate) === Infinity) {
          this.DispatchDataDifferenceRate = '-';
        }
        this.StockData = res.Results.Stocks;
        this.IsAllDataLoaded = true;
      }
    })
  }

  GetPharmacyDashboardSubstoreWiseDispatchValue(FromDate: string, ToDate: string) {
    this.pharmacyBLService.GetPharmacyDashboardSubstoreWiseDispatchValue(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.BarchartModel = new BarchartModel();
        this.BarchartModel.Names = res.Results.map(a => a.Name);
        this.BarchartModel.DispatchValues = res.Results.map(a => a.TotalDispatchValue);
        this.createChart(this.BarchartModel);

      }
    })
  }
  GetPharmacyDashboardMembershipWiseMedicineSale(FromDate: string, ToDate: string) {
    this.pharmacyBLService.GetPharmacyDashboardMembershipWiseMedicineSale(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.MembershipwiseMedicineSales = [];
        this.MembershipwiseMedicineSales = res.Results;
      }
    })
  }

  GetPharmacyDashboardMostSoldMedicine(FromDate: string, ToDate: string) {
    this.pharmacyBLService.GetPharmacyDashboardMostSoldMedicine(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.MedicineSolds = [];
        this.MedicineSolds = res.Results;
      }
    })
  }
}
