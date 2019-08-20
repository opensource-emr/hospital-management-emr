import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabReportTemplateModel, LabReportColumnsModel } from '../../shared/lab-report-template.model';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import * as _ from 'lodash';

@Component({
    selector: 'add-new-report-template',
  templateUrl: "./add-lab-report-template.html",
  styles: [`.colsetting-name {display: inline - block;margin-left: 15px;}
  .colsetting-name input[type = checkbox]{margin-top: 0px!important;}
  .colsetting-name input[type = checkbox], .colsetting - name label{cursor: pointer;}
  .colsetting-name {float: left;}
`]
})

export class AddNewLabReportComponent {
    @Input() rptTemplate: LabReportTemplateModel = new LabReportTemplateModel();

    @Input() showTemplateAddPage: boolean = false;
    @Input() update: boolean = false;
    @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();
    public isReadOnly: boolean = false;

    public colSettings: LabReportColumnsModel = new LabReportColumnsModel(false,false,false,false,false,false,false);

    //public rptTemplate: ReportTemplateModel = new ReportTemplateModel(); 

    constructor(public msgBox: MessageboxService, public labSettingsBLServ: LabSettingsBLService) {


    }
    ngOnInit() {
        if (this.update) {
            this.colSettings = JSON.parse(this.rptTemplate.ColSettingsJSON);
            this.checkAllTrueOrFalse();
        }      
    }

    checkAllTrueOrFalse() {
        for (var key in this.colSettings) {          
                this.colSettings.SelectAll = true;
                if (!this.colSettings[key]) {
                    this.colSettings.SelectAll = false;
                    break;
                }
           
        }
    }

    ColSettingsData() {
        if (this.colSettings.SelectAll) {
            this.colSettings = _.mapValues(this.colSettings, () => true);           
        } else {
            this.colSettings = _.mapValues(this.colSettings, () => false);     
        }
    }

    


    AddReportTemplate() {
        if (this.rptTemplate.DisplaySequence) {
            if (this.rptTemplate.DisplaySequence < 0) {
                this.rptTemplate.DisplaySequence = 100;
            }
        } else {
            this.rptTemplate.DisplaySequence = 100;
        }


        let colSettngsOmitted = _.omit(this.colSettings, ['SelectAll']);
        //sud: 13Sept'18 -- below was causing build error in some of machines.
       //this.colSettings = _.omit(this.colSettings, ['SelectAll']);
        this.rptTemplate.ColSettingsJSON = JSON.stringify(colSettngsOmitted);

        for (var i in this.rptTemplate.ReportTemplateValidator.controls) {
            this.rptTemplate.ReportTemplateValidator.controls[i].markAsDirty();
            this.rptTemplate.ReportTemplateValidator.controls[i].updateValueAndValidity();
        }
        if (this.rptTemplate.IsValidCheck(undefined, undefined)) {
            this.labSettingsBLServ.PostNewReportTemplate(this.rptTemplate)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBox.showMessage("success", ['New Report Template Added.']);
                            this.CallBackAddUpdate(res);
                        }
                        else {
                            this.msgBox.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBox.showMessage("error", ['Some Error Occured ' + err.ErrorMessage]);
                    });
        }
    }

    CallBackAddUpdate(res) {       
        this.rptTemplate = new LabReportTemplateModel();
        if (res.Status == "OK") {
            this.sendDataBack.emit({ report: res.Results });
        }
        else {
            this.msgBox.showMessage("error", ["Check log for details"]);
        }
    }

    UpdateReportTemplate() {
        if (this.rptTemplate.DisplaySequence) {
            if (this.rptTemplate.DisplaySequence < 0) {
                this.rptTemplate.DisplaySequence = 100;
            }
        } else {
            this.rptTemplate.DisplaySequence = 100;
        }

        let colSettngsOmitted = _.omit(this.colSettings, ['SelectAll']);
        //sud: 13Sept'18 -- below was causing build error in some of machines.
       //this.colSettings = _.omit(this.colSettings, ['SelectAll']);
        this.rptTemplate.ColSettingsJSON = JSON.stringify(colSettngsOmitted);

        for (var i in this.rptTemplate.ReportTemplateValidator.controls) {
            this.rptTemplate.ReportTemplateValidator.controls[i].markAsDirty();
            this.rptTemplate.ReportTemplateValidator.controls[i].updateValueAndValidity();
        }
        

        if (this.rptTemplate.IsValidCheck(undefined, undefined)) {
            this.labSettingsBLServ.UpdateTemplate(this.rptTemplate)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBox.showMessage("success", ["Lab Report Template Updated"]);
                        this.rptTemplate = new LabReportTemplateModel();
                        this.CallBackAddUpdate(res);
                    } else {
                        this.msgBox.showMessage("Failed", ["Lab Report Template Cannot be Updated"]);
                    }
                    });
        }
    }

    DDLChange() {
        if (this.rptTemplate.TemplateType == 'normal') {
            this.rptTemplate.TemplateHTML = null;
        }
    }

    onChangeEditorData(data) {
        this.rptTemplate.TemplateHTML = data;
    }

    Close() {
        this.update = false;
        this.showTemplateAddPage = false;
    }

}
