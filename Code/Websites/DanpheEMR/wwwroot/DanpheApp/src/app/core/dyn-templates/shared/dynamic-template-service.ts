import { Injectable, Directive } from '@angular/core';
import { Question, Template, SelectedAnswer, Option } from "./dnamic-template-models";
import { DLService } from "../../../shared/dl.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { VisitSummaryModel } from '../../../doctors/visit/visit-summary.model';


@Injectable()
export class DynamicTemplateService {

    //available options are: 'view','edit','fill'
    //edit when edit template from settings, view for readonly, fill for general use..
    public templateRenderMode: string = "fill";
    public ShowAddQtn: boolean = false;
    public ShowEditQtn: boolean = false;
    public qtnContainer;//it could be either QuestionVM object or QnairVM object.
    public qtnContainerType: string = null;//it could be either 'qtn', or 'qnr'

    constructor(public dlService: DLService) {

    }

    //parentType could be either 'qtn' or 'qnr'//viz: question or qnair
    public DisplayAddQuestion(qtnParent, parentType: string) {
        this.qtnContainer = qtnParent;
        this.ShowAddQtn = true;
        this.qtnContainerType = parentType;
    }

    public DisplayEditQuestion(qtn) {
        this.qtnContainer = qtn;
        this.ShowEditQtn = true;
    }






    ///Get List of All questions inside this template in a FLAT LIST.
    public GetTemplateQuestions(template: Template): Array<Question> {
        let allQtns: Array<Question> = [];
        if (template && template.Qnairs && template.Qnairs.length > 0) {
            template.Qnairs.forEach(qnr => {
                if (qnr.ChildQuestions && qnr.ChildQuestions.length > 0) {
                    allQtns = allQtns.concat(qnr.ChildQuestions);
                    qnr.ChildQuestions.forEach(qtn => {
                        let chldQtns = this.GetChildQuestions(qtn);
                        allQtns = allQtns.concat(chldQtns);
                    });
                }
            });
        }
        //console.log(allQtns);
        return allQtns;
    }

    //Recursive:  Gets Child question of current question.
    GetChildQuestions(qtn: Question): Array<Question> {
        let retQtnsList: Array<Question> = [];

        if (qtn.ChildQuestions && qtn.ChildQuestions.length > 0) {
            qtn.ChildQuestions.forEach(chldQtn => {
                retQtnsList.push(chldQtn);
                let gChildQtns = this.GetChildQuestions(chldQtn);
                retQtnsList = retQtnsList.concat(gChildQtns);
            });
        }
        return retQtnsList;
    }
    public MapWithSelectedAnswer(templateId: number, patDataList: Array<VisitSummaryModel>): Array<SelectedAnswer> {
        var selectedAns: Array<SelectedAnswer> = new Array<SelectedAnswer>();
        patDataList.forEach(data => {
            var selAns = new SelectedAnswer();
            selAns = Object.assign(selAns, data);
            selAns.TemplateId = templateId;
            selectedAns.push(selAns);
        });
        return selectedAns;
    }
    //sets selected answers to all questions of the template.
    public SetAnswersOfTemplate(template: Template, selAns: Array<SelectedAnswer>) {
       
        if (selAns && selAns.length > 0) {
            let allQtns = this.GetTemplateQuestions(template);
            selAns.forEach(ans => {
                let currQtn = allQtns.find(q => q.QuestionId == ans.QuestionId);
                if (currQtn) {
                    Question.SetSelectedAnswer(currQtn, ans);
                }
            });
        }
    }

    //sets selected answers to all questions of the template.
    public SetAnswersOfQnair(template: Template, qnairId: number, selAns: Array<SelectedAnswer>) {

        //this set of answers should be fetched by the module and passed as parameter.
        //let selAns: Array<SelectedAnswer> = [{ QuestionId: 26, TemplateId: 1, Answer: "Harmonious ", QnairId: 2, DataId: 0  },
        //    { QuestionId: 27, TemplateId: 1, Answer: "nothing as such", QnairId: 2, DataId: 0  },
        //{ QuestionId: 28, TemplateId: 1, Answer: "Has Siblings", QnairId: 2, DataId: 0  },
        //{ QuestionId: 30, TemplateId: 1, Answer: '[{"Age":"14","Sex":"Female","Education":"8"},{"Age":"5","Sex":"Female","Education":"1"}]', QnairId: 2, DataId: 0  },
        //];

        let allQtns = this.GetTemplateQuestions(template);
        let qnrQtns = allQtns.filter(q => q.QnairId == qnairId);
        if (qnrQtns && selAns) {
            selAns.forEach(ans => {
                let currQtn = allQtns.find(q => q.QuestionId == ans.QuestionId);
                if (currQtn) {
                    Question.SetSelectedAnswer(currQtn, ans);
                }
            });
        }

    }

    //Resets answer of current questionnaire
    public ResetAnsOfQnair(template: Template, qnairId: number) {
        var a = window.confirm("This will reset (clear) the answers of this section. Do you want to continue ?")
        if (a) {
            let allQtns = this.GetTemplateQuestions(template);
            let qnrQtns = allQtns.filter(q => q.QnairId == qnairId);
            if (qnrQtns && qnrQtns.length > 0) {
                qnrQtns.forEach(qtn => {
                    Question.ResetAnswers(qtn);
                });
            }
        }
    }

    //Resets answer of current template
    public ResetAnsOfTemplate(template: Template) {

        let allQtns = this.GetTemplateQuestions(template);
        if (allQtns && allQtns.length > 0) {
            allQtns.forEach(qtn => {
                Question.ResetAnswers(qtn);
            });
        }

    }


    //for add/edit questions: check whether provided options are valid or not for this.
    //NOTE: Only checked for radio for now.
    //check-conditions: IsEmpty and IsDuplicate.
    IsValidOptions(qtnType: string, optArray: Array<Option>): boolean {
        //applying only for radiobutton for now, textbox doesn't have any options so return true.'
        if (qtnType == "text" || qtnType == "label" ) {
            return true;
        }
        else {


            let hasEmptyOpts = optArray.find(o => o.Text == null || o.Text.trim() == "");
            if (hasEmptyOpts) {
                return false;
            }
            //get option array as text.--make all lower case so that case-sensitive duplicate are also found.
            let ansTxtArr = optArray.map(a => {
                if (a.Text) return a.Text.toLowerCase()
            });
            //if array has duplicate options then it's Invalid
            let hasDuplicate = CommonFunctions.HasDuplicatesInArray(ansTxtArr);
            if (hasDuplicate) {
                return false;
            }
            //finally return true if it passes above conditions.
            return true;
        }
    }

}

