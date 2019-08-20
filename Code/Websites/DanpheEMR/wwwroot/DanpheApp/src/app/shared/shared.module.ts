import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//custom pipes
import { DanpheDateTime } from "./pipes/danphe-datetime.pipe";

import { HasValuePipe } from "./pipes/hasvalue.pipe"; //pipe to check if the field has value
import { NumberInWordsPipe } from './pipes/number-inwords.pipe';
import { ParseAmount } from './pipes/parse-amount.pipe';
import { CapitalFirstLetter } from './pipes/capital-first-letter.pipe';
import { NepaliDatePipe } from './pipes/nepali-date.pipe'
import { Currency } from './pipes/currency.pipe';
import { LoadingComponent } from "./loading.component";
//import { Ng2TabModule } from 'ng2-tab';

import { DanpheGridComponent } from "./danphe-grid/danphe-grid.component";
import { AgGridModule } from 'ag-grid-angular/main';

import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { NepaliCalendarModule } from './calendar/np/nepali-calendar.module';

import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { DanpheChartsService } from "../dashboards/shared/danphe-charts.service";

import { CustomerHeaderComponent } from "../shared/customer-header/customer-header.component"
import { PrintStickerComponent } from '../appointments/opd-sticker/opd-sticker-print.component';
import { NotificationComponent } from '../core/notifications/notification.component';
import { QRCodeModule } from 'angular2-qrcode';
//lab and imaging view report
import { LabTestsResults } from '../labs/lab-tests/lab-tests-results.component';
import { LabTestsAddResultComponent } from '../labs/lab-tests/lab-add-result/lab-tests-add-result.component';
import { LabTestsViewReportComponent } from "../labs/lab-tests/lab-final-reports/lab-tests-view-report.component";
import { ViewReportComponent } from "../radiology/shared/report/view-report.component";
import { DanpheMultiSelectComponent } from "../shared/danphe-multiselect/danphe-multiselect.component"
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";


import { LabsBLService } from "../labs/shared/labs.bl.service";
import { LabTestResultService } from "../labs/shared/lab.service";
import { ImagingBLService } from "../radiology/shared/imaging.bl.service";
import { ImagingDLService } from "../radiology/shared/imaging.dl.service";
import { BillingDLService } from "../billing/shared/billing.dl.service";
import { BillingBLService } from "../billing/shared/billing.bl.service";
import { LabsDLService } from "../labs/shared/labs.dl.service";
import { ClinicalDLService } from "../clinical/shared/clinical.dl.service";
import { CustomDateComponent } from "./custom-date/custom-date.component";
import { Routes, RouterModule } from '@angular/router';
import { PatientOverviewComponent } from "../doctors/patient/patient-overview.component";

import { CKEditorModule } from "ng2-ckeditor";
import { DanpheCkEditorComponent } from "../shared/danphe-ckeditor/danphe-ckeditor.component";

import { LightboxModule } from 'angular2-lightbox';
import { DatePickerComponent } from './danphe-datepicker/danphe-datepicker.component';
import { DoctorsBLService } from "../doctors/shared/doctors.bl.service";
import { DoctorsDLService } from "../doctors/shared/doctors.dl.service";
import { RadiologyService } from "../radiology/shared/radiology-service";

import { PatientBillHistoryComponent } from "../billing/bill-history/patient-bill-history";

import { ResetOrdersGuard } from "../orders/reset-order-guard";
import { ResetDoctorcontextGuard } from '../shared/reset-doctorcontext-guard';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { VitalsAddComponent } from '../clinical/vitals/vitals-add.component';
import { DoctorsNotesComponent } from '../doctors/notes/doctors-notes.component';
import { QrReaderComponent } from './qr-code/qr-reader.component';
import { QrService } from './qr-code/qr-service';

