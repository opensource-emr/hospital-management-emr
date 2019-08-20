import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core"
import { Option, Question } from "../shared/dnamic-template-models";
import { DynamicTemplateService } from "../shared/dynamic-template-service";

@Component({
    selector: "danphe-qtn-hrc",
    templateUrl: "./question-hrc.html"
})
//this class renders all its questions in hierarchical manner.
export class QuestionHrcComponent {

    @Input()
    public question: Question;

    @Output()
    questionChange = new EventEmitter<any>();

    @Input()
    dataSets: any = new Object();//this is for controls like dropdowns, etc.

    //this is assigned as default at the time of edit mode.
    public defaultDataSource = [];

    ///this is used when it's used for editing the template.
    //options for renderMode = 'view', 'edit'
    //default renderMode: view
    renderMode: string = "view";

    constructor(public dynTemplateServ: DynamicTemplateService) {
        this.renderMode = dynTemplateServ.templateRenderMode;
    }



    ngOnInit() {
        //console.log("Qtn Render Mode: " + this.renderMode);
        if (this.question && this.question.Type == "search-tbx") {
            if (this.dataSets && this.question.Options[0].Text && this.dataSets[this.question.Options[0].Text]) {
                this.defaultDataSource = this.dataSets[this.question.Options[0].Text];
            }
        }
    }


    OnAnswerChange(selQtn: Question, selAnswer: Option) {
        if (selAnswer.ShowChildOnSelect) {
            selQtn.ShowChilds = true;
        }
        else {
            selQtn.ShowChilds = false;
        }
        selQtn.Options.forEach(ans => {
            ans.IsSelected = false;
        });
        selAnswer.IsSelected = true;

    }




}