import { Component, ChangeDetectorRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';

import { PatientService } from '../../../patients/shared/patient.service';
import { LabTestResultService } from '../../shared/lab.service';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientLabSample, LabTestSpecimen } from '../../shared/lab-view.models';
import { SecurityService } from '../../../security/shared/security.service';
import { LabTestRequisition } from '../../shared/lab-requisition.model';
import { LabTestComponent } from '../../shared/lab-component.model'
import { CommonFunctions } from "../../../shared/common.functions";
import * as _ from 'lodash';
import { LabSticker } from "../../shared/lab-sticker.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  templateUrl: "./lab-tests-collect-sample.html",
  styleUrls: ['./lab-tests-collect-sample.style.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class LabTestsCollectSampleComponent {

  public patientService: PatientService = null;
  public labResultService: LabTestResultService = null;

  public currentUser: number = null;
  // this is a dynamic array coming from server side.
  public patientTestCSVs: Array<PatientLabSample> = new Array<PatientLabSample>();
  public showModalBox: boolean = false;
  public showConfirmationBox: boolean = false;
  public isAllTestSelected: boolean = true;
  public LatestSampleCode = { SampleCode: ' ', SampleNumber: 0, SampleLetter: '', BarCodeNumber: 0 };
  public LastSampleCodeOfPat = { SampleNumber: ' ', BarCodeNumber: 0, SampleDate: '', SampleCodeFormatted: '', IsSelected: false };
  public requisitionlist: Array<number> = [];
  public showChangeTest: boolean = false;
  public labTestToChange: any;
  public Providers: Array<any> = [];
  public selectedIndex: number = null;
  public reqId: number = null;

  public patientId: number;

  public visitType: string;
  public RunNumberType: string;
  public RequisitionId: number;
  public wardNumber: string;

  public PatientLabInfo: LabSticker = new LabSticker();
  public showlabsticker: boolean = false;
  public loading: boolean = false;

  //ashim: 20Sep2018: Added for change Run number feature.
  public sampleCreatedOn: string;
  public showChangeSampleCreatedOn: boolean = false;
  public sampleCodeExistingDetail = { Exisit: false, PatientName: null, PatientId: null, SampleCreatedON: null };
  public sampleDetail = { FormattedSampleCode: null, BarCodeNumber: null };


  public showInsuranceFlag: boolean = false;//sud:16Jul'19
  public fromLabRequisition: boolean = true;
  public showPrintEmptySheet: boolean = false;
  public showEmptySheet: boolean = false;
  public allReqIdListForPrint: Array<number> = [];

  public sampleCollectionSettings: any;
  public allowRunNoChange: boolean = true;
  public showSampleDateChange: boolean = true;
  public showTransfer: boolean = false;
  public fromTransfer: boolean = false;
  public showTestChangeParam: boolean = true;

  public labTestToTransfer: any;
  public labTypeName: string = null;
  public IsLocalDate = true;
  public isRunNumberAutoGenerate: boolean = false;
  public patUnderInsurance: boolean = false;

  constructor(public labBLService: LabsBLService,
    public router: Router,
    _patientservice: PatientService,
    _labresultservice: LabTestResultService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {
    this.patientService = _patientservice;
    this.labResultService = _labresultservice;
    this.currentUser = this.securityService.GetLoggedInUser().EmployeeId;
    this.patientId = this.patientService.getGlobal().PatientId;
    this.visitType = this.patientService.getGlobal().PatientType;
    this.RunNumberType = this.patientService.getGlobal().RunNumberType;
    this.RequisitionId = this.patientService.getGlobal().RequisitionId;
    this.wardNumber = this.patientService.getGlobal().WardName;
    this.patUnderInsurance = this.patientService.getGlobal().Ins_HasInsurance;

    var sampleCollectionParam = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'lab' && a.ParameterName == 'LabSampleCollectionPageSettings');
    if (sampleCollectionParam) {
      this.sampleCollectionSettings = JSON.parse(sampleCollectionParam.ParameterValue);
      this.showTestChangeParam = this.sampleCollectionSettings.ShowTestChange;
      this.showTransfer = this.sampleCollectionSettings.ShowTransfer;
      this.isRunNumberAutoGenerate = this.sampleCollectionSettings.SampleCodeIsAutoGenerate;
      this.showSampleDateChange = !this.sampleCollectionSettings.SampleCodeIsAutoGenerate;
      this.allowRunNoChange = !this.sampleCollectionSettings.SampleCodeIsAutoGenerate;
    }
  }

  ngOnInit() {
    this.coreService.loading = true;
    if (this.patientId != 0) {
      this.ListLabTestOfPatient();
      this.labResultService.CreateNewGlobalLabTestResult();
      this.sampleCreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.GetLatestSampleCode();
      this.SetInsuranceFlagParam();//sud:16Jul'19
    } else {
      this.router.navigate(['/Lab/Requisition']);
      this.coreService.loading = false;
    }
  }



  changeTest(index: number) {
    //this.labResultService.labBillItems.forEach
    this.selectedIndex = index;
    this.labTestToChange = this.labResultService.labBillItems.find(val => {
      if (val.ItemName == this.patientTestCSVs[index].TestName) {
        this.reqId = this.patientTestCSVs[index].RequisitionId;
        return true;
      }
    });

    if (this.labTestToChange) {
      this.showChangeTest = false;
      this.changeDetector.detectChanges();
      this.showChangeTest = true;
    }

  }

  //sud:16Jul'19--whether or not to show insurance flag in collect sample page. 
  SetInsuranceFlagParam() {
    let insParam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "lab" && p.ParameterName.toLowerCase() == "showinsurancefilterinlabpages");
    if (insParam && insParam.ParameterValue && insParam.ParameterValue.toLowerCase() == "true") {
      this.showInsuranceFlag = true;
    }
    else {
      this.showInsuranceFlag = false;
    }

  }

  GetChangedLabtest($event) {
    let changedLabtest = $event.NewLabTest;
    if (changedLabtest && changedLabtest.ItemId) {
      //PatientTestCSVs is Emptied as LisLabTestOfPatient function Pushes again to PatientTestCSVs
      this.patientTestCSVs = [];
      this.selectedIndex = null;
      this.ListLabTestOfPatient();

      //load this CollectSample page again 
      //after the LabTest is changed(to differentiate change based on normal and cyto / histo template)
      this.labResultService.CreateNewGlobalLabTestResult();
      this.sampleCreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.GetLatestSampleCode();
    }
    else {
      this.showChangeTest = false;
    }
  }



  // getting the test coponent of selected lab_test on basis of patientId....
  ListLabTestOfPatient(): void {
    this.labBLService.GetLabSamplesWithCodeByPatientId(this.patientId, this.visitType, this.RunNumberType, this.RequisitionId, this.wardNumber, this.patUnderInsurance).
      subscribe(res => this.CallBackPatientTestCSVs(res),
        err => {
          this.msgBoxServ.showMessage("error", ["failed to get lab test of patient.. please check log for details."]);

        });
  }

  GetLatestSampleCode(): void {
    if (!this.isRunNumberAutoGenerate) {
      this.sampleCreatedOn = this.sampleCreatedOn ? this.sampleCreatedOn : moment().format('YYYY-MM-DD HH:mm');
      this.labBLService.GetLatestSampleCode(this.visitType, this.sampleCreatedOn, this.RunNumberType, this.patientId, this.patUnderInsurance)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results) {
            this.LatestSampleCode.SampleCode = res.Results.SampleCode;
            this.LatestSampleCode.SampleNumber = res.Results.SampleNumber;
            this.LatestSampleCode.BarCodeNumber = res.Results.BarCodeNumber;
            this.LatestSampleCode.SampleLetter = res.Results.SampleLetter;
            this.LastSampleCodeOfPat = res.Results.ExistingBarCodeNumbersOfPatient;
            this.coreService.loading = this.loading = false;
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            this.coreService.loading = this.loading = false;
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["failed to add result.. please check log for details."]);
            this.coreService.loading = this.loading = false;
          });
      this.showChangeSampleCreatedOn = false;
    } else {
      this.coreService.loading = this.loading = false;
    }
  }


  //int his converting the testname into csv(comma separated values) using join and .map
  CallBackPatientTestCSVs(res): void {
    if (res.Status == 'OK') {
      if (res.Results.length != 0) {
        res.Results.forEach(res => {
          var labTest: PatientLabSample = new PatientLabSample();
          labTest.LastSampleCode = res.LastSampleCode;
          labTest.OrderDateTime = res.OrderDateTime;
          labTest.OrderStatus = res.OrderStatus;
          labTest.PatientName = res.PatientName;
          labTest.RequisitionId = res.RequisitionId;
          labTest.SampleCode = res.SampleCode;
          labTest.SpecimenList = JSON.parse(res.SpecimenList);
          labTest.LastSpecimenUsed = res.LastSpecimenUsed;
          labTest.ProviderName = res.ProviderName;
          labTest.RunNumberType = res.RunNumberType;
          labTest.HasInsurance = res.HasInsurance;
          if (labTest.SpecimenList && labTest.SpecimenList.length > 0) {
            labTest.Specimen = res.LastSpecimenUsed ? res.LastSpecimenUsed : labTest.SpecimenList[0];
          }

          labTest.TestName = res.TestName;
          labTest.SampleCreatedOn = res.SampleCreatedOn;
          labTest.SampleCreatedBy = res.SampleCreatedBy;
          labTest.PatientId = this.patientId;
          labTest.VisitType = this.visitType;
          //labTest.SmCode = res.SmCode;
          //labTest.SmNumber = res.SmNumber;
          this.patientTestCSVs.push(labTest);
        });
      }
      else {
        if (this.fromTransfer) {
          this.router.navigate(['/Lab/Requisition']);
        } else {
          this.msgBoxServ.showMessage("failed", ["lab bill not paid"]);

          this.router.navigate(['/Lab/Requisition']);
        }

      }
      if (this.coreService.ShowEmptyReportSheetPrint()) {
        this.showPrintEmptySheet = true;
      }
    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  CheckIfSampleCodeExist() {
    this.coreService.loading = true;
    if (this.loading) {
      if (this.LastSampleCodeOfPat && this.LastSampleCodeOfPat.BarCodeNumber && this.LastSampleCodeOfPat.IsSelected) {
        this.AddSampleCode();
      } else {
        if (this.LatestSampleCode.SampleNumber) {
          this.labBLService.GetSampleCodeCompared(this.LatestSampleCode.SampleNumber, this.visitType, this.sampleCreatedOn, this.RunNumberType, this.patUnderInsurance)
            .subscribe(res => {
              if (res.Status == "OK" && res.Results) {
                if (res.Results.Exist) {
                  this.sampleCodeExistingDetail = res.Results;
                  this.showConfirmationBox = true;
                  this.loading = false;
                  this.coreService.loading = false;
                }
                else {
                  this.AddSampleCode();
                }
              } else { this.loading = false; this.coreService.loading = false; }
            });
        } else {
          this.msgBoxServ.showMessage("failed", ["Enter valid run number."]);
          this.loading = false;
          this.coreService.loading = false;
        }
      }

    }
  }

  //updating the sampleCode
  AddSampleCode(): void {
    this.showConfirmationBox = false;
    var isLastSampleUsed: boolean = false;
    var selectedTests: Array<any> = new Array<any>();

    if (this.LastSampleCodeOfPat && this.LastSampleCodeOfPat.BarCodeNumber && this.LastSampleCodeOfPat.IsSelected) {
      isLastSampleUsed = true;
      var continueUsingLastSample: boolean;
      continueUsingLastSample = window.confirm("You have selected UseLastSampleCode for some tests. Do you wish to continue?");
      if (!continueUsingLastSample)
        return;
    }

    this.allReqIdListForPrint = [];
    this.patientTestCSVs.filter(sam => {
      if (sam.IsSelected) {
        this.allReqIdListForPrint.push(sam.RequisitionId);
        if (this.LatestSampleCode) {
          sam.SampleCode = this.LatestSampleCode.SampleNumber.toString();
          sam.SampleCreatedOn = this.sampleCreatedOn;
          sam.SampleCreatedBy = null;
          sam.BarCodeNumber = this.LatestSampleCode.BarCodeNumber;
        }

        if (this.LastSampleCodeOfPat && this.LastSampleCodeOfPat.BarCodeNumber && this.LastSampleCodeOfPat.IsSelected) {
          sam.SampleCode = this.LastSampleCodeOfPat.SampleNumber.toString();
          sam.SampleCreatedOn = this.LastSampleCodeOfPat.SampleDate;
          sam.SampleCreatedBy = null;
          sam.BarCodeNumber = this.LastSampleCodeOfPat.BarCodeNumber;
          isLastSampleUsed = true;
        }

        var test = _.omit(sam, ['SpecimenList']);
        selectedTests.push(test);
      }
    });



    if (selectedTests.length) {
      this.labBLService.PutSampleCode(selectedTests, this.currentUser)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.sampleDetail = res.Results;
            this.requisitionlist = [];
            this.UpdateSampleCodes();
            this.ManagePatientLabInfo(res.Results.SampleCollectedOnDateTime);
            this.coreService.loading = false;
            this.loading = false;
          }
          else {
            this.msgBoxServ.showMessage("error", ["Some issue in adding sample-code. Please try again."]);
            this.coreService.loading = false;
            this.loading = false;
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Some error issue in adding sample-code. Please try again."]);
            this.coreService.loading = false;
            this.loading = false;
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please select test to collect sample."]);
      this.coreService.loading = false;
      this.loading = false;
    }

  }

  public UpdateSampleCodes() {
    this.patientTestCSVs = this.patientTestCSVs.filter(test => {
      if (test.IsSelected) {
        if (!test.UseLastSampleCode) {
          test.SampleCode = this.sampleDetail.FormattedSampleCode;
          test.BarCodeNumber = this.sampleDetail.BarCodeNumber;
          this.requisitionlist.push(test.RequisitionId);
        }
        else {
          test.SampleCode = test.LastSampleCode;
        }

        return test;
      }
    });
    this.patientTestCSVs.sort((n1, n2) => {
      if (Number(n1.SampleCode.split('-')[0]) > Number(n2.SampleCode.split('-')[0]))
        return 1;
      if (Number(n1.SampleCode.split('-')[0]) < Number(n2.SampleCode.split('-')[0]))
        return -1;
      return 0;
    });
  }


  public ManagePatientLabInfo(sampleCollOnDateTime: any) {
    this.PatientLabInfo.HospitalNumber = Number(this.patientService.globalPatient.PatientCode);

    let dob = this.patientService.globalPatient.DateOfBirth;
    let gender: string = this.patientService.globalPatient.Gender;

    this.PatientLabInfo.SampleCollectedOnDateTime = moment(sampleCollOnDateTime).format("YYYY-MM-DD HH:mm");;
    this.PatientLabInfo.AgeSex = CommonFunctions.GetFormattedAgeSex(dob, gender);
    this.PatientLabInfo.Age = CommonFunctions.GetFormattedAge(dob);
    this.PatientLabInfo.Sex = gender;
    this.PatientLabInfo.PatientName = this.patientService.globalPatient.ShortName;
    //this.PatientLabInfo.RunNumber = $event.Data.SampleCode;
    this.PatientLabInfo.SampleCodeFormatted = this.sampleDetail.FormattedSampleCode;
    this.PatientLabInfo.VisitType = this.patientService.globalPatient.PatientType;
    this.PatientLabInfo.BarCodeNumber = this.sampleDetail.BarCodeNumber;
    //this.PatientLabInfo.TestName = $event.Data.LabTestCSV;

    if (this.PatientLabInfo.VisitType.toLowerCase() == 'inpatient') {
      this.PatientLabInfo.VisitType = 'IP';
    } else if (this.PatientLabInfo.VisitType.toLowerCase() == 'outpatient') {
      this.PatientLabInfo.VisitType = 'OP';
    } else if (this.PatientLabInfo.VisitType.toLowerCase() == 'emergency') {
      this.PatientLabInfo.VisitType = 'ER';
    }


    this.showlabsticker = false;
    this.changeDetector.detectChanges();
    this.showlabsticker = true;
    this.showModalBox = true;
  }

  public CloseModalBox() {
    this.showModalBox = false;
    this.router.navigate(['/Lab/Requisition']);
  }

  public CloseAfterPrint($event) {
    if ($event.exit) {
      this.showModalBox = false;
      this.router.navigate(['/Lab/Requisition']);
    }
  }

  public AlterSelectAllTest() {
    this.patientTestCSVs.forEach(test => {
      test.IsSelected = this.isAllTestSelected;
    });
    if (!this.isAllTestSelected)
      this.msgBoxServ.showMessage("Warning!", ["Please select test to collect sample."]);
  }

  public CheckIfAllSelected() {
    if ((this.patientTestCSVs.every(a => a.IsSelected == true))) {
      this.isAllTestSelected = true;
    }
    else if (this.patientTestCSVs.every(a => a.IsSelected == false)) {
      this.isAllTestSelected = false;
      this.msgBoxServ.showMessage("Warning!", ["Please select test to collect sample."]);
    }
    else {
      this.isAllTestSelected = false;
    }
  }

  //added: ashim: 20Sep2018: For update sample date feature.
  public ConfirmChangeSampleCreatedOn() {
    var createNew: boolean = window.confirm('Are you sure to change Sample Collection Date?');;
    if (createNew)
      this.showChangeSampleCreatedOn = true;
  }

  public CheckSampleCollectionDate() {
    let dateDiff = moment(moment(this.sampleCreatedOn).format('YYYY-MM-DD')).diff(moment().format('YYYY-MM-DD'));
    //if>0 then it is future date.
    if (dateDiff <= 0) {
      this.GetLatestSampleCode();
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Select valid sample collection date."]);
    }
  }
  public CancelDateChange() {
    this.sampleCreatedOn = moment().format("YYYY-MM-DD HH:mm");
    this.showChangeSampleCreatedOn = false;
  }

  public PrintEmptySheet() {
    this.showEmptySheet = true;
  }

  public CloseEmptyReportSheetPopUp($event) {
    if ($event.close) { this.CloseEmptySheet(); }
  }

  public CloseEmptySheet() {
    this.showEmptySheet = false;
  }

  public transferToLab(data) {
    this.selectedIndex = data;
    this.reqId = this.patientTestCSVs[data].RequisitionId;
    var currentLab = this.securityService.getActiveLab();
    this.fromTransfer = true;
    if (currentLab.LabTypeName == "op-lab") {
      this.labTypeName = "er-lab";
    } else {
      this.labTypeName = "op-lab";
    }
    let proceed: boolean = true;
    proceed = window.confirm("Do you want to Transfer this test to " + this.labTypeName + "?");
    if (proceed) {
      this.labBLService.TransfertToLab(this.reqId, this.labTypeName)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.patientTestCSVs = [];
            this.ListLabTestOfPatient();
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Couldn't transfer to other lab. Please try again."]);
            this.fromTransfer = false;
            console.log(err);
          });
    }
  }
  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (event.keyCode == 27) {
      this.CloseModalBox();
    }
  }

  ChangeDateFormat() {
    this.IsLocalDate = !this.IsLocalDate;
  }

  AutoGenerateRunNumber() {
    var selectedTests: Array<any> = new Array<any>();
    var isLastSampleUsed: boolean = false;
    this.allReqIdListForPrint = [];
    this.patientTestCSVs.filter(sam => {
      if (sam.IsSelected) {
        sam.BarCodeNumber = 0;
        this.allReqIdListForPrint.push(sam.RequisitionId);
        var test = _.omit(sam, ['SpecimenList']);
        selectedTests.push(test);
      }
    });

    this.coreService.loading = true;

    if (selectedTests.length > 0) {
      this.labBLService.GenerateSampleRunNumber(selectedTests, this.currentUser).subscribe(res => {
        if (res.Status == 'OK') {
          this.LatestSampleCode.SampleCode = res.Results.LatestSampleData.SampleCode;
          this.LatestSampleCode.SampleNumber = res.Results.LatestSampleData.SampleNumber;
          this.LatestSampleCode.BarCodeNumber = res.Results.LatestSampleData.BarCodeNumber;
          this.LatestSampleCode.SampleLetter = res.Results.LatestSampleData.SampleLetter;
          this.sampleDetail.BarCodeNumber = res.Results.BarCodeNumber;
          this.sampleDetail.FormattedSampleCode = res.Results.FormattedSampleCode;
          this.requisitionlist = [];
          this.UpdateSampleCodes();
          this.ManagePatientLabInfo(res.Results.SampleCollectedOnDateTime);
        }
        else {
          this.msgBoxServ.showMessage("error", ["Some issue in adding sample-code. Please try again."]);
          this.coreService.loading = false;
          this.loading = false;
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Some error issue in adding sample-code. Please try again."]);
          this.coreService.loading = false;
          this.loading = false;
        });
    } else {
      this.msgBoxServ.showMessage("failed", ["Please select test to collect sample."]);
      this.coreService.loading = false;
      this.loading = false;
    }

  }

  ChangeRunNumber() {
    this.loading = true;
    this.GetLatestSampleCode();
  }
}
