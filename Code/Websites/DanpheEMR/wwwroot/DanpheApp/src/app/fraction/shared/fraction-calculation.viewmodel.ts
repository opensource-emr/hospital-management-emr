import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export class FractionCalculationViewModel {

    public BilltxnId: number;
    public ItemName: string; 
    public DoctorPercent: number; 
    public InitialPercent: number; 
    public FinalPercent: number;
    public CreatedOn: number; 
    public DoctorName: string;
    public Designation: string; 
    public TotalAmount: number; 
    public IsParentId: number;

}