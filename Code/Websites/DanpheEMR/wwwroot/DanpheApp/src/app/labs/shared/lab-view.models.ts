import { LabTestComponent } from "./lab-component.model";
import { LabVendorsModel } from "../external-labs/vendors-settings/lab-vendors.model";


//pair of testname and requisitionid.
//needed since we can have multiple tests per sample-code.
//export class TestReqIdPair {
//    public TestName: string = null;
//    public RequisitionId: number = null;
//    public SampleCode: number = null;
//    public OrderDateTime: string = null;
//    //for client side only
//    public isSelected: boolean = true;
//}

export class PatientLabSample {
  public PatientName: string = null;
  public SampleCode: string = null;
  public Specimen: string = null;

  public TestName: string = null;
  public RequisitionId: number = null;
  public OrderDateTime: string = null;
  public OrderStatus: string = null;
  public LastSampleCode: string = null;
  public SampleCreatedOn: string = null;
  public SampleCreatedBy: number = null;
  public LastSpecimenUsed: string = null;

  public RunNumberType: string = 'normal';
  public ProviderName: string = null;
  //public SmCode: string = null;
  //public SmNumber: number = null;
  //for client side only
  public IsSelected: boolean = true;
  public UseLastSampleCode: boolean = false;
  public SpecimenList: Array<Object> = null;
  public BarCodeNumber: number = null;
  public HasInsurance: boolean = false;
  // public Tests: Array<TestReqIdPair> = null;
  //below is only for client side.. 
  //public TestCSV: string = null;
  //public SampleCreatedBy: number = null;
  //public SampleCreatedOn: string = null;
}
export class LabTestSpecimen {
  public SpecimenId: number;
  public SpecimenName: string = null;
}

export class PatientTestComponents {

  public LabTestId: number = 0;
  public ComponentJSON: string = null;
  public RequisitionId: number = 0;
  public TestName: string = null;
  public RequestDate: string = null;
  public HasNegativeResults: boolean = false;
  public NegativeResultText: string = null;
}

////
export class LabPendingResultVM {
  public PatientName: string = null;
  public TemplateName: string = null;
  public TemplateId: number = null;
  public PatientId: number = null;
  public Tests: Array<LabTestDetail> = new Array<LabTestDetail>();
  public LabTestCSV: string = null;
  public SampleCode: number = null;
  public SampleDate: string = null;
  public PhoneNumber: string = null;
  public PatientCode: string = null;
  public BarCodeNumber: number = null;
  public WardName: string = null;
}
export class LabTestDetail {
  public RequisitionId: number = 0;
  public TestName: string = null;
  public LabTestId: number = 0;
  public ReportTemplateId: number = 0;
  public ReportTemplateShortName: string = null;
}



//this is like a view model....
export class LabTestViewResult {
  //this is just used to show testname while adding the value of each component
  public TemplateName: string = null;
  public TemplateId: number = null;
  public TestName: string = null;
  public PatientId: number = null;
  public CreatedOn: string = null;
  public PatientName: string = null;
  public SampleCode: number = null;
  public SampleDate: string = null;
  //printId form server-side
  //public PrintId: number = null;
  public LabReportId: number = null;
  public Tests: Array<LabResult_TestVM> = new Array<LabResult_TestVM>();
  //public Components: Array<LabTestComponent> = new Array<LabTestComponent>();
  //public IsPrint: boolean = null;
}

//export class VirtualTestIdNamePair {
//    public TestName: string = null;
//    public RequisitionId: number = 0;
//    public TestId: number = 0;
//    public Components: Array<LabTestComponent> = new Array<LabTestComponent>();
//}

export class LabResult_TemplateVM {
  public TemplateName: string = null;
  public TemplateId: number = null;
  public PatientId: number = null;
  public PatientName: string = null;
  public Tests: Array<LabResult_TestVM> = new Array<LabResult_TestVM>();
}


export class LabResult_TestVM {
  public LabTestId: number = 0;
  public TestName: string = null;
  public ReportingName: string = null;
  public RequisitionId: number = 0;
  public TemplateId: number = 0;
  public TemplateName: string = null;
  public RequestDate: string = null;
  //public PrintId: number = null;
  public LabReportId: number = null;
  public Components: Array<LabTestComponent> = new Array<LabTestComponent>();
  public SelectAll: boolean = true;
  //two properties, one to display the checkbox and second to bind with the checkbox. 
  public ShowNegativeCheckbox: boolean = false;
  public IsNegativeResult: boolean = false;
  public NegativeResultText: string = null;
  public ComponentJSON: Array<LabTestComponent> = null;
  public HasNegativeResults: boolean = false;
  public SampleCode: string = null;
  public SampleCreatedOn: string = null;
  public Comments: string = null;
  public TemplateType: string = null;//sud:18Sept (needed to format culture report while mixing culture and normal)
  public ResultFormattedForCulture: any = null;//sud:18Sept (needed to format culture report while mixing culture and normal)
  public Specimen: string = null;
  public SampleCollectedBy: string = null;
  public SampleCollectedOn: string = null;
  public VendorDetail: LabVendorsModel = null;
  public HasInsurance: boolean = null;
}

export class LabResult_TemplatesVM {
  public TemplateId: number = null;
  public TemplateName: string = null;
  public HeaderText: string = null;
  public FooterText: string = null;
  public TemplateType: string = null;//sud:18Sept--to loop inside templates
  public TemplateColumns: any = null;//sud:19Sept'18--to group columns in template level.
  public ColCount: number = 0;
  public Tests: Array<LabResult_TestVM> = new Array<LabResult_TestVM>();
}


//Used to add specimen from the addResult page for culture type tests
export class LabTestSpecimenModel {
  public RequisitionId: number = 0;
  public Specimen: string = "";
}
