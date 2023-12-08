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
using DanpheEMR.Security;
using RefactorThis.GraphDiff;//for entity-update.
using System.IO;
using DanpheEMR.ServerModel.ClinicalModels;
using Microsoft.EntityFrameworkCore;
using DanpheEMR.ServerModel.SSFModels;
using Org.BouncyCastle.Asn1.Ocsp;
using DanpheEMR.ServerModel.SSFModels.ClaimResponse;
using DocumentFormat.OpenXml.ExtendedProperties;
using DanpheEMR.Enums;
using EntityState = System.Data.Entity.EntityState;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using DanpheEMR.ViewModel.Clinical;
using Microsoft.AspNetCore.Http;
using Syncfusion.XlsIO;
using DanpheEMR.ServerModel.ClinicalModels.BloodSugarMonitoring;
using DanpheEMR.ServerModel.ClinicalModels.Diet;
using DanpheEMR.ServerModel.ClinicalModels.ConsulationRequests;
using DanpheEMR.ServerModel.ClinicalModels.DTOs;
using DbFunctions = System.Data.Entity.DbFunctions;
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Clinical
{

    public class ClinicalController : CommonController
    {
        private readonly ClinicalDbContext _clinicalDbContext;
        private readonly PatientDbContext _patientDbContext;
        private readonly PharmacyDbContext _pharmDbContext;
        private readonly MasterDbContext _masterDbContext;

        public ClinicalController(IOptions<MyConfiguration> _config) : base(_config)
        {
            _clinicalDbContext = new ClinicalDbContext(base.connString);
            _patientDbContext = new PatientDbContext(base.connString);
            _pharmDbContext = new PharmacyDbContext(base.connString);
            _masterDbContext = new MasterDbContext(connString);
        }

        [HttpGet]
        [Route("LatestVitals")]
        public IActionResult Vitals(int patientVisitId)
        {
            // if (reqType == "vitals" && patientVisitId != 0)

            Func<object> func = () => GetVitals(patientVisitId);
            return InvokeHttpGetFunction(func);


        }

        [HttpGet]
        [Route("ProviderLongSignature")]
        public IActionResult ProviderLongSignature(int providerId)
        {
            // else if (reqType == "ProviderLongSignature" && providerId != 0)

            Func<object> func = () => _clinicalDbContext.Employee.Where(p => p.EmployeeId == providerId).ToList();
            return InvokeHttpGetFunction(func);



        }

        [HttpGet]
        [Route("InputOutput")]
        public IActionResult InputOutput(int patientVisitId, DateTime? fromDate, DateTime? toDate)
        {
            // else if (reqType == "inputoutput" && providerId != 0)
            List<InputOutputModel> ioList = new List<InputOutputModel>();
            if (fromDate == null & toDate == null)
            {
                fromDate = DateTime.Now;
                toDate = DateTime.Now;
            }

            ioList = _clinicalDbContext.InputOutput
                    .Where(p => p.PatientVisitId == patientVisitId && (DbFunctions.TruncateTime(p.CreatedOn) >= fromDate && DbFunctions.TruncateTime(p.CreatedOn) <= toDate))
                    .ToList();

            List<InputOutputModel> AllIOList = _clinicalDbContext.InputOutput.Where(p => p.PatientVisitId == patientVisitId).ToList();
            decimal lastBalance = 0;
            if (AllIOList.Count > 0)
            {
                var lastRecord = AllIOList[AllIOList.Count - 1];
                //lastBalance = (decimal)lastRecord.Balance;
            }
            Func<object> func = () => new { ioList = ioList, lastBalance = lastBalance };
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PrescriptionHistory")]
        public IActionResult PrescriptionHistory(int patientId)
        {
            // else if (reqType == "PrescriptionHistory")

            Func<object> func = () => _clinicalDbContext.ClinicalPrescriptionSlipMaster.Where(a => a.PatientId == patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PatientAllergies")]
        public IActionResult PatientAllergies(int patientId)
        {
            // else if (reqType == "allergy")

            Func<object> func = () => _clinicalDbContext.Allergy.Where(p => p.PatientId == patientId).OrderByDescending(alrg => alrg.CreatedOn).ToList();
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("HomeMedication")]
        public IActionResult HomeMedication(int patientId)
        {
            // else if (reqType == "homemedication" && patientId != 0)

            Func<object> func = () => GetHomeMedication(patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("MedicationPrescriptions")]
        public IActionResult MedicationPrescriptions(int patientId)
        {
            // else if (reqType == "medicationprescription")

            Func<object> func = () => GetMedicationPrescription(patientId);
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("ActiveMedicalProblems")]
        public IActionResult ActivemedicalProblems(int patientId)
        {
            // else if (reqType == "activemedical")

            Func<object> func = () => _clinicalDbContext.ActiveMedical.Where(p => p.PatientId == patientId && p.IsResolved == false).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PastMedicalProblems")]
        public IActionResult PastMedicalProblems(int patientId)
        {
            // else if (reqType == "pastmedical")

            Func<object> func = () => _clinicalDbContext.PastMedicals
                                                        .Where(p => p.PatientId == patientId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SurgicalHistory")]
        public IActionResult SurgicalHistory(int patientId)
        {
            // else if (reqType == "surgicalhistory")

            Func<object> func = () => _clinicalDbContext.SurgicalHistory
                                                        .Where(p => p.PatientId == patientId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("FamilyHistories")]
        public IActionResult FamilyHistories(int patientId)
        {
            // else if (reqType == "familyhistory")

            Func<object> func = () => _clinicalDbContext.FamilyHistory
                                                        .Where(p => p.PatientId == patientId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SocialHistory")]
        public IActionResult SocialHistory(int patientId)
        {
            // else if (reqType == "socialhistory")

            Func<object> func = () => _clinicalDbContext.SocialHistory
                                                .Where(p => p.PatientId == patientId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ReferralSource")]
        public IActionResult ReferralSource(int patientId)
        {
            // else if (reqType == "referralsource")

            Func<object> func = () => _clinicalDbContext.ReferralSource
                                                .Where(p => p.PatientId == patientId).ToList();
            return InvokeHttpGetFunction(func);
        }


        [HttpGet]
        [Route("ClinicalDetail")]
        public IActionResult PatientClinicalDetail(int patientVisitId, int patientId)
        {
            // else if (reqType == "patient-clinicaldetail")

            Func<object> func = () => GetPatientClinicalDetail(patientVisitId, patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("NoteTypes")]
        public IActionResult NoteTypes()
        {
            // else if (reqType == "getNoteTypeList")

            Func<object> func = () => _clinicalDbContext.NoteType.Where(x => x.IsActive != false).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("NotesTemplates")]
        public IActionResult NotesTemplates()
        {
            // else if (reqType == "getTemplateList")
            Func<object> func = () => _clinicalDbContext.TemplateNotes.Where(x => x.IsActive != false).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("FreeTextNoteTemplateDetail")]
        public IActionResult FreeTextNoteTemplateDetail(int NoteId)
        {
            // else if (reqType == "getFreeTextTemplateList")
            Func<object> func = () => GetFreeTextNoteTemplateDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ProcedureNoteTemplate")]
        public IActionResult ProcedureNoteTemplateDetail(int NoteId)
        {
            // else if (reqType == "getProcedureNoteTemplateList")
            Func<object> func = () => GetProcedureNoteTemplateDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("ProgressNoteTemplateDetail")]
        public IActionResult ProgressNoteTemplateDetail(int NoteId)
        {
            // else if (reqType == "getProgressNoteTemplateList")
            Func<object> func = () => GetProgressNoteTemplateDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("HistoryAndPhysicalNoteDetail")]
        public IActionResult HistoryAndPhysicalNoteDetail(int NoteId)
        {
            // else if (reqType == "getHistoryAndPhysicalNoteById")
            Func<object> func = () => GetHistoryAndPhysicalNoteDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("EmergencyNoteDetail")]
        public IActionResult EmergencyNoteDetail(int NoteId)
        {
            // else if (reqType == "getEmergencyNoteById")
            Func<object> func = () => GetEmergencyNoteDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PrescriptionNoteDetail")]
        public IActionResult PrescriptionNoteDetail(int NoteId)
        {
            // else if (reqType == "getClinicalPrescriptionNoteById")
            Func<object> func = () => GetPrescriptionNoteDetailById(NoteId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PatientNotes")]
        public IActionResult PatientNotes(int patientId)
        {
            // else if (reqType == "patient-clinical-notes")
            Func<object> func = () => GetPatientNotes(patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("OPDGeneralNote")]
        public IActionResult OPDGeneralNote(int NoteId)
        {
            // else if (reqType == "opd-general")
            Func<object> func = () => GetOPDGeneralNoteDetail(NoteId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ScannedImages")]
        public IActionResult ScannedImages(int patientId)
        {
            // else if (reqType == "GetUploadedScannedImages")
            Func<object> func = () => GetScannedImages(patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("EyeHistory")]
        public IActionResult EyeHistory(int patientId)
        {
            //else if (reqType == "EyeHistory")
            Func<object> func = () => _clinicalDbContext.ClinicalEyeMaster.Where(a => a.PatientId == patientId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("EyeEMR")]
        public IActionResult EyeEMR(int masterId)
        {
            //else if (reqType == "EyeHistory")
            Func<object> func = () => GetEyeEMR(masterId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PrescriptionDetails")]
        public IActionResult PrescriptionDetails(int masterId)
        {
            //else if (reqType == "GetPrescriptionbyMasterId")
            Func<object> func = () => GetPrescriptionDetails(masterId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PrescriptionNote")]
        public IActionResult PrescriptionNote(int noteId, int patientVisitId)
        {
            //else if (reqType == "patient-clinical-prescription-notes")
            Func<object> func = () => GetPrescriptionNote(noteId, patientVisitId);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Orders")]
        public IActionResult Orders(int NoteId)
        {
            //else if (reqType == "getAllOrdersByNoteId")
            Func<object> func = () => GetOrders(NoteId);
            return InvokeHttpGetFunction(func);
        }


        private object GetOrders(int NoteId)
        {
            var allICDandOrders = (from note in _clinicalDbContext.Notes
                                   where note.NotesId == NoteId
                                   select new
                                   {
                                       note.NotesId,
                                       note.PatientId,
                                       note.PatientVisitId,
                                       DiagnosisOrdersList = (from allDiagnosis in _clinicalDbContext.ClinicalDiagnosis
                                                              where allDiagnosis.NotesId == NoteId && allDiagnosis.IsActive == true
                                                              select new
                                                              {
                                                                  allDiagnosis.DiagnosisId,
                                                                  IsEditable = true,
                                                                  ICD = (from icd in _clinicalDbContext.ICD10
                                                                         where icd.ICD10ID == allDiagnosis.ICD10ID
                                                                         select new
                                                                         {
                                                                             icd.ICD10Code,
                                                                             icd.ICD10Description,
                                                                             icd.ICD10ID,
                                                                             icd.ICDShortCode,
                                                                             icd.ValidForCoding
                                                                         }),


                                                                  AllIcdLabOrders = (from allLab in _clinicalDbContext.LabRequisitions
                                                                                     where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus != "cancel"
                                                                                     select new
                                                                                     {
                                                                                         ItemId = allLab.LabTestId,
                                                                                         ItemName = allLab.LabTestName,
                                                                                         PreferenceType = "Lab",
                                                                                         IsGeneric = false,
                                                                                     }
                                                                                   ).ToList(),
                                                                  AllIcdImagingOrders = (from allImaging in _clinicalDbContext.ImagingRequisitions
                                                                                         where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
                                                                                         select new
                                                                                         {
                                                                                             ItemId = allImaging.ImagingItemId,
                                                                                             ItemName = allImaging.ImagingItemName,
                                                                                             allImaging.ImagingTypeId,
                                                                                             PreferenceType = "Imaging",
                                                                                             IsGeneric = false,

                                                                                         }).ToList(),
                                                                  AllIcdPrescriptionOrders = (from allMedication in _clinicalDbContext.PHRMPrescriptionItems
                                                                                              where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
                                                                                              select new
                                                                                              {
                                                                                                  allMedication.ItemId,
                                                                                                  _clinicalDbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
                                                                                                  allMedication.Quantity,
                                                                                                  allMedication.Frequency,
                                                                                                  allMedication.HowManyDays,
                                                                                                  allMedication.Dosage,
                                                                                                  allMedication.GenericId,
                                                                                                  PreferenceType = "Medication",
                                                                                                  IsGeneric = false,
                                                                                              }).ToList(),

                                                              }).ToList()
                                   });
            return allICDandOrders;
        }
        private object GetPrescriptionNote(int noteId, int patientVisitId)
        {
            var subnotes = (from notes in _clinicalDbContext.Notes
                            join subnote in _clinicalDbContext.SubjectiveNotes
                            on notes.NotesId equals subnote.NotesId into subNoteTemp
                            from subNoteData in subNoteTemp.DefaultIfEmpty()
                            join objnote in _clinicalDbContext.ObjectiveNotes on notes.NotesId equals objnote.NotesId into objNoteTemp
                            from objNoteData in objNoteTemp.DefaultIfEmpty()
                            join patVisit in _clinicalDbContext.Visit on notes.PatientVisitId equals patVisit.PatientVisitId
                            join vitals in _clinicalDbContext.Vitals on notes.PatientVisitId equals vitals.PatientVisitId into vitalsTemp
                            from vital in vitalsTemp.DefaultIfEmpty()
                            join pat in _clinicalDbContext.Patients on notes.PatientId equals pat.PatientId
                            where notes.PatientVisitId == patientVisitId && notes.NotesId == noteId

                            select new
                            {
                                PatientCode = pat.PatientCode,
                                PatientName = pat.FirstName + "" + pat.MiddleName + "" + pat.LastName,
                                AgeGender = pat.Age + "" + pat.Gender,
                                //Specialization = patVisit.DepartmentName,
                                DoctorName = patVisit.PerformerName,
                                //NMCNo = employees.MedCertificationNo,
                                RegistrationDate = patVisit.VisitDate.ToString(),
                                VisitTime = patVisit.VisitTime.ToString(),
                                RegistrationNo = patVisit.VisitCode,
                                PatientType = patVisit.VisitType,
                                ChiefComplaint = subNoteData.ChiefComplaint,
                                HistoryIllness = subNoteData.HistoryOfPresentingIllness,
                                objNotes = objNoteData,
                                Height = vital.Height,
                                Weight = vital.Weight,
                                BMI = vital.BMI,
                                Temp = vital.Temperature,
                                Pulse = vital.Pulse,
                                Respiration = vital.RespiratoryRatePerMin,
                                BPSystolic = vital.BPSystolic,
                                BPDiastolic = vital.BPDiastolic,
                                SpO2 = vital.SpO2,
                                PainScale = vital.PainScale,
                                FollowUp = notes.FollowUp,
                                Remarks = notes.Remarks,
                                MedicationPrescriptions = (from pres in _clinicalDbContext.PHRMPrescriptionItems
                                                           join item in _clinicalDbContext.PHRMItemMaster on pres.ItemId equals item.ItemId
                                                           where pres.PatientId == pat.PatientId
                                                           select new { pres, item.ItemName }
                                                           ).ToList()
                            }).FirstOrDefault();
            return subnotes;
        }
        private object GetPrescriptionDetails(int masterId)
        {
            var PrescriptionDetails = _clinicalDbContext.ClinicalPrescriptionSlipMaster.Where(a => a.Id == masterId).FirstOrDefault();
            PrescriptionDetails.History = _clinicalDbContext.History.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.IOP = _clinicalDbContext.IOP.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.Plup = _clinicalDbContext.Plup.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.VaUnaided = _clinicalDbContext.Vaunaided.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.Retinoscopy = _clinicalDbContext.Retinoscopy.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.Schrime = _clinicalDbContext.Schrime.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.Acceptance = _clinicalDbContext.Acceptance.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.TBUT = _clinicalDbContext.TBUT.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.Dilate = _clinicalDbContext.Dilate.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.FinalClass = _clinicalDbContext.FinalClass.Where(a => a.MasterId == masterId).FirstOrDefault();
            PrescriptionDetails.AdviceDiagnosis = _clinicalDbContext.AdviceDiagnosis.Where(a => a.MasterId == masterId).FirstOrDefault();
            return PrescriptionDetails;
        }
        private object GetEyeEMR(int masterId)
        {
            var EyeEMR = _clinicalDbContext.ClinicalEyeMaster.Where(a => a.Id == masterId).FirstOrDefault();
            EyeEMR.RefractionOD = _clinicalDbContext.Refration.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.RefractionOS = _clinicalDbContext.Refration.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.OperationNotesOD = _clinicalDbContext.OperationNotes.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.OperationNotesOS = _clinicalDbContext.OperationNotes.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            EyeEMR.AblationOD = _clinicalDbContext.AblationProfile.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.AblationOS = _clinicalDbContext.AblationProfile.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            EyeEMR.LaserDataOD = _clinicalDbContext.LaserData.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.LaserDataOS = _clinicalDbContext.LaserData.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.PrePachymetryOD = _clinicalDbContext.PreOpPachymetry.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.PrePachymetryOS = _clinicalDbContext.PreOpPachymetry.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.LasikRSTOD = _clinicalDbContext.LasikRST.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.LasikRSTOS = _clinicalDbContext.LasikRST.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            EyeEMR.SmileSettingOD = _clinicalDbContext.SmileSetting.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.SmileSettingOS = _clinicalDbContext.SmileSetting.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            EyeEMR.PachymetryOD = _clinicalDbContext.Pachymetry.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.PachymetryOS = _clinicalDbContext.Pachymetry.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.VisumaxOD = _clinicalDbContext.VisuMax.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.VisumaxOS = _clinicalDbContext.VisuMax.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            EyeEMR.WavefrontOD = _clinicalDbContext.Wavefront.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.WavefrontOS = _clinicalDbContext.Wavefront.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.ORAOD = _clinicalDbContext.ORA.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
            EyeEMR.ORAOS = _clinicalDbContext.ORA.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
            EyeEMR.SmileIncisionOD = _clinicalDbContext.SmileIncision.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
            EyeEMR.SmileIncisionOS = _clinicalDbContext.SmileIncision.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
            return EyeEMR;
        }
        private object GetScannedImages(int patientId)
        {
            var result = _clinicalDbContext.PatientImages.Where(a => a.IsActive == true && a.PatientId == patientId).ToList();
            var location = (from dbc in _clinicalDbContext.CFGParameters
                            where dbc.ParameterGroupName.ToLower() == "clinical"
                            && dbc.ParameterName == "ClinicalDocumentUploadLocation"
                            select dbc.ParameterValue).FirstOrDefault();
            string fullPath;
            foreach (var item in result)
            {
                fullPath = location + item.FileName;
                item.FileBinaryData = System.IO.File.ReadAllBytes(@fullPath);
            }

            return result;
        }

        private object GetOPDGeneralNoteDetail(int noteId)
        {
            List<ClinicalDiagnosisModel> allDiagnosis = (from note in _clinicalDbContext.Notes
                                                         join diagnosis in _clinicalDbContext.ClinicalDiagnosis on note.NotesId equals diagnosis.NotesId
                                                         where note.NotesId == noteId
                                                         select diagnosis
                                   ).ToList();

            foreach (var diag in allDiagnosis)
            {
                diag.AllIcdLabOrders = (from labReq in _clinicalDbContext.LabRequisitions
                                        where labReq.DiagnosisId == diag.DiagnosisId
                                        select labReq).ToList();
                diag.AllIcdImagingOrders = (from imgReq in _clinicalDbContext.ImagingRequisitions
                                            where imgReq.DiagnosisId == diag.DiagnosisId
                                            select imgReq).ToList();
                diag.AllIcdPrescriptionOrders = (from phrmReq in _clinicalDbContext.PHRMPrescriptionItems
                                                 where phrmReq.DiagnosisId == diag.DiagnosisId
                                                 select phrmReq).ToList();
            }

            var notes = (from note in _clinicalDbContext.Notes
                         join sub in _clinicalDbContext.SubjectiveNotes on note.NotesId equals sub.NotesId into subjectiveTemp
                         from subjective in subjectiveTemp.DefaultIfEmpty()
                         join obj in _clinicalDbContext.ObjectiveNotes on note.NotesId equals obj.NotesId into objectiveTemp
                         from objective in objectiveTemp.DefaultIfEmpty()
                         join doctor in _clinicalDbContext.Employee on note.PerformerId equals doctor.EmployeeId
                         join visit in _clinicalDbContext.Visit on note.PatientVisitId equals visit.PatientVisitId
                         join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                         from noteType in noteTypeTemp.DefaultIfEmpty()

                         where note.NotesId == noteId
                         select new
                         {
                             note.NotesId,
                             noteType.NoteType,
                             note.PatientId,
                             note.PatientVisitId,
                             note.PerformerId,
                             note.CreatedOn,
                             note.FollowUp,
                             note.Remarks,
                             VisitCode = visit.VisitCode,
                             VisitDate = visit.VisitDate,
                             ReferredBy = doctor.LongSignature,
                             SubjectiveNote = subjective,
                             ObjectiveNote = objective
                         }).FirstOrDefault();


            NotesModel notesData = new NotesModel();

            notesData.AllIcdAndOrders = allDiagnosis;
            notesData.SubjectiveNote = notes.SubjectiveNote;
            notesData.ObjectiveNote = notes.ObjectiveNote;
            notesData.NotesId = notes.NotesId;
            notesData.PatientId = notes.PatientId;
            notesData.PatientVisitId = notes.PatientVisitId;
            notesData.PerformerId = notes.PerformerId;
            notesData.CreatedOn = notes.CreatedOn;
            notesData.FollowUp = notes.FollowUp;
            notesData.Remarks = notes.Remarks;
            notesData.VisitCode = notes.VisitCode;
            notesData.VisitDate = notes.VisitDate;
            notesData.ReferredBy = notes.ReferredBy;


            return notesData;
        }
        private object GetPatientNotes(int patientId)
        {
            if (patientId != 0)
            {
                var notes = (from note in _clinicalDbContext.Notes
                             join visit in _clinicalDbContext.Visit on note.PatientVisitId equals visit.PatientVisitId
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where note.PatientId == patientId
                             let primaryDoc = _clinicalDbContext.Employee.Where(d => d.EmployeeId == note.PerformerId).Select(s => s.FullName).FirstOrDefault() ?? ""
                             select new
                             {
                                 visit.VisitCode,
                                 note.PatientId,
                                 note.PatientVisitId,
                                 PrimaryDoctor = primaryDoc,
                                 note.TemplateName,
                                 note.NotesId,
                                 WrittenBy = emp.FullName,
                                 noteType.NoteType,
                                 note.CreatedOn,
                                 note.IsPending,
                                 note.CreatedBy,
                                 LoggedInEmployeeId = 0

                             }).ToList().OrderByDescending(a => a.CreatedOn);

                return notes;
            }
            else
            {
                var isPending = true;
                var notes = (from note in _clinicalDbContext.Notes
                             join pat in _clinicalDbContext.Patients on note.PatientId equals pat.PatientId
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where note.IsPending == isPending
                             select new
                             {
                                 note.PatientId,
                                 note.PatientVisitId,
                                 PrimaryDoctor = primaryDoc.FullName,
                                 note.TemplateName,
                                 note.NotesId,
                                 WrittenBy = emp.FullName,
                                 noteType.NoteType,
                                 note.CreatedOn,
                                 note.IsPending,
                                 LoggedUser = "",
                                 PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
                                 Age = pat.Age,
                                 Gender = pat.Gender

                             }).ToList().OrderByDescending(a => a.CreatedOn);
                return notes;
            }
        }
        private object GetPrescriptionNoteDetailById(int NoteId)
        {
            var viewnotes = (from note in _clinicalDbContext.Notes
                             join prescription in _clinicalDbContext.ClinicalPrescriptionNote on note.NotesId equals prescription.NotesId
                             join subjective in _clinicalDbContext.SubjectiveNotes on note.NotesId equals subjective.NotesId
                             join pat in _clinicalDbContext.Patients on prescription.PatientId equals pat.PatientId
                             join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId into pd
                             from primaryDoctor in pd.DefaultIfEmpty()
                             join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                             from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where prescription.NotesId == NoteId
                             select new
                             {
                                 prescription.NotesId,
                                 SubjectiveNote = subjective,
                                 Prescription = prescription,
                                 note.FollowUp,
                                 note.FollowUpUnit,
                                 note.Remarks,
                                 note.TemplateName,
                                 prescription.CreatedOn,
                                 prescription.ModifiedOn,
                                 note.IsPending,
                                 WrittenBy = emp.FullName,
                                 noteType.NoteType,
                                 CreatedBy = emp.FullName,
                                 PrimaryDoctor = primaryDoctor != null ? primaryDoctor.FullName : "Self",
                                 SecondaryDoctor = secondaryDoc.FullName,
                                 pat.Age,
                                 Sex = pat.Gender,
                                 pat.PatientCode,
                                 PatientName = pat.ShortName

                             }).ToList();
            return viewnotes;
        }
        private object GetEmergencyNoteDetail(int NoteId)
        {
            var emergencyNoteDetail = (from note in _clinicalDbContext.Notes
                                       join ernote in _clinicalDbContext.EmergencyNote on note.NotesId equals ernote.NotesId
                                       join sNote in _clinicalDbContext.SubjectiveNotes on note.NotesId equals sNote.NotesId into tempSubNote
                                       from subjNote in tempSubNote.DefaultIfEmpty()
                                       join obNote in _clinicalDbContext.ObjectiveNotes on note.NotesId equals obNote.NotesId into tempObjNote
                                       from objNote in tempObjNote.DefaultIfEmpty()

                                       join pat in _clinicalDbContext.Patients on note.PatientId equals pat.PatientId
                                       join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                                       join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                                       from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()

                                       join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                                       join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                                       from noteType in noteTypeTemp.DefaultIfEmpty()
                                       where note.NotesId == NoteId
                                       select new
                                       {
                                           note.PatientId,
                                           note.PatientVisitId,
                                           note.NotesId,
                                           note.IsPending,
                                           note.FollowUp,
                                           note.FollowUpUnit,
                                           note.Remarks,
                                           WrittenBy = emp.FullName,
                                           noteType.NoteType,
                                           PrimaryDoctor = primaryDoc.FullName,
                                           SecondaryDoctor = secondaryDoc.FullName,
                                           pat.Age,
                                           Sex = pat.Gender,
                                           PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
                                           EmergencyNote = ernote,
                                           DispositionDepartment = _clinicalDbContext.Departments.FirstOrDefault(a => a.DepartmentId == ernote.DispositionDepartmentId).DepartmentName,
                                           SubjectiveNote = subjNote,
                                           ObjectiveNote = objNote,
                                           DiagnosisOrdersList = (from allDiagnosis in _clinicalDbContext.ClinicalDiagnosis
                                                                  where allDiagnosis.NotesId == NoteId && allDiagnosis.IsActive == true
                                                                  select new
                                                                  {
                                                                      allDiagnosis.DiagnosisId,
                                                                      IsEditable = true,
                                                                      ICD = (from icd in _clinicalDbContext.ICD10
                                                                             where icd.ICD10ID == allDiagnosis.ICD10ID
                                                                             select new
                                                                             {
                                                                                 icd.ICD10Code,
                                                                                 icd.ICD10Description,
                                                                                 icd.ICD10ID,
                                                                                 icd.ICDShortCode,
                                                                                 icd.ValidForCoding
                                                                             }),


                                                                      AllIcdLabOrders = (from allLab in _clinicalDbContext.LabRequisitions
                                                                                         where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus != "cancel"
                                                                                         select new
                                                                                         {
                                                                                             ItemId = allLab.LabTestId,
                                                                                             ItemName = allLab.LabTestName,
                                                                                             PreferenceType = "Lab",
                                                                                             IsGeneric = false,
                                                                                         }
                                                                                       ).ToList(),
                                                                      AllIcdImagingOrders = (from allImaging in _clinicalDbContext.ImagingRequisitions
                                                                                             where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
                                                                                             select new
                                                                                             {
                                                                                                 ItemId = allImaging.ImagingItemId,
                                                                                                 ItemName = allImaging.ImagingItemName,
                                                                                                 allImaging.ImagingTypeId,
                                                                                                 PreferenceType = "Imaging",
                                                                                                 IsGeneric = false,

                                                                                             }).ToList(),
                                                                      AllIcdPrescriptionOrders = (from allMedication in _clinicalDbContext.PHRMPrescriptionItems
                                                                                                  where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
                                                                                                  select new
                                                                                                  {
                                                                                                      allMedication.ItemId,
                                                                                                      _clinicalDbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
                                                                                                      allMedication.Quantity,
                                                                                                      allMedication.Frequency,
                                                                                                      allMedication.HowManyDays,
                                                                                                      allMedication.Dosage,
                                                                                                      allMedication.GenericId,
                                                                                                      PreferenceType = "Medication",
                                                                                                      IsGeneric = false,
                                                                                                  }).ToList(),

                                                                  }).ToList()
                                       }).FirstOrDefault();
            return emergencyNoteDetail;
        }
        private object GetHistoryAndPhysicalNoteDetail(int NoteId)
        {
            var hpNote = (from note in _clinicalDbContext.Notes
                          join sNote in _clinicalDbContext.SubjectiveNotes on note.NotesId equals sNote.NotesId into tempSubNote
                          from subjNote in tempSubNote.DefaultIfEmpty()
                          join obNote in _clinicalDbContext.ObjectiveNotes on note.NotesId equals obNote.NotesId into tempObjNote
                          from objNote in tempObjNote.DefaultIfEmpty()

                          join pat in _clinicalDbContext.Patients on note.PatientId equals pat.PatientId
                          join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                          join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                          from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()

                          join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                          join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                          from noteType in noteTypeTemp.DefaultIfEmpty()
                          where note.NotesId == NoteId
                          select new
                          {
                              note.PatientId,
                              note.PatientVisitId,
                              note.NotesId,
                              note.IsPending,
                              note.FollowUp,
                              note.FollowUpUnit,
                              note.Remarks,
                              WrittenBy = emp.FullName,
                              noteType.NoteType,
                              PrimaryDoctor = primaryDoc.FullName,
                              SecondaryDoctor = secondaryDoc.FullName,
                              pat.Age,
                              Sex = pat.Gender,
                              PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
                              SubjectiveNote = subjNote,
                              ObjectiveNote = objNote,
                              DiagnosisOrdersList = (from allDiagnosis in _clinicalDbContext.ClinicalDiagnosis
                                                     where allDiagnosis.NotesId == NoteId && allDiagnosis.IsActive == true
                                                     select new
                                                     {
                                                         allDiagnosis.DiagnosisId,
                                                         IsEditable = true,
                                                         ICD = (from icd in _clinicalDbContext.ICD10
                                                                where icd.ICD10ID == allDiagnosis.ICD10ID
                                                                select new
                                                                {
                                                                    icd.ICD10Code,
                                                                    icd.ICD10Description,
                                                                    icd.ICD10ID,
                                                                    icd.ICDShortCode,
                                                                    icd.ValidForCoding
                                                                }),


                                                         AllIcdLabOrders = (from allLab in _clinicalDbContext.LabRequisitions
                                                                            where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus != "cancel"
                                                                            select new
                                                                            {
                                                                                ItemId = allLab.LabTestId,
                                                                                ItemName = allLab.LabTestName,
                                                                                PreferenceType = "Lab",
                                                                                IsGeneric = false,
                                                                            }
                                                                          ).ToList(),
                                                         AllIcdImagingOrders = (from allImaging in _clinicalDbContext.ImagingRequisitions
                                                                                where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
                                                                                select new
                                                                                {
                                                                                    ItemId = allImaging.ImagingItemId,
                                                                                    ItemName = allImaging.ImagingItemName,
                                                                                    allImaging.ImagingTypeId,
                                                                                    PreferenceType = "Imaging",
                                                                                    IsGeneric = false,

                                                                                }).ToList(),
                                                         AllIcdPrescriptionOrders = (from allMedication in _clinicalDbContext.PHRMPrescriptionItems
                                                                                     where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
                                                                                     select new
                                                                                     {
                                                                                         allMedication.ItemId,
                                                                                         _clinicalDbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
                                                                                         allMedication.Quantity,
                                                                                         allMedication.Frequency,
                                                                                         allMedication.HowManyDays,
                                                                                         allMedication.Dosage,
                                                                                         allMedication.GenericId,
                                                                                         PreferenceType = "Medication",
                                                                                         IsGeneric = false,
                                                                                     }).ToList(),

                                                     }).ToList()
                          }).FirstOrDefault();
            return hpNote;
        }
        private object GetProgressNoteTemplateDetail(int NoteId)
        {
            var viewnotes = (from progressnote in _clinicalDbContext.ProgressNote
                             join note in _clinicalDbContext.Notes on progressnote.NotesId equals note.NotesId
                             join pat in _clinicalDbContext.Patients on progressnote.PatientId equals pat.PatientId
                             join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                             join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                             from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where progressnote.NotesId == NoteId
                             select new
                             {
                                 progressnote.NotesId,
                                 progressnote.SubjectiveNotes,
                                 progressnote.ObjectiveNotes,
                                 progressnote.AssessmentPlan,
                                 progressnote.Instructions,
                                 progressnote.ProgressNoteId,
                                 progressnote.CreatedOn,
                                 progressnote.ModifiedOn,
                                 note.IsPending,
                                 WrittenBy = emp.FullName,
                                 noteType.NoteType,
                                 PrimaryDoctor = primaryDoc.FullName,
                                 SecondaryDoctor = secondaryDoc.FullName,
                                 pat.Age,
                                 Sex = pat.Gender,
                                 PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

                             }).ToList();
            return viewnotes;
        }
        private object GetFreeTextNoteTemplateDetail(int NoteId)
        {
            var viewnotes = (from freenotes in _clinicalDbContext.FreeText
                             join note in _clinicalDbContext.Notes on freenotes.NotesId equals note.NotesId
                             join pat in _clinicalDbContext.Patients on freenotes.PatientId equals pat.PatientId
                             join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                             join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                             from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where freenotes.NotesId == NoteId
                             select new
                             {
                                 freenotes.NotesId,
                                 freenotes.FreeText,
                                 freenotes.FreeTextId,
                                 freenotes.CreatedOn,
                                 freenotes.ModifiedOn,
                                 WrittenBy = emp.FullName,
                                 noteType.NoteType,
                                 note.TemplateName,
                                 PrimaryDoctor = primaryDoc.FullName,
                                 SecondaryDoctor = secondaryDoc.FullName,
                                 note.IsPending,
                                 pat.Age,
                                 Sex = pat.Gender,
                                 pat.Address,
                                 PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

                             }).ToList();
            return viewnotes;
        }

        private object GetProcedureNoteTemplateDetail(int NoteId)
        {
            var viewnotes = (from procedutenote in _clinicalDbContext.ProcedureNote
                             join note in _clinicalDbContext.Notes on procedutenote.NotesId equals note.NotesId
                             join pat in _clinicalDbContext.Patients on procedutenote.PatientId equals pat.PatientId
                             join primaryDoc in _clinicalDbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
                             join sd in _clinicalDbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
                             from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
                             join emp in _clinicalDbContext.Employee on note.CreatedBy equals emp.EmployeeId
                             join nt in _clinicalDbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
                             from noteType in noteTypeTemp.DefaultIfEmpty()
                             where procedutenote.NotesId == NoteId
                             select new
                             {
                                 procedutenote.NotesId,
                                 procedutenote.ProcedureNoteId,
                                 procedutenote.LinesProse,
                                 procedutenote.FreeText,
                                 procedutenote.Site,
                                 procedutenote.Remarks,
                                 procedutenote.CreatedOn,
                                 procedutenote.ModifiedOn,
                                 WrittenBy = emp.FullName,
                                 note.IsPending,
                                 noteType.NoteType,
                                 PrimaryDoctor = primaryDoc.FullName,
                                 SecondaryDoctor = secondaryDoc.FullName,
                                 pat.Age,
                                 Sex = pat.Gender,
                                 PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

                             }).ToList();
            return viewnotes;
        }
        private object GetPatientClinicalDetail(int patientVisitId, int patientId)
        {
            PatientClinicalDetailVM clinicalDetail = new PatientClinicalDetailVM();
            clinicalDetail.PatientId = patientId;
            clinicalDetail.PatientVisitId = patientVisitId;
            clinicalDetail.NotesId = 0;
            clinicalDetail.PastMedicals = (from pastMedical in _clinicalDbContext.PastMedicals
                                           where pastMedical.PatientId == clinicalDetail.PatientId
                                           select pastMedical).OrderByDescending(a => a.CreatedOn).ToList();

            clinicalDetail.SocialHistory = (from socialHistory in _clinicalDbContext.SocialHistory
                                            where socialHistory.PatientId == clinicalDetail.PatientId
                                            select socialHistory).OrderByDescending(a => a.CreatedOn).ToList();


            clinicalDetail.SurgicalHistory = (from surgicalHistory in _clinicalDbContext.SurgicalHistory
                                              where surgicalHistory.PatientId == clinicalDetail.PatientId
                                              select surgicalHistory).OrderByDescending(a => a.CreatedOn).ToList();


            clinicalDetail.FamilyHistory = (from familyHistory in _clinicalDbContext.FamilyHistory
                                            where familyHistory.PatientId == clinicalDetail.PatientId
                                            select familyHistory).OrderByDescending(a => a.CreatedOn).ToList();

            clinicalDetail.Allergies = (from allergy in _clinicalDbContext.Allergy
                                        where allergy.PatientId == clinicalDetail.PatientId
                                        select allergy).OrderByDescending(a => a.CreatedOn).ToList();

            clinicalDetail.Vitals = (from vital in _clinicalDbContext.Vitals
                                     where vital.PatientVisitId == clinicalDetail.PatientVisitId
                                     select vital).OrderByDescending(a => a.CreatedOn).ToList();

            return clinicalDetail;
        }
        private object GetMedicationPrescription(int patientId)
        {
            List<MedicationPrescriptionModel> prescriptionList = _clinicalDbContext.MedicationPrescriptions
                                                           .Where(p => p.PatientId == patientId).ToList();

            //assinging MedicationName and EmployeeName;
            List<PHRMItemMasterModel> medicationList = _pharmDbContext.PHRMItemMaster.ToList();
            List<EmployeeModel> employeeList = _masterDbContext.Employees.ToList();
            foreach (var pres in prescriptionList)
            {
                if (pres.MedicationId != 0)
                {
                    pres.MedicationName = medicationList
                                                .Where(a => a.ItemId == pres.MedicationId).FirstOrDefault().ItemName;
                }
                if (pres.PerformerId != 0)
                {
                    pres.PerformerName = employeeList
                   .Where(e => e.EmployeeId == pres.PerformerId)
                   .Select(e => e.FullName).FirstOrDefault();
                }
            }
            return prescriptionList;
        }
        private object GetHomeMedication(int patientId)
        {
            List<HomeMedicationModel> homeMedicationList = _clinicalDbContext.HomeMedications
                                        .Where(p => p.PatientId == patientId).ToList();
            //assigning the MedicaitonName
            List<PHRMItemMasterModel> medicationList = _pharmDbContext.PHRMItemMaster.ToList();

            foreach (var homeMed in homeMedicationList)
            {
                if (homeMed.MedicationId != 0)
                {
                    homeMed.MedicationName = medicationList
                                              .Where(a => a.ItemId == homeMed.MedicationId).FirstOrDefault().ItemName;
                }
            }
            return homeMedicationList;

        }
        private object GetVitals(int patientVisitId)
        {

            List<VitalsViewModel> vitalsList = _clinicalDbContext.Vitals.Where(p => p.PatientVisitId == patientVisitId).Select(v => new VitalsViewModel
            {
                VitalsTakenOn = v.VitalsTakenOn,
                PatientVisitId = v.Visit.PatientVisitId,
                PatientVitalId = v.PatientVitalId,
                PainScale = v.PainScale,
                Height = v.Height,
                HeightUnit = v.HeightUnit,
                Weight = v.Weight,
                WeightUnit = v.WeightUnit,
                Temperature = v.Temperature,
                TemperatureUnit = v.TemperatureUnit,
                BMI = v.BMI,
                Pulse = v.Pulse,
                BPDiastolic = v.BPDiastolic,
                BPSystolic = v.BPSystolic,
                RespiratoryRatePerMin = v.RespiratoryRatePerMin,
                SpO2 = v.SpO2,
                OxygenDeliveryMethod = v.OxygenDeliveryMethod,
                BodyPart = v.BodyPart,
                Advice = v.Advice,
                FreeNotes = v.FreeNotes,
                DiagnosisType = v.DiagnosisType,
                Diagnosis = v.Diagnosis,
                CreatedOn = v.CreatedOn
            }).ToList();


            if (vitalsList.Count < 3)
            {
                var patId = _clinicalDbContext.Visit.Find(patientVisitId).PatientId;
                var olderPatientVisitId = _clinicalDbContext.Visit.Where(a => a.PatientId == patId && a.PatientVisitId != patientVisitId).Select(a => a.PatientVisitId).ToList().LastOrDefault();
                if (olderPatientVisitId != 0)
                {
                    vitalsList.AddRange(_clinicalDbContext.Vitals.Where(p => p.PatientVisitId == olderPatientVisitId)
                        .Select(v => new VitalsViewModel
                        {
                            VitalsTakenOn = v.VitalsTakenOn,
                            PatientVisitId = v.Visit.PatientVisitId,
                            PatientVitalId = v.PatientVitalId,
                            PainScale = v.PainScale,
                            Height = v.Height,
                            HeightUnit = v.HeightUnit,
                            Weight = v.Weight,
                            WeightUnit = v.WeightUnit,
                            Temperature = v.Temperature,
                            TemperatureUnit = v.TemperatureUnit,
                            BMI = v.BMI,
                            Pulse = v.Pulse,
                            BPDiastolic = v.BPDiastolic,
                            BPSystolic = v.BPSystolic,
                            RespiratoryRatePerMin = v.RespiratoryRatePerMin,
                            SpO2 = v.SpO2,
                            OxygenDeliveryMethod = v.OxygenDeliveryMethod,
                            BodyPart = v.BodyPart,
                            Advice = v.Advice,
                            FreeNotes = v.FreeNotes,
                            DiagnosisType = v.DiagnosisType,
                            Diagnosis = v.Diagnosis,
                            CreatedOn = v.CreatedOn
                        }).ToList());
                }
            }
            return vitalsList;
        }


        //[HttpGet]
        //public string Get(string reqType, int patientId, int patientVisitId, int notesId, int providerId, int masterId , int NotesId )
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    ClinicalDbContext dbContext = new ClinicalDbContext(connString);
        //    PatientDbContext patientdbContext = new PatientDbContext(connString);
        //    try
        //    {
        //        if (reqType == "vitals" && patientVisitId != 0)
        //        {
        //            List<VitalsModel> vitalsList = dbContext.Vitals
        //                                        .Where(p => p.PatientVisitId == patientVisitId).ToList();
        //if (vitalsList.Count < 3)
        //{
        //    var patId = dbContext.Visit.Find(patientVisitId).PatientId;
        //    var olderPatientVisitId = dbContext.Visit.Where(a => a.PatientId == patId && a.PatientVisitId != patientVisitId).Select(a => a.PatientVisitId).ToList().LastOrDefault();
        //    if (olderPatientVisitId != 0)
        //    {
        //        vitalsList.AddRange(dbContext.Vitals.Where(p => p.PatientVisitId == olderPatientVisitId).ToList());
        //    }
        //}
        //    responseData.Results = vitalsList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "ProviderLongSignature" && providerId != 0)
        //{
        //List<EmployeeModel> signatureList = dbContext.Employee
        //                            .Where(p => p.EmployeeId == providerId).ToList();
        //responseData.Results = signatureList;
        //responseData.Status = "OK";
        //}


        //else if (reqType == "inputoutput" && patientVisitId != 0)
        //{
        //List<InputOutputModel> ioList = dbContext.InputOutput
        //                                .Where(p => p.PatientVisitId == patientVisitId).ToList();
        //responseData.Results = ioList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "PrescriptionHistory")
        //{
        //var PrescriptionHistoryList = dbContext.ClinicalPrescriptionSlipMaster.Where(a => a.PatientId == patientId);
        //responseData.Results = PrescriptionHistoryList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allergy" && patientId != 0)
        //{
        //List<AllergyModel> allergyList = dbContext.Allergy
        //.Where(p => p.PatientId == patientId).OrderByDescending(alrg => alrg.CreatedOn).ToList();

        //Commented: sud-15June'18--We don't need phrmdb context now as we're adding AllergyName in db itself.
        ////assigning the AllergenAdvRecName
        //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //List<PHRMGenericModel> genericList = phrmDbContext.PHRMGenericModel.ToList();
        //foreach (var allergy in allergyList)
        //{
        //    if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null)
        //    {
        //        allergy.AllergenAdvRecName = genericList
        //                                    .Where(a => a.GenericId == allergy.AllergenAdvRecId).FirstOrDefault().GenericName;
        //    }
        //    if (allergy.AllergyType == "Others")
        //    {
        //        allergy.AllergenAdvRecName = allergy.Others;
        //    }

        //}

        //    responseData.Results = allergyList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "homemedication" && patientId != 0)
        //{
        //    List<HomeMedicationModel> homeMedicationList = dbContext.HomeMedications
        //                                .Where(p => p.PatientId == patientId).ToList();
        //assigning the MedicaitonName
        //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //List<PHRMItemMasterModel> medicationList = phrmDbContext.PHRMItemMaster.ToList();

        //foreach (var homeMed in homeMedicationList)
        //{
        //    if (homeMed.MedicationId != 0)
        //    {
        //        homeMed.MedicationName = medicationList
        //                                  .Where(a => a.ItemId == homeMed.MedicationId).FirstOrDefault().ItemName;
        //    }
        //}
        //responseData.Results = homeMedicationList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "medicationprescription" && patientId != 0)
        //{
        //List<MedicationPrescriptionModel> prescriptionList = dbContext.MedicationPrescriptions
        //                            .Where(p => p.PatientId == patientId).ToList();

        ////assinging MedicationName and EmployeeName
        //MasterDbContext masterDbContext = new MasterDbContext(connString);
        //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

        //List<PHRMItemMasterModel> medicationList = phrmDbContext.PHRMItemMaster.ToList();
        //List<EmployeeModel> employeeList = masterDbContext.Employees.ToList();
        //foreach (var pres in prescriptionList)
        //{
        //    if (pres.MedicationId != 0)
        //    {
        //        pres.MedicationName = medicationList
        //                                    .Where(a => a.ItemId == pres.MedicationId).FirstOrDefault().ItemName;
        //    }
        //    if (pres.PerformerId != 0)
        //    {
        //        pres.PerformerName = employeeList
        //       .Where(e => e.EmployeeId == pres.PerformerId)
        //       .Select(e => e.FullName).FirstOrDefault();
        //    }
        //}
        //responseData.Results = prescriptionList;
        //    responseData.Status = "OK";
        //}

        //else if (reqType == "activemedical" && patientId != 0)
        //{

        //List<ActiveMedicalProblem> activeProblemList = dbContext.ActiveMedical
        //                                .Where(p => p.PatientId == patientId
        //                                && p.IsResolved == false).ToList();
        //responseData.Results = activeProblemList;
        //    responseData.Status = "OK";
        //}

        //else if (reqType == "pastmedical" && patientId != 0)
        //{
        //List<PastMedicalProblem> pastProblemList = dbContext.PastMedicals
        //                            .Where(p => p.PatientId == patientId).ToList();
        //responseData.Results = pastProblemList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "familyhistory" && patientId != 0)
        //{
        //List<FamilyHistory> familyHistoryList = dbContext.FamilyHistory
        //                              .Where(p => p.PatientId == patientId).ToList();
        //responseData.Results = familyHistoryList;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "surgicalhistory" && patientId != 0)
        //{
        //List<SurgicalHistory> surgicalHistoryList = dbContext.SurgicalHistory
        //                            .Where(p => p.PatientId == patientId).ToList();
        //responseData.Results = surgicalHistoryList;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "socialhistory" && patientId != 0)
        //{
        //List<SocialHistory> socialHistoryList = dbContext.SocialHistory
        //                            .Where(p => p.PatientId == patientId).ToList();
        //responseData.Results = socialHistoryList;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "referralsource" && patientId != 0)
        //{
        //List<ReferralSource> referralSourceList = dbContext.ReferralSource
        //                            .Where(p => p.PatientId == patientId).ToList();
        //responseData.Results = referralSourceList;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "notes" && patientVisitId != 0 && patientId != 0) //Prem: 1st Feb: Not in used
        //{

        //    PatientModel patientModel = new PatientModel();
        //    PatientDbContext dbContextcommand = new PatientDbContext(connString);
        //    patientModel = (from pat in dbContextcommand.Patients
        //                    where pat.PatientId == patientId
        //                    select pat).Include(a => a.Visits.Select(v => v.Vitals))
        //                    .Include(a => a.Visits.Select(v => v.Notes))
        //                     .Include(a => a.Problems)
        //                     .Include(a => a.PastMedicals)
        //                     .Include(a => a.Allergies)
        //                     .Include(a => a.HomeMedication)
        //                     .Include(a => a.SocialHistory)
        //                     .FirstOrDefault<PatientModel>();

        //needs review was not able to inputoutput.
        //thorws exception invalid column PatientModel_PatientId.

        //add vitals,notes and inputoutputs to patient
        //if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
        //{
        //    patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
        //    //take last three vitals only.. 
        //    if (patientModel.Vitals.Count != 0 && patientModel.Vitals != null)
        //    {
        //        patientModel.Vitals = patientModel.Vitals
        //                                  .Where(a => a.PatientVisitId == patientVisitId)
        //                                  .OrderByDescending(a => a.CreatedOn).Take(3).ToList();
        //    }
        //    if (patientModel.Notes != null && patientModel.Vitals.Count != 0)
        //    {
        //        patientModel.Notes = patientModel.Notes
        //                              .Where(a => a.PatientVisitId == patientVisitId)
        //                              .OrderByDescending(a => a.CreatedOn).ToList();
        //    }


        //}
        //remove resolved problems
        //    if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
        //    {
        //        patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
        //    }

        //    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

        //    List<PHRMItemMasterModel> medList = phrmDbContext.PHRMItemMaster.ToList();
        //    //add medicationname to medications
        //    if (patientModel != null && patientModel.HomeMedication != null && patientModel.HomeMedication.Count > 0)
        //    {
        //        foreach (var med in patientModel.HomeMedication)
        //        {
        //            if (med.MedicationId != 0)
        //            {
        //                med.MedicationName = medList.Where(a => a.ItemId == med.MedicationId)
        //                                     .FirstOrDefault().ItemName;
        //            }
        //        }
        //    }
        //    //add name to allergies
        //    if (patientModel != null && patientModel.Allergies != null && patientModel.Allergies.Count > 0)
        //    {
        //        foreach (var allergy in patientModel.Allergies)
        //        {
        //            if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null)
        //            {
        //                allergy.AllergenAdvRecName = medList.Where(a => a.ItemId == allergy.AllergenAdvRecId)
        //                                             .FirstOrDefault().ItemName;
        //            }
        //        }
        //    }
        //    responseData.Status = "OK";
        //    responseData.Results = patientModel;
        //}
        //else if (reqType == "patient-clinicaldetail")
        //{
        //PatientClinicalDetailVM clinicalDetail = new PatientClinicalDetailVM();
        //clinicalDetail.PatientId = patientId;
        //clinicalDetail.PatientVisitId = patientVisitId;
        //clinicalDetail.NotesId = 0;
        //clinicalDetail.PastMedicals = (from pastMedical in dbContext.PastMedicals
        //                               where pastMedical.PatientId == clinicalDetail.PatientId
        //                               select pastMedical).OrderByDescending(a => a.CreatedOn).ToList();

        //clinicalDetail.SocialHistory = (from socialHistory in dbContext.SocialHistory
        //                                where socialHistory.PatientId == clinicalDetail.PatientId
        //                                select socialHistory).OrderByDescending(a => a.CreatedOn).ToList();


        //clinicalDetail.SurgicalHistory = (from surgicalHistory in dbContext.SurgicalHistory
        //                                  where surgicalHistory.PatientId == clinicalDetail.PatientId
        //                                  select surgicalHistory).OrderByDescending(a => a.CreatedOn).ToList();


        //clinicalDetail.FamilyHistory = (from familyHistory in dbContext.FamilyHistory
        //                                where familyHistory.PatientId == clinicalDetail.PatientId
        //                                select familyHistory).OrderByDescending(a => a.CreatedOn).ToList();

        //clinicalDetail.Allergies = (from allergy in dbContext.Allergy
        //                            where allergy.PatientId == clinicalDetail.PatientId
        //                            select allergy).OrderByDescending(a => a.CreatedOn).ToList();

        //clinicalDetail.Vitals = (from vital in dbContext.Vitals
        //                         where vital.PatientVisitId == clinicalDetail.PatientVisitId
        //                         select vital).OrderByDescending(a => a.CreatedOn).ToList();

        //responseData.Results = clinicalDetail;
        //responseData.Status = "OK";

        //}
        ///View Notes Template
        //else if (reqType == "getNoteTypeList")
        //{

        //var noteTypeList = (from noteType in dbContext.NoteType
        //                    where noteType.IsActive !=false
        //                    select noteType
        //                    ).ToList();
        //responseData.Status = "OK";
        //responseData.Results = noteTypeList;
        //}
        //else if (reqType == "getTemplateList")
        //{

        //    //var templatelist = (from templatenotelist in dbContext.TemplateNotes
        //    //                    where templatenotelist.IsActive !=false
        //    //                    select templatenotelist
        //    //                    ).ToList();
        //    //responseData.Status = "OK";
        //    //responseData.Results = templatelist;
        //}
        //else if (reqType == "getFreeTextTemplateList")
        //{
        //var viewnotes = (from freenotes in dbContext.FreeText
        //                 join note in dbContext.Notes on freenotes.NotesId equals note.NotesId
        //                 join pat in dbContext.Patients on freenotes.PatientId equals pat.PatientId
        //                 join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                 join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //                 from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
        //                 join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                 join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                 from noteType in noteTypeTemp.DefaultIfEmpty()
        //                 where freenotes.NotesId == NotesId
        //                 select new
        //                 {
        //                     freenotes.NotesId,
        //                     freenotes.FreeText,
        //                     freenotes.FreeTextId,
        //                     freenotes.CreatedOn,
        //                     freenotes.ModifiedOn,
        //                     WrittenBy = emp.FullName,
        //                     noteType.NoteType,
        //                     note.TemplateName,
        //                     PrimaryDoctor = primaryDoc.FullName,
        //                     SecondaryDoctor = secondaryDoc.FullName,
        //                     note.IsPending,
        //                     pat.Age,
        //                     Sex = pat.Gender,
        //                     pat.Address,
        //                     PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

        //                 }).ToList();
        //responseData.Results = viewnotes;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "getProcedureNoteTemplateList")
        //{
        //var viewnotes = (from procedutenote in dbContext.ProcedureNote
        //                 join note in dbContext.Notes on procedutenote.NotesId equals note.NotesId
        //                 join pat in dbContext.Patients on procedutenote.PatientId equals pat.PatientId
        //                 join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                 join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //                 from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
        //                 join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                 join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                 from noteType in noteTypeTemp.DefaultIfEmpty()
        //                 where procedutenote.NotesId == NotesId
        //                 select new
        //                 {
        //                     procedutenote.NotesId,
        //                     procedutenote.ProcedureNoteId,
        //                     procedutenote.LinesProse,
        //                     procedutenote.FreeText,
        //                     procedutenote.Site,
        //                     procedutenote.Remarks,
        //                     procedutenote.CreatedOn,
        //                     procedutenote.ModifiedOn,
        //                     WrittenBy = emp.FullName,
        //                     note.IsPending,
        //                     noteType.NoteType,
        //                     PrimaryDoctor = primaryDoc.FullName,
        //                     SecondaryDoctor = secondaryDoc.FullName,
        //                     pat.Age,
        //                     Sex = pat.Gender,
        //                     PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

        //                 }).ToList();
        //responseData.Results = viewnotes;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "getProgressNoteTemplateList")
        //{
        //var viewnotes = (from progressnote in dbContext.ProgressNote
        //                 join note in dbContext.Notes on progressnote.NotesId equals note.NotesId
        //                 join pat in dbContext.Patients on progressnote.PatientId equals pat.PatientId
        //                 join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                 join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //                 from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
        //                 join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                 join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                 from noteType in noteTypeTemp.DefaultIfEmpty()
        //                 where progressnote.NotesId == NotesId
        //                 select new
        //                 {
        //                     progressnote.NotesId,
        //                     progressnote.SubjectiveNotes,
        //                     progressnote.ObjectiveNotes,
        //                     progressnote.AssessmentPlan,
        //                     progressnote.Instructions,
        //                     progressnote.ProgressNoteId,
        //                     progressnote.CreatedOn,
        //                     progressnote.ModifiedOn,
        //                     note.IsPending,
        //                     WrittenBy = emp.FullName,
        //                     noteType.NoteType,
        //                     PrimaryDoctor = primaryDoc.FullName,
        //                     SecondaryDoctor = secondaryDoc.FullName,
        //                     pat.Age,
        //                     Sex = pat.Gender,
        //                     PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

        //                 }).ToList();
        //responseData.Results = viewnotes;
        //responseData.Status = "OK";
        //}               
        //else if (reqType == "getHistoryAndPhysicalNoteById")
        //{

        //var hpNote = (from note in dbContext.Notes
        //                 join sNote in dbContext.SubjectiveNotes on note.NotesId equals sNote.NotesId into tempSubNote
        //                 from subjNote in tempSubNote.DefaultIfEmpty()
        //                 join obNote in dbContext.ObjectiveNotes on note.NotesId equals obNote.NotesId into tempObjNote
        //                 from objNote in tempObjNote.DefaultIfEmpty()

        //                 join pat in dbContext.Patients on note.PatientId equals pat.PatientId
        //                 join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                 join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //                 from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()

        //                 join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                 join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                 from noteType in noteTypeTemp.DefaultIfEmpty()
        //                 where note.NotesId == NotesId
        //                 select new
        //                 {
        //                     note.PatientId,
        //                     note.PatientVisitId,
        //                     note.NotesId,                                         
        //                     note.IsPending,
        //                     note.FollowUp,
        //                     note.FollowUpUnit,
        //                     note.Remarks,
        //                     WrittenBy = emp.FullName,
        //                     noteType.NoteType,
        //                     PrimaryDoctor = primaryDoc.FullName,
        //                     SecondaryDoctor = secondaryDoc.FullName,
        //                     pat.Age,
        //                     Sex = pat.Gender,
        //                     PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
        //                     SubjectiveNote = subjNote,
        //                     ObjectiveNote = objNote,
        //                     DiagnosisOrdersList = (from allDiagnosis in dbContext.ClinicalDiagnosis
        //                                            where allDiagnosis.NotesId == NotesId && allDiagnosis.IsActive == true
        //                                            select new
        //                                            {
        //                                                allDiagnosis.DiagnosisId,
        //                                                IsEditable = true,
        //                                                ICD = (from icd in dbContext.ICD10
        //                                                       where icd.ICD10ID == allDiagnosis.ICD10ID
        //                                                       select new
        //                                                       {
        //                                                           icd.ICD10Code,
        //                                                           icd.ICD10Description,
        //                                                           icd.ICD10ID,
        //                                                           icd.ICDShortCode,
        //                                                           icd.ValidForCoding
        //                                                       }),


        //                                                AllIcdLabOrders = (from allLab in dbContext.LabRequisitions
        //                                                                   where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus != "cancel"
        //                                                                   select new
        //                                                                   {
        //                                                                       ItemId = allLab.LabTestId,
        //                                                                       ItemName = allLab.LabTestName,
        //                                                                       PreferenceType = "Lab",
        //                                                                       IsGeneric = false,
        //                                                                   }
        //                                                                 ).ToList(),
        //                                                AllIcdImagingOrders = (from allImaging in dbContext.ImagingRequisitions
        //                                                                       where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
        //                                                                       select new
        //                                                                       {
        //                                                                           ItemId = allImaging.ImagingItemId,
        //                                                                           ItemName = allImaging.ImagingItemName,
        //                                                                           allImaging.ImagingTypeId,
        //                                                                           PreferenceType = "Imaging",
        //                                                                           IsGeneric = false,

        //                                                                       }).ToList(),
        //                                                AllIcdPrescriptionOrders = (from allMedication in dbContext.PHRMPrescriptionItems
        //                                                                            where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
        //                                                                            select new
        //                                                                            {
        //                                                                                allMedication.ItemId,
        //                                                                                dbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
        //                                                                                allMedication.Quantity,
        //                                                                                allMedication.Frequency,
        //                                                                                allMedication.HowManyDays,
        //                                                                                allMedication.Dosage,
        //                                                                                allMedication.GenericId,
        //                                                                                PreferenceType = "Medication",
        //                                                                                IsGeneric = false,
        //                                                                            }).ToList(),

        //                                            }).ToList()
        //                 }).FirstOrDefault();
        //responseData.Results = hpNote;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "getEmergencyNoteById")
        //{
        //var erNote = (from note in dbContext.Notes
        //              join ernote in dbContext.EmergencyNote on note.NotesId equals ernote.NotesId
        //              join sNote in dbContext.SubjectiveNotes on note.NotesId equals sNote.NotesId into tempSubNote
        //              from subjNote in tempSubNote.DefaultIfEmpty()
        //              join obNote in dbContext.ObjectiveNotes on note.NotesId equals obNote.NotesId into tempObjNote
        //              from objNote in tempObjNote.DefaultIfEmpty()

        //              join pat in dbContext.Patients on note.PatientId equals pat.PatientId
        //              join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //              join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //              from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()

        //              join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //              join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //              from noteType in noteTypeTemp.DefaultIfEmpty()
        //              where note.NotesId == NotesId
        //              select new
        //              {
        //                  note.PatientId,
        //                  note.PatientVisitId,
        //                  note.NotesId,
        //                  note.IsPending,
        //                  note.FollowUp,
        //                  note.FollowUpUnit,
        //                  note.Remarks,
        //                  WrittenBy = emp.FullName,
        //                  noteType.NoteType,
        //                  PrimaryDoctor = primaryDoc.FullName,
        //                  SecondaryDoctor = secondaryDoc.FullName,
        //                  pat.Age,
        //                  Sex = pat.Gender,
        //                  PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
        //                  EmergencyNote = ernote,
        //                  DispositionDepartment = dbContext.Departments.FirstOrDefault(a => a.DepartmentId == ernote.DispositionDepartmentId).DepartmentName,
        //                  SubjectiveNote = subjNote,
        //                  ObjectiveNote = objNote,
        //                  DiagnosisOrdersList = (from allDiagnosis in dbContext.ClinicalDiagnosis
        //                                         where allDiagnosis.NotesId == NotesId && allDiagnosis.IsActive == true
        //                                         select new
        //                                         {
        //                                             allDiagnosis.DiagnosisId,
        //                                             IsEditable = true,
        //                                             ICD = (from icd in dbContext.ICD10
        //                                                    where icd.ICD10ID == allDiagnosis.ICD10ID
        //                                                    select new
        //                                                    {
        //                                                        icd.ICD10Code,
        //                                                        icd.ICD10Description,
        //                                                        icd.ICD10ID,
        //                                                        icd.ICDShortCode,
        //                                                        icd.ValidForCoding
        //                                                    }),


        //                                             AllIcdLabOrders = (from allLab in dbContext.LabRequisitions
        //                                                                where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus != "cancel"
        //                                                                select new
        //                                                                {
        //                                                                    ItemId = allLab.LabTestId,
        //                                                                    ItemName = allLab.LabTestName,
        //                                                                    PreferenceType = "Lab",
        //                                                                    IsGeneric = false,
        //                                                                }
        //                                                              ).ToList(),
        //                                             AllIcdImagingOrders = (from allImaging in dbContext.ImagingRequisitions
        //                                                                    where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
        //                                                                    select new
        //                                                                    {
        //                                                                        ItemId = allImaging.ImagingItemId,
        //                                                                        ItemName = allImaging.ImagingItemName,
        //                                                                        allImaging.ImagingTypeId,
        //                                                                        PreferenceType = "Imaging",
        //                                                                        IsGeneric = false,

        //                                                                    }).ToList(),
        //                                             AllIcdPrescriptionOrders = (from allMedication in dbContext.PHRMPrescriptionItems
        //                                                                         where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
        //                                                                         select new
        //                                                                         {
        //                                                                             allMedication.ItemId,
        //                                                                             dbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
        //                                                                             allMedication.Quantity,
        //                                                                             allMedication.Frequency,
        //                                                                             allMedication.HowManyDays,
        //                                                                             allMedication.Dosage,
        //                                                                             allMedication.GenericId,
        //                                                                             PreferenceType = "Medication",
        //                                                                             IsGeneric = false,
        //                                                                         }).ToList(),

        //                                         }).ToList()
        //              }).FirstOrDefault();
        //responseData.Results = erNote;
        //    //responseData.Status = "OK";
        //}
        //else if (reqType == "getClinicalPrescriptionNoteById")
        //{
        //var viewnotes = (from note in dbContext.Notes 
        //                 join prescription in dbContext.ClinicalPrescriptionNote on note.NotesId equals prescription.NotesId
        //                 join subjective in dbContext.SubjectiveNotes on note.NotesId equals subjective.NotesId
        //                 join pat in dbContext.Patients on prescription.PatientId equals pat.PatientId
        //                 join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                 join sd in dbContext.Employee on note.SecondaryDoctorId equals sd.EmployeeId into secondaryDocTemp
        //                 from secondaryDoc in secondaryDocTemp.DefaultIfEmpty()
        //                 join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                 join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                 from noteType in noteTypeTemp.DefaultIfEmpty()
        //                 where prescription.NotesId == NotesId
        //                 select new
        //                 {
        //                     prescription.NotesId,
        //                     SubjectiveNote = subjective,
        //                     Prescription = prescription,  
        //                     note.FollowUp,
        //                     note.FollowUpUnit,
        //                     note.Remarks,
        //                     note.TemplateName,
        //                     prescription.CreatedOn,
        //                     prescription.ModifiedOn,
        //                     note.IsPending,
        //                     WrittenBy = emp.FullName,
        //                     noteType.NoteType,
        //                     CreatedBy = emp.FullName,
        //                     PrimaryDoctor = primaryDoc.FullName,
        //                     SecondaryDoctor = secondaryDoc.FullName,
        //                     pat.Age,
        //                     Sex = pat.Gender,
        //                     pat.PatientCode,
        //                     PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName

        //                 }).ToList();
        //responseData.Results = viewnotes;
        //responseData.Status = "OK";
        //}
        ////list view
        //else if (reqType == "patient-clinical-notes")
        //{
        //if (patientId != 0)
        //      {
        //        var notes = (from note in dbContext.Notes
        //                     join visit in dbContext.Visit on note.PatientVisitId equals visit.PatientVisitId
        //                     join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                     join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                     from noteType in noteTypeTemp.DefaultIfEmpty()
        //                     where note.PatientId == patientId
        //                     let primaryDoc = dbContext.Employee.Where(d => d.EmployeeId == note.PerformerId).Select(s => s.FullName).FirstOrDefault() ?? ""
        //                     select new
        //                     {
        //                         visit.VisitCode,
        //                         note.PatientId,
        //                         note.PatientVisitId,
        //                         PrimaryDoctor = primaryDoc,
        //                         note.TemplateName,
        //                         note.NotesId,
        //                         WrittenBy = emp.FullName,
        //                         noteType.NoteType,
        //                         note.CreatedOn,
        //                         note.IsPending,
        //                         note.CreatedBy,
        //                         LoggedInEmployeeId =0

        //                     }).ToList().OrderByDescending(a => a.CreatedOn);
        //        responseData.Results = notes;
        //        responseData.Status = "OK";
        //}
        //if (patientId == 0)
        // {
        //     var isPending  = true;
        //     var notes = (from note in dbContext.Notes
        //                  join pat in dbContext.Patients on note.PatientId equals pat.PatientId
        //                  join emp in dbContext.Employee on note.CreatedBy equals emp.EmployeeId
        //                  join primaryDoc in dbContext.Employee on note.PerformerId equals primaryDoc.EmployeeId
        //                  join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //                  from noteType in noteTypeTemp.DefaultIfEmpty()
        //                  where note.IsPending == isPending
        //                  select new
        //                  {
        //                      note.PatientId,
        //                      note.PatientVisitId,
        //                      PrimaryDoctor = primaryDoc.FullName,
        //                      note.TemplateName,
        //                      note.NotesId,
        //                      WrittenBy = emp.FullName,
        //                      noteType.NoteType,
        //                      note.CreatedOn,
        //                      note.IsPending,
        //                      LoggedUser = "",
        //                      PatientName = pat.FirstName + " " + (String.IsNullOrEmpty(pat.MiddleName) ? " " : pat.MiddleName) + " " + pat.LastName,
        //                      Age =pat.Age,
        //                      Gender =pat.Gender

        //                  }).ToList().OrderByDescending(a => a.CreatedOn);
        //     responseData.Results = notes;
        //     responseData.Status = "OK";
        // }


        //}
        ////edit case
        //else if (reqType == "opd-general")
        //{

        //List<ClinicalDiagnosisModel> allDiagnosis = (from note in dbContext.Notes
        //                                             join diagnosis in dbContext.ClinicalDiagnosis on note.NotesId equals diagnosis.NotesId
        //                                             where note.NotesId == notesId
        //                                             select diagnosis
        //               ).ToList();

        //foreach (var diag in allDiagnosis)
        //{
        //    diag.AllIcdLabOrders = (from labReq in dbContext.LabRequisitions
        //                            where labReq.DiagnosisId == diag.DiagnosisId
        //                            select labReq).ToList();
        //    diag.AllIcdImagingOrders = (from imgReq in dbContext.ImagingRequisitions
        //                                where imgReq.DiagnosisId == diag.DiagnosisId
        //                                select imgReq).ToList();
        //    diag.AllIcdPrescriptionOrders = (from phrmReq in dbContext.PHRMPrescriptionItems
        //                                     where phrmReq.DiagnosisId == diag.DiagnosisId
        //                                     select phrmReq).ToList();
        //}

        ////var allRadTest = (from note in dbContext.Notes
        ////                  join diagnosis in dbContext.ClinicalDiagnosis on note.NotesId equals diagnosis.NotesId
        ////                  join imaging in dbContext.ImagingRequisitions on diagnosis.DiagnosisId equals imaging.DiagnosisId
        ////                  select imaging
        ////                           ).ToList();


        ////var diagnosis = (from note in dbContext.Notes
        ////                 join diag in dbContext.ClinicalDiagnosis on note.NotesId equals diag.NotesId
        ////                 where 
        ////                 )
        //var notes = (from note in dbContext.Notes
        //             join sub in dbContext.SubjectiveNotes on note.NotesId equals sub.NotesId into subjectiveTemp
        //             from subjective in subjectiveTemp.DefaultIfEmpty()
        //             join obj in dbContext.ObjectiveNotes on note.NotesId equals obj.NotesId into objectiveTemp
        //             from objective in objectiveTemp.DefaultIfEmpty()
        //             join doctor in dbContext.Employee on note.PerformerId equals doctor.EmployeeId
        //             join visit in dbContext.Visit on note.PatientVisitId equals visit.PatientVisitId
        //             join nt in dbContext.NoteType on note.NoteTypeId equals nt.NoteTypeId into noteTypeTemp
        //             from noteType in noteTypeTemp.DefaultIfEmpty()

        //             where note.NotesId == notesId
        //             select new
        //             {
        //                 note.NotesId,
        //                 noteType.NoteType,
        //                 note.PatientId,
        //                 note.PatientVisitId,
        //                 note.PerformerId,
        //                 note.CreatedOn,
        //                 note.FollowUp,
        //                 note.Remarks,
        //                 VisitCode = visit.VisitCode,
        //                 VisitDate = visit.VisitDate,
        //                 ReferredBy = doctor.LongSignature,
        //                 SubjectiveNote = subjective,
        //                 ObjectiveNote = objective
        //             }).FirstOrDefault();


        //NotesModel notesData = new NotesModel();

        //notesData.AllIcdAndOrders = allDiagnosis;
        //notesData.SubjectiveNote = notes.SubjectiveNote;
        //notesData.ObjectiveNote = notes.ObjectiveNote;
        //notesData.NotesId = notes.NotesId;
        //notesData.PatientId = notes.PatientId;
        //notesData.PatientVisitId = notes.PatientVisitId;
        //notesData.PerformerId = notes.PerformerId;
        //notesData.CreatedOn = notes.CreatedOn;
        //notesData.FollowUp = notes.FollowUp;
        //notesData.Remarks = notes.Remarks;
        //notesData.VisitCode = notes.VisitCode;
        //notesData.VisitDate = notes.VisitDate;
        //notesData.ReferredBy = notes.ReferredBy;


        //responseData.Results = notesData;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "GetUploadedScannedImages")
        //{
        //var result = dbContext.PatientImages.Where(a => a.IsActive == true && a.PatientId == patientId).ToList();
        //var location = (from dbc in dbContext.CFGParameters
        //                where dbc.ParameterGroupName.ToLower() == "clinical"
        //                && dbc.ParameterName == "ClinicalDocumentUploadLocation"
        //                select dbc.ParameterValue).FirstOrDefault();
        //string fullPath;
        //foreach (var item in result)
        //{
        //    fullPath = location + item.FileName;
        //   item.FileBinaryData = System.IO.File.ReadAllBytes(@fullPath);
        //}

        //responseData.Results = result;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "EyeHistory")
        //{
        //    //var EyeHistoryList = dbContext.ClinicalEyeMaster.Where(a => a.PatientId == patientId);
        //    //responseData.Results = EyeHistoryList;
        //    //responseData.Status = "OK";
        //}
        //else if (reqType == "getrefraction")
        //{
        //    var refraction = dbContext.Refration;
        //    responseData.Results = refraction;
        //    responseData.Status = "OK";
        //}

        //else if (reqType == "GetEMRbyId")
        //{
        //    var EyeEMR = dbContext.ClinicalEyeMaster.Where(a => a.Id == masterId).FirstOrDefault();
        //    EyeEMR.RefractionOD = dbContext.Refration.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.RefractionOS = dbContext.Refration.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.OperationNotesOD = dbContext.OperationNotes.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.OperationNotesOS = dbContext.OperationNotes.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    EyeEMR.AblationOD = dbContext.AblationProfile.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.AblationOS = dbContext.AblationProfile.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    EyeEMR.LaserDataOD = dbContext.LaserData.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.LaserDataOS = dbContext.LaserData.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.PrePachymetryOD = dbContext.PreOpPachymetry.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.PrePachymetryOS = dbContext.PreOpPachymetry.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.LasikRSTOD = dbContext.LasikRST.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.LasikRSTOS = dbContext.LasikRST.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    EyeEMR.SmileSettingOD = dbContext.SmileSetting.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.SmileSettingOS = dbContext.SmileSetting.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    EyeEMR.PachymetryOD = dbContext.Pachymetry.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.PachymetryOS = dbContext.Pachymetry.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.VisumaxOD = dbContext.VisuMax.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.VisumaxOS = dbContext.VisuMax.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    EyeEMR.WavefrontOD = dbContext.Wavefront.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.WavefrontOS = dbContext.Wavefront.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.ORAOD = dbContext.ORA.Where(a => a.MasterId == masterId && a.IsOD == true).ToList();
        //    EyeEMR.ORAOS = dbContext.ORA.Where(a => a.MasterId == masterId && a.IsOD == false).ToList();
        //    EyeEMR.SmileIncisionOD = dbContext.SmileIncision.Where(a => a.MasterId == masterId && a.IsOD == true).FirstOrDefault();
        //    EyeEMR.SmileIncisionOS = dbContext.SmileIncision.Where(a => a.MasterId == masterId && a.IsOD == false).FirstOrDefault();
        //    responseData.Results = EyeEMR;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "GetPrescriptionbyMasterId")
        //{
        //var PrescriptionDetails = dbContext.ClinicalPrescriptionSlipMaster.Where(a => a.Id == masterId).FirstOrDefault();
        //PrescriptionDetails.History = dbContext.History.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.IOP = dbContext.IOP.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.Plup = dbContext.Plup.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.VaUnaided = dbContext.Vaunaided.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.Retinoscopy = dbContext.Retinoscopy.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.Schrime = dbContext.Schrime.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.Acceptance = dbContext.Acceptance.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.TBUT = dbContext.TBUT.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.Dilate = dbContext.Dilate.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.FinalClass = dbContext.FinalClass.Where(a => a.MasterId == masterId).FirstOrDefault();
        //PrescriptionDetails.AdviceDiagnosis = dbContext.AdviceDiagnosis.Where(a => a.MasterId == masterId).FirstOrDefault();
        //responseData.Results = PrescriptionDetails;
        //responseData.Status = "OK";
        //}
        //else if (reqType == "patient-clinical-prescription-notes")  
        //{
        //var subnotes = (from notes in dbContext.Notes
        //                join subnote in dbContext.SubjectiveNotes 
        //                on notes.NotesId equals subnote.NotesId into subNoteTemp
        //                from subNoteData in subNoteTemp.DefaultIfEmpty()
        //                join objnote in dbContext.ObjectiveNotes on notes.NotesId equals objnote.NotesId into objNoteTemp
        //                from objNoteData in objNoteTemp.DefaultIfEmpty()
        //                join patVisit in dbContext.Visit on notes.PatientVisitId equals patVisit.PatientVisitId                                    
        //                join vitals in dbContext.Vitals on notes.PatientVisitId equals vitals.PatientVisitId into vitalsTemp
        //                from vital in vitalsTemp.DefaultIfEmpty()
        //                join pat in dbContext.Patients on notes.PatientId equals pat.PatientId
        //                //join objnote in dbContext.ObjectiveNotes on notes.NotesId equals objnote.NotesId
        //                //join emp in patientdbContext.Employee on patVisit.ProviderId equals emp.EmployeeId into employeesTemp
        //                //from employees in employeesTemp.DefaultIfEmpty()
        //                where notes.PatientVisitId == patientVisitId && notes.NotesId == notesId

        //                select new
        //             {
        //                    PatientCode = pat.PatientCode,
        //                    PatientName = pat.FirstName + "" +pat.MiddleName + "" +pat.LastName,
        //                    AgeGender = pat.Age + "" + pat.Gender ,
        //                    //Specialization = patVisit.DepartmentName,
        //                    DoctorName = patVisit.PerformerName,
        //                    //NMCNo = employees.MedCertificationNo,
        //                    RegistrationDate = patVisit.VisitDate.ToString(),
        //                    VisitTime = patVisit.VisitTime.ToString(),
        //                    RegistrationNo = patVisit.VisitCode,
        //                    PatientType = patVisit.VisitType,
        //                    ChiefComplaint = subNoteData.ChiefComplaint,
        //                    HistoryIllness = subNoteData.HistoryOfPresentingIllness,
        //                    objNotes = objNoteData,
        //                    Height = vital.Height,
        //                    Weight = vital.Weight,
        //                    BMI = vital.BMI,
        //                    Temp = vital.Temperature,
        //                    Pulse = vital.Pulse,
        //                    Respiration = vital.RespiratoryRatePerMin,
        //                    BPSystolic = vital.BPSystolic,
        //                    BPDiastolic = vital.BPDiastolic,
        //                    SpO2 = vital.SpO2,
        //                    PainScale = vital.PainScale,
        //                    FollowUp = notes.FollowUp,
        //                    Remarks = notes.Remarks,
        //                    MedicationPrescriptions = (from pres in dbContext.PHRMPrescriptionItems 
        //                                               join item in dbContext.PHRMItemMaster on pres.ItemId equals item.ItemId 
        //                                               where pres.PatientId == pat.PatientId
        //                                               select new { pres , item.ItemName}
        //                                               ).ToList()
        //                }).FirstOrDefault();
        //responseData.Results = subnotes;
        //responseData.Status = "OK";
        //        }
        //        else if (reqType== "getAllOrdersByNoteId")
        //        {
        //            var allICDandOrders = ( from note in dbContext.Notes
        //                                    where note.NotesId == NotesId
        //                                    select new
        //                                    {
        //                                        note.NotesId,
        //                                        note.PatientId,
        //                                        note.PatientVisitId,
        //                                        DiagnosisOrdersList = (from allDiagnosis in dbContext.ClinicalDiagnosis
        //                                                               where allDiagnosis.NotesId == NotesId && allDiagnosis.IsActive == true
        //                                                               select new
        //                                                               {
        //                                                                   allDiagnosis.DiagnosisId,
        //                                                                   IsEditable = true,
        //                                                                   ICD = (from icd in dbContext.ICD10
        //                                                                          where icd.ICD10ID == allDiagnosis.ICD10ID
        //                                                                          select new
        //                                                                          {
        //                                                                              icd.ICD10Code,
        //                                                                              icd.ICD10Description,
        //                                                                              icd.ICD10ID,
        //                                                                              icd.ICDShortCode,
        //                                                                              icd.ValidForCoding
        //                                                                            }),


        //                                                                   AllIcdLabOrders = (from allLab in dbContext.LabRequisitions
        //                                                                                      where allLab.DiagnosisId == allDiagnosis.DiagnosisId && allLab.OrderStatus!="cancel"
        //                                                                                      select new
        //                                                                                      {
        //                                                                                         ItemId = allLab.LabTestId,
        //                                                                                         ItemName = allLab.LabTestName,
        //                                                                                         PreferenceType="Lab",
        //                                                                                          IsGeneric = false,
        //                                                                                      }
        //                                                                                    ).ToList(),
        //                                                                   AllIcdImagingOrders = (from allImaging in dbContext.ImagingRequisitions
        //                                                                                          where allImaging.DiagnosisId == allDiagnosis.DiagnosisId && allImaging.OrderStatus != "cancel"
        //                                                                                          select new 
        //                                                                                          {
        //                                                                                             ItemId = allImaging.ImagingItemId,
        //                                                                                             ItemName = allImaging.ImagingItemName,
        //                                                                                             allImaging.ImagingTypeId,
        //                                                                                             PreferenceType = "Imaging",
        //                                                                                              IsGeneric = false,

        //                                                                                          }).ToList(),
        //                                                                   AllIcdPrescriptionOrders = (from allMedication in dbContext.PHRMPrescriptionItems
        //                                                                                               where allMedication.DiagnosisId == allDiagnosis.DiagnosisId && allMedication.OrderStatus != "cancel"
        //                                                                                               select new 
        //                                                                                               {
        //                                                                                                   allMedication.ItemId,
        //                                                                                                   dbContext.PHRMItemMaster.FirstOrDefault(item => allMedication.ItemId == item.ItemId).ItemName,
        //                                                                                                   allMedication.Quantity,
        //                                                                                                   allMedication.Frequency,
        //                                                                                                   allMedication.HowManyDays,
        //                                                                                                   allMedication.Dosage,
        //                                                                                                   allMedication.GenericId,
        //                                                                                                   PreferenceType = "Medication",
        //                                                                                                   IsGeneric =false,
        //                                                                                               }).ToList(),

        //                                                               }).ToList()
        //                                    });

        //            responseData.Status = "OK";
        //            responseData.Results = allICDandOrders;
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        [HttpGet]
        [Route("TemplateDetailsByNoteId")]
        public IActionResult TemplateDetailsByNoteId(int noteId)
        {
            Func<object> func = () => GetTemplateDetailByNoteId(noteId);
            return InvokeHttpGetFunction(func);
        }
        [HttpGet]
        [Route("getClinicalIntakeOutputParameter")]
        public IActionResult getClinicalIntakeOutputParameter()
        {
            // else if (reqType == "activemedical")

            Func<object> func = () => (from clinicalIntakeOutputParameter in _clinicalDbContext.ClinicalIntakeOutputParameters
                                       where clinicalIntakeOutputParameter.IsActive
                                       select clinicalIntakeOutputParameter).ToList();
            return InvokeHttpGetFunction(func);
        }
        private object GetTemplateDetailByNoteId(int noteId)
        {
            var notesData = _clinicalDbContext.Notes.Find(noteId);
            if (notesData != null)
            {
                switch (notesData.TemplateName)
                {
                    case "Progress Note":
                        {
                            notesData.ProgressNote = _clinicalDbContext.ProgressNote.FirstOrDefault(PN => PN.NotesId == noteId);
                            break;
                        }
                    case "History & Physical":
                        {

                            notesData.SubjectiveNote = _clinicalDbContext.SubjectiveNotes.FirstOrDefault(ft => ft.NotesId == noteId);
                            notesData.ObjectiveNote = _clinicalDbContext.ObjectiveNotes.FirstOrDefault(ft => ft.NotesId == noteId);

                            break;
                        }
                    case "Free Text":
                        {
                            notesData.FreeTextNote = _clinicalDbContext.FreeText.FirstOrDefault(FT => FT.NotesId == noteId);
                            break;
                        }
                    case "Discharge Note":
                        { break; }
                    case "Emergency Note":
                        {
                            notesData.EmergencyNote = _clinicalDbContext.EmergencyNote.FirstOrDefault(ft => ft.NotesId == noteId);
                            notesData.SubjectiveNote = _clinicalDbContext.SubjectiveNotes.FirstOrDefault(ft => ft.NotesId == noteId);
                            notesData.ObjectiveNote = _clinicalDbContext.ObjectiveNotes.FirstOrDefault(ft => ft.NotesId == noteId);

                            break;
                        }
                    case "Procedure Note":
                        {
                            notesData.ProcedureNote = _clinicalDbContext.ProcedureNote.FirstOrDefault(PN => PN.NotesId == noteId);
                            break;
                        }
                    case "Prescription Note":
                        {
                            notesData.SubjectiveNote = _clinicalDbContext.SubjectiveNotes.FirstOrDefault(PN => PN.NotesId == noteId);
                            //get the data for prescription note
                            notesData.ClinicalPrescriptionNote = _clinicalDbContext.ClinicalPrescriptionNote.FirstOrDefault(PN => PN.NotesId == noteId);
                            break;
                        }
                    case "Consult Note":
                        {
                            notesData.SubjectiveNote = _clinicalDbContext.SubjectiveNotes.FirstOrDefault(CN => CN.NotesId == noteId);
                            notesData.ObjectiveNote = _clinicalDbContext.ObjectiveNotes.FirstOrDefault(ft => ft.NotesId == noteId);
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }

                return notesData;
            }
            else
            {
                throw new Exception("Note template not found for given NoteId");
            }
        }



        [HttpPost]
        [Route("Vitals")]
        public IActionResult Vitals()
        {
            //   if (reqType == "vitals")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddPatientVitals(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("InputOutput")]
        public IActionResult InputOutput()
        {
            //  else if (reqType == "inputoutput")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddInputOutput(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("ScannedEyeImages")]
        public IActionResult PostScannedEyeImages()
        {
            //  else if (reqType == "scanimagesupload")
            var files = this.ReadFiles();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveScannedEyeImages(files, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("Allergy")]
        public IActionResult Allergy()
        {
            //  else if (reqType == "allergy")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddAllergy(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("HomeMedication")]
        public IActionResult HomeMedication()
        {
            //  else if (reqType == "homemedication")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddHomeMedication(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("MedicationPrescription")]
        public IActionResult MedicationPrescription()
        {
            //  else if (reqType == "medicationprescription")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddMedicationPrescription(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("ActiveMedicalProblem")]
        public IActionResult ActiveMedicalProblem()
        {
            //  else if (reqType == "activemedical")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddActiveMedicalProblem(str, currentUser);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("PastMedicalProblem")]
        public IActionResult PastMedicalProblem()
        {
            //  else if (reqType == "pastmedical")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddPastMedicalProblem(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("FamilyHistory")]
        public IActionResult FamilyHistory()
        {
            //  else if (reqType == "familyhistory")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddFamilyHistory(str, currentUser);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("SurgicalHistory")]
        public IActionResult SurgicalHistory()
        {
            //  else if (reqType == "surgicalhistory")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddSurgicalHistory(str, currentUser);
            return InvokeHttpPostFunction(func);

        }
        [HttpPost]
        [Route("SocialHistory")]
        public IActionResult SocialHistory()
        {
            //  else if (reqType == "socialhistory")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddSocialHistory(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("ReferralSource")]
        public IActionResult ReferralSource()
        {
            //  else if (reqType == "referralsource")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddReferralSource(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("OPDGeneralNote")]
        public IActionResult OPDGeneralNote()
        {
            //  else if (reqType == "opd-general-note")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostOPDGeneralNote(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("EyeMasterDetails")]
        public IActionResult EyeMasterDetail()
        {
            //  else if (reqType == "posteyemaster")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddEyeMasterDetail(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("ProcedureNoteTemplate")]
        public IActionResult ProcedureNoteTemplate()
        {
            //  else if (reqType == "postprocedurenotetemplate")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddProcedureNoteTemplate(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("ProgressNoteTemplateDetail")]
        public IActionResult ProgressNoteTemplate()
        {
            //  else if (reqType == "postprogressnotetemplate")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddProgressNoteTemplate(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("FreeTextNoteTemplateDetail")]
        public IActionResult PostFreetextNoteTemplateDetail()
        {
            //  else if (reqType == "postfreetextnotetemplate")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddFreetextNoteTemplate(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("HistoryAndPhysicalNoteDetail")]
        public IActionResult HistoryAndPhysicalNote()
        {
            //  else if (reqType == "posthistoryandphysicalnote")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddHistoryAndPhysicalNote(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("EmergencyNote")]
        public IActionResult EmergencyNote()
        {
            //  else if (reqType == "postemergencynote")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddEmergencyNote(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("DischargeNote")]
        public IActionResult DischargeNote()
        {
            // else if (reqType == "postdischargenote")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostDischargeNote(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("PrescriptionMasterSlip")]
        public IActionResult PrescriptionMasterSlip()
        {
            // else if (reqType == "postprescriptionslipmaster")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostPrescriptionMasterSlip(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("PrescriptionNote")]
        public IActionResult PrescriptionNote()
        {
            // else if (reqType == "post-clinicalprescription-note")
            string str = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddPrescriptionNote(str, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("PatientFiles")]
        public IActionResult PostPatient()
        {
            // else if (reqType == "upload")
            var files = this.ReadFiles();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UploadScannedImage(files, currentUser);
            return InvokeHttpPostFunction(func);

        }

        private object UploadScannedImage(IFormFileCollection files, RbacUser currentUser)
        {
            ///Read patient Files Model Other Data
            var reportDetails = Request.Form["imgDetails"];
            PatientImagesModel patFileData = DanpheJSONConvert.DeserializeObject<PatientImagesModel>(reportDetails);
            ////We Do Process in Transaction because Now Situation that 
            /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    var location = (from dbc in _clinicalDbContext.CFGParameters
                                    where dbc.ParameterGroupName.ToLower() == "clinical"
                                    && dbc.ParameterName == "ClinicalDocumentUploadLocation"
                                    select dbc.ParameterValue).FirstOrDefault();

                    if (!Directory.Exists(location))
                    {
                        Directory.CreateDirectory(location);
                    }

                    foreach (var file in files)
                    {
                        if (file.Length > 0)
                        {
                            /////Converting Files to Byte there for we require MemoryStream object
                            using (var ms = new MemoryStream())
                            {
                                ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
                                string currentFileExtention = Path.GetExtension(file.FileName);
                                ////Copy Each file to MemoryStream
                                file.CopyTo(ms);
                                ////Convert File to Byte[]
                                byte[] imageBytes = ms.ToArray();
                                string currentfileName = patFileData.PatientId.ToString() + "_" + patFileData.FileName + System.DateTime.Now.Ticks + currentFileExtention;
                                string fullPath = location + currentfileName;

                                var tempModel = new PatientImagesModel();
                                //tempModel.FileBinaryData = imageBytes;
                                tempModel.PatientId = patFileData.PatientId;
                                tempModel.PatientVisitId = patFileData.PatientVisitId;
                                tempModel.DepartmentId = patFileData.DepartmentId;
                                tempModel.ROWGUID = Guid.NewGuid();
                                tempModel.FileType = patFileData.FileType;
                                tempModel.UploadedBy = currentUser.EmployeeId;
                                tempModel.UploadedOn = DateTime.Now;
                                tempModel.Comment = patFileData.Comment;
                                tempModel.FileName = currentfileName;
                                tempModel.Title = patFileData.Title;
                                tempModel.FileExtention = currentFileExtention;
                                tempModel.IsActive = true;
                                _clinicalDbContext.PatientImages.Add(tempModel);
                                _clinicalDbContext.SaveChanges();

                                System.IO.File.WriteAllBytes(@fullPath, imageBytes);

                                ms.Dispose();

                            }
                        }
                    }
                    ///After All Files Added Commit the Transaction
                    dbContextTransaction.Commit();

                    return "Patient Files Uploaded Successfully.";
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddPrescriptionNote(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            PrescriptionNotesModel prescription = NotesMaster.ClinicalPrescriptionNote;
            SubjectiveNoteModel subjective = NotesMaster.SubjectiveNote;

            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesMaster.CreatedBy = currentUser.EmployeeId;
                    NotesMaster.CreatedOn = System.DateTime.Now;
                    _clinicalDbContext.Notes.Add(NotesMaster);
                    _clinicalDbContext.SaveChanges();


                    prescription.NotesId = NotesMaster.NotesId;
                    prescription.CreatedBy = currentUser.EmployeeId;
                    prescription.CreatedOn = System.DateTime.Now;


                    subjective.NotesId = NotesMaster.NotesId;
                    subjective.PatientId = NotesMaster.PatientId;
                    subjective.PatientVisitId = NotesMaster.PatientVisitId;
                    subjective.CreatedBy = currentUser.EmployeeId;
                    subjective.CreatedOn = System.DateTime.Now;

                    _clinicalDbContext.ClinicalPrescriptionNote.Add(prescription);
                    _clinicalDbContext.SubjectiveNotes.Add(subjective);

                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return null;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PostPrescriptionMasterSlip(string str, RbacUser currentUser)
        {
            PrescriptionSlipModel PrescriptionSlipMaster = JsonConvert.DeserializeObject<PrescriptionSlipModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (PrescriptionSlipMaster.PatientId != 0)
                    {
                        PrescriptionSlipMaster.CreatedBy = currentUser.EmployeeId;
                        PrescriptionSlipMaster.CreatedOn = DateTime.Now;
                        _clinicalDbContext.ClinicalPrescriptionSlipMaster.Add(PrescriptionSlipMaster);
                        _clinicalDbContext.SaveChanges();
                        var MasterId = PrescriptionSlipMaster.Id;

                        {
                            PrescriptionSlipMaster.History.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.History.CreatedOn = DateTime.Now;
                            PrescriptionSlipMaster.History.MasterId = MasterId;
                            _clinicalDbContext.History.Add(PrescriptionSlipMaster.History);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.Acceptance.MasterId = MasterId;
                            PrescriptionSlipMaster.Acceptance.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.Acceptance.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Acceptance.Add(PrescriptionSlipMaster.Acceptance);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.Dilate.MasterId = MasterId;
                            PrescriptionSlipMaster.Dilate.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.Dilate.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Dilate.Add(PrescriptionSlipMaster.Dilate);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.IOP.MasterId = MasterId;
                            PrescriptionSlipMaster.IOP.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.IOP.CreatedOn = DateTime.Now;
                            _clinicalDbContext.IOP.Add(PrescriptionSlipMaster.IOP);
                            _clinicalDbContext.SaveChanges();
                        }

                        {
                            PrescriptionSlipMaster.Plup.MasterId = MasterId;
                            PrescriptionSlipMaster.Plup.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.Plup.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Plup.Add(PrescriptionSlipMaster.Plup);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.Retinoscopy.MasterId = MasterId;
                            PrescriptionSlipMaster.Retinoscopy.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.Retinoscopy.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Retinoscopy.Add(PrescriptionSlipMaster.Retinoscopy);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.Schrime.MasterId = MasterId;
                            PrescriptionSlipMaster.Schrime.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.Schrime.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Schrime.Add(PrescriptionSlipMaster.Schrime);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.TBUT.MasterId = MasterId;
                            PrescriptionSlipMaster.TBUT.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.TBUT.CreatedOn = DateTime.Now;
                            _clinicalDbContext.TBUT.Add(PrescriptionSlipMaster.TBUT);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.VaUnaided.MasterId = MasterId;
                            PrescriptionSlipMaster.VaUnaided.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.VaUnaided.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Vaunaided.Add(PrescriptionSlipMaster.VaUnaided);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.FinalClass.MasterId = MasterId;
                            PrescriptionSlipMaster.FinalClass.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.FinalClass.CreatedOn = DateTime.Now;
                            _clinicalDbContext.FinalClass.Add(PrescriptionSlipMaster.FinalClass);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            PrescriptionSlipMaster.AdviceDiagnosis.MasterId = MasterId;
                            PrescriptionSlipMaster.AdviceDiagnosis.CreatedBy = currentUser.EmployeeId;
                            PrescriptionSlipMaster.AdviceDiagnosis.CreatedOn = DateTime.Now;
                            _clinicalDbContext.AdviceDiagnosis.Add(PrescriptionSlipMaster.AdviceDiagnosis);
                            _clinicalDbContext.SaveChanges();
                        }

                    }
                    dbContextTransaction.Commit();
                    return null;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PostDischargeNote(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (NotesMaster.PatientId != 0)
                    {
                        // posting data on Notes table
                        NotesMaster.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.CreatedOn = DateTime.Now;
                        _clinicalDbContext.Notes.Add(NotesMaster);
                        _clinicalDbContext.SaveChanges();
                        var Notesid = NotesMaster.NotesId;

                        // posting data on DischargeSummary table
                        NotesMaster.DischargeSummaryNote.NotesId = Notesid;
                        NotesMaster.DischargeSummaryNote.CreatedOn = DateTime.Now;
                        _clinicalDbContext.DischargeSummaryNote.Add(NotesMaster.DischargeSummaryNote);
                        _clinicalDbContext.SaveChanges();

                        // posting data on dischargeSummaryMedications table
                        var summaryId = _clinicalDbContext.DischargeSummaryNote.Where(a => a.PatientVisitId == NotesMaster.DischargeSummaryNote.PatientVisitId).Select(a => a.DischargeSummaryId).FirstOrDefault();
                        NotesMaster.DischargeSummaryNote.DischargeSummaryMedications.ForEach(a =>
                        {
                            a.IsActive = true;
                            a.DischargeSummaryId = summaryId;
                            _clinicalDbContext.DischargeSummaryMedications.Add(a);
                            _clinicalDbContext.SaveChanges();
                        });

                    }

                    dbContextTransaction.Commit();
                    return null;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddEmergencyNote(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesMaster.CreatedBy = currentUser.EmployeeId;
                    NotesMaster.CreatedOn = DateTime.Now;
                    _clinicalDbContext.Notes.Add(NotesMaster);
                    _clinicalDbContext.SaveChanges();
                    var Notesid = NotesMaster.NotesId;

                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
                    EmergencyNoteModel emergencyNote = NotesMaster.EmergencyNote;

                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;

                    if (subjectiveNote != null)
                    {
                        subjectiveNote.NotesId = Notesid;
                        subjectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
                        subjectiveNote.PatientId = NotesMaster.PatientId;
                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
                        subjectiveNote.CreatedOn = DateTime.Now;
                        subjectiveNote.IsActive = true;
                        _clinicalDbContext.SubjectiveNotes.Add(subjectiveNote);
                        _clinicalDbContext.SaveChanges();

                    }
                    if (objectiveNote != null)
                    {
                        objectiveNote.NotesId = Notesid;
                        objectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
                        objectiveNote.PatientId = NotesMaster.PatientId;
                        objectiveNote.CreatedBy = currentUser.EmployeeId;
                        objectiveNote.CreatedOn = DateTime.Now;
                        objectiveNote.IsActive = true;
                        _clinicalDbContext.ObjectiveNotes.Add(objectiveNote);
                        _clinicalDbContext.SaveChanges();
                    }
                    if (emergencyNote != null)
                    {
                        emergencyNote.NotesId = Notesid;
                        emergencyNote.PatientVisitId = NotesMaster.PatientVisitId;
                        emergencyNote.PatientId = NotesMaster.PatientId;
                        emergencyNote.CreatedBy = currentUser.EmployeeId;
                        emergencyNote.CreatedOn = DateTime.Now;
                        emergencyNote.IsActive = true;
                        _clinicalDbContext.EmergencyNote.Add(emergencyNote);
                        _clinicalDbContext.SaveChanges();

                    }

                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
                    {

                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                        var priceForLabRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "LAB" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23 1 is for Normal and hardcoded for now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        var priceForRadRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "Radiology" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23 1 is for Normal and hardcoded for now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();


                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                        {
                            Diagnosis.CreatedOn = DateTime.Now;
                            Diagnosis.CreatedBy = currentUser.EmployeeId;
                            Diagnosis.NotesId = NotesMaster.NotesId;
                            _clinicalDbContext.ClinicalDiagnosis.Add(Diagnosis);
                            _clinicalDbContext.SaveChanges();



                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                            {
                                labReq.CreatedBy = currentUser.EmployeeId;
                                labReq.CreatedOn = DateTime.Now;
                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.LabRequisitions.Add(labReq);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from labPrice in priceForLabRequisition
                                                  where labPrice.ItemId == labReq.LabTestId
                                                  select labPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = labReq.RequisitionId;
                                RequisitionItem.BillStatus = labReq.BillingStatus;
                                RequisitionItem.PatientId = labReq.PatientId;
                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double?)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                            {
                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                imgnRequisition.CreatedOn = DateTime.Now;
                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from radPrice in priceForRadRequisition
                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                  select radPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                RequisitionItem.PatientId = imgnRequisition.PatientId;
                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double?)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                            {
                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                phrmRequisition.CreatedOn = DateTime.Now;
                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                _clinicalDbContext.SaveChanges();
                            }

                        }
                        foreach (BillItemRequisition bill in allBillRequisition)
                        {
                            _clinicalDbContext.BillItemRequisitions.Add(bill);
                        }
                        _clinicalDbContext.SaveChanges();
                    }

                    dbContextTransaction.Commit();
                    return null;

                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }

            }
        }
        private object AddHistoryAndPhysicalNote(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesMaster.CreatedBy = currentUser.EmployeeId;
                    NotesMaster.CreatedOn = DateTime.Now;
                    _clinicalDbContext.Notes.Add(NotesMaster);
                    _clinicalDbContext.SaveChanges();
                    var Notesid = NotesMaster.NotesId;

                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;

                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;

                    if (subjectiveNote != null)
                    {
                        subjectiveNote.NotesId = Notesid;
                        subjectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
                        subjectiveNote.PatientId = NotesMaster.PatientId;
                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
                        subjectiveNote.CreatedOn = DateTime.Now;
                        subjectiveNote.IsActive = true;
                        _clinicalDbContext.SubjectiveNotes.Add(subjectiveNote);
                        _clinicalDbContext.SaveChanges();

                    }
                    if (objectiveNote != null)
                    {
                        objectiveNote.NotesId = Notesid;
                        objectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
                        objectiveNote.PatientId = NotesMaster.PatientId;
                        objectiveNote.CreatedBy = currentUser.EmployeeId;
                        objectiveNote.CreatedOn = DateTime.Now;
                        objectiveNote.IsActive = true;
                        _clinicalDbContext.ObjectiveNotes.Add(objectiveNote);
                        _clinicalDbContext.SaveChanges();
                    }

                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
                    {

                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                        var priceForLabRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "LAB" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        var priceForRadRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "Radiology" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();


                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                        {
                            Diagnosis.CreatedOn = DateTime.Now;
                            Diagnosis.CreatedBy = currentUser.EmployeeId;
                            Diagnosis.NotesId = NotesMaster.NotesId;
                            _clinicalDbContext.ClinicalDiagnosis.Add(Diagnosis);
                            _clinicalDbContext.SaveChanges();



                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                            {
                                labReq.CreatedBy = currentUser.EmployeeId;
                                labReq.CreatedOn = DateTime.Now;
                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.LabRequisitions.Add(labReq);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from labPrice in priceForLabRequisition
                                                  where labPrice.ItemId == labReq.LabTestId
                                                  select labPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = labReq.RequisitionId;
                                RequisitionItem.BillStatus = labReq.BillingStatus;
                                RequisitionItem.PatientId = labReq.PatientId;
                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                            {
                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                imgnRequisition.CreatedOn = DateTime.Now;
                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from radPrice in priceForRadRequisition
                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                  select radPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                RequisitionItem.PatientId = imgnRequisition.PatientId;
                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                            {
                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                phrmRequisition.CreatedOn = DateTime.Now;
                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                _clinicalDbContext.SaveChanges();
                            }

                        }
                        foreach (BillItemRequisition bill in allBillRequisition)
                        {
                            _clinicalDbContext.BillItemRequisitions.Add(bill);
                        }
                        _clinicalDbContext.SaveChanges();
                    }

                    dbContextTransaction.Commit();
                    return null;

                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }

            }
        }
        private object AddFreetextNoteTemplate(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (NotesMaster.PatientId != 0)
                    {
                        NotesMaster.CreatedOn = DateTime.Now;
                        NotesMaster.CreatedBy = currentUser.EmployeeId;
                        _clinicalDbContext.Notes.Add(NotesMaster);
                        _clinicalDbContext.SaveChanges();
                        var Notesid = NotesMaster.NotesId;

                        NotesMaster.FreeTextNote.NotesId = Notesid;
                        NotesMaster.FreeTextNote.PatientVisitId = NotesMaster.PatientVisitId;
                        NotesMaster.FreeTextNote.PatientId = NotesMaster.PatientId;
                        NotesMaster.FreeTextNote.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.FreeTextNote.CreatedOn = DateTime.Now;
                        NotesMaster.FreeTextNote.IsActive = true;
                        _clinicalDbContext.FreeText.Add(NotesMaster.FreeTextNote);
                        _clinicalDbContext.SaveChanges();

                    }
                    dbContextTransaction.Commit();
                    return ENUM_DanpheHttpResponseText.OK;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddProgressNoteTemplate(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (NotesMaster.PatientId != 0)
                    {
                        NotesMaster.CreatedOn = DateTime.Now;
                        NotesMaster.CreatedBy = currentUser.EmployeeId;
                        _clinicalDbContext.Notes.Add(NotesMaster);
                        _clinicalDbContext.SaveChanges();
                        var Notesid = NotesMaster.NotesId;

                        NotesMaster.ProgressNote.NotesId = Notesid;
                        NotesMaster.ProgressNote.Date = DateTime.Now;
                        NotesMaster.ProgressNote.PatientVisitId = NotesMaster.PatientVisitId;
                        NotesMaster.ProgressNote.PatientId = NotesMaster.PatientId;
                        NotesMaster.ProgressNote.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.ProgressNote.CreatedOn = DateTime.Now;
                        NotesMaster.ProgressNote.IsActive = true;
                        _clinicalDbContext.ProgressNote.Add(NotesMaster.ProgressNote);
                        _clinicalDbContext.SaveChanges();

                    }

                    dbContextTransaction.Commit();
                    return ENUM_DanpheHttpResponseText.OK;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddProcedureNoteTemplate(string str, RbacUser currentUser)
        {
            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (NotesMaster.PatientId != 0)
                    {
                        NotesMaster.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.CreatedOn = DateTime.Now;
                        _clinicalDbContext.Notes.Add(NotesMaster);
                        _clinicalDbContext.SaveChanges();
                        var Notesid = NotesMaster.NotesId;

                        NotesMaster.ProcedureNote.NotesId = Notesid;
                        NotesMaster.ProcedureNote.PatientVisitId = NotesMaster.PatientVisitId;
                        NotesMaster.ProcedureNote.PatientId = NotesMaster.PatientId;
                        NotesMaster.ProcedureNote.CreatedBy = currentUser.EmployeeId;
                        NotesMaster.ProcedureNote.CreatedOn = DateTime.Now;
                        NotesMaster.ProcedureNote.IsActive = true;
                        _clinicalDbContext.ProcedureNote.Add(NotesMaster.ProcedureNote);
                        _clinicalDbContext.SaveChanges();

                    }

                    dbContextTransaction.Commit();
                    return ENUM_DanpheHttpResponseText.OK;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddEyeMasterDetail(string str, RbacUser currentUser)
        {
            EyeModel EyeMaster = JsonConvert.DeserializeObject<EyeModel>(str);
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (EyeMaster.PatientId != 0)
                    {
                        EyeMaster.CreatedBy = currentUser.EmployeeId;
                        EyeMaster.CreatedOn = DateTime.Now;
                        _clinicalDbContext.ClinicalEyeMaster.Add(EyeMaster);
                        _clinicalDbContext.SaveChanges();
                        var MasterId = EyeMaster.Id;

                        foreach (RefractionModel refraction in EyeMaster.RefractionOD)
                        {
                            refraction.MasterId = MasterId;
                            refraction.CreatedBy = currentUser.EmployeeId;
                            refraction.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Refration.Add(refraction);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (RefractionModel refraction in EyeMaster.RefractionOS)
                        {
                            refraction.MasterId = MasterId;
                            refraction.CreatedBy = currentUser.EmployeeId;
                            refraction.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Refration.Add(refraction);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.OperationNotesOD.MasterId = MasterId;
                            EyeMaster.OperationNotesOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.OperationNotesOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.OperationNotes.Add(EyeMaster.OperationNotesOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.OperationNotesOS.MasterId = MasterId;
                            EyeMaster.OperationNotesOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.OperationNotesOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.OperationNotes.Add(EyeMaster.OperationNotesOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.AblationOD.MasterId = MasterId;
                            EyeMaster.AblationOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.AblationOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.AblationProfile.Add(EyeMaster.AblationOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.AblationOS.MasterId = MasterId;
                            EyeMaster.AblationOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.AblationOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.AblationProfile.Add(EyeMaster.AblationOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
                        {
                            laserdata.MasterId = MasterId;
                            laserdata.CreatedBy = currentUser.EmployeeId;
                            laserdata.CreatedOn = DateTime.Now;
                            _clinicalDbContext.LaserData.Add(laserdata);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOS)
                        {
                            laserdata.MasterId = MasterId;
                            laserdata.CreatedBy = currentUser.EmployeeId;
                            laserdata.CreatedOn = DateTime.Now;
                            _clinicalDbContext.LaserData.Add(laserdata);
                            _clinicalDbContext.SaveChanges();
                        }

                        foreach (PreOPPachymetryModel prepachymetry in EyeMaster.PrePachymetryOD)
                        {
                            prepachymetry.MasterId = MasterId;
                            prepachymetry.CreatedBy = currentUser.EmployeeId;
                            prepachymetry.CreatedOn = DateTime.Now;
                            _clinicalDbContext.PreOpPachymetry.Add(prepachymetry);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (PreOPPachymetryModel prepachymetry in EyeMaster.PrePachymetryOS)
                        {
                            prepachymetry.MasterId = MasterId;
                            prepachymetry.CreatedBy = currentUser.EmployeeId;
                            prepachymetry.CreatedOn = DateTime.Now;
                            _clinicalDbContext.PreOpPachymetry.Add(prepachymetry);
                            _clinicalDbContext.SaveChanges();
                        }

                        {
                            EyeMaster.LasikRSTOD.MasterId = MasterId;
                            EyeMaster.LasikRSTOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.LasikRSTOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.LasikRST.Add(EyeMaster.LasikRSTOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.LasikRSTOS.MasterId = MasterId;
                            EyeMaster.LasikRSTOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.LasikRSTOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.LasikRST.Add(EyeMaster.LasikRSTOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.SmileSettingOD.MasterId = MasterId;
                            EyeMaster.SmileSettingOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.SmileSettingOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.SmileSetting.Add(EyeMaster.SmileSettingOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.SmileSettingOS.MasterId = MasterId;
                            EyeMaster.SmileSettingOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.SmileSettingOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.SmileSetting.Add(EyeMaster.SmileSettingOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.VisumaxOD.MasterId = MasterId;
                            EyeMaster.VisumaxOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.VisumaxOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.VisuMax.Add(EyeMaster.VisumaxOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.VisumaxOS.MasterId = MasterId;
                            EyeMaster.VisumaxOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.VisumaxOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.VisuMax.Add(EyeMaster.VisumaxOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.SmileIncisionOD.MasterId = MasterId;
                            EyeMaster.SmileIncisionOD.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.SmileIncisionOD.CreatedOn = DateTime.Now;
                            _clinicalDbContext.SmileIncision.Add(EyeMaster.SmileIncisionOD);
                            _clinicalDbContext.SaveChanges();
                        }
                        {
                            EyeMaster.SmileIncisionOS.MasterId = MasterId;
                            EyeMaster.SmileIncisionOS.CreatedBy = currentUser.EmployeeId;
                            EyeMaster.SmileIncisionOS.CreatedOn = DateTime.Now;
                            _clinicalDbContext.SmileIncision.Add(EyeMaster.SmileIncisionOS);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (ORAModel ora in EyeMaster.ORAOD)
                        {
                            ora.MasterId = MasterId;
                            ora.CreatedBy = currentUser.EmployeeId;
                            ora.CreatedOn = DateTime.Now;
                            _clinicalDbContext.ORA.Add(ora);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (ORAModel ora in EyeMaster.ORAOS)
                        {
                            ora.MasterId = MasterId;
                            ora.CreatedBy = currentUser.EmployeeId;
                            ora.CreatedOn = DateTime.Now;
                            _clinicalDbContext.ORA.Add(ora);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (WavefrontModel wavefront in EyeMaster.WavefrontOD)
                        {
                            wavefront.MasterId = MasterId;
                            wavefront.CreatedBy = currentUser.EmployeeId;
                            wavefront.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Wavefront.Add(wavefront);
                            _clinicalDbContext.SaveChanges();
                        }
                        foreach (WavefrontModel wavefront in EyeMaster.WavefrontOS)
                        {
                            wavefront.MasterId = MasterId;
                            wavefront.CreatedBy = currentUser.EmployeeId;
                            wavefront.CreatedOn = DateTime.Now;
                            _clinicalDbContext.Wavefront.Add(wavefront);
                            _clinicalDbContext.SaveChanges();
                            foreach (PachymetryModel pachymetry in EyeMaster.PachymetryOD)
                            {
                                pachymetry.MasterId = MasterId;
                                pachymetry.CreatedBy = currentUser.EmployeeId;
                                pachymetry.CreatedOn = DateTime.Now;
                                _clinicalDbContext.Pachymetry.Add(pachymetry);
                                _clinicalDbContext.SaveChanges();
                            }
                            foreach (PachymetryModel pachymetry in EyeMaster.PachymetryOS)
                            {
                                pachymetry.MasterId = MasterId;
                                pachymetry.CreatedBy = currentUser.EmployeeId;
                                pachymetry.CreatedOn = DateTime.Now;
                                _clinicalDbContext.Pachymetry.Add(pachymetry);
                                _clinicalDbContext.SaveChanges();
                            }
                        }
                        dbContextTransaction.Commit();
                    }
                    return null;
                }
                catch (Exception ex)
                {
                    return ex.Message + " exception details:" + ex.ToString();
                    dbContextTransaction.Rollback();
                }
            }
        }
        private object PostOPDGeneralNote(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

                    SubjectiveNoteModel subjectiveNote = notes.SubjectiveNote;
                    ObjectiveNoteModel objectiveNote = notes.ObjectiveNote;
                    List<ClinicalDiagnosisModel> clinialDiagnosis = notes.AllIcdAndOrders;

                    notes.SubjectiveNote = null;
                    notes.ObjectiveNote = null;
                    //add opdGeneralNote
                    notes.CreatedBy = currentUser.EmployeeId;
                    notes.CreatedOn = DateTime.Now;
                    _clinicalDbContext.Notes.Add(notes);
                    _clinicalDbContext.SaveChanges();

                    //add subjective note
                    if (subjectiveNote != null)
                    {
                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
                        subjectiveNote.CreatedOn = notes.CreatedOn;
                        subjectiveNote.NotesId = notes.NotesId;
                        _clinicalDbContext.SubjectiveNotes.Add(subjectiveNote);
                        _clinicalDbContext.SaveChanges();
                    }

                    if (objectiveNote != null)
                    {
                        //add Objective Note  
                        objectiveNote.CreatedBy = currentUser.EmployeeId;
                        objectiveNote.CreatedOn = DateTime.Now;
                        objectiveNote.NotesId = notes.NotesId;
                        _clinicalDbContext.ObjectiveNotes.Add(objectiveNote);
                        _clinicalDbContext.SaveChanges();
                    }
                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
                    {

                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                        var priceForLabRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "LAB" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        var priceForRadRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "Radiology" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hardcoded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();


                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                        {
                            Diagnosis.CreatedOn = DateTime.Now;
                            Diagnosis.CreatedBy = currentUser.EmployeeId;
                            Diagnosis.NotesId = notes.NotesId;
                            _clinicalDbContext.ClinicalDiagnosis.Add(Diagnosis);
                            _clinicalDbContext.SaveChanges();



                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                            {
                                labReq.CreatedBy = currentUser.EmployeeId;
                                labReq.CreatedOn = DateTime.Now;
                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.LabRequisitions.Add(labReq);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from labPrice in priceForLabRequisition
                                                  where labPrice.ItemId == labReq.LabTestId
                                                  select labPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = labReq.RequisitionId;
                                RequisitionItem.BillStatus = labReq.BillingStatus;
                                RequisitionItem.PatientId = labReq.PatientId;
                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                            {
                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                imgnRequisition.CreatedOn = DateTime.Now;
                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                _clinicalDbContext.SaveChanges();

                                var itemDetail = (from radPrice in priceForRadRequisition
                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                  select radPrice).FirstOrDefault();


                                RequisitionItem = new BillItemRequisition();
                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                RequisitionItem.PatientId = imgnRequisition.PatientId;
                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                RequisitionItem.ItemId = itemDetail.ItemId;
                                RequisitionItem.ItemName = itemDetail.ItemName;
                                RequisitionItem.Price = (double)itemDetail.Price;
                                RequisitionItem.Quantity = 1;
                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                RequisitionItem.CreatedOn = DateTime.Now;

                                allBillRequisition.Add(RequisitionItem);
                            }

                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                            {
                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                phrmRequisition.CreatedOn = DateTime.Now;
                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                _clinicalDbContext.SaveChanges();
                            }

                        }
                        foreach (BillItemRequisition bill in allBillRequisition)
                        {
                            _clinicalDbContext.BillItemRequisitions.Add(bill);
                        }

                        _clinicalDbContext.SaveChanges();

                    }
                    return null;
                    //Commit Transaction
                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddReferralSource(string str, RbacUser currentUser)
        {
            ReferralSource referralsource = JsonConvert.DeserializeObject<ReferralSource>(str);

            referralsource.CreatedBy = currentUser.EmployeeId;
            referralsource.CreatedOn = DateTime.Now;

            _clinicalDbContext.ReferralSource.Add(referralsource);
            _clinicalDbContext.SaveChanges();

            ReferralSource ReferralSource = new ReferralSource();
            ReferralSource.CreatedOn = referralsource.CreatedOn;
            ReferralSource.ReferralSourceId = referralsource.ReferralSourceId;

            return ReferralSource;
        }
        private object AddSocialHistory(string str, RbacUser currentUser)
        {
            SocialHistory socialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);

            socialHistory.CreatedBy = currentUser.EmployeeId;
            socialHistory.CreatedOn = DateTime.Now;

            _clinicalDbContext.SocialHistory.Add(socialHistory);
            _clinicalDbContext.SaveChanges();
            return socialHistory;
        }
        private object AddSurgicalHistory(string str, RbacUser currentUser)
        {
            SurgicalHistory surgicalHistory = null;
            surgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);

            surgicalHistory.CreatedBy = currentUser.EmployeeId;
            surgicalHistory.CreatedOn = DateTime.Now;

            _clinicalDbContext.SurgicalHistory.Add(surgicalHistory);
            _clinicalDbContext.SaveChanges();
            return surgicalHistory;
        }
        private object AddFamilyHistory(string str, RbacUser currentUser)
        {
            FamilyHistory familyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
            familyHistory.CreatedBy = currentUser.EmployeeId;
            familyHistory.CreatedOn = DateTime.Now;
            _clinicalDbContext.FamilyHistory.Add(familyHistory);
            _clinicalDbContext.SaveChanges();

            FamilyHistory FamilyHistory = new FamilyHistory();
            FamilyHistory.CreatedOn = familyHistory.CreatedOn;
            FamilyHistory.FamilyProblemId = familyHistory.FamilyProblemId;

            return FamilyHistory;
        }
        private object AddPastMedicalProblem(string str, RbacUser currentUser)
        {
            PastMedicalProblem pastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
            pastMedical.CreatedBy = currentUser.EmployeeId;
            pastMedical.CreatedOn = DateTime.Now;
            _clinicalDbContext.PastMedicals.Add(pastMedical);
            _clinicalDbContext.SaveChanges();

            PastMedicalProblem pastMedicalProblem = new PastMedicalProblem();
            pastMedicalProblem.CreatedOn = pastMedical.CreatedOn;
            pastMedicalProblem.PatientProblemId = pastMedical.PatientProblemId;

            return pastMedicalProblem;
        }
        private object AddActiveMedicalProblem(string str, RbacUser currentUser)
        {
            ActiveMedicalProblem activeMedical = JsonConvert.DeserializeObject<ActiveMedicalProblem>(str);


            if (activeMedical.ResolvedDate != null) // contains resolved date only when added from past medical
                activeMedical.ResolvedDate = null; // making it as null

            activeMedical.CreatedBy = currentUser.EmployeeId;
            activeMedical.CreatedOn = DateTime.Now;
            activeMedical.OnSetDate = activeMedical.CreatedOn;

            _clinicalDbContext.ActiveMedical.Add(activeMedical);
            _clinicalDbContext.SaveChanges();

            ActiveMedicalProblem activeMedicalProblem = new ActiveMedicalProblem();
            activeMedicalProblem.CreatedOn = activeMedical.CreatedOn;
            activeMedicalProblem.PatientProblemId = activeMedical.PatientProblemId;

            return activeMedicalProblem;
        }
        private object AddMedicationPrescription(string str, RbacUser currentUser)
        {
            List<MedicationPrescriptionModel> medications = JsonConvert.DeserializeObject<List<MedicationPrescriptionModel>>(str);
            medications.ForEach(req =>
            {
                req.CreatedBy = currentUser.EmployeeId;
                req.CreatedOn = DateTime.Now;
                _clinicalDbContext.MedicationPrescriptions.Add(req);
            });

            _clinicalDbContext.SaveChanges();
            return null;
        }
        private object AddHomeMedication(string str, RbacUser currentUser)
        {
            HomeMedicationModel homemedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
            homemedication.CreatedBy = currentUser.EmployeeId;
            homemedication.CreatedOn = DateTime.Now;
            _clinicalDbContext.HomeMedications.Add(homemedication);
            _clinicalDbContext.SaveChanges();
            return homemedication;
        }
        private object AddAllergy(string str, RbacUser currentUser)
        {
            AllergyModel allergy = JsonConvert.DeserializeObject<AllergyModel>(str);
            allergy.CreatedBy = currentUser.EmployeeId;
            allergy.CreatedOn = DateTime.Now;

            _clinicalDbContext.Allergy.Add(allergy);
            _clinicalDbContext.SaveChanges();
            return allergy;
        }
        private object SaveScannedEyeImages(IFormFileCollection files, RbacUser currentUser)
        {
            /////Read Files From Clent Side 
            ///Read patient Files Model Other Data
            var reportDetails = Request.Form["reportDetails"];
            EyeScanModel patFileData = DanpheJSONConvert.DeserializeObject<EyeScanModel>(reportDetails);
            ////We Do Process in Transaction because Now Situation that 
            patFileData.UploadedBy = currentUser.EmployeeId;
            /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var file in files)
                    {
                        if (file.Length > 0)
                        {
                            /////Converting Files to Byte there for we require MemoryStream object
                            using (var ms = new MemoryStream())
                            {
                                ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
                                string currentFileExtention = Path.GetExtension(file.FileName);
                                ////Copy Each file to MemoryStream
                                file.CopyTo(ms);
                                ////Convert File to Byte[]
                                var fileBytes = ms.ToArray();
                                ///Based on Patient ID and File Type We have to check what is the MAXIMUM File NO 
                                var avilableMAXFileNo = (from dbFile in _clinicalDbContext.EyeScan
                                                         where dbFile.PatientId == patFileData.PatientId && dbFile.FileType == patFileData.FileType
                                                         select new { dbFile.FileNo }).ToList();
                                int max;
                                if (avilableMAXFileNo.Count > 0)
                                {
                                    max = avilableMAXFileNo.Max(x => x.FileNo);
                                }
                                else
                                {
                                    max = 0;
                                }
                                ///this is Current Insrting File MaX Number
                                var currentFileNo = (max + 1);
                                string currentfileName = "";
                                // this is Latest File NAme with FileNo in the Last Binding
                                currentfileName = patFileData.FileName + '_' + currentFileNo + currentFileExtention;

                                var tempModel = new EyeScanModel();
                                tempModel.FileBinaryData = fileBytes;
                                tempModel.PatientId = patFileData.PatientId;
                                tempModel.ROWGUID = Guid.NewGuid();
                                tempModel.FileType = patFileData.FileType;
                                tempModel.UploadedBy = currentUser.EmployeeId;
                                tempModel.UploadedOn = DateTime.Now;
                                tempModel.Description = patFileData.Description;
                                tempModel.FileName = currentfileName;
                                tempModel.FileNo = currentFileNo;
                                tempModel.Title = patFileData.Title;
                                tempModel.FileExtention = currentFileExtention;
                                _clinicalDbContext.EyeScan.Add(tempModel);
                                _clinicalDbContext.SaveChanges();
                            }
                        }
                    }
                    ///After All Files Added Commit the Transaction
                    dbContextTransaction.Commit();

                    return "Scanned Eye Images uploaded Successfully.";
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object AddInputOutput(string str, RbacUser currentUser)
        {
            InputOutputModel inputoutput = JsonConvert.DeserializeObject<InputOutputModel>(str);
            inputoutput.CreatedBy = currentUser.EmployeeId;
            inputoutput.CreatedOn = DateTime.Now;

            _clinicalDbContext.InputOutput.Add(inputoutput);
            _clinicalDbContext.SaveChanges();

            return inputoutput;
        }
        private object AddPatientVitals(string str, RbacUser currentUser)
        {
            VitalsModel vitals = JsonConvert.DeserializeObject<VitalsModel>(str);
            vitals.CreatedBy = currentUser.EmployeeId;
            vitals.CreatedOn = DateTime.Now;

            //client side units have default values for the units.
            //if data is not entered then the respective unit is set as null.

            if (vitals.Height == null)
                vitals.HeightUnit = null;
            if (vitals.Weight == null)
                vitals.WeightUnit = null;
            if (vitals.Temperature == null)
                vitals.TemperatureUnit = null;


            _clinicalDbContext.Vitals.Add(vitals);
            _clinicalDbContext.SaveChanges();
            return vitals;
        }


        //[HttpPost]
        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    try
        //    {
        //        ClinicalDbContext dbContext = new ClinicalDbContext(connString);

        //        string reqType = this.ReadQueryStringData("reqType");
        //        int patientId = ToInt(this.ReadQueryStringData("patientId"));
        //        //JArray json = JArray.Parse(str);

        //        //Vitals
        //        if (reqType == "vitals")
        //        {
        //            string str = this.ReadPostData();
        //            VitalsModel vitals = JsonConvert.DeserializeObject<VitalsModel>(str);
        //            vitals.CreatedBy = currentUser.EmployeeId;
        //            vitals.CreatedOn = DateTime.Now;

        //            //client side units have default values for the units.
        //            //if data is not entered then the respective unit is set as null.

        //            if (vitals.Height == null)
        //                vitals.HeightUnit = null;
        //            if (vitals.Weight == null)
        //                vitals.WeightUnit = null;
        //            if (vitals.Temperature == null)
        //                vitals.TemperatureUnit = null;


        //            dbContext.Vitals.Add(vitals);
        //            dbContext.SaveChanges();
        //            responseData.Results = vitals;
        //            responseData.Status = "OK";
        //        }



        //        //InputOutput
        //        else if (reqType == "inputoutput")
        //        {
        //            string str = this.ReadPostData();
        //            InputOutputModel inputoutput = JsonConvert.DeserializeObject<InputOutputModel>(str);
        //            inputoutput.CreatedBy = currentUser.EmployeeId;
        //            inputoutput.CreatedOn = DateTime.Now;

        //            dbContext.InputOutput.Add(inputoutput);
        //            dbContext.SaveChanges();

        //            //InputOutputModel returnInputOutput = new InputOutputModel();
        //            //returnInputOutput.CreatedOn = inputoutput.CreatedOn;
        //            //returnInputOutput.InputOutputId = inputoutput.InputOutputId;

        //            responseData.Results = inputoutput;
        //            responseData.Status = "OK";

        //        }
        //        else if (reqType == "postclinicaltemplate")
        //        {

        //        }

        //        else if (reqType == "scanimagesupload")
        //        {
        //            /////Read Files From Clent Side 
        //            var files = this.ReadFiles();
        //            ///Read patient Files Model Other Data
        //            var reportDetails = Request.Form["reportDetails"];
        //            EyeScanModel patFileData = DanpheJSONConvert.DeserializeObject<EyeScanModel>(reportDetails);
        //            ////We Do Process in Transaction because Now Situation that 
        //            patFileData.UploadedBy = currentUser.EmployeeId;
        //            /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    foreach (var file in files)
        //                    {
        //                        if (file.Length > 0)
        //                        {
        //                            /////Converting Files to Byte there for we require MemoryStream object
        //                            using (var ms = new MemoryStream())
        //                            {
        //                                ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
        //                                string currentFileExtention = Path.GetExtension(file.FileName);
        //                                ////Copy Each file to MemoryStream
        //                                file.CopyTo(ms);
        //                                ////Convert File to Byte[]
        //                                var fileBytes = ms.ToArray();
        //                                ///Based on Patient ID and File Type We have to check what is the MAXIMUM File NO 
        //                                var avilableMAXFileNo = (from dbFile in dbContext.EyeScan
        //                                                         where dbFile.PatientId == patFileData.PatientId && dbFile.FileType == patFileData.FileType
        //                                                         select new { dbFile.FileNo }).ToList();
        //                                int max;
        //                                if (avilableMAXFileNo.Count > 0)
        //                                {
        //                                    max = avilableMAXFileNo.Max(x => x.FileNo);
        //                                }
        //                                else
        //                                {
        //                                    max = 0;
        //                                }
        //                                ///this is Current Insrting File MaX Number
        //                                var currentFileNo = (max + 1);
        //                                string currentfileName = "";
        //                                // this is Latest File NAme with FileNo in the Last Binding
        //                                currentfileName = patFileData.FileName + '_' + currentFileNo + currentFileExtention;

        //                                var tempModel = new EyeScanModel();
        //                                tempModel.FileBinaryData = fileBytes;
        //                                tempModel.PatientId = patFileData.PatientId;
        //                                tempModel.ROWGUID = Guid.NewGuid();
        //                                tempModel.FileType = patFileData.FileType;
        //                                tempModel.UploadedBy = currentUser.EmployeeId;
        //                                tempModel.UploadedOn = DateTime.Now;
        //                                tempModel.Description = patFileData.Description;
        //                                tempModel.FileName = currentfileName;
        //                                tempModel.FileNo = currentFileNo;
        //                                tempModel.Title = patFileData.Title;
        //                                tempModel.FileExtention = currentFileExtention;
        //                                dbContext.EyeScan.Add(tempModel);
        //                                dbContext.SaveChanges();
        //                            }
        //                        }
        //                    }
        //                    ///After All Files Added Commit the Transaction
        //                    dbContextTransaction.Commit();

        //                    responseData.Results = null;
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    dbContextTransaction.Rollback();
        //                    responseData.Results = null;
        //                    responseData.Status = "Failed";
        //                    throw ex;
        //                }
        //            }
        //        }

        //        //Allergy
        //        else if (reqType == "allergy")
        //        {
        //            string str = this.ReadPostData();
        //            AllergyModel allergy = JsonConvert.DeserializeObject<AllergyModel>(str);
        //            allergy.CreatedBy = currentUser.EmployeeId;
        //            allergy.CreatedOn = DateTime.Now;

        //            dbContext.Allergy.Add(allergy);
        //            dbContext.SaveChanges();

        //            //AllergyModel returnAllergy = new AllergyModel();
        //            //returnAllergy.CreatedOn = allergy.CreatedOn;
        //            //returnAllergy.PatientAllergyId = allergy.PatientAllergyId;

        //            ////assigning AllergenAdvRecName 
        //            //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //            //if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null) {
        //            //    allergy.AllergenAdvRecName = phrmDbContext.PHRMGenericModel
        //            //            .Where(a => a.GenericId == allergy.AllergenAdvRecId).FirstOrDefault().GenericName;
        //            //}
        //            ////sud: 15June (we'll show Others in the same format as Medication allergies)
        //            //else if (allergy.AllergyType == "Others")
        //            //{
        //            //    allergy.AllergenAdvRecName = allergy.Others;
        //            //}

        //            responseData.Results = allergy;
        //            responseData.Status = "OK";
        //        }

        //        //HomeMedication
        //        else if (reqType == "homemedication")
        //        {
        //            string str = this.ReadPostData();
        //            HomeMedicationModel homemedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
        //            homemedication.CreatedBy = currentUser.EmployeeId;
        //            homemedication.CreatedOn = DateTime.Now;
        //            dbContext.HomeMedications.Add(homemedication);
        //            dbContext.SaveChanges();


        //            responseData.Results = homemedication;
        //            responseData.Status = "OK";
        //        }

        //        //MedicationPrescription
        //        else if (reqType == "medicationprescription")
        //        {
        //            string str = this.ReadPostData();
        //            List<MedicationPrescriptionModel> medications = JsonConvert.DeserializeObject<List<MedicationPrescriptionModel>>(str);
        //            medications.ForEach(req =>
        //            {
        //                req.CreatedBy = currentUser.EmployeeId;
        //                req.CreatedOn = DateTime.Now;
        //                dbContext.MedicationPrescriptions.Add(req);
        //            });

        //            dbContext.SaveChanges();

        //            //we dont need this but once i have to discuss with sudarshan sir<27/04/2017> ..........important!!!! to discusss
        //            //medications.ForEach(medication =>
        //            //{
        //            //   List< MedicationPrescriptionModel>returnMedication = new List<MedicationPrescriptionModel>();
        //            //returnMedication.MedicationPrescriptionId = medication.MedicationPrescriptionId;
        //            //returnMedication.Date = medication.Date;
        //            //MasterDbContext masterDbContext = new MasterDbContext(connString);
        //            //if (medication.MedicationId != 0)
        //            //{
        //            //    //assinging MedicationName
        //            //    returnMedication.MedicationName = masterDbContext.Medicines
        //            //            .Where(m => m.MedicineId == medication.MedicationId).FirstOrDefault().MedicineName;
        //            //}
        //            //if (medication.ProviderId != 0)
        //            //{
        //            //    //assigning ProviderName
        //            //    returnMedication.ProviderName = masterDbContext.Employee
        //            //   .Where(e => e.EmployeeId == medication.ProviderId)
        //            //   .Select(e => e).FirstOrDefault().FullName;
        //            //}
        //            //});
        //            //responseData.Results = returnMedication;
        //            responseData.Status = "OK";
        //        }

        //        //ActiveMedical
        //        else if (reqType == "activemedical")
        //        {
        //            string str = this.ReadPostData();
        //            ActiveMedicalProblem activeMedical = JsonConvert.DeserializeObject<ActiveMedicalProblem>(str);


        //            if (activeMedical.ResolvedDate != null) // contains resolved date only when added from past medical
        //                activeMedical.ResolvedDate = null; // making it as null

        //            activeMedical.CreatedBy = currentUser.EmployeeId;
        //            activeMedical.CreatedOn = DateTime.Now;
        //            activeMedical.OnSetDate = activeMedical.CreatedOn;

        //            dbContext.ActiveMedical.Add(activeMedical);
        //            dbContext.SaveChanges();

        //            ActiveMedicalProblem returnActiveMedical = new ActiveMedicalProblem();
        //            returnActiveMedical.CreatedOn = activeMedical.CreatedOn;
        //            returnActiveMedical.PatientProblemId = activeMedical.PatientProblemId;

        //            responseData.Results = returnActiveMedical;
        //            responseData.Status = "OK";
        //        }

        //        //PastMedical
        //        else if (reqType == "pastmedical")
        //        {
        //            string str = this.ReadPostData();
        //            PastMedicalProblem pastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
        //            pastMedical.CreatedBy = currentUser.EmployeeId;
        //            pastMedical.CreatedOn = DateTime.Now;
        //            dbContext.PastMedicals.Add(pastMedical);
        //            dbContext.SaveChanges();

        //            PastMedicalProblem returnPastMedical = new PastMedicalProblem();
        //            returnPastMedical.CreatedOn = pastMedical.CreatedOn;
        //            returnPastMedical.PatientProblemId = pastMedical.PatientProblemId;

        //            responseData.Results = returnPastMedical;
        //            responseData.Status = "OK";
        //        }

        //        //FamilyHistory
        //        else if (reqType == "familyhistory")
        //        {
        //            string str = this.ReadPostData();
        //            FamilyHistory familyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
        //            familyHistory.CreatedBy = currentUser.EmployeeId;
        //            familyHistory.CreatedOn = DateTime.Now;
        //            dbContext.FamilyHistory.Add(familyHistory);
        //            dbContext.SaveChanges();

        //            FamilyHistory returnFamilyHistory = new FamilyHistory();
        //            returnFamilyHistory.CreatedOn = familyHistory.CreatedOn;
        //            returnFamilyHistory.FamilyProblemId = familyHistory.FamilyProblemId;

        //            responseData.Results = returnFamilyHistory;
        //            responseData.Status = "OK";
        //        }

        //        //SurgicalHistory
        //        else if (reqType == "surgicalhistory")
        //        {
        //            string str = this.ReadPostData();
        //            SurgicalHistory surgicalHistory = null;
        //            surgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);

        //            surgicalHistory.CreatedBy = currentUser.EmployeeId;
        //            surgicalHistory.CreatedOn = DateTime.Now;

        //            dbContext.SurgicalHistory.Add(surgicalHistory);
        //            dbContext.SaveChanges();

        //            SurgicalHistory returnSurgicalHistory = new SurgicalHistory();
        //            returnSurgicalHistory.CreatedOn = surgicalHistory.CreatedOn;
        //            returnSurgicalHistory.SurgicalHistoryId = surgicalHistory.SurgicalHistoryId;

        //            responseData.Results = returnSurgicalHistory;
        //            responseData.Status = "OK";
        //        }

        //        //SocialHistory
        //        else if (reqType == "socialhistory")
        //        {
        //            string str = this.ReadPostData();
        //            SocialHistory socialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);

        //            socialHistory.CreatedBy = currentUser.EmployeeId;
        //            socialHistory.CreatedOn = DateTime.Now;

        //            dbContext.SocialHistory.Add(socialHistory);
        //            dbContext.SaveChanges();

        //            SocialHistory returnSocialHistory = new SocialHistory();
        //            returnSocialHistory.CreatedOn = socialHistory.CreatedOn;
        //            returnSocialHistory.SocialHistoryId = socialHistory.SocialHistoryId;

        //            responseData.Results = returnSocialHistory;
        //            responseData.Status = "OK";
        //        }
        //        //ReferralSource 
        //        else if (reqType == "referralsource")
        //        {
        //            string str = this.ReadPostData();
        //            ReferralSource referralsource = JsonConvert.DeserializeObject<ReferralSource>(str);

        //            referralsource.CreatedBy = currentUser.EmployeeId;
        //            referralsource.CreatedOn = DateTime.Now;

        //            dbContext.ReferralSource.Add(referralsource);
        //            dbContext.SaveChanges();

        //            ReferralSource returnReferralSource = new ReferralSource();
        //            returnReferralSource.CreatedOn = referralsource.CreatedOn;
        //            returnReferralSource.ReferralSourceId = referralsource.ReferralSourceId;

        //            responseData.Results = returnReferralSource;
        //            responseData.Status = "OK";
        //        }
        //        //Notes
        //        else if (reqType == "notes")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

        //            List<NotesModel> existingNotes = dbContext.Notes
        //                .Where(n => n.PatientVisitId == notes.PatientVisitId).ToList();
        //            //if (existingNotes.Count > 0)
        //            //    notes.NoteType = "Progress Note";
        //            //else
        //            //    notes.NoteType = "History and Physical Note";
        //            notes.CreatedBy = currentUser.EmployeeId;
        //            notes.CreatedOn = DateTime.Now;

        //            dbContext.Notes.Add(notes);
        //            dbContext.SaveChanges();

        //            responseData.Results = notes;
        //            responseData.Status = "OK";
        //        }
        //        else if (reqType == "subjective-notes")
        //        {
        //            string str = this.ReadPostData();
        //            SubjectiveNoteModel subjectiveNote = JsonConvert.DeserializeObject<SubjectiveNoteModel>(str);
        //            subjectiveNote.CreatedBy = currentUser.EmployeeId;
        //            subjectiveNote.CreatedOn = DateTime.Now;
        //            dbContext.SubjectiveNotes.Add(subjectiveNote);
        //            dbContext.SaveChanges();

        //            responseData.Results = subjectiveNote;
        //            responseData.Status = "OK";
        //        }

        //        else if (reqType == "opd-general-note")
        //        {
        //            string str = this.ReadPostData();
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

        //                    SubjectiveNoteModel subjectiveNote = notes.SubjectiveNote;
        //                    ObjectiveNoteModel objectiveNote = notes.ObjectiveNote;
        //                    List<ClinicalDiagnosisModel> clinialDiagnosis = notes.AllIcdAndOrders;

        //                    notes.SubjectiveNote = null;
        //                    notes.ObjectiveNote = null;
        //                    //add opdGeneralNote
        //                    notes.CreatedBy = currentUser.EmployeeId;
        //                    notes.CreatedOn = DateTime.Now;
        //                    dbContext.Notes.Add(notes);
        //                    dbContext.SaveChanges();

        //                    //add subjective note
        //                    if (subjectiveNote != null)
        //                    {
        //                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        subjectiveNote.CreatedOn = notes.CreatedOn;
        //                        subjectiveNote.NotesId = notes.NotesId;
        //                        dbContext.SubjectiveNotes.Add(subjectiveNote);
        //                        dbContext.SaveChanges();
        //                    }

        //                    if (objectiveNote != null)
        //                    {
        //                        //add Objective Note  
        //                        objectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        objectiveNote.CreatedOn = DateTime.Now;
        //                        objectiveNote.NotesId = notes.NotesId;
        //                        dbContext.ObjectiveNotes.Add(objectiveNote);
        //                        dbContext.SaveChanges();
        //                    }
        //                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
        //                    {

        //                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
        //                        var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "LAB"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();

        //                        var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "Radiology"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();


        //                        BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                        {
        //                            Diagnosis.CreatedOn = DateTime.Now;
        //                            Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            Diagnosis.NotesId = notes.NotesId;
        //                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                            dbContext.SaveChanges();



        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                labReq.CreatedBy = currentUser.EmployeeId;
        //                                labReq.CreatedOn = DateTime.Now;
        //                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.LabRequisitions.Add(labReq);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from labPrice in priceForLabRequisition
        //                                                  where labPrice.ItemId == labReq.LabTestId
        //                                                  select labPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                RequisitionItem.PatientId = labReq.PatientId;
        //                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                imgnRequisition.CreatedOn = DateTime.Now;
        //                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from radPrice in priceForRadRequisition
        //                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                  select radPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                phrmRequisition.CreatedOn = DateTime.Now;
        //                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                dbContext.SaveChanges();
        //                            }

        //                        }
        //                        foreach (BillItemRequisition bill in allBillRequisition)
        //                        {
        //                            dbContext.BillItemRequisitions.Add(bill);
        //                        }

        //                        dbContext.SaveChanges();

        //                    }
        //                    responseData.Status = "OK";
        //                    //Commit Transaction
        //                    dbContextTransaction.Commit();
        //                }
        //                catch (Exception ex)
        //                {
        //                    //Rollback all transaction if exception occured
        //                    dbContextTransaction.Rollback();
        //                    throw ex;
        //                }
        //            }

        //        }
        //        else if (reqType == "posteyemaster")
        //        {
        //            string str = this.ReadPostData();
        //            EyeModel EyeMaster = JsonConvert.DeserializeObject<EyeModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (EyeMaster.PatientId != 0)
        //                    {
        //                        EyeMaster.CreatedBy = currentUser.EmployeeId;
        //                        EyeMaster.CreatedOn = DateTime.Now;
        //                        dbContext.ClinicalEyeMaster.Add(EyeMaster);
        //                        dbContext.SaveChanges();
        //                        var MasterId = EyeMaster.Id;

        //                        foreach (RefractionModel refraction in EyeMaster.RefractionOD)
        //                        {
        //                            refraction.MasterId = MasterId;
        //                            refraction.CreatedBy = currentUser.EmployeeId;
        //                            refraction.CreatedOn = DateTime.Now;
        //                            dbContext.Refration.Add(refraction);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (RefractionModel refraction in EyeMaster.RefractionOS)
        //                        {
        //                            refraction.MasterId = MasterId;
        //                            refraction.CreatedBy = currentUser.EmployeeId;
        //                            refraction.CreatedOn = DateTime.Now;
        //                            dbContext.Refration.Add(refraction);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.OperationNotesOD.MasterId = MasterId;
        //                            EyeMaster.OperationNotesOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.OperationNotesOD.CreatedOn = DateTime.Now;
        //                            dbContext.OperationNotes.Add(EyeMaster.OperationNotesOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.OperationNotesOS.MasterId = MasterId;
        //                            EyeMaster.OperationNotesOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.OperationNotesOS.CreatedOn = DateTime.Now;
        //                            dbContext.OperationNotes.Add(EyeMaster.OperationNotesOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.AblationOD.MasterId = MasterId;
        //                            EyeMaster.AblationOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.AblationOD.CreatedOn = DateTime.Now;
        //                            dbContext.AblationProfile.Add(EyeMaster.AblationOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.AblationOS.MasterId = MasterId;
        //                            EyeMaster.AblationOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.AblationOS.CreatedOn = DateTime.Now;
        //                            dbContext.AblationProfile.Add(EyeMaster.AblationOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
        //                        {
        //                            laserdata.MasterId = MasterId;
        //                            laserdata.CreatedBy = currentUser.EmployeeId;
        //                            laserdata.CreatedOn = DateTime.Now;
        //                            dbContext.LaserData.Add(laserdata);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOS)
        //                        {
        //                            laserdata.MasterId = MasterId;
        //                            laserdata.CreatedBy = currentUser.EmployeeId;
        //                            laserdata.CreatedOn = DateTime.Now;
        //                            dbContext.LaserData.Add(laserdata);
        //                            dbContext.SaveChanges();
        //                        }

        //                        foreach (PreOPPachymetryModel prepachymetry in EyeMaster.PrePachymetryOD)
        //                        {
        //                            prepachymetry.MasterId = MasterId;
        //                            prepachymetry.CreatedBy = currentUser.EmployeeId;
        //                            prepachymetry.CreatedOn = DateTime.Now;
        //                            dbContext.PreOpPachymetry.Add(prepachymetry);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (PreOPPachymetryModel prepachymetry in EyeMaster.PrePachymetryOS)
        //                        {
        //                            prepachymetry.MasterId = MasterId;
        //                            prepachymetry.CreatedBy = currentUser.EmployeeId;
        //                            prepachymetry.CreatedOn = DateTime.Now;
        //                            dbContext.PreOpPachymetry.Add(prepachymetry);
        //                            dbContext.SaveChanges();
        //                        }

        //                        {
        //                            EyeMaster.LasikRSTOD.MasterId = MasterId;
        //                            EyeMaster.LasikRSTOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.LasikRSTOD.CreatedOn = DateTime.Now;
        //                            dbContext.LasikRST.Add(EyeMaster.LasikRSTOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.LasikRSTOS.MasterId = MasterId;
        //                            EyeMaster.LasikRSTOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.LasikRSTOS.CreatedOn = DateTime.Now;
        //                            dbContext.LasikRST.Add(EyeMaster.LasikRSTOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.SmileSettingOD.MasterId = MasterId;
        //                            EyeMaster.SmileSettingOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.SmileSettingOD.CreatedOn = DateTime.Now;
        //                            dbContext.SmileSetting.Add(EyeMaster.SmileSettingOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.SmileSettingOS.MasterId = MasterId;
        //                            EyeMaster.SmileSettingOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.SmileSettingOS.CreatedOn = DateTime.Now;
        //                            dbContext.SmileSetting.Add(EyeMaster.SmileSettingOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.VisumaxOD.MasterId = MasterId;
        //                            EyeMaster.VisumaxOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.VisumaxOD.CreatedOn = DateTime.Now;
        //                            dbContext.VisuMax.Add(EyeMaster.VisumaxOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.VisumaxOS.MasterId = MasterId;
        //                            EyeMaster.VisumaxOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.VisumaxOS.CreatedOn = DateTime.Now;
        //                            dbContext.VisuMax.Add(EyeMaster.VisumaxOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.SmileIncisionOD.MasterId = MasterId;
        //                            EyeMaster.SmileIncisionOD.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.SmileIncisionOD.CreatedOn = DateTime.Now;
        //                            dbContext.SmileIncision.Add(EyeMaster.SmileIncisionOD);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            EyeMaster.SmileIncisionOS.MasterId = MasterId;
        //                            EyeMaster.SmileIncisionOS.CreatedBy = currentUser.EmployeeId;
        //                            EyeMaster.SmileIncisionOS.CreatedOn = DateTime.Now;
        //                            dbContext.SmileIncision.Add(EyeMaster.SmileIncisionOS);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (ORAModel ora in EyeMaster.ORAOD)
        //                        {
        //                            ora.MasterId = MasterId;
        //                            ora.CreatedBy = currentUser.EmployeeId;
        //                            ora.CreatedOn = DateTime.Now;
        //                            dbContext.ORA.Add(ora);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (ORAModel ora in EyeMaster.ORAOS)
        //                        {
        //                            ora.MasterId = MasterId;
        //                            ora.CreatedBy = currentUser.EmployeeId;
        //                            ora.CreatedOn = DateTime.Now;
        //                            dbContext.ORA.Add(ora);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (WavefrontModel wavefront in EyeMaster.WavefrontOD)
        //                        {
        //                            wavefront.MasterId = MasterId;
        //                            wavefront.CreatedBy = currentUser.EmployeeId;
        //                            wavefront.CreatedOn = DateTime.Now;
        //                            dbContext.Wavefront.Add(wavefront);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (WavefrontModel wavefront in EyeMaster.WavefrontOS)
        //                        {
        //                            wavefront.MasterId = MasterId;
        //                            wavefront.CreatedBy = currentUser.EmployeeId;
        //                            wavefront.CreatedOn = DateTime.Now;
        //                            dbContext.Wavefront.Add(wavefront);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (PachymetryModel pachymetry in EyeMaster.PachymetryOD)
        //                        {
        //                            pachymetry.MasterId = MasterId;
        //                            pachymetry.CreatedBy = currentUser.EmployeeId;
        //                            pachymetry.CreatedOn = DateTime.Now;
        //                            dbContext.Pachymetry.Add(pachymetry);
        //                            dbContext.SaveChanges();
        //                        }
        //                        foreach (PachymetryModel pachymetry in EyeMaster.PachymetryOS)
        //                        {
        //                            pachymetry.MasterId = MasterId;
        //                            pachymetry.CreatedBy = currentUser.EmployeeId;
        //                            pachymetry.CreatedOn = DateTime.Now;
        //                            dbContext.Pachymetry.Add(pachymetry);
        //                            dbContext.SaveChanges();
        //                        }
        //                    }
        //                    dbContextTransaction.Commit();
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //            responseData.Status = "OK";
        //        }
        //        //  Note-Template                

        //        else if (reqType == "postprocedurenotetemplate")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (NotesMaster.PatientId != 0)
        //                    {
        //                        NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                        NotesMaster.CreatedOn = DateTime.Now;
        //                        dbContext.Notes.Add(NotesMaster);
        //                        dbContext.SaveChanges();
        //                        var Notesid = NotesMaster.NotesId;

        //                        NotesMaster.ProcedureNote.NotesId = Notesid;
        //                        NotesMaster.ProcedureNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        NotesMaster.ProcedureNote.PatientId = NotesMaster.PatientId;
        //                        NotesMaster.ProcedureNote.CreatedBy = currentUser.EmployeeId;
        //                        NotesMaster.ProcedureNote.CreatedOn = DateTime.Now;
        //                        NotesMaster.ProcedureNote.IsActive = true;
        //                        dbContext.ProcedureNote.Add(NotesMaster.ProcedureNote);
        //                        dbContext.SaveChanges();

        //                    }

        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }

        //        }

        //        else if (reqType == "postprogressnotetemplate")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (NotesMaster.PatientId != 0)
        //                    {
        //                        NotesMaster.CreatedOn = DateTime.Now;
        //                        NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                        dbContext.Notes.Add(NotesMaster);
        //                        dbContext.SaveChanges();
        //                        var Notesid = NotesMaster.NotesId;

        //                        NotesMaster.ProgressNote.NotesId = Notesid;
        //                        NotesMaster.ProgressNote.Date = DateTime.Now;
        //                        NotesMaster.ProgressNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        NotesMaster.ProgressNote.PatientId = NotesMaster.PatientId;
        //                        NotesMaster.ProgressNote.CreatedBy = currentUser.EmployeeId;
        //                        NotesMaster.ProgressNote.CreatedOn = DateTime.Now;
        //                        NotesMaster.ProgressNote.IsActive = true;
        //                        dbContext.ProgressNote.Add(NotesMaster.ProgressNote);
        //                        dbContext.SaveChanges();

        //                    }

        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }

        //        }

        //        else if (reqType == "postfreetextnotetemplate")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (NotesMaster.PatientId != 0)
        //                    {
        //                        NotesMaster.CreatedOn = DateTime.Now;
        //                        NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                        dbContext.Notes.Add(NotesMaster);
        //                        dbContext.SaveChanges();
        //                        var Notesid = NotesMaster.NotesId;

        //                        NotesMaster.FreeTextNote.NotesId = Notesid;
        //                        NotesMaster.FreeTextNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        NotesMaster.FreeTextNote.PatientId = NotesMaster.PatientId;
        //                        NotesMaster.FreeTextNote.CreatedBy = currentUser.EmployeeId;
        //                        NotesMaster.FreeTextNote.CreatedOn = DateTime.Now;
        //                        NotesMaster.FreeTextNote.IsActive = true;
        //                        dbContext.FreeText.Add(NotesMaster.FreeTextNote);
        //                        dbContext.SaveChanges();

        //                    }
        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //        }
        //        // Post History and Physical note
        //        else if (reqType == "posthistoryandphysicalnote")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                    NotesMaster.CreatedOn = DateTime.Now;
        //                    dbContext.Notes.Add(NotesMaster);
        //                    dbContext.SaveChanges();
        //                    var Notesid = NotesMaster.NotesId;

        //                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
        //                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;

        //                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;

        //                    if (subjectiveNote != null)
        //                    {                                
        //                        subjectiveNote.NotesId = Notesid;
        //                        subjectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        subjectiveNote.PatientId = NotesMaster.PatientId;
        //                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        subjectiveNote.CreatedOn = DateTime.Now;
        //                        subjectiveNote.IsActive = true;
        //                        dbContext.SubjectiveNotes.Add(subjectiveNote);
        //                        dbContext.SaveChanges();

        //                    }
        //                    if (objectiveNote != null)
        //                    {
        //                        objectiveNote.NotesId = Notesid;
        //                        objectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        objectiveNote.PatientId = NotesMaster.PatientId;
        //                        objectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        objectiveNote.CreatedOn = DateTime.Now;
        //                        objectiveNote.IsActive = true;
        //                        dbContext.ObjectiveNotes.Add(objectiveNote);
        //                        dbContext.SaveChanges();
        //                    }

        //                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
        //                    {

        //                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
        //                        var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "LAB"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();

        //                        var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "Radiology"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();


        //                        BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                        {
        //                            Diagnosis.CreatedOn = DateTime.Now;
        //                            Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            Diagnosis.NotesId = NotesMaster.NotesId;
        //                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                            dbContext.SaveChanges();



        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                labReq.CreatedBy = currentUser.EmployeeId;
        //                                labReq.CreatedOn = DateTime.Now;
        //                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.LabRequisitions.Add(labReq);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from labPrice in priceForLabRequisition
        //                                                  where labPrice.ItemId == labReq.LabTestId
        //                                                  select labPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                RequisitionItem.PatientId = labReq.PatientId;
        //                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                imgnRequisition.CreatedOn = DateTime.Now;
        //                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from radPrice in priceForRadRequisition
        //                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                  select radPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                phrmRequisition.CreatedOn = DateTime.Now;
        //                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                dbContext.SaveChanges();
        //                            }

        //                        }
        //                        foreach (BillItemRequisition bill in allBillRequisition)
        //                        {
        //                            dbContext.BillItemRequisitions.Add(bill);
        //                        }
        //                        dbContext.SaveChanges();
        //                    }

        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";

        //                }
        //                catch (Exception ex)
        //                {
        //                    //Rollback all transaction if exception occured
        //                    dbContextTransaction.Rollback();
        //                    responseData.Status = "Failed";
        //                    throw ex;
        //                }

        //            }
        //        }

        //        // Post Emergency note
        //        else if (reqType == "postemergencynote")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                    NotesMaster.CreatedOn = DateTime.Now;
        //                    dbContext.Notes.Add(NotesMaster);
        //                    dbContext.SaveChanges();
        //                    var Notesid = NotesMaster.NotesId;

        //                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
        //                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
        //                    EmergencyNoteModel emergencyNote = NotesMaster.EmergencyNote;

        //                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;

        //                    if (subjectiveNote != null)
        //                    {
        //                        subjectiveNote.NotesId = Notesid;
        //                        subjectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        subjectiveNote.PatientId = NotesMaster.PatientId;
        //                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        subjectiveNote.CreatedOn = DateTime.Now;
        //                        subjectiveNote.IsActive = true;
        //                        dbContext.SubjectiveNotes.Add(subjectiveNote);
        //                        dbContext.SaveChanges();

        //                    }
        //                    if (objectiveNote != null)
        //                    {
        //                        objectiveNote.NotesId = Notesid;
        //                        objectiveNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        objectiveNote.PatientId = NotesMaster.PatientId;
        //                        objectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        objectiveNote.CreatedOn = DateTime.Now;
        //                        objectiveNote.IsActive = true;
        //                        dbContext.ObjectiveNotes.Add(objectiveNote);
        //                        dbContext.SaveChanges();
        //                    }
        //                    if (emergencyNote != null)
        //                    {
        //                        emergencyNote.NotesId = Notesid;
        //                        emergencyNote.PatientVisitId = NotesMaster.PatientVisitId;
        //                        emergencyNote.PatientId = NotesMaster.PatientId;
        //                        emergencyNote.CreatedBy = currentUser.EmployeeId;
        //                        emergencyNote.CreatedOn = DateTime.Now;
        //                        emergencyNote.IsActive = true;
        //                        dbContext.EmergencyNote.Add(emergencyNote);
        //                        dbContext.SaveChanges();

        //                    }

        //                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
        //                    {

        //                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
        //                        var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "LAB"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();

        //                        var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                      join servDept in dbContext.ServiceDepartments
        //                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                      where servDept.IntegrationName == "Radiology"
        //                                                      select new
        //                                                      {
        //                                                          ItemId = billItemPrice.ItemId,
        //                                                          ItemName = billItemPrice.ItemName,
        //                                                          Price = billItemPrice.Price,
        //                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                          DepartmentName = servDept.ServiceDepartmentName
        //                                                      }).ToList();


        //                        BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                        {
        //                            Diagnosis.CreatedOn = DateTime.Now;
        //                            Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            Diagnosis.NotesId = NotesMaster.NotesId;
        //                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                            dbContext.SaveChanges();



        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                labReq.CreatedBy = currentUser.EmployeeId;
        //                                labReq.CreatedOn = DateTime.Now;
        //                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.LabRequisitions.Add(labReq);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from labPrice in priceForLabRequisition
        //                                                  where labPrice.ItemId == labReq.LabTestId
        //                                                  select labPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                RequisitionItem.PatientId = labReq.PatientId;
        //                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                imgnRequisition.CreatedOn = DateTime.Now;
        //                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from radPrice in priceForRadRequisition
        //                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                  select radPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                allBillRequisition.Add(RequisitionItem);
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                phrmRequisition.CreatedOn = DateTime.Now;
        //                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                dbContext.SaveChanges();
        //                            }

        //                        }
        //                        foreach (BillItemRequisition bill in allBillRequisition)
        //                        {
        //                            dbContext.BillItemRequisitions.Add(bill);
        //                        }
        //                        dbContext.SaveChanges();
        //                    }

        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";

        //                }
        //                catch (Exception ex)
        //                {
        //                    //Rollback all transaction if exception occured
        //                    dbContextTransaction.Rollback();
        //                    responseData.Status = "Failed";
        //                    throw ex;
        //                }

        //            }
        //        }

        //        //Post DischargeNote
        //        else if (reqType == "postdischargenote")
        //        {

        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (NotesMaster.PatientId != 0)
        //                    {
        //                        // posting data on Notes table
        //                        NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                        NotesMaster.CreatedOn = DateTime.Now;
        //                        dbContext.Notes.Add(NotesMaster);
        //                        dbContext.SaveChanges();
        //                        var Notesid = NotesMaster.NotesId;

        //                        // posting data on DischargeSummary table
        //                        NotesMaster.DischargeSummaryNote.NotesId = Notesid;
        //                        NotesMaster.DischargeSummaryNote.CreatedOn = DateTime.Now;
        //                        dbContext.DischargeSummaryNote.Add(NotesMaster.DischargeSummaryNote);
        //                        dbContext.SaveChanges();

        //                        // posting data on dischargeSummaryMedications table
        //                        var summaryId = dbContext.DischargeSummaryNote.Where(a => a.PatientVisitId == NotesMaster.DischargeSummaryNote.PatientVisitId).Select(a => a.DischargeSummaryId).FirstOrDefault();
        //                        NotesMaster.DischargeSummaryNote.DischargeSummaryMedications.ForEach(a =>
        //                        {
        //                            a.IsActive = true;
        //                            a.DischargeSummaryId = summaryId;
        //                            dbContext.DischargeSummaryMedications.Add(a);
        //                            dbContext.SaveChanges();
        //                        });

        //                    }

        //                    dbContextTransaction.Commit();
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }


        //        }

        //        //post Prescription-Slip 
        //        else if (reqType == "postprescriptionslipmaster")
        //        {
        //            string str = this.ReadPostData();
        //            PrescriptionSlipModel PrescriptionSlipMaster = JsonConvert.DeserializeObject<PrescriptionSlipModel>(str);
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (PrescriptionSlipMaster.PatientId != 0)
        //                    {
        //                        PrescriptionSlipMaster.CreatedBy = currentUser.EmployeeId;
        //                        PrescriptionSlipMaster.CreatedOn = DateTime.Now;
        //                        dbContext.ClinicalPrescriptionSlipMaster.Add(PrescriptionSlipMaster);
        //                        dbContext.SaveChanges();
        //                        var MasterId = PrescriptionSlipMaster.Id;

        //                        {
        //                            PrescriptionSlipMaster.History.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.History.CreatedOn = DateTime.Now;
        //                            PrescriptionSlipMaster.History.MasterId = MasterId;
        //                            dbContext.History.Add(PrescriptionSlipMaster.History);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.Acceptance.MasterId = MasterId;
        //                            PrescriptionSlipMaster.Acceptance.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.Acceptance.CreatedOn = DateTime.Now;
        //                            dbContext.Acceptance.Add(PrescriptionSlipMaster.Acceptance);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.Dilate.MasterId = MasterId;
        //                            PrescriptionSlipMaster.Dilate.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.Dilate.CreatedOn = DateTime.Now;
        //                            dbContext.Dilate.Add(PrescriptionSlipMaster.Dilate);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.IOP.MasterId = MasterId;
        //                            PrescriptionSlipMaster.IOP.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.IOP.CreatedOn = DateTime.Now;
        //                            dbContext.IOP.Add(PrescriptionSlipMaster.IOP);
        //                            dbContext.SaveChanges();
        //                        }

        //                        {
        //                            PrescriptionSlipMaster.Plup.MasterId = MasterId;
        //                            PrescriptionSlipMaster.Plup.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.Plup.CreatedOn = DateTime.Now;
        //                            dbContext.Plup.Add(PrescriptionSlipMaster.Plup);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.Retinoscopy.MasterId = MasterId;
        //                            PrescriptionSlipMaster.Retinoscopy.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.Retinoscopy.CreatedOn = DateTime.Now;
        //                            dbContext.Retinoscopy.Add(PrescriptionSlipMaster.Retinoscopy);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.Schrime.MasterId = MasterId;
        //                            PrescriptionSlipMaster.Schrime.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.Schrime.CreatedOn = DateTime.Now;
        //                            dbContext.Schrime.Add(PrescriptionSlipMaster.Schrime);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.TBUT.MasterId = MasterId;
        //                            PrescriptionSlipMaster.TBUT.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.TBUT.CreatedOn = DateTime.Now;
        //                            dbContext.TBUT.Add(PrescriptionSlipMaster.TBUT);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.VaUnaided.MasterId = MasterId;
        //                            PrescriptionSlipMaster.VaUnaided.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.VaUnaided.CreatedOn = DateTime.Now;
        //                            dbContext.Vaunaided.Add(PrescriptionSlipMaster.VaUnaided);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.FinalClass.MasterId = MasterId;
        //                            PrescriptionSlipMaster.FinalClass.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.FinalClass.CreatedOn = DateTime.Now;
        //                            dbContext.FinalClass.Add(PrescriptionSlipMaster.FinalClass);
        //                            dbContext.SaveChanges();
        //                        }
        //                        {
        //                            PrescriptionSlipMaster.AdviceDiagnosis.MasterId = MasterId;
        //                            PrescriptionSlipMaster.AdviceDiagnosis.CreatedBy = currentUser.EmployeeId;
        //                            PrescriptionSlipMaster.AdviceDiagnosis.CreatedOn = DateTime.Now;
        //                            dbContext.AdviceDiagnosis.Add(PrescriptionSlipMaster.AdviceDiagnosis);
        //                            dbContext.SaveChanges();
        //                        }

        //                    }
        //                    dbContextTransaction.Commit();
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //            responseData.Status = "OK";
        //        }

        //        else if(reqType == "post-clinicalprescription-note")
        //        {
        //            string str = this.ReadPostData();
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            PrescriptionNotesModel prescription = NotesMaster.ClinicalPrescriptionNote;
        //            SubjectiveNoteModel subjective = NotesMaster.SubjectiveNote;

        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    NotesMaster.CreatedBy = currentUser.EmployeeId;
        //                    NotesMaster.CreatedOn = System.DateTime.Now;
        //                    dbContext.Notes.Add(NotesMaster);
        //                    dbContext.SaveChanges();


        //                    prescription.NotesId = NotesMaster.NotesId;
        //                    prescription.CreatedBy = currentUser.EmployeeId;
        //                    prescription.CreatedOn = System.DateTime.Now;


        //                    subjective.NotesId = NotesMaster.NotesId;
        //                    subjective.PatientId = NotesMaster.PatientId;
        //                    subjective.PatientVisitId = NotesMaster.PatientVisitId;
        //                    subjective.CreatedBy = currentUser.EmployeeId;
        //                    subjective.CreatedOn = System.DateTime.Now;

        //                    dbContext.ClinicalPrescriptionNote.Add(prescription);
        //                    dbContext.SubjectiveNotes.Add(subjective);

        //                    dbContext.SaveChanges();
        //                    dbContextTransaction.Commit();

        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    responseData.Status = "Failed";
        //                    responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //        }
        //        //post scanned images
        //        else if (reqType == "upload")
        //        {
        //            /////Read Files From Clent Side 
        //            var files = this.ReadFiles();
        //            ///Read patient Files Model Other Data
        //            var reportDetails = Request.Form["imgDetails"];
        //            PatientImagesModel patFileData = DanpheJSONConvert.DeserializeObject<PatientImagesModel>(reportDetails);
        //            ////We Do Process in Transaction because Now Situation that 
        //            /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
        //            using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    var location = (from dbc in dbContext.CFGParameters
        //                                    where dbc.ParameterGroupName.ToLower() == "clinical"
        //                                    && dbc.ParameterName == "ClinicalDocumentUploadLocation"
        //                                    select dbc.ParameterValue ).FirstOrDefault();

        //                    if (!Directory.Exists(location))
        //                    {
        //                        Directory.CreateDirectory(location);
        //                    }

        //                    foreach (var file in files)
        //                    {
        //                        if (file.Length > 0)                                {
        //                            /////Converting Files to Byte there for we require MemoryStream object
        //                            using (var ms = new MemoryStream())
        //                            {
        //                                ////this is the Extention of Current File(.PNG, .JPEG, .JPG)
        //                                string currentFileExtention = Path.GetExtension(file.FileName);
        //                                ////Copy Each file to MemoryStream
        //                                file.CopyTo(ms);
        //                                ////Convert File to Byte[]
        //                                byte[] imageBytes = ms.ToArray();
        //                                string currentfileName = patFileData.PatientId.ToString() + "_" + patFileData.FileName + System.DateTime.Now.Ticks + currentFileExtention;
        //                                string fullPath = location + currentfileName;

        //                                var tempModel = new PatientImagesModel();
        //                                //tempModel.FileBinaryData = imageBytes;
        //                                tempModel.PatientId = patFileData.PatientId;
        //                                tempModel.PatientVisitId = patFileData.PatientVisitId;
        //                                tempModel.DepartmentId = patFileData.DepartmentId;
        //                                tempModel.ROWGUID = Guid.NewGuid();
        //                                tempModel.FileType = patFileData.FileType;
        //                                tempModel.UploadedBy = currentUser.EmployeeId;
        //                                tempModel.UploadedOn = DateTime.Now;
        //                                tempModel.Comment = patFileData.Comment;
        //                                tempModel.FileName = currentfileName;
        //                                tempModel.Title = patFileData.Title;
        //                                tempModel.FileExtention = currentFileExtention;
        //                                tempModel.IsActive = true;
        //                                dbContext.PatientImages.Add(tempModel);
        //                                dbContext.SaveChanges();

        //                                System.IO.File.WriteAllBytes(@fullPath, imageBytes);

        //                                ms.Dispose();

        //                            }
        //                        }
        //                    }
        //                    ///After All Files Added Commit the Transaction
        //                    dbContextTransaction.Commit();

        //                    responseData.Results = null;
        //                    responseData.Status = "OK";
        //                }
        //                catch (Exception ex)
        //                {
        //                    dbContextTransaction.Rollback();
        //                    responseData.Results = null;
        //                    responseData.Status = "Failed";
        //                    throw ex;
        //                }
        //            }
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //            responseData.ErrorMessage = "Cannot match any reqType";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);

        //}

        [HttpPut]
        [Route("ResolveActiveMedicalProblem")]
        public IActionResult ResolveActiveMedicalProblem(int patientProblemId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            // if (reqType == "activemedical")
            Func<object> func = () => ResolveActiveMedicalProblem(patientProblemId, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ActiveMedicalProblem")]
        public IActionResult PutActiveMedicalProblem()
        {
            //else if (reqType == "activemedical")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);

            Func<object> func = () => UpdateActiveMedicalProblem(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        private object UpdateActiveMedicalProblem(string ipDataStr, RbacUser currentUser)
        {
            ActiveMedicalProblem clientActiveMedicals = JsonConvert.DeserializeObject<ActiveMedicalProblem>(ipDataStr);
            clientActiveMedicals.ModifiedBy = currentUser.EmployeeId;
            clientActiveMedicals.ModifiedOn = DateTime.Now;
            //use GraphDiff's updategraph method to update in Hierarchy.. Change to Normal Entity Update if not needed.
            clientActiveMedicals = _clinicalDbContext.UpdateGraph(clientActiveMedicals);
            _clinicalDbContext.Entry(clientActiveMedicals).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientActiveMedicals).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();

            return clientActiveMedicals;
        }


        [HttpPut]
        [Route("DeactivatePatientImage")]
        public IActionResult DeactivatePatientImage(int patImageId)
        {
            // if (reqType == "deactivateUploadedImage")
            Func<object> func = () => DisablePatientImage(patImageId);

            return InvokeHttpPutFunction(func);
        }

        private object DisablePatientImage(int patImageId)
        {
            PatientImagesModel image = _clinicalDbContext.PatientImages.Where(a => a.PatImageId == patImageId).Select(a => a).FirstOrDefault();
            image.IsActive = false;
            _clinicalDbContext.Entry(image).State = EntityState.Modified;
            _clinicalDbContext.SaveChanges();
            return "Patient image disabled successfully.";
        }

        private object ResolveActiveMedicalProblem(int patientProblemId, RbacUser currentUser)
        {
            PastMedicalProblem pastProblem = new PastMedicalProblem();
            ActiveMedicalProblem currProblem = _clinicalDbContext.ActiveMedical
           .Where(p => p.PatientProblemId == patientProblemId)
           .FirstOrDefault();
            //set the IsResolved status as true and post to past medical table
            if (currProblem != null)
            {
                currProblem.IsResolved = true;
                currProblem.ResolvedDate = DateTime.Now;
                currProblem.ModifiedBy = currentUser.EmployeeId;
                currProblem.ModifiedOn = DateTime.Now;
                _clinicalDbContext.Entry(currProblem).State = EntityState.Modified;
                //dbContext.ActiveMedical.Remove(currProblem);

                //set the current problem as past problem
                pastProblem.ICD10Code = currProblem.ICD10Code;
                pastProblem.ICD10Description = currProblem.ICD10Description;
                pastProblem.OnSetDate = currProblem.OnSetDate;
                pastProblem.PatientId = currProblem.PatientId;
                pastProblem.ResolvedDate = currProblem.ResolvedDate;
                pastProblem.CreatedOn = DateTime.Now;
                pastProblem.CreatedBy = currentUser.CreatedBy;
                pastProblem.Note = currProblem.Note;
                pastProblem.CurrentStatus = currProblem.CurrentStatus;
                _clinicalDbContext.PastMedicals.Add(pastProblem);
            }
            _clinicalDbContext.SaveChanges();

            return "Active Medical delete successfully";
        }

        //    [HttpDelete]
        //public string Delete(string reqType, int patientProblemId, int patImageId)
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    ClinicalDbContext dbContext = new ClinicalDbContext(connString);
        //    try
        //    {
        //        if (reqType == "activemedical" && patientProblemId != 0)
        //        {
        //            PastMedicalProblem pastProblem = new PastMedicalProblem();
        //            ActiveMedicalProblem currProblem = dbContext.ActiveMedical
        //           .Where(p => p.PatientProblemId == patientProblemId)
        //           .FirstOrDefault();
        //            //set the IsResolved status as true and post to past medical table
        //            if (currProblem != null)
        //            {
        //                currProblem.IsResolved = true;
        //                currProblem.ResolvedDate = DateTime.Now;
        //                currProblem.ModifiedBy = currentUser.EmployeeId;
        //                currProblem.ModifiedOn = DateTime.Now;
        //                dbContext.Entry(currProblem).State = EntityState.Modified;
        //                //dbContext.ActiveMedical.Remove(currProblem);

        //                //set the current problem as past problem
        //                pastProblem.ICD10Code = currProblem.ICD10Code;
        //                pastProblem.ICD10Description = currProblem.ICD10Description;
        //                pastProblem.OnSetDate = currProblem.OnSetDate;
        //                pastProblem.PatientId = currProblem.PatientId;
        //                pastProblem.ResolvedDate = currProblem.ResolvedDate;
        //                pastProblem.CreatedOn = DateTime.Now;
        //                pastProblem.CreatedBy = currentUser.CreatedBy;
        //                pastProblem.Note = currProblem.Note;
        //                pastProblem.CurrentStatus = currProblem.CurrentStatus;
        //                dbContext.PastMedicals.Add(pastProblem);
        //            }
        //            dbContext.SaveChanges();

        //            responseData.Results = "Active Medical delete successfully";
        //            responseData.Status = "OK";
        //        }
        //        else if (reqType == "deactivateUploadedImage")
        //        {
        //            PatientImagesModel image = dbContext.PatientImages.Where(a => a.PatImageId == patImageId).Select(a => a).FirstOrDefault();
        //            image.IsActive = false;
        //            dbContext.Entry(image).State = EntityState.Modified;
        //            dbContext.SaveChanges();
        //            responseData.Status = "OK";
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //            responseData.ErrorMessage = "Cannot match any reqType";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        [HttpPut]
        [Route("Vitals")]
        public IActionResult UpdateVitals()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "vitals")
            Func<object> func = () => PutVitals(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("Allergy")]
        public IActionResult UpdateAllergy()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "allergy")
            Func<object> func = () => PutAllergy(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("FamilyHistory")]
        public IActionResult UpdateFamilyHistory()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "familyhistory")
            Func<object> func = () => PutFamilyHistory(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("HomeMedication")]
        public IActionResult UpdateHomeMedication()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "homemedication")
            Func<object> func = () => PutHomeMedication(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("InputOutput")]
        public IActionResult UpdateInputOutput()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "inputoutput")
            Func<object> func = () => PutInputOutput(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("MedicationPrescription")]
        public IActionResult UpdateMedicationPrescription()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "medicationprescription")
            Func<object> func = () => PutMedicationPrescription(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("PastMedical")]
        public IActionResult PastMedical()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "pastmedical")
            Func<object> func = () => PutPastMedical(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("SocialHistory")]
        public IActionResult UpdateSocialHistory()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "socialhistory")
            Func<object> func = () => PutSocialHistory(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ReferralSource")]
        public IActionResult UpdateReferralSource()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "referralsource")
            Func<object> func = () => PutReferralSource(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("SurgicalHistory")]
        public IActionResult UpdateSurgicalHistory()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "surgicalhistory")
            Func<object> func = () => PutSurgicalHistory(str, currentUser);
            return InvokeHttpPutFunction(func);
        }


        [HttpPut]
        [Route("OPDGeneralNote")]
        public IActionResult UpdateOPDGeneralNote()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "opd-general-note")
            Func<object> func = () => PutOPDGeneralNote(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ProgressNoteTemplateDetail")]
        public IActionResult ProgressNoteTemplateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "putProgressNoteTemplateList")
            Func<object> func = () => PutProgressNoteTemplateDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ProcedureNoteTemplate")]
        public IActionResult ProcedureNoteTemplateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "putProcedureNoteTemplateList")
            Func<object> func = () => PutProcedureNoteTemplateDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("FreeTextNoteTemplateDetail")]
        public IActionResult PutFreetextNoteTemplateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "putFreeTextTemplateList")
            Func<object> func = () => PutFreeTextNoteTemplateDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("DischargeNoteTemplate")]
        public IActionResult DischargeNoteTemplateDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "putDischargeNoteTemplateList")
            Func<object> func = () => PutDischargeNoteTemplateDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("EmergencyNoteDetail")]
        public IActionResult EmergencyNoteDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            // if (reqType == "putEmergencyNoteTemplate")
            Func<object> func = () => PutEmergencyNoteDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("PrescriptionNote")]
        public IActionResult UpdatePrescriptionNote()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            //  else if (reqType == "putPrescriptionNote")            
            Func<object> func = () => PutPrescriptionNote(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("HistoryAndPhysicalNoteDetail")]
        public IActionResult UpdateHistoryAndPhysicalNote()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            //  else if (reqType == "putPrescriptionNote")            
            Func<object> func = () => PutHistoryAndPhysicalNote(str, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("EyeMasterDetail")]
        public IActionResult UpdateEyeMasterDetail()
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string str = this.ReadPostData();
            //  else if (reqType == "putPrescriptionNote")            
            Func<object> func = () => PutEyeMasterDetail(str, currentUser);
            return InvokeHttpPutFunction(func);
        }
        [HttpGet]
        [Route("bloodsugar")]
        public IActionResult getpatientBloodSugarInfo(int patientVisitId)
        {
            Func<object> func = () => getPatientSugarInfo(patientVisitId);
            return InvokeHttpGetFunction(func);
        }
        private object getPatientSugarInfo(int patientVisitId)
        {
            if (patientVisitId != 0)
            {
                var patientBloodSugarInfo = (from bs in _clinicalDbContext.BloodSugar
                                             join emp in _clinicalDbContext.Employee on bs.CreatedBy equals emp.EmployeeId
                                             where bs.PatientVisitId == patientVisitId
                                             select new
                                             {
                                                 BloodSugarMonitoringId = bs.BloodSugarMonitoringId,
                                                 PatientId = bs.PatientId,
                                                 PatientVisitId = bs.PatientVisitId,
                                                 EntryDateTime = bs.EntryDateTime,
                                                 RbsValue = bs.RbsValue,
                                                 Insulin = bs.Insulin,
                                                 EnteredBy = emp.FullName,
                                                 Remarks = bs.Remarks,
                                                 CreatedOn = bs.CreatedOn,
                                                 CreatedBy = bs.CreatedBy,
                                                 ModifiedOn = bs.ModifiedOn,
                                                 ModifiedBy = bs.ModifiedBy,
                                                 IsActive = bs.IsActive
                                             }).ToList();

                return patientBloodSugarInfo;
            }
            else
            {
                return new Exception("PatientVisitId is neccessary");
            }
        }
        [HttpGet]
        [Route("patient-admission-info")]
        public IActionResult AdmitttedPatientInfo(int patientVisitId)
        {
            Func<object> func = () => getAdmittedPatientInfo(patientVisitId);
            return InvokeHttpGetFunction(func);
        }
        private object getAdmittedPatientInfo(int patientVisitId)
        {
            if (patientVisitId != 0)
            {
                var patientAdmissionInfo = (from adm in _clinicalDbContext.Admission
                                            join pat in _clinicalDbContext.Patients on adm.PatientId equals pat.PatientId
                                            join bedinfo in _clinicalDbContext.PatientBedInfos on adm.PatientVisitId equals bedinfo.PatientVisitId
                                            join bed in _clinicalDbContext.Beds on bedinfo.BedId equals bed.BedId
                                            where adm.PatientVisitId == patientVisitId
                                            select new
                                            {
                                                HospitalNo = pat.PatientCode,
                                                PatientName = pat.ShortName,
                                                DateOfBirth = pat.DateOfBirth,
                                                Gender = pat.Gender,
                                                Rank = pat.Rank,
                                                BedNo = bed.BedNumber,
                                                DOA = adm.AdmissionDate
                                            }).FirstOrDefault();

                if (patientAdmissionInfo != null)
                {
                    int age = CalculateAge(patientAdmissionInfo.DateOfBirth.Value);
                    string ageSex = age + "/" + patientAdmissionInfo.Gender.Substring(0, 1);

                    return new
                    {
                        HospitalNo = patientAdmissionInfo.HospitalNo,
                        PatientName = patientAdmissionInfo.PatientName,
                        AgeSex = ageSex,
                        Rank = patientAdmissionInfo.Rank,
                        BedNo = patientAdmissionInfo.BedNo,
                        DOA = patientAdmissionInfo.DOA
                    };
                }
                else
                {
                    return new Exception("Patient Admission is neccessary");
                }
            }
            else
            {
                return new Exception("PatientVisitId is neccessary");
            }
        }
        private static int CalculateAge(DateTime dateOfBirth)
        {
            DateTime today = DateTime.Today;
            int age = today.Year - dateOfBirth.Year;
            if (dateOfBirth > today.AddYears(-age))
                age--;
            return age;
        }
        [HttpPost]
        [Route("bloodsugar")]
        public IActionResult postBloodSugar([FromBody] BloodSugarModel bloodSugar)
        {
            _clinicalDbContext.BloodSugar.Add(bloodSugar);
            _clinicalDbContext.SaveChanges();
            Func<object> func = () => bloodSugar.BloodSugarMonitoringId;
            return InvokeHttpPostFunction(func);
        }



        [HttpGet]
        [Route("ConsultationRequestsByPatientVisitId")]
        public IActionResult ConsultationRequestsByPatientVisitId(int PatientVisitId)
        {
            var ConsultationRequests = (
                from cr in _clinicalDbContext.ConsultationRequest
                join pat in _clinicalDbContext.Patients on cr.PatientId equals pat.PatientId
                join visits in _clinicalDbContext.Visit on cr.PatientVisitId equals visits.PatientVisitId
                /*join bed in clinicalDbContext.Beds on cr.BedId equals bed.BedId*/
                join ward in _clinicalDbContext.Wards on cr.WardId equals ward.WardId
                join reqEmp in _clinicalDbContext.Employee on cr.RequestingConsultantId equals reqEmp.EmployeeId
                join reqDept in _clinicalDbContext.Departments on cr.RequestingDepartmentId equals reqDept.DepartmentId
                join conEmp in _clinicalDbContext.Employee on cr.ConsultingDoctorId equals conEmp.EmployeeId into conEmpGroup
                from conEmp in conEmpGroup.DefaultIfEmpty()
                join conDept in _clinicalDbContext.Departments on cr.ConsultingDepartmentId equals conDept.DepartmentId into conDeptGroup
                from conDept in conDeptGroup.DefaultIfEmpty()
                where cr.PatientVisitId == PatientVisitId && cr.IsActive == true
                select new ConsultationRequestForGetDTO
                {
                    ConsultationRequestId = cr.ConsultationRequestId,
                    PatientId = cr.PatientId,
                    PatientVisitId = cr.PatientVisitId,
                    WardId = cr.WardId.Value,
                    WardName = ward.WardName,
                    BedId = cr.BedId.Value,
                    RequestedOn = cr.RequestedOn,
                    RequestingConsultantId = cr.RequestingConsultantId,
                    RequestingConsultantName = reqEmp.FullName,
                    RequestingDepartmentId = cr.RequestingDepartmentId,
                    RequestingDepartmentName = reqDept.DepartmentName,
                    PurposeOfConsultation = cr.PurposeOfConsultation,
                    ConsultingDoctorId = cr.ConsultingDoctorId,
                    ConsultingDoctorName = conEmp.FullName,
                    ConsultingDepartmentId = cr.ConsultingDepartmentId,
                    ConsultingDepartmentName = conDept.DepartmentName,
                    ConsultantResponse = cr.ConsultantResponse,
                    ConsultedOn = cr.ConsultedOn,
                    Status = cr.Status,
                    IsActive = cr.IsActive
                }).OrderByDescending(a => a.ConsultationRequestId).ToList();
            Func<object> func = () => ConsultationRequests;
            return InvokeHttpPutFunction(func);
        }

        [HttpGet]
        [Route("GetAllApptDepartment")]
        public IActionResult GetAllApptDepartment()
        {
            Func<object> func = () => _clinicalDbContext.Departments.Where(x => x.IsAppointmentApplicable == true && x.IsActive == true).ToList();
            return InvokeHttpPutFunction(func);
        }

        [HttpGet]
        [Route("GetAllAppointmentApplicableDoctor")]
        public IActionResult GetAllAppointmentApplicableDoctor()
        {
            Func<object> func = () => _clinicalDbContext.Employee.Where(x => x.IsAppointmentApplicable == true && x.IsActive == true).ToList();
            return InvokeHttpPutFunction(func);
        }

        [HttpPost]
        [Route("AddNewConsultationRequest")]
        public IActionResult AddNewConsultationRequest([FromBody] ConsultationRequestDTO newConsultationRequest)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

            using (var consultationRequestTransactionScope = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    ConsultationRequestModel ConsultationRequest = new ConsultationRequestModel();
                    ConsultationRequest.PatientId = newConsultationRequest.PatientId;
                    ConsultationRequest.PatientVisitId = newConsultationRequest.PatientVisitId;
                    ConsultationRequest.WardId = newConsultationRequest.WardId;
                    ConsultationRequest.BedId = newConsultationRequest.BedId;
                    ConsultationRequest.RequestedOn = DateTime.Now;
                    ConsultationRequest.RequestingConsultantId = newConsultationRequest.RequestingConsultantId;
                    ConsultationRequest.RequestingDepartmentId = newConsultationRequest.RequestingDepartmentId;
                    ConsultationRequest.ConsultingDoctorId = newConsultationRequest.ConsultingDoctorId;
                    ConsultationRequest.ConsultingDepartmentId = newConsultationRequest.ConsultingDepartmentId;
                    ConsultationRequest.PurposeOfConsultation = newConsultationRequest.PurposeOfConsultation;
                    ConsultationRequest.Status = newConsultationRequest.Status;
                    ConsultationRequest.IsActive = newConsultationRequest.IsActive;
                    ConsultationRequest.CreatedOn = DateTime.Now;
                    ConsultationRequest.CreatedBy = currentUser.EmployeeId;
                    _clinicalDbContext.ConsultationRequest.Add(ConsultationRequest);
                    _clinicalDbContext.SaveChanges();
                    consultationRequestTransactionScope.Commit();
                    Func<object> func = () => ConsultationRequest.ConsultationRequestId;
                    return InvokeHttpPutFunction(func);
                }
                catch (Exception ex)
                {
                    consultationRequestTransactionScope.Rollback();
                    throw new Exception(ex.Message + " exception details:" + ex.ToString());
                }
            }
        }

        [HttpPut]
        [Route("ResponseConsultationRequest")]
        public IActionResult ResponseConsultationRequest([FromBody] ConsultationRequestDTO responseConsultationRequest)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            ConsultationRequestModel ConsultationRequest = _clinicalDbContext.ConsultationRequest
                                                                                    .Where(x => x.ConsultationRequestId == responseConsultationRequest.ConsultationRequestId)
                                                                                    .FirstOrDefault();

            using (var consultationRequestTransactionScope = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    ConsultationRequest.ConsultingDoctorId = responseConsultationRequest.ConsultingDoctorId;
                    ConsultationRequest.ConsultingDepartmentId = responseConsultationRequest.ConsultingDepartmentId;
                    ConsultationRequest.ConsultantResponse = responseConsultationRequest.ConsultantResponse;
                    ConsultationRequest.ConsultedOn = DateTime.Now;
                    ConsultationRequest.Status = responseConsultationRequest.Status;
                    ConsultationRequest.ModifiedOn = DateTime.Now;
                    ConsultationRequest.ModifiedBy = currentUser.EmployeeId;
                    _clinicalDbContext.Entry(ConsultationRequest).State = EntityState.Modified;
                    _clinicalDbContext.SaveChanges();
                    consultationRequestTransactionScope.Commit();
                    Func<object> func = () => ConsultationRequest.ConsultationRequestId;
                    return InvokeHttpPutFunction(func);
                }
                catch (Exception ex)
                {
                    consultationRequestTransactionScope.Rollback();
                    throw new Exception(ex.Message);
                }
            }

        }
        //[HttpPut]
        //[Route("EyeMasterDetail")]
        //public IActionResult UpdateEyeMasterDetail()
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
        //    string str = this.ReadPostData();
        //    //  else if (reqType == "putPrescriptionNote")            
        //    Func<object> func = () => PutEyeMasterDetail(str, currentUser);
        //    {

        //    };
        //    return InvokeHttpPutFunction(func);
        //}
        //private object Put(string str, RbacUser currentUser)
        //private object Put(string str, RbacUser currentUser)
        private object PutEyeMasterDetail(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    EyeModel EyeMaster = JsonConvert.DeserializeObject<EyeModel>(str);


                    foreach (RefractionModel refraction in EyeMaster.RefractionOD)
                    {
                        var tempRefraction = _clinicalDbContext.UpdateGraph(refraction);
                        _clinicalDbContext.Entry(tempRefraction).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempRefraction).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (RefractionModel refraction in EyeMaster.RefractionOS)
                    {
                        var tempRefraction = _clinicalDbContext.UpdateGraph(refraction);
                        _clinicalDbContext.Entry(tempRefraction).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempRefraction).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    OperationNotesModel OperationNotesOD = EyeMaster.OperationNotesOD;
                    OperationNotesOD = _clinicalDbContext.UpdateGraph(OperationNotesOD);
                    _clinicalDbContext.Entry(OperationNotesOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(OperationNotesOD).Property(u => u.CreatedOn).IsModified = false;
                    OperationNotesModel OperationNotesOS = EyeMaster.OperationNotesOS;
                    OperationNotesOS = _clinicalDbContext.UpdateGraph(OperationNotesOS);
                    _clinicalDbContext.Entry(OperationNotesOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(OperationNotesOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    AblationProfileModel AblationOD = EyeMaster.AblationOD;
                    AblationOD = _clinicalDbContext.UpdateGraph(AblationOD);
                    _clinicalDbContext.Entry(AblationOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(AblationOD).Property(u => u.CreatedOn).IsModified = false;
                    AblationProfileModel AblationOS = EyeMaster.AblationOS;
                    AblationOS = _clinicalDbContext.UpdateGraph(AblationOS);
                    _clinicalDbContext.Entry(AblationOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(AblationOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
                    {
                        var tempLaserData = _clinicalDbContext.UpdateGraph(laserdata);
                        _clinicalDbContext.Entry(tempLaserData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempLaserData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
                    {
                        var tempLaserData = _clinicalDbContext.UpdateGraph(laserdata);
                        _clinicalDbContext.Entry(tempLaserData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempLaserData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    foreach (PreOPPachymetryModel preopdata in EyeMaster.PrePachymetryOD)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(preopdata);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (PreOPPachymetryModel preopdata in EyeMaster.PrePachymetryOS)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(preopdata);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    LASIKRSTModel LasikRSTOD = EyeMaster.LasikRSTOD;
                    LasikRSTOD = _clinicalDbContext.UpdateGraph(LasikRSTOD);
                    _clinicalDbContext.Entry(LasikRSTOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(LasikRSTOD).Property(u => u.CreatedOn).IsModified = false;
                    LASIKRSTModel LasikRSTOS = EyeMaster.LasikRSTOS;
                    LasikRSTOS = _clinicalDbContext.UpdateGraph(LasikRSTOS);
                    _clinicalDbContext.Entry(LasikRSTOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(LasikRSTOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    SMILESSettingsModel SmileSettingOD = EyeMaster.SmileSettingOD;
                    SmileSettingOD = _clinicalDbContext.UpdateGraph(SmileSettingOD);
                    _clinicalDbContext.Entry(SmileSettingOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(SmileSettingOD).Property(u => u.CreatedOn).IsModified = false;
                    SMILESSettingsModel SmileSettingOS = EyeMaster.SmileSettingOS;
                    SmileSettingOS = _clinicalDbContext.UpdateGraph(SmileSettingOS);
                    _clinicalDbContext.Entry(SmileSettingOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(SmileSettingOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    foreach (PachymetryModel loopData in EyeMaster.PachymetryOD)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (PachymetryModel loopData in EyeMaster.PachymetryOS)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    EyeVisuMaxsModel VisumaxOD = EyeMaster.VisumaxOD;
                    VisumaxOD = _clinicalDbContext.UpdateGraph(VisumaxOD);
                    _clinicalDbContext.Entry(VisumaxOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(VisumaxOD).Property(u => u.CreatedOn).IsModified = false;
                    EyeVisuMaxsModel VisumaxOS = EyeMaster.VisumaxOS;
                    VisumaxOS = _clinicalDbContext.UpdateGraph(VisumaxOS);
                    _clinicalDbContext.Entry(VisumaxOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(VisumaxOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    foreach (WavefrontModel loopData in EyeMaster.WavefrontOD)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (WavefrontModel loopData in EyeMaster.WavefrontOS)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    foreach (ORAModel loopData in EyeMaster.ORAOD)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    foreach (ORAModel loopData in EyeMaster.ORAOS)
                    {
                        var tempData = _clinicalDbContext.UpdateGraph(loopData);
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    SmileIncisionsModel SmileIncisionOD = EyeMaster.SmileIncisionOD;
                    SmileIncisionOD = _clinicalDbContext.UpdateGraph(SmileIncisionOD);
                    _clinicalDbContext.Entry(SmileIncisionOD).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(SmileIncisionOD).Property(u => u.CreatedOn).IsModified = false;
                    SmileIncisionsModel SmileIncisionOS = EyeMaster.SmileIncisionOS;
                    SmileIncisionOS = _clinicalDbContext.UpdateGraph(SmileIncisionOS);
                    _clinicalDbContext.Entry(SmileIncisionOS).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(SmileIncisionOS).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    EyeMaster.ModifiedBy = currentUser.EmployeeId;
                    EyeMaster.ModifiedOn = DateTime.Now;
                    EyeMaster = _clinicalDbContext.UpdateGraph(EyeMaster);
                    _clinicalDbContext.Entry(EyeMaster).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(EyeMaster).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return EyeMaster;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutHistoryAndPhysicalNote(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);

                    _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.SaveChanges();

                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;
                    List<ClinicalDiagnosisModel> removedClinialDiagnosis = NotesMaster.RemovedIcdAndOrders;


                    if (subjectiveNote != null)
                    {
                        subjectiveNote.ModifiedBy = currentUser.EmployeeId;
                        subjectiveNote.ModifiedOn = DateTime.Now;

                        var temp = _clinicalDbContext.UpdateGraph(subjectiveNote);

                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();

                    }
                    if (objectiveNote != null)
                    {
                        objectiveNote.ModifiedBy = currentUser.EmployeeId;
                        objectiveNote.ModifiedOn = DateTime.Now;

                        var temp = _clinicalDbContext.UpdateGraph(objectiveNote);

                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }

                    // assessment orders edit logic
                    if ((clinialDiagnosis != null && clinialDiagnosis.Count > 0) || (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0))
                    {

                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();

                        var priceForLabRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "LAB" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hard Coded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        var priceForRadRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "Radiology" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hard Coded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                        if (clinialDiagnosis != null && clinialDiagnosis.Count > 0)
                        {
                            // for updating existing diagnosis and add new one (handels newly added diagnosis and orders)
                            foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                            {
                                var cd = _clinicalDbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                // create case - that means, previously (while post) diagnosis was empty
                                if (cd == null)
                                {
                                    Diagnosis.CreatedOn = DateTime.Now;
                                    Diagnosis.CreatedBy = currentUser.EmployeeId;
                                    Diagnosis.NotesId = NotesMaster.NotesId;
                                    _clinicalDbContext.ClinicalDiagnosis.Add(Diagnosis);
                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        labReq.CreatedBy = currentUser.EmployeeId;
                                        labReq.CreatedOn = DateTime.Now;
                                        labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.LabRequisitions.Add(labReq);
                                        _clinicalDbContext.SaveChanges();

                                        var itemDetail = (from labPrice in priceForLabRequisition
                                                          where labPrice.ItemId == labReq.LabTestId
                                                          select labPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = labReq.RequisitionId;
                                        RequisitionItem.BillStatus = labReq.BillingStatus;
                                        RequisitionItem.PatientId = labReq.PatientId;
                                        RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                        RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = (double)itemDetail.Price;
                                        RequisitionItem.Quantity = 1;
                                        RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                        RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                        RequisitionItem.CreatedOn = DateTime.Now;

                                        //allBillRequisition.Add(RequisitionItem);
                                        _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                        _clinicalDbContext.SaveChanges();
                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                        imgnRequisition.CreatedOn = DateTime.Now;
                                        imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                        _clinicalDbContext.SaveChanges();


                                        var itemDetail = (from radPrice in priceForRadRequisition
                                                          where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                          select radPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                        RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                        RequisitionItem.PatientId = imgnRequisition.PatientId;
                                        RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                        RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = (double)itemDetail.Price;
                                        RequisitionItem.Quantity = 1;
                                        RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                        RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                        RequisitionItem.CreatedOn = DateTime.Now;

                                        //allBillRequisition.Add(RequisitionItem);
                                        _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                        _clinicalDbContext.SaveChanges();
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                        phrmRequisition.CreatedOn = DateTime.Now;
                                        phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                        _clinicalDbContext.SaveChanges();

                                    }
                                    //foreach (BillItemRequisition bill in allBillRequisition)
                                    //{
                                    //    dbContext.BillItemRequisitions.Add(bill);
                                    //}
                                    //dbContext.SaveChanges();

                                }
                                //  edit case - that means diagnosis with that Id exists (add or remove of orders in diagnosis)
                                else
                                {
                                    Diagnosis.ModifiedBy = currentUser.EmployeeId;
                                    Diagnosis.ModifiedOn = DateTime.Now;

                                    var temp = _clinicalDbContext.UpdateGraph(Diagnosis);

                                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        var lo = _clinicalDbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // add case - new lab order added
                                        if (lo == null)
                                        {
                                            labReq.CreatedBy = currentUser.EmployeeId;
                                            labReq.CreatedOn = DateTime.Now;
                                            labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.LabRequisitions.Add(labReq);
                                            _clinicalDbContext.SaveChanges();

                                            labReq.ModifiedBy = currentUser.EmployeeId;
                                            labReq.ModifiedOn = DateTime.Now;

                                            var itemDetail = (from labPrice in priceForLabRequisition
                                                              where labPrice.ItemId == labReq.LabTestId
                                                              select labPrice).FirstOrDefault();


                                            RequisitionItem = new BillItemRequisition();
                                            RequisitionItem.RequisitionId = labReq.RequisitionId;
                                            RequisitionItem.BillStatus = labReq.BillingStatus;
                                            RequisitionItem.PatientId = labReq.PatientId;
                                            RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                            RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                            RequisitionItem.ItemId = itemDetail.ItemId;
                                            RequisitionItem.ItemName = itemDetail.ItemName;
                                            RequisitionItem.Price = (double)itemDetail.Price;
                                            RequisitionItem.Quantity = 1;
                                            RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                            RequisitionItem.CreatedOn = DateTime.Now;

                                            //allBillRequisition.Add(RequisitionItem);
                                            _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                            _clinicalDbContext.SaveChanges();
                                        }// else- remove or not changed orders                                                    

                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        var io = _clinicalDbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // adding new imaging order
                                        if (io == null)
                                        {
                                            imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                            imgnRequisition.CreatedOn = DateTime.Now;
                                            imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                            _clinicalDbContext.SaveChanges();


                                            var itemDetail = (from radPrice in priceForRadRequisition
                                                              where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                              select radPrice).FirstOrDefault();

                                            RequisitionItem = new BillItemRequisition();
                                            RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                            RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                            RequisitionItem.PatientId = imgnRequisition.PatientId;
                                            RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                            RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                            RequisitionItem.ItemId = itemDetail.ItemId;
                                            RequisitionItem.ItemName = itemDetail.ItemName;
                                            RequisitionItem.Price = (double)itemDetail.Price;
                                            RequisitionItem.Quantity = 1;
                                            RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                            RequisitionItem.CreatedOn = DateTime.Now;

                                            //allBillRequisition.Add(RequisitionItem);
                                            _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                            _clinicalDbContext.SaveChanges();

                                        } // else - either order removed or not changed
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        var mo = _clinicalDbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // adding new medication order
                                        if (mo == null)
                                        {
                                            phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                            phrmRequisition.CreatedOn = DateTime.Now;
                                            phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                            _clinicalDbContext.SaveChanges();
                                        }
                                    }
                                }
                            }
                        }

                        if (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0)
                        {
                            // for removed diagnosis
                            foreach (ClinicalDiagnosisModel Diagnosis in removedClinialDiagnosis)
                            {
                                var cd = _clinicalDbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                if (cd != null)
                                {
                                    cd.ModifiedBy = currentUser.EmployeeId;
                                    cd.ModifiedOn = DateTime.Now;
                                    if (Diagnosis.IsActive == false)
                                    {
                                        cd.IsActive = false;
                                    }

                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        var lo = _clinicalDbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (lo != null)
                                        {
                                            if (lo.OrderStatus != "pending")
                                            {
                                                lo.ModifiedBy = currentUser.EmployeeId;
                                                lo.ModifiedOn = DateTime.Now;
                                                lo.OrderStatus = "cancel";
                                                lo.BillingStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();

                                                var billReq = _clinicalDbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == lo.RequisitionId);
                                                if (billReq != null)
                                                {
                                                    billReq.BillStatus = "cancel";
                                                    _clinicalDbContext.SaveChanges();
                                                }
                                            }
                                        }
                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        var io = _clinicalDbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (io != null)
                                        {
                                            if (io.OrderStatus != "pending")
                                            {
                                                io.ModifiedBy = currentUser.EmployeeId;
                                                io.ModifiedOn = DateTime.Now;
                                                io.OrderStatus = "cancel";
                                                io.BillingStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();

                                                var billReq = _clinicalDbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == io.ImagingRequisitionId);
                                                if (billReq != null)
                                                {
                                                    billReq.BillStatus = "cancel";

                                                    _clinicalDbContext.SaveChanges();
                                                }
                                            }
                                        }
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        var mo = _clinicalDbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (mo != null)
                                        {
                                            if (mo.OrderStatus != "pending")
                                            {
                                                mo.ModifiedBy = currentUser.EmployeeId;
                                                mo.ModifiedOn = DateTime.Now;
                                                mo.OrderStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }


                    dbContextTransaction.Commit();
                    return "OK";


                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutPrescriptionNote(string str, RbacUser currentUser)
        {

            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
                    PrescriptionNotesModel ClinicalPrescriptionNote = NotesMaster.ClinicalPrescriptionNote;
                    SubjectiveNoteModel SubjectiveNote = NotesMaster.SubjectiveNote;
                    var masterNote = _clinicalDbContext.Notes.Where(i => i.NotesId == NotesMaster.NotesId).FirstOrDefault();

                    if (masterNote != null)
                    {
                        masterNote.PerformerId = NotesMaster.PerformerId;
                        masterNote.FollowUp = NotesMaster.FollowUp;
                        masterNote.FollowUpUnit = NotesMaster.FollowUpUnit;
                        masterNote.SecondaryDoctorId = NotesMaster.SecondaryDoctorId;
                        masterNote.IsPending = NotesMaster.IsPending;
                        masterNote.NoteTypeId = NotesMaster.NoteTypeId;
                        masterNote.ModifiedBy = currentUser.EmployeeId;
                        masterNote.ModifiedOn = System.DateTime.Now;
                    }
                    _clinicalDbContext.SaveChanges();

                    var prescription = _clinicalDbContext.ClinicalPrescriptionNote.Where(n => n.PrescriptionNoteId == ClinicalPrescriptionNote.PrescriptionNoteId).FirstOrDefault();

                    prescription.PrescriptionNoteText = NotesMaster.ClinicalPrescriptionNote.PrescriptionNoteText;
                    prescription.OldMedicationStopped = NotesMaster.ClinicalPrescriptionNote.OldMedicationStopped;
                    prescription.NewMedicationStarted = NotesMaster.ClinicalPrescriptionNote.NewMedicationStarted;
                    prescription.ICDRemarks = NotesMaster.ClinicalPrescriptionNote.ICDRemarks;
                    prescription.ICDSelected = NotesMaster.ClinicalPrescriptionNote.ICDSelected;
                    prescription.OrdersSelected = NotesMaster.ClinicalPrescriptionNote.OrdersSelected;
                    prescription.ModifiedBy = currentUser.EmployeeId;
                    prescription.ModifiedOn = System.DateTime.Now;
                    _clinicalDbContext.SaveChanges();

                    var subjective = _clinicalDbContext.SubjectiveNotes.Where(n => n.SubjectiveNoteId == SubjectiveNote.SubjectiveNoteId).FirstOrDefault();

                    subjective.ReviewOfSystems = SubjectiveNote.ReviewOfSystems;
                    subjective.HistoryOfPresentingIllness = SubjectiveNote.HistoryOfPresentingIllness;
                    subjective.ChiefComplaint = SubjectiveNote.ChiefComplaint;
                    subjective.ModifiedBy = currentUser.EmployeeId;
                    subjective.ModifiedOn = System.DateTime.Now;
                    _clinicalDbContext.SaveChanges();

                    dbContextTransaction.Commit();
                    return "OK";
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutEmergencyNoteDetail(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);

                    _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.SaveChanges();

                    SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
                    ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
                    EmergencyNoteModel emergencyNote = NotesMaster.EmergencyNote;

                    List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;
                    List<ClinicalDiagnosisModel> removedClinialDiagnosis = NotesMaster.RemovedIcdAndOrders;

                    if (subjectiveNote != null)
                    {
                        subjectiveNote.ModifiedBy = currentUser.EmployeeId;
                        subjectiveNote.ModifiedOn = DateTime.Now;

                        var temp = _clinicalDbContext.UpdateGraph(subjectiveNote);

                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();


                    }
                    if (objectiveNote != null)
                    {
                        objectiveNote.ModifiedBy = currentUser.EmployeeId;
                        objectiveNote.ModifiedOn = DateTime.Now;

                        var temp = _clinicalDbContext.UpdateGraph(objectiveNote);

                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    }
                    if (emergencyNote != null)
                    {
                        emergencyNote.ModifiedBy = currentUser.EmployeeId;
                        emergencyNote.ModifiedOn = DateTime.Now;

                        var temp = _clinicalDbContext.UpdateGraph(emergencyNote);

                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                        _clinicalDbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();

                    }

                    // assessment orders edit logic
                    if ((clinialDiagnosis != null && clinialDiagnosis.Count > 0) || (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0))
                    {

                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();

                        var priceForLabRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "LAB" && priceCatServItem.PriceCategoryId == 1 //Krishna 13thMarch'23, 1 is for Normal and Hard Coded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        var priceForRadRequisition = (from billItemPrice in _clinicalDbContext.BillItemPrices
                                                      join servDept in _clinicalDbContext.ServiceDepartments
                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                      join priceCatServItem in _clinicalDbContext.BillPriceCategoryServiceItems on billItemPrice.ServiceItemId equals priceCatServItem.ServiceItemId
                                                      where servDept.IntegrationName == "Radiology" && priceCatServItem.PriceCategoryId == 1 //Krishna, 13thMarch'23, 1 is for Normal and Hard Coded for Now
                                                      select new
                                                      {
                                                          ItemId = billItemPrice.IntegrationItemId,
                                                          ItemName = billItemPrice.ItemName,
                                                          Price = priceCatServItem.Price,
                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                          DepartmentName = servDept.ServiceDepartmentName
                                                      }).ToList();

                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                        if (clinialDiagnosis != null && clinialDiagnosis.Count > 0)
                        {
                            // for updating existing diagnosis and add new one (handels newly added diagnosis and orders)
                            foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                            {
                                var cd = _clinicalDbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                // create case - that means, previously (while post) diagnosis was empty
                                if (cd == null)
                                {
                                    Diagnosis.CreatedOn = DateTime.Now;
                                    Diagnosis.CreatedBy = currentUser.EmployeeId;
                                    Diagnosis.NotesId = NotesMaster.NotesId;
                                    _clinicalDbContext.ClinicalDiagnosis.Add(Diagnosis);
                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        labReq.CreatedBy = currentUser.EmployeeId;
                                        labReq.CreatedOn = DateTime.Now;
                                        labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.LabRequisitions.Add(labReq);
                                        _clinicalDbContext.SaveChanges();

                                        var itemDetail = (from labPrice in priceForLabRequisition
                                                          where labPrice.ItemId == labReq.LabTestId
                                                          select labPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = labReq.RequisitionId;
                                        RequisitionItem.BillStatus = labReq.BillingStatus;
                                        RequisitionItem.PatientId = labReq.PatientId;
                                        RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                        RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = (double)itemDetail.Price;
                                        RequisitionItem.Quantity = 1;
                                        RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                        RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                        RequisitionItem.CreatedOn = DateTime.Now;

                                        //allBillRequisition.Add(RequisitionItem);
                                        _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                        _clinicalDbContext.SaveChanges();
                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                        imgnRequisition.CreatedOn = DateTime.Now;
                                        imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                        _clinicalDbContext.SaveChanges();


                                        var itemDetail = (from radPrice in priceForRadRequisition
                                                          where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                          select radPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                        RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                        RequisitionItem.PatientId = imgnRequisition.PatientId;
                                        RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                        RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = (double)itemDetail.Price;
                                        RequisitionItem.Quantity = 1;
                                        RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                        RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                        RequisitionItem.CreatedOn = DateTime.Now;

                                        //allBillRequisition.Add(RequisitionItem);
                                        _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                        _clinicalDbContext.SaveChanges();
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                        phrmRequisition.CreatedOn = DateTime.Now;
                                        phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                        _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                        _clinicalDbContext.SaveChanges();

                                    }
                                    //foreach (BillItemRequisition bill in allBillRequisition)
                                    //{
                                    //    dbContext.BillItemRequisitions.Add(bill);
                                    //}
                                    //dbContext.SaveChanges();

                                }
                                //  edit case - that means diagnosis with that Id exists (add or remove of orders in diagnosis)
                                else
                                {
                                    Diagnosis.ModifiedBy = currentUser.EmployeeId;
                                    Diagnosis.ModifiedOn = DateTime.Now;

                                    var temp = _clinicalDbContext.UpdateGraph(Diagnosis);

                                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        var lo = _clinicalDbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // add case - new lab order added
                                        if (lo == null)
                                        {
                                            labReq.CreatedBy = currentUser.EmployeeId;
                                            labReq.CreatedOn = DateTime.Now;
                                            labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.LabRequisitions.Add(labReq);
                                            _clinicalDbContext.SaveChanges();

                                            labReq.ModifiedBy = currentUser.EmployeeId;
                                            labReq.ModifiedOn = DateTime.Now;

                                            var itemDetail = (from labPrice in priceForLabRequisition
                                                              where labPrice.ItemId == labReq.LabTestId
                                                              select labPrice).FirstOrDefault();


                                            RequisitionItem = new BillItemRequisition();
                                            RequisitionItem.RequisitionId = labReq.RequisitionId;
                                            RequisitionItem.BillStatus = labReq.BillingStatus;
                                            RequisitionItem.PatientId = labReq.PatientId;
                                            RequisitionItem.PatientVisitId = labReq.PatientVisitId.HasValue ? labReq.PatientVisitId.Value : 0;
                                            RequisitionItem.ProviderId = labReq.PrescriberId.Value;
                                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                            RequisitionItem.ItemId = itemDetail.ItemId;
                                            RequisitionItem.ItemName = itemDetail.ItemName;
                                            RequisitionItem.Price = (double)itemDetail.Price;
                                            RequisitionItem.Quantity = 1;
                                            RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                            RequisitionItem.CreatedOn = DateTime.Now;

                                            //allBillRequisition.Add(RequisitionItem);
                                            _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                            _clinicalDbContext.SaveChanges();
                                        }// else- remove or not changed orders                                                    

                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        var io = _clinicalDbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // adding new imaging order
                                        if (io == null)
                                        {
                                            imgnRequisition.CreatedBy = currentUser.EmployeeId;
                                            imgnRequisition.CreatedOn = DateTime.Now;
                                            imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.ImagingRequisitions.Add(imgnRequisition);
                                            _clinicalDbContext.SaveChanges();


                                            var itemDetail = (from radPrice in priceForRadRequisition
                                                              where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                              select radPrice).FirstOrDefault();

                                            RequisitionItem = new BillItemRequisition();
                                            RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                            RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                            RequisitionItem.PatientId = imgnRequisition.PatientId;
                                            RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                            RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
                                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                            RequisitionItem.ItemId = itemDetail.ItemId;
                                            RequisitionItem.ItemName = itemDetail.ItemName;
                                            RequisitionItem.Price = (double)itemDetail.Price;
                                            RequisitionItem.Quantity = 1;
                                            RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
                                            RequisitionItem.CreatedOn = DateTime.Now;

                                            //allBillRequisition.Add(RequisitionItem);
                                            _clinicalDbContext.BillItemRequisitions.Add(RequisitionItem);
                                            _clinicalDbContext.SaveChanges();

                                        } // else - either order removed or not changed
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        var mo = _clinicalDbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
                                        // adding new medication order
                                        if (mo == null)
                                        {
                                            phrmRequisition.CreatedBy = currentUser.EmployeeId;
                                            phrmRequisition.CreatedOn = DateTime.Now;
                                            phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                                            _clinicalDbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                            _clinicalDbContext.SaveChanges();
                                        }
                                    }
                                }
                            }
                        }

                        if (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0)
                        {
                            // for removed diagnosis
                            foreach (ClinicalDiagnosisModel Diagnosis in removedClinialDiagnosis)
                            {
                                var cd = _clinicalDbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                if (cd != null)
                                {
                                    cd.ModifiedBy = currentUser.EmployeeId;
                                    cd.ModifiedOn = DateTime.Now;
                                    if (Diagnosis.IsActive == false)
                                    {
                                        cd.IsActive = false;
                                    }

                                    _clinicalDbContext.SaveChanges();

                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        var lo = _clinicalDbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (lo != null)
                                        {
                                            if (lo.OrderStatus != "pending")
                                            {
                                                lo.ModifiedBy = currentUser.EmployeeId;
                                                lo.ModifiedOn = DateTime.Now;
                                                lo.OrderStatus = "cancel";
                                                lo.BillingStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();

                                                var billReq = _clinicalDbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == lo.RequisitionId);
                                                if (billReq != null)
                                                {
                                                    billReq.BillStatus = "cancel";
                                                    _clinicalDbContext.SaveChanges();
                                                }
                                            }
                                        }
                                    }

                                    foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                                    {
                                        var io = _clinicalDbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (io != null)
                                        {
                                            if (io.OrderStatus != "pending")
                                            {
                                                io.ModifiedBy = currentUser.EmployeeId;
                                                io.ModifiedOn = DateTime.Now;
                                                io.OrderStatus = "cancel";
                                                io.BillingStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();

                                                var billReq = _clinicalDbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == io.ImagingRequisitionId);
                                                if (billReq != null)
                                                {
                                                    billReq.BillStatus = "cancel";

                                                    _clinicalDbContext.SaveChanges();
                                                }
                                            }
                                        }
                                    }

                                    foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                                    {
                                        var mo = _clinicalDbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

                                        if (mo != null)
                                        {
                                            if (mo.OrderStatus != "pending")
                                            {
                                                mo.ModifiedBy = currentUser.EmployeeId;
                                                mo.ModifiedOn = DateTime.Now;
                                                mo.OrderStatus = "cancel";

                                                _clinicalDbContext.SaveChanges();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    dbContextTransaction.Commit();
                    return "OK";


                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutDischargeNoteTemplateDetail(string str, RbacUser currentUser)
        {

            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
                    DischargeSummaryModel DischargeSummaryNote = NotesMaster.DischargeSummaryNote;
                    DischargeSummaryNote.ModifiedBy = currentUser.EmployeeId;
                    DischargeSummaryNote.ModifiedOn = DateTime.Now;

                    var temp = _clinicalDbContext.UpdateGraph(DischargeSummaryNote);
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    NotesMaster.DischargeSummaryNote.DischargeSummaryMedications.ForEach(a =>
                    {
                        var tempMed = _clinicalDbContext.UpdateGraph(a);
                        _clinicalDbContext.Entry(tempMed).Property(u => u.DischargeSummaryId).IsModified = false;
                        _clinicalDbContext.Entry(tempMed).Property(u => u.IsActive).IsModified = false;
                        _clinicalDbContext.SaveChanges();
                    });

                    NotesMaster = _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return NotesMaster;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutFreeTextNoteTemplateDetail(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
                    FreeTextNoteModel FreeTextNote = NotesMaster.FreeTextNote;
                    FreeTextNote.ModifiedBy = currentUser.EmployeeId;
                    FreeTextNote.ModifiedOn = DateTime.Now;
                    var temp = _clinicalDbContext.UpdateGraph(FreeTextNote);
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    NotesMaster.ModifiedOn = DateTime.Now;
                    NotesMaster.ModifiedBy = currentUser.EmployeeId;
                    NotesMaster = _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return NotesMaster;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object PutProcedureNoteTemplateDetail(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
                    ProcedureNoteModel ProcedureNote = NotesMaster.ProcedureNote;
                    ProcedureNote.ModifiedBy = currentUser.EmployeeId;
                    ProcedureNote.ModifiedOn = DateTime.Now;
                    var temp = _clinicalDbContext.UpdateGraph(ProcedureNote);
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    NotesMaster.ModifiedOn = DateTime.Now;
                    NotesMaster.ModifiedBy = currentUser.EmployeeId;
                    NotesMaster = _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;

                    _clinicalDbContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return NotesMaster;

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutProgressNoteTemplateDetail(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _clinicalDbContext.Database.BeginTransaction())
            {
                try
                {
                    NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
                    ProgressNoteModel ProgressNote = NotesMaster.ProgressNote;
                    ProgressNote.ModifiedBy = currentUser.EmployeeId;
                    ProgressNote.ModifiedOn = DateTime.Now;
                    var temp = _clinicalDbContext.UpdateGraph(ProgressNote);
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.SaveChanges();

                    NotesMaster.ModifiedOn = DateTime.Now;
                    NotesMaster.ModifiedBy = currentUser.EmployeeId;
                    NotesMaster = _clinicalDbContext.UpdateGraph(NotesMaster);
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
                    _clinicalDbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
                    _clinicalDbContext.SaveChanges();
                    return NotesMaster;
                    dbContextTransaction.Commit();

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object PutOPDGeneralNote(string str, RbacUser currentUser)
        {
            NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);
            notes.ModifiedBy = currentUser.EmployeeId;
            notes.ModifiedOn = DateTime.Now;
            notes = _clinicalDbContext.UpdateGraph(notes);
            _clinicalDbContext.Entry(notes).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(notes).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return notes;

        }
        private object PutSurgicalHistory(string str, RbacUser currentUser)
        {
            SurgicalHistory clientSurgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);
            clientSurgicalHistory.ModifiedBy = currentUser.EmployeeId;
            clientSurgicalHistory.ModifiedOn = DateTime.Now;
            clientSurgicalHistory = _clinicalDbContext.UpdateGraph(clientSurgicalHistory);
            _clinicalDbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientSurgicalHistory;

        }
        private object PutReferralSource(string str, RbacUser currentUser)
        {
            ReferralSource clientreferralsource = JsonConvert.DeserializeObject<ReferralSource>(str);
            clientreferralsource.ModifiedBy = currentUser.EmployeeId;
            clientreferralsource.ModifiedOn = DateTime.Now;
            clientreferralsource = _clinicalDbContext.UpdateGraph(clientreferralsource);
            _clinicalDbContext.Entry(clientreferralsource).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientreferralsource).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientreferralsource; ;

        }
        private object PutSocialHistory(string str, RbacUser currentUser)
        {
            SocialHistory clientSocialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);
            clientSocialHistory.ModifiedBy = currentUser.EmployeeId;
            clientSocialHistory.ModifiedOn = DateTime.Now;
            clientSocialHistory = _clinicalDbContext.UpdateGraph(clientSocialHistory);
            _clinicalDbContext.Entry(clientSocialHistory).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientSocialHistory).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientSocialHistory;
        }
        private object PutPastMedical(string str, RbacUser currentUser)
        {
            PastMedicalProblem clientPastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
            clientPastMedical.ModifiedBy = currentUser.EmployeeId;
            clientPastMedical.ModifiedOn = DateTime.Now;
            clientPastMedical = _clinicalDbContext.UpdateGraph(clientPastMedical);
            _clinicalDbContext.Entry(clientPastMedical).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientPastMedical).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientPastMedical;
        }
        private object PutMedicationPrescription(string str, RbacUser currentUser)
        {

            MedicationPrescriptionModel clientPrescription = JsonConvert.DeserializeObject<MedicationPrescriptionModel>(str);
            clientPrescription.ModifiedBy = currentUser.EmployeeId;
            clientPrescription.ModifiedOn = DateTime.Now;
            clientPrescription = _clinicalDbContext.UpdateGraph(clientPrescription);
            _clinicalDbContext.Entry(clientPrescription).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientPrescription).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            //assinging MedicationName
            PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
            MasterDbContext masterDbContext = new MasterDbContext(connString);

            if (clientPrescription.MedicationId != 0)
            {
                clientPrescription.MedicationName = phrmDbContext.PHRMItemMaster
                        .Where(m => m.ItemId == clientPrescription.MedicationId).FirstOrDefault().ItemName;
            }
            if (clientPrescription.PerformerId != 0)
            {
                clientPrescription.PerformerName = masterDbContext.Employees
               .Where(e => e.EmployeeId == clientPrescription.PerformerId)
               .Select(e => e).FirstOrDefault().FullName;
            }

            return clientPrescription;

        }
        private object PutInputOutput(string str, RbacUser currentUser)
        {
            InputOutputModel clientIO = JsonConvert.DeserializeObject<InputOutputModel>(str);
            clientIO.ModifiedBy = currentUser.EmployeeId;
            clientIO.ModifiedOn = DateTime.Now;
            clientIO = _clinicalDbContext.UpdateGraph(clientIO);
            _clinicalDbContext.Entry(clientIO).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientIO).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientIO;

        }
        private object PutHomeMedication(string str, RbacUser currentUser)
        {
            HomeMedicationModel clientHomeMedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
            clientHomeMedication.ModifiedBy = currentUser.EmployeeId;
            clientHomeMedication.ModifiedOn = DateTime.Now;
            clientHomeMedication = _clinicalDbContext.UpdateGraph(clientHomeMedication);

            _clinicalDbContext.Entry(clientHomeMedication).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientHomeMedication).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();

            PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
            if (clientHomeMedication.MedicationId != null && clientHomeMedication.MedicationId != 0)
            {
                clientHomeMedication.MedicationName = phrmDbContext.PHRMItemMaster
                                                        .Where(a => a.ItemId == clientHomeMedication.MedicationId).FirstOrDefault().ItemName;
            }

            return clientHomeMedication;
        }
        private object PutFamilyHistory(string str, RbacUser currentUser)
        {
            FamilyHistory clientFamilyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
            clientFamilyHistory.ModifiedBy = currentUser.EmployeeId;
            clientFamilyHistory.ModifiedOn = DateTime.Now;

            clientFamilyHistory = _clinicalDbContext.UpdateGraph(clientFamilyHistory);
            _clinicalDbContext.Entry(clientFamilyHistory).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientFamilyHistory).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientFamilyHistory;
        }
        private object PutAllergy(string str, RbacUser currentUser)
        {
            AllergyModel clientAllergy = JsonConvert.DeserializeObject<AllergyModel>(str);
            clientAllergy.ModifiedBy = currentUser.EmployeeId;
            clientAllergy.ModifiedOn = DateTime.Now;

            clientAllergy = _clinicalDbContext.UpdateGraph(clientAllergy);
            _clinicalDbContext.Entry(clientAllergy).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientAllergy).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientAllergy;
        }
        private object PutVitals(string str, RbacUser currentUser)
        {
            VitalsModel clientVitals = JsonConvert.DeserializeObject<VitalsModel>(str);
            clientVitals.ModifiedBy = currentUser.EmployeeId;
            clientVitals.ModifiedOn = DateTime.Now;
            clientVitals = _clinicalDbContext.UpdateGraph(clientVitals);
            _clinicalDbContext.Entry(clientVitals).Property(u => u.CreatedBy).IsModified = false;
            _clinicalDbContext.Entry(clientVitals).Property(u => u.CreatedOn).IsModified = false;
            _clinicalDbContext.SaveChanges();
            return clientVitals;
        }

        //[HttpPut]
        //public string Put()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    ClinicalDbContext dbContext = new ClinicalDbContext(connString);
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    string str = this.ReadPostData();
        //    string reqType = this.ReadQueryStringData("reqType");

        //    try
        //    {
        //        if (!String.IsNullOrEmpty(str))
        //        {
        //if (reqType == "vitals")
        //{
        //    VitalsModel clientVitals = JsonConvert.DeserializeObject<VitalsModel>(str);
        //    clientVitals.ModifiedBy = currentUser.EmployeeId;
        //    clientVitals.ModifiedOn = DateTime.Now;
        //    clientVitals = dbContext.UpdateGraph(clientVitals);
        //    dbContext.Entry(clientVitals).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientVitals).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();

        //    responseData.Results = clientVitals;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "activemedical")
        //{

        //    ActiveMedicalProblem clientActiveMedicals = JsonConvert.DeserializeObject<ActiveMedicalProblem>(str);
        //    clientActiveMedicals.ModifiedBy = currentUser.EmployeeId;
        //    clientActiveMedicals.ModifiedOn = DateTime.Now;
        //    clientActiveMedicals = dbContext.UpdateGraph(clientActiveMedicals);
        //    dbContext.Entry(clientActiveMedicals).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientActiveMedicals).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();

        //    responseData.Results = clientActiveMedicals;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "allergy")
        //{
        //    AllergyModel clientAllergy = JsonConvert.DeserializeObject<AllergyModel>(str);
        //    clientAllergy.ModifiedBy = currentUser.EmployeeId;
        //    clientAllergy.ModifiedOn = DateTime.Now;

        //    clientAllergy = dbContext.UpdateGraph(clientAllergy);
        //    dbContext.Entry(clientAllergy).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientAllergy).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();

        //    ////assinging AllergenAdvRecName
        //    //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

        //    //if (clientAllergy.AllergenAdvRecId != 0 && clientAllergy.AllergenAdvRecId != null)
        //    //{
        //    //    clientAllergy.AllergenAdvRecName = phrmDbContext.PHRMGenericModel
        //    //            .Where(a => a.GenericId == clientAllergy.AllergenAdvRecId).FirstOrDefault().GenericName;
        //    //}

        //    responseData.Results = clientAllergy;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "familyhistory")
        //{
        //    FamilyHistory clientFamilyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
        //    clientFamilyHistory.ModifiedBy = currentUser.EmployeeId;
        //    clientFamilyHistory.ModifiedOn = DateTime.Now;

        //    clientFamilyHistory = dbContext.UpdateGraph(clientFamilyHistory);
        //    dbContext.Entry(clientFamilyHistory).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientFamilyHistory).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientFamilyHistory;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "homemedication")
        //{
        //    HomeMedicationModel clientHomeMedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
        //    clientHomeMedication.ModifiedBy = currentUser.EmployeeId;
        //    clientHomeMedication.ModifiedOn = DateTime.Now;
        //    clientHomeMedication = dbContext.UpdateGraph(clientHomeMedication);

        //    dbContext.Entry(clientHomeMedication).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientHomeMedication).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();

        //    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //    if (clientHomeMedication.MedicationId != null && clientHomeMedication.MedicationId != 0)
        //    {
        //        clientHomeMedication.MedicationName = phrmDbContext.PHRMItemMaster
        //                                                .Where(a => a.ItemId == clientHomeMedication.MedicationId).FirstOrDefault().ItemName;
        //    }

        //    responseData.Results = clientHomeMedication;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "inputoutput")
        //{
        //    InputOutputModel clientIO = JsonConvert.DeserializeObject<InputOutputModel>(str);
        //    clientIO.ModifiedBy = currentUser.EmployeeId;
        //    clientIO.ModifiedOn = DateTime.Now;
        //    clientIO = dbContext.UpdateGraph(clientIO);
        //    dbContext.Entry(clientIO).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientIO).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientIO;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "medicationprescription")
        //{
        //    MedicationPrescriptionModel clientPrescription = JsonConvert.DeserializeObject<MedicationPrescriptionModel>(str);
        //    clientPrescription.ModifiedBy = currentUser.EmployeeId;
        //    clientPrescription.ModifiedOn = DateTime.Now;
        //    clientPrescription = dbContext.UpdateGraph(clientPrescription);
        //    dbContext.Entry(clientPrescription).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientPrescription).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    //assinging MedicationName
        //    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
        //    MasterDbContext masterDbContext = new MasterDbContext(connString);

        //    if (clientPrescription.MedicationId != 0)
        //    {
        //        clientPrescription.MedicationName = phrmDbContext.PHRMItemMaster
        //                .Where(m => m.ItemId == clientPrescription.MedicationId).FirstOrDefault().ItemName;
        //    }
        //    if (clientPrescription.PerformerId != 0)
        //    {
        //        clientPrescription.PerformerName = masterDbContext.Employees
        //       .Where(e => e.EmployeeId == clientPrescription.PerformerId)
        //       .Select(e => e).FirstOrDefault().FullName;
        //    }

        //    responseData.Results = clientPrescription;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "pastmedical")
        //{
        //    PastMedicalProblem clientPastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
        //    clientPastMedical.ModifiedBy = currentUser.EmployeeId;
        //    clientPastMedical.ModifiedOn = DateTime.Now;
        //    clientPastMedical = dbContext.UpdateGraph(clientPastMedical);
        //    dbContext.Entry(clientPastMedical).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientPastMedical).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientPastMedical;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "socialhistory")
        //{
        //    SocialHistory clientSocialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);
        //    clientSocialHistory.ModifiedBy = currentUser.EmployeeId;
        //    clientSocialHistory.ModifiedOn = DateTime.Now;
        //    clientSocialHistory = dbContext.UpdateGraph(clientSocialHistory);
        //    dbContext.Entry(clientSocialHistory).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientSocialHistory).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientSocialHistory;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "referralsource")
        //{
        //    ReferralSource clientreferralsource = JsonConvert.DeserializeObject<ReferralSource>(str);
        //    clientreferralsource.ModifiedBy = currentUser.EmployeeId;
        //    clientreferralsource.ModifiedOn = DateTime.Now;
        //    clientreferralsource = dbContext.UpdateGraph(clientreferralsource);
        //    dbContext.Entry(clientreferralsource).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientreferralsource).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientreferralsource;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "surgicalhistory")
        //{
        //    SurgicalHistory clientSurgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);
        //    clientSurgicalHistory.ModifiedBy = currentUser.EmployeeId;
        //    clientSurgicalHistory.ModifiedOn = DateTime.Now;
        //    clientSurgicalHistory = dbContext.UpdateGraph(clientSurgicalHistory);
        //    dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedBy).IsModified = false;
        //    dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedOn).IsModified = false;
        //    dbContext.SaveChanges();
        //    responseData.Results = clientSurgicalHistory;
        //    responseData.Status = "OK";
        //}
        //else if (reqType == "notes") ---NoContent ref
        //{
        //    //NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);
        //    //notes.ModifiedBy = currentUser.EmployeeId;
        //    //notes.ModifiedOn = DateTime.Now;
        //    //notes = dbContext.UpdateGraph(notes);
        //    //dbContext.Entry(notes).Property(u => u.CreatedBy).IsModified = false;
        //    //dbContext.Entry(notes).Property(u => u.CreatedOn).IsModified = false;
        //    //dbContext.SaveChanges();
        //    //responseData.Results = notes;
        //    //responseData.Status = "OK";
        //}
        //else if (reqType == "opd-general-note")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {

        //            NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

        //            SubjectiveNoteModel subjectiveNote = notes.SubjectiveNote;
        //            ObjectiveNoteModel objectiveNote = notes.ObjectiveNote;

        //            List<ClinicalDiagnosisModel> clinialDiagnosis = notes.AllIcdAndOrders;

        //            if (notes != null)
        //            {
        //                notes.SubjectiveNote = null;
        //                notes.ObjectiveNote = null;
        //                notes.ModifiedOn = DateTime.Now;
        //                notes.ModifiedBy = currentUser.EmployeeId;
        //                notes = dbContext.UpdateGraph(notes);
        //                dbContext.Entry(notes).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(notes).Property(u => u.CreatedOn).IsModified = false;
        //                //update notes
        //                if (subjectiveNote != null)
        //                {
        //                    if (subjectiveNote.SubjectiveNoteId != 0)
        //                    {
        //                        subjectiveNote.ModifiedBy = notes.ModifiedBy;
        //                        subjectiveNote.ModifiedOn = notes.ModifiedOn;
        //                        subjectiveNote = dbContext.UpdateGraph(subjectiveNote);
        //                        dbContext.Entry(subjectiveNote).Property(u => u.CreatedBy).IsModified = false;
        //                        dbContext.Entry(subjectiveNote).Property(u => u.CreatedOn).IsModified = false;
        //                    }
        //                    else
        //                    {
        //                        subjectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        subjectiveNote.CreatedOn = notes.CreatedOn;
        //                        subjectiveNote.NotesId = notes.NotesId;
        //                        dbContext.SubjectiveNotes.Add(subjectiveNote);
        //                    }


        //                }
        //                if (objectiveNote != null)
        //                {
        //                    if (objectiveNote.ObjectiveNotesId != 0)
        //                    {
        //                        objectiveNote.ModifiedBy = notes.ModifiedBy;
        //                        objectiveNote.ModifiedOn = notes.ModifiedOn;
        //                        objectiveNote = dbContext.UpdateGraph(objectiveNote);
        //                    }
        //                    else
        //                    {
        //                        //add Objective Note  
        //                        objectiveNote.CreatedBy = currentUser.EmployeeId;
        //                        objectiveNote.CreatedOn = DateTime.Now;
        //                        objectiveNote.NotesId = notes.NotesId;
        //                        dbContext.ObjectiveNotes.Add(objectiveNote);
        //                    }

        //                }
        //                dbContext.SaveChanges();

        //                if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
        //                {

        //                    List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
        //                    var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                  join servDept in dbContext.ServiceDepartments
        //                                                  on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                  where servDept.IntegrationName == "LAB"
        //                                                  select new
        //                                                  {
        //                                                      ItemId = billItemPrice.ItemId,
        //                                                      ItemName = billItemPrice.ItemName,
        //                                                      Price = billItemPrice.Price,
        //                                                      ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                      DepartmentName = servDept.ServiceDepartmentName
        //                                                  }).ToList();

        //                    var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                                  join servDept in dbContext.ServiceDepartments
        //                                                  on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                                  where servDept.IntegrationName == "Radiology"
        //                                                  select new
        //                                                  {
        //                                                      ItemId = billItemPrice.ItemId,
        //                                                      ItemName = billItemPrice.ItemName,
        //                                                      Price = billItemPrice.Price,
        //                                                      ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                      DepartmentName = servDept.ServiceDepartmentName
        //                                                  }).ToList();


        //                    BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                    foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                    {
        //                        Diagnosis.CreatedOn = DateTime.Now;
        //                        Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                        Diagnosis.NotesId = notes.NotesId;
        //                        dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                        dbContext.SaveChanges();



        //                        foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                        {
        //                            labReq.CreatedBy = currentUser.EmployeeId;
        //                            labReq.CreatedOn = DateTime.Now;
        //                            labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                            dbContext.LabRequisitions.Add(labReq);
        //                            dbContext.SaveChanges();

        //                            var itemDetail = (from labPrice in priceForLabRequisition
        //                                              where labPrice.ItemId == labReq.LabTestId
        //                                              select labPrice).FirstOrDefault();


        //                            RequisitionItem = new BillItemRequisition();
        //                            RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                            RequisitionItem.BillStatus = labReq.BillingStatus;
        //                            RequisitionItem.PatientId = labReq.PatientId;
        //                            RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                            RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                            RequisitionItem.ItemId = itemDetail.ItemId;
        //                            RequisitionItem.ItemName = itemDetail.ItemName;
        //                            RequisitionItem.Price = itemDetail.Price;
        //                            RequisitionItem.Quantity = 1;
        //                            RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                            RequisitionItem.CreatedOn = DateTime.Now;

        //                            allBillRequisition.Add(RequisitionItem);
        //                        }

        //                        foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                        {
        //                            imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                            imgnRequisition.CreatedOn = DateTime.Now;
        //                            imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                            dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                            dbContext.SaveChanges();

        //                            var itemDetail = (from radPrice in priceForRadRequisition
        //                                              where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                              select radPrice).FirstOrDefault();


        //                            RequisitionItem = new BillItemRequisition();
        //                            RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                            RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                            RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                            RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                            RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                            RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                            RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                            RequisitionItem.ItemId = itemDetail.ItemId;
        //                            RequisitionItem.ItemName = itemDetail.ItemName;
        //                            RequisitionItem.Price = itemDetail.Price;
        //                            RequisitionItem.Quantity = 1;
        //                            RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                            RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                            RequisitionItem.CreatedOn = DateTime.Now;

        //                            allBillRequisition.Add(RequisitionItem);
        //                        }

        //                        foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                        {
        //                            phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                            phrmRequisition.CreatedOn = DateTime.Now;
        //                            phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                            dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                            dbContext.SaveChanges();
        //                        }

        //                    }
        //                    foreach (BillItemRequisition bill in allBillRequisition)
        //                    {
        //                        dbContext.BillItemRequisitions.Add(bill);
        //                    }
        //                    dbContext.SaveChanges();
        //                }


        //                dbContextTransaction.Commit();
        //                responseData.Status = "OK";
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            //Rollback all transaction if exception occured
        //            dbContextTransaction.Rollback();
        //            responseData.Status = "Failed";
        //            throw ex;
        //        }
        //    }



        //}

        ////Edit Notes Template
        //else if (reqType == "putProgressNoteTemplateList")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            ProgressNoteModel ProgressNote = NotesMaster.ProgressNote;
        //            ProgressNote.ModifiedBy = currentUser.EmployeeId;
        //            ProgressNote.ModifiedOn = DateTime.Now;
        //            var temp = dbContext.UpdateGraph(ProgressNote);
        //            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //            dbContext.SaveChanges();

        //            NotesMaster.ModifiedOn = DateTime.Now;
        //            NotesMaster.ModifiedBy = currentUser.EmployeeId;
        //            NotesMaster = dbContext.UpdateGraph(NotesMaster);
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
        //            dbContext.SaveChanges();
        //            responseData.Results = NotesMaster;
        //            responseData.Status = "OK";
        //            dbContextTransaction.Commit();

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}
        //else if (reqType == "putProcedureNoteTemplateList")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            ProcedureNoteModel ProcedureNote = NotesMaster.ProcedureNote;
        //            ProcedureNote.ModifiedBy = currentUser.EmployeeId;
        //            ProcedureNote.ModifiedOn = DateTime.Now;
        //            var temp = dbContext.UpdateGraph(ProcedureNote);
        //            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //            dbContext.SaveChanges();

        //            NotesMaster.ModifiedOn = DateTime.Now;
        //            NotesMaster.ModifiedBy = currentUser.EmployeeId;
        //            NotesMaster = dbContext.UpdateGraph(NotesMaster);
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;

        //            dbContext.SaveChanges();
        //            responseData.Results = NotesMaster;
        //            responseData.Status = "OK";
        //            dbContextTransaction.Commit();

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}
        //else if (reqType == "putFreeTextTemplateList")
        //{

        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            FreeTextNoteModel FreeTextNote = NotesMaster.FreeTextNote;
        //            FreeTextNote.ModifiedBy = currentUser.EmployeeId;
        //            FreeTextNote.ModifiedOn = DateTime.Now;
        //            var temp = dbContext.UpdateGraph(FreeTextNote);
        //            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.SaveChanges();

        //            NotesMaster.ModifiedOn = DateTime.Now;
        //            NotesMaster.ModifiedBy = currentUser.EmployeeId;
        //            NotesMaster = dbContext.UpdateGraph(NotesMaster);
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
        //            dbContext.SaveChanges();
        //            responseData.Results = NotesMaster;
        //            responseData.Status = "OK";
        //            dbContextTransaction.Commit();

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}

        //else if (reqType == "putDischargeNoteTemplateList")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            DischargeSummaryModel DischargeSummaryNote = NotesMaster.DischargeSummaryNote;
        //            DischargeSummaryNote.ModifiedBy = currentUser.EmployeeId;
        //            DischargeSummaryNote.ModifiedOn = DateTime.Now;

        //            var temp = dbContext.UpdateGraph(DischargeSummaryNote);
        //            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //            dbContext.SaveChanges();

        //            NotesMaster.DischargeSummaryNote.DischargeSummaryMedications.ForEach(a =>
        //            {
        //                var tempMed = dbContext.UpdateGraph(a);
        //                dbContext.Entry(tempMed).Property(u => u.DischargeSummaryId).IsModified = false;
        //                dbContext.Entry(tempMed).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();
        //            });

        //            NotesMaster = dbContext.UpdateGraph(NotesMaster);
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.NotesId).IsModified = false;
        //            dbContext.Entry(NotesMaster).Property(u => u.PerformerId).IsModified = false;
        //            dbContext.SaveChanges();

        //            responseData.Results = NotesMaster;
        //            responseData.Status = "OK";
        //            dbContextTransaction.Commit();

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}
        //else if (reqType == "putEmergencyNoteTemplate")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);

        //            dbContext.UpdateGraph(NotesMaster);
        //            dbContext.SaveChanges();

        //            SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
        //            ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
        //            EmergencyNoteModel emergencyNote = NotesMaster.EmergencyNote;

        //            List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;
        //            List<ClinicalDiagnosisModel> removedClinialDiagnosis = NotesMaster.RemovedIcdAndOrders;

        //            if (subjectiveNote != null)
        //            {
        //                subjectiveNote.ModifiedBy = currentUser.EmployeeId;
        //                subjectiveNote.ModifiedOn = DateTime.Now;

        //                var temp = dbContext.UpdateGraph(subjectiveNote);

        //                dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();


        //            }
        //            if (objectiveNote != null)
        //            {
        //                objectiveNote.ModifiedBy = currentUser.EmployeeId;
        //                objectiveNote.ModifiedOn = DateTime.Now;

        //                var temp = dbContext.UpdateGraph(objectiveNote);

        //                dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            if (emergencyNote != null)
        //            {
        //                emergencyNote.ModifiedBy = currentUser.EmployeeId;
        //                emergencyNote.ModifiedOn = DateTime.Now;

        //                var temp = dbContext.UpdateGraph(emergencyNote);

        //                dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();

        //            }

        //            // assessment orders edit logic
        //            if ((clinialDiagnosis != null && clinialDiagnosis.Count > 0) || (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0))
        //            {

        //                List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();

        //                var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                              join servDept in dbContext.ServiceDepartments
        //                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                              where servDept.IntegrationName == "LAB"
        //                                              select new
        //                                              {
        //                                                  ItemId = billItemPrice.ItemId,
        //                                                  ItemName = billItemPrice.ItemName,
        //                                                  Price = billItemPrice.Price,
        //                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                  DepartmentName = servDept.ServiceDepartmentName
        //                                              }).ToList();

        //                var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                              join servDept in dbContext.ServiceDepartments
        //                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                              where servDept.IntegrationName == "Radiology"
        //                                              select new
        //                                              {
        //                                                  ItemId = billItemPrice.ItemId,
        //                                                  ItemName = billItemPrice.ItemName,
        //                                                  Price = billItemPrice.Price,
        //                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                  DepartmentName = servDept.ServiceDepartmentName
        //                                              }).ToList();

        //                BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                if (clinialDiagnosis != null && clinialDiagnosis.Count > 0)
        //                {
        //                    // for updating existing diagnosis and add new one (handels newly added diagnosis and orders)
        //                    foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                    {
        //                        var cd = dbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                        // create case - that means, previously (while post) diagnosis was empty
        //                        if (cd == null)
        //                        {
        //                            Diagnosis.CreatedOn = DateTime.Now;
        //                            Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            Diagnosis.NotesId = NotesMaster.NotesId;
        //                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                labReq.CreatedBy = currentUser.EmployeeId;
        //                                labReq.CreatedOn = DateTime.Now;
        //                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.LabRequisitions.Add(labReq);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from labPrice in priceForLabRequisition
        //                                                  where labPrice.ItemId == labReq.LabTestId
        //                                                  select labPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                RequisitionItem.PatientId = labReq.PatientId;
        //                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                //allBillRequisition.Add(RequisitionItem);
        //                                dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                dbContext.SaveChanges();
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                imgnRequisition.CreatedOn = DateTime.Now;
        //                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                dbContext.SaveChanges();


        //                                var itemDetail = (from radPrice in priceForRadRequisition
        //                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                  select radPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                //allBillRequisition.Add(RequisitionItem);
        //                                dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                dbContext.SaveChanges();
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                phrmRequisition.CreatedOn = DateTime.Now;
        //                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                dbContext.SaveChanges();

        //                            }
        //                            //foreach (BillItemRequisition bill in allBillRequisition)
        //                            //{
        //                            //    dbContext.BillItemRequisitions.Add(bill);
        //                            //}
        //                            //dbContext.SaveChanges();

        //                        }
        //                        //  edit case - that means diagnosis with that Id exists (add or remove of orders in diagnosis)
        //                        else
        //                        {
        //                            Diagnosis.ModifiedBy = currentUser.EmployeeId;
        //                            Diagnosis.ModifiedOn = DateTime.Now;

        //                            var temp = dbContext.UpdateGraph(Diagnosis);

        //                            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                var lo = dbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // add case - new lab order added
        //                                if (lo == null)
        //                                {
        //                                    labReq.CreatedBy = currentUser.EmployeeId;
        //                                    labReq.CreatedOn = DateTime.Now;
        //                                    labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.LabRequisitions.Add(labReq);
        //                                    dbContext.SaveChanges();

        //                                    labReq.ModifiedBy = currentUser.EmployeeId;
        //                                    labReq.ModifiedOn = DateTime.Now;

        //                                    var itemDetail = (from labPrice in priceForLabRequisition
        //                                                      where labPrice.ItemId == labReq.LabTestId
        //                                                      select labPrice).FirstOrDefault();


        //                                    RequisitionItem = new BillItemRequisition();
        //                                    RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                    RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                    RequisitionItem.PatientId = labReq.PatientId;
        //                                    RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                    RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                    RequisitionItem.ItemId = itemDetail.ItemId;
        //                                    RequisitionItem.ItemName = itemDetail.ItemName;
        //                                    RequisitionItem.Price = itemDetail.Price;
        //                                    RequisitionItem.Quantity = 1;
        //                                    RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                    RequisitionItem.CreatedOn = DateTime.Now;

        //                                    //allBillRequisition.Add(RequisitionItem);
        //                                    dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                    dbContext.SaveChanges();
        //                                }// else- remove or not changed orders                                                    

        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                var io = dbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // adding new imaging order
        //                                if (io == null)
        //                                {
        //                                    imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                    imgnRequisition.CreatedOn = DateTime.Now;
        //                                    imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                    dbContext.SaveChanges();


        //                                    var itemDetail = (from radPrice in priceForRadRequisition
        //                                                      where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                      select radPrice).FirstOrDefault();

        //                                    RequisitionItem = new BillItemRequisition();
        //                                    RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                    RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                    RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                    RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                    RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                    RequisitionItem.ItemId = itemDetail.ItemId;
        //                                    RequisitionItem.ItemName = itemDetail.ItemName;
        //                                    RequisitionItem.Price = itemDetail.Price;
        //                                    RequisitionItem.Quantity = 1;
        //                                    RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                    RequisitionItem.CreatedOn = DateTime.Now;

        //                                    //allBillRequisition.Add(RequisitionItem);
        //                                    dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                    dbContext.SaveChanges();

        //                                } // else - either order removed or not changed
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                var mo = dbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // adding new medication order
        //                                if (mo == null)
        //                                {
        //                                    phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                    phrmRequisition.CreatedOn = DateTime.Now;
        //                                    phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                    dbContext.SaveChanges();
        //                                }
        //                            }
        //                        }
        //                    }
        //                }

        //                if (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0)
        //                {
        //                    // for removed diagnosis
        //                    foreach (ClinicalDiagnosisModel Diagnosis in removedClinialDiagnosis)
        //                    {
        //                        var cd = dbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                        if (cd != null)
        //                        {
        //                            cd.ModifiedBy = currentUser.EmployeeId;
        //                            cd.ModifiedOn = DateTime.Now;
        //                            if (Diagnosis.IsActive == false)
        //                            {
        //                                cd.IsActive = false;
        //                            }

        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                var lo = dbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (lo != null)
        //                                {
        //                                    if (lo.OrderStatus != "pending")
        //                                    {
        //                                        lo.ModifiedBy = currentUser.EmployeeId;
        //                                        lo.ModifiedOn = DateTime.Now;
        //                                        lo.OrderStatus = "cancel";
        //                                        lo.BillingStatus = "cancel";

        //                                        dbContext.SaveChanges();

        //                                        var billReq = dbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == lo.RequisitionId);
        //                                        if (billReq != null)
        //                                        {
        //                                            billReq.BillStatus = "cancel";
        //                                            dbContext.SaveChanges();
        //                                        }
        //                                    }
        //                                }
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                var io = dbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (io != null)
        //                                {
        //                                    if (io.OrderStatus != "pending")
        //                                    {
        //                                        io.ModifiedBy = currentUser.EmployeeId;
        //                                        io.ModifiedOn = DateTime.Now;
        //                                        io.OrderStatus = "cancel";
        //                                        io.BillingStatus = "cancel";

        //                                        dbContext.SaveChanges();

        //                                        var billReq = dbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == io.ImagingRequisitionId);
        //                                        if (billReq != null)
        //                                        {
        //                                            billReq.BillStatus = "cancel";

        //                                            dbContext.SaveChanges();
        //                                        }
        //                                    }
        //                                }
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                var mo = dbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (mo != null)
        //                                {
        //                                    if (mo.OrderStatus != "pending")
        //                                    {
        //                                        mo.ModifiedBy = currentUser.EmployeeId;
        //                                        mo.ModifiedOn = DateTime.Now;
        //                                        mo.OrderStatus = "cancel";

        //                                        dbContext.SaveChanges();
        //                                    }
        //                                }
        //                            }
        //                        }
        //                    }
        //                }
        //            }

        //            dbContextTransaction.Commit();
        //            responseData.Status = "OK";


        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}

        //else if (reqType == "putPrescriptionNote")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);
        //            PrescriptionNotesModel ClinicalPrescriptionNote = NotesMaster.ClinicalPrescriptionNote;
        //            SubjectiveNoteModel SubjectiveNote = NotesMaster.SubjectiveNote;
        //            var masterNote = dbContext.Notes.Where(i => i.NotesId == NotesMaster.NotesId).FirstOrDefault();

        //            if(masterNote != null)
        //            {
        //                masterNote.PerformerId = NotesMaster.PerformerId;
        //                masterNote.FollowUp = NotesMaster.FollowUp;
        //                masterNote.FollowUpUnit = NotesMaster.FollowUpUnit;
        //                masterNote.SecondaryDoctorId = NotesMaster.SecondaryDoctorId;
        //                masterNote.IsPending = NotesMaster.IsPending;
        //                masterNote.NoteTypeId = NotesMaster.NoteTypeId;
        //                masterNote.ModifiedBy = currentUser.EmployeeId;
        //                masterNote.ModifiedOn = System.DateTime.Now;
        //            }
        //            dbContext.SaveChanges();

        //            var prescription = dbContext.ClinicalPrescriptionNote.Where(n => n.PrescriptionNoteId == ClinicalPrescriptionNote.PrescriptionNoteId).FirstOrDefault();

        //            prescription.PrescriptionNoteText = NotesMaster.ClinicalPrescriptionNote.PrescriptionNoteText;
        //            prescription.OldMedicationStopped = NotesMaster.ClinicalPrescriptionNote.OldMedicationStopped;
        //            prescription.NewMedicationStarted = NotesMaster.ClinicalPrescriptionNote.NewMedicationStarted;
        //            prescription.ICDRemarks = NotesMaster.ClinicalPrescriptionNote.ICDRemarks;
        //            prescription.ICDSelected = NotesMaster.ClinicalPrescriptionNote.ICDSelected;
        //            prescription.OrdersSelected = NotesMaster.ClinicalPrescriptionNote.OrdersSelected;
        //            prescription.ModifiedBy = currentUser.EmployeeId;
        //            prescription.ModifiedOn = System.DateTime.Now;
        //            dbContext.SaveChanges();

        //            var subjective = dbContext.SubjectiveNotes.Where(n => n.SubjectiveNoteId == SubjectiveNote.SubjectiveNoteId).FirstOrDefault();

        //            subjective.ReviewOfSystems = SubjectiveNote.ReviewOfSystems;
        //            subjective.HistoryOfPresentingIllness = SubjectiveNote.HistoryOfPresentingIllness;
        //            subjective.ChiefComplaint = SubjectiveNote.ChiefComplaint;
        //            subjective.ModifiedBy = currentUser.EmployeeId;
        //            subjective.ModifiedOn = System.DateTime.Now;
        //            dbContext.SaveChanges();

        //            dbContextTransaction.Commit();
        //            responseData.Status = "OK";
        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}

        //else if (reqType == "putHistoryAndPhysicalNoteTemplate")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            NotesModel NotesMaster = JsonConvert.DeserializeObject<NotesModel>(str);

        //            dbContext.UpdateGraph(NotesMaster);
        //            dbContext.SaveChanges();

        //            SubjectiveNoteModel subjectiveNote = NotesMaster.SubjectiveNote;
        //            ObjectiveNoteModel objectiveNote = NotesMaster.ObjectiveNote;
        //            List<ClinicalDiagnosisModel> clinialDiagnosis = NotesMaster.AllIcdAndOrders;
        //            List<ClinicalDiagnosisModel> removedClinialDiagnosis = NotesMaster.RemovedIcdAndOrders;


        //            if (subjectiveNote != null)
        //            {
        //                subjectiveNote.ModifiedBy = currentUser.EmployeeId;
        //                subjectiveNote.ModifiedOn = DateTime.Now;

        //                var temp = dbContext.UpdateGraph(subjectiveNote);

        //                dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();

        //            }
        //            if (objectiveNote != null)
        //            {
        //                objectiveNote.ModifiedBy = currentUser.EmployeeId;
        //                objectiveNote.ModifiedOn = DateTime.Now;

        //                var temp = dbContext.UpdateGraph(objectiveNote);

        //                dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                dbContext.Entry(temp).Property(u => u.IsActive).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            // assessment orders edit logic
        //            if ((clinialDiagnosis != null && clinialDiagnosis.Count > 0) || (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0))
        //            {

        //                List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();

        //                var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                              join servDept in dbContext.ServiceDepartments
        //                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                              where servDept.IntegrationName == "LAB"
        //                                              select new
        //                                              {
        //                                                  ItemId = billItemPrice.ItemId,
        //                                                  ItemName = billItemPrice.ItemName,
        //                                                  Price = billItemPrice.Price,
        //                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                  DepartmentName = servDept.ServiceDepartmentName
        //                                              }).ToList();

        //                var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
        //                                              join servDept in dbContext.ServiceDepartments
        //                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
        //                                              where servDept.IntegrationName == "Radiology"
        //                                              select new
        //                                              {
        //                                                  ItemId = billItemPrice.ItemId,
        //                                                  ItemName = billItemPrice.ItemName,
        //                                                  Price = billItemPrice.Price,
        //                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
        //                                                  DepartmentName = servDept.ServiceDepartmentName
        //                                              }).ToList();

        //                BillItemRequisition RequisitionItem = new BillItemRequisition();

        //                if (clinialDiagnosis != null && clinialDiagnosis.Count > 0)
        //                {
        //                    // for updating existing diagnosis and add new one (handels newly added diagnosis and orders)
        //                    foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
        //                    {
        //                        var cd = dbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                        // create case - that means, previously (while post) diagnosis was empty
        //                        if (cd == null)
        //                        {
        //                            Diagnosis.CreatedOn = DateTime.Now;
        //                            Diagnosis.CreatedBy = currentUser.EmployeeId;
        //                            Diagnosis.NotesId = NotesMaster.NotesId;
        //                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                labReq.CreatedBy = currentUser.EmployeeId;
        //                                labReq.CreatedOn = DateTime.Now;
        //                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.LabRequisitions.Add(labReq);
        //                                dbContext.SaveChanges();

        //                                var itemDetail = (from labPrice in priceForLabRequisition
        //                                                  where labPrice.ItemId == labReq.LabTestId
        //                                                  select labPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                RequisitionItem.PatientId = labReq.PatientId;
        //                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                //allBillRequisition.Add(RequisitionItem);
        //                                dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                dbContext.SaveChanges();
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                imgnRequisition.CreatedOn = DateTime.Now;
        //                                imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                dbContext.SaveChanges();


        //                                var itemDetail = (from radPrice in priceForRadRequisition
        //                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                  select radPrice).FirstOrDefault();


        //                                RequisitionItem = new BillItemRequisition();
        //                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                RequisitionItem.ItemId = itemDetail.ItemId;
        //                                RequisitionItem.ItemName = itemDetail.ItemName;
        //                                RequisitionItem.Price = itemDetail.Price;
        //                                RequisitionItem.Quantity = 1;
        //                                RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                RequisitionItem.CreatedOn = DateTime.Now;

        //                                //allBillRequisition.Add(RequisitionItem);
        //                                dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                dbContext.SaveChanges();
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                phrmRequisition.CreatedOn = DateTime.Now;
        //                                phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                dbContext.SaveChanges();

        //                            }
        //                            //foreach (BillItemRequisition bill in allBillRequisition)
        //                            //{
        //                            //    dbContext.BillItemRequisitions.Add(bill);
        //                            //}
        //                            //dbContext.SaveChanges();

        //                        }
        //                        //  edit case - that means diagnosis with that Id exists (add or remove of orders in diagnosis)
        //                        else
        //                        {
        //                            Diagnosis.ModifiedBy = currentUser.EmployeeId;
        //                            Diagnosis.ModifiedOn = DateTime.Now;

        //                            var temp = dbContext.UpdateGraph(Diagnosis);

        //                            dbContext.Entry(temp).Property(u => u.CreatedBy).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.CreatedOn).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.PatientId).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.PatientVisitId).IsModified = false;
        //                            dbContext.Entry(temp).Property(u => u.NotesId).IsModified = false;
        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                var lo = dbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // add case - new lab order added
        //                                if (lo == null)
        //                                {
        //                                    labReq.CreatedBy = currentUser.EmployeeId;
        //                                    labReq.CreatedOn = DateTime.Now;
        //                                    labReq.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.LabRequisitions.Add(labReq);
        //                                    dbContext.SaveChanges();

        //                                    labReq.ModifiedBy = currentUser.EmployeeId;
        //                                    labReq.ModifiedOn = DateTime.Now;

        //                                    var itemDetail = (from labPrice in priceForLabRequisition
        //                                                      where labPrice.ItemId == labReq.LabTestId
        //                                                      select labPrice).FirstOrDefault();


        //                                    RequisitionItem = new BillItemRequisition();
        //                                    RequisitionItem.RequisitionId = labReq.RequisitionId;
        //                                    RequisitionItem.BillStatus = labReq.BillingStatus;
        //                                    RequisitionItem.PatientId = labReq.PatientId;
        //                                    RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
        //                                    RequisitionItem.ProviderId = labReq.PrescriberId.Value;
        //                                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                    RequisitionItem.ItemId = itemDetail.ItemId;
        //                                    RequisitionItem.ItemName = itemDetail.ItemName;
        //                                    RequisitionItem.Price = itemDetail.Price;
        //                                    RequisitionItem.Quantity = 1;
        //                                    RequisitionItem.ProcedureCode = labReq.ProcedureCode;
        //                                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                    RequisitionItem.CreatedOn = DateTime.Now;

        //                                    //allBillRequisition.Add(RequisitionItem);
        //                                    dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                    dbContext.SaveChanges();
        //                                }// else- remove or not changed orders                                                    

        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                var io = dbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // adding new imaging order
        //                                if (io == null)
        //                                {
        //                                    imgnRequisition.CreatedBy = currentUser.EmployeeId;
        //                                    imgnRequisition.CreatedOn = DateTime.Now;
        //                                    imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.ImagingRequisitions.Add(imgnRequisition);
        //                                    dbContext.SaveChanges();


        //                                    var itemDetail = (from radPrice in priceForRadRequisition
        //                                                      where radPrice.ItemId == imgnRequisition.ImagingItemId
        //                                                      select radPrice).FirstOrDefault();

        //                                    RequisitionItem = new BillItemRequisition();
        //                                    RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
        //                                    RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
        //                                    RequisitionItem.PatientId = imgnRequisition.PatientId;
        //                                    RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
        //                                    RequisitionItem.ProviderId = imgnRequisition.PrescriberId.Value;
        //                                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
        //                                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
        //                                    RequisitionItem.ItemId = itemDetail.ItemId;
        //                                    RequisitionItem.ItemName = itemDetail.ItemName;
        //                                    RequisitionItem.Price = itemDetail.Price;
        //                                    RequisitionItem.Quantity = 1;
        //                                    RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
        //                                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
        //                                    RequisitionItem.CreatedOn = DateTime.Now;

        //                                    //allBillRequisition.Add(RequisitionItem);
        //                                    dbContext.BillItemRequisitions.Add(RequisitionItem);
        //                                    dbContext.SaveChanges();

        //                                } // else - either order removed or not changed
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                var mo = dbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);
        //                                // adding new medication order
        //                                if (mo == null)
        //                                {
        //                                    phrmRequisition.CreatedBy = currentUser.EmployeeId;
        //                                    phrmRequisition.CreatedOn = DateTime.Now;
        //                                    phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
        //                                    dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
        //                                    dbContext.SaveChanges();
        //                                }
        //                            }
        //                        }
        //                    }
        //                }

        //                if (removedClinialDiagnosis != null && removedClinialDiagnosis.Count > 0)
        //                {
        //                    // for removed diagnosis
        //                    foreach (ClinicalDiagnosisModel Diagnosis in removedClinialDiagnosis)
        //                    {
        //                        var cd = dbContext.ClinicalDiagnosis.FirstOrDefault(fd => fd.NotesId == Diagnosis.NotesId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                        if (cd != null)
        //                        {
        //                            cd.ModifiedBy = currentUser.EmployeeId;
        //                            cd.ModifiedOn = DateTime.Now;
        //                            if (Diagnosis.IsActive == false)
        //                            {
        //                                cd.IsActive = false;
        //                            }

        //                            dbContext.SaveChanges();

        //                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
        //                            {
        //                                var lo = dbContext.LabRequisitions.FirstOrDefault(fd => fd.LabTestId == labReq.LabTestId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (lo != null)
        //                                {
        //                                    if (lo.OrderStatus != "pending")
        //                                    {
        //                                        lo.ModifiedBy = currentUser.EmployeeId;
        //                                        lo.ModifiedOn = DateTime.Now;
        //                                        lo.OrderStatus = "cancel";
        //                                        lo.BillingStatus = "cancel";

        //                                        dbContext.SaveChanges();

        //                                        var billReq = dbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == lo.RequisitionId);
        //                                        if (billReq != null)
        //                                        {
        //                                            billReq.BillStatus = "cancel";
        //                                            dbContext.SaveChanges();
        //                                        }
        //                                    }
        //                                }
        //                            }

        //                            foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
        //                            {
        //                                var io = dbContext.ImagingRequisitions.FirstOrDefault(fd => fd.ImagingItemId == imgnRequisition.ImagingItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (io != null)
        //                                {
        //                                    if (io.OrderStatus != "pending")
        //                                    {
        //                                        io.ModifiedBy = currentUser.EmployeeId;
        //                                        io.ModifiedOn = DateTime.Now;
        //                                        io.OrderStatus = "cancel";
        //                                        io.BillingStatus = "cancel";

        //                                        dbContext.SaveChanges();

        //                                        var billReq = dbContext.BillItemRequisitions.FirstOrDefault(fd => fd.RequisitionId == io.ImagingRequisitionId);
        //                                        if (billReq != null)
        //                                        {
        //                                            billReq.BillStatus = "cancel";

        //                                            dbContext.SaveChanges();
        //                                        }
        //                                    }
        //                                }
        //                            }

        //                            foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
        //                            {
        //                                var mo = dbContext.PHRMPrescriptionItems.FirstOrDefault(fd => fd.ItemId == phrmRequisition.ItemId && fd.DiagnosisId == Diagnosis.DiagnosisId);

        //                                if (mo != null)
        //                                {
        //                                    if (mo.OrderStatus != "pending")
        //                                    {
        //                                        mo.ModifiedBy = currentUser.EmployeeId;
        //                                        mo.ModifiedOn = DateTime.Now;
        //                                        mo.OrderStatus = "cancel";

        //                                        dbContext.SaveChanges();
        //                                    }
        //                                }
        //                            }
        //                        }
        //                    }
        //                }
        //            }


        //            dbContextTransaction.Commit();
        //            responseData.Status = "OK";


        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}

        //else if (reqType == "UpdateEyeMaster")
        //{
        //    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            EyeModel EyeMaster = JsonConvert.DeserializeObject<EyeModel>(str);


        //            foreach (RefractionModel refraction in EyeMaster.RefractionOD)
        //            {
        //                var tempRefraction = dbContext.UpdateGraph(refraction);
        //                dbContext.Entry(tempRefraction).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempRefraction).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (RefractionModel refraction in EyeMaster.RefractionOS)
        //            {
        //                var tempRefraction = dbContext.UpdateGraph(refraction);
        //                dbContext.Entry(tempRefraction).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempRefraction).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            OperationNotesModel OperationNotesOD = EyeMaster.OperationNotesOD;
        //            OperationNotesOD = dbContext.UpdateGraph(OperationNotesOD);
        //            dbContext.Entry(OperationNotesOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(OperationNotesOD).Property(u => u.CreatedOn).IsModified = false;
        //            OperationNotesModel OperationNotesOS = EyeMaster.OperationNotesOS;
        //            OperationNotesOS = dbContext.UpdateGraph(OperationNotesOS);
        //            dbContext.Entry(OperationNotesOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(OperationNotesOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            AblationProfileModel AblationOD = EyeMaster.AblationOD;
        //            AblationOD = dbContext.UpdateGraph(AblationOD);
        //            dbContext.Entry(AblationOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(AblationOD).Property(u => u.CreatedOn).IsModified = false;
        //            AblationProfileModel AblationOS = EyeMaster.AblationOS;
        //            AblationOS = dbContext.UpdateGraph(AblationOS);
        //            dbContext.Entry(AblationOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(AblationOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
        //            {
        //                var tempLaserData = dbContext.UpdateGraph(laserdata);
        //                dbContext.Entry(tempLaserData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempLaserData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (LaserDataEntryModel laserdata in EyeMaster.LaserDataOD)
        //            {
        //                var tempLaserData = dbContext.UpdateGraph(laserdata);
        //                dbContext.Entry(tempLaserData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempLaserData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            foreach (PreOPPachymetryModel preopdata in EyeMaster.PrePachymetryOD)
        //            {
        //                var tempData = dbContext.UpdateGraph(preopdata);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (PreOPPachymetryModel preopdata in EyeMaster.PrePachymetryOS)
        //            {
        //                var tempData = dbContext.UpdateGraph(preopdata);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            LASIKRSTModel LasikRSTOD = EyeMaster.LasikRSTOD;
        //            LasikRSTOD = dbContext.UpdateGraph(LasikRSTOD);
        //            dbContext.Entry(LasikRSTOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(LasikRSTOD).Property(u => u.CreatedOn).IsModified = false;
        //            LASIKRSTModel LasikRSTOS = EyeMaster.LasikRSTOS;
        //            LasikRSTOS = dbContext.UpdateGraph(LasikRSTOS);
        //            dbContext.Entry(LasikRSTOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(LasikRSTOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            SMILESSettingsModel SmileSettingOD = EyeMaster.SmileSettingOD;
        //            SmileSettingOD = dbContext.UpdateGraph(SmileSettingOD);
        //            dbContext.Entry(SmileSettingOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(SmileSettingOD).Property(u => u.CreatedOn).IsModified = false;
        //            SMILESSettingsModel SmileSettingOS = EyeMaster.SmileSettingOS;
        //            SmileSettingOS = dbContext.UpdateGraph(SmileSettingOS);
        //            dbContext.Entry(SmileSettingOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(SmileSettingOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            foreach (PachymetryModel loopData in EyeMaster.PachymetryOD)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (PachymetryModel loopData in EyeMaster.PachymetryOS)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            EyeVisuMaxsModel VisumaxOD = EyeMaster.VisumaxOD;
        //            VisumaxOD = dbContext.UpdateGraph(VisumaxOD);
        //            dbContext.Entry(VisumaxOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(VisumaxOD).Property(u => u.CreatedOn).IsModified = false;
        //            EyeVisuMaxsModel VisumaxOS = EyeMaster.VisumaxOS;
        //            VisumaxOS = dbContext.UpdateGraph(VisumaxOS);
        //            dbContext.Entry(VisumaxOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(VisumaxOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            foreach (WavefrontModel loopData in EyeMaster.WavefrontOD)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (WavefrontModel loopData in EyeMaster.WavefrontOS)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            foreach (ORAModel loopData in EyeMaster.ORAOD)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }
        //            foreach (ORAModel loopData in EyeMaster.ORAOS)
        //            {
        //                var tempData = dbContext.UpdateGraph(loopData);
        //                dbContext.Entry(tempData).Property(u => u.CreatedBy).IsModified = false;
        //                dbContext.Entry(tempData).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //            }

        //            SmileIncisionsModel SmileIncisionOD = EyeMaster.SmileIncisionOD;
        //            SmileIncisionOD = dbContext.UpdateGraph(SmileIncisionOD);
        //            dbContext.Entry(SmileIncisionOD).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(SmileIncisionOD).Property(u => u.CreatedOn).IsModified = false;
        //            SmileIncisionsModel SmileIncisionOS = EyeMaster.SmileIncisionOS;
        //            SmileIncisionOS = dbContext.UpdateGraph(SmileIncisionOS);
        //            dbContext.Entry(SmileIncisionOS).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(SmileIncisionOS).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();

        //            EyeMaster.ModifiedBy = currentUser.EmployeeId;
        //            EyeMaster.ModifiedOn = DateTime.Now;
        //            EyeMaster = dbContext.UpdateGraph(EyeMaster);
        //            dbContext.Entry(EyeMaster).Property(u => u.CreatedBy).IsModified = false;
        //            dbContext.Entry(EyeMaster).Property(u => u.CreatedOn).IsModified = false;
        //            dbContext.SaveChanges();
        //            responseData.Results = EyeMaster;
        //            responseData.Status = "OK";
        //            dbContextTransaction.Commit();
        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }


        //}
        //Not In used
        //             if (reqType == "postprescriptionnotes")
        //            {
        //                VitalsModel vitals = JsonConvert.DeserializeObject<VitalsModel>(str);
        //                //clientSurgicalHistory.ModifiedBy = currentUser.EmployeeId;
        //                //clientSurgicalHistory.ModifiedOn = DateTime.Now;
        //                vitals = dbContext.UpdateGraph(vitals);
        //                //dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedBy).IsModified = false;
        //                //dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedOn).IsModified = false;
        //                dbContext.SaveChanges();
        //                responseData.Results = vitals;
        //                responseData.Status = "OK";
        //            }
        //            else
        //            {
        //                responseData.Status = "Failed";
        //                responseData.ErrorMessage = "Vitals is empty";
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


        [HttpGet]
        [Route("DietTypes")]
        public IActionResult DietTypes()
        {
            Func<object> func = () => _clinicalDbContext.DietType.Where(d => d.IsActive == true).ToList();
            return InvokeHttpPutFunction(func);
        }


        [HttpGet]
        [Route("InpatientListWithDietDetail")]
        public IActionResult InpatientListWithDietDetail(int WardId)
        {
            var IplistwithDiet = from adm in _clinicalDbContext.Admission
                                 join visit in
                                     (from PBI in _clinicalDbContext.PatientBedInfos
                                      group PBI by PBI.PatientId into g
                                      select new
                                      {
                                          PatientId = g.Key,
                                          LatestPatientBedInfoId = g.Max(p => p.PatientBedInfoId),
                                          LatestPatientVisitId = g.Max(p => p.PatientVisitId)
                                      }) on adm.PatientVisitId equals visit.LatestPatientVisitId
                                 join pat in _clinicalDbContext.Patients on adm.PatientId equals pat.PatientId
                                 join schemeMap in _clinicalDbContext.PatientMapScheme on pat.PatientId equals schemeMap.PatientId
                                 join scheme in _clinicalDbContext.Scheme on schemeMap.SchemeId equals scheme.SchemeId
                                 join PBI in _clinicalDbContext.PatientBedInfos on new { Id = visit.LatestPatientBedInfoId, VisitId = visit.LatestPatientVisitId } equals new { Id = PBI.PatientBedInfoId, VisitId = PBI.PatientVisitId }
                                 join bed in _clinicalDbContext.Beds on PBI.BedId equals bed.BedId
                                 join ward in _clinicalDbContext.Wards on PBI.WardId equals ward.WardId
                                 join patDiet in (from d in _clinicalDbContext.PatientDiet
                                                  group d by d.PatientId into dietGrp
                                                  select new
                                                  {
                                                      PatientId = dietGrp.Key,
                                                      LatestPatientVisitId = dietGrp.Max(v => v.PatientVisitId),
                                                      latestDietTypeId = dietGrp.OrderByDescending(d => d.PatientDietId).FirstOrDefault().DietTypeId,
                                                      latestExtraDiet = dietGrp.OrderByDescending(e => e.PatientDietId).FirstOrDefault().ExtraDiet,
                                                      latestRemarks = dietGrp.OrderByDescending(r => r.PatientDietId).FirstOrDefault().Remarks,
                                                      latestModifiedOn = dietGrp.OrderByDescending(m => m.PatientDietId).FirstOrDefault().ModifiedOn,
                                                      latestCreatedOn = dietGrp.OrderByDescending(m => m.PatientDietId).FirstOrDefault().CreatedOn

                                                  }) on new { LatestPatientVisitId = visit.LatestPatientVisitId, PatientId = visit.PatientId } equals new { patDiet.LatestPatientVisitId, patDiet.PatientId } into dietJoin
                                 from patDiet in dietJoin.DefaultIfEmpty()
                                 join dietType in _clinicalDbContext.DietType on patDiet.latestDietTypeId equals dietType.DietTypeId into dietTypeJoin
                                 from dietType in dietTypeJoin.DefaultIfEmpty()
                                 where adm.AdmissionStatus == "admitted" && ward.WardId == WardId
                                 orderby adm.AdmissionDate descending
                                 select new
                                 {
                                     pat.Address,
                                     pat.PatientCode,
                                     // pat.Rank,
                                     pat.ShortName,
                                     AgeSex = pat.Age + "/" + pat.Gender,
                                     adm.AdmissionDate,
                                     bed.BedNumber,
                                     DietTypeName = dietType.DietTypeName,
                                     ExtraDiet = patDiet.latestExtraDiet,
                                     Remarks = patDiet.latestRemarks,
                                     ModifiedOn = (DateTime?)patDiet.latestModifiedOn,
                                     CreatedOn = (DateTime?)patDiet.latestCreatedOn,
                                     ward.WardName,
                                     ward.WardId,
                                     adm.PatientId,
                                     adm.PatientVisitId,
                                     scheme.SchemeName
                                 };

            Func<object> func = () => IplistwithDiet.ToList();
            return InvokeHttpPutFunction(func);
        }
        [HttpGet]
        [Route("PatientDietHistory")]
        public IActionResult PatientDietHistory(int PatientVisitId)
        {


            Func<object> func = () => (from patDiet in _clinicalDbContext.PatientDiet
                                       join pd in _clinicalDbContext.DietType on patDiet.DietTypeId equals pd.DietTypeId
                                       join emp in _clinicalDbContext.Employee on patDiet.CreatedBy equals emp.EmployeeId
                                       where patDiet.PatientVisitId == PatientVisitId
                                       select new
                                       {
                                           patDiet.PatientDietId,
                                           patDiet.PatientId,
                                           patDiet.CreatedOn,
                                           patDiet.PatientVisitId,
                                           patDiet.DietTypeId,
                                           patDiet.ExtraDiet,
                                           patDiet.Remarks,
                                           emp.FullName,
                                           pd.DietTypeName
                                       }).ToList();
            return InvokeHttpPutFunction(func);
        }
        [HttpPost]
        [Route("AddPatientDietType")]
        public IActionResult AddPatientDietType([FromBody] PatientDietDTO diet)
        {
            PatientDietModel newDiet = new PatientDietModel();
            newDiet.PatientId = diet.PatientId;
            newDiet.PatientVisitId = diet.PatientVisitId;
            newDiet.DietTypeId = diet.DietTypeId;
            newDiet.ExtraDiet = diet.ExtraDiet;
            newDiet.WardId = diet.WardId;
            newDiet.RecordedOn = diet.RecordedOn;
            newDiet.Remarks = diet.Remarks;
            newDiet.CreatedBy = diet.CreatedBy;
            newDiet.CreatedOn = diet.CreatedOn;
            newDiet.IsActive = diet.IsActive;

            _clinicalDbContext.PatientDiet.Add(newDiet);
            _clinicalDbContext.SaveChanges();
            Func<object> func = () => newDiet;
            return InvokeHttpPutFunction(func);
        }
    }
}



