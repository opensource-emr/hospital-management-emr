
import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { Department } from '../shared/department.model';
import { SettingsBLService } from '../shared/settings.bl.service';

import { SecurityService } from '../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from "../../core/shared/core.service";
import { CFGParameterModel, MappedObj } from "../shared/cfg-parameter.model";
import { Number } from "core-js";


@Component({
    selector: "parameter-edit",
    templateUrl: "./parameter-edit.html"

})
export class ParameterEditComponent {
    @Input("selectedParameter")
    public selectedParameter: CFGParameterModel;

    public currentParameter: CFGParameterModel = new CFGParameterModel();

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public coreService: CoreService) {

    }

    ngOnInit() {
        if (this.selectedParameter) {
            this.currentParameter = Object.assign(this.currentParameter, this.selectedParameter);
            console.log(this.currentParameter.MappedObject);
            console.log(this.currentParameter.ParameterValue);
        }
    }   

    public Update() {
        var newObject: Object = new Object();
        //Incase of JSON
        if (this.currentParameter && this.currentParameter.ValueDataType && (this.currentParameter.ValueDataType.toLowerCase() == "json" || this.selectedParameter.ValueDataType.toLowerCase() == "json-encr")) {
            
            var originalObj = JSON.parse(this.currentParameter.ParameterValue); 

            this.TraverseIt(originalObj, this.currentParameter.MappedObject);

            this.currentParameter.ParameterValue = JSON.stringify(originalObj);

        }
        //Incase of string
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "string") {
            this.currentParameter.ParameterValue = this.currentParameter.MappedObject[0].Value;
        }
        //Incase of number
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "number") {
            this.currentParameter.ParameterValue = this.currentParameter.MappedObject[0].Value;
        }
        //Incase of boolean
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "boolean") {
            
            if (this.currentParameter.MappedObject[0].ActualValueType == 'number') {
                if (this.currentParameter.MappedObject[0].Value == 'true') {
                    this.currentParameter.ParameterValue = '1';
                } else { this.currentParameter.ParameterValue = '0';}
            }
            else {
                this.currentParameter.ParameterValue = this.currentParameter.MappedObject[0].Value;
            }
        }
        else {
            this.msgBoxServ.showMessage("Failed", ["Sorry! Cannot Edit this parameter...Try directly fro Db.."])
        }

        this.Updatedata();
    }

    public TraverseIt(mainObj: any, mapObj: Array<MappedObj>) {
        for (var property in mainObj) {
            if (typeof mainObj[property] == 'object') {
                this.TraverseIt(mainObj[property], mapObj);
            } else {
                if (property != 'remove') {
                        var obj = mapObj.find(val => val.KeyName == property);
                        var type = obj.ValueType;
                        var actualType = obj.ActualValueType;

                        if (type != 'boolean') {
                            mainObj[property] = obj.Value;
                        }
                        //Type in the json in Db is Boolean
                        else {
                            //stores boolean true/false as a string => "true" / "false"
                            if (actualType != 'boolean') {
                                if (actualType == 'number') {
                                    mainObj[property] = obj.Value == 'true' ? '1' : '0';
                                } else {
                                    mainObj[property] = obj.Value;
                                }
                            }
                            //stores boolean true/false as a boolean itself => true / false
                            else {                                
                                mainObj[property] = obj.Value == 'true' ? true : false;
                            }
                        }
                    }                  
                
            }
        }        
    }


    public Updatedata() {       
        this.settingsBLService.UpdateParameterValue(this.currentParameter)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.coreService.InitializeParameters().subscribe(res => {
                        this.CallBackLoadParameters(res);           
                    });
                    this.callbackAdd.emit({ submit: true });
                }
            });
    }

    public CallBackLoadParameters(res) {
        if (res.Status == "OK") {
            this.coreService.Parameters = res.Results;
            this.coreService.SetTaxLabel();
            this.coreService.SetCurrencyUnit();
            //commented: customername, landingpage, empilabels etc for UAT: sudarshan--13jul2017
            //this.pageParameters.CustomerName = res.Results.filter(a => a.ParameterName == 'CustomerName')[0]["ParameterValue"];
            //this.pageParameters.LandingPageCustLogo = res.Results.filter(a => a.ParameterName == 'LandingPageCustLogo')[0]["ParameterValue"];
            //remove below hardcode value for image path as possible..sudarshan:13Apr'17-- 
            //this.pageParameters.LandingPageCustLogo = "/themes/theme-default/images/hospitals-logo/" + this.pageParameters.LandingPageCustLogo;
            //this.pageParameters.EmpiLabel = res.Results.filter(a => a.ParameterName == 'UniquePatientIdLabelName')[0]["ParameterValue"];

            //this.pageParameters.CustomerName = res.Results.filter(a => a.ParameterName == 'CustomerName')[0];
            //this.pageParameters.Logo
        }
        else {
            alert(res.ErrorMessage);
            console.log(res.ErrorMessage);
        }
    }


    Close() {
        this.currentParameter = null;
        this.callbackAdd.emit({ submit: false });
    }




}