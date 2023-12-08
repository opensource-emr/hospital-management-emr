import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CoreService } from "../../../core/shared/core.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { ReferringOrganization_DTO } from "../../Shared/DTOs/referral-organization.dto";
import { ReferralPartyGroup_DTO } from "../../Shared/DTOs/referral-party-group.dto";
import { ReferralParty_DTO } from "../../Shared/DTOs/referral-party.dto";
import { MarketingReferralBLService } from "../../Shared/marketingreferral.bl.service";
import { MarketingReferralService } from "../../Shared/marketingreferral.service";

@Component({
    selector: 'mktreferral-setting-referring-party',
    templateUrl: './mktreferral-setting-referring-party.component.html',
})

export class MarketingReferralReferringPartyComponent implements OnInit {

    public mktreferralReferringPartyListGridColumns: Array<any> = null;
    loading: boolean;
    public referringOrganizationList: ReferringOrganization_DTO[] = [];
    public referringOrganizationObj: ReferringOrganization_DTO = new ReferringOrganization_DTO();
    public referringPartyObj: ReferralParty_DTO = new ReferralParty_DTO();
    public ReferringPartyGroupValidator: FormGroup = null;
    public ShowAddEditPage: boolean = false;
    public referringPartyList: ReferralParty_DTO[] = [];

    ComponentMode: string = "add";
    selectedItem: ReferringOrganization_DTO;
    public referringPartyGroupList: ReferralPartyGroup_DTO[] = [];
    public selectedReferringPartyGroupObj: ReferralPartyGroup_DTO = new ReferralPartyGroup_DTO();
    public selectedOrganizationObj: ReferringOrganization_DTO = new ReferringOrganization_DTO();
    public referringPartyGroupObj: ReferralPartyGroup_DTO = new ReferralPartyGroup_DTO();
    public GeneralFieldLabel = new GeneralFieldLabels();

    constructor(public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public coreservice: CoreService,
        public mktReferralBLService: MarketingReferralBLService,
        public mktReferral: MarketingReferralService) {
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
        var _formbuilder = new FormBuilder();
        this.ReferringPartyGroupValidator = _formbuilder.group({
            'ReferringPartyName': ['', Validators.required],
            'ReferringPartyGroupName': ['', Validators.required],
            'ReferringOrganizationName': ['', Validators.required],
            'Address': ['', Validators.required],
            'ContactNo': ['', Validators.required],
        });
        this.mktreferralReferringPartyListGridColumns = this.mktReferral.settingsGridCols.mktreferralReferringPartyListGridCols;
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
        this.mktreferralReferringPartyListGridColumns[7].headerName = `${this.GeneralFieldLabel.PANNo}`;
    }

    ngOnInit() {
        this.GetReferringParty();
        this.GetReferringOrganization();
        this.GetReferringPartyGroup();
    }
    ReferringPartiesListFormatter(data: any): string {
        return data["GroupName"];
    }
    OrganizationListFormatter(data: any): string {
        return data["ReferringOrganizationName"];
    }

    onReferralPartyGroupSelected() {
        if (this.selectedReferringPartyGroupObj && this.selectedReferringPartyGroupObj.ReferringPartyGroupId) {
            this.referringPartyObj.ReferringPartyGroupId = this.selectedReferringPartyGroupObj.ReferringPartyGroupId;
            this.referringPartyObj.GroupName = this.selectedReferringPartyGroupObj.GroupName;
        }
    }

    onReferringOrganizationSelected() {
        if (this.selectedOrganizationObj && this.selectedOrganizationObj.ReferringOrganizationId) {
            this.referringPartyObj.ReferringOrgId = this.selectedOrganizationObj.ReferringOrganizationId;
            this.referringPartyObj.ReferringOrganizationName = this.selectedOrganizationObj.ReferringOrganizationName;
        }
    }


