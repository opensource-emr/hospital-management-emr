import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { DanpheHTTPResponse } from '../../../../../src/app/shared/common-models';
import { VisitService } from '../../../appointments/shared/visit.service';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { BloodSugarMonitoring } from '../../shared/blood-sugar-monitoring.model';
import { IOAllergyVitalsBLService } from '../../shared/io-allergy-vitals.bl.service';
import { PatientInfoDTO } from '../../shared/patient-info.dto';

@Component({
    selector: 'add-blood-sugar',
    templateUrl: './add-blood-sugar.component.html'
})
export class AddBloodSugarComponent implements OnInit {

    @Input("showBloodSugarAddBox")
    public showBloodSugarAddBox: boolean = false;

    @Input("selected-BloodSugar")
    public CurrentBloodSugar: BloodSugarMonitoring = new BloodSugarMonitoring();

    @Output("callback-blood-sugar-update")
    public callbackBloodSugarUpdate: EventEmitter<Object> = new EventEmitter<Object>();

    public loading: boolean;
    public PatientInfo: PatientInfoDTO = new PatientInfoDTO();
    public patientVisitId: number = null;

    constructor(
        private messageBoxService: MessageboxService,
        private visitService: VisitService,
        private ioAllergyVitalsBLService: IOAllergyVitalsBLService,
        private securityService: SecurityService,
        public coreService: CoreService
    ) {
        this.patientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.GetPatientAdmissionInfo();
    }

    ngOnInit() {
    }

    public Close(): void {
        this.showBloodSugarAddBox = false;
    }

    public GetPatientAdmissionInfo(): void {
        this.ioAllergyVitalsBLService.GetPatientAdmissionInfo(this.patientVisitId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.PatientInfo = res.Results;
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed. please check log for details."], res.ErrorMessage);
                }
            });
    }

    public SubmitForm(): void {
        if (this.CurrentBloodSugar.IsValidCheck(undefined, undefined) === true) {
            this.loading = true;
            this.AddInputOutput();
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please fill the form!"]);
        }
    }

    public AddInputOutput(): void {
        this.CurrentBloodSugar.PatientVisitId = this.patientVisitId;
        this.CurrentBloodSugar.PatientId = this.visitService.getGlobal().PatientId;
        this.CurrentBloodSugar.IsActive = true;
        this.CurrentBloodSugar.CreatedBy = this.securityService.GetLoggedInUser().UserId;
        this.CurrentBloodSugar.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
        this.CurrentBloodSugar.EntryDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
        this.ioAllergyVitalsBLService.PostBloodSugar(this.CurrentBloodSugar)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.loading = false;
                    this.CallBackAddInputOutput();
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Added Successfully"]);
                    this.CurrentBloodSugar = new BloodSugarMonitoring();
                }
            },
                err => { this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err]); });
    }

    public CallBackAddInputOutput(): void {
        this.CurrentBloodSugar = new BloodSugarMonitoring();
        this.callbackBloodSugarUpdate.emit();
    }

    public Discard(): void {
        this.CurrentBloodSugar = new BloodSugarMonitoring();
    }

}
