import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, Renderer2 } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMCategoryModel } from "../../shared/phrm-category.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "./phrm-category-manage.html"

})
export class PHRMCategoryManageComponent implements OnInit {
    public CurrentCategory: PHRMCategoryModel = new PHRMCategoryModel();
    public selectedItem: PHRMCategoryModel = new PHRMCategoryModel();
    public categoryList: Array<PHRMCategoryModel> = new Array<PHRMCategoryModel>();
    public categoryGridColumns: Array<any> = null;
    public showCategoryList: boolean = true;
    public showCategoryAddPage: boolean = false;
    public update: boolean = false;
    public index: number;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.


    // @Input("selectcategory")
    // public selectcategory: PHRMCategoryModel;
    // @Output("callback-add")
    // callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    // @Input("showAddPage")
    // public set value(val: boolean) {
    //   this.showCategoryAddPage = val;
    // }

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
        this.categoryGridColumns = PHRMGridColumns.PHRMCategoryList;
        this.getCategoryList();
    }

    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }
    public getCategoryList() {
        this.pharmacyBLService.GetCategoryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.categoryList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }

    CategoryGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showCategoryAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.CurrentCategory.CategoryId = this.selectedItem.CategoryId;
                this.CurrentCategory.CategoryName = this.selectedItem.CategoryName;
                this.CurrentCategory.Description = this.selectedItem.Description;
                this.CurrentCategory.IsActive = this.selectedItem.IsActive;
                this.showCategoryAddPage = true;

                break;
            }
            case "activateDeactivateIsActive": {
                if ($event.Data != null) {
                    this.selectedItem = null;
                    this.selectedItem = $event.Data;
                    this.ActivateDeactivateStatus(this.selectedItem);
                    this.selectedItem = null;
                }
                break;
            }
            default:
                break;
        }
    }

    AddCategory() {
        this.showCategoryAddPage = false;
        this.changeDetector.detectChanges();
        this.showCategoryAddPage = true;
        this.setFocusById('cat');
    }
    //to send sms
    sendSMS() {
        let text = 'Hello my friend';
        this.pharmacyBLService.sendSMS(text)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["SMS sent."]);

                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
                });
    }
    Add() {
        for (var i in this.CurrentCategory.CategoryValidator.controls) {
            this.CurrentCategory.CategoryValidator.controls[i].markAsDirty();
            this.CurrentCategory.CategoryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCategory.IsValidCheck(undefined, undefined)) {
            this.CurrentCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.pharmacyBLService.AddCategory(this.CurrentCategory)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Category Added."]);
                            this.CallBackAddUpdate(res)
                            this.CurrentCategory = new PHRMCategoryModel();
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
        for (var i in this.CurrentCategory.CategoryValidator.controls) {
            this.CurrentCategory.CategoryValidator.controls[i].markAsDirty();
            this.CurrentCategory.CategoryValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCategory.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateCategory(this.CurrentCategory)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Category Details Updated.']);
                            this.CallBackAddUpdate(res)
                            this.CurrentCategory = new PHRMCategoryModel();
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
        if (res.Status == "OK") {
            var category: any = {};
            category.CategoryId = res.Results.CategoryId;
            category.CategoryName = res.Results.CategoryName;
            category.Description = res.Results.Description;
            category.IsActive = res.Results.IsActive;
            this.getCategoryList();
            this.CallBackAdd(category);
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }

    CallBackAdd(categry: PHRMCategoryModel) {
        this.categoryList.push(categry);
        if (this.index != null)
            this.categoryList.splice(this.index, 1);
        this.categoryList = this.categoryList.slice();
        this.changeDetector.detectChanges();
        this.showCategoryAddPage = false;
        this.selectedItem = null;
        this.index = null;
    }
    ActivateDeactivateStatus(currCategory: PHRMCategoryModel) {
        if (currCategory != null) {
            let status = currCategory.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + currCategory.CategoryName + ' ?')) {
                currCategory.IsActive = status;
                this.pharmacyBLService.UpdateCategory(currCategory)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? "Category is now activated." : "Category is now Deactivated.";
                                this.msgBoxServ.showMessage("success", [responseMessage]);
                                this.getCategoryList();
                            }
                            else {
                                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                        });
            }
            //to refresh the checkbox if we cancel the prompt
            //this.getCategoryList();
        }
    }
    Close() {
        this.CurrentCategory = new PHRMCategoryModel();
        this.selectedItem = null;
        this.update = false;
        this.showCategoryAddPage = false;
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }

}