    GetReferringOrganization() {
        this.mktReferralBLService.GetReferringOrganization().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referringOrganizationList = res.Results.filter(org => org.IsActive === true);
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
        this.referringPartyObj = new ReferralParty_DTO();
        this.resetForm();
        this.selectedOrganizationObj = new ReferringOrganization_DTO();
        this.GetReferringParty();
    }
    onReferralPartyGroupSelectedAndFocus(event: any) {
        this.onReferralPartyGroupSelected();
        const nextInput = document.getElementById('id_party_organization_name');
        if (nextInput) {
            nextInput.focus();
        }
    }
    resetForm() {
        this.ReferringPartyGroupValidator.reset();
        this.ReferringPartyGroupValidator.markAsPristine();
        this.ReferringPartyGroupValidator.markAsUntouched();
        this.referringPartyObj = new ReferralParty_DTO();
        this.selectedReferringPartyGroupObj = new ReferralPartyGroup_DTO();
        this.selectedOrganizationObj = new ReferringOrganization_DTO();
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
    ReferringPartyListGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.ComponentMode = 'edit'

                this.referringPartyObj = $event.Data;
                let referringPartyGroup = this.referringPartyGroupList.find(a => a.ReferringPartyGroupId === this.referringPartyObj.ReferringPartyGroupId);
                this.selectedReferringPartyGroupObj = referringPartyGroup;
                let referringOrganization = this.referringOrganizationList.find(b => b.ReferringOrganizationId === this.referringPartyObj.ReferringOrgId);
                this.selectedOrganizationObj = referringOrganization;
                this.ShowAddEditPage = true;
                break;
            }

            case "activateOrganization": {
                this.selectedItem = $event.Data;
                this.ActivateDeactivateParty(this.selectedItem);
                break;
            }

            case "DeactivateOrganization": {
                this.selectedItem = $event.Data;
                this.ActivateDeactivateParty(this.selectedItem);
                break;
            }
            default:
                break;
        }
    }
    ActivateDeactivateParty(selectedItem) {
        const message = selectedItem.IsActive
            ? "Are you sure you want to deactivate this Party?"
            : "Are you sure you want to activate this Party?";

        if (window.confirm(message)) {
            this.mktReferralBLService
                .ActivateDeactivateParty(selectedItem)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.GetReferringParty();
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Party Status updated successfully']);
                    } else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                            "failed to Change status",
                        ]);
                    }
                });
        }
    }
    SaveParty() {
        this.loading = true;
        for (var i in this.ReferringPartyGroupValidator.controls) {
            this.ReferringPartyGroupValidator.controls[i].markAsDirty();
            this.ReferringPartyGroupValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValidCheck(undefined, undefined)) {
            this.mktReferralBLService
                .SaveReferringParty(this.referringPartyObj)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            if (res.Results) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Successfully saved Referring Party.`]);
                                this.loading = false;
                                this.GetReferringParty();
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
            return this.ReferringPartyGroupValidator.valid;
        }
        else
            return !(this.ReferringPartyGroupValidator.hasError(validator, fieldName));
    }
    Update() {
        this.loading = true;
        for (var i in this.ReferringPartyGroupValidator.controls) {
            this.ReferringPartyGroupValidator.controls[i].markAsDirty();
            this.ReferringPartyGroupValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValidCheck(undefined, undefined)) {
            this.mktReferralBLService
                .UpdateReferringParty(this.referringPartyObj)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Party Details Updated Successfully`]);
                            this.loading = false;
                            this.GetReferringParty();
                            this.Close();
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
    GetReferringParty() {
        this.mktReferralBLService.GetReferringParty().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referringPartyList = res.Results;
                    } else {
                        this.referringPartyList = [];
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
    GetReferringPartyGroup() {
        this.mktReferralBLService.GetReferringPartyGroup().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referringPartyGroupList = res.Results;
                    } else {
                        this.referringPartyGroupList = [];
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
}
