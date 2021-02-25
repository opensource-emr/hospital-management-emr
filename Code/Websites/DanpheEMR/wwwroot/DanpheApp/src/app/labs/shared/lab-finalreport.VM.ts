
export class LabTestFinalReportModel {
  public PatientName: string = null;
  public PatientCode: string = null;
  public DateOfBirth: string = null;
  public Gender: string = null;
  public PhoneNumber: string = null;
  public SampleCode: number = null;
  public SampleDate: string = null;
  public VisitType: string = null;
  public SampleCodeFormatted: string = null;
  public PatientId: number = null;
  public RunNumType: string = null;

  public IsPrinted: boolean = false;
  public ReportId: number = null;
  public BillingStatus: string = null;
  public BarCodeNumber: number = null;
  public WardName: string = null;
  public ReportGeneratedBy: string = null;
  public IsValidToPrint: boolean = false;

  public IsSelected: boolean = false;

  public Tests: Array<LabTestsInFinalReportModel> = new Array<LabTestsInFinalReportModel>();

}

export class LabTestsInFinalReportModel{
  public RequisitionId: number = null;
  public TestName: string = null;
  public LabTestId: number = null;
  public ReportTemplateId: number = null;
  public ReportTemplateShortName: string = null;
  public RunNumberType: string = null;
  public SampleCollectedBy: number = null;
  public VerifiedBy: number = null;
  public ResultAddedBy: number = null;
  public PrintedBy: number = null;
  public PrintCount: number = null;
  public BillingStatus: string = null;
  public ValidTestToPrint: boolean = false;
}
