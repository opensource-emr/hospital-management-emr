---Incremental Script for 21August onwards---
---created: sud:21Aug'18--
----change DatabaseName(s)  as per your current database---
--Use DanpheEMR
GO

--- START: Ramavtar 22Aug'18 create table PAT_HealthCardInfo ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PAT_HealthCardInfo](
	[PatHealthCardId] [int] IDENTITY(1,1) NOT NULL,
	[PatientId] [int] NOT NULL,
	[InfoOnCardJSON] [nvarchar](200) NULL,
	[BillingDate] [datetime] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
 CONSTRAINT [PK_PAT_HealthCardInfo] PRIMARY KEY CLUSTERED 
(
	[PatHealthCardId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[PAT_HealthCardInfo]  WITH CHECK ADD  CONSTRAINT [FK_PAT_HealthCardInfo_PAT_Patient] FOREIGN KEY([PatientId])
REFERENCES [dbo].[PAT_Patient] ([PatientId])
GO
ALTER TABLE [dbo].[PAT_HealthCardInfo] CHECK CONSTRAINT [FK_PAT_HealthCardInfo_PAT_Patient]
GO
--- END: Ramavtar 22Aug'18 create table PAT_HealthCardInfo ---



---------START: Sud--22Aug--Correction in Billing Reports + Labs---------------------


CREATE FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName] (@ServiceDeptName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 -------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY')
					OR(@ServiceDeptName='LABORATORY')  THEN ('LABS')
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )

END


GO




ALTER VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
  AS
/*
 FileName    : VW_BIL_TxnItemsInfoWithDateSeparation
 Description : This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks     : Add new fields as per requirements
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Aug'118- sud      created         To be used as common view for those billing reports where item level segregation is required
 -------------------------------------------------------------------------
*/
 SELECT
	txnItm.BillingTransactionItemId,
	txnItm.PatientId,
	txnItm.ItemId,
	txnItm.ItemName, 
	txnitm.ServiceDepartmentId,
	txnItm.ServiceDepartmentName,
	txnItm.ProviderId,
	txnItm.ProviderName,
	ISNULL(txnItm.BillingType,'Outpatient') AS 'BillingType',--default BillingType is Outpatient, so.. 
	txnItm.RequestingDeptId, -- sud:22Aug'18
	Convert(DATE, txnItm.CreatedOn) 'CreatedDate',
	Convert(DATE, txnItm.PaidDate) 'PaidDate',
	Convert(DATE, ret.CreatedOn)  'ReturnDate', 
	---cancelled---
	CASE WHEN txnItm.BillStatus = 'Cancel' THEN Convert(DATE,txnItm.CancelledOn) ELSE NULL END AS CancelledDate,

  ---provisional--
    ---below are conditions for Provisional--
	-----Invoice not Generated--
	--1. Billstatus = Provisional
	--2. BillStatus = Cancel  & CreatedOn != CancelledOn
	----Invoice Generated--
	--3. billstatus = unpaid  &  ItemCreatedOn != InvoiceCreatedOn
	--4. billstatus = paid  &   ItemCreatedOn != InvoiceCreatedOn   & PaymentMode != Credit   
  CASE WHEN txnItm.BillStatus = 'provisional' 
            THEN Convert(DATE, txnItm.CreatedOn) 
     WHEN   (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
	        THEN Convert(DATE,txnItm.CreatedOn)
     WHEN  (txnItm.BillingTransactionId IS NOT NULL
	        AND ( 
			      (txn.PaymentMode != 'credit' AND COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn) )
					OR (txnItm.BillStatus='unpaid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
					OR (txnItm.BillStatus='paid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txnItm.PaidDate))
				 )
		   ) THEN Convert(DATE, txnItm.CreatedOn) 
   
	ELSE NULL END AS ProvisionalDate,

--CREDIT---
  CASE WHEN (txn.PaymentMode='credit' AND txn.BillStatus='unpaid' )
	   OR ( txn.BillStatus='paid' AND Convert(Date,txn.CreatedOn)  != Convert(Date,txn.PaidDate) ) 
	   THEN CONVERT(DATE,txn.CreatedOn)
	   ELSE NULL END AS 'CreditDate',

	 txnItm.Price,
	 txnItm.Quantity,
	 txnItm.SubTotal,
	 txnItm.DiscountAmount,
	 txnitm.TotalAmount,
	 ret.TotalAmount 'ReturnAmount',
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks'


FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO


/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]    Script Date: 8/22/2018 7:06:04 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-08-19','2018-08-19')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 ------------------------------------------ */
AS
RETURN
( 

    SELECT  
	ISNULL(Ot.SubTotal,0) AS TotalCollection-- <needs revision on this value>
	,Ot.*
	
	FROM 
	 
	 (
		-------------Start:Ot (Outer Table)-----------------------------------------
		SELECT 
		CASE WHEN A.PaidDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'PaidAmount',
		CASE WHEN A.ReturnDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'ReturnAmount',
		CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.TotalAmount ELSE 0 END AS 'CreditAmount',
		CASE WHEN A.CancelledDate IS NOT NULL THEN A.TotalAmount ELSE 0 END AS 'CancelledAmount',
		CASE WHEN A.ProvisionalDate IS NOT NULL 
			  AND A.CancelledDate IS NULL
			  AND A.CreditDate IS NULL
			  AND A.PaidDate IS NULL 
			  AND A.ReturnDate IS NULL 
			  THEN A.TotalAmount ELSE 0 END AS 'ProvisionalAmount'
		,* FROM 
		 (
		    ----------------------------------------------------------------------
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName) AS ServiceDepartmentName,
				ProviderId,ProviderName,SubTotal,DiscountAmount,TotalAmount, BillingType, RequestingDeptId,

					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL

     )Ot--end of outerTable
	 ----------------End:Ot (Outer Table)---------------------------------------------------

)---end of return
GO




/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_DoctorWiseIncomeSummary_OPIP]    Script Date: 8/22/2018 5:17:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/08Aug2018
-- Description:		to show DoctorWise IncomeSummary (Inpatient + Outpatient)
-- Remarks: We're taking AssignedTo Field Only in BillingTransactionItem table. 
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_DoctorWiseIncomeSummary_OPIP]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/08Aug'18			created the script
2		Ramavtar/08Aug'18		getting doctor name from employee table
3.      sud/22Aug'18            updated for IP Records
----------------------------------------------------------
*/
BEGIN

SELECT ISNULL(OPD.ProviderName,IPD.ProviderName) 'DoctorName',
		ISNULL(OPD.SubTotal,0) 'OP_Collection',
		ISNULL(OPD.Discount,0) 'OP_Discount',
		ISNULL(OPD.Refund,0) 'OP_Refund',
		ISNULL(OPD.NetTotal,0) 'OP_NetTotal',

		ISNULL(IPD.SubTotal,0) 'IP_Collection',
		ISNULL(IPD.Discount,0) 'IP_Discount',
		ISNULL(IPD.Refund,0) 'IP_Refund',
		ISNULL(IPD.NetTotal,0) 'IP_NetTotal',

		ISNULL(OPD.NetTotal,0)+	ISNULL(IPD.NetTotal,0) 'Grand_Total'

	FROM
    (
			SELECT
				 CASE WHEN ProviderId IS NOT NULL THEN CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) ELSE 'NoDoctor' END AS 'ProviderName',
			  SUM(ISNULL(SubTotal,0)) 'SubTotal',
				SUM(ISNULL(DiscountAmount,0))  AS 'Discount',
				SUM(ISNULL(ReturnAmount,0))  AS 'Refund',
				SUM(ISNULL(TotalAmount,0)-ISNULL(ReturnAmount,0)) AS 'NetTotal'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
				 LEFT JOIN EMP_Employee E ON ProviderId = EmployeeId
           WHERE BillingType = 'OutPatient'
		   Group By  ProviderId, E.FirstName, E.MiddleName, E.LastName
   
	 ) OPD
	 FULL OUTER JOIN
	     (
			SELECT
				 CASE WHEN ProviderId IS NOT NULL THEN CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) ELSE 'NoDoctor' END AS 'ProviderName',
			  SUM(ISNULL(SubTotal,0)) 'SubTotal',
				SUM(ISNULL(DiscountAmount,0))  AS 'Discount',
				SUM(ISNULL(ReturnAmount,0))  AS 'Refund',
				SUM(ISNULL(TotalAmount,0)-ISNULL(ReturnAmount,0)) AS 'NetTotal'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
				 LEFT JOIN EMP_Employee E ON ProviderId = EmployeeId
           WHERE BillingType = 'Inpatient'
		   Group By  ProviderId, E.FirstName, E.MiddleName, E.LastName
   
	 ) IPD
	 ON OPD.ProviderName = IPD.ProviderName
	 Order BY DoctorName


END
GO

Update Lab_ReportTemplate
set HeaderText='Laboratory Report'
where ReportTemplateShortName='Default'
GO

---------END: Sud--22Aug--Correction in Billing Reports+ Labs---------------------



--------Start: Suraj--23 Aug/2018 --Update in LabTestComponentsJSON---------------------

--------TestName: Urine RE/ME

update LAB_LabTests
set LabTestComponentsJSON=
'[{"Component":"Physical Examination","Method":"","ControlType":"Label"},
{"Component":"Color","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Urine-Color"},  
{"Component":"Appearance","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Turbidity"}, 
{"Component":"Chemical Examination","Method":"","ControlType":"Label"}, 
{"Component":"Albumin","Range":"3.5-5.5","RangeDescription":"3.5-5.5","ValueType":"number","Unit":"gm/dl","Method":"BCG"},  
{"Component":"Sugar","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Trace"},  
{"Component":"Microscopic Examination","ValueType":"string","Method":"","ControlType":"Label"}, 
{"Component":"Pus Cells","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  
{"Component":"RBC","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"}, 
{"Component":"Epithelial Cells","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  
{"Component":"Others","ValueType":"string","Method":"","ControlType":""} 
]'
where LabTestName = 'Urine RE/ME'
go
update LAB_LabTests
set LabTestComponentsJSON= '[{"Component":"Physical Examination","Method":"","ControlType":"Label"},{"Component":"Color","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Urine-Color"},  {"Component":"Appearance","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Turbidity"},  {"Component":"Reaction","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Urine-Reaction"},{"Component":"Chemical Examination","Method":"","ControlType":"Label"},   {"Component":"Albumin","Range":"3.5-5.5","RangeDescription":"3.5-5.5","ValueType":"number","Unit":"gm/dl","Method":"BCG"},  {"Component":"Sugar","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Trace"},{"Component":"Microscopic Examination","ValueType":"string","Method":"","ControlType":"Label"},   {"Component":"Pus Cells","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  {"Component":"RBC","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  {"Component":"Crystal","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Crystal-Type"},  {"Component":"Cast","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  {"Component":"Epithelial Cells","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Nil-Plenty"},  {"Component":"Ketone Bodies","Range":"","ValueType":"string","Method":"","ControlType":"SearchBox","ValueLookup":"Negative-Positive"}]'
where LabTestName = 'Urine RE/ME'
go
--------TestName: CBC(Hb,TC,DC,PLT) 

update LAB_LabTests
set LabTestComponentsJSON='[{"Component":"Haemoglobin","Unit":"g/dl","ValueType":"number","ControlType":"","Range":"11-17","RangeDescription":"11.0-17.0","Method":"","ValueLookUp":null,"MinValue":11,"MaxValue":17},
                            {"Component":"Total Leucocyte Count","Unit":"/mm3","ValueType":"number","ControlType":"","Range":"4,000-11,000","RangeDescription":"4,000-11,000","Method":"","ValueLookUp":null,"MinValue":null,"MaxValue":null},
							{"Component":"Total Platelet Count","Unit":"/cmm","ValueType":"number","ControlType":"","Range":"1,50,000-4,00,000","RangeDescription":"1,50,000-4,00,000","Method":"","ValueLookUp":null,"MinValue":null,"MaxValue":null},
							{"Component":"Differential Leucocyte Count (DLC)","Unit":null,"ValueType":null,"ControlType":"Label","Range":null,"RangeDescription":null,"Method":null,"ValueLookUp":null,"MinValue":null,"MaxValue":null},
							{"Component":"Neutrophil","Unit":"%","ValueType":"number","ControlType":"","Range":"40-70","RangeDescription":"40-70","Method":"","ValueLookUp":null,"MinValue":40,"MaxValue":70,"Group":"Check100"},
							{"Component":"Lymphocyte","Unit":"%","ValueType":"number","ControlType":"","Range":"20-45","RangeDescription":"20-45","Method":"","ValueLookUp":null,"MinValue":20,"MaxValue":45,"Group":"Check100"},
							{"Component":"Eosinophil","Unit":"%","ValueType":"number","ControlType":"","Range":"1-6","RangeDescription":"1-6","Method":"","ValueLookUp":null,"MinValue":1,"MaxValue":6,"Group":"Check100"},
							{"Component":"Monocyte","Unit":"%","ValueType":"number","ControlType":"","Range":"0-2","RangeDescription":"0-2","Method":"","ValueLookUp":null,"MinValue":0,"MaxValue":2,"Group":"Check100"},
							{"Component":"Basophil","Unit":"%","ValueType":"number","ControlType":"","Range":"0-1","RangeDescription":"0-1","Method":"","ValueLookUp":null,"MinValue":0,"MaxValue":1,"Group":"Check100"}]'
where LabTestName = 'CBC(Hb,TC,DC,PLT)'
go



--------End: Suraj--23 Aug/2018 --Update in LabTestComponentJson---------------------

---START: Ramavtar 23Aug'18 -- Alter of view table(added invoiceNo) and alter of SP_Report_BILL_TotalItemsBill(getting records from view table) --
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
  AS
