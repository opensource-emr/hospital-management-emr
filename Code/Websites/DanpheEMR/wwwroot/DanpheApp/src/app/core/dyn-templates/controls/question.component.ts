import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core"
import { Option, Question } from "../shared/dnamic-template-models";
import { DynamicTemplateService } from "../shared/dynamic-template-service";

@Component({
    selector: "danphe-question",
    templateUrl: "./question.html"
})

export class QuestionComponent {

    @Input()
    public question: Question;

    @Output()
    questionChange = new EventEmitter<any>();

    @Input()
    dataSets: any = new Object();//this is for controls like dropdowns, etc.

    //this is assigned as default at the time of edit mode.
    public defaultDataSource = [];

    ///this is used when it's used for editing the template.
    //options for renderMode = 'view', 'edit','fill'
    @Input()
    renderMode: string;

    constructor(public dynTemplateServ: DynamicTemplateService) {

    }



    ngOnInit() {
        this.renderMode = this.dynTemplateServ.templateRenderMode;
        //console.log("Qtn Render Mode: " + this.renderMode);
        if (this.question && this.question.Type == "search-tbx") {
            if (this.dataSets && this.question.Options[0].Text && this.dataSets[this.question.Options[0].Text]) {
                this.defaultDataSource = this.dataSets[this.question.Options[0].Text];
            }
        }
    }

    //ngOnChanges() {
    //    let a = 0;
    //}

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

    autogrow(txtAreaId) {
        let textArea = document.getElementById(txtAreaId)
        textArea.style.overflow = 'hidden';
        textArea.style.height = '0px';
        textArea.style.maxWidth = "";
        textArea.style.height = textArea.scrollHeight + 'px';
    }

    AddNewQtn(qtnParent, parentType) {
        //here we're adding child qtn to a question itself.
        this.dynTemplateServ.DisplayAddQuestion(qtnParent, parentType = 'qtn');
    }

}