import { Component, ChangeDetectorRef, Input, Output, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { PHRMItemTypeModel } from "../../shared/phrm-item-type.model";
import { PHRMCategoryModel } from "../../shared/phrm-category.model"
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { PHRMPackingTypeModel } from "../../shared/phrm-packing-type.model";
import { EventEmitter } from "@angular/core";

@Component({
    selector: "packingtype-add",
    templateUrl: "./phrm-packing-type-add.html"

})

export class PHRMPackingTypeAddComponent implements OnInit {



    public CurrentPackingType: PHRMPackingTypeModel = new PHRMPackingTypeModel();
    @Input("selectedPacking")
    public selectedPacking: PHRMPackingTypeModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public packingtypeList: Array<PHRMPackingTypeModel> = new Array<PHRMPackingTypeModel>();
    public categoryList: Array<PHRMCategoryModel> = new Array<PHRMCategoryModel>();
    public packingtypeGridColumns: Array<any> = null;
    public showPackingTypeAddPage: boolean = false;
    public update: boolean = false;
    public index: number = -1;
    public showAddPage: boolean;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;   //to close the window on click of ESCape.
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
        this.GetPackingTypeList();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showPackingTypeAddPage = val;
        if (this.selectedPacking) {
            this.update = true;
            this.CurrentPackingType = Object.assign(this.CurrentPackingType, this.selectedPacking);
            this.CurrentPackingType.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentPackingType.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.setFocusById('packing');
        }
        else {

            this.CurrentPackingType = new PHRMPackingTypeModel();
            this.CurrentPackingType.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;

        }
    }
    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }
    AddPackingType() {
        this.update = false;
        this.showPackingTypeAddPage = false;
        this.changeDetector.detectChanges();
        this.showPackingTypeAddPage = true;
        this.setFocusById('packing');
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

    Add() {
        for (var i in this.CurrentPackingType.PackingTypeValidator.controls) {
            this.CurrentPackingType.PackingTypeValidator.controls[i].markAsDirty();
            this.CurrentPackingType.PackingTypeValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentPackingType.IsValidCheck(undefined, undefined)) {
            this.CurrentPackingType.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.pharmacyBLService.AddPackingType(this.CurrentPackingType)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Packing Type Added."]);
                            this.CallBackAddUpdate(res)
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
                    });
        }
    }

    Update() {
        for (var i in this.CurrentPackingType.PackingTypeValidator.controls) {
            this.CurrentPackingType.PackingTypeValidator.controls[i].markAsDirty();
            this.CurrentPackingType.PackingTypeValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentPackingType.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdatePackingType(this.CurrentPackingType)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Packing Type Details Updated.']);
                            this.CallBackAddUpdate(res)
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                    });
        }
    }

    CallBackAddUpdate(res) {
        var packingtype: PHRMPackingTypeModel = new PHRMPackingTypeModel();
        packingtype.PackingTypeId = res.Results.PackingTypeId;
        packingtype.PackingName = res.Results.PackingName;
        packingtype.PackingQuantity = res.Results.PackingQuantity;
        packingtype.IsActive = res.Results.IsActive;
        this.AddUpdateResponseEmitter(packingtype);
        this.CurrentPackingType = new PHRMPackingTypeModel();
        this.showAddPage = false;
        this.showPackingTypeAddPage = false;
    }
    Close() {
        this.CurrentPackingType = new PHRMPackingTypeModel();
        this.update = false;
        this.showPackingTypeAddPage = false;
    }
    AddUpdateResponseEmitter(packingType) {
        this.callbackAdd.emit({ packingType: packingType });
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}
