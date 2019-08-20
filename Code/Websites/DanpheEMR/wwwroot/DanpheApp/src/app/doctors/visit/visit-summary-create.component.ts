import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core"
import { DLService } from "../../shared/dl.service";

import { Router } from "@angular/router";
import { VisitService } from "../../appointments/shared/visit.service";
import { VisitSummaryModel } from "./visit-summary.model";
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import { DynamicTemplateService } from "../../core/dyn-templates/shared/dynamic-template-service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { Visit } from "../../appointments/shared/visit.model";
import { Template, Option, SelectedAnswer, Question } from "../../core/dyn-templates/shared/dnamic-template-models";


@Component({
    selector: "visit-summary-create",
    templateUrl: "./visit-summary-create.html"
})

export class VisitSummaryCreateComponent {

    public definedDataSets: any = new Object();

    public template: Template = null;
    public isTemplateLoaded = false;
    public selectedPatient: Patient = new Patient();

    //list of all the previous encountered visits except the current one.
    public visitList: Array<Visit> = new Array<Visit>();

    //data is added in context with this visit.
    public currentVisitId: number = null;

    //all the answers in context with current visit if any.
    public existingAnswers: Array<SelectedAnswer> = new Array<SelectedAnswer>();

    //used in load from prevoius data in qnair level.
    public preVisitSelectedId: number = null;
    //used in load from previous data in qnair level.
    public preSelVisitAnswers: Array<SelectedAnswer> = new Array<SelectedAnswer>();
    public selectedQnairId: number = null;
    public loadInQnairLevel: boolean = false;

    public showVisitList: boolean = false;
    public loading: boolean = false;
    @Input("isEditViewMode")
    public isEditViewMode: boolean = false;
    public currentVisit;
    constructor(public patientService: PatientService,
        public router: Router,
        public visitServ: VisitService,
        public msgBoxServ: MessageboxService,
        public dlService: DLService,
        public dynTempService: DynamicTemplateService,
        public changeDetector: ChangeDetectorRef) {

        this.selectedPatient = this.patientService.getGlobal();

        this.currentVisitId = this.visitServ.getGlobal().PatientVisitId;
        if (this.selectedPatient.PatientId && this.currentVisitId && !this.isEditViewMode) {
            //this.CreateDataSets();
            this.GetQtnTemplateFromServer();
            this.GetPatientVisitList();
        }
        else {
            this.router.navigate(['/Patient/PatientList']);
        }
    }
    @Input("visitId")
    public set visit(visitId: number) {
        if (this.isEditViewMode && visitId) {
            this.currentVisitId = visitId;
            this.GetQtnTemplateFromServer();
            this.GetPatientVisitList();
        }
    }
    ///Correct the controller method and pass the template name as parameter.
    //get only the current template from server.
    GetQtnTemplateFromServer() {
        let url = "/api/DynTemplates?reqType=getSurveyTemplate&templateCode=OPDSummary"

        this.dlService.Read(url).map(res => res).subscribe(res => {
            let templateData: Template = res.Results;
            this.template = templateData;
            this.isTemplateLoaded = true;
            this.GetPatientData(this.currentVisitId);
        });
    }

    public GetPatientVisitList() {
        let url = "/api/Visit?reqType=patVisitList&patientId=" + this.selectedPatient.PatientId;
        this.dlService.Read(url).map(res => res).subscribe(res => {
            if (res.Status == "OK" && res.Results.length) {
                this.visitList = res.Results;
                if (this.currentVisitId) {
                    //remove current visit from visitList.
                    var index = this.visitList.findIndex(a => a.PatientVisitId == this.currentVisitId);
                    if (index >= 0) {
                        this.currentVisit = this.visitList[index];
                        this.dynTempService.templateRenderMode = this.currentVisit.IsSignedVisitSummary ? 'view' : 'fill';
                        this.visitList.splice(index, 1);
                    }
                    else
                        this.dynTempService.templateRenderMode = 'fill';
                }
            }
        });
    }


