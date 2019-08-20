/*
 Description:
   - It is a reusable component and is used in lab-tests-results.component.ts
   - templateReport is passed from lab-tests-results.component.ts
   - It either adds or updates the lab results.
   - It contains all the result validation logic.
    
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 3rd July 2018           created            
                                                     
 -------------------------------------------------------------------
 */


import { LabsBLService } from "../../shared/labs.bl.service";
import { Input, Component, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { LabReportVM, ReportLookup } from "../../reports/lab-report-vm";
import { LabReport } from "../../shared/lab-report";
import * as moment from 'moment/moment';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LookupsModel, CoreService } from "../../../core/shared/core.service";
import { LabResult_TemplateVM, LabResult_TestVM, LabTestSpecimenModel } from "../../shared/lab-view.models";
import { LabTestComponent } from "../../shared/lab-component.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { LabReportTemplateModel } from "../../shared/lab-report-template.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { NepaliCalendarService } from "../../../../../src/app/shared/calendar/np/nepali-calendar.service";

@Component({
  selector: 'danphe-lab-add-result',
  templateUrl: "./lab-tests-add-result.html",
  styleUrls: ['./lab-tests-add-result.style.css']
})

export class LabTestsAddResultComponent {

  @Input("showAddEditResult")
  public showAddEditResult: boolean;
  public templateReport: LabReportVM;
  @Input("isEditResult")
  public isEditResult: boolean = false;
  public isReadOnly: boolean = false;
  @Output("callback-addupdate")
  callBackAddUpdate: EventEmitter<Object> = new EventEmitter<Object>();
  @Output("callback-cancel")
  callBackCancel: EventEmitter<Object> = new EventEmitter<Object>();


  public labLookups = new Array<LookupsModel>();
  public selectedComponents: Array<LabTestComponent> = new Array<LabTestComponent>();
  public showWarningConfirmBox: boolean = false;

  public reportTemplates: Array<LabReportTemplateModel> = []; // new object model added...
  public selectedHTMLTemplate: any;//this is for HTML Type template only..
  public templateName: any;

  public changeReportTemplate: boolean = false;

  public loading: boolean = false;
  public uncheckedWarningShown: boolean = false;//show this warning only once, showing many times will be irritating.
  public comments: string = null;
  public selReqIdList: Array<number>;
  public maximize: boolean = false;
  public negativeTestComponentResultId: number = 0;
  public ckHtmlContent: string = null;

  public cultureSpecimen: Array<LabTestSpecimenModel> = [];

  public LookUpDetail: ReportLookup;

  public visitType = null;
  public RunNumberType = null;
  public showChangeSample: boolean = false;
  public showConfirmationBox: boolean = false;
  public requisitionIdList: Array<number> = new Array<number>();
  public sampleCode = { RunNumber: 0, SampleCreatedOn: null, SampleCode: 0 };
  public sampleCodeExistingDetail = { Exisit: false, PatientName: null, PatientId: null, SampleCreatedON: null };

  public hasInsurance: boolean = false;


  constructor(public labBLService: LabsBLService, public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public npCalendarService: NepaliCalendarService,
    public coreService: CoreService, public patientService: PatientService) {
    this.labLookups = this.coreService.GetModuleLookups("Lab");
  }

  @Input("templateReport")
  public set tempReport(_templateReport: LabReportVM) {
    if (_templateReport) {
      this.templateReport = _templateReport;
      this.LookUpDetail = this.templateReport.Lookups;
      this.changeReportTemplate = false;
      this.MapTestAndComponents();
      this.GetAllReportTemplates();

    }
  }

  AssignSelectedTemplate() {
    if (this.selectedHTMLTemplate && this.selectedHTMLTemplate.ReportTemplateID && this.templateReport.TemplateId != this.selectedHTMLTemplate.ReportTemplateID) {
      if (this.templateReport.TemplateHTML) {
        var change: boolean;
        change = window.confirm('Changes will be discarded. Do you want to change anyway?');
        if (change) {
          this.templateReport.TemplateId = this.selectedHTMLTemplate.ReportTemplateID;
          this.templateReport.Templates.forEach(template => {
            template.TemplateId = this.selectedHTMLTemplate.ReportTemplateID;
          });
          this.templateReport.TemplateName = this.selectedHTMLTemplate.ReportTemplateName;
          this.templateReport.Header = this.selectedHTMLTemplate.HeaderText;
          this.templateName = this.selectedHTMLTemplate.ReportTemplateName;
          //  this.templateReport.Templates[0].Tests[0].Components[0].Value = this.selectedHTMLTemplate.TemplateHTML;
          this.templateReport.Templates.forEach(val => {
            val.Tests.forEach(data => {
              data.Components.forEach(val => {
                val.TemplateId = this.selectedHTMLTemplate.ReportTemplateID;
                val.Value = this.selectedHTMLTemplate.TemplateHTML;
                this.ckHtmlContent = this.selectedHTMLTemplate.TemplateHTML;
              })
            })
          })
        }
        else {
          //this.selectedHTMLTemplate = "";
        }
      }
    }


  }
  showLists() {
    this.changeReportTemplate = true;
  }


  public GetAllReportTemplates() {
    this.labBLService.GetAllReportTemplates()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.reportTemplates = res.Results;
          this.changeReportTemplate = false;
          if (this.reportTemplates && this.templateReport && this.templateReport.Templates.length)
            this.SetTemplate();

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Failed to get Report Templates. Check Log"]);
          console.log(res.ErrorMessage);
        }
      });
  }
  public SetTemplate() {
    if (this.templateReport.TemplateType.toLowerCase() == "html") {
      let template = this.reportTemplates.find(a => a.ReportTemplateID == this.templateReport.Templates[0].TemplateId);
      this.selectedHTMLTemplate = template;
      if (this.selectedHTMLTemplate) {
        let name = this.selectedHTMLTemplate.ReportTemplateName;
        this.templateName = name;
      }
    }
  }

  ReportTempListFormatter(data: any): string {
    return data["ReportTemplateName"];
  }

  MapTestAndComponents() {
    if (this.templateReport.Templates.length) {
      this.templateReport.Templates.forEach(template => {
        let testList = new Array<LabResult_TestVM>();
        template.Tests.forEach(labTest => {
          //this.comments = template.Tests[0].Comments;

          //let components: Array<any> = JSON.parse(labTest.ComponentJSON);
          if (labTest.HasInsurance) {
            this.hasInsurance = labTest.HasInsurance;
          }

          this.requisitionIdList.push(labTest.RequisitionId);
          //To check if the new Custom Component is added and there is empty ComponentJSON
          if (labTest.ComponentJSON && labTest.ComponentJSON.length == 0 && labTest && labTest.Components.length > 0) {
            var comp: LabTestComponent = new LabTestComponent();
            for (var i = 0; i < labTest.Components.length; i++) {
              var compArray: Array<LabTestComponent> = [];

              comp.ComponentName = labTest.Components[i].ComponentName;
              compArray.push(comp);
            }
            labTest.ComponentJSON = compArray;
          }


          let newLabtestVm: LabResult_TestVM = new LabResult_TestVM();
          newLabtestVm = Object.assign(newLabtestVm, labTest);
          newLabtestVm.Components = new Array<LabTestComponent>();

          let length = labTest.Components.length;



          //let newLabtestVm: LabResult_TestVM = new LabResult_TestVM();
          //newLabtestVm = Object.assign(newLabtestVm, labTest);
          //newLabtestVm.Components = new Array<LabTestComponent>();
          //let components: Array<any> = JSON.parse(labTest.ComponentJSON);
          //let length = labTest.Components.length;

          //in case of edit length >0 there are already components with the test
          if (length > 0) {
            if (!labTest.IsNegativeResult) {

              for (var i = 0; i < length; i++) {
                var _testComponent: LabTestComponent = new LabTestComponent();
                _testComponent.ComponentName = labTest.Components[i].ComponentName;

                if (template.TemplateType == "html") {
                  this.ckHtmlContent = labTest.Components[i].Value;
                }

                if (labTest.ComponentJSON && labTest.ComponentJSON.length) {
                  let _cmp = labTest.ComponentJSON.find(a => a.ComponentName.toLowerCase() == _testComponent.ComponentName.toLowerCase());
                  if (_cmp) {
                    _testComponent = Object.assign(_testComponent, labTest.Components[i]);
                    _testComponent.LabTestId = labTest.LabTestId;
                    _testComponent.RequisitionId = labTest.RequisitionId;
                    _testComponent.TemplateId = template.TemplateId;
                    _testComponent.ValueType = _cmp.ValueType;
                    _testComponent.ControlType = _cmp.ControlType;
                    _testComponent.DisplaySequence = _cmp.DisplaySequence;
                    _testComponent.Range = _cmp.Range;
                    _testComponent.ChildRange = _cmp.ChildRange;
                    _testComponent.MaleRange = _cmp.MaleRange;
                    _testComponent.FemaleRange = _cmp.FemaleRange;

                    //Added by Anish 3 Oct for Applying Group100 validation in Edit Option
                    if (_cmp.GroupName) {
                      _testComponent.GroupName = _cmp.GroupName;
                    }


                    let lkpSrc = _cmp ? this.labLookups.find(a => a.LookupName == _cmp.ValueLookup) : null;
                    _testComponent.ValueDataSource = (_cmp && _cmp.ValueLookup) && lkpSrc ? JSON.parse(lkpSrc.LookupDataJson) : [];

                    for (var a in _testComponent.ComponentValidator.controls) {
                      _testComponent.ComponentValidator.controls[a].markAsDirty();
                      _testComponent.ComponentValidator.controls[a].updateValueAndValidity();
                    }
                    this.CheckIfAbnormal(_testComponent, labTest);
                  }
                  //This adds those Components that are in the testComponent Result but not in ComponentJSON of Test InCase Of +ve Result
                  else {
                    _testComponent = Object.assign(_testComponent, labTest.Components[i]);
                    _testComponent.LabTestId = labTest.LabTestId;
                    _testComponent.RequisitionId = labTest.RequisitionId;
                    _testComponent.TemplateId = template.TemplateId;
                    _testComponent.Range = _testComponent.RangeDescription;
                    _testComponent.IndentationCount = 1;
                    _testComponent.ValueType = "string";



                    for (var a in _testComponent.ComponentValidator.controls) {
                      _testComponent.ComponentValidator.controls[a].markAsDirty();
                      _testComponent.ComponentValidator.controls[a].updateValueAndValidity();
                    }

                    this.CheckIfAbnormal(_testComponent, labTest);

                  }
                }

                newLabtestVm.Components.push(_testComponent);
              }
            }
            else {
              var _testComponent: LabTestComponent = new LabTestComponent();
              _testComponent = Object.assign(_testComponent, labTest.Components[0]);

              this.negativeTestComponentResultId = _testComponent.TestComponentResultId;

            }


            //To add remaining Empty JSON Components that are in ComponentJSON but not added in TestComponent Result                      
            labTest.ComponentJSON.forEach(cmpnt => {
              if (newLabtestVm.Components.filter(c => c.ComponentName.toLowerCase() == cmpnt.ComponentName.toLowerCase()).length > 0) {
                //do nothing
              }

              else {
                let newComp: LabTestComponent = new LabTestComponent();
                newComp.ComponentName = cmpnt.ComponentName;
                newComp.IsSelected = false;
                newComp = Object.assign(newComp, cmpnt);
                newComp.LabTestId = labTest.LabTestId;
                newComp.RequisitionId = labTest.RequisitionId;
                newComp.TemplateId = template.TemplateId;
                newComp.DisplaySequence = cmpnt.DisplaySequence;

                let lkpSrc = cmpnt ? this.labLookups.find(a => a.LookupName == cmpnt.ValueLookup) : null;
                newComp.ValueDataSource = (cmpnt && cmpnt.ValueLookup) && lkpSrc ? JSON.parse(lkpSrc.LookupDataJson) : [];


                newComp.IsGroupValid = true;
                newComp.ComponentValidator.disable();
                newLabtestVm.Components.push(newComp);
              }

            });

            newLabtestVm.Components.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });

          }
          //in case of add there are no components with the test so we need to add the components needed for the test
          else {

            labTest.ComponentJSON.forEach(component => {

              var _testComponent: LabTestComponent = new LabTestComponent();
              if (component) {
                _testComponent = Object.assign(_testComponent, component);
                _testComponent.ComponentName = component.ComponentName;
                _testComponent.LabTestId = labTest.LabTestId;

                if (template.TemplateType == "html") {
                  //_testComponent.Value = this.templateReport.TemplateHTML;
                  this.ckHtmlContent = this.templateReport.TemplateHTML;
                }
                if (template.TemplateType == 'culture') {
                  _testComponent.IsSelected = false;
                  newLabtestVm.SelectAll = false;
                }

                if (newLabtestVm.VendorDetail && !newLabtestVm.VendorDetail.IsDefault) {
                  newLabtestVm.SelectAll = false;
                  _testComponent.IsSelected = false;
                }

                _testComponent.RequisitionId = labTest.RequisitionId;
                _testComponent.TemplateId = template.TemplateId;
                let lkpSrc = this.labLookups.find(a => a.LookupName == component.ValueLookup);
                _testComponent.ValueDataSource = component.ValueLookup && lkpSrc ? JSON.parse(lkpSrc.LookupDataJson) : [];
              }
              newLabtestVm.Components.push(_testComponent);
            });
          }

          testList.push(newLabtestVm);

        });
        template.Tests = testList;

      });
    }
  }

  AddNewComponent(test: LabResult_TestVM) {
    let newComponent = new LabTestComponent();
    newComponent.RequisitionId = test.RequisitionId;
    newComponent.LabTestId = test.LabTestId;
    newComponent.LabReportId = test.LabReportId;
    newComponent.Range = "";
    newComponent.RangeDescription = "";
    newComponent.Unit = "";
    newComponent.ComponentName = "";
    newComponent.Method = "";
    newComponent.Remarks = "";
    newComponent.CreatedOn = null;
    newComponent.ValueType = "string";
    newComponent.ControlType = "TextBox";
    newComponent.IsDynamic = true;
    newComponent.ValueDataSource = null;
    newComponent.IsSelected = false;
    newComponent.GroupName = null;
    newComponent.DisplaySequence = 100;
    newComponent.CreatedOn = moment().format("YYYY-MM-DD");

    newComponent.IsGroupValid = true;
    newComponent.ComponentValidator.disable();

    test.Components.push(newComponent)

  }

  //remove current component from the testComponent's array.
  //Remarks: ONLY Dynamically Added components can be removed from the view. Other's can only be Un-Checked.
  RemoveComponent(test: LabResult_TestVM, index) {
    test.Components.splice(index, 1)
  }


  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  ComponentChkBoxOnChange(test: LabResult_TestVM, component: LabTestComponent, controlType: string) {
    if (controlType == null || controlType == "") { controlType = "TextBox"; }

    if (controlType && controlType.toLowerCase() != 'label') {
      if (component.IsSelected) {
        component.ComponentValidator.enable();
      }
      else {
        //component.IsGroupValid = true;
        //component.ComponentValidator.disable();
        if (this.templateReport.TemplateType == 'culture') {

        } else {
          component.IsGroupValid = true;
          component.ComponentValidator.disable();
        }
        //display unchecked warning only once.. no point in showing again and again.. 
        if (!this.uncheckedWarningShown) {
          this.msgBoxServ.showMessage("warning", ["Unchecked items will not be saved in report."]);
          this.uncheckedWarningShown = true;
        }
      }

      //if all the component's of this test are checked-- the CheckBox at Test Level should also be checked.
      //If any one of the component is unchecked, then the Test-Level-Checkbox should be uncheked.
      if ((test.Components.every(a => a.IsSelected == true))) {
        test.SelectAll = true;
      }
      else {
        test.SelectAll = false;
      }
    }

  }

  //Select/Deleselect all components on click of Test-Level-Checkbox
  TestCheckBoxOnChange(test: LabResult_TestVM) {
    if (test.SelectAll) {
      test.Components.forEach(comp => {
        comp.IsSelected = true;
        this.ComponentChkBoxOnChange(test, comp, comp.ControlType);
      });
    }
    else {
      test.Components.forEach(comp => {
        comp.IsSelected = false;
        this.ComponentChkBoxOnChange(test, comp, comp.ControlType);
      });
    }
  }

  onChangeEditorData(data, i, j, k) {
    //this.changeDetector.detectChanges();
    //console.log("called each time");
    this.templateReport.Templates[i].Tests[j].Components[k].Value = data;
  }

  //validations
  //checks validation for value range or sum of the values of a certain group.
  GetValidationSummary(selCompList: Array<LabTestComponent>) {

    let validationSummary = {
      IsEmptySet: true, IsValid: true, HasDuplicate: false,
      HasAbnormal: false, HasInvalidGroups: false, Messages: []
    };

    if (selCompList.length) {
      validationSummary.IsEmptySet = false;
      ///check if there's any duplicate component.
      let cmpNamesArray: Array<string> = selCompList.map(a => { return a.ComponentName });


      if (CommonFunctions.HasDuplicatesInArray(cmpNamesArray)) {

        //we're overwriting duplicate test's validation if user Chooses to.
        let allowDuplicate = window.confirm("Duplicate test(s) found. Do you want to continue anyway?");
        if (allowDuplicate) {
          validationSummary.HasDuplicate = false;
        }
        else {
          validationSummary.HasDuplicate = true;
          validationSummary.Messages.push("Duplicate test found.");
        }



      }




      //if anyone of the component IsNot valid then the Whole Component set is not valid.
      if (selCompList.filter(a => a.IsValueValid == false).length > 0) {
        validationSummary.IsValid = false;
        validationSummary.Messages.push("One or more value(s) are invalid");
      }
      //if anyone of the component is not normal value then the Whole Component set is abnormal.
      if (selCompList.filter(a => a.IsAbnormal == true).length > 0) {
        validationSummary.HasAbnormal = true;
        validationSummary.Messages.push("One or more value(s) are abnormal");
      }

      //if any component group has abnormal value then Summary is 
      if (selCompList.filter(a => a.IsGroupValid == false).length > 0) {
        validationSummary.HasInvalidGroups = true;
        validationSummary.Messages.push("One or more groups are invalid")
      }

    }
    else {
      validationSummary.IsEmptySet = true;
      validationSummary.Messages.push("Cannot save empty report. Please add a few before submitting.");
    }

    return validationSummary;

  }

  CheckComponentValueIsValid(comp: LabTestComponent, type: string) {
    if (comp.Value == null || comp.Value == "" || comp.Value.trim() == "") {
      comp.IsValueValid = false;
      comp.IsAbnormal = false;
      if (type == 'culture') {
        comp.IsSelected = false;
      }
    }
    else {
      ///for ValueType other than "number" -- non-empty values are normal
      if (comp.ValueType != "number") {
        comp.IsValueValid = true;
        if (type == 'culture') {
          comp.IsSelected = true;
        }
      }
      else {
        //assinging the value to a variable to maintain "," or "02" in the display value even if the value is parsed as Number()
        let value = Number(comp.Value.replace(/,/g, ''));
        //check if the value is number or not.
        if (isNaN(value))
          comp.IsValueValid = false;
        else
          ///if the value is number then then it is Valid
          comp.IsValueValid = true;
      }
    }

  }


  CheckIfAbnormal(comp: LabTestComponent, test: LabResult_TestVM, assignRangeToDescrp: number = 0) {

    let valueType: string = comp.ValueType;

    //Used Incase of Dynamically added Component
    if (assignRangeToDescrp) {
      comp.Range = comp.RangeDescription;
    }

    if ((valueType && valueType == "string")) {
      valueType = 'number';
    }
    //no need to check if the value itself is invalid

    var dob = this.LookUpDetail.DOB;
    var patGender = this.LookUpDetail.Gender;
    var patAge = CommonFunctions.GetFormattedAge(dob);

    patAge = patAge.toUpperCase();

    if (patAge.includes('Y')) {
      var ageArr = patAge.split('Y');
      var actualAge = Number(ageArr[0]);
      //Patient is not child
      if (actualAge > 16) {
        //Use validation according to Gender
        if (patGender.toLowerCase() == 'male' && comp.MaleRange && comp.MaleRange.trim() != '' && comp.MaleRange.length) {
          comp.Range = comp.MaleRange;
        } else if (patGender.toLowerCase() == 'female' && comp.FemaleRange && comp.FemaleRange.trim() != '' && comp.FemaleRange.length) {
          comp.Range = comp.FemaleRange;
        } else {

        }
      }
      else
      //Patient is Child
      {
        //If Child validation is present
        if (comp.ChildRange && comp.ChildRange.trim() != '' && comp.ChildRange.length) {
          comp.Range = comp.ChildRange;
        } else {
          if (patGender.toLowerCase() == 'male' && comp.MaleRange && comp.MaleRange.trim() != '' && comp.MaleRange.length) {
            comp.Range = comp.MaleRange;
          } else if (patGender.toLowerCase() == 'female' && comp.FemaleRange && comp.FemaleRange.trim() != '' && comp.FemaleRange.length) {
            comp.Range = comp.FemaleRange;
          } else {

          }
        }
      }
    }
    //this means there is either M or D, i.e. Patient is Child so use child Validation if available
    else {
      comp.Range = comp.ChildRange;
    }




    if (comp.IsValueValid) {
      comp.IsSelected = true;
      comp.IsAbnormal = false;
      comp.AbnormalType = 'normal';
      //comp.Range && comp.ValueType  => True only if these fields are present & has some value. 
      //check abnormal only for valuetype=number, for string we cannot detect which value is abnormal.--sud:11Apr'18
      if (comp.Range && valueType && valueType == "number") {
        let value = Number(comp.Value.replace(/,/g, ''));
        if (comp.Range.includes('-')) {
          comp.Range = comp.Range.replace(/,/g, '');
          let range = comp.Range.split('-');
          if (value < Number(range[0]) || value > Number(range[1])) {
            //comp.IsAbnormal = false;
            //this.changeDetector.detectChanges();
            if (value < Number(range[0])) {
              comp.AbnormalType = 'low';
            } else {
              comp.AbnormalType = 'high';
            }
            comp.IsAbnormal = true;
          }
        }
        else if (comp.Range.includes('<')) {
          let range = comp.Range.split('<');
          if (value > Number(range[1])) {
            //comp.IsAbnormal = false;
            //this.changeDetector.detectChanges();
            comp.AbnormalType = 'high';
            comp.IsAbnormal = true;
          }

        }
        else if (comp.Range.includes('>')) {
          let range = comp.Range.split('>');
          if (value < Number(range[1])) {
            //comp.IsAbnormal = false;
            //this.changeDetector.detectChanges();
            comp.AbnormalType = 'low';
            comp.IsAbnormal = true;
          }
        }

      }

      //this.CheckValueAndGroupValidation(test.Components.filter(cmp => cmp.IsSelected));
      this.ApplyGroupValidation(test.Components.filter(cmp => cmp.IsSelected));


    }
  }


  ApplyGroupValidation(componentList: Array<LabTestComponent>) {
    let groupValidation: { isGroupValid: boolean, validationMessage: string };
    //set global variable to True at the begining

    let distinctCompGroups = componentList.map(a => {
      //don't return if the group is null or undefined
      if (a.GroupName)
        return a.GroupName;
    });
    distinctCompGroups = CommonFunctions.GetUniqueItemsFromArray(distinctCompGroups);

    if (distinctCompGroups && distinctCompGroups.length > 0) {
      distinctCompGroups.forEach(grp => {
        let currGroupComps = componentList.filter(a => a.GroupName == grp);
        groupValidation = this.CheckGroupValidations(grp, currGroupComps);
        //if the group itself is not valid then make all the components as InValid.
        if (!groupValidation.isGroupValid) {
          //if any of the group is invalid, then global variable itself is Invalid
          currGroupComps.forEach(comp => {
            comp.IsGroupValid = false;
            //comp.ComponentValidator.controls["Value"].markAsDirty();
            comp.ErrorMessage = groupValidation.validationMessage;
          });
        }
        else {
          currGroupComps.forEach(comp => {
            comp.IsGroupValid = true;
          });
        }
      });

    }
  }


  CheckGroupValidations(groupName: string, groupComponents: Array<LabTestComponent>): { isGroupValid: boolean, validationMessage: string } {
    var groupValidation = { isGroupValid: true, validationMessage: "" };
    switch (groupName) {
      case "Check100":
        let valueArray = groupComponents.map(a => {
          //Anish: 3 Oct, Added IsSelected Option As Well
          if (a.ValueType == "number" && a.IsSelected == true) {
            return parseFloat(a.Value);
          }
        });

        let sum: number = 0;
        valueArray.forEach(v => {
          sum += v;
        });

        if (sum == 100) {
          groupValidation.isGroupValid = true;
        }
        else {
          groupValidation.isGroupValid = false;
          groupValidation.validationMessage = "Sum of the values should be exactly 100.";
        }
        break;
      default:
        groupValidation.isGroupValid = true;
        break;
    }
    return groupValidation;
  }

  //one thing to rememeber is to save happening for all test in that requisition
  // in this first validation is checked for component..
  //then the component is posted to the db using PostComponent function
  Submit(): void {
    if (this.loading) {

      this.loading = true;
      let allComponents: Array<LabTestComponent> = new Array<LabTestComponent>();

      if (this.templateReport.Templates && this.templateReport.Templates.length) {
        this.templateReport.Templates.forEach(template => {
          if (template.TemplateType == 'normal') {
            template.Tests.forEach(tst => {
              if (tst.IsNegativeResult) {
                let negResComponent = new LabTestComponent();
                negResComponent.TemplateId = template.TemplateId;
                negResComponent.NegativeResultText = tst.NegativeResultText;
                negResComponent.ComponentName = "Negative Result";
                negResComponent.Remarks = tst.NegativeResultText;
                negResComponent.IsNegativeResult = tst.IsNegativeResult;
                negResComponent.RequisitionId = tst.RequisitionId;
                negResComponent.LabTestId = tst.LabTestId;
                negResComponent.TestComponentResultId = tst.Components.length ? tst.Components[0].TestComponentResultId : null;
                allComponents.push(negResComponent);
              }
              else {
                if (tst && tst.Components && tst.Components.length > 0) {
                  this.RemovePossibleLabel(tst.Components);
                  tst.Components.forEach(cmp => {
                    if (!cmp.TestComponentResultId) {
                      cmp.TemplateId = template.TemplateId;
                      if (!cmp.DisplaySequence) {
                        cmp.DisplaySequence = 100;
                      }
                      if (cmp.ControlType && cmp.ControlType.trim() == '') {
                        cmp.ControlType = 'TextBox';
                      }
                    }
                    allComponents.push(cmp);
                  });
                }
              }
            });
          }
          else {
            if (template.TemplateType == 'html') {
              template.Tests.forEach(tst => {
                if (tst.IsNegativeResult) {
                  let negResComponent = new LabTestComponent();
                  negResComponent.TemplateId = template.TemplateId;
                  negResComponent.NegativeResultText = tst.NegativeResultText;
                  negResComponent.ComponentName = "Negative Result";
                  negResComponent.Remarks = tst.NegativeResultText;
                  negResComponent.IsNegativeResult = tst.IsNegativeResult;
                  negResComponent.RequisitionId = tst.RequisitionId;
                  negResComponent.LabTestId = tst.LabTestId;
                  negResComponent.TestComponentResultId = tst.Components.length ? tst.Components[0].TestComponentResultId : null;
                  allComponents.push(negResComponent);
                }
                else {
                  if (tst && tst.Components && tst.Components.length > 0) {
                    tst.Components.forEach(cmp => {
                      if (!cmp.TestComponentResultId) {
                        cmp.TemplateId = template.TemplateId;
                        if (!cmp.DisplaySequence) {
                          cmp.DisplaySequence = 100;
                        }
                        //cmp.DisplaySequence = 100;
                        //if (cmp.ControlType && cmp.ControlType.trim() == '') {
                        //    cmp.ControlType = 'TextBox';
                        //}
                      }
                      allComponents.push(cmp);
                    });
                  }
                }
              });
            }
            else {
              template.Tests.forEach(tst => {

                let singleSpecimen: LabTestSpecimenModel = new LabTestSpecimenModel();

                if (template.TemplateType == "culture") {
                  singleSpecimen.RequisitionId = tst.RequisitionId;
                  singleSpecimen.Specimen = tst.Specimen;
                  this.cultureSpecimen.push(singleSpecimen);
                }

                if (tst.IsNegativeResult) {
                  //tst.Components.length ? tst.Components[0].TestComponentResultId 

                  let negResComponent = new LabTestComponent();

                  if (this.negativeTestComponentResultId) {
                    negResComponent.TestComponentResultId = this.negativeTestComponentResultId;
                  }
                  else {
                    negResComponent.TestComponentResultId = 0;
                  }

                  negResComponent.TemplateId = template.TemplateId;
                  negResComponent.NegativeResultText = tst.NegativeResultText;
                  negResComponent.ComponentName = "Negative Result";
                  negResComponent.Remarks = tst.NegativeResultText;
                  negResComponent.IsNegativeResult = tst.IsNegativeResult;
                  negResComponent.RequisitionId = tst.RequisitionId;
                  negResComponent.LabTestId = tst.LabTestId;

                  allComponents.push(negResComponent);

                  this.negativeTestComponentResultId = 0;
                }
                else {
                  if (tst && tst.Components && tst.Components.length > 0) {
                    tst.Components.forEach(cmp => {
                      if (!cmp.TestComponentResultId) {
                        cmp.TemplateId = template.TemplateId;
                        if (!cmp.DisplaySequence) {
                          cmp.DisplaySequence = 100;
                        }
                        if (cmp.ControlType && cmp.ControlType.trim() == '') {
                          cmp.ControlType = 'TextBox';
                        }
                      }
                      allComponents.push(cmp);
                    });
                  }
                }

              });
            }


          }
        });




        this.selectedComponents = allComponents.filter(cmp => cmp.IsSelected);

        for (let cmp of this.selectedComponents) {
          for (var valCtrls in cmp.ComponentValidator.controls) {
            cmp.ComponentValidator.controls[valCtrls].markAsDirty();
            cmp.ComponentValidator.controls[valCtrls].updateValueAndValidity();
          }
        }

        let valSummary = this.GetValidationSummary(this.selectedComponents);
        if (!valSummary.IsEmptySet && valSummary.IsValid && !valSummary.HasDuplicate && !valSummary.HasInvalidGroups) {

          ///post component if there's no abnormal, else showwarning confirmbox
          if (!valSummary.HasAbnormal) {
            this.SaveResult()
          }
          else {
            this.showWarningConfirmBox = true;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", valSummary.Messages)
          this.loading = false;
        }
      }


    }
  }

  SaveResult() {
    this.selReqIdList = [];
    this.selectedComponents.forEach(cmp => {
      this.selReqIdList.push(cmp.RequisitionId);
    });
    this.selReqIdList = this.selReqIdList.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
    //this.UpdateCommentsOnTestRequisiton();//remove this, or write proper logic
    if (this.isEditResult) {
      this.UpdateLabTestComponents(this.selectedComponents);
    }
    else {
      this.PostComponent(this.selectedComponents);
    }
  }

  PostComponent(components) {
    this.labBLService.PostComponent(components, this.cultureSpecimen)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.CallBackAddUpdate();
        }
        else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ["failed to add result.. please check log for details."])
          console.log(res.ErrorMessage);
        }

      });

  }

  //for updating the result
  UpdateLabTestComponents(components) {
    this.labBLService.PutLabTestResult(components, this.cultureSpecimen)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.CallBackAddUpdate();
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Sorry!!! Not able to update the lab result"]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }

      }, err => {
        console.log(err.ErrorMessage);
        this.loading = false;
      });

  }

  CallBackAddUpdate() {
    this.showAddEditResult = false;
    this.callBackAddUpdate.emit({ selReqIdList: this.selReqIdList });
    this.loading = false;//sud: 24sept'18
    this.cultureSpecimen = [];
  }

  UpdateCommentsOnTestRequisiton() {
    if (this.comments) {
      this.labBLService.PutCommentsOnTestRequisition(this.selReqIdList, this.comments)
        .subscribe(res => {
          if (res.Status != "OK") {
            this.msgBoxServ.showMessage("failed", ["Unable to update report comments."]);
            console.log(res.ErrorMessage)
          }
        });
    }
  }

  Maximize(val: boolean) {
    this.maximize = val;
  }

  ReviewValues() {
    this.showWarningConfirmBox = false;
    this.loading = false;
  }

  RemovePossibleLabel(allComps: Array<LabTestComponent>) {
    let allLabelIndexes: Array<number> = new Array<number>();
    //add all label types into ine array.
    let allLbls = allComps.filter(cmp => cmp.ControlType == "Label");

    if (allLbls) {
      //add indexes of all labelTypes Components to allLabelIndex array
      allLbls.forEach(lbl => {
        let ind = allComps.findIndex(cmp => cmp.ComponentName == lbl.ComponentName);
        allLabelIndexes.push(ind);
      });

      let lastIndOfLabel = allLabelIndexes.length - 1;
      let lastInd = allLabelIndexes[lastIndOfLabel];

      if (!(lastInd == (allComps.length - 1))) {
        allLabelIndexes.push(allComps.length);
      }
    }

    if (allLabelIndexes.length > 0) {
      //need to loop upto length-1 since we're taking i+1 inside this for loop.
      for (var i = 0; i < allLabelIndexes.length - 1; i++) {
        //set indexes of current and next labels.
        let currIndx = allLabelIndexes[i];
        let nextIndx = allLabelIndexes[i + 1];
        //get all components between above two indexes
        let compsBetnTwoLabels = allComps.slice(currIndx + 1, nextIndx);
        //if anything found in between then check if there's any components which is selected or not.
        if (compsBetnTwoLabels && compsBetnTwoLabels.length > 0) {
          //get all components between above two indexes.
          let isActiveCompsBetnTwoLabels = compsBetnTwoLabels.filter(abc => abc.IsSelected == true).length > 0;
          if (isActiveCompsBetnTwoLabels) {
            allComps[currIndx].IsSelected == true;
          }
          else {
            allComps[currIndx].IsSelected = false;
          }
        }
      }
    }

  }


  ConfirmChangeRunNumber() {
    var createNew: boolean = window.confirm('Are you sure to change Run Number?');;
    if (createNew) {
      this.visitType = this.templateReport.Lookups.VisitType;
      this.RunNumberType = this.templateReport.Lookups.RunNumberType;

      this.sampleCode.RunNumber = Number(this.templateReport.Lookups.SampleCode);

      this.sampleCode.SampleCreatedOn = moment(this.templateReport.Lookups.SampleDate).format('YYYY-MM-DD');

      let nepaliDate = this.npCalendarService.ConvertEngToNepDate(this.templateReport.Lookups.SampleDate);

      if (nepaliDate) {
        this.sampleCode.SampleCode = nepaliDate.Day;
      }
      this.showChangeSample = true;
    }
  }

  //ashim: 20Sep018: added for update run number feature.
  CheckIfSampleCodeExist() {
    if (this.CheckSampleCodeValidation()) {
      this.labBLService.GetSampleCodeCompared(this.sampleCode.RunNumber, this.visitType, this.sampleCode.SampleCreatedOn, this.RunNumberType)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results) {
            if (res.Results.Exist) {
              this.sampleCodeExistingDetail = res.Results;
              this.showConfirmationBox = true;
            }
            else {
              this.UpdateSampleCode();
            }
          }
        });
    }
  }


  CheckSampleCodeValidation(): boolean {
    let valid: boolean = false;
    if (this.sampleCode.RunNumber) {
      //check if user has selected future date.
      let checkFuture = moment(moment(this.sampleCode.SampleCreatedOn).format('YYYY-MM-DD')).diff(moment().format('YYYY-MM-DD'));
      if (checkFuture <= 0) {
        var checkToday = moment(moment(this.sampleCode.SampleCreatedOn).format('YYYY-MM-DD')).diff(moment(this.templateReport.Lookups.SampleDate).format('YYYY-MM-DD'));
        //if user don't change sample code or date and press OK
        if (this.sampleCode.RunNumber == Number(this.templateReport.Lookups.SampleCode) &&
          checkToday == 0) {
          this.showChangeSample = false;
        }
        else {
          valid = true;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Select valid sample collection date."]);
      }
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Enter valid run number."]);
    }
    return valid;
  }
  //ashim: 20Sep018: added for update run number feature.
  UpdateSampleCode() {
    var type: string = null;

    this.labBLService.PutSampleCodeReqIdList(this.requisitionIdList, this.sampleCode.RunNumber, this.sampleCode.SampleCreatedOn, this.visitType, this.RunNumberType)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.msgBoxServ.showMessage("success", ["Sample code updated successfully."]);
          this.templateReport.Lookups.SampleCode = this.sampleCode.RunNumber.toString();
          this.templateReport.Lookups.SampleCodeFormatted = res.Results.FormattedSampleCode;
          this.templateReport.Lookups.SampleDate = this.sampleCode.SampleCreatedOn;
          this.showChangeSample = false;
          this.showConfirmationBox = false;
        }
        else {
          this.showChangeSample = false;
          this.showConfirmationBox = false;
          this.msgBoxServ.showMessage("failed", ["Unable to update run number."]);
        }
      });
  }


  SampleDateChanged() {
    let nepaliDate = this.npCalendarService.ConvertEngToNepDate(this.sampleCode.SampleCreatedOn);
    if (nepaliDate) {
      if (this.RunNumberType && this.RunNumberType.toLowerCase() == "normal") {
        this.sampleCode.SampleCode = nepaliDate.Day;
      }
      else {
        this.sampleCode.SampleCode = parseInt(nepaliDate.Year.toString().substring(1, 4));
      }
    }
  }

  Cancel() {
    this.callBackCancel.emit({ cancel: true });
  }

  public GoToNextBox(templateNum: number, testNum: number, componentNum: number, sameLevelSpCheck: boolean = false) {
    var initvar = 'inputbox';
    var nextId = '';

    //For Enter effect in the culture test add where there is specimen and Negtive test addition textarea
    if (sameLevelSpCheck && componentNum < 0) {
      var num = componentNum * (-1);
      num++;
      nextId = initvar + templateNum + testNum + 'x0' + num;
      if (document.getElementById(nextId)) {
        document.getElementById(nextId).focus();
      }
      else {
        this.GoToNextBox(templateNum, testNum, -1);
      }
    }
    else {
      componentNum++;
      var isLastComponent = this.CheckIfLastComponentOfTest(templateNum, testNum, componentNum);
      if (isLastComponent) {
        componentNum = 0;
        testNum++;
        var isLastTest = this.CheckIfLastTestOfTemplate(templateNum, testNum);
        if (isLastTest) {
          testNum = 0;
          templateNum++;
          var isLastTemplate = this.CheckIfLastTemplate(templateNum);
          if (isLastTemplate) {
            return;
          }
          //Move to next template
          this.MoveFocusToNextBox(templateNum, testNum, componentNum, true);
        }
        else {
          //Move to next test
          this.MoveFocusToNextBox(templateNum, testNum, componentNum,true);
        }
      }
      else {        
        //Move to Next Component
        this.MoveFocusToNextBox(templateNum, testNum, componentNum);
      }
    }
  }

  public MoveFocusToNextBox(templateNum: number, testNum: number, componentNum: number, sameLevelCheck: boolean = false) {
    var initvar = 'inputbox';
    var nextId = '';
    if (sameLevelCheck) {
      nextId = initvar + templateNum + testNum + 'x01';
      if (document.getElementById(nextId)) {
        document.getElementById(nextId).focus();
      }
      else {
        if (this.CheckIfThisIsLabel(templateNum, testNum, componentNum)) {
          this.GoToNextBox(templateNum, testNum, componentNum);
        } else {
          nextId = initvar + templateNum + testNum + componentNum;
          if (document.getElementById(nextId)) {
            document.getElementById(nextId).focus();
          }
        }       
      }
    }
    else {
      if (this.CheckIfThisIsLabel(templateNum, testNum, componentNum)) {
        this.GoToNextBox(templateNum, testNum, componentNum);
      } else {
        nextId = initvar + templateNum + testNum + componentNum;
        if (document.getElementById(nextId)) {
          document.getElementById(nextId).focus();
        }
      }  
    }
  }

  public CheckIfThisIsLabel(templateNum: number, testNum: number, componentNum: number): boolean {
    if (this.templateReport.Templates[templateNum] && this.templateReport.Templates[templateNum].Tests[testNum].Components[componentNum] && this.templateReport.Templates[templateNum].Tests[testNum].Components[componentNum].ControlType)
    {
      var controlType = this.templateReport.Templates[templateNum].Tests[testNum].Components[componentNum].ControlType;
    }

    if (controlType && controlType.toLowerCase() == 'label') {
      return true;
    }
    return false;
  }

  public CheckIfLastComponentOfTest(templateNum: number, testNum: number, componentNum: number): boolean {
    if (this.templateReport.Templates[templateNum].Tests[testNum].Components
      && this.templateReport.Templates[templateNum].Tests[testNum].Components[componentNum]) {
      return false;
    } else { return true; }
  }

  public CheckIfLastTestOfTemplate(templateNum: number, testNum: number): boolean {
    if (this.templateReport.Templates[templateNum].Tests
      && this.templateReport.Templates[templateNum].Tests[testNum]) {
      return false;
    } else { return true; }
  }

  public CheckIfLastTemplate(templateNum: number): boolean {
    if (this.templateReport.Templates && this.templateReport.Templates[templateNum]) {
      return false;
    } else { return true; }
  }

}
