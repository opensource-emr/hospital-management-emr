import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export class FractionPercentModel {

    public PercentSettingId: number = 0;
    public BillItemPriceId: number = 0;
    public HospitalPercent: number = 0;
    public DoctorPercent: number = 0;
    public Description: string = null;
    public CreatedOn: string = null;
    public CreatedBy: number = 0;

    public FractionPercentValidator: FormGroup = null;

}