    public GetPatientData(visitId: number) {
        let url = "/api/VisitSummary?reqType=getPatientData&visitId=" + visitId;
        this.dlService.Read(url).map(res => res).subscribe(res => {
            if (res.Status == "OK" && res.Results) {
                if (!this.loadInQnairLevel) {
                    this.existingAnswers = this.dynTempService.MapWithSelectedAnswer(this.template.TemplateId, res.Results);
                    if (this.existingAnswers.length)
                        this.LoadInTemplateLevel();
                }
                else if (this.loadInQnairLevel) {
                    this.preSelVisitAnswers = this.dynTempService.MapWithSelectedAnswer(this.template.TemplateId, res.Results);
                    this.LoadInQnairLevel();
                }
            }
            //else {
            //    this.msgBoxServ.showMessage("failed", ["No previous data with the selected visit."]);
            //}
        });
    }

    public LoadInTemplateLevel() {
        let answers = this.existingAnswers.filter(a => a.IsActive == true);
        this.dynTempService.SetAnswersOfTemplate(this.template, answers);
    }
    public LoadInQnairLevel() {
        let prevQnairAns = this.preSelVisitAnswers.filter(a => a.QnairId == this.selectedQnairId);
        if (prevQnairAns.length) {
            let answers = prevQnairAns.filter(a => a.IsActive == true);
            this.dynTempService.SetAnswersOfQnair(this.template, this.selectedQnairId, answers);
            this.loadInQnairLevel = false;
            this.selectedQnairId = null;
        }
        else {
            this.msgBoxServ.showMessage("failed", ["No previous data for this section."]);
        }
    }
    //this gives all selected answers of current template.
    GetSelectedAnswersOfTemplate(): Array<SelectedAnswer> {
        let temp = this.template;
        let selAnsOfTemplates: Array<SelectedAnswer> = [];

        if (temp && temp.Qnairs && temp.Qnairs.length > 0) {
            temp.Qnairs.forEach(qnr => {
                if (qnr.ChildQuestions && qnr.ChildQuestions.length > 0) {
                    qnr.ChildQuestions.forEach(qtn => {
                        let selAnsOfQtn = this.GetAnswerOfQuestion(qtn);
                        selAnsOfTemplates = selAnsOfTemplates.concat(selAnsOfQtn);
                    });
                }
            });
        }

        return selAnsOfTemplates;
    }

    ///RECURSIVE: returns the selected answer of this question and its child questions.
    GetAnswerOfQuestion(qtn: Question): Array<SelectedAnswer> {
        let selAns = Question.GetSelectedAns(qtn);
        //don't go to inner question if showchild is false.
        if (qtn.ChildQuestions && qtn.ChildQuestions.length > 0 && qtn.ShowChilds == true) {
            qtn.ChildQuestions.forEach(chldQtn => {
                let ansOfChidQtn = this.GetAnswerOfQuestion(chldQtn);
                selAns = selAns.concat(ansOfChidQtn);
            });
        }
        return selAns;
    }


