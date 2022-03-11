import { LabReportTemplateModel } from './lab-report-template.model';
//import { LabTestGroup } from './lab-testgroup.model';
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
import { LabComponentModel } from './lab-component-json.model';
import { LabTestComponentMap } from '../lab-settings/shared/lab-test-component-map.model';
export class LabTest {
    public LabTestId: number = 0;
    public LabSequence: number = 0;
    public LabTestCode: string = null;
    public ProcedureCode: string = null;
    public Description: string = null;
    public LabTestSynonym: string = null;
    public LabTestName: string = null;
    public LabTestSpecimen: string = null;
    public LabTestSpecimenSource: string = null;
    public LabTestComponentsJSON: Array<LabComponentModel> = [];
    public LabTestComponentMap: Array<LabTestComponentMap> = [];
    public LOINC: string = null;
    public ReportTemplateId: number = null;
    public IsSelected: boolean = false;
    public IsPreference: boolean = false;
    public IsValidForReporting: boolean = true;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;
    public HasNegativeResults: boolean = false;
    public NegativeResultText: string = null;

    public ServiceDepartmentId: number = null;

    public LabReportTemplateModel: LabReportTemplateModel = null;

    public DisplaySequence: number = 1000;
    public RunNumberType: string = 'normal';

    public LabTestValidator: FormGroup = null;

    //ashim: 06Sep2018
    public ReportingName: string = null;
    public Interpretation: string = null;
    public IsTaxApplicable: boolean = false;

    public ReportTemplateName: string = null;

    public TemplateType: string = null;
    public LabTestCategoryId: number = null;
    public GroupName: string;

    public SmsApplicable: boolean = false;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.LabTestValidator = _formBuilder.group({
            'LabTestName': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.LabTestValidator.dirty;
        }
        else {
            return this.LabTestValidator.controls[fieldname].dirty;
        }

    }

    public IsValid(): boolean { if (this.LabTestValidator.valid) { return true; } else { return false; } }


    public IsValidCheck(fieldname, validator): boolean {

        if (fieldname == undefined) {
            return this.LabTestValidator.valid;
        }
        else {
            return !(this.LabTestValidator.hasError(validator, fieldname));
        }
    }


}
