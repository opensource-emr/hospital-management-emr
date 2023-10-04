using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ViewModel.Medicare;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Medicare
{
    public interface IMedicareService
    {
      Task<object> GetMedicarePatientDetails(MedicareDbContext medicareDbContext,int patientId);
      MedicareMember SaveMedicareMemberDetails(MedicareDbContext medicareDbContext, MedicareMemberDto medicareMemberDto, RbacUser currentUser);
      MedicareMember UpdateMedicareMemberDetails(MedicareDbContext medicareDbContext, MedicareMemberDto medicareMemberDto, RbacUser currentUser);
      Task<object>GetDepartments(MedicareDbContext medicareDbContext);
      Task<object> GetDesignations(MedicareDbContext medicareDbContext);
      Task<object> GetMedicareTypes(MedicareDbContext medicareDbContext);
      Task<object> GetAllMedicareInstitutes(MedicareDbContext medicareDbContext);
      Task<object> GetInsuranceProviders(MedicareDbContext medicareDbContext);
      Task<object> GetMedicareMemberByMedicareNo(MedicareDbContext medicareDbContext, string medicareNo);
      Task<object> GetMedicareMemberByPatientId(MedicareDbContext medicareDbContext,int PatientId);
      Task<object> GetDependentMedicareMemberByPatientId(MedicareDbContext medicareDbContext,int PatientId);
    }
}
