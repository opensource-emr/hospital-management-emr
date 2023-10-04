import { Component } from "@angular/core";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { DepositHead_DTO } from "../../../billing/shared/dto/deposit-head.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { MinimumDepositAmount_DTO } from "../../shared/DTOs/minimum-deposit-amount.dto";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { MinimumDepositSettingsModel } from "../../shared/minimum-deposit-settings";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
    selector: 'deposit-settings-list',
    templateUrl: './deposit-settings-list.component.html',
})
export class DepossitSettingsListComponent {
    showAddPage: boolean = false;
    loading: boolean = false;
    update: boolean = false;
    bedFeatureList: BedFeature[] = [];
    BillSchemeList: BillingSchemeModel[] = [];
    DepositHeadList: DepositHead_DTO[] = [];

    MinimumDepositSettingsColumns: Array<any> = [];
    MinimumDepositSettingsList: MinimumDepositSettingsModel[] = [];
    SettingDepositAmount: MinimumDepositSettingsModel;
    SettingDepositAmountToEdit: MinimumDepositAmount_DTO;
    index: number = -1;
    constructor(

        public settingsService: SettingsService,
        public SettingsBLService: SettingsBLService,
        public msgBoxServ: MessageboxService,
    ) {

        this.MinimumDepositSettingsColumns = this.settingsService.settingsGridCols.MinimumDepositSettingsList;
        this.GetSettingDepositAmount();
        this.GetBedFeatureList();
        this.GetBillingSchemes();
        this.GetDepositHead();

    }
    OnInit() {

    }
    public GetBedFeatureList() {
        this.SettingsBLService.GetBedFeatureList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.bedFeatureList = res.Results;
                }
            },
                err => {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get bed feature list" + err]);
                });
    }
    GetBillingSchemes() {
        this.SettingsBLService.GetBillingSchemes().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.BillSchemeList = res.Results;
                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load schemes']);
                }
            },
            (err) => {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to load schemes' + err]);
            }
        );
    }

    GetDepositHead() {
        this.SettingsBLService
            .GetDepositHead()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.DepositHeadList = res.Results;

                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                        "No  Deposit Head Found",
                    ]);
                }
            });

    }
    ClosePopUp(event) {
        this.showAddPage = false;
        this.update = false;
    }
    GetSettingDepositAmount() {
        this.SettingsBLService.GetSettingDepositAmount().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.MinimumDepositSettingsList = res.Results;
                    this.loading = false;
                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                        "Auto Biling Items not available",
                    ]);
                    this.loading = false;
                }
            },
            (err) => {
                this.logError(err);
                this.loading = false;
            }
        );
    }
    logError(err: any) {
        console.log(err);
    }
    public AddMinimumDepositSetting() {
        this.showAddPage = true;

    }
    CallBackAdd($event): void {
        this.showAddPage = false;
        this.SettingDepositAmountToEdit = null;
        if ($event) {
            this.GetSettingDepositAmount();
        }

    }

    CallBackUpdate($event): void {
        this.showAddPage = false;
        this.SettingDepositAmountToEdit = null;
        if ($event) {
            this.GetSettingDepositAmount();
        }
    }
    public MinimumDepositSettings($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.SettingDepositAmountToEdit = $event.Data;
                this.update = true;
                this.showAddPage = true;
                break;
            }

            case "deactivateSettingDeposit": {
                this.index = this.MinimumDepositSettingsList.findIndex(
                    (b) => b.AdtDepositSettingId === $event.Data.AdtDepositSettingId
                );
                $event.Data.IsActive = false;
                this.ActivateSettingDeposit($event.Data.AdtDepositSettingId, $event.Data.IsActive);
                break;
            }

            case "activateSettingDeposit": {
                this.index = this.MinimumDepositSettingsList.findIndex(
                    (b) => b.AdtDepositSettingId === $event.Data.AdtDepositSettingId
                );
                $event.Data.IsActive = true;
                this.ActivateSettingDeposit($event.Data.AdtDepositSettingId, $event.Data.IsActive);
                break;
            }
            default:
                break;
        }
    }
    ActivateSettingDeposit(AdtDepositSettingId: any, IsActive: any) {
        const message = IsActive
            ? "Are you sure you want to activate this Setting Deposit Amount ?"
            : "Are you sure you want to deactivate this Setting Deposit Amount?";

        if (window.confirm(message)) {
            this.SettingsBLService.ActivateDeactivateSettingDepositAmount(AdtDepositSettingId).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.MinimumDepositSettingsList[this.index].IsActive = res.Results.IsActive;
                    this.MinimumDepositSettingsList = this.MinimumDepositSettingsList.slice();
                    if (IsActive == true) {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                            " Setting Deposit Amount Activated.",
                        ]);
                    } else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                            "Setting Deposit Amount Deactivated.",
                        ]);
                    }
                    this.index = -1;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["failed to Change status"])
                }
            },
                (err) => {
                    this.logError(err);
                    this.loading = false;
                })
        }
    }
}