/*
 FileName    : VW_BIL_TxnItemsInfoWithDateSeparation
 Description : This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks     : Add new fields as per requirements
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Aug'18- sud			created		To be used as common view for those billing reports where item level segregation is required
 2.		23Aug'18 - ramavtar		alter		added receipt no/invoice number in select(view table)
 -------------------------------------------------------------------------
*/
 SELECT
	txnItm.BillingTransactionItemId,
	txnItm.PatientId,
	txnItm.ItemId,
	txnItm.ItemName, 
	txnitm.ServiceDepartmentId,
	txnItm.ServiceDepartmentName,
	txnItm.ProviderId,
	txnItm.ProviderName,
	ISNULL(txnItm.BillingType,'Outpatient') AS 'BillingType',--default BillingType is Outpatient, so.. 
	txnItm.RequestingDeptId, -- sud:22Aug'18
	Convert(DATE, txnItm.CreatedOn) 'CreatedDate',
	Convert(DATE, txnItm.PaidDate) 'PaidDate',
	Convert(DATE, ret.CreatedOn)  'ReturnDate', 
	---cancelled---
	CASE WHEN txnItm.BillStatus = 'Cancel' THEN Convert(DATE,txnItm.CancelledOn) ELSE NULL END AS CancelledDate,

  ---provisional--
    ---below are conditions for Provisional--
	-----Invoice not Generated--
	--1. Billstatus = Provisional
	--2. BillStatus = Cancel  & CreatedOn != CancelledOn
	----Invoice Generated--
	--3. billstatus = unpaid  &  ItemCreatedOn != InvoiceCreatedOn
	--4. billstatus = paid  &   ItemCreatedOn != InvoiceCreatedOn   & PaymentMode != Credit   
  CASE WHEN txnItm.BillStatus = 'provisional' 
            THEN Convert(DATE, txnItm.CreatedOn) 
     WHEN   (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
	        THEN Convert(DATE,txnItm.CreatedOn)
     WHEN  (txnItm.BillingTransactionId IS NOT NULL
	        AND ( 
			      (txn.PaymentMode != 'credit' AND COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn) )
					OR (txnItm.BillStatus='unpaid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
					OR (txnItm.BillStatus='paid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txnItm.PaidDate))
				 )
		   ) THEN Convert(DATE, txnItm.CreatedOn) 
	ELSE NULL END AS ProvisionalDate,

--CREDIT---
  CASE WHEN (txn.PaymentMode='credit' AND txn.BillStatus='unpaid' )
	   OR ( txn.BillStatus='paid' AND Convert(Date,txn.CreatedOn)  != Convert(Date,txn.PaidDate) ) 
	   THEN CONVERT(DATE,txn.CreatedOn)
	   ELSE NULL END AS 'CreditDate',

	 txnItm.Price,
	 txnItm.Quantity,
	 txnItm.SubTotal,
	 txnItm.DiscountAmount,
	 txnitm.TotalAmount,
	 ret.TotalAmount 'ReturnAmount',
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks',
	 ISNULL(txn.InvoiceCode + '-' + CONVERT(VARCHAR,txn.InvoiceNo),'') 'InvoiceNumber'	-- ramavtar 23Aug'18
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO
--sp alter
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_TotalItemsBill] 	-- [SP_Report_BILL_TotalItemsBill] '2018-08-01', '2018-08-23'
		@FromDate DATETIME = NULL,
		@ToDate DATETIME = NULL,
		@BillStatus VARCHAR(MAX) = NULL,
		@ServiceDepartmentName VARCHAR(MAX) = NULL,
		@ItemName VARCHAR(MAX) = NULL
AS
/*
FileName: [sp_Report_TotalItemsBill]
CreatedBy/date: nagesh/2017-05-25
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       nagesh/2017-05-25	                created the script
2       umed / 2017-06-06                   Modify the script i.e format and alias of query
3       Umed / 2017-06-14                   alter i.e remove time from Date and added ISNULL with Fromdate,Todate,and other parameters
4.		dinesh/ 2017-07-27					modified the script and  added the Hospital Number  
5       Umed/ 2018-04-12                    Alter SP (Add Bill Date to First Because BugFixes workaround of Sequnce Number)
6.		Ramavtar/2018-08-18					Changed SP: taking data from view table --> VW_BIL_TxnItemsInfoWithDateSeparation
--------------------------------------------------------
*/
BEGIN
	SELECT
		txnItms.BillingDate,
		pat.PatientCode 'HospitalNumber',
		CONCAT(pat.FirstName, pat.LastName) 'PatientName',
		txnItms.InvoiceNumber,
		txnItms.ServiceDepartmentName,
		txnItms.ItemName,
		txnItms.Price,
		txnItms.Quantity,
		txnItms.SubTotal,
		txnItms.DiscountAmount,
		txnItms.TotalAmount,
		txnItms.ProviderName,
		txnItms.BillStatus
	FROM 
		(
			SELECT ProvisionalDate 'BillingDate', 'provisional' AS BillStatus, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ProvisionalDate IS NOT NULL
			UNION ALL
			SELECT CancelledDate 'BillingDate', 'cancel' AS BillStatus, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CancelledDate IS NOT NULL
			UNION ALL
			SELECT PaidDate 'BillingDate', 'paid' AS BillStatus, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE PaidDate IS NOT NULL
			UNION ALL
			SELECT CreditDate 'BillingDate', 'unpaid' AS BillStatus, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE CreditDate IS NOT NULL
			UNION ALL
			SELECT ReturnDate 'BillingDate', 'return' AS BillStatus, * FROM VW_BIL_TxnItemsInfoWithDateSeparation WHERE ReturnDate IS NOT NULL
		) txnItms
	LEFT JOIN PAT_Patient pat ON txnItms.PatientId = pat.PatientId
	WHERE (txnItms.BillingDate BETWEEN @FromDate AND @ToDate)
		AND (txnItms.BillStatus LIKE ISNULL(@BillStatus, txnItms.BillStatus) + '%')
		AND (txnItms.ServiceDepartmentName LIKE '%' + ISNULL(@ServiceDepartmentName, txnItms.ServiceDepartmentName) + '%')
		AND (txnItms.ItemName LIKE '%' + ISNULL(@ItemName, txnItms.ItemName) + '%')
	ORDER BY txnItms.BillingDate, txnItms.BillingTransactionItemId DESC
END
GO
---END: Ramavtar 23Aug'18 -- Alter of view table(added invoiceNo) and alter of SP_Report_BILL_TotalItemsBill(getting records from view table) --

--START: Ashim :28Aug2018 -- Modifications in Visit----
alter table PAT_PatientVisits
add TransferredProviderId int null
go

alter table  PAT_PatientVisits
alter column IsActive bit null
go
--END: Ashim :28Aug2018 -- Modifications in Visit----

--START: NageshBB: 27 Aug 2018-- Custom report stored procedure
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[SP_Report_BILL_CustomReport] 
 @FromDate date=null,
 @ToDate date=null,
 @ReportName varchar(200)=null
 AS
 /*
FileName: [SP_Report_BILL_CustomReport]
CreatedBy/date: Nagesh/2018-08-27
Description: sp for custom report like 100% on opd 
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/2018-08-27	              created the script

--------------------------------------------------------
*/
 BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
		BEGIN
			

			SELECT count(*) as NoOfPatient from BIL_TXN_BillingTransactionItems bil 
			WHERE (ServiceDepartmentName='OPD' and DiscountPercent=100 AND  ISNULL(ReturnStatus,0) != 1)
			AND CONVERT(date, bil.CreatedOn) Between @FromDate AND @ToDate


			;with T as 
			(
				SELECT  CONVERT(DATE,bil.CreatedOn) AS [Date],
				ItemName,dbo.FN_BIL_GetSrvDeptReportingName(bil.ServiceDepartmentName)as ServDepartmentName,Quantity,TotalAmount 
				from BIL_TXN_BillingTransactionItems  bil
				WHERE PatientId in 
				(   SELECT PatientId FROM BIL_TXN_BillingTransactionItems 
					WHERE (ServiceDepartmentName='OPD' and DiscountPercent=100 and ISNULL(ReturnStatus,0) != 1) 
					AND CONVERT(DATE, bil.CreatedOn) Between @FromDate AND @ToDate
				)   
			AND CONVERT(date, bil.CreatedOn) Between @FromDate AND @ToDate
			AND ISNULL(ReturnStatus,0) != 1      
			) 
			SELECT  CASE WHEN  [ItemName]='Vitamin D' OR ItemName='Health Card' THEN ItemName
               ELSE ServDepartmentName END  as Particulars
				,SUM(Quantity) AS TotalNumber, 
				SUM(TotalAmount) AS TotalIncome
				FROM T
				GROUP BY ( CASE WHEN  [ItemName]='Vitamin D' OR ItemName='Health Card' THEN ItemName
               ELSE ServDepartmentName END )
		end
end
Go
--END: NageshBB: 27 Aug 2018-- Custom report stored procedure

-- START: Ramavtar/27Aug'18 -- added custom-report perm and routeconfig --
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-customreport-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-customreport-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,Css)
    VALUES ('Custom', 'Reports/BillingMain/CustomReport', 'CustomReport', @prmId, @RouteId, 1, 1,'fa fa-money fa-stack-1x text-white')
GO
--- inserting calendarType parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
-- END: Ramavtar/27Aug'18 -- added custom-report perm and routeconfig --
--START: Nagesh 28 Aug 18 -- added missed column in inventory goods receipt
--add column istransferredtoacc
Alter table INV_TXN_GoodsReceipt
Add IsTransferredToAcc bit
go
--end: Nagesh 28 Aug 18 -- added missed column in inventory goods receipt



-----START: 28 Aug 2018 : Vikas --Create stored procedure for minimum stock report in pharmacy module -------

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_MinStockReport]  
@ItemName varchar(200) = null
AS
/*
FileName: [SP_PHRMReport_ExpiryReport]
CreatedBy/date: vikas/2018-08-21
Description: 
Remarks:    
Change History
----------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------
		Vikas/28Aug'18						created the script
----------------------------------------------------------------------------
*/
Begin 
IF (@ItemName IS NOT NULL)
	BEGIN
		select itm.ItemId ,itm.ItemName,stk.Quantity,convert(date,stk.ExpiryDate)as ExpiryDate,stk.BatchNo 
		from PHRM_MST_Item itm
			join PHRM_StockTxnItems stk
			on stk.ItemId=itm.ItemId
			where (((@ItemName=itm.ItemName OR @ItemName='') or itm.ItemName like '%'+ISNULL(@ItemName,'')+'%' ) 
					 AND stk.Quantity<10) 

	END
END
GO
-----END: 28 Aug 2018 : Vikas --Create stored procedure for minimum stock report in pharmacy module -------



--Start: ANish/ 29 Aug Flag added for Lab Report With normal and html template---
Alter table [dbo].[Lab_ReportTemplate]
add TemplateType varchar(100), TemplateHTML nvarchar(MAX);
Go

UPDATE [dbo].[Lab_ReportTemplate]
SET TemplateType='normal';
--End: 29 Aug/ Anish--

---Start: Sud: 29Aug'18--For HealthCard related corrections--

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Remarks'
              AND Object_ID = Object_ID(N'dbo.PAT_HealthCardInfo'))
BEGIN
	ALTER TABLE PAT_HealthCardInfo
	ADD Remarks Varchar(200)
END
GO
---End: Sud: 29Aug'18--For HealthCard related corrections--



-------START: SUD 30Aug-18--Merged Accounting Scripts to Incremental Datbase (we need only one incremental so)--
-----Note: start/end comments from different users are kept as it is from Accounting branch for future reference---

-------Start: Ashim: 3rdMay2018  Deleted Routes and Permissions------------------
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_MAP_RolePermission]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_RouteConfig]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-voucher-transaction-list')
delete from [dbo].[RBAC_Permission]
where PermissionId=@perId
go

declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_MAP_RolePermission]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_RouteConfig]
where PermissionId =@perId
go
declare @perId int;
set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='accounting-ledger-transaction-list')
delete from [dbo].[RBAC_Permission]
where PermissionId=@perId
go

  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Transaction/VoucherEntry',DisplayName='Voucher Entry',RouterLink='VoucherEntry'
  where RouterLink='TransactionCreate'
  go
  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-transaction-voucherentry-view'
  where PermissionName='accounting-transaction-vouchercreate-view'
  go
  

  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-view'
  where PermissionName='accounting-master-view'
  go
  update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgerlist-view'
  where PermissionName='accounting-master-ledgerlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgergroup-list-view'
  where PermissionName='accounting-master-ledgergroup-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-ledgergroupcategory-list-view'
  where PermissionName='accounting-settings-ledgergroupcategory-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-itemlist-view'
  where PermissionName='accounting-master-itemlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-voucherlist-view'
  where PermissionName='accounting-master-voucherlist-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-costcenter-item-list-view'
  where PermissionName='accounting-master-costcentric-item-list-view'
  go
   update [dbo].[RBAC_Permission]
  set PermissionName='accounting-settings-fiscalyear-list-view'
  where PermissionName='accounting-master-fiscalyear-list-view'
  go

  
  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings',DisplayName='Settings',RouterLink='Settings'
  where RouterLink='Master'
  go
  
  update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerList',DisplayName='Ledgers',DisplaySeq=1
  where RouterLink='LedgerList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerGroupList', DisplayName ='Ledger Groups',DisplaySeq=2
  where RouterLink='LedgerGroupList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/LedgerGroupCategoryList', DisplayName='Ledger Group Categories',DisplaySeq=3
  where RouterLink='LedgerGroupCategoryList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/ItemList', DisplayName='Items',DisplaySeq=4
  where RouterLink='ItemList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/VoucherList', DisplayName='Vouchers',DisplaySeq=5
  where RouterLink='VoucherList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/CostCenterItemList',DisplayName='Cost Center Items', RouterLink='CostCenterItemList',DisplaySeq=6
  where RouterLink='CostCentricItemsList'
  go
    update [dbo].[RBAC_RouteConfig]
  set UrlFullPath='Accounting/Settings/FiscalYearList',DisplaySeq=7
  where RouterLink='FiscalYearList'
  go

-------End: Ashim: 3rdMay2018  Deleted Routes and Permissions------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_TrailBalance]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_Report_ACC_TrailBalance]
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_ProfitLossStatement]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_Report_ACC_ProfitLossStatement]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetINVGoodsReceiptData]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_ACC_GetINVGoodsReceiptData]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]    Script Date: 21-08-2018 19:17:09 ******/
DROP PROCEDURE IF EXISTS [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]
GO

ALTER TABLE [dbo].[ACC_Transactions]  DROP CONSTRAINT IF EXISTS [FK_ACC_Transactions_ACC_MST_Vouchers]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [FK_ACC_TransactionItems_ACC_Transactions]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [FK_ACC_TransactionItems_ACC_Ledger]
GO

ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT IF EXISTS [IsActiveTransactionItems]
GO
ALTER TABLE [dbo].[ACC_MST_Vouchers] DROP CONSTRAINT IF EXISTS [IsActiveVouchers]
GO

/****** Object:  Table [dbo].[BIL_SYNC_BillingAccounting]    Script Date: 21-08-2018 19:17:09 ******/

