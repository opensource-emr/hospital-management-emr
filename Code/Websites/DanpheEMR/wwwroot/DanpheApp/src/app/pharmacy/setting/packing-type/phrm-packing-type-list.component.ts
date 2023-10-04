import { Component, ChangeDetectorRef } from "@angular/core";
import { PHRMPackingTypeModel } from "../../shared/phrm-packing-type.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMGridColumns from "../../shared/phrm-grid-columns";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
    selector: 'packingtype-list',
    templateUrl: './phrm-packing-type-list.html',
})
export class PHRMPackingTypeListComponent {
    public packingTypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
    public showpackingtypeList: boolean = true;
    public packingtypeGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedItem: PHRMPackingTypeModel;
    public index: number;
    public CurrentPackingType: PHRMPackingTypeModel = new PHRMPackingTypeModel();
    public selectedPacking: PHRMPackingTypeModel = new PHRMPackingTypeModel();
    public update: boolean;
    public packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
    public showPackingTypeAddPage: boolean;
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public messageBoxService: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.packingtypeGridColumns = PHRMGridColumns.PHRMPackingTypeList;
        this.GetPackingTypeList();
    }
    public GetPackingTypeList() {
        this.pharmacyBLService.GetPackingTypeList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.packingtypeList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }



    PackingTypeGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedPacking = null;
                this.update = true;
                this.showPackingTypeAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedPacking = $event.Data;
                this.index = this.packingtypeList.findIndex(PT => PT.PackingTypeId == this.selectedPacking.PackingTypeId);
                this.CurrentPackingType.PackingTypeId = this.selectedPacking.PackingTypeId;
                this.CurrentPackingType.PackingName = this.selectedPacking.PackingName;
                this.CurrentPackingType.IsActive = this.selectedPacking.IsActive;
                this.showPackingTypeAddPage = true;

                break;
            }
            case "activateDeactivateIsActive": {
                if ($event.Data != null) {
                    this.selectedPacking = null;
                    this.selectedPacking = $event.Data;
                    this.ActivateDeactivateStatus(this.selectedPacking);
                    this.selectedPacking = null;
                }
                break;
            }
            default:
                break;
        }

    }

    ActivateDeactivateStatus(currPackingType: PHRMPackingTypeModel) {
        if (currPackingType != null) {
            let status = currPackingType.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + currPackingType.PackingName + ' ?')) {
                currPackingType.IsActive = status;
                this.pharmacyBLService.UpdatePackingType(currPackingType)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? `${res.Results.PackingName} is now activated.` : `${res.Results.PackingName} is now Deactivated.`;
                                this.messageBoxService.showMessage("success", [responseMessage]);
                                currPackingType.IsActive = res.Results.IsActive;
                            }
                            else {
                                this.messageBoxService.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.messageBoxService.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                        });
            }
            //to refresh the checkbox if we cancel the prompt
            this.GetPackingTypeList();
        }
    }
    CallBackAdd(response) {
        var PackingType = response.packingType;
        if (this.index >= 0)
            this.packingtypeList.splice(this.index, 1, PackingType);
        else
            this.packingtypeList.splice(0, 0, PackingType);
        this.packingtypeList = this.packingtypeList.slice();
        this.changeDetector.detectChanges();
        this.showPackingTypeAddPage = false;
        this.selectedPacking = null;
        this.index = -1;
    }
    AddPackingType() {
        this.update = false;
        this.showPackingTypeAddPage = false;
        this.changeDetector.detectChanges();
        this.showPackingTypeAddPage = true;
    }
    CallBackUpdate(res) {
        if (res.Status == "OK") {
            var packingtype: any = {};
            packingtype.PackingTypeId = res.Results.PackingTypeId;
            packingtype.PackingName = res.Results.PackingName;
            packingtype.PackingQuantity = res.Results.PackingQuantity;
            packingtype.IsActive = res.Results.IsActive;
            this.CallBackAdd(packingtype);
        }
        else {
            this.messageBoxService.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }


}