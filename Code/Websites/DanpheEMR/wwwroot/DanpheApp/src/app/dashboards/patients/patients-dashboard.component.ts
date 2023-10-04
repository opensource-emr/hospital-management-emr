import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import { PatientsBLService } from '../../patients/shared/patients.bl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ENUM_DanpheHTTPResponseText } from '../../shared/shared-enums';


class DateRange {
    fromDate: string;
    toDate: string;
    range: string;
};
@Component({
    templateUrl: "./patients-dashboard.component.html"
})


export class PatientsDashboardComponent {
    dateRange: DateRange = new DateRange();
    dailyPatientChart: any;
    averageTreatmentCostByAgeGroup: any;
    departmentWiseAppointmentCount: any;
    rankedBasedPatientDistribution: any;
    patientData: CardCalculation[] = [];
    doctors: CardCalculation[];
    Appointments: CardCalculation[];
    ReAdmission: CardCalculation[];
    PatientCountByDay: PatientCount[];
    PatientData: PatientCount = new PatientCount();
    AverageTreatmentCostbyAgeGroup: TreatmentCostByAgeGroup[];
    DepartmentWiseAppointment: DepartmentWiseAppointmentData[];
    PatientVisitByMembership: PatientVisitByMembership[];
    PatientDistributionBasedOnRank: PatientDistributionBasedOnRank[];
    HospitalManagement: HospitalManagement[];
    PattientDifferenceRate: number | string = 0;
    AppointmentDifferenceRate: number | string = 0;
    ReAdmissionDifferenceRate: number | string = 0;
    colors: any[] = [];
    TotalAppointments: any;
    DatasetAppointment: any;
    LabelAppointments: any;
    LabelPatient: any;
    DatasetPatient: any;
    males = [];
    females = [];
    AgeGroup = [];
    Others = [];
    DepartmentList: Array<Department> = [];
    public selectedDepartment: Department;
    FilteredPatientDistributionBasedOnRank: PatientDistributionBasedOnRank[];


    constructor(public patientBLService: PatientsBLService) { }


    ngOnInit(): void {
        this.GetDepartments();
    }

