import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';


export class PHRMDrugsOrderListModel {
    public RequisitionItemId: number = null;
    public RequisitionId: number = null; 
    public ItemId: number = null;
    public Quantity: number = null;
    public ItemName: string = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public Status: string = null;
    public RequestedOn: string = null;
}