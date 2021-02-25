import { Component, Input, Output, EventEmitter } from "@angular/core";

//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../../security/shared/security.service";
import { FractionPercentModel } from "../../shared/fraction-percent.model";
import { FractionPercentService } from "../../shared/Fraction-Percent.service";
import { CoreService } from "../../../core/shared/core.service";
import { Department } from "../../../settings-new/shared/department.model";
import { FractionPercentViewModel } from "../../shared/fractionpercent.viewmodel";


@Component({
    selector: "FractionPercent-add",
    templateUrl: "./fraction-percent-add.html",
})
export class FractionPercentAddComponent {

    @Input("FractionPercent")
    public dataFromGrid: FractionPercentViewModel;
    public showAddPage: boolean = false;
    public loading: boolean= false;
    CurrentFractionPercent = new FractionPercentModel();

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    
    @Output("close-popup")
    closePopUp: EventEmitter<Object> = new EventEmitter<Object>();
    constructor(public FractionPercentService: FractionPercentService, public securityService: SecurityService,
        public coreService: CoreService,
        public msgBoxServ: MessageboxService) {
    }

    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
          
                let FractionPercent = new FractionPercentViewModel();
                this.dataFromGrid = Object.assign(FractionPercent, this.dataFromGrid);
            }
        
        
    }
    MapToFractionPercent() {
        if (this.dataFromGrid != null) {
            if (this.dataFromGrid.PercentSettingId != null || this.dataFromGrid.PercentSettingId > 0) {
                this.CurrentFractionPercent.PercentSettingId = this.dataFromGrid.PercentSettingId;
            }
            this.CurrentFractionPercent.BillItemPriceId = this.dataFromGrid.BillItemPriceId;
            this.CurrentFractionPercent.HospitalPercent = this.dataFromGrid.HospitalPercent;
            this.CurrentFractionPercent.DoctorPercent = this.dataFromGrid.DoctorPercent;
            this.CurrentFractionPercent.Description = this.dataFromGrid.Description;
            this.CurrentFractionPercent.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss"); 
            this.CurrentFractionPercent.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
    }
    //adding new FractionPercent
    AddFractionPercent() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.dataFromGrid.FractionPercentValidator.controls) {
            this.dataFromGrid.FractionPercentValidator.controls[i].markAsDirty();
            this.dataFromGrid.FractionPercentValidator.controls[i].updateValueAndValidity();
        }

        if (this.dataFromGrid.IsValid(undefined, undefined)) {
            if(!this.loading){
                this.loading=true;
                var result = this.dataFromGrid.HospitalPercent + this.dataFromGrid.DoctorPercent;
                if (result > 100 || result < 0 || result!=100) {
                    this.showMessageBox("warning", "The sum of hospital and doctor percent is less than or more than 100");
                    this.loading=false;
                    return;
                }
    
                this.MapToFractionPercent();
                if (this.dataFromGrid.PercentSettingId == null || this.dataFromGrid.PercentSettingId == 0) {
                    this.FractionPercentService.AddFractionPercent(this.CurrentFractionPercent)
                        .subscribe(
                            res => { 
                                this.showMessageBox("success", "Fraction Percent Added successfully");
                                this.showAddPage = false;
                                this.CurrentFractionPercent = new FractionPercentModel();
                                this.dataFromGrid = new FractionPercentViewModel();
                                this.callbackAdd.emit({ 'newFractionPercent': res.Results });
                                this.loading= false;
    
                            },
                            err => {
                                this.logError(err);
                                this.loading= false;
                            });
                }
                else {
                    
                    this.FractionPercentService.UpdateFractionPercent(this.CurrentFractionPercent.PercentSettingId, this.CurrentFractionPercent)
                        .subscribe(
                            res => {
                                this.showMessageBox("success", "Fraction Percent updated successfully");
                                this.showAddPage = false;
                                this.CurrentFractionPercent = new FractionPercentModel();
                                this.dataFromGrid = new FractionPercentViewModel();
                                this.callbackAdd.emit({ 'newFractionPercent': res.Results });
                                this.loading= false;
    
    
                            },
                            err => {
                                this.logError(err);
                                this.loading= false;
                            });
                }
            }
           
        }



    }

    Close() {
        this.closePopUp.emit();
        this.showAddPage = false;
        this.loading= false;
    }

    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any) {
        console.log(err);
    }

}