DROP TABLE  IF EXISTS [dbo].[BIL_SYNC_BillingAccounting]
GO
/****** Object:  Table [dbo].[ACC_TXN_Link]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_TXN_Link]
GO
/****** Object:  Table [dbo].[ACC_Transactions]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_Transactions]
GO
/****** Object:  Table [dbo].[ACC_TransactionItems]    Script Date: 21-08-2018 19:17:09 ******/
DROP Table If exists [dbo].[ACC_TransactionCostCentricItems]
Go
DROP TABLE  IF EXISTS [dbo].[ACC_TransactionItems]
GO

/****** Object:  Table [dbo].[ACC_MST_MappingDetail]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_MappingDetail]
GO
/****** Object:  Table [dbo].[ACC_MST_GroupMapping]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_GroupMapping]
GO
/****** Object:  Table [dbo].[ACC_MST_FiscalYears]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_FiscalYears]
GO
/****** Object:  Table [dbo].[ACC_MST_CostCenterItems]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_CostCenterItems]
GO
/****** Object:  Table [dbo].[ACC_Ledger]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_Ledger]
GO
drop table if exists [dbo].[ACC_MAP_VoucherLedgerGroupMaps]
go
/****** Object:  Table [dbo].[ACC_MST_Vouchers]    Script Date: 21-08-2018 19:17:09 ******/
DROP TABLE IF EXISTS [dbo].[ACC_MST_Vouchers]
GO
/****** Object:  Table [dbo].[ACC_Ledger]    Script Date: 21-08-2018 19:17:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Ledger](
	[LedgerId] [int] IDENTITY(1,1) NOT NULL,
	[COA] [varchar](100) NULL,
	[Type] [varchar](100) NULL,
	[LedgerName] [varchar](100) NOT NULL,
	[NodeLevel] [int] NULL,
	[Description] [varchar](200) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_Ledger] PRIMARY KEY CLUSTERED 
(
	[LedgerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_CostCenterItems]    Script Date: 21-08-2018 19:17:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_CostCenterItems](
	[CostCenterItemId] [int] IDENTITY(1,1) NOT NULL,
	[CostCenterItemName] [varchar](50) NOT NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_MST_CostCenterItems] PRIMARY KEY CLUSTERED 
(
	[CostCenterItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_FiscalYears]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_FiscalYears](
	[FiscalYearId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearName] [varchar](50) NOT NULL,
	[StartDate] [datetime] NOT NULL,
	[EndDate] [datetime] NOT NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_MST_FiscalYears] PRIMARY KEY CLUSTERED 
(
	[FiscalYearId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_GroupMapping]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_GroupMapping](
	[GroupMappingId] [int] IDENTITY(1,1) NOT NULL,
	[Description] [varchar](200) NULL,
	[Section] [int] NULL,
 CONSTRAINT [PK_AccountingGroupMapping] PRIMARY KEY CLUSTERED 
(
	[GroupMappingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_MappingDetail]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_MappingDetail](
	[AccountingMappingDetailId] [int] IDENTITY(1,1) NOT NULL,
	[GroupMappingId] [int] NULL,
	[LedgerId] [int] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_MappingDetail] PRIMARY KEY CLUSTERED 
(
	[AccountingMappingDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_MST_Vouchers]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_Vouchers](
	[VoucherId] [int] IDENTITY(1,1) NOT NULL,
	[VoucherName] [varchar](200) NULL,
	[Description] [varchar](200) NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_Vouchers] PRIMARY KEY CLUSTERED 
(
	[VoucherId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_TransactionItems]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_TransactionItems](
	[TransactionItemId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionId] [int] NULL,
	[LedgerId] [int] NULL,
	[DrCr] [bit] NULL,
	[Amount] [float] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_TransactionItems] PRIMARY KEY CLUSTERED 
(
	[TransactionItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_Transactions]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Transactions](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[VoucherId] [int] NULL,
	[TransactionDate] [datetime] NULL,
	[FiscalYearId] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
	[Remarks] [nvarchar](200) NULL,
	[SectionId] [int] NULL,
	[VoucherNumber] [nvarchar](50) NULL,
 CONSTRAINT [PK_ACC_Transactions] PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ACC_TXN_Link]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_TXN_Link](
	[AccountingTxnLinkId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionId] [int] NULL,
	[ReferenceId] [int] NULL,
 CONSTRAINT [PK_ACC_TXN_Link] PRIMARY KEY CLUSTERED 
(
	[AccountingTxnLinkId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BIL_SYNC_BillingAccounting]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BIL_SYNC_BillingAccounting](
	[BillingAccountingSyncId] [int] IDENTITY(1,1) NOT NULL,
	[BillingTransactionId] [int] NULL,
	[StatusDate] [datetime] NULL,
	[Status] [nvarchar](100) NULL,
	[IsTransferedToAcc] [bit] NULL,
 CONSTRAINT [PK_BIL_SYNC_BillingAccounting] PRIMARY KEY CLUSTERED 
(
	[BillingAccountingSyncId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

--- creating trigger function

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TRIGGER [dbo].[TRG_BillingTransaction_BillToAccSync]
ON [dbo].[BIL_TXN_BillingTransaction]
AFTER INSERT, UPDATE
AS
BEGIN
  IF EXISTS (SELECT 1 FROM inserted)
  BEGIN
    DECLARE @id int, @status nvarchar(100)
	--GETTING VALUES FOR INSERTING IN SYNC TABLE
    SELECT @id = BillingTransactionId FROM inserted
    SELECT @status =
			   --CASE FOR SELECTING STATUS AS PER DIFFERENT SCENARIOS
               CASE
			   --MAKING FIRST LETTER IN UPPER-CASE LIKE 'PaidReturn', 'CreditUnpaid'
                 WHEN ReturnStatus = 1 THEN CONCAT(UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus)), 'Return')
                 ELSE CASE
                     WHEN PaymentMode = 'credit' THEN CONCAT(
                       UPPER(LEFT(PaymentMode, 1)) + SUBSTRING(PaymentMode, 2, LEN(PaymentMode)),
                       UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus)))
                     ELSE UPPER(LEFT(BillStatus, 1)) + SUBSTRING(BillStatus, 2, LEN(BillStatus))
                   END
               END
    FROM INSERTED
	--INSERTING VALUES TO SYNC TABLE
    INSERT INTO [dbo].[BIL_SYNC_BillingAccounting] (BillingTransactionId, StatusDate, Status)
      VALUES (@id, GETDATE(), @status)
  END
END
GO

ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] ENABLE TRIGGER [TRG_BillingTransaction_BillToAccSync]
GO
---insert acc_ledger data
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Inventory', 1, N'under Assets ->Current Assets', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Cash', 1, N'Under Assets-> Current Assents', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Liabilities', N'Current Liabilities', N'Duties and Taxes', 1, N'Under Liabilities -> Current Liabilities', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Bank', 1, N'Under Assets-> Current Assets', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Revenue', N'Inventory', N'Inventory', 0, N'Under Revenue->Inventory', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Revenue', N'Direct Income', N'Sales', 1, N'Under Revenue -> Revenue -> Sales Ledger', 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Investments', N'Short Term Investments', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES (N'Assets', N'Current Assets', N'Marketable Securities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Current Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Sundry Debtors', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Prepaids', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Current Assets', N'Advance Short Term', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Non Current Assets', N'Non Current Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Non Current Assets', N'Advance Long Term', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Investments', N'Long Term Investments', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Assets', N'Other Assets', N'Other Assets', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Sundry Creditors', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Accured Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Bank OD', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Provisions', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Current Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Current Liabilities', N'Unearned Revenue', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Long Term Liabilities', N'Long Term Liabilities', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Reserves and Surplus', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Retained Earnings', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Stockholder''s Equity', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Liabilities', N'Capital and Equity', N'Profit and Loss Account', 1, NULL, 1, GETDATE(), 0)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Cost of Goods Sold', N'Purchase Accounts', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Direct Expense', N'Direct Expenses', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Revenue from Operation', N'Sales', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Indirect Incomes', N'Indirect Income', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Revenue', N'Indirect Incomes', N'Sales Return', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Indirect Expenses', N'Administration Expenses', 1, NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_Ledger] ( [COA], [Type], [LedgerName], [NodeLevel], [Description], [CreatedBy], [CreatedOn], [IsActive]) VALUES ( N'Expenses', N'Cost of Goods Sold', N'Purchase Return', 1, NULL, 1, GETDATE(), 1)
GO


INSERT [dbo].[ACC_MST_FiscalYears] ( [FiscalYearName], [StartDate], [EndDate], [Description], [CreatedOn], [CreatedBy], [IsActive]) VALUES ( N'2018-2019', CAST(N'2018-04-01T00:00:00.000' AS DateTime), CAST(N'2019-03-31T00:00:00.000' AS DateTime), N'indian fiscal year for 2018-19', GETDATE(), 1, 1)
GO


INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCTransferRule', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'INVToACCTransferRule', 1)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCCreditTransfer', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCCreditReturn', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCBilPaidReturn', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) VALUES ( N'BillingToACCBilUnpaidReturn', 2)
GO


INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 7, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 2, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 4, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 1, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 2, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 11, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 7, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 4, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 11, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 2, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 33, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 2, 0)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 7, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 4, 1)
GO
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 11, 0)
GO

SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] ON 
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (1, N'Purchase Voucher', N'', GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (2, N'Sales Voucher', N'', GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (3, N'Journal Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (4, N'Payment Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (5, N'Receipt Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (6, N'Contra Voucher', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (7, N'Credit Note', NULL, GETDATE(), 1, 1)
GO
INSERT [dbo].[ACC_MST_Vouchers] ([VoucherId], [VoucherName], [Description], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES (8, N'Debit Note', NULL, GETDATE(), 1, 1)
GO
SET IDENTITY_INSERT [dbo].[ACC_MST_Vouchers] OFF
GO
ALTER TABLE [dbo].[ACC_MST_CostCenterItems] ADD  CONSTRAINT [IsActiveCostCenter]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_MST_Vouchers] ADD  CONSTRAINT [IsActiveVouchers]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_TransactionItems] ADD  CONSTRAINT [IsActiveTransactionItems]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_Ledger1]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping] FOREIGN KEY([GroupMappingId])
REFERENCES [dbo].[ACC_MST_GroupMapping] ([GroupMappingId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
GO
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO
ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
GO
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Transactions] FOREIGN KEY([TransactionId])
REFERENCES [dbo].[ACC_Transactions] ([TransactionId])
GO
ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Transactions]
GO
ALTER TABLE [dbo].[ACC_Transactions]  WITH CHECK ADD  CONSTRAINT [FK_ACC_Transactions_ACC_MST_Vouchers] FOREIGN KEY([VoucherId])
REFERENCES [dbo].[ACC_MST_Vouchers] ([VoucherId])
GO
ALTER TABLE [dbo].[ACC_Transactions] CHECK CONSTRAINT [FK_ACC_Transactions_ACC_MST_Vouchers]
GO
ALTER TABLE [dbo].[ACC_TXN_Link]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions] FOREIGN KEY([TransactionId])
REFERENCES [dbo].[ACC_Transactions] ([TransactionId])
GO
ALTER TABLE [dbo].[ACC_TXN_Link] CHECK CONSTRAINT [FK_ACC_TXN_Link_ACC_Transactions]
GO
ALTER TABLE [dbo].[BIL_SYNC_BillingAccounting]  WITH CHECK ADD  CONSTRAINT [FK_BIL_SYNC_BillingAccounting_BIL_TXN_BillingTransaction] FOREIGN KEY([BillingTransactionId])
REFERENCES [dbo].[BIL_TXN_BillingTransaction] ([BillingTransactionId])
GO
ALTER TABLE [dbo].[BIL_SYNC_BillingAccounting] CHECK CONSTRAINT [FK_BIL_SYNC_BillingAccounting_BIL_TXN_BillingTransaction]
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE Proc  [dbo].[SP_ACC_GetBilTxnItemsServDeptWise]
As
/*
FileName: [SP_ACC_GetBilTxnItemsServDeptWise]
CreatedBy/date: NageshBB/2018 June 27
Description: Get all Billing Transaction Items group by CreatedOn and ServiceDept wise
			 We transfer this all records to accounting
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    CreatedBy/UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1       NageshBB/2018 June 27							created the script
2		NageshBB/2018 July 02							Changed for get data Status wise (billStatus with PaymentMode)
------------------------------------------------------------------------------------------
*/
Begin


select 
bb.ServiceDepartmentName,
s.Status 
,CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END 
		  as 
		  PaymentMode
     
,convert(date,bb.CreatedOn) as CreatedOn,
ROUND(sum(bb.TotalAmount-bb.Tax),2)as TotalAmount,
sum(bb.Tax) as Tax,

STUFF((Select ','+convert(varchar(100),BillingTransactionItemId)from dbo.Bil_txn_billingTransactionItems as T1
join bil_sync_billingaccounting ts on ts.BillingTransactionId=t1.BillingTransactionId
join BIL_TXN_BillingTransaction tb
on tb.BillingTransactionId=t1.BillingTransactionId
where ((s.Status=ts.Status and convert(date, t1.CreatedOn)=convert(date,bb.CreatedOn))) 
and (((
CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END )=(CASE  WHEN ts.Status='PaidReturn' or ts.Status='UnpaidReturn'  THEN 'cash'
          WHEN tb.PaymentMode='cheque' then 'card' 
		  else tb.PaymentMode 
		  END 
))
and bb.ServiceDepartmentName=t1.ServiceDepartmentName)
FOR XML PATH('')),1,1, '') as ReferenceId,

STUFF((Select ','+convert(varchar(100),BillingAccountingSyncId)  from dbo.bil_sync_billingaccounting as ts
join BIL_TXN_BillingTransactionItems t1 on t1.BillingTransactionId=ts.BillingTransactionId
join BIL_TXN_BillingTransaction tb
on tb.BillingTransactionId=t1.BillingTransactionId
where ((s.Status=ts.Status and convert(date, t1.CreatedOn)=convert(date,bb.CreatedOn))) 
and (((
CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END )=(CASE  WHEN ts.Status='PaidReturn' or ts.Status='UnpaidReturn'  THEN 'cash'
          WHEN tb.PaymentMode='cheque' then 'card' 
		  else tb.PaymentMode 
		  END 
))
and bb.ServiceDepartmentName=t1.ServiceDepartmentName)
FOR XML PATH('')),1,1, '') as BillingAccountingSyncIds,
convert(varchar(100),convert(date,bb.CreatedOn))+' BillingTransaction entries to accounting of '+bb.ServiceDepartmentName+' service department' as Remarks

