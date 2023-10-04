import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { PatientService } from "../../../patients/shared/patient.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../../shared/labs.bl.service";
import { LabMasterModel, Requisition } from "../../shared/labMasterData.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { LabPendingResultVM } from "../../shared/lab-view.models";
import * as moment from 'moment/moment';
import { LabPatientModel } from "../../shared/lab-patient.model";
import { CoreService } from "../../../core/shared/core.service";
import { QrService } from "../../../shared/qr-code/qr-service";


@Component({
  selector: 'lab-barcode',
  templateUrl: "./lab-barcode.html"
})

export class LabBarCodeComponent {
  public barCodeNumber: number = null;

  //Added to search by RunNumber
  public runNumber: string = null;
  public showDetailTestsByRunNumber: boolean = false;

  public allLabDataByBarCodeNumber: LabMasterModel = null;
  public showDetailTests: boolean = false;

  public loading: boolean = false;

  //These Parameters are for AddResult on Master Page
  public showLabResult: boolean = false;
  public showReport: boolean = false;
  public showAddEdit: boolean = false;
  public labReqIdList: Array<number> = new Array<number>();


  //These Parameters are for PendingReports On Master Page
  public showPendingReportDetail: boolean = false;
  public showAddEditPendingReportDetail: boolean = false;
  public pendingReportReqIdList: Array<number> = new Array<number>();


  //These Parameters are for FinalReports On Master Page
  public showFinalReportDetail: boolean = false;
  public showAddEditFinalReportDetail: boolean = false;
  public finalReportReqIdList: Array<number> = new Array<number>();

  public allPatientList: Array<LabPatientModel> = new Array<LabPatientModel>();
  public patientToSearch: any = null;
  public pageLoading: boolean = false;
  public allowAllProvReport: boolean = false;

  public verificationRequired: boolean = false;


  constructor(public patientService: PatientService, public router: Router,
    public coreService: CoreService,public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public labBLService: LabsBLService,
    public qrService: QrService) {
    this.allowAllProvReport = this.coreService.AllowOutpatientWithProvisional();
    this.GetAllThePatientList();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    //if (!this.pageLoading) {
    //if (!this.pageLoading) {
    //    document.getElementById('barCodeSearchInput').focus();
    //}     
  }

  patientListFormatter(data: any): string {
    let html = "";
    html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'];
    return html;
  }

  public GetAllDataByPatientName() {
    if (this.patientToSearch && this.patientToSearch.PatientId) {
    this.patientService.CreateNewGlobal();
    this.loading = true;
    this.ResetAllData();    
    this.GetAllDataByPatientId(this.patientToSearch.PatientId);
    } 
  }

  public GetAllDataByHospitalNumber($event) {
    if ($event.patientCode) {
      var patIdFromPatCode = this.allPatientList.find(p => p.PatientCode == $event.patientCode);
      if (patIdFromPatCode && patIdFromPatCode.PatientId) {
        this.GetAllDataByPatientId(patIdFromPatCode.PatientId);
      } else { this.pageLoading = false; }
    } else { this.pageLoading = false; }
  }



  public GetAllDataByPatientId(patId: number) {
    this.pageLoading = true;
    this.labBLService.GetAllLabDataByPatientName(patId)
      .subscribe(res => {
        if (res.Status == "OK") {
          var dataRenderedIsValid: boolean = false;
          this.allLabDataByBarCodeNumber = res.Results;

          if (this.allLabDataByBarCodeNumber.LabRequisitions && this.allLabDataByBarCodeNumber.LabRequisitions.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.LabRequisitions.forEach(req => {
              req.AgeSexFormatted = CommonFunctions.GetFormattedAgeSex(req.DateOfBirth, req.Gender);
            });
          }

          if (this.allLabDataByBarCodeNumber.AddResult && this.allLabDataByBarCodeNumber.AddResult.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.AddResult.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;

                if (!templateNameCSV)
                  templateNameCSV = test.ReportTemplateShortName;
                else
                  templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }
          if (this.allLabDataByBarCodeNumber.PendingReport && this.allLabDataByBarCodeNumber.PendingReport.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.PendingReport.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;

              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }
          if (this.allLabDataByBarCodeNumber.FinalReport && this.allLabDataByBarCodeNumber.FinalReport.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.FinalReport.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;


                if (!templateNameCSV)
                  templateNameCSV = test.ReportTemplateShortName;
                else
                  templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }

          this.barCodeNumber = null;
          this.changeDetector.detectChanges();
          this.loading = false;
          this.pageLoading = false;

          if (dataRenderedIsValid) {
            this.showDetailTestsByRunNumber = true;
            this.showDetailTests = true;
          }
          else {
            this.pageLoading = false;
            this.msgBoxServ.showMessage("failed", ["Cannot Find LabTest of " + this.patientToSearch + "!"]);
          }

          this.runNumber = null;
          this.pageLoading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Please try again Later !!"]);
          this.allLabDataByBarCodeNumber = null;
          this.showDetailTests = false;
          this.showDetailTestsByRunNumber = false;
          this.barCodeNumber = null;
          this.loading = false;
          this.pageLoading = false;
        }
      });
  }

