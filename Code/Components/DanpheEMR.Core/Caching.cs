/*
 File: DanpheCache.cs
 created: 28Jan'17-sudarshan
 description: this class contains caching methods to be used from other classes.
 remarks: we can add more methods as per necessity
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       sudarshan/28Jan'17          created          -- sliding expiration is not considered yet.
 2.       sudarshan/1Mar'17           modified        -- removed static constructor and hard-coded connstring
                                                      -- added this class to services.AddSingleton in startup.cs
 -------------------------------------------------------------------
 */

using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using System.Runtime.Caching;

namespace DanpheEMR.Core.Caching
{

    public enum MasterDataEnum
    {
        Department = 1,
        ICD10 = 2,
        ServiceDepartment = 3,
        Employee = 4,
        Medicine = 5,
        Reaction = 6,
        ImagingItems = 7,
        Taxes = 8,
        PastUniqueData = 9,
        LabRunNumberSettings = 10,
        PriceCategory = 11,
        AccountingCodes = 12
    }


    //this class uses MemoryCache internally.
    //write overloads to the existing methods if more parameters are needed
    public class DanpheCache
    {
        private static string connString;
        private static MemoryCache globalMemcache;
        private static int cacheExpiryMinutes;
        public DanpheCache(string connectionString, int cacheExpMinutes)
        {
            connString = connectionString;
            DanpheCache.globalMemcache = MemoryCache.Default;
            cacheExpiryMinutes = cacheExpMinutes;
        }

        public static bool Add(string key, object value, DateTimeOffset absoluteExpiration)
        {
            return DanpheCache.globalMemcache.Add(key, value,
                 new CacheItemPolicy()
                 {
                     AbsoluteExpiration = absoluteExpiration
                 });
        }

        public static bool Add(string key, object value, int absoluteExpiryMinsFromNow)
        {
            return DanpheCache.globalMemcache.Add(key, value,
                 new CacheItemPolicy()
                 {
                     AbsoluteExpiration = System.DateTime.Now.AddMinutes(absoluteExpiryMinsFromNow)
                 });
        }

        public static object Get(string key)
        {
            return DanpheCache.globalMemcache.Get(key);
        }



        public static object GetMasterData(MasterDataEnum masterName)
        {
            // double cacheExpMinutes = 1;//this should come from configuration later on.
            CoreDbContext coreDbContext = new CoreDbContext(connString);
            object returnValue = new object();

            switch (masterName)
            {
                case MasterDataEnum.LabRunNumberSettings:
                    {

                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("lab-runnumber-settings");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.LabRunNumberSettings.ToList<LabRunNumberSettingsModel>();
                            DanpheCache.Add("lab-runnumber-settings", returnValue, DateTime.Now.AddMinutes(20));
                        }

                    }
                    break;
                case MasterDataEnum.PastUniqueData:
                    {
                        returnValue = DanpheCache.Get("past-unique-data");
                        if (returnValue == null)
                        {
                            UniquePastDataModel allUniqueData = new UniquePastDataModel();
                            //allUniqueData.UniqueFirstNameList = masterDbContext.Patients.Where(pat => pat.FirstName != null).Select(p => p.FirstName).Distinct().OrderBy(a => a).ToList();

                            //allUniqueData.UniqueMiddleNameList = masterDbContext.Patients.Where(pat => pat.MiddleName != null).Select(p => new {
                            //                                        MName = p.MiddleName }).Distinct().OrderBy(a => a.MName).ToList<object>();

                            //allUniqueData.UniqueLastNameList = masterDbContext.Patients.Where(pat => pat.LastName != null).Select(p => new {
                            //                                        LName = p.LastName }).Distinct().OrderBy(a => a.LName).ToList<object>();

                            allUniqueData.UniqueAddressList = coreDbContext.Patients.Where(pat => pat.Address != null).Select(p => p.Address).Distinct().OrderBy(a => a).ToList();

                            //Refresh the data everyday
                            DanpheCache.Add("past-unique-data", allUniqueData, DateTime.Now.AddHours(24));
                            returnValue = allUniqueData;
                        }
                    }
                    break;
                case MasterDataEnum.Department:
                    {

                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-departments");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.Departments.OrderBy(a => a.DepartmentName).ToList<DepartmentModel>();
                            DanpheCache.Add("master-departments", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }

                    }
                    break;

                case MasterDataEnum.ICD10:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-icd10");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.ICD10Codes.ToList<ICD10CodeModel>();
                            DanpheCache.Add("master-icd10", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.Employee:
                    {

                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-employee");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.Employees.ToList<EmployeeModel>();
                            DanpheCache.Add("master-employee", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;

                case MasterDataEnum.Reaction:
                    {
                        returnValue = DanpheCache.Get("master-reaction");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.Reactions.ToList<ReactionModel>();
                            DanpheCache.Add("master-reaction", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.ImagingItems:
                    {
                        returnValue = DanpheCache.Get("master-imagingitem");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.ImagingItems.ToList<RadiologyImagingItemModel>();
                            DanpheCache.Add("master-imagingitem", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;

                case MasterDataEnum.ServiceDepartment:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-servicedepartment");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.ServiceDepartments.ToList<ServiceDepartmentModel>();
                            DanpheCache.Add("master-servicedepartment", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.PriceCategory:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-pricecategory");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.PriceCategory.ToList<PriceCategoryModel>();
                            DanpheCache.Add("master-pricecategory", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.Taxes:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-taxes");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.Taxes.ToList<TaxModel>();
                            DanpheCache.Add("master-taxes", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.Medicine:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-medicines");
                        if (returnValue == null)
                        {
                            returnValue = coreDbContext.Medicines.ToList<PHRMItemMasterModel>();
                            DanpheCache.Add("master-medicines", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                case MasterDataEnum.AccountingCodes:
                    {
                        //check if the value exists in cache, get and add to cache as well if not present.
                        returnValue = DanpheCache.Get("master-accounting-codes");
                        if (returnValue == null)
                        {
                            //var hospitalId = coreDbContext.Hospitals.Where(h => h.IsActive == true).FirstOrDefault().HospitalId;
                            returnValue = (from h in coreDbContext.Hospitals
                                           join cod in coreDbContext.ACCCodeDetails
                                           on h.HospitalId equals cod.HospitalId
                                           where h.IsActive == true
                                           select cod).ToList<AccountingCodeDetailsModel>();
                            // coreDbContext.ACCCodeDetails.Where(c=>c.HospitalId == hospitalId).ToList<AccountingCodeDetailsModel>();

                            DanpheCache.Add("master-accounting-codes", returnValue, DateTime.Now.AddMinutes(cacheExpiryMinutes));
                        }
                    }
                    break;
                default:
                    break;
            }

            return returnValue;


        }

    }

}
