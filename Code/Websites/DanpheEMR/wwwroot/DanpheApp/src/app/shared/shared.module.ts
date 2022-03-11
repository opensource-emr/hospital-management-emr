import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

//custom pipes
import { DanpheDateTime } from "./pipes/danphe-datetime.pipe";

import { HasValuePipe } from "./pipes/hasvalue.pipe"; //pipe to check if the field has value
import { NumberInWordsPipe } from "./pipes/number-inwords.pipe";
import { ParseAmount } from "./pipes/parse-amount.pipe";
import { CapitalFirstLetter } from "./pipes/capital-first-letter.pipe";
import { NepaliDatePipe } from "./pipes/nepali-date.pipe";
import { Currency } from "./pipes/currency.pipe";
import { LoadingComponent } from "./loading.component";
//import { Ng2TabModule } from 'ng2-tab';

import { DanpheGridComponent } from "./danphe-grid/danphe-grid.component";
import { AgGridModule } from "ag-grid-angular/main";

import { ResetPatientcontextGuard } from "../shared/reset-patientcontext-guard";
import { NepaliCalendarModule } from "./calendar/np/nepali-calendar.module";

import { AmChartsModule } from "@amcharts/amcharts3-angular";
import { DanpheChartsService } from "../dashboards/shared/danphe-charts.service";

import { CustomerHeaderComponent } from "../shared/customer-header/customer-header.component";
import { PrintStickerComponent } from "../appointments/opd-sticker/opd-sticker-print.component";
import { NotificationComponent } from "../core/notifications/notification.component";
import { QRCodeModule } from "angular2-qrcode";
//lab and imaging view report
import { LabTestsResults } from "../labs/lab-tests/lab-tests-results.component";
import { LabTestsAddResultComponent } from "../labs/lab-tests/lab-add-result/lab-tests-add-result.component";
import { LabTestsViewReportComponent } from "../labs/lab-tests/lab-final-reports/lab-tests-view-report.component";
import { ViewReportComponent } from "../radiology/shared/report/view-report.component";
import { DanpheMultiSelectComponent } from "../shared/danphe-multiselect/danphe-multiselect.component";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";

import { LabsBLService } from "../labs/shared/labs.bl.service";
import { LabService, LabTestResultService } from "../labs/shared/lab.service";
import { ImagingBLService } from "../radiology/shared/imaging.bl.service";
import { ImagingDLService } from "../radiology/shared/imaging.dl.service";
import { BillingDLService } from "../billing/shared/billing.dl.service";
import { BillingBLService } from "../billing/shared/billing.bl.service";
import { LabsDLService } from "../labs/shared/labs.dl.service";
import { ClinicalDLService } from "../clinical/shared/clinical.dl.service";
import { CustomDateComponent } from "./custom-date/custom-date.component";
import { Routes, RouterModule } from "@angular/router";

import { CKEditorModule } from "ng2-ckeditor";
import { DanpheCkEditorComponent } from "../shared/danphe-ckeditor/danphe-ckeditor.component";

import { LightboxModule } from "angular2-lightbox";
import { DatePickerComponent } from "./danphe-datepicker/danphe-datepicker.component";
import { DoctorsBLService } from "../doctors/shared/doctors.bl.service";
import { DoctorsDLService } from "../doctors/shared/doctors.dl.service";
import { RadiologyService } from "../radiology/shared/radiology-service";

import { PatientBillHistoryComponent } from "../billing/bill-history/patient-bill-history";

import { ResetOrdersGuard } from "../orders/reset-order-guard";
import { ResetDoctorcontextGuard } from "../shared/reset-doctorcontext-guard";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
// import { VitalsAddComponent } from '../clinical/vitals/vitals-add.component';
import { QrReaderComponent } from "./qr-code/qr-reader.component";
import { QrService } from "./qr-code/qr-service";

import { NgQrScannerModule } from "angular2-qrscanner";
//added: sud-4july-for photo-cropping.
import { ImageCropperModule } from "ngx-image-cropper";
import { WebcamModule } from "ngx-webcam";
import { PhotoCropperComponent } from "./photo-cropper/photo-cropper.component";
import { SignatoriesComponent } from "../labs/shared/signatories/signatories.component";

