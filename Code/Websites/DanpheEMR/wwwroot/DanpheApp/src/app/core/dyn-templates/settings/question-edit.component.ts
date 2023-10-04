import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core"
import { Option, Question } from "../shared/dnamic-template-models";
import { DynamicTemplateService } from "../shared/dynamic-template-service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import * as _ from 'lodash';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
    selector: "qtn-edit",
    templateUrl: "./question-edit.html"
})

export class QuestionEditComponent {


    public qtnToUpdate: Question = null;
    public options: Array<Option> = null;
    public newQtnType = "text";//default question type.

    public qtnOld: Question;

    constructor(public dynTemplateServ: DynamicTemplateService, public dlService: DLService
        , public msgBoxServ: MessageboxService) {

    }




    ngOnInit() {
        this.qtnOld = new Question();
        this.qtnToUpdate = this.dynTemplateServ.qtnContainer;  //JSON.parse(JSON.stringify(this.dynTemplateServ.qtnContainer));

        this.qtnOld.Text = this.qtnToUpdate.Text;
        this.qtnOld.Type = this.qtnToUpdate.Type;

        if (this.qtnToUpdate.Options && this.qtnToUpdate.Options.length > 0) {
            this.qtnOld.Options = new Array<Option>();
            this.qtnToUpdate.Options.forEach(opt => {
                this.qtnOld.Options.push(this.GetOptionClone(opt));
            });
        }

        this.options = this.qtnToUpdate.Options;
        this.newQtnType = this.qtnToUpdate.Type;
    }

    //If radio is being changed to text: disable all options
    //if text is being changed to radio and if it doesn't already have options, add one option to the list.
    QuestionTypeOnChange() {
        if (this.qtnToUpdate.Type == "radio" || this.qtnToUpdate.Type == "checkbox" || this.qtnToUpdate.Type == "dropdown") {
            if (this.qtnToUpdate.Options == null || this.qtnToUpdate.Options.length == 0) {
                this.qtnToUpdate.Options = new Array<Option>();
                this.AddNewAnswer(0);
            }
        }
        else {
            //for radio buttons, show-childs is enabled from the option's property.
            this.qtnToUpdate.ShowChilds = true;

            if (this.qtnToUpdate.Options && this.qtnToUpdate.Options.length > 0) {
                this.qtnToUpdate.Options.forEach(opt => {
                    opt.EntityState = "deleted";
                    opt.IsActive = false;
                });
            }
        }
    }


    OnAnswerTextChange(ans: Option) {
        if (ans.EntityState != "added") {
            ans.EntityState = "modified";
        }
    }

    UpdateQuestion() {
        if (this.qtnToUpdate && this.qtnToUpdate.Text) {

            if (this.dynTemplateServ.IsValidOptions(this.qtnToUpdate.Type, this.qtnToUpdate.Options)) {

                let url = "/api/DynTemplates?reqType=updateQtn";

                let data = JSON.stringify(this.qtnToUpdate);
                this.dlService.Update(data, url).map(res => res).subscribe(res => {
                    if (res.Status == "OK") {
                        this.dynTemplateServ.qtnContainer = res.Results;
                        this.qtnToUpdate = res.Results;
                        this.msgBoxServ.showMessage("success", ["question updated successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["update failed. Please try again later."]);
                    }
                },
                    err => {
                        this.msgBoxServ.showMessage("failed", ["update failed. Please try again later."]);

                    });

                this.dynTemplateServ.ShowEditQtn = false;
            }
            else {
                this.msgBoxServ.showMessage("failed", ["some option(s) are either duplicate or empty"]);
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Question text is empty"]);
            //alert("Question cannot be empty.");
        }
    }

    AddNewAnswer(indx: number) {
        //let newAns = new OptionVM();
        //this.qtnToUpdate.Options.push(newAns);
        //STRANGE ISSUE: above will set option as selected, and below works properly, both addition are exactly same.
        //entitystate for new option is added.
        this.qtnToUpdate.Options.push({ OptionId: 0, Text: "", IsDefault: false, IsSelected: false, ShowChildOnSelect: false, EntityState: "added", QuestionId: this.qtnToUpdate.QuestionId, IsActive: true });
    }

    DeleteAnswer(index) {
        if (this.qtnToUpdate.Options.length > 1) {
            let optToDel = this.qtnToUpdate.Options[index];
            //delete the row if it is newly added.
            //else just change the state to deleted, so that user can undo it if needed.
            if (optToDel.EntityState == "added") {
                this.qtnToUpdate.Options.splice(index, 1);
            }
            else {
                this.qtnToUpdate.Options[index].EntityState = "deleted";
                this.qtnToUpdate.Options[index].IsActive = false;
            }
        }
    }


    CancelUpdate() {
        this.qtnToUpdate.Text = this.qtnOld.Text;
        this.qtnToUpdate.Type = this.qtnOld.Type;
        if (this.qtnOld.Options && this.qtnOld.Options.length > 0) {
            this.qtnToUpdate.Options = new Array<Option>();
            this.qtnOld.Options.forEach(opt => {
                this.qtnToUpdate.Options.push(opt);
            });
        }
        this.dynTemplateServ.ShowEditQtn = false;
    }

    UndoDeleteAnswer(index) {
        let optToDel = this.qtnToUpdate.Options[index];
        optToDel.EntityState = "unchanged";
        optToDel.IsActive = true;
    }



    //creates the Clone of given Option object.
    //doesn't change the innput variable.
    GetOptionClone(opt: Option): Option {
        let retVal: Option = new Option();
        retVal.EntityState = opt.EntityState;
        retVal.OptionId = opt.OptionId;
        retVal.IsActive = opt.IsActive;
        retVal.Text = opt.Text;
        retVal.IsDefault = opt.IsDefault;
        retVal.ShowChildOnSelect = opt.ShowChildOnSelect;
        retVal.QuestionId = opt.QuestionId;
        retVal.IsSelected = opt.IsSelected;
        return retVal;
    }





}