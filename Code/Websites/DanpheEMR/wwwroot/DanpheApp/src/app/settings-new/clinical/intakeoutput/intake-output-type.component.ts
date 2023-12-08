import { Component } from "@angular/core";
import { IntakeOutputParameterListModel } from "../../../clinical/shared/intake-output-parameterlist.model";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { IntakeOutputVariableModel } from "../../../shared/intake-output-variable.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { SettingsService } from "../../shared/settings-service";
import { SettingsBLService } from "../../shared/settings.bl.service";

@Component({
    selector: "intake-output-list",
    templateUrl: "intake-output-type.component.html"
})

export class IntakeOutputTypeListComponent {

    public IntakeOutputTypeList: IntakeOutputParameterListModel[] = [];
    public ShowGrid: boolean = false;
    public ShowAddPage: boolean = false;
    public IntakeOutputGridColumns: Array<any> = null;
    public IntakeOutputTypeListForGrid: IntakeOutputVariableModel[] = [];
    public intakeOutputData: IntakeOutputVariableModel[] = [];
    public RowData: IntakeOutputVariableModel = new IntakeOutputVariableModel();
    public IsUpdate: boolean = false;
    public SelectedIntakeOutputData: { intakeOutputId: number, isActive: boolean } = { intakeOutputId: 0, isActive: false }



    constructor(public settingBlServ: SettingsBLService,
        public messageBoxService: MessageboxService,
        public settingsServ: SettingsService,) {
        this.IntakeOutputGridColumns = this.settingsServ.settingsGridCols.IntakeOutputList;
        this.GetClinicalIntakeOutputParameterList();

    }

    AddIntakeOutput() {
        this.ShowAddPage = true;
    }

    GetClinicalIntakeOutputParameterList() {
        this.settingBlServ.GetIntakeOutputTypeListForGrid()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {

                    this.IntakeOutputTypeListForGrid = res.Results;
                    this.intakeOutputData = this.IntakeOutputTypeListForGrid.map(item => {
                        if (item.ParentParameterValue === null || item.ParentParameterValue === undefined) {
                            item.ParentParameterValue = "N/A";
                        }
                        return item;
                    });
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Data"], res.ErrorMessage);
                }
            });
    }


    IntakeOutputGridActions(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.RowData = event.Data;
                this.IsUpdate = true;
                this.ShowAddPage = true;
                break;
            }
            case "activateDeactivateBasedOnStatus": {
                if (event.Data != null) {
                    this.RowData = event.Data;
                    this.ActivateDeactivateReagentStatus(this.RowData);
                    this.RowData = null;
                }
                break;

            }
            default:
                break;
        }
    }
    ActivateDeactivateReagentStatus(currIntakeOutputparameter: IntakeOutputVariableModel) {
        if (currIntakeOutputparameter != null) {
            let status = currIntakeOutputparameter.IsActive === true ? false : true;
            this.SelectedIntakeOutputData.intakeOutputId = currIntakeOutputparameter.IntakeOutputId;
            this.SelectedIntakeOutputData.isActive = status;
            if (status === true) {
                currIntakeOutputparameter.IsActive = status;
                this.ChangeActiveStatus(this.SelectedIntakeOutputData);
            } else {
                if (confirm("Are you Sure want to Deactivate " + currIntakeOutputparameter.ParameterValue + ' ?')) {
                    currIntakeOutputparameter.IsActive = status;
                    this.ChangeActiveStatus(this.SelectedIntakeOutputData);
                }
            }
        }

    }


    ChangeActiveStatus(selectedIntakeOutputData) {
        this.settingBlServ.ActivateDeactivateVariableStatus(selectedIntakeOutputData)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.GetClinicalIntakeOutputParameterList();
                        let responseMessage = res.Results.IsActive ? "Variable is now Activated." : "Variable is now Deactivated.";
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [responseMessage]);

                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Something went wrong' + res.ErrorMessage]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [err]);
                });

    }
    CallBackAdd() {
        this.ShowAddPage = false;
        this.IsUpdate = false;
        this.GetClinicalIntakeOutputParameterList();
    }
}
