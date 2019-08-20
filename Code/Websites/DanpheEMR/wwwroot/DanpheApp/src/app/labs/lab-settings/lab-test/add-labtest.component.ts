import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { LabTest } from "../../shared/lab-test.model";
import { Observable } from 'rxjs/Observable';
import { LabReportTemplateModel } from '../../shared/lab-report-template.model';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { Subscription } from "rxjs/Rx";
import { ServiceDepartment } from '../../../billing/shared/service-department.model';
import { SettingsBLService } from '../../../settings/shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../../../src/app/shared/common-models';
import { LabTestComponentMap } from '../shared/lab-test-component-map.model';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';

@Component({
  selector: 'add-labtest',
  templateUrl: './add-labtest.html'
})

export class AddLabTestComponent {
  @Input() labTest: LabTest = new LabTest();

  public allLabTestComponentList: Array<LabComponentModel> = new Array<LabComponentModel>();

  labReportList: Array<LabReportTemplateModel> = new Array<LabReportTemplateModel>();
  @Input() showLabTestAddPage: boolean = false;
  @Input() update: boolean = false;
  @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();
  public rptTemplateId: number = null;
  public specimenList: Array<any> = new Array<any>();
  public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public selectedDepartment: any;
  public selectedReportTemplate: any;
  public templateType: string = 'normal';
  public specimens = [{ Name: "Blood", IsSelected: false },
  { Name: "Urine", IsSelected: false },
  { Name: "Stool", IsSelected: false },
  { Name: "Pus", IsSelected: false },
  { Name: "Sputum", IsSelected: false },
  { Name: "Body Fluid", IsSelected: false },
  { Name: "Semen", IsSelected: false },
  { Name: "Tissue", IsSelected: false },
  { Name: "Throat Swab", IsSelected: false },
  { Name: "Vaginal Swab", IsSelected: false },
  { Name: "Biopsy", IsSelected: false },
  { Name: "N/A", IsSelected: false }];
  public RunNumType = ["normal", "cyto", "histo"];
  public loading: boolean = false;

  public selectedLabTestComponent: LabComponentModel = new LabComponentModel();
  public LookUpNames: Array<CoreCFGLookUp> = new Array<CoreCFGLookUp>();
  public showAddNewLabComponent: boolean = false;

  //public timer;
  //public reloadFrequency: number = 3000;
  //public sub: Subscription;

  constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public settingsBLService: SettingsBLService) {
    this.setDefaultTemplate();
    this.GetSrvDeptList();
    this.GetAllLookUpNames();
    this.GetAllComponentList();
  }

  ngOnInit() {
    if (this.update) {
      this.specimenList = new Array<any>();
      let componentListOfCurrentLabTest: Array<LabComponentModel> = new Array<LabComponentModel>();
      let spcList: Array<string> = JSON.parse(this.labTest.LabTestSpecimen);

      this.specimens.forEach(sp => {
        if (spcList.find(a => a == sp.Name) != null) {
          sp.IsSelected = true;
          this.specimenList.push(sp.Name);
        }
      });

      this.labTest = Object.assign(new LabTest(), this.labTest);
      componentListOfCurrentLabTest = this.labTest.LabTestComponentsJSON;
      if (this.labTest.LabTestComponentMap && this.labTest.LabTestComponentMap.length) {
        this.labTest.LabTestComponentMap.forEach(val => {
          val
          val.LabTestComponent = componentListOfCurrentLabTest.find(comp => comp.ComponentId == val.ComponentId);
        });
      } else {
        let newCompMap = new LabTestComponentMap();
        newCompMap.LabTestComponent = new LabComponentModel();
        newCompMap.LabTestComponent.ComponentName = '';
        this.labTest.LabTestComponentMap.push(newCompMap);
      }

    }
    else {
      this.labTest.RunNumberType = 'normal';
      let newCompMap = new LabTestComponentMap();
      newCompMap.LabTestComponent = new LabComponentModel();
      newCompMap.LabTestComponent.ComponentName = '';
      this.labTest.LabTestComponentMap.push(newCompMap);
    }

    //this.timer = Observable.timer(0, this.reloadFrequency);
    // subscribing to a observable returns a subscription object
    //this.sub = this.timer.subscribe(t => this.GetAllComponentList(t));
  }

  ngOnDestroy() {
    // Will clear when component is destroyed e.g. route is navigated away from.
   // clearInterval(this.timer);
    //this.sub.unsubscribe();//IMPORTANT to unsubscribe after going away from current component.
  }

  public SetAllComponentsIntoTest() {

  }

  public GetAllComponentList() {    
    this.labSettingBlServ.GetAllLabTestComponents()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allLabTestComponentList = res.Results;
        } else {
          this.msgBoxServ.showMessage("failed", ["Cannot Get the List of Lab Test Components"]);
        }
      });
  }

  public GetAllLookUpNames() {
    this.labSettingBlServ.GetAllLabLookUpNames()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.LookUpNames = res.Results;
        } else {
          this.msgBoxServ.showMessage("failed", ["Cannot Get the LookUp Name list for Lab Test Components"]);
        }
      });

  }

  public GetSrvDeptList() {

    this.settingsBLService.GetServiceDepartments()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            //this.srvdeptList = res.Results;
            var allDepartmentList = res.Results;
            this.srvdeptList = allDepartmentList.filter(dpt => {
              if (dpt.IntegrationName && dpt.IntegrationName.toLowerCase() == 'lab') {
                return true;
              }
            });

          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Failed Check log for error message"]);
          console.log(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get service departments, Check log for error message"]);
        });

  }

  myListFormatter(data: any): string {
    let html = data["ServiceDepartmentName"];
    return html;
  }

  reportListFormatter(data: any): string {
    let html = data["ReportTemplateName"];
    if (data["Description"] && data["Description"].trim().length) {
      html = html + data["Description"];
    }
    return html;
  }

  //used to format display of item in ng-autocomplete.
  public componentListFormatter(data: any): string {
    let html = data["ComponentName"] + ' / ' + data["DisplayName"];
    return html;
  }

  public AssignSelectedTemplate() {
    if (this.selectedReportTemplate && this.selectedReportTemplate.ReportTemplateID) {
      this.labTest.ReportTemplateId = this.selectedReportTemplate.ReportTemplateID;
      var rptId = this.labTest.ReportTemplateId;
      var report = this.labReportList.find(val => val.ReportTemplateID == rptId);
      this.templateType = report.TemplateType;
      this.labTest.TemplateType = this.templateType;
    }
    else {
      this.selectedReportTemplate = '';
      this.labTest.ReportTemplateId = 0;
      this.msgBoxServ.showMessage("failed", ['Please Select Report Template From List']);
    }
  }


  public setDefaultTemplate(): void {
    this.labSettingBlServ.GetAllReportTemplates().
      subscribe(res => {
        if (res.Status == 'OK') {
          this.labReportList = res.Results;

          if (!this.update) {
            let defTempId = this.labReportList.find(x => x.IsDefault == true);
            if (defTempId != null) {
              this.labTest.ReportTemplateId = defTempId.ReportTemplateID;
              this.rptTemplateId = defTempId.ReportTemplateID;
              this.templateType = defTempId.TemplateType;
              this.labTest.TemplateType = this.templateType;
            }
          } else {
            var template = this.labReportList.find(val => val.ReportTemplateID == this.labTest.ReportTemplateId);
            if (template) {
              this.templateType = template.TemplateType;
              this.selectedReportTemplate = template;
              this.labTest.ReportTemplateId = template.ReportTemplateID;
              this.labTest.TemplateType = this.templateType;
            }

          }
          this.labReportList.forEach(val => {
            if (val.Description && val.Description != null) {
              val.Description = '(' + val.Description + ')';
            }
          });
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }

      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to Load ReportTemplate List"]);
        });
  }

  public AddLabTest() {
    let validationMsg = this.CheckIfDataIsValid();
    if (this.loading) {
      if (validationMsg.IsValid) {
        this.labTest.LabTestSpecimenSource = 'Peripheral Vein';
        this.labTest.LOINC = null;
        this.labTest.ServiceDepartmentId = this.selectedDepartment.ServiceDepartmentId;
        //this.labTest.LabTestGroupId = 1;

        for (var j in this.labTest.LabTestValidator.controls) {
          this.labTest.LabTestValidator.controls[j].markAsDirty();
          this.labTest.LabTestValidator.controls[j].updateValueAndValidity();
        }

        //this.labTest.ReportTemplateId = this.rptTemplateId;

        if (this.labTest.IsValidCheck(undefined, undefined)) {
          if ((this.labTest.HasNegativeResults && this.labTest.NegativeResultText != null) || !this.labTest.HasNegativeResults) {
            this.labSettingBlServ.PostNewLabTest(this.labTest).
              subscribe(res => {
                if (res.Status == 'OK') {
                  this.CallBackAddUpdate(res);
                  this.msgBoxServ.showMessage("success", ['New LabTest Added']);
                } else {
                  this.msgBoxServ.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
                  this.loading = false;
                }
              });
          }
          else {
            this.msgBoxServ.showMessage("failed", ['Please Enter NegativeResult Description']);
            this.loading = false;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ['There is Validation Error. Please Try Later',]);
          this.loading = false;
        }
      }
      else {
        this.msgBoxServ.showMessage("error", validationMsg.ErrMsg);
        this.loading = false;
      }

    }


  }




  public UpdateLabTest() {

    let validationMsg = this.CheckIfDataIsValid();

    if (this.loading) {
      if (validationMsg.IsValid) {
        this.labTest.LabTestSpecimenSource = 'Peripheral Vein';
        this.labTest.LOINC = null;

        for (var j in this.labTest.LabTestValidator.controls) {
          this.labTest.LabTestValidator.controls[j].markAsDirty();
          this.labTest.LabTestValidator.controls[j].updateValueAndValidity();
        }

        var labTestId = this.labTest.LabTestId;
        this.labTest.LabTestComponentMap.forEach(component => component.LabTestId = labTestId);


        if (this.labTest.IsValidCheck(undefined, undefined)) {
          if ((this.labTest.HasNegativeResults && this.labTest.NegativeResultText != null) || !this.labTest.HasNegativeResults) {
            this.labSettingBlServ.UpdateNewLabTest(this.labTest).
              subscribe(res => {
                if (res.Status == 'OK') {
                  this.CallBackAddUpdate(res);
                  this.msgBoxServ.showMessage("success", ['LabTest Updated.']);
                } else {
                  this.msgBoxServ.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
                  this.loading = false;
                }
              });
            console.log(this.labTest);
          }
          else {
            this.msgBoxServ.showMessage("failed", ['There is Validation Error. Please Try Again',]);
            this.loading = false;
          }
        }

      }
      else {
        this.msgBoxServ.showMessage("error", validationMsg.ErrMsg);
        this.loading = false;
      }
    }





  }

  public CheckIfDataIsValid() {
    let retMsgObj = { IsValid: true, ErrMsg: [] };

    //Removes the componentmapped with empty component
    if (this.labTest.LabTestComponentMap && this.labTest.LabTestComponentMap.length) {
      var validComponent = this.labTest.LabTestComponentMap.reduce((valcomp, actualComp) => {
        if (actualComp.LabTestComponent && actualComp.LabTestComponent.ComponentId && actualComp.IsActive) {
          valcomp.push(actualComp);
        }
        return valcomp;
      }, []);

      if (validComponent && validComponent.length) {
        this.labTest.LabTestComponentMap = validComponent;
      }
      
    }

    if (!this.selectedDepartment && !this.update) {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push('Please Select Lab Category');
    }


    //For template type normal 
    if ((this.templateType == 'normal' || this.templateType == 'culture')) {
      this.labTest.TemplateType = this.templateType;

      //validation for empty labtestcomponent in Lab test
      if (!this.labTest.LabTestComponentMap.length) {
        //retMsgObj.IsValid = false;
        //retMsgObj.ErrMsg.push('Please Select atLeast One Component');
        //this.labTest.LabTestComponentMap.push(new LabTestComponentMap());              
      }
      else {
        this.labTest.LabTestComponentMap.forEach(lbt => {

          //If SequenceNumber is null then assign 100 to it
          if (lbt.DisplaySequence == null) {
            lbt.DisplaySequence = 100;
          } else {
            if (lbt.DisplaySequence < 0) {
              var res = confirm("Negative Number Entered in Display Sequence  will be set to 0! Do you want to continue??");
              if (res) {
                lbt.DisplaySequence = 0;
              }
            }
          }
        });


        //Sorts data based on sequence number
        this.labTest.LabTestComponentMap.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });



      }


    }
    //For template type html
    else {

      //If Template Type of HTML i.e. Ck Editor is selected Or There is no any ComponentJSON then 
      //remove all the ComponentJSONs and add single ComponentJSON whose name is same as LabTest Name
      //and no need of other fields(Make Sure there is aTLeast one ComponentJSON)
      if (this.templateType == 'html') {
        this.labTest.TemplateType = this.templateType;
        this.labTest.LabTestComponentsJSON = [];
        this.labTest.LabTestComponentsJSON.push(new LabComponentModel());
        this.labTest.LabTestComponentsJSON[0].ComponentName = this.labTest.LabTestName;
        this.labTest.LabTestComponentsJSON[0].DisplayName = this.labTest.LabTestName;
        this.labTest.LabTestComponentsJSON[0].DisplaySequence = 100;

        let labTestComps = this.labTest.LabTestComponentsJSON.map(comp => {
          return _.omit(comp, ['LabComponentJsonValidator']);
        });
        this.labTest.LabTestComponentsJSON = labTestComps;
        if (this.specimenList.length > 0) {
          this.labTest.LabTestSpecimen = JSON.stringify(this.specimenList);
        }
        else {
          this.labTest.LabTestSpecimen = '[]';
        }

        this.labTest.LabTestComponentMap = [];
        let newCompMap = new LabTestComponentMap();
        newCompMap.LabTestComponent = new LabComponentModel();
        this.labTest.LabTestComponentMap.push(newCompMap);
        this.labTest.LabTestComponentMap[0].LabTestComponent = this.labTest.LabTestComponentsJSON[0];

      }
    }


    if (this.specimenList.length > 0) {
      this.labTest.LabTestSpecimen = JSON.stringify(this.specimenList);
    }
    else {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push('Please Select atLeast One Specimen');
    }


    if (!this.labTest.DisplaySequence || (this.labTest.DisplaySequence > 9999999)) {
      this.labTest.DisplaySequence = 1000;
    }

    if (!(this.labTest.ReportingName && this.labTest.ReportingName.trim().length)) {
      this.labTest.ReportingName = this.labTest.LabTestName;
    }

    //If interpretation is not entered, set it as null <anish: 10Sept'18>
    if (!(this.labTest.Interpretation && this.labTest.Interpretation.trim().length)) {
      this.labTest.Interpretation = null;
    }

    if (!this.labTest.ReportTemplateId) {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push('Please Select Report Template');
    }



    return retMsgObj;

  }

  public CallBackAddUpdate(res) {
    this.labTest = new LabTest();  
    if (res.Status == "OK") {
      this.sendDataBack.emit({ labtest: res.Results});
    }
    else {
      this.msgBoxServ.showMessage("error", ["Check log for details"]);
    }
    this.loading = false;
  }

  public Close() {
    this.showLabTestAddPage = false;
  }

  public callChange() {
    this.labTest.NegativeResultText = null;
  }

  public SpecimenChkOnChange(spcmn) {
    if (spcmn.IsSelected) {
      this.specimenList.push(spcmn.Name);
    } else {
      const itmNum: number = this.specimenList.indexOf(spcmn.Name);
      if (itmNum !== -1) {
        this.specimenList.splice(itmNum, 1);
      }
    }
  }

  public ComponentSelected(ind: number) {
    this.labTest.LabTestComponentMap[ind].ComponentId = this.labTest.LabTestComponentMap[ind].LabTestComponent.ComponentId;
  }

  public DeleteRow(ind: number) {
    this.labTest.LabTestComponentMap.splice(ind, 1);
  }
  public AddNewComponentRow(index=null) {
    let newCompMap = new LabTestComponentMap();
    newCompMap.LabTestComponent = new LabComponentModel();
    newCompMap.LabTestComponent.ComponentName = '';
    this.labTest.LabTestComponentMap.push(newCompMap);
    let ind = this.labTest.LabTestComponentMap.length-1;
    this.FocusCurrentItem(ind);
    
  }


  public GetAddedAndUpdatedData($event) {
    if ($event.success) {
      if ($event.components) {
        $event.components.forEach(val => {
          this.allLabTestComponentList.push(val);
        });
      }      
    }
    this.showAddNewLabComponent = false;
  }

  public FocusCurrentItem(index: number) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById('testcomp-' + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 500);
  }
}
