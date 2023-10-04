import { Component } from "@angular/core";
import * as _ from 'lodash';
import { Observable, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { AdditionalServiceItem_DTO } from "../../shared/DTOs/additional-service-item.dto";
import { AdditionalServiceItemModel } from "../../shared/additional-service-item.model";
import { PriceCategory } from "../../shared/price.category.model";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";
import { BillServiceItemModel } from "../shared/bill-service-item.model";


@Component({
    templateUrl: './additional-service-items.component.html',
})
export class AdditionalServiceItemsComponent {

    public ShowServiceItemAddPage: boolean = false;
    public isUpdate: boolean = false;
    public showGrid: boolean = false;
    public additionalServiceItemList: Array<AdditionalServiceItem_DTO> = new Array<AdditionalServiceItem_DTO>();
    public additionalServiceItemGridColumns: Array<any> = null;
    public CurrentAdditionalServiceItem: AdditionalServiceItemModel = new AdditionalServiceItemModel();
    public priceCategoryList: Array<PriceCategory> = new Array<PriceCategory>();
    public serviceItemList: Array<BillServiceItemModel> = new Array<BillServiceItemModel>();
    public selectedServiceItem: BillServiceItemModel;
    public selectedPriceCategory: PriceCategory = null;
    public loading: boolean = false;
    public selectedActivateDeactivate: AdditionalServiceItemModel = new AdditionalServiceItemModel();
    public serviceItemData: { additionalServiceItemId: number, isActive: boolean } = { additionalServiceItemId: 0, isActive: false }
    public existingAdditionalServiceItem: AdditionalServiceItemModel;

    constructor(
        public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
    ) {
        this.additionalServiceItemGridColumns = this.settingsServ.settingsGridCols.additionalServiceItemList;
        this.getAdditionalServiceItems();
        var reqs: Observable<any>[] = [];
        reqs.push(this.settingsBLService.GetPriceCategory().pipe(
            catchError((err) => {
                return of(err.error);
            }
            )
        ));
        reqs.push(this.settingsBLService.GetServiceItemList().pipe(
            catchError((err) => {
                return of(err.error);
            }
            )
        ));
        forkJoin(reqs).subscribe(result => {
            this.AssignPriceCategory(result[0]);
            this.AssignServiceItemList(result[1]);
        });
    }


    ShowAddPage() {
        this.ShowServiceItemAddPage = true;
        this.isUpdate = false;
    }
    Close() {
        this.valueReset();
        this.ShowServiceItemAddPage = false;
    }

    valueReset() {
        this.CurrentAdditionalServiceItem = new AdditionalServiceItemModel();
        this.selectedPriceCategory = null;
        this.selectedServiceItem = null;
    }

    getAdditionalServiceItems() {
        this.settingsBLService.GetAdditionalServiceItems()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.additionalServiceItemList = res.Results;
                    this.showGrid = true;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Something went wrong' + res.ErrorMessage]);
                }

            });
    }

    CheckValidation(): boolean {
        let isValid: boolean = true;
        for (let i in this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls) {
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls[i].markAsDirty();
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls[i].updateValueAndValidity();
        }
        isValid = this.CurrentAdditionalServiceItem.IsValidCheck(undefined, undefined);
        return isValid;
    }
    AssignPriceCategory(res) {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.priceCategoryList = res.Results;
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
                "price category not available",
            ]);
        }
    }

    AssignServiceItemList(res) {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.serviceItemList = res.Results;
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get Service Items, check log for details']);
        }
    }
    PriceCategoryListFormatter(data: any): string {
        return data["PriceCategoryName"];
    }
    ServiceItemListFormatter(data: any): string {
        return data["ItemName"];
    }

    AssignSelectedPriceCategory(event) {
        this.selectedPriceCategory = event;
        this.CurrentAdditionalServiceItem.PriceCategoryId = this.selectedPriceCategory.PriceCategoryId;
    }
    AssignSelectedServiceItem(event) {
        this.selectedServiceItem = event;
        this.CurrentAdditionalServiceItem.ServiceItemId = this.selectedServiceItem.ServiceItemId;
        this.CurrentAdditionalServiceItem.ItemName = this.selectedServiceItem.ItemName;
    }

    AdditionalServiceItemGridActions(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.existingAdditionalServiceItem = event.Data;
                this.CurrentAdditionalServiceItem = new AdditionalServiceItemModel();
                this.CurrentAdditionalServiceItem.ServiceItemId = event.Data.ServiceItemId;
                let srv = this.serviceItemList.find(s => s.ServiceItemId === this.CurrentAdditionalServiceItem.ServiceItemId);
                this.selectedServiceItem = srv;
                this.CurrentAdditionalServiceItem.PriceCategoryId = event.Data.PriceCategoryId;
                let obj = this.priceCategoryList.find(x => x.PriceCategoryId === this.CurrentAdditionalServiceItem.PriceCategoryId);
                this.selectedPriceCategory = obj;
                this.CurrentAdditionalServiceItem.ItemName = event.Data.ItemName;
                this.CurrentAdditionalServiceItem.IsActive = event.Data.IsActive;
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["AdditionalServiceItemId"].setValue(event.Data.AdditionalServiceItemId);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["GroupName"].setValue(event.Data.GroupName);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["PriceCategoryId"].setValue(event.Data.PriceCategoryId);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["ServiceItemId"].setValue(event.Data.ServiceItemId);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["MinimumChargeAmount"].setValue(event.Data.MinimumChargeAmount);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["PercentageOfParentItemForSameDept"].setValue(event.Data.PercentageOfParentItemForSameDept);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["PercentageOfParentItemForDiffDept"].setValue(event.Data.PercentageOfParentItemForDiffDept);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["WithPreAnaesthesia"].setValue(event.Data.WithPreAnaesthesia);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["IsOpServiceItem"].setValue(event.Data.IsOpServiceItem);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["IsIpServiceItem"].setValue(event.Data.IsIpServiceItem);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["IsPreAnaesthesia"].setValue(event.Data.IsPreAnaesthesia);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["UseItemSelfPrice"].setValue(event.Data.UseItemSelfPrice);
                this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["IsActive"].setValue(event.Data.IsActive);
                this.ShowServiceItemAddPage = true;
                this.isUpdate = true;
                break;
            }
            case "activateDeactivate": {
                if (event.Data !== null) {
                    this.selectedActivateDeactivate = new AdditionalServiceItemModel();
                    this.selectedActivateDeactivate = event.Data;
                    this.ActivateDeactivateAdditionalServiceItemStatus(this.selectedActivateDeactivate);
                    this.selectedActivateDeactivate = null;
                }
                break;
            }
            default:
                break;
        }
    }
    ActivateDeactivateAdditionalServiceItemStatus(currServiceItem: AdditionalServiceItemModel) {
        if (currServiceItem !== null) {
            let status = currServiceItem.IsActive === true ? false : true;
            this.serviceItemData.additionalServiceItemId = currServiceItem.AdditionalServiceItemId;
            this.serviceItemData.isActive = status;
            if (status === true) {
                currServiceItem.IsActive = status;
                this.ChangeActiveStatus(this.serviceItemData);
            } else {
                if (confirm("Are you Sure want to Deactivate " + ' Selected Additional Service ?')) {
                    currServiceItem.IsActive = status;
                    this.ChangeActiveStatus(this.serviceItemData);
                }
            }
        }

    }

    ChangeActiveStatus(serviceItemData) {
        this.settingsBLService.ActivateDeactivateAdditionalServiceItemStatus(serviceItemData.additionalServiceItemId, serviceItemData.isActive)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.getAdditionalServiceItems();
                        let responseMessage = res.Results.IsActive ? "Additional Service Item is now Activated." : "Additional Service Item is now Deactivated.";
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);

                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Something went wrong' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [err]);
                });

    }



    AddAdditionalServiceItem() {
        if (this.selectedServiceItem !== null && this.selectedServiceItem !== undefined && this.selectedPriceCategory !== null && this.selectedPriceCategory !== undefined) {
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["ItemName"].setValue(this.selectedServiceItem.ItemName);
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["ServiceItemId"].setValue(this.selectedServiceItem.ServiceItemId);
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["PriceCategoryId"].setValue(this.selectedPriceCategory.PriceCategoryId);
            if (this.CheckValidation()) {
                const additionalServiceItem = _.cloneDeep(this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.value);
                let checkAdditionalServiceItem = this.additionalServiceItemList.find(g => g.GroupName === additionalServiceItem.GroupName &&
                    g.PriceCategoryId === additionalServiceItem.PriceCategoryId && g.ServiceItemId === additionalServiceItem.ServiceItemId)

                if (checkAdditionalServiceItem) {
                    return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate Additional Service Item']);
                }
                else if (additionalServiceItem.IsPreAnaesthesia && this.additionalServiceItemList.some(a => a.IsPreAnaesthesia)) {
                    return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['PreAnesthesia Service Item cannot be Duplicate']);
                }
                this.settingsBLService.AddAdditionalServiceItems(additionalServiceItem).finally(() => {
                    this.loading = false;
                }).subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item Added Successfully']);
                            this.getAdditionalServiceItems();
                            this.valueReset();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to add Additional Service Item, check log for details"]);
                        }
                        this.Close();
                    },
                    err => {
                        this.logError(err);
                    });
            }
            else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields with valid data"]);
            }
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields."]);
        }
    }
    logError(ErrorMessage: any) {
        throw new Error("Method not implemented.");
    }

    UpdateAdditionalServiceItem() {
        if (this.selectedServiceItem !== null && this.selectedServiceItem !== undefined && this.selectedPriceCategory !== null && this.selectedPriceCategory !== undefined) {
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["ItemName"].setValue(this.selectedServiceItem.ItemName);
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["ServiceItemId"].setValue(this.selectedServiceItem.ServiceItemId);
            this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.controls["PriceCategoryId"].setValue(this.selectedPriceCategory.PriceCategoryId);
            if (this.CheckValidation()) {
                const additionalServiceItem = _.cloneDeep(this.CurrentAdditionalServiceItem.AdditionalServiceItemValidator.value);
                let isPresent: boolean = false;
                if (this.existingAdditionalServiceItem.GroupName === additionalServiceItem.GroupName && this.existingAdditionalServiceItem.PriceCategoryId === additionalServiceItem.PriceCategoryId && this.existingAdditionalServiceItem.ServiceItemId === additionalServiceItem.ServiceItemId) {
                    isPresent = true;
                }
                let checkAdditionalServiceItem = this.additionalServiceItemList.find(g =>
                    g.GroupName === additionalServiceItem.GroupName &&
                    g.PriceCategoryId === additionalServiceItem.PriceCategoryId && g.ServiceItemId === additionalServiceItem.ServiceItemId);
                if (checkAdditionalServiceItem && !isPresent) {
                    return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate Additional Service Item']);
                }
                if (additionalServiceItem.IsPreAnaesthesia && this.additionalServiceItemList.some(a => a.IsPreAnaesthesia)) {
                    return this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['PreAnesthesia Service Item cannot be Duplicate']);

                }
                this.settingsBLService.UpdateAdditionalServiceItems(additionalServiceItem).finally(() => {
                    this.loading = false;
                })
                    .subscribe(
                        (res: DanpheHTTPResponse) => {
                            if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Item Updated Successfully']);
                                this.getAdditionalServiceItems();
                                this.valueReset();
                            }
                            else {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to Update Additional Service Item, check log for details"]);
                            }
                            this.Close();
                        },
                        err => {
                            this.logError(err);
                        });
            }

            else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields with proper data"]);
            }
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please fill all mandatory fields."]);
        }
    }
}


