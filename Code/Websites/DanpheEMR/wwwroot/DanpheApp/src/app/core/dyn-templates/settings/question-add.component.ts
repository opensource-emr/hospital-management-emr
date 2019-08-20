import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core"
import { Option, Question } from "../shared/dnamic-template-models";
import { DynamicTemplateService } from "../shared/dynamic-template-service";
import { DLService } from "../../../shared/dl.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
    selector: "qtn-add",
    templateUrl: "./question-add.html"
})

export class QuestionAddComponent {

    public newQuestion: Question = null;
    public newAnswers: Array<Option> = null;

    //new question could be added either to question or questionnaire.
    public qtnContainer: any;

    @Output()
    qtnOnSave = new EventEmitter();
    //this is for frequently used options, implemented only for radio buttons for now.
    //public freqUsed_YN = false;//Y_N is yes/No

    public newQtnType = "text";//default question type.

    constructor(public dynTemplateServ: DynamicTemplateService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.newQuestion = new Question();

    }

    ngOnInit() {
        this.qtnContainer = this.dynTemplateServ.qtnContainer;
    }

    QuestionTypeOnChange() {
        if (this.newQtnType != "text") {
            this.newAnswers = new Array<Option>();
            let newOpt = new Option();
            this.newAnswers.push(newOpt);
        }
        else {
            this.newAnswers = null;
        }
    }

    AddNewQuestion() {
        if (this.newQuestion && this.newQuestion.Text) {
            if (this.dynTemplateServ.IsValidOptions(this.newQtnType, this.newAnswers)) {
                let newQtn = new Question();
                newQtn.Text = this.newQuestion.Text;
                newQtn.Type = this.newQtnType;
                //add option is avaliable only for type = 'radio' for now.
                if ((newQtn.Type == "radio" || newQtn.Type == "checkbox" || newQtn.Type == "dropdown")
                    && this.newAnswers && this.newAnswers.length > 0) {
                    this.newAnswers.forEach(a => {
                        let newans = this.GetDynamicAnswer(newQtn, a.Text, false);
                        newQtn.Options.push(newans);
                    });
                }
                //for radio buttons, show-childs is enabled from the option's property.
                if (newQtn.Type == "text" || newQtn.Type == "label") {
                    newQtn.ShowChilds = true;
                }

                //these two properties are present in both qtn and qnair classes.
                newQtn.TemplateId = this.qtnContainer.TemplateId;
                newQtn.QnairId = this.qtnContainer.QnairId;

                //add childquestion array if it doesn't have any
                if (!this.qtnContainer.ChildQuestions) {
                    this.qtnContainer.ChildQuestions = new Array<Question>();
                }

                if (this.dynTemplateServ.qtnContainerType == 'qtn') {
                    newQtn.ParentQtnId = this.qtnContainer.QuestionId;
                    newQtn.QtnHRCLevel = this.qtnContainer.QtnHRCLevel + 1;
                }


                //console.log("service message: question added successfully !")
                let url = "/api/DynTemplates?reqType=addQuestion";
                let data = JSON.stringify(newQtn);
                this.dlService.Add(data, url).map(res => res).subscribe(res => {
                    if (res.Status == "OK") {
                        newQtn.QuestionId = res.Results.QuestionId;//questionid comes as return value of add qtn.
                        this.qtnContainer.ChildQuestions.push(newQtn);
                        this.dynTemplateServ.ShowAddQtn = false;
                        this.msgBoxServ.showMessage("success", ["Question added successfully"]);
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Couldn't add question. Pls try again later."]);
                    }
                    this.newQuestion = null;
                    this.newAnswers = null;
                    this.dynTemplateServ.ShowAddQtn = false;
                });
            }
            else {
                this.msgBoxServ.showMessage("failed", ["some option(s) are either duplicate or empty"]);
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Question text is empty"]);
        }
    }

    AddNewAnswer(text: string) {
        let newAns = new Option();
        if (text) {
            newAns.Text = text;
        }
        this.newAnswers.push(newAns);
    }

    DeleteAnswer(index) {
        if (this.newAnswers.length > 1)
            this.newAnswers.splice(index, 1);
    }

    //temporary method to return a new answer
    public GetDynamicAnswer(qtn: Question, ansText: string, showChild = false): Option {
        let retAns = new Option();
        retAns.OptionId = 0;
        retAns.QuestionId = 0;
        retAns.Text = ansText;
        retAns.IsDefault = false;
        retAns.EntityState = "added";
        retAns.ShowChildOnSelect = showChild;
        return retAns;
    }

    //add Yes/No Options on click.
    AddFreqUsed_YN() {
        //replace first options text by 'Yes' if it's empty'
        if (this.newAnswers.length > 0 && !this.newAnswers[0].Text) {
            this.newAnswers[0].Text = "Yes";
        }
        else {
            this.AddNewAnswer('Yes');
        }
        this.AddNewAnswer('No');

    }

    //IsValidOptions(): boolean {
    //    //applying only for radiobutton for now, textbox doesn't have any options so return true.'
    //    if (this.newQtnType != "radio") {
    //        return true;
    //    }
    //    else {


    //        let hasEmptyOpts = this.newAnswers.find(o => o.Text == null || o.Text.trim() == "");
    //        if (hasEmptyOpts) {
    //            return false;
    //        }

    //        let ansTxtArr = this.newAnswers.map(a => a.Text);
    //        //if array has duplicate options then it's Invalid
    //        let hasDuplicate = CommonFunctions.HasDuplicatesInArray(ansTxtArr);
    //        if (hasDuplicate) {
    //            return false;
    //        }
    //        //finally return true if it passes above conditions.
    //        return true;
    //    }
    //}

}