using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace DanpheEMR.ServerModel
{
    public class SeriesInfoModel
    {
        [Key]
        public int SeriesId { get; set; }
        public int PatientStudyId { get; set; }
        public string SeriesInstanceUID { get; set; }
        public string SeriesDescription { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