import { NgQrScannerModule } from 'angular2-qrscanner';
//added: sud-4july-for photo-cropping.
import { ImageCropperModule } from 'ngx-image-cropper';
import { WebcamModule } from 'ngx-webcam';
import { PhotoCropperComponent } from './photo-cropper/photo-cropper.component';
import { NotesComponent } from '../clinical/notes/notes.component';
import { ObjectiveNotesComponent } from '../clinical/notes/objective-note.component';
import { SubjectiveNoteComponent } from '../clinical/notes/subjective-note.component';
import { OPDGeneralNoteComponenet } from '../clinical/notes/opd-general-note.component';
import { AllergyListComponent } from '../clinical/others/allergy-list.component';
import { AllergyAddComponent } from '../clinical/others/allergy-add.component';
import { MedicalProblemListComponent } from '../clinical/problems/medical-problem-list.component';
import { ActiveMedicalAddComponent } from '../clinical/problems/active-medical-add.component';
import { PastMedicalAddComponent } from '../clinical/problems/past-medical-add.component';
import { SurgicalHistoryListComponent } from '../clinical/history/surgical-history-list.component';
import { SurgicalHistoryAddComponent } from '../clinical/history/surgical-history-add.component';
import { SocialHistoryListComponent } from '../clinical/history/social-history-list.component';
import { SocialHistoryAddComponent } from '../clinical/history/social-history-add.component';
import { FamilyHistoryListComponent } from '../clinical/history/family-history-list.component';
import { FamilyHistoryAddComponent } from '../clinical/history/family-history-add.component';
import { AssessmentPlanComponent } from '../clinical/notes/assessment-plan.component';
import { SelectOrderComponent } from '../clinical/notes/orderSelect.component';
import { SignatoriesComponent } from '../labs/shared/signatories/signatories.component';

import { OPDOrthoNoteComponent } from '../clinical/notes/opd-ortho/opd-ortho-note.component';
import { PatientUploadFilesComponent } from '../patients/patient-upload-files/patient-upload-files.component';
import { EmergencyStickerComponent } from './emergency-sticker/emergency-sticker.component';
import { PrintHeaderComponent } from './print-header/print-header';

//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { RbacPermissionDirective } from '../security/shared/rbac-permission.directive';

import { BillingHeaderComponent } from "../shared/billing-header/billing-header.component";
import { DepositReceiptComponent } from '../billing/bill-deposit/deposit-receipt.component';
import { DanpheBarCodeComponent } from './bar-code/danphe-bar-code.component';
//import { NgxBarcodeModule } from 'ngx-barcode';

import { VisitSticker_Generic_Single_Component } from './visit-generic-stickers/visit-gen-sticker-single.component';
import { VisitSticker_Generic_PrintComponent } from './visit-generic-stickers/visit-generic-stickers-print.component';
import { DischargeBillMainComponent } from './../billing/ip-billing/receipts/discharge-bill-main.component';
import { DischargeBillBreakupComponent } from './../billing/ip-billing/receipts/discharge-bill-breakup.component';
import { DischargeBillSummaryComponent } from './../billing/ip-billing/receipts/discharge-bill-summary.component';
import { PostReportComponent } from '../radiology/shared/report/post-report.component';
import { DanpheAutoCompleteDirective, DanpheAutoCompleteComponent } from './danphe-autocomplete';
import { WardBillItemRequestComponent } from '../billing/shared/ward-bill-item-request/ward-billitem-request.component';
import { DrugsRequestComponent } from '../nursing/drugs-request/drugs-request.component';
import { DicomService } from './danphe-dicom-viewer/shared/dicom.service';
import { DicomMainModule } from './danphe-dicom-viewer/dicom-main.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoaderComponent } from './danphe-loader-intercepter/danphe-loader';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DanpheLoadingInterceptor } from './danphe-loader-intercepter/danphe-loading.services';
import { BooleanParameterPipe } from './pipes/boolean-parameter.pipe';
import { SearchFilterPipe } from './pipes/data-filter.pipe';
import { SearchService } from './search.service';
import { PrescriptionNoteComponent } from '../clinical/notes/prescription-note/prescription-note.component';
import { LabTestsViewReportFormat2Component } from '../labs/lab-tests/lab-final-reports/lab-report-format2/lab-tests-view-report-format2.component';