from BIL_TXN_BillingTransactionItems bb
join bil_sync_billingaccounting s
on bb.BillingTransactionId=s.billingTransactionId
join BIL_TXN_BillingTransaction b
on b.BillingTransactionId=bb.BillingTransactionId
where s.isTransferedToAcc!=1 or s.IsTransferedToAcc is null
group by Status,convert(date,bb.createdOn)
, bb.ServiceDepartmentName
,CASE  WHEN s.Status='PaidReturn' or s.Status='UnpaidReturn'  THEN 'cash'
          WHEN b.PaymentMode='cheque' then 'card' 
		  else b.PaymentMode 
		  END 
order by CreatedOn ,ServiceDepartmentName
End
GO
/****** Object:  StoredProcedure [dbo].[SP_ACC_GetINVGoodsReceiptData]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create Proc  [dbo].[SP_ACC_GetINVGoodsReceiptData]
As
/*
FileName: [[SP_ACC_GetINVGoodsReceiptData]]
CreatedBy/date: NageshBB/2018 July 03
Description:GEt all inventory goods receipt records group by date for transfer to accounting
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    CreatedBy/UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1       NageshBB/2018 July 03							created the script
------------------------------------------------------------------------------------------
*/
Begin

select Round(sum(gri.TotalAmount-gri.VATAmount),2) as TotalAmount
,sum(gri.VATAmount)as VAT
,convert(date,gri.CreatedOn) as CreatedOn,
'Inventory Goods Receipt entries to accounting on '+convert(varchar(100),convert(date,gri.CreatedOn)) as Remarks
,STUFF((SELECT ',' + convert(varchar(100),GoodsReceiptId)        
       FROM   dbo.INV_TXN_GoodsReceipt AS g
       WHERE (convert(date, gri.CreatedOn)= convert(date,g.CreatedOn))           
       FOR XML PATH('')), 1, 1, '') as ReferenceIds
 from INV_TXN_GoodsReceipt gr
join INV_TXN_GoodsReceiptItems gri
on gr.GoodsReceiptID=gri.GoodsReceiptId
where gr.istransferredToACC !=1 or gr.istransferredToACC is null
group by convert(date,gri.CreatedOn)
End
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_ProfitLossStatement]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ramavtar
-- Create date: 2018-06-20
-- Description:	profit loss report for accounting
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_ACC_ProfitLossStatement]
AS
BEGIN
	SELECT LedgerName,
	SUM(TI.Amount) 'AMOUNT'
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_MST_FiscalYears FY ON T.FiscalYearId = FY.FiscalYearId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
	WHERE FY.IsActive = 1 AND L.COA='Revenue'
	GROUP BY LedgerName

	SELECT LedgerName,
	SUM(TI.Amount) 'AMOUNT'
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_MST_FiscalYears FY ON T.FiscalYearId = FY.FiscalYearId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
	WHERE FY.IsActive = 1 AND L.COA='Expense'
	GROUP BY LedgerName
END
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_ACC_TrailBalance]    Script Date: 21-08-2018 19:17:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_ACC_TrailBalance]
		@FromDate Datetime ,
		@ToDate DateTime
AS
/*
FileName: [SP_Report_ACC_TrailBalance]
CreatedBy/date: Ramavtar/2018-06-20
Description: trail balance report for accounting 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Nagesh/2018-July-11                changes for get data by fromdate and todate                                          
------------------------------------------------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
	SELECT L.LedgerName,
	SUM(CASE WHEN TI.DrCr=1 THEN TI.Amount END) 'DEBIT',
	SUM(CASE WHEN TI.DrCr=0 THEN TI.Amount END) 'CREDIT' 
	FROM ACC_TransactionItems TI
	INNER JOIN ACC_Transactions T ON TI.TransactionId = T.TransactionId
	INNER JOIN ACC_Ledger L ON TI.LedgerId = L.LedgerId
WHERE (  
        (CONVERT(DATE,t.createdOn) >= CONVERT(DATE,@FromDate)) AND (CONVERT(date,t.createdon)<= CONVERT(DATE,@ToDate) )		
     )					
	GROUP BY L.LedgerName
	End
END
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Now 
section are hardcoded
1 -> Inventory
2->Billing
3->Pharmacy
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'ACC_MST_GroupMapping', @level2type=N'COLUMN',@level2name=N'Section'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'It like hospital code with transaction id i.e. HAMS_TransactionId , 
It will be null when comes from inventory' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'ACC_Transactions', @level2type=N'COLUMN',@level2name=N'VoucherNumber'
GO

-------END: SUD 30Aug-18--Merged Accounting Scripts to Incremental Datbase (we need only one incremental so)--

------Start:Dinesh 30th Aug'18 TRG_BillingTransaction_RestrictBillAlter changes for discount percent null--------

/****** Object:  Trigger [dbo].[TRG_BillingTransaction_RestrictBillAlter]    Script Date: 8/30/2018 2:04:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
--- Created: Sud: 9May'18
--- Description: This trigger is made to block users from editing certain columns of the billing transaction table
-- Remarks: Needs revision..
-- =============================================
ALTER TRIGGER [dbo].[TRG_BillingTransaction_RestrictBillAlter]
       ON [dbo].[BIL_TXN_BillingTransaction]
   AFTER UPDATE, DELETE
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE @TotalAmount_Ins float, @TotalAmount_Del float

	---in case of update, there'll be rows in both inserted and deleted--
	IF EXISTS(Select 1 from INSERTED)
	BEGIN
	  IF NOT EXISTS(
	    SELECT 1 from INSERTED i, DELETED d
		where i.InvoiceNo = d.InvoiceNo AND i.TotalQuantity = d.TotalQuantity AND i.SubTotal = d.SubTotal 
		and ISNULL(i.DiscountPercent,0) = ISNULL(d.DiscountPercent,0)
		and ISNULL(i.DiscountAmount,0) = ISNULL(d.DiscountAmount,0) and ISNULL(i.TaxTotal,0) = ISNULL(d.TaxTotal,0) and i.TotalAmount = d.TotalAmount
		and i.DepositAmount = d.DepositAmount and i.DepositReturnAmount = d.DepositReturnAmount
		and i.DepositBalance=d.DepositBalance and i.Tender=d.Tender and i.Change=d.Change and i.CreatedBy=d.CreatedBy
		and i.PaymentMode=d.PaymentMode
	  )
	   RAISERROR('Cannot change the value', 16,1); 
	END
	ELSE ----it comes here when any row is deleted--
	   RAISERROR('Cannot delete a row', 16,1); 

	SET NOCOUNT OFF;

END
GO
------End:Dinesh 30th Aug'18 TRG_BillingTransaction_RestrictBillAlter changes for discount percent null--------

----START: Ramavtar 30Aug'18 inserting perm,routes,caltypes and SP for daily-mis-report ----
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-dailymisreport-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-dailymisreport-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,Css)
    VALUES ('Daily MIS', 'Reports/BillingMain/DailyMISReport', 'DailyMISReport', @prmId, @RouteId, 1, 1,'fa fa-money fa-stack-1x text-white')
GO
--- inserting calendarTyoe parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
---creating SP
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Ramavtar/30Aug'18
-- Description:	daily mis report getting billing items with its department and billingtype info
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport]
@FromDate DATETIME = NULL,
@ToDate DATETIME = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
--------------------------------------------------------
*/
BEGIN

;WITH BilTxnItemsCTE AS
(
SELECT
	bil.BillingTransactionItemId, 
	pat.PatientCode AS HospitalNo,
	pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName AS PatientName,
	bil.ProviderName,
	dept.DepartmentName,
	bil.ServiceDepartmentName,
	ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
	bil.ItemName AS [description],
	bil.Price,
	bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
	ISNULL(bil.ReturnAmount,0) AS ReturnAmount,
    bil.TotalAmount AS total,
	ISNULL(bil.BillingType,'OutPatient') AS BillingType
FROM VW_BIL_TxnItemsInfoWithDateSeparation bil
JOIN PAT_Patient pat ON bil.PatientId = pat.PatientId
JOIN BIL_MST_ServiceDepartment sdept ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
JOIN MST_Department dept  ON dept.DepartmentId = sdept.DepartmentId
WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
)
SELECT
	CASE 
		WHEN [DepartmentName] = 'ADMINISTRATION' AND ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE' 
		WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES' 
		WHEN [DepartmentName] = 'OT' AND [DepartmentName] != '' THEN 'OT' 
		WHEN [Description] = 'BED CHARGES' THEN 'BED' 
		WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE' 
		WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE' 
		WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY' 
	ELSE DepartmentName END AS departmentName,
	HospitalNo 'hospitalNo',
	PatientName 'patientName',
	ProviderName 'providerName',
	BillingType,
    description 'itemName',
	Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
	ReturnAmount 'return',
    total - ReturnAmount 'netTotal'
FROM BilTxnItemsCTE
END
GO
----END: Ramavtar 30Aug'18 inserting perm,routes,caltypes and SP for daily-mis-report ----

--Start: Anish- 30 Aug' 18-- Set Nvarchar(Max) for Value field of Component in Lab---
Alter table [dbo].[LAB_TXN_TestComponentResult]
alter column Value nvarchar(MAX);
GO
--End: 30 Aug/ Anish

--Start: Mahesh- 30 Aug' Added Rack Table---

CREATE TABLE [dbo].[PHRM_MST_Rack](
  [RackId] [int] IDENTITY(1,1) NOT NULL,
  [ParentId] [int] NOT NULL,
  [Name] [nvarchar](200) NULL,
  [Description] [text] NULL,
  [CreatedOn] [datetime] NULL,
  [CreatedBy] [int] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[PHRM_MST_Rack]  WITH CHECK ADD FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

-- End: Mahesh - 30 Aug --


-----START: Sud: 31Aug'18--For Billing Reports (MISReports)---

/****** Object:  View [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]    Script Date: 8/30/2018 5:42:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


ALTER VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
  AS
/*
 FileName    : VW_BIL_TxnItemsInfoWithDateSeparation
 Description : This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks     : Add new fields as per requirements
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Aug'18- sud			created		To be used as common view for those billing reports where item level segregation is required
 2.		23Aug'18 - ramavtar		alter		added receipt no/invoice number in select(view table)
 3.     Sud/30Aug'18                        Revised for Provisional and BillStatus
 -------------------------------------------------------------------------
*/
 SELECT
	txnItm.BillingTransactionItemId,
	txnItm.PatientId,
	txnItm.ItemId,
	txnItm.ItemName, 
	txnitm.ServiceDepartmentId,
	txnItm.ServiceDepartmentName,
	txnItm.ProviderId,
	txnItm.ProviderName,
	ISNULL(txnItm.BillingType,'Outpatient') AS 'BillingType',--default BillingType is Outpatient, so.. 
	txnItm.RequestingDeptId, -- sud:22Aug'18
	Convert(DATE, txnItm.CreatedOn) 'CreatedDate',
	Convert(DATE, txnItm.PaidDate) 'PaidDate',
	Convert(DATE, ret.CreatedOn)  'ReturnDate', 
	---cancelled---
	CASE WHEN txnItm.BillStatus = 'Cancel' THEN Convert(DATE,txnItm.CancelledOn) ELSE NULL END AS CancelledDate,

  ---provisional--
    ---below are conditions for Provisional--
	-----Invoice not Generated--
	--1. Billstatus = Provisional
	--2. BillStatus = Cancel  & CreatedOn != CancelledOn
	----Invoice Generated--
	--3. billstatus = unpaid  &  ItemCreatedOn != InvoiceCreatedOn
	--4. billstatus = paid  &   ItemCreatedOn != InvoiceCreatedOn   & PaymentMode != Credit   
  CASE WHEN txnItm.BillStatus = 'provisional' 
            THEN Convert(DATE, txnItm.CreatedOn) 
     WHEN   (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
	        THEN Convert(DATE,txnItm.CreatedOn)
     WHEN  (txnItm.BillingTransactionId IS NOT NULL
	        AND ( 
			      (txn.PaymentMode != 'credit' AND COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn) )
					OR (txnItm.BillStatus='unpaid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
					OR (txnItm.BillStatus='paid' and  COnvert(Date,txnItm.CreatedOn) !=  COnvert(Date,txnItm.PaidDate))
				 )
		   ) THEN Convert(DATE, txnItm.CreatedOn) 
	ELSE NULL END AS ProvisionalDate,

--CREDIT---
  CASE WHEN (txn.PaymentMode='credit' AND txn.BillStatus='unpaid' )
	   OR ( txn.BillStatus='paid' AND Convert(Date,txn.CreatedOn)  != Convert(Date,txn.PaidDate) ) 
	   THEN CONVERT(DATE,txn.CreatedOn)
	   ELSE NULL END AS 'CreditDate',

	 txnItm.Price,
	 txnItm.Quantity,
	 txnItm.SubTotal,
	 txnItm.DiscountAmount,
	 txnitm.TotalAmount,
	 Case  WHEN ISNULL(txnItm.ReturnStatus,0)=1 THEN txnItm.TotalAmount ELSE 0 END AS  'ReturnAmount',
	-- ret.TotalAmount 'ReturnAmount',---this is incorrect.. use above: sud-30aug'18
	 ret.Remarks 'ReturnRemarks',
	 txnItm.CancelRemarks as 'CancelRemarks',
	 ISNULL(txn.InvoiceCode + '-' + CONVERT(VARCHAR,txn.InvoiceNo),'') 'InvoiceNumber'	-- ramavtar 23Aug'18
FROM 
	BIL_TXN_BillingTransactionItems txnItm WITH (NOLOCK)
	LEFT JOIN
	BIL_TXN_BillingTransaction txn  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = txn.BillingTransactionId
	LEFT JOIN
	BIL_TXN_InvoiceReturn ret  WITH (NOLOCK)
	ON txnItm.BillingTransactionId = ret.BillingTransactionId
GO

GO

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]    Script Date: 8/30/2018 5:44:00 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-08-19','2018-08-19')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 ------------------------------------------ */
AS
RETURN
( 

   -------------Start:Ot (Outer Table)-----------------------------------------
		SELECT 
		CASE WHEN A.PaidDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'PaidAmount',
		CASE WHEN A.ReturnDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'ReturnAmount',
		CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.Total_Temp ELSE 0 END AS 'CreditAmount',
		CASE WHEN A.CancelledDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'CancelledAmount',
		CASE WHEN A.ProvisionalDate IS NOT NULL 
			  AND A.CancelledDate IS NULL
			  AND A.CreditDate IS NULL
			  AND A.PaidDate IS NULL 
			  AND A.ReturnDate IS NULL 
			  THEN A.Total_Temp ELSE 0 END AS 'ProvisionalAmount',
       CASE WHEN A.ReturnDate IS NOT NULL THEN 'return'
	        WHEN A.PaidDate IS NOT NULL THEN 'paid'
			WHEN A.CreditDate IS NOT NULL THEN 'credit'
			WHEN A.CancelledDate IS NOT NULL THEN 'cancelled'
			WHEN A.ProvisionalDate IS NOT NULL THEN 'provisional'
			ELSE 'none' END AS 'BillStatus',

      ---in case bill was only returned on given date selection, we should omit the value also from Price, Qty, Subtotal, Discount fields..
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Price_Temp ELSE 0 END AS Price,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Qty_Temp ELSE 0 END AS Quantity,
      CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Subtot_Temp ELSE 0 END AS SubTotal,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Discount_Temp ELSE 0 END AS DiscountAmount,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS TotalAmount,

		* FROM 
		 (
		    ----------------------------------------------------------------------
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
			  --below four fields shouldn't be there when only return has happened in given date range.
			  Price AS Price_Temp,
			  Quantity AS Qty_Temp,
			  SubTotal AS Subtot_Temp,
			  DiscountAmount AS Discount_Temp,
			  TotalAmount AS Total_Temp, 
			   
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName) AS ServiceDepartmentName,
				ProviderId,ProviderName,
				
				BillingType, 
				RequestingDeptId,

					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE
		
		 ( A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL )

)---end of return
GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_DailyMISReport]    Script Date: 8/30/2018 5:45:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ramavtar/30Aug'18
-- Description:	daily mis report getting billing items with its department and billingtype info
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_DailyMISReport] --'2018-07-27','2018-07-27'
@FromDate DATETIME = NULL,
@ToDate DATETIME = NULL
AS
/*
FileName: SP_Report_BILL_DailyMISReport
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date		Remarks
-------------------------------------------------------
1       Ramavtar/2018-08-30	    created the script
2       Sud/2018-08-30          revised for provisional and billstatus
--------------------------------------------------------
*/
BEGIN

