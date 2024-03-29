export class HospitalMortalityReportModel {
    public HospitalMortality: Array<HospitalMortalityModel> = Array<HospitalMortalityModel>();

}

export class HospitalMortalityModel {
    public ICDCode: string = null;
    public ICDCodeName: string = null;


    public v0Day_to_7_Days_Male: number = null;
    public v0Day_to_7_Days_Female: number = null;
    public v8Day_to_28_Days_Male: number = null;
    public v8Day_to_28_Days_Female: number = null;

    public v29Days_to_1yr_Male: number = null;
    public v29Days_to_1yr_Female: number = null;

    public v1yr_to_4yr_Male: number = null;
    public v1yr_to_4yr_Female: number = null;

    public v5yr_to_14yr_Male: number = null;
    public v5yr_to_14yr_Female: number = null;

    public v15yr_to_19yr_Male: number = null;
    public v15yr_to_19yr_Female: number = null;

    public v20yr_to_29yr_Male: number = null;
    public v20yr_to_29yr_Female: number = null;

    public v30yr_to_39yr_Male: number = null;
    public v30yr_to_39yr_Female: number = null;

    public v40yr_to_49yr_Male: number = null;
    public v40yr_to_49yr_Female: number = null;

    public v50yr_to_59yr_Male: number = null;
    public v50yr_to_59yr_Female: number = null;

    public v60yr_to_69yr_Male: number = null;
    public v60yr_to_69yr_Female: number = null;
    public gt_70yr_Male: number = null;
    public gt_70yr_Female: number = null;

    public TotalDeaths_Male: number = null;
    public TotalDeaths_Female: number = null;
}