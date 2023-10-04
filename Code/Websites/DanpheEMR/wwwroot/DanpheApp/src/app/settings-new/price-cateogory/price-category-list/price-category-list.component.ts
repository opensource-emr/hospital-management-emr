import { ChangeDetectorRef, Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PriceCategory } from "../../shared/price.category.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { CreditOrganization } from "../model/credit-organiztion.model";
import { PaymentMode } from "../model/payment-mode.model";


@Component({
    templateUrl: './price-category-list.html',
})
export class PriceCategoryListComponent {

    public pricecategoryGridColumns: Array<any> = null;
    public showAddNewPage: boolean = false;
    public priceCategory: PriceCategory = new PriceCategory();
    public priceCategoryList: Array<PriceCategory> = new Array<PriceCategory>();
    loading: boolean = false;
    public priceCategoryToEdit: PriceCategory = new PriceCategory();
    update: boolean = false;
    index: number = -1;
    BillingCreditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
    PharmacyCreditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
    paymentModesList: Array<PaymentMode> = new Array<PaymentMode>();

    constructor(public settingsServ: SettingsService,
        public settingsBlService: SettingsBLService,
        public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
        this.pricecategoryGridColumns = this.settingsServ.settingsGridCols.pricecategoryGridCols;
        // this.GetPharmacyCreditOrganization();
        // this.GetBillingCreditOrganization();
        // this.GetPaymentModes();
        this.GetPriceCategory();
    }

    GetBillingCreditOrganization() {
        this.settingsBlService.GetBillingCreditOrganization()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.BillingCreditOrganizationList = res.Results;
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["price category doesnot available"]);
                        this.loading = false;
                    }
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                });
    }
    GetPharmacyCreditOrganization() {
        this.settingsBlService.GetPharmacyCreditOrganization()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.PharmacyCreditOrganizationList = res.Results;
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["price category doesnot available"]);
                        this.loading = false;
                    }
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                });
    }
    GetPaymentModes() {
        this.settingsBlService.GetPaymentModes()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.paymentModesList = res.Results;
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Payment Modes doesnot available"]);
                        this.loading = false;
                    }
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                });
    }

    ShowAddNewPage() {
        this.showAddNewPage = false;
        this.changeDetector.detectChanges();
        this.update = false;
        this.showAddNewPage = true;
    }
    GetPriceCategory() {
        this.settingsBlService.GetPriceCategory()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.priceCategoryList = res.Results
                        this.loading = false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["price category doesnot available"]);
                        this.loading = false;
                    }
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                });
    }
    logError(err: any) {
        console.log(err);
    }
    getDataFromAdd($event) {
        this.GetPriceCategory();
        this.showAddNewPage = false;
        this.priceCategoryToEdit = null;

    }

    PriceCategoryListGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.priceCategoryToEdit = null;
                this.showAddNewPage = false;
                this.index = this.priceCategoryList.findIndex(p => p.PriceCategoryId === $event.Data.PriceCategoryId);
                this.changeDetector.detectChanges();
                this.priceCategoryToEdit = $event.Data;
                // this.priceCategoryToEdit.PharmacyCreditOrganization = this.PharmacyCreditOrganizationList.find(p => p.OrganizationId === $event.Data.PharmacyDefaultCreditOrganizationId);
                // this.priceCategoryToEdit.BillingCreditOrganization = this.BillingCreditOrganizationList.find(p => p.OrganizationId === $event.Data.DefaultCreditOrganizationId);
                // this.priceCategoryToEdit.PaymentMode = this.paymentModesList.find(p => p.PaymentSubCategoryId === $event.Data.DefaultPaymentModeId);
                this.showAddNewPage = true;
                break;
            }
            case "deactivatePriceCategorySetting": {
                this.index = this.priceCategoryList.findIndex(p => p.PriceCategoryId === $event.Data.PriceCategoryId);
                $event.Data.IsActive = false;
                this.ActivatePriceCategory($event.Data.PriceCategoryId, $event.Data.IsActive);
                break;
            }

            case "activatePriceCategorySetting": {
                this.index = this.priceCategoryList.findIndex(p => p.PriceCategoryId === $event.Data.PriceCategoryId);
                $event.Data.IsActive = true;
                this.ActivatePriceCategory($event.Data.PriceCategoryId, $event.Data.IsActive);
                break;
            }
            default:
                break;
        }

    }

    ActivatePriceCategory(PriceCategoryId: number, IsActive: boolean) {
        this.settingsBlService.PriceCategoryActivation(PriceCategoryId, IsActive)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.priceCategoryList[this.index].IsActive = res.Results.IsActive;
                    this.priceCategoryList = this.priceCategoryList.slice();
                    this.priceCategory = new PriceCategory();
                    if (IsActive == true) {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Activated."]);
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Deactivated."]);
                    }
                    this.index = -1;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["failed to Activate"]);
                }
            });
    }

}
