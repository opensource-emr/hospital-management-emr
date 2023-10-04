export class LabPrintReportView {
    public LabNo: number = 0;
    public PatientName: string = null;
    public PatientCode: string = null;
    public DateOfBrith: string = null;
    public Gender: string = null;
    public BillNo: string = null;
    public CreatedOn: string = null;
    public ProviderId: number = 0;
    public ProviderName: string = null;
    public LabTestCategory: string = null;
    public LabTestName: string = null;
  
    // this only on client side only to store the age..
    public Age: number = null;
    public Components: Array<TestComponents> = new Array<TestComponents>();
}
//this is there because each test will have many component
export class TestComponents {
  
    public Component: string = null;
    public Value: string = null;
    //this is the combination of range and unit..
    public NormalRange: string = null;
    //this remark is from lab guy..
    public Remark: string = null;

}