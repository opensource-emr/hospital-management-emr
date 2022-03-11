import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { CFGParameterModel, MappedObj } from "../../shared/cfg-parameter.model";
import * as _ from 'lodash';
import { forEach } from "@angular/router/src/utils/collection";

@Component({
    selector: "parameter-edit",
    templateUrl: "./parameter-edit.html",
    styles: [`.margin-8-tp{margin-top: 8px;}
            .ln-middle{line-height: 2.3;}`],
    host: { '(window:keydown)': 'hotkeys($event)' }

})
export class ParameterEditComponent {
    @Input("selectedParameter")
    public selectedParameter: CFGParameterModel;

    public currentParameter: CFGParameterModel = new CFGParameterModel();

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public outerPropName: string = null;

    public newRow = {
        KeyName: null,
        Value: null,
        ValueType: null,
        ActualValueType: null
    };

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public coreService: CoreService) {

    }

    ngOnInit() {
        if (this.selectedParameter) {
            this.currentParameter = Object.assign(this.currentParameter, this.selectedParameter);
        }
    }

    public Update() {
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
                } else { this.currentParameter.ParameterValue = '0'; }
            }
            else {
                this.currentParameter.ParameterValue = this.currentParameter.MappedObject[0].Value;
            }
        }
        //Incase of array
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "array") {
            var updatedArr = [];

            var newObject = new Object();
            for (var val of this.currentParameter.MappedArray) {
                newObject = new Object();
                for (var newObj of val) {
                    if (newObj.KeyName) {
                        if (newObj.ValueType == 'boolean') {
                            if (newObj.ValueType == newObj.ActualValueType) {
                                newObject[newObj.KeyName] = newObj.Value == 'true' ? true : false;
                            } else { newObject[newObj.KeyName] = newObj.Value == 'true' ? 'true' : 'false'; }
                        } else {
                            newObject[newObj.KeyName] = newObj.Value;
                        }
                    } else {
                        newObject = newObj.Value;
                    }
                }
                updatedArr.push(newObject);
            }

            this.currentParameter.ParameterValue = JSON.stringify(updatedArr);
        }
        //Incase of Value LookUp
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "value-lookup") {

        }//Incase of arrayobj
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "arrayobj") {
            var originalObj = JSON.parse(this.currentParameter.ParameterValue);

            this.TraverseArrayObj(originalObj, this.currentParameter.MappedObject);

            this.currentParameter.ParameterValue = JSON.stringify(originalObj);

        }
        //Incase of jsonobj
        else if (this.currentParameter && this.currentParameter.ValueDataType && this.currentParameter.ValueDataType.toLowerCase() == "jsonobj") {
            var originalObj = JSON.parse(this.currentParameter.ParameterValue);

            this.TraverseJsonObj(originalObj, this.currentParameter.MappedObject);

            this.currentParameter.ParameterValue = JSON.stringify(originalObj);
        }
        else {
            this.msgBoxServ.showMessage("Failed", ["Sorry! Cannot Edit this parameter...Try directly from Db.."])
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

    public TraverseArrayObj(mainObj: any, mapObj: Array<MappedObj>) {

        for (var property in mainObj) {
            if (typeof mainObj[property] == 'object') {
                mainObj[property].forEach(val => {
                    mapObj.forEach(ma => {
                        if (mainObj[property].includes(ma.Value)) {

                        } else {
                            mainObj[property].splice(mainObj[property].indexOf(ma.Value), 1);
                        }
                    })

                })

                mapObj.forEach((val, index) => {
                    if (val.KeyName == property) {
                        var obj = val;
                        var type = obj.ValueType;
                        var actualType = obj.ActualValueType;
                        var data = mainObj[property].filter(function (el) {
                            return el == obj.Value;

                        });

                        if (data == null) {
                        } else if (data == obj.Value) {
                        }
                        else {
                            mainObj[property].push(obj.Value);
                        }
                    }
                });
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

    public TraverseJsonObj(mainObj: any, mapObj: Array<MappedObj>) {
        for (var property in mainObj) {
            if (typeof mainObj[property] == 'object') {
                this.outerPropName = property;
                this.TraverseJsonObj(mainObj[property], mapObj);
            } else {
                if (property != 'remove') {
                    var obj = mapObj.find(val => val.KeyName == property && val.OuterKeyName == this.outerPropName);
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
                    this.msgBoxServ.showMessage("Success", ["Parameter updated successfully."])
                } else {
                    this.msgBoxServ.showMessage("Failed", ["Sorry! Cannot Edit this parameter...Try directly from Db.."])
                }
            });
    }

    public CallBackLoadParameters(res) {
        if (res.Status == "OK") {
            this.coreService.Parameters = res.Results;
            this.coreService.SetTaxLabel();
            this.coreService.SetCurrencyUnit();
            this.coreService.SetCalendarADBSButton();
            this.coreService.SetLocalNameFormControl();
            this.coreService.SetCountryMapOnLandingPage();
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

    public DeleteRow(obj, ind) {
        var d = this.getCount(obj.KeyName);
        if (d < 2) {
            console.log("Cannot be cancelled.");
        } else {
            this.currentParameter.MappedObject.splice(ind, 1);
        }
    }

    public AddNewRow(obj, ind) {
        let newobj = _.clone(obj);
        newobj.Value = null;
        this.currentParameter.MappedObject.splice(ind + 1, 0, newobj);
    }

    //function to count ocurrences of mapped object 
    public getCount(prop) {
        let arr = this.currentParameter.MappedObject;
        var count = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].KeyName == prop) {
                count++;
            }
        }
        return count;
    }

    //anjana:7May'21: close popup on escape key enter
    public hotkeys(event) {
        if (event.keyCode == 27) {
          this.callbackAdd.emit({submit: false});
        }
      }
}
