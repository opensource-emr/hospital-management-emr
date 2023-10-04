import { Component, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from "@angular/core";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PriceCategory } from "../../shared/price.category.model";
import * as moment from "moment";
import { CreditOrganization } from "../model/credit-organiztion.model";
import { PaymentMode } from "../model/payment-mode.model";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";

@Component({
    selector: "add-price-category",
    templateUrl: "./add-price-category.html"
})

export class AddPriceCategoryComponent {
    @Input('payment-mode-list')
    paymentModesList: Array<PaymentMode> = new Array<PaymentMode>();
    loading: boolean = false;
    // @Input('pharmacy-credit-organization-list')
    // PharmacyCreditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
    // @Input('billing-credit-organization-list')
    // BillingCreditOrganizationList: Array<CreditOrganization> = new Array<CreditOrganization>();
    // PharmacyCreditOrganization: CreditOrganization = new CreditOrganization();
    // BillingCreditOrganization: CreditOrganization = new CreditOrganization();
    // PaymentMode: PaymentMode = new PaymentMode();


    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Output("callback-close")
    callbackClose: EventEmitter<Object> = new EventEmitter<Object>();

    public isAddNewPriceCategory: boolean = true;
    @Input('price-category-to-edit')
    PriceCategory: PriceCategory = new PriceCategory();
    priceCategory: PriceCategory = new PriceCategory();
    @Input('update')
    update: boolean = false;
    showAddNewPage: boolean = false;
    @Input('show-Add-New-Page')
    public set value(val: boolean) {
        this.showAddNewPage = val;
        if (this.PriceCategory && this.PriceCategory.PriceCategoryId != 0) {
            this.update = true;
            this.priceCategory = new PriceCategory();
            this.priceCategory = Object.assign({}, this.priceCategory, this.PriceCategory);
            // this.SetFocusById('DisplayName')
        }
        else {
            this.priceCategory = new PriceCategory();
            this.update = false;
        }

    }


    constructor(
        public settingsBlService: SettingsBLService,
        public msgBoxServ: MessageboxService) {
    }

    close() {
        this.priceCategory = new PriceCategory();
        this.callbackAdd.emit({ action: "close", data: null });
    }
    ngOnInit() {
    }
    AddPriceCategory() {
        for (var i in this.priceCategory.PriceValidator.controls) {
            this.priceCategory.PriceValidator.controls[i].markAsDirty();
            this.priceCategory.PriceValidator.controls[i].updateValueAndValidity();
        }

        if (this.priceCategory.IsValidCheck(undefined, undefined)) {
            this.settingsBlService.AddPriceCategory(this.priceCategory)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
                            this.callbackAdd.emit({ action: "add", data: res.Results });
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Price Category Added"]);

                            this.priceCategory = new PriceCategory();
                            this.loading = false;
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Price Category not Added"]);
                            this.loading = false;
                        }
                    },
                    err => {
                        this.logError(err);
                        this.loading = false;
                    });
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["some data are invalid."]);
        }
    }
    logError(err: any) {
        console.log(err);
    }

    // PharmacyCreditOrganizationlistformatter(data: any): string {
    //     return data["OrganizationName"];
    // }
    // BillingCreditOrganizationlistformatter(data: any): string {
    //     return data["OrganizationName"];
    // }
    // paymentModesListFormatter(data: PaymentMode): string {
    //     return `${data.PaymentSubCategoryName} (${data.PaymentMode})`;
    // }
    // OnPaymentModeChange() {
    //     if (this.priceCategory.PaymentMode != null) {
    //         this.priceCategory.DefaultPaymentModeId = this.priceCategory.PaymentMode.PaymentSubCategoryId;
    //     }
   // }
    // OnBillingCreditOrganizationChange() {
    //     if (this.priceCategory.BillingCreditOrganization != null) {
    //         this.priceCategory.DefaultCreditOrganizationId = this.priceCategory.BillingCreditOrganization.OrganizationId;
    //     }
    // }
    // OnPharmacyCreditOrganizationChange() {
    //     if (this.priceCategory.PharmacyCreditOrganization != null) {
    //         this.priceCategory.PharmacyDefaultCreditOrganizationId = this.priceCategory.PharmacyCreditOrganization.OrganizationId;
    //     }
    // }
    UpdatePriceCategory() {
        this.settingsBlService.UpdatePriceCategory(this.priceCategory)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
                    this.callbackAdd.emit({ action: "edit", data: res.Results });
                    this.priceCategory = new PriceCategory();
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Updated."]);
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["failed to update"]);
                    this.SetFocusById('PriceCategory');
                }
            });
    }

    public SetFocusById(id: string) {
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
        }, 200);

    }
}