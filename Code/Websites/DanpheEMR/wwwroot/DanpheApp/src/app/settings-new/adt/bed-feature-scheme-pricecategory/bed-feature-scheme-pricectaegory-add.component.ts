import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AdtBedFeatureSchemePriceCategoryMap_DTO } from "../../../adt/shared/DTOs/adt-bedfeature-scheme-pricecategory-map.dto";
import { BedFeature } from "../../../adt/shared/bedfeature.model";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { BillingSchemeModel } from "../../shared/bill-scheme.model";
import { PriceCategory } from "../../shared/price.category.model";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { BedFeatureSchemePriceCategoryModel } from "./shared/bed-feature-scheme-pricecategory.model";

@Component({
    selector: 'bed-feature-scheme-pricecategory-add',
    templateUrl: './bed-feature-scheme-pricectaegory-add.component.html'
})
export class BedFeatureSchemePriceCategoryAddComponent {
    @Input('update') update: boolean = false;
    @Input('bed-feature-scheme-pricecategory-map-to-edit') BedFeatureSchemePriceCategoryMapToEdit: BedFeatureSchemePriceCategoryModel;
    @Input('bed-feature-list') bedFeatureList: Array<BedFeature> = new Array<BedFeature>();

    selectedBedFeature: BedFeature = new BedFeature();
    BedFeatureValidator: FormGroup = null;
    BedFeatureSchemePriceCategory: BedFeatureSchemePriceCategoryModel = new BedFeatureSchemePriceCategoryModel();
    BedFeatureSchemePriceCategoryMaps: BedFeatureSchemePriceCategoryModel[] = [];
    BedFeatureSchemePriceCategoryList: AdtBedFeatureSchemePriceCategoryMap_DTO[] = [];
    BedFeatureSchemePriceCategoryToUpdate: AdtBedFeatureSchemePriceCategoryMap_DTO = new AdtBedFeatureSchemePriceCategoryMap_DTO();
    @Input('price-category-list') PriceCategoryList: PriceCategory[] = [];
    selectedPriceCategory: PriceCategory;
    @Input('scheme-list') BillSchemeList: BillingSchemeModel[] = [];
    selectedScheme: BillingSchemeModel;
    public loading: boolean = false;
    @Output('call-back-popup-close') callBackPopUpClose: EventEmitter<Object> = new EventEmitter<Object>();
    @Input('bed-feature-scheme-price-category-map-list')
    BedFeatureSchemePriceCategoryMapList: AdtBedFeatureSchemePriceCategoryMap_DTO[] = [];




    constructor(public settingsBLService: SettingsBLService, public messageBoxService: MessageboxService) {
    }
    ngOnInit() {
        if (this.update) {
            this.selectedBedFeature = this.bedFeatureList.find(a => a.BedFeatureId === this.BedFeatureSchemePriceCategoryMapToEdit.BedFeatureId);
            this.selectedScheme = this.BillSchemeList.find(a => a.SchemeId === this.BedFeatureSchemePriceCategoryMapToEdit.SchemeId);
            this.selectedPriceCategory = this.PriceCategoryList.find(a => a.PriceCategoryId === this.BedFeatureSchemePriceCategoryMapToEdit.PriceCategoryId);
            this.BedFeatureSchemePriceCategory.BedFeatureId = this.BedFeatureSchemePriceCategoryMapToEdit.BedFeatureId;
            this.BedFeatureSchemePriceCategory.BedFeatureName = this.BedFeatureSchemePriceCategoryMapToEdit.BedFeatureName;
            this.BedFeatureSchemePriceCategory.SchemeId = this.BedFeatureSchemePriceCategoryMapToEdit.SchemeId;
            this.BedFeatureSchemePriceCategory.SchemeName = this.BedFeatureSchemePriceCategoryMapToEdit.SchemeName;
            this.BedFeatureSchemePriceCategory.PriceCategoryId = this.BedFeatureSchemePriceCategoryMapToEdit.PriceCategoryId;
            this.BedFeatureSchemePriceCategory.PriceCategoryName = this.BedFeatureSchemePriceCategoryMapToEdit.PriceCategoryName;
            this.BedFeatureSchemePriceCategory.BedFeatureSchemePriceCategoryMapId = this.BedFeatureSchemePriceCategoryMapToEdit.BedFeatureSchemePriceCategoryMapId;
        }
    }