import { PatientUploadFilesComponent } from "../patients/patient-upload-files/patient-upload-files.component";
import { EmergencyStickerComponent } from "./emergency-sticker/emergency-sticker.component";
import { PrintHeaderComponent } from "./print-header/print-header";

//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete/danphe-auto-complete.module";
import { RbacPermissionDirective } from "../security/shared/rbac-permission.directive";

import { BillingHeaderComponent } from "../shared/billing-header/billing-header.component";
//import { DepositReceiptComponent } from "../billing/print-pages/deposit-slip/deposit-receipt.component";
import { DanpheBarCodeComponent } from "./bar-code/danphe-bar-code.component";

import { VisitSticker_Generic_Single_Component } from "./visit-generic-stickers/visit-gen-sticker-single.component";
import { VisitSticker_Generic_PrintComponent } from "./visit-generic-stickers/visit-generic-stickers-print.component";

import { PostReportComponent } from "../radiology/shared/report/post-report.component";

import { DrugsRequestComponent } from "../nursing/drugs-request/drugs-request.component";
import { DicomService } from "./danphe-dicom-viewer/shared/dicom.service";
import { DicomMainModule } from "./danphe-dicom-viewer/dicom-main.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { LoaderComponent } from "./danphe-loader-intercepter/danphe-loader";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { DanpheLoadingInterceptor } from "./danphe-loader-intercepter/danphe-loading.services";
import { BooleanParameterPipe } from "./pipes/boolean-parameter.pipe";
import { SearchFilterPipe } from "./pipes/data-filter.pipe";
import { SearchService } from "./search.service";

import { TermsListComponent } from '../inventory/settings/termsconditions/terms-list.component';
import { TermsAddComponent } from '../inventory/settings/termsconditions/terms-add.component';
import { LabTestsViewReportFormat2Component } from "../labs/lab-tests/lab-final-reports/lab-report-format2/lab-tests-view-report-format2.component";
import { SettingsSharedModule } from "../settings-new/settings-shared.module";
import { BillStickerComponent } from "../billing/bill-sticker/bill-sticker.component";
import { PHRMItemMasterManageComponent } from "../pharmacy/setting/item/phrm-item-manage.component";

import { InlineEditComponent } from "./danphe-inline-edit/inline-edit.component";
import { ResetAccountingServiceGuard } from "../accounting/shared/reset-accounting-service-guard";
import { DischargeSummaryViewComponent } from "../discharge-summary/add-view-summary/discharge-summary-view.component";
import { DischargeSummaryAddComponent } from "../discharge-summary/add-view-summary/discharge-summary-add.component";
import { ADT_BLService } from "../adt/shared/adt.bl.service";
import { DischargeSummaryBLService } from "../discharge-summary/shared/discharge-summary.bl.service";
import { DischargeSummaryDLService } from "../discharge-summary/shared/discharge-summary.dl.service";
import { TrackInventoryRequisitionComponent } from "../inventory/internal/track-requisition/track-requisition.component";
import { DanpheDateRangeSelectComponent } from "./danphe-date-range-select/danphe-date-range-select.component";
import { DanphePrintComponent } from "./print-service/print.component";
import { DanpheDateChangeComponent } from "./danphe-date-change.component";
import { PageNotFound } from "../404-error/404-not-found.component";
import { PatientOverviewMainComponent } from "../doctors/patient/patient-overview-main.component";
import { ResetNursingContextGuard } from "./reser-nursingcontext-guard";
import { FromToDateSelectComponent } from "./date-controls/from-to-date/from-to-date-select.component";
import { DateLabelComponent } from "./date-controls/date-label/date-label.component";
import { EnglishCalendarComponent } from "./calendar/en-calendar/en-calendar.component";
import { PHRMPackingTypeAddComponent } from "../pharmacy/setting/packing-type/phrm-packing-type-add.component";
import { PHRMPackingTypeListComponent } from "../pharmacy/setting/packing-type/phrm-packing-type-list.component";
import { FiscalYearCalendarComponent } from "./date-controls/fiscal-year-calendar/fiscal-year-calendar.component";
import { AddInvoiceHeaderComponent } from "./invoice-header/add-invoice-header.component";
import { InvoiceHeaderListComponent } from "./invoice-header/invoice-header-list.component";
import { SelectInvoiceHeaderComponent } from "./invoice-header/select-invoice-header.component";
import { ShowInvoiceHeaderComponent } from "./invoice-header/show-invoice-header.component";
import { PHRMGenericAddComponent } from "../pharmacy/common/Generic/generic-add.component";
import { PHRMGenericManageComponent } from "../pharmacy/setting/generic/phrm-generic-manage.component";
import { PHRMUnitOfMeasurementManageComponent } from "../pharmacy/setting/uom/phrm-uom-manage.component";
import { PHRMItemTypeManageComponent } from "../pharmacy/setting/item-type/phrm-item-type-manage.component";
import { PHRMCompanyManageComponent } from "../pharmacy/setting/company/phrm-company-manage.component";
import { PHRMCategoryManageComponent } from "../pharmacy/setting/category/phrm-category-manage.component";
import { ResetEmergencyContextGuard } from "./reset-emergencycontext-guard";
//import { PdfViewerModule } from 'ng2-pdf-viewer'; //rusha:30May'21--commented until proper solution is found.
import { PharmacyReceiptComponent } from "../pharmacy/receipt/pharmacy-receipt.component";
import { PhrmInvoiceViewComponent } from "../pharmacy/sale/invoice-view/phrm-invoice-view.component";
import { PHRMUpdateMRPComponent } from "../pharmacy/setting/mrp/phrm-update-mrp.component";
import { RequisitionNpViewComponent } from "./nepali-receipt-views/requisition-np-view/requisition-np-view.component";
import { DispatchNpViewComponent } from './nepali-receipt-views/dispatch-np-view/dispatch-np-view.component';
import { MunicipalitySelectComponent } from "./address-controls/municipality-select.component";
import { DefaultDischargeSummaryTemplateComponent } from "../discharge-summary/add-view-summary/view-templates/default-discharge-summary-template.comonent";
import { SCHDischargeSummaryTemplateComponent } from "../discharge-summary/add-view-summary/view-templates/SCH/sch-discharge-summary-template.comonent";


