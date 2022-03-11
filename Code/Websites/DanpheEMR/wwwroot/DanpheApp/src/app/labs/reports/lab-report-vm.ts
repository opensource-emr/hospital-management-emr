import {
  LabResult_TemplatesVM,
  LabResult_TestVM,
} from "../shared/lab-view.models";

//sud: 22Jun'18--for report printing part.

export class LabReportVM {
  public Header: string = null;
  public Lookups: ReportLookup = new ReportLookup();
  public Columns: any;
  public Signatories: string;
  public IsFileUploadedToTeleMedicine : boolean;
  //ashim: 01Sep2018 : We're now grouping by sample code only. Template detail goes to the test level.
  //public TemplateId: number;
  //public TemplateName: string;
  public ReportId: number;
  public TemplateId: number;
  public TemplateName: string;
  public TemplateType: string;
  public TemplateHTML: string;
  public FooterText: string;
  public Comments: string;
  public IsPrinted: boolean;
  public ValidToPrint: boolean = true;
  public ReportCreatedOn: string = null;
  public ReportCreatedBy: number = null;
  public PrintedOn: string = null;
  public PrintedBy: number = null;
  public PrintedByName: number = null;
  public PrintCount: number = null;
  public HasInsurance: boolean;
  public VerifiedByList: Array<number> = [];
  public CovidFileUrl: string = null;
  public Templates: Array<LabResult_TemplatesVM> = new Array<
    LabResult_TemplatesVM
  >();
  public Email:string=null;
  //sud: 21Aug'18--Implementation Pending -- handed over to Ashim
  public static AssignControlTypesToComponent(
    ipLabReportVM: LabReportVM
  ): LabReportVM {
    ipLabReportVM.Templates.forEach((temp) => {
      temp.Tests.forEach((test) => {
        // let componentJsonList: Array<any> = JSON.parse(test.ComponentJSON);
        test.Components.forEach((component) => {
          let cmp = test.ComponentJSON.find(
            (a) => a.ComponentName == component.ComponentName
          );
          if (cmp) {
            component.ControlType = cmp.ControlType;
          }
        });
      });
    });
    return ipLabReportVM;
  }

  //sud:3Sept'18 -- To show Sensitivity report in Pivotted Format. <needs revision>
  public static FormatResultForCulture(
    test: LabResult_TestVM,
    grpNum: number = 1
  ): any {
    //separate the cuture report into: 4 groups: IsolatedOrganism (this will be single value)
    // Partial, Sensitive, Resitant (Array of Antibiotics names i.e. ComponentName in our case.)
    //MaxLenArray : to figure out how many times we should loop <Comment: Find alternative approach later on>
    //note: We've to show Intermediate in HTML so making array as such.
    let retFormattedData = {
      IsolatedOrganism: null,
      Intermediate: [],
      Sensitive: [],
      Resistant: [],
      Others: [],
      MaxLenArray: [],
      HasOthersFields: false,
      ColonyCount: "",
    };
    var compFilteredByGrp = test.Components.filter(
      (c) => c.ResultGroup == grpNum
    );
    compFilteredByGrp.forEach((component) => {
      if (component.ComponentName == "Isolated Organism") {
        retFormattedData.IsolatedOrganism = component.Value;
      } else {
        if (component.Value) {
          //Change it to Intermediate if Lookup Value changes in database.
          //we need to check what all possible values could be there and should map accordingly..
          //this is preety much hardcoding, so trying to include as many scenarios as possible..
          if (
            component.Value == "Partial Sensitive" ||
            component.Value == "Intermediate" ||
            component.Value.startsWith("Inter")
          ) {
            retFormattedData.Intermediate.push(component.ComponentName);
          } else if (
            component.Value == "Resistance" ||
            component.Value == "Resistant" ||
            component.Value.startsWith("Resist")
          ) {
            retFormattedData.Resistant.push(component.ComponentName);
          } else if (
            component.Value == "Sensitive" ||
            component.Value.startsWith("Sensit")
          ) {
            retFormattedData.Sensitive.push(component.ComponentName);
          } else if (
            component.ComponentName == "Colony Count" ||
            component.ComponentName.startsWith("Colony")
          ) {
            retFormattedData.ColonyCount = component.Value;
          } else {
            //if currentvalue is not included in any of above, then add them to others array and display both compName +Value
            retFormattedData.HasOthersFields = true;
            retFormattedData.Others.push(
              component.ComponentName + " :  " + component.Value
            );
          }
        }
      }
    });

    //Calculate value for MaxLenArray.
    if (retFormattedData) {
      //first assign Sensitive to MaxLenArray, then compare and keep replacing it whenever other array is bigger than MaxLenArray
      retFormattedData.MaxLenArray = retFormattedData.Sensitive;
      if (
        retFormattedData.Intermediate.length >
        retFormattedData.MaxLenArray.length
      ) {
        retFormattedData.MaxLenArray = retFormattedData.Intermediate;
      }
      if (
        retFormattedData.Resistant.length > retFormattedData.MaxLenArray.length
      ) {
        retFormattedData.MaxLenArray = retFormattedData.Resistant;
      }
      if (
        retFormattedData.Others.length > retFormattedData.MaxLenArray.length
      ) {
        retFormattedData.MaxLenArray = retFormattedData.Others;
      }
    }

    return retFormattedData;
  }
}

export class ReportLookup {
  public LabTypeName :string ='';
  public PatientId: number = null;
  public PatientName: string = null;
  public PatientCode: string = null;
  public Gender: string = null;
  public DOB: string = null;
  public PhoneNumber: string = null;
  public Address: string = null;
  public ReferredById: number = null;
  public ReferredBy: string = null;
  public ReceivingDate: string = null;
  public ReportingDate: string = null;
  public SampleDate: string = null;
  public SampleCode: string = null;
  public SampleCodeFormatted: string = null;
  public VisitType: string = null;
  public RunNumberType: string = null;

  public VisitTypeCode: string = null;
  public VerifiedOn: string = null;
  public Specimen: string = null;
  public CountrySubDivisionName: string = null;
  public MunicipalityName: string = null;
  public Email : string = null;
}
