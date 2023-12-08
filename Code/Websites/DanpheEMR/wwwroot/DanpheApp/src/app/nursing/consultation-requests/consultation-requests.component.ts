import { Component, OnInit } from "@angular/core";
import { VisitService } from "../../appointments/shared/visit.service";
import { Employee } from "../../employee/shared/employee.model";
import { PatientService } from "../../patients/shared/patient.service";
import { SecurityService } from "../../security/shared/security.service";
import { Department } from "../../settings-new/shared/department.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { ConsultationRequestGridDTO } from "../shared/dto/consultation-request-grid.dto";
import { NursingService } from "../shared/nursing-service";
import { NursingBLService } from "../shared/nursing.bl.service";
@Component({
    selector: "consultation-requests",
    templateUrl: "./consultation-requests.component.html"
})
export class ConsultationRequestsComponent implements OnInit {
    public ConsultationRequestGridColumns: Array<any> = null;
    public NepaliDateInGridSettings = new NepaliDateInGridParams();
    public ConsultationRequestList = new Array<ConsultationRequestGridDTO>();
    public SelectedConsultationRequest = new ConsultationRequestGridDTO();
    public ShowAddNewRequestPopup: boolean = false;
    public ShowViewPrintPopup: boolean = false;
    public IsNewRequest: boolean = false;
    public PatientVisitId: number = 0;
    public DepartmentList = new Array<Department>();
    public DoctorList = new Array<Employee>();

    constructor(
        private _securityService: SecurityService,
        private _nursingBLService: NursingBLService,
        private _messageBoxService: MessageboxService,
        private _visitService: VisitService,
        private _patientService: PatientService,
        private _nursingService: NursingService
    ) {
        let colSettings = new GridColumnSettings(this._securityService);
        this.ConsultationRequestGridColumns = colSettings.ConsultationRequest;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequestedOn', true), new NepaliDateInGridColumnDetail('ConsultedOn', true));
    }

    ngOnInit() {
        (async () => {
            this.PatientVisitId = this._visitService.getGlobal().PatientVisitId;
            this.GetConsultationRequestsByPatientVisitId(this.PatientVisitId);
            await this.GetDepartmentList();
            await this.GetDoctorList();
        })()
            .catch((error) => {
            });
    }

    public logError(err: any): void {
        console.log(err);
    }

    public async GetDepartmentList() {
        try {
            const res: DanpheHTTPResponse = await this._nursingBLService.GetAllApptDepartment().toPromise();
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.DepartmentList = res.Results;
                this._nursingService.SetDepartmentList(this.DepartmentList);
            } else {
                this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
                    "Failed to get DepartmentList.",
                ]);
            }
        } catch (error) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                "Failed to get DepartmentList.",
            ]);
        }
    }

    public async GetDoctorList() {
        try {
            const res: DanpheHTTPResponse = await this._nursingBLService.GetAllAppointmentApplicableDoctor().toPromise();
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.DoctorList = res.Results;
                this._nursingService.SetDoctorList(this.DoctorList);
            } else {
                this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
                    "Failed to get DoctorList.",
                ]);
            }
        } catch (error) {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                "Failed to get DoctorList.",
            ]);
        }
    }

    public GetConsultationRequestsByPatientVisitId(PatientVisitId: number): void {
        this._nursingBLService
            .GetConsultationRequestsByPatientVisitId(PatientVisitId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.ConsultationRequestList = res.Results;
                } else {
                    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to get Consultation Request List.",]);
                }
            }),
            (err) => {
                this.logError(err);
            };
    }

    public ConsultationRequestGridActions(event): void {
        switch (event.Action) {
            case "respond":
                this.SelectedConsultationRequest = event.Data;
                this.IsNewRequest = false;
                this.ShowAddNewRequestPopup = true;
                break;

            case "view":
                this.SelectedConsultationRequest = event.Data;
                this.ShowViewPrintPopup = true;
                break;

            default:
                break;
        }
    }

    public AddNewRequest(): void {
        this.IsNewRequest = true;
        this.ShowAddNewRequestPopup = true;
    }

    public AddNewRequestCallBack(data): void {
        if (data === true) {
            this.ShowAddNewRequestPopup = false;
            this.IsNewRequest = false;
            this.GetConsultationRequestsByPatientVisitId(this.PatientVisitId);
        }
    }

    public ViewPageCallBack(data): void {
        if (data === true) {
            this.ShowViewPrintPopup = false;
        }
    }
}
