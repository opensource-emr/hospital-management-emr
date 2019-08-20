import { Component, Input, Output, EventEmitter } from "@angular/core";

//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../../security/shared/security.service";
import { DesignationModel } from "../../shared/designation.model";
import { DesignationService } from "../../shared/Designation.service";


@Component({
    selector: "designation-add",
    templateUrl: "./Designation-add.html",
})
export class DesignationAddComponent {

    @Input("designation")
    public CurrentDesignation: DesignationModel;
    public showAddPage: boolean = false;
    public loading: boolean= false;
    @Output("close-popUp")
        closePopUp: EventEmitter<Object> = new EventEmitter<Object>();
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public DesignationService: DesignationService, public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
    }

    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
            if (this.CurrentDesignation && this.CurrentDesignation.DesignationId) {
                let Designation = new DesignationModel();
                this.CurrentDesignation = Object.assign(Designation, this.CurrentDesignation);
            }
            else {
                this.CurrentDesignation = new DesignationModel();
            }
        }

    }

    //adding new Designation
    AddDesignation() {
        //for checking validations, marking all the fields as dirty and checking the validity.
            for (var i in this.CurrentDesignation.DesignationValidator.controls) {
                this.CurrentDesignation.DesignationValidator.controls[i].markAsDirty();
                this.CurrentDesignation.DesignationValidator.controls[i].updateValueAndValidity();
            }
    
            if (this.CurrentDesignation.IsValid(undefined, undefined)) {
                if(!this.loading){
                    this.loading= true;
                    this.CurrentDesignation.CreatedDate = moment().format("YYYY-MM-DD HH:mm:ss");
                    this.CurrentDesignation.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    this.DesignationService.AddDesignation(this.CurrentDesignation)
                        .subscribe(
                            res => {
                                this.showMessageBox("success", "Designation Added successfully");
                                this.CurrentDesignation = new DesignationModel();
                                this.callbackAdd.emit({ 'newDesignation': res.Results });
                                this.loading= false;
                            },
                            err => {
                                this.logError(err);
                                this.loading= false;
                            });
                }
          else{
              this.loading= false;
          }
            }
      
    }

    //updating Designation
    UpdateDesignation() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentDesignation.DesignationValidator.controls) {
            this.CurrentDesignation.DesignationValidator.controls[i].markAsDirty();
            this.CurrentDesignation.DesignationValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentDesignation.IsValid(undefined, undefined)) {
            if(!this.loading){
                this.loading= true;
                this.DesignationService.UpdateDesignation(this.CurrentDesignation.DesignationId, this.CurrentDesignation)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Designation Updated successfully");
                        this.showAddPage = false;
                        //this.CurrentDesignation = new PhrmDesignationModel();
                        this.callbackAdd.emit({ 'newDesignation': res.Results });
                        this.loading= false;
                    },
                    err => {
                        this.logError(err);
                        this.loading= false;
                    });
            }
           else{
               this.loading= false;
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