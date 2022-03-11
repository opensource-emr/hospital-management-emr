import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthGuardService } from "../security/shared/auth-guard.service";
import { RPT_ReportingMainComponent } from "./reporting-main.component";
import { RPT_ADT_ADTReportsMainComponent } from "./adt/adt-reports-main.component";
import { RPT_ADT_TotalAdmittedPatientComponent } from "./adt/admission/total-admitted-patient.component";
import { RPT_ADT_DischargedPatientComponent } from "./adt/discharge/discharged-patient.component";
import { RPT_ADT_TransferredPatientsComponent } from "./adt/transfer/transferred-patient.component";
import { RPT_BIL_BillingReportsMainComponent } from "./billing/billing-reports-main.component";
import { RPT_BIL_DoctorRevenueComponent } from "./billing/doctor-revenue/doctor-revenue.component";
import { RPT_DOC_DoctorsReportMainComponent } from "./doctors/doctors-report-main.component";
import { RPT_BIL_UserCollectionReportComponent } from "./billing/user-collection/user-collection-report.component";
import { RPT_BIL_TotalItemsBillComponent } from "./billing/total-items-bill/total-items-bill-report.component";
import { RPT_BIL_SalesDaybookComponent } from "./billing/sales-daybook/sales-daybook.component";
import { RPT_BIL_DepartmentSalesDaybookComponent } from "./billing/sales-daybook/dept-sales-daybook.component";
import { RPT_BIL_PatientBillHistoryComponent } from "./billing/pat-bill-history/patient-bill-history.component";
import { RPT_APPT_DailyAppointmentReportComponent } from "./appointment/daily-appointments/daily-appointment-report.component";
import { RPT_BIL_DepositBalanceComponent } from "./billing/deposits/deposit-balance.component";
import { RPT_BIL_PatientCreditSummaryComponent } from "./billing/pat-credits/patient-credit-summary.component";
import { RPT_BIL_ReturnBillReportComponent } from "./billing/return-bills/return-bill.component";
import { RPT_BIL_BillCancelSummaryComponent } from "./billing/cancel-summary/bill-cancel-summary.component";
import { RPT_BIL_IncomeSegregationComponent } from "./billing/income-segregation/income-segregation.component";
import { RPT_BIL_DoctorReferralComponent } from "./billing/doctor-referral/doctor-referral.component";
import { RPT_BIL_DiscountReportComponent } from "./billing/discounts/discount-report.component";
import { RPT_BIL_PatientCensusReportComponent } from "./billing/pat-census/patient-census-report.component";
import { RPT_BIL_DoctorwiseIncomeSummaryComponent } from "./billing/doc-income-summary/doctorwise-income-summary.component";
import { RPT_BIL_CustomReportComponent } from "./billing/custom-reports/custom-report.component";
import { RPT_BIL_DailyMISReportComponent } from "./billing/mis-reports/daily-mis-report.component";
import { RPT_BIL_DoctorSummaryMainComponent } from "./billing/doctor-summary/bill-doc-summary-main.component";
import { RPT_BIL_DoctorReportComponent } from "./billing/doc-report/doctor-report.component";
import { RPT_BIL_DepartmentSummaryComponent } from "./billing/dept-summary/dept-summary-report.component";
import { RPT_BIL_DepartmentRevenueReportComponent } from "./billing/dept-revenue/department-revenue-report.component";
import { RPT_BIL_BilDenominationReportComponent } from "./billing/denominations/bil-denomination-report.component";
import { RPT_BIL_PatNeighbourCardReportComponent } from "./billing/pat-neighbourhood/neighbour-card-details.component";
import { RPT_BIL_DialysisPatientDetailsComponent } from "./billing/dialysis-patients/dialysis-patient-details.component";
import { RPT_APPT_AppointmentReportsMainComponent } from "./appointment/appointment-reports-main.component";
import { RPT_APPT_DistrictWiseAppointmentReportComponent } from "./appointment/district-wise/districtwise-appointment-report.component";
import { RPT_APPT_DeptWiseAppointmentReportComponent } from "./appointment/dept-wise/deptwise-appointment-report.component";
import { RPT_APPT_DoctorwiseOutPatientReportComponent } from "./appointment/doctor-wise/doctorwise-outpatient-report.component";
import { RPT_RAD_RadiologyReportsMainComponent } from "./radiology/radiology-reports-main.component";
import { RPT_RAD_TotalRevenueFromRadiologyComponent } from "./radiology/revenue/total-revenue-from-radiology.component";
import { RPT_RAD_CategoryWiseImagingReportComponent } from "./radiology/category-wise/category-wise-imaging-report.component";
import { RPT_LAB_LabReportsMainComponent } from "./lab/laboratory-reports-main.component";
import { RPT_LAB_CategoryWiseLabReportComponent } from "./lab/category-wise/category-wise-lab-report.component";
import { RPT_LAB_TotalRevenueFromLabComponent } from "./lab/revenue/total-revenue-from-lab.component";
import { RPT_DOC_DoctorWiseEncounterPatientReportComponent } from "./doctors/doctorwise-encounter-patient-report.component";
import { RPT_LAB_ItemWiseLabReportComponent } from "./lab/item-wise/item-wise-lab-report.component";
import { RPT_ADT_DiagnosisWisePatientReportComponent } from "./adt/diagnosis/diagnosis-wise-patient-report.component";
import { RPT_BIL_ReferralSummaryMainComponent } from "./billing/referral-reports/bill-referral-report-main.component";
import { RPT_APPT_PhoneBookAppointmentReportComponent } from "./appointment/phonebook-appointment/phonebook-appointment-report.component";
import { RPT_BIL_PackageSalesReportComponent } from "./billing/package-sales/package-sales-report-component";
import { RPT_LAB_DoctorWisePatientCountLabReportComponent } from "./lab/doctor-wise/doctor-wise-patient-count-lab-report.component";
import { RPT_PAT_PATReportsMainComponent } from "./patient/patient-report-main.component";
import { RPT_PAT_PatientRegistrationReportComponent } from "./patient/patient-registration/patient-registration-report.component";
import { RPT_BIL_ItemSummaryReportComponent } from "./billing/item-summary/bill-item-summary-report.component";
import { RPT_LAB_TotalCategogyAndItemCountComponent } from "./lab/total-count-report/lab-total-count-report.component";
import { RPT_ADT_InpatientCensusComponent } from "./adt/inpatient-census/inpatient-census.component";
import { PageNotFound } from "../404-error/404-not-found.component";
import { RPT_LAB_StatusWiseItemCountComponent } from "./lab/status-wise-count-report/status-wise-item-count-report.component";
import { RPT_PoliceCaseReportComponent } from "./police-case/police-case-report.component";
import { RPT_TotalDailyCovidCasesReport } from "./lab/covid-summary-report/total-daily-cases.component";
import { RPT_CovidTestsSummaryReport } from "./lab/covid-summary-report/covid-tests-summary.component";
import { RPT_HIVTestDetailReport } from "./lab/hiv-test-report/hiv-test-detail-report.component";
import { RPT_LabCultureReport } from "./lab/culture-report/culture-report.component";
import { RPT_LabTypeWiseTestCountReport } from "./lab/labtype-wise-test-count/labtype-wise-test-count.component";
import { RPT_BIL_DepositTransactionComponent } from "./billing/deposit-transactions/deposit-transactions.component";
import { RPTADTAdmissionAndDischargeListComponent } from "./adt/admission-and-discharge-report/rpt-adt-admission-and-discharge-list/rpt-adt-admission-and-discharge-list.component";
import { RPT_BIL_DiscountSchemeReportComponent } from "./billing/discount-scheme-report/discount-scheme-report.component";
import { RPT_BIL_DepartmentWiseDiscountSchemeReportComponent } from "./billing/department-wise-discount-scheme-report/department-wise-discount-scheme-report.component";
import { RPT_BIL_UserWiseCashCollectionComponent } from "./billing/user-wise-cash-collection-report/user-wise-cash-collection.component";
import { RPT_BIL_CreditSettlementReport } from "./billing/credit-settlement-report/credit-settlement-report.component";
import { RPT_BIL_EHSBillReportComponent } from "./billing/EHS-billing-report/ehs-bill-report.component";
import { EditedPatientDetailReport } from "./patient/edited-patient-detail/edited-patient-detail-report.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "",
        component: RPT_ReportingMainComponent,
        canActivate: [AuthGuardService],
        children: [
          {
            path: "AdmissionMain",
            component: RPT_ADT_ADTReportsMainComponent,
            children: [
              {
                path: "",
                redirectTo: "InpatientCensusReport",
                pathMatch: "full",
              },
              {
                path: "TotalAdmittedPatient",
                component: RPT_ADT_TotalAdmittedPatientComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DischargedPatient",
                component: RPT_ADT_DischargedPatientComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "TransferredPatient",
                component: RPT_ADT_TransferredPatientsComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DiagnosisWisePatientReport",
                component: RPT_ADT_DiagnosisWisePatientReportComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "InpatientCensusReport",
                component: RPT_ADT_InpatientCensusComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "AdmissionAndDischargeList",
                component: RPTADTAdmissionAndDischargeListComponent,
                canActivate: [AuthGuardService],
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "BillingMain",
            component: RPT_BIL_BillingReportsMainComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DoctorRevenue",
            component: RPT_BIL_DoctorRevenueComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DoctorReport",
            component: RPT_BIL_DoctorReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/UserCollectionReport",
            component: RPT_BIL_UserCollectionReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/TotalItemsBill",
            component: RPT_BIL_TotalItemsBillComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/SalesDaybook",
            component: RPT_BIL_SalesDaybookComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DepartmentSalesDaybook",
            component: RPT_BIL_DepartmentSalesDaybookComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/PatientBillHistory",
            component: RPT_BIL_PatientBillHistoryComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DailyAppointmentReport",
            component: RPT_APPT_DailyAppointmentReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/TotalAdmittedPatient",
            component: RPT_ADT_TotalAdmittedPatientComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DischargedPatient",
            component: RPT_ADT_DischargedPatientComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DepositBalance",
            component: RPT_BIL_DepositBalanceComponent,
          },
          {
            path: "BillingMain/DepositTransaction",
            component: RPT_BIL_DepositTransactionComponent,
          },
          {
            path: "BillingMain/PatientCreditSummary",
            component: RPT_BIL_PatientCreditSummaryComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/ReturnBillSummary",
            component: RPT_BIL_ReturnBillReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/BillCancelSummary",
            component: RPT_BIL_BillCancelSummaryComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/IncomeSegregation",
            component: RPT_BIL_IncomeSegregationComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DoctorReferral",
            component: RPT_BIL_DoctorReferralComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DiscountReport",
            component: RPT_BIL_DiscountReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DiscountSchemeReport",
            component: RPT_BIL_DiscountSchemeReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DepartmentWiseDiscountSchemeReport",
            component: RPT_BIL_DepartmentWiseDiscountSchemeReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/PatientCensusReport",
            component: RPT_BIL_PatientCensusReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DoctorwiseIncomeSummary",
            component: RPT_BIL_DoctorwiseIncomeSummaryComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/CustomReport",
            component: RPT_BIL_CustomReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DailyMISReport",
            component: RPT_BIL_DailyMISReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/DoctorSummary",
            component: RPT_BIL_DoctorSummaryMainComponent,
          },
          {
            path: "BillingMain/DepartmentSummary",
            component: RPT_BIL_DepartmentSummaryComponent,
          },
          {
            path: "BillingMain/DepartmentRevenue",
            component: RPT_BIL_DepartmentRevenueReportComponent,
          },
          {
            path: "BillingMain/Denomination",
            component: RPT_BIL_BilDenominationReportComponent,
          },
          {
            path: "BillingMain/PatientNeighbourhoodCardDetails",
            component: RPT_BIL_PatNeighbourCardReportComponent,
          },
          {
            path: "BillingMain/DialysisPatientDetails",
            component: RPT_BIL_DialysisPatientDetailsComponent,
          },
          {
            path: "BillingMain/ReferralMain",
            component: RPT_BIL_ReferralSummaryMainComponent,
          },
          {
            path: "BillingMain/PackageSales",
            component: RPT_BIL_PackageSalesReportComponent,
          },
          {
            path: "BillingMain/ItemSummaryReport",
            component: RPT_BIL_ItemSummaryReportComponent,
          },
          {
            path: "BillingMain/UserWiseCashCollection",
            component: RPT_BIL_UserWiseCashCollectionComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/CreditSettlementReport",
            component: RPT_BIL_CreditSettlementReport,
            canActivate: [AuthGuardService],
          },
          {
            path: "BillingMain/EHSBillReport",
            component: RPT_BIL_EHSBillReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "AppointmentMain",
            component: RPT_APPT_AppointmentReportsMainComponent,
            canActivate: [AuthGuardService],
            children: [
              {
                path: "",
                redirectTo: "DailyAppointmentReport",
                pathMatch: "full",
              },
              {
                path: "DailyAppointmentReport",
                component: RPT_APPT_DailyAppointmentReportComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DistrictWiseAppointmentReport",
                component: RPT_APPT_DistrictWiseAppointmentReportComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DepartmentWiseAppointmentReport",
                component: RPT_APPT_DeptWiseAppointmentReportComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "DoctorwiseOutPatient",
                component: RPT_APPT_DoctorwiseOutPatientReportComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "PhoneBookAppointmentReport",
                component: RPT_APPT_PhoneBookAppointmentReportComponent,
                canActivate: [AuthGuardService],
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "RadiologyMain",
            component: RPT_RAD_RadiologyReportsMainComponent,
            canActivate: [AuthGuardService],
            children: [
              { path: "", redirectTo: "RevenueGenerated", pathMatch: "full" },
              {
                path: "RevenueGenerated",
                component: RPT_RAD_TotalRevenueFromRadiologyComponent,
                canActivate: [AuthGuardService],
              },
              {
                path: "CategoryWiseImagingReport",
                component: RPT_RAD_CategoryWiseImagingReportComponent,
                canActivate: [AuthGuardService],
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "LabMain",
            component: RPT_LAB_LabReportsMainComponent,
            canActivate: [AuthGuardService],
          },

          {
            path: "LabMain/CategoryWiseLabReport",
            component: RPT_LAB_CategoryWiseLabReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "LabMain/DoctorWisePatientCountLabReport",
            component: RPT_LAB_DoctorWisePatientCountLabReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "LabMain/TotalRevenueFromLab",
            component: RPT_LAB_TotalRevenueFromLabComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "LabMain/ItemWiseLabReport",
            component: RPT_LAB_ItemWiseLabReportComponent,
            canActivate: [AuthGuardService],
          },
          {
            path: "LabMain/CatAndItemWiseCountLabReport",
            component: RPT_LAB_TotalCategogyAndItemCountComponent,
          },
          {
            path: "LabMain/LabTestStatusDetailReport",
            component: RPT_LAB_StatusWiseItemCountComponent,
          },
          {
            path: "LabMain/CovidCasesDetailReport",
            component: RPT_TotalDailyCovidCasesReport,
          },
          {
            path: "LabMain/CovidTestsSummaryReport",
            component: RPT_CovidTestsSummaryReport,
          },
          {
            path: "LabMain/HIVTestDetailsReport",
            component: RPT_HIVTestDetailReport,
          },
          {
            path: "LabMain/LabCultureDetailsReport",
            component: RPT_LabCultureReport,
          },
          {
            path: "LabMain/LabTypeWiseTestCountReport",
            component: RPT_LabTypeWiseTestCountReport,
          },
          {
            path: "DoctorsMain",
            component: RPT_DOC_DoctorsReportMainComponent,
            canActivate: [AuthGuardService],
            children: [
              {
                path: "",
                redirectTo: "DoctorWiseEncounterPatientReport",
                pathMatch: "full",
              },
              {
                path: "DoctorWiseEncounterPatientReport",
                component: RPT_DOC_DoctorWiseEncounterPatientReportComponent,
                canActivate: [AuthGuardService],
              },
              { path: "**", component: PageNotFound },
            ],
          },
          {
            path: "Patient",
            component: RPT_PAT_PATReportsMainComponent,
            children: [
              {
                path: "",
                redirectTo: "Patient/RegistrationReport",
                pathMatch: "full",
              },
              {
                path: "Patient/RegistrationReport",
                component: RPT_PAT_PatientRegistrationReportComponent,
              },
              {
                path: "EditedPatientDetailReport",
                component: EditedPatientDetailReport,
              },
              { path: "**", component: PageNotFound },
            ],
          },

          {
            path: "InsBillingReports",
            loadChildren:
              "../billing/ins-billing/reports/ins-billing-reports.module#InsBillingReportsModule",
          },
          {
            path: "PoliceCase",
            component: RPT_PoliceCaseReportComponent,
          },
        ],
      },
      { path: "**", component: PageNotFound },
    ]),
  ],
  exports: [RouterModule],
})
export class ReportingRoutingModule {}
