using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.IncentiveModels;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Security;
using Microsoft.AspNetCore.Http;

namespace DanpheEMR.Controllers
{
    public class IncentiveBL
    {

        //#region Employee's Profile Mapping
        //public static Boolean EmployeeProfileMapping(List<EmployeeProfileMap> employeeProfiles, IncentiveDbContext incentiveDb)
        //{
        //    using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            foreach (EmployeeProfileMap profile in employeeProfiles)
        //            {
        //                InsertUpdateProfileMap(incentiveDb, profile);
        //            }
        //            dbContextTxn.Commit();
        //            return true;
        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTxn.Rollback();
        //            throw ex;
        //        }
        //    }
        //}
        //#endregion
        #region Profile's Item Mapping
        public static Boolean ProfileItemMapping(List<ProfileItemMap> profileItemMaps, IncentiveDbContext incentiveDb, int currentUserId)
        {
            using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
            {
                try
                {
                    foreach (ProfileItemMap profile in profileItemMaps)
                    {
                        InsertUpdateProfileItemMap(incentiveDb, profile, currentUserId);
                    }
                    dbContextTxn.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        #endregion
        #region Add Profile
        public static Boolean AddEmployeeProfile(ProfileModel profile, IncentiveDbContext incentiveDb, int currentUserId)
        {
            using (var dbContextTxn = incentiveDb.Database.BeginTransaction())
            {
                try
                {
                    var profileId = AddProfileMaster(incentiveDb, profile, currentUserId);
                    if (profile.AttachedProfileId != null && profile.AttachedProfileId != 0)
                    {
                        List<ProfileItemMap> profileItems = incentiveDb.ProfileItemMap.Where(m => m.ProfileId == profile.AttachedProfileId).ToList();
                        profileItems.ForEach(el =>
                        {
                            var p = new ProfileItemMap();
                            p.AssignedToPercent = el.AssignedToPercent;
                            p.BillItemPriceId = el.BillItemPriceId;
                            p.PriceCategoryId = el.PriceCategoryId;
                            p.ProfileId = profileId;
                            p.ReferredByPercent = el.ReferredByPercent;

                            InsertUpdateProfileItemMap(incentiveDb, p, currentUserId);
                        });
                    }

                    dbContextTxn.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTxn.Rollback();
                    throw ex;
                }
            }
        }
        #endregion


        //#region Insert Update Employee Profile Map
        //public static void InsertUpdateProfileMap(IncentiveDbContext incentiveDb, EmployeeProfileMap empProfileMap)
        //{
        //    try
        //    {
        //        var id = empProfileMap.EMPProfileMapId;
        //        if (incentiveDb.EMPProfileMap.Any(e => e.EMPProfileMapId == id))
        //        {
        //            incentiveDb.EMPProfileMap.Attach(empProfileMap);
        //            incentiveDb.Entry(empProfileMap).Property(x => x.ProfileId).IsModified = true;
        //            incentiveDb.Entry(empProfileMap).Property(x => x.PriceCategoryId).IsModified = true;
        //        }
        //        else
        //        {
        //            incentiveDb.EMPProfileMap.Add(empProfileMap);
        //        }
        //        incentiveDb.SaveChanges();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //#endregion
        #region Insert Update Profile Item Map
        public static void InsertUpdateProfileItemMap(IncentiveDbContext incentiveDb, ProfileItemMap profileItemMap, int currentUserId)
        {
            try
            {
                var id = profileItemMap.BillItemProfileMapId;
                if (profileItemMap.BillItemProfileMapId != 0)
                {
                    //incentiveDb.ProfileItemMap.Attach(profileItemMap);
                    var proItmMap = incentiveDb.ProfileItemMap.Where(a => a.BillItemProfileMapId == id).FirstOrDefault();
                    proItmMap.AssignedToPercent = profileItemMap.AssignedToPercent;
                    proItmMap.ReferredByPercent = profileItemMap.ReferredByPercent;
                    proItmMap.BillingTypesApplicable = profileItemMap.BillingTypesApplicable;
                    proItmMap.ModifiedBy = currentUserId;
                    proItmMap.ModifiedOn = DateTime.Now;
                    incentiveDb.Entry(proItmMap).Property(x => x.AssignedToPercent).IsModified = true;
                    incentiveDb.Entry(proItmMap).Property(x => x.ReferredByPercent).IsModified = true;
                    incentiveDb.Entry(proItmMap).Property(x => x.BillingTypesApplicable).IsModified = true;
                    incentiveDb.Entry(proItmMap).Property(x => x.ModifiedBy).IsModified = true;
                    incentiveDb.Entry(proItmMap).Property(x => x.ModifiedOn).IsModified = true;
                }
                else
                {
                    profileItemMap.CreatedBy = currentUserId;
                    profileItemMap.CreatedOn = DateTime.Now;
                    incentiveDb.ProfileItemMap.Add(profileItemMap);
                }
                incentiveDb.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Add Profile Master
        public static int AddProfileMaster(IncentiveDbContext incentiveDb, ProfileModel profile, int currentUserId)
        {
            profile.CreatedBy = currentUserId;
            profile.CreatedOn = DateTime.Now;
            incentiveDb.Profile.Add(profile);
            incentiveDb.SaveChanges();

            return profile.ProfileId;
        }
        #endregion


        #region updates Billing Transaction Item.
        public static void UpdateBillingTransactionItems(BillingDbContext billingDbContext, BillingTransactionItemModel txnItmFromClient)
        {
            if (txnItmFromClient != null && txnItmFromClient.BillingTransactionItemId != 0)
            {

                using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        BillingTransactionItemModel txnItmFromDb = billingDbContext.BillingTransactionItems
          .Where(itm => itm.BillingTransactionItemId == txnItmFromClient.BillingTransactionItemId).FirstOrDefault();

                        txnItmFromDb.ProviderId = txnItmFromClient.ProviderId;
                        txnItmFromDb.ProviderName = txnItmFromClient.ProviderName;
                        txnItmFromDb.RequestedBy = txnItmFromClient.RequestedBy;
                        txnItmFromDb.ModifiedBy = txnItmFromClient.ModifiedBy;
                        txnItmFromDb.ModifiedOn = DateTime.Now;


                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ProviderId).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ProviderName).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.RequestedBy).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedBy).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedOn).IsModified = true;

                        billingDbContext.SaveChanges();

                        dbContextTransaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        //rollback all changes if any error occurs
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
        }
        #endregion


        #region Employee's Item Mapping
        public static void EmployeeItemMapping(List<EmployeeBillItemsMap> employeeItemMaps, IncentiveDbContext incentiveDb, int currentUser)
        {

            try
            {
                foreach (EmployeeBillItemsMap empItmMap in employeeItemMaps)
                {
                    InsertUpdateEmployeeItemMap(incentiveDb, empItmMap, currentUser);

                    //if (empItmMap.HasGroupDistribution == true)
                    //{
                    //    InsertUpdateItemGroupDistribution(incentiveDb, empItmMap.GroupDistribution, empItmMap.EmployeeBillItemsMapId, currentUser);
                    //}
                }
                incentiveDb.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion

        #region Insert Update Employee Item Map
        public static void InsertUpdateEmployeeItemMap(IncentiveDbContext incentiveDb, EmployeeBillItemsMap employeeItemMap, int currentUser)
        {
            try
            {
                var id = employeeItemMap.EmployeeBillItemsMapId;
                if (incentiveDb.EmployeeBillItemsMap.Any(e => e.EmployeeBillItemsMapId == id || (e.BillItemPriceId == employeeItemMap.BillItemPriceId && e.EmployeeId == employeeItemMap.EmployeeId)))
                {
                    //incentiveDb.EmployeeBillItemsMap.Attach(employeeItemMap);
                    var empBillItmMap = incentiveDb.EmployeeBillItemsMap.Where(a => a.EmployeeBillItemsMapId == employeeItemMap.EmployeeBillItemsMapId ||
                    (a.BillItemPriceId == employeeItemMap.BillItemPriceId && a.EmployeeId == employeeItemMap.EmployeeId)).FirstOrDefault();
                    empBillItmMap.AssignedToPercent = employeeItemMap.AssignedToPercent;
                    empBillItmMap.ReferredByPercent = employeeItemMap.ReferredByPercent;
                    empBillItmMap.PriceCategoryId = employeeItemMap.PriceCategoryId;
                    empBillItmMap.HasGroupDistribution = employeeItemMap.HasGroupDistribution;
                    empBillItmMap.ModifiedBy = currentUser;
                    empBillItmMap.ModifiedOn = DateTime.Now;
                    empBillItmMap.IsActive = employeeItemMap.IsActive;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.AssignedToPercent).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.ReferredByPercent).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.PriceCategoryId).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.HasGroupDistribution).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedBy).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.ModifiedOn).IsModified = true;
                    incentiveDb.Entry(empBillItmMap).Property(x => x.IsActive).IsModified = true;
                }
                else
                {
                    employeeItemMap.CreatedBy = currentUser;
                    employeeItemMap.CreatedOn = DateTime.Now;
                    incentiveDb.EmployeeBillItemsMap.Add(employeeItemMap);
                }

