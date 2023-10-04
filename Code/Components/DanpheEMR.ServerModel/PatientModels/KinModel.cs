using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class KinModel
    {
        [Key]
        public int PatientKinOrEmergencyContactId { get; set; }
        public int PatientId { get; set; }
        public string KinContactType { get; set; }
        public string KinFirstName { get; set; }
        public string KinLastName { get; set; }
        public string KinPhoneNumber { get; set; }
        public string RelationShip { get; set; }
        public string KinComment { get; set; }
        public virtual PatientModel Patient { get; set; }

    }
}
