import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { PatientLatestVisitContext_DTO } from "../../appointments/shared/dto/patient-lastvisit-context.dto";
import { Patient_DTO } from '../../claim-management/shared/DTOs/patient.dto';
import { BillingScheme_DTO } from "../../settings-new/billing/shared/dto/billing-scheme.dto";
import { PriceCategory_DTO } from '../../settings-new/shared/DTOs/price-category.dto';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import {
    ENUM_DanpheHTTPResponses,
    ENUM_Data_Type,
    ENUM_MessageBox_Status,
    ENUM_VisitType
} from "../../shared/shared-enums";
import { ChangeVisitScheme_DTO } from '../shared/DTOs/change-visit-scheme.dto';
import { UtilitiesBLService } from "../shared/utilities.bl.service";

@Component({
    selector: 'change-scheme-price-category',
    templateUrl: './change-scheme-price-category.component.html',
    styleUrls: ['./change-scheme-price-category.component.css']
})
export class ChangeSchemePriceCategoryComponent implements OnInit {
    public showIsPatientSelected: boolean = false;
    public billingSchemes: Array<BillingScheme_DTO> = [];
    public tempBillingScheme: BillingScheme_DTO = new BillingScheme_DTO();
    public priceCategoryList: Array<PriceCategory_DTO> = [];


    public selectedPatient: Patient_DTO = new Patient_DTO();
    public schemeVisitSchemeObject: ChangeVisitScheme_DTO = new ChangeVisitScheme_DTO();
    public selectedScheme: BillingScheme_DTO = new BillingScheme_DTO();
    public selectedPriceCategory: PriceCategory_DTO = new PriceCategory_DTO();
    public tempPriceCategory: PatientLatestVisitContext_DTO = new PatientLatestVisitContext_DTO();
    public loading: boolean = false;
    public changeVisitSchemeValidator: FormGroup = null;
    public showValidationMessage: boolean = false;
    public visitTypeInpatient = ENUM_VisitType.inpatient;
    public searchedPatientList: Array<PatientLatestVisitContext_DTO> = new Array<PatientLatestVisitContext_DTO>();
    public confirmationTitle: string = "Confirm !";
    public confirmationMessage: string = "Are you sure you want to Save ?";
    constructor(
        public formBuilder: FormBuilder,
        public utilitiesBlService: UtilitiesBLService,
        public msgBoxServ: MessageboxService,


    ) {
        this.GetBillingSchems();
        this.GetPriceCategoires();

    }

    ngOnInit() {
        this.changeVisitSchemeValidator = this.formBuilder.group({
            Remarks: ['', Validators.required]
        });
    }

    public GetBillingSchems() {
        this.utilitiesBlService.GetBillingSchmes().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.billingSchemes = res.Results;

                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }

    public GetPriceCategoires() {
        this.utilitiesBlService.GetPriceCategory()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.priceCategoryList = res.Results
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["price category does not available"]);
                        this.loading = false;
                    }
                },
                err => {
                    this.loading = false;
                });
    }
    public AssignSelectedPatient() {
        if (
            this.selectedPatient &&
            typeof this.selectedPatient === ENUM_Data_Type.Object && this.selectedPatient.PatientId > 0
        ) {
            this.schemeVisitSchemeObject.PatientId = this.selectedPatient.PatientId;
            this.schemeVisitSchemeObject.PatientVisitId = this.selectedPatient.PatientVisitId;
            this.schemeVisitSchemeObject.PatientCode = this.selectedPatient.PatientCode;
            this.schemeVisitSchemeObject.PolicyNo = this.selectedPatient.PolicyNo;
            this.showIsPatientSelected = true;
            this.AllPatientSearchLastVisitContext(this.schemeVisitSchemeObject.PatientId);
        }
        else {
            this.showIsPatientSelected = false;
        }
    }
    public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
        return this.utilitiesBlService.SearchRegisteredPatient(keyword);
    };

    // public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    //     return this.utilitiesBlService.GetPatientsWithVisitsInfo(keyword);
    // };
    public AllPatientSearchLastVisitContext(patientId: number) {
        this.utilitiesBlService.PatientLastVisitContext(patientId).subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.searchedPatientList = res.Results;
                    if (this.searchedPatientList) {
                        this.schemeVisitSchemeObject.PatientVisitId = this.searchedPatientList[0].PatientVisitId;
                        this.schemeVisitSchemeObject.VisitCode = this.searchedPatientList[0].VisitCode;
                        this.schemeVisitSchemeObject.VisitType = this.searchedPatientList[0].VisitType;
                        this.schemeVisitSchemeObject.OldSchemeId = this.searchedPatientList[0].SchemeId;
                        this.schemeVisitSchemeObject.OldPriceCategoryId = this.searchedPatientList[0].PriceCategoryId;
                        const billingScheme = this.billingSchemes.find(s => s.SchemeId === this.schemeVisitSchemeObject.OldSchemeId);
                        if (billingScheme) {
                            this.schemeVisitSchemeObject.SchemeName = billingScheme.SchemeName;
                        }
                        const pricecat = this.priceCategoryList.find(s => s.PriceCategoryId === this.schemeVisitSchemeObject.OldPriceCategoryId);
                        if (pricecat) {
                            this.schemeVisitSchemeObject.PriceCategoryName = pricecat.PriceCategoryName;
                        }
                    }
                    this.loading = false;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["patient not found"]);
                    this.loading = false;
                }
            },
            err => {
                this.logError(err);
                this.loading = false;
            });
    }


    AssignSelectedScheme() {
        if (
            this.selectedScheme &&
            typeof this.selectedScheme === ENUM_Data_Type.Object &&
            this.selectedScheme.SchemeId > 0
        ) {
            const billScheme = this.billingSchemes.find(x => x.SchemeName === this.selectedPatient.SchemeName);
            if (billScheme) {
                this.schemeVisitSchemeObject.OldSchemeId = billScheme.SchemeId;
            }
            this.schemeVisitSchemeObject.NewSchemeId = this.selectedScheme.SchemeId;
        }
    }
    AssignSelectedPriceCategory() {
        if (
            this.selectedPriceCategory &&
            typeof this.selectedPriceCategory === ENUM_Data_Type.Object &&
            this.selectedPriceCategory.PriceCategoryId > 0
        ) {
            const priceCategory = this.billingSchemes.find(x => x.SchemeName === this.selectedPatient.SchemeName);
            if (priceCategory) {
                this.schemeVisitSchemeObject.OldPriceCategoryId = priceCategory.DefaultPriceCategoryId;
            }
            this.schemeVisitSchemeObject.NewPriceCategoryId = this.selectedPriceCategory.PriceCategoryId;
        }
    }

    PatientListFormatter(data: any): string {
        let html: string = "";
        html =
            "<font size=03>" +
            "[" +
            data["PatientCode"] +
            "]" +
            "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" +
            data["ShortName"] +
            "</b></font>&nbsp;&nbsp;" +
            "(" +
            data["Age"] +
            "/" +
            data["Gender"] +
            ")" +
            "" +
            "</b></font>";
        return html;
    }

    GoToNextInput(nextInputId: string) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
    setFocusOnInput() {
        let obj = document.getElementById("id_patient_number");
        if (obj) {
            obj.focus();
        }
    }
    public SaveSchemePriceCategory() {
        if (this.changeVisitSchemeValidator.valid &&
            this.selectedScheme && this.selectedScheme.SchemeId > 0 && this.selectedPatient &&
            this.selectedPatient.PatientId > 0 && this.selectedPriceCategory && this.selectedPriceCategory.PriceCategoryId > 0
        ) {
            this.schemeVisitSchemeObject.Remarks = this.changeVisitSchemeValidator.get('Remarks').value;

            this.utilitiesBlService
                .SaveChangedVisitScheme(this.schemeVisitSchemeObject)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            if (res.Results) {
                                this.msgBoxServ.showMessage(
                                    ENUM_MessageBox_Status.Success,
                                    [`Successfully Changed Visit Scheme`]

                                );
                                this.showIsPatientSelected = false;
                                this.selectedPatient = new Patient_DTO;
                                this.selectedScheme = new BillingScheme_DTO;
                                this.selectedPriceCategory = new PriceCategory_DTO;
                                this.showValidationMessage = false;
                                this.changeVisitSchemeValidator.controls['Remarks'].setValue('');
                                this.loading = false;
                            }
                        } else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
                                `Error: ${res.ErrorMessage}`,
                            ]);
                            this.loading = false;
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
                            `Error: ${err.ErrorMessage}`,
                        ]);
                        this.loading = false;
                    }
                );
        } else {
            this.loading = false;
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [
                `Please fill all the mandatory fields.`,
            ]);
            this.loading = false;

        }
    }
    public DiscardChangesSchemePriceCategory() {
        this.selectedPatient = new Patient_DTO;
        this.showIsPatientSelected = false;
        this.selectedScheme = new BillingScheme_DTO;
        this.selectedPriceCategory = new PriceCategory_DTO;
        this.schemeVisitSchemeObject.Remarks = null;
    }
    IsDirty(fieldName): boolean {
        if (fieldName == undefined) {
            return this.changeVisitSchemeValidator.dirty;
        } else {
            return this.changeVisitSchemeValidator.controls[fieldName].dirty;
        }
    }

    IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.changeVisitSchemeValidator.valid;
        } else {
            return !this.changeVisitSchemeValidator.hasError(validator, fieldName);
        }
    }
    logError(err: any) {
        console.log(err);
    }

    handleConfirm() {
        this.loading = true;
        this.SaveSchemePriceCategory();
    }

    handleCancel() {
        this.loading = false;
    }
}
