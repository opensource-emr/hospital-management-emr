using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IMUDTOs
{
    public class IMUPostDataModel
    {
        public string name { get; set; }
        public int age { get; set; }
        public int age_unit { get; set; }
        public int sex { get; set; }
        public int caste { get; set; }
        public int? province_id { get; set; }
        public int? district_id { get; set; }
        public int? municipality_id { get; set; }
        public int ward { get; set; }
        public string tole { get; set; }
        public int occupation { get; set; }
        public string emergency_contact_one { get; set; }
        public string registered_at { get; set; }
        public int service_for { get; set; }
        public int service_type { get; set; }
        public int sample_type { get; set; }
        public string sample_collected_date { get; set; }
        public int infection_type { get; set; }
        public string lab_id { get; set; }
        public string lab_received_date { get; set; }
        public string lab_test_date { get; set; }
        public string lab_test_time { get; set; }
        public int lab_result { get; set; }
        public string imu_swab_id { get; set; }
        public Boolean is_infected_covid_before { get; set; }
        public int is_received_vaccine { get; set; }
    }
}
