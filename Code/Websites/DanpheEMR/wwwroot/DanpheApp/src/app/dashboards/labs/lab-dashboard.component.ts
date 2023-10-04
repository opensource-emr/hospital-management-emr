import { Component } from '@angular/core'
import { Chart } from 'chart.js';
import { CoreService } from '../../core/shared/core.service';
import { LabsBLService } from '../../labs/shared/labs.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { DLService } from '../../shared/dl.service';
import { labReqDetails, LabSummaryDashboardVM, NormalAbnormalLabModel } from './labDashboardVM.model';

type dateRange = {
    fromDate: string;
    toDate: string;
    range: string;
};

type membershipWiseChartData = {
    TotalCount: number;
    MembershipTypeName: string;
}
type rankWiseChartData = {
    Rank: string;
    TotalCount: number;
}
type trendingTestData = {
    LabTestName: string;
    Counts: number;
}
type testDoneTodayData = {
    ReportTemplateShortName: string;
    TestCount: number;
}
type dengueTestData = {
    ResultNotFinalizedCount: number;
    PositiveCount: number;
    NegativeCount: number;
    TotalCount: number;
}



@Component({
    templateUrl: "./lab-dashboard.html"
})

export class LabDashboardComponent {
    cardDateRange: dateRange;

    rankwisetestcount: any;
    abnormalTestResult: any;
    trendingLabTests: any;
    testCompleteToday: testDoneTodayData[] = [];
    memberwisecount: any;
    public testname: string = null;
    public covidDetails = new LabSummaryDashboardVM();
    fromDate: any;
    toDate: any;
    membershipWiseTestCountDetails: membershipWiseChartData[] = [];
    colorsForMembershipCharts: any = [];
    rankWiseCountDetails: rankWiseChartData[] = [];
    colorsForRankWiseCharts: any = [];
    trendingLabTestsDetails: trendingTestData[] = [];
    totalTestCompletedToday: number = 0;
    todaysDengueDetails: dengueTestData;
    overallDengueDetails: dengueTestData;
    testReqDetailsTillNow: labReqDetails = new labReqDetails();
    testReqDetailsToday: labReqDetails = new labReqDetails();
    abnormalLabDetails: NormalAbnormalLabModel = new NormalAbnormalLabModel();
    normalLabDetails: NormalAbnormalLabModel = new NormalAbnormalLabModel();
    noOfVisitsDetails: NormalAbnormalLabModel = new NormalAbnormalLabModel();
    testId: number = 0;
    allLabTests: any;
    selectedTest: any;


    constructor(public dlService: DLService,
        public securityService: SecurityService,
        public coreService: CoreService,
        private labBlService: LabsBLService) {
        var name = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CovidTestName');
        if (name) {
            var paramValue = JSON.parse(name.ParameterValue);
            this.testname = paramValue.DisplayName;
        }
        this.GetAllLabTests()
        this.LoadCovidTestDetails();
        this.LoadTestDoneToday();
        this.LoadDengueDetails();
        this.LoadTestReqDetails();

    }

