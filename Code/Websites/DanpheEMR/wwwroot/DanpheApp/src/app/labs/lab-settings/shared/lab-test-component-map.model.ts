import * as moment from 'moment/moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';
import { LabComponentModel } from '../../shared/lab-component-json.model';

export class LabTestComponentMap {

    public ComponentMapId: number = 0;
    public LabTestId: number = 0;
    public DisplaySequence: number = 100;
    public ComponentId: number = 0;
    public IndentationCount: number = 0;
    public ShowInSheet: boolean = true;
    public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public CreatedBy: number = 0;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public IsActive: boolean = true;
    public IsAutoCalculate: boolean = false;

    public CalculationFormula: string = "";

    public FormulaDescription: string = "";

    public LabTestComponent: LabComponentModel = null;
}


