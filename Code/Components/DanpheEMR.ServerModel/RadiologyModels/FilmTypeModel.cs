using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FilmTypeModel
    {
        [Key]
        public int FilmTypeId { get; set; }
        public string FilmType { get; set; }
        public int ImagingTypeId { get; set; }
        public string FilmTypeDisplayName { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

    }
}
