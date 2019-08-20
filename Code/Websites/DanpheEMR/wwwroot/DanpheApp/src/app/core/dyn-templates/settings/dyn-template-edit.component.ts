import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Template, Option, SelectedAnswer, Question, Questionnaire } from "../shared/dnamic-template-models"
import { JsonTableComponent } from "../controls/json-table.component";
import { DLService } from "../../../shared/dl.service";
import { DynamicTemplateService } from "../shared/dynamic-template-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
    templateUrl: "./dyn-template-edit.html"
})

export class DynamicTemplateEditComponent {

    //to display/edit multiple templates after selecting from DDL
    public selectedTemplate: any = null;
    public showEditTemplate: boolean = false;




    public template: Template = null;
    public isTemplateLoaded = false;
    //needed to rename the questionnaire, and also to undo them.
    public qnrsToRename = new Object();
    public qnrOldName: string = "";
    public showAddNewQnr = false;
    public newQnrText: string;
    public newQnrSeq: number = 100;
    public qnrSeqs: Array<number> = new Array<number>();
    public showManageQnrSeq: boolean = false;

    constructor(public dlService: DLService, public dynTemplateServ: DynamicTemplateService, public msgBoxServ: MessageboxService) {
        //this.GetQtnTemplateFromServer();
        this.dynTemplateServ.templateRenderMode = "edit";
        //this.dynTempServ.DisplayAddQuestion();
        this.LoadTemplate();
  

    }
    LoadTemplate() {
        this.selectedTemplate = "OPDSummary";//remove this hardcode later on
        this.GetQtnTemplateFromServer();
        this.showEditTemplate = true;
    }

    ///Correct the controller method and pass the template name as parameter.
    //get only the current template from server.
    GetQtnTemplateFromServer() {
        let url = "/api/DynTemplates?reqType=getSurveyTemplate&templateCode=" + this.selectedTemplate + "&renderMode=edit"
        //let url = "/api/DynTemplates?reqType=getSurveyTemplate&templateCode=ClinicalPsychiatry&renderMode=edit"
        this.dlService.Read(url).map(res => res).subscribe(res => {
            let templateData: Template = res.Results;
            this.template = templateData;
            this.isTemplateLoaded = true;
            this.template.Qnairs.forEach(qnr => {
                this.qnrsToRename[qnr.QnairId] = false;
            });
            this.CreateQnairDispSeqArray();
        });
    }


    EditQnair(qnr: Questionnaire) {
        this.qnrsToRename[qnr.QnairId] = true;
        this.qnrOldName = qnr.Text;
    }

    UndoQnairRename(qnr: Questionnaire) {
        qnr.Text = this.qnrOldName;
        this.qnrsToRename[qnr.QnairId] = false;
    }

    UpdateQnairName(qnr: Questionnaire) {
        //undo if empty qnair name
        if (!qnr.Text) {
            this.UndoQnairRename(qnr);
            alert("section name cannot be empty. name reset to previous value.");
        }
        let url = "/api/DynTemplates?reqType=updateQnairs";
        let data = JSON.stringify([qnr]);
        this.dlService.Update(data, url).map(res => res).subscribe(res => {
            if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ["section renamed successfully"]);
            }
            else {
                this.msgBoxServ.showMessage("failed", ["Rename failed. Please try again later."]);
                this.UndoQnairRename(qnr);
            }
        },
            err => {
                this.msgBoxServ.showMessage("failed", ["Rename failed. Please try again later."]);
                this.UndoQnairRename(qnr);
            });
        this.qnrsToRename[qnr.QnairId] = false;
    }

    AddNewQnair() {
        if (this.newQnrText) {
            //move this to dl/bl services of core.
            let newQnrObj = new Questionnaire();
            newQnrObj.Text = this.newQnrText;
            newQnrObj.TemplateId = this.template.TemplateId;
            newQnrObj.DisplaySeq = this.newQnrSeq;
            let url = "/api/DynTemplates?reqType=addQnair";
            let data = JSON.stringify(newQnrObj);
            this.dlService.Add(data, url).map(res => res).subscribe(res => {
                if (res.Status == "OK") {
                    //qnairId is generated at server side, we've to set it back to newqnr object.
                    newQnrObj.QnairId = res.Results.QnairId;
                    this.template.Qnairs.push(newQnrObj);
                    this.newQnrText = "";

                    this.msgBoxServ.showMessage("success", ["new section added successfully"]);
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Couldn't add this section. Pls try again later."]);
                }
                this.showAddNewQnr = false;
            });


        }
        else {
            alert("Section name cannot be empty.");
        }
    }

    CreateQnairDispSeqArray() {
        this.qnrSeqs = new Array<number>();
        let maxSeq = this.template && this.template.Qnairs.length ? this.template.Qnairs.length + 1 : 1;
        //this.qnrSeqs.push(100);//default value
        for (var i = 1; i <= maxSeq; i++) {
            this.qnrSeqs.push(i);
        }

    }


    UpdateQnairSequence() {
        // get the qnrList to send to server, we don't need ChildQuestions here.'
        let updatedQnrs = this.template.Qnairs.map(q => {
            return { QnairId: q.QnairId, Text: q.Text, TemplateId: q.TemplateId, DisplaySeq: q.DisplaySeq, ChildQuestions: null }
        });

        let url = "/api/DynTemplates?reqType=updateQnairs";
        let data = JSON.stringify(updatedQnrs);
        this.dlService.Update(data, url).map(res => res).subscribe(res => {
            if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ["sequences updated successfully."]);
            }
            else {
                this.msgBoxServ.showMessage("failed", ["update failed. please try again later."]);
                //this.UndoQnairRename(qnr);
            }
        },
            err => {
                this.msgBoxServ.showMessage("failed", ["update failed. please try again later."]);
                //this.UndoQnairRename(qnr);
            });
        //hide this section at the end.
        this.showManageQnrSeq = false;
    }

}



