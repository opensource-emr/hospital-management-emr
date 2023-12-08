import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import * as _ from "lodash";
import { DanpheHTTPResponse } from "../../../../../src/app/shared/common-models";
import { ServiceDepartment } from "../../../billing/shared/service-department.model";
import { CoreService } from "../../../core/shared/core.service";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { LabVendorsModel } from "../../external-labs/vendors-settings/lab-vendors.model";
import { LabCategoryModel } from "../../shared/lab-category.model";
import { LabComponentModel } from "../../shared/lab-component-json.model";
import { LabReportTemplateModel } from "../../shared/lab-report-template.model";
import { LabTest } from "../../shared/lab-test.model";
import { Specimen_DTO } from "../shared/DTOs/specimen.dto";
import { CoreCFGLookUp } from "../shared/coreCFGLookUp.model";
import { LabSettingsBLService } from "../shared/lab-settings.bl.service";
import { LabTestComponentMap } from "../shared/lab-test-component-map.model";

@Component({
  selector: "add-labtest",
  templateUrl: "./add-labtest.html",
})
export class AddLabTestComponent {
  @Input() labTest: any = new LabTest();

  public allLabTestComponentList: Array<LabComponentModel> = new Array<
    LabComponentModel
  >();

  labReportList: Array<LabReportTemplateModel> = new Array<
    LabReportTemplateModel
  >();
  @Input() showLabTestAddPage: boolean = false;
  @Input() update: boolean = false;
  @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<
    object
  >();
  public rptTemplateId: number = null;
  public specimenList: Array<any> = new Array<any>();
  public serviceDepartmentList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public selectedDepartment: any;
  public selectedReportTemplate: any;
  public selectedCategory: any;
  public templateType: string = "normal";
  public specimens: Array<Specimen_DTO> = new Array<Specimen_DTO>();
  public RunNumType = ["normal", "cyto", "histo"];
  public loading: boolean = false;
  public showNewSpAdd: boolean = false;
  public newSpecimenName: string = "";

  public selectedLabTestComponent: LabComponentModel = new LabComponentModel();
  public LookUpNames: Array<CoreCFGLookUp> = new Array<CoreCFGLookUp>();
  public showAddNewLabComponent: boolean = false;
  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();

  public preSelectedSpecimens: Array<Specimen_DTO> = new Array<Specimen_DTO>();
  public ExternalVendorList: Array<LabVendorsModel> = new Array<LabVendorsModel>();
  constructor(
    public labSettingBlService: LabSettingsBLService,
    public messageBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public settingsBLService: SettingsBLService,
    public coreService: CoreService
  ) {
    this.setDefaultTemplate();
    this.GetSrvDeptList();
    this.GetAllLookUpNames();
    this.GetAllComponentList();
    this.GetAllLabCategory();
    this.GetAllSpecimenList();
    this.GetAllLabVendorList();
  }

  ngOnInit() {
    if (this.update) {
      let componentListOfCurrentLabTest: Array<LabComponentModel> = new Array<LabComponentModel>();

      this.labTest = Object.assign(new LabTest(), this.labTest);
      componentListOfCurrentLabTest = this.labTest.LabTestComponentsJSON;

      if (
        this.labTest.LabTestComponentMap &&
        this.labTest.LabTestComponentMap.length
      ) {
        this.labTest.LabTestComponentMap.forEach((val) => {
          if (
            componentListOfCurrentLabTest.find((comp) => comp.ComponentId == val.ComponentId)) {
            val.LabTestComponent = componentListOfCurrentLabTest.find(
              (comp) => comp.ComponentId == val.ComponentId
            );
          } else {
            val.LabTestComponent = new LabComponentModel();
            val.LabTestComponent.ComponentName = "";
          }
        });
      } else {
        let newCompMap = new LabTestComponentMap();
        newCompMap.LabTestComponent = new LabComponentModel();
        newCompMap.LabTestComponent.ComponentName = "";
        this.labTest.LabTestComponentMap.push(newCompMap);
      }
    } else {
      this.labTest.RunNumberType = "normal";
      let newCompMap = new LabTestComponentMap();
      newCompMap.LabTestComponent = new LabComponentModel();
      newCompMap.LabTestComponent.ComponentName = "";
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

  public SetAllComponentsIntoTest() { }

  public GetAllSpecimenList(): void {
    this.labSettingBlService
      .GetAllSpecimenList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.specimens = res.Results;
          if (this.update) {
            this.specimenList = new Array<any>();
            let spcList: Array<string> = JSON.parse(
              this.labTest.LabTestSpecimen
            );
            this.specimens.forEach((sp) => {
              if (spcList.find((a) => a == sp.Name) != null) {
                sp.IsSelected = true;
                this.specimenList.push(sp.Name);
              }
            });
            this.preSelectedSpecimens = this.specimens.filter(a => a.IsSelected === true);

          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Load the Lab Specimen List",]);
        }
      });
  }

