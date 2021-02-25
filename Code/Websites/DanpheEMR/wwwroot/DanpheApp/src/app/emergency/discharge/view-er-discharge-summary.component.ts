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
    selector: 'view-er-discharge-summary',
    templateUrl: './view-er-discharge-summary.html'
})

// App Component class
export class ViewERDischargeSummaryComponent {

    @Input() public patientSummary: EmergencyDischargeSummaryVM = null; 
    @Output() public callBackToMain: EventEmitter<object> = new EventEmitter<object>(); 


    public ERpatientSummary: EmergencyDischargeSummaryVM = null;
    public DischargeSummary: EmergencyDischargeSummary = null;

    public LabOrdersList = [];
    public RadOrderList = [];
    public OthersList = [];
    

    public allAdvice = [];

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public patientService: PatientService, public visitService: VisitService,
        public coreService: CoreService) {
       
    }

    ngOnInit() {
        this.DischargeSummary = new EmergencyDischargeSummary();
        this.ERpatientSummary = new EmergencyDischargeSummaryVM();
        this.ERpatientSummary = Object.assign(this.ERpatientSummary, this.patientSummary);
        this.DischargeSummary = Object.assign(this.DischargeSummary, this.ERpatientSummary.DischargeSummary);
        this.AssignExistingInvestigations();

        if (this.DischargeSummary.AdviceOnDischarge && this.DischargeSummary.AdviceOnDischarge.trim() != '') {
            this.allAdvice = JSON.parse(this.DischargeSummary.AdviceOnDischarge);
        }
        
    }

    public AssignExistingInvestigations() {
        if (this.ERpatientSummary.DischargeSummary.Investigations) {
            var existingInvestigations = JSON.parse(this.ERpatientSummary.DischargeSummary.Investigations);
            var labInvestigations = existingInvestigations.find(val => val.InvestigationType == 'lab');
            var radInvestigations = existingInvestigations.find(val => val.InvestigationType == 'imaging');
            var otherInvestigations = existingInvestigations.find(val => val.InvestigationType == 'others');
            if (labInvestigations) {
                labInvestigations.InvestigationName.forEach(val => {
                    let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "lab" };
                    this.LabOrdersList.push(inv);
                });
            }
            if (radInvestigations) {
                radInvestigations.InvestigationName.forEach(val => {
                    let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "imaging" };
                    this.RadOrderList.push(inv);
                });
            }
            if (otherInvestigations) {
                otherInvestigations.InvestigationName.forEach(val => {
                    let inv = { IsSelected: true, InvestigationName: val, InvestigationType: "others" };
                    this.OthersList.push(inv);
                });
            }
        }
    }

    EditDischargeSummary() {
        this.callBackToMain.emit({callBack: true})
    }

    PrintDischargeSummary() {
        let popupWinindow;
        var printContents = document.getElementById("dischargeSummaryToPrint").outerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = '<html><head>';
        documentContent += '<link href="../../assets/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<style> th, td {border: 1px solid black;padding: 0px 7px;}.no-border th, .no-border td {border: none !important;}.equal-width td {width: 50%;vertical-align: top;}p.discharg-hd {font-weight: 700;text-decoration: underline;margin-bottom: 5px;margin-top: 5px;}textarea {width: 100%;}</style>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>';

        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
}
