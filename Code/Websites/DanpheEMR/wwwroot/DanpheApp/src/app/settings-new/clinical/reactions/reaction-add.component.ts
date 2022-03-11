import { Component, Input, Output, EventEmitter, ChangeDetectorRef,Renderer2 } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { Reaction } from "../../shared/reaction.model";
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: "reaction-add",
    templateUrl: "./reaction-add.html"
})

export class ReactionAddComponent {

    public showAddPage: boolean = false;

    public completeReactionList: Array<Reaction> = new Array<Reaction>();
    public reactionList: Array<Reaction> = new Array<Reaction>();
    public update: boolean = false;

    public CurrentReaction: Reaction = new Reaction(); 


    @Input("rxnSelected")
    public rxnSelected: Reaction;

    @Output("callback-Add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>(); 
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public renderer: Renderer2) {
        this.GetReactions();
        this.SetFocusById('ReactionName'); 
        this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
              this.Close();
            }
          });   
        }
        globalListenFunc: Function;

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.rxnSelected) {
            this.update = true;
            this.CurrentReaction = Object.assign(this.CurrentReaction, this.rxnSelected);
            this.CurrentReaction.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.reactionList = this.reactionList.filter(rxn => (rxn.ReactionId != this.rxnSelected.ReactionId));
        }
        else {
            this.CurrentReaction = new Reaction();
            this.CurrentReaction.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
        this.SetFocusById('ReactionName'); 
    }

    public GetReactions() {
        this.settingsBLService.GetReactions()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.reactionList = res.Results;
                        this.completeReactionList = this.reactionList;
                    }
                }
                else {
                    this.showMessageBox("error", "Check log for error message.");
                    this.logError(res.ErrorMessage);
                }
            },
                err => {
                    this.showMessageBox("error", "Failed to get Reactions. Check log for error message.");
                    this.logError(err.ErrorMessage);
                });
    }

    AddReaction() {       
        for (var i in this.CurrentReaction.ReactionValidator.controls) {
            this.CurrentReaction.ReactionValidator.controls[i].markAsDirty();
            this.CurrentReaction.ReactionValidator.controls[i].updateValueAndValidity();
            this.SetFocusById('ReactionName'); 
        }

        if (this.CurrentReaction.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddReaction(this.CurrentReaction)
                .subscribe(res => {
                        if (res.Status == 'OK') {
                            this.showMessageBox("Success", "Reaction Added");
                            this.CurrentReaction = new Reaction();
                            this.CallBackAddReaction(res);
                    } else {
                            this.showMessageBox("error", res.ErrorMessage);
                            this.logError(res.ErrorMessage);
                            this.SetFocusById('ReactionName'); 
                        }
                       
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentReaction.ReactionValidator.controls) {
            this.CurrentReaction.ReactionValidator.controls[i].markAsDirty();
            this.CurrentReaction.ReactionValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentReaction.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateReaction(this.CurrentReaction)
                .subscribe(
                res => {
                    if (res.Status == 'OK') {
                        this.showMessageBox("success", "Reaction Updated");
                        this.CurrentReaction = new Reaction();
                        this.CallBackAddReaction(res)
                    }
                    else {
                        this.showMessageBox("error", res.ErrorMessage);
                        this.logError(res.ErrorMessage);
                        this.SetFocusById('ReactionName'); 
                    }

                    },
                    err => {
                        this.logError(err);
                    });
        }
    }


    CallBackAddReaction(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ reaction: res.Results });
        }
        else {
            this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }


    Close() {
        this.rxnSelected = null;
        this.update = false;
        this.reactionList = this.completeReactionList;
        this.showAddPage = false;
    }

    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any) {
        console.log(err);
    }
    public SetFocusById(id: string) {
        window.setTimeout(function () {
            let elementToBeFocused = document.getElementById(id);
            if (elementToBeFocused) {
                elementToBeFocused.focus();
            }
        }, 600);
    }
    AddUpdateEnterKey() {
        if (this.update==false)
          this.SetFocusById('addReaction');
        else {
          this.SetFocusById('updateReaction');
        }
      }
}
