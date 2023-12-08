import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as moment from 'moment/moment';
import { IntakeOutputParameterListModel } from "../../../clinical/shared/intake-output-parameterlist.model";
import { IntakeOutputVariableModel } from "../../../shared/intake-output-variable.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { SettingsBLService } from "../../shared/settings.bl.service";



@Component({
    selector: "intake-output-add",
    templateUrl: "intake-output-add.component.html"
})

export class IntakeOutputAddComponent implements OnInit {
    @Input("is-update")
    public IsUpdate: boolean = false;
    @Input("show-add-page")
    public ShowAddPage: boolean = false;
    @Output("callback-Add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public IntakeOutputTypeList: IntakeOutputParameterListModel[] = [];
    public FilteredIntakeOutputType: IntakeOutputParameterListModel[] = [];
    public AllParentIntakeOutput: IntakeOutputParameterListModel[] = [];
    public CurrentIntakeOutput: IntakeOutputParameterListModel = new IntakeOutputParameterListModel();
    @Input("row-data")
    public RowData: IntakeOutputVariableModel = new IntakeOutputVariableModel();
    public IsParent: boolean = false;
    selectedParentParameter: any;


    constructor(public settingBlServ: SettingsBLService,
        public messageBoxService: MessageboxService,) {
        this.GetClinicalIntakeOutputParameterList()
    }
    ngOnInit(): void {
        this.GetClinicalIntakeOutputParameterList();
    }



    GetClinicalIntakeOutputParameterList() {
        this.settingBlServ.GetIntakeOutputTypeList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.IntakeOutputTypeList = res.Results;
                    if (this.IsUpdate) {
                        this.CurrentIntakeOutput.IntakeOutputId = this.RowData.IntakeOutputId;
                        this.CurrentIntakeOutput.ParameterValue = this.RowData.ParameterValue;
                        this.CurrentIntakeOutput.ParameterType = this.RowData.ParameterType;
                        this.CurrentIntakeOutput.IsActive = this.RowData.IsActive;
                        this.CurrentIntakeOutput.ParameterMainId = this.RowData.ParameterMainId;
                        if (this.RowData.ParameterMainId === -1) {
                            this.IsParent = true;
                        }
                        this.selectedParentParameter = this.IntakeOutputTypeList.find(a => a.IntakeOutputId === this.RowData.ParameterMainId);
                        this.AllParentIntakeOutput = this.IntakeOutputTypeList.filter(a => a.ParameterMainId === -1 && a.ParameterType === this.RowData.ParameterType);
                    }
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Data"], res.ErrorMessage);
                }
            });
    }

    Close() {
        this.IsParent = false;
        this.IsUpdate = false;
        this.ShowAddPage = false;
        this.callbackAdd.emit(this.ShowAddPage);
    }

    AssignSelecteParameterType($event) {
        if ($event) {
            const intakeOutputType = $event.target.value;
            this.AllParentIntakeOutput = this.IntakeOutputTypeList.filter(a => a.ParameterType === intakeOutputType && a.ParameterMainId == -1);
            if (this.IsUpdate)
                this.IsUpdate = false;
        }
    }
    AssignSelectedParent() {
        if (this.selectedParentParameter) {
            this.CurrentIntakeOutput.ParameterMainId = this.selectedParentParameter.IntakeOutputId;
        }
    }

    Add() {
        if (this.CurrentIntakeOutput.ParameterType && this.CurrentIntakeOutput.ParameterValue) {
            this.CurrentIntakeOutput.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
            this.settingBlServ.AddIntakeOutputVariable(this.CurrentIntakeOutput)
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Intake/Output variable Added`]);
                        this.callbackAdd.emit(res);
                    } else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, res.ErrorMessage);
                        this.logError(res.ErrorMessage)
                    }

                },
                    err => {
                        this.logError(err);
                    });
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please fill all mandatory fields.`]);
        }
    }
    logError(err: any) {
        console.log(err);
    }


    Update() {
        if (this.CurrentIntakeOutput.ParameterMainId && this.CurrentIntakeOutput.ParameterValue) {
            this.CurrentIntakeOutput.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
            this.settingBlServ.UpdateIntakeOutputVariable(this.CurrentIntakeOutput)
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Intake/Output variable Updated`]);
                        this.callbackAdd.emit(res);
                    } else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, res.ErrorMessage);
                        this.logError(res.ErrorMessage)
                    }

                },
                    err => {
                        this.logError(err);
                    });
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Please fill all mandatory fields.`]);
        }
    }
}
