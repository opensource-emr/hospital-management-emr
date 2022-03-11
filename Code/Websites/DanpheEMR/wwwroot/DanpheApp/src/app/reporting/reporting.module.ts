import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DLService } from "../shared/dl.service";
import { ReportingRoutingModule } from "./reporting-routing.module";
import { AgGridModule } from "ag-grid-angular/main";
import { SharedModule } from "../shared/shared.module";
import { ReportingService } from "./shared/reporting-service";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete/danphe-auto-complete.module";

import { VisitDLService } from "../appointments/shared/visit.dl.service";
import { BillingBLService } from "../billing/shared/billing.bl.service";
import { AppointmentDLService } from "../appointments/shared/appointment.dl.service";
import { ADT_DLService } from "../adt/shared/adt.dl.service";

import { RPT_ReportingMainComponent } from "./reporting-main.component";

import { RPT_BIL_DepositBalanceComponent } from "./billing/deposits/deposit-balance.component";
import { RPT_BIL_DoctorRevenueComponent } from "./billing/doctor-revenue/doctor-revenue.component";
import { RPT_BIL_DoctorReportComponent } from "./billing/doc-report/doctor-report.component";
import { RPT_BIL_UserCollectionReportComponent } from "./billing/user-collection/user-collection-report.component";
import { RPT_BIL_SalesDaybookComponent } from "./billing/sales-daybook/sales-daybook.component";
import { RPT_BIL_DepartmentSalesDaybookComponent } from "./billing/sales-daybook/dept-sales-daybook.component";
import { RPT_BIL_PatientBillHistoryComponent } from "./billing/pat-bill-history/patient-bill-history.component";
import { RPT_BIL_TotalItemsBillComponent } from "./billing/total-items-bill/total-items-bill-report.component";
import { RPT_BIL_DiscountReportComponent } from "./billing/discounts/discount-report.component";