    ngOnInit(): void {

    }
    GetAllLabTests() {
        this.labBlService.GetAllLabTests().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status = "Ok") {
                    this.allLabTests = res.Results;
                }
            }
        )
    }
    createChart() {

        this.abnormalTestResult = new Chart('abnormalTestResult', {
            type: 'bar',
            data: {
                datasets: [
                    {
                        label: 'No Of Visits',
                        data: [this.noOfVisitsDetails.JanCount,
                        this.noOfVisitsDetails.FebCount,
                        this.noOfVisitsDetails.MarCount,
                        this.noOfVisitsDetails.AprCount,
                        this.noOfVisitsDetails.MarCount,
                        this.noOfVisitsDetails.JunCount,
                        this.noOfVisitsDetails.JulCount,
                        this.noOfVisitsDetails.AugCount,
                        this.noOfVisitsDetails.SepCount,
                        this.noOfVisitsDetails.OctCount,
                        this.noOfVisitsDetails.NovCount,
                        this.noOfVisitsDetails.DecCount],
                        backgroundColor: '#008FFB',
                        order: 3,
                    },
                    {
                        type: 'line',
                        label: 'Normal',
                        data: [
                            this.normalLabDetails.JanCount,
                            this.normalLabDetails.FebCount,
                            this.normalLabDetails.MarCount,
                            this.normalLabDetails.AprCount,
                            this.normalLabDetails.MarCount,
                            this.normalLabDetails.JunCount,
                            this.normalLabDetails.JulCount,
                            this.normalLabDetails.AugCount,
                            this.normalLabDetails.SepCount,
                            this.normalLabDetails.OctCount,
                            this.normalLabDetails.NovCount,
                            this.normalLabDetails.DecCount
                        ],
                        borderColor: '#26E7A6',
                        backgroundColor: '#26E7A6',
                        order: 1,
                        fill: false,
                        showLine: true,
                    },
                    {
                        type: 'line',
                        label: 'Abnormal',
                        data: [
                            this.abnormalLabDetails.JanCount,
                            this.abnormalLabDetails.FebCount,
                            this.abnormalLabDetails.MarCount,
                            this.abnormalLabDetails.AprCount,
                            this.abnormalLabDetails.MarCount,
                            this.abnormalLabDetails.JunCount,
                            this.abnormalLabDetails.JulCount,
                            this.abnormalLabDetails.AugCount,
                            this.abnormalLabDetails.SepCount,
                            this.abnormalLabDetails.OctCount,
                            this.abnormalLabDetails.NovCount,
                            this.abnormalLabDetails.DecCount
                        ],
                        borderColor: '#F46A6A',
                        backgroundColor: '#F46A6A',
                        order: 2,
                        fill: false,
                        showLine: true,
                    },
                ],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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



    OnCardFromToDateChange($event) {
        // this.updateDateRange(this.cardDateRange, $event)
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        this.LoadMembershipWiseTestCount();
        this.LoadRankWiseTestCount();
        this.LoadTrendingTestCount();
    }
    updateDateRange(dateRange: dateRange, $event: dateRange) {
        dateRange.fromDate = $event ? $event.fromDate : dateRange.fromDate;
        dateRange.toDate = $event ? $event.toDate : dateRange.toDate;
        dateRange.range = "<b>Date:</b>&nbsp;" + dateRange.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.cardDateRange.toDate;
    }

    LoadCovidTestDetails() {
        this.dlService.Read("/Reporting/CovidDetailsForLab?testName=" + this.testname)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.covidDetails = res.Results[0];
                }
            },
                err => {
                    alert(err.ErrorMessage);
                });
    }
    LoadMembershipWiseTestCount() {
        this.labBlService.GetMembershipWiselabTestCount(this.fromDate, this.toDate)
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    this.membershipWiseTestCountDetails = res.Results;
                    if (this.membershipWiseTestCountDetails && this.membershipWiseTestCountDetails.length == 0) {
                        this.membershipWiseTestCountDetails = [{ TotalCount: 0, MembershipTypeName: 'No Data Available for DateRange' }];
                    }
                    this.GenerateRandomColorsForMembershipPieChart(this.membershipWiseTestCountDetails);
                    this.CreateMembershipWisePie();
                }
            },
                err => {
                    alert(err.ErrorMessage);
                });
    }
    CreateMembershipWisePie() {
        if (this.memberwisecount) {
            this.memberwisecount.destroy();
        }
        this.memberwisecount = new Chart(
            'memberwisecount',
            {
                type: 'pie',
                data: {
                    datasets: [
                        {
                            data: this.membershipWiseTestCountDetails.map(row => row.TotalCount),
                            backgroundColor: this.colorsForMembershipCharts,
                        },
                    ],
                    labels: this.membershipWiseTestCountDetails.map(row => row.MembershipTypeName),
                },
                options: {
                    maintainAspectRatio: true,
                    title: {
                        text: 'Rank Based Patient Distribution',
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
    LoadRankWiseTestCount() {
        this.labBlService.GetRankWiselabTestCount(this.fromDate, this.toDate)
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    this.rankWiseCountDetails
                        = res.Results;
                    if (this.rankWiseCountDetails
                        && this.rankWiseCountDetails
                            .length == 0) {
                        this.rankWiseCountDetails
                            = [{ TotalCount: 0, Rank: 'No Data Available for DateRange' }];
                    }
                    this.GenerateRandomColorsForRankPieChart(this.rankWiseCountDetails
                    );
                    this.CreateRankWisePie();
                }
            },
                err => {
                    alert(err.ErrorMessage);
                });
    }

    CreateRankWisePie() {
        if (this.rankwisetestcount) {
            this.rankwisetestcount.destroy();
        }
        this.rankwisetestcount = new Chart(
            'rankwisetestcount',
            {
                type: 'pie',
                data: {
                    datasets: [
                        {
                            data: this.rankWiseCountDetails
                                .map(row => row.TotalCount),
                            backgroundColor: this.colorsForRankWiseCharts,
                        },
                    ],
                    labels: this.rankWiseCountDetails
                        .map(row => row.Rank),
                },
                options: {
                    maintainAspectRatio: true,
                    title: {
                        text: 'Rank Based Patient Distribution',
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

    LoadTrendingTestCount() {
        this.labBlService.GetTrendinglabTestCount(this.fromDate, this.toDate)
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    this.trendingLabTestsDetails
                        = res.Results;
                    if (this.trendingLabTestsDetails && this.trendingLabTestsDetails.length == 0) {
                        this.trendingLabTestsDetails = [{ Counts: 0, LabTestName: 'No Test in selected Date range' }];
                    }
                    this.CreateTrendingLabTestBarGraph();
                }
            },
                err => {
                    alert(err.ErrorMessage);
                });
    }

    CreateTrendingLabTestBarGraph() {
        if (this.trendingLabTests) {
            this.trendingLabTests.destroy();
        }
        this.trendingLabTests = new Chart('trendingLabTests', {
            type: 'bar',
            data: {
                labels: this.trendingLabTestsDetails.map(row => row.LabTestName),
                datasets: [
                    {
                        label: 'In Patient',
                        barPercentage: 1,
                        barThickness: 40,
                        maxBarThickness: 30,
                        minBarLength: 10,
                        data: this.trendingLabTestsDetails.map(row => row.Counts),
                        backgroundColor: '#18E3D8'
                    }

                ],
            },
            options: {
                maintainAspectRatio: true,
                title: {
                    text: 'Patients Count By Day',
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
                    // maxWidth: 100,
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        fontSize: 10,
                        padding: 20,
                    },
                    // title: { display: false, text: 'This is Title Of text', align: 'start' },
                    // tooltip: {}
                },
                scales: {
                    xAxes: [
                        {
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                labelOffset: 2,
                                fontSize: 10,
                                maxRotation: 0,
                                autoSkip: false,
                                callback(value: string, index, values): any {
                                    if (value.length > 15) {
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
                            gridLines: {
                                display: false,
                            },
                            scaleLabel: {
                                fontSize: 12
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
            }
        });
    }
    LoadTestDoneToday() {
        this.labBlService.GetLabTestDoneTodayDetails()
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    this.testCompleteToday
                        = res.Results;
                    if (this.testCompleteToday && this.testCompleteToday.length == 0) {
                        this.testCompleteToday = [{ TestCount: 0, ReportTemplateShortName: 'No Test is completed' }];
                    }
                    else {
                        this.testCompleteToday.forEach(x => {
                            this.totalTestCompletedToday = this.totalTestCompletedToday + x.TestCount;
                        }
                        )
                    }
                    this.CreateGraphTestDoneToday();
                }
            }, err => {
                alert(err.ErrorMessage);
            });
    }
    CreateGraphTestDoneToday() {
        if (this.testCompleteToday) {
            this.testCompleteToday=[];
        }
        this.testCompleteToday = new Chart(
            'testCompleteToday',
            {
                type: 'doughnut',
                data: {
                    datasets: [
                        {
                            data: this.testCompleteToday.map(row => row.TestCount),
                            backgroundColor: [
                                '#4C82FF',
                                '#FF4560',
                                '#18E3D8',
                            ],
                        },
                    ],
                    labels: this.testCompleteToday.map(row => row.ReportTemplateShortName),
                },
                options: {
                    maintainAspectRatio: true,
                    cutoutPercentage: 70,
                    title: {
                        text: 'Lab Test Completed Today',
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
                            padding: 15,
                        },
                        // title: { display: false, text: 'This is Title Of text', align: 'start' },
                        // tooltip: {}
                    }
                }
            }
        );
    }
    // CreateMembershipType
    LoadDengueDetails() {
        this.labBlService.GetDengueTestDetails()
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    // let dengueDetails
                    //     = res.Results[0];
                    this.overallDengueDetails = res.Results[0];
                    this.todaysDengueDetails = res.Results[1];
                }
            }, err => {
                alert(err.ErrorMessage);
            });
    }

    LoadTestReqDetails() {
        this.labBlService.GetTestReqDetails()
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    let labReqSummary = JSON.parse(res.Results.JsonData);
                    let testReqSummaryDetailsTillNow = labReqSummary.LabReqTillNow;
                    let testReqSummaryDetailsToday = labReqSummary.LabReqToday;
                    this.testReqDetailsTillNow.TotalCount = (testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Total'))[0]).TotalCount;
                    this.testReqDetailsTillNow.PositiveCount = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Positive'))[0].TotalCount;
                    this.testReqDetailsTillNow.NegativeCount = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Negative'))[0].TotalCount;
                    this.testReqDetailsTillNow.PendingCount = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Pending'))[0].TotalCount;
                    this.testReqDetailsTillNow.TotalCountForNewPatient = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Total'))[0].TotalCount;
                    this.testReqDetailsTillNow.PendingCountForNewPatient = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Pending'))[0].TotalCount;
                    this.testReqDetailsTillNow.CompleteCountForNewPatient = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Complete'))[0].TotalCount;
                    this.testReqDetailsTillNow.CancelledCountForNewPatient = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Cancelled'))[0].TotalCount;
                    this.testReqDetailsTillNow.ReturnCountForNewPatient = testReqSummaryDetailsTillNow.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Returned'))[0].TotalCount;


                    this.testReqDetailsToday.TotalCount = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Total'))[0].TotalCount;
                    this.testReqDetailsToday.PositiveCount = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Positive'))[0].TotalCount;
                    this.testReqDetailsToday.NegativeCount = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Negative'))[0].TotalCount;
                    this.testReqDetailsToday.PendingCount = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'All') && (x.Result == 'Pending'))[0].TotalCount;
                    this.testReqDetailsToday.TotalCountForNewPatient = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Total'))[0].TotalCount;
                    this.testReqDetailsToday.PendingCountForNewPatient = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Pending'))[0].TotalCount;
                    this.testReqDetailsToday.CompleteCountForNewPatient = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Complete'))[0].TotalCount;
                    this.testReqDetailsToday.CancelledCountForNewPatient = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Cancelled'))[0].TotalCount;
                    this.testReqDetailsToday.ReturnCountForNewPatient = testReqSummaryDetailsToday.filter(x => (x.PatientVisitType == 'New') && (x.Result == 'Returned'))[0].TotalCount;

                }
            }, err => {
                alert(err.ErrorMessage);
            });
    }
    LoadTestNormalAbnormal() {
        this.labBlService.GetTestNormalAbnormalDetails(this.testId)
            .subscribe((res: any) => {
                if (res.Status == "OK") {
                    var result = JSON.parse(res.Results.JsonData);
                    let normalLabDetail = result.NoramlTestResultCount;
                    let abnormalLabDetail = result.AbnoramlTestResultCount;
                    let noOfVisitsDetail = result.NoOfVisitsThatUsesLabService;
                    this.normalLabDetails.JanCount = normalLabDetail.filter(x => x.Months == 'Jan')[0].TotalCount;
                    this.normalLabDetails.FebCount = normalLabDetail.filter(x => x.Months == 'Feb')[0].TotalCount;
                    this.normalLabDetails.MarCount = normalLabDetail.filter(x => x.Months == 'Mar')[0].TotalCount;
                    this.normalLabDetails.AprCount = normalLabDetail.filter(x => x.Months == 'Apr')[0].TotalCount;
                    this.normalLabDetails.MarCount = normalLabDetail.filter(x => x.Months == 'May')[0].TotalCount;
                    this.normalLabDetails.JunCount = normalLabDetail.filter(x => x.Months == 'Jun')[0].TotalCount;
                    this.normalLabDetails.JulCount = normalLabDetail.filter(x => x.Months == 'Jul')[0].TotalCount;
                    this.normalLabDetails.AugCount = normalLabDetail.filter(x => x.Months == 'Aug')[0].TotalCount;
                    this.normalLabDetails.SepCount = normalLabDetail.filter(x => x.Months == 'Sep')[0].TotalCount;
                    this.normalLabDetails.OctCount = normalLabDetail.filter(x => x.Months == 'Oct')[0].TotalCount;
                    this.normalLabDetails.NovCount = normalLabDetail.filter(x => x.Months == 'Nov')[0].TotalCount;
                    this.normalLabDetails.DecCount = normalLabDetail.filter(x => x.Months == 'Dec')[0].TotalCount;

                    this.abnormalLabDetails.JanCount = abnormalLabDetail.filter(x => x.Months == 'Jan')[0].TotalCount;
                    this.abnormalLabDetails.FebCount = abnormalLabDetail.filter(x => x.Months == 'Feb')[0].TotalCount;
                    this.abnormalLabDetails.MarCount = abnormalLabDetail.filter(x => x.Months == 'Mar')[0].TotalCount;
                    this.abnormalLabDetails.AprCount = abnormalLabDetail.filter(x => x.Months == 'Apr')[0].TotalCount;
                    this.abnormalLabDetails.MarCount = abnormalLabDetail.filter(x => x.Months == 'May')[0].TotalCount;
                    this.abnormalLabDetails.JunCount = abnormalLabDetail.filter(x => x.Months == 'Jun')[0].TotalCount;
                    this.abnormalLabDetails.JulCount = abnormalLabDetail.filter(x => x.Months == 'Jul')[0].TotalCount;
                    this.abnormalLabDetails.AugCount = abnormalLabDetail.filter(x => x.Months == 'Aug')[0].TotalCount;
                    this.abnormalLabDetails.SepCount = abnormalLabDetail.filter(x => x.Months == 'Sep')[0].TotalCount;
                    this.abnormalLabDetails.OctCount = abnormalLabDetail.filter(x => x.Months == 'Oct')[0].TotalCount;
                    this.abnormalLabDetails.NovCount = abnormalLabDetail.filter(x => x.Months == 'Nov')[0].TotalCount;
                    this.abnormalLabDetails.DecCount = abnormalLabDetail.filter(x => x.Months == 'Dec')[0].TotalCount;

                    this.noOfVisitsDetails.JanCount = noOfVisitsDetail.filter(x => x.Months == 'Jan')[0].TotalCount;
                    this.noOfVisitsDetails.FebCount = noOfVisitsDetail.filter(x => x.Months == 'Feb')[0].TotalCount;
                    this.noOfVisitsDetails.MarCount = noOfVisitsDetail.filter(x => x.Months == 'Mar')[0].TotalCount;
                    this.noOfVisitsDetails.AprCount = noOfVisitsDetail.filter(x => x.Months == 'Apr')[0].TotalCount;
                    this.noOfVisitsDetails.MarCount = noOfVisitsDetail.filter(x => x.Months == 'May')[0].TotalCount;
                    this.noOfVisitsDetails.JunCount = noOfVisitsDetail.filter(x => x.Months == 'Jun')[0].TotalCount;
                    this.noOfVisitsDetails.JulCount = noOfVisitsDetail.filter(x => x.Months == 'Jul')[0].TotalCount;
                    this.noOfVisitsDetails.AugCount = noOfVisitsDetail.filter(x => x.Months == 'Aug')[0].TotalCount;
                    this.noOfVisitsDetails.SepCount = noOfVisitsDetail.filter(x => x.Months == 'Sep')[0].TotalCount;
                    this.noOfVisitsDetails.OctCount = noOfVisitsDetail.filter(x => x.Months == 'Oct')[0].TotalCount;
                    this.noOfVisitsDetails.NovCount = noOfVisitsDetail.filter(x => x.Months == 'Nov')[0].TotalCount;
                    this.noOfVisitsDetails.DecCount = noOfVisitsDetail.filter(x => x.Months == 'Dec')[0].TotalCount;
                }
                this.createChart();
            });
    }
    GenerateRandomColorsForMembershipPieChart(membershipWiseTestCountDetails): void {
        for (let i = 0; i < membershipWiseTestCountDetails.length; i++) {
            this.colorsForMembershipCharts.push('#' + Math.floor(Math.random() * 16777215).toString(16));
        }
    }
    GenerateRandomColorsForRankPieChart(rankWiseCountDetails
    ): void {
        for (let i = 0; i < rankWiseCountDetails
            .length; i++) {
            this.colorsForRankWiseCharts.push('#' + Math.floor(Math.random() * 16777215).toString(16));
        }
    }
    AssignSelectedTest() {
        this.testId = this.selectedTest.LabTestId;
        if (this.testId > 0) {
            this.LoadTestNormalAbnormal();
        }
        this.selectedTest = undefined;
    }
    LabTestNameListFormatter(data: any): string {
        let html = "";
        if (data["LabTestId"]) {
            html = `<font color='blue'; size=03 >${data["LabTestName"]}</font>`;
        }
        return html;
    }
}