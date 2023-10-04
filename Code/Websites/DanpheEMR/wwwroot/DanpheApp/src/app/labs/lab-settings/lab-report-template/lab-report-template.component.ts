
import { Component, ChangeDetectorRef } from '@angular/core';
import { LabReportTemplateModel } from '../../shared/lab-report-template.model';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { SecurityService } from '../../../security/shared/security.service';

@Component({
    templateUrl: "./lab-report-template.html"
})

export class ReportTemplateComponent {
    public reportTemplateList: Array<LabReportTemplateModel> = new Array<LabReportTemplateModel>();
    public reportTemplateGridCol: Array<any> = null;
    public selectedTemplate: LabReportTemplateModel = new LabReportTemplateModel();
    public showAddNewPage: boolean = false;
    public index: number = 0;
    public update: boolean = false;
    public selectedActivateDeactivate: LabReportTemplateModel = null;
    public selectedItem: LabReportTemplateModel = null;
    public labGridCols: LabGridColumnSettings = null;

    constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef, public securityService: SecurityService) {
        this.labGridCols = new LabGridColumnSettings(this.securityService)
        this.reportTemplateGridCol = this.labGridCols.LabReportTemplateList;
        this.GetReportTemplateList();
    }

    GetReportTemplateList(): void {
        this.labSettingBlServ.GetAllReportTemplates().
            subscribe(res => {
                if (res.Status == 'OK') {
                    this.reportTemplateList = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }

            },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get ReportTemplate List"]);
                });
    }

    AddNewLabTemplate() {
        this.showAddNewPage = false;
        this.selectedTemplate = new LabReportTemplateModel();
        this.changeDetector.detectChanges();
        this.update = false;
        this.showAddNewPage = true;
    }

    CallBackNewAdded($event) {
        if (this.update) {
            //index value is assigned in EditAction function.
            if (this.index != null) {
                this.reportTemplateList.splice(this.index, 1);
            }
            this.reportTemplateList.splice(this.index, 0, $event.report);
        }
        else {
            this.reportTemplateList.push($event.report);
        }

        this.reportTemplateList = this.reportTemplateList.slice();

        this.changeDetector.detectChanges();
        //reset page level variables once Edit/Add action is completed. 
        this.showAddNewPage = false;
        this.selectedTemplate = null;
        this.index = null;
    }

    EditAction(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.selectedTemplate = new LabReportTemplateModel();

                let id = event.Data.ReportTemplateID;
                let actualIndex = this.reportTemplateList.findIndex(val => val.ReportTemplateID == id);
                this.index = actualIndex;//assigns Actual index 

                this.showAddNewPage = false;
                this.changeDetector.detectChanges();
                this.selectedTemplate = Object.assign(this.selectedTemplate, event.Data);
                this.update = true;
                this.showAddNewPage = true;
                break;
            }
            case "activateDeactivateLabTest": {
                if (event.Data != null) {
                    this.selectedActivateDeactivate = null;
                    this.selectedActivateDeactivate = event.Data;
                    this.ActivateDeactivateLabReportTemplateStatus(this.selectedActivateDeactivate);
                    this.selectedItem = null;
                }
                break;

            }
            default:
                break;
        }
    }

      //Anjana: 15 Feb:2021; Update IsActive status of Lab Report Template- Activate or Deactivate
      ActivateDeactivateLabReportTemplateStatus(rep: LabReportTemplateModel) {
        if (rep != null) {
            let status = rep.IsActive == true ? false : true;

            if (status == true) {
                rep.IsActive = status;
                this.ChangeActiveStatus(rep);
            } else {
                if (confirm("Are you Sure want to Deactivate " + rep.ReportTemplateName + ' ?')) {

                    rep.IsActive = status;
                    //we want to update the ISActive property in table there for this call is necessry
                    this.ChangeActiveStatus(rep);
                }
            }
        }

    }

    ChangeActiveStatus(rep) {
        this.labSettingBlServ.DeactivateReportTemplate(rep)
            .subscribe(
                res => {
                    if (res.Status == "OK") {
                        let responseMessage = res.Results.IsActive ? "Lab Report Template is now activated." : "Lab Report Template is now deactivated.";
                        this.msgBoxServ.showMessage("success", [responseMessage]);
                        //This for send to callbackadd function to update data in list
                        this.GetReportTemplateList();
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ['Something went wrong.' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("success", [err]);
                });

    }
}