import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { ReferringOrganization_DTO } from "../../Shared/DTOs/referral-organization.dto";
import { MarketingReferralBLService } from "../../Shared/marketingreferral.bl.service";
import { MarketingReferralService } from "../../Shared/marketingreferral.service";

@Component({
    selector: 'mktreferral-setting-referring-organization',
    templateUrl: './mktreferral-setting-referring-organization.component.html',
})

export class MarketingReferralReferringOrganizationComponent implements OnInit {

    public mktreferralReferringOrganizationListGridColumns: Array<any> = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public loading: boolean;
    public referringPartyFormControl: FormControl;
    public referringOrganizationList: ReferringOrganization_DTO[] = [];
    public referringOrganizationObj: ReferringOrganization_DTO = new ReferringOrganization_DTO();
    public ReferringOrganizationValidator: FormGroup = null;
    public ShowAddEditPage: boolean = false;
    public ComponentMode: string = "add";
    public selectedItem: ReferringOrganization_DTO;

    constructor(public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public mktReferralBLService: MarketingReferralBLService,
        public mktReferral: MarketingReferralService) {
        var _formbuilder = new FormBuilder();
        this.ReferringOrganizationValidator = _formbuilder.group({
            'ReferringOrganizationName': ['', Validators.required],
            'Address': ['', Validators.required],
        });
        this.mktreferralReferringOrganizationListGridColumns = this.mktReferral.settingsGridCols.mktreferralReferringOrganizationListGridCols;
    }

    ngOnInit() {
        this.GetReferringOrganization();
    }

    GetReferringOrganization() {
        this.mktReferralBLService.GetReferringOrganization().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referringOrganizationList = res.Results;
                    } else {
                        this.referringOrganizationList = [];
                    }
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
    Close() {
        this.ShowAddEditPage = false;
        this.ComponentMode = 'add';
        this.referringOrganizationObj = new ReferringOrganization_DTO();
    }
    GoToNextInput(nextInputId: string) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
    ShowAddNewPage() {
        this.selectedItem = null;
        this.referringOrganizationObj = new ReferringOrganization_DTO();
        this.ShowAddEditPage = true;
    }
    ReferringOrganizationListGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.ComponentMode = 'edit'
                this.selectedItem = $event.Data;
                this.referringOrganizationObj = this.selectedItem;
                this.ShowAddEditPage = true;
                break;
            }

            case "activateOrganization": {
                this.selectedItem = $event.Data;
                this.ActivateDeactivateOrganization(this.selectedItem);
                break;
            }

            case "DeactivateOrganization": {
                this.selectedItem = $event.Data;
                this.ActivateDeactivateOrganization(this.selectedItem);
                break;
            }
            default:
                break;
        }
    }
    ActivateDeactivateOrganization(selectedItem) {
        const message = selectedItem.IsActive
            ? "Are you sure you want to deactivate this Organization?"
            : "Are you sure you want to activate this Organization?";

        if (window.confirm(message)) {
            this.mktReferralBLService
                .ActivateDeactivateOrganization(selectedItem)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.GetReferringOrganization();
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Organization Status updated successfully']);
                    } else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                            "failed to Change status",
                        ]);
                    }
                });
        }
    }
    Save() {
        this.loading = true;
        for (var i in this.ReferringOrganizationValidator.controls) {
            this.ReferringOrganizationValidator.controls[i].markAsDirty();
            this.ReferringOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValidCheck(undefined, undefined)) {
            this.mktReferralBLService
                .SaveReferringOrganization(this.referringOrganizationObj)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            if (res.Results) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Successfully saved Organization.`]);
                                this.loading = false;
                                this.GetReferringOrganization();
                                this.Close();
                            }
                        } else {
                            this.loading = false;
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${res.ErrorMessage}`,]);
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.loading = false;
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`,]);
                    }
                );
        }
        this.loading = false;
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReferringOrganizationValidator.valid;
        }
        else
            return !(this.ReferringOrganizationValidator.hasError(validator, fieldName));
    }
    Update() {
        this.loading = true;
        for (var i in this.ReferringOrganizationValidator.controls) {
            this.ReferringOrganizationValidator.controls[i].markAsDirty();
            this.ReferringOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValidCheck(undefined, undefined)) {
            this.mktReferralBLService
                .UpdateReferringOrganization(this.referringOrganizationObj)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            if (res.Results) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Organization Updated Successfully`]);
                                this.loading = false;
                                this.GetReferringOrganization();
                                this.Close();
                            }
                        } else {
                            this.loading = false;
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Failed to Update`]);
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.loading = false;
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`,]);
                    }
                );
        }
        this.loading = false;
    }
}