    BedFeatureFormatter(data): string {
        let html = data["BedFeatureName"];
        return html;
    }
    BedFeatureEventHandler() {
        if (this.selectedBedFeature) {
            this.BedFeatureSchemePriceCategory.BedFeatureId = this.selectedBedFeature.BedFeatureId;
            this.BedFeatureSchemePriceCategory.BedFeatureName = this.selectedBedFeature.BedFeatureName;
        }
    }

    GetPriceCategories() {
        this.settingsBLService.GetPriceCategory()
            .subscribe(
                (res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.PriceCategoryList = res.Results
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to load price category"]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to load price category" + err.errorMessages]);
                });
    }

    PriceCategoryFormatter(data): string {
        let html = data["PriceCategoryName"];
        return html;
    }

    PriceCategoryEventHandler() {
        if (this.selectedPriceCategory) {
            this.BedFeatureSchemePriceCategory.PriceCategoryId = this.selectedPriceCategory.PriceCategoryId;
            this.BedFeatureSchemePriceCategory.PriceCategoryName = this.selectedPriceCategory.PriceCategoryName;
        }
    }


    SchemeFormatter(data): string {
        let html = data["SchemeName"];
        return html;
    }

    SchemeEventHandler() {
        if (this.selectedScheme) {
            this.BedFeatureSchemePriceCategory.SchemeId = this.selectedScheme.SchemeId;
            this.BedFeatureSchemePriceCategory.SchemeName = this.selectedScheme.SchemeName;
        }
    }


    Close() {
        this.callBackPopUpClose.emit();
    }
    Add() {
        if (this.BedFeatureSchemePriceCategory.BedFeatureId && this.BedFeatureSchemePriceCategory.SchemeId && this.BedFeatureSchemePriceCategory.PriceCategoryId) {
            const isSameBedFeatureSchemeAlreadyExistInDb = this.BedFeatureSchemePriceCategoryMapList.some(a =>
                a.BedFeatureId === this.BedFeatureSchemePriceCategory.BedFeatureId &&
                a.SchemeId === this.BedFeatureSchemePriceCategory.SchemeId
            );

            if (isSameBedFeatureSchemeAlreadyExistInDb) {
                return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Not allowed to map same Bed Feature and Scheme', 'Mapping already exists in system']);
            }

            const isSameBedFeatureSchemeAndPriceCategoryMapAlreadyExistInDb = this.BedFeatureSchemePriceCategoryMapList.some(a =>
                a.BedFeatureId === this.BedFeatureSchemePriceCategory.BedFeatureId &&
                a.SchemeId === this.BedFeatureSchemePriceCategory.SchemeId &&
                a.PriceCategoryId === this.BedFeatureSchemePriceCategory.PriceCategoryId
            );

            if (isSameBedFeatureSchemeAndPriceCategoryMapAlreadyExistInDb) {
                return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Selected Map already exists in System']);
            }

            const isSameBedFeatureSchemeMapAlreadyExistsInFormList = this.BedFeatureSchemePriceCategoryMaps.some(a =>
                a.BedFeatureId === this.BedFeatureSchemePriceCategory.BedFeatureId &&
                a.SchemeId === this.BedFeatureSchemePriceCategory.SchemeId
            );

            if (isSameBedFeatureSchemeMapAlreadyExistsInFormList) {
                return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Not allowed to map same Bed Feature and Scheme']);
            }

            const isSameBedFeatureSchemeAndPriceCategoryMapAlreadyExistsInFormList = this.BedFeatureSchemePriceCategoryMaps.some(a =>
                a.BedFeatureId === this.BedFeatureSchemePriceCategory.BedFeatureId &&
                a.SchemeId === this.BedFeatureSchemePriceCategory.SchemeId &&
                a.PriceCategoryId === this.BedFeatureSchemePriceCategory.PriceCategoryId
            );

            if (isSameBedFeatureSchemeAndPriceCategoryMapAlreadyExistsInFormList) {
                return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Not allowed to add duplicate maps']);
            }

            this.BedFeatureSchemePriceCategoryMaps.push(this.BedFeatureSchemePriceCategory);
            this.ResetForm();
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Fill mandatory fields'])
        }
    }
    Delete(index: number) {
        this.BedFeatureSchemePriceCategoryMaps.splice(index, 1);
    }

    CheckExistingMapping() {
        // Check if BedFeatureId or SchemeId is changed, and PriceCategoryId is changed
        const isBedFeatureIdChanged = this.BedFeatureSchemePriceCategoryMapToEdit.BedFeatureId !== this.BedFeatureSchemePriceCategory.BedFeatureId;
        const isSchemeIdChanged = this.BedFeatureSchemePriceCategoryMapToEdit.SchemeId !== this.BedFeatureSchemePriceCategory.SchemeId;
        const isPriceCategoryIdChanged = this.BedFeatureSchemePriceCategoryMapToEdit.PriceCategoryId !== this.BedFeatureSchemePriceCategory.PriceCategoryId;

        if (isBedFeatureIdChanged || isSchemeIdChanged) {
            const isSameBedFeatureSchemeExistInDB = this.BedFeatureSchemePriceCategoryMapList.some(a =>
                a.BedFeatureId === this.BedFeatureSchemePriceCategory.BedFeatureId &&
                a.SchemeId === this.BedFeatureSchemePriceCategory.SchemeId
            );

            if (isSameBedFeatureSchemeExistInDB) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Mapping already exists in the system']);
                return false;
            }
        }

        return true;
    }

    Update() {
        if (this.BedFeatureSchemePriceCategory.BedFeatureId && this.BedFeatureSchemePriceCategory.SchemeId && this.BedFeatureSchemePriceCategory.PriceCategoryId) {
            const isValid = this.CheckExistingMapping();
            if (!isValid) {
                return;
            }

            // If none of the fields is changed or only PriceCategoryId is changed, proceed with the update.
            this.BedFeatureSchemePriceCategoryToUpdate.BedFeatureId = this.BedFeatureSchemePriceCategory.BedFeatureId;
            this.BedFeatureSchemePriceCategoryToUpdate.SchemeId = this.BedFeatureSchemePriceCategory.SchemeId;
            this.BedFeatureSchemePriceCategoryToUpdate.PriceCategoryId = this.BedFeatureSchemePriceCategory.PriceCategoryId;
            this.BedFeatureSchemePriceCategoryToUpdate.BedFeatureSchemePriceCategoryMapId = this.BedFeatureSchemePriceCategory.BedFeatureSchemePriceCategoryMapId;
            this.BedFeatureSchemePriceCategoryToUpdate.IsActive = this.BedFeatureSchemePriceCategory.IsActive;

            this.settingsBLService.UpdateBedFeatureSchemePriceCategory(this.BedFeatureSchemePriceCategoryToUpdate)
                .finally(() => this.loading = false)
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Updated Successfully']);
                        this.Close();
                    } else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Mapping already exists in the system']);
                    }
                },
                    err => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Mapping already exists in the system'] + err);
                    });
        }
    }



    Discard() {
        this.ResetForm();
    }

    ResetForm() {
        this.selectedBedFeature = null;
        this.selectedScheme = null;
        this.selectedPriceCategory = null;
        this.BedFeatureSchemePriceCategory = new BedFeatureSchemePriceCategoryModel();
    }
    Save() {

        if (!this.BedFeatureSchemePriceCategoryMaps.length) {
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['No items to save']);
        }
        this.loading = true;
        this.BedFeatureSchemePriceCategoryList = this.BedFeatureSchemePriceCategoryMaps.map(itm => {
            const bedFeaturePriceCategory = new AdtBedFeatureSchemePriceCategoryMap_DTO();
            bedFeaturePriceCategory.BedFeatureId = itm.BedFeatureId;
            bedFeaturePriceCategory.SchemeId = itm.SchemeId;
            bedFeaturePriceCategory.PriceCategoryId = itm.PriceCategoryId;
            return bedFeaturePriceCategory;
        });
        this.settingsBLService.SaveBedFeatureSchemePriceCategory(this.BedFeatureSchemePriceCategoryList).finally(() => this.loading = false)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Saved Successfully']);
                    this.Close();

                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Save']);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Save'] + err);
                });
    }
}