;WITH BilTxnItemsCTE AS
(
SELECT
	bil.BillingTransactionItemId, 
	pat.PatientCode AS HospitalNo,
	pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ','') + pat.LastName AS PatientName,
	bil.ProviderName,
	dept.DepartmentName,
	bil.ServiceDepartmentName,
	CONVERT(Varchar(25),@FromDate)+'-to-'+CONVERT(Varchar(25),@ToDate) 'billDate',
	--ISNULL(bil.PaidDate,bil.CreatedDate) AS billDate,
	bil.ItemName AS [description],
	bil.Price,
	bil.Quantity AS qty,
    bil.SubTotal AS subTotal,
    bil.DiscountAmount AS discount,
	ISNULL(bil.ReturnAmount,0) AS ReturnAmount,
    bil.TotalAmount AS total,
	bil.BillStatus, --sud:30Aug'18
	bil.ProvisionalAmount As 'ProvisionalAmount',--sud:30Aug'18 (We'll need this as well)
	ISNULL(bil.BillingType,'OutPatient') AS BillingType
FROM (Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  (@FromDate,@ToDate)) bil
JOIN PAT_Patient pat ON bil.PatientId = pat.PatientId
JOIN BIL_MST_ServiceDepartment sdept ON sdept.ServiceDepartmentId = bil.ServiceDepartmentId
JOIN MST_Department dept  ON dept.DepartmentId = sdept.DepartmentId
--WHERE bil.CreatedDate BETWEEN @FromDate AND @ToDate
)
SELECT
	CASE 
		WHEN [DepartmentName] = 'ADMINISTRATION' AND ServiceDepartmentName != 'CONSUMEABLES' THEN 'ADMINISTRATIVE' 
		WHEN ServiceDepartmentName = 'CONSUMEABLES' THEN 'CONSUMEABLES' 
		WHEN [DepartmentName] = 'OT' AND [DepartmentName] != '' THEN 'OT' 
		WHEN [Description] = 'BED CHARGES' THEN 'BED' 
		WHEN [Description] = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' THEN 'DOCTOR AND NURSING CARE' 
		WHEN [DepartmentName] = 'MEDICINE' THEN 'MEDICINE' 
		WHEN [DepartmentName] = 'SURGERY' THEN 'SURGERY' 
	ELSE DepartmentName END AS departmentName,
	HospitalNo 'hospitalNo',
	PatientName 'patientName',
	ProviderName 'providerName',
	BillingType,
    description 'itemName',
	Price 'price',
    qty 'quantity',
    subTotal 'subTotal',
    discount 'discount',
	ReturnAmount 'return',
    ISNULL(total,0) - ISNULL(ReturnAmount,0) 'netTotal',
	BillStatus 'billStatus',
	ProvisionalAmount as 'provisional'
FROM BilTxnItemsCTE
order by departmentName ASC, BillingType DESC, PatientName ASC

END
GO

-----END: Sud: 31Aug'18--For Billing Reports (MISReports)---

--Start: Anish: 31 Aug --Description field added in LabReportTemplate table--
	Alter table [dbo].[Lab_ReportTemplate] Add Description varchar(200);
--End: ANish 31Aug--


---START: Sud/Anish: 31Aug -- Adding ReportTemplates into db---

---we need unique key on some name--
ALTER TABLE [dbo].[Lab_ReportTemplate] ADD  CONSTRAINT [UK_LAB_ReportTemplate_TemplateSName] UNIQUE NONCLUSTERED 
(
	ReportTemplateShortName ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

--Histopathological Report for Bone marrow ----

INSERT INTO [dbo].[Lab_ReportTemplate]
           ([ReportTemplateShortName]
           ,[ReportTemplateName]
           ,[IsActive]
           ,[HeaderText]
           ,[ColSettingsJSON]
           ,[TemplateType]
           ,[TemplateHTML]
           ,[Description])
     VALUES
           ('Histopathology-1',
		   'Histopathology-1',
		   1,
		   'Histopathlogy Report',
		   '{"Name":"true","Result":"true","Range":"true","Method": "true","Unit":"true","Remarks":"true"}',
		   'html',
		   '<h1 style="text-align:center"><strong><em><u>HISTOPATHOLOGY REPORT</u></em></strong></h1>  <h3><strong>SPECIMEN:&nbsp;</strong></h3>  <h1><span style="font-size:20px"><strong>GROSS FINDINGS</strong></span>:</h1>  <p>&nbsp;</p>  <h3><strong>HISTOPATHOLOGICAL FINDINGS:</strong></h3>  <p><strong>Bony trabeculae&nbsp; &nbsp; &nbsp;:&nbsp;</strong></p>  <p><strong>Cellularity&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Myelopoiesis&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Erythropoiesis&nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Lymphopoiesis&nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Plasma cells&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Granulomas&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Impression&nbsp; &nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Comment&nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p>&nbsp;</p>  <p>&nbsp;</p> ',
           '(Test for bone marrow)'
		   )
GO


----Histopathological test for biopsy -----

INSERT INTO [dbo].[Lab_ReportTemplate]
           ([ReportTemplateShortName]
           ,[ReportTemplateName]
           ,[IsActive]
           ,[HeaderText]
           ,[ColSettingsJSON]
           ,[TemplateType]
           ,[TemplateHTML]
           ,[Description])
     VALUES
           ('Histopathology-2',
		   'Histopathology-2',
		   1,
		   'Histopathology Report',
		   '{"Name":"true","Result":"true","Range":"true","Method": "true","Unit":"true","Remarks":"true"}',
		   'html',
		   '<h1 style="text-align:center"><strong><em><u>HISTOPATHOLOGY REPORT</u></em></strong></h1>  <h3><strong>SPECIMEN:&nbsp;</strong></h3>  <h1><span style="font-size:20px"><strong>GROSS FINDINGS</strong></span>:</h1>  <h3><strong>HISTOPATHOLOGICAL FINDINGS:</strong></h3>  <p><strong>IMPRESSION :-</strong></p>  <p>&nbsp;</p>  <p>&nbsp;</p>  <p>&nbsp;</p> ',
		   '(Test for biopsy)'
		   )
GO


--Cytology Test --


INSERT INTO [dbo].[Lab_ReportTemplate]
           ([ReportTemplateShortName]
           ,[ReportTemplateName]
           ,[IsActive]
           ,[HeaderText]
           ,[ColSettingsJSON]
           ,[TemplateType]
           ,[TemplateHTML]
           ,[Description])
     VALUES
           ('Hematology-2',
		   'Hematology-2',
		   1,
		   'Hematology Report',
		   '{"Name":"true","Result":"true","Range":"true","Method": "true","Unit":"true","Remarks":"true"}',
		   'html',
		   '<h1 style="text-align:center"><strong><u>Hematology Report</u></strong></h1>  <h3><strong>Specimen:&nbsp;</strong></h3>  <h3><u><strong>Hematological findings:</strong></u></h3>  <p><strong>Cellularity&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Leucopoiesis&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Erythropoiesis&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>M:E ratio&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Megakaryocytes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Plasma Cells&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Parasites&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong></p>  <p><strong>Granulomas&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong></p>  <p><strong>Impression&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp; :</strong></p>  <p>&nbsp;</p>  <p>&nbsp;</p>  <p>&nbsp;</p> ',
          '(Test for Hematology)'
		   )
GO


---Hematology test ---

INSERT INTO [dbo].[Lab_ReportTemplate]
           ([ReportTemplateShortName]
           ,[ReportTemplateName]
           ,[IsActive]
           ,[HeaderText]
           ,[ColSettingsJSON]
           ,[TemplateType]
           ,[TemplateHTML])

     VALUES
           ('Cytology',
		   'Cytology',
		   1,
		   'Cytology Report',
		   '{"Name":"true","Result":"true","Range":"true","Method": "true","Unit":"true","Remarks":"true"}',
		   'html',
		   '<h1 style="text-align:center"><strong><em><u>Cytology Report</u></em></strong></h1>  <h3><strong>Specimen:&nbsp;</strong></h3>  <p>&nbsp;</p>  <p><strong>Impression&nbsp;:</strong></p>  <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</p>  <p>&nbsp;</p>  <p><strong>Note</strong>: Cytological Diagram should always be corelated with the clinical findings.</p>  <p>There are chances of false negative and positive results in FNAC</p>  <p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>  <p>&nbsp;</p> '
		   )
GO

--Start: Anish: 31 Aug --Footer Text added in LabReportTemplate table--
	Alter table [dbo].[Lab_ReportTemplate]
	add FooterText varchar(2000);
	Go
--End: ANish 30Aug--


---END: Sud/Anish: 31Aug -- Adding ReportTemplates into db---

---START: Ajay : 31Aug -- added isCancel column in phramacy gr---
--added one column for goods receipt cancel functionality
Alter Table PHRM_GoodsReceipt
Add IsCancel bit null
go
---END: Ajay : 31Aug -- added isCancel column in phramacy gr---



--STart: Anish: September 1--
Update  [dbo].[Lab_ReportTemplate]
set ColSettingsJSON = '{"Name":true,"Result":true,"Range":true,"Method": false,"Unit":true,"Remarks":false}';
 INSERT INTO [dbo].[CORE_CFG_Parameters]
           ([ParameterGroupName]
           ,[ParameterName]
           ,[ParameterValue]
           ,[ValueDataType]
           ,[Description])
     VALUES (
	 'LAB','LabReportHeader','{"showLabReportHeader":true}','JSON','To Show Header Image of Hospital in LabReport'
	 )
--End--
GO
--start: ashim: 01Sep2018--
alter table [dbo].[LAB_TXN_LabReports]
alter column TemplateId int null
go
--end: ashim: 01Sep2018--

---START: Mahesh : 2 Sep -- alter rack column in pharma item table ---

alter table PHRM_MST_Item alter column Rack int;
GO
---END: Mahesh : 2 Sep -- alter rack column in pharma item table ---

---START: Abhishek : 3 Sep -- add free amount ---
alter table [dbo].[PHRM_ReturnToSupplier]
add FreeAmount decimal(18,4)
go
alter table [dbo].[PHRM_ReturnToSupplierItems]
add FreeRate decimal (18,4)
go
---END: Abhishek : 3 Sep -- add free amount ---

---Start: Sud: 3Sept'18--For Lab-Template -
Update Lab_ReportTemplate
set TemplateType='culture'
where ReportTemplateShortName='UrineCS'
GO
---End: Sud: 3Sept'18--For Lab-Template -

---start: sud:4sept'18 -- forward integration from Test branch -- ref: Abhishek---
------Start:Abhishek 31th Aug'18  add a column freeQunatity for credit note--------
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'FreeQuantity'
              AND Object_ID = Object_ID(N'dbo.PHRM_ReturnToSupplierItems'))
BEGIN
alter table [dbo].[PHRM_ReturnToSupplierItems]
add FreeQuantity int null
END
go
------End:Abhishek 31th Aug'18  add a column freeQunatity for credit note--------
---end: sud:4sept'18 -- forward integration from Test branch -- ref: Abhishek---

----------Start: Dinesh 9th September 2018 Live Bulild Version 1.1.6 Reverse integration from DEV Branch  -----------


---START: Ramavtar 5Sept'18: SPs for Doc Summary report, routes and perm ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptItemsSummary] @FromDate datetime = NULL,
@ToDate datetime = NULL,
@DoctorId int = NULL,
@SrvDeptName varchar(max) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Ramavtar/04Sept'18    		initail draft
----------------------------------------------------------
*/
BEGIN
    SELECT
        COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) 'Date',
        ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
        pat.PatientCode,
        pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
        fnItems.ServiceDepartmentName,
        fnItems.ItemName,
        fnItems.Price,
        fnItems.Quantity,
        fnItems.SubTotal,
        fnItems.DiscountAmount,
        fnItems.TotalAmount,
        fnItems.ReturnAmount,
        fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
    FROM (SELECT
        *
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
    JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
    WHERE fnItems.ServiceDepartmentName = @SrvDeptName
    AND ISNULL(fnItems.ProviderId, 0) = @DoctorId
	ORDER BY COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) DESC
END
GO
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptSummary]
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL,
  @DoctorId INT = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date          Remarks
