import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { VoucherModel } from '../shared/voucher.model';
import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { VoucherLedgerGroupMapModel } from '../shared/voucher-ledger-group-map.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'voucher-manage',
    templateUrl: "./ledgergroup-voucher-manage.html"
})
export class LedgerGroupVoucherManageComponent {

    public voucherList: Array<VoucherModel> = new Array<VoucherModel>();
    
    public mappedLedgerGroup: Array<VoucherLedgerGroupMapModel> = new Array<VoucherLedgerGroupMapModel>();
    public existingLedgerGrpVoucherList: Array<VoucherLedgerGroupMapModel> = new Array<VoucherLedgerGroupMapModel>();
   // public existingModifiedLedgerGrpVoucherList: Array<VoucherLedgerGroupMapModel> = new Array<VoucherLedgerGroupMapModel>();

    public selectedItem: VoucherModel;
    public ledgergroupId: number;

    @Output("back-to-list")
    backToList = new EventEmitter();    

    @Input("selectedLedgers")
    public selectedLedgers: ledgerGroupModel;
    public showManageVouchers: boolean = true;
    @Output("callback-manageRole")
    callbackManageUser: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public accountingBlService: AccountingSettingsBLService,
        public msgBoxServ: MessageboxService) {

        this.GetVoucherList();
    }

    @Input("showManageVouchers")
    public set value(val: boolean) {
        if (this.showManageVouchers && val) {
            this.selectedLedgers;
            this.ledgergroupId = this.selectedLedgers.LedgerGroupId;
            this.GetLedgerGrpVoucherList(this.ledgergroupId);
        }
        else {
            this.showManageVouchers = val;
            this.selectedLedgers;
        }           
    }
    //get voucher list
    GetVoucherList() {
        this.accountingBlService.GetVouchers()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.voucherList = res.Results;
                } else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get role list.. please check log for details.'], err.ErrorMessage);
            });
    }
    //get mapping table details by LedgeGroupId
    GetLedgerGrpVoucherList(ledgergroupId: number) {
        this.accountingBlService.GetLedgerGrpVoucherByLedgerGrpId(ledgergroupId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.existingLedgerGrpVoucherList = res.Results;
                    this.MappModel();                  
                   
                } else
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get application list.. please check log for details.'], err.ErrorMessage);
            });
    }
    //map voucher and ledgeGroupMap table 
    MappModel() {
        try {
            //let mappedLedgerGroup = new Array<VoucherLedgerGroupMapModel>();
            this.voucherList.forEach(v => {
                let temp = new VoucherLedgerGroupMapModel();
                temp.VoucherId = v.VoucherId;
                temp.voucherName = v.VoucherName;
                temp.CreatedOn = moment().format("YYYY-MM-DD");
                temp.IsActive = true;
                temp.LedgerGroupId = this.ledgergroupId;               
                temp.flagCredit = false;
                temp.flagDebit = false;
                let dataList = this.existingLedgerGrpVoucherList.filter(x => x.VoucherId == v.VoucherId && x.IsActive==true);
                if (dataList) {
                    dataList.forEach(i => {
                         temp.isMapped = true;                      
                        if (i.IsDebit) {                            
                            temp.flagDebit = true;
                        } else {
                            temp.flagCredit = true;
                        }                       
                    });
                }
                this.mappedLedgerGroup.push(temp);
            });           
            this.showManageVouchers = true;
        } catch (exception) {
            throw exception;
        }
    }

    //check uncheck debit and credit
    SelectDeselectVoucher(index) {
        if (!this.mappedLedgerGroup[index].isMapped) {
            this.mappedLedgerGroup[index].isMapped = false;
            this.mappedLedgerGroup[index].flagCredit = false;
            this.mappedLedgerGroup[index].flagDebit = false
        } else {
           this.mappedLedgerGroup[index].isMapped = true;
            this.mappedLedgerGroup[index].flagCredit = true;
            this.mappedLedgerGroup[index].flagDebit = true;
        }
    }
    cbCheckedChanged(type, index) {
        if (type == "debit") {
            this.mappedLedgerGroup[index].flagDebit = (this.mappedLedgerGroup[index].flagDebit == true) ? false : true;
        }
        else {
            this.mappedLedgerGroup[index].flagCredit = (this.mappedLedgerGroup[index].flagCredit == true) ? false : true;
        }
        if (this.mappedLedgerGroup[index].flagCredit == true || this.mappedLedgerGroup[index].flagDebit == true) {
            this.mappedLedgerGroup[index].isMapped = true;
        }
        if (this.mappedLedgerGroup[index].flagCredit == false && this.mappedLedgerGroup[index].flagDebit == false) {
            this.mappedLedgerGroup[index].isMapped = false;
        }
    }   
    //submit method fire when user click on submit button 
    Submit() {
        let tempList = new Array<VoucherLedgerGroupMapModel>();      
        //map and create list for post with all isActive true and as per user input for IsDebit
        this.mappedLedgerGroup.forEach(x => {
            //only two operation at server side one is post and nother is put
            if (x.isMapped) {
                //row entry for IsDebit=1
                if (x.flagDebit) {
                    let y = new VoucherLedgerGroupMapModel();
                    y.VoucherId = x.VoucherId;
                    y.LedgerGroupId = this.ledgergroupId;
                    y.IsDebit = true;
                    y.IsActive = true;
                    y.actionName = "NA";
                    tempList.push(y);
                } 
                //row entry for IsDebit=0
                if (x.flagCredit) {
                    let y = new VoucherLedgerGroupMapModel();
                    y.VoucherId = x.VoucherId;
                    y.LedgerGroupId = this.ledgergroupId;
                    y.IsDebit = false;
                    y.IsActive = true;
                    y.actionName = "NA";
                    tempList.push(y);
                }                                          
            }
        });

        tempList.forEach(x => {
            let old = this.existingLedgerGrpVoucherList.find(s => s.VoucherId == x.VoucherId && s.IsDebit == x.IsDebit);
            if (old) {
                x.VoucherLedgerGroupMapId = old.VoucherLedgerGroupMapId;
                if (!old.IsActive) {
                    x.IsActive = true;
                    x.actionName = "put";
                }
            } else {                
                    x.actionName = "post";                
            }
        });

        this.existingLedgerGrpVoucherList.forEach(x => {
            let t = tempList.find(i => i.VoucherId == x.VoucherId && i.IsDebit == x.IsDebit);
            if (!t) {
                
                    x.IsActive = false;                                                                                
                    x.actionName = "put";
                    tempList.push(x);
                
            }
        });
        this.PostVoucherMappedData(tempList);        

    }
    //Post mapped List of voucherGroup with Vouchers 
    PostVoucherMappedData(dataList) {
        this.accountingBlService.PostManageVoucher(dataList)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.msgBoxServ.showMessage("success", ["Voucher updated for ledgergroup."]);
                    this.backToList.emit();//go back to voucher group list                   
                }
                else {
                    this.msgBoxServ.showMessage("error", ["failes check log and try again."]);
                }
            }); 
    }
    //go back to VoucherGroup List
    BackToList() {
        this.backToList.emit();
    }

}
