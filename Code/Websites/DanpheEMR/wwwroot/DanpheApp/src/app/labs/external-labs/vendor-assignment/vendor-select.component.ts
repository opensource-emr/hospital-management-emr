import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LabVendorsModel } from '../vendors-settings/lab-vendors.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabsBLService } from '../../shared/labs.bl.service';


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
                if (res.Status == "OK") {
                    this.vendorList = res.Results;

                    let defaultVendor = new LabVendorsModel();
                    defaultVendor.VendorName = "--Select--";
                    defaultVendor.LabVendorId = 0;
                    this.vendorList.unshift(defaultVendor);


                }
                else {
                    this.msgBoxService.showMessage("error", ["Couldn't Load External Vendors."]);
                }

            });

    }

    UpdateVendorForRequisitions() {
        //write code to save ResultingVendorId of selected Requisitions.
        let requisitionIdList = this.reqIdList;
        if(this.selectedVendorId){
            this.labsBlService.UpdateVendorToLabTest(requisitionIdList,this.selectedVendorId)
            .subscribe(res => {
                if(res.Status == "OK"){
                    this.msgBoxService.showMessage("success", ["Vendor successfully updtaed."]);
                    this.onSave.emit({ action: "save", "RequisitionList": requisitionIdList });
                } else {
                    this.msgBoxService.showMessage("error", ["Sorry, Couldn't Update the Vendor."]);
                }
            });            
        }
        

    }

    OnClose() {
        this.onPopupClose.emit({action: "close"});
    }


}