----------------------------------------------------------
1    Sud/02Sept'18           Initial Draft
----------------------------------------------------------
*/
BEGIN
    SELECT
        ISNULL(fnItems.ProviderId, 0) 'DoctorId',
        ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
        fnItems.ServiceDepartmentName 'ServiceDepartment',
        SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
        SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
        SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
        SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
    FROM (SELECT *
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems

    ---NOTE: we should return All if @DoctorId=NULL, DoctorName='NoDoctor' when @DoctorId=0
    WHERE (ISNULL(@DoctorId, ISNULL(fnItems.ProviderId, 0)) = ISNULL(fnItems.ProviderId, 0))
    GROUP BY fnItems.ServiceDepartmentName,
             ISNULL(fnItems.ProviderId, 0),
             ISNULL(fnItems.ProviderName, 'NoDoctor')

    ---Table:2 Get Provisional Amount in above Date Filter---
    SELECT SUM(ISNULL(ProvisionalAmount, 0)) 'ProvisionalAmount'
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		Sud/02Sept'18
-- Description:		to show doctor summary
-- Remarks: 
---[SP_Report_BIL_DoctorSummary] '2018-08-02','2018-09-02'
-- =============================================
CREATE PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/02Sept'18			     Initial Draft
----------------------------------------------------------
*/
BEGIN
    SELECT
        ISNULL(Providerid, 0) 'DoctorId',
        CASE WHEN ISNULL(ProviderId, 0) != 0 THEN CONCAT(FirstName + ' ', ISNULL(E.MiddleName + ' ', ''), E.LastName) ELSE 'NoDoctor' END AS 'DoctorName',
        SUM(ISNULL(SubTotal, 0)) 'SubTotal',
        SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
        SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
        SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
    FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
    LEFT JOIN EMP_Employee E ON ProviderId = EmployeeId
    GROUP BY ISNULL(Providerid, 0),
             E.FirstName,
             E.MiddleName,
             E.LastName
END
GO
-- perm, routeconfig
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-doctorsummaryreport-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-doctorsummaryreport-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,Css)
    VALUES ('Doctor Summary', 'Reports/BillingMain/DoctorSummaryReport', 'DoctorSummary', @prmId, @RouteId, 1, 1,'fa fa-money fa-stack-1x text-white')
GO
--- inserting calendarTyoe parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np","DoctorSummary":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO

---END: Ramavtar 5Sept'18: SPs for Doc Summary report, routes and perm ---


--Start: ANish: Sept 5, 2018 ReportTemplateID additin on LabRequisition Table---
alter table [dbo].[LAB_TestRequisition]
add ReportTemplateId int null;
GO
--End: ANish: Sept 5, 2018 ReportTemplateID additin on LabRequisition Table---
--Start: Abhishek: Sept 6, 2018 ExpiryDate Column Addition---
alter table [dbo].[PHRM_TXN_InvoiceItems]
add ExpiryDate datetime null
go
--End: Abhishek: Sept 6, 2018 ExpiryDate Column Addition---

--Start: Abhishek: Sept 6, 2018 Update ExpiryDate Column of InvoiceItemId 06/09/2018
update invTxnItem
set invTxnItem.ExpiryDate =

cmmon.ExpiryDate
from


(select DISTINCT stk.ExpiryDate,  invitm.InvoiceItemId
from PHRM_StockTxnItems as stk
inner join  [dbo].[PHRM_TXN_InvoiceItems] as invitm on stk.ReferenceNo= invitm.InvoiceId 
where stk.ItemId = invitm.ItemId and stk.BatchNo =invitm.BatchNo and stk.TransactionType= 'sale' ) cmmon

JOIN

PHRM_TXN_InvoiceItems invTxnItem

ON cmmon.InvoiceItemId = invTxnItem.InvoiceItemId
GO
--End: Abhishek: Sept 6, 2018 Update ExpiryDate Column of InvoiceItemId 06/09/2018

--Start: Suraj/Ashim:[6th september 2018] Update Script for ReportTemplateId in lab requisition table---
update req
set req.ReportTemplateId =(select test.ReportTemplateId from LAB_LabTests test where req.LabTestId = test.LabTestId)
from LAB_TestRequisition req
join LAB_LabTests reqTest on req.LabTestId = reqTest.LabTestId
where req.ReportTemplateId is null
go
alter table LAB_TestRequisition
alter column ReportTemplateId int not null
go
--End: Suraj/Ashim:[6th september 2018] Update Script for ReportTemplateId in lab requisition table---

--- Start: Suraj:[6th september 2018] Adding new column in RAD_PatientImagingReport ---

ALTER TABLE [dbo].[RAD_PatientImagingReport]
ADD Signatories varchar(MAX);
go
--- End: Suraj:[6th september 2018] Adding new column in RAD_PatientImagingReport ---

--Start: Abhishek: Sept 7, 2018 Update GRID
/****** Object:  StoredProcedure [dbo].[SP_PHRM_GoodsReceiptProductReport]    Script Date: 9/7/2018 1:33:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_PHRM_GoodsReceiptProductReport] 
@FromDate datetime=null,
@ToDate datetime=null,
@ItemId int=null
 AS
 /*
FileName: [SP_PHRM_GoodsReceiptProductReport]
CreatedBy/date:Vikas/2018-08-10
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Vikas/2018-08-10                created the script
2      Nagesh/2018-08-11               updated
3	   Abhishek/ 2018-09-7				updated
--------------------------------------------------------
*/
 BEGIN
  
    BEGIN
    select gr.GoodReceiptPrintId, grp.ItemId, grp.ItemName, grp.BatchNo,grp.ReceivedQuantity,grp.FreeQuantity,
    grp.GRItemPrice as [ItemPrice],grp.MRP,spl.SupplierName,spl.ContactNo,
    convert(date,grp.CreatedOn) as [Date] from PHRM_GoodsReceiptItems grp
      join PHRM_GoodsReceipt gr
      on grp.GoodReceiptId=gr.GoodReceiptId
        join PHRM_MST_Supplier spl
        on gr.SupplierId=spl.SupplierId
        where(( CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate) and (@ItemId IS NULL or @ItemId=0 ))
        or  ((CONVERT(date, grp.CreatedOn) Between @FromDate AND @ToDate)  and grp.ItemId=@ItemId  ) 
  End
End
Go
--End: Abhishek: Sept 7, 2018 Update GRID


--Start: Anish(7 Sept) Addeing new column for Custom DoctorNAme in LabReport table--
Alter table [dbo].[LAB_TXN_LabReports]
Add ReferredByDr varchar(100);
Go
--End: ANish (7 Sept)--

--STart: ANish (7 Sept Display sequence implementation for LabTest)
Alter table [dbo].[LAB_LabTests]
Add DisplaySequence int;
Go
Update [dbo].[LAB_LabTests]
set DisplaySequence=1000;
--ENd:---

--Start: Ashim: 6th Sep 2018 : Using ReportingName in lab, Parameter for default signatories
alter table [dbo].[LAB_LabTests]
add ReportingName varchar(150) null
go
update [dbo].[LAB_LabTests]
set ReportingName = LabTestName
go
Insert Into [dbo].[CORE_CFG_Parameters] (ParameterGroupName, ParameterName, ParameterValue, ValueDataType, Description)
Values('LAB','DefaultSignatoriesEmpId','{"empIdList":[59,118]}','JSON','Default employees for lab signatories')
go
--End: Ashim: 6th Sep 2018 : Using ReportingName in lab, Parameter for default signatories

--Start: Abhishek: 9th Sep 2018: Adding PatientID on invoiceTransaction Model
alter table PHRM_TXN_InvoiceItems 
add PatientId int null
go
alter table PHRM_ReturnToSupplierItems
add FreeAmount decimal(10,4) null
go
--End: Abhishek: 9th Sep 2018: Adding PatientID on invoiceTransaction Model


--Start: Anish :9 Sept, Interpretation added in LabTest Table--
Alter table [dbo].[LAB_LabTests]
add Interpretation varchar(2000);
Go
--End: Anish :9 Sept--

----------End: Dinesh 9th September 2018 Live Bulild Version 1.1.6 Reverse integration from DEV Branch  -----------

----------Start: Dinesh 11th September 2018 Live Bulild Version 1.1.7 Deployed in Live -----------
----start: sud: 10Sept'18--for billing packages--

Alter Table BIL_TXN_BillingTransaction
ADD PackageId INT
GO
Alter Table BIL_TXN_BillingTransaction
ADD PackageName Varchar(200)
GO
---this was needed since there are a lot of Consultation charges which are inactive.
--- if inactive then it won't come in package's item assignment part...
Update BIL_CFG_BillItemPrice
SET IsActive=1
WHERE ServiceDepartmentId=1 and ItemName='Consultation Charge' and IsActive=0
GO
----end: sud: 10Sept'18--for billing packages--

----start: dinesh :10th_Sept'18: FN_BIL_GetSrvDeptReportingName and FN_BIL_GetTxnItemsInfoWithDateSeparation changes -----
GO
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName]    Script Date: 9/10/2018 10:46:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTO') 
 when (@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  THEN ('FNAC') 
   when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY') 
					OR(@ServiceDeptName='LABORATORY') THEN ('PATHOLOGY')
					
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )

END




GO



/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]    Script Date: 9/10/2018 10:30:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-08-19','2018-08-19')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.       Dinesh/10Sept'18      passing itemname along with srvDeptName to the function
 ------------------------------------------ */
AS
RETURN
( 

   -------------Start:Ot (Outer Table)-----------------------------------------
		SELECT 
		CASE WHEN A.PaidDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'PaidAmount',
		CASE WHEN A.ReturnDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'ReturnAmount',
		CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.Total_Temp ELSE 0 END AS 'CreditAmount',
		CASE WHEN A.CancelledDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'CancelledAmount',
		CASE WHEN A.ProvisionalDate IS NOT NULL 
			  AND A.CancelledDate IS NULL
			  AND A.CreditDate IS NULL
			  AND A.PaidDate IS NULL 
			  AND A.ReturnDate IS NULL 
			  THEN A.Total_Temp ELSE 0 END AS 'ProvisionalAmount',
       CASE WHEN A.ReturnDate IS NOT NULL THEN 'return'
	        WHEN A.PaidDate IS NOT NULL THEN 'paid'
			WHEN A.CreditDate IS NOT NULL THEN 'credit'
			WHEN A.CancelledDate IS NOT NULL THEN 'cancelled'
			WHEN A.ProvisionalDate IS NOT NULL THEN 'provisional'
			ELSE 'none' END AS 'BillStatus',

      ---in case bill was only returned on given date selection, we should omit the value also from Price, Qty, Subtotal, Discount fields..
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Price_Temp ELSE 0 END AS Price,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Qty_Temp ELSE 0 END AS Quantity,
      CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Subtot_Temp ELSE 0 END AS SubTotal,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Discount_Temp ELSE 0 END AS DiscountAmount,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS TotalAmount,

		* FROM 
		 (
		    ----------------------------------------------------------------------
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
			  --below four fields shouldn't be there when only return has happened in given date range.
			  Price AS Price_Temp,
			  Quantity AS Qty_Temp,
			  SubTotal AS Subtot_Temp,
			  DiscountAmount AS Discount_Temp,
			  TotalAmount AS Total_Temp, 
			   
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,ProviderName,
				
				BillingType, 
				RequestingDeptId,

					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE
		
		 ( A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL )

)---end of return

GO
----end: dinesh :10th_Sept'18: FN_BIL_GetSrvDeptReportingName and FN_BIL_GetTxnItemsInfoWithDateSeparation changes -----

----------End: Dinesh 11th September 2018 Live Bulild Version 1.1.7 Deployed in Live -----------

----------------------------Start: Dinesh 15th September 2018 Live Bulild Version 1.1.8 going to Deploy in Live --------------------------------------------

--- START: Ramavtar: 11Sep'18: creating SPs, and inserting perm and routeconfig for report-department-summary  ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2018-08-01','2018-09-11'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
----------------------------------------------------------
*/
BEGIN
	SELECT
		fnItems.ServiceDepartmentName 'ServiceDepartment',
		SUM(ISNULL(fnItems.Quantity, 0)) 'Quantity',
		SUM(ISNULL(fnItems.SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(fnItems.DiscountAmount, 0)) 'DiscountAmount',
		SUM(ISNULL(fnItems.TotalAmount, 0)) 'TotalAmount',
		SUM(ISNULL(fnItems.ReturnAmount, 0)) 'ReturnAmount',
		SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) 'NetSales'
	FROM (SELECT
		*
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
	GROUP BY fnItems.ServiceDepartmentName
END
GO
---creating SP: SP_Report_BIL_DepartmentItemSummary
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_BIL_DepartmentItemSummary]
@ToDate DATETIME = NULL,
@FromDate DATETIME = NULL,
@SrvDeptName NVARCHAR(MAX) = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
----------------------------------------------------------
*/
BEGIN
	SELECT
    COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) 'Date',
    ISNULL(fnItems.ProviderName, 'NoDoctor') AS 'DoctorName',
    pat.PatientCode,
    pat.FirstName + ' ' + ISNULL(pat.MiddleName + ' ', '') + pat.LastName 'PatientName',
    fnItems.ServiceDepartmentName,
    fnItems.ItemName,
    fnItems.Price,
    fnItems.Quantity,
    fnItems.SubTotal,
    fnItems.DiscountAmount,
    fnItems.TotalAmount,
    fnItems.ReturnAmount,
    fnItems.TotalAmount - fnItems.ReturnAmount 'NetAmount'
FROM (SELECT
    *
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)) fnItems
JOIN PAT_Patient pat
    ON fnItems.PatientId = pat.PatientId
WHERE fnItems.ServiceDepartmentName = @SrvDeptName
ORDER BY COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) DESC
END
GO
--- inserting permission
DECLARE @appId INT
	SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'RPT')

INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES 
		('reports-billingmain-departmentsummaryreport-view', @appId, 1, GETDATE(), 1)
GO
--- inserting routeConfig
DECLARE @prmId int,
        @RouteId int
SET @prmId = (SELECT TOP (1) PermissionId FROM RBAC_Permission WHERE PermissionName = 'reports-billingmain-departmentsummaryreport-view')
SET @RouteId = (SELECT TOP (1) RouteId FROM RBAC_RouteConfig WHERE UrlFullPath = 'Reports/BillingMain')

INSERT INTO RBAC_RouteConfig (DisplayName, UrlFullPath, RouterLink, PermissionId, ParentRouteId, DefaultShow, IsActive,Css)
    VALUES ('Department Summary', 'Reports/BillingMain/DepartmentSummaryReport', 'DepartmentSummary', @prmId, @RouteId, 1, 1,'fa fa-money fa-stack-1x text-white')
GO
--- inserting calendarTyoe parameter
UPDATE CORE_CFG_Parameters
SET ParameterValue = '{"LaboratoryServices":"np","PatientRegistration":"en,np","PatientVisit":"en,np","GovReportSummary":"en,np","AccountingFiscalYear":"en,np","PatientCensusReport":"en,np","DoctorOutPatientReport":"en,np","DoctorwiseIncomeSummary":"en,np","CustomReport":"en,np","DailyMISReport":"en,np","DoctorSummary":"en,np","DepartmentSummary":"en,np"}'
WHERE ParameterGroupName = 'Common' AND ParameterName = 'CalendarTypes'
GO
---creating SP: SP_BILL_GetServiceDepartmentsName
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_BILL_GetServiceDepartmentsName]
/*
 File: SP_BILL_GetServiceDepartmentsName Created: Ramavtar/2018-09-09
 Description: to get service-departments name for reporting 
 (it gets all the service department names as require in reporting)
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Ramavtar/11Sep'18                        Initial Draft
 -------------------------------------------------------------------------------
*/
AS
BEGIN
	SELECT DISTINCT
		[dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName, ItemName) 'ServiceDepartmentName'
	FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