import { RPT_APPT_DailyAppointmentReportComponent } from "./appointment/daily-appointments/daily-appointment-report.component";
import { RPT_APPT_DistrictWiseAppointmentReportComponent } from "./appointment/district-wise/districtwise-appointment-report.component";
import { RPT_ADT_TotalAdmittedPatientComponent } from "./adt/admission/total-admitted-patient.component";
import { RPT_ADT_DischargedPatientComponent } from "./adt/discharge/discharged-patient.component";
import { RPT_ADT_TransferredPatientsComponent } from "./adt/transfer/transferred-patient.component";
import { RPT_RAD_TotalRevenueFromRadiologyComponent } from "./radiology/revenue/total-revenue-from-radiology.component";
import { RPT_DOC_DoctorWiseEncounterPatientReportComponent } from "./doctors/doctorwise-encounter-patient-report.component";
import { RPT_RAD_CategoryWiseImagingReportComponent } from "./radiology/category-wise/category-wise-imaging-report.component";
import { RPT_APPT_DeptWiseAppointmentReportComponent } from "./appointment/dept-wise/deptwise-appointment-report.component";
import { RPT_LAB_CategoryWiseLabReportComponent } from "./lab/category-wise/category-wise-lab-report.component";
import { RPT_LAB_TotalRevenueFromLabComponent } from "./lab/revenue/total-revenue-from-lab.component";
import { RPT_ADT_ADTReportsMainComponent } from "./adt/adt-reports-main.component";
import { RPT_BIL_BillingReportsMainComponent } from "./billing/billing-reports-main.component";
import { RPT_APPT_AppointmentReportsMainComponent } from "./appointment/appointment-reports-main.component";
import { RPT_RAD_RadiologyReportsMainComponent } from "./radiology/radiology-reports-main.component";
import { RPT_LAB_LabReportsMainComponent } from "./lab/laboratory-reports-main.component";
import { RPT_DOC_DoctorsReportMainComponent } from "./doctors/doctors-report-main.component";
import { RPT_BIL_PatientCreditSummaryComponent } from "./billing/pat-credits/patient-credit-summary.component";
import { RPT_BIL_ReturnBillReportComponent } from "./billing/return-bills/return-bill.component";
import { RPT_BIL_BillCancelSummaryComponent } from "./billing/cancel-summary/bill-cancel-summary.component";
import { RPT_BIL_IncomeSegregationComponent } from "./billing/income-segregation/income-segregation.component";
import { RPT_BIL_DoctorReferralComponent } from "./billing/doctor-referral/doctor-referral.component";
import { RPT_ADT_DischargeBillBreakupComponent } from "./adt/discharge/discharge-bill-breakup.component";
import { RPT_BIL_PatientCensusReportComponent } from "./billing/pat-census/patient-census-report.component";
import { RPT_APPT_DoctorwiseOutPatientReportComponent } from "./appointment/doctor-wise/doctorwise-outpatient-report.component";
import { RPT_BIL_DoctorwiseIncomeSummaryComponent } from "./billing/doc-income-summary/doctorwise-income-summary.component";
import { RPT_BIL_CustomReportComponent } from "./billing/custom-reports/custom-report.component";
import { RPT_BIL_DailyMISReportComponent } from "./billing/mis-reports/daily-mis-report.component";
import { RPT_BIL_DoctorSummaryMainComponent } from "./billing/doctor-summary/bill-doc-summary-main.component";
import { RPT_BIL_DocDeptSummaryComponent } from "./billing/doctor-summary/bill-doc-dept-summary.component";
import { RPT_BIL_DocDeptItemComponent } from "./billing/doctor-summary/bill-doc-dept-item-summary.component";
import { RPT_BIL_DepartmentSummaryComponent } from "./billing/dept-summary/dept-summary-report.component";
import { RPT_BIL_BillDeptItemSummaryComponent } from "./billing/dept-summary/dept-item-summary-report.component";
import { RPT_BIL_DepartmentRevenueReportComponent } from "./billing/dept-revenue/department-revenue-report.component";
import { RPT_BIL_BilDenominationReportComponent } from "./billing/denominations/bil-denomination-report.component";
import { RPT_BIL_PatNeighbourCardReportComponent } from "./billing/pat-neighbourhood/neighbour-card-details.component";
import { RPT_BIL_DialysisPatientDetailsComponent } from "./billing/dialysis-patients/dialysis-patient-details.component";
import { RPT_BIL_DocSummaryComponent } from "./billing/doctor-summary/bill-doc-summary.component";
import { RPT_LAB_ItemWiseLabReportComponent } from "./lab/item-wise/item-wise-lab-report.component";
import { RPT_ADT_DiagnosisWisePatientReportComponent } from "./adt/diagnosis/diagnosis-wise-patient-report.component";
import { RPT_BIL_ReferralSummaryMainComponent } from "./billing/referral-reports/bill-referral-report-main.component";
import { RPT_BIL_ReferralItemComponent } from "./billing/referral-reports/bill-referral-item-summary.component";
import { RPT_BIL_ReferralSummaryComponent } from "./billing/referral-reports/bill-referral-summary.component";
import { RPT_APPT_PhoneBookAppointmentReportComponent } from "./appointment/phonebook-appointment/phonebook-appointment-report.component";
import { RPT_BIL_PackageSalesReportComponent } from "./billing/package-sales/package-sales-report-component";
import { RPT_LAB_DoctorWisePatientCountLabReportComponent } from "./lab/doctor-wise/doctor-wise-patient-count-lab-report.component";
import { RPT_PAT_PATReportsMainComponent } from "./patient/patient-report-main.component";
import { RPT_PAT_PatientRegistrationReportComponent } from "./patient/patient-registration/patient-registration-report.component";
import { RPT_BIL_ItemSummaryReportComponent } from "./billing/item-summary/bill-item-summary-report.component";
import { RPT_LAB_TotalCategogyAndItemCountComponent } from "./lab/total-count-report/lab-total-count-report.component";
import { RPT_LAB_CategoryWiseItemCountComponent } from "./lab/total-count-report/categorywise-item-count-report.component";
import { RPT_LAB_ItemCountComponent } from "./lab/total-count-report/itemwise-count-report.component";
import { RPT_ADT_InpatientCensusComponent } from "./adt/inpatient-census/inpatient-census.component";
import { RPT_LAB_StatusWiseItemCountComponent } from "./lab/status-wise-count-report/status-wise-item-count-report.component";
import { RPT_PoliceCaseReportComponent } from "./police-case/police-case-report.component";
import { RPT_TotalDailyCovidCasesReport } from "./lab/covid-summary-report/total-daily-cases.component";
import { RPT_CovidTestsSummaryReport } from "./lab/covid-summary-report/covid-tests-summary.component";
import { RPT_HIVTestDetailReport } from "./lab/hiv-test-report/hiv-test-detail-report.component";
import { RPT_LabCultureReport } from "./lab/culture-report/culture-report.component";
import { RPT_LabTypeWiseTestCountReport } from "./lab/labtype-wise-test-count/labtype-wise-test-count.component";
import { RPT_BIL_DepositTransactionComponent } from "./billing/deposit-transactions/deposit-transactions.component";
import { LabStatusFilterComponent } from './lab/shared/lab-status-filter/lab-status-filter.component';
import { RPTADTAdmissionAndDischargeListComponent } from './adt/admission-and-discharge-report/rpt-adt-admission-and-discharge-list/rpt-adt-admission-and-discharge-list.component';
import { RPT_BIL_DiscountSchemeReportComponent } from "./billing/discount-scheme-report/discount-scheme-report.component";
import { RPT_BIL_DepartmentWiseDiscountSchemeReportComponent } from "./billing/department-wise-discount-scheme-report/department-wise-discount-scheme-report.component";
import { RPT_BIL_UserWiseCashCollectionComponent } from "./billing/user-wise-cash-collection-report/user-wise-cash-collection.component";
import { RPT_BIL_CreditSettlementReport } from "./billing/credit-settlement-report/credit-settlement-report.component";
import { CreditSettlementReportViewDetails } from "./billing/credit-settlement-report/credit-settlement-rpt-view-details.component";
import { RPT_BIL_EHSBillReportComponent } from "./billing/EHS-billing-report/ehs-bill-report.component";
import { EditedPatientDetailReport } from "./patient/edited-patient-detail/edited-patient-detail-report.component";

