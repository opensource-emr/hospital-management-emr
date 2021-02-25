import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { LabTest } from "../../shared/lab-test.model";
import { LabReportTemplateModel } from '../../shared/lab-report-template.model';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { ServiceDepartment } from '../../../billing/shared/service-department.model';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CFGParameterModel } from '../../../settings-new/shared/cfg-parameter.model';
import { Employee } from '../../../employee/shared/employee.model';
import { LabSignatoriesViewModel } from  '../shared/lab-signatories.model';
import { CoreService } from '../../../../../src/app/core/shared/core.service';

@Component({
    templateUrl: './edit-signatories.html'
})

export class EditSignatoriesComponent {

    public SignatoriesData: LabSignatoriesViewModel = new LabSignatoriesViewModel();
    
    public DefaultSignatoriesEmpId = [];
    public DefaultHistoCytoSignatoriesEmpId = [];

    constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,public coreService: CoreService,
        public changeDetector: ChangeDetectorRef, public settingsBLService: SettingsBLService) {
        this.GetLabSignatoriesDetails();
    }

    ngOnInit() {       
       
    }
    

    public GetLabSignatoriesDetails() {
        this.labSettingBlServ.GetLabDefaultSignatories()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.SignatoriesData = new LabSignatoriesViewModel();
                    this.DefaultSignatoriesEmpId = [];
                    this.DefaultHistoCytoSignatoriesEmpId = [];
                    this.SignatoriesData = res.Results;
                    this.InitializeData();
                }
            });
    }

    public InitializeData() {
        this.SignatoriesData.AllSignatories.forEach(sign => {
            var signParsed = JSON.parse(sign.ParameterValue);


            if (sign.ParameterName == 'DefaultSignatoriesEmpId') {
                var arr: Employee = new Employee();
                this.SignatoriesData.AllDoctors.forEach(doc => {
                    arr = new Employee();
                    arr = Object.assign(arr, doc);
                    arr["IsSelected"] = false;
                    signParsed.empIdList.forEach(sign => {
                        if (arr.EmployeeId == sign) {
                            arr["IsSelected"] = true;
                        }                
                    });                   
                    this.DefaultSignatoriesEmpId.push(arr);
                });

                
            }
            else if (sign.ParameterName == 'DefaultHistoCytoSignatoriesEmpId') {
                var arr: Employee = new Employee();
                this.SignatoriesData.AllDoctors.forEach(doc => {
                        arr = new Employee();
                        arr = Object.assign(arr, doc);
                        arr["IsSelected"] = false;
                        signParsed.empIdList.forEach(sign => {                            
                            if (arr.EmployeeId == sign) {
                                arr["IsSelected"] = true;
                            }                     
                    });
                        this.DefaultHistoCytoSignatoriesEmpId.push(arr);
                });
               
            }

        });   
       
    }

    Update() {
        this.SignatoriesData.AllSignatories.forEach(sign => {
            var signParsed = JSON.parse(sign.ParameterValue);

            if (sign.ParameterName == 'DefaultSignatoriesEmpId') {
                signParsed.empIdList = [];
                this.DefaultSignatoriesEmpId.forEach(val => {
                    if (val.IsSelected) {
                        signParsed.empIdList.push(val.EmployeeId);
                    }
                });
                sign.ParameterValue = JSON.stringify(signParsed);
            }
            else if (sign.ParameterName == 'DefaultHistoCytoSignatoriesEmpId') {
                signParsed.empIdList = [];
                this.DefaultHistoCytoSignatoriesEmpId.forEach(val => {
                    if (val.IsSelected) {
                        signParsed.empIdList.push(val.EmployeeId);
                    }
                });
                sign.ParameterValue = JSON.stringify(signParsed);
            } 

        });   

        this.labSettingBlServ.UpdateDefaultSignatories(this.SignatoriesData.AllSignatories)
            .subscribe(res => {
                if (res.Status == "OK") {

                    // this.coreService.InitializeParameters().subscribe(res => {                                  
                    // });

                    this.DefaultSignatoriesEmpId = [];
                    this.DefaultHistoCytoSignatoriesEmpId = [];
                    this.GetLabSignatoriesDetails();
                    this.msgBoxServ.showMessage('success', ["Signatories is Updated"]);
                }
            });


    }


}
