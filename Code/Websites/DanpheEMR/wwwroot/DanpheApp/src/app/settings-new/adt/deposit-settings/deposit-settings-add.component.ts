import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { DepositHead_DTO } from "../../../billing/shared/dto/deposit-head.dto";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { MinimumDepositAmount_DTO } from "../../shared/DTOs/minimum-deposit-amount.dto";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { MinimumDepositSettingsModel } from "../../shared/minimum-deposit-settings";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
    selector: 'deposit-settings-add',
    templateUrl: './deposit-settings-add.component.html',
})
export class DepositSettingsAddComponent {
    public loading: boolean = false;
    @Input('bed-feature-list') bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
    selectedBedFeature: BedFeature;
    MinimumDepositSettingsMap: MinimumDepositSettingsModel[] = [];

    MinimumDepositSettings: MinimumDepositSettingsModel = new MinimumDepositSettingsModel();
    @Input('setting-Deposit-Amount-List')
    MinimumDepositAmountList: MinimumDepositAmount_DTO[] = [];
    isSubmitted: boolean = false;

    SettingDepositAmount: MinimumDepositAmount_DTO = new MinimumDepositAmount_DTO();
    @Input('update') update: boolean = false;
    @Input('Setting-Deposit-Amount-To-Edit') SettingDepositAmountToEdit: MinimumDepositAmount_DTO;
    SettingDepositAmountToUpdate: MinimumDepositAmount_DTO = new MinimumDepositAmount_DTO();

