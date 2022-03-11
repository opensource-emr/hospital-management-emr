using DanpheEMR.ServerModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Maternity
{
    public interface IMaternityService
    {
        MaternityPatient AddMaternityPatient(MaternityPatient patient);
        MaternityPatient UpdateMaternityPatient(MaternityPatient patient);
        List<dynamic> GetDataForEditSearch(string searchText);
        List<dynamic> GetPatientDetails();
        PatientModel GetPatientDetailById(int id);
        List<dynamic> GetAllActiveMaternityPatientList(bool showAll, DateTime from, DateTime to);
        bool RemoveMaternityPatient(int id, int removeBy);
        bool ConcludeMaternityPatient(int id, int concludedBy);
        MaternityANC AddUpdateANC(MaternityANC model);
        object GetAllDosesNumber(bool dosesNeeded);
        List<MaternityANC> GetAllANCByMaternityPatId(int id);
        List<MaternityFileUploads> GetAllFilesUploadedbyMaternityPatId(int id);
        List<dynamic> GetAllBabyDetailsByMaternityPatId(int matId, int patId);
        MaternityRegisterVM RegisterMaternity(MaternityRegisterVM model);
        bool RemoveMaternityPatientANC(int id, int removeBy);
        bool RemoveMaternityPatientFile(int id, int removeBy);
        MaternityRegister EditChildDetail(MaternityRegister model);
        MaternityPatient EditMotherDetail(MaternityPatient model);
        bool RemoveChildDetail(int id, int removedBy);
        MaternityFileUploads UploadMaternityPatientFiles(MaternityFileUploads model, IFormFileCollection files);
        string GetDownloadFilePathById(int maternityPatFileId);
        List<MaternityPayment> GetPatientPaymentDetailById(int id);
        MaternityPayment AddMaternityPatientPayment(MaternityPayment payment);
        DataSet GetMaternityAllowanceReportList(DateTime from, DateTime to);
        MaternityPaymentReceipt GetPatientPaymentDetailByPaymentId(int id);
    }
}
