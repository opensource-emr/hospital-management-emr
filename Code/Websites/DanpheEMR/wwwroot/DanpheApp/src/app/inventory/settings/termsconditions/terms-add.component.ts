import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TermsConditionsMasterModel } from '../../shared/terms-conditions-master.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ENUM_TermsApplication } from '../../../shared/shared-enums';
import { Renderer2 } from '@angular/core';

@Component({
    selector: 'terms-add',
    templateUrl: './terms-add.html',
})

export class TermsAddComponent implements OnInit {

    public showTermPage: boolean = false;
    @Input("selected-list")
    public selectedTerms: TermsConditionsMasterModel;
    @Input("TermsApplicationId")
    public TermsApplicationId: number = ENUM_TermsApplication.Inventory;
    public update: boolean = false;
    public CurrentTermsModel: TermsConditionsMasterModel = new TermsConditionsMasterModel();
    public TermsModelLists: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();
    public loading: boolean = false;
    public globalListenFunc: Function;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public _http: HttpClient,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public renderer2: Renderer2) {

    }


    @Input("showAddPage")
    public set value(val: boolean) {
        this.showTermPage = val;
        if (this.selectedTerms && this.selectedTerms.Text != null) {
            this.update = true;
            this.CurrentTermsModel = Object.assign(this.CurrentTermsModel, this.selectedTerms);
        }
        else {
            this.update = false;
            this.CurrentTermsModel = new TermsConditionsMasterModel();
            this.changeDetector.detectChanges();
            this.setFocusById('shortname');
        }
    }

    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
    }
    Close() {
        this.selectedTerms = new TermsConditionsMasterModel();
        this.showTermPage = false;

    }

    AddTerms() {
        for (var i in this.CurrentTermsModel.TermsValidators.controls) {
            this.CurrentTermsModel.TermsValidators.controls[i].markAsDirty();
            this.CurrentTermsModel.TermsValidators.controls[i].updateValueAndValidity();
        }
        if (this.CurrentTermsModel.IsValidCheck(undefined, undefined)) {
            if (!this.CurrentTermsModel.Text) {
                this.msgBoxServ.showMessage('Error', ["Fill the text area"]);
                return;
            }
            this.loading = true;
            //this.CurrentTermsModel.TermsApplicationEnumId = this.TermsApplicationId;//needs revision..
            this.CurrentTermsModel.TermsApplicationEnumId = ENUM_TermsApplication.Inventory;
            var temp = _.omit(this.CurrentTermsModel, ['TermsValidators']);
            temp = JSON.stringify(temp);
            /*sanjit: 18May'20 : this component is used in both inventory and pharmacy and 
                there is no service that is shared by these two module,
                hence, I have written the api call directly here.*/
            this._http.post<any>("/api/InventorySettings?reqType=PostInventoryTerms", temp)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['added successfully']);
                            this.CurrentTermsModel = new TermsConditionsMasterModel();
                            this.CallBackAddTerms(res);
                            this.showTermPage = false;
                            this.loading = false;
                        }
                    },
                    err => {
                        // log.error(err);
                        this.loading = false;
                    });

        }
    }
    UpdateTerms() {
        for (var i in this.CurrentTermsModel.TermsValidators.controls) {
            this.CurrentTermsModel.TermsValidators.controls[i].markAsDirty();
            this.CurrentTermsModel.TermsValidators.controls[i].updateValueAndValidity();
        }
        if (this.CurrentTermsModel.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            if (this.CurrentTermsModel.CreatedOn)
                this.CurrentTermsModel.CreatedOn = moment(this.CurrentTermsModel.CreatedOn).format("YYYY-MM-DD HH:mm")
            var temp = _.omit(this.CurrentTermsModel, ['TermsValidators']);
            temp = JSON.stringify(temp);
            /*sanjit: 18May'20 : this component is used in both inventory and pharmacy and 
                there is no service that is shared by these two module,
                hence, I have written the api call directly here.*/
            this._http.put<any>("/api/InventorySettings?reqType=UpdateInventoryTerms", temp)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Updated successfully']);
                            this.CurrentTermsModel = new TermsConditionsMasterModel();
                            this.CallBackAddTerms(res);
                            this.showTermPage = false;
                            this.loading = false;
                        }
                    },
                    err => {
                        // log.error(err);
                        this.loading = false;
                    });

        }

    }
    CallBackAddTerms(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ terms: res.Results });
        }
        else {
            this.msgBoxServ.showMessage("error", ['Check log for details']);
            console.log(res.ErrorMessage);
        }
    }
    onChangeEditorData(data) {
        this.CurrentTermsModel.Text = data;
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}