    @Output('call-back-popup-close') callBackPopUpClose: EventEmitter<Object> = new EventEmitter<Object>();
    @Input('scheme-list') BillSchemeList: BillingSchemeModel[] = [];
    @Input('Deposit-Head-list') DepositHeadList: DepositHead_DTO[] = [];
    @Output('callback-add')
    callBackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Output('callback-update')
    callBackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
    selectedScheme: BillingSchemeModel;
    selectedDepositHead: DepositHead_DTO;
    messageBoxService: any;
    constructor(
        public msgBoxServ: MessageboxService,
        public settingsBLService: SettingsBLService,
        public coreService: CoreService,
    ) {

    }
    ngOnInit() {
        if (this.update) {
            this.selectedBedFeature = this.bedFeatureList.find(a => a.BedFeatureId === this.SettingDepositAmountToEdit.BedFeatureId);
            this.selectedScheme = this.BillSchemeList.find(a => a.SchemeId === this.SettingDepositAmountToEdit.SchemeId);
            this.selectedDepositHead = this.DepositHeadList.find(a => a.DepositHeadId === this.SettingDepositAmountToEdit.DepositHeadId);
            this.MinimumDepositSettings.AdtDepositSettingId = this.SettingDepositAmountToEdit.AdtDepositSettingId;
            this.MinimumDepositSettings.BedFeatureId = this.SettingDepositAmountToEdit.BedFeatureId;
            this.MinimumDepositSettings.BedFeatureName = this.SettingDepositAmountToEdit.BedFeatureName;
            this.MinimumDepositSettings.SchemeId = this.SettingDepositAmountToEdit.SchemeId;
            this.MinimumDepositSettings.SchemeName = this.SettingDepositAmountToEdit.SchemeName;
            this.MinimumDepositSettings.DepositHeadId = this.SettingDepositAmountToEdit.DepositHeadId;
            this.MinimumDepositSettings.DepositHeadName = this.SettingDepositAmountToEdit.DepositHeadName;
            this.MinimumDepositSettings.MinimumDepositAmount = this.SettingDepositAmountToEdit.MinimumDepositAmount;
            this.MinimumDepositSettings.IsOnlyMinimumDeposit = this.SettingDepositAmountToEdit.IsOnlyMinimumDeposit;
        }
    }
    Close() {
        this.callBackPopUpClose.emit();

    }
    BedFeatureFormatter(data): string {
        let html = data["BedFeatureName"];
        return html;
    }
    SchemeFormatter(data): string {
        let html = data["SchemeName"];
        return html;
    }
    DepositHeadFormater(data): string {
        let html = data["DepositHeadName"];
        return html;
    }
    BedFeatureEventHandler() {
        if (this.selectedBedFeature) {
            this.MinimumDepositSettings.BedFeatureId = this.selectedBedFeature.BedFeatureId;
            this.MinimumDepositSettings.BedFeatureName = this.selectedBedFeature.BedFeatureName;
        }
    }
    SchemeEventHandler() {
        if (this.selectedScheme) {
            this.MinimumDepositSettings.SchemeId = this.selectedScheme.SchemeId;
            this.MinimumDepositSettings.SchemeName = this.selectedScheme.SchemeName;
        }
    }
    DepositHeadEventHandler() {
        if (this.selectedDepositHead) {
            this.MinimumDepositSettings.DepositHeadId = this.selectedDepositHead.DepositHeadId;
            this.MinimumDepositSettings.DepositHeadName = this.selectedDepositHead.DepositHeadName;
        }
    }
    public IsValid(): boolean {
        if (this.MinimumDepositSettings.MinimumDepositSettingsValidator.valid) { return true; }
        else { return false; }
    } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.MinimumDepositSettings.MinimumDepositSettingsValidator.valid;
        }
        else
            return !(this.MinimumDepositSettings.MinimumDepositSettingsValidator.hasError(validator, fieldName));
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.MinimumDepositSettings.MinimumDepositSettingsValidator.dirty;
        else
            return this.MinimumDepositSettings.MinimumDepositSettingsValidator.controls[fieldName].dirty;
    }
    Discard() {
        this.ResetForm();
    }
    ResetForm() {
        this.selectedBedFeature = null;
        this.selectedScheme = null;
        this.selectedDepositHead = null;
        this.MinimumDepositSettings = new MinimumDepositSettingsModel();
    }
    Save() {
        // this.loading = true;
        for (var i in this.MinimumDepositSettings.MinimumDepositSettingsValidator.controls) {
            this.MinimumDepositSettings.MinimumDepositSettingsValidator.controls[i].markAsDirty();
            this.MinimumDepositSettings.MinimumDepositSettingsValidator.controls[i].updateValueAndValidity();
        }
        if (this.MinimumDepositSettings.BedFeatureId && this.MinimumDepositSettings.SchemeId) {
            const isSameBedFeatureSchemeExistInDB = this.MinimumDepositAmountList.some(a =>
                a.BedFeatureId === this.MinimumDepositSettings.BedFeatureId &&
                a.SchemeId === this.MinimumDepositSettings.SchemeId
            );

            if (isSameBedFeatureSchemeExistInDB) {
                return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Mapping already exists in system']);
            }


            if (this.IsValidCheck(undefined, undefined)) {
                this.SettingDepositAmount.AdtDepositSettingId = this.MinimumDepositSettings.AdtDepositSettingId;
                this.SettingDepositAmount.BedFeatureId = this.MinimumDepositSettings.BedFeatureId;
                this.SettingDepositAmount.BedFeatureName = this.MinimumDepositSettings.BedFeatureName;
                this.SettingDepositAmount.SchemeId = this.MinimumDepositSettings.SchemeId;
                this.SettingDepositAmount.SchemeName = this.MinimumDepositSettings.SchemeName;
                this.SettingDepositAmount.DepositHeadId = this.MinimumDepositSettings.DepositHeadId;
                this.SettingDepositAmount.DepositHeadName = this.MinimumDepositSettings.DepositHeadName;
                this.SettingDepositAmount.MinimumDepositAmount = this.MinimumDepositSettings.MinimumDepositAmount;
                this.SettingDepositAmount.IsOnlyMinimumDeposit = this.MinimumDepositSettings.IsOnlyMinimumDeposit;
                this.settingsBLService.SaveMinimumDepositAmount(this.SettingDepositAmount).finally(() => this.loading = false)
                    .subscribe(res => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Saved Successfully']);
                            this.callBackAdd.emit(true);
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Save']);
                        }
                    },
                        err => {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Save'] + err);
                        });
            } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please fill all mandatory fields"]);
            }
        }
    }

    Update() {
        // Check if BedFeatureId and SchemeId are truthy
        if (this.MinimumDepositSettings.BedFeatureId && this.MinimumDepositSettings.SchemeId) {
            // Check if BedFeatureId or SchemeId has been changed
            const isBedFeatureIdChanged = this.SettingDepositAmountToEdit.BedFeatureId !== this.MinimumDepositSettings.BedFeatureId;
            const isSchemeIdChanged = this.SettingDepositAmountToEdit.SchemeId !== this.MinimumDepositSettings.SchemeId;

            // If either BedFeatureId or SchemeId has been changed, perform the combination check
            if (isBedFeatureIdChanged || isSchemeIdChanged) {
                const isSameBedFeatureSchemeExistInDB = this.MinimumDepositAmountList.some(a =>
                    a.BedFeatureId === this.MinimumDepositSettings.BedFeatureId &&
                    a.SchemeId === this.MinimumDepositSettings.SchemeId
                );

                if (isSameBedFeatureSchemeExistInDB) {
                    return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Mapping already exists in system']);
                }
            }
        }

        // Update the fields of SettingDepositAmountToUpdate with the values from MinimumDepositSettings
        this.SettingDepositAmountToUpdate.AdtDepositSettingId = this.MinimumDepositSettings.AdtDepositSettingId;
        this.SettingDepositAmountToUpdate.BedFeatureId = this.MinimumDepositSettings.BedFeatureId;
        this.SettingDepositAmountToUpdate.BedFeatureName = this.MinimumDepositSettings.BedFeatureName;
        this.SettingDepositAmountToUpdate.SchemeId = this.MinimumDepositSettings.SchemeId;
        this.SettingDepositAmountToUpdate.SchemeName = this.MinimumDepositSettings.SchemeName;
        this.SettingDepositAmountToUpdate.DepositHeadId = this.MinimumDepositSettings.DepositHeadId;
        this.SettingDepositAmountToUpdate.DepositHeadName = this.MinimumDepositSettings.DepositHeadName;
        this.SettingDepositAmountToUpdate.MinimumDepositAmount = this.MinimumDepositSettings.MinimumDepositAmount;
        this.SettingDepositAmountToUpdate.IsOnlyMinimumDeposit = this.MinimumDepositSettings.IsOnlyMinimumDeposit;

        // Call the service to update the server-side data
        this.settingsBLService.UpdateSettingDepositAmount(this.SettingDepositAmountToUpdate)
            .finally(() => this.loading = false)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    // Display success message and emit the callback if the update is successful
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Updated Successfully']);
                    this.callBackUpdate.emit(true);
                } else {
                    // Display error message if the update is not successful
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Update']);
                }
            }, err => {
                // Display error message along with the error details if an error occurs during the update process
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Update'] + err);
            });
    }

}