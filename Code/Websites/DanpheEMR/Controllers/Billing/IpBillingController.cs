using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Billing;
using DanpheEMR.Core;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Controllers
{

    public class IpBillingController : CommonController
    {

        double cacheExpMinutes;//= 5;//this should come from configuration later on.
        bool realTimeRemoteSyncEnabled = false;

        private readonly BillingDbContext _billingDbContext;
        private readonly PharmacyDbContext _pharmacyDbContext;
        private readonly AdmissionDbContext _admissionDbContext;
        public IpBillingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            cacheExpMinutes = _config.Value.CacheExpirationMinutes;
            realTimeRemoteSyncEnabled = _config.Value.RealTimeRemoteSyncEnabled;
            _billingDbContext = new BillingDbContext(connString);
            _pharmacyDbContext = new PharmacyDbContext(connString);
            _admissionDbContext = new AdmissionDbContext(connString);
        }

        [HttpGet]
        [Route("AdmittedPatients")]
        public ActionResult AdmittedPatients()
        {
            //if (reqType == "list-ip-patients")
            //{
            Func<object> func = () => GetAdmittedPatientListForIpBilling();
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpGet]
        [Route("InpatientPendingBillItems")]
        public ActionResult InpatientPendingBillItems(int patientId, int ipVisitId)
        {
            //if (reqType == "pat-pending-items")
            //{
            Func<object> func = () => GetPendingBillItemsofInPatient(patientId, ipVisitId);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("BillItemsForDischargeReceipt_Unused")]
        public ActionResult BillItemsForDischargeReceipt_Unused(int patientId, int billingTxnId, string billStatus)
        {

            ////if (reqType == "pat-bill-items-for-receipt")
            Func<DataTable> func = () => _billingDbContext.GetItemsForBillingReceipt(patientId, billingTxnId, billStatus);
            return InvokeHttpGetFunction<DataTable>(func);
        }

        [HttpGet]
        [Route("DischargeReceiptAdditionalInfo")]
        public ActionResult DischargeReceiptAdditionalInfo(int ipVisitId, int billingTxnId)
        {
            //if (reqType == "additional-info-discharge-receipt" && ipVisitId != 0)
            //{

            RbacDbContext _rbacDbContext = new RbacDbContext(connString);
            Func<object> func = () => GetAdditionalInfoForDischargeReceipt(ipVisitId, billingTxnId, _rbacDbContext);
            return InvokeHttpGetFunction<object>(func);
        }


        [HttpPost]
        [Route("PostBillTransaction_Unused")]
        public ActionResult PostBillTransaction_Unused()
        {
            //if (reqType == "postBillTransaction")//submit
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<object> func = () => SaveBillTransaction_Unused(ipDataString, currentUser);
            return InvokeHttpPostFunction(func);
        }


        [HttpPut]
        [Route("ReCalculateBedQuantity")]
        public ActionResult ReCalculateBedQuantity(int patientVisitId)
        {
            //if (reqType == "update-adtItems-duration")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            CoreDbContext _coreDbContext = new CoreDbContext(connString);

            Func<string> func = () => ReCalculateAndUpdateBedQuantity(patientVisitId, _coreDbContext);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("PutIpBillingTxnItems")]
        public ActionResult PutIpBillingTxnItems()
        {
            //if (reqType == "update-billtxnItem")
            //{
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string ipDataString = this.ReadPostData();

            Func<string> func = () => UpdateBillingTxnItemsOfInpatient(ipDataString, currentUser);
            return InvokeHttpPutFunction(func);
        }

        private object GetAdmittedPatientListForIpBilling()
        {

            var ipPatients = (from adm in _billingDbContext.Admissions.Include(a => a.Visit.Patient)
                              where (adm.AdmissionStatus == "admitted" && adm.IsInsurancePatient != true)
                              let deposits = _billingDbContext.BillingDeposits.Where(dep => dep.PatientId == adm.PatientId &&
                                dep.PatientVisitId == adm.PatientVisitId && dep.IsActive == true).ToList()
                              let bedInformations = (from bedinf in _billingDbContext.PatientBedInfos
                                                     where bedinf.PatientVisitId == adm.PatientVisitId && bedinf.IsActive == true
                                                     select new
                                                     {
                                                         Ward = bedinf.Ward.WardName,
                                                         BedCode = bedinf.Bed.BedCode,
                                                         BedNumber = bedinf.Bed.BedNumber,
                                                         StartedOn = bedinf.StartedOn,
                                                     }).OrderByDescending(a => a.StartedOn).FirstOrDefault()
                              let visit = adm.Visit
                              let patient = adm.Visit.Patient
                              let doc = _billingDbContext.Employee.Where(doc => doc.EmployeeId == adm.AdmittingDoctorId).Select(d => d.FullName).FirstOrDefault() ?? string.Empty
                              select new
                              {
                                  PatientId = adm.PatientId,
                                  PatientNo = patient.PatientCode,
                                  patient.PatientCode,
                                  patient.Gender,
                                  //if careofpersonPhonenumber is not empty then add "/CareOfPersonPhoneNo", else Don't add anything..
                                  PhoneNumber = patient.PhoneNumber + (String.IsNullOrEmpty(adm.CareOfPersonPhoneNo) ? "" : " / " + adm.CareOfPersonPhoneNo),
                                  VisitId = adm.PatientVisitId,
                                  IpNumber = visit.VisitCode,
                                  PatientName = patient.ShortName,
                                  FirstName = patient.FirstName,
                                  LastName = patient.LastName,
                                  MiddleName = patient.MiddleName,
                                  AdmittedDate = adm.AdmissionDate,
                                  DischargeDate = adm.AdmissionStatus == "admitted" ? adm.DischargeDate : (DateTime?)DateTime.Now,
                                  AdmittingDoctorId = adm.AdmittingDoctorId,
                                  AdmittingDoctorName = doc,
                                  DepositAdded = (deposits.Where(dep => dep.TransactionType == ENUM_DepositTransactionType.Deposit).Select(a => a.InAmount).DefaultIfEmpty(0).Sum()), // "deposit"

                                  DepositReturned = (deposits.Where(dep =>
                                                 (dep.TransactionType.ToLower() != ENUM_DepositTransactionType.Deposit)
                                                 ).Select(a => a.OutAmount).DefaultIfEmpty(0).Sum()),

                                  BedInformation = bedInformations,
                                  DateOfBirth = patient.DateOfBirth
                              }).ToList();

            return ipPatients.OrderByDescending(a => a.AdmittedDate);

        }

        private object GetPendingBillItemsofInPatient(int patientId, int ipVisitId)
        {
            //Sanjit / Dinesh :We need to check the items with the Itemid as well as servicedepartmentid
            var BedServiceDepartmentId = _billingDbContext.AdminParameters.AsNoTracking().Where(a => a.ParameterGroupName == "ADT" && a.ParameterName == "Bed_Charges_SevDeptId").FirstOrDefault().ParameterValue;
            var intbedservdeptid = Convert.ToInt64(BedServiceDepartmentId);
            //Check if we can apply ipVisitId condition here.. 
            var pendingItems = _billingDbContext.BillingTransactionItems.Where(itm => itm.PatientId == patientId
                                          && itm.BillStatus == ENUM_BillingStatus.provisional //"provisional" //&& itm.Quantity > 0
                                          && itm.BillingType == ENUM_BillingType.inpatient
                                          && itm.PatientVisitId == ipVisitId
                                          && itm.IsInsurance == false).AsEnumerable().ToList(); //Excluding insurance items



            var bedInfoListByVisitId = (from bedInfo in _billingDbContext.PatientBedInfos.AsNoTracking()
                                        where bedInfo.PatientVisitId == ipVisitId
                                        select bedInfo).OrderBy(x => x.PatientBedInfoId).ToList();

            var bedPatInfo = bedInfoListByVisitId.LastOrDefault();
           
            DateTime admDate = _billingDbContext.Admissions.AsNoTracking().Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId && a.PatientId == bedPatInfo.PatientId).Select(a => a.AdmissionDate).FirstOrDefault();
            var tempTime = admDate.TimeOfDay;
            var EndDateTime = DateTime.Now.Date + tempTime;
            TimeSpan qty;
            var checkBedFeatureId = bedInfoListByVisitId.Where(a => a.PatientVisitId == bedPatInfo.PatientVisitId
                              && a.PatientId == bedPatInfo.PatientId
                              && bedPatInfo.BedFeatureId == a.BedFeatureId).Select(a => a.BedFeatureId).ToList();
            var bedChargesServiceDepartment = _billingDbContext.ServiceDepartment.FirstOrDefault(a => a.ServiceDepartmentName == "Bed Charges"); //BedCharges is hardcoded here.
            int bedServiceDepartmentId = bedChargesServiceDepartment != null ? bedChargesServiceDepartment.ServiceDepartmentId : 0;
            List<BillingTransactionItemModel> repeatingTxnItms = new List<BillingTransactionItemModel>();
            pendingItems.ForEach(itm =>
            {
                var item = _billingDbContext.AdtAutoBillingItems.FirstOrDefault(a => a.ServiceItemId == itm.ServiceItemId && a.SchemeId == itm.DiscountSchemeId && a.BedFeatureId == bedPatInfo.BedFeatureId);
                if (item != null && item.IsRepeatable == true && itm.ServiceDepartmentId != bedServiceDepartmentId && itm.IsAutoCalculationStop == false)
                {
                    var totalDays = DateTime.Today.Subtract(itm.CreatedOn.Date).Days;
                    if (DateTime.Today == itm.CreatedOn.Date)
                    {
                        itm.Quantity = 1;
                    }
                    else
                    {
                        itm.Quantity = totalDays;
                    }
                    itm.SubTotal = (itm.Quantity * itm.Price);
                    itm.DiscountAmount = (itm.DiscountPercent * itm.SubTotal) / 100;
                    itm.TotalAmount = itm.SubTotal - itm.DiscountAmount;
                    if (itm.IsCoPayment)
                    {
                        itm.CoPaymentCashAmount = (itm.CoPaymentCashPercent * (decimal)itm.TotalAmount) / 100;
                        itm.CoPaymentCreditAmount = (decimal)itm.TotalAmount - itm.CoPaymentCashAmount;

                    }
                    repeatingTxnItms.Add(itm);
                    _billingDbContext.BillingTransactionItems.Attach(itm);
                    if (itm.IsCoPayment)
                    {
                        _billingDbContext.Entry(itm).Property(a => a.CoPaymentCashAmount).IsModified = true;
                        _billingDbContext.Entry(itm).Property(a => a.CoPaymentCreditAmount).IsModified = true;
                    }
                    _billingDbContext.Entry(itm).Property(a => a.Quantity).IsModified = true;
                    _billingDbContext.Entry(itm).Property(a => a.SubTotal).IsModified = true;
                    _billingDbContext.Entry(itm).Property(a => a.DiscountAmount).IsModified = true;
                    _billingDbContext.Entry(itm).Property(a => a.TotalAmount).IsModified = true;
                    _billingDbContext.SaveChanges();
                }
                //Krishna, 16thJune'23 Removing below logic as we are updating Bed Quantity from another method.
                //Sanjit / Dinesh :Currently servicedepartment name is hardcoded we need to parameterize later through cfg parameters
                //if (itm.IntegrationItemId == bedPatInfo.BedFeatureId && itm.ServiceDepartmentId == bedServiceDepartmentId && bedPatInfo.EndedOn == null && itm.ModifiedBy == null)
                //{
                //    //var StartedOn = Convert.ToDateTime(bedPatInfo.StartedOn).Date;
                //    //int totalDays = Convert.ToInt32((DateTime.Now.Date - StartedOn).TotalDays);
                //    //itm.Quantity = itm.Quantity + totalDays;  
                //    // TimeSpan qty = DateTime.Now.Subtract(bedPatInfo.StartedOn.Value);
                //    // itm.Quantity =  (int)qty.TotalDays + itm.Quantity;
                //    itm.IsLastBed = true;
                //    if (DateTime.Now > EndDateTime)
                //    {
                //        qty = EndDateTime.Subtract((DateTime)bedPatInfo.StartedOn);
                //        //qty = bedPatInfo.StartedOn.Value.Subtract(EndDateTime);
                //        itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : (itm.Quantity = (int)qty.TotalDays + 1);
                //        if (bedPatInfo.StartedOn != EndDateTime.Date)
                //        {
                //            itm.Quantity = (DateTime.Now.TimeOfDay > EndDateTime.TimeOfDay) ? (itm.Quantity + 1) : itm.Quantity;
                //        }
                //    }
                //    else
                //    {
                //        qty = DateTime.Now.Subtract((DateTime)bedPatInfo.StartedOn);
                //        itm.Quantity = (checkBedFeatureId.Count > 1) ? ((int)qty.TotalDays + itm.Quantity + 1) : ((int)qty.TotalDays) + 1;

                //    }
                //}
            });

            if (repeatingTxnItms.Count > 0)
            {
            _billingDbContext.SaveChanges();
            }

            pendingItems = pendingItems.Where(r => r.Quantity > 0).ToList();

            var srvDeptIdsList = pendingItems.Select(p => p.ServiceDepartmentId).ToList();
            var billItemIdsList = pendingItems.Select(p => p.IntegrationItemId).ToList();

            var serviceIntegrationDetail = (from itm in _billingDbContext.BillServiceItems.AsNoTracking()
                                            join srv in _billingDbContext.ServiceDepartment.AsNoTracking() on itm.ServiceDepartmentId equals srv.ServiceDepartmentId
                                            where srvDeptIdsList.Contains(itm.ServiceDepartmentId) && billItemIdsList.Contains(itm.IntegrationItemId)
                                            select new
                                            {
                                                ItemIntegrationName = itm.IntegrationName,
                                                SrvIntegrationName = srv.IntegrationName,
                                                ServiceDepartmentId = srv.ServiceDepartmentId,
                                                IntegrationItemId = itm.IntegrationItemId
                                            }).ToList();
            //update integrationName and integrationServiceDepartmentName
            //required while updating quantity of ADT items.
            pendingItems.ForEach(penItem =>
            {
                var itemIntegrationDetail = (from itm in serviceIntegrationDetail
                                             where itm.ServiceDepartmentId == penItem.ServiceDepartmentId && itm.IntegrationItemId == penItem.IntegrationItemId
                                             select new
                                             {
                                                 ItemIntegrationName = itm.ItemIntegrationName,
                                                 SrvIntegrationName = itm.SrvIntegrationName
                                             }).FirstOrDefault();

                if (itemIntegrationDetail != null)
                {
                    penItem.ItemIntegrationName = itemIntegrationDetail.ItemIntegrationName;
                    penItem.SrvDeptIntegrationName = itemIntegrationDetail.SrvIntegrationName;
                }

                //sud:30Apr'20 Clearing ServiceDepartment Object from PendingItems list.. which is not needed.. and creating heavy data..
                penItem.ServiceDepartment = null;
            });

            var admInfo = (from pat in _billingDbContext.Patient.AsNoTracking()
                           where pat.PatientId == patientId
                           join adm in _billingDbContext.Admissions.AsNoTracking()
                           on pat.PatientId equals adm.PatientId
                           where adm.PatientVisitId == ipVisitId
                           join vis in _billingDbContext.Visit.AsNoTracking()
                           on adm.PatientVisitId equals vis.PatientVisitId
                           let docName = _billingDbContext.Employee.Where(emp => emp.EmployeeId == adm.AdmittingDoctorId).Select(s => s.FullName).FirstOrDefault() ?? string.Empty
                           let depositDetails = _billingDbContext.BillingDeposits.Where(dep => dep.PatientId == pat.PatientId && dep.IsActive == true).Select(d => d).ToList()
                           let bedDetails = (from bedInfos in _billingDbContext.PatientBedInfos
                                             join bedFeature in _billingDbContext.BedFeatures on bedInfos.BedFeatureId equals bedFeature.BedFeatureId
                                             join bed in _billingDbContext.Beds on bedInfos.BedId equals bed.BedId
                                             join ward in _billingDbContext.Wards on bed.WardId equals ward.WardId
                                             where (bedInfos.PatientVisitId == adm.PatientVisitId)
                                             select new
                                             {
                                                 PatientBedInfoId = bedInfos.PatientBedInfoId,
                                                 BedFeatureId = bedFeature.BedFeatureId,
                                                 WardName = ward.WardName,
                                                 BedCode = bed.BedCode,
                                                 BedFeature = bedFeature.BedFeatureName,
                                                 StartDate = bedInfos.StartedOn,
                                                 EndDate = bedInfos.EndedOn,
                                                 BedPrice = bedInfos.BedPrice,
                                                 Action = bedInfos.Action,
                                                 BedId = bedInfos.BedId,
                                                 WardId = ward.WardId,
                                                 BedNumber = bed.BedNumber,
                                             }).ToList()
                           select new
                           {
                               AdmissionPatientId = adm.PatientAdmissionId,
                               PatientId = pat.PatientId,
                               PatientNo = pat.PatientCode,
                               pat.Gender,
                               pat.DateOfBirth,
                               pat.PhoneNumber,
                               VisitId = adm.PatientVisitId,
                               IpNumber = vis.VisitCode,
                               PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                               FirstName = pat.FirstName,
                               LastName = pat.LastName,
                               MiddleName = pat.MiddleName,
                               MembershipTypeId = adm.DiscountSchemeId,
                               AdmittedOn = adm.AdmissionDate,
                               DischargedOn = adm.AdmissionStatus == "admitted" ? (DateTime?)DateTime.Now : adm.DischargeDate,
                               AdmittingDoctorId = adm.AdmittingDoctorId,
                               AdmittingDoctorName = docName,
                               ProcedureType = adm.ProcedureType,
                               AdmissionCase = adm.AdmissionCase,
                               IsPoliceCase = adm.IsPoliceCase,
                               DepositAdded = (depositDetails.Where(dep => dep.TransactionType.ToLower() == ENUM_DepositTransactionType.Deposit.ToLower()).Select(a => a.InAmount).DefaultIfEmpty(0).Sum()),  //"deposit"

                               DepositReturned = (depositDetails.Where(dep =>
                                                          (dep.TransactionType.ToLower() != ENUM_DepositTransactionType.Deposit.ToLower())
                                                   ).Select(a => a.OutAmount).DefaultIfEmpty(0).Sum()),
                               DepositTxns = (depositDetails.Where(dep => dep.PatientId == pat.PatientId)).ToList(),

                               BedsInformation = bedDetails.Select(s => new
                               {
                                   PatientBedInfoId = s.PatientBedInfoId,
                                   BedId = s.BedId,
                                   WardId = s.WardId,
                                   WardName = s.WardName,
                                   BedFeatureName = s.BedFeature,
                                   BedNumber = s.BedNumber,
                                   PricePerDay = s.BedPrice,
                                   StartedOn = s.StartDate,
                                   EndedOn = s.EndDate.HasValue ? s.EndDate : DateTime.Now
                                   //NoOfHours = ((TimeSpan)((bedInfo.EndedOn.HasValue ? bedInfo.EndedOn : DateTime.Now) - bedInfo.StartedOn)).Hours,
                               }).OrderByDescending(a => a.PatientBedInfoId).FirstOrDefault(),

                               BedDetails = bedDetails.Select(s => new BedDetailVM
                               {
                                   PatientBedInfoId = s.PatientBedInfoId,
                                   BedFeatureId = s.BedFeatureId,
                                   WardName = s.WardName,
                                   BedCode = s.BedCode,
                                   BedFeature = s.BedFeature,
                                   StartDate = s.StartDate,
                                   EndDate = s.EndDate,
                                   BedPrice = (decimal)s.BedPrice,
                                   Action = s.Action,
                                   //calculated in clientSide
                                   Days = 0,
                               }).OrderByDescending(a => a.PatientBedInfoId).ToList()
                           }).FirstOrDefault();


            var pharmacyPendingBillItems = (from invoice in _billingDbContext.PHRMInvoiceTransactionModels
                                            join invtxnitem in _billingDbContext.PHRMInvoiceTransactionItems on invoice.InvoiceId equals invtxnitem.InvoiceId
                                            join emp in _billingDbContext.Employee on invtxnitem.CreatedBy equals emp.EmployeeId
                                            where invoice.PatientId == patientId && invoice.PatientVisitId == ipVisitId && invtxnitem.BilItemStatus == ENUM_BillingStatus.unpaid
                                            select new
                                            {
                                                InvoiceItemId = invtxnitem.InvoiceItemId,
                                                ItemId = invtxnitem.ItemId,
                                                ItemName = invtxnitem.ItemName,
                                                BatchNo = invtxnitem.BatchNo,
                                                Quantity = invtxnitem.Quantity,
                                                SalePrice = invtxnitem.SalePrice,
                                                Price = invtxnitem.Price,
                                                TotalDisAmt = invtxnitem.TotalDisAmt,
                                                SubTotal = invtxnitem.SubTotal,
                                                TotalAmount = invtxnitem.TotalAmount,
                                                ExpiryDate = invtxnitem.ExpiryDate,
                                                CreatedOn = invtxnitem.CreatedOn,
                                                CounterId = invtxnitem.CounterId,
                                                StoreId = invtxnitem.StoreId,
                                                PrescriberId = invtxnitem.PrescriberId,
                                                PriceCategoryId = invtxnitem.PriceCategoryId,
                                                User = emp.FullName
                                            }).ToList();

            decimal TotalPharmacyCreditAmount = _pharmacyDbContext.PHRMInvoiceTransaction
                                      .Where(bill => bill.PatientId == patientId && bill.PatientVisitId == ipVisitId && bill.BilStatus == ENUM_BillingStatus.unpaid && !bill.IsReturn)
                                      .Select(a => a.TotalAmount).DefaultIfEmpty().Sum();
            var patIpInfo = new
            {
                AdmissionInfo = admInfo,
                PendingBillItems = pendingItems,
                PharmacyPendingBillsItems = pharmacyPendingBillItems,
                PharmacyTotalAmount = TotalPharmacyCreditAmount

                //allBillItem = billItems, // sud: 30Apr'20-- These two are not needed in this list.. they're already available in client side..
                //AllEmployees = allEmployees
            };
            return patIpInfo;

        }

        //private object GetBillItemsForEstimateBill(int patientId, int ipVisitId)
        //{

        //    AdmissionDetailVM admInfo = null;
        //    PatientDetailVM patientDetail = null;
        //    List<DepositDetailVM> deposits = null;

        //    var visitNAdmission = (from visit in _billingDbContext.Visit.Include(v => v.Admission)
        //                           where visit.PatientVisitId == ipVisitId && visit.PatientId == patientId
        //                           select visit).FirstOrDefault();

        //    DataTable patBillItems = _billingDbContext.GetItemsForBillingReceipt(patientId, null, "provisional");

        //    if (visitNAdmission != null && visitNAdmission.Admission != null)
        //    {
        //        var patId = visitNAdmission.PatientId;
        //        var patVisitId = visitNAdmission.PatientVisitId;

        //        // if (billTxn != null && billTxn.ReturnStatus == false)
        //        deposits = (from deposit in _billingDbContext.BillingDeposits
        //                    where deposit.PatientId == patId &&
        //                    deposit.PatientVisitId == ipVisitId && deposit.IsActive == true
        //                    join settlement in _billingDbContext.BillSettlements on deposit.SettlementId
        //                    equals settlement.SettlementId into settlementTemp
        //                    from billSettlement in settlementTemp.DefaultIfEmpty()
        //                    select new DepositDetailVM
        //                    {
        //                        DepositId = deposit.DepositId,
        //                        IsActive = deposit.IsActive,
        //                        ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
        //                        ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
        //                        Date = deposit.CreatedOn,
        //                        Amount = deposit.Amount,
        //                        Balance = deposit.DepositBalance,
        //                        DepositType = deposit.DepositType,
        //                        ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
        //                    }).OrderBy(a => a.Date).ToList();

        //        AdmissionDbContext admDbContext = new AdmissionDbContext(connString);
        //        var admittingDocId = _billingDbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.PerformerId).Select(d => d.DepartmentId).FirstOrDefault() ?? 0;
        //        DepartmentModel dept = _billingDbContext.Departments.Where(d => d.DepartmentId == admittingDocId).FirstOrDefault();
        //        List<PatientBedInfo> patBeds = admDbContext.PatientBedInfos.Where(b => b.PatientVisitId == visitNAdmission.PatientVisitId).OrderByDescending(a => a.PatientBedInfoId).ToList();

        //        WardModel ward = null;
        //        //we're getting first ward from admission info as WardName. <needs revision>
        //        if (patBeds != null && patBeds.Count > 0)
        //        {
        //            int wardId = patBeds.ElementAt(0).WardId;
        //            ward = admDbContext.Wards.Where(w => w.WardId == wardId).FirstOrDefault();
        //        }

        //        admInfo = new AdmissionDetailVM()
        //        {
        //            AdmissionDate = visitNAdmission.Admission.AdmissionDate,
        //            DischargeDate = visitNAdmission.Admission.DischargeDate.HasValue ? visitNAdmission.Admission.DischargeDate.Value : DateTime.Now,
        //            Department = dept != null ? dept.DepartmentName : "",//need to change this and get this from ADT-Bed Info table--sud: 20Aug'18
        //            RoomType = ward != null ? ward.WardName : "",
        //            LengthOfStay = CalculateBedStayForAdmission(visitNAdmission.Admission),
        //            AdmittingDoctor = visitNAdmission.PerformerName,
        //            ProcedureType = visitNAdmission.Admission.ProcedureType
        //        };

        //        patientDetail = (from pat in _billingDbContext.Patient
        //                         join sub in _billingDbContext.CountrySubdivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
        //                         join cnty in _billingDbContext.Countries on pat.CountryId equals cnty.CountryId
        //                         join vis in _billingDbContext.Visit on pat.PatientId equals vis.PatientId
        //                         join memb in _billingDbContext.BillingSchemes on pat.MembershipTypeId equals memb.SchemeId
        //                         join munc in _billingDbContext.MunicipalityModels on pat.MunicipalityId equals munc.MunicipalityId into g
        //                         from munc in g.DefaultIfEmpty()
        //                         join patMap in _billingDbContext.PatientMapPriceCategories on pat.PatientId equals patMap.PatientId into p
        //                         from patMap in p.DefaultIfEmpty()
        //                         where pat.PatientId == visitNAdmission.PatientId
        //                         select new PatientDetailVM
        //                         {
        //                             PatientId = pat.PatientId,
        //                             PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
        //                             HospitalNo = pat.PatientCode,
        //                             DateOfBirth = pat.DateOfBirth,
        //                             Gender = pat.Gender,
        //                             Address = pat.Address,
        //                             ContactNo = pat.PhoneNumber,
        //                             InpatientNo = visitNAdmission.VisitCode,
        //                             CountryName = cnty.CountryName,
        //                             CountrySubDivision = sub.CountrySubDivisionName,
        //                             MunicipalityName = munc.MunicipalityName,
        //                             WardNumber = pat.WardNumber,
        //                             PANNumber = pat.PANNumber,
        //                             Ins_NshiNumber = pat.Ins_NshiNumber,
        //                             ClaimCode = visitNAdmission.ClaimCode,
        //                             MembershipTypeName = memb.SchemeName,
        //                             SSFPolicyNo = (patMap != null && patMap.PolicyNo != null && memb.SchemeName == "SSF") ? patMap.PolicyNo : "",     //Returning PolicyNo as SSFPolicyNo for SSF Patient
        //                             PolicyNo = (patMap != null && patMap.PolicyNo != null) ? patMap.PolicyNo : "",    //Returning PolicyNo as PolicyNo for ECHS Patient
        //                         }).FirstOrDefault();

        //    }

        //    var estimateBillInfo = new
        //    {
        //        AdmissionInfo = admInfo,
        //        DepositInfo = deposits,
        //        PatientDetail = patientDetail,
        //        BillItems = patBillItems
        //    };

        //    return estimateBillInfo;


        //}

        private object GetAdditionalInfoForDischargeReceipt(int ipVisitId, int billingTxnId, RbacDbContext _rbacDbContext)
        {
            AdmissionDetailVM admInfo = null;
            PatientDetailVM patientDetail = null;
            List<DepositDetailVM> deposits = null;
            BillingTransactionDetailVM billingTxnDetail = null;

            var visitNAdmission = (from visit in _billingDbContext.Visit.Include(v => v.Admission)
                                   where visit.PatientVisitId == ipVisitId
                                   select visit).FirstOrDefault();
            if (visitNAdmission != null && visitNAdmission.Admission != null)
            {
                var patId = visitNAdmission.PatientId;
                var patVisitId = visitNAdmission.PatientVisitId;
                ////invoice is not generated till then IsCurrent is false :: 18th Dec '18
                //bool isCurrent = billingTxnId != null ? false : true;
                var billTxn = _billingDbContext.BillingTransactions.Where(a => a.BillingTransactionId == billingTxnId).FirstOrDefault();

                if (billTxn != null && billTxn.ReturnStatus == false)
                {
                    deposits = (from deposit in _billingDbContext.BillingDeposits
                                where deposit.PatientId == patId &&
                                deposit.PatientVisitId == ipVisitId && deposit.TransactionType != ENUM_DepositTransactionType.DepositCancel && //"depositcancel" &&
                                deposit.IsActive == true
                                join settlement in _billingDbContext.BillSettlements on deposit.SettlementId
                                equals settlement.SettlementId into settlementTemp
                                from billSettlement in settlementTemp.DefaultIfEmpty()
                                select new DepositDetailVM
                                {
                                    DepositId = deposit.DepositId,
                                    IsActive = deposit.IsActive,
                                    ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                    ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                                    Date = deposit.CreatedOn,
                                    //Amount = deposit.Amount,
                                    InAmount = deposit.InAmount,
                                    OutAmount = deposit.OutAmount,
                                    Balance = deposit.DepositBalance,
                                    TransactionType = deposit.TransactionType,
                                    ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                                }).OrderBy(a => a.Date).ToList();
                }
                else
                {
                    deposits = (from deposit in _billingDbContext.BillingDeposits
                                where deposit.PatientId == patId &&
                                deposit.PatientVisitId == ipVisitId && deposit.IsActive == true

                                //
                                //((deposit.IsActive == true && deposit.DepositType == ENUM_BillDepositType.Deposit) // "Deposit")
                                //    || (deposit.BillingTransactionId == billingTxnId &&
                                //         (deposit.DepositType == ENUM_BillDepositType.DepositDeduct || deposit.DepositType == ENUM_BillDepositType.ReturnDeposit))
                                // )
                                join settlement in _billingDbContext.BillSettlements on deposit.SettlementId
                                equals settlement.SettlementId into settlementTemp
                                from billSettlement in settlementTemp.DefaultIfEmpty()
                                select new DepositDetailVM
                                {
                                    DepositId = deposit.DepositId,
                                    IsActive = deposit.IsActive,
                                    ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                    ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                                    Date = deposit.CreatedOn,
                                    InAmount = deposit.InAmount,
                                    OutAmount = deposit.OutAmount,
                                    Balance = deposit.DepositBalance,
                                    TransactionType = deposit.TransactionType,
                                    ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                                }).OrderBy(a => a.Date).ToList();
                }
                //dischDetail.AdmissionInfo.AdmittingDoctor = "Dr. Anil Shakya";

                AdmissionDbContext admDbContext = new AdmissionDbContext(connString);
                var admittingDocId = _billingDbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.PerformerId).Select(d => d.DepartmentId).FirstOrDefault() ?? 0;
                DepartmentModel dept = _billingDbContext.Departments.Where(d => d.DepartmentId == admittingDocId).FirstOrDefault();
                List<PatientBedInfo> patBeds = admDbContext.PatientBedInfos.Where(b => b.PatientVisitId == visitNAdmission.PatientVisitId).OrderByDescending(a => a.PatientBedInfoId).ToList();

                WardModel ward = null;
                //we're getting first ward from admission info as WardName. <needs revision>
                if (patBeds != null && patBeds.Count > 0)
                {
                    int wardId = patBeds.ElementAt(0).WardId;
                    ward = admDbContext.Wards.Where(w => w.WardId == wardId).FirstOrDefault();
                }

                admInfo = new AdmissionDetailVM()
                {
                    AdmissionDate = visitNAdmission.Admission.AdmissionDate,
                    DischargeDate = visitNAdmission.Admission.DischargeDate.HasValue ? visitNAdmission.Admission.DischargeDate.Value : DateTime.Now,
                    Department = dept != null ? dept.DepartmentName : "",//need to change this and get this from ADT-Bed Info table--sud: 20Aug'18
                    RoomType = ward != null ? ward.WardName : "",
                    LengthOfStay = CalculateBedStayForAdmission(visitNAdmission.Admission),
                    AdmittingDoctor = visitNAdmission.PerformerName,
                    ProcedureType = visitNAdmission.Admission.ProcedureType
                };

                patientDetail = (from pat in _billingDbContext.Patient
                                 join sub in _billingDbContext.CountrySubdivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
                                 where pat.PatientId == visitNAdmission.PatientId
                                 select new PatientDetailVM
                                 {
                                     PatientId = pat.PatientId,
                                     PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                     HospitalNo = pat.PatientCode,
                                     DateOfBirth = pat.DateOfBirth,
                                     Gender = pat.Gender,
                                     Address = pat.Address,
                                     ContactNo = pat.PhoneNumber,
                                     InpatientNo = visitNAdmission.VisitCode,
                                     CountrySubDivision = sub.CountrySubDivisionName,
                                     PANNumber = pat.PANNumber,
                                     Ins_NshiNumber = pat.Ins_NshiNumber,
                                     ClaimCode = visitNAdmission.ClaimCode
                                 }).FirstOrDefault();


            }

            //ashim: 14Sep2018 : BillingDetail for Discharge Bill

            billingTxnDetail = (from bil in _billingDbContext.BillingTransactions
                                join emp in _billingDbContext.Employee on bil.CreatedBy equals emp.EmployeeId
                                join fiscalYear in _billingDbContext.BillingFiscalYears on bil.FiscalYearId equals fiscalYear.FiscalYearId
                                where bil.BillingTransactionId == billingTxnId
                                select new BillingTransactionDetailVM
                                {
                                    FiscalYear = fiscalYear.FiscalYearFormatted,
                                    ReceiptNo = bil.InvoiceNo,
                                    InvoiceNumber = bil.InvoiceCode + bil.InvoiceNo.ToString(),
                                    BillingDate = bil.CreatedOn,
                                    PaymentMode = bil.PaymentMode,
                                    //DepositBalance = bil.DepositBalance + bil.DepositReturnAmount,
                                    CreatedBy = bil.CreatedBy,
                                    //DepositDeductAmount = bil.DepositReturnAmount,
                                    TotalAmount = bil.TotalAmount,
                                    Discount = bil.DiscountAmount,
                                    SubTotal = bil.SubTotal,
                                    Quantity = bil.TotalQuantity,
                                    User = "",
                                    Remarks = bil.Remarks,
                                    PrintCount = bil.PrintCount,
                                    ReturnStatus = bil.ReturnStatus,
                                    OrganizationId = bil.OrganizationId,
                                    ExchangeRate = bil.ExchangeRate,
                                    Tender = bil.Tender,
                                    Change = bil.Change,
                                    IsInsuranceBilling = bil.IsInsuranceBilling,
                                    LabTypeName = bil.LabTypeName,
                                    //sud:11May'21--New fields added in billingTransaction table.
                                    DepositAvailable = bil.DepositAvailable,
                                    DepositUsed = bil.DepositUsed,
                                    DepositReturnAmount = bil.DepositReturnAmount,
                                    DepositBalance = bil.DepositBalance

                                }).FirstOrDefault();
            if (billingTxnDetail != null)
            {
                billingTxnDetail.User = _rbacDbContext.Users.Where(usr => usr.EmployeeId == billingTxnDetail.CreatedBy).Select(a => a.UserName).FirstOrDefault();
                if (billingTxnDetail.OrganizationId != null)
                {
                    billingTxnDetail.OrganizationName = _billingDbContext.CreditOrganization.Where(a => a.OrganizationId == billingTxnDetail.OrganizationId).Select(b => b.OrganizationName).FirstOrDefault();
                }
            }


            var dischargeBillInfo = new
            {
                AdmissionInfo = admInfo,
                DepositInfo = deposits,
                BillingTxnDetail = billingTxnDetail,
                PatientDetail = patientDetail
            };

            return dischargeBillInfo;


        }

        private object SaveBillTransaction_Unused(string ipDataString, RbacUser currentUser)
        {

            DateTime currentDate = DateTime.Now;
            BillingTransactionModel billTransaction = DanpheJSONConvert.DeserializeObject<BillingTransactionModel>(ipDataString);
            bool transactionSuccess = false;
            if (billTransaction != null)
            {
                //Discharge is Valid only if patient is currently in admitted state.
                if (BillingTransactionBL.IsValidForDischarge(billTransaction.PatientId, billTransaction.PatientVisitId, _billingDbContext))
                {
                    //Transaction Begins  
                    using (var dbContextTransaction = _billingDbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            //step:1 -- make copy of billingTxnItems into new list, so thate EF doesn't add txn items again.
                            //step:2-- if there's deposit deduction, then add to deposit table.
                            billTransaction = BillingTransactionBL.PostBillingTransaction(_billingDbContext, connString, null, billTransaction, currentUser, currentDate);

                            //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                            if (billTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                                && billTransaction.DepositReturnAmount != null && billTransaction.DepositReturnAmount > 0)
                            {
                                BillingDepositModel dep = new BillingDepositModel()
                                {
                                    TransactionType = ENUM_DepositTransactionType.ReturnDeposit, // "ReturnDeposit",
                                    Remarks = "Deposit Refunded from InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                                    //Remarks = "ReturnDeposit" + " for transactionid:" + billTransaction.BillingTransactionId,
                                    //Amount = billTransaction.DepositReturnAmount,
                                    OutAmount = (decimal)billTransaction.DepositReturnAmount,
                                    IsActive = true,
                                    BillingTransactionId = billTransaction.BillingTransactionId,
                                    DepositBalance = 0,
                                    FiscalYearId = billTransaction.FiscalYearId,
                                    CounterId = billTransaction.CounterId,
                                    CreatedBy = billTransaction.CreatedBy,
                                    CreatedOn = currentDate,
                                    PatientId = billTransaction.PatientId,
                                    PatientVisitId = billTransaction.PatientVisitId,
                                    PaymentMode = billTransaction.PaymentMode,
                                    PaymentDetails = billTransaction.PaymentDetails,
                                    //ReceiptNo = BillingBL.GetDepositReceiptNo(connString)

                                };
                                if (billTransaction.ReceiptNo == null)
                                {
                                    dep.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                                }
                                else
                                {
                                    dep.ReceiptNo = billTransaction.ReceiptNo;
                                }


                                _billingDbContext.BillingDeposits.Add(dep);
                                _billingDbContext.SaveChanges();

                                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                                empCashTransaction.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                                empCashTransaction.ReferenceNo = dep.DepositId;
                                empCashTransaction.InAmount = 0;
                                empCashTransaction.OutAmount = (double)dep.OutAmount;
                                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                                //empCashTransaction.Description = billingTransaction.de;
                                empCashTransaction.TransactionDate = DateTime.Now;
                                empCashTransaction.CounterID = dep.CounterId;
                                empCashTransaction.PatientId = dep.PatientId;
                                empCashTransaction.ModuleName = "Billing";
                                empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                                BillingBL.AddEmpCashTransaction(_billingDbContext, empCashTransaction);
                            }

                            //For cancel BillingTransactionItems
                            List<BillingTransactionItemModel> item = (from itm in _billingDbContext.BillingTransactionItems
                                                                      where itm.PatientId == billTransaction.PatientId && itm.PatientVisitId == billTransaction.PatientVisitId && itm.BillStatus == "provisional" && itm.Quantity == 0
                                                                      select itm).ToList();
                            if (item.Count() > 0)
                            {
                                item.ForEach(itm =>
                                {
                                    var txnItem = BillingTransactionBL.UpdateTxnItemBillStatus(_billingDbContext, itm, "adtCancel", currentUser, currentDate, billTransaction.CounterId, null);
                                });
                            }

                            if (realTimeRemoteSyncEnabled)
                            {
                                if (billTransaction.Patient == null)
                                {
                                    PatientModel pat = _billingDbContext.Patient.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                                    billTransaction.Patient = pat;
                                }
                                //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                                //BillingBL.SyncBillToRemoteServer(billTransaction, "sales", billingDbContext);
                                Task.Run(() => BillingBL.SyncBillToRemoteServer(billTransaction, "sales", _billingDbContext));

                            }

                            var allPatientBedInfos = (from bedInfos in _billingDbContext.PatientBedInfos
                                                      where bedInfos.PatientVisitId == billTransaction.PatientVisitId
                                                      && bedInfos.IsActive == true
                                                      select bedInfos
                                                      ).OrderByDescending(a => a.PatientBedInfoId).Take(2).ToList();

                            if (allPatientBedInfos.Count > 0)
                            {
                                allPatientBedInfos.ForEach(bed =>
                                {
                                    var b = _billingDbContext.Beds.FirstOrDefault(fd => fd.BedId == bed.BedId);
                                    if (b != null)
                                    {
                                        b.OnHold = false;
                                        b.HoldedOn = null;
                                        _billingDbContext.Entry(b).State = EntityState.Modified;
                                        _billingDbContext.Entry(b).Property(x => x.OnHold).IsModified = true;
                                        _billingDbContext.Entry(b).Property(x => x.HoldedOn).IsModified = true;
                                        _billingDbContext.SaveChanges();
                                    }
                                });
                            }

                            dbContextTransaction.Commit();
                            transactionSuccess = true;

                        }
                        catch (Exception ex)
                        {
                            transactionSuccess = false;
                            //rollback all changes if any error occurs
                            dbContextTransaction.Rollback();
                            throw ex;
                        }
                    }

                    if (transactionSuccess)
                    {
                        //Starts: This code is for Temporary solution for Checking and Updating the Invoice Number if there is duplication Found
                        List<SqlParameter> paramList = new List<SqlParameter>() {
                                    new SqlParameter("@fiscalYearId", billTransaction.FiscalYearId),
                                    new SqlParameter("@billingTransactionId", billTransaction.BillingTransactionId),
                                    new SqlParameter("@invoiceNumber", billTransaction.InvoiceNo)
                                };

                        DataSet dataFromSP = DALFunctions.GetDatasetFromStoredProc("SP_BIL_Update_Duplicate_Invoice_If_Exists", paramList, _billingDbContext);
                        var data = new List<object>();
                        if (dataFromSP.Tables.Count > 0)
                        {
                            billTransaction.InvoiceNo = Convert.ToInt32(dataFromSP.Tables[0].Rows[0]["LatestInvoiceNumber"].ToString());
                        }
                        //Ends
                        return billTransaction;
                    }
                    else
                    {
                        throw new Exception("Post Transaction Failed. Please try again.");
                    }

                }
                else
                {
                    throw new Exception("Patient is already discharged.");
                }
            }
            else
            {
                throw new Exception("billTransaction is invalid");
            }

        }

        private string ReCalculateAndUpdateBedQuantity(int patientVisitId, CoreDbContext coreDbContext)
        {

            //bool isAutoAddBedItems = CommonFunctions.GetCoreParameterValueByKeyName_Boolean(coreDbContext, "ADT", "AutoAddBillingItems", "DoAutoAddBedItem");
            //if (isAutoAddBedItems)
            //{

                //get all bed item billing transaction items
                var allBedItemsOfPatientByVisit = _billingDbContext.BillingTransactionItems.Where(b => (b.PatientVisitId == patientVisitId)
                                                    && (b.ServiceDepartment.IntegrationName.ToLower() == "bed charges") && (b.BillStatus.ToLower() == "provisional")
                                                    ).OrderBy(o => o.RequisitionDate).AsEnumerable();


                //if there are bedItems in billing transaction item table
                if ((allBedItemsOfPatientByVisit != null) && allBedItemsOfPatientByVisit.Any())
                {
                    //get all the BedInfo rows for that visit
                    var allBedInfoOfPatient = _billingDbContext.PatientBedInfos.AsNoTracking().Where(b => b.IsActive && (b.PatientVisitId == patientVisitId))
                                                .Select(d => new
                                                {
                                                    StartedOn = DbFunctions.TruncateTime(d.StartedOn),
                                                    StartedOnDateTime = d.StartedOn,
                                                    d.EndedOn,
                                                    d.BedFeatureId,
                                                    d.PatientBedInfoId
                                                }).OrderBy(o => o.StartedOn).ToList();

                    if ((allBedInfoOfPatient != null) && (allBedInfoOfPatient.Count > 0))
                    {
                        //Krishna, 16thJune'23, Replacing below logic with new logic.
                        //var bedDataGroupedByStartDate = (from b in allBedInfoOfPatient
                        //                                 group b by b.StartedOn into v
                        //                                 select new
                        //                                 {
                        //                                     StartDate = v.Key,
                        //                                     Data = v.OrderBy(d => d.StartedOnDateTime).ToList()
                        //                                 }).OrderBy(o => o.StartDate).ToList();

                        //var bedInfoListOfPreviousDay = bedDataGroupedByStartDate[0].Data;
                        //var finalBedOfPreviousDay = bedInfoListOfPreviousDay[bedInfoListOfPreviousDay.Count - 1];
                        //var bedWithDaysCount = allBedInfoOfPatient.Select(s => s.BedFeatureId).Distinct().ToDictionary(k => k, v => 0);

                        //if (bedDataGroupedByStartDate.Count > 1)
                        //{
                        //    for (int i = 1; i < bedDataGroupedByStartDate.Count; i++)
                        //    {
                        //        //take the last bed for the previous day
                        //        bedInfoListOfPreviousDay = bedDataGroupedByStartDate[i - 1].Data;
                        //        finalBedOfPreviousDay = bedInfoListOfPreviousDay[bedInfoListOfPreviousDay.Count - 1];

                        //        //take the last bed for the current day
                        //        var bedInfoListOfCurrentDay = bedDataGroupedByStartDate[i].Data;
                        //        var finalBedOfCurrentDay = bedInfoListOfCurrentDay[bedInfoListOfCurrentDay.Count - 1];

                        //        var diffInDays = 0;

                        //        //if previous day and current day both have same BedFeature
                        //        if (finalBedOfPreviousDay.BedFeatureId == finalBedOfCurrentDay.BedFeatureId)
                        //        {
                        //            bedWithDaysCount[finalBedOfPreviousDay.BedFeatureId] += (finalBedOfCurrentDay.StartedOn.Value - finalBedOfPreviousDay.StartedOn.Value).Days;
                        //            if ((i + 1) == bedDataGroupedByStartDate.Count)
                        //            {
                        //                bedWithDaysCount[finalBedOfPreviousDay.BedFeatureId] += (System.DateTime.Now.Date - finalBedOfCurrentDay.StartedOn.Value).Days;
                        //            }
                        //        }
                        //        else //if previous day and current day both have different BedFeature
                        //        {
                        //            diffInDays = (System.DateTime.Now - finalBedOfCurrentDay.StartedOn.Value).Days;
                        //            bedWithDaysCount[finalBedOfPreviousDay.BedFeatureId] += (finalBedOfCurrentDay.StartedOn.Value - finalBedOfPreviousDay.StartedOn.Value).Days;

                        //            //if new bed started today
                        //            if (finalBedOfCurrentDay.StartedOn.Value.Date == System.DateTime.Now.Date)
                        //            {
                        //                bedWithDaysCount[finalBedOfCurrentDay.BedFeatureId] = 1;
                        //            }
                        //            else
                        //            {
                        //                //bedWithDaysCount[finalBedOfCurrentDay.BedFeatureId] += (finalBedOfCurrentDay.StartedOn.Value - finalBedOfPreviousDay.StartedOn.Value).Days;
                        //                if ((i + 1) == bedDataGroupedByStartDate.Count)
                        //                {
                        //                    bedWithDaysCount[finalBedOfCurrentDay.BedFeatureId] += (System.DateTime.Now.Date - finalBedOfCurrentDay.StartedOn.Value).Days;
                        //                }
                        //            }
                        //        }
                        //    }
                        //}
                        //else
                        //{
                        //    if (finalBedOfPreviousDay.StartedOn.Value.Date == System.DateTime.Now.Date)
                        //    {
                        //        bedWithDaysCount[finalBedOfPreviousDay.BedFeatureId] = 1;
                        //    }
                        //    else
                        //    {
                        //        var daysDiff = (System.DateTime.Now - finalBedOfPreviousDay.StartedOn.Value).Days;
                        //        bedWithDaysCount[finalBedOfPreviousDay.BedFeatureId] = daysDiff;
                        //    }

                        //}

                        //sud/Krishna: 19thJan'23--- rewrite the calculation logic..
                        //get all the BedInfo rows for that visit
                        var patientBedInfos = _billingDbContext.PatientBedInfos.AsNoTracking()
                                        .Where(b => b.IsActive && (b.PatientVisitId == patientVisitId))
                                       .Select(b => b).ToList();

                        var bedWithDaysCount = CalculateBedCounts(patientBedInfos);

                        foreach (var dictItem in bedWithDaysCount.Keys)
                        {
                            var billItem = allBedItemsOfPatientByVisit.Where(d => d.IntegrationItemId == dictItem).FirstOrDefault();
                            if (allBedItemsOfPatientByVisit != null && billItem != null)
                            {
                                var amount = bedWithDaysCount[dictItem];
                                billItem.Quantity = amount;
                                billItem.SubTotal = billItem.Price * amount;
                                billItem.DiscountAmount = ((billItem.DiscountPercent) / 100) * billItem.SubTotal;
                                billItem.TotalAmount = billItem.SubTotal - (billItem.DiscountAmount);
                                _billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
                                _billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
                                _billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
                                _billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
                                _billingDbContext.SaveChanges();
                            }
                        }
                    }
                }
                else
                {
                    return "No bed items are there in BillingTransacitonItm for current visit.";
                }
            //}
            //else
            //{
            //    return "AutoAddBedItems is Not enabled in the system.";
            //}

            return "Bed quantity updated successfully.";

        }

        private string UpdateBillingTxnItemsOfInpatient(string ipDataString, RbacUser currentUser)
        {

            List<BillingTransactionItemModel> txnItems = DanpheJSONConvert.DeserializeObject<List<BillingTransactionItemModel>>(ipDataString);
            if (txnItems != null)
            {
                txnItems.ForEach(item =>
                {
                    item.ModifiedBy = currentUser.EmployeeId;
                    //sud:12Jan'23--Note!!-- Below BLFunction is saving to database, so don't use this in LOOP, rather write a separate function if needed be.
                    BillingTransactionBL.UpdateBillingTransactionItems(_billingDbContext, item);
                });
                return "Billing items updated successfully.";
            }
            else
            {
                return "Billing items Not found to update.";
            }

        }


        /// <summary>
        /// This is to track the Discount History for the IP Billing , Krishna,21JAN'22
        /// </summary>
        /// <returns></returns>
        #region This gets triggered from IP Billing > View Details page : Membership changed action, Item Level Discount change, and Invoice Discount Percent change..
        [HttpPut]
        [Route("UpdateDiscounts")]
        public async Task<string> UpdateDiscounts()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types

            try
            {
                string ipData = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                IPBillingDiscount_DTO iPBillingDiscountModel = DanpheJSONConvert.DeserializeObject<IPBillingDiscount_DTO>(ipData);

                var patient = await billingDbContext.Admissions.Where(a => a.PatientVisitId == iPBillingDiscountModel.PatientVisitId).FirstOrDefaultAsync();
                if (patient != null)
                {
                    patient.DiscountSchemeId = iPBillingDiscountModel.DiscountSchemeId;
                    patient.ProvisionalDiscPercent = iPBillingDiscountModel.ProvisionalDiscPercent;
                    patient.IsItemDiscountEnabled = iPBillingDiscountModel.IsItemDiscountEnabled;
                    patient.ModifiedBy = currentUser.EmployeeId;
                    patient.ModifiedOn = DateTime.Now;

                    billingDbContext.Entry(patient).Property(b => b.DiscountSchemeId).IsModified = true;
                    billingDbContext.Entry(patient).Property(b => b.ProvisionalDiscPercent).IsModified = true;
                    billingDbContext.Entry(patient).Property(b => b.IsItemDiscountEnabled).IsModified = true;
                    billingDbContext.Entry(patient).Property(b => b.ModifiedBy).IsModified = true;
                    billingDbContext.Entry(patient).Property(b => b.ModifiedOn).IsModified = true;

                }
                await billingDbContext.SaveChangesAsync();
                responseData.Status = "OK";
                responseData.Results = patient;
            }
            catch (Exception ex)
            {

                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        #endregion


        #region This is the API to Discharge a patient with post bill txn from IP billing...
        [HttpPost]
        [Route("PostBillTransactionAndDischarge")]
        public string PostBillTransactionAndDischarge()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            try
            {
                string ipDataString = this.ReadPostData();
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                BillingDbContext billingDbContext = new BillingDbContext(connString);
                DateTime currentDate = DateTime.Now;
                IpBillingTxnVM ipBillingTxnVM = DanpheJSONConvert.DeserializeObject<IpBillingTxnVM>(ipDataString);
                BillingTransactionModel billTransaction = ipBillingTxnVM.billingTransactionModel;

                if (billTransaction != null)
                {
                    if (BillingTransactionBL.IsValidForDischarge(billTransaction.PatientId, billTransaction.PatientVisitId, billingDbContext))
                    {
                        if (BillingTransactionBL.IsDepositAvailable(billingDbContext, billTransaction.PatientId, billTransaction.DepositUsed))
                        {
                            //Transaction Begins  
                            using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                            {
                                try
                                {
                                    //Start Of Post Bill Transaction...

                                    //step:1 -- make copy of billingTxnItems into new list, so thate EF doesn't add txn items again.
                                    //step:2-- if there's deposit deduction, then add to deposit table.
                                    ProceedToPostBillTransaction(billingDbContext, connString, billTransaction, currentUser, currentDate);

                                    //End Of Post Bill Transaction...

                                    //Start of Discharge Process

                                    DischargeDetailVM dischargeDetail = ipBillingTxnVM.dischargeDetailVM;
                                    dischargeDetail.BillingTransactionId = billTransaction.BillingTransactionId;
                                    dischargeDetail.BillStatus = billTransaction.BillStatus;
                                    dischargeDetail.PatientId = billTransaction.PatientId;
                                    dischargeDetail.PatientVisitId = (int)billTransaction.PatientVisitId;
                                    ProceedToDischargeFromBilling(dischargeDetail, billingDbContext, currentUser, currentDate);


                                    //End of Discharge Process
                                    dbContextTransaction.Commit();
                                    responseData.Status = "OK";
                                    responseData.Results = billTransaction;
                                }
                                catch (Exception ex)
                                {
                                    //rollback all changes if any error occurs
                                    dbContextTransaction.Rollback();
                                    throw ex;
                                }
                            }

                        }
                        else
                        {
                            responseData.Status = "Failed";
                            responseData.ErrorMessage = "Deposit Amount is Invalid";
                        }

                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Patient is already discharged.";
                    }

                }
            }
            catch (Exception ex)
            {

                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        #endregion


        #region Method to Discharge a patient from billing..
        private void ProceedToDischargeFromBilling(DischargeDetailVM dischargeDetail, BillingDbContext billingDbContext, RbacUser currentUser, DateTime currentDate)
        {
            try
            {
                AdmissionModel admission = billingDbContext.Admissions.Where(adt => adt.PatientVisitId == dischargeDetail.PatientVisitId).FirstOrDefault();

                PatientBedInfo bedInfo = billingDbContext.PatientBedInfos
                                                         .Where(bed => bed.PatientVisitId == dischargeDetail.PatientVisitId)
                                                         .OrderByDescending(bed => bed.PatientBedInfoId).FirstOrDefault();

                admission.AdmissionStatus = "discharged";
                admission.DischargeDate = dischargeDetail.DischargeDate;
                admission.BillStatusOnDischarge = dischargeDetail.BillStatus;
                admission.DischargedBy = currentUser.EmployeeId;
                admission.ModifiedBy = currentUser.EmployeeId;
                admission.ModifiedOn = DateTime.Now;
                admission.ProcedureType = dischargeDetail.ProcedureType;
                admission.DiscountSchemeId = dischargeDetail.DiscountSchemeId;
                admission.DischargeRemarks = dischargeDetail.Remarks;

                FreeBed(bedInfo.PatientBedInfoId, dischargeDetail.DischargeDate, admission.AdmissionStatus, billingDbContext);

                billingDbContext.Entry(admission).Property(a => a.DischargedBy).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.AdmissionStatus).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.DischargeDate).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.BillStatusOnDischarge).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.ProcedureType).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.DischargeRemarks).IsModified = true;
                billingDbContext.Entry(admission).Property(a => a.ModifiedBy).IsModified = true;
                billingDbContext.SaveChanges();
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region Method to post bill transaction..
        private void ProceedToPostBillTransaction(BillingDbContext billingDbContext, string connString, BillingTransactionModel billTransaction, RbacUser currentUser, DateTime currentDate)
        {
            try
            {
                billTransaction = BillingTransactionBL.PostBillingTransaction(billingDbContext, connString, null, billTransaction, currentUser, currentDate);

                //step:3-- if there's deposit balance, then add a return transaction to deposit table. 
                if (billTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                    && billTransaction.DepositReturnAmount != null && billTransaction.DepositReturnAmount > 0)
                {
                    BillingDepositModel dep = new BillingDepositModel()
                    {
                        TransactionType = ENUM_DepositTransactionType.ReturnDeposit, // "ReturnDeposit",
                        Remarks = "Deposit Refunded from InvoiceNo. " + billTransaction.InvoiceCode + billTransaction.InvoiceNo,
                        //Remarks = "ReturnDeposit" + " for transactionid:" + billTransaction.BillingTransactionId,
                        //Amount = billTransaction.DepositReturnAmount,
                        OutAmount = (decimal)billTransaction.DepositReturnAmount,
                        IsActive = true,
                        BillingTransactionId = billTransaction.BillingTransactionId,
                        DepositBalance = 0,
                        FiscalYearId = billTransaction.FiscalYearId,
                        CounterId = billTransaction.CounterId,
                        CreatedBy = billTransaction.CreatedBy,
                        CreatedOn = currentDate,
                        PatientId = billTransaction.PatientId,
                        PatientVisitId = billTransaction.PatientVisitId,
                        PaymentMode = billTransaction.PaymentMode,
                        PaymentDetails = billTransaction.PaymentDetails,
                        //ReceiptNo = BillingBL.GetDepositReceiptNo(connString)

                    };
                    if (billTransaction.ReceiptNo == null)
                    {
                        dep.ReceiptNo = BillingBL.GetDepositReceiptNo(connString);
                    }
                    else
                    {
                        dep.ReceiptNo = billTransaction.ReceiptNo;
                    }


                    billingDbContext.BillingDeposits.Add(dep);
                    billingDbContext.SaveChanges();

                    EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                    empCashTransaction.TransactionType = ENUM_DepositTransactionType.ReturnDeposit;
                    empCashTransaction.ReferenceNo = dep.DepositId;
                    empCashTransaction.InAmount = 0;
                    empCashTransaction.OutAmount = (double)dep.OutAmount;
                    empCashTransaction.EmployeeId = currentUser.EmployeeId;
                    //empCashTransaction.Description = billingTransaction.de;
                    empCashTransaction.TransactionDate = DateTime.Now;
                    empCashTransaction.CounterID = dep.CounterId;
                    empCashTransaction.PatientId = dep.PatientId;
                    empCashTransaction.ModuleName = "Billing";
                    empCashTransaction.PaymentModeSubCategoryId = GetPaymentModeSubCategoryId();
                    BillingBL.AddEmpCashTransaction(billingDbContext, empCashTransaction);

                    //For cancel BillingTransactionItems
                    /*    List<BillingTransactionItemModel> item = (from itm in billingDbContext.BillingTransactionItems
                                                                  where itm.PatientId == billTransaction.PatientId && itm.PatientVisitId == billTransaction.PatientVisitId && itm.BillStatus == "provisional" && itm.Quantity == 0
                     //For cancel BillingTransactionItems                                             select itm).ToList();*/
                    List<BillingTransactionItemModel> item = billingDbContext.BillingTransactionItems.Where(a => a.PatientId == billTransaction.PatientId
                                                                                                            && a.PatientVisitId == billTransaction.PatientVisitId
                                                                                                            && a.BillStatus == "provisional" && a.Quantity == 0).ToList();
                    if (item.Count() > 0)
                    {
                        item.ForEach(itm =>
                        {
                            var txnItem = BillingTransactionBL.UpdateTxnItemBillStatus(billingDbContext, itm, "adtCancel", currentUser, currentDate, billTransaction.CounterId, null);
                        });
                    }

                    if (realTimeRemoteSyncEnabled)
                    {
                        if (billTransaction.Patient == null)
                        {
                            PatientModel pat = billingDbContext.Patient.Where(p => p.PatientId == billTransaction.PatientId).FirstOrDefault();
                            billTransaction.Patient = pat;
                        }
                        //Sud:23Dec'18--making parallel thread call (asynchronous) to post to IRD. so that it won't stop the normal execution of logic.
                        //BillingBL.SyncBillToRemoteServer(billTransaction, "sales", billingDbContext);
                        Task.Run(() => BillingBL.SyncBillToRemoteServer(billTransaction, "sales", billingDbContext));

                    }

                    /*                                var allPatientBedInfos = (from bedInfos in billingDbContext.PatientBedInfos
                                                                              where bedInfos.PatientVisitId == billTransaction.PatientVisitId
                                                                              && bedInfos.IsActive == true
                                                                              select bedInfos
                                                                              ).OrderByDescending(a => a.PatientBedInfoId).Take(2).ToList();*/
                    //made above linq async... 
                    var allPatientBedInfos = billingDbContext.PatientBedInfos.Where(a => a.PatientVisitId == billTransaction.PatientVisitId
                                                                                    && a.IsActive == true).OrderByDescending(b => b.PatientBedInfoId)
                                                                                    .Take(2).ToList();

                    if (allPatientBedInfos.Count > 0)
                    {
                        allPatientBedInfos.ForEach(bed =>
                        {
                            var b = billingDbContext.Beds.FirstOrDefault(fd => fd.BedId == bed.BedId);
                            if (b != null)
                            {
                                b.OnHold = false;
                                b.HoldedOn = null;
                                billingDbContext.Entry(b).State = EntityState.Modified;
                                billingDbContext.Entry(b).Property(x => x.OnHold).IsModified = true;
                                billingDbContext.Entry(b).Property(x => x.HoldedOn).IsModified = true;
                                billingDbContext.SaveChanges();
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion

        #region This is used to free the occupied bed while discharging...
        private void FreeBed(int bedInfoId, DateTime? endedOn, string status, BillingDbContext billingDbContext)
        {
            try
            {
                PatientBedInfo bedInfo = billingDbContext.PatientBedInfos
                                                         .Where(b => b.PatientBedInfoId == bedInfoId)
                                                         .FirstOrDefault();
                UpdateIsOccupiedStatus(bedInfo.BedId, false, billingDbContext);
                //endedOn can get updated from Billing Edit item as well.
                if (bedInfo.EndedOn == null)
                    bedInfo.EndedOn = endedOn;

                //AdmissionModel patAdmissionInfo = dbContext.Admissions.Where(a => a.PatientId == bedInfo.PatientId && a.PatientVisitId == bedInfo.PatientVisitId).FirstOrDefault();

                if (status == "discharged")
                {
                    bedInfo.OutAction = "discharged";
                }
                else if (status == "transfer")
                {
                    bedInfo.OutAction = "transfer";
                }
                else
                {
                    bedInfo.OutAction = null;
                }

                billingDbContext.Entry(bedInfo).State = EntityState.Modified;
                billingDbContext.Entry(bedInfo).Property(x => x.CreatedOn).IsModified = false;
                billingDbContext.Entry(bedInfo).Property(x => x.StartedOn).IsModified = false;
                billingDbContext.Entry(bedInfo).Property(x => x.CreatedBy).IsModified = false;
                billingDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        #endregion

        #region This is used to update the Occupied status of a bed...
        private void UpdateIsOccupiedStatus(int bedId, bool status, BillingDbContext billingDbContext)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                BedModel selectedBed = billingDbContext.Beds
                                                       .Where(b => b.BedId == bedId)
                                                       .FirstOrDefault();
                selectedBed.IsOccupied = status;
                billingDbContext.Entry(selectedBed).State = EntityState.Modified;
                billingDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion

        #region This gets the PaymentModeSubCategoryId of Cash PaymentMode.....
        private int GetPaymentModeSubCategoryId()
        {
            var paymentModeSubCategoryId = 0;
            MasterDbContext masterDbContext = new MasterDbContext(connString);
            var paymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion

        //we're calculating days by subtracting AdmissionDate from DischargeDate
        //minimum days will be 1  <needs revision> sud: 20Aug'18
        private int CalculateBedStayForAdmission(AdmissionModel adm)
        {
            int totalDays = 1;

            if (adm != null)
            {

                DateTime admissionTime = adm.AdmissionDate;
                DateTime dischargeTime = (DateTime)(adm.DischargeDate != null ? adm.DischargeDate : DateTime.Now);

                int daysDiff = ((TimeSpan)(dischargeTime - admissionTime)).Days;
                if (daysDiff != 1)
                {
                    totalDays = daysDiff;
                }
            }
            return totalDays;
        }


        [HttpGet]
        [Route("EstimationBill")]
        public ActionResult EstimationBill(int patientId, int ipVisitId)
        {
            Func<object> func = () => GetBillingAndPharmacyItemsForEstimateBill(patientId, ipVisitId);
            return InvokeHttpGetFunction<object>(func);
        }

        private object GetBillingAndPharmacyItemsForEstimateBill(int patientId, int ipVisitId)
        {

            AdmissionDetailVM admInfo = new AdmissionDetailVM();
            PatientDetailVM patientDetail = new PatientDetailVM();
            List<DepositDetailVM> deposits = new List<DepositDetailVM>();
            List<PatientBedInfo> patientBeds = new List<PatientBedInfo>();

            var visitNAdmission = (from visit in _billingDbContext.Visit.Include(v => v.Admission)
                                   where visit.PatientVisitId == ipVisitId && visit.PatientId == patientId
                                   select visit).FirstOrDefault();

            DataTable patBillItems = _billingDbContext.GetItemsForBillingReceipt(patientId, null, "provisional");

            if (visitNAdmission != null && visitNAdmission.Admission != null)
            {
                var patId = visitNAdmission.PatientId;
                var patVisitId = visitNAdmission.PatientVisitId;
                deposits = (from deposit in _billingDbContext.BillingDeposits
                            where deposit.PatientId == patId &&
                            deposit.PatientVisitId == ipVisitId && deposit.IsActive == true
                            join settlement in _billingDbContext.BillSettlements on deposit.SettlementId
                            equals settlement.SettlementId into settlementTemp
                            from billSettlement in settlementTemp.DefaultIfEmpty()
                            select new DepositDetailVM
                            {
                                DepositId = deposit.DepositId,
                                IsActive = deposit.IsActive,
                                ReceiptNo = "DR" + deposit.ReceiptNo.ToString(),
                                ReceiptNum = deposit.ReceiptNo, //yubraj: to check whether receipt number is null or not for client side use
                                Date = deposit.CreatedOn,
                                InAmount = deposit.InAmount,
                                OutAmount = deposit.OutAmount,
                                Balance = deposit.DepositBalance,
                                TransactionType = deposit.TransactionType,
                                ReferenceInvoice = deposit.SettlementId != null ? "SR " + billSettlement.SettlementReceiptNo.ToString() : null,
                            }).OrderBy(a => a.Date).ToList();

                var admittingDocId = _billingDbContext.Employee.Where(e => e.EmployeeId == visitNAdmission.PerformerId).Select(d => d.DepartmentId).FirstOrDefault() ?? 0;
                DepartmentModel dept = _billingDbContext.Departments.Where(d => d.DepartmentId == admittingDocId).FirstOrDefault();
                patientBeds = _admissionDbContext.PatientBedInfos.Where(b => b.PatientVisitId == visitNAdmission.PatientVisitId).OrderByDescending(a => a.PatientBedInfoId).ToList();

                WardModel ward = null;

                if (patientBeds != null && patientBeds.Count > 0)
                {
                    int wardId = patientBeds.ElementAt(0).WardId;
                    ward = _admissionDbContext.Wards.Where(w => w.WardId == wardId).FirstOrDefault();
                }

                admInfo = new AdmissionDetailVM()
                {
                    AdmissionDate = visitNAdmission.Admission.AdmissionDate,
                    DischargeDate = visitNAdmission.Admission.DischargeDate.HasValue ? visitNAdmission.Admission.DischargeDate.Value : DateTime.Now,
                    Department = dept != null ? dept.DepartmentName : "",
                    RoomType = ward != null ? ward.WardName : "",
                    LengthOfStay = CalculateBedStayForAdmission(visitNAdmission.Admission),
                    AdmittingDoctor = visitNAdmission.PerformerName,
                    ProcedureType = visitNAdmission.Admission.ProcedureType
                };

                patientDetail = (from pat in _billingDbContext.Patient
                                 join patMapScheme in _billingDbContext.PatientSchemeMaps on pat.PatientId equals patMapScheme.PatientId
                                 into patSchemeGroup
                                 from patScheme in patSchemeGroup.DefaultIfEmpty()
                                 join scheme in _billingDbContext.BillingSchemes on patScheme.SchemeId equals scheme.SchemeId
                                 into patSchemeDetailsGroup
                                 from patSchemeDetails in patSchemeDetailsGroup.DefaultIfEmpty()
                                 join sub in _billingDbContext.CountrySubdivisions on pat.CountrySubDivisionId equals sub.CountrySubDivisionId
                                 join cnty in _billingDbContext.Countries on pat.CountryId equals cnty.CountryId
                                 join vis in _billingDbContext.Visit on pat.PatientId equals vis.PatientId
                                 join munc in _billingDbContext.MunicipalityModels on pat.MunicipalityId equals munc.MunicipalityId into g
                                 from munc in g.DefaultIfEmpty()
                                 where pat.PatientId == visitNAdmission.PatientId
                                 select new PatientDetailVM
                                 {
                                     PatientId = pat.PatientId,
                                     PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                     HospitalNo = pat.PatientCode,
                                     DateOfBirth = pat.DateOfBirth,
                                     Gender = pat.Gender,
                                     Address = pat.Address,
                                     ContactNo = pat.PhoneNumber,
                                     InpatientNo = visitNAdmission.VisitCode,
                                     CountryName = cnty.CountryName,
                                     CountrySubDivision = sub.CountrySubDivisionName,
                                     MunicipalityName = munc.MunicipalityName,
                                     WardNumber = pat.WardNumber,
                                     PANNumber = pat.PANNumber,
                                     Ins_NshiNumber = pat.Ins_NshiNumber,
                                     ClaimCode = visitNAdmission.ClaimCode,
                                     SchemeName = patSchemeDetails != null ? patSchemeDetails.SchemeName : "General",
                                     PolicyNo = patScheme != null ? patScheme.PolicyNo : "",
                                 }).FirstOrDefault();
            }

            var pharmacyBillItems = (from invitm in _pharmacyDbContext.PHRMInvoiceTransactionItems
                                     .Where(invitm => invitm.PatientId == patientId && invitm.BilItemStatus == ENUM_PHRM_InvoiceItemBillStatus.Unpaid)
                                     join mstitm in _pharmacyDbContext.PHRMItemMaster on invitm.ItemId equals mstitm.ItemId
                                     group invitm by new { CreatedOn = DbFunctions.TruncateTime(invitm.CreatedOn), invitm.ItemId, invitm.ItemName, mstitm.ItemCode, invitm.BatchNo, invitm.ExpiryDate, invitm.SalePrice } into I
                                     select new
                                     {
                                         PatientId = patientId,
                                         BillDate = I.Key.CreatedOn,
                                         ItemId = I.Key.ItemId,
                                         ItemName = I.Key.ItemName,
                                         ItemCode = I.Key.ItemCode,
                                         BatchAndExpiry = I.Key.BatchNo + " | " + I.Key.ExpiryDate,
                                         Quantity = I.Sum(q => q.Quantity),
                                         SalePrice = I.Sum(q => q.SalePrice),
                                         SubTotal = I.Sum(q => q.SubTotal),
                                         DiscountAmount = I.Sum(q => q.TotalDisAmt),
                                         VATAmount = I.Sum(q => q.VATAmount),
                                         TotalAmount = I.Sum(q => q.TotalAmount)
                                     }).ToList();


            decimal TotalPharmacyCreditAmount = _pharmacyDbContext.PHRMInvoiceTransaction
                                       .Where(bill => bill.PatientId == patientId && bill.PatientVisitId == ipVisitId && bill.BilStatus == ENUM_BillingStatus.unpaid && !bill.IsReturn)
                                       .Select(a => a.TotalAmount).DefaultIfEmpty().Sum();

            var ipBillingSummary = _billingDbContext.GetIpBillingSummary(patientId, ipVisitId, "provisional");

            var estimateBillInfo = new
            {
                AdmissionInfo = admInfo,
                PatientDetail = patientDetail,
                DepositInfo = deposits,
                BillItems = patBillItems,
                BedItems = patientBeds,
                PharmacyPendingBillsItems = pharmacyBillItems,
                PharmacyTotal = TotalPharmacyCreditAmount,
                IpBillingSummary = ipBillingSummary
            };
            return estimateBillInfo;
        }


        //Returns BedCount for each BedFeatureIds. 
        static Dictionary<int, int> CalculateBedCounts(List<PatientBedInfo> bedInfos)
        {
            DateTime checkOnDate = DateTime.Now;//we need to check on Current Date.
            DateTime minStartDateForRange = (DateTime)bedInfos.Min(b => b.StartedOn);//start date for range is the day of Admission.

            //Maintain a Dictionary of BedType & Count from All the available Data. Initialize the BedCount to Zero
            Dictionary<int, int> bedTypeKeyValues = bedInfos.Select(s => s.BedFeatureId).Distinct().ToDictionary(k => k, v => 0);

            //Order all BedInfos By StartDate. our lo
            List<PatientBedInfo> bedInfoOrdered = bedInfos.OrderBy(a => a.StartedOn).ToList();


            List<DateTime> dayEnds = GetDayEndsOfEachDaysInGivenDateRange(minStartDateForRange, checkOnDate);


            //1.1: if there's only one row in BedInfo (i.e: No transfer)
            //     OR Patient stayed in only one BedType (eg: Transerred from Surgery's General Bed to Medicine's General Bed)
            if (bedInfoOrdered.Count() == 1 || bedTypeKeyValues.Count() == 1)
            {
                int bedFeatureId1 = bedInfoOrdered[0].BedFeatureId;

                DateTime minStartDate = (DateTime)bedInfoOrdered.Min(b => b.StartedOn);
                DateTime maxEndDate = (DateTime)bedInfoOrdered.Max(b => (b.EndedOn != null ? b.EndedOn : DateTime.Now));

                var bedcount = (maxEndDate.Date - minStartDate.Date).Days;
                if (bedcount == 0)
                {
                    bedcount = 1;//minimum day should be 1.
                }
                bedTypeKeyValues[bedFeatureId1] = bedcount;
            }
            else
            {
                //2.1: When there's bed transfer in between.
                //Loop through DayEnds, and ( Count that bed, which was valid at the time of DayChange).
                foreach (var dayEnd in dayEnds)
                {
                    PatientBedInfo bedOnDayEnd = bedInfoOrdered
                                      .Where(b => b.StartedOn <= dayEnd && dayEnd <= (b.EndedOn != null ? b.EndedOn.Value : DateTime.Now)).FirstOrDefault();
                    if (bedOnDayEnd != null)
                    {
                        bedTypeKeyValues[bedOnDayEnd.BedFeatureId]++;
                    }
                }


                //2.2 if transfer happened on today's date.
                //we need to add 1 day to the latest bed.
                List<PatientBedInfo> todaysTransfers = bedInfoOrdered.Where(b => b.StartedOn.Date == DateTime.Now.Date).ToList();
                if (todaysTransfers.Count > 0)
                {
                    PatientBedInfo latestTransfer = todaysTransfers.Where(b => b.EndedOn == null).FirstOrDefault();
                    //need to add only if patient was NOT in Same Bed Yeserday.
                    //When patient was on same bed then that count will already be taken from Section-2.1 logic.
                    if (latestTransfer != null && (!WasPatientOnSameBedYesterday(latestTransfer, bedInfoOrdered)))
                    {
                        bedTypeKeyValues[latestTransfer.BedFeatureId]++;
                    }
                }
            }

            return bedTypeKeyValues;
        }

        private static bool WasPatientOnSameBedYesterday(PatientBedInfo todaysLatestBed, List<PatientBedInfo> allBedInfos)
        {
            DateTime yesterdayDayEnd = DateTime.Now.Date.AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
            PatientBedInfo yesterdaysBedInfo = allBedInfos
                                      .Where(b => b.StartedOn <= yesterdayDayEnd && yesterdayDayEnd <= (b.EndedOn != null ? b.EndedOn.Value : DateTime.Now))
                                      .FirstOrDefault();

            if (yesterdaysBedInfo != null && todaysLatestBed.BedFeatureId == yesterdaysBedInfo.BedFeatureId)
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Gets the day End of each given date range. 
        /// Day End is 23:59:59:999 (taking upto milliseconds)
        /// </summary>
        static List<DateTime> GetDayEndsOfEachDaysInGivenDateRange(DateTime startDate, DateTime endDate)
        {
            List<DateTime> dateTimes = new List<DateTime>();
            //without startdate.Date : 5PM of today minus 7PM of yesterday will give ZERO days. since 24 hrs have not passed.
            int dayDiff = (endDate.Date - startDate.Date).Days;
            //if start and end are same then use 23:59:59:999 of the start date as end date

            if (dayDiff == 0)
            {
                DateTime dayEnd = startDate.Date.AddDays(0).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
                dateTimes.Add(dayEnd);
            }
            else
            {     //otherwise calculate DayEnds of all the day in Ascending Date Order
                for (int i = 0; i < dayDiff; i++)
                {
                    DateTime dayEnd = startDate.Date.AddDays(i).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
                    dateTimes.Add(dayEnd);
                }
            }

            return dateTimes;
        }


    }


}
