import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { OperationTheatreBookingModel } from '../shared/ot-booking.model';
import { OperationTheatreBLService } from '../shared/ot.bl.service';
import { Patient } from '../../patients/shared/patient.model';
import { Employee } from '../../employee/shared/employee.model';
import { PatientService } from '../../patients/shared/patient.service';
import { OperationTheatreTeam } from '../shared/ot-team.model';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'ot-booking-add',
    templateUrl: './ot-booking-add.html',
    host: { '(window:keyup)': 'hotkeys($event)' }
})

export class OtBookingAddComponent {

    public selectedPatient: Patient = new Patient();
    public newOtBooking: OperationTheatreBookingModel = new OperationTheatreBookingModel();
    public otEmployeeList: Array<any> = new Array<any>();
    public allEmployeeList: Array<any> = new Array<any>();
    public PreSelectedOtAssistent: Array<any> = new Array<any>();
    public ExtRefSettings = { EnableExternal: true, DefaultExternal: false };
    public isReferrerLoaded: boolean = false;
    public defaultExtRef: boolean = false;
    public selectedRefId: number = null;
    public searchText: string = '';
    public allPatients: Array<any> = new Array<any>();
    public employeeList: Array<Employee> = new Array<Employee>();
    public defaultDoctorList: Array<any> = new Array<any>();
    public icd10List: Array<any> = new Array<any>();
    public diagnosis: any = null;
    public isFutureDateEnabled: boolean = true;
    public goToDatePick: boolean = false;
    public roleType = {
        AnesthetistDoctor: 'AnestheticDoctor',
        AnesthetistAssistant: 'AnesthtistAssistant',
        Surgeon: 'Surgeon',
        OtAssistant: 'OtAssistant',
        Nurse: 'ScrubNurse'
    }

    @Input("editMode") editMode: boolean = false;
    @Input("selectedOtPatient")
    public selectedOtData: OperationTheatreBookingModel = new OperationTheatreBookingModel();
    @Output() public callBackAddClose: EventEmitter<Object> = new EventEmitter<Object>();
    selectedSurgeons: Employee;
    public IsSubmitClicked: boolean = false;

    //callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public coreService: CoreService,
        public otBlService: OperationTheatreBLService,
        public msgBoxServ: MessageboxService,
        public patientService: PatientService,
        public changeDetector:ChangeDetectorRef) {
        this.allEmployeeList = DanpheCache.GetData(MasterType.Employee, null);

        if (this.allEmployeeList && this.allEmployeeList.length > 0)
            this.otEmployeeList = this.allEmployeeList.filter(a => a.IsAppointmentApplicable == true);
        this.isReferrerLoaded = true;
        this.getEmpList();
        this.GetICDList();
        this.SetFocusOn('srch_PatientList');
        //this.LoadPatientList("");

    }

    ngOnInit() {
        this.selectedPatient = new Patient()
        this.selectedPatient.ShortName = "";
        this.newOtBooking = new OperationTheatreBookingModel()
        this.newOtBooking.BookedForDate = moment().format('YYYY-MM-DDTHH:mm');

        if (this.editMode && this.selectedOtData) {
            // this.newOtBooking = this.selectedOtData;
            this.newOtBooking.PatientId = this.selectedOtData.PatientId;
            this.newOtBooking.PatientVisitId = this.selectedOtData.PatientVisitId;
            this.newOtBooking.OTBookingId = this.selectedOtData.OTBookingId;
            this.newOtBooking.BookedForDate = this.selectedOtData.BookedForDate;
            this.newOtBooking.SurgeryType = this.selectedOtData.SurgeryType;
            this.newOtBooking.ProcedureType = this.selectedOtData.ProcedureType;
            this.newOtBooking.AnesthesiaType = this.selectedOtData.AnesthesiaType;
            this.newOtBooking.Remarks = this.selectedOtData.Remarks;
            this.newOtBooking.Diagnosis = this.selectedOtData.Diagnosis;


            // Assign OT teams for edit
            this.newOtBooking.OtSurgeonList = this.selectedOtData.OtSurgeonList;
            this.newOtBooking.AnesthetistDoctor = this.selectedOtData.AnesthetistDoctor;
            this.newOtBooking.AnesthetistAssistant = this.selectedOtData.AnesthetistAssistant;
            this.newOtBooking.ScrubNurse = this.selectedOtData.ScrubNurse;
            this.newOtBooking.OtAssistantList = this.selectedOtData.OtAssistantList;
            this.PreSelectedOtAssistent = this.selectedOtData.OtAssistantList;


        }
    }

    // public GetOTBookingById() {
    //     this.otBlService.GetICDList()
    //         .subscribe(res => {
    //             if (res.Status == 'OK' && res.Results.length > 0) {
    //                 this.newOtBooking = res.Results;
    //             }
    //             else {
    //                 this.msgBoxServ.showMessage("error", ["Error! Check Cosole for details"]);
    //                 this.logError(res.ErrorMessage);
    //             }
    //         },
    //             err => {
    //                 this.msgBoxServ.showMessage("error", ['Failed to get OT booking details!']);
    //                 this.logError(err.ErrorMessage);
    //             });
    // }

    public GetICDList() {
        this.otBlService.GetICDList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.icd10List = res.Results;

                    // for showing selected diagnosis while editing
                    if (this.editMode && this.selectedOtData) {
                        this.diagnosis = this.icd10List.find(icd => icd.icd10Description == this.selectedOtData.Diagnosis).icd10Description;
                        // this.newOtBooking.Diagnosis = this.diagnosis;
                        this.newOtBooking.OperationTheatreValidator.get("Diagnosis").setValue(this.diagnosis);
                    }

                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get ICD10.. please check log for detail.']);
                    this.logError(err.ErrorMessage);
                });
    }

    // public LoadPatientList(searchTxt): void {
    //     this.otBlService.GetPatientsWithVisitsInfo(searchTxt)
    //         .subscribe(res => {
    //             if (res.Status == "OK") {
    //                 this.allPatients = res.Results;
    //                 if (this.editMode && this.selectedOtData) {
    //                     // this.newOtBooking = this.selectedOtData;    
    //                     this.selectedPatient = new Patient();                    
    //                     this.selectedPatient = this.allPatients.find(ap => ap.PatientId == this.selectedOtData.PatientId);
    //                 }
    //             }
    //             else {
    //                 this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //                 //alert(res.ErrorMessage);
    //                 console.log(res.ErrorMessage);
    //             }
    //         });
    // }
    public getEmpList() {
        // this.employeeList = DanpheCache.GetData(MasterType.Employee,null);
        //  this.showGrid = true;
        this.otBlService.GetEmployeeList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.employeeList = res.Results;

                    // if (this.editMode && this.selectedOtData) {

                    // }
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }

            });
    }

    public Close() {
        this.callBackAddClose.emit({ close: true });
    }

    public SaveOTBooking() {
        // console.log(this.newOtBooking.OtTeam);
        if (!this.selectedPatient) {
            this.newOtBooking.PatientId = undefined;
        }
        if (this.newOtBooking.PatientId) {
            for (var j in this.newOtBooking.OperationTheatreValidator.controls) {
                this.newOtBooking.OperationTheatreValidator.controls[j].markAsDirty();
                this.newOtBooking.OperationTheatreValidator.controls[j].updateValueAndValidity();
            }

            if (this.newOtBooking.IsValidCheck(undefined, undefined)) {

                // Assign OTTeams
                this.AssignOTTeams();
                this.IsSubmitClicked = true;
                if (!this.editMode) {
                    this.PostOTBooking();
                } else {
                    this.PutOTBooking();
                }

            }
        } else {
            alert('Patient not Selected! Please Select the patient first!');
            this.SetFocusOn('srch_PatientList');
        }


    }

    public AssignOTTeams() {

        // Assign OT Assistents
        this.AssignOTAssistents();

        // Assign Surgeons
        this.AssignSurgeons();

        // Assign Anesthetist Dr
        this.AssignAnesthetist();

        // Assign Anesthetist Assistant
        this.AssignAnesthetistAssistant();

        // Assign Scrub Nurse
        this.AssignScrubNurse();

    }

    public AssignOTAssistents() {
        if (this.defaultDoctorList.length != 0) {
            for (var i = 0; i < this.defaultDoctorList.length; i++) {
                let otteam = new OperationTheatreTeam();
                otteam.EmployeeId = this.defaultDoctorList[i];
                otteam.RoleType = this.roleType.OtAssistant;
                otteam.PatientId = this.newOtBooking.PatientId;
                otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
                this.newOtBooking.OtTeam.push(otteam);
            }
        }
    }

    public AssignSurgeons() {
        if (this.newOtBooking.OtSurgeonList.length > 0) {
            this.newOtBooking.OtSurgeonList.forEach(s => {
                let otteam = new OperationTheatreTeam();
                otteam.EmployeeId = s.EmployeeId;
                otteam.RoleType = this.roleType.Surgeon;
                otteam.PatientId = this.newOtBooking.PatientId;
                otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
                this.newOtBooking.OtTeam.push(otteam);
            });
        }

    }

    public AssignAnesthetist() {

        if (this.newOtBooking.AnesthetistDoctor) {
            let otteam = new OperationTheatreTeam();
            otteam.EmployeeId = this.newOtBooking.AnesthetistDoctor.EmployeeId;
            otteam.RoleType = this.roleType.AnesthetistDoctor;
            otteam.PatientId = this.newOtBooking.PatientId;
            otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
            this.newOtBooking.OtTeam.push(otteam);
        }
    }

    public AssignAnesthetistAssistant() {

        if (this.newOtBooking.AnesthetistAssistant) {
            let otteam = new OperationTheatreTeam();
            otteam.EmployeeId = this.newOtBooking.AnesthetistAssistant.EmployeeId;
            otteam.RoleType = this.roleType.AnesthetistAssistant;
            otteam.PatientId = this.newOtBooking.PatientId;
            otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
            this.newOtBooking.OtTeam.push(otteam);
        }
    }

    public AssignScrubNurse() {
        if (this.newOtBooking.ScrubNurse) {
            let otteam = new OperationTheatreTeam();
            otteam.EmployeeId = this.newOtBooking.ScrubNurse.EmployeeId;
            otteam.RoleType = this.roleType.Nurse;
            otteam.PatientId = this.newOtBooking.PatientId;
            otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
            this.newOtBooking.OtTeam.push(otteam);
        }

    }

    public PostOTBooking() {
        this.otBlService.PostNewBookingDetails(this.newOtBooking)
            .subscribe((res) => {
                console.log(res.Results)
                if (res.Status == "OK") {
                    console.log(res.Results)
                    this.callBackAddClose.emit({ close: true });
                    this.msgBoxServ.showMessage("Success", ["New Schedule added successfully."]);
                } else {
                    this.msgBoxServ.showMessage("failed", ["Sorry, Cannot add new booking"]);
                    this.SetFocusOn('srch_PatientList');
                }
            });
    }
    public PutOTBooking() {
        this.otBlService.PutBookingDetails(this.newOtBooking)
            .subscribe((res) => {
                console.log(res.Results)
                if (res.Status == "OK") {
                    console.log(res.Results)
                    this.callBackAddClose.emit({ close: true });
                    this.msgBoxServ.showMessage("Success", ["OT details Updated successfully."]);
                } else {
                    this.msgBoxServ.showMessage("Failed", ["Sorry, Failed to Update OT details!"]);
                    this.SetFocusOn('srch_PatientList');
                }
            });
    }

    public CallBackOtAssistant(event) {
        this.defaultDoctorList = [];
        let selectedDoc = event;
        selectedDoc.forEach(x => {
            this.defaultDoctorList.push(x.EmployeeId)
        });
    }

    public LoadReferrerSettings() {
        var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Billing" && a.ParameterName == "ExternalReferralSettings");
        if (currParam && currParam.ParameterValue) {
            this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
        }
    }

    public OnSurgeonChanged($event) {
        this.selectedRefId = $event.ReferrerId;
        //this.newOtBooking.SurgeonId = this.selectedRefId;
        if (this.selectedRefId) {
            let flag = this.newOtBooking.OtSurgeonList.some(s => s.EmployeeId == this.selectedRefId)
            if (!flag) {

                // for showing selected internal and external 
                let emp: Employee = new Employee();
                emp.EmployeeId = $event.ReferrerId;
                emp.FullName = $event.ReferrerName;
                this.newOtBooking.OtSurgeonList.push(emp);

                // let emp = this.employeeList.find(e => e.EmployeeId == this.selectedRefId);
                // if (emp)
                //     this.newOtBooking.OtSurgeonList.push(emp);
            } else {
                alert("Surgen Already added!");
            }

        }

    }
    public OnSurgeonRemoved(i, empId) {

        this.newOtBooking.OtSurgeonList.splice(i, 1);

        // let surg = this.newOtBooking.OtTeam.find(ot => ot.EmployeeId == empId);
        // if (surg) {
        //     let index = this.newOtBooking.OtTeam.findIndex(a => a.EmployeeId == empId);
        //     this.newOtBooking.OtSurgeonList.splice(index, 1);
        // }

    }

    public EmployeeFormatter(data: any) {
        let html = data["FullName"];
        return html;
    }

    // public AnesthetistDoctorChanged() {
    //     // this.newOtBooking.AnesthetistDoctorId = this.newOtBooking.AnesthetistDoctor.EmployeeId;

    //     let otteam = new OperationTheatreTeam();
    //     if (this.newOtBooking.AnesthetistDoctor) {
    //         otteam.EmployeeId = this.newOtBooking.AnesthetistDoctor.EmployeeId;
    //         otteam.RoleType = this.roleType.AnesthetistDoctor;
    //         otteam.PatientId = this.newOtBooking.PatientId;
    //         otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
    //         this.newOtBooking.OtTeam.push(otteam);
    //     }


    // }

    // public AnesthetistAssistantChanged() {
    //     let otteam = new OperationTheatreTeam();

    //     if (this.newOtBooking.AnesthetistAssistant) {
    //         otteam.EmployeeId = this.newOtBooking.AnesthetistAssistant.EmployeeId;
    //         otteam.RoleType = this.roleType.AnesthetistAssistant;
    //         otteam.PatientId = this.newOtBooking.PatientId;
    //         otteam.PatientVisitId = this.newOtBooking.PatientVisitId;
    //         this.newOtBooking.OtTeam.push(otteam);
    //     }

    // }

    DignosisFormatter(data: any): string {
        let html = data["icd10Description"];
        return html;
    }

    logError(err: any) {
        console.log(err);
    }

    loadICDs() {
        this.newOtBooking.Diagnosis = this.diagnosis ? this.diagnosis.icd10Description : null;
    }

    public AddCurrentExistingPatient() {
        // this.selectedPatient = new Patient();
        if (typeof (this.selectedPatient) != 'string') {
            if (this.selectedPatient.PatientId)
                this.newOtBooking.PatientId = this.selectedPatient.PatientId;
                if (this.selectedPatient.Visits && this.selectedPatient.Visits[0] && this.selectedPatient.Visits[0].PatientVisitId)
                this.newOtBooking.PatientVisitId = this.selectedPatient.Visits[0].PatientVisitId;
        }
    }


    public patientListFormatter(data: any): string {
        let html:string = "";
        // if (data) {
        //     html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'] + ' - ' + ' ' + data['PhoneNumber'];
        // } else {
        //     html = ""
        // }
        //html = data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'] + ' - ' + ' ' + data['PhoneNumber'];
        html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
        "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
        return html;

       
    }
      SetFocusOn(idToSelect: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(idToSelect);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
      SetFocusForMandatory(id:string,idToSelect: string,hasValue) {
        if(hasValue){
            if (typeof hasValue === "string") {
                if(!hasValue.replace(/\s/g, '').length)
                this.SetFocusOn(id)
                else
                 this.SetFocusOn(idToSelect)
            }
            else{
                window.setTimeout(function () {
                    let itmNameBox = document.getElementById(idToSelect);
                    if (itmNameBox) {
                      itmNameBox.focus();
                    }
                  }, 600);
            }
        }
        else this.SetFocusOn(id);
      }
      hotkeys(event){
        if(event.keyCode==27){
            this.Close()
        }
    }
    public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
        return   this.otBlService.GetPatientsWithVisitsInfo(keyword);
      }

      FocusOutFromDatePicker(event:any){
        if(event){
          this.goToDatePick= false;
          this.SetFocusOn('Diagnosis');
        }
      }
    
      goToDatePicker(){
        this.goToDatePick = false;
        this.changeDetector.detectChanges();
        this.goToDatePick = true;
        this.changeDetector.detectChanges();
      }

}