import { Component, ChangeDetectorRef } from "@angular/core";
import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CFGParameterModel, MappedObj } from "../../shared/cfg-parameter.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../../security/shared/security.service";
import { User } from "../../../security/shared/user.model";


@Component({
  templateUrl: './parameter-list.html',
})

export class ParameterListComponent {
  public parameterGridColumns: Array<any> = null;
  public parameterList: Array<CFGParameterModel> = null;

  public selectedParameter: CFGParameterModel = new CFGParameterModel();
  public currentUser: User;

  public showEditParameter: boolean = false;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public user: SecurityService) {
    this.parameterGridColumns = this.settingsServ.settingsGridCols.ParameterList;
    this.GetCFGParametersList();
    this.currentUser = this.user.GetLoggedInUser();
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
        this.selectedParameter.MappedArray = [];
        if (this.selectedParameter.ParameterType && this.selectedParameter.ParameterType.toLowerCase() == 'custom') {
          this.ManageMapping();
          this.showEditParameter = true;
        }
        else if (this.currentUser.IsSystemAdmin && this.selectedParameter.ParameterType == null) {
          this.ManageMapping();
          this.showEditParameter = true;
        }
        else if (this.currentUser.IsSystemAdmin && this.selectedParameter.ParameterType.toLowerCase() == 'system') {
          this.ManageMapping();
          this.showEditParameter = true;
        }

        else {
          this.msgBoxServ.showMessage('Failed !!', ["Sorry You cannot edit this System field."])
        }
      }
        break;
      default:
        break;
    }
  }


  public ManageMapping() {
    var eachJsonItem: MappedObj = new MappedObj();
    var obj1: Array<MappedObj> = [];

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
        else if (eachJsonItem.ActualValueType == 'number') {
          eachJsonItem.ValueType = "number";
          eachJsonItem.Value = newObj[prop];
          this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        else {
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
    //Incase of Array
    else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "array") {
      var mainObj = JSON.parse(this.selectedParameter.ParameterValue);

      for (var newObj of mainObj) {
        if (typeof newObj == "string") {

          eachJsonItem = new MappedObj();
          eachJsonItem.KeyName = null;
          eachJsonItem.Value = newObj;
          eachJsonItem.ValueType = "string";
          eachJsonItem.ActualValueType = this.selectedParameter.ValueDataType;
          obj1.push(eachJsonItem);

          this.selectedParameter.MappedArray.push(obj1);
          obj1 = [];
          new MappedObj();
        }

        else {
          for (var prop in newObj) {
            eachJsonItem = new MappedObj();
            eachJsonItem.KeyName = prop;
            eachJsonItem.Value = String(newObj[prop]);


            eachJsonItem.ActualValueType = typeof (newObj[prop]);
            eachJsonItem.ValueType = typeof (newObj[prop]);

            if (eachJsonItem.ActualValueType == 'string' && (eachJsonItem.Value == 'true' || eachJsonItem.Value == 'false')) {
              eachJsonItem.ValueType = 'boolean';
            }

            obj1.push(eachJsonItem);

          }

          this.selectedParameter.MappedArray.push(obj1);
          obj1 = [];
        }
      }
    }
    //Incase of Value LookUp
    else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "value-lookup") {
      var allObjects = JSON.parse(this.selectedParameter.ValueLookUpList);
      for (var newObj of allObjects) {
        eachJsonItem = new MappedObj();
        eachJsonItem.KeyName = null;
        eachJsonItem.Value = newObj;
        eachJsonItem.ValueType = "string";
        obj1.push(eachJsonItem);
        this.selectedParameter.MappedArray.push(obj1);
        obj1 = [];
        new MappedObj();
      }
    }
    //Incase of arrayobj 
    else if (this.selectedParameter && this.selectedParameter.ValueDataType && this.selectedParameter.ValueDataType.toLowerCase() == "arrayobj") {
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
          this.TraverseArrayObj(eachJsonItem.Value, eachJsonItem.KeyName);
        }
        else if (eachJsonItem.ActualValueType == 'number') {
          eachJsonItem.ValueType = "number";
          eachJsonItem.Value = newObj[prop];
          this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        else {
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
    } else if (this.selectedParameter && this.selectedParameter.ValueDataType && (this.selectedParameter.ValueDataType.toLowerCase() == "jsonobj")) {
      var newObj = JSON.parse(this.selectedParameter.ParameterValue);
      for (var prop in newObj) {
        eachJsonItem = new MappedObj();
        eachJsonItem.OuterKeyName = prop;
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
          this.TraverseNestedJson(eachJsonItem.Value, eachJsonItem.OuterKeyName);
        }
        else if (eachJsonItem.ActualValueType == 'number') {
          eachJsonItem.ValueType = "number";
          eachJsonItem.Value = newObj[prop];
          this.selectedParameter.MappedObject.push(eachJsonItem);
        }
        else {
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

  //for ValueDataType = arrayobj: Anjana
  public TraverseArrayObj(obj: any, keyname) {
    for (var property in obj) {
      if (typeof obj[property] == 'object') {
        this.TraverseArrayObj(obj[property], keyname);
      } else {
        if (property != 'remove') {
          var eachJsonItem: MappedObj = new MappedObj();
          eachJsonItem.ActualValueType = typeof obj[property];
          eachJsonItem.ValueType = eachJsonItem.ActualValueType;
          eachJsonItem.KeyName = keyname;
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

  public TraverseNestedJson(obj: any, keyname) {
    for (var property in obj) {
      if (typeof obj[property] == 'object') {
        this.TraverseArrayObj(obj[property], keyname);
      } else {
        if (property != 'remove') {
          var eachJsonItem: MappedObj = new MappedObj();
          eachJsonItem.ActualValueType = typeof obj[property];
          eachJsonItem.ValueType = eachJsonItem.ActualValueType;
          eachJsonItem.OuterKeyName = keyname;
          eachJsonItem.KeyName = property;
          eachJsonItem.Value = obj[property].toString();
          // if (eachJsonItem.ActualValueType != 'number' && eachJsonItem.Value == 'true') {
          //   eachJsonItem.ValueType = 'boolean';
          //   eachJsonItem.Value = eachJsonItem.Value;
          // } else if (eachJsonItem.ActualValueType != 'number' && eachJsonItem.Value == 'false') {
          //   eachJsonItem.ValueType = 'boolean';
          //   eachJsonItem.Value = "false";
          // }
          this.selectedParameter.MappedObject.push(eachJsonItem);
        }
      }
    }
  }

}

