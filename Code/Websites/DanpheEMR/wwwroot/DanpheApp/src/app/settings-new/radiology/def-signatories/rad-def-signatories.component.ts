import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { Employee } from '../../../employee/shared/employee.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { CFGParameterModel } from '../../shared/cfg-parameter.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  selector: 'rad-def-signatories',
  templateUrl: './rad-def-signatories.html',

})
export class RadDefSignatoriesComponent implements OnInit {

  allRadSignatoryEmpList: Array<Employee> = [];
  selRadSignatoriesFromParam: Array<number> = [];


  constructor(public coreService: CoreService,
    public settingsBlService: SettingsBLService, public msgBoxServ:MessageboxService) {

    this.LoadRadSignatoriesFromParameter();
    this.LoadAllRadEmployees();

  }

  LoadRadSignatoriesFromParameter() {

    let param = this.coreService.Parameters.find(p => p.ParameterGroupName == "Radiology" && p.ParameterName == "DefaultSignatoriesEmployeeId");
    console.log(param);
    if (param) {
      if (param.ParameterValue) {
        //param value should be in this format: '{"empIdList":[1,2,3,4,...]}'
        let paramValJson = JSON.parse(param.ParameterValue);
        if (paramValJson) {
          this.selRadSignatoriesFromParam = paramValJson.empIdList;
        }
      }
    }
  }

  public LoadAllRadEmployees() {

    this.settingsBlService.GetRadSignatoryEmps()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allRadSignatoryEmpList = res.Results;
          this.BindEmployeeListToCheckbox();
        }
      });
  }


  BindEmployeeListToCheckbox() {
    if (this.allRadSignatoryEmpList && this.allRadSignatoryEmpList.length > 0) {
      //add a property IsSelected to all Employes in array,
      //this property will be used for model binding of Checkboxes.
      this.allRadSignatoryEmpList.forEach(emp => {
        emp["IsSelected"] = false;
        //Compare the Emplyeeid with exting ones and make the checkbo -> Checked.
        this.selRadSignatoriesFromParam.forEach(num => {
          if (emp.EmployeeId == num) {
            emp["IsSelected"] = true;
          }
        });
      });
    }
  }
  ngOnInit() {

  }

  Update() {
    let selEmpIdArr: Array<number> = [];
    this.allRadSignatoryEmpList.forEach(value => {
      if (value["IsSelected"] == true) {
        selEmpIdArr.push(value.EmployeeId);
      }
    });

    let signParamValue = { empIdList: selEmpIdArr };
    let paramValueStr = JSON.stringify(signParamValue);


    let paramToUpdate = this.coreService.Parameters.find(p => p.ParameterGroupName == "Radiology" && p.ParameterName == "DefaultSignatoriesEmployeeId");
    if (paramToUpdate) {
      paramToUpdate.ParameterValue = paramValueStr;

      this.settingsBlService.UpdateParameterValue(paramToUpdate)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Default Signatories updated successfully"]);
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Couldn't update Default Signatories, pls check log for details."]);
            console.log(res.ErrorMessage);
          }

        });

    }


  }

  ////this was neded since the input type of settingsBlService.UpdateParameterValue
  ////is not same as we are getting from server
  //GetParamModelMapped(param): CFGParameterModel {
  //  let retCFGParamModel = new CFGParameterModel();
  //  return retCFGParamModel;
  //}

  CheckBoxChange(a){
    console.log(a);
  }
}
