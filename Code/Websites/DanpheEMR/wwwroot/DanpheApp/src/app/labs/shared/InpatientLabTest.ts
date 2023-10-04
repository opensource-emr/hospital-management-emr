
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
export class InPatientLabTest {
    public BillingTransactionItemId: number = null;
    public RequisitionId: number = null;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public LabTestName: string = null;
    public LabTestId: number = null;
    public ReportTemplateId: number = null;
    public LabTestSpecimen: string = null;
    public ProviderId: number = null;
    public ProviderName: string = null;
    public RunNumberType: string = null;
    public BillingStatus: string = null;
    public OrderStatus: string = null;
    public OrderDateTime: string = null;
    public IsReportGenerated: boolean = false;

    public CounterId: number = null;
    public ServiceDepartmentId: number = null;
    public ServiceDepartName: string = null;
    public CancelledBy: number = null;
    public CancelledOn: string = null;
    public CancelRemarks: string = null;
}
