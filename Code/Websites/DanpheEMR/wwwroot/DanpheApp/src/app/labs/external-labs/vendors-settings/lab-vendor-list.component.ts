import { Component, ChangeDetectorRef } from '@angular/core';
//import LabGridColumnSettings from '../../../shared/lab-gridcol-settings';
//import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { LabVendorsModel } from './lab-vendors.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabSettingsBLService } from '../../lab-settings/shared/lab-settings.bl.service';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { DanpheHTTPResponse } from '../../../shared/common-models';
//import { LabSettingsBLService } from '../../shared/lab-settings.bl.service';
//import { DanpheHTTPResponse } from '../../../../shared/common-models';
//import LabGridColumnSettings from '../../shared/lab-gridcol-settings';

@Component({
    templateUrl: "./lab-vendor-list.html"
})

export class LabVendorListComponent {

    public allLabs: Array<LabVendorsModel> = [];
    public defaultVendor: LabVendorsModel = new LabVendorsModel();
    public vendorGridCols = [];

    constructor(public msgBox: MessageboxService,
        public labSettingBlService: LabSettingsBLService,
        public changeDetector: ChangeDetectorRef) {
        this.vendorGridCols = LabGridColumnSettings.LabVendorsListColumns;
        this.LoadAllLabVendors();
    }

    showAddUpdatePage: boolean = false;
    actionName: string = "add";
    selectedVendor: LabVendorsModel = null;

    LoadAllLabVendors() {
        this.labSettingBlService.GetLabVendors()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.allLabs = res.Results;  
                    this.defaultVendor = this.allLabs.find(val => val.IsDefault == true);                  
                } else {
                    this.msgBox.showMessage("Failed",["Cannot get the Lab Vendor List, Please Try Later!"])
                    this.defaultVendor = new LabVendorsModel();
                }

            });

    }

    EditVendorAction($event) {
        console.log($event);
        this.actionName = "edit";
        this.selectedVendor = Object.assign({}, $event.Data);
        this.showAddUpdatePage = true;

    }

    AddNewVendor() {
        this.actionName = "add";
        this.selectedVendor = new LabVendorsModel();
        this.showAddUpdatePage = true;

    }

    OnVendorAddUpdateCallBack($event) {
        console.log($event);
        if ($event.action == "add") {
            this.changeDetector.detectChanges();            
            this.LoadAllLabVendors();
        }
        else if ($event.action == "edit") {
            this.changeDetector.detectChanges();            
            this.LoadAllLabVendors();
        }

        this.showAddUpdatePage = false;

        
    }

    OnVendorAddPopupClosed() {

        this.showAddUpdatePage = false;
        //alert("closed..");
    }

}