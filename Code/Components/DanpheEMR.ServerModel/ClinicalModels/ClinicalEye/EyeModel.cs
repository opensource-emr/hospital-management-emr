using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EyeModel
    {
        [Key]

        public int Id { get; set; }
        public int VisitId { get; set; }
        public int ProviderId { get; set; }
        public int PatientId { get; set; }
        public DateTime VisitDate { get; set; }
        public DateTime ModifiedOn { get; set; }
        public int ModifiedBy { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        [NotMapped]
        public List<RefractionModel> RefractionOD { get; set; }
        [NotMapped]
        public OperationNotesModel OperationNotesOD { get; set; }
        [NotMapped]
        public AblationProfileModel AblationOD { get; set; }
        [NotMapped]
        public List<LaserDataEntryModel> LaserDataOD { get; set; }
        [NotMapped]
        public List<PreOPPachymetryModel> PrePachymetryOD { get; set; }
        [NotMapped]
        public LASIKRSTModel LasikRSTOD { get; set; }
        [NotMapped]
        public SMILESSettingsModel SmileSettingOD { get; set; }
        [NotMapped]
        public List<PachymetryModel> PachymetryOD { get; set; }
        [NotMapped]
        public EyeVisuMaxsModel VisumaxOD { get; set; }
        [NotMapped]
        public List<WavefrontModel> WavefrontOD { get; set; }
        [NotMapped]
        public List<ORAModel> ORAOD { get; set; }
        [NotMapped]
        public SmileIncisionsModel SmileIncisionOD { get; set; }
        [NotMapped]
        public List<RefractionModel> RefractionOS { get; set; }
        [NotMapped]
        public OperationNotesModel OperationNotesOS { get; set; }
        [NotMapped]
        public AblationProfileModel AblationOS { get; set; }
        [NotMapped]
        public List<LaserDataEntryModel> LaserDataOS { get; set; }
        [NotMapped]
        public List<PreOPPachymetryModel> PrePachymetryOS { get; set; }
        [NotMapped]
        public LASIKRSTModel LasikRSTOS { get; set; }
        [NotMapped]
        public SMILESSettingsModel SmileSettingOS { get; set; }
        [NotMapped]
        public List<PachymetryModel> PachymetryOS { get; set; }
        [NotMapped]
        public EyeVisuMaxsModel VisumaxOS { get; set; }
        [NotMapped]
        public List<WavefrontModel> WavefrontOS { get; set; }
        [NotMapped]
        public List<ORAModel> ORAOS { get; set; }
        [NotMapped]
        public SmileIncisionsModel SmileIncisionOS { get; set; }
    }
}



