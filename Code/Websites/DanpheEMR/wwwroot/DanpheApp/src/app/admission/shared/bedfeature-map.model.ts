import { Bed } from './bed.model';
import { Ward } from './ward.model';
import { BedFeature } from './bedfeature.model';
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
export class BedFeaturesMap {
    public BedFeatureCFGId : number = 0;
    public BedId : number = null;
    public WardId : number = null;
    public BedFeatureId: number = null;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;
    
    public CreatedOn: string = null;
    public ModifiedOn: string = null;

    public Ward: Ward = null;
    public Bed: Bed = null;
    public BedFeature: BedFeature = null;

    public Len: number = 1;
}
