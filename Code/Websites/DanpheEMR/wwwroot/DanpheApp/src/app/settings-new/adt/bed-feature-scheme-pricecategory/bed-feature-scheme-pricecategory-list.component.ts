import { Component } from "@angular/core";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { PriceCategory } from "../../shared/price.category.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { BedFeatureSchemePriceCategoryModel } from "./shared/bed-feature-scheme-pricecategory.model";

@Component({
    selector: 'bed-feature-scheme-pricecategory-list',
    templateUrl: './bed-feature-scheme-pricecategory-list.component.html'
})
export class BedFeatureSchemePriceCategoryListComponent {
    BedFeatureSchemePriceCategoryColumns: Array<any> = null;
    showAddPage: boolean = false;
    loading: boolean = false;
    update: boolean = false;

    BedFeatureSchemePriceCategoryList: BedFeatureSchemePriceCategoryModel[] = []
    BedFeatureSchemePriceCategory: BedFeatureSchemePriceCategoryModel;
    bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
    BillSchemeList: BillingSchemeModel[] = [];
    PriceCategoryList: PriceCategory[] = [];
    index: any;



    constructor(
        public settingsService: SettingsService,
        public SettingsBLService: SettingsBLService,
        public msgBoxServ: MessageboxService,

    ) {
        this.BedFeatureSchemePriceCategoryColumns = this.settingsService.settingsGridCols.BedFeatureSchemePriceCategoryList;
        this.GetBedFeatureSchemePriceCategoryMap();
        this.GetBedFeatureList();
        this.GetBillingSchemes();
        this.GetPriceCategories();
    }

    AddBedFeatureSchemePriceCategory() {
        this.showAddPage = true;
    }
    BedFeatureSchemePriceCategoryMapGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case 'edit': {
                this.BedFeatureSchemePriceCategory = $event.Data;
                this.update = true;
                this.showAddPage = true;
                break;
            }

            case 'deactivateBedFeatureSchemePriceCategoryMap': {
                this.index = this.BedFeatureSchemePriceCategoryList.findIndex(
                    (b) => b.BedFeatureSchemePriceCategoryMapId === $event.Data.BedFeatureSchemePriceCategoryMapId
                );
                $event.Data.IsActive = false;
                this.ActivateDeactivateBedFeatureSchemePriceCategoryMap($event.Data.BedFeatureSchemePriceCategoryMapId, $event.Data.IsActive, this.index);
                break;
            }
            case 'activateBedFeatureSchemePriceCategoryMap': {
                this.index = this.BedFeatureSchemePriceCategoryList.findIndex(
                    (b) => b.BedFeatureSchemePriceCategoryMapId === $event.Data.BedFeatureSchemePriceCategoryMapId
                );
                $event.Data.IsActive = true;
                this.ActivateDeactivateBedFeatureSchemePriceCategoryMap($event.Data.BedFeatureSchemePriceCategoryMapId, $event.Data.IsActive, this.index);
                break;
            }
            default:
                break;
        }
    }
    ActivateDeactivateBedFeatureSchemePriceCategoryMap(BedFeatureSchemePriceCategoryMapId: number, IsActive: boolean, index: number): void {
        const message = IsActive
            ? "Are you sure you want to activate this BedFeatureSchemePriceCategory Map ?"
            : "Are you sure you want to deactivate this BedFeatureSchemePriceCategory Map?";

        if (window.confirm(message)) {
            this.SettingsBLService.ActivateDeactivateBedFeatureSchemePriceCategoryMap(BedFeatureSchemePriceCategoryMapId, IsActive).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.BedFeatureSchemePriceCategoryList[index].IsActive = res.Results.IsActive;
                    this.BedFeatureSchemePriceCategoryList = this.BedFeatureSchemePriceCategoryList.slice();
                    if (IsActive == true) {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                            " BedFeatureSchemePriceCategory Map Activated.",
                        ]);
                    } else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [
                            "BedFeatureSchemePriceCategory Map Deactivated.",
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
    ClosePopUp(event) {
        this.showAddPage = false;
        this.update = false;
        this.GetBedFeatureSchemePriceCategoryMap();
    }
    GetBedFeatureSchemePriceCategoryMap() {
        this.SettingsBLService.GetBedFeatureSchemePriceCategoryMap().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.BedFeatureSchemePriceCategoryList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['No data available to display '])
                }
            },
            (err) => {
                this.logError(err);
                this.loading = false;
            }
        )
    }
    logError(err: any) {
        console.log(err);
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

    GetPriceCategories() {
        this.SettingsBLService.GetPriceCategory()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.PriceCategoryList = res.Results
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to load price category"]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to load price category" + err.errorMessages]);
                });
    }

}