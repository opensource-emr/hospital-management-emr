import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { ImagingType } from '../../../radiology/shared/imaging-type.model';
import { SecurityService } from '../../../security/shared/security.service';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: "img-type-add",
    templateUrl: "./imaging-type-add.html",
    host: { '(window:keyup)': 'hotkeys($event)' }
})

export class ImagingTypeAddComponent {
    public CurrentImagingType: ImagingType = new ImagingType();

    public showAddPage: boolean = false;
    @Input("selectedImgType")
    public selectedImgType: ImagingType;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedImgType) {
            this.update = true;
            this.CurrentImagingType = Object.assign(this.CurrentImagingType, this.selectedImgType);
            this.CurrentImagingType.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        else {
            this.CurrentImagingType = new ImagingType();
            this.CurrentImagingType.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

            this.update = false;
        }
    }
    AddImagingType(): void {

        //marking every fields as dirty and checking validity
        for (var i in this.CurrentImagingType.ImagingTypeValidator.controls) {
            this.CurrentImagingType.ImagingTypeValidator.controls[i].markAsDirty();
            this.CurrentImagingType.ImagingTypeValidator.controls[i].updateValueAndValidity();
        }
        //if valid then call the BL service to do post request.
        if (this.CurrentImagingType.IsValidCheck(undefined, undefined) == true) {

            this.settingsBLService.AddImagingType(this.CurrentImagingType)
                .subscribe(res => {
                    this.showMessageBox("Success", "Item Added");
                    this.CallBackAddUpdate(res);

                },
                err => this.logError(err));
        }
    }
    UpdateImagingType(): void {

        //marking every fields as dirty and checking validity
        for (var i in this.CurrentImagingType.ImagingTypeValidator.controls) {
            this.CurrentImagingType.ImagingTypeValidator.controls[i].markAsDirty();
            this.CurrentImagingType.ImagingTypeValidator.controls[i].updateValueAndValidity();
        }
        //if valid then call the BL service to do post request.
        if (this.CurrentImagingType.IsValidCheck(undefined, undefined) == true) {

            this.settingsBLService.UpdateImagingType(this.CurrentImagingType)
                .subscribe(res => {
                    this.showMessageBox("Success", "Item Updated");
                    this.CallBackAddUpdate(res);

                },
                err => this.logError(err));
        }
    }
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ imgType: res.Results });
        }
        else {
            this.showMessageBox("Error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }

    logError(err: any) {
        console.log(err);
    }
    Close() {
        this.selectedImgType = null;
        this.update = false;
        this.showAddPage = false;
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }
    FocusElementById(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
      hotkeys(event){
          if(event.keyCode==27){
              this.Close()
          }
      }
}
