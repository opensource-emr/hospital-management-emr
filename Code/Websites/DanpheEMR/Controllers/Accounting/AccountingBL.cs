using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.AccTransfer;
using DanpheEMR.Core.Caching;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.Utilities;
using Newtonsoft.Json.Linq;

namespace DanpheEMR.Controllers
{
    public class AccountingBL
    {

        public static Boolean AccountingTxnSync(AccountingTxnSyncVM txnSyncVM, AccountingDbContext accountingDb, int currHospitalId)
        {
            using (var dbContextTransaction = accountingDb.Database.BeginTransaction())
            {
                try
                {
                    foreach (var s in txnSyncVM.billingSyncs)
                    {
                        UpdateBillingSync(s, accountingDb, currHospitalId);
                    }

                    foreach (var txn in txnSyncVM.txnModels)
                    {
                        AddTransaction(txn, accountingDb, currHospitalId);
                    }

                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        #region Add Fiscal Year
        //public static void AddFiscalYear(FiscalYearModel fiscal, AccountingDbContext accDbContext)
        //{
        //    try
        //    {
        //        fiscal.CreatedOn = System.DateTime.Now;
        //        accDbContext.FiscalYears.Add(fiscal);
        //        accDbContext.SaveChanges();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        #endregion

        #region Update Fiscal Year
        ////update fiscal year will update only isActive
        //public static void UpdateFiscalYear(FiscalYearModel fiscal, AccountingDbContext accDbContext)
        //{
        //    try
        //    {
        //        accDbContext.FiscalYears.Attach(fiscal);
        //        accDbContext.Entry(fiscal).Property(x => x.IsActive).IsModified = true;
        //        accDbContext.SaveChanges();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        #endregion

        #region Insert/Add Transaction
        public static void AddTransaction(TransactionModel txn, AccountingDbContext accDbContext, int currHospitalId)
        {
            try
            {
                txn.CreatedOn = System.DateTime.Now;
                txn.HospitalId = currHospitalId;
                txn.TransactionItems.ForEach(txnItem =>
                {
                    txnItem.HospitalId = currHospitalId;
                    txnItem.CreatedOn = System.DateTime.Now;
                });

                accDbContext.Transactions.Add(txn);
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Updating BillingToAccounting SYNC 
        //here we are updating only IsTransferedToAcc
        public static void UpdateBillingSync(SyncBillingAccountingModel sync, AccountingDbContext accDbContext, int currHospitalId)
        {
            try
            {
                sync.IsTransferedToAcc = true;
                accDbContext.SyncBillingAccounting.Attach(sync);
                accDbContext.Entry(sync).Property(a => a.IsTransferedToAcc).IsModified = true;
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Get Section list for accounting billing, pharmacy, inventory
        public static List<AccSectionModel> GetSections(AccountingDbContext accountingDBContext, int currHospitalId)
        {
            try
            {
                List<AccSectionModel> sectionList = new List<AccSectionModel>();
                var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SectionList").FirstOrDefault().ParameterValue;
                if (paraValue != "")
                {
                    JObject jObject = JObject.Parse(paraValue);
                    var secList = jObject.SelectToken("SectionList").ToList();
                    sectionList = (secList != null) ? DanpheJSONConvert.DeserializeObject<List<AccSectionModel>>(DanpheJSONConvert.SerializeObject(secList)) : sectionList; ;
                }
                return sectionList;
            }
            catch (Exception ex) { throw ex; }
        }
        #endregion

        #region Get Name by using code from CodeDetails table 
        public static string GetNameByCode(string code, int currHospitalId)
        {
            var codeList = (List<AccountingCodeDetailsModel>)DanpheCache.GetMasterData(MasterDataEnum.AccountingCodes);
            var codeData = codeList.Where(a => a.HospitalId == currHospitalId && a.Code == code).Select(a => a.Name).FirstOrDefault();
            return (codeData != null) ? codeData : "";
        }
        #endregion      

        #region Method for check all flag from flaglist
        public static Boolean CheckFlagList(List<Boolean> flagList)
        {
            //copied from acc-settings controller. reuse this if required in some place.

            try
            {
                Boolean flag = true;
                if (flagList.Count <= 0)
                {
                    return false;
                }
                for (int i = 0; i < flagList.Count; i++)
                {
                    if (flagList[i] == false)
                    {
                        flag = false;
                        break;
                    }
                }
                return (flag == true) ? true : false;

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
       
    }
}
