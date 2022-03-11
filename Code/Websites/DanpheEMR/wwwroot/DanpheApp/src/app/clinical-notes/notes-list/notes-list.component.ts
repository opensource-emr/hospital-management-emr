import { Component } from "@angular/core";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { SecurityService } from "../../security/shared/security.service";
import { Visit } from "../../appointments/shared/visit.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { NoteTemplateBLService } from "../shared/note-template.bl.service";
import { NotesModel } from "../shared/notes.model";
import { trigger, transition, style, animate } from "@angular/animations";
import { Router } from "@angular/router";
import { User } from "../../security/shared/user.model";
import { CoreService } from "../../core/shared/core.service";
import { IOAllergyVitalsBLService } from "../../clinical/shared/io-allergy-vitals.bl.service";
import { Vitals } from "../../clinical/shared/vitals.model";
import { PatientService } from "../../patients/shared/patient.service";
import { Allergy } from "../../clinical/shared/allergy.model";
import { ADT_BLService } from "../../adt/shared/adt.bl.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./notes-list.html",  
})
export class NotesListComponent {
  public ViewTemplateGridColumn: Array<any> = null;
  public patientClinicalNotes = [];
  public currentVisit: Visit;
  public vitalsList: Array<Vitals> = new Array<Vitals>();
  public allergieLists: Array<Allergy> = new Array<Allergy>();
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public loggedInUser: User = new User();
  public showViewNoteList: boolean = false;
  public showViewProcedureNoteList: boolean = false;
  public IsPending: boolean = null;
  public showPrintButton: boolean = false;
  public showProgressViewNoteList: boolean = false;
  public templatedata: NotesModel = new NotesModel();
  public patVisit: Visit = new Visit();
  public showClinicalOPDExaminationNotesView:boolean=false;
  public patientVisitId:number=0;
 
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  public freeNotesTempData: any;
  public procedureNotesTempData: any;
  public progressNotesTempData: any;

  public showDischargeSummaryView: boolean = false;
  public selectedPatient: any;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    public showHPView: boolean = false;
    public showEmergrncyNoteView: boolean = false;
  public showClinicalPrescriptionNoteView: boolean = false;
    
