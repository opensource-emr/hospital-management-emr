import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { AccountingService } from "../../shared/accounting.service";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { CostCenterModel } from "../shared/cost-center.model";
@Component({
    selector: 'costcenter-item-list',
    templateUrl: './cost-center-item-list.html',
})
export class CostCenterItemListComponent {
    costCenters: Array<CostCenterModel> = new Array<CostCenterModel>();
    parentCostCenters: Array<ParentCostCenter> = new Array<ParentCostCenter>();
    showCostCenterItemList: boolean = true;
    CostCenter: CostCenterModel = new CostCenterModel();
    showAddPage: boolean = false;
    invalidParent: boolean = false;
    selectedParentId: number = null;
    selectedCostCenter: CostCenterModel;
    index: number = -1;
    costCenterGridColumns: Array<any> = null;
    costCenterList: Array<CostCenterModel> = new Array<CostCenterModel>();
    IsAddCostCenter: boolean = true;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Input('cost-center-edit')
    CostCenterToEdit: CostCenterModel = null;
    selectedParentCostCenter: ParentCostCenter = new ParentCostCenter();
    loading: boolean = false;
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public accountingService: AccountingService
    ) {
        this.costCenterGridColumns = GridColumnSettings.costCenterList;
        this.GetCostCenters();
        this.GetParentCostCenters();
    }
    public GetCostCenters(): void {
        try {
            this.accountingSettingsBLService.GetCostCenters().subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.costCenters = res.Results;
                }
                else {
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data' + res.ErrorMessage]);
                }
            },
                err => {
                    this.ShowCatchErrMessage(err)
                });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    public GetParentCostCenters(): void {
        this.accountingSettingsBLService.GetParentCostCenter().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.parentCostCenters = res.Results;
            }
        });
    }
    AddCostCenterItems(): void {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }
    CallBackAdd($event) {
        if ($event != null) {
            let curtFiscalLen = $event.costCenterItem;
            this.costCenters.push(curtFiscalLen);
            if (this.index) {
                this.costCenters.splice(this.index, 1);
                this.costCenters = this.costCenters.slice();
                this.changeDetector.detectChanges();
                this.showAddPage = false;
                this.index = null;
            }
        }
    }
    CostCenterGridActions($event: GridEmitModel): void {
        switch ($event.Action) {
            case "activate-deactivate": {
                this.selectedCostCenter = null;
                this.index = $event.RowIndex;
                this.selectedCostCenter = $event.Data;
                this.ActivateDeactivateCostCenter(this.selectedCostCenter);
                break;
            }
            case "edit": {
                this.IsAddCostCenter = false;
                // this.CostCenter = new CostCenterModel();                
                this.index = $event.RowIndex;
                Object.assign(this.CostCenter, $event.Data);
                this.selectedParentCostCenter = this.parentCostCenters.find(pcc => pcc.ParentCostCenterId === $event.Data.ParentCostCenterId);
                break;
            }
            default:
                break;
        }
    }
    DeactivateFiscalYearStatus(selecttedCostCenterItm: CostCenterModel) {
        if (selecttedCostCenterItm != null) {
            let status = selecttedCostCenterItm.IsActive == true ? false : true;
            let msg = status === true ? 'Activate' : 'De-Activate';
            if (confirm("Are you Sure want to " + msg + ' ' + selecttedCostCenterItm.CostCenterName + ' ?')) {
                selecttedCostCenterItm.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry               
                this.accountingSettingsBLService.UpdateCostCenterItemStatus(selecttedCostCenterItm)
                    .subscribe(
                        res => {
                            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                                let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                                this.msgBox.showMessage(ENUM_MessageBox_Status.Success, [res.Results.CostCenterItemName + ' ' + responseMessage]);
                                //This for send to callbackadd function to update data in list                                
                                // this.getcostCenters();                            
                            }
                            else {
                                this.msgBox.showMessage(ENUM_MessageBox_Status.Error, ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            console.log(err);
                        });
            }
        }
    }
    AddCostCenter(): void {
        if (this.CheckValidation()) {
            this.loading = true;
            this.accountingSettingsBLService.AddCostCenter(this.CostCenter).finally(() => {
                this.loading = false;
            }).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.costCenters.unshift(res.Results);
                    this.GetCostCenters();
                    this.GetParentCostCenters();
                    this.CostCenter = new CostCenterModel();
                    this.selectedParentCostCenter = null;
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Success, ['Cost Center Saved Successfully']);
                }
                else {
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to save.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBox.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to save.' + err.ErrorMessage]);
                });
        }
    }
    CheckValidation(): boolean {
        const maxHierarchyLevel = 2;
        if (this.selectedParentCostCenter && this.selectedParentCostCenter.HierarchyLevel >= maxHierarchyLevel) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['You can not insert Child for this parent']);
            return false;
        }
        for (let i in this.CostCenter.CostCenterValidator.controls) {
            this.CostCenter.CostCenterValidator.controls[i].markAsDirty();
            this.CostCenter.CostCenterValidator.controls[i].updateValueAndValidity();
        }
        if (this.CostCenter.IsValidCheck(undefined, undefined)) {
            return true;
        }
    }
    CallBackAddCostCenter(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.callbackAdd.emit({ costCenter: res.Results });
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
        }
    }
    getDataFromCostControl($event) {
        this.GetCostCenters();
    }
    AssignParent(): void {
        const maxHierarchyLevel = 2;
        if (typeof (this.selectedParentCostCenter) === ENUM_Data_Type.Object) {
            this.CostCenter.ParentCostCenterId = this.selectedParentCostCenter.ParentCostCenterId;
            if (this.selectedParentCostCenter.ParentCostCenterId === 0 || this.selectedParentCostCenter.ParentCostCenterId !== this.CostCenter.CostCenterId) {
                if (this.selectedParentCostCenter.HierarchyLevel < maxHierarchyLevel) {
                    this.CostCenter.HierarchyLevel = this.selectedParentCostCenter.HierarchyLevel;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['You can not insert Child for this parent']);
                }
            }
            else {
                this.CostCenter.ParentCostCenterId = 0;
                this.CostCenter.HierarchyLevel = 0;
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`You are not allowed to assign ${this.selectedParentCostCenter.ParentCostCenterName} as your parent cost center.`]);
            }
        }
        else {
            this.CostCenter.ParentCostCenterId = 0;
            this.CostCenter.HierarchyLevel = 0;
        }
    }
    ParentCostListFormatter(data: string): string {
        return data["ParentCostCenterName"];
    }
    UpdateCostCenter(): void {
        if (this.CheckValidation()) {
            try {
                for (let i in this.CostCenter.CostCenterValidator.controls) {
                    this.CostCenter.CostCenterValidator.controls[i].markAsDirty();
                    this.CostCenter.CostCenterValidator.controls[i].updateValueAndValidity();
                }
                if (this.CostCenter.IsValidCheck(undefined, undefined)) {
                    this.accountingSettingsBLService.UpdateCostCenter(this.CostCenter).subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            this.CostCenter = new CostCenterModel();
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Updated."]);
                            this.GetCostCenters();
                            this.IsAddCostCenter = true;
                            this.selectedParentCostCenter = new ParentCostCenter();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Failed to update costcenter details."]);
                            this.SetFocusById("CostCenterName");
                        }
                    });
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Enter valid details"]);
                }
            }
            catch (ex) {
                this.ShowCatchErrMessage(ex);
            }
        }
    }
    ActivateDeactivateCostCenter(costCenter: CostCenterModel) {
        try {
            this.accountingSettingsBLService.ActivateDeactiveCostCenter(costCenter).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.CostCenter = new CostCenterModel();
                    this.costCenters[this.index].IsActive = res.Results;
                    this.costCenters = this.costCenters.slice();

                    this.UpdateGlobalCostCenterObj(this.costCenters[this.index], this.costCenters[this.index].IsActive);

                    res.Results ? this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Activated."]) : this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Deactivated."]);
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_DanpheHTTPResponseText.Failed, ["Failed to update costcenter details."]);
                    this.SetFocusById("CostCenterName");
                }
            });
        }
        catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    CancelCostCenter(): void {
        this.CostCenter = new CostCenterModel();
        this.CostCenter.CostCenterValidator.clearValidators();
        this.selectedParentCostCenter = new ParentCostCenter();
        this.IsAddCostCenter = true;
    }
    public SetFocusById(id: string) {
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
        }, 600);
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    UpdateGlobalCostCenterObj(updatedCostCenterObj: CostCenterModel, isActive: boolean) {
        //Update the Active/InActive status in global CostCenter Object as well so that it will be reflected immediately in VoucherEntry and other pages.
        //Santosh:23May2023-- Ref: Sud
        this.accountingService.accCacheData.CostCenters.forEach(a => {
            if (a.CostCenterId === updatedCostCenterObj.CostCenterId) {
                a.IsActive = isActive;
            }
        });
    }
}
class ParentCostCenter {
    ParentCostCenterId: number = 0;
    ParentCostCenterName: string = '';
    HierarchyLevel: number = 0;
}