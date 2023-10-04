
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { AppointmentService } from '../../appointments/shared/appointment.service';
import { CoreService } from '../../core/shared/core.service';
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from '../../patients/shared/patient.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { APIsByType } from '../../shared/search.service';
import { APFPatientData } from '../shared/APFPatientData.model';
import { AppointmentBLService } from '../shared/appointment.bl.service';
import { VisitBLService } from '../shared/visit.bl.service';
import { VisitService } from '../shared/visit.service';
import { Rank_ApfHospital } from '../visit/visit-patient-info.component';

@Component({
    templateUrl: "./search-patient.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

export class PatientSearchComponent {

    patients: Array<Patient> = new Array<Patient>();
    public patient: Patient = new Patient();
    searchmodel: Patient = new Patient();
    public patGirdDataApi: string = "";
    //start: for angular-grid
    AppointmentpatientGridColumns: Array<any> = null;
    //start: for angular-grid
    searchText: string = '';
    public showInpatientMessage: boolean = false;
    public enableServerSideSearch: boolean = false;
    public wardBedInfo: any = null;
    public APFUrl: string = '';
    public IsAPFIntegrationEnabled: boolean = false;
    public ApfPatientDetails: APFPatientData = new APFPatientData();
    public SearchPatientUsingHospitalNo: boolean = false;
    public IsHospitalNoSearch: boolean = false; //This flag is send to server.
    public IsIdCardNoSearch: boolean = false; //This flag is send to server.
    public SearchPatientUsingIdCardNo: boolean = false;
    public RankList: Rank_ApfHospital[];

    constructor(
        public _patientservice: PatientService,
        public appointmentService: AppointmentService,
        public router: Router, public appointmentBLService: AppointmentBLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService, public visitService: VisitService,
        public visitBlService: VisitBLService
    ) {
        this.getParamter();
        this.Load("");
        this._patientservice.CreateNewGlobal();
        this.appointmentService.CreateNewGlobal();
        this.AppointmentpatientGridColumns = GridColumnSettings.AppointmentPatientSearch;
        this.patGirdDataApi = APIsByType.PatientListForRegNewVisit
        this.RankList = this.visitService.RankList;
    }

    ngAfterViewInit() {
        // document.getElementById('quickFilterInput').focus();
        let btnObj = document.getElementById('btnNewPatient');
        if (btnObj) {
            btnObj.focus();
        }
    }

    serverSearchTxt(searchTxt) {
        let searchTextData = searchTxt;
        if (this.isStringJson(searchTextData)) {
            searchTextData = JSON.parse(searchTextData);
            if (searchTextData && searchTextData.text && searchTextData.searchUsingHospitalNo) {
                this.searchText = searchTextData.text;
                this.IsHospitalNoSearch = searchTextData.searchUsingHospitalNo;
                this.IsIdCardNoSearch = false;
                this.Load(this.searchText);
            } else if (searchTextData && searchTextData.text && searchTextData.searchUsingIdCardNo) {
                this.searchText = searchTextData.text;
                this.IsIdCardNoSearch = searchTextData.searchUsingIdCardNo;
                this.IsHospitalNoSearch = false;
                this.Load(this.searchText);
            } else {
                this.searchText = searchTextData;
                this.IsHospitalNoSearch = false;
                this.IsIdCardNoSearch = false;
                this.Load(this.searchText);
            }
        } else {
            this.searchText = searchTextData;
            this.IsHospitalNoSearch = false;
            this.IsIdCardNoSearch = false;
            this.Load(this.searchText);
        }
    }

    isStringJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    getParamter() {
        let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
        var data = JSON.parse(parameterData);
        this.enableServerSideSearch = data["PatientSearchPatient"];
        let param = this.coreService.Parameters.find(a => a.ParameterGroupName == 'Appointment' && a.ParameterName == 'APFUrlForPatientDetail');
        if (param) {
            let obj = JSON.parse(param.ParameterValue);
            this.APFUrl = obj.BaseURL;
            this.IsAPFIntegrationEnabled = JSON.parse(obj.EnableAPFPatientRegistrtion);
        }

        let parameterToSearchUsingHospNo = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "SearchPatientUsingHospitalNo");
        if (parameterToSearchUsingHospNo) {
            let obj = JSON.parse(parameterToSearchUsingHospNo.ParameterValue);
            this.SearchPatientUsingHospitalNo = obj.SearchPatientUsingHospitalNumber;
            this.IsHospitalNoSearch = false;
        }
        let parameterToSearchUsingIdCardNo = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "SearchPatientUsingIdCardNo");
        if (parameterToSearchUsingIdCardNo) {
            let obj = JSON.parse(parameterToSearchUsingIdCardNo.ParameterValue);
            this.SearchPatientUsingIdCardNo = obj.SearchPatientUsingIdCardNo;
            this.IsIdCardNoSearch = false;
        }


    }
    Load(searchText): void {
        this.appointmentBLService.GetPatientsListForNewVisit(searchText, this.IsHospitalNoSearch, this.IsIdCardNoSearch)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.patients = res.Results;
                }
                else {
                    //alert(res.ErrorMessage);
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

                }
            },
                err => {
                    //alert('failed to get  patients');
                    this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

                });
    }

    public getIdCardNumber(data) {
        this.visitBlService.GetAPIPatientDetail(this.APFUrl, data.IDCardNumber).subscribe(res => {
            this.ApfPatientDetails = res;
        },
            err => {
            })
    }

    //ashim: 22Aug2018 : Removed unnecessary server call to get patient details
    SelectPatient(event, _patient) {
        let pat = this._patientservice.getGlobal();
        Object.keys(_patient).forEach(property => {
            if (property in pat) {
                pat[property] = _patient[property];
            }
        });
        pat.DateOfBirth = moment(pat.DateOfBirth).format('YYYY-MM-DD');
        if (this.IsAPFIntegrationEnabled && this.ApfPatientDetails.id) {
            pat.Rank = this.ApfPatientDetails.rank;
            pat.Posting = this.ApfPatientDetails.posting;
        }
        else {
            pat.Rank = _patient.Rank;
            pat.Posting = _patient.Posting;
        }
        pat.SSFPolicyNo = _patient.SSFPolicyNo;
        pat.PolicyNo = _patient.PolicyNo;
        pat.MedicareMemberNo = _patient.MedicareMemberNo;
        pat.CareTaker.CareTakerName = _patient.CareTakerName;
        pat.CareTaker.CareTakerContact = _patient.CareTakerContact;
        pat.CareTaker.RelationWithPatient = _patient.RelationWithCareTaker;
        //sud:6Sept'21--Pls don't remove below (appointmenttype)--it causes issue during refer/followup.
        this.visitService.appointmentType = "New";
        this.router.navigate(["/Appointment/Visit"]);
        //var pat = this._patientservice.getGlobal();
        //this.appointmentBLService.GetPatientById(_patient.PatientId)
        //    .subscribe(res =>
        //        this.CallBackSelected(res),
        //    err => {
        //        this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
        //        //alert('failed to get selected patient');

        //    });
    }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }

    AppointmentPatientGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "appoint":
                {
                    //this.wardBedInfo = { WardName: null, BedCode: null, Date: null };
                    if ($event.Data.IsAdmitted) {
                        // this.wardBedInfo = { WardName:  $event.Data.WardName, BedCode: $event.Data.BedCode, Date: null };
                        this.showInpatientMessage = true;
                    } else {
                        if (this.IsAPFIntegrationEnabled) {
                            this.getIdCardNumber($event.Data);

                        }
                        this.SelectPatient(null, $event.Data)
                    }
                }
                break;
            default:
                break;
        }

        // alert($event.Action);
    }

    NewPatientAppointment() {

        //sud:6Sept'21--Pls don't remove below (appointmenttype)--it causes issue during referral...
        this.visitService.appointmentType = "New";
        this.router.navigate(["/Appointment/Visit"]);
    }

    //this function is hotkeys when pressed by user
    hotkeys(event) {
        if (event.altKey) {
            switch (event.keyCode) {
                case 78: {// => ALT+N comes here
                    this.NewPatientAppointment();
                    break;
                }
                default:
                    break;
            }
        }

    }

    //

}
