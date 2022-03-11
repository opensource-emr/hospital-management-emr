using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.IO;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Transactions;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.StaticFiles;
using DanpheEMR.Utilities;
using System.Data.SqlClient;
using System.Data;

namespace DanpheEMR.Services.Maternity
{
    public class MaternityService : IMaternityService
    {
        public MaternityDbContext maternityDbContext;
        public string connStr;
        public MaternityService(IOptions<MyConfiguration> _config)
        {
            this.connStr = _config.Value.Connectionstring;
            maternityDbContext = new MaternityDbContext(connStr);
        }

        public MaternityPatient AddMaternityPatient(MaternityPatient patient)
        {
            patient.IsActive = true;
            maternityDbContext.MaternityPatients.Add(patient);
            maternityDbContext.SaveChanges();
            return patient;
        }
        public MaternityFileUploads UploadMaternityPatientFiles(MaternityFileUploads patFileUploadData, IFormFileCollection files)
        {
            var parm = maternityDbContext.AdminParameters.Where(a => a.ParameterGroupName == "Maternity" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault();
            var currentTick = System.DateTime.Now.Ticks.ToString();

            if (parm == null)
            {
                throw new Exception("Please set parameter");
            }


            using (var scope = new TransactionScope())
            {
                try
                {
                    if (files.Any())
                    {
                        foreach (var file in files)
                        {
                            using (var ms = new MemoryStream())
                            {
                                string currentFileExtention = Path.GetExtension(file.FileName);
                                file.CopyTo(ms);
                                var fileBytes = ms.ToArray();

                                patFileUploadData.FileType = currentFileExtention;
                                patFileUploadData.FileName = file.FileName + '_' + currentTick + currentFileExtention;
                                patFileUploadData.IsActive = true;

                                string strPath = parm.ParameterValue + "/" + patFileUploadData.FileName;

                                if (!Directory.Exists(parm.ParameterValue))
                                {
                                    Directory.CreateDirectory(parm.ParameterValue);
                                }
                                System.IO.File.WriteAllBytes(strPath, fileBytes);

                                maternityDbContext.MaternityFiles.Add(patFileUploadData);
                            }

                            maternityDbContext.SaveChanges();
                        }
                        scope.Complete();
                        return patFileUploadData;
                    } else
                    {
                        throw new Exception("File not selected");
                    }                    

                }
                catch (Exception ex)
                {
                    scope.Dispose();
                    throw ex;
                }
            }
        }

        public object GetAllDosesNumber(bool dosesNeeded)
        {
            var data = CommonFunctions.GetDosesNumberArray();
            return data;
        }
        public bool ConcludeMaternityPatient(int id, int updatedBy)
        {
            var selectedMatPat = maternityDbContext.MaternityPatients.Where(p => p.MaternityPatientId == id).FirstOrDefault();
            if (selectedMatPat != null)
            {
                selectedMatPat.IsConcluded = true;
                selectedMatPat.ModifiedBy = updatedBy;
                selectedMatPat.ConcludedBy = updatedBy;
                selectedMatPat.ModifiedOn = System.DateTime.Now;
                selectedMatPat.ConcludedOn = System.DateTime.Now;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.IsConcluded).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ConcludedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ConcludedOn).IsModified = true;
                maternityDbContext.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }

        public List<dynamic> GetAllActiveMaternityPatientList(bool showAll, DateTime StartDate, DateTime EndDate)
        {
            var allMatPat = (from matPat in maternityDbContext.MaternityPatients
                             join pat in maternityDbContext.Patients on matPat.PatientId equals pat.PatientId
                             where matPat.IsActive && (DbFunctions.TruncateTime(matPat.CreatedOn) >= StartDate) && (DbFunctions.TruncateTime(matPat.CreatedOn) <= EndDate)
                             && (showAll ? true : !matPat.IsConcluded)
                             select new
                             {
                                 pat.PatientId,
                                 pat.PatientCode,
                                 matPat.MaternityPatientId,
                                 pat.ShortName,
                                 pat.Address,
                                 pat.Age,
                                 pat.PhoneNumber,
                                 pat.DateOfBirth,
                                 pat.Gender,
                                 matPat.HusbandName,
                                 matPat.Height,
                                 matPat.Weight,
                                 matPat.LastMenstrualPeriod,
                                 matPat.ExpectedDeliveryDate,
                                 matPat.IsActive,
                                 matPat.IsConcluded,
                                 matPat.DeliveryDate,
                                 IsDelivered = matPat.DeliveryDate.HasValue,
                                 matPat.OBSHistory
                             }).ToList<dynamic>();

            return allMatPat;
        }