  constructor(
    public http: HttpClient,
    public patientServ: PatientService,
    public ioAllergyVitalsBLService: IOAllergyVitalsBLService,
    public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public visitService: VisitService,
    public securityService: SecurityService,
    public notetemplateBLService: NoteTemplateBLService,
    public adtBlService: ADT_BLService
  ) {
    this.patVisit = this.visitService.getGlobal();
    this.GetPatientClinicalNotes();
    this.GetPatientVitalsList();
    this.GetInventoryBillingHeaderParameter();
    this.ViewTemplateGridColumn = GridColumnSettings.ViewTemplateGridList;
    this.loggedInUser = this.securityService.GetLoggedInUser();
    this.GetPatientAllergyList();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("CreatedOn", true)
    );
  }

  GetPatientVitalsList(): void {
    this.ioAllergyVitalsBLService
      .GetPatientVitalsList(this.patVisit.PatientVisitId)
      .subscribe(
        (res) => {
          if (res.Status == "OK") {
            this.vitalsList = res.Results;
            console.log(this.vitalsList);
          } else {
            this.msgBoxServ.showMessage(
              "failed",
              [
                "Failed to get Patient Vitals list! please check log for details.",
              ],
              res.ErrorMessage
            );
          }
        },
        (err) => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        }
      );
  }

  //gets the list of allergy of the selected patient.
  GetPatientAllergyList(): void {
    let patientId = this.patientServ.getGlobal().PatientId;
    this.ioAllergyVitalsBLService
      .GetPatientAllergyList(patientId)
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.allergieLists = res.Results;
          this.patientServ.globalPatient.Allergies = this.allergieLists;
          this.patientServ.globalPatient.FormatPatientAllergies();
        } else {
          this.msgBoxServ.showMessage(
            "failed",
            [
              "Failed to get PatientAllergyList ! please check log for details.",
            ],
            res.ErrorMessage
          );
        }
      });
  }

  GetPatientClinicalNotes() {
    this.http
      .get<any>(
        "/api/Clinical?reqType=patient-clinical-notes&patientId=" +
          this.patVisit.PatientId,
        this.options
      )
      .map((res) => res)
      .subscribe((res) => {
        if (res.Status == "OK") {
          this.patientClinicalNotes = res.Results;
          for (var i = 0; i < this.patientClinicalNotes.length; i++) {
            this.patientClinicalNotes[
              i
            ].LoggedInEmployeeId = this.loggedInUser.EmployeeId;
            //console.log(this.patientClinicalNotes);
          }
        } else {
          this.msgBoxServ.showMessage("failed", [
            "Unable to get patient clinical notes.",
          ]);
          console.log(res.ErrorMessage);
        }
      });
  }

  ViewNoteTemplateListGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view":
        {
          //var TempType = $event.Data.TemplateName;
          this.templatedata = $event.Data;
          //  this.showViewNoteList = true;
          if ($event.Data.TemplateName == "Free Text") {
            this.notetemplateBLService
              .GetFreetextNoteTemplateByNotesId(this.templatedata.NotesId)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.freeNotesTempData = res.Results;
                  this.showViewNoteList = true;
                } else {
                  this.msgBoxServ.showMessage("Failed", ["No Template."]);
                }
              });
            // console.log(this.templatedata.NotesId);
            //console.log(this.patientClinicalNotes[0].NotesId);
            // this.notetemplateBLService.GetFreetextNoteTemplate(this.patientClinicalNotes[0].NotesId)
          }

          if ($event.Data.TemplateName == "Procedure Note") {
            this.notetemplateBLService
              .GetProcedureNoteTemplateByNotesId(this.templatedata.NotesId)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.procedureNotesTempData = res.Results;
                  this.showViewProcedureNoteList = true;
                } else {
                  this.msgBoxServ.showMessage("Failed", ["No Template."]);
                }
              });
          }
          if ($event.Data.TemplateName == "Progress Note") {
            this.notetemplateBLService
              .GetProgressNoteTemplateByNotesId(this.templatedata.NotesId)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.progressNotesTempData = res.Results;
                  //    console.log(this.progressivNotesTempData[0].IsPending);
                  this.showProgressViewNoteList = true;
                } else {
                  this.msgBoxServ.showMessage("Failed", ["No Template."]);
                }
              });
          }
          if ($event.Data.TemplateName == "Discharge Note") {
            this.getPatientPlusBedInfo();
          }
          if ($event.Data.TemplateName == "History & Physical") {
            this.showHPView = true;
            this.notetemplateBLService.NotesId = $event.Data.NotesId;
          }
          if ($event.Data.TemplateName == "Emergency Note") {
            this.showEmergrncyNoteView = true;
            this.notetemplateBLService.NotesId = $event.Data.NotesId;
          }
          if ($event.Data.TemplateName == "Prescription Note") {
            this.showClinicalPrescriptionNoteView = true;
            this.notetemplateBLService.NotesId = $event.Data.NotesId;
          } 
          if ($event.Data.TemplateName == "OPD Examination") {
            this.patientVisitId=$event.Data.PatientVisitId;
            this.notetemplateBLService.NotesId=$event.Data.NotesId;
            this.showClinicalOPDExaminationNotesView = true;
          } 
        }
        break;
      case "edit": {
        var NotesId = $event.Data.NotesId;
        this.notetemplateBLService.NotesId = NotesId;
        if (
          this.securityService.currentModule &&
          this.securityService.currentModule.toLowerCase() == "doctor"
        ) {
          this.router.navigate([
            "/Doctors/PatientOverviewMain/NotesSummary/FreeNotes",
          ]);
        }
        if (
          this.securityService.currentModule &&
          this.securityService.currentModule.toLowerCase() == "nursing"
        ) {
          this.router.navigate([
            "/Nursing/PatientOverviewMain/Notes/FreeNotes",
          ]);
        }
      }

      default:
        break;
    }
  }

  Close() {
    this.showViewNoteList = false;
    this.showViewProcedureNoteList = false;
    this.showProgressViewNoteList = false;
    this.showDischargeSummaryView = false;
    this.showClinicalPrescriptionNoteView = false;
    this.showHPView = false;
    this.showEmergrncyNoteView = false;
    this.showClinicalOPDExaminationNotesView=false;
    this.patientVisitId=0;
  }

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      (a) => a.ParameterName == "Inventory Receipt Header"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", [
        "Please enter parameter values for BillingHeader",
      ]);
  }

  printTemplate(id: string = 'print-template') {
    let popupWinindow;
    var printContents = document.getElementById(id).innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      `<html><head>
      <link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />
      <link rel="stylesheet" type="text/css" href="../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" />
      </head><body onload="window.print()">` +
        printContents +
        "</body></html>"
    );

    popupWinindow.document.close();
  }

  RouteToAddOpdExamination(){
    this.router.navigate([
      "/Doctors/PatientOverviewMain/NotesSummary/OPDExamination",
    ]);
  }
  CallBackView($event) {
    // if ($event.Data.TemplateName ==  this.NoteType) {
    //   this.showView = true;
    //   this.notetemplateBLService.NotesId = $event.Data.NotesId;
    // }
  }
  RouteToAddNotes() {
    if (
      this.securityService.currentModule &&
      this.securityService.currentModule.toLowerCase() == "doctor"
    ) {
      this.router.navigate([
        "/Doctors/PatientOverviewMain/NotesSummary/FreeNotes",
      ]);
    }

    if (
      this.securityService.currentModule &&
      this.securityService.currentModule.toLowerCase() == "nursing"
    ) {
      this.router.navigate(["/Nursing/PatientOverviewMain/Notes/FreeNotes"]);
    }
  }

  getPatientPlusBedInfo() {
    this.adtBlService
      .GetPatientPlusBedInfo(
        this.patVisit.PatientId,
        this.patVisit.PatientVisitId
      )
      .subscribe((res) => {
        if (res.Status == "OK" && res.Results.length != 0) {
          this.selectedPatient = res.Results[0];
          this.showDischargeSummaryView = true;
        }
      });
  }
}
