import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { LabPendingResultVM } from './lab-view.models';
import { LabTestRequisition } from './lab-requisition.model';

export class LabMasterModel {
    public PatientName: string = null;
    public PatientId: number = null;
    public PatientCode: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public BarCodeNumber: number = null;
    public AgeSex: string = null;
    public SampleCollectedOn: string = null;

    public AddResult: Array<LabPendingResultVM>  = new Array<LabPendingResultVM>();
    public PendingReport: Array<LabPendingResultVM>  = new Array<LabPendingResultVM>();
    public FinalReport: Array<any> = new Array<any>();
    public LabRequisitions: Array<Requisition> = new Array<Requisition>();
}


export class Requisition {
    public RequisitionId: number = null;
    public PatientId: number = null;
    public PatientName: string = null;
    public PatientCode: string = null;
    public DateOfBirth: string = null;
    public Gender: string = null;
    public PhoneNumber: string = null;
    public DateTime: string = null;
    public VisitType: string = null;
    public RunNumberType: string = null;
    public WardName: string = null;
    public AgeSexFormatted: string = null;
}
   
export class LoginToTelemed{
    public PhoneNumber: string;
    public Password: string;
}
        