@NgModule({
  providers: [
    ResetPatientcontextGuard,
    ResetOrdersGuard,
    ResetDoctorcontextGuard,
    ResetNursingContextGuard,
    ResetEmergencyContextGuard,
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
    ResetAccountingServiceGuard,
    ADT_BLService,
    DischargeSummaryBLService,
    DischargeSummaryDLService,
    DicomService,
    LoaderComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DanpheLoadingInterceptor,
      multi: true,
    },
    LabService
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    AgGridModule.withComponents(DanpheGridComponent),
    NepaliCalendarModule,
    AmChartsModule,
    DanpheAutoCompleteModule,
    LightboxModule,
    QRCodeModule,
    AngularMultiSelectModule,
    CKEditorModule,
    NgQrScannerModule,
    ImageCropperModule,
    WebcamModule,
    DicomMainModule,
    MatTooltipModule,
    DicomMainModule,
    MatTooltipModule,
    SettingsSharedModule,
    //PdfViewerModule,

  ],
  declarations: [
    DanpheDateTime,
    HasValuePipe,
    LoadingComponent,
    NumberInWordsPipe,
    ParseAmount,
    Currency,
    CapitalFirstLetter,
    DanpheGridComponent,
    CustomerHeaderComponent,
    PrintStickerComponent,
    NotificationComponent,
    CustomDateComponent,
    LabTestsViewReportComponent,
    LabTestsViewReportFormat2Component,
    PostReportComponent, //sud:14Jan'19-- for Edit doctor feature, need to Revise this..
    ViewReportComponent,

    LabTestsAddResultComponent,
    DanpheMultiSelectComponent,
    DatePickerComponent,
    DanpheCkEditorComponent,
    PatientBillHistoryComponent,
    LabTestsResults,
    QrReaderComponent,
    PhotoCropperComponent,
    //NotesComponent,

    NepaliDatePipe,
    SignatoriesComponent,
    PatientUploadFilesComponent,
    EmergencyStickerComponent,
    PrintHeaderComponent,
    BillingHeaderComponent,
    //DepositReceiptComponent,
    RbacPermissionDirective,
    DanpheBarCodeComponent,
    VisitSticker_Generic_Single_Component,
    VisitSticker_Generic_PrintComponent,
    DrugsRequestComponent,
    BooleanParameterPipe,
    SearchFilterPipe,
    BillStickerComponent, //12-2-19 since sharedmodule is imported in both reporting and billing module.
    PHRMItemMasterManageComponent, //1/7/20 migrated from Pharmacy module because wardsupply needs to access this component
    PHRMPackingTypeAddComponent,
    PHRMPackingTypeListComponent,
    DischargeSummaryAddComponent,
    DischargeSummaryViewComponent,
    TrackInventoryRequisitionComponent,
    InlineEditComponent,
    DanpheDateRangeSelectComponent,
    DanphePrintComponent,
    DanpheDateChangeComponent,
    TermsListComponent,
    TermsAddComponent,
    PatientOverviewMainComponent,
    PageNotFound,
    FromToDateSelectComponent,
    DateLabelComponent,
    EnglishCalendarComponent,
    AddInvoiceHeaderComponent,
    InvoiceHeaderListComponent,
    FiscalYearCalendarComponent,
    SelectInvoiceHeaderComponent,
    ShowInvoiceHeaderComponent,
    FiscalYearCalendarComponent,
    PHRMGenericManageComponent,
    PHRMUnitOfMeasurementManageComponent,
    PHRMItemTypeManageComponent,
    PHRMCompanyManageComponent,
    PHRMCategoryManageComponent,
    PhrmInvoiceViewComponent,
    PharmacyReceiptComponent,
    PHRMUpdateMRPComponent, RequisitionNpViewComponent, DispatchNpViewComponent,
    MunicipalitySelectComponent,
    DefaultDischargeSummaryTemplateComponent,
    SCHDischargeSummaryTemplateComponent
  ],
  exports: [
    DanpheDateTime,
    CommonModule,
    FormsModule,
    HasValuePipe,
    NepaliDatePipe,
    BooleanParameterPipe,
    //LoadingComponent,
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
    PostReportComponent, //sud:14Jan'19-- for Edit doctor feature, need to Revise this..
    ViewReportComponent,
    DanpheMultiSelectComponent,
    DatePickerComponent,
    DanpheCkEditorComponent,
    PatientBillHistoryComponent,
    QRCodeModule,
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
    //DepositReceiptComponent,
    RbacPermissionDirective,
    //NgxBarcodeModule,
    DanpheBarCodeComponent,
    VisitSticker_Generic_Single_Component,
    VisitSticker_Generic_PrintComponent,
    DrugsRequestComponent,
    DicomMainModule,
    MatTooltipModule,
    SearchFilterPipe,
    BillStickerComponent, //12-2-19 since sharedmodule is imported in both reporting and billing module.
    PHRMItemMasterManageComponent, //1/7/20 migrated from Pharmacy module because wardsupply needs to access this component
    DischargeSummaryAddComponent,
    DischargeSummaryViewComponent,
    TrackInventoryRequisitionComponent,
    InlineEditComponent,
    DanpheDateRangeSelectComponent,
    DanphePrintComponent,
    DanpheDateChangeComponent,
    TermsListComponent,
    TermsAddComponent,
    PatientOverviewMainComponent,
    PageNotFound,
    FromToDateSelectComponent,
    EnglishCalendarComponent,
    DateLabelComponent,//sud:29May'20
    AddInvoiceHeaderComponent,
    InvoiceHeaderListComponent,
    FiscalYearCalendarComponent,
    PHRMPackingTypeAddComponent,
    PHRMPackingTypeListComponent,
    SelectInvoiceHeaderComponent,
    ShowInvoiceHeaderComponent,
    PHRMGenericManageComponent,
    PHRMUnitOfMeasurementManageComponent,
    PHRMItemTypeManageComponent,
    PHRMCompanyManageComponent,
    PHRMCategoryManageComponent,
    //PdfViewerModule,
    PhrmInvoiceViewComponent,
    PharmacyReceiptComponent,
    PHRMUpdateMRPComponent,
    RequisitionNpViewComponent,
    DispatchNpViewComponent,
    MunicipalitySelectComponent,
    DefaultDischargeSummaryTemplateComponent,
    SCHDischargeSummaryTemplateComponent
  ],
})
export class SharedModule { }
