import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { MappingDetailModel } from "./mapping-detail.model";

export class GroupMappingModel {
    public GroupMappingId: number = 0;
    public Description: string = null;
    public Section: number = 0;   
    public MappingDetail: Array<MappingDetailModel> = new Array<MappingDetailModel>();
    public Details: string = null;
    public VoucherId: number = 0;
    public Remarks: string = null;
}