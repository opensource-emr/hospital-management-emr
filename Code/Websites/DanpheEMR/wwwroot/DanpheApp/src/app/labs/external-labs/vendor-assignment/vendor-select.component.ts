import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { LabsBLService } from '../../shared/labs.bl.service';
import { LabVendorsModel } from '../vendors-settings/lab-vendors.model';


@Component({
    selector: 'lab-vendor-select',
    templateUrl: "./vendor-select.html"
})
export class VendorSelectComponent {

    public vendorList: Array<LabVendorsModel> = [];
    public selectedVendorId: number = null;

    @Output("on-save")
    onSave: EventEmitter<object> = new EventEmitter<object>();

    @Output("on-close")
    onPopupClose: EventEmitter<object> = new EventEmitter<object>();

    @Input("reqIdList")
    reqIdList: Array<number> = [];

    constructor(private labsBlService: LabsBLService,
        private msgBoxService: MessageboxService) {
        this.LoadAllVendors();
    }

    ngOnInit() {

    }

    LoadAllVendors() {
        this.labsBlService.GetLabVendors()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results && res.Results.length > 0) {
                        let vendors = res.Results;
                        this.vendorList = vendors.filter(vendor => vendor.IsExternal === true);
                        this.selectedVendorId = this.vendorList[0].LabVendorId;
                    }
                }
                else {
                    this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Couldn't Load External Vendors."]);
                }
            });
    }

    UpdateVendorForRequisitions() {
        //write code to save ResultingVendorId of selected Requisitions.
        let requisitionIdList = this.reqIdList;
        if (this.selectedVendorId) {
            this.labsBlService.UpdateVendorToLabTest(requisitionIdList, this.selectedVendorId)
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Vendor successfully updtaed."]);
                        this.onSave.emit({ action: "save", "RequisitionList": requisitionIdList });
                    } else {
                        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Sorry, Couldn't Update the Vendor."]);
                    }
                });
        }
    }

    OnClose() {
        this.onPopupClose.emit({ action: "close" });
    }
}
