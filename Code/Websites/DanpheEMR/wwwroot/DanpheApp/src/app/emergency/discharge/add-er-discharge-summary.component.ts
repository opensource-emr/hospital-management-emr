import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { PatientService } from '../../patients/shared/patient.service';
import * as moment from 'moment/moment';
import { VisitService } from '../../appointments/shared/visit.service';
import { EmergencyDischargeSummaryVM } from '../shared/emergency-discharge-summaryVM';
import { EmergencyDischargeSummary } from '../shared/emergency-discharge-summary.model';

@Component({
    selector: 'add-er-discharge-summary',
    templateUrl: './add-er-discharge-summary.html'
})

// App Component class
export class AddERDischargeSummaryComponent {
    public loading: boolean = false;

    @Input() public patientSummary: EmergencyDischargeSummaryVM = null;
    @Output() public callBackToMain: EventEmitter<object> = new EventEmitter<object>(); 
    
    public update: boolean = false;

    public ERpatientSummary: EmergencyDischargeSummaryVM = null;
    public DischargeSummary: EmergencyDischargeSummary = null; 

    public LabInvestigation = { InvestigationType: 'lab', InvestigationName: [] };
    public RadInvestigation = { InvestigationType: 'imaging', InvestigationName: [] };
    public OtherInvestigation = { InvestigationType: 'others', InvestigationName: [] };

    public LabOrdersList = [];
    public RadOrderList = [];
    public OthersList = [];

    public allInvestigations = [];

    public allAdvice = [];