                //incentiveDb.EmployeeBillItemsMap.d();

                incentiveDb.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Insert Update ItemGroupDistribution
        public static void InsertUpdateItemGroupDistribution(IncentiveDbContext incentiveDb, List<ItemGroupDistribution> groupDistribution, int EmployeeBillItemsMapId, int currentUser)
        {
            try
            {

                foreach (ItemGroupDistribution groupDist in groupDistribution)
                {
                    groupDist.EmployeeBillItemsMapId = EmployeeBillItemsMapId;
                    //remove from db if existing item is set isactive=false.
                    if (groupDist.IsActive == false)
                    {
                        incentiveDb.ItemGroupDistribution.Remove(groupDist);
                        //incentiveDb.SaveChanges();
                    }
                    else
                    {
                        //new group distribution added.
                        if (groupDist.ItemGroupDistributionId == 0)
                        {
                            groupDist.CreatedOn = DateTime.Now;
                            groupDist.CreatedBy = currentUser;
                            incentiveDb.ItemGroupDistribution.Add(groupDist);
                            //incentiveDb.SaveChanges();
                        }
                        //Existing group distribution updated.. 
                        else
                        {
                            var grpDist = incentiveDb.ItemGroupDistribution.Where(a => a.ItemGroupDistributionId == groupDist.ItemGroupDistributionId).FirstOrDefault();
                            grpDist.DistributionPercent = groupDist.DistributionPercent;
                            grpDist.DistributeToEmployeeId = groupDist.DistributeToEmployeeId;
                            grpDist.ModifiedBy = currentUser;
                            grpDist.ModifiedOn = DateTime.Now;
                            grpDist.IsActive = groupDist.IsActive;
                            incentiveDb.Entry(grpDist).Property(x => x.DistributeToEmployeeId).IsModified = true;
                            incentiveDb.Entry(grpDist).Property(x => x.DistributionPercent).IsModified = true;
                            incentiveDb.Entry(grpDist).Property(x => x.ModifiedBy).IsModified = true;
                            incentiveDb.Entry(grpDist).Property(x => x.ModifiedOn).IsModified = true;
                            incentiveDb.Entry(grpDist).Property(x => x.IsActive).IsModified = true;
                        }

                    }

                    incentiveDb.SaveChanges();
                }



                var remainingGrpDists = incentiveDb.ItemGroupDistribution.Where(itm => itm.EmployeeBillItemsMapId == EmployeeBillItemsMapId).ToList();
                if (remainingGrpDists != null && remainingGrpDists.Count > 0)
                {
                    //if only one remaining and it's for current employee then remove that row as well. 
                    if (remainingGrpDists.Count == 1 && remainingGrpDists[0].FromEmployeeId == remainingGrpDists[0].DistributeToEmployeeId)
                    {
                        incentiveDb.ItemGroupDistribution.Remove(remainingGrpDists[0]);
                        incentiveDb.SaveChanges();
                    }
                }

                //if nothing found then update hasgroupdistribution as false.
                var currBillItmMap = incentiveDb.EmployeeBillItemsMap.Where(itm => itm.EmployeeBillItemsMapId == EmployeeBillItemsMapId).FirstOrDefault();
                if (currBillItmMap != null)
                {
                    var currItemsGrpDistributions = incentiveDb.ItemGroupDistribution.Where(itm => itm.EmployeeBillItemsMapId == EmployeeBillItemsMapId).ToList();

                    if (currItemsGrpDistributions != null && currItemsGrpDistributions.Count > 1)
                    {
                        currBillItmMap.HasGroupDistribution = false;
                        incentiveDb.Entry(currBillItmMap).Property(x => x.HasGroupDistribution).IsModified = true;
                    }
                    else
                    {
                        currBillItmMap.HasGroupDistribution = false;
                        incentiveDb.Entry(currBillItmMap).Property(x => x.HasGroupDistribution).IsModified = true;
                    }

                    incentiveDb.SaveChanges();

                }


            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

    }
}