  public ReloadPageData() {
    this.ResetOnActionBtnEvntChng();
    this.GetAllThePatientList();
  }

  public GetAllThePatientList() {
    this.pageLoading = true;
    this.patientToSearch = null;
    this.labBLService.GetAllThePatientList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.allPatientList = res.Results;
          this.changeDetector.detectChanges();
          this.pageLoading = false;
          this.qrService.show = true;
          //document.getElementById("barCodeSearchInput").focus();          
        } else {
          this.msgBoxServ.showMessage("failed", ["Cannot Render the PatientList"]);
          this.pageLoading = false;
        }
      });

  }

  public GetReportDetail(ReportData: LabPendingResultVM, enableAddEdit: boolean) {
    this.ResetAllData();
    this.patientService.getGlobal().WardName = ReportData.WardName;
    if (ReportData && ReportData.Tests.length > 0) {
      this.barCodeNumber = ReportData.BarCodeNumber;
      //this.runNumber = ReportData["SampleCodeFormatted"];
      ReportData.Tests.forEach(reqId => {
        if (this.labReqIdList && this.labReqIdList.length) {
          if (!this.labReqIdList.includes(reqId.RequisitionId)) {
            this.labReqIdList.push(reqId.RequisitionId);
          }
        }
        else {
          this.labReqIdList.push(reqId.RequisitionId);
        }
      });

      this.changeDetector.detectChanges();
      this.verificationRequired = this.coreService.EnableVerificationStep();
      this.showAddEdit = enableAddEdit;
      this.showReport = !enableAddEdit;
      this.showLabResult = true;
    }
  }

  public GetAllLabDataByBarcodeNumber() {
    this.patientService.CreateNewGlobal();
    this.patientToSearch = null;
    this.ResetAllData();

    if (this.runNumber) { this.runNumber = this.runNumber.replace(/\s+/g, ''); }


    if ((this.barCodeNumber && !this.runNumber) || (!this.barCodeNumber && this.runNumber)) {

      //If BarCodeNumber is Entered
      if (this.barCodeNumber) {
        var isValidBarcodeNum = /^\d{5,7}$/.test(this.barCodeNumber.toString());
        if (this.barCodeNumber && Number.isInteger(this.barCodeNumber) && isValidBarcodeNum && this.barCodeNumber > 999999) {
          this.pageLoading = true;
          this.labBLService.GetAllLabDataByBarcodeNumber(this.barCodeNumber)
            .subscribe(res => {
              if (res.Status == 'OK') {
                this.allLabDataByBarCodeNumber = res.Results;

                this.allLabDataByBarCodeNumber.AgeSex = CommonFunctions.GetFormattedAgeSex(this.allLabDataByBarCodeNumber.DateOfBirth, this.allLabDataByBarCodeNumber.Gender);

                if (this.allLabDataByBarCodeNumber.AddResult && this.allLabDataByBarCodeNumber.AddResult.length > 0) {
                  this.allLabDataByBarCodeNumber.AddResult.forEach(result => {
                    let testNameCSV: string;
                    let templateNameCSV: string;
                    result.Tests.forEach(test => {
                      if (!testNameCSV)
                        testNameCSV = test.TestName;
                      else
                        testNameCSV = testNameCSV + "," + test.TestName;

                      if (!templateNameCSV)
                        templateNameCSV = test.ReportTemplateShortName;
                      else
                        templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
                    });
                    result.LabTestCSV = testNameCSV;
                    result.TemplateName = templateNameCSV;
                  });
                }
                if (this.allLabDataByBarCodeNumber.PendingReport && this.allLabDataByBarCodeNumber.PendingReport.length > 0) {
                  this.allLabDataByBarCodeNumber.PendingReport.forEach(result => {
                    let testNameCSV: string;
                    let templateNameCSV: string;
                    result.Tests.forEach(test => {
                      if (!testNameCSV)
                        testNameCSV = test.TestName;
                      else
                        testNameCSV = testNameCSV + "," + test.TestName;

                    });
                    result.LabTestCSV = testNameCSV;
                    result.TemplateName = templateNameCSV;
                  });
                }
                if (this.allLabDataByBarCodeNumber.FinalReport && this.allLabDataByBarCodeNumber.FinalReport.length > 0) {
                  this.allLabDataByBarCodeNumber.FinalReport.forEach(result => {
                    let testNameCSV: string;
                    let templateNameCSV: string;
                    result.Tests.forEach(test => {
                      if (!testNameCSV)
                        testNameCSV = test.TestName;
                      else
                        testNameCSV = testNameCSV + "," + test.TestName;


                      if (!templateNameCSV)
                        templateNameCSV = test.ReportTemplateShortName;
                      else
                        templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
                    });
                    result.LabTestCSV = testNameCSV;
                    result.TemplateName = templateNameCSV;
                  });
                }

                this.barCodeNumber = null;
                this.runNumber = null;
                this.changeDetector.detectChanges();
                this.showDetailTests = true;
                this.loading = false;
                this.pageLoading = false;
              }
              else {
                this.allLabDataByBarCodeNumber = null;
                this.showDetailTests = false;
                this.showPendingReportDetail = false;
                this.loading = false;
                this.pageLoading = false;
                this.msgBoxServ.showMessage("failed", ["This Barcode Number is not being used."]);
              }
            });
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Invalid Barcode Number " + this.barCodeNumber + "!"]);
          this.allLabDataByBarCodeNumber = null;
          this.showDetailTests = false;
          this.barCodeNumber = null;
          this.runNumber = null;
          this.loading = false;
          this.pageLoading = false;
        }
      }

      //If Run Number is entered
      else if (this.runNumber) {
        this.barCodeNumber = null;
        var isValidSampleCode = /^(\d+\/{1,1})?\d{1,3}$/.test(this.runNumber);
        var todayDate = moment().format("YYYY-MM-DD");
        var thisYear = Number(todayDate.toString().substring(0, 4));
        thisYear = thisYear + 57;
        if (isValidSampleCode) {
          var formattedSample = this.runNumber.split("/");
          var ln = formattedSample[1].length;

          var sampleCode = Number(formattedSample[0]);
          var typeCode = Number(formattedSample[1]);

          if (formattedSample[1].length <= 3 && (typeCode > 0 && typeCode <= thisYear) && sampleCode > 0) {
            this.GetAllLabDataByRunNumber(this.runNumber);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Run Number format error!"]);
            this.barCodeNumber = null;
            this.loading = false;
            this.pageLoading = false;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Invalid Run Number!"]);
          this.barCodeNumber = null;
          this.loading = false;
          this.pageLoading = false;
        }
      }

    }
    else {
      this.msgBoxServ.showMessage("failed", ["Please fill Exactly one field at a time."]);
      this.barCodeNumber = null;
      this.runNumber = null;
      this.loading = false;
      this.pageLoading = false;
    }


  }


  public GetAllLabDataByRunNumber(runNumber: string) {
    this.pageLoading = true;
    this.patientService.CreateNewGlobal();
    this.labBLService.GetAllLabDataByRunNumber(this.runNumber)
      .subscribe(res => {
        if (res.Status == 'OK') {

          var dataRenderedIsValid: boolean = false;
          this.allLabDataByBarCodeNumber = res.Results;


          if (this.allLabDataByBarCodeNumber.AddResult && this.allLabDataByBarCodeNumber.AddResult.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.AddResult.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;

                if (!templateNameCSV)
                  templateNameCSV = test.ReportTemplateShortName;
                else
                  templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }
          if (this.allLabDataByBarCodeNumber.PendingReport && this.allLabDataByBarCodeNumber.PendingReport.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.PendingReport.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;

              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }
          if (this.allLabDataByBarCodeNumber.FinalReport && this.allLabDataByBarCodeNumber.FinalReport.length > 0) {
            dataRenderedIsValid = true;
            this.allLabDataByBarCodeNumber.FinalReport.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;


                if (!templateNameCSV)
                  templateNameCSV = test.ReportTemplateShortName;
                else
                  templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
          }

          this.barCodeNumber = null;
          this.changeDetector.detectChanges();
          this.loading = false;
          this.pageLoading = false;
          if (dataRenderedIsValid) {
            this.showDetailTestsByRunNumber = true;
            this.showDetailTests = true;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Cannot Find " + this.runNumber + "!"]);
            this.pageLoading = false;
          }

          this.runNumber = null;
          this.pageLoading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Invalid Run Number " + this.runNumber + "!"]);
          this.allLabDataByBarCodeNumber = null;
          this.showDetailTests = false;
          this.showDetailTestsByRunNumber = false;
          this.barCodeNumber = null;
          this.loading = false;
          this.pageLoading = false;
        }
      });
  }



  public GetCurrentPendingReportDetail(pendingReportData: LabPendingResultVM) {
    this.ResetAllData();
    if (pendingReportData && pendingReportData.Tests.length > 0) {
      this.barCodeNumber = pendingReportData.BarCodeNumber;
      //this.runNumber = pendingReportData["SampleCodeFormatted"];
      pendingReportData.Tests.forEach(reqId => {
        if (this.pendingReportReqIdList && this.pendingReportReqIdList.length) {
          if (!this.pendingReportReqIdList.includes(reqId.RequisitionId)) {
            this.pendingReportReqIdList.push(reqId.RequisitionId);
          }
        }
        else {
          this.pendingReportReqIdList.push(reqId.RequisitionId);
        }
      });

      this.changeDetector.detectChanges();
      this.verificationRequired = this.coreService.EnableVerificationStep();
      this.showPendingReportDetail = true;
    }
  }

  public GetCurrentFinalReportDetail(finalReportData: LabPendingResultVM) {
    this.ResetAllData();
    if (finalReportData && finalReportData.Tests.length > 0) {
      this.barCodeNumber = finalReportData.BarCodeNumber;
      //this.runNumber = finalReportData["SampleCodeFormatted"];
      finalReportData.Tests.forEach(reqId => {
        if (this.finalReportReqIdList && this.finalReportReqIdList.length) {
          if (!this.finalReportReqIdList.includes(reqId.RequisitionId)) {
            this.finalReportReqIdList.push(reqId.RequisitionId);
          }
        }
        else {
          this.finalReportReqIdList.push(reqId.RequisitionId);
        }
      });

      this.changeDetector.detectChanges();
      this.verificationRequired = false;
      this.showFinalReportDetail = true;
    }
  }

  public EnterPressed(event) {
    if (event.keyCode == 13) {
      this.loading = true;
      this.GetAllLabDataByBarcodeNumber();
    }
  }


  public ViewDetails(req): void {
    this.patientService.getGlobal().PatientId = req.PatientId;
    this.patientService.getGlobal().ShortName = req.PatientName;
    this.patientService.getGlobal().PatientCode = req.PatientCode;
    this.patientService.getGlobal().DateOfBirth = req.DateOfBirth;
    this.patientService.getGlobal().Gender = req.Gender;
    this.patientService.getGlobal().PatientType = req.VisitType;
    this.patientService.getGlobal().RunNumberType = req.RunNumberType;
    this.patientService.getGlobal().RequisitionId = req.RequisitionId;
    this.patientService.getGlobal().WardName = req.WardName;
    this.router.navigate(['/Lab/CollectSample']);

  }

  public ResetAllData() {
    this.showDetailTests = false;
    this.showDetailTestsByRunNumber = false;

    this.showAddEdit = false;
    this.showLabResult = false;
    this.showReport = false;
    this.labReqIdList = new Array<number>();

    this.showPendingReportDetail = false;
    this.showAddEditPendingReportDetail = false;
    this.pendingReportReqIdList = new Array<number>();

    this.showFinalReportDetail = false;
    this.showAddEditFinalReportDetail = false;
    this.finalReportReqIdList = new Array<number>();
  }


  public ReadFailed($event) {
    this.ResetAllData();
  }

  public ResetOnActionBtnEvntChng() {
    this.patientToSearch = null;
    this.barCodeNumber = null;
    this.runNumber = null;
    this.ResetAllData();
  }
  public ShowQrScanner() {
    this.ResetOnActionBtnEvntChng();
    this.qrService.show = true;
  }
  public HideQrScanner() {
    this.ResetOnActionBtnEvntChng();
    this.qrService.show = false;
  }

}
