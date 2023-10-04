


import { ledgerGroupModel } from "./ledgerGroup.model";
import { VoucherLedgerGroupMapModel } from "./voucher-ledger-group-map.model";

export class AccountingLedgerVoucherMapViewModel {

    public ledgerGroup: ledgerGroupModel = new ledgerGroupModel();
    public voucherLedgerGroupMap: Array<VoucherLedgerGroupMapModel> = new Array<VoucherLedgerGroupMapModel>();

}