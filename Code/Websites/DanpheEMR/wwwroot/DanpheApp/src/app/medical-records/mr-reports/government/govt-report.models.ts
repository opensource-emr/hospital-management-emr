
export class RPT_GOVT_GovtReportSummaryModel {
    public fromDate: Date = null;
    public toDate: Date = null;
    public hospitalName: string = null;

  public OutpatientServices: Array<RPT_GOVT_OutpatientService> = new Array<RPT_GOVT_OutpatientService>();
  public DiagnosticServices: Array<RPT_GOVT_DiagnosticService> = new Array<RPT_GOVT_DiagnosticService>();
}


export class RPT_GOVT_OutpatientService
{
    public AgeRange: string = null;
    public FemalePatients: number=0;
    public MalePatients: number=0;
    public TotalFemalePatien: number=0;
    public TotalMalePatients: number=0;

}

export class RPT_GOVT_DiagnosticService {
    public DiagnosticServices: string = null;
    public Unit: string = null;
    public Number: number=0;
 
}


