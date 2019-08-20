
import { Component, ChangeDetectorRef } from "@angular/core";

import { Department } from '../shared/department.model';
import { SettingsBLService } from '../shared/settings.bl.service';

import { SettingsService } from '../shared/settings-service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';

import { CFGParameterModel, MappedObj } from "../shared/cfg-parameter.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { forEach } from "@angular/router/src/utils/collection";
//testing
@Component({
    templateUrl: './parameter-list.html',
})

export class ParameterListComponent {
    public parameterGridColumns: Array<any> = null;
    public parameterList: Array<CFGParameterModel> = null;

    public selectedParameter: CFGParameterModel = new CFGParameterModel();
    
    public showEditParameter: boolean = false; 

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.parameterGridColumns = this.settingsServ.settingsGridCols.ParameterList;
        this.GetCFGParametersList();
    }
    public GetCFGParametersList() {
        this.settingsBLService.GetCFGParameters()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.parameterList = res.Results;                    
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }


    ParameterGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedParameter = new CFGParameterModel();
                this.changeDetector.detectChanges();
                this.selectedParameter = $event.Data;
                this.selectedParameter.MappedObject = [];
                if (this.selectedParameter.ParameterType && this.selectedParameter.ParameterType.toLowerCase() == 'custom') {
                    this.ManageMapping();
                    this.showEditParameter = true;
                } else {
                    this.msgBoxServ.showMessage('Failed !!',["Sorry You cannot edit this System field."])
                }
            }
                break;
            default:
                break;
        }
    }


    public ManageMapping() {
        var eachJsonItem: MappedObj = new MappedObj();

        //Incase of JSON
        if (this.selectedParameter && this.selectedParameter.ValueDataType && (this.selectedParameter.ValueDataType.toLowerCase() == "json" || this.selectedParameter.ValueDataType.toLowerCase() == "json-encr")) {
            var newObj = JSON.parse(this.selectedParameter.ParameterValue);            
            for (var prop in newObj) {
                eachJsonItem = new MappedObj();
                eachJsonItem.KeyName = prop;
                eachJsonItem.Value = newObj[prop];

                eachJsonItem.ActualValueType = typeof newObj[prop];

                if (eachJsonItem.ActualValueType == 'boolean') {
                    eachJsonItem.ValueType = "boolean";
                    eachJsonItem.Value = String(newObj[prop]).toLowerCase();
                    this.selectedParameter.MappedObject.push(eachJsonItem);
                }
                else if (eachJsonItem.ActualValueType == 'object') {
                    //var i = 0;
                    //eachJsonItem.ValueType = "object";
                    //eachJsonItem.Value = eachJsonItem.Value.toString();
                    //console.log(eachJsonItem.Value);
                    this.TraverseIt(eachJsonItem.Value);
                }
                else 
                {
                    if (newObj[prop] && (newObj[prop].toLowerCase() == 'true' || newObj[prop].toLowerCase() == 'false')) {
                        eachJsonItem.ValueType = "boolean";
                        eachJsonItem.Value = newObj[prop].toLowerCase();
                    }
                    else {
                        eachJsonItem.ValueType = eachJsonItem.ActualValueType;
                    }
                    this.selectedParameter.MappedObject.push(eachJsonItem);
                }              
                

               
            }
        }
        //Incase of string
        else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "string") {
            eachJsonItem = new MappedObj();
            eachJsonItem.KeyName = this.selectedParameter.ParameterName;
            eachJsonItem.Value = this.selectedParameter.ParameterValue;
            eachJsonItem.ValueType = "string";
            eachJsonItem.ActualValueType = this.selectedParameter.ValueDataType;
            this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        //Incase of number
        else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "number") {
            eachJsonItem = new MappedObj();
            eachJsonItem.KeyName = this.selectedParameter.ParameterName;
            eachJsonItem.Value = this.selectedParameter.ParameterValue;
            eachJsonItem.ValueType = "number";
            eachJsonItem.ActualValueType = this.selectedParameter.ValueDataType;
            this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        //Incase of boolean
        else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "boolean") {
            eachJsonItem = new MappedObj();
            eachJsonItem.KeyName = this.selectedParameter.ParameterName;
            eachJsonItem.Value = this.selectedParameter.ParameterValue;
            eachJsonItem.ValueType = "boolean";

            if (this.selectedParameter.ParameterValue == '1') {
                eachJsonItem.Value = 'true';
                eachJsonItem.ActualValueType = 'number';
            } else if (this.selectedParameter.ParameterValue == '0') {
                eachJsonItem.Value = 'false';
                eachJsonItem.ActualValueType = 'number';
            } else if (this.selectedParameter.ParameterValue.toLowerCase() == 'true') {
                eachJsonItem.ActualValueType = this.selectedParameter.ValueDataType.toLowerCase();
            } else if (this.selectedParameter.ParameterValue.toLowerCase() == 'false') {
                eachJsonItem.ActualValueType = this.selectedParameter.ValueDataType.toLowerCase();
            }

            this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        else {
            this.msgBoxServ.showMessage("Failed", ["Sorry! Cannot Edit this.."])
        }

    }

    CallBackUpdate($event) {
        if ($event.submit) {
            this.GetCFGParametersList();
            this.showEditParameter = false;            
        } else {
            this.showEditParameter = false;
        }
    }

    public TraverseIt(obj: any) {
        for (var property in obj) {
            if (typeof obj[property] == 'object') {
                this.TraverseIt(obj[property]);
            } else {
                if (property != 'remove') {
                    var eachJsonItem: MappedObj = new MappedObj();
                    eachJsonItem.ActualValueType = typeof obj[property];
                    eachJsonItem.ValueType = eachJsonItem.ActualValueType;
                    eachJsonItem.KeyName = property;
                    eachJsonItem.Value = obj[property];

                   if (eachJsonItem.ActualValueType != 'number' && eachJsonItem.Value.toLowerCase() == 'true') {
                        eachJsonItem.ValueType = 'boolean';
                    } else if (eachJsonItem.ActualValueType != 'number' && eachJsonItem.Value.toLowerCase() == 'false') {
                        eachJsonItem.ValueType = 'boolean';
                    }

                    this.selectedParameter.MappedObject.push(eachJsonItem);
                }               
                
            }
        }
    }

}

