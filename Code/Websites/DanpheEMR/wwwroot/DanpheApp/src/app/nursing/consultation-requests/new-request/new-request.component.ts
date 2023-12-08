import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as moment from "moment";
import { VisitService } from "../../../appointments/shared/visit.service";
import { Employee } from "../../../employee/shared/employee.model";
import { PatientService } from "../../../patients/shared/patient.service";
import { Department } from "../../../settings-new/shared/department.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
    ENUM_ConsultationRequestStatus,
    ENUM_DanpheHTTPResponses,
    ENUM_MessageBox_Status,
} from "../../../shared/shared-enums";
import { ConsultationRequestModel } from "../../shared/consultation-request.model";
import { ConsultationRequestGridDTO } from "../../shared/dto/consultation-request-grid.dto";
import { NursingService } from "../../shared/nursing-service";
import { NursingBLService } from "../../shared/nursing.bl.service";

@Component({
    selector: "new-request",
    templateUrl: "./new-request.component.html",
    host: { "(window:keydown)": "hotkeys($event)" },
})
export class NewRequestComponent implements OnInit {
    @Input("ShowAddNewRequestPopup")
    public ShowAddNewRequestPopup: boolean = false;

    @Input("IsNewRequest")
    public IsNewRequest: boolean = false;

    @Input("SelectedConsultationRequest")
    public SelectedConsultationRequest: ConsultationRequestGridDTO = new ConsultationRequestGridDTO();

    // public PatientVisitId: number = 0;

    @Output("OnAddNewRequestPopupClose")
    public HideAddNewRequestPopup: EventEmitter<boolean> = new EventEmitter<boolean>();

    public ConsultationRequest = new ConsultationRequestModel();
    public DepartmentList = new Array<Department>();
    public DoctorList = new Array<Employee>();
    public FilteredConsultingDoctorList = new Array<Employee>();
    public FilteredRequestingDoctorList = new Array<Employee>();
    public SelectedRequestToDepartment = new Department();
    public SelectedRequestToDoctor = new Employee();
    public SelectedRequestingDepartment = new Department();
    public SelectedRequestingDoctor = new Employee();
    public SelectedConsultingDepartment = new Department();
    public SelectedConsultingDoctor = new Employee();
    public loading: boolean = false;
    public IsValid: boolean = false;
    public ValidationMessage = Array<string>();

    constructor(
        private nursingBLService: NursingBLService,
        private messageBoxService: MessageboxService,
        private visitService: VisitService,
        public patientService: PatientService,
        private _nursingService: NursingService
    ) { }

    ngOnInit() {
        // this.PatientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.DepartmentList = this._nursingService.GetDepartmentList();
        this.DoctorList = this._nursingService.GetDoctorList();
        this.FilteredConsultingDoctorList = this.DoctorList;
        this.FilteredRequestingDoctorList = this.DoctorList;
        this.ConsultationRequest.PatientId = this.patientService.getGlobal().PatientId;
        this.ConsultationRequest.PatientVisitId = this.visitService.getGlobal().PatientVisitId;
        this.ConsultationRequest.WardId = Number(this.patientService.getGlobal().WardId);
        this.ConsultationRequest.BedId = this.patientService.getGlobal().BedId;

        if (this.IsNewRequest) {
            this.ConsultationRequest.RequestedOn = moment().format('YYYY-MM-DD');
        }
        else if (!this.IsNewRequest) {
            this.SelectedRequestToDepartment = this.DepartmentList.find(d => d.DepartmentId === this.SelectedConsultationRequest.ConsultingDepartmentId);
            this.SelectedRequestToDoctor = this.DoctorList.find(d => d.EmployeeId === this.SelectedConsultationRequest.ConsultingDoctorId);
            this.SelectedRequestingDepartment = this.DepartmentList.find(d => d.DepartmentId === this.SelectedConsultationRequest.RequestingDepartmentId);
            this.SelectedRequestingDoctor = this.DoctorList.find(d => d.EmployeeId === this.SelectedConsultationRequest.RequestingConsultantId);
            this.SelectedConsultingDepartment = this.DepartmentList.find(d => d.DepartmentId === this.SelectedConsultationRequest.ConsultingDepartmentId);
            this.SelectedConsultingDoctor = this.DoctorList.find(d => d.EmployeeId === this.SelectedConsultationRequest.ConsultingDoctorId);
            this.ConsultationRequest.ConsultationRequestId = this.SelectedConsultationRequest.ConsultationRequestId;
            this.ConsultationRequest.PurposeOfConsultation = this.SelectedConsultationRequest.PurposeOfConsultation;
            this.ConsultationRequest.RequestedOn = this.SelectedConsultationRequest.RequestedOn;
            this.ConsultationRequest.ConsultingDepartmentId = this.SelectedConsultationRequest.ConsultingDepartmentId;
            this.ConsultationRequest.ConsultingDoctorId = this.SelectedConsultationRequest.ConsultingDoctorId;
            this.ConsultationRequest.RequestingDepartmentId = this.SelectedConsultationRequest.ConsultingDepartmentId;
            this.ConsultationRequest.RequestingConsultantId = this.SelectedConsultationRequest.ConsultingDoctorId;
            this.ConsultationRequest.ConsultedOn = moment().format('YYYY-MM-DD hh:mm');
        }
    }

    public logError(err: any): void {
        console.log(err);
    }

    public hotkeys(event): void {
        if (event.keyCode === 27) {
            this.CloseAddNewRequestPopup();
        }
    }

    public CloseAddNewRequestPopup() {
        this.ConsultationRequest = new ConsultationRequestModel();
        this.ShowAddNewRequestPopup = false;
        this.HideAddNewRequestPopup.emit(true);
    }

    public AddNewRequest(): void {
        this.loading = true;
        this.CheckValidationsForNewRequest();
        if (!this.IsValid) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, this.ValidationMessage);
            this.loading = false;
            return;
        }
        this.ConsultationRequest.Status = ENUM_ConsultationRequestStatus.Requested;
        this.ConsultationRequest.IsActive = true;
        this.nursingBLService.AddNewConsultationRequest(this.ConsultationRequest)
            .finally(() => {
                this.loading = false;
            })
            .subscribe((res) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['New Consultation Request has been created successfully']);
                    this.CloseAddNewRequestPopup();
                } else {
                    if (res.ErrorMessage) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to create New Consultation Request.']);
                    }
                }
            });
    }

    public ResponseConsultationRequest(): void {
        this.loading = true;
        this.CheckValidationsForResponseRequest();
        if (!this.IsValid) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, this.ValidationMessage);
            this.loading = false;
            return;
        }
        this.ConsultationRequest.Status = ENUM_ConsultationRequestStatus.Consulted;
        this.nursingBLService.ResponseConsultationRequest(this.ConsultationRequest)
            .finally(() => {
                this.loading = false;
            })
            .subscribe((res) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Consultation Response has been created successfully']);
                    this.CloseAddNewRequestPopup();
                } else {
                    if (res.ErrorMessage) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to response to Consultation Request.']);
                    }
                }
            });
    }

    public DiscardChanges(): void {
        switch (this.IsNewRequest) {
            case true:
                this.SelectedRequestToDepartment = new Department();
                this.SelectedRequestToDoctor = new Employee();
                this.SelectedRequestingDepartment = new Department();
                this.SelectedRequestingDoctor = new Employee();
                this.ConsultationRequest.PurposeOfConsultation = null;
                break;

            case false:
                this.ConsultationRequest.ConsultantResponse = null;
                break;

            default:
                break;
        }
    }

    public DepartmentListFormatter(data: any): string {
        let html = data["DepartmentName"];
        return html;
    }

    public DoctorListFormatter(data: any): string {
        let html = data["FullName"];
        return html;
    }

    public OnConsultingDoctorChange(data: Employee): void {
        if (data !== null && data.EmployeeId) {
            this.ConsultationRequest.ConsultingDoctorId = data.EmployeeId;
            if (this.IsNewRequest) {
                this.SelectedRequestToDepartment = this.DepartmentList.find(d => d.DepartmentId === data.DepartmentId);
                if (this.SelectedRequestToDepartment && this.SelectedRequestToDepartment.DepartmentId) {
                    this.ConsultationRequest.ConsultingDepartmentId = this.SelectedRequestToDepartment.DepartmentId;
                }
            }
            else {
                this.SelectedConsultingDepartment = this.DepartmentList.find(d => d.DepartmentId === data.DepartmentId);
                if (this.SelectedConsultingDepartment && this.SelectedConsultingDepartment.DepartmentId) {
                    this.ConsultationRequest.ConsultingDepartmentId = this.SelectedRequestToDepartment.DepartmentId;
                }
            }
        }
    }

    public OnConsultingDepartmentChange(data: Department): void {
        if (data !== null) {
            this.ConsultationRequest.ConsultingDepartmentId = data.DepartmentId;
        }
    }

    public OnRequestingDoctorChange(data: Employee): void {
        if (data !== null && data.EmployeeId) {
            this.ConsultationRequest.RequestingConsultantId = data.EmployeeId;
            this.SelectedRequestingDepartment = this.DepartmentList.find(d => d.DepartmentId === data.DepartmentId);
            if (this.SelectedRequestingDepartment && this.SelectedRequestingDepartment.DepartmentId) {
                this.ConsultationRequest.RequestingDepartmentId = this.SelectedRequestingDepartment.DepartmentId;
            }
        }
    }

    public OnRequestingDepartmentChange(data: Department): void {
        if (data !== null) {
            this.ConsultationRequest.RequestingDepartmentId = data.DepartmentId;
        }
    }

    public FilterConsultingDoctorList(): void {
        if ((typeof (this.SelectedConsultingDepartment) === 'object' || typeof (this.SelectedRequestToDepartment) === 'object')
            && this.SelectedConsultingDepartment.DepartmentId || this.SelectedRequestToDepartment.DepartmentId) {
            let filteredDocList;
            if (this.SelectedConsultingDepartment.DepartmentId) {
                filteredDocList = this.DoctorList.filter(data => data.DepartmentId === this.SelectedConsultingDepartment.DepartmentId);
            }
            else {
                filteredDocList = this.DoctorList.filter(data => data.DepartmentId === this.SelectedRequestToDepartment.DepartmentId);
            }
            if (filteredDocList) {
                this.FilteredConsultingDoctorList = filteredDocList;
            }
            else {
                this.FilteredConsultingDoctorList = this.DoctorList;
            }
        }
        else {
            this.FilteredConsultingDoctorList = this.DoctorList;
            this.ConsultationRequest.ConsultingDepartmentId = 0;
        }
        if (this.IsNewRequest) {
            this.SelectedRequestToDoctor = null;
        }
        else {
            this.SelectedRequestingDoctor = null;
        }
        this.ConsultationRequest.ConsultingDoctorId = 0;
    }

    public FilterRequestingDoctorList(): void {
        if ((typeof (this.SelectedRequestingDepartment) === 'object') && this.SelectedRequestingDepartment.DepartmentId) {
            let filteredDocList = this.DoctorList.filter(data => data.DepartmentId === this.SelectedRequestingDepartment.DepartmentId);
            if (filteredDocList) {
                this.FilteredRequestingDoctorList = filteredDocList;
            }
            else {
                this.FilteredRequestingDoctorList = this.DoctorList;
            }
        }
        else {
            this.FilteredRequestingDoctorList = this.DoctorList;
            this.ConsultationRequest.RequestingDepartmentId = 0;
        }
        this.SelectedRequestingDoctor = null;
        this.ConsultationRequest.RequestingConsultantId = 0;
    }

    public CheckValidationsForNewRequest(): boolean {
        this.IsValid = true;
        this.ValidationMessage = new Array<string>();
        if (this.ConsultationRequest.ConsultingDoctorId
            && this.ConsultationRequest.RequestingConsultantId
            && this.ConsultationRequest.ConsultingDoctorId === this.ConsultationRequest.RequestingConsultantId) {
            this.IsValid = false;
            this.ValidationMessage.push("Consulting Doctor and Requesting Doctor can't be same.");
        }
        if (!this.ConsultationRequest.ConsultingDepartmentId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Consulting Department.");
        }
        if (!this.ConsultationRequest.ConsultingDoctorId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Consulting Doctor.");
        }
        if (!this.ConsultationRequest.PurposeOfConsultation || !this.ConsultationRequest.PurposeOfConsultation.trim()) {
            this.IsValid = false;
            this.ValidationMessage.push("Include Purpose of Consult.");
        }
        if (!this.ConsultationRequest.RequestingDepartmentId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Requesting Department.");
        }
        if (!this.ConsultationRequest.RequestingConsultantId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Requesting Doctor.");
        }
        return this.IsValid;
    }

    public CheckValidationsForResponseRequest(): boolean {
        this.IsValid = true;
        this.ValidationMessage = new Array<string>();
        if (!this.ConsultationRequest.ConsultingDepartmentId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Consulting Department.");
        }
        if (!this.ConsultationRequest.ConsultingDoctorId) {
            this.IsValid = false;
            this.ValidationMessage.push("Select Consulting Doctor.");
        }
        if (!this.ConsultationRequest.ConsultantResponse || !this.ConsultationRequest.ConsultantResponse.trim()) {
            this.IsValid = false;
            this.ValidationMessage.push("Include Consultant Response.");
        }
        return this.IsValid;
    }

    public CheckConsultingDoctor(): void {
        if (typeof (this.SelectedRequestToDoctor) === 'string') {
            // this.SelectedRequestToDoctor = null;
            this.ConsultationRequest.ConsultingDoctorId = 0;
        }
        let filteredDocList = this.DoctorList.filter(data => data.DepartmentId === this.SelectedRequestToDepartment.DepartmentId);
        if (filteredDocList) {
            this.FilteredConsultingDoctorList = filteredDocList;
        }
        else {
            this.FilteredConsultingDoctorList = this.DoctorList;
        }
    }
    public CheckRequestingDoctor(): void {
        if (typeof (this.SelectedRequestingDoctor) === 'string') {
            // this.SelectedRequestingDoctor = null;
            this.ConsultationRequest.RequestingConsultantId = 0;
        }
        let filteredDocList = this.DoctorList.filter(data => data.DepartmentId === this.SelectedRequestingDepartment.DepartmentId);
        if (filteredDocList) {
            this.FilteredRequestingDoctorList = filteredDocList;
        }
        else {
            this.FilteredRequestingDoctorList = this.DoctorList;
        }
    }
}
