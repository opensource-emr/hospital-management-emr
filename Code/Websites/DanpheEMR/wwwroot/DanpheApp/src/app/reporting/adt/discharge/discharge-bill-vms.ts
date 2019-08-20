
export class DischargeBillBreakupReportModel {
  public amount: number = 0;
  public discount: number = 0;
  public subTotal: number = 0;
  public taxable: number = 0;
  public vat: number = 0;
  public nonTaxable: number = 0;
  public total: number = 0;
  public deposit: number = 0;
  public totalPayment: number = 0;
  public reportData: Array<DischargeBillVM> = new Array<DischargeBillVM>();
}

export class DischargeBillVM {
  public departmentName: string = null;
  public itemList: Array<SubTotalModel> = new Array<SubTotalModel>();
  public calculationpart: SubTotalModel = new SubTotalModel();
}

export class SubTotalModel {
  public billDate: string = null;
  public description: string = null;
  public qty: number = 0;
  public amount: number = 0;
  public discount: number = 0;
  public subTotal: number = 0;
  public vat: number = 0;
  public total: number = 0;
}

