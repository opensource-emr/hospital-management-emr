using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Caching;
using DanpheEMR.Security;
using System.Xml;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860
//this is the cotroller
namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    public class OrdersController : CommonController
    {
        private readonly PatientDbContext _patientDbContext;
        private readonly MasterDbContext _masterDbContext;
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly OrdersDbContext _ordersDbContext;
        public OrdersController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _patientDbContext = new PatientDbContext(connString);
            _masterDbContext = new MasterDbContext(connString);
            _pharmacyDbContext = new PharmacyDbContext(connString);
            _ordersDbContext = new OrdersDbContext(connString);
        }


        [HttpGet]
        [Route("ActiveOrders")]
        public IActionResult ActiveOrders(int patientId, int patientVisitId)
        {
            //if (reqType == "patActiveorders" && patientId != 0)

            Func<object> func = () => GetActiveOrders(patientId, patientVisitId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("OrderItems")]
        public IActionResult OrderItems(int priceCategoryId)
        {
            //if (reqType == "allOrderItems")

            Func<object> func = () => GetOrderItems(priceCategoryId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("GenericMaps")]
        public IActionResult GenericMaps(int patientId, int patientVisitId)
        {
            //if (reqType == "getGenericMaps")            
            Func<List<PHRMGenericModel>> func = () => _ordersDbContext.PharmacyGenericItems.ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingItems")]
        public IActionResult BillingItems()
        {
            //  else if (reqType == "otherItems")          
            Func<object> func = () => GetBillingItems();
            return InvokeHttpGetFunction(func);

        }
        [HttpGet]
        [Route("EmployeePreferences")]
        public IActionResult EmployeePreferences()
        {
            //if (reqType == "empPreferences")         
            Func<object> func = () => GetEmployeePreferences();
            return InvokeHttpGetFunction(func);

        }

        [HttpPost]
        [Route("EmployeePreference")]
        public IActionResult PostEmployeePreference(string preferenceType, string ItemId)
        {
            //  if (reqType != null && reqType == "AddToPreference")        
            Func<object> func = () => AddEmployeePreference(preferenceType, ItemId);
            return InvokeHttpPostFunction(func);

        }

        [HttpPut]
        [Route("EmployeePreference")]
        public IActionResult PutEmployeePreference(string preferenceType, string itemId)
        {

            //if (reqType != null && reqType == "DeleteFromPreference")
            Func<object> func = () => DeleteItemFromEmployeePreference(preferenceType, itemId);
            return InvokeHttpPutFunction(func);

        }
        private string DeleteItemFromEmployeePreference(string preferenceType, string itemId)
        {
            string preferenceIdType = null;
            string preferenceName = null;
            if (preferenceType.ToLower() == "lab")
            {
                preferenceName = "Labtestpreferences";
                preferenceIdType = "//LabTestId";
            }
            else if (preferenceType.ToLower() == "imaging")
            {
                preferenceName = "Imagingpreferences";
                preferenceIdType = "//ImagingItemId";
            }
            else if (preferenceType.ToLower() == "medication")
            {
                preferenceName = "Medicationpreferences";
                preferenceIdType = "//MedicineId";
            }
            else if (preferenceType.ToLower() == "patient")
            {
                preferenceName = "Patientpreferences";
                preferenceIdType = "//PatientId";
            }
            else if (preferenceType.ToLower() == "followup")
            {
                preferenceName = "Followuppreferences";
                preferenceIdType = "//PatientId";
            }


            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            EmployeePreferences employeePreference = (from pref in _ordersDbContext.EmployeePreferences
                                                      where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
                                                      select pref).FirstOrDefault();


            XmlDocument prefXmlDocument = new XmlDocument();
            prefXmlDocument.LoadXml(employeePreference.PreferenceValue);
            // selecting the node of xml Document with tag LabTestId
            XmlNodeList nodes = prefXmlDocument.SelectNodes(preferenceIdType);
            //looping through the loop and checking the labtestId match or not 
            //if it is matched with LabtestId the delete the node
            foreach (XmlNode node in nodes)
            {
                if (node.InnerXml == itemId.ToString())
                {
                    node.ParentNode.RemoveChild(node);
                }
            }
            //replacing the old value of employeePreference.PreferenceValue with new one
            employeePreference.PreferenceValue = prefXmlDocument.InnerXml;
            employeePreference.ModifiedBy = currentUser.EmployeeId;
            employeePreference.ModifiedOn = DateTime.Now;
            _ordersDbContext.SaveChanges();
            return itemId;
        }
        private object GetEmployeePreferences()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            int empId = currentUser.EmployeeId;

            //concatenate all orderitems into one list.
            List<OrderItemsVM> allPreferences = new List<OrderItemsVM>();
            allPreferences = allPreferences.Concat(GetLabPreferences(empId, _ordersDbContext)).ToList();
            allPreferences = allPreferences.Concat(GetMedicationPreferences(empId, _ordersDbContext)).ToList();
            allPreferences = allPreferences.Concat(GetImagingPreferences(empId, _ordersDbContext)).ToList();
            return allPreferences;

        }
        private object GetBillingItems()
        {
            var itemList = (from itm in _ordersDbContext.BillServiceItems
                            join servceDpt in _ordersDbContext.ServiceDepartment on itm.ServiceDepartmentId equals servceDpt.ServiceDepartmentId
                            join priceCatServItem in _ordersDbContext.BillPriceCategoryServiceItems on itm.ServiceItemId equals priceCatServItem.ServiceItemId
                            where (servceDpt.IntegrationName.ToLower() != "radiology" && servceDpt.IntegrationName.ToLower() != "lab") && priceCatServItem.PriceCategoryId == 1 //Krishna, 13thMarch'23, 1 is for Normal and Hard Coded for Now
                            select new
                            {
                                BillItemPriceId = itm.ServiceItemId,
                                ServiceDepartmentId = itm.ServiceDepartmentId,
                                ItemId = itm.IntegrationItemId,
                                ItemName = itm.ItemName,
                                //ProcedureCode = itm.ProcedureCode,
                                Price = priceCatServItem.Price,
                                CreatedBy = itm.CreatedBy,
                                CreatedOn = itm.CreatedOn,
                                ModifiedOn = itm.ModifiedOn,
                                ModifiedBy = itm.ModifiedBy,
                                IsActive = itm.IsActive,
                                IntegrationName = itm.IntegrationName,
                                TaxApplicable = itm.IsTaxApplicable,
                                Description = itm.Description,
                                IsDoctorMandatory = itm.IsDoctorMandatory,
                                ItemCode = itm.ItemCode,
                                DisplaySeq = itm.DisplaySeq,
                                //DiscountApplicable = itm.DiscountApplicable,
                                //HasAdditionalBillingItems = itm.HasAdditionalBillingItems,
                                //InsuranceApplicable = itm.InsuranceApplicable,
                                //GovtInsurancePrice = itm.GovtInsurancePrice,
                                //IsInsurancePackage = itm.IsInsurancePackage,
                                //IsFractionApplicable = itm.IsFractionApplicable,
                                //EHSPrice = itm.EHSPrice,
                                //SAARCCitizenPrice = itm.SAARCCitizenPrice,
                                //ForeignerPrice = itm.ForeignerPrice,
                                //InsForeignerPrice = itm.InsForeignerPrice,
                                ServiceDepartmentName = servceDpt.ServiceDepartmentName
                            }).OrderBy(item => item.ItemName).ToList();
            return itemList;
        }


        private object GetOrderItems(int priceCategoryId)
        {
            //concatenate all orderitems into one list.
            List<OrderItemsVM> allOrderItems = new List<OrderItemsVM>();
            allOrderItems = allOrderItems.Concat(GetPhrmItems(_ordersDbContext)).ToList();
            allOrderItems = allOrderItems.Concat(GetLabItems(_ordersDbContext, priceCategoryId)).ToList();
            allOrderItems = allOrderItems.Concat(GetPharmacyItems(_ordersDbContext)).ToList();
            allOrderItems = allOrderItems.Concat(GetImagingItems(_ordersDbContext, priceCategoryId)).ToList();
            allOrderItems = allOrderItems.Concat(GetOtherItems(_ordersDbContext, priceCategoryId)).ToList();
            return allOrderItems;
        }

        private object GetActiveOrders(int patientId, int patientVisitId)
        {
            PatientModel patientModel = new PatientModel();
            patientModel = (from pat in _patientDbContext.Patients
                            where pat.PatientId == patientId
                            select pat).Include(a => a.Visits.Select(v => v.Vitals))
                             .Include(a => a.Problems)
                             .Include(a => a.Allergies)
                             .Include(a => a.Addresses)
                             .Include(a => a.LabRequisitions)
                             //.Include(a => a.ImagingReports)
                             .Include(a => a.ImagingItemRequisitions)
                             .Include(a => a.MedicationPrescriptions)
                             .FirstOrDefault<PatientModel>();

            //this will remove all other orders from past and only orders which matches visit-id will be shown (lab order / imaging order)
            if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
            {
                patientModel.LabRequisitions = patientModel.LabRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned").ToList();
                patientModel.ImagingItemRequisitions = patientModel.ImagingItemRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned").ToList();
            }

            //add vitals to patient
            if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
            {
                patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
                //take last three vitals only.. 
                patientModel.Vitals = patientModel.Vitals.OrderByDescending(a => a.CreatedOn).Take(3).ToList();

            }

            //remove resolved problems
            if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
            {
                patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
            }

            //add medication prescription if any.
            //need to get it as pharmacy model later on, now we're mapping this as MedicationPrescription model only.
            if (patientModel != null)
            {
                var patPrescriptions = _pharmacyDbContext.PHRMPrescriptionItems.Where(p => p.PatientId == patientModel.PatientId).ToList();
                if (patPrescriptions != null && patPrescriptions.Count > 0)
                {
                    var allItems = _pharmacyDbContext.PHRMItemMaster.ToList();
                    var presItems = (from pres in patPrescriptions
                                     join itm in allItems
                                     on pres.ItemId equals itm.ItemId
                                     select new MedicationPrescriptionModel()
                                     {
                                         MedicationId = itm.ItemId,
                                         MedicationName = itm.ItemName,
                                         Frequency = pres.Frequency.HasValue ? pres.Frequency.Value.ToString() : "",
                                         Duration = pres.HowManyDays.Value,
                                         CreatedOn = pres.CreatedOn
                                     }).ToList();

                    patientModel.MedicationPrescriptions = presItems;
                }

            }



            List<PHRMItemMasterModel> medList = _pharmacyDbContext.PHRMItemMaster.ToList();
            //add name to allergies
            if (patientModel != null && patientModel.Allergies != null && patientModel.Allergies.Count > 0)
            {
                foreach (var allergy in patientModel.Allergies)
                {
                    if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null)
                    {
                        allergy.AllergenAdvRecName = medList.Where(a => a.ItemId == allergy.AllergenAdvRecId)
                                                     .FirstOrDefault().ItemName;
                    }
                }
            }
            return patientModel;
        }
        private object AddEmployeePreference(string preferenceType, string ItemId)
        {
            string preferenceIdType = null;
            string preferenceName = null;
            if (preferenceType.ToLower() == "lab")
            {
                preferenceName = "Labtestpreferences";
                preferenceIdType = "LabTestId";
            }
            else if (preferenceType.ToLower() == "imaging")
            {
                preferenceName = "Imagingpreferences";
                preferenceIdType = "ImagingItemId";
            }
            else if (preferenceType.ToLower() == "medication")
            {
                preferenceName = "Medicationpreferences";
                preferenceIdType = "MedicineId";
            }
            else if (preferenceType.ToLower() == "patient")
            {
                preferenceName = "Patientpreferences";
                preferenceIdType = "PatientId";
            }
            else if (preferenceType.ToLower() == "followup")
            {
                preferenceName = "Followuppreferences";
                preferenceIdType = "PatientId";
            }

            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            EmployeePreferences employeePreference = (from pref in _ordersDbContext.EmployeePreferences
                                                      where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
                                                      select pref).FirstOrDefault();

            if (employeePreference == null)
            {
                //this is used to convert string into xml
                XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Row\":{" + preferenceIdType + ":" + ItemId + "}}", "root");
                //this is add new perference
                EmployeePreferences employeePref = new EmployeePreferences();

                employeePref.PreferenceName = preferenceName;
                employeePref.PreferenceValue = xdoc.InnerXml;
                employeePref.EmployeeId = currentUser.EmployeeId;
                employeePref.CreatedBy = currentUser.EmployeeId; ;
                employeePref.CreatedOn = DateTime.Now;
                employeePref.IsActive = true;
                _ordersDbContext.EmployeePreferences.Add(employeePref);
                _ordersDbContext.SaveChanges();
                return employeePref;
            }
            else
            {

                //creating object of XmlDocument
                XmlDocument prefXmlDoc = new XmlDocument();
                //loading the database PreferenceValue in object of XmlDocument(prefXmlDoc)
                prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
                //creating xmlElement with tag Row
                XmlElement Row = prefXmlDoc.CreateElement("Row");
                //creating xmlElement with tag LabTestId/ImagingTypeId
                XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
                //provididng value to the element of LabTestId/ImagingTypeId
                typeId.InnerText = ItemId;
                //appending LabTestId/ImagingTypeId element ot Row element as child
                Row.AppendChild(typeId);
                //Appending the Row elemt to the root element of xml
                prefXmlDoc.DocumentElement.AppendChild(Row);
                //replacing the old value of employeePreference.PreferenceValue with new one
                employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
                employeePreference.ModifiedBy = currentUser.EmployeeId;
                employeePreference.ModifiedOn = DateTime.Now;


                _ordersDbContext.Entry(employeePreference).State = EntityState.Modified;
                _ordersDbContext.SaveChanges();
                return employeePreference;
            }

        }




        //[HttpGet]
        //public string Get(string reqType, int patientId, int patientVisitId)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        //this is duplicated from DoctorsController, remove from there and use this one later on.
        //        //if (reqType == "patActiveorders" && patientId != 0)
        //        //{
        //        //    PatientModel patientModel = new PatientModel();
        //        //    PatientDbContext dbContextcommand = new PatientDbContext(connString);
        //        //    patientModel = (from pat in dbContextcommand.Patients
        //        //                    where pat.PatientId == patientId
        //        //                    select pat).Include(a => a.Visits.Select(v => v.Vitals))
        //        //                     .Include(a => a.Problems)
        //        //                     .Include(a => a.Allergies)
        //        //                     .Include(a => a.Addresses)
        //        //                     .Include(a => a.LabRequisitions)
        //        //                     //.Include(a => a.ImagingReports)
        //        //                     .Include(a => a.ImagingItemRequisitions)
        //        //                     .Include(a => a.MedicationPrescriptions)
        //        //                     .FirstOrDefault<PatientModel>();

        //        //    //this will remove all other orders from past and only orders which matches visit-id will be shown (lab order / imaging order)
        //        //    if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
        //        //    {
        //        //        patientModel.LabRequisitions = patientModel.LabRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned").ToList();
        //        //        patientModel.ImagingItemRequisitions = patientModel.ImagingItemRequisitions.Where(a => a.PatientVisitId == patientVisitId && a.BillingStatus != "returned").ToList();
        //        //    }

        //        //    //add vitals to patient
        //        //    if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
        //        //    {
        //        //        patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
        //        //        //take last three vitals only.. 
        //        //        patientModel.Vitals = patientModel.Vitals.OrderByDescending(a => a.CreatedOn).Take(3).ToList();

        //        //    }

        //        //    //remove resolved problems
        //        //    if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
        //        //    {
        //        //        patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
        //        //    }

        //        //    MasterDbContext masterDbContext = new MasterDbContext(connString);
        //        //    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //        //    //add medication prescription if any.
        //        //    //need to get it as pharmacy model later on, now we're mapping this as MedicationPrescription model only.
        //        //    if (patientModel != null)
        //        //    {
        //        //        var patPrescriptions = phrmDbContext.PHRMPrescriptionItems.Where(p => p.PatientId == patientModel.PatientId).ToList();
        //        //        if (patPrescriptions != null && patPrescriptions.Count > 0)
        //        //        {
        //        //            var allItems = phrmDbContext.PHRMItemMaster.ToList();
        //        //            var presItems = (from pres in patPrescriptions
        //        //                             join itm in allItems
        //        //                             on pres.ItemId equals itm.ItemId
        //        //                             select new MedicationPrescriptionModel()
        //        //                             {
        //        //                                 MedicationId = itm.ItemId,
        //        //                                 MedicationName = itm.ItemName,
        //        //                                 Frequency = pres.Frequency.HasValue ? pres.Frequency.Value.ToString() : "",
        //        //                                 Duration = pres.HowManyDays.Value,
        //        //                                 CreatedOn = pres.CreatedOn
        //        //                             }).ToList();

        //        //            patientModel.MedicationPrescriptions = presItems;
        //        //        }

        //        //    }



        //        //    List<PHRMItemMasterModel> medList = phrmDbContext.PHRMItemMaster.ToList();
        //        //    //add name to allergies
        //        //    if (patientModel != null && patientModel.Allergies != null && patientModel.Allergies.Count > 0)
        //        //    {
        //        //        foreach (var allergy in patientModel.Allergies)
        //        //        {
        //        //            if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null)
        //        //            {
        //        //                allergy.AllergenAdvRecName = medList.Where(a => a.ItemId == allergy.AllergenAdvRecId)
        //        //                                             .FirstOrDefault().ItemName;
        //        //            }
        //        //        }
        //        //    }

        //        //    responseData.Status = "OK";
        //        //    responseData.Results = patientModel;

        //        //}
        //        // if (reqType == "allOrderItems")
        //        //{
        //        //    OrdersDbContext orderDbContext = new OrdersDbContext(connString);
        //        //    //concatenate all orderitems into one list.
        //        //    List<OrderItemsVM> allOrderItems = new List<OrderItemsVM>();
        //        //    allOrderItems = allOrderItems.Concat(GetPhrmItems(orderDbContext)).ToList();
        //        //    allOrderItems = allOrderItems.Concat(GetLabItems(orderDbContext)).ToList();
        //        //    //allOrderItems = allOrderItems.Concat(GetPhrmGenericItems(orderDbContext)).ToList();
        //        //    allOrderItems = allOrderItems.Concat(GetImagingItems(orderDbContext)).ToList();
        //        //    allOrderItems = allOrderItems.Concat(GetOtherItems(orderDbContext)).ToList();

        //        //    responseData.Status = "OK";
        //        //    responseData.Results = allOrderItems;// allOrderItems.OrderBy(itm=>itm.ItemName).ToList();

        //        //}
        //        //else
        //        //if (reqType == "empPreferences")
        //        //{
        //        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //        //    int empId = currentUser.EmployeeId;
        //        //    OrdersDbContext orderDbContext = new OrdersDbContext(connString);

        //        //    //concatenate all orderitems into one list.
        //        //    List<OrderItemsVM> allPreferences = new List<OrderItemsVM>();
        //        //    allPreferences = allPreferences.Concat(GetLabPreferences(empId, orderDbContext)).ToList();
        //        //    allPreferences = allPreferences.Concat(GetMedicationPreferences(empId, orderDbContext)).ToList();
        //        //    allPreferences = allPreferences.Concat(GetImagingPreferences(empId, orderDbContext)).ToList();
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = allPreferences;

        //        //}
        //        //else if (reqType == "getGenericMaps")
        //        //{
        //        //    List<PHRMGenericModel> genericList = new List<PHRMGenericModel>();
        //        //    OrdersDbContext orderDbContext = new OrdersDbContext(connString);
        //        //    genericList = (from generics in orderDbContext.PharmacyGenericItems
        //        //                   select generics).ToList();
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = genericList;
        //        //}
        //        //else if (reqType == "otherItems")
        //        //{
        //        //    OrdersDbContext orderDbContext = new OrdersDbContext(connString);
        //        //    var itemList = (from itm in orderDbContext.BillItemPrice
        //        //                    join servceDpt in orderDbContext.ServiceDepartment on itm.ServiceDepartmentId equals servceDpt.ServiceDepartmentId
        //        //                    where (servceDpt.IntegrationName.ToLower() != "radiology" && servceDpt.IntegrationName.ToLower() != "lab")
        //        //                    select new
        //        //                    {
        //        //                        BillItemPriceId = itm.BillItemPriceId,
        //        //                        ServiceDepartmentId = itm.ServiceDepartmentId,
        //        //                        ItemId = itm.ItemId,
        //        //                        ItemName = itm.ItemName,
        //        //                        ProcedureCode = itm.ProcedureCode,
        //        //                        Price = itm.Price,
        //        //                        CreatedBy = itm.CreatedBy,
        //        //                        CreatedOn = itm.CreatedOn,
        //        //                        ModifiedOn = itm.ModifiedOn,
        //        //                        ModifiedBy = itm.ModifiedBy,
        //        //                        IsActive = itm.IsActive,
        //        //                        IntegrationName = itm.IntegrationName,
        //        //                        TaxApplicable = itm.TaxApplicable,
        //        //                        Description = itm.Description,
        //        //                        DiscountApplicable = itm.DiscountApplicable,
        //        //                        IsDoctorMandatory = itm.IsDoctorMandatory,
        //        //                        ItemCode = itm.ItemCode,
        //        //                        DisplaySeq = itm.DisplaySeq,
        //        //                        HasAdditionalBillingItems = itm.HasAdditionalBillingItems,
        //        //                        InsuranceApplicable = itm.InsuranceApplicable,
        //        //                        GovtInsurancePrice = itm.GovtInsurancePrice,
        //        //                        IsInsurancePackage = itm.IsInsurancePackage,
        //        //                        IsFractionApplicable = itm.IsFractionApplicable,
        //        //                        EHSPrice = itm.EHSPrice,
        //        //                        SAARCCitizenPrice = itm.SAARCCitizenPrice,
        //        //                        ForeignerPrice = itm.ForeignerPrice,
        //        //                        InsForeignerPrice = itm.InsForeignerPrice,
        //        //                        ServiceDepartmentName = servceDpt.ServiceDepartmentName
        //        //                    }).OrderBy(item => item.ItemName).ToList();
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = itemList;
        //        //}
        //        //else
        //        //{
        //        //    responseData.Status = "Failed";
        //        //    responseData.ErrorMessage = "invalid patient id";
        //        //}

        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //    return DanpheJSONConvert.SerializeObject(responseData, true);


        //}

        //[HttpPost]
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        //        OrdersDbContext orderDbContext = new OrdersDbContext(connString);

        //        if (reqType != null && reqType == "AddToPreference")
        //        {
        //            string preferenceType = this.ReadQueryStringData("preferenceType");
        //            string preferenceName = null;
        //            string preferenceIdType = null;
        //            if (preferenceType.ToLower() == "lab")
        //            {
        //                preferenceName = "Labtestpreferences";
        //                preferenceIdType = "LabTestId";
        //            }
        //            else if (preferenceType.ToLower() == "imaging")
        //            {
        //                preferenceName = "Imagingpreferences";
        //                preferenceIdType = "ImagingItemId";
        //            }
        //            else if (preferenceType.ToLower() == "medication")
        //            {
        //                preferenceName = "Medicationpreferences";
        //                preferenceIdType = "MedicineId";
        //            }
        //            else if (preferenceType.ToLower() == "patient")
        //            {
        //                preferenceName = "Patientpreferences";
        //                preferenceIdType = "PatientId";
        //            }
        //            else if (preferenceType.ToLower() == "followup")
        //            {
        //                preferenceName = "Followuppreferences";
        //                preferenceIdType = "PatientId";
        //            }

        //            string ItemId = this.ReadQueryStringData("itemId");
        //            //string clientValue = this.ReadPostData();

        //            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //            EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
        //                                                      where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
        //                                                      select pref).FirstOrDefault();

        //            if (employeePreference == null)
        //            {
        //                //this is used to convert string into xml
        //                XmlDocument xdoc = JsonConvert.DeserializeXmlNode("{\"Row\":{" + preferenceIdType + ":" + ItemId + "}}", "root");
        //                //this is add new perference
        //                EmployeePreferences employeePref = new EmployeePreferences();

        //                employeePref.PreferenceName = preferenceName;
        //                employeePref.PreferenceValue = xdoc.InnerXml;
        //                employeePref.EmployeeId = currentUser.EmployeeId;
        //                employeePref.CreatedBy = currentUser.EmployeeId; ;
        //                employeePref.CreatedOn = DateTime.Now;
        //                employeePref.IsActive = true;
        //                orderDbContext.EmployeePreferences.Add(employeePref);
        //                orderDbContext.SaveChanges();
        //                responseData.Status = "OK";
        //                responseData.Results = ItemId;
        //            }
        //            else
        //            {

        //                //creating object of XmlDocument
        //                XmlDocument prefXmlDoc = new XmlDocument();
        //                //loading the database PreferenceValue in object of XmlDocument(prefXmlDoc)
        //                prefXmlDoc.LoadXml(employeePreference.PreferenceValue);
        //                //creating xmlElement with tag Row
        //                XmlElement Row = prefXmlDoc.CreateElement("Row");
        //                //creating xmlElement with tag LabTestId/ImagingTypeId
        //                XmlElement typeId = prefXmlDoc.CreateElement(preferenceIdType);
        //                //provididng value to the element of LabTestId/ImagingTypeId
        //                typeId.InnerText = ItemId;
        //                //appending LabTestId/ImagingTypeId element ot Row element as child
        //                Row.AppendChild(typeId);
        //                //Appending the Row elemt to the root element of xml
        //                prefXmlDoc.DocumentElement.AppendChild(Row);
        //                //replacing the old value of employeePreference.PreferenceValue with new one
        //                employeePreference.PreferenceValue = prefXmlDoc.InnerXml;
        //                employeePreference.ModifiedBy = currentUser.EmployeeId;
        //                employeePreference.ModifiedOn = DateTime.Now;


        //                orderDbContext.Entry(employeePreference).State = EntityState.Modified;
        //                orderDbContext.SaveChanges();
        //                responseData.Status = "OK";
        //                responseData.Results = ItemId;
        //            }

        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);

        //}

        //Code modified on 2016-4-12
        //vitals visit and admission updated
        //[HttpPut]
        //public PatientModel Put(int patientId)
        //{

        //    return null;

        //}
        // DELETE api/values/5
        //[HttpDelete]
        //public string Delete(string reqType, string itemId)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    try
        //    {

        //        OrdersDbContext orderDbContext = new OrdersDbContext(connString);

        //        if (reqType != null && reqType == "DeleteFromPreference")
        //        {
        //            string preferenceType = this.ReadQueryStringData("preferenceType");
        //            string preferenceIdType = null;
        //            string preferenceName = null;
        //            if (preferenceType.ToLower() == "lab")
        //            {
        //                preferenceName = "Labtestpreferences";
        //                preferenceIdType = "//LabTestId";
        //            }
        //            else if (preferenceType.ToLower() == "imaging")
        //            {
        //                preferenceName = "Imagingpreferences";
        //                preferenceIdType = "//ImagingItemId";
        //            }
        //            else if (preferenceType.ToLower() == "medication")
        //            {
        //                preferenceName = "Medicationpreferences";
        //                preferenceIdType = "//MedicineId";
        //            }
        //            else if (preferenceType.ToLower() == "patient")
        //            {
        //                preferenceName = "Patientpreferences";
        //                preferenceIdType = "//PatientId";
        //            }
        //            else if (preferenceType.ToLower() == "followup")
        //            {
        //                preferenceName = "Followuppreferences";
        //                preferenceIdType = "//PatientId";
        //            }


        //            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //            EmployeePreferences employeePreference = (from pref in orderDbContext.EmployeePreferences
        //                                                      where pref.EmployeeId == currentUser.EmployeeId && pref.PreferenceName == preferenceName
        //                                                      select pref).FirstOrDefault();


        //            XmlDocument prefXmlDocument = new XmlDocument();
        //            prefXmlDocument.LoadXml(employeePreference.PreferenceValue);
        //            // selecting the node of xml Document with tag LabTestId
        //            XmlNodeList nodes = prefXmlDocument.SelectNodes(preferenceIdType);
        //            //looping through the loop and checking the labtestId match or not 
        //            //if it is matched with LabtestId the delete the node
        //            foreach (XmlNode node in nodes)
        //            {
        //                if (node.InnerXml == itemId.ToString())
        //                {
        //                    node.ParentNode.RemoveChild(node);
        //                }
        //            }
        //            //replacing the old value of employeePreference.PreferenceValue with new one
        //            employeePreference.PreferenceValue = prefXmlDocument.InnerXml;
        //            employeePreference.ModifiedBy = currentUser.EmployeeId;
        //            employeePreference.ModifiedOn = DateTime.Now;
        //            orderDbContext.SaveChanges();
        //            responseData.Status = "OK";
        //            responseData.Results = itemId;
        //        }

        //    }

        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}



        //this one is not used currently since HAMS wanted doctors to search only by generic/dosage.
        private List<OrderItemsVM> GetPhrmItems(OrdersDbContext orderDbContext)
        {
            var itemList = (from itm in orderDbContext.PharmacyItems
                            join stock in orderDbContext.PharmacyStocks on itm.ItemId equals stock.ItemId
                            join gen in orderDbContext.PharmacyGenericItems on itm.GenericId equals gen.GenericId
                            join map in orderDbContext.GenericDosageMaps on gen.GenericId equals map.GenericId into abc
                            from a in abc.DefaultIfEmpty()
                            select new OrderItemsVM
                            {
                                Type = "Medication",
                                PreferenceType = "Medication",
                                ItemId = itm.ItemId,
                                ItemName = itm.ItemName,
                                GenericName = gen.GenericName,
                                GenericId = itm.GenericId,
                                IsPreference = false,
                                IsGeneric = true,
                                Route = a.Route != null ? a.Route : "",
                                Frequency = a.Frequency != null ? a.Frequency : 0,
                                FreqInWords = a.FreqInWords != null ? a.FreqInWords : "",
                                Dosage = a.Dosage != null ? a.Dosage : "",
                                AvailableQuantity = stock.AvailableQuantity
                            }).OrderBy(itm => itm.ItemName).ToList();
            return itemList;
        }

        private List<OrderItemsVM> GetPharmacyItems(OrdersDbContext orderDbContext)
        {


            var phrmItems = (from itm in orderDbContext.PharmacyItems
                             join gen in orderDbContext.PharmacyGenericItems on itm.GenericId equals gen.GenericId
                             join mapDos in orderDbContext.GenericDosageMaps on gen.GenericId equals mapDos.GenericId into abc
                             from dos in abc.DefaultIfEmpty()
                             join stk in orderDbContext.PharmacyStocks.Where(a => a.AvailableQuantity > 0).GroupBy(ss => ss.ItemId)
                                                               .Select(g => new { ItemId = g.Key, AvailableQuantity = g.Sum(x => x.AvailableQuantity) })
                                                               on itm.ItemId equals stk.ItemId into stkGroup
                             from stk in stkGroup.DefaultIfEmpty()
                             select new OrderItemsVM
                             {
                                 Type = "Medication",
                                 PreferenceType = "Medication",
                                 ItemId = itm.ItemId,
                                 ItemName = itm.ItemName,
                                 GenericId = gen.GenericId,
                                 GenericName = gen.GenericName,
                                 IsPreference = false,
                                 IsGeneric = true,
                                 Route = dos != null ? dos.Route : "",
                                 Frequency = dos != null ? dos.Frequency : 0,
                                 FreqInWords = dos != null ? dos.FreqInWords : "",
                                 Dosage = dos != null ? dos.Dosage : "",
                                 AvailableQuantity = stk != null ? stk.AvailableQuantity : 0,
                             }).OrderBy(itm => itm.ItemName).ToList();

            return phrmItems;
        }



        private List<OrderItemsVM> GetLabItems(OrdersDbContext orderDbContext, int priceCategoryId)
        {

            var itemList = (from itm in orderDbContext.BillServiceItems
                            join priceCatServiceItem in orderDbContext.BillPriceCategoryServiceItems
                            on itm.ServiceItemId equals priceCatServiceItem.ServiceItemId
                            join servceDpt in orderDbContext.ServiceDepartment on itm.ServiceDepartmentId equals servceDpt.ServiceDepartmentId
                            where servceDpt.IntegrationName.ToLower() == "lab" && priceCatServiceItem.PriceCategoryId == priceCategoryId && itm.IsActive == true
                            select new OrderItemsVM
                            {
                                Type = "Lab",
                                PreferenceType = "Lab",
                                ItemId = (int)itm.IntegrationItemId,
                                ItemName = itm.ItemName,
                                GenericId = null,
                                IsGeneric = false,
                                IsPreference = false,
                                ServiceItemId = itm.ServiceItemId,
                                Price = priceCatServiceItem.Price,
                                IntegrationItemId = itm.IntegrationItemId,
                                ServiceDepartmentId = servceDpt.ServiceDepartmentId,
                                ServiceDepartmentName = servceDpt.ServiceDepartmentName,
                                SrvDeptIntegrationName = servceDpt.IntegrationName,
                                ItemCode = priceCatServiceItem.ItemLegalCode,

                            }).OrderBy(itm => itm.ItemName).ToList();
            return itemList;
        }

        private List<OrderItemsVM> GetImagingItems(OrdersDbContext orderDbContext, int priceCategoryId)
        {
            var itemList = (from itm in orderDbContext.BillServiceItems
                            join priceCatServiceItem in orderDbContext.BillPriceCategoryServiceItems
                            on itm.ServiceItemId equals priceCatServiceItem.ServiceItemId
                            join servceDpt in orderDbContext.ServiceDepartment on itm.ServiceDepartmentId equals servceDpt.ServiceDepartmentId
                            where servceDpt.IntegrationName.ToLower() == "radiology" && priceCatServiceItem.PriceCategoryId == priceCategoryId && itm.IsActive == true
                            select new OrderItemsVM
                            {
                                Type = servceDpt.ServiceDepartmentName,
                                PreferenceType = "Imaging",
                                ItemId = (int)itm.IntegrationItemId,
                                ItemName = itm.ItemName,
                                GenericId = null,
                                IsPreference = false,
                                IsGeneric = false,
                                ServiceItemId = itm.ServiceItemId,
                                Price = priceCatServiceItem.Price,
                                IntegrationItemId = itm.IntegrationItemId,
                                ServiceDepartmentId = servceDpt.ServiceDepartmentId,
                                ServiceDepartmentName = servceDpt.ServiceDepartmentName,
                                SrvDeptIntegrationName = servceDpt.IntegrationName,
                                ItemCode = priceCatServiceItem.ItemLegalCode,
                            }).OrderBy(itm => itm.ItemName).ToList();


            //var itemList = (from itm in orderDbContext.ImagingItems.Include("ImagingTypes")
            //                select new OrderItemsVM
            //                {
            //                    Type = itm.ImagingTypes.ImagingTypeName,
            //                    PreferenceType = "Imaging",
            //                    ItemId = (int)itm.ImagingItemId,
            //                    ItemName = itm.ImagingItemName,
            //                    GenericId = null,
            //                    IsPreference = false,
            //                    IsGeneric = false
            //                }).OrderBy(itm => itm.ItemName).ToList();

            return itemList;
        }

        private List<OrderItemsVM> GetOtherItems(OrdersDbContext orderDbContext, int priceCategoryId)
        {
            var itemList = (from itm in orderDbContext.BillServiceItems
                            join priceCatServiceItem in orderDbContext.BillPriceCategoryServiceItems
                            on itm.ServiceItemId equals priceCatServiceItem.ServiceItemId
                            join servceDpt in orderDbContext.ServiceDepartment on itm.ServiceDepartmentId equals servceDpt.ServiceDepartmentId
                            where (servceDpt.IntegrationName.ToLower() != "radiology" && servceDpt.IntegrationName.ToLower() != "lab")
                            && priceCatServiceItem.PriceCategoryId == priceCategoryId && itm.IsActive == true
                            select new OrderItemsVM
                            {
                                Type = "Others",
                                PreferenceType = "Others",
                                ItemId = (int)itm.IntegrationItemId,
                                ItemName = itm.ItemName,
                                GenericId = null,
                                IsPreference = false,
                                IsGeneric = false,
                                ServiceItemId = itm.ServiceItemId,
                                Price = priceCatServiceItem.Price,
                                IntegrationItemId = itm.IntegrationItemId,
                                ServiceDepartmentId = servceDpt.ServiceDepartmentId,
                                ServiceDepartmentName = servceDpt.ServiceDepartmentName,
                                SrvDeptIntegrationName = servceDpt.IntegrationName,
                                ItemCode = priceCatServiceItem.ItemLegalCode,
                            }).OrderBy(itm => itm.ItemName).ToList();

            return itemList;
        }


        private List<OrderItemsVM> GetMedicationPreferences(int empId, OrdersDbContext orderDbContext)
        {
            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceValue = (from preference in orderDbContext.EmployeePreferences
                                   where preference.EmployeeId == empId &&
                                   preference.PreferenceName == "Medicationpreferences" &&
                                   preference.IsActive == true
                                   select preference.PreferenceValue).FirstOrDefault();
            if (preferenceValue != null)
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceValue);
                // selecting the node of xml Document with tag MedicineId

                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("MedicineId");
                List<int> medIds = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int medId = Convert.ToInt32(nodes[i].InnerXml);
                    medIds.Add(medId);
                }

                retList = (from item in orderDbContext.PharmacyItems
                           join gen in orderDbContext.PharmacyGenericItems on item.GenericId equals gen.GenericId
                           join medId in medIds on item.ItemId equals medId
                           select new OrderItemsVM
                           {
                               Type = "Medication",
                               ItemName = item.ItemName,
                               ItemId = (int)item.ItemId,
                               GenericId = item.GenericId,
                               GenericName = gen.GenericName,
                               IsPreference = true,
                               PreferenceType = "Medication",
                               IsGeneric = false
                           }).ToList();

            }
            return retList;
        }
        private List<OrderItemsVM> GetImagingPreferences(int empId, OrdersDbContext orderDbContext)
        {
            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceValue = (from preference in orderDbContext.EmployeePreferences
                                   where preference.EmployeeId == empId &&
                                   preference.PreferenceName == "Imagingpreferences" &&
                                   preference.IsActive == true
                                   select preference.PreferenceValue).FirstOrDefault();
            if (preferenceValue != null)
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceValue);
                // selecting the node of xml Document with tag MedicineId

                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("ImagingItemId");
                List<int> imgIds = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int lbId = Convert.ToInt32(nodes[i].InnerXml);
                    imgIds.Add(lbId);
                }

                retList = (from item in orderDbContext.ImagingItems.Include("ImagingTypes")
                           join imgId in imgIds on item.ImagingItemId equals imgId
                           select new OrderItemsVM
                           {
                               Type = item.ImagingTypes.ImagingTypeName,
                               ItemName = item.ImagingItemName,
                               ItemId = (int)item.ImagingItemId,
                               GenericId = null,
                               PreferenceType = "Imaging",
                               IsPreference = true,
                               IsGeneric = false
                           }).ToList();

            }
            return retList;
        }
        private List<OrderItemsVM> GetLabPreferences(int empId, OrdersDbContext orderDbContext)
        {
            List<OrderItemsVM> retList = new List<OrderItemsVM>();

            var preferenceValue = (from preference in orderDbContext.EmployeePreferences
                                   where preference.EmployeeId == empId &&
                                   preference.PreferenceName == "Labtestpreferences" &&
                                   preference.IsActive == true
                                   select preference.PreferenceValue).FirstOrDefault();
            if (preferenceValue != null)
            {
                XmlDocument prefXmlDocument = new XmlDocument();
                prefXmlDocument.LoadXml(preferenceValue);
                // selecting the node of xml Document with tag LabTestId

                XmlNodeList nodes = prefXmlDocument.GetElementsByTagName("LabTestId");
                List<int> labIds = new List<int>();
                for (int i = 0; i < nodes.Count; i++)
                {
                    int lbId = Convert.ToInt32(nodes[i].InnerXml);
                    labIds.Add(lbId);
                }

                retList = (from item in orderDbContext.LabTests
                           join labId in labIds on item.LabTestId equals labId
                           select new OrderItemsVM
                           {
                               Type = "Lab",
                               ItemName = item.LabTestName,
                               ItemId = (int)item.LabTestId,
                               GenericId = null,
                               IsPreference = true,
                               PreferenceType = "Lab",
                               IsGeneric = false
                           }).ToList();

            }
            return retList;
        }



    }


    class OrderItemsVM
    {

        public string Type { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }


        public string PreferenceType { get; set; }
        public bool? IsPreference { get; set; }

        //below properties are only for medication, theyll be null in other items. 
        public int? GenericId { get; set; }
        public string GenericName { get; set; }
        public bool? IsGeneric { get; set; }
        public string Dosage { get; set; }
        public string Route { get; set; }
        public double? Frequency { get; set; }
        public string FreqInWords { get; set; }
        public Double? AvailableQuantity { get; set; }
        public int ServiceItemId { get; set; }
        public decimal Price { get; set; }
        public int? IntegrationItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public string ServiceDepartmentName { get; set; }
        public string SrvDeptIntegrationName { get; set; }
        public string ItemCode { get; set; }

    }

}