    //add data sets like: doctors list, ICD-10-Lists, DSM-Lists etc to the data set.
    //this is used inside by QuestionComponent to provide source to such controls.
    public CreateDataSets() {
        //    let dsmList = DSM_V_Code.GetAllDSMCodes();
        let url = "/api/Master?reqType=dsm-codes"
        let dsmCodes = [];
        this.dlService.Read(url).map(res => res).subscribe(res => {

            if (res.Status == "OK") {
                dsmCodes = res.Results;
                let dsmListFormatted = dsmCodes.map(dsm => {
                    return { id: dsm.Code, value: dsm.Disorder };
                });
                this.definedDataSets["DSM-V-List"] = dsmListFormatted;
            }
            else {
                this.msgBoxServ.showMessage("failed", ["failed to load DSM-Codes for this request, please contact the administrator."]);
            }

        });

    }
    //save to required database/table.
    public SaveTemplateData(addType: string) {
        if (!this.loading) {
            let newAnswers = this.GetSelectedAnswersOfTemplate();
            if (newAnswers.length) {
                if (addType == "submit") {
                    let confirmation: boolean;
                    confirmation = window.confirm("You won't be able to make further changes. Do you want to continue?");
                    if (confirmation) {
                        this.UpdateIsSignedStatus();
                    }
                        
                    else
                        return;
                }
                this.loading = true;
                //update exisiting Answers with new selected answers
                if (this.existingAnswers.length) {
                    for (let exist of this.existingAnswers) {
                        exist.IsActive = false;
                        for (let i = 0; i < newAnswers.length; i++) {
                            if (exist.QnairId == newAnswers[i].QnairId && exist.QuestionId == newAnswers[i].QuestionId) {
                                exist.IsActive = true;
                                exist.Answer = newAnswers[i].Answer;
                                newAnswers.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                    }
                }
                let existingAns = this.existingAnswers;
                this.existingAnswers = new Array<SelectedAnswer>();
                if (newAnswers.length)
                    this.PostPatientData(JSON.stringify(this.MapWithPatientData(newAnswers)));
                if (existingAns.length)
                    this.UpdatePatientData(JSON.stringify(this.MapWithPatientData(existingAns)));

            }
            else {
                this.msgBoxServ.showMessage("failed", ["Please enter some data."]);
            }
        }
        this.loading = false;

    }

    public PostPatientData(patDataJson) {
        let url = "/api/VisitSummary?reqType=addPatientData";
        this.dlService.Add(patDataJson, url).map(res => res).subscribe(res => {
            if (res.Status == "OK" && res.Results.length) {
                this.msgBoxServ.showMessage("success", ["Data added succesfully"]);
                this.CallBackAddUpdate(res.Results);
            }
        });
    }
    public UpdatePatientData(patDataJson) {
        let url = "/api/VisitSummary?reqType=updatePatientData";
        this.dlService.Update(patDataJson, url).map(res => res).subscribe(res => {
            if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ["Data updated succesfully"]);
                this.CallBackAddUpdate(res.Results);
            }
        });
    }
    public CallBackAddUpdate(result: Array<VisitSummaryModel>) {
        let answers = this.dynTempService.MapWithSelectedAnswer(this.template.TemplateId, result);
        answers.forEach(ans => {
            this.existingAnswers.push(ans);
        });
        this.loading = false;
    }
    public UpdateIsSignedStatus() {
        let url = "/api/Visit?reqType=updateIsSignedPatientData&visitId=" + this.currentVisitId;
        this.dlService.Update(null, url).map(res => res).subscribe(res => {
            if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ["Data submitted succesfully"]);
                this.router.navigate(['/Doctors/PatientOverviewMain/VisitSummary/SummaryHistory']);
            }
        });
    }


    public MapWithPatientData(selectedAnswers: Array<SelectedAnswer>): Array<VisitSummaryModel> {
        let patientDataList: Array<VisitSummaryModel> = new Array<VisitSummaryModel>();
        selectedAnswers.forEach(selAnswer => {
            var patData = new VisitSummaryModel();
            patData = Object.assign(patData, selAnswer);
            patData.PatientId = this.selectedPatient.PatientId;
            patData.VisitId = this.currentVisitId;
            patientDataList.push(patData);
        });

        return patientDataList;
    }

    public ShowVisitList(qnairId: number) {

        this.selectedQnairId = qnairId;
        if (this.visitList.length > 0)
            this.showVisitList = true;
        else
            this.msgBoxServ.showMessage("failed", ["No previous data"]);

    }

    public SelectVisit(selVisit) {
        var a = window.confirm("This will overwrite your data of this section. Do you want to continue ?")
        if (a) {
            this.showVisitList = false;

            this.loadInQnairLevel = true;
            if (this.preVisitSelectedId == selVisit.PatientVisitId)
                this.LoadInQnairLevel();
            else {
                this.preVisitSelectedId = selVisit.PatientVisitId;
                this.GetPatientData(this.preVisitSelectedId);
            }
        }
    }

}