@NgModule({
  providers: [ResetPatientcontextGuard,
    ResetOrdersGuard,
    ResetDoctorcontextGuard,
    DanpheChartsService,
    LabTestResultService,
    LabsBLService,
    LabsDLService,
    ImagingBLService,
    ImagingDLService,
    BillingBLService,
    BillingDLService,
    DoctorsBLService,
    DoctorsDLService,
    ClinicalDLService,
    RadiologyService,
    QrService,
    SearchService,
    DicomService, LoaderComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DanpheLoadingInterceptor,
      multi: true,
    }
  ],
  imports: [ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    AgGridModule.withComponents(DanpheGridComponent),
    NepaliCalendarModule,
    AmChartsModule,
    //  Ng2AutoCompleteModule,
    DanpheAutoCompleteModule,
    LightboxModule,
    QRCodeModule,
    AngularMultiSelectModule,
    CKEditorModule,
    NgQrScannerModule,
    ImageCropperModule,
    WebcamModule,
    DicomMainModule, MatTooltipModule
  ],
  declarations: [DanpheDateTime,
    HasValuePipe,
    LoadingComponent,
    NumberInWordsPipe,
    ParseAmount,
    Currency,
    CapitalFirstLetter,
    DanpheGridComponent,
    CustomerHeaderComponent, PrintStickerComponent, NotificationComponent,
    CustomDateComponent,
    LabTestsViewReportComponent,
    LabTestsViewReportFormat2Component,
    PostReportComponent,//sud:14Jan'19-- for Edit doctor feature, need to Revise this.. 
    ViewReportComponent,

    LabTestsAddResultComponent,
    PatientOverviewComponent,
    DanpheMultiSelectComponent,
    DatePickerComponent,
    DanpheCkEditorComponent,
    PatientBillHistoryComponent,
    VitalsAddComponent,
    DoctorsNotesComponent,
    LabTestsResults,
    QrReaderComponent,
    PhotoCropperComponent,
    NotesComponent,
    ObjectiveNotesComponent,
    SubjectiveNoteComponent,
    OPDGeneralNoteComponenet,
    NepaliDatePipe,
    AllergyListComponent,
    AllergyAddComponent,
    MedicalProblemListComponent,
    ActiveMedicalAddComponent,
    PastMedicalAddComponent,
    SurgicalHistoryListComponent,
    SurgicalHistoryAddComponent,
    SocialHistoryListComponent,
    SocialHistoryAddComponent,
    FamilyHistoryAddComponent,
    FamilyHistoryListComponent,
    SignatoriesComponent,
    AssessmentPlanComponent,
    SelectOrderComponent,
    OPDOrthoNoteComponent,
    PatientUploadFilesComponent,
    EmergencyStickerComponent,
    PrintHeaderComponent,
    BillingHeaderComponent,
    DepositReceiptComponent,
    RbacPermissionDirective,
    DanpheBarCodeComponent,
    VisitSticker_Generic_Single_Component,
    VisitSticker_Generic_PrintComponent,
    DischargeBillMainComponent,
    DischargeBillBreakupComponent,
    DischargeBillSummaryComponent,
    // DanpheAutoCompleteComponent,
    // DanpheAutoCompleteDirective,
    WardBillItemRequestComponent,
    DrugsRequestComponent,
    BooleanParameterPipe,
    SearchFilterPipe,
    PrescriptionNoteComponent//sud:11July-For Temporary purpose.
  ],
  exports: [DanpheDateTime,
    CommonModule,
    FormsModule,
    HasValuePipe,
    NepaliDatePipe,
    BooleanParameterPipe,
    LoadingComponent,
    NumberInWordsPipe,
    // Ng2TabModule,
    CapitalFirstLetter,
    ParseAmount,
    Currency,
    DanpheGridComponent,
    NepaliCalendarModule,
    CustomerHeaderComponent,
    PrintStickerComponent,
    NotificationComponent,
    CustomDateComponent,
    LabTestsViewReportComponent,
    LabTestsViewReportFormat2Component,
    LabTestsAddResultComponent,
    PostReportComponent,//sud:14Jan'19-- for Edit doctor feature, need to Revise this.. 
    ViewReportComponent,
    PatientOverviewComponent,
    DanpheMultiSelectComponent,
    DatePickerComponent,
    DanpheCkEditorComponent,
    PatientBillHistoryComponent,
    VitalsAddComponent,
    DoctorsNotesComponent,
    QRCodeModule,
    //Ng2AutoCompleteModule,
    LabTestsResults,
    QrReaderComponent,
    ImageCropperModule,
    WebcamModule,
    PhotoCropperComponent,
    SignatoriesComponent,
    PatientUploadFilesComponent,
    EmergencyStickerComponent,
    PrintHeaderComponent,
    BillingHeaderComponent,
    DepositReceiptComponent,
    RbacPermissionDirective,
    //NgxBarcodeModule,
    DanpheBarCodeComponent,
    VisitSticker_Generic_Single_Component,
    VisitSticker_Generic_PrintComponent,
    DischargeBillMainComponent,
    DischargeBillBreakupComponent,
    DischargeBillSummaryComponent,
    WardBillItemRequestComponent,
    DrugsRequestComponent,
    DicomMainModule,
    MatTooltipModule,
    SearchFilterPipe,
    PrescriptionNoteComponent//sud:11July-For Temporary purpose.
  ]
})
export class SharedModule { }