        public List<dynamic> GetDataForEditSearch(string searchText)
        {

            var allPats = (from pat in maternityDbContext.Patients

                           where (pat.IsActive == true) && (pat.Gender.ToLower() == "female")//exclude Inactive and Male patients.
                            && ((pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName + pat.PatientCode + pat.PhoneNumber).Contains(searchText))
                           select new
                           {
                               PatientId = pat.PatientId,
                               PatientCode = pat.PatientCode,
                               ShortName = pat.ShortName,
                               Age = pat.Age,
                               Gender = pat.Gender,
                               DateOfBirth = pat.DateOfBirth,
                               Address = pat.Address
                           }).OrderByDescending(p => p.PatientId).ToList<dynamic>();
            return allPats;
        }

        public List<dynamic> GetPatientDetails()
        {
            var allPats = (from pat in maternityDbContext.Patients
                           where (pat.IsActive == true) && (pat.Gender.ToLower() == "female")
                           select new
                           {
                               PatientId = pat.PatientId,
                               PatientCode = pat.PatientCode,
                               ShortName = pat.ShortName,
                               Age = pat.Age,
                               Gender = pat.Gender,
                               DateOfBirth = pat.DateOfBirth,
                               Address = pat.Address
                           }).OrderByDescending(p => p.PatientId).ToList<dynamic>();
            return allPats;
        }

        public PatientModel GetPatientDetailById(int id)
        {
            return maternityDbContext.Patients.Where(p => p.PatientId == id).FirstOrDefault();
        }

        public List<MaternityPayment> GetPatientPaymentDetailById(int id)
        {
            var res = maternityDbContext.MaternityPatientPayments.Where(p => p.PatientId == id).ToList();
            foreach(var list in res)
            {
                list.EmployeeName = maternityDbContext.Employee.Where(p => p.EmployeeId == list.CreatedBy).FirstOrDefault().FullName;
            }
            return res;
        }

        public MaternityPaymentReceipt GetPatientPaymentDetailByPaymentId(int id)
        {
            var payment = (from pay in maternityDbContext.MaternityPatientPayments
                           join pat in maternityDbContext.Patients on pay.PatientId equals pat.PatientId
                           join fis in maternityDbContext.BillingFiscalYears on pay.FiscalYearId equals fis.FiscalYearId
                           join emp in maternityDbContext.Employee on pay.CreatedBy equals emp.EmployeeId
                           where pay.PatientPaymentId == id
                           select new MaternityPaymentReceipt
                           {
                               ReceiptNo = fis.FiscalYearName + "-" + pay.ReceiptNo,
                               HospitalNo = pat.PatientCode,
                               Age = pat.Age,
                               Gender = pat.Gender,
                               PatientName = pat.ShortName,
                               InAmount = pay.InAmount,
                               OutAmount = pay.OutAmount,
                               EmployeeName = emp.FullName,
                               TransactionType = pay.TransactionType,
                               DateOfBirth = (DateTime)pat.DateOfBirth,
                               CreatedOn = (DateTime)pay.CreatedOn
                           }).FirstOrDefault();
            return payment;
        }


        public bool RemoveMaternityPatient(int id, int updatedBy)
        {
            var selectedMatPat = maternityDbContext.MaternityPatients.Where(p => p.MaternityPatientId == id).FirstOrDefault();
            if (selectedMatPat != null)
            {
                selectedMatPat.IsActive = false;
                selectedMatPat.ModifiedBy = updatedBy;
                selectedMatPat.ModifiedOn = System.DateTime.Now;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.IsActive).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }

        public MaternityPatient UpdateMaternityPatient(MaternityPatient patient)
        {
            var selectedMatPat = maternityDbContext.MaternityPatients.Where(p => p.MaternityPatientId == patient.MaternityPatientId).FirstOrDefault();
            if (selectedMatPat != null)
            {
                selectedMatPat.OBSHistory = patient.OBSHistory;
                selectedMatPat.HusbandName = patient.HusbandName;
                selectedMatPat.Height = patient.Height;
                selectedMatPat.Weight = patient.Weight;
                selectedMatPat.LastMenstrualPeriod = patient.LastMenstrualPeriod;
                selectedMatPat.ExpectedDeliveryDate = patient.ExpectedDeliveryDate;
                selectedMatPat.ModifiedOn = System.DateTime.Now;
                selectedMatPat.ModifiedBy = patient.ModifiedBy;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.OBSHistory).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.HusbandName).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.Height).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.Weight).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.LastMenstrualPeriod).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ExpectedDeliveryDate).IsModified = true;
                maternityDbContext.SaveChanges();
                return selectedMatPat;
            }
            else
            {
                return new MaternityPatient();
            }
        }


        public MaternityANC AddUpdateANC(MaternityANC model)
        {
            var patid = maternityDbContext.MaternityPatients.Where(p => p.MaternityPatientId == model.MaternityPatientId).FirstOrDefault().PatientId;
            model.PatientId = patid;
            //add
            if (model.MaternityANCId == 0)
            {
                maternityDbContext.MaternityANC.Add(model);
                maternityDbContext.SaveChanges();
                return model;
            } //edit 
            else
            {
                var selectedANC = maternityDbContext.MaternityANC.Where(a => a.MaternityANCId == model.MaternityANCId).FirstOrDefault();
                selectedANC.VisitNumber = model.VisitNumber;
                selectedANC.ANCPlace = model.ANCPlace;
                selectedANC.PregnancyPeriodInWeeks = model.PregnancyPeriodInWeeks;
                selectedANC.ConditionOfANC = model.ConditionOfANC;
                selectedANC.Weight = model.Weight;
                selectedANC.ModifiedBy = model.ModifiedBy;
                selectedANC.ModifiedOn = System.DateTime.Now;

                maternityDbContext.Entry(selectedANC).Property(a => a.VisitNumber).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.ANCPlace).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.PregnancyPeriodInWeeks).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.ConditionOfANC).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.Weight).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.Entry(selectedANC).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.SaveChanges();

                return selectedANC;
            }
        }

        public MaternityRegisterVM RegisterMaternity(MaternityRegisterVM model)
        {
            var selectedMaternitytPat = maternityDbContext.MaternityPatients.Where(p => p.MaternityPatientId == model.MaternityPatient.MaternityPatientId).FirstOrDefault();
            using (TransactionScope scope = new TransactionScope())
            {
                selectedMaternitytPat.DeliveryDate = model.MaternityPatient.DeliveryDate;
                selectedMaternitytPat.TypeOfDelivery = model.MaternityPatient.TypeOfDelivery;
                selectedMaternitytPat.Presentation = model.MaternityPatient.Presentation;
                selectedMaternitytPat.Complications = model.MaternityPatient.Complications;
                selectedMaternitytPat.ModifiedBy = model.MaternityPatient.ModifiedBy;
                selectedMaternitytPat.PlaceOfDelivery = model.MaternityPatient.PlaceOfDelivery;
                selectedMaternitytPat.ModifiedOn = System.DateTime.Now;

                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.DeliveryDate).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.TypeOfDelivery).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.Presentation).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.Complications).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMaternitytPat).Property(a => a.PlaceOfDelivery).IsModified = true;
                maternityDbContext.SaveChanges();

                foreach (var item in model.MaternityDetails)
                {
                    item.IsActive = true;
                    item.MaternityPatientId = selectedMaternitytPat.MaternityPatientId;
                    item.PatientId = selectedMaternitytPat.PatientId;
                    maternityDbContext.MaternityRegister.Add(item);
                    maternityDbContext.SaveChanges();
                }

                scope.Complete();
                return model;
            }
        }
        public bool RemoveMaternityPatientANC(int id, int updatedBy)
        {
            var selectedMatPat = maternityDbContext.MaternityANC.Where(p => p.MaternityANCId == id).FirstOrDefault();
            if (selectedMatPat != null)
            {
                selectedMatPat.IsActive = false;
                selectedMatPat.ModifiedBy = updatedBy;
                selectedMatPat.ModifiedOn = System.DateTime.Now;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.IsActive).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }
        public bool RemoveMaternityPatientFile(int id, int updatedBy)
        {
            var selectedMatPat = maternityDbContext.MaternityFiles.Where(p => p.FileId == id).FirstOrDefault();
            if (selectedMatPat != null)
            {
                selectedMatPat.IsActive = false;
                selectedMatPat.ModifiedBy = updatedBy;
                selectedMatPat.ModifiedOn = System.DateTime.Now;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.IsActive).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedMatPat).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }
        public MaternityRegister EditChildDetail(MaternityRegister model)
        {
            var selectedChild = maternityDbContext.MaternityRegister.Where(a => a.MaternityRegisterId == model.MaternityRegisterId).FirstOrDefault();
            selectedChild.OutcomeOfBaby = model.OutcomeOfBaby;
            selectedChild.OutcomeOfMother = model.OutcomeOfMother;
            selectedChild.WeightInGram = model.WeightInGram;
            selectedChild.Gender = model.Gender;
            selectedChild.ModifiedBy = model.ModifiedBy;
            selectedChild.ModifiedOn = System.DateTime.Now;

            maternityDbContext.Entry(selectedChild).Property(a => a.OutcomeOfBaby).IsModified = true;
            maternityDbContext.Entry(selectedChild).Property(a => a.OutcomeOfMother).IsModified = true;
            maternityDbContext.Entry(selectedChild).Property(a => a.WeightInGram).IsModified = true;
            maternityDbContext.Entry(selectedChild).Property(a => a.Gender).IsModified = true;
            maternityDbContext.Entry(selectedChild).Property(a => a.ModifiedOn).IsModified = true;
            maternityDbContext.Entry(selectedChild).Property(a => a.ModifiedBy).IsModified = true;
            maternityDbContext.SaveChanges();

            return selectedChild;
        }

        public MaternityPatient EditMotherDetail(MaternityPatient model)
        {
            var selectedMother = maternityDbContext.MaternityPatients.Where(a => a.MaternityPatientId == model.MaternityPatientId).FirstOrDefault();
            selectedMother.PlaceOfDelivery = model.PlaceOfDelivery;
            selectedMother.Presentation = model.Presentation;
            selectedMother.Complications = model.Complications;
            selectedMother.DeliveryDate = model.DeliveryDate;
            selectedMother.TypeOfDelivery = model.TypeOfDelivery;
            selectedMother.ModifiedBy = model.ModifiedBy;
            selectedMother.ModifiedOn = System.DateTime.Now;

            maternityDbContext.Entry(selectedMother).Property(a => a.PlaceOfDelivery).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.Presentation).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.Complications).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.DeliveryDate).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.TypeOfDelivery).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.Complications).IsModified = true;
            maternityDbContext.Entry(selectedMother).Property(a => a.DeliveryDate).IsModified = true;
            maternityDbContext.SaveChanges();

            return selectedMother;
        }

        public bool RemoveChildDetail(int id, int removedBy)
        {
            var selectedChild = maternityDbContext.MaternityRegister.Where(a => a.MaternityRegisterId == id).FirstOrDefault();
            if (selectedChild != null)
            {
                selectedChild.IsActive = false;
                selectedChild.ModifiedBy = removedBy;
                selectedChild.ModifiedOn = System.DateTime.Now;
                maternityDbContext.Entry(selectedChild).Property(a => a.IsActive).IsModified = true;
                maternityDbContext.Entry(selectedChild).Property(a => a.ModifiedBy).IsModified = true;
                maternityDbContext.Entry(selectedChild).Property(a => a.ModifiedOn).IsModified = true;
                maternityDbContext.SaveChanges();
                return true;
            }
            else
            {
                return false;
            }
        }

        public List<dynamic> GetAllBabyDetailsByMaternityPatId(int matId, int patId)
        {
            var allPats = (from pat in maternityDbContext.MaternityPatients
                           join child in maternityDbContext.MaternityRegister on pat.MaternityPatientId equals child.MaternityPatientId
                           where (pat.IsActive == true && child.IsActive == true) && pat.PatientId == patId && child.MaternityPatientId == matId
                           select new
                           {
                               pat.PlaceOfDelivery,
                               pat.Complications,
                               pat.Presentation,
                               pat.DeliveryDate,
                               pat.TypeOfDelivery,
                               child.OutcomeOfBaby,
                               child.OutcomeOfMother,
                               child.WeightInGram,
                               child.Gender,
                               child.MaternityRegisterId
                           }).OrderByDescending(p => p.MaternityRegisterId).ToList<dynamic>();
            return allPats;
        }

        public List<MaternityANC> GetAllANCByMaternityPatId(int id)
        {
            return maternityDbContext.MaternityANC.Where(m => m.IsActive && (m.MaternityPatientId == id)).ToList();
        }

        public List<MaternityFileUploads> GetAllFilesUploadedbyMaternityPatId(int id)
        {
            return maternityDbContext.MaternityFiles.Where(m => m.IsActive && (m.MaternityPatientId == id)).ToList();
        }

        public string GetDownloadFilePathById(int maternityPatFileId)
        {
            var parm = maternityDbContext.AdminParameters.Where(a => a.ParameterGroupName == "Maternity" && a.ParameterName == "UploadFileLocationPath").FirstOrDefault();
            var fileFullName = maternityDbContext.MaternityFiles.Where(m => m.FileId == maternityPatFileId).FirstOrDefault().FileName;
            var filePath = Path.Combine(parm.ParameterValue, fileFullName);
            return filePath;
        }
        public DataSet GetMaternityAllowanceReportList(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                            new SqlParameter("@FromDate",FromDate),
                            new SqlParameter("@ToDate", ToDate),                 };
            DataSet ds = DALFunctions.GetDatasetFromStoredProc("SP_MAT_RPT_GetMaternityPaymentDetails", paramList, maternityDbContext);
            return ds;
        }

        public MaternityPayment AddMaternityPatientPayment(MaternityPayment payment)
        {
            using (var transaction = maternityDbContext.Database.BeginTransaction())
            {
                try
                {
                    payment.CreatedOn = DateTime.Now;
                    payment.IsActive = true;
                    BillingFiscalYear fiscYear = GetFiscalYear(maternityDbContext);
                    payment.FiscalYearId = fiscYear.FiscalYearId;
                    payment.ReceiptNo = (int)this.GetPaymentReceiptNo(payment.FiscalYearId);
                    maternityDbContext.MaternityPatientPayments.Add(payment);
                    maternityDbContext.SaveChanges();
                    //emp transaction
                    EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                    empCashTransaction.TransactionType = payment.TransactionType;
                    empCashTransaction.ReferenceNo = payment.PatientPaymentId;
                    if (payment.TransactionType == "MaternityAllowance")
                    {
                        empCashTransaction.InAmount = 0;
                        empCashTransaction.OutAmount = payment.OutAmount;

                    }
                    else
                    {
                        empCashTransaction.InAmount = payment.InAmount;
                        empCashTransaction.OutAmount = 0;
                    }
                    empCashTransaction.EmployeeId = payment.CreatedBy;
                    empCashTransaction.TransactionDate = DateTime.Now;
                    empCashTransaction.CounterID = payment.CounterId;
                    empCashTransaction.Description = payment.Remarks;
                    empCashTransaction.IsActive = true;
                    maternityDbContext.EmpCashTransactions.Add(empCashTransaction);
                    maternityDbContext.SaveChanges();
                    transaction.Commit();
                    return payment;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
                }

            }
        }

        public static BillingFiscalYear GetFiscalYear(MaternityDbContext maternityDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return maternityDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }

        public int? GetPaymentReceiptNo(int fiscalYearId)
        {
            int? receiptNo = (from pay in maternityDbContext.MaternityPatientPayments
                              where pay.FiscalYearId == fiscalYearId
                              select pay.ReceiptNo).DefaultIfEmpty(0).Max();

            return receiptNo + 1;
        }
    }
}
