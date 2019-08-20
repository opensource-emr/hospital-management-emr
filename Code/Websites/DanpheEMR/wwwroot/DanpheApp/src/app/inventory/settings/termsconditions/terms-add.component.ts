import { Component, ChangeDetectorRef,Input,Output,EventEmitter } from '@angular/core';
import { TermsConditionsMasterModel } from '../../shared/terms-conditions-master.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';

@Component({
    selector: 'terms-add',
    templateUrl: './terms-add.html',
})

export class TermsAddComponent {

    public showTermPage: boolean = false;
    @Input("selected-list")
    public selectedTerms: TermsConditionsMasterModel;
    public update: boolean = false;
    public CurrentTermsModel: TermsConditionsMasterModel = new TermsConditionsMasterModel();
    public TermsModelLists: Array<TermsConditionsMasterModel> = new Array<TermsConditionsMasterModel>();

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public invSettingBL: InventorySettingBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService
    ) {
       
    }

    
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showTermPage = val;
        if (this.selectedTerms && this.selectedTerms.Text!=null) {
            this.update = true;
            this.CurrentTermsModel = Object.assign(this.CurrentTermsModel, this.selectedTerms);
        }
        else {
            this.update = false;
            this.CurrentTermsModel = new TermsConditionsMasterModel();
            this.changeDetector.detectChanges();
           
            
        }
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
            this.invSettingBL.AddTerms(this.CurrentTermsModel)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['added successfully']);
                            this.CurrentTermsModel = new TermsConditionsMasterModel();
                            this.CallBackAddTerms(res);
                            this.showTermPage = false;
                        }
                    },
                    err => {
                       // log.error(err);
                    });

        }
    }

    UpdateTerms() {
        for (var i in this.CurrentTermsModel.TermsValidators.controls) {
            this.CurrentTermsModel.TermsValidators.controls[i].markAsDirty();
            this.CurrentTermsModel.TermsValidators.controls[i].updateValueAndValidity();
        }
        if (this.CurrentTermsModel.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.UpdateTerms(this.CurrentTermsModel)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Updated successfully']);
                            this.CurrentTermsModel = new TermsConditionsMasterModel();
                            this.CallBackAddTerms(res);
                            this.showTermPage = false;
                        }
                    },
                    err => {
                       // log.error(err);
                    });

        }

    }
    CallBackAddTerms(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ terms : res.Results });
        }
        else {
            this.msgBoxServ.showMessage("error", ['Check log for details']);
            console.log(res.ErrorMessage);
        }
    }
}