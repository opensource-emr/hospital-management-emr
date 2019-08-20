import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { CoreCFGLookUp } from '../lab-settings/shared/coreCFGLookUp.model';

export class LabComponentModel {
    public ComponentId: number = 0;
    public ComponentName: string = null;
    public Unit: string = null;
    public ValueType: string = null;
    public ControlType: string = null;
    public Range: string = null;
    public RangeDescription: string = null;
    public Method: string = null;
    public ValueLookup: string = null;
    public DisplayName: string = null;

    public MinValue: number = null;
    public MaxValue: number = null;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public DisplaySequence: number = 100;
    public IndentationCount: number = 0;

    public IsActive: boolean = true;

    public MaleRange: string = null;
    public FemaleRange: string = null;
    public ChildRange: string = null;
    public GroupName: string = null;

    public MaleMinValue: number = null;
    public MaleMaxValue: number = null;
    public FemaleMinValue: number = null;
    public FemaleMaxValue: number = null;
    public ChildMinValue: number = null;
    public ChildMaxValue: number = null;

    public LookUp: CoreCFGLookUp = null;

    public LabComponentJsonValidator: FormGroup = null;

    public SetRangeValue(ipComponent: LabComponentModel, fieldName: string){
        var minField: string;
        var maxField: string;

        if(fieldName.toLowerCase()=='range'){
            minField = 'MinValue';
            maxField = 'MaxValue';
        } else if(fieldName.toLowerCase()=='malerange'){
            minField = 'MaleMinValue';
            maxField = 'MaleMaxValue';
        }   else if(fieldName.toLowerCase()=='femalerange'){
            minField = 'FemaleMinValue';
            maxField = 'FemaleMaxValue';
        } else if(fieldName.toLowerCase()=='childrange'){
            minField = 'ChildMinValue';
            maxField = 'ChildMaxValue';
        }
        
        if ((ipComponent[minField] != null) && (ipComponent[maxField] != null)) {
            ipComponent[fieldName] = ipComponent[minField] + "-" + ipComponent[maxField];
        } else if ((this.MinValue != null && ipComponent[minField]) && (ipComponent[maxField] == null)) {
            ipComponent[fieldName] = ">" + ipComponent[minField];
        }
        else if ((ipComponent[maxField] != null && ipComponent[maxField]) && (ipComponent[minField] == null)) {
            ipComponent[fieldName] = "<" + ipComponent[maxField];
        }
    }

    public GetRangeValue(ipComponent: LabComponentModel, fieldName: string) {
        let val: any;
        var minField: string;
        var maxField: string;

        if(fieldName.toLowerCase()=='range'){
            minField = 'MinValue';
            maxField = 'MaxValue';
        } else if(fieldName.toLowerCase()=='malerange'){
            minField = 'MaleMinValue';
            maxField = 'MaleMaxValue';
        }   else if(fieldName.toLowerCase()=='femalerange'){
            minField = 'FemaleMinValue';
            maxField = 'FemaleMaxValue';
        } else if(fieldName.toLowerCase()=='childrange'){
            minField = 'ChildMinValue';
            maxField = 'ChildMaxValue';
        }

        if (ipComponent[fieldName] != null) {
            if ((ipComponent[fieldName].indexOf('-') != -1) && (ipComponent[fieldName].indexOf('-') > 0)) {
                val = ipComponent[fieldName].split("-");
                if((val[0] && val[0].trim() != "")){
                    ipComponent[minField] = Number(val[0]);
                }
                if(val[1] || val[1].trim() != ""){
                    ipComponent[maxField] = Number(val[1]);
                }               
                
            } else if ((ipComponent[fieldName].indexOf('>') != -1) && (ipComponent[fieldName].indexOf('>') >= 0)) {
                val = ipComponent[fieldName].split(">");
                if(val[1] || val[1].trim() != ""){
                    ipComponent[minField] = Number(val[1]);
                }
                ipComponent[maxField] = null; 
            } else if ((ipComponent[fieldName].indexOf('<') != -1) && (ipComponent[fieldName].indexOf('<') >= 0)) {
                val = ipComponent[fieldName].split("<");                
                if(val[1] || val[1].trim() != ""){
                    ipComponent[maxField] = Number(val[1]);
                } 
                ipComponent[minField] = null;                
            }
        }
    }

    constructor() {
        var _formBuilder = new FormBuilder();
        this.LabComponentJsonValidator = _formBuilder.group({
            'Component': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.LabComponentJsonValidator.dirty;
        }
        else {
            return this.LabComponentJsonValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.LabComponentJsonValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        if (fieldname == undefined) {
            return this.LabComponentJsonValidator.valid;
        }
        else {
            return !(this.LabComponentJsonValidator.hasError(validator, fieldname));
        }
    }


}