    public doctorsList: Array<any> = [];
    public doctorSelected: any;

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public patientService: PatientService, public visitService: VisitService,
        public coreService: CoreService) {
        this.GetDoctorsList();
    }

    ngOnInit() {
        this.ERpatientSummary = new EmergencyDischargeSummaryVM();
        this.DischargeSummary = new EmergencyDischargeSummary();
        this.ERpatientSummary = Object.assign(this.ERpatientSummary, this.patientSummary);
        
        if (this.ERpatientSummary.DischargeSummary && this.ERpatientSummary.DischargeSummary.ERDischargeSummaryId) {
            this.DischargeSummary = Object.assign(this.DischargeSummary, this.ERpatientSummary.DischargeSummary);
            this.AssignExistingInvestigations();

            if (this.DischargeSummary.AdviceOnDischarge && this.DischargeSummary.AdviceOnDischarge.trim() != '') {
                this.allAdvice = JSON.parse(this.DischargeSummary.AdviceOnDischarge);
                if (!this.allAdvice.length) {
                    var newAdvice = { value: "" };
                    this.allAdvice.push(newAdvice);
                }
            } else {
                var newAdvice = { value: "" };
                this.allAdvice.push(newAdvice);
            }

            this.DischargeSummary.DoctorSelected = this.DischargeSummary.DoctorName;
            this.DischargeSummary.MedicalOfficerSelected = this.DischargeSummary.MedicalOfficer;

            this.update = true;
        }
        else
        {            
            this.DischargeSummary.PatientId = this.ERpatientSummary.EmergencyPatient.PatientId;
            this.DischargeSummary.PatientVisitId = this.ERpatientSummary.EmergencyPatient.PatientVisitId;
            this.DischargeSummary.DischargeType = this.ERpatientSummary.EmergencyPatient.FinalizedStatus;

            var newAdvice = {value: ""};
            this.allAdvice.push(newAdvice);

            var otherInvestigation = { IsSelected: true, InvestigationName: '', InvestigationType: "others" };
            this.OthersList.push(otherInvestigation);

            this.AssignAllInvestigations();
            this.update = false;
        }
    }

    public GetDoctorsList() {
        this.emergencyBLService.GetDoctorsList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.doctorsList = res.Results;
                    }
                    else {
                        console.log(res.ErrorMessage);
                    }
                }
            },
                err => {
                    this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
                    console.log(err.ErrorMessage);
                });
    }

    public AssignExistingInvestigations() {       
        if (this.ERpatientSummary.DischargeSummary.Investigations) {
            var existingInvestigations = JSON.parse(this.ERpatientSummary.DischargeSummary.Investigations);
            var labInvestigations = existingInvestigations.find(val => val.InvestigationType == 'lab');
            var radInvestigations = existingInvestigations.find(val => val.InvestigationType == 'imaging');
            var otherInvestigations = existingInvestigations.find(val => val.InvestigationType == 'others');
            if (labInvestigations) {
                if (labInvestigations) {
                    this.ERpatientSummary.LabOrders.forEach(frmAllOdr => {
                        let inv = { IsSelected: false, InvestigationName: frmAllOdr, InvestigationType: "lab" };
                        labInvestigations.InvestigationName.forEach(selectedOdr => {
                            if (frmAllOdr.toLowerCase() == selectedOdr.toLowerCase()) {
                                inv.IsSelected = true;
                            }
                        });

                        this.LabOrdersList.push(inv);
                    });
                }
            }
            if (radInvestigations) {
                this.ERpatientSummary.ImagingOrders.forEach(frmAllOdr => {
                    let inv = { IsSelected: false, InvestigationName: frmAllOdr, InvestigationType: "imaging" };
                    radInvestigations.InvestigationName.forEach(selectedOdr => {
                        if (frmAllOdr.toLowerCase() == selectedOdr.toLowerCase()) {
                            inv.IsSelected = true;
                        }
                    });

                    this.RadOrderList.push(inv);
                });
            }

            if (otherInvestigations) {
                otherInvestigations.InvestigationName.forEach(val => {
                    let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "others" };
                    this.OthersList.push(inv);
                });
            }
            else {
                var otherInvestigation = { IsSelected: true, InvestigationName: '', InvestigationType: "others" };
                this.OthersList.push(otherInvestigation);
            }

        }
    }

    public AssignAllInvestigations() {
        this.ERpatientSummary.LabOrders.forEach(val => {
            let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "lab" };
            this.LabOrdersList.push(inv);
        });
        this.ERpatientSummary.ImagingOrders.forEach(val => {
            let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "imaging" };
            this.RadOrderList.push(inv);
        });
    }

    public AddDischargeSummary() {
        this.ArrangeDataFormatting();
        if (this.loading) {
            this.emergencyBLService.PostERDischargeSummary(this.DischargeSummary)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage('success', ["Discharge Summary of " + this.ERpatientSummary.EmergencyPatient.FullName + "successfully added"]);
                        this.callBackToMain.emit({ submit: true, action: 'add', dischargeSummary: res.Results });
                        this.loading = false;
                    }
                    else
                    {
                        this.loading = false;
                    }
                });
        }
        
    }

    public UpdateDischargeSummary() {
        this.ArrangeDataFormatting();
        if (this.loading) {          
            this.emergencyBLService.UpdateERDischargeSummary(this.DischargeSummary)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage('success', ["Discharge Summary of " + this.ERpatientSummary.EmergencyPatient.FullName + "successfully Updated"]);
                        this.callBackToMain.emit({ submit: true, action: 'update', dischargeSummary: res.Results });
                        this.loading = false;
                    }
                    else {
                        this.loading = false;
                    }
                });
        }
    }

    ArrangeDataFormatting() {
        this.LabOrdersList.forEach(val => {
            if (val.IsSelected) {
                this.LabInvestigation.InvestigationName.push(val.InvestigationName);
            }
        });

        this.allInvestigations.push(this.LabInvestigation);

        this.RadOrderList.forEach(val => {
            if (val.IsSelected) {
                this.RadInvestigation.InvestigationName.push(val.InvestigationName);
            }
        });

        this.allInvestigations.push(this.RadInvestigation);

        var allOtherOrders = this.OthersList.filter(other => other.InvestigationName != null && other.InvestigationName.trim() != '');
        allOtherOrders.forEach(val => {
            this.OtherInvestigation.InvestigationName.push(val.InvestigationName);
        });
        this.allInvestigations.push(this.OtherInvestigation);
        

        this.DischargeSummary.Investigations = JSON.stringify(this.allInvestigations);

        var advices = this.allAdvice.filter(advice => advice.value != null && advice.value.trim() != '');

        this.DischargeSummary.AdviceOnDischarge = JSON.stringify(advices);


        if (this.DischargeSummary.DoctorSelected && this.DischargeSummary.DoctorSelected.EmployeeId) {
            this.DischargeSummary.DoctorName = this.DischargeSummary.DoctorSelected.LongSignature;
        } else {
            this.DischargeSummary.DoctorName = this.DischargeSummary.DoctorSelected;
        }

        if (this.DischargeSummary.MedicalOfficerSelected && this.DischargeSummary.MedicalOfficerSelected.EmployeeId) {
            this.DischargeSummary.MedicalOfficer = this.DischargeSummary.MedicalOfficerSelected.LongSignature;
        } else {
            this.DischargeSummary.MedicalOfficer = this.DischargeSummary.MedicalOfficerSelected;
        }
        
    }
    
    //Action 0 means delete, 1 means add
    public  AlterAdviceRow(index: number, action: number) {
        var newData = { value: "" };
        if (action) {
            var len = this.allAdvice.length;
            //Case of Adding by clicking the add in last row
            if (len == index + 1) {
                this.allAdvice.push(newData);
            }
            else
            {
                this.allAdvice.splice(index+1, 0, newData);
                this.allAdvice.slice();
            }            
        }
        else {
            if (this.allAdvice.length > 1) {
                this.allAdvice.splice(index, 1);
                this.allAdvice.slice();
            }
        }
    }


    //Action 0 means delete, 1 means add
    public AlterOthersListRow(index: number, action: number) {
        var newData = { IsSelected: true, InvestigationName: '', InvestigationType: "others" };
        if (action) {
            var len = this.OthersList.length;
            //Case of Adding by clicking the add in last row
            if (len == index + 1) {
                this.OthersList.push(newData);
            }
            else {
                this.OthersList.splice(index + 1, 0, newData);
                this.OthersList.slice();
            }
        }
        else {
            if (this.OthersList.length > 1) {
                this.OthersList.splice(index, 1);
                this.OthersList.slice();
            }
        }
    }

    public BackToView() {
        this.callBackToMain.emit({ submit: true, action: 'back', dischargeSummary: this.ERpatientSummary.DischargeSummary });
    }

    DoctorListFormatter(data: any): string {
        return data["FullName"];
    }

}
