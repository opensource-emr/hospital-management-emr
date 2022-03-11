import { Component, Output, EventEmitter, Input } from "@angular/core";
import { Observable } from "rxjs-compat";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DeathDetails } from "../../adt/shared/death.detail.model";
import { MR_BLService } from "../shared/mr.bl.service";
import { CoreService } from "../../core/shared/core.service";
@Component({
    selector: 'add-death-details-shared',
    templateUrl: 'add-death-details-shared.html'
})
export class AddDeathDetailsSharedComponent {
    public DeathDetails: DeathDetails = new DeathDetails();
    public IsEditMode: boolean = false;
    public IsPatientDead: boolean = false;
    @Output('CallBack')
    public emitter: EventEmitter<object> = new EventEmitter<object>();
    public SelectedPatient: any;
    public AddDeathButtionClicked: boolean = false;
    public ValidPatient: boolean = true;
    public AllDeadPatients: Array<DeathDetails> = [];

    @Input('PatientId')
    public PatientId: number;

    @Output('death-details-emitter')
    public emitterForDeathDetails: EventEmitter<object> = new EventEmitter<object>();

    public showSelectPatient: boolean = false;
    public AllDeathCertificateNumbers: Array<any> = [];

    public duplicateCertificateNumber: boolean = false;

    public IsLoading: boolean = false;
    constructor(public medicalRecordsBLService: MR_BLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService) {
        this.coreService.FocusInputById('srch_PatientList');
        this.GetAllDeathCertificatesNumbers();
    }

    ngOnInit() {
        if (this.PatientId && this.PatientId > 0) {
            this.DeathDetails.PatientId = this.PatientId;
            this.showSelectPatient = false;
            this.GetPatientDeathDetailsById();

        } else {
            this.showSelectPatient = true;
        }
    }

    public GetAllDeadpatient() {
        this.medicalRecordsBLService.GetAllDeadPatients().subscribe(
            res => {
                if (res.Status == 'OK') {
                    this.AllDeadPatients = res.Results;
                    this.CheckWhetherThePatientIsDeadOrNot();
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);

            }
        );
    }

    public GetPatientDeathDetailsById() {
        this.medicalRecordsBLService.GetPatientDeathDetailsById(this.DeathDetails.PatientId).subscribe(
            res => {
                if (res.Status == 'OK') {
                    if (res.Results) {
                        this.DeathDetails.DeathId = res.Results.DeathId;
                        this.DeathDetails.CertificateNumber = res.Results.CertificateNumber;
                        this.DeathDetails.DeathTime = res.Results.DeathTime;
                        this.DeathDetails.DeathDate = res.Results.DeathDate;
                        this.IsPatientDead = true;
                    }else{
                        this.IsPatientDead = false;
                    }
                }
                else {
                    console.log(res.ErrorMessage);
                    this.msgBoxServ.showMessage("Information", ["Please Check the console for Error Log"]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("Information", ["Please Check the console for Error Log"]);

            }
        );
    }


    public AddDeathDetails() {
        var IsDataValid: boolean = this.ValidateDeathDetails();
        if (this.DeathDetails.PatientId && this.DeathDetails.PatientId != 0) {
            if (IsDataValid) {

                this.emitterForDeathDetails.emit({ Status: 'Submit', data: this.DeathDetails });
                if (this.showSelectPatient == false) {
                    this.msgBoxServ.showMessage('sucess', ["Death details has been added sucessfully"]);
                }
            }
            else {
                this.msgBoxServ.showMessage("error", ["Enter the valid data !!"]);
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ["Please select a Patient!!"])
        }
    }

    ValidateDeathDetails(): boolean {
        for (var i in this.DeathDetails.DeathDetailsValidator.controls) {
            this.DeathDetails.DeathDetailsValidator.controls[i].markAsDirty();
            this.DeathDetails.DeathDetailsValidator.controls[i].updateValueAndValidity();
        }
        if (this.DeathDetails.IsValidCheck(undefined, undefined)) {
            return true;

        } else {
            return false;
        }
    }
    PatientListFormatter(data: any): string {
        let html: string = "";
        html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
            "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
        return html;
    }

    public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

        return this.medicalRecordsBLService.GetAllPatients(keyword);

    }

    public GetAllDeathCertificatesNumbers() {
        this.medicalRecordsBLService.GetAllDeathCertificateNumbers().subscribe(
            res => {
                if (res.Status == 'OK') {
                    this.AllDeathCertificateNumbers = res.Results;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);

            }
        );
    }

    OnDeathCertificateChange() {
        this.duplicateCertificateNumber = this.isDeathCertificateNoDuplicate(this.DeathDetails.CertificateNumber);
    }

    CertificateEnterKeyClick(){
        if(this.duplicateCertificateNumber){
            this.coreService.FocusInputById('certNum'); 
        }else{
            this.coreService.FocusInputById('DeathTime'); 
        }              
    }
    /**
     * Find if entered certificate number is already registered before
     * @param deathCertificateNumber 
     * @returns true if duplicate is found
     */
    public isDeathCertificateNoDuplicate(deathCertificateNumber) {
        return this.AllDeathCertificateNumbers.some(a => a.CertificateNumber == deathCertificateNumber.trim());
    }

    public PatientInfoChanged() {

        if (this.SelectedPatient && this.SelectedPatient.PatientId > 0) {
            this.DeathDetails.PatientId = this.SelectedPatient.PatientId;
            this.DeathDetails.PatientVisitId = this.SelectedPatient.PatientVisitId;
            this.DeathDetails.Age = this.SelectedPatient.Age;
            this.GetPatientDeathDetailsById();
            this.coreService.FocusInputById('certNum');
        }
    }

    public CheckWhetherThePatientIsDeadOrNot() {

        if (this.DeathDetails && this.DeathDetails.PatientId && this.DeathDetails.PatientId != 0) {
            this.IsPatientDead = false;
            let d = this.AllDeadPatients.find(b => b.PatientId == this.DeathDetails.PatientId);
            if (d) {
                this.DeathDetails.DeathId = d.DeathId;
                this.DeathDetails.CertificateNumber = d.CertificateNumber;
                this.DeathDetails.DeathTime = d.DeathTime;
                this.DeathDetails.DeathDate = d.DeathDate;
                this.IsPatientDead = true;
            }
        }
        else {
            this.IsLoading = false;
        }
    }

    Close() {
        this.emitterForDeathDetails.emit({ Status: 'close', data: null });
    }
}