  public GetAllLabCategory(): void {
    this.labSettingBlService
      .GetAllLabCategory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.allCategories = res.Results;
          // this.selectedCategory = this.allCategories.find(
          //   (cat) => cat.IsDefault == true
          // ).TestCategoryName;
          if (this.labTest.LabTestId) {
            if (this.labTest.LabTestCategoryId) {
              this.selectedCategory = this.allCategories.find(
                (cat) => cat.TestCategoryId == this.labTest.LabTestCategoryId
              ).TestCategoryName;
            }
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Load the Lab Category",]);
          console.log(res.ErrorMessage);
        }
      });
  }

  public GetAllComponentList(): void {
    this.labSettingBlService
      .GetAllLabTestComponents()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.allLabTestComponentList = res.Results;
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Get the List of Lab Test Components",]);
        }
      });
  }

  public GetAllLookUpNames(): void {
    this.labSettingBlService.GetAllLabLookUpNames().subscribe((res) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.LookUpNames = res.Results;
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Get the LookUp Name list for Lab Test Components",]);
      }
    });
  }

  public GetSrvDeptList(): void {
    this.settingsBLService.GetServiceDepartments().subscribe(
      (res) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results.length) {
            //this.srvdeptList = res.Results;
            var allDepartmentList = res.Results;
            this.serviceDepartmentList = allDepartmentList.filter((dpt) => {
              if (dpt.IntegrationName && dpt.IntegrationName.toLowerCase() === "lab"
              ) {
                return true;
              }
            });
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed Check log for error message",]);
          console.log(res.ErrorMessage);
        }
      },
      (err) => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to get service departments, Check log for error message",]);
      }
    );
  }

  GetAllLabVendorList() {
    this.labSettingBlService.GetLabVendors()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          let allVendorList = res.Results;
          this.ExternalVendorList = allVendorList.filter(vendor => vendor.IsExternal === true);
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cannot get the Lab Vendor List, Please Try Later!"])
          this.ExternalVendorList = new Array<LabVendorsModel>();
        }
      },
        (err: DanpheHTTPResponse) => {
          console.log(err.ErrorMessage);
        });
  }

  public myListFormatter(data: any): string {
    let html = data["ServiceDepartmentName"];
    return html;
  }

  public myCategoryListFormatter(data: any): string {
    let html = data["TestCategoryName"];
    return html;
  }

  public reportListFormatter(data: any): string {
    let html = data["ReportTemplateName"];
    if (data["Description"] && data["Description"].trim().length) {
      html = html + data["Description"];
    }
    return html;
  }

  //used to format display of item in ng-autocomplete.
  public componentListFormatter(data: any): string {
    let html = data["ComponentName"] + " / " + data["DisplayName"] + " / " + data["Unit"] + " / " + data["Range"];
    return html;
  }

  public AssignSelectedTemplate(): void {
    if (this.selectedReportTemplate && this.selectedReportTemplate.ReportTemplateID
    ) {
      this.labTest.ReportTemplateId = this.selectedReportTemplate.ReportTemplateID;
      var rptId = this.labTest.ReportTemplateId;
      var report = this.labReportList.find(
        (val) => val.ReportTemplateID == rptId
      );
      this.templateType = report.TemplateType;
      this.labTest.TemplateType = this.templateType;
    } else {
      this.selectedReportTemplate = "";
      this.labTest.ReportTemplateId = 0;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Select Report Template From List",]);
    }
  }

  public AssignSelectedCategory(): void {
    if (this.selectedCategory && this.selectedCategory.TestCategoryId) {
      this.labTest.LabTestCategoryId = this.selectedCategory.TestCategoryId;
    } else {
      this.selectedCategory = "";
      this.labTest.LabTestCategoryId = null;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Select Lab Category From List",]);
    }
  }

  public setDefaultTemplate(): void {
    this.labSettingBlService.GetAllReportTemplates().subscribe(
      (res) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.labReportList = res.Results;

          if (!this.update) {
            let defTempId = this.labReportList.find((x) => x.IsDefault == true);
            if (defTempId != null) {
              this.labTest.ReportTemplateId = defTempId.ReportTemplateID;
              this.rptTemplateId = defTempId.ReportTemplateID;
              this.templateType = defTempId.TemplateType;
              this.labTest.TemplateType = this.templateType;
            }
          } else {
            var template = this.labReportList.find(
              (val) => val.ReportTemplateID == this.labTest.ReportTemplateId
            );
            if (template) {
              this.templateType = template.TemplateType;
              this.selectedReportTemplate = template;
              this.labTest.ReportTemplateId = template.ReportTemplateID;
              this.labTest.TemplateType = this.templateType;
            }
          }
          this.labReportList.forEach((val) => {
            if (val.Description && val.Description !== null) {
              val.Description = "(" + val.Description + ")";
            }
          });
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
        }
      },
      (err) => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Failed to Load ReportTemplate List",]);
      }
    );
  }

  public AddLabTest(): void {
    let validationMsg = this.CheckIfDataIsValid();
    if (this.selectedCategory) {
      this.labTest.LabTestCategoryId = this.selectedCategory.TestCategoryId;
    }
    if (this.loading) {
      if (validationMsg.IsValid) {
        this.labTest.LabTestSpecimenSource = "Peripheral Vein";
        this.labTest.LOINC = null;
        this.labTest.ServiceDepartmentId = this.selectedDepartment.ServiceDepartmentId;
        // this.labTest.LabTestCategoryId = this.selectedCategory.TestCategoryId;
        //this.labTest.LabTestGroupId = 1;

        for (var j in this.labTest.LabTestValidator.controls) {
          this.labTest.LabTestValidator.controls[j].markAsDirty();
          this.labTest.LabTestValidator.controls[j].updateValueAndValidity();
        }

        //this.labTest.ReportTemplateId = this.rptTemplateId;

        if (this.labTest.IsValidCheck(undefined, undefined)) {
          if ((this.labTest.HasNegativeResults && this.labTest.NegativeResultText !== null) || !this.labTest.HasNegativeResults) {
            if (!this.labTest.IsOutsourceTest || (this.labTest.IsOutsourceTest && this.labTest.DefaultOutsourceVendorId > 0)) {
              this.labSettingBlService
                .PostNewLabTest(this.labTest)
                .finally(() => { this.loading = false; })
                .subscribe((res) => {
                  if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.CallBackAddUpdate(res);
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["New LabTest Added"]);
                  } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage,]);
                  }
                });
            }
            else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please Select Default OutsourceVendor from the list"]);
              this.loading = false;
            }
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please Enter NegativeResult Description",]);
            this.loading = false;
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["There is Validation Error. Please Try Later",]);
          this.loading = false;
        }
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, validationMsg.ErrMsg);
        this.loading = false;
      }
    }
  }

  public AddNewSpecimen(): void {
    if (this.newSpecimenName && this.newSpecimenName.trim() !== "" && this.loading
    ) {
      this.labSettingBlService
        .PostNewLabSpecimen(this.newSpecimenName)
        .subscribe((res) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["New Specimen Added"]);
            this.showNewSpAdd = false;
            this.specimens.push({
              Name: this.newSpecimenName,
              IsSelected: true,
              SpecimenId: 0
            });
            this.specimenList.push(this.newSpecimenName);
            this.loading = false;
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage,]);
            this.loading = false;
          }
        });
    } else {
      this.loading = false;
    }
  }

  public UpdateLabTest(): void {
    let validationMsg = this.CheckIfDataIsValid();

    if (this.loading) {
      if (validationMsg.IsValid) {
        this.labTest.LabTestSpecimenSource = "Peripheral Vein";
        this.labTest.LOINC = null;
        this.labTest.LabTestCategoryId = this.selectedCategory.TestCategoryId ? this.selectedCategory.TestCategoryId : this.labTest.LabTestCategoryId;

        for (var j in this.labTest.LabTestValidator.controls) {
          this.labTest.LabTestValidator.controls[j].markAsDirty();
          this.labTest.LabTestValidator.controls[j].updateValueAndValidity();
        }

        var labTestId = this.labTest.LabTestId;
        this.labTest.LabTestComponentMap.forEach(
          (component) => (component.LabTestId = labTestId)
        );

        if (this.labTest.IsValidCheck(undefined, undefined)) {
          if ((this.labTest.HasNegativeResults && this.labTest.NegativeResultText != null) || !this.labTest.HasNegativeResult) {
            if (!this.labTest.IsOutsourceTest || (this.labTest.IsOutsourceTest && this.labTest.DefaultOutsourceVendorId > 0)) {
              this.labSettingBlService
                .UpdateNewLabTest(this.labTest)
                .finally(() => { this.loading = false })
                .subscribe((res) => {
                  if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.CallBackAddUpdate(res);
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["LabTest Updated."]);
                  } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Something Wrong " + res.ErrorMessage,]);
                  }
                });
            }
            else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please Select Default OutsourceVendor from the list"]);
              this.loading = false;
            }
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please Enter NegativeResult Description",]);
            this.loading = false;
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["There is Validation Error. Please Try Again",]);
          this.loading = false;
        }
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, validationMsg.ErrMsg);
        this.loading = false;
      }
    }
  }

  public CheckIfDataIsValid() {
    let retMsgObj = { IsValid: true, ErrMsg: [] };

    //Removes the componentmapped with empty component
    if (this.labTest.LabTestComponentMap && this.labTest.LabTestComponentMap.length) {
      var validComponent = this.labTest.LabTestComponentMap.reduce(
        (valcomp, actualComp) => {
          if (actualComp.LabTestComponent && actualComp.LabTestComponent.ComponentId && actualComp.IsActive) {
            valcomp.push(actualComp);
          }
          return valcomp;
        },
        []
      );

      if ((validComponent).length == 0) {
        this.labTest.LabTestComponentMap = validComponent;
      }

      //if (validComponent && validComponent.length) {
      //  this.labTest.LabTestComponentMap = validComponent;
      //}
    }

    if (this.labTest.IsValidForReporting) {
      if (this.labTest.LabTestComponentMap[0] && this.labTest.LabTestComponentMap[0].ComponentId < 1) {
        retMsgObj.IsValid = false;
        retMsgObj.ErrMsg.push("Select one or more component.");
      }
    }
    else {
      this.labTest.LabTestComponentMap = [];
    }

    if (!this.labTest.LabTestCode && !this.update) {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push("Lab Test Code Required.");
    }

    if (!this.selectedDepartment && !this.update) {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push("Please Select Service Department");
    }

    if (typeof this.selectedCategory === "object") {
      if (!this.selectedCategory || !this.selectedCategory.TestCategoryId) {
        retMsgObj.IsValid = false;
        retMsgObj.ErrMsg.push("Please Select Lab Category");
      }
    } else {
      var selCat = this.allCategories.find((c) => c.TestCategoryName === this.selectedCategory);
      if (selCat) {
        this.labTest.LabTestCategoryId = selCat.TestCategoryId;
      } else {
        retMsgObj.IsValid = false;
        retMsgObj.ErrMsg.push("Please Select Lab Category from List");
      }
    }

    //For template type normal
    if (this.templateType === "normal" || this.templateType === "culture") {
      this.labTest.TemplateType = this.templateType;

      //validation for empty labtestcomponent in Lab test
      if (!this.labTest.LabTestComponentMap.length) {
        //retMsgObj.IsValid = false;
        //retMsgObj.ErrMsg.push('Please Select atLeast One Component');
        //this.labTest.LabTestComponentMap.push(new LabTestComponentMap());
      } else {
        this.labTest.LabTestComponentMap.forEach((lbt) => {
          //If SequenceNumber is null then assign 100 to it
          if (lbt.DisplaySequence == null) {
            lbt.DisplaySequence = 100;
          } else {
            if (lbt.DisplaySequence < 0) {
              var res = confirm(
                "Negative Number Entered in Display Sequence  will be set to 0! Do you want to continue??"
              );
              if (res) {
                lbt.DisplaySequence = 0;
              }
            }
          }
        });

        //Sorts data based on sequence number
        this.labTest.LabTestComponentMap.sort(function (a, b) {
          return a.DisplaySequence - b.DisplaySequence;
        });
      }
    }
    //For template type html
    else {
      //If Template Type of HTML i.e. Ck Editor is selected Or There is no any ComponentJSON then
      //remove all the ComponentJSONs and add single ComponentJSON whose name is same as LabTest Name
      //and no need of other fields(Make Sure there is aTLeast one ComponentJSON)
      if (this.templateType === "html") {
        this.labTest.TemplateType = this.templateType;
        this.labTest.LabTestComponentsJSON = [];
        this.labTest.LabTestComponentsJSON.push(new LabComponentModel());
        this.labTest.LabTestComponentsJSON[0].ComponentName = this.labTest.LabTestName;
        this.labTest.LabTestComponentsJSON[0].DisplayName = this.labTest.LabTestName;
        this.labTest.LabTestComponentsJSON[0].DisplaySequence = 100;

        let labTestComps = this.labTest.LabTestComponentsJSON.map((comp) => {
          return _.omit(comp, ["LabComponentJsonValidator"]);
        });
        this.labTest.LabTestComponentsJSON = labTestComps;
        if (this.specimenList.length > 0) {
          this.labTest.LabTestSpecimen = JSON.stringify(this.specimenList);
        } else {
          this.labTest.LabTestSpecimen = "[]";
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
    } else {
      retMsgObj.IsValid = false;
      retMsgObj.ErrMsg.push("Please Select atLeast One Specimen");
    }

    if (!this.labTest.DisplaySequence || this.labTest.DisplaySequence > 9999999) {
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
      retMsgObj.ErrMsg.push("Please Select Report Template");
    }

    return retMsgObj;
  }

  public CallBackAddUpdate(res): void {
    this.labTest = new LabTest();
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      this.sendDataBack.emit({ labtest: res.Results });
    } else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
    }
    this.loading = false;
  }

  public Close(): void {
    this.labTest = null;
    this.showLabTestAddPage = false;
  }

  public callChange(): void {
    this.labTest.NegativeResultText = null;
  }

  public SpecimenChkOnChange(spcmn): void {
    this.specimenList = [];
    spcmn.forEach(spcmn => {
      this.specimenList.push(spcmn.Name);
    });
  }

  public ComponentSelected(ind: number): void {
    this.labTest.LabTestComponentMap[ind].ComponentId = this.labTest.LabTestComponentMap[ind].LabTestComponent.ComponentId;
  }

  public DeleteRow(ind: number): void {
    this.labTest.LabTestComponentMap.splice(ind, 1);
  }
  public AddNewComponentRow(index = null): void {
    let newCompMap = new LabTestComponentMap();
    newCompMap.LabTestComponent = new LabComponentModel();
    newCompMap.LabTestComponent.ComponentName = "";
    this.labTest.LabTestComponentMap.push(newCompMap);
    let ind = this.labTest.LabTestComponentMap.length - 1;
    this.FocusCurrentItem(ind);
  }

  public GetAddedAndUpdatedData($event): void {
    if ($event.success) {
      if ($event.components) {
        $event.components.forEach((val) => {
          this.allLabTestComponentList.push(val);
        });
      }
    }
    this.showAddNewLabComponent = false;
  }

  public FocusCurrentItem(index: number): void {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("testcomp-" + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 500);
  }
}
