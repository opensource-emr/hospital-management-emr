using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.SSFModels;
using DanpheEMR.Utilities;
using DocumentFormat.OpenXml.Bibliography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DanpheEMR.Controllers.Pharmacy
{

    public class PharmacyPrescriptionController : CommonController
    {
        private readonly MasterDbContext _masterDbContext;
        private readonly PharmacyDbContext _phrmDbContext;

        public PharmacyPrescriptionController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _masterDbContext = new MasterDbContext(connString);
            _phrmDbContext = new PharmacyDbContext(connString);
        }

        [HttpGet]
        [Route("PatientsPrescriptions")]
        public IActionResult PatientsPrescriptions()
        {
            //else if (reqType == "getprescriptionlist")
            //{

            Func<object> func = () => GetPatientsPrescriptions();
            return InvokeHttpGetFunction(func);
        }

        //[HttpGet]
        //[Route("PatientPrescriptions")]
        //public IActionResult PatientPrescriptions(int patientId, int prescriberId)
        //{
        //    //else if (reqType == "getPrescriptionItems" && patientId > 0 && providerId > 0)
        //    // {

        //    Func<object> func = () => GetPatientPrescriptions(patientId, prescriberId);
        //    return InvokeHttpGetFunction(func);

        //}


        [HttpPost]
        [Route("NewPrescription")]
        public IActionResult NewPrescription([FromBody] PHRMPrescriptionModel prescription)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddNewPrescription(prescription, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }


        [HttpPost]
        [Route("NewPrescriptionItem")]
        public IActionResult NewPrescriptionItem()
        {
            //else if (reqType == "postprescriptionitem")
            //{
            string str = this.ReadPostData();
            List<PHRMPrescriptionItemModel> prescItems = DanpheJSONConvert.DeserializeObject<List<PHRMPrescriptionItemModel>>(str);

            Func<object> func = () => AddNewPrescriptionItem(prescItems);
            return InvokeHttpPostFunction<object>(func);
        }


        //private object GetPatientPrescriptions(int patientId, int prescriberId)
        //{
        //    var presItems = (from pres in _phrmDbContext.PHRMPrescriptionItems
        //                     where pres.PatientId == patientId && pres.PerformerId == prescriberId && pres.OrderStatus != "final"
        //                     select pres).ToList().OrderByDescending(a => a.CreatedOn);
        //    foreach (var presItm in presItems)
        //    {
        //        presItm.ItemName = _phrmDbContext.PHRMItemMaster.Find(presItm.ItemId).ItemName;
        //        var AvailableStockList = (from stk in _phrmDbContext.DispensaryStocks
        //                                  where stk.ItemId == presItm.ItemId && stk.AvailableQuantity > 0 && stk.ExpiryDate > DateTime.Now
        //                                  select stk).ToList();
        //        presItm.IsAvailable = (AvailableStockList.Count > 0) ? true : false;
        //        //(phrmdbcontext.DispensaryStock.Where(a => a.ItemId == presItm.ItemId).Select(a => a.AvailableQuantity).FirstOrDefault() > 0) ? true : false;
        //    }
        //    return presItems;
        //}

        private object GetPatientsPrescriptions()
        {
            List<EmployeeModel> employeeList = (from emp in _masterDbContext.Employees select emp).ToList();
            var presList = (from pres in _phrmDbContext.PHRMPrescriptionItems.AsEnumerable()
                            where pres.OrderStatus == "active"
                            join pat in _phrmDbContext.PHRMPatient.AsEnumerable() on pres.PatientId equals pat.PatientId
                            join emp in employeeList.AsEnumerable() on pres.CreatedBy equals emp.EmployeeId
                            group new { pres, pat, emp } by new
                            {
                                // pres.ProviderId,
                                pres.PatientId,
                                pat.PatientCode,
                                pat.FirstName,
                                pat.MiddleName,
                                pat.LastName,
                                eFirstName = emp.FirstName,
                                eMiddleName = emp.MiddleName,
                                eLastName = emp.LastName,
                                PrescriberId = pres.CreatedBy,
                                PrescriptionId = pres.PrescriptionId
                            }
                            into t
                            select new
                            {
                                PatientCode = t.Key.PatientCode,
                                PatientId = t.Key.PatientId,
                                PrescriptionId = t.Key.PrescriptionId,
                                PatientName = t.Key.FirstName + " " + (string.IsNullOrEmpty(t.Key.MiddleName) ? "" : t.Key.MiddleName + " ") + t.Key.LastName,
                                PrescriberId = t.Key.PrescriberId,
                                PrescriberName = t.Key.eFirstName + " " + (string.IsNullOrEmpty(t.Key.eMiddleName) ? "" : t.Key.eMiddleName + " ") + t.Key.eLastName,
                                CreatedOn = t.Max(r => r.pres.CreatedOn)
                            }
                            ).OrderByDescending(a => a.CreatedOn).ToList();
            return presList;
        }

        private object AddNewPrescription(PHRMPrescriptionModel prescription, RbacUser currentUser)
        {
            prescription.CreatedBy = currentUser.EmployeeId;
            prescription.CreatedOn = DateTime.Now;
            prescription.PHRMPrescriptionItems.ForEach(p =>
            {
                p.CreatedBy = currentUser.EmployeeId;
                p.CreatedOn = DateTime.Now;
            });


            _phrmDbContext.PHRMPrescription.Add(prescription);
            _phrmDbContext.SaveChanges();
            return prescription;
        }

        private object AddNewPrescriptionItem(List<PHRMPrescriptionItemModel> prescItems)
        {
            if (prescItems != null && prescItems.Count > 0)
            {
                foreach (var prItm in prescItems)
                {
                    prItm.CreatedOn = System.DateTime.Now;
                    prItm.Quantity = prItm.Frequency.Value * prItm.HowManyDays.Value;
                    _phrmDbContext.PHRMPrescriptionItems.Add(prItm);

                }

            }

            _phrmDbContext.SaveChanges();
            return prescItems;
        }
    }
}
