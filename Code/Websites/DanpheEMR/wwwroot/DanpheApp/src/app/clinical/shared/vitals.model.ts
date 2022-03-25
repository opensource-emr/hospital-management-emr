
//importing form and its related components, these are used for forms validation.
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class Vitals {
    public PatientVitalId: number = 0;
    public PatientVisitId: number = 0;
    public DateTime: string = null;
    public Height: number = null;
    public HeightUnit: string = "cm";
    public Weight: number = null;
    public WeightUnit: string = "kg";
    
    //needs revision
    public BMI: number = null;
    public Temperature: number = null;
    public TemperatureUnit: string = "F";
    public Pulse: number = null;
    public BPSystolic: number = null;
    public BPDiastolic: number = null;
    public RespiratoryRatePerMin: string = null;
    public SpO2: number = null;
    public OxygenDeliveryMethod: string = null;
    public PainScale: number = null;
    public BodyPart: string = null;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public VitalsTakenOn: string = null;

    public VitalsValidator: FormGroup = null;

    public  Nadi : string=null;
    public  Mala :string=null;
    public  Mutra :string=null
    public  Jivha :string=null
    public  Shabda :string=null
    public  Sparsha :string=null
    public  Drik :string=null
    public  Akriti :string=null
    public  LungField :string=null
    public  HeartSounds :string=null
    public  PA_Tenderness :string=null
    public  Organomegaly :string=null
    public  CNS_Consiousness :string=null
    public  Power :string=null
    public  Reflexes :string=null
    public  Tone :string=null
    public  Others:string=null

    constructor() {

        var _formBuilder = new FormBuilder();

        this.VitalsValidator = _formBuilder.group({
            'systolic': new FormControl(''),
            'diastolic': new FormControl(''),
        });

    }


    public IsDirty(): boolean {
        return this.VitalsValidator.dirty;
    }


    public IsValid():boolean{if(this.VitalsValidator.valid){return true;}else{return false;}} 
    public IsValidCheck(): boolean {
        let bpSys = this.VitalsValidator.controls["systolic"].value;
        let bpDias = this.VitalsValidator.controls["diastolic"].value;

        if (bpSys && bpDias) {
            if (bpSys < bpDias) {
                return false;
            }
            else if(bpSys == bpDias){
                return false;
            }
        }
        return true;
    }

    //returns true if both bp diastolic and systolic are filled.
    // false if one is filled and another is filled.
    public IsBPComplete(): boolean {

        let bpSys = this.VitalsValidator.controls["systolic"].value;
        let bpDias = this.VitalsValidator.controls["diastolic"].value;
        //if both empty then return true. 
        if (!bpSys && !bpDias) {
            return true;
        }
        else if (bpSys && !bpDias) {
            return false;
        }

        else if (bpDias && !bpSys) {
            return false;
        }
        return true;
    }
}
