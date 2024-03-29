﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingReports
{
    public class BilRPT_UserColln_SettlementSummaryVM
    {
        public double? CollectionFromReceivables { get; set; }
        public double? CashDiscountGiven { get; set; }
        public double? CashDiscountReceived { get; set; }


        public static BilRPT_UserColln_SettlementSummaryVM MapDataTableToSingleObject(DataTable settlInfo)
        {
            BilRPT_UserColln_SettlementSummaryVM retObj = new BilRPT_UserColln_SettlementSummaryVM();
            if (settlInfo != null)
            {
                string strSettlData = JsonConvert.SerializeObject(settlInfo);
                //Datatable contains array, we need to deserialize into list then take the first one.
                List<BilRPT_UserColln_SettlementSummaryVM> settlmntList = JsonConvert.DeserializeObject<List<BilRPT_UserColln_SettlementSummaryVM>>(strSettlData);
                if (settlmntList != null && settlmntList.Count > 0)
                {
                    retObj = settlmntList.First();
                }
            }
            return retObj;
        }
    }

    class Bil_UserColln_SettlementDetailVm
    {

    }


}
