import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class FiscalYearModel {
    public FiscalYearId: number = 0;
    public FiscalYearName: string = null;
    public NpFiscalYearName: string =null;
    public StartDate: string = null;
    public EndDate: string = null;
    //public StartYear: string = null;
    //public EndYear: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;

    public FiscalYearValidator: FormGroup = null;
    public ClosedBy: number = 0;
    public ClosedOn: string = null;
    public IsClosed: boolean = true;
    public ClosedByName: string = null;
    public ReadyToClose: boolean = false;
    public nStartDate: string = null;
    public nEndDate: string = null;    
    public Remark:string = "";
    public showreopen: boolean = true;

    
    public EnglishFiscalYearName: string = null;
    public NepaliFiscalYearName: string =null;
    public EnglishMonthList:Array<MonthModel>= new Array<MonthModel>();
    public NepaliMonthList:Array<MonthModel>= new Array<MonthModel>();
    constructor() {

        var _formBuilder = new FormBuilder();
        this.FiscalYearValidator = _formBuilder.group({
            'FiscalYearName': ['', Validators.compose([Validators.required])],
            'NpFiscalYearName': ['', Validators.compose([Validators.required])],
            'StartDate': ['', Validators.compose([Validators.required])],
            'EndDate': ['', Validators.compose([Validators.required])],
            'Description':['',Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FiscalYearValidator.dirty;
        else
            return this.FiscalYearValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.FiscalYearValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.FiscalYearValidator.valid;

        }
        else
            return !(this.FiscalYearValidator.hasError(validator, fieldName));
    }
}

export class MonthModel{
    public MonthName:string=null;
    public MonthNumber:number=0;
    public FirstDay:string=null;
    public LastDay:string=null;
    public IsDisabled:boolean=false;
}
