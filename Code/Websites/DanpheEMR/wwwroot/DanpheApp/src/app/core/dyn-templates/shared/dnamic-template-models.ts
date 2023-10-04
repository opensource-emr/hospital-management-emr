//export class QtnOptionMap {
//    public QuestionId: number;
//    public OptionId: number;
//    public IsDefault: boolean = false;
//    public ShowChildOnSelect: boolean = false;
//}

export class SelectedAnswer {
    public TemplateId: number = null;
    public QnairId: number = null;
    public QuestionId: number = null;
    public Answer: string = null;
    public IsActive: boolean = true;
}


export class Template {
    public TemplateId: number = 0;
    public Code: string = null;
    public Text: string = null;
    public ModuleName: string = null;
    public Qnairs: Array<Questionnaire> = null;
    constructor() {

    }
}

export class Questionnaire {
    public QnairId: number = 0;
    public Text: string = null;
    public TemplateId: number = 0;
    //to set the display position of this Section inside the Template.
    public DisplaySeq: number = 0;
    public ChildQuestions: Array<Question> = new Array<Question>();
}


export class Option {
    public OptionId: number = 0;
    public QuestionId: number = 0;
    public Text: string = null;
    public IsDefault: boolean = false;
    public ShowChildOnSelect: boolean = false;
    public IsSelected: boolean = false;
    public IsActive: boolean = true;
    //to track whether this Entity (option) is unchanged, modified, added, deleted.
    //default value is unchanged
    public EntityState: string = "unchanged";
    constructor() {

    }
}


export class Question {
    public QuestionId: number = 0;
    public QnairId: number = 0;
    public TemplateId: number = 0;
    public ParentQtnId: number = null;
    public Text: string = null;
    public Type: string = null;
    public ShowChilds: boolean = false;//whether or not to show childquestions (default-false)
    public ShowAnswers: boolean = true;//this is required when Textbox needs to be shown/hidden based on Plus or Minus sign (sud:2July'18)
    //to set the display position of this question inside the questionnaire.
    public DisplaySeq: number = 0;
    public QtnHRCLevel: number = 0;//this gives hierarchy level of this question.
    public ChildQtnAlignment: string = "vertical";
    public Options: Array<Option> = null;
    public SelectedAnswer: string = null;
    public ChildQuestions: Array<Question> = new Array<Question>();
    constructor() {
        this.Type = "text";//default type is text
        this.Options = new Array<Option>();
    }

    public static GetSelectedAns(qtn: Question): Array<SelectedAnswer> {
        let selAnswers: Array<SelectedAnswer> = [];
        let ansText = null;
        if (qtn.SelectedAnswer) {
            switch (qtn.Type) {
                case "table":
                    ansText = JSON.stringify(qtn.SelectedAnswer);
                    break;
                case "search-tbx":
                    let selAns: any = qtn.SelectedAnswer;
                    //when we assign selected value to the searchbox, the 'value' property is not set initially.
                    ansText = selAns.value ? selAns.value : selAns;
                    break;
                default:
                    ansText = qtn.SelectedAnswer;
                    break;
            }
            //ansText = qtn.Type != "table" ? qtn.SelectedAnswer : JSON.stringify(qtn.SelectedAnswer);
            selAnswers.push({ QuestionId: qtn.QuestionId, TemplateId: qtn.TemplateId, Answer: ansText, QnairId: qtn.QnairId, IsActive: true });
        }
        return selAnswers;
    }

    //set selected answer to this question.//need to change this from checkbox list.
    public static SetSelectedAnswer(qtn: Question, selAns: SelectedAnswer) {
        if (qtn) {
            qtn.SelectedAnswer = selAns.Answer;
            //for textbox, if there's some answer already filled, show the textbox, else it'll remain hidden and only open on click of plus button
            if (qtn.Type == "text" && qtn.SelectedAnswer) {
                qtn.ShowAnswers = true;
            }
            if (qtn.Options) {
                let selOpt = qtn.Options.find(o => o.Text == selAns.Answer);
                if (selOpt) {
                    selOpt.IsSelected = true;
                    if (selOpt.ShowChildOnSelect) {
                        qtn.ShowChilds = true;
                    }
                    else {
                        qtn.ShowChilds = false;
                    }
                }
            }
        }
    }
    //set selected answer to this question.
    public static ResetAnswers(qtn: Question) {
        if (qtn) {
            qtn.ShowChilds = false;
            qtn.SelectedAnswer = null;
            if (qtn.Options) {
                qtn.Options.forEach(opt => {
                    opt.IsSelected = false;
                });

                //let selOpt = qtn.Options.find(o => o.Text == selAns.Answer);
                //if (selOpt) {
                //    selOpt.IsSelected = true;
                //    if (selOpt.ShowChildOnSelect) {
                //        qtn.ShowChilds = true;
                //    }
                //    else {
                //        qtn.ShowChilds = false;
                //    }
                //}
            }
        }

    }

}