    createChartForDailyPatientCount(PatientData: PatientCount) {
        if (this.dailyPatientChart) {
            this.dailyPatientChart.destroy();
        }

        this.dailyPatientChart = new Chart('dailyPatientCount', {
            type: 'bar',
            data: {
                labels: PatientData.Label,
                datasets: [
                    {
                        label: 'In Patient',
                        barPercentage: 1,
                        barThickness: 20,
                        maxBarThickness: 25,
                        minBarLength: 5,
                        data: PatientData.InPatientCount,
                        backgroundColor: '#008FFB',
                    },
                    {
                        label: 'Out Patient',
                        barPercentage: 1,
                        barThickness: 20,
                        maxBarThickness: 25,
                        minBarLength: 5,
                        data: PatientData.OutPatientCount,
                        backgroundColor: '#00E396',
                    },
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
                    display: true,
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
                            display: true,
                            gridLines: {
                                display: false,
                            },
                            scaleLabel: {
                                fontSize: 56
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
    createChartForTreatmentCostByAgeGroup(Label, male, female, others) {
        if (this.averageTreatmentCostByAgeGroup) {
            this.averageTreatmentCostByAgeGroup.destroy();
        }
        this.averageTreatmentCostByAgeGroup = new Chart(
            'averageTreatmentCostByAgeGroup',
            {
                type: 'horizontalBar',
                data: {
                    labels: Label,
                    datasets: [
                        {
                            label: 'Male',
                            data: male,
                            barPercentage: 1,
                            barThickness: 20,
                            maxBarThickness: 25,
                            minBarLength: 5,

                            backgroundColor: '#F46A6A',
                        },
                        {
                            label: 'Female',
                            barPercentage: 1,
                            barThickness: 20,
                            maxBarThickness: 25,
                            minBarLength: 5,

                            data: female,
                            backgroundColor: '#289970',
                        },
                        {
                            label: 'Other',
                            data: others,
                            barPercentage: 1,
                            barThickness: 20,
                            maxBarThickness: 25,
                            minBarLength: 5,

                            backgroundColor: '#1D6DA4',
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: true,
                    title: {
                        text: 'Average Treatment Cost by age group',
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
                            padding: 20,
                        },
                    },
                    scales: {
                        xAxes: [
                            {
                                stacked: true,
                                gridLines: {
                                    display: false,
                                },
                                scaleLabel: {
                                    labelString: 'test',
                                },
                            },
                        ],
                        yAxes: [
                            {
                                stacked: true,
                                gridLines: {
                                    display: false,
                                },
                            },
                        ],
                    },
                },
            }
        );
    }
    createChartFordepartmentWiseAppointmentCount(Label, Dataset) {
        if (this.departmentWiseAppointmentCount) {
            this.departmentWiseAppointmentCount.destroy();
        }
        this.departmentWiseAppointmentCount = new Chart(
            'departmentWiseAppointmentCount',
            {
                type: 'doughnut',
                data: {
                    datasets: [
                        {
                            data: Dataset,
                            backgroundColor: this.colors,
                        },
                    ],
                    labels: Label,
                },
                options: {
                    maintainAspectRatio: true,
                    cutoutPercentage: 70,
                    title: {
                        text: 'Department wise appointment count',
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
                    }
                }
            }
        );
    }
    createChartForrankedBasedPatientDistribution(Label, Dataset) {
        if (this.rankedBasedPatientDistribution) {
            this.rankedBasedPatientDistribution.destroy();
        }
        this.rankedBasedPatientDistribution = new Chart(
            'rankedBasedPatientDistribution',
            {
                type: 'pie',
                data: {
                    datasets: [
                        {
                            data: Dataset,
                            backgroundColor: this.colors
                            ,
                        },
                    ],
                    labels: Label,
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



    OnFromToDateChange(event) {
        let dateRange = this.updateDateRange(this.dateRange, event);
        this.dateRange = dateRange;
        this.GetPatientDashboardCardSummaryCalculation(dateRange.fromDate, dateRange.toDate);
        this.GetPatientCountByDay(dateRange.fromDate, dateRange.toDate);
        this.GetAverageTreatmentCostbyAgeGroup(dateRange.fromDate, dateRange.toDate);
        this.GetDepartmentWiseAppointment(dateRange.fromDate, dateRange.toDate);
        this.GetPAtVisitByMembership(dateRange.fromDate, dateRange.toDate);
        this.GetPatientDistributionBasedOnRank(dateRange.fromDate, dateRange.toDate, null);
        this.GetHospitalManagement(dateRange.fromDate, dateRange.toDate);
    }
    updateDateRange(dateRange: DateRange, $event: DateRange): DateRange {
        dateRange.fromDate = $event ? $event.fromDate : dateRange.fromDate;
        dateRange.toDate = $event ? $event.toDate : dateRange.toDate;
        dateRange.range = "<b>Date:</b>&nbsp;" + dateRange.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.dateRange.toDate;
        return dateRange;
    }
    GetPatientDashboardCardSummaryCalculation(FromDate: string, ToDate: string) {
        this.patientBLService.GetPatientDashboardCardSummaryCalculation(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.patientData = res.Results.Patients;
                this.doctors = res.Results.Doctors;
                this.Appointments = res.Results.Appointments;
                this.ReAdmission = res.Results.ReAdmission;
                this.PattientDifferenceRate = ((this.patientData[3].Total - this.ReAdmission[2].Total) / this.ReAdmission[2].Total) * 100;
                if (Math.abs(this.PattientDifferenceRate) === Infinity) {
                    this.PattientDifferenceRate = '-';
                }
                this.AppointmentDifferenceRate = ((this.Appointments[3].Total - this.Appointments[2].Total) / this.Appointments[2].Total) * 100;
                if (Math.abs(this.AppointmentDifferenceRate) === Infinity) {
                    this.AppointmentDifferenceRate = '-';
                }
                this.ReAdmissionDifferenceRate = ((this.ReAdmission[2].Total - this.ReAdmission[1].Total) / this.ReAdmission[1].Total) * 100;
                if (Math.abs(this.ReAdmissionDifferenceRate) === Infinity) {
                    this.ReAdmissionDifferenceRate = '-';
                }

            }
        })
    }
    GetPatientCountByDay(FromDate: string, ToDate: string) {
        this.patientBLService.GetPatientCountByDay(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.PatientCountByDay = res.Results;
                let Label = res.Results.map(a => a.Label)
                this.PatientData.Label = this.removeDuplicates(Label);
                this.PatientData.InPatientCount = res.Results.filter(a => a.VisitType === 'inpatient').map(a => a.PatientCount);
                this.PatientData.OutPatientCount = res.Results.filter(a => a.VisitType === 'outpatient').map(a => a.PatientCount);
                this.createChartForDailyPatientCount(this.PatientData);

            }
        })
    }
    removeDuplicates(arr) {
        return arr.filter((item,
            index) => arr.indexOf(item) === index);
    }
    GetAverageTreatmentCostbyAgeGroup(FromDate: string, ToDate: string) {
        this.patientBLService.GetAverageTreatmentCostbyAgeGroup(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.AverageTreatmentCostbyAgeGroup = res.Results;
                this.males = this.AverageTreatmentCostbyAgeGroup.filter(x => x.Gender === 'Male').map(a => a.Total)
                this.females = this.AverageTreatmentCostbyAgeGroup.filter(x => x.Gender === 'Female').map(a => a.Total)
                this.AgeGroup = this.AverageTreatmentCostbyAgeGroup.filter(x => x.Gender === 'Male').map(a => a.AgeRange)
                this.Others = this.AverageTreatmentCostbyAgeGroup.filter(x => x.Gender === 'Others').map(a => a.Total)
                this.createChartForTreatmentCostByAgeGroup(this.AgeGroup, this.males, this.females, this.Others);
            }
        })
    }
    GetDepartmentWiseAppointment(FromDate: string, ToDate: string) {
        this.patientBLService.GetDepartmentWiseAppointment(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.DepartmentWiseAppointment = res.Results;
                this.DatasetAppointment = this.DepartmentWiseAppointment.map(row => row.AppointmentCount);
                this.LabelAppointments = this.DepartmentWiseAppointment.map(row => row.DepartmentName)
                this.TotalAppointments = this.DepartmentWiseAppointment.reduce((a, b) => a + b.AppointmentCount, 0);
                this.generateRandomColors(this.DepartmentWiseAppointment);
                this.createChartFordepartmentWiseAppointmentCount(this.LabelAppointments, this.DatasetAppointment);
            }
        })
    }
    GetPAtVisitByMembership(FromDate: string, ToDate: string) {
        this.patientBLService.GetPAtVisitByMembership(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.PatientVisitByMembership = res.Results;
                const maximum = Math.max(...this.PatientVisitByMembership.map(o => o.Count), 0);
                for (let i = 0; i < this.PatientVisitByMembership.length; i++) {
                    let x = this.PatientVisitByMembership[i].Count / maximum * 100;
                    this.PatientVisitByMembership[i].Percent = isNaN(x) ? 0 : x;
                }

            }
        })
    }
    GetPatientDistributionBasedOnRank(FromDate: string, ToDate: string, DepartmentId: number) {
        this.patientBLService.GetPatientDistributionBasedOnRank(FromDate, ToDate, DepartmentId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.PatientDistributionBasedOnRank = res.Results;
                this.FilteredPatientDistributionBasedOnRank = res.Results;
                this.LabelPatient = res.Results.map(a => a.Rank);
                this.DatasetPatient = res.Results.map(a => a.Count);
                // this.LabelPatient = PatientLabel.filter((item, i, ar) => ar.indexOf(item) === i);
                // this.DatasetPatient = DatasetLabel.filter((item, i, ar) => ar.indexOf(item) === i);
                this.generateRandomColors(this.PatientDistributionBasedOnRank);
                this.createChartForrankedBasedPatientDistribution(this.LabelPatient, this.DatasetPatient);

            }
        })
    }
    GetHospitalManagement(FromDate: string, ToDate: string) {
        this.patientBLService.GetHospitalManagement(FromDate, ToDate).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.HospitalManagement = [];
                this.HospitalManagement = res.Results;
                const max = Math.max(...this.HospitalManagement.map(o => o.Count), 0);
                for (let i = 0; i < this.HospitalManagement.length; i++) {
                    let x = this.HospitalManagement[i].Count / max * 100;
                    this.HospitalManagement[i].Percentage = isNaN(x) ? 0 : x;
                }
            }
        });

    }
    generateRandomColors(data: any[]): void {
        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                this.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
            }
        }
    }

    DepartmentListFormatter(data: Department): string {
        let html = data['DepartmentName'];
        return html;
    }

    GetDepartments() {
        this.patientBLService.GetDepartment()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
                    this.DepartmentList = res.Results;
                    this.DepartmentList.unshift({ DepartmentId: null, DepartmentName: 'All' })
                }
            });
    }

    public onDepartmentChange() {
        if (this.selectedDepartment !== null) {
            this.GetPatientDistributionBasedOnRank(this.dateRange.fromDate, this.dateRange.toDate, this.selectedDepartment.DepartmentId);
        }
    }
}
export class CardCalculation {
    Label: string;
    Total: number;

}
export class PatientCount {
    Label: string;
    PatientCount: number;
    InPatientCount: number;
    OutPatientCount: number;
    VisitType: string = '';
}
export class TreatmentCostByAgeGroup {
    Gender: string;
    AgeRange: string;
    Total: number;
}
export class DepartmentWiseAppointmentData {
    DepartmentName: string;
    AppointmentCount: number;
}
export class PatientVisitByMembership {
    MembershipTypeName: string;
    Count: number;
    Percent: number;
}
export class PatientDistributionBasedOnRank {
    Rank: string;
    Count: number;
    DepartmentName: string;
    DepartmentId: number;
}
export class HospitalManagement {
    Label: string;
    Count: number;
    Percentage: number;
}

class Department {
    DepartmentId: number = 0;
    DepartmentName: string = '';
}



