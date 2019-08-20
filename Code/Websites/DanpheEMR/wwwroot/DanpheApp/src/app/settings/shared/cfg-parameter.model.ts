
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

export class CFGParameterModel {
    public ParameterId: number = 0;
    public ParameterGroupName: string = null;
    public ParameterName: string = null;
    public ParameterValue: string = null;
    public ValueDataType: string = null;
    public Description: string = null;
    public ParameterType: string = null;

    public MappedObject: Array<MappedObj> = [];
}

export class MappedObj {
    public KeyName: string = null;
    public Value: string = null;

    public ValueType: string = null;
    public ActualValueType: string = null;
}





