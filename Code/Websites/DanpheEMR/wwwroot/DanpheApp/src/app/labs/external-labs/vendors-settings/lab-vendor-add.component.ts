import { Component, Input, Output, EventEmitter } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabVendorsModel } from './lab-vendors.model';
import { LabSettingsBLService } from '../../lab-settings/shared/lab-settings.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';


@Component({
  selector: 'lab-vendor-add',
  templateUrl: "./lab-vendor-add.html",
  styles: [`
        .managetxt label{line-height: 2;}
textarea{resize: none;}
      `]
})

export class LabVendorAddComponent {

  @Input("selectedVendor")
  selectedVendor = null;

  @Input("defaultVendor")
  defaultVendor = null;

  @Input("action-name")
  actionName = "add";


  @Output("on-save")
  onSave: EventEmitter<object> = new EventEmitter<object>();

  @Output("on-close")
  onPopupClose: EventEmitter<object> = new EventEmitter<object>();

  newVendor: LabVendorsModel = new LabVendorsModel();
  constructor(public msgBox: MessageboxService, public labSettingBLService: LabSettingsBLService, public securityService: SecurityService) {


  }

  ngOnInit() {
    if (this.actionName == "add") {
      this.newVendor = new LabVendorsModel();
    }
    else
      this.newVendor = this.selectedVendor;

  }

  OnClose() {
    this.onPopupClose.emit({});
  }

  public ValidateAndAddUpdateVendor() {
    //if there is default vendor   
    if (this.defaultVendor) {
      //current vendor should not be default
      if (this.newVendor.IsDefault) {
        var change: boolean;
        change = window.confirm('You are changing the Default vendor, do you want to continue ?');
        if (change) {
          this.AddUpdateVendor();
        }
      } else {
        this.AddUpdateVendor();
      }
    }
    else
    //if there is no default vendor
    {
      this.AddUpdateVendor();
    }

  }

  public AddUpdateVendor() {
    if (this.actionName == "add") {
      this.newVendor.CreatedBy = this.securityService.loggedInUser.EmployeeId;
      this.newVendor.CreatedOn = moment().format("YYYY-MM-DD hh:mm:ss");

      if (this.newVendor.VendorName && this.newVendor.VendorName.trim() != '') {
        this.labSettingBLService.AddLabVendor(this.newVendor)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.msgBox.showMessage('Success', ['Success,' + res.Results.VendorName + ' added successfully.'])
              let vendorFromServer = res.Results;
              this.onSave.emit({ action: 'add', data: vendorFromServer });
            }
            else {
              console.log("Couldn't Add new vendor. Error:" + res.ErrorMessage);
              this.msgBox.showMessage('Failed', ['Sorry, Could not Add Vendor !'])
            }

          });
      }
      else {
        this.msgBox.showMessage('Failed', ['Please enter the vendor Name !']);
      }

    }
    else if (this.actionName == "edit") {
      if (this.newVendor.VendorName && this.newVendor.VendorName.trim() != '') {
        this.labSettingBLService.UpdateLabVendor(this.newVendor)
          .subscribe((res: DanpheHTTPResponse) => {

            if (res.Status == "OK") {
              this.msgBox.showMessage('Success', ['Success,' + res.Results.VendorName + ' Updated successfully.'])
              let vendorFromServer = res.Results;
              this.onSave.emit({ action: 'edit', data: vendorFromServer });
            }
            else {
              this.msgBox.showMessage('Failed', ['Sorry, Could not Update this Vendor !']);
              console.log("Couldn't update the vendor. Error:" + res.ErrorMessage);
            }

          });
      } else {
        this.msgBox.showMessage('Failed', ['Please enter the vendor Name !']);
      }
    }

  }

}
