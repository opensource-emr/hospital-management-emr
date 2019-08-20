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
// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Clinical
{

    public class ClinicalController : CommonController
    {


        public ClinicalController(IOptions<MyConfiguration> _config) : base(_config)
        {

        }
        [HttpGet]
        public string Get(string reqType, int patientId, int patientVisitId, int notesId,int providerId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            ClinicalDbContext dbContext = new ClinicalDbContext(connString);
            try
            {
                if (reqType == "vitals" && patientVisitId != 0)
                {
                    List<VitalsModel> vitalsList = dbContext.Vitals
                                                .Where(p => p.PatientVisitId == patientVisitId).ToList();
                    responseData.Results = vitalsList;
                    responseData.Status = "OK";
                }
                else if (reqType == "ProviderLongSignature" && providerId != 0)
                {
                    List<EmployeeModel> signatureList = dbContext.Employee
                                                .Where(p => p.EmployeeId == providerId).ToList();
                    responseData.Results = signatureList;
                    responseData.Status = "OK";
                }


                else if (reqType == "inputoutput" && patientVisitId != 0)
                {
                    List<InputOutputModel> ioList = dbContext.InputOutput
                                                    .Where(p => p.PatientVisitId == patientVisitId).ToList();
                    responseData.Results = ioList;
                    responseData.Status = "OK";
                }
                else if (reqType == "allergy" && patientId != 0)
                {
                    List<AllergyModel> allergyList = dbContext.Allergy
                                                .Where(p => p.PatientId == patientId).OrderByDescending(alrg => alrg.CreatedOn).ToList();

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

                    responseData.Results = allergyList;
                    responseData.Status = "OK";
                }
                else if (reqType == "homemedication" && patientId != 0)
                {
                    List<HomeMedicationModel> homeMedicationList = dbContext.HomeMedications
                                                .Where(p => p.PatientId == patientId).ToList();
                    //assigning the MedicaitonName
                    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
                    List<PHRMItemMasterModel> medicationList = phrmDbContext.PHRMItemMaster.ToList();

                    foreach (var homeMed in homeMedicationList)
                    {
                        if (homeMed.MedicationId != 0)
                        {
                            homeMed.MedicationName = medicationList
                                                      .Where(a => a.ItemId == homeMed.MedicationId).FirstOrDefault().ItemName;
                        }
                    }
                    responseData.Results = homeMedicationList;
                    responseData.Status = "OK";
                }
                else if (reqType == "medicationprescription" && patientId != 0)
                {
                    List<MedicationPrescriptionModel> prescriptionList = dbContext.MedicationPrescriptions
                                                .Where(p => p.PatientId == patientId).ToList();

                    //assinging MedicationName and EmployeeName
                    MasterDbContext masterDbContext = new MasterDbContext(connString);
                    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

                    List<PHRMItemMasterModel> medicationList = phrmDbContext.PHRMItemMaster.ToList();
                    List<EmployeeModel> employeeList = masterDbContext.Employees.ToList();
                    foreach (var pres in prescriptionList)
                    {
                        if (pres.MedicationId != 0)
                        {
                            pres.MedicationName = medicationList
                                                        .Where(a => a.ItemId == pres.MedicationId).FirstOrDefault().ItemName;
                        }
                        if (pres.ProviderId != 0)
                        {
                            pres.ProviderName = employeeList
                           .Where(e => e.EmployeeId == pres.ProviderId)
                           .Select(e => e.FullName).FirstOrDefault();
                        }
                    }
                    responseData.Results = prescriptionList;
                    responseData.Status = "OK";
                }

                else if (reqType == "activemedical" && patientId != 0)
                {

                    List<ActiveMedicalProblem> activeProblemList = dbContext.ActiveMedical
                                                    .Where(p => p.PatientId == patientId
                                                    && p.IsResolved == false).ToList();
                    responseData.Results = activeProblemList;
                    responseData.Status = "OK";
                }

                else if (reqType == "pastmedical" && patientId != 0)
                {
                    List<PastMedicalProblem> pastProblemList = dbContext.PastMedicals
                                                .Where(p => p.PatientId == patientId).ToList();
                    responseData.Results = pastProblemList;
                    responseData.Status = "OK";
                }
                else if (reqType == "familyhistory" && patientId != 0)
                {
                    List<FamilyHistory> familyHistoryList = dbContext.FamilyHistory
                                                  .Where(p => p.PatientId == patientId).ToList();
                    responseData.Results = familyHistoryList;
                    responseData.Status = "OK";
                }
                else if (reqType == "surgicalhistory" && patientId != 0)
                {
                    List<SurgicalHistory> surgicalHistoryList = dbContext.SurgicalHistory
                                                .Where(p => p.PatientId == patientId).ToList();
                    responseData.Results = surgicalHistoryList;
                    responseData.Status = "OK";
                }
                else if (reqType == "socialhistory" && patientId != 0)
                {
                    List<SocialHistory> socialHistoryList = dbContext.SocialHistory
                                                .Where(p => p.PatientId == patientId).ToList();
                    responseData.Results = socialHistoryList;
                    responseData.Status = "OK";
                }
                else if (reqType == "notes" && patientVisitId != 0 && patientId != 0)
                {

                    PatientModel patientModel = new PatientModel();
                    PatientDbContext dbContextcommand = new PatientDbContext(connString);
                    patientModel = (from pat in dbContextcommand.Patients
                                    where pat.PatientId == patientId
                                    select pat).Include(a => a.Visits.Select(v => v.Vitals))
                                    .Include(a => a.Visits.Select(v => v.Notes))
                                     .Include(a => a.Problems)
                                     .Include(a => a.PastMedicals)
                                     .Include(a => a.Allergies)
                                     .Include(a => a.HomeMedication)
                                     .Include(a => a.SocialHistory)
                                     .FirstOrDefault<PatientModel>();

                    //needs review was not able to inputoutput.
                    //thorws exception invalid column PatientModel_PatientId.

                    //add vitals,notes and inputoutputs to patient
                    if (patientModel != null && patientModel.Visits != null && patientModel.Visits.Count > 0)
                    {
                        patientModel.Vitals = patientModel.Visits.SelectMany(a => a.Vitals).ToList();
                        //take last three vitals only.. 
                        if (patientModel.Vitals.Count != 0 && patientModel.Vitals != null)
                        {
                            patientModel.Vitals = patientModel.Vitals
                                                      .Where(a => a.PatientVisitId == patientVisitId)
                                                      .OrderByDescending(a => a.CreatedOn).Take(3).ToList();
                        }
                        if (patientModel.Notes != null && patientModel.Vitals.Count != 0)
                        {
                            patientModel.Notes = patientModel.Notes
                                                  .Where(a => a.PatientVisitId == patientVisitId)
                                                  .OrderByDescending(a => a.CreatedOn).ToList();
                        }


                    }
                    //remove resolved problems
                    if (patientModel != null && patientModel.Problems != null && patientModel.Problems.Count > 0)
                    {
                        patientModel.Problems = patientModel.Problems.Where(p => p.IsResolved == false).ToList();
                    }

                    PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

                    List<PHRMItemMasterModel> medList = phrmDbContext.PHRMItemMaster.ToList();
                    //add medicationname to medications
                    if (patientModel != null && patientModel.HomeMedication != null && patientModel.HomeMedication.Count > 0)
                    {
                        foreach (var med in patientModel.HomeMedication)
                        {
                            if (med.MedicationId != 0)
                            {
                                med.MedicationName = medList.Where(a => a.ItemId == med.MedicationId)
                                                     .FirstOrDefault().ItemName;
                            }
                        }
                    }
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
                    responseData.Status = "OK";
                    responseData.Results = patientModel;
                }
                else if (reqType == "patient-clinicaldetail")
                {
                    PatientClinicalDetailVM clinicalDetail = new PatientClinicalDetailVM();
                    clinicalDetail.PatientId = patientId;
                    clinicalDetail.PatientVisitId = patientVisitId;
                    clinicalDetail.NotesId = 0;
                    clinicalDetail.PastMedicals = (from pastMedical in dbContext.PastMedicals
                                                   where pastMedical.PatientId == clinicalDetail.PatientId
                                                   select pastMedical).OrderByDescending(a => a.CreatedOn).ToList();

                    clinicalDetail.SocialHistory = (from socialHistory in dbContext.SocialHistory
                                                    where socialHistory.PatientId == clinicalDetail.PatientId
                                                    select socialHistory).OrderByDescending(a => a.CreatedOn).ToList();


                    clinicalDetail.SurgicalHistory = (from surgicalHistory in dbContext.SurgicalHistory
                                                      where surgicalHistory.PatientId == clinicalDetail.PatientId
                                                      select surgicalHistory).OrderByDescending(a => a.CreatedOn).ToList();


                    clinicalDetail.FamilyHistory = (from familyHistory in dbContext.FamilyHistory
                                                    where familyHistory.PatientId == clinicalDetail.PatientId
                                                    select familyHistory).OrderByDescending(a => a.CreatedOn).ToList();

                    clinicalDetail.Allergies = (from allergy in dbContext.Allergy
                                                where allergy.PatientId == clinicalDetail.PatientId
                                                select allergy).OrderByDescending(a => a.CreatedOn).ToList();

                    clinicalDetail.Vitals = (from vital in dbContext.Vitals
                                             where vital.PatientVisitId == clinicalDetail.PatientVisitId
                                             select vital).OrderByDescending(a => a.CreatedOn).ToList();

                    responseData.Results = clinicalDetail;
                    responseData.Status = "OK";

                }
                //list view
                else if (reqType == "patient-clinical-notes")
                {
                    var notes = (from note in dbContext.Notes
                                 where note.PatientId == patientId
                                 select new
                                 {
                                     note.PatientId,
                                     note.PatientVisitId,
                                     note.NotesId,
                                     note.NoteType,
                                     note.CreatedOn
                                 }).ToList().OrderByDescending(a => a.NotesId);
                    responseData.Results = notes;
                    responseData.Status = "OK";
                }
                //edit case
                else if (reqType == "opd-general")
                {

                    List<ClinicalDiagnosisModel> allDiagnosis = (from note in dbContext.Notes
                                                                 join diagnosis in dbContext.ClinicalDiagnosis on note.NotesId equals diagnosis.NotesId
                                                                 where note.NotesId == notesId
                                                                 select diagnosis
                                   ).ToList();

                    foreach (var diag in allDiagnosis)
                    {
                        diag.AllIcdLabOrders = (from labReq in dbContext.LabRequisitions
                                                where labReq.DiagnosisId == diag.DiagnosisId
                                                select labReq).ToList();
                        diag.AllIcdImagingOrders = (from imgReq in dbContext.ImagingRequisitions
                                                    where imgReq.DiagnosisId == diag.DiagnosisId
                                                    select imgReq).ToList();
                        diag.AllIcdPrescriptionOrders = (from phrmReq in dbContext.PHRMPrescriptionItems
                                                         where phrmReq.DiagnosisId == diag.DiagnosisId
                                                         select phrmReq).ToList();
                    }

                    //var allRadTest = (from note in dbContext.Notes
                    //                  join diagnosis in dbContext.ClinicalDiagnosis on note.NotesId equals diagnosis.NotesId
                    //                  join imaging in dbContext.ImagingRequisitions on diagnosis.DiagnosisId equals imaging.DiagnosisId
                    //                  select imaging
                    //                           ).ToList();


                    //var diagnosis = (from note in dbContext.Notes
                    //                 join diag in dbContext.ClinicalDiagnosis on note.NotesId equals diag.NotesId
                    //                 where 
                    //                 )
                    var notes = (from note in dbContext.Notes
                                 join sub in dbContext.SubjectiveNotes on note.NotesId equals sub.NotesId into subjectiveTemp
                                 from subjective in subjectiveTemp.DefaultIfEmpty()
                                 join obj in dbContext.ObjectiveNotes on note.NotesId equals obj.NotesId into objectiveTemp
                                 from objective in objectiveTemp.DefaultIfEmpty()
                                 join doctor in dbContext.Employee on note.ProviderId equals doctor.EmployeeId
                                 join visit in dbContext.Visit on note.PatientVisitId equals visit.PatientVisitId
                                 where note.NotesId == notesId
                                 select new
                                 {
                                     note.NotesId,
                                     note.NoteType,
                                     note.PatientId,
                                     note.PatientVisitId,
                                     note.ProviderId,
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
                    notesData.NoteType = notes.NoteType;
                    notesData.PatientId = notes.PatientId;
                    notesData.PatientVisitId = notes.PatientVisitId;
                    notesData.ProviderId = notes.ProviderId;
                    notesData.CreatedOn = notes.CreatedOn;
                    notesData.FollowUp = notes.FollowUp;
                    notesData.Remarks = notes.Remarks;
                    notesData.VisitCode = notes.VisitCode;
                    notesData.VisitDate = notes.VisitDate;
                    notesData.ReferredBy = notes.ReferredBy;


                    responseData.Results = notesData;
                    responseData.Status = "OK";
                }
                else if(reqType == "GetUploadedScannedImages")
                {
                    var result = dbContext.PatientImages.Where(a => a.IsActive == true && a.PatientId == patientId);
                    responseData.Results = result;
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "Failed";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            try
            {
                ClinicalDbContext dbContext = new ClinicalDbContext(connString);

                
                string reqType = this.ReadQueryStringData("reqType");
                int patientId = ToInt(this.ReadQueryStringData("patientId"));
                //JArray json = JArray.Parse(str);

                //Vitals
                if (reqType == "vitals")
                {
                    string str = this.ReadPostData();
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


                    dbContext.Vitals.Add(vitals);
                    dbContext.SaveChanges();
                    responseData.Results = vitals;
                    responseData.Status = "OK";
                }

                //InputOutput
                else if (reqType == "inputoutput")
                {
                    string str = this.ReadPostData();
                    InputOutputModel inputoutput = JsonConvert.DeserializeObject<InputOutputModel>(str);
                    inputoutput.CreatedBy = currentUser.EmployeeId;
                    inputoutput.CreatedOn = DateTime.Now;

                    dbContext.InputOutput.Add(inputoutput);
                    dbContext.SaveChanges();

                    //InputOutputModel returnInputOutput = new InputOutputModel();
                    //returnInputOutput.CreatedOn = inputoutput.CreatedOn;
                    //returnInputOutput.InputOutputId = inputoutput.InputOutputId;

                    responseData.Results = inputoutput;
                    responseData.Status = "OK";

                }

                //Allergy
                else if (reqType == "allergy")
                {
                    string str = this.ReadPostData();
                    AllergyModel allergy = JsonConvert.DeserializeObject<AllergyModel>(str);
                    allergy.CreatedBy = currentUser.EmployeeId;
                    allergy.CreatedOn = DateTime.Now;

                    dbContext.Allergy.Add(allergy);
                    dbContext.SaveChanges();

                    //AllergyModel returnAllergy = new AllergyModel();
                    //returnAllergy.CreatedOn = allergy.CreatedOn;
                    //returnAllergy.PatientAllergyId = allergy.PatientAllergyId;

                    ////assigning AllergenAdvRecName 
                    //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
                    //if (allergy.AllergenAdvRecId != 0 && allergy.AllergenAdvRecId != null) {
                    //    allergy.AllergenAdvRecName = phrmDbContext.PHRMGenericModel
                    //            .Where(a => a.GenericId == allergy.AllergenAdvRecId).FirstOrDefault().GenericName;
                    //}
                    ////sud: 15June (we'll show Others in the same format as Medication allergies)
                    //else if (allergy.AllergyType == "Others")
                    //{
                    //    allergy.AllergenAdvRecName = allergy.Others;
                    //}

                    responseData.Results = allergy;
                    responseData.Status = "OK";
                }

                //HomeMedication
                else if (reqType == "homemedication")
                {
                    string str = this.ReadPostData();
                    HomeMedicationModel homemedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
                    homemedication.CreatedBy = currentUser.EmployeeId;
                    homemedication.CreatedOn = DateTime.Now;
                    dbContext.HomeMedications.Add(homemedication);
                    dbContext.SaveChanges();


                    responseData.Results = homemedication;
                    responseData.Status = "OK";
                }

                //MedicationPrescription
                else if (reqType == "medicationprescription")
                {
                    string str = this.ReadPostData();
                    List<MedicationPrescriptionModel> medications = JsonConvert.DeserializeObject<List<MedicationPrescriptionModel>>(str);
                    medications.ForEach(req =>
                    {
                        req.CreatedBy = currentUser.EmployeeId;
                        req.CreatedOn = DateTime.Now;
                        dbContext.MedicationPrescriptions.Add(req);
                    });

                    dbContext.SaveChanges();

                    //we dont need this but once i have to discuss with sudarshan sir<27/04/2017> ..........important!!!! to discusss
                    //medications.ForEach(medication =>
                    //{
                    //   List< MedicationPrescriptionModel>returnMedication = new List<MedicationPrescriptionModel>();
                    //returnMedication.MedicationPrescriptionId = medication.MedicationPrescriptionId;
                    //returnMedication.Date = medication.Date;
                    //MasterDbContext masterDbContext = new MasterDbContext(connString);
                    //if (medication.MedicationId != 0)
                    //{
                    //    //assinging MedicationName
                    //    returnMedication.MedicationName = masterDbContext.Medicines
                    //            .Where(m => m.MedicineId == medication.MedicationId).FirstOrDefault().MedicineName;
                    //}
                    //if (medication.ProviderId != 0)
                    //{
                    //    //assigning ProviderName
                    //    returnMedication.ProviderName = masterDbContext.Employee
                    //   .Where(e => e.EmployeeId == medication.ProviderId)
                    //   .Select(e => e).FirstOrDefault().FullName;
                    //}
                    //});
                    //responseData.Results = returnMedication;
                    responseData.Status = "OK";
                }

                //ActiveMedical
                else if (reqType == "activemedical")
                {
                    string str = this.ReadPostData();
                    ActiveMedicalProblem activeMedical = JsonConvert.DeserializeObject<ActiveMedicalProblem>(str);


                    if (activeMedical.ResolvedDate != null) // contains resolved date only when added from past medical
                        activeMedical.ResolvedDate = null; // making it as null

                    activeMedical.CreatedBy = currentUser.EmployeeId;
                    activeMedical.CreatedOn = DateTime.Now;
                    activeMedical.OnSetDate = activeMedical.CreatedOn;

                    dbContext.ActiveMedical.Add(activeMedical);
                    dbContext.SaveChanges();

                    ActiveMedicalProblem returnActiveMedical = new ActiveMedicalProblem();
                    returnActiveMedical.CreatedOn = activeMedical.CreatedOn;
                    returnActiveMedical.PatientProblemId = activeMedical.PatientProblemId;

                    responseData.Results = returnActiveMedical;
                    responseData.Status = "OK";
                }

                //PastMedical
                else if (reqType == "pastmedical")
                {
                    string str = this.ReadPostData();
                    PastMedicalProblem pastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
                    pastMedical.CreatedBy = currentUser.EmployeeId;
                    pastMedical.CreatedOn = DateTime.Now;
                    dbContext.PastMedicals.Add(pastMedical);
                    dbContext.SaveChanges();

                    PastMedicalProblem returnPastMedical = new PastMedicalProblem();
                    returnPastMedical.CreatedOn = pastMedical.CreatedOn;
                    returnPastMedical.PatientProblemId = pastMedical.PatientProblemId;

                    responseData.Results = returnPastMedical;
                    responseData.Status = "OK";
                }

                //FamilyHistory
                else if (reqType == "familyhistory")
                {
                    string str = this.ReadPostData();
                    FamilyHistory familyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
                    familyHistory.CreatedBy = currentUser.EmployeeId;
                    familyHistory.CreatedOn = DateTime.Now;
                    dbContext.FamilyHistory.Add(familyHistory);
                    dbContext.SaveChanges();

                    FamilyHistory returnFamilyHistory = new FamilyHistory();
                    returnFamilyHistory.CreatedOn = familyHistory.CreatedOn;
                    returnFamilyHistory.FamilyProblemId = familyHistory.FamilyProblemId;

                    responseData.Results = returnFamilyHistory;
                    responseData.Status = "OK";
                }

                //SurgicalHistory
                else if (reqType == "surgicalhistory")
                {
                    string str = this.ReadPostData();
                    SurgicalHistory surgicalHistory = null;
                    surgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);

                    surgicalHistory.CreatedBy = currentUser.EmployeeId;
                    surgicalHistory.CreatedOn = DateTime.Now;

                    dbContext.SurgicalHistory.Add(surgicalHistory);
                    dbContext.SaveChanges();

                    SurgicalHistory returnSurgicalHistory = new SurgicalHistory();
                    returnSurgicalHistory.CreatedOn = surgicalHistory.CreatedOn;
                    returnSurgicalHistory.SurgicalHistoryId = surgicalHistory.SurgicalHistoryId;

                    responseData.Results = returnSurgicalHistory;
                    responseData.Status = "OK";
                }

                //SocialHistory
                else if (reqType == "socialhistory")
                {
                    string str = this.ReadPostData();
                    SocialHistory socialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);

                    socialHistory.CreatedBy = currentUser.EmployeeId;
                    socialHistory.CreatedOn = DateTime.Now;

                    dbContext.SocialHistory.Add(socialHistory);
                    dbContext.SaveChanges();

                    SocialHistory returnSocialHistory = new SocialHistory();
                    returnSocialHistory.CreatedOn = socialHistory.CreatedOn;
                    returnSocialHistory.SocialHistoryId = socialHistory.SocialHistoryId;

                    responseData.Results = returnSocialHistory;
                    responseData.Status = "OK";
                }
                //Notes
                else if (reqType == "notes")
                {
                    string str = this.ReadPostData();
                    NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

                    List<NotesModel> existingNotes = dbContext.Notes
                        .Where(n => n.PatientVisitId == notes.PatientVisitId).ToList();
                    if (existingNotes.Count > 0)
                        notes.NoteType = "Progress Note";
                    else
                        notes.NoteType = "History and Physical Note";
                    notes.CreatedBy = currentUser.EmployeeId;
                    notes.CreatedOn = DateTime.Now;

                    dbContext.Notes.Add(notes);
                    dbContext.SaveChanges();

                    responseData.Results = notes;
                    responseData.Status = "OK";
                }
                else if (reqType == "subjective-notes")
                {
                    string str = this.ReadPostData();
                    SubjectiveNoteModel subjectiveNote = JsonConvert.DeserializeObject<SubjectiveNoteModel>(str);
                    subjectiveNote.CreatedBy = currentUser.EmployeeId;
                    subjectiveNote.CreatedOn = DateTime.Now;
                    dbContext.SubjectiveNotes.Add(subjectiveNote);
                    dbContext.SaveChanges();

                    responseData.Results = subjectiveNote;
                    responseData.Status = "OK";
                }

                else if (reqType == "opd-general-note")
                {
                    string str = this.ReadPostData();
                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
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
                            dbContext.Notes.Add(notes);
                            dbContext.SaveChanges();

                            //add subjective note
                            if (subjectiveNote != null)
                            {
                                subjectiveNote.CreatedBy = currentUser.EmployeeId;
                                subjectiveNote.CreatedOn = notes.CreatedOn;
                                subjectiveNote.NotesId = notes.NotesId;
                                dbContext.SubjectiveNotes.Add(subjectiveNote);
                                dbContext.SaveChanges();
                            }

                            if (objectiveNote != null)
                            {
                                //add Objective Note  
                                objectiveNote.CreatedBy = currentUser.EmployeeId;
                                objectiveNote.CreatedOn = DateTime.Now;
                                objectiveNote.NotesId = notes.NotesId;
                                dbContext.ObjectiveNotes.Add(objectiveNote);
                                dbContext.SaveChanges();
                            }
                            if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
                            {

                                List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                                var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
                                                              join servDept in dbContext.ServiceDepartments
                                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                              where servDept.IntegrationName == "LAB"
                                                              select new
                                                              {
                                                                  ItemId = billItemPrice.ItemId,
                                                                  ItemName = billItemPrice.ItemName,
                                                                  Price = billItemPrice.Price,
                                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                                  DepartmentName = servDept.ServiceDepartmentName
                                                              }).ToList();

                                var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
                                                              join servDept in dbContext.ServiceDepartments
                                                              on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                              where servDept.IntegrationName == "Radiology"
                                                              select new
                                                              {
                                                                  ItemId = billItemPrice.ItemId,
                                                                  ItemName = billItemPrice.ItemName,
                                                                  Price = billItemPrice.Price,
                                                                  ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                                  DepartmentName = servDept.ServiceDepartmentName
                                                              }).ToList();


                                BillItemRequisition RequisitionItem = new BillItemRequisition();

                                foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                                {
                                    Diagnosis.CreatedOn = DateTime.Now;
                                    Diagnosis.CreatedBy = currentUser.EmployeeId;
                                    Diagnosis.NotesId = notes.NotesId;
                                    dbContext.ClinicalDiagnosis.Add(Diagnosis);
                                    dbContext.SaveChanges();



                                    foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                    {
                                        labReq.CreatedBy = currentUser.EmployeeId;
                                        labReq.CreatedOn = DateTime.Now;
                                        labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                        dbContext.LabRequisitions.Add(labReq);
                                        dbContext.SaveChanges();

                                        var itemDetail = (from labPrice in priceForLabRequisition
                                                          where labPrice.ItemId == labReq.LabTestId
                                                          select labPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = labReq.RequisitionId;
                                        RequisitionItem.BillStatus = labReq.BillingStatus;
                                        RequisitionItem.PatientId = labReq.PatientId;
                                        RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
                                        RequisitionItem.ProviderId = labReq.ProviderId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = itemDetail.Price;
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
                                        dbContext.ImagingRequisitions.Add(imgnRequisition);
                                        dbContext.SaveChanges();

                                        var itemDetail = (from radPrice in priceForRadRequisition
                                                          where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                          select radPrice).FirstOrDefault();


                                        RequisitionItem = new BillItemRequisition();
                                        RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                        RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                        RequisitionItem.PatientId = imgnRequisition.PatientId;
                                        RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                        RequisitionItem.ProviderId = imgnRequisition.ProviderId.Value;
                                        RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                        RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                        RequisitionItem.ItemId = itemDetail.ItemId;
                                        RequisitionItem.ItemName = itemDetail.ItemName;
                                        RequisitionItem.Price = itemDetail.Price;
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
                                        dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                        dbContext.SaveChanges();
                                    }

                                }
                                foreach (BillItemRequisition bill in allBillRequisition)
                                {
                                    dbContext.BillItemRequisitions.Add(bill);
                                }

                                dbContext.SaveChanges();

                            }
                            responseData.Status = "OK";
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
                //else if (reqType == "clinical-diagnosis")
                //{


                //    using (var orderRequisitionTransaction = dbContext.Database.BeginTransaction())
                //    {
                //        try
                //        {
                //            List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                //            var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
                //                                          join servDept in dbContext.ServiceDepartments
                //                                          on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                //                                          where servDept.IntegrationName == "LAB"
                //                                          select new
                //                                          {
                //                                              ItemId = billItemPrice.ItemId,
                //                                              ItemName = billItemPrice.ItemName,
                //                                              Price = billItemPrice.Price,
                //                                              ServiceDepartmentId = servDept.ServiceDepartmentId,
                //                                              DepartmentName = servDept.ServiceDepartmentName
                //                                          }).ToList();

                //            var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
                //                                          join servDept in dbContext.ServiceDepartments
                //                                          on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                //                                          where servDept.IntegrationName == "Radiology"
                //                                          select new
                //                                          {
                //                                              ItemId = billItemPrice.ItemId,
                //                                              ItemName = billItemPrice.ItemName,
                //                                              Price = billItemPrice.Price,
                //                                              ServiceDepartmentId = servDept.ServiceDepartmentId,
                //                                              DepartmentName = servDept.ServiceDepartmentName
                //                                          }).ToList();


                //            BillItemRequisition RequisitionItem = new BillItemRequisition();

                //            foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                //            {
                //                Diagnosis.CreatedOn = DateTime.Now;
                //                Diagnosis.CreatedBy = currentUser.EmployeeId;
                //                dbContext.ClinicalDiagnosis.Add(Diagnosis);
                //                dbContext.SaveChanges();



                //                foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                //                {
                //                    labReq.CreatedBy = currentUser.EmployeeId;
                //                    labReq.CreatedOn = DateTime.Now;
                //                    labReq.DiagnosisId = Diagnosis.DiagnosisId;
                //                    dbContext.LabRequisitions.Add(labReq);
                //                    dbContext.SaveChanges();

                //                    var itemDetail = (from labPrice in priceForLabRequisition
                //                                      where labPrice.ItemId == labReq.LabTestId
                //                                      select labPrice).FirstOrDefault();


                //                    RequisitionItem = new BillItemRequisition();
                //                    RequisitionItem.RequisitionId = labReq.RequisitionId;
                //                    RequisitionItem.BillStatus = labReq.BillingStatus;
                //                    RequisitionItem.PatientId = labReq.PatientId;
                //                    RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
                //                    RequisitionItem.ProviderId = labReq.ProviderId.Value;
                //                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                //                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                //                    RequisitionItem.ItemId = itemDetail.ItemId;
                //                    RequisitionItem.ItemName = itemDetail.ItemName;
                //                    RequisitionItem.Price = itemDetail.Price;
                //                    RequisitionItem.Quantity = 1;
                //                    RequisitionItem.ProcedureCode = labReq.ProcedureCode;
                //                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
                //                    RequisitionItem.CreatedOn = DateTime.Now;

                //                    allBillRequisition.Add(RequisitionItem);
                //                }

                //                foreach (ImagingRequisitionModel imgnRequisition in Diagnosis.AllIcdImagingOrders)
                //                {
                //                    imgnRequisition.CreatedBy = currentUser.EmployeeId;
                //                    imgnRequisition.CreatedOn = DateTime.Now;
                //                    imgnRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                //                    dbContext.ImagingRequisitions.Add(imgnRequisition);
                //                    dbContext.SaveChanges();

                //                    var itemDetail = (from radPrice in priceForRadRequisition
                //                                      where radPrice.ItemId == imgnRequisition.ImagingItemId
                //                                      select radPrice).FirstOrDefault();


                //                    RequisitionItem = new BillItemRequisition();
                //                    RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                //                    RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                //                    RequisitionItem.PatientId = imgnRequisition.PatientId;
                //                    RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                //                    RequisitionItem.ProviderId = imgnRequisition.ProviderId.Value;
                //                    RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                //                    RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                //                    RequisitionItem.ItemId = itemDetail.ItemId;
                //                    RequisitionItem.ItemName = itemDetail.ItemName;
                //                    RequisitionItem.Price = itemDetail.Price;
                //                    RequisitionItem.Quantity = 1;
                //                    RequisitionItem.ProcedureCode = imgnRequisition.ProcedureCode;
                //                    RequisitionItem.CreatedBy = currentUser.EmployeeId;
                //                    RequisitionItem.CreatedOn = DateTime.Now;

                //                    allBillRequisition.Add(RequisitionItem);
                //                }

                //                foreach (PHRMPrescriptionItemModel phrmRequisition in Diagnosis.AllIcdPrescriptionOrders)
                //                {
                //                    phrmRequisition.CreatedBy = currentUser.EmployeeId;
                //                    phrmRequisition.CreatedOn = DateTime.Now;
                //                    phrmRequisition.DiagnosisId = Diagnosis.DiagnosisId;
                //                    dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                //                    dbContext.SaveChanges();
                //                }

                //            }
                //            foreach (BillItemRequisition bill in allBillRequisition)
                //            {
                //                dbContext.BillItemRequisitions.Add(bill);
                //            }
                //            dbContext.SaveChanges();
                //            responseData.Status = "OK";
                //            //Commit Transaction
                //            orderRequisitionTransaction.Commit();
                //        }
                //        catch (Exception ex)
                //        {
                //            //Rollback all transaction if exception occured
                //            orderRequisitionTransaction.Rollback();
                //            throw ex;
                //        }

                //    }

                //}

                //post scanned images
                else if (reqType == "upload")
                {
                    /////Read Files From Clent Side 
                    var files = this.ReadFiles();
                    ///Read patient Files Model Other Data
                    var reportDetails = Request.Form["imgDetails"];
                    PatientImagesModel patFileData = DanpheJSONConvert.DeserializeObject<PatientImagesModel>(reportDetails);
                    ////We Do Process in Transaction because Now Situation that 
                    /////i have to Add Each File along with other model details and next time Fatch some value based on current inserted data and All previous data
                    using (var dbContextTransaction = dbContext.Database.BeginTransaction())
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
                                        string currentfileName = "";
                                        // this is Latest File NAme with FileNo in the Last Binding
                                        currentfileName = patFileData.FileName + '_'  + currentFileExtention;

                                        var tempModel = new PatientImagesModel();
                                        tempModel.FileBinaryData = fileBytes;
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
                                        dbContext.PatientImages.Add(tempModel);
                                        dbContext.SaveChanges();
                                    }
                                }
                            }
                            ///After All Files Added Commit the Transaction
                            dbContextTransaction.Commit();

                            responseData.Results = null;
                            responseData.Status = "OK";
                        }
                        catch (Exception ex)
                        {
                            dbContextTransaction.Rollback();
                            responseData.Results = null;
                            responseData.Status = "Failed";
                            throw ex;
                        }
                    }
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Cannot match any reqType";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);

        }

        [HttpDelete]
        public string Delete(string reqType, int patientProblemId, int patImageId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            ClinicalDbContext dbContext = new ClinicalDbContext(connString);
            try
            {
                if (reqType == "activemedical" && patientProblemId != 0)
                {
                    PastMedicalProblem pastProblem = new PastMedicalProblem();
                    ActiveMedicalProblem currProblem = dbContext.ActiveMedical
                   .Where(p => p.PatientProblemId == patientProblemId)
                   .FirstOrDefault();
                    //set the IsResolved status as true and post to past medical table
                    if (currProblem != null)
                    {
                        currProblem.IsResolved = true;
                        currProblem.ResolvedDate = DateTime.Now;
                        currProblem.ModifiedBy = currentUser.EmployeeId;
                        currProblem.ModifiedOn = DateTime.Now;
                        dbContext.Entry(currProblem).State = EntityState.Modified;
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
                        dbContext.PastMedicals.Add(pastProblem);
                    }
                    dbContext.SaveChanges();

                    responseData.Results = "Active Medical delete successfully";
                    responseData.Status = "OK";
                }
                else if(reqType == "deactivateUploadedImage")
                {
                    PatientImagesModel image = dbContext.PatientImages.Where(a => a.PatImageId == patImageId).Select(a => a).FirstOrDefault();
                    image.IsActive = false;
                    dbContext.Entry(image).State = EntityState.Modified;
                    dbContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Cannot match any reqType";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            ClinicalDbContext dbContext = new ClinicalDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            string str = this.ReadPostData();
            string reqType = this.ReadQueryStringData("reqType");

            try
            {
                if (!String.IsNullOrEmpty(str))
                {
                    if (reqType == "vitals")
                    {
                        VitalsModel clientVitals = JsonConvert.DeserializeObject<VitalsModel>(str);
                        clientVitals.ModifiedBy = currentUser.EmployeeId;
                        clientVitals.ModifiedOn = DateTime.Now;
                        clientVitals = dbContext.UpdateGraph(clientVitals);
                        dbContext.Entry(clientVitals).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientVitals).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();

                        responseData.Results = clientVitals;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "activemedical")
                    {

                        ActiveMedicalProblem clientActiveMedicals = JsonConvert.DeserializeObject<ActiveMedicalProblem>(str);
                        clientActiveMedicals.ModifiedBy = currentUser.EmployeeId;
                        clientActiveMedicals.ModifiedOn = DateTime.Now;
                        clientActiveMedicals = dbContext.UpdateGraph(clientActiveMedicals);
                        dbContext.Entry(clientActiveMedicals).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientActiveMedicals).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();

                        responseData.Results = clientActiveMedicals;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "allergy")
                    {
                        AllergyModel clientAllergy = JsonConvert.DeserializeObject<AllergyModel>(str);
                        clientAllergy.ModifiedBy = currentUser.EmployeeId;
                        clientAllergy.ModifiedOn = DateTime.Now;

                        clientAllergy = dbContext.UpdateGraph(clientAllergy);
                        dbContext.Entry(clientAllergy).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientAllergy).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();

                        ////assinging AllergenAdvRecName
                        //PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);

                        //if (clientAllergy.AllergenAdvRecId != 0 && clientAllergy.AllergenAdvRecId != null)
                        //{
                        //    clientAllergy.AllergenAdvRecName = phrmDbContext.PHRMGenericModel
                        //            .Where(a => a.GenericId == clientAllergy.AllergenAdvRecId).FirstOrDefault().GenericName;
                        //}

                        responseData.Results = clientAllergy;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "familyhistory")
                    {
                        FamilyHistory clientFamilyHistory = JsonConvert.DeserializeObject<FamilyHistory>(str);
                        clientFamilyHistory.ModifiedBy = currentUser.EmployeeId;
                        clientFamilyHistory.ModifiedOn = DateTime.Now;

                        clientFamilyHistory = dbContext.UpdateGraph(clientFamilyHistory);
                        dbContext.Entry(clientFamilyHistory).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientFamilyHistory).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = clientFamilyHistory;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "homemedication")
                    {
                        HomeMedicationModel clientHomeMedication = JsonConvert.DeserializeObject<HomeMedicationModel>(str);
                        clientHomeMedication.ModifiedBy = currentUser.EmployeeId;
                        clientHomeMedication.ModifiedOn = DateTime.Now;
                        clientHomeMedication = dbContext.UpdateGraph(clientHomeMedication);

                        dbContext.Entry(clientHomeMedication).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientHomeMedication).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();

                        PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
                        if (clientHomeMedication.MedicationId != null && clientHomeMedication.MedicationId != 0)
                        {
                            clientHomeMedication.MedicationName = phrmDbContext.PHRMItemMaster
                                                                    .Where(a => a.ItemId == clientHomeMedication.MedicationId).FirstOrDefault().ItemName;
                        }

                        responseData.Results = clientHomeMedication;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "inputoutput")
                    {
                        InputOutputModel clientIO = JsonConvert.DeserializeObject<InputOutputModel>(str);
                        clientIO.ModifiedBy = currentUser.EmployeeId;
                        clientIO.ModifiedOn = DateTime.Now;
                        clientIO = dbContext.UpdateGraph(clientIO);
                        dbContext.Entry(clientIO).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientIO).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = clientIO;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "medicationprescription")
                    {
                        MedicationPrescriptionModel clientPrescription = JsonConvert.DeserializeObject<MedicationPrescriptionModel>(str);
                        clientPrescription.ModifiedBy = currentUser.EmployeeId;
                        clientPrescription.ModifiedOn = DateTime.Now;
                        clientPrescription = dbContext.UpdateGraph(clientPrescription);
                        dbContext.Entry(clientPrescription).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientPrescription).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        //assinging MedicationName
                        PharmacyDbContext phrmDbContext = new PharmacyDbContext(connString);
                        MasterDbContext masterDbContext = new MasterDbContext(connString);

                        if (clientPrescription.MedicationId != 0)
                        {
                            clientPrescription.MedicationName = phrmDbContext.PHRMItemMaster
                                    .Where(m => m.ItemId == clientPrescription.MedicationId).FirstOrDefault().ItemName;
                        }
                        if (clientPrescription.ProviderId != 0)
                        {
                            clientPrescription.ProviderName = masterDbContext.Employees
                           .Where(e => e.EmployeeId == clientPrescription.ProviderId)
                           .Select(e => e).FirstOrDefault().FullName;
                        }

                        responseData.Results = clientPrescription;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "pastmedical")
                    {
                        PastMedicalProblem clientPastMedical = JsonConvert.DeserializeObject<PastMedicalProblem>(str);
                        clientPastMedical.ModifiedBy = currentUser.EmployeeId;
                        clientPastMedical.ModifiedOn = DateTime.Now;
                        clientPastMedical = dbContext.UpdateGraph(clientPastMedical);
                        dbContext.Entry(clientPastMedical).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientPastMedical).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = clientPastMedical;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "socialhistory")
                    {
                        SocialHistory clientSocialHistory = JsonConvert.DeserializeObject<SocialHistory>(str);
                        clientSocialHistory.ModifiedBy = currentUser.EmployeeId;
                        clientSocialHistory.ModifiedOn = DateTime.Now;
                        clientSocialHistory = dbContext.UpdateGraph(clientSocialHistory);
                        dbContext.Entry(clientSocialHistory).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientSocialHistory).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = clientSocialHistory;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "surgicalhistory")
                    {
                        SurgicalHistory clientSurgicalHistory = JsonConvert.DeserializeObject<SurgicalHistory>(str);
                        clientSurgicalHistory.ModifiedBy = currentUser.EmployeeId;
                        clientSurgicalHistory.ModifiedOn = DateTime.Now;
                        clientSurgicalHistory = dbContext.UpdateGraph(clientSurgicalHistory);
                        dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(clientSurgicalHistory).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = clientSurgicalHistory;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "notes")
                    {
                        NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);
                        notes.ModifiedBy = currentUser.EmployeeId;
                        notes.ModifiedOn = DateTime.Now;
                        notes = dbContext.UpdateGraph(notes);
                        dbContext.Entry(notes).Property(u => u.CreatedBy).IsModified = false;
                        dbContext.Entry(notes).Property(u => u.CreatedOn).IsModified = false;
                        dbContext.SaveChanges();
                        responseData.Results = notes;
                        responseData.Status = "OK";
                    }
                    else if (reqType == "opd-general-note")
                    {
                        using (var dbContextTransaction = dbContext.Database.BeginTransaction())
                        {
                            try
                            {

                                NotesModel notes = JsonConvert.DeserializeObject<NotesModel>(str);

                                SubjectiveNoteModel subjectiveNote = notes.SubjectiveNote;
                                ObjectiveNoteModel objectiveNote = notes.ObjectiveNote;

                                List<ClinicalDiagnosisModel> clinialDiagnosis = notes.AllIcdAndOrders;

                                if (notes != null)
                                {
                                    notes.SubjectiveNote = null;
                                    notes.ObjectiveNote = null;
                                    notes.ModifiedOn = DateTime.Now;
                                    notes.ModifiedBy = currentUser.EmployeeId;
                                    notes = dbContext.UpdateGraph(notes);
                                    dbContext.Entry(notes).Property(u => u.CreatedBy).IsModified = false;
                                    dbContext.Entry(notes).Property(u => u.CreatedOn).IsModified = false;
                                    //update notes
                                    if (subjectiveNote != null)
                                    {
                                        if (subjectiveNote.SubjectiveNoteId != 0)
                                        {
                                            subjectiveNote.ModifiedBy = notes.ModifiedBy;
                                            subjectiveNote.ModifiedOn = notes.ModifiedOn;
                                            subjectiveNote = dbContext.UpdateGraph(subjectiveNote);
                                            dbContext.Entry(subjectiveNote).Property(u => u.CreatedBy).IsModified = false;
                                            dbContext.Entry(subjectiveNote).Property(u => u.CreatedOn).IsModified = false;
                                        }
                                        else
                                        {
                                            subjectiveNote.CreatedBy = currentUser.EmployeeId;
                                            subjectiveNote.CreatedOn = notes.CreatedOn;
                                            subjectiveNote.NotesId = notes.NotesId;
                                            dbContext.SubjectiveNotes.Add(subjectiveNote);
                                        }


                                    }
                                    if (objectiveNote != null)
                                    {
                                        if (objectiveNote.ObjectiveNotesId != 0)
                                        {
                                            objectiveNote.ModifiedBy = notes.ModifiedBy;
                                            objectiveNote.ModifiedOn = notes.ModifiedOn;
                                            objectiveNote = dbContext.UpdateGraph(objectiveNote);
                                        }
                                        else
                                        {
                                            //add Objective Note  
                                            objectiveNote.CreatedBy = currentUser.EmployeeId;
                                            objectiveNote.CreatedOn = DateTime.Now;
                                            objectiveNote.NotesId = notes.NotesId;
                                            dbContext.ObjectiveNotes.Add(objectiveNote);
                                        }

                                    }
                                    dbContext.SaveChanges();

                                    if ((clinialDiagnosis != null) && clinialDiagnosis.Count > 0)
                                    {

                                        List<BillItemRequisition> allBillRequisition = new List<BillItemRequisition>();
                                        var priceForLabRequisition = (from billItemPrice in dbContext.BillItemPrices
                                                                      join servDept in dbContext.ServiceDepartments
                                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                                      where servDept.IntegrationName == "LAB"
                                                                      select new
                                                                      {
                                                                          ItemId = billItemPrice.ItemId,
                                                                          ItemName = billItemPrice.ItemName,
                                                                          Price = billItemPrice.Price,
                                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                                          DepartmentName = servDept.ServiceDepartmentName
                                                                      }).ToList();

                                        var priceForRadRequisition = (from billItemPrice in dbContext.BillItemPrices
                                                                      join servDept in dbContext.ServiceDepartments
                                                                      on billItemPrice.ServiceDepartmentId equals servDept.ServiceDepartmentId
                                                                      where servDept.IntegrationName == "Radiology"
                                                                      select new
                                                                      {
                                                                          ItemId = billItemPrice.ItemId,
                                                                          ItemName = billItemPrice.ItemName,
                                                                          Price = billItemPrice.Price,
                                                                          ServiceDepartmentId = servDept.ServiceDepartmentId,
                                                                          DepartmentName = servDept.ServiceDepartmentName
                                                                      }).ToList();


                                        BillItemRequisition RequisitionItem = new BillItemRequisition();

                                        foreach (ClinicalDiagnosisModel Diagnosis in clinialDiagnosis)
                                        {
                                            Diagnosis.CreatedOn = DateTime.Now;
                                            Diagnosis.CreatedBy = currentUser.EmployeeId;
                                            Diagnosis.NotesId = notes.NotesId;
                                            dbContext.ClinicalDiagnosis.Add(Diagnosis);
                                            dbContext.SaveChanges();



                                            foreach (LabRequisitionModel labReq in Diagnosis.AllIcdLabOrders)
                                            {
                                                labReq.CreatedBy = currentUser.EmployeeId;
                                                labReq.CreatedOn = DateTime.Now;
                                                labReq.DiagnosisId = Diagnosis.DiagnosisId;
                                                dbContext.LabRequisitions.Add(labReq);
                                                dbContext.SaveChanges();

                                                var itemDetail = (from labPrice in priceForLabRequisition
                                                                  where labPrice.ItemId == labReq.LabTestId
                                                                  select labPrice).FirstOrDefault();


                                                RequisitionItem = new BillItemRequisition();
                                                RequisitionItem.RequisitionId = labReq.RequisitionId;
                                                RequisitionItem.BillStatus = labReq.BillingStatus;
                                                RequisitionItem.PatientId = labReq.PatientId;
                                                RequisitionItem.PatientVisitId = labReq.PatientVisitId.Value;
                                                RequisitionItem.ProviderId = labReq.ProviderId.Value;
                                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                                RequisitionItem.ItemId = itemDetail.ItemId;
                                                RequisitionItem.ItemName = itemDetail.ItemName;
                                                RequisitionItem.Price = itemDetail.Price;
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
                                                dbContext.ImagingRequisitions.Add(imgnRequisition);
                                                dbContext.SaveChanges();

                                                var itemDetail = (from radPrice in priceForRadRequisition
                                                                  where radPrice.ItemId == imgnRequisition.ImagingItemId
                                                                  select radPrice).FirstOrDefault();


                                                RequisitionItem = new BillItemRequisition();
                                                RequisitionItem.RequisitionId = imgnRequisition.ImagingRequisitionId;
                                                RequisitionItem.BillStatus = imgnRequisition.BillingStatus;
                                                RequisitionItem.PatientId = imgnRequisition.PatientId;
                                                RequisitionItem.PatientVisitId = imgnRequisition.PatientVisitId.Value;
                                                RequisitionItem.ProviderId = imgnRequisition.ProviderId.Value;
                                                RequisitionItem.ServiceDepartmentId = itemDetail.ServiceDepartmentId;
                                                RequisitionItem.DepartmentName = itemDetail.DepartmentName;
                                                RequisitionItem.ItemId = itemDetail.ItemId;
                                                RequisitionItem.ItemName = itemDetail.ItemName;
                                                RequisitionItem.Price = itemDetail.Price;
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
                                                dbContext.PHRMPrescriptionItems.Add(phrmRequisition);
                                                dbContext.SaveChanges();
                                            }

                                        }
                                        foreach (BillItemRequisition bill in allBillRequisition)
                                        {
                                            dbContext.BillItemRequisitions.Add(bill);
                                        }
                                        dbContext.SaveChanges();
                                    }


                                    dbContextTransaction.Commit();
                                    responseData.Status = "OK";
                                }
                            }
                            catch (Exception ex)
                            {
                                //Rollback all transaction if exception occured
                                dbContextTransaction.Rollback();
                                responseData.Status = "Failed";
                                throw ex;
                            }
                        }



                    }


                }
                else
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = "Client Object is empty";
                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
    }

}



