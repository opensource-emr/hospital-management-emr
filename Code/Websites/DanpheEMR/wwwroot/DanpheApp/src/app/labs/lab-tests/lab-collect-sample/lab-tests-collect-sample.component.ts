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
  templateUrl: "../../../view/lab-view/CollectSampleLabTests.html",  //"/LabView/CollectSampleLabTests"
  styleUrls: ['./lab-tests-collect-sample.style.css']
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
  public LatestSampleCode = { SampleCode: ' ', SampleNumber: 0, BarCodeNumber: 0 }
  public requisitionlist: Array<LabTestRequisition> = [];
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

  //ashim: 20Sep2018: Added for change Run number feature.
  public sampleCreatedOn: string;
  public showChangeSampleCreatedOn: boolean = false;
  public sampleCodeExistingDetail = { Exisit: false, PatientName: null, PatientId: null, SampleCreatedON: null };
  public sampleDetail = { FormattedSampleCode: null, BarCodeNumber: null };


  public showInsuranceFlag: boolean = false;//sud:16Jul'19


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

    this.ListLabTestOfPatient();

    this.labResultService.CreateNewGlobalLabTestResult();
    this.sampleCreatedOn = moment().format('YYYY-MM-DD HH:mm');
    this.GetLatestSampleCode();

    this.SetInsuranceFlagParam();//sud:16Jul'19
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
    this.labBLService.GetLabSamplesWithCodeByPatientId(this.patientId, this.visitType, this.RunNumberType, this.RequisitionId, this.wardNumber).
      subscribe(res => this.CallBackPatientTestCSVs(res),
        err => {
          this.msgBoxServ.showMessage("error", ["failed to get lab test of patient.. please check log for details."]);

        });
  }

  GetLatestSampleCode(): void {
    this.sampleCreatedOn = this.sampleCreatedOn ? this.sampleCreatedOn : moment().format('YYYY-MM-DD HH:mm');
    this.labBLService.GetLatestSampleCode(this.visitType, this.sampleCreatedOn, this.RunNumberType)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results) {
          this.LatestSampleCode.SampleCode = res.Results.SampleCode;
          this.LatestSampleCode.SampleNumber = res.Results.SampleNumber;
          this.LatestSampleCode.BarCodeNumber = res.Results.BarCodeNumber;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["failed to add result.. please check log for details."]);

        });
    this.showChangeSampleCreatedOn = false;
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
          //labTest.SmCode = res.SmCode;
          //labTest.SmNumber = res.SmNumber;
          this.patientTestCSVs.push(labTest);
        });
      }
      else {
        this.msgBoxServ.showMessage("failed", ["lab bill not paid"]);

        this.router.navigate(['/Lab/Requisition']);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    }
  }

  CheckIfSampleCodeExist() {
    if (this.LatestSampleCode.SampleNumber) {
      this.labBLService.GetSampleCodeCompared(this.LatestSampleCode.SampleNumber, this.visitType, this.sampleCreatedOn, this.RunNumberType)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results) {
            if (res.Results.Exist) {
              this.sampleCodeExistingDetail = res.Results;
              this.showConfirmationBox = true;
            }
            else {
              this.AddSampleCode();
            }
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Enter valid run number."]);

    }

  }

  //updating the sampleCode
  AddSampleCode(): void {
    this.showConfirmationBox = false;
    var isLastSampleUsed: boolean = false;
    var selectedTests: Array<any> = new Array<any>();
    this.patientTestCSVs.filter(sam => {
      if (sam.IsSelected) {
        if (this.LatestSampleCode) {
          sam.SampleCode = this.LatestSampleCode.SampleNumber.toString();
          sam.SampleCreatedOn = this.sampleCreatedOn;
          sam.SampleCreatedBy = null;
          sam.BarCodeNumber = this.LatestSampleCode.BarCodeNumber;
        }
        var test = _.omit(sam, ['SpecimenList']);
        selectedTests.push(test);
      }
    });

    if (isLastSampleUsed) {
      var continueUsingLastSample: boolean;
      continueUsingLastSample = window.confirm("You have selected UseLastSampleCode for some tests. Do you wish to continue?");
      if (!continueUsingLastSample)
        return;
    }

    if (selectedTests.length) {
      this.labBLService.PutSampleCode(selectedTests, this.currentUser)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.sampleDetail = res.Results;
            this.UpdateSampleCodes();


            this.PatientLabInfo.HospitalNumber = Number(this.patientService.globalPatient.PatientCode);

            let dob = this.patientService.globalPatient.DateOfBirth;
            let gender: string = this.patientService.globalPatient.Gender;

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
          else {
            this.msgBoxServ.showMessage("error", ["Some issue in adding sample-code. Please try again."]);
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Some error issue in adding sample-code. Please try again."]);
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please select test to collect sample."]);
    }

  }

  public UpdateSampleCodes() {
    this.patientTestCSVs = this.patientTestCSVs.filter(test => {
      if (test.IsSelected) {
        if (!test.UseLastSampleCode) {
          test.SampleCode = this.sampleDetail.FormattedSampleCode;
          test.BarCodeNumber = this.sampleDetail.BarCodeNumber;
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

  public GetLastSampleCode(index: number) {
    this.labBLService.GetLastSampleCode(this.patientTestCSVs[index].Specimen, this.patientTestCSVs[index].RequisitionId)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results) {
          this.patientTestCSVs[index].LastSampleCode = moment(res.Results.SampleCreatedOn).format("YYMMDD") + "-" + res.Results.SampleCode;
          this.patientTestCSVs[index].LastSpecimenUsed = res.Results.LabTestSpecimen;
          this.patientTestCSVs[index].SampleCreatedOn = res.Results.SampleCreatedOn;
          this.patientTestCSVs[index].SampleCreatedBy = res.Results.SampleCreatedBy;
          this.patientTestCSVs[index].ProviderName = res.Results.ProviderName;
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Some error issue in adding sample-code. Please try again."]);
          console.log(err);
        });
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
  ConfirmChangeSampleCreatedOn() {
    var createNew: boolean = window.confirm('Are you sure to change Sample Collection Date?');;
    if (createNew)
      this.showChangeSampleCreatedOn = true;
  }

  CheckSampleCollectionDate() {
    let dateDiff = moment(moment(this.sampleCreatedOn).format('YYYY-MM-DD')).diff(moment().format('YYYY-MM-DD'));
    //if>0 then it is future date.
    if (dateDiff <= 0) {
      this.GetLatestSampleCode();
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Select valid sample collection date."]);
    }
  }
  CancelDateChange() {
    this.sampleCreatedOn = moment().format("YYYY-MM-DD HH:mm");
    this.showChangeSampleCreatedOn = false;
  }
}