END
GO
--- END: Ramavtar: 11Sep'18: creating SPs, and inserting perm and routeconfig for report-department-summary  ---

---start: sud: 12Sept'18-- for labs and employee updates--

Update EMP_Employee
set MiddleName=NULL WHERE MiddleName=' ' 
GO
Update EMP_Employee
set LongSignature=NULL WHERE LongSignature=' ' 
GO
Update EMP_Employee
SET LongSignature=ISNULL(Salutation+'. ','') + FirstName + ISNULL(' '+MiddleName,'')+' '+ LastName 
WHERE  IsAppointmentApplicable=1 AND LongSignature is null 
GO
---end: sud: 12Sept'18-- for labs and employee updates--

---start: sud: 13Sept'18--To manage LabCounter for Ip billing requisition---
Update BIL_CFG_Counter
SET CounterType='BILLING'
WHERE CounterType IS NULL
GO
Insert into BIL_CFG_Counter(CounterName,CounterType,CreatedBy,CreatedOn)
Values('Lab Counter','LAB',1,getdate())
GO

---correcting componentjson of some tests--
Update LAB_LabTests
SET LabTestComponentsJSON='[{"Component":"progesterone","Range":"Men:0.1-0.2, Women: Follicular Phase: <0.1-0.3, Ovulatory period: 12.0-82.0, Luteal Phase:1.2-15.9,Menopause: <0.1-0.2","RangeDescription":"Men:0.1-0.2, Women: Follicular Phase: <0.1-0.3, Ovulatory period: 12.0-82.0, Luteal Phase:1.2-15.9, Menopause: <0.1-0.2","ValueType":"number","Unit":"mIU/ml","Method":"CLIA"}]'
where LabTestName='progesterone' and LabTestId=86
GO

Update LAB_LabTests
SET LabTestComponentsJSON='[{"Component":"prolactin","Range":"Male: 3-25, Female: 5-35","RangeDescription":"Male: 3-25, Female: 5-35","ValueType":"number","Unit":"ng/ml","Method":"FIA"}]'
where LabTestName='prolactin' and LabTestId=85
GO

---end: sud: 13Sept'18--To manage LabCounter for Ip billing requisition---

------start: Dinesh: 14th Sept'18: SP for Patient Census, FN_BIL_GetSrvDeptReportingName, FN_BIL_GetTxnItemsInfoWithDateSeparation changes-----

---------------Doctor summary Report not showing the provisional Amount correction ---------------------------------------------
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]    Script Date: 9/12/2018 10:32:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
---Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation]  ('2018-09-12','2018-09-12')
--- select * from VW_BIL_TxnItemsInfoWithDateSeparation
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation]
 Created: 15Aug'18 <sud>
 Description: This takes item's info from a view and does separation of Different Dates and Amount based on input values.
 Remarks: Needs Revision, Add more fields as per requirments
 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Sud/15Aug'18           Initial Version
 2.      Sud/22Aug'18           Updated for TotalCollection  <Needs Revision>
 3.      Sud/30Aug'18           Revised for Provisional and BillStatus
 4.       Dinesh/10Sept'18      passing itemname along with srvDeptName to the function
 5.       Dinesh/14Sept'18      added Provisional amount for doctor summary report
 ------------------------------------------ */
AS
RETURN
( 

   -------------Start:Ot (Outer Table)-----------------------------------------
		SELECT 
		CASE WHEN A.PaidDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'PaidAmount',
		CASE WHEN A.ReturnDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'ReturnAmount',
		CASE WHEN A.CreditDate IS NOT NULL AND A.PaidDate IS NULL AND A.ReturnDate IS NULL THEN A.Total_Temp ELSE 0 END AS 'CreditAmount',
		CASE WHEN A.CancelledDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS 'CancelledAmount',
		CASE WHEN A.ProvisionalDate IS NOT NULL 
			  AND A.CancelledDate IS NULL
			  AND A.CreditDate IS NULL
			  AND A.PaidDate IS NULL 
			  AND A.ReturnDate IS NULL 
			  THEN A.Total_Temp ELSE 0 END AS 'ProvisionalAmount',
       CASE WHEN A.ReturnDate IS NOT NULL THEN 'return'
	        WHEN A.PaidDate IS NOT NULL THEN 'paid'
			WHEN A.CreditDate IS NOT NULL THEN 'credit'
			WHEN A.CancelledDate IS NOT NULL THEN 'cancelled'
			WHEN A.ProvisionalDate IS NOT NULL THEN 'provisional'
			ELSE 'none' END AS 'BillStatus',

      ---in case bill was only returned on given date selection, we should omit the value also from Price, Qty, Subtotal, Discount fields..
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Price_Temp ELSE 0 END AS Price,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Qty_Temp ELSE 0 END AS Quantity,
      CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Subtot_Temp ELSE 0 END AS SubTotal,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Discount_Temp ELSE 0 END AS DiscountAmount,
	  CASE WHEN A.PaidDate IS NOT NULL OR A.CreditDate IS NOT NULL OR A.ProvisionalDate IS NOT NULL THEN A.Total_Temp ELSE 0 END AS TotalAmount,

		* FROM 
		 (
		    ----------------------------------------------------------------------
			  SELECT PatientId, BillingTransactionItemId, ItemId, ItemName, ServiceDepartmentId,
			  --below four fields shouldn't be there when only return has happened in given date range.
			  Price AS Price_Temp,
			  Quantity AS Qty_Temp,
			  SubTotal AS Subtot_Temp,
			  DiscountAmount AS Discount_Temp,
			  TotalAmount AS Total_Temp, 
			   
				--we're using below scalar value function to get reporting name of item's SrvDeptName 
				[dbo].[FN_BIL_GetSrvDeptReportingName] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,ProviderName,
				
				BillingType, 
				RequestingDeptId,

					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
			-------------------------------------------------------------------
			) A  -- end of inner select
			---no need to return those items where none of below fields are there---
		WHERE
		
		 ( A.ProvisionalDate IS NOT NULL
			OR A.CancelledDate IS NOT NULL
			OR A.CreditDate IS NOT NULL
			OR A.PaidDate IS NOT NULL
			OR A.ReturnDate IS NOT NULL )

)---end of return

GO


/****** Object:  StoredProcedure [dbo].[SP_Report_BILL_PatientCensus]    Script Date: 9/14/2018 3:28:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] --[SP_Report_BILL_PatientCensus] '2018-08-08','2018-08-08'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Ramavtar/03Aug'18			created the script
2		Ramavtar/9Aug'18		getting summary of deposit, and deposit-return (as table 3),
								excluding entry where billstatus == cancel and for return items we are not including its amount in totalcollection
3.      sud  --					updated after creating common function. 
4.      dinesh /14thSep'18      grouped and  merged the labcharges and miscellaneous to the respective single view header 
----------------------------------------------------------
*/
BEGIN

DECLARE @cols AS NVARCHAR(MAX),
		@query AS NVARCHAR(MAX)