@NgModule({
  providers: [
    DLService,
    ReportingService,
    VisitDLService,
    BillingBLService,
    AppointmentDLService,
    ADT_DLService,
  ],
  imports: [
    ReportingRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents(RPT_ReportingMainComponent),
    SharedModule,
    DanpheAutoCompleteModule,
  ],
  declarations: [
    RPT_BIL_DepositBalanceComponent,
    RPT_BIL_DepositTransactionComponent,
    RPT_BIL_DoctorRevenueComponent,
    RPT_BIL_DoctorReportComponent,
    RPT_BIL_UserCollectionReportComponent,
    RPT_BIL_DiscountReportComponent,
    RPT_BIL_DiscountSchemeReportComponent,
    RPT_BIL_DepartmentWiseDiscountSchemeReportComponent,
    RPT_BIL_TotalItemsBillComponent,
    RPT_BIL_SalesDaybookComponent,
    RPT_BIL_DepartmentSalesDaybookComponent,
    RPT_BIL_PatientBillHistoryComponent,
    RPT_ReportingMainComponent,
    RPT_APPT_DailyAppointmentReportComponent,
    RPT_APPT_DistrictWiseAppointmentReportComponent,
    RPT_ADT_TotalAdmittedPatientComponent,
    RPT_ADT_DischargedPatientComponent,
    RPT_ADT_TransferredPatientsComponent,
    RPT_RAD_TotalRevenueFromRadiologyComponent,
    RPT_DOC_DoctorWiseEncounterPatientReportComponent,
    RPT_RAD_CategoryWiseImagingReportComponent,
    RPT_APPT_DeptWiseAppointmentReportComponent,
    RPT_LAB_CategoryWiseLabReportComponent,
    RPT_LAB_TotalRevenueFromLabComponent,
    RPT_ADT_ADTReportsMainComponent,
    RPT_BIL_BillingReportsMainComponent,
    RPT_APPT_AppointmentReportsMainComponent,
    RPT_RAD_RadiologyReportsMainComponent,
    RPT_LAB_LabReportsMainComponent,
    RPT_DOC_DoctorsReportMainComponent,
    RPT_BIL_PatientCreditSummaryComponent,
    RPT_BIL_ReturnBillReportComponent,
    RPT_BIL_BillCancelSummaryComponent,
    RPT_BIL_IncomeSegregationComponent,
    RPT_BIL_DoctorReferralComponent,
    RPT_ADT_DischargeBillBreakupComponent,
    RPT_BIL_PatientCensusReportComponent,
    RPT_APPT_DoctorwiseOutPatientReportComponent,
    RPT_BIL_DoctorwiseIncomeSummaryComponent,
    RPT_BIL_CustomReportComponent,
    RPT_BIL_DailyMISReportComponent,
    RPT_BIL_DoctorSummaryMainComponent,
    RPT_BIL_DoctorSummaryMainComponent,
    RPT_BIL_DocDeptSummaryComponent,
    RPT_BIL_DocDeptItemComponent,
    RPT_BIL_DepartmentSummaryComponent,
    RPT_BIL_BillDeptItemSummaryComponent,
    RPT_BIL_DepartmentRevenueReportComponent,
    RPT_BIL_BilDenominationReportComponent,
    RPT_BIL_PatNeighbourCardReportComponent,
    RPT_BIL_DialysisPatientDetailsComponent,
    RPT_BIL_DocSummaryComponent,
    RPT_LAB_ItemWiseLabReportComponent,
    RPT_ADT_DiagnosisWisePatientReportComponent,
    RPT_BIL_ReferralSummaryMainComponent,
    RPT_BIL_ReferralSummaryComponent,
    RPT_BIL_ReferralItemComponent,
    RPT_APPT_PhoneBookAppointmentReportComponent,
    RPT_BIL_PackageSalesReportComponent,
    RPT_LAB_DoctorWisePatientCountLabReportComponent,
    RPT_PAT_PATReportsMainComponent,
    RPT_PAT_PatientRegistrationReportComponent,
    RPT_BIL_ItemSummaryReportComponent,
    RPT_LAB_TotalCategogyAndItemCountComponent,
    RPT_LAB_CategoryWiseItemCountComponent,
    RPT_LAB_ItemCountComponent,
    RPT_ADT_InpatientCensusComponent,
    RPT_LAB_StatusWiseItemCountComponent,
    RPT_PoliceCaseReportComponent,
    RPT_TotalDailyCovidCasesReport,
    RPT_CovidTestsSummaryReport,
    RPT_HIVTestDetailReport,
    RPT_LabCultureReport,
    RPT_LabTypeWiseTestCountReport,
    LabStatusFilterComponent,
    RPTADTAdmissionAndDischargeListComponent,
    RPT_BIL_UserWiseCashCollectionComponent,
    RPT_BIL_CreditSettlementReport,
    CreditSettlementReportViewDetails,
    RPT_BIL_EHSBillReportComponent,
    EditedPatientDetailReport
  ],
  bootstrap: [RPT_ReportingMainComponent],
})
export class ReportingModule {}
