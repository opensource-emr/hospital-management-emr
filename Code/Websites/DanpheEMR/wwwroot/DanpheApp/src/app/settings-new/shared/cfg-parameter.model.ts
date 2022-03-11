export class CFGParameterModel {
  public ParameterId: number = 0;
  public ParameterGroupName: string = null;
  public ParameterName: string = null;
  public ParameterValue: any = null;
  public ValueDataType: string = null;
  public Description: string = null;
  public ParameterType: string = null;

  public ValueLookUpList: string = null;

  public MappedObject: Array<MappedObj> = [];
  public MappedArray: Array<Array<MappedObj>> = [];

}

export class MappedObj {
  public KeyName: string = null;
  public Value: string = null;

  public ValueType: string = null;
  public ActualValueType: string = null;
  public OuterKeyName: string = null;
}





