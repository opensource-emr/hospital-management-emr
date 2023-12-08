import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from 'moment/moment';
import { DischargeSummaryMedication } from "../../adt/shared/discharge-summary-medication.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../shared/discharge-summary.bl.service';
//import { CommonFunctions } from "../../shared/common.functions";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { forkJoin, of } from "rxjs";
import { Observable } from "rxjs/Rx";
import { catchError } from "rxjs/internal/operators/catchError";
import { BabyBirthDetails } from "../../adt/shared/baby-birth-details.model";
import { CoreService } from "../../core/shared/core.service";
import { SecurityService } from "../../security/shared/security.service";
import { ENUM_PrintingType, PrinterSettingsModel } from "../../settings-new/printers/printer-settings.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ENUM_DanpheHTTPResponses, ENUM_DischargeSummaryDisplayLabels, ENUM_DischargeType, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { DischargeSummaryConsultantViewModel } from "../add-view-summary/view-templates/consultant-view-model";
import { DischargeSummaryViewModel } from "../add-view-summary/view-templates/discharge-summary-view-model";

@Component({
    selector: 'discharge-summary-view',
    templateUrl: './discharge-summary-view.html'
})
export class DischargeSummaryViewComponent {
    public dischargeSummaryViewModel: DischargeSummaryViewModel = new DischargeSummaryViewModel();
    @Input("selectedADT")
    public selectedADT: any;

    @Input("templateId")
    public templateId: number;
    public showSummaryView: boolean = false;
    public allMedications: Array<DischargeSummaryMedication> = new Array<DischargeSummaryMedication>();
    public consultants: Array<DischargeSummaryConsultantViewModel> = new Array<DischargeSummaryConsultantViewModel>();

    public labTestId: Array<number> = null;
    public medicationFrequency: Array<any> = new Array<any>();
    public DischargeCondition: string;
    public deliveryTypeList: any;
    public babybirthCondition: any;
    public deathTypeList: any;
    public MedicationType: string;
    public oldMedicinesCon: any;
    public oldStoppedMed: any;
    public selectedBaby: BabyBirthDetails = new BabyBirthDetails();

    public AddedTests: Array<any> = new Array<any>();
    public labTests: Array<any> = new Array<any>();
    public imagingItems: Array<any> = new Array<any>();

    public ShowDoctorsSignatureImage: boolean = false;


    public IsFinalSubmited: boolean = false;


