
export class BalanceSheetReportVMModel {
    public ChartOfAccount: Array<ChartOfAccountModel> = new Array<ChartOfAccountModel>();
    public LedgerGroupCategory: Array<LedGroupCategory> = new Array<LedGroupCategory>();
    public LedgerGroup: Array<LedGroup> = new Array<LedGroup>();
    public Ledger: Array<Led> = new Array<Led>();
    public balanceSheetReportVM: Array<ChartOfAccountModel> = new Array<ChartOfAccountModel>();

    constructor() {
        this.ChartOfAccount = new Array<ChartOfAccountModel>();
        this.LedgerGroupCategory = new Array<LedGroupCategory>();
        this.LedgerGroup = new Array<LedGroup>();
        this.Ledger = new Array<Led>();
        this.balanceSheetReportVM = new Array<ChartOfAccountModel>();
    }
    //this method for mapp tree like data 
    public MappingReportData() {
        this.ChartOfAccount.forEach(coa => {
            let temp: ChartOfAccountModel = new ChartOfAccountModel();
            temp.ChartOfAccountId = coa.ChartOfAccountId;
            temp.ChartOfAccountName = coa.ChartOfAccountName;
            this.balanceSheetReportVM.push(temp);
        });
      
        this.balanceSheetReportVM.forEach(itm => {
            this.LedgerGroupCategory.forEach(itm1 => {
                if (itm1.ChartOfAccountId == itm.ChartOfAccountId) {
                    var temp = new LedGroupCategory();
                    temp = Object.assign(temp, itm1);
                    itm.LedGroupCategoryList.push(temp);                    
                }
            });
        });     
        this.balanceSheetReportVM.forEach(itm => {
            itm.LedGroupCategoryList.forEach(itm1 => {

                this.LedgerGroup.forEach(itm2 => {
                    if (itm2.LedgerGroupCategoryId == itm1.LedgerGroupCategoryId) {
                        var ledGrpTemp = new LedGroup();
                        ledGrpTemp = Object.assign(ledGrpTemp, itm2);
                        itm1.LedGroupList.push(ledGrpTemp);
                    }
                });
            });
        });          
        this.balanceSheetReportVM.forEach(itm => {
            itm.LedGroupCategoryList.forEach(itm1 => {
                itm1.LedGroupList.forEach(itm2 => {
                    this.Ledger.forEach(itm3 => {
                        if (itm3.LedgerGroupId == itm2.LedgerGroupId) {
                            itm2.LedList.push(itm3);
                        }
                    });
                });
            });
        });     
    }
}

class ChartOfAccountModel {
    public ChartOfAccountId: number = 0;
    public ChartOfAccountName: string = null;
    public LedGroupCategoryList: Array<LedGroupCategory> = new Array<LedGroupCategory>();
}
class LedGroupCategory {
    LedgerGroupCategoryId: number = 0;
    LedgerGroupCategoryName: string = null;
    ChartOfAccountId: number = 0;
    public LedGroupList: Array<LedGroup> = new Array<LedGroup>();
}
class LedGroup {
    public LedgerGroupId: number = 0;
    public LedgerGroupCategoryId: number = 0;
    public LedgerGroupName: string = null;
    public LedList: Array<Led> = new Array<Led>();
}
class Led {
    public LedgerGroupId: number = 0;
    public LedgerId: number = 0;
    public LedgerName: string = null;
    public Amount: number = 0;
}