select @cols = STUFF((SELECT DISTINCT ',' + 
( CASE when (i.ServiceDepartmentName='ATOMIC ABSORTION')
OR(i.ServiceDepartmentName='BIOCHEMISTRY')
OR(i.ServiceDepartmentName='CLNICAL PATHOLOGY')
OR(i.ServiceDepartmentName='CLINICAL PATHOLOGY')
OR(i.ServiceDepartmentName='CYTOLOGY')
OR(i.ServiceDepartmentName='KIDNEY BIOPSY')
OR(i.ServiceDepartmentName='SKIN BIOPSY')
OR(i.ServiceDepartmentName='CONJUNCTIVAL BIOPSY')
OR(i.ServiceDepartmentName='EXTERNAL LAB-3')
OR(i.ServiceDepartmentName='EXTERNAL LAB - 1')
OR(i.ServiceDepartmentName='EXTERNAL LAB - 2')
OR(i.ServiceDepartmentName='HISTOPATHOLOGY')
OR(i.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY')
OR(i.ServiceDepartmentName='MOLECULAR DIAGNOSTICS')
OR(i.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS')
OR(i.ServiceDepartmentName='SEROLOGY')
OR(i.ServiceDepartmentName='MICROBIOLOGY')
OR(i.ServiceDepartmentName='HEMATOLOGY')
OR(i.ServiceDepartmentName='LABORATORY')
OR(i.ServiceDepartmentName='LAB CHARGES')
    then QUOTENAME ('PATHOLOGY')
	when(i.ServiceDepartmentName='DUCT')
OR(i.ServiceDepartmentName='MAMMOLOGY')
OR(i.ServiceDepartmentName='PERFORMANCE TEST') 
OR(i.ServiceDepartmentName='MRI')
OR(i.ServiceDepartmentName='C.T. SCAN')
OR(i.ServiceDepartmentName='ULTRASOUND')
OR(i.ServiceDepartmentName='ULTRASOUND COLOR DOPPLER')
OR(i.ServiceDepartmentName='BMD-BONEDENSITOMETRY')
OR(i.ServiceDepartmentName='OPG-ORTHOPANTOGRAM')
OR(i.ServiceDepartmentName='MAMMOGRAPHY')
OR(i.ServiceDepartmentName='X-RAY')
OR(i.ServiceDepartmentName='DEXA')
OR(i.ServiceDepartmentName='IMAGING')
then ('RADIOLOGY')
when (i.ServiceDepartmentName='MISCELLANEOUS')
OR (i.ServiceDepartmentName='MISCELLENOUS CHARGES')
then ('MISCELLANEOUS')
when(i.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
OR(i.ServiceDepartmentName='CARDIOVASCULAR SURGERY')
then 'CTVS'
	ELSE
 QUOTENAME(i.ServiceDepartmentName) END) 
               FROM BIL_TXN_BillingTransactionItems i
			   WHERE CONVERT(DATE,i.CreatedOn) BETWEEN @FromDate AND @ToDate
			   FOR XML PATH(''), TYPE
               ).value('.', 'NVARCHAR(MAX)') 
               ,1,1,'')	

---to remove the start and end bracket from column names in return table.
SELECT 'DoctorName' + ISNULL(',' + REPLACE(REPLACE(@cols, '[', ''), ']', ''), '') + ',TotalPatient,TotalCollection' AS ColumnName

set @query = 
'
SELECT A.*, B.TotalPatient, B.TotalCollection 
	FROM (
		SELECT ProviderName AS DoctorName,' + @cols + ' 
			FROM (
                SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,ServiceDepartmentName,
				
				 BillingTransactionItemId
				 FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] ('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
				) x
				PIVOT 
				(
				COUNT(BillingTransactionItemId)
                FOR 
				ServiceDepartmentName
				IN (' + @cols + ')
				) p 
	) A			
	JOIN
	(
	SELECT ISNULL(ProviderName,''No Doctor'') as ProviderName,(COUNT(Distinct PatientId)) as TotalPatient, 
			SUM(PaidAmount - ReturnAmount + ProvisionalAmount - CancelledAmount + CreditAmount ) as TotalCollection
		FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' )
		
		GROUP BY ProviderName
	)B 
	ON A.DoctorName = B.ProviderName
'

--print(@query)
 execute(@query);
 ---Table: 3: Get Summary of Deposit, Deposit-Return, Provisional & Unpaid to show in patient census--
SELECT Distinct dep.AdvanceReceived,dep.AdvanceSettled,prov.Provisional,prov.Unpaid 
FROM 
(
	SELECT
		SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
		SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled'
	FROM [FN_BIL_GetDepositNProvisionalBetnDateRange] (@FromDate, @ToDate)
) dep,
(
   Select SUM(ProvisionalAmount-CancelledAmount) 'Provisional',
       SUM(CreditAmount) 'Unpaid'
	   from  [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation](@FromDate, @ToDate)
)prov

END
GO
-----------------------------------------------------------------

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptReportingName]    Script Date: 9/14/2018 3:36:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptReporingName  Created: 22Aug'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Reports as per Input ServiceDepartmentName
 Remarks: We can extend this function for ItemName as well if needed.
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/22Aug'18                        Initial Draft
 2.       Dinesh/10Sept'18                    passing itemname along with srvDeptName to the function
 3.		  dinesh /14thSep'18      grouped and  merged the labcharges and miscellaneous to the respective single view header 
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when (@ServiceDeptName='LABORATORY' and @ItemName='HISTO')  THEN ('HISTO') 
 when (@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY' and @ItemName like '%FNAC%')  THEN ('FNAC') 
   when (@ServiceDeptName='ATOMIC ABSORTION')
					OR(@ServiceDeptName='BIOCHEMISTRY')
					OR(@ServiceDeptName='CLNICAL PATHOLOGY')
					OR(@ServiceDeptName='CLINICAL PATHOLOGY')
					OR(@ServiceDeptName='CYTOLOGY')
					OR(@ServiceDeptName='KIDNEY BIOPSY')
					OR(@ServiceDeptName='SKIN BIOPSY')
					OR(@ServiceDeptName='CONJUNCTIVAL BIOPSY')
					OR(@ServiceDeptName='EXTERNAL LAB-3')
					OR(@ServiceDeptName='EXTERNAL LAB - 1')
					OR(@ServiceDeptName='EXTERNAL LAB - 2')
					OR(@ServiceDeptName='HISTOPATHOLOGY')
					OR(@ServiceDeptName='IMMUNOHISTROCHEMISTRY')
					OR(@ServiceDeptName='MOLECULAR DIAGNOSTICS')
					OR(@ServiceDeptName='SPECIALISED BIOPHYSICS ASSAYS')
					OR(@ServiceDeptName='SEROLOGY')
					OR(@ServiceDeptName='MICROBIOLOGY')
					OR(@ServiceDeptName='HEMATOLOGY') 
					OR(@ServiceDeptName='LABORATORY')
					OR(@ServiceDeptName='LAB CHARGES') THEN ('PATHOLOGY')
					
		   WHEN (@ServiceDeptName='DUCT')
					OR(@ServiceDeptName='MAMMOLOGY')
					OR(@ServiceDeptName='PERFORMANCE TEST') 
					OR(@ServiceDeptName='MRI')
					OR(@ServiceDeptName='C.T. SCAN')
					OR(@ServiceDeptName='ULTRASOUND')
					OR(@ServiceDeptName='ULTRASOUND COLOR DOPPLER')
					OR(@ServiceDeptName='BMD-BONEDENSITOMETRY')
					OR(@ServiceDeptName='OPG-ORTHOPANTOGRAM')
					OR(@ServiceDeptName='MAMMOGRAPHY')
					OR(@ServiceDeptName='X-RAY')
					OR(@ServiceDeptName='DEXA')
					OR(@ServiceDeptName='IMAGING')  		THEN ('RADIOLOGY')
		  when (@ServiceDeptName='MISCELLANEOUS')
					OR (@ServiceDeptName='MISCELLENOUS CHARGES')
															then ('MISCELLANEOUS')
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS')
				OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )

END

GO


------End: Dinesh: 14th Sept'18: SP for Patient Census, FN_BIL_GetSrvDeptReportingName, FN_BIL_GetTxnItemsInfoWithDateSeparation changes-----

---start: sud: 15th Sept'18-- for Lab-Requisitions--
GO
Alter Table LAB_TestRequisition
ADD IsActive BIT Constraint DEFAULT_LAB_TestRequisition_IsActive DEFAULT (1) 
GO
--- by default set isactive=1 for all lab requisitions--
Update LAB_TestRequisition
Set IsActive=1
GO

alter table [dbo].[RAD_PatientImagingRequisition]
alter column [BillingStatus] Varchar(20)
GO

alter table [dbo].[RAD_PatientImagingRequisition]
alter column ImagingItemName Varchar(200)
GO

Alter Table [dbo].[RAD_MST_ImagingItem]
Alter Column ImagingItemName Varchar(200)
GO
---end: sud: 15th Sept'18-- for Lab-Requisitions and Imaging LiveBugFix--

---start: sud: 16sept'18-- for lab-tests table--
alter table [dbo].[LAB_LabTests]
alter column [LabTestComponentsJSON] varchar (max)
go
Insert Into CORE_CFG_LookUps(ModuleName,LookUpName, LookupDataJson)
Values('Lab','PBS-RBC','["Microcytic Hypochromic","Normocytic Normochromic","Macrocytic Normochromic"]')
GO
---end: sud: 16sept'18-- for lab-tests table--

------------DEPLOYED IN LIVE: 16thSept 11AM----------------End: Dinesh 15th September 2018 Live Bulild Version 1.1.8 going to Deploy in Live --------------------------------------------


--Start: Anish: 15 Sept, HospitalName in CoreCFG table added----
Insert into [dbo].[CORE_CFG_Parameters]
(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
values ('Common','HospitalName','HAMS','string','It contains name of Hospital for which it is made');
GO
--End: Anish: 15 Sept, HospitalName in CoreCFG table added----


--start: sud: 17Sept'18-- for Labs--
Update CORE_CFG_LookUps
set LookupDataJson='["Sensitive","Intermediate","Resistant"]'
where LookUpName='Culture-Sensitivity' and ModuleName='Lab'
GO

Update LAB_LabTests
set LabTestComponentsJSON='[{"Component":"Isolated Organism","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":"","ValueLookup":"Isolated-Organism","DisplaySequence":1},{"Component":"Amikacin (ak)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":"","ValueLookup":"Culture-Sensitivity","DisplaySequence":2},{"Component":"Amoxycillin (amx)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":3},{"Component":"Azithromycin (azm)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":4},{"Component":"Carbenicillin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":5},{"Component":"Cefazolin (cz)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":6},{"Component":"Cefixime (cfm)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":7},{"Component":"Ceftazidime (caz)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":8},{"Component":"Ceftizoxime","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":10},{"Component":"Ceftriaxone (ctr)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":12},{"Component":"Cefuroxime Sodium","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":13},{"Component":"Cephalexin (cn)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":14},{"Component":"Cephotaxime (ctx)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":15},{"Component":"Cephoxitin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":16},{"Component":"Cefepime (cpm)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":17},{"Component":"Chloramphenical","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":18},{"Component":"Ciprofloxacin (cip)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":20},{"Component":"Clarithromycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":21},{"Component":"Clindamycin (cd)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":22},{"Component":"Cloxacillin (cox)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":23},{"Component":"Co-trimoxazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":24},{"Component":"Colistin (cl)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":25},{"Component":"Doxycycline","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":26},{"Component":"Erythromycin (e)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":27},{"Component":"Fluconazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":28},{"Component":"Gentamycin (g)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":29},{"Component":"Imipenum (ipm)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":30},{"Component":"Kanamycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":32},{"Component":"Ketokonazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":33},{"Component":"Levofloxacin (le)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":34},{"Component":"Meropenum (mrp)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":35},{"Component":"Methicillin (met)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":36},{"Component":"Nalidixic Acid","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":37},{"Component":"Nalidixic Acid (na)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":38},{"Component":"Neomycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":39},{"Component":"Nitrofurantoin (nit)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":40},{"Component":"Norfloxacin (nx)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":41},{"Component":"Novobiocin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":42},{"Component":"Ofloxacin (of)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":44},{"Component":"Oxacillin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":45},{"Component":"Oxacillin (ox)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":46},{"Component":"Piperacillin/Tazobactum","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":47},{"Component":"Pipercillin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":48},{"Component":"Polymycin b","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":49},{"Component":"Polymyxin-b","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":50},{"Component":"Ticarcillin/Clavulanic Acid","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":52},{"Component":"Tetracycline","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":53},{"Component":"Trimethopim","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":54},{"Component":"Vancomycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":80}]'
where LabTestName IN ('URINE FOR C/S','STOOL FOR C/S','SPUTUM FOR C/S','PUS FOR C/S','PLEURAL FLUID FOR C/S','PERITONEAL FLUID FOR C/S','Urine C/S','TISSUE FOR C/S','Stool C/S','Sputum C/S','ET Tube C/S','BONE MARROW FOR C/S','ASCITIC FLUID FOR C/S')
GO

--end: sud: 17Sept'18-- for Labs--
--- START: Ramavtar:18sep'18 -- change in [SP_BILL_GetServiceDepartmentsName] ---
IF OBJECT_ID('SP_BILL_GetServiceDepartmentsName', 'P') IS NOT NULL
    DROP PROCEDURE SP_BILL_GetServiceDepartmentsName
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_BILL_GetServiceDepartmentsName]
/*
 File: SP_BILL_GetServiceDepartmentsName Created: Ramavtar/2018-09-09
 Description: to get service-departments name for reporting 
 (it gets all the service department names as require in reporting)
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.		Ramavtar/11Sep'18					Initial Draft
 2.		Ramavtar/18Sep'18					passing itemname as parameter to fn -- as FN was changed.
 -------------------------------------------------------------------------------
*/
AS
BEGIN
    SELECT DISTINCT
        [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName, ItemName) 'ServiceDepartmentName'
    FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation]
END
GO
--- END: Ramavtar:18sep'18 -- change in [SP_BILL_GetServiceDepartmentsName] ---


-----START: DEPLOYED ON LIVE: ON 29th September 2018---------------
-----Start: Salakha: 18-9-2018 -Created sp for stock manage detail report[phrm] 
/****** Object:  StoredProcedure [dbo].[SP_PHRMReport_StockManageDetailReport]    Script Date: 18-09-2018 14:18:58 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_PHRMReport_StockManageDetailReport] 
	@FromDate DateTime=null,
	@ToDate DateTime=null

AS
/*
FileName: SP_PHRMReport_StockManageDetailReport
CreatedBy/date:Salakha/18/09/2018
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Salakha/18/09/2018	                     created the script

--------------------------------------------------------
*/

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL))
		BEGIN
			SELECT convert(date,stkMng.CreatedOn) as [Date] ,itm.ItemName, stkMng.BatchNo, stkMng.ExpiryDate ,stkMng.Quantity,
			case when stkMng.InOut='in'then 'stock added' else 'stock deducted'
			end as InOut 
					FROM PHRM_StockManage stkMng
            INNER JOIN PHRM_MST_Item itm on itm.ItemId = stkMng.ItemId
            WHERE  convert(datetime, stkMng.CreatedOn)
           BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
		END		
End

GO
-----END: Salakha: 18-9-2018 -Created sp for stock manage detail report[phrm]


--Start: Anish: 18Sept: Comments column addition in LabReport---
Alter table [dbo].[LAB_TXN_LabReports]
Add Comments varchar(4000);
Go
--End: Anish: 18 Sept---


---start: ashim : 18Sep2018---Lab changes--
alter table [dbo].[LAB_TestRequisition]
add BillingType varchar(20) null
go

update labReq
set labReq.BillingType = 'Inpatient'
from [dbo].[LAB_TestRequisition] labReq
join [dbo].[PAT_PatientVisits] visit on labReq.PatientVisitId = visit.PatientVisitId
where visit.VisitType = 'inpatient'
go

update labReq
set BillingType = 'Outpatient'
from [dbo].[LAB_TestRequisition] labReq
join [dbo].[PAT_PatientVisits] visit on labReq.PatientVisitId = visit.PatientVisitId
where visit.VisitType = 'outpatient'
go

update [dbo].[LAB_TestRequisition]
set BillingType ='Outpatient'
where PatientVisitId is null
go
---end: ashim : 18Sep2018---Lab changes--

----start: sud--19Sept'18-- labs and billing updates---
---to update all lab tests's Isactive comparing it with BillingItem's IsActive Status--
Update tst
set tst.IsActive=bilItm.IsActive
from LAB_LabTests tst, BIL_CFG_BillItemPrice bilItm, BIL_MST_ServiceDepartment srv
where bilItm.ServiceDepartmentId=srv.ServiceDepartmentId
	and srv.IntegrationName='Lab'
	and tst.LabTestId = bilItm.ItemId
	and tst.LabTestName=bilItm.ItemName
	and bilItm.IsActive=0
GO

Update BIL_MST_ServiceDepartment
SET ServiceDepartmentShortName='GST'
where ServiceDepartmentId=12 and ServiceDepartmentName='GASTROENTEROLOGY'
GO
Update BIL_MST_ServiceDepartment
SET ServiceDepartmentShortName='GIS'
where ServiceDepartmentId=126 and ServiceDepartmentName='General Surgery'
GO
Update BIL_MST_ServiceDepartment
SET ServiceDepartmentShortName='ER'
where ServiceDepartmentId=112 and ServiceDepartmentName='EMERGENCY'
GO


Alter Table LAB_TXN_TestComponentResult
Add IsActive BIT Constraint DF_LabCompResult_IsActive DEFAULT(1) NULL
GO

----end: sud--19Sept'18-- Lab Changes (isactive)--- 

---start: ashim: 24Sep2018 : Changes for Emergency Visit----
update [dbo].[BIL_MST_ServiceDepartment]
set IntegrationName='OPD' where ServiceDepartmentName='EMERGENCY'
go
declare @deptId int;
set @deptId = (select DepartmentId from MST_Department where DepartmentName='EMERGENCY/CASUALTY')

INSERT INTO [dbo].[EMP_Employee]
           ([FirstName],[LastName],[DepartmentId],[LongSignature],[CreatedBy],[CreatedOn],[IsActive],[IsAppointmentApplicable])
     VALUES
           ('Duty','Doctor',@deptId,'Duty Doctor',1,GETDATE(),1,1)
GO
---end: ashim: 24Sep2018 : Changes for Emergency Visit----


---start: ashim: 24Sep2018 : Updated IntegrationName for Emergency
update [dbo].[BIL_MST_ServiceDepartment]
set IntegrationName='ER' where ServiceDepartmentName='EMERGENCY'
go

---end: ashim: 24Sep2018 : Updated IntegrationName for Emergency

--Start: Anish: 26 Sept: Updated RunLength Type(Sample Code)--
  alter table [dbo].[LAB_LabTests]
  add RunNumberType varchar(200);
  Go

  Update [dbo].[LAB_LabTests]
  set RunNumberType = 'normal';
  Go

  alter table [dbo].[Lab_ReportTemplate]
  add DisplaySequence int null;
  Go

  Update [dbo].[Lab_ReportTemplate]
  set DisplaySequence = 100;
  Go
  
  alter table [dbo].[LAB_TestRequisition]
  add RunNumberType varchar(200);
  Go

  Update [dbo].[LAB_TestRequisition]
  set RunNumberType = 'normal';
  Go

--End: Anish: 26 Sept:----

--Start: Anish: 28 Sept BillingType changed to VisitType in Requisition table---
sp_rename 'LAB_TestRequisition.BillingType' , 'VisitType', 'COLUMN'; 
--END: ANish: 28 Sept---


---start: sud-28Sept'18--
GO
--needed visit type other than billingtype beacause of Labs--
Alter Table BIL_TXN_BillingTransactionitems
Add VisitType varchar(50) NULL
GO

---end: sud-28Sept'18---



---start yubraj 24 th sept 2018----
  alter table [BIL_CFG_BillItemPrice]
  add ItemCode varchar (10);
  go

ALTER TABLE [BIL_CFG_BillItemPrice]
add IsDoctorMandatory bit null default 0
go
  ---end yubraj 24 th sept 2018----

  
----start Suraj: 28th september 2018 [Moved Add IP Lab billing button] ---------

  INSERT INTO [dbo].[RBAC_Permission]
           ([PermissionName]
           ,[ApplicationId]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive])
     VALUES
          ('lab-ward-billing-view',7,1,GETDATE(),1)
	GO

	declare @perId int
	set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='lab-ward-billing-view')
	
	declare @parentRouteId int
	set @parentRouteId = (select RouteId from [dbo].[RBAC_RouteConfig] where UrlFullPath='Lab')

	INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName]
           ,[UrlFullPath]
           ,[RouterLink]
           ,[PermissionId]
		   ,[ParentRouteId]
           ,[IsActive]
		   ,[DisplaySeq])
     VALUES
          ('Ward Billing','Lab/WardBilling','WardBilling',@perId,@parentRouteId,1,7);
		  
	GO


  declare @perId int
  set @perId = (select PermissionId from [dbo].[RBAC_Permission] where PermissionName='lab-ward-billing-view')

  declare @roleId int
  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='SuperAdmin')
  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)

  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Admin')
  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)

  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Lab Technologist')
  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)

  set @roleId = (select RoleId from [dbo].[RBAC_Role] where RoleName='Lab Technician')
  Insert Into [dbo].[RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) values(@roleId,@perId,1,GETDATE(),1)

  Go

----end Suraj: 28th september 2018 [Moved Add IP Lab billing button] ---------
-----END: DEPLOYED ON LIVE: ON 29th September 2018---------------