    public TemplateTypeName: string = 'Discharge Summary';

    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public browserPrintContentObj: any;
    public openBrowserPrintWindow: boolean = false;
    public loading: boolean = false;
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
    public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };

    @Output('EditRecordEvent') sendData: EventEmitter<any> = new EventEmitter<any>();

    hasEditDischargeSunnaryPermission: boolean = false;
    public IsEditMode: boolean;
    public receivedData: any;
    public dynamicTemplateContent: Array<any> = [];
    public innerHtml: any;
    formattedData: any;
    mergedObj: any;
    hospitalStayDate: number;
    dischargeCondition: any;


    constructor(public dischargeSummaryBLService: DischargeSummaryBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        private sanitizer: DomSanitizer,
        public securityService: SecurityService,
        private changeDetector: ChangeDetectorRef) {
        let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
        if (paramValue) {
            this.headerDetail = JSON.parse(paramValue);
        }
        this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
        // this.AssignDischargeSummaryFormat();
        this.GetParameterValue();
        this.hasEditDischargeSunnaryPermission = this.securityService.HasPermission('btn-edit-discharge-summary-after-final-submit');
    }

    @Input("showSummaryView")
    public set value(val: boolean) {
        if (val && this.selectedADT) {
            this.IsFinalSubmited = this.selectedADT.IsSubmitted;
            var reqs: Observable<any>[] = [];
            reqs.push(this.dischargeSummaryBLService.GetDischargeSummary(this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));
            reqs.push(this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));
            reqs.push(this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId).pipe(
                catchError((err) => {
                    // Handle specific error for this call
                    return of(err.error);
                }
                )
            ));

            forkJoin(reqs).subscribe(result => {
                this.GetDischargeSummary(result[0]);
                this.GetLabRequests(result[1]);
                this.GetImagingResults(result[2]);
                this.ReFormatDischargeSummary(this.dischargeSummaryViewModel.DischargeType);
                this.LoadTemplate(this.dischargeSummaryViewModel.patDischargeSummary.DischargeSummaryTemplateId); //Bikesh: 24-july'23 loading htmlContent from database on the basis of discharge-summary-templateId
                this.AssignSelectedLabTests();
                this.AssignSelectedImagings();
                this.showSummaryView = true;
            });
            this.FormatDates();
        }
    }

    ngOnInit() {
        this.CalculateHospitalStayDay();
    }

    replacePlaceholdersWithData(htmlContent: string, data: any): string {  //Bikesh: 25-july'23 this is used for  replacing placeholder of provided htmlContent 
        return htmlContent.replace(/{{(.*?)}}/g, (match, placeholder) => {
            const propertyKeys = placeholder.split('.');
            let value = data;

            for (const key of propertyKeys) {
                if (value.hasOwnProperty(key)) {
                    value = value[key];
                } else {
                    // If any nested property doesn't exist or value is null, return an empty string
                    return '';
                }
            }
            // If the value is null or undefined, return an empty string
            return (value !== null && value !== undefined) ? value : '';
        });
    }

    getUpdatedContent(): SafeHtml {
        const sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(
            this.replacePlaceholdersWithData(this.innerHtml.changingThisBreaksApplicationSecurity, this.mergedObj)
        );
        return sanitizedHtml;
    }

    FormatDates() {
        this.selectedADT.DOB = moment(this.selectedADT.DateOfBirth).format('YYYY-MM-DD');
        this.selectedADT.AdmittedDate = moment(this.selectedADT.AdmittedDate).format('YYYY-MM-DD hh:mm A');
        if (this.selectedADT.DischargedDate) {
            this.selectedADT.DischargedDate = moment(this.selectedADT.DischargedDate).format('YYYY-MM-DD hh:mm A');
        }
        else
            this.selectedADT.DischargedDate = "";

    }
    GetMedicationFrequency() {
        this.dischargeSummaryBLService.GetMedicationFrequency()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.medicationFrequency = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get medication frequencies. please check log for detail.']);
                    this.logError(err.ErrorMessage);
                });
    }

    GetDischargeSummary(res) {
        //this.dischargeSummaryViewModel.selectedADT = this.selectedADT;
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results) {

                this.dischargeSummaryViewModel = res.Results;
                this.dischargeSummaryViewModel.patDischargeSummary = res.Results.DischargeSummary;
                this.dischargeSummaryViewModel.patDischargeSummary.DischargeCondition = res.Results.DischargeConditionType;
                this.dischargeSummaryViewModel.patDischargeSummary.DeathType = res.Results.DeathType;
                this.dischargeSummaryViewModel.patDischargeSummary.DeliveryType = res.Results.DeliveryType;
                this.dischargeSummaryViewModel.patDischargeSummary.DoctorIncharge = res.Results.DoctorInchargeName;
                this.dischargeSummaryViewModel.patDischargeSummary.CreatedOn = moment(res.Results.CreatedOn).format("YYYY-MM-DD HH:mm A");
                this.dischargeSummaryViewModel.patDischargeSummary.DischargeType = res.Results.DischargeType;
                this.dischargeSummaryViewModel.patDischargeSummary.CheckedBy = res.Results.CheckedBy;
                this.dischargeSummaryViewModel.selectedADT = this.selectedADT;
                //this.dischargeSummaryViewModel.selectedADT.Address = res.Results.Address;
                this.dischargeSummaryViewModel.selectedADT.DepartmentName = res.Results.DepartmentName;

                //Bikesh: 30-jul-23' this will calculate current age of the patient 
                this.dischargeSummaryViewModel.patDischargeSummary.Age = Math.floor((Date.now() - new Date(this.selectedADT.DOB).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                this.dischargeSummaryViewModel.patDischargeSummary.CreatedBy = res.Results.CreatedBy;
                this.dischargeSummaryViewModel.patDischargeSummary.DoctorIncharge = res.Results.DoctorInchargeName;
                this.dischargeSummaryViewModel.patDischargeSummary.DrInchargeNMC = res.Results.DrInchargeNMC;

                if ((this.dischargeSummaryViewModel.patDischargeSummary.LabTests && this.dischargeSummaryViewModel.patDischargeSummary.LabTests != null)) {
                    this.labTests = new Array<any>();
                    this.labTests = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.LabTests);
                    this.dischargeSummaryViewModel.LabTests = this.labTests;
                }

                if (res.Results.Medications.length) {
                    res.Results.Medications.forEach(a => {
                        let Medication = new DischargeSummaryMedication();
                        Medication = Object.assign(Medication, a);
                        this.allMedications.push(Medication);
                    });
                    // this.allMedications = this.allMedications.filter(a => a.FrequencyId > 0)
                    this.allMedications = this.allMedications.filter(a => a.FrequencyId == 0);
                    //    this.allMedications.forEach(a=>{
                    //        a.Type = this.medicationFrequency.find(s=> a.FrequencyId==s.FrequencyId).Type;
                    //    })
                    this.dischargeSummaryViewModel.newMedicines = this.allMedications.filter(a => a.OldNewMedicineType == 0);
                    // this.oldMedicinesCon = this.allMedications.filter(a => a.OldNewMedicineType == 1);
                    // this.oldStoppedMed = this.allMedications.filter(a => a.OldNewMedicineType == 2);
                }
                if (this.dischargeSummaryViewModel.patDischargeSummary && this.dischargeSummaryViewModel.patDischargeSummary.Diagnosis) {
                    this.dischargeSummaryViewModel.selectedDiagnosisList = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.Diagnosis);
                }
                if (this.dischargeSummaryViewModel.patDischargeSummary && this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis) {
                    this.dischargeSummaryViewModel.selectedProviDiagnosisList = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis);
                }

                if (this.dischargeSummaryViewModel.patDischargeSummary.SelectedImagingItems != null) {
                    this.imagingItems = new Array<any>();
                    this.imagingItems = JSON.parse(this.dischargeSummaryViewModel.patDischargeSummary.SelectedImagingItems);
                }
            }

        }
        else {
            this.showSummaryView = false;

            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }

    }


    LoadTemplate(TemplateId: number) {
        this.dischargeSummaryBLService.LoadTemplate(TemplateId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.dynamicTemplateContent = res.Results;
                    this.innerHtml = this.sanitizer.bypassSecurityTrustHtml(res.Results.PrintContentHTML)
                    // console.log(this.innerHtml);
                }

            })
    }

    //Gets only the requests, Use Results once We implement the Labs-Module for data entry. -- sud: 9Aug'17
    public GetLabRequests(res) {
        // this.dischargeSummaryBLService.GetLabRequestsByPatientVisit(this.selectedADT.PatientId, this.selectedADT.PatientVisitId)
        //     .subscribe(res => {
        //         if (res.Status == 'OK') {
        //             this.dischargeSummaryViewModel.labRequests = res.Results;
        //         }
        //         else {
        //             this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        //         }
        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get lab results.. please check log for detail.']);
        //             this.logError(err.ErrorMessage);
        //         });

        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.dischargeSummaryViewModel.labRequests = res.Results;
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }
    }

    public GetImagingResults(res) {
        // this.dischargeSummaryBLService.GetImagingReportsReportsByVisitId(this.selectedADT.PatientVisitId)
        //     .subscribe(res => {

        //     },
        //         err => {
        //             this.msgBoxServ.showMessage("error", ['Failed to get imaging results.. please check log for details.'], err.ErrorMessage);
        //         });

        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            if (res.Results.length)
                this.dischargeSummaryViewModel.imagingResults = res.Results;
        } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get Imaigng Results. Check log for detail"]);
            this.logError(res.ErrorMessage);
        }
    }

    logError(err: any) {
        console.log(err);
    }


    AssignSelectedLabTests() {
        // Below code helps to find which test is selected to show result in Reports.
        // if any labRequests is found in labTests then that test is selected to show its results and its component's results.


        this.AddedTests = [];

        if (this.dischargeSummaryViewModel.labRequests.length > 0) {
            this.dischargeSummaryViewModel.labRequests.forEach(a => {

                let tempLabTests: any = this.labTests.filter(lbtst => lbtst.TestId == a.TestId);
                let selectedLabTest: any = tempLabTests[0];

                if (selectedLabTest) {

                    var aCheck = this.AddedTests.some(lt => lt.TestId == selectedLabTest.TestId);

                    if (!aCheck) {

                        // a.IsSelectTest = true;
                        if (a.labComponents && a.labComponents.length == 1) {
                            a.IsSelectTest = true;
                            this.AddedTests.push({ TestId: a.TestId, TestName: a.TestName, labComponents: [] });
                        }
                        else if (a.labComponents && a.labComponents.length > 1) {

                            var cmptArray: Array<any> = new Array<any>();

                            a.labComponents.forEach(c => {

                                if (selectedLabTest.labComponents && selectedLabTest.labComponents.length) {
                                    var cCheck = selectedLabTest.labComponents.some(ltc => ltc.ComponentName == c.ComponentName);
                                    if (cCheck) {
                                        cmptArray.push({ ComponentName: c.ComponentName });
                                        c.IsCmptSelected = true;
                                    } else {
                                        c.IsCmptSelected = false;
                                    }
                                }
                            });

                            this.AddedTests.push({ TestId: a.TestId, TestName: a.TestName, labComponents: cmptArray });

                        }
                        let selectedComponentCount: number = 0;
                        this.AddedTests.forEach(at => {
                            if (at.TestId == a.TestId) {
                                selectedComponentCount = at.labComponents.length;
                            }
                        });
                        if (selectedComponentCount == a.labComponents.length) {
                            a.IsSelectTest = true;
                        }
                        else {
                            a.IsSelectTest = false;
                            a.IsChildSelected = true;
                        }
                    }

                } else {
                    a.IsSelectTest = false;
                }
            });
        }
        // for newly added tests which doesnot has any results
        this.dischargeSummaryViewModel.NewPendingTests = [];
        this.labTests.forEach(a => {
            let check = this.dischargeSummaryViewModel.labRequests.some(f => a.TestId == f.TestId);
            if (!check) {
                this.AddedTests.push(a);
                this.dischargeSummaryViewModel.NewPendingTests.push(a);
            }
        });
    }

    AssignSelectedImagings() {
        if (this.dischargeSummaryViewModel.imagingResults && this.dischargeSummaryViewModel.imagingResults.length) {
            this.dischargeSummaryViewModel.imagingResults.forEach(a => {
                var check = this.imagingItems.some(im => im == a.ImagingItemId);
                if (check) {
                    a.IsImagingSelected = true;
                }
            });
        }
    }

    public GetParameterValue() {
        var parameter = this.coreService.Parameters.find(p => p.ParameterName == "ShowDoctorsSignatureImageInDischargeSummary" && p.ParameterGroupName == "Discharge Summary");
        if (parameter && parameter.ParameterValue && parameter.ParameterValue == "true") {
            this.ShowDoctorsSignatureImage = true;
        } else {
            this.ShowDoctorsSignatureImage = false;
        }
    }

    public AllowEditFromView($event) {
        this.IsEditMode = $event;
        this.sendData.emit(this.IsEditMode);
    }


    ReFormatDischargeSummary(DischargeTypeName: string): any {   // Bikesh: 26-jul'23Reformating conditional labels for dynamic Discharge summary
        if (DischargeTypeName == ENUM_DischargeType.Recovered) {
            this.dischargeSummaryViewModel.patDischargeSummary.DischargeCondition = ENUM_DischargeSummaryDisplayLabels.DischargeCondition + this.dischargeSummaryViewModel.DischargeConditionType;
        }
        else if (DischargeTypeName == ENUM_DischargeType.Lama) {
            this.dischargeSummaryViewModel.patDischargeSummary.DischargeCondition = ENUM_DischargeSummaryDisplayLabels.DischargeCondition + this.dischargeSummaryViewModel.DischargeConditionType;
        }
        else if (DischargeTypeName == ENUM_DischargeType.Death) {
            this.dischargeSummaryViewModel.patDischargeSummary.DischargeCondition = ENUM_DischargeSummaryDisplayLabels.DischargeCondition + this.dischargeSummaryViewModel.DischargeConditionType;
            this.dischargeSummaryViewModel.patDischargeSummary.DeathType = ENUM_DischargeSummaryDisplayLabels.DeathPeriod + this.dischargeSummaryViewModel.DeathType + "Hours"
        }

        // reformationg Selected Diagnosis 
        if (this.dischargeSummaryViewModel.selectedDiagnosisList && this.dischargeSummaryViewModel.selectedDiagnosisList.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.SelectedDiagnosis = ENUM_DischargeSummaryDisplayLabels.SelectedDiagnosis + this.dischargeSummaryViewModel.selectedDiagnosisList
                .map(item => item.icd10Description)
                .join(', ');
        }
        else {
            this.dischargeSummaryViewModel.patDischargeSummary.SelectedDiagnosis = "";
        }

        // reformationg selected provisional Diagnosis list 
        if (this.dischargeSummaryViewModel.selectedProviDiagnosisList && this.dischargeSummaryViewModel.selectedProviDiagnosisList.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis = ENUM_DischargeSummaryDisplayLabels.ProvisionalDiagnosis + this.dischargeSummaryViewModel.selectedProviDiagnosisList
                .map(item => item.icd10Description)
                .join(', ');
        }
        else {
            this.dischargeSummaryViewModel.patDischargeSummary.ProvisionalDiagnosis = "";
        }

        if (this.dischargeSummaryViewModel.newMedicines && this.dischargeSummaryViewModel.newMedicines.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.Medications = ENUM_DischargeSummaryDisplayLabels.Medications + "<ul>"; // Start an unordered list
            this.dischargeSummaryViewModel.newMedicines.forEach((item) => {
                this.dischargeSummaryViewModel.patDischargeSummary.Medications += `<li>${item.Medicine}</li>`; // Create list items
            });
            this.dischargeSummaryViewModel.patDischargeSummary.Medications += "</ul>"; // Close the unordered list
        }
        else {
            this.dischargeSummaryViewModel.patDischargeSummary.Medications = "";
        }
        if (this.dischargeSummaryViewModel.LabTests && this.dischargeSummaryViewModel.LabTests.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.LabTests = ENUM_DischargeSummaryDisplayLabels.LabTests + "<ul>"; // Start an unordered list
            this.dischargeSummaryViewModel.LabTests.forEach((item) => {
                this.dischargeSummaryViewModel.patDischargeSummary.LabTests += `<li>${item.TestName}</li>`; // Create list items
            });
            this.dischargeSummaryViewModel.patDischargeSummary.LabTests += "</ul>"; // Close the unordered list
        }
        else {
            this.dischargeSummaryViewModel.patDischargeSummary.LabTests = "";
        }

        if (this.dischargeSummaryViewModel.Consultants && this.dischargeSummaryViewModel.Consultants.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.Consultants = this.dischargeSummaryViewModel.Consultants.map(item => item.consultantName)
                .join(',');
        }
        if (this.dischargeSummaryViewModel.Consultants && this.dischargeSummaryViewModel.Consultants.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.ConsultantsSign = this.dischargeSummaryViewModel.Consultants.map(consultant => `
            <div style="display: inline-block; margin-right: 10px;">
            <p style="margin: 0; font-weight: bold;">-----------------</p>
            <p style="margin: 5px 0;">Consultant:</p>
            <p style="margin: 0;">${consultant.consultantName}</p>
        </div>`).join('');
        }

        else {
            this.dischargeSummaryViewModel.patDischargeSummary.Consultants = "";
        }

        if (this.dischargeSummaryViewModel.Consultants && this.dischargeSummaryViewModel.Consultants.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.Consultant = this.dischargeSummaryViewModel.Consultants[0].consultantName;

        }
        if (this.dischargeSummaryViewModel.Consultants && this.dischargeSummaryViewModel.Consultants.length > 0) {
            this.dischargeSummaryViewModel.patDischargeSummary.ConsultantNMC = this.dischargeSummaryViewModel.Consultants[0].consultantNMC;

        }
        if (this.hospitalStayDate) {
            this.dischargeSummaryViewModel.patDischargeSummary.hospitalStayDate = this.hospitalStayDate;
        }

        if (this.dischargeSummaryViewModel.Anaesthetists) {
            this.dischargeSummaryViewModel.patDischargeSummary.Anesthetists = ENUM_DischargeSummaryDisplayLabels.Anesthetists + this.dischargeSummaryViewModel.Anaesthetists;

        }
        if (this.dischargeSummaryViewModel.ResidenceDrName) {
            this.dischargeSummaryViewModel.patDischargeSummary.ResidenceDrName = ENUM_DischargeSummaryDisplayLabels.ResidenceDrName + this.dischargeSummaryViewModel.ResidenceDrName;
        }
        if (this.dischargeSummaryViewModel.BabyWeight) {
            this.dischargeSummaryViewModel.patDischargeSummary.BabyWeight = ENUM_DischargeSummaryDisplayLabels.BabyWeight + this.dischargeSummaryViewModel.BabyWeight;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.DiagnosisFreeText) {
            this.dischargeSummaryViewModel.patDischargeSummary.DiagnosisFreeText = ENUM_DischargeSummaryDisplayLabels.OtherDiagnosis + this.dischargeSummaryViewModel.patDischargeSummary.DiagnosisFreeText;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.ClinicalFindings) {
            this.dischargeSummaryViewModel.patDischargeSummary.ClinicalFindings = ENUM_DischargeSummaryDisplayLabels.ClinicalFindings + this.dischargeSummaryViewModel.patDischargeSummary.ClinicalFindings;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.ChiefComplaint) {
            this.dischargeSummaryViewModel.patDischargeSummary.ChiefComplaint = ENUM_DischargeSummaryDisplayLabels.ChiefComplaint + this.dischargeSummaryViewModel.patDischargeSummary.ChiefComplaint;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.PresentingIllness) {
            this.dischargeSummaryViewModel.patDischargeSummary.PresentingIllness = ENUM_DischargeSummaryDisplayLabels.PatientIllnessHistory + this.dischargeSummaryViewModel.patDischargeSummary.PresentingIllness;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.PastHistory) {
            this.dischargeSummaryViewModel.patDischargeSummary.PastHistory = ENUM_DischargeSummaryDisplayLabels.PastHistory + this.dischargeSummaryViewModel.patDischargeSummary.PastHistory;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.CaseSummary) {
            this.dischargeSummaryViewModel.patDischargeSummary.CaseSummary = ENUM_DischargeSummaryDisplayLabels.CaseSummary + this.dischargeSummaryViewModel.patDischargeSummary.CaseSummary;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.ProcedureNts) {
            this.dischargeSummaryViewModel.patDischargeSummary.ProcedureNts = ENUM_DischargeSummaryDisplayLabels.Procedure + this.dischargeSummaryViewModel.patDischargeSummary.ProcedureNts;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.OperativeFindings) {
            this.dischargeSummaryViewModel.patDischargeSummary.OperativeFindings = ENUM_DischargeSummaryDisplayLabels.OperativeFindings + this.dischargeSummaryViewModel.patDischargeSummary.OperativeFindings;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.HistologyReport) {
            this.dischargeSummaryViewModel.patDischargeSummary.HistologyReport = ENUM_DischargeSummaryDisplayLabels.HistologyReport + this.dischargeSummaryViewModel.patDischargeSummary.HistologyReport;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.HospitalCourse) {
            this.dischargeSummaryViewModel.patDischargeSummary.HospitalCourse = ENUM_DischargeSummaryDisplayLabels.HospitalCourse + this.dischargeSummaryViewModel.patDischargeSummary.HospitalCourse;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Treatment) {
            this.dischargeSummaryViewModel.patDischargeSummary.Treatment = ENUM_DischargeSummaryDisplayLabels.Treatment + this.dischargeSummaryViewModel.patDischargeSummary.Treatment;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Condition) {
            this.dischargeSummaryViewModel.patDischargeSummary.Condition = ENUM_DischargeSummaryDisplayLabels.Condition + this.dischargeSummaryViewModel.patDischargeSummary.Condition;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.PendingReports) {
            this.dischargeSummaryViewModel.patDischargeSummary.PendingReports = ENUM_DischargeSummaryDisplayLabels.PendingReports + this.dischargeSummaryViewModel.patDischargeSummary.PendingReports;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.SpeicialNotes) {
            this.dischargeSummaryViewModel.patDischargeSummary.SpeicialNotes = ENUM_DischargeSummaryDisplayLabels.SpecialNotes + this.dischargeSummaryViewModel.patDischargeSummary.SpeicialNotes;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Allergies) {
            this.dischargeSummaryViewModel.patDischargeSummary.Allergies = ENUM_DischargeSummaryDisplayLabels.Allergies + this.dischargeSummaryViewModel.patDischargeSummary.Allergies;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Activities) {
            this.dischargeSummaryViewModel.patDischargeSummary.Activities = ENUM_DischargeSummaryDisplayLabels.Activities + this.dischargeSummaryViewModel.patDischargeSummary.Activities;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Diet) {
            this.dischargeSummaryViewModel.patDischargeSummary.Diet = ENUM_DischargeSummaryDisplayLabels.Diet + this.dischargeSummaryViewModel.patDischargeSummary.Diet;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.RestDays) {
            this.dischargeSummaryViewModel.patDischargeSummary.RestDays = ENUM_DischargeSummaryDisplayLabels.RestDays + this.dischargeSummaryViewModel.patDischargeSummary.RestDays;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.FollowUp) {
            this.dischargeSummaryViewModel.patDischargeSummary.FollowUp = ENUM_DischargeSummaryDisplayLabels.FollowUp + this.dischargeSummaryViewModel.patDischargeSummary.FollowUp;
        }
        if (this.dischargeSummaryViewModel.patDischargeSummary.Others) {
            this.dischargeSummaryViewModel.patDischargeSummary.Others = ENUM_DischargeSummaryDisplayLabels.Others + this.dischargeSummaryViewModel.patDischargeSummary.Others;
        }
        // if (this.dischargeSummaryViewModel.patDischargeSummary.CheckedBy) {
        //     this.dischargeSummaryViewModel.patDischargeSummary.CheckedBy = ENUM_DischargeSummaryDisplayLabels.CheckedBy + this.dischargeSummaryViewModel.patDischargeSummary.CheckedBy;
        // }


        this.formattedData = this.RestructureData(this.dischargeSummaryViewModel.patDischargeSummary);
        this.mergedObj = { ...this.formattedData, ...this.dischargeSummaryViewModel.selectedADT, ...this.dischargeSummaryViewModel.selectedADT.BedInformation }   //Bikesh: 24-july-2023 merging multiple object to single object 
        // console.log(this.mergedObj);

    }

    RestructureData(data: any): any {       // Bikesh:24th-july-'23 restructuring all incoming data to implement placeholder replacement logic
        const flattenedData = this.Flatten(data);
        return { ...flattenedData, ...data };
    }

    Flatten(obj: any, parentKey = '', sep = '_'): any {
        const flattenedObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = parentKey ? parentKey + sep + key : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const flatObject = this.Flatten(obj[key], newKey, sep);
                    Object.assign(flattenedObj, flatObject);
                } else {
                    flattenedObj[newKey] = obj[key];
                }
            }
        }
        return flattenedObj;
    }

    public Print(): void {
        this.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("id_discharge_summary_printpage");
            this.openBrowserPrintWindow = false;
            this.changeDetector.detectChanges();
            this.openBrowserPrintWindow = true;
            this.loading = false;

        }
        else {
            this.loading = false;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Printer Not Supported."]);
        }
    }

    public GetInvoiceDisplaySettings() {
        var StrParam = this.coreService.Parameters.find((a) =>
            a.ParameterGroupName == "Billing" &&
            a.ParameterName == "InvoiceDisplaySettings"
        );
        if (StrParam && StrParam.ParameterValue) {
            let currParam = JSON.parse(StrParam.ParameterValue);
            return currParam;
        }
    }

    public CalculateHospitalStayDay() {
        let date1 = new Date(this.selectedADT.DischargedDate);
        let date2 = new Date(this.selectedADT.AdmittedDate);
        this.hospitalStayDate = Math.floor((Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()) - Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())) / (1000 * 60 * 60 * 24));

    }
}
