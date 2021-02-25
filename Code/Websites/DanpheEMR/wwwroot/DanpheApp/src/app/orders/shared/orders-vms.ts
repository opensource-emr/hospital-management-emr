
//add more properties as per necessisity -- sud:11June;18
export class OrderItemsVM {
  public Type: string = null;
  public ItemId: number = null;
  public ItemName: string = null;
  public FormattedName: string = null;
  public PreferenceType: string = null;
  public IsPreference: boolean = false;
  public IsSelected: boolean = false;
  public AvailableQuantity: number = null;

  //these are only for medication items.
  public GenericId: null = null;
  public IsGeneric: boolean = false;
  public Dosage: string = null;
  public Route: string = null;
  public Frequency: number = null;
  public FreqInWords: string = null;

}

//Change Priority: 2, -- sudarshan 24Apr'17
//these are temporary clases.. move it as Json variables inside order-requisition.component.
//else make them as proper model--
export class RequisitionResponse {
  public isReqCompleted: boolean = false;
  public status: string = "";
  public ErrorMessage: string = "";
}

export class OrderResponse {
  public Lab: RequisitionResponse;
  public Imaging: RequisitionResponse;
  public medication: RequisitionResponse;
  public others: RequisitionResponse;
  constructor() {
    this.Lab = new RequisitionResponse();
    this.Imaging = new RequisitionResponse();
    this.medication = new RequisitionResponse();
    this.others = new RequisitionResponse();
  }
};
