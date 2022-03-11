import { Component, ChangeDetectorRef } from '@angular/core';
//import LabGridColumnSettings from '../../../shared/lab-gridcol-settings';
//import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { LabVendorsModel } from './lab-vendors.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabSettingsBLService } from '../../lab-settings/shared/lab-settings.bl.service';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { SecurityService } from '../../../security/shared/security.service';
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
    public selectedActivateDeactivate: LabVendorsModel = null;
    public selectedItem: LabVendorsModel = null;
    public labGridCols: LabGridColumnSettings = null;

    constructor(public msgBox: MessageboxService,
        public labSettingBlService: LabSettingsBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService) {
            
            this.labGridCols = new LabGridColumnSettings(this.securityService);
        this.vendorGridCols = this.labGridCols.LabVendorsListColumns;
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
        // console.log($event);
        // this.actionName = "edit";
        
        switch ($event.Action) {
            case "edit": {
                this.selectedVendor = Object.assign({}, $event.Data);
                this.showAddUpdatePage = true;
                break;
            }
            case "activateDeactivateLabTest": {
                if ($event.Data != null) {
                    this.selectedActivateDeactivate = null;
                    this.selectedActivateDeactivate = $event.Data;
                    this.ActivateDeactivateLabVendorStatus(this.selectedActivateDeactivate);
                    this.selectedItem = null;
                }
                break;

            }
            default:
                break;
        }
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


     //Anjana: 15 Feb:2021; Update IsActive status of Lab Vendors- Activate or Deactivate
     ActivateDeactivateLabVendorStatus(vendor: LabVendorsModel) {
        if (vendor != null) {
            let status = vendor.IsActive == true ? false : true;

            if (status == true) {
                vendor.IsActive = status;
                this.ChangeActiveStatus(vendor);
            } else {
                if (confirm("Are you Sure want to Deactivate " + vendor.VendorName + ' ?')) {

                    vendor.IsActive = status;
                    //we want to update the ISActive property in table there for this call is necessry
                    this.ChangeActiveStatus(vendor);
                }
            }
        }

    }

    ChangeActiveStatus(vendor) {
        this.labSettingBlService.DeactivateVendor(vendor)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        let responseMessage = res.Results.IsActive ? "Vendor is now activated." : "Vendor is now deactivated.";
                        this.msgBox.showMessage("success", [responseMessage]);
                        //This for send to callbackadd function to update data in list
                        this.LoadAllLabVendors();
                    }
                    else {
                        this.msgBox.showMessage("error", ['Something went wrong' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBox.showMessage("success", [err]);
                });

    }

}