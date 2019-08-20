using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ReactionModel
    {
        [Key]
        public int ReactionId { get; set; }
        public string ReactionCode { get; set; }
        public string ReactionName { get; set; }

        public int? CreatedBy { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public DateTime? CreatedOn { get; set; }//changed  to nullable for mnk-uat:sudarshan-13July2017
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
