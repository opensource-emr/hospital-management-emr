---Incremental Script for 21August onwards---
---created: sud:30Sept'18--
----change DatabaseName(s)  as per your current database---
--Use DanpheEMR
GO
--Start: Anish: 1 Oct' 18, Billing Status Column Size increased to 20 to accomodate provisional---
Alter table [dbo].[PAT_PatientVisits]
alter column BillingStatus varchar(20);
Go
--End: Anish 1 Oct'18---

--Start: ANish: 2 Oct, Refresh Time for LabRequisition Page Parameterised--
 Insert into [dbo].[CORE_CFG_Parameters]
 values ('LAB','LabRequisitionReloadTimeInSec','20','number','Refresh Time for Lab Requisition Page');
 GO
 --End: Anish 2 Oct'18---

 --Start: Anish: 3 Oct added two extra component in CBC with Grouping ---
Update [dbo].[LAB_LabTests]
set LabTestComponentsJSON='[{"Component":"WBC Count (TC)","Unit":"per cumm","ValueType":"number","ControlType":null,"Range":"4000-11000","RangeDescription":"4,000-11,000","Method":"","ValueLookup":null,"DisplaySequence":1,"Indent":false},{"Component":"Differential Count","Unit":null,"ValueType":null,"ControlType":"Label","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":null,"DisplaySequence":2,"Indent":false},{"Component":"Neutrophils","Unit":"%","ValueType":"number","ControlType":null,"Range":"40-75","RangeDescription":"40-75","Method":"","ValueLookup":null,"DisplaySequence":3,"Indent":true,"Group":"Check100"},{"Component":"Lymphocytes","Unit":"%","ValueType":"number","ControlType":null,"Range":"20-45","RangeDescription":"20-45","Method":"","ValueLookup":null,"DisplaySequence":4,"Indent":true,"Group":"Check100"},{"Component":"Eosinophils","Unit":"%","ValueType":"number","ControlType":null,"Range":"1-6","RangeDescription":"1-6","Method":"","ValueLookup":null,"DisplaySequence":5,"Indent":true,"Group":"Check100"},{"Component":"Monocytes","Unit":"%","ValueType":"number","ControlType":null,"Range":"0-2","RangeDescription":"0-2","Method":"","ValueLookup":null,"DisplaySequence":6,"Indent":true,"Group":"Check100"},{"Component":"Basophils","Unit":"%","ValueType":"number","ControlType":null,"Range":"0-2","RangeDescription":"0-2","Method":"","ValueLookup":null,"DisplaySequence":7,"Indent":true,"Group":"Check100"},{"Component":"Band","Unit":"%","ValueType":"number","ControlType":null,"Range":"0-2","RangeDescription":"0-2","Method":"","ValueLookup":null,"DisplaySequence":8,"Indent":true,"Group":"Check100"},{"Component":"Metamyelocyte","Unit":"%","ValueType":"number","ControlType":null,"Range":"0-0","RangeDescription":"0-0","Method":"","ValueLookup":null,"DisplaySequence":9,"Indent":true,"Group":"Check100"},{"Component":"Haemoglobin","Unit":"gm/dl","ValueType":"number","ControlType":"TextBox","Range":"11-17","RangeDescription":"M: 13-18, F: 11-16","Method":"","ValueLookup":null,"DisplaySequence":10,"Indent":false},{"Component":"ESR","Unit":"mm/hr ","ValueType":"number","ControlType":null,"Range":"0-9","RangeDescription":"0–9","Method":"","ValueLookup":null,"DisplaySequence":10,"Indent":false},{"Component":"Platelet Count","Unit":"per cumm","ValueType":"number","ControlType":null,"Range":"150000-450000","RangeDescription":"1,50,000-4,50,000","Method":"","ValueLookup":null,"DisplaySequence":11,"Indent":false},{"Component":"RBC","Unit":"10^6/ul","ValueType":"number","ControlType":"TextBox","Range":null,"RangeDescription":"M:4.2-5.4, F:3.6-5.2","Method":null,"ValueLookup":null,"DisplaySequence":12,"Indent":false},{"Component":"PCV","Unit":"%","ValueType":"number","ControlType":"TextBox","Range":null,"RangeDescription":"M:40-54, F:36-46","Method":null,"ValueLookup":null,"DisplaySequence":15,"Indent":false},{"Component":"MCV","Unit":"fl","ValueType":"number","ControlType":"TextBox","Range":"76-100","RangeDescription":"76-100","Method":null,"ValueLookup":null,"DisplaySequence":16,"Indent":false},{"Component":"MCH","Unit":"pg","ValueType":"number","ControlType":"TextBox","Range":"27-32","RangeDescription":"27-32","Method":null,"ValueLookup":null,"DisplaySequence":17,"Indent":false},{"Component":"MCHC","Unit":"%","ValueType":"number","ControlType":"TextBox","Range":"32-36","RangeDescription":"32-36","Method":null,"ValueLookup":null,"DisplaySequence":18,"Indent":false},{"Component":"RDW","Unit":null,"ValueType":"number","ControlType":"TextBox","Range":"11.5-14.5","RangeDescription":"11.5-14.5","Method":null,"ValueLookup":null,"DisplaySequence":19,"Indent":false}]'
WHERE LabTestName='CBC with ESR (Hb,TC,DC,PLT,ESR)';
GO
--End: Anish 3 Oct--


---START: Ramavtar 04Oct'18	alter of PatientBillHistory (parameter change PatientId to PatientCode)
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientBillHistory] 
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
	@PatientCode nvarchar(max) = NULL
AS
/*
FileName: [SP_Report_BILL_PatientBillHistory]
CreatedBy/date: nagesh/2017-05-25
Description: to get the total of Billed, Unbilled, and Returned along with the other data
Remarks:    NEEDS LOT OF IMPROVISATION ON THIS SP--sudarshan(29jul'17)
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       nagesh/2017-05-25	                created the script
2		ashim/2017-07-11					modified the script
3		ashim/2017-07-28					modifications for bug fix
											(ReceiptNo and ItemPrice,ItemName-ReturnedBill)
4		ramavtar/2018-10-04					change parameter (replaced PatientId with PatientCode)
--------------------------------------------------------
*/
BEGIN

  IF (@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @PatientCode IS NOT NULL)
  BEGIN

    --Paid Bill History
    WITH PaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		SubTotal AS Amount,
		ISNULL(DiscountAmount, 0) AS Discount,
		Tax,
		ISNULL(TotalAmount, 0) AS SubTotal,
		CONVERT(date, PaidDate) AS [PaidDate],
		BillingTransactionId AS ReceiptNo
    FROM BIL_TXN_BillingTransactionItems TransactionItem
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE BillStatus = 'paid' AND pat.PatientCode = @PatientCode 
		AND CONVERT(date,PaidDate) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM PaidBillHistory ORDER BY CONVERT(date, PaidDate) DESC;

    --Unpaid Bill History
    WITH UnpaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		SubTotal AS Amount,
		ISNULL(DiscountAmount, 0) AS Discount,
		Tax,
		ISNULL(TotalAmount, 0) AS SubTotal,
		CONVERT(date, RequisitionDate) AS [Date]
    FROM BIL_TXN_BillingTransactionItems TransactionItem
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE BillStatus = 'unpaid' AND pat.PatientCode = @PatientCode
		AND CONVERT(date,RequisitionDate) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM UnpaidBillHistory ORDER BY CONVERT(date, [Date]) DESC;


    --Returned Bill History
    WITH ReturnedBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillReturn.BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS Department,
		SrvItems.ItemName AS Item,
		SrvItems.Price AS Rate,
		BillReturn.Quantity,
		BillReturn.SubTotal AS Amount,
		ReturnRemarks AS Remarks,
		ISNULL(BillReturn.DiscountAmount, 0) AS Discount,
		BillReturn.Tax,
		ISNULL(BillReturn.TotalAmount, 0) AS ReturnedAmount,
		BillReturn.ReturnDate,
		BillReturn.BillingTransactionId AS ReceiptNo,
		Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS ReturnedBy
    FROM BIL_TXN_BillingReturn BillReturn
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON BillReturn.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN BIL_CFG_BillItemPrice SrvItems ON BillReturn.ServiceDepartmentId = SrvItems.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON BillReturn.CreatedBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON BillReturn.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode AND SrvItems.ItemId = BillReturn.ItemId
		AND CONVERT(date,BillReturn.ReturnDate) BETWEEN @FromDate AND @ToDate)

    SELECT * FROM ReturnedBillHistory ORDER BY CONVERT(date, ReturnDate) DESC;

    --Deposit
    WITH DepositHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY DepositId) AS SrNo,
      CONVERT(date, dep.CreatedOn) AS [Date],
      BillingTransactionId AS ReceiptNo,
      DepositType,
      Amount,
      Remarks
    FROM BIL_TXN_Deposit dep
    INNER JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode
		AND CONVERT(date,dep.CreatedOn) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM DepositHistory ORDER BY CONVERT(date, Date) DESC;

    --Cancel Bill History
    WITH CancelBillHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
      SrvDept.ServiceDepartmentName AS [Department],
      ItemName AS Item,
      Price AS Rate,
      Quantity,
      CancelRemarks AS Remarks,
      SubTotal AS Amount,
      TotalAmount AS CancelledAmount,
      CONVERT(date, CancelledOn) AS CancelledDate,
      Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS CancelledBy,
      ISNULL(DiscountAmount, 0) AS Discount,
      Tax,
      ISNULL(TotalAmount, 0) AS SubTotal,
      CONVERT(date, RequisitionDate) AS [Date]
    FROM BIL_TXN_BillingTransactionItems TransactionItem
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON TransactionItem.CancelledBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE BillStatus = 'cancel' AND pat.PatientCode = @PatientCode
		AND CONVERT(date,RequisitionDate) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM CancelBillHistory ORDER BY CONVERT(date, [Date]) DESC;

  END
END
GO
---END:Ramavtar 04Oct'18	alter of PatientBillHistory (parameter change PatientId to PatientCode)
---START: Ramavtar 05Oct'18 	alter of Patient Census report getting provider name from employee table
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2018-09-23','2018-09-23'
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
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
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
                SELECT 
					CASE 
						WHEN txn.ProviderId IS NOT NULL 
						THEN emp.Salutation + ''. '' + emp.FirstName + '' '' + ISNULL(emp.MiddleName + '' '','''') + emp.LastName
						ELSE ''No Doctor''
					END AS ProviderName,
					ServiceDepartmentName,
					BillingTransactionItemId
				 FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation] 
				 ('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' ) txn
				 LEFT JOIN EMP_Employee emp ON txn.ProviderId = emp.EmployeeId
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
	SELECT 
		CASE 
			WHEN txn.ProviderId IS NOT NULL 
			THEN emp.Salutation + ''. '' + emp.FirstName + '' '' + ISNULL(emp.MiddleName + '' '','''') + emp.LastName
			ELSE ''No Doctor''
		END AS ProviderName,
		(COUNT(Distinct PatientId)) as TotalPatient, 
		SUM(PaidAmount - ReturnAmount + ProvisionalAmount - CancelledAmount + CreditAmount ) as TotalCollection
	FROM [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation]('''+CONVERT(VARCHAR(10),@FromDate, 101)+''' ,'''+CONVERT(VARCHAR(10),@ToDate, 101)+''' ) txn
	LEFT JOIN EMP_Employee emp ON txn.ProviderId = emp.EmployeeId
	GROUP BY emp.Salutation,
			 emp.FirstName,
			 emp.FirstName,
			 emp.MiddleName,
			 emp.LastName,
			 txn.ProviderId
	) B 
	ON A.DoctorName = B.ProviderName
	ORDER BY DoctorName
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
---END: Ramavtar 05Oct'18 	alter of Patient Census report getting provider name from employee table

----Start: Salakha: 05 Oct 2018 alter of VisiteDate for getting DateTime--------
/****** Object:  StoredProcedure [dbo].[SP_Report_Appointment_DailyAppointmentReport]    Script Date: 05-10-2018 18:02:20 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_Appointment_DailyAppointmentReport] 
@FromDate DateTime=null,
@ToDate DateTime=null
AS
/*
FileName: [SP_Report_Appointment_DailyAppointmentReport]
CreatedBy/date: Umed/2017-06-08
Description: to get Details such as Patient Name , Appointment type, Appointment Status, along with doctor name between the Given Dates
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Umed/2017-06-06	                   created the script
2       Umed/2017-06-14                    modify i.e remove time from date and apply IsNULL with i/p parameter
3       Umed/2018-04-23                  Modified Whole SP because initially we are taking Appointment from PAT_Appointment and Now We are Taking From Visits
4       Salakha/2018-10-05				  Modify Datetime cancatenate from VisiteDate and VisitTime
--------------------------------------------------------
*/
BEGIN
		If(@FromDate IS NOT NULL OR @ToDate IS NOT NULL or LEN(@FromDate)>=0 OR LEN(@ToDate)>=0)
				BEGIN
			SELECT
					CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, VisitTime) as 'Date',
						patPait.FirstName + ' ' + patPait.LastName AS Patient_Name,
						 patApp.AppointmentType,
						 patApp.ProviderName AS Doctor_Name,
					patApp.VisitStatus
				FROM PAT_PatientVisits AS patApp
					INNER JOIN PAT_Patient AS patPait ON patApp.PatientId = patPait.PatientId
					WHERE CONVERT(date, patApp.VisitDate) BETWEEN @FromDate AND @ToDate
					ORDER BY CONVERT(datetime, CONVERT(date, patApp.VisitDate)) + CONVERT(datetime, VisitTime) DESC

				END
END
GO
----End: Salakha: 05 Oct 2018 alter of VisiteDate for getting DateTime--------
--- Start: Ramavtar 09Oct'18 added return remark for report ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-10-09','2018-10-09',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
-----------------------------------------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)
  BEGIN
    SELECT
      *
    FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks,'') 'ReturnRemark'
		FROM ((SELECT
					Dates 'ReportDate'
				FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

    LEFT JOIN (
    --- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
    ---Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
    SELECT
      CONVERT(date, CreatedOn) 'TxnDate',
      BillingTransactionId,
      InvoiceCode,
      InvoiceNo,
      PatientID,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_BillingTransaction
    WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())

    UNION

    SELECT DISTINCT
      CONVERT(date, CreatedOn) AS TxnDate,
      BillingTransactionId,
      InvoiceCode,
      RefInvoiceNum,
      PatientId,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r
    WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
      ON dates.ReportDate = txnInfo.TxnDate
    ---Join with Patient and Employee Table to get their names etc---
    INNER JOIN PAT_Patient pat
      ON txnInfo.PatientId = pat.PatientId
    INNER JOIN EMP_Employee emp
      ON txnInfo.CreatedBy = emp.EmployeeId

    LEFT JOIN BIL_TXN_BillingTransaction txn
      ON dates.ReportDate = CONVERT(date, txn.CreatedOn)
      AND txnInfo.BillingTransactionId = txn.BillingTransactionId
      AND txnInfo.CounterId = txn.CounterId
      AND txnInfo.CreatedBy = txn.CreatedBy

    LEFT OUTER JOIN (
    --- deposit deduct happens both from Transaction and settlement
    -- take only those from Transaction in this query..
    -- condition is: BillingTransaction Is NOT NULL--
    SELECT
      CONVERT(date, CreatedOn) AS DepositRetDate,
      Amount,
      BillingTransactionId,
      CounterId,
      CreatedBy
    FROM BIL_TXN_Deposit
    WHERE DepositType = 'depositdeduct'
    AND BillingTransactionId IS NOT NULL) depRet
      ON dates.ReportDate = depRet.DepositRetDate
      AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
      AND txnInfo.CounterId = depRet.CounterId
      AND txnInfo.CreatedBy = depRet.CreatedBy
    LEFT JOIN (

    ---Sud: 9May'18--our return table is now changed--
    ---get only returned bills---
    SELECT
      CONVERT(date, CreatedOn) AS bilReturnDate,
      BillingTransactionId,
      RefInvoiceNum,
      TotalAmount 'ReturnAmount',
      TaxTotal AS 'ReturnedTax',
      CounterId,
      CreatedBy,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r) bilRet
      ON dates.ReportDate = bilret.bilReturnDate
      AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
      AND txnInfo.CounterId = bilRet.CounterId
      AND txnInfo.CreatedBy = bilRet.CreatedBy
    )
    WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
    AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

    UNION ALL

    SELECT
      CONVERT(date, deposits.DepositDate) 'DepositDate',
      deposits.ReceiptNo 'ReceiptNo',
      pat.PatientCode 'HospitalNo',
      pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
      0 'Price',
      0 'DiscountAmount',
      0 'ReturnedAmount',
      deposits.AdvanceReceived 'AdvanceReceived',
      deposits.AdvancedSettled 'AdvancedSettled',
      0 'Tax',
      deposits.TotalAmount 'TotalAmount',
      emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
      deposits.CounterId 'CounterId',
      0 'ReturnedTax',
	  '' 'ReturnRemark'
    FROM (SELECT
           CONVERT(date, CreatedOn) 'DepositDate',
           'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
           PatientId,
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             ELSE 0
           END AS 'AdvanceReceived',
           CASE
             WHEN DepositType = 'ReturnDeposit' THEN Amount
             ELSE 0
           END AS 'AdvancedSettled',
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             WHEN DepositType = 'ReturnDeposit' THEN -Amount
             ELSE 0
           END AS 'TotalAmount',
           CreatedBy 'CreatedBy',
           CounterId 'CounterId'
         FROM BIL_TXN_Deposit
         WHERE ReceiptNo IS NOT NULL
         AND (DepositType = 'DEPOSIT'
         OR DepositType = 'ReturnDeposit')

         UNION ALL
         SELECT
           CONVERT(date, CreatedOn) 'DepositDate',
           'SR' + CONVERT(varchar(20), SettlementId) 'ReceiptNo',
           PatientId,
           0 AS 'AdvanceReceived',
           Amount AS 'AdvancedSettled',
           -Amount AS 'TotalAmount',
           CreatedBy 'CreatedBy',
           CounterId 'CounterId'
         FROM BIL_TXN_Deposit
         WHERE DepositType = 'depositdeduct'
         AND SettlementId IS NOT NULL) deposits,
         EMP_Employee emp,
         PAT_Patient pat,
         BIL_CFG_Counter cntr
    WHERE deposits.PatientId = pat.PatientId
    AND emp.EmployeeId = deposits.CreatedBy
    AND deposits.CounterId = cntr.CounterId
    AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
    AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	) dum
    ORDER BY dum.ReceiptNo
  END
END
GO
--- END: Ramavtar 09Oct'18 added return remark for report ---

--Start of Update query for Is Doctor Mandatory-- 10th Oct 2018-- Yubaraj Shrestha---
--making all items false as default
UPDATE [BIL_CFG_BillItemPrice] SET IsDoctorMandatory=0 
GO
--making column nullable
ALTER TABLE [BIL_CFG_BillItemPrice] ALTER COLUMN IsDoctorMandatory bit NULL
go 

--update service department for IsDoctorMandatory--
update billItem
set billItem.IsDoctorMandatory = 1
from [BIL_CFG_BillItemPrice] billItem
join BIL_MST_ServiceDepartment srvdept on billItem.ServiceDepartmentId= srvdept.ServiceDepartmentId
where ServiceDepartmentName IN ('USG', 'C.T. SCAN','ULTRASOUND','ULTRASOUND COLOR DOPPLER','NON INVASIVE CARDIO VASCULAR INVESTIGATIONS','PHYSIOTHERAPY',
'OT')
go

---UPDATE ITEM'S ISDOCTORMANDATORY ---
UPDATE [BIL_CFG_BillItemPrice] SET IsDoctorMandatory=1 WHERE ItemName IN('[1] IOPAR (x-Ray)','[1] IOPAR (x-Ray)','[2A] Dental extractions (Permanent)',
'[4A] Scaling and Polishing (Gross)','[4B] Scaling and Polishing (Deep)','PAC','PAP Smear','Plaster A (lower Extremity)','Injection Steroid','B 5-10 blocks',
'C Single Block Gallbladder,small lumps','Hydrotobation','Dressing Charge (Large)','Dressing Charge (Medium)','Dressing Charge (Small)','Endoscopy',
'General Round Charge','ICU  Round Charge (New)','ICU Round Charge','Procedure Charge','Suture out','Sututre In (Large)','Sututre In (small)','Colonoscopy',
'Intubation Charge')
go 

--itemname 'OT Theatre Charge' is excluded whereas servicedepartment 'OT' is Doctor Mandatory
UPDATE [BIL_CFG_BillItemPrice] SET IsDoctorMandatory=0 WHERE ItemName='OT Theatre Charge'
go 
--End of Update query for Is Doctor Mandatory-- 10th Oct 2018--Yubaraj Shrestha---

--Anish: Start- 10 Oct Nursing Counter Added in Billing Counter table--
 Insert into [dbo].[BIL_CFG_Counter] (CounterName, CounterType, CreatedBy, CreatedOn)
  values ('Nursing Counter', 'NURSING', '1', GETDATE() );
--Anish:End 10 Oct--

--Anish: Start- 12 Oct Lab Module Changes in Requisiton table(LabReportId Added)--

Alter table [dbo].[LAB_TestRequisition]
Add LabReportId INT null 
Go

Go
 IF NOT EXISTS(select 1 from [dbo].[CORE_CFG_LookUps] where ModuleName='Lab' 
  and LookUpName='Detected-NotDetected')
  Begin
    Insert into [dbo].[CORE_CFG_LookUps]
	(ModuleName,LookUpName,LookupDataJson)
	values ('Lab','Detected-NotDetected','["Detected","Not Detected"]');
  End
 Go

---query:1-- updated all final to result added--
Update LAB_TestRequisition
set OrderStatus='result-added'
where OrderStatus='final'
GO

---Query:2--Update those requisition where report is generated to: 'report-generated'--
update req
set req.OrderStatus='report-generated',  
req.LabReportId =  res.LabReportId

from LAB_TestRequisition req, 
(SELECT Distinct RequisitionId, LabReportId   FROM LAB_TXN_TestComponentResult  where LabReportId is not null ) res

where req.RequisitionId=res.RequisitionId
and ISNULL(res.LabReportId,0) != 0
GO
--Anish: End- 12 Oct--


--Anish: 14 Oct Start Updates Acc. to live data Requirement--
 IF NOT EXISTS(select 1 from [dbo].[CORE_CFG_LookUps] where ModuleName='Lab' 
  and LookUpName='Detected-NotDetected')
  Begin
    Insert into [dbo].[CORE_CFG_LookUps]
	(ModuleName,LookUpName,LookupDataJson)
	values ('Lab','Detected-NotDetected','["Detected","Not Detected"]');
  End
 Go
 --Anish: End 14 Oct---

 ----UPTO: Build_DEV_1.3.0 (Labs+WardBilling, etc..)-----


---START: Ramavtar 2018-10-15 alter fo SP PatientBillHistory ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientBillHistory]  -- SP_Report_BILL_PatientBillHistory null,null,'1809003399'
	@FromDate datetime = NULL,
	@ToDate datetime = NULL,
	@PatientCode nvarchar(max) = NULL
AS
/*
FileName: [SP_Report_BILL_PatientBillHistory]
CreatedBy/date: nagesh/2017-05-25
Description: to get the total of Billed, Unbilled, and Returned along with the other data
Remarks:    NEEDS LOT OF IMPROVISATION ON THIS SP--sudarshan(29jul'17)
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       nagesh/2017-05-25	                created the script
2		ashim/2017-07-11					modified the script
3		ashim/2017-07-28					modifications for bug fix
											(ReceiptNo and ItemPrice,ItemName-ReturnedBill)
4		ramavtar/2018-10-04					change parameter (replaced PatientId with PatientCode)
5		ramavtar/2018-10-15					change in SP (corrected where clause in paid,unpaid.. change table in case of return taking from BIL_TXN_InvoiceReturn.. 
											added require columns (remark, corrected receiptNo)
--------------------------------------------------------
*/
BEGIN

  IF (@FromDate IS NOT NULL AND @ToDate IS NOT NULL AND @PatientCode IS NOT NULL)
  BEGIN

    --Paid Bill History
    WITH PaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		TransactionItem.SubTotal AS Amount,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS SubTotal,
		CONVERT(date, TransactionItem.PaidDate) AS [PaidDate],
		Txn.InvoiceNo AS ReceiptNo
    FROM BIL_TXN_BillingTransactionItems TransactionItem
	INNER JOIN BIL_TXN_BillingTransaction Txn ON TransactionItem.BillingTransactionId = Txn.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE TransactionItem.BillStatus = 'paid' AND pat.PatientCode = @PatientCode 
		AND CONVERT(date,TransactionItem.PaidDate) BETWEEN @FromDate AND @ToDate
		AND TransactionItem.ReturnStatus IS NULL)
    
	SELECT * FROM PaidBillHistory ORDER BY CONVERT(date, PaidDate) DESC;

    --Unpaid Bill History
    WITH UnpaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		TransactionItem.SubTotal AS Amount,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS SubTotal,
		CONVERT(date, TransactionItem.RequisitionDate) AS [Date],
		Txn.InvoiceNo AS ReceiptNo
    FROM BIL_TXN_BillingTransactionItems TransactionItem
	INNER JOIN BIL_TXN_BillingTransaction Txn ON TransactionItem.BillingTransactionId = Txn.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE TransactionItem.BillStatus = 'unpaid' AND pat.PatientCode = @PatientCode
		AND TransactionItem.ReturnStatus IS NULL
		AND CONVERT(date,RequisitionDate) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM UnpaidBillHistory ORDER BY CONVERT(date, [Date]) DESC;

    --Returned Bill History
    WITH ReturnedBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillReturn.BillReturnId) AS SrNo,
		SrvDept.ServiceDepartmentName AS Department,
		TransactionItem.ItemName AS Item,
		TransactionItem.Price AS Rate,
		TransactionItem.Quantity,
		TransactionItem.SubTotal AS Amount,
		BillReturn.Remarks AS Remarks,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS ReturnedAmount,
		CONVERT(date,BillReturn.CreatedOn) 'ReturnDate',
		Txn.InvoiceNo AS ReceiptNo,
		Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS ReturnedBy
    FROM BIL_TXN_InvoiceReturn BillReturn
	INNER JOIN BIL_TXN_BillingTransaction Txn ON BillReturn.BillingTransactionId = Txn.BillingTransactionId
	INNER JOIN BIL_TXN_BillingTransactionItems TransactionItem ON Txn.BillingTransactionId = TransactionItem.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON BillReturn.CreatedBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON BillReturn.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode
		AND CONVERT(date,BillReturn.CreatedOn) BETWEEN @FromDate AND @ToDate)

    SELECT * FROM ReturnedBillHistory ORDER BY CONVERT(date, ReturnDate) DESC;

    --Deposit
    WITH DepositHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY DepositId) AS SrNo,
      CONVERT(date, dep.CreatedOn) AS [Date],
      DepositType,
      Amount,
      Remarks,
	  ReceiptNo
    FROM BIL_TXN_Deposit dep
    INNER JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode
		AND CONVERT(date,dep.CreatedOn) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM DepositHistory ORDER BY CONVERT(date, Date) DESC;

    --Cancel Bill History
    WITH CancelBillHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
      SrvDept.ServiceDepartmentName AS [Department],
      ItemName AS Item,
      Price AS Rate,
      Quantity,
      CancelRemarks AS Remarks,
      SubTotal AS Amount,
      TotalAmount AS CancelledAmount,
      CONVERT(date, CancelledOn) AS CancelledDate,
      Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS CancelledBy,
      ISNULL(DiscountAmount, 0) AS Discount,
      Tax,
      ISNULL(TotalAmount, 0) AS SubTotal,
      CONVERT(date, RequisitionDate) AS [Date]
    FROM BIL_TXN_BillingTransactionItems TransactionItem
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON TransactionItem.CancelledBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE BillStatus = 'cancel' AND pat.PatientCode = @PatientCode
		AND CONVERT(date,RequisitionDate) BETWEEN @FromDate AND @ToDate)
    
	SELECT * FROM CancelBillHistory ORDER BY CONVERT(date, [Date]) DESC;

  END
  ELSE IF (@FromDate IS NULL AND @ToDate IS NULL AND @PatientCode IS NOT NULL)
  BEGIN
	    --Paid Bill History
    WITH PaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		TransactionItem.SubTotal AS Amount,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS SubTotal,
		CONVERT(date, TransactionItem.PaidDate) AS [PaidDate],
		Txn.InvoiceNo AS ReceiptNo
    FROM BIL_TXN_BillingTransactionItems TransactionItem
	INNER JOIN BIL_TXN_BillingTransaction Txn ON TransactionItem.BillingTransactionId = Txn.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE TransactionItem.BillStatus = 'paid' AND pat.PatientCode = @PatientCode
		AND TransactionItem.ReturnStatus IS NULL)
    
	SELECT * FROM PaidBillHistory ORDER BY CONVERT(date, PaidDate) DESC;

    --Unpaid Bill History
    WITH UnpaidBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
		SrvDept.ServiceDepartmentName AS [Department],
		ItemName AS Item,
		Price AS Rate,
		Quantity,
		TransactionItem.SubTotal AS Amount,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS SubTotal,
		CONVERT(date, TransactionItem.RequisitionDate) AS [Date],
		Txn.InvoiceNo AS ReceiptNo
    FROM BIL_TXN_BillingTransactionItems TransactionItem
	INNER JOIN BIL_TXN_BillingTransaction Txn ON TransactionItem.BillingTransactionId = Txn.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE TransactionItem.BillStatus = 'unpaid' AND pat.PatientCode = @PatientCode
		AND TransactionItem.ReturnStatus IS NULL)
    
	SELECT * FROM UnpaidBillHistory ORDER BY CONVERT(date, [Date]) DESC;

    --Returned Bill History
    WITH ReturnedBillHistory
    AS (SELECT
		ROW_NUMBER() OVER (ORDER BY BillReturn.BillReturnId) AS SrNo,
		SrvDept.ServiceDepartmentName AS Department,
		TransactionItem.ItemName AS Item,
		TransactionItem.Price AS Rate,
		TransactionItem.Quantity,
		TransactionItem.SubTotal AS Amount,
		BillReturn.Remarks AS Remarks,
		ISNULL(TransactionItem.DiscountAmount, 0) AS Discount,
		TransactionItem.Tax,
		ISNULL(TransactionItem.TotalAmount, 0) AS ReturnedAmount,
		CONVERT(date,BillReturn.CreatedOn) 'ReturnDate',
		Txn.InvoiceNo AS ReceiptNo,
		Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS ReturnedBy
    FROM BIL_TXN_InvoiceReturn BillReturn
	INNER JOIN BIL_TXN_BillingTransaction Txn ON BillReturn.BillingTransactionId = Txn.BillingTransactionId
	INNER JOIN BIL_TXN_BillingTransactionItems TransactionItem ON Txn.BillingTransactionId = TransactionItem.BillingTransactionId
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON BillReturn.CreatedBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON BillReturn.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode)

    SELECT * FROM ReturnedBillHistory ORDER BY CONVERT(date, ReturnDate) DESC;

    --Deposit
    WITH DepositHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY DepositId) AS SrNo,
      CONVERT(date, dep.CreatedOn) AS [Date],
      DepositType,
      Amount,
      Remarks,
	  ReceiptNo
    FROM BIL_TXN_Deposit dep
    INNER JOIN PAT_Patient pat ON dep.PatientId = pat.PatientId
    WHERE pat.PatientCode = @PatientCode)
    
	SELECT * FROM DepositHistory ORDER BY CONVERT(date, Date) DESC;

    --Cancel Bill History
    WITH CancelBillHistory
    AS (SELECT
      ROW_NUMBER() OVER (ORDER BY BillingTransactionItemId) AS SrNo,
      SrvDept.ServiceDepartmentName AS [Department],
      ItemName AS Item,
      Price AS Rate,
      Quantity,
      CancelRemarks AS Remarks,
      SubTotal AS Amount,
      TotalAmount AS CancelledAmount,
      CONVERT(date, CancelledOn) AS CancelledDate,
      Emp.FirstName + ISNULL(' ' + Emp.MiddleName + ' ', ' ') + Emp.LastName AS CancelledBy,
      ISNULL(DiscountAmount, 0) AS Discount,
      Tax,
      ISNULL(TotalAmount, 0) AS SubTotal,
      CONVERT(date, RequisitionDate) AS [Date]
    FROM BIL_TXN_BillingTransactionItems TransactionItem
    INNER JOIN BIL_MST_ServiceDepartment SrvDept ON TransactionItem.ServiceDepartmentId = SrvDept.ServiceDepartmentId
    INNER JOIN EMP_Employee Emp ON TransactionItem.CancelledBy = Emp.EmployeeId
    INNER JOIN PAT_Patient pat ON TransactionItem.PatientId = pat.PatientId
    WHERE BillStatus = 'cancel' AND pat.PatientCode = @PatientCode)
    
	SELECT * FROM CancelBillHistory ORDER BY CONVERT(date, [Date]) DESC;

  END
END
Go
---END: Ramavtar 2018-10-15 alter fo SP PatientBillHistory ---
---START: Ramavtar 2018-10-17 added column name PatientNameLocal in PAT_Patient ---
ALTER TABLE PAT_Patient
ADD PatientNameLocal nvarchar(100);
GO
---END: Ramavtar 2018-10-17 added column name PatientNameLocal in PAT_Patient

--- Start: 22 october| Suraj [show returned amount] ---

/****** Object:  StoredProcedure [dbo].[SP_DSB_Lab_DashboardStatistics]    Script Date: 10/22/2018 3:07:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[SP_DSB_Lab_DashboardStatistics]
AS
/*
=============================================================================================
FileName: [SP_DSB_Lab_DashboardStatistics]
CreatedBy/date: ramavtar/2017-11-28
Description: Table1:To get stats for LAB dashboard --> to fill Labels
					-->> for sample pending	-->> OrderStatus = active && (BillingStatus == unpaid || BillingStatus == paid)
					-->> for results pending	-->> OrderStatus = pending && (BillingStatus == unpaid || BillingStatus == paid)
					-->> for test completed	-->> OrderStatus = final && (BillingStatus == unpaid || BillingStatus == paid)
					-->> for tests cancelled	-->> BillingStatus = cancel
					-->> for tests returned	-->> BillingStatus = return
					-->> for total test		-->> Count all
			Table2:To get stats for LAB dashboard --> For Trending LabTest (last 30 days)
					takes count of LabTest - grouping by them with LabTestName, ordering them in descending order and selecting top 10 only
			Table3:to get count of LabTest performed today ( Templete wise count is shown)


Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Ramavtar/2017-11-28	               created

--------------------------------------------------------
=============================================================================================
*/
BEGIN

--Table1
	SELECT * FROM 
		(select count(*) 'TotalAvailableTest' from LAB_LabTests where IsActive=1) labtest,
		(select
			ISNULL(SUM(1),0) AS 'TestRequisitedToday',
			ISNULL(SUM( CASE WHEN OrderStatus = 'active' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ),0) AS 'SamplePendingToday',
			ISNULL(SUM( CASE WHEN OrderStatus = 'pending' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ),0) AS 'AddResultsPendingToday',
			ISNULL(SUM( CASE WHEN OrderStatus = 'final' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ),0) AS 'CompletedToday',
			ISNULL(SUM( CASE WHEN BillingStatus='cancel' THEN 1 ELSE 0 END ),0) AS 'CancelledTestsToday',
			ISNULL(SUM( CASE WHEN BillingStatus = 'returned' THEN 1 ELSE 0 END ),0) AS 'ReturnedTestsToday'
			from LAB_TestRequisition where convert(date,OrderDateTime) = convert(date,getdate())
		) Today,
		(select
			SUM(1) AS 'TestRequisitedTillDate',
			SUM( CASE WHEN OrderStatus = 'active' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ) AS 'SamplePendingTillDate',
			SUM( CASE WHEN OrderStatus = 'pending' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ) AS 'AddResultsPendingTillDate',
			SUM( CASE WHEN OrderStatus = 'final' and (BillingStatus = 'paid' or BillingStatus = 'unpaid') THEN 1 ELSE 0 END ) AS 'CompletedTillDate',
			SUM( CASE WHEN BillingStatus='cancel' THEN 1 ELSE 0 END ) AS 'CancelledTestsTillDate',
			SUM( CASE WHEN BillingStatus = 'returned' THEN 1 ELSE 0 END ) AS 'ReturnedTestsTillDate'
			from LAB_TestRequisition
		) TillDate
--Table2
	SELECT TOP(10) LabTestName,COUNT(LabTestName) AS Counts FROM LAB_TestRequisition 
		WHERE DATEDIFF(DAY,OrderDateTime,GETDATE()) BETWEEN 0 AND 30
		GROUP BY LabTestName
		ORDER BY Counts DESC
--Table3
	SELECT ReportTemplateName,COUNT(req.LabTestName) Counts FROM LAB_TestRequisition req 
		JOIN LAB_LabTests test ON req.LabTestId=test.LabTestId
		JOIN Lab_ReportTemplate reprt ON test.ReportTemplateID=reprt.ReportTemplateID
		WHERE CONVERT(DATE,OrderDateTime) = CONVERT(DATE,GETDATE())
		GROUP BY ReportTemplateName
END
Go

--- End: 22 october| Suraj [show returned amount] ---

--Start: Anish 2018-10-22 Data Update in LabReport Table--
Update [dbo].[Lab_ReportTemplate]
set ColSettingsJSON='{"Name":true,"Result":true,"Range":false,"Method":false,"Unit":true,"Remarks":false}'
where ReportTemplateName='Microbiology-Culture' and ReportTemplateShortName='Microbiology-Culture';
Go

Update [dbo].[Lab_ReportTemplate]
set ColSettingsJSON='{"Name":true,"Result":true,"Range":false,"Method":false,"Unit":true,"Remarks":false}'
where ReportTemplateName='MicroBiology-Normal' and ReportTemplateShortName='Microbiology-Normal';
Go
--End :Anish 2018-10-22--- 


---START: Ashim : 2018-10-29 --- Merged IpBillingIncremental_8Sep+----
---created: 8sept'2018-<sud>--
GO

-----start: sud: 10sept'18---

IF(OBJECT_ID('BIL_History_BillingTransactionItems') IS NOT NULL)
BEGIN
 DROP TABLE [dbo].[BIL_History_BillingTransactionItems]
END
GO
/****** Object:  Table [dbo].[BIL_TXN_BillTxnItems_History]    Script Date: 9/9/2018 1:28:52 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BIL_History_BillingTransactionItems](
    BillTxnItemHistoryId INT IDENTITY (1,1)  NOT NULL,
	HistoryType Varchar(50), -- eg: cancel, or return 
	[BillingTransactionItemId] [int] NOT NULL,
	[BillingTransactionId] [int] NULL,
	[PatientId] [int] NOT NULL,
	[PatientVisitId] [int] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[CounterId] [int] NULL,
	[Remarks] [varchar](100) NULL,
	[ServiceDepartmentId] [int] NOT NULL,
	[ServiceDepartmentName] [varchar](50) NULL,
	[ItemId] [int] NOT NULL,
	[ItemName] [varchar](100) NOT NULL,
	[Price] [float] NULL,
	[Quantity] [float] NULL,
	[SubTotal] [float] NULL,
	[DiscountAmount] [float] NULL,
	[TaxableAmount] [float] NULL,
	[Tax] [float] NULL,
	[TotalAmount] [float] NULL,
	[DiscountPercent] [float] NULL,  -- we can remove this field later if not needed..
	[DiscountPercentAgg] [float] NULL,
	[ProviderId] [int] NULL,
	[ProviderName] [varchar](70) NULL,
	[RequisitionId] [bigint] NULL,
	[CounterDay] [date] NULL,
	[TaxPercent] [float] NULL,
	[NonTaxableAmount] [float] NULL,
	[PatientType] [varchar](20) NULL, -- this is Inpatient/Outpatient
	[RequestingDeptId] [int] NULL,
	[IsTransferredToACC] [int] NULL,  -- we can remove this field later if not needed..
 CONSTRAINT [PK_BIL_TXN_BillCancellationItems] PRIMARY KEY CLUSTERED 
(
	BillTxnItemHistoryId ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[BIL_History_BillingTransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_BIL_History_BillingTransactionItems_BIL_TXN_BillingTransactionItems] FOREIGN KEY([BillingTransactionItemId])
REFERENCES [dbo].[BIL_TXN_BillingTransactionItems] ([BillingTransactionItemId])
GO

ALTER TABLE [dbo].[BIL_History_BillingTransactionItems] CHECK CONSTRAINT [FK_BIL_History_BillingTransactionItems_BIL_TXN_BillingTransactionItems]
GO

-----end: sud: 10sept'18---

---start: sud: 15Sept'18-- for IP-Billing-Receipt (discharge etc)---
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 9/15/2018 9:37:23 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts Created: 14Sept'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Receipts as per Input ServiceDepartmentName and itemname
 Remarks: We need different groups than that in Reporting so created this function
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/14Sept'18                      Initial Draft
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LABORATORY') THEN ('LAB Charges')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY Charges')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGE'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
END

GO



/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 9/15/2018 9:38:16 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
  @PatientId INT,  
  @PatientVisitId INT, 
  @BillTxnId INT=NULL,
  @BillStatus Varchar(50) = NULL
AS
/*
FileName: [SP_BIL_GetItems_ForIPBillingReceipt]
CreatedBy/date: sud/14Sept'18
Description: 
Remarks:  Need to handle provisional etc carefully, else number of items could be more.. 
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       sud/14Sept'18            Initial draft

-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	WHERE PatientId=@PatientId 
	  AND PatientVisitId= @PatientVisitId
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
END
GO



---end: sud: 15Sept'18-- for IP-Billing-Receipt (discharge etc)---


----start: ashim 17Sep2018---Modified SP for IP Billing Receipt--

/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 9/17/2018 3:18:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
  @PatientId INT,  
  @PatientVisitId INT, 
  @BillTxnId INT=NULL,
  @BillStatus Varchar(50) = NULL
AS
/*
FileName: [SP_BIL_GetItems_ForIPBillingReceipt]
CreatedBy/date: sud/14Sept'18
Description: 
Remarks:  Need to handle provisional etc carefully, else number of items could be more.. 
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       sud/14Sept'18            Initial draft

-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	    emp.FirstName + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'DoctorName',
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND PatientVisitId= @PatientVisitId
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
END
go
----end: ashim 17Sep2018---Modified SP for IP Billing Receipt--


---start: ashim 01Oct2018 --- Corrected ItemGroup Name--------------

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 10/1/2018 1:33:32 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts Created: 14Sept'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Receipts as per Input ServiceDepartmentName and itemname
 Remarks: We need different groups than that in Reporting so created this function
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/14Sept'18                      Initial Draft
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LABORATORY') THEN ('LAB Charges')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY Charges')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'BED CHARGES'))  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGE'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
END
go

---end: ashim 01Oct2018 --- Corrected ItemGroup Name--------------


---start: ashim 02Oct2018 --- Modified SP_BIL_GetItems_ForIPBillingReceipt, added DocorId

/****** Object:  StoredProcedure [dbo].[SP_BIL_GetItems_ForIPBillingReceipt]    Script Date: 10/2/2018 1:12:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_BIL_GetItems_ForIPBillingReceipt] 
  @PatientId INT,  
  @PatientVisitId INT, 
  @BillTxnId INT=NULL,
  @BillStatus Varchar(50) = NULL
AS
/*
FileName: [SP_BIL_GetItems_ForIPBillingReceipt]
CreatedBy/date: sud/14Sept'18
Description: 
Remarks:  Need to handle provisional etc carefully, else number of items could be more.. 
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
---------------------------------------------------------------------------------
1       sud/14Sept'18            Initial draft

-------------------------------------------------------------------------------
*/

BEGIN
Select Convert(DATE, itm.CreatedOn) 'BillDate'
	  ,dbo.[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts](ServiceDepartmentName,ItemName) 'ItemGroupName',
	   itm.ItemName, 
	   emp.EmployeeId 'DoctorId',
	    emp.FirstName + ISNULL(emp.MiddleName + ' ', '') + emp.LastName 'DoctorName',
	   itm.Price,  itm.Quantity,  itm.SubTotal,  itm.DiscountAmount,  itm.Tax,  itm.TotalAmount
	  ,itm.ServiceDepartmentId, itm.ItemId
	FROM BIL_TXN_BillingTransactionItems itm
	left join EMP_Employee emp on itm.ProviderId = emp.EmployeeId
	WHERE PatientId=@PatientId 
	  AND PatientVisitId= @PatientVisitId
	  AND ISNULL(itm.BillingTransactionId,0) =  ISNULL(@BillTxnId, ISNULL(itm.BillingTransactionId,0))
	  AND itm.BillStatus= ISNULL(@BillStatus,itm.BillStatus)
END
go
----end: ashim 17Sep2018---Modified SP for IP Billing Receipt--

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 10/1/2018 1:33:32 PM ******/

---end: ashim 02Oct2018 --- Modified SP_BIL_GetItems_ForIPBillingReceipt, added DocorId


---start: ashim: 07Oct2018 --- Modification in  FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts for SrvDeptName--

/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 10/7/2018 10:56:02 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts Created: 14Sept'18 <sudarshan>
 Description: To get Correct ServiceDepartmentName used in Billing Receipts as per Input ServiceDepartmentName and itemname
 Remarks: We need different groups than that in Reporting so created this function
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Sud/14Sept'18                      Initial Draft
 ------------------------------------------------------------------------------
*/

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LAB CHARGES')  THEN ('LAB Charges')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY Charges')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'BED CHARGES'))  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGE'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  ELSE (@ServiceDeptName) END 
		 )
END
go
---end: ashim: 07Oct2018 --- Modification in  FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts for SrvDeptName--


-------------------------------Start: Yubraj Shrestha || 9th October 2018--------------
--- Create department with name = 'ADT'
Insert into [MST_Department]
      ([DepartmentName]
      ,[IsActive]
      ,[IsAppointmentApplicable]
      ,[CreatedBy]
    ,[CreatedOn])
  values('ADT',1,0,1,GETDATE())
  Go

--Create service department 'Bed Charges' under dept 'ADT'
declare @deptId int;
set @deptId = (select DepartmentId from MST_Department where DepartmentName ='ADT')

Insert into [BIL_MST_ServiceDepartment]
([ServiceDepartmentName]
      ,[ServiceDepartmentShortName]
      ,[DepartmentId]
      ,[CreatedBy]
    ,[CreatedOn]
      ,[IsActive]
      ,[IntegrationName])
values('Bed Charges','Bed Charges',@deptId,1,GETDATE(),1,'Bed Charges')
go
--------------------------------------------------------------
declare @srvDeptId int;
set @srvDeptId = (select ServiceDepartmentId from BIL_MST_ServiceDepartment where ServiceDepartmentName ='Bed Charges')

INSERT INTO [dbo].[BIL_CFG_BillItemPrice]
           ([ServiceDepartmentId]
           ,[ItemName]
           ,[Price]
           ,[ItemId]
           ,[TaxApplicable]
           ,[DiscountApplicable]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive]
           ,[DisplaySeq]
           ,[IsDoctorMandatory])
    select @srvDeptId, bft.BedFeatureName,0 'Price',bft.BedFeatureId, 0 'Tax Applicable',1 'Discount Applicable',1,GETDATE(),1,100,1
  from ADT_MST_BedFeature bft
GO
-------------------------------End: Yubraj Shrestha || 9th October 2018--------------

--- START: Ramavtar: 12Oct'18 changes in BIL_CFG_BillItemPrice ---
ALTER TABLE BIL_CFG_BillItemPrice
ADD IntegrationName varchar(200)
GO

UPDATE BIL_CFG_BillItemPrice
SET IntegrationName = 'ADMISSION CHARGES (INDOOR)'
WHERE ItemName = 'ADMISSION CHARGES (INDOOR)'
GO

UPDATE BIL_CFG_BillItemPrice
SET IntegrationName = 'Medical and Resident officer/Nursing Charges'
WHERE ItemName = 'Medical and Resident officer/Nursing Charges'
GO

UPDATE BIL_CFG_BillItemPrice
SET IntegrationName = 'Medical Record Charge'
WHERE ItemName = 'Medical Record Charge'
GO

UPDATE BIL_CFG_BillItemPrice
SET IntegrationName = 'BED CHARGES'
WHERE ItemName = 'BED CHARGES'
GO
--- END: Ramavtar: 12Oct'18 changes in BIL_CFG_BillItemPrice ---

---start: Ashim 28Oct2018 ---update BillingType and TransactionType to lower case----

ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] DISABLE TRIGGER [TRG_BillingTransaction_RestrictBillAlter]
GO
ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] DISABLE TRIGGER [TRG_BillToAcc_BillingTxn]
GO

update BIL_TXN_BillingTransaction
set TransactionType = 'inpatient' where TransactionType = 'inpatient'
go

update BIL_TXN_BillingTransaction
set TransactionType = 'outpatient' where TransactionType = 'outpatient'
go

ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] ENABLE TRIGGER [TRG_BillToAcc_BillingTxn]
GO
ALTER TABLE [dbo].[BIL_TXN_BillingTransaction] ENABLE TRIGGER [TRG_BillingTransaction_RestrictBillAlter]
GO

ALTER TABLE [dbo].[BIL_TXN_BillingTransactionItems] DISABLE TRIGGER [TRG_BillToAcc_BillingTxnItem]
GO
update BIL_TXN_BillingTransactionItems
set BillingType = 'inpatient' where BillingType = 'inpatient'
go
update BIL_TXN_BillingTransactionItems
set BillingType = 'outpatient' where BillingType = 'outpatient'
go
ALTER TABLE [dbo].[BIL_TXN_BillingTransactionItems] ENABLE TRIGGER [TRG_BillToAcc_BillingTxnItem]
GO
---end: Ashim 28Oct2018 ---update BillingType and TransactionType to lower case----

---END: Ashim : 2018-10-29 --- Merged IpBillingIncremental_8Sep+----


------START: Build_DEV_1.4.0_Labs&Nursing Ward Billing-- 6-Nov-2018---

---START: Vikas : 2018-11-02 --- Script of pharmacy Drugs Requisition & Drugs Requisition Items.
/****** Object:  Table [dbo].[PHRM_Requisition]    Script Date: 02-11-2018 15:24:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_Requisition](
	[RequisitionId] [int] IDENTITY(1,1) NOT NULL,
	[VisitId] [int] NOT NULL,
	[PatientId] [int] NOT NULL,
	[Status] [varchar](50) NULL,
	[ReferenceId] [bit] NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [date] NOT NULL,
 CONSTRAINT [PK_PHRM_Requisition] PRIMARY KEY CLUSTERED 
(
	[RequisitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PHRM_Requisition]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_Requisition_PAT_Patient] FOREIGN KEY([PatientId])
REFERENCES [dbo].[PAT_Patient] ([PatientId])
GO

ALTER TABLE [dbo].[PHRM_Requisition] CHECK CONSTRAINT [FK_PHRM_Requisition_PAT_Patient]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Comman seperated id of table PHRM_SaleItems' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PHRM_Requisition', @level2type=N'COLUMN',@level2name=N'ReferenceId'
GO
----

/****** Object:  Table [dbo].[PHRM_RequisitionItems]    Script Date: 02-11-2018 15:31:58 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_RequisitionItems](
	[RequisitionItemId] [int] IDENTITY(1,1) NOT NULL,
	[RequisitionId] [int] NOT NULL,
	[ItemId] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
 CONSTRAINT [PK_PHRM_RequisitionItems] PRIMARY KEY CLUSTERED 
(
	[RequisitionItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_Requisition] FOREIGN KEY([RequisitionId])
REFERENCES [dbo].[PHRM_Requisition] ([RequisitionId])
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems] CHECK CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_Requisition]
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_RequisitionItems] FOREIGN KEY([RequisitionItemId])
REFERENCES [dbo].[PHRM_RequisitionItems] ([RequisitionItemId])
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems] CHECK CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_RequisitionItems]
GO
---END: Vikas : 2018-11-02 --- Script of pharmacy Drugs Requisition & Drugs Requisition Items.

---START: Vikas : 2018-11-02 --- Script of pharmacy Provisional Item Permission and Router config. 
---- insert permission for pharmacy Provisional Item-----
--DECLARE @appId INT
--SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'PHRM')
--INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
--    VALUES('pharmacy-provisional-item-view', @appId, 1, GETDATE(), 1)

------------------------------------------------------------------------------------------
------ insert router link for pharmacy Provisional Item-----
--Insert into RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
--values('Provisional Item','Pharmacy/ProvisionalItems','ProvisionalItems',
--(select permissionid from RBAC_Permission where PermissionName='pharmacy-provisional-item-view'),
--(select RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy' and RouterLink='Pharmacy'),
--1,9,1
--)
---END: Vikas : 2018-11-02 --- Script of pharmacy Provisional Item Permission and Router config. 

--- START: Ramavtar: 2018-11-02 -- script of SP for doctorpatientCounts ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SP_Report_BIL_DailyMISDrPatientCount] -- SP_Report_BIL_DailyMISDrPatientCount '2018-07-27','2018-07-27'
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
	SELECT
		ISNULL(ProviderId,0) 'ProviderId',
		ISNULL(emp.FirstName + ' ' + emp.LastName,'NoDoctor') 'ProviderName',
		COUNT(DISTINCT PatientId) 'PatientCount' 
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation](@FromDate,@ToDate) bil
	LEFT JOIN EMP_Employee emp ON bil.ProviderId = emp.EmployeeId
	GROUP BY bil.ProviderId,emp.FirstName,emp.LastName
	ORDER BY 2
END
GO
---END: Ramavtar: 2018-11-02 -- script of SP for doctorpatientCounts ---


-----START: Anish-6-Nov-2018--Merged from R2V1/Labs_Nursing Feature Branch--

Create table LAB_BarCode (
	BarCodeId INT  Not Null IDENTITY(1, 1) ,
	BarCodeNumber INT Primary Key Not Null,
	CreatedBy INT,
	CreatedOn DATETIME,
	ModifiedBy INT,
	ModifiedOn DATETIME,
	IsActive bit
);
GO

Alter table LAB_TestRequisition
add BarCodeNumber INT null;
GO

ALTER TABLE [dbo].[LAB_TestRequisition] WITH CHECK ADD CONSTRAINT [FK_LAB_TESTREQUISITION_LAB_BARCODE] FOREIGN KEY([BarCodeNumber])
REFERENCES [dbo].[LAB_BarCode] ([BarCodeNumber])
GO

---Start:Anish: 26 Oct 2018 Routing Data to inserted into RBAC_Permission,RBAC_RouteConfig,RBAC_MAP_RolePermission  Table(For Adding BarCode Tab in Lab Module)
declare @AppnID_Settings INT
SET @AppnID_Settings = (Select TOP(1) ApplicationId from [RBAC_Application] where ApplicationName='Lab');

Insert into [RBAC_Permission] (PermissionName,ApplicationId,IsActive,CreatedBy,CreatedOn) 
Values ('lab-barcode-view',@AppnID_Settings,'true','1', GETDATE());
Go

declare @ParentId INT
declare @OwnPerId INT

SET @ParentId = (Select TOP(1) RouteId from [RBAC_RouteConfig] where UrlFullPath = 'Lab');
SET @OwnPerId = (Select TOP(1) PermissionId from [RBAC_Permission] where PermissionName = 'lab-barcode-view');

Insert into [RBAC_RouteConfig] (DisplayName,UrlFullPath,PermissionId,ParentRouteId,RouterLink,DefaultShow,Css,DisplaySeq,IsActive)
Values ('BarCode','Lab/BarCode',@OwnPerId,@ParentId,'BarCode',1,'fa fa-barcode',8,1);


Insert into [RBAC_MAP_RolePermission] (RoleId,PermissionId,CreatedBy,CreatedOn,IsActive) 
Values (1,@OwnPerId,1,GETDATE(),1);
Go
---End:Anish: 26 Oct 2018---

--Start: ANISH: 4 Nov 2018, Updated 5 Signatories by default in Report---
update [dbo].[CORE_CFG_Parameters]
set ParameterValue = '{"empIdList":[93,108,118,59,63]}' 
where ParameterName = 'DefaultSignatoriesEmpId' and ParameterGroupName='LAB' and ValueDataType='JSON';
GO
---End:Anish: 4 Nov 2018---

---start: sud: 4 Nov 2018---for Lab-Sticker configuration--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('LAB','LabSticker_PrintServerSide','true','string','whether or not to print lab sticker from server side.')
GO
---we need to create below folder in that location--
Insert into CORE_CFG_Parameters(ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
Values('LAB','LabStickerFolderPath','C:\\DanpheHealthInc_PvtLtd_Files\\Print\\LabSticker\\SampleCollection\\','string','This location used from sample collection region.')
GO
---end: sud: 4 Nov 2018---for Lab-Sticker configuration--

-----END: Anish-6-Nov-2018--Merged from R2V1/Labs_Nursing Feature Branch--

------END: Build_DEV_1.4.0_Labs&Nursing Ward Billing-- 6-Nov-2018---

---- START: Ramavtar 12Nov'18 : SP changes doctor-summary, custom-report, gov-summary report ----
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
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
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
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
				BillingType, 
				RequestingDeptId,

					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
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
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
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
	ORDER BY 2 
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BILL_CustomReport] 
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
1      Nagesh/2018-08-27	        created the script
2	   Ramavtar/12Nov'18			correcting parameter passed to fn-> FN_BIL_GetSrvDeptReportingName
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
				ItemName,dbo.FN_BIL_GetSrvDeptReportingName(bil.ServiceDepartmentName,ItemName)as ServDepartmentName,Quantity,TotalAmount 
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
		END
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE  [dbo].[SP_Report_Gov_Summary] --'2017-12-13','2017-12-15'
   @FromDate DATETIME = NULL,
   @ToDate DATETIME= NULL
		/*
FileName: [SP_Report_Gov_Summary]
CreatedBy/date: Sagar/2017-06-06
Description: to get count of no of Outpatient Services, ER services and Diagnostic services by Gender between given dates.
Remarks:    default getdate() for FromDate and ToDate.
         : ToDate is incremented by 1 since otherwise it doesn't take 

[NOTE] : This SP returns 2 TABLES  (table1: Outpatient and ER services, table2: DiagnosticServices)
            
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1       Sagar/2017-06-06	               Created the script 
2       Sagar/2017-06-14                   Altered the Script
3       Sud/2017-12-14                     Added Emergency services to the return table
                                           
--------------------------------------------------------
*/
AS
BEGIN
	SET @FromDate = Convert(datetime,CONVERT(varchar(10), ISNULL(@FromDate,GetDate()),126))
	-- incrementing to-date by 1 since it takes 2017-12-11 as 2017-12-11 00:00:00 AM 
	--- which exculdes the data of this day.
	SET @ToDate= Convert(datetime,CONVERT(varchar(10), ISNULL(@ToDate,GetDate()),126))+1

	declare @TblAgeGroup table(AgeRange varchar(20), Seq int)
	insert into @TblAgeGroup values('0-9 Years',1)
	insert into @TblAgeGroup values('10-19 Years',2)
	insert into @TblAgeGroup values('20-59 Years',3)
	insert into @TblAgeGroup values('>=60 Years',4)

	-----table 1-- Outpatient and Emergency Services---
	SELECT A.AgeRange,
	ISNULL(B.FemalePatients,0) as FemaleNew_Out,
	ISNULL(B.MalePatients,0) as MaleNew_Out,
	ISNULL(b.TotalFemalePatients,0) as FemaleTotal_Out,
	ISNULL(b.TotalMalePatients,0) as MaleTotal_Out,
	ISNULL(C.Female,0) as Female_ER,
	ISNULL(C.Male,0) as Male_ER

	FROM @TblAgeGroup A
	 --Altered the Script Left joined with TblAgeGroup table specially created to 
	 --give order to the AgeRange Column also Replaced Null values with 0 
	Left Join 
	(

	SELECT  dbo.GetDobAgeRange(DateOfBirth,@FromDate) AgeRange, 
		 -------New Client Served-----------------
		 SUM(CASE WHEN op.Gender = 'Female' 
		      AND CreatedOn BETWEEN @FromDate AND @ToDate THEN 1 END) AS FemalePatients,
		  SUM(CASE WHEN op.Gender = 'Male' 
		       AND CreatedOn BETWEEN @FromDate AND @ToDate  THEN 1 END) AS MalePatients,
		  --------For Total Client Served-----------
 		  SUM(CASE WHEN oP.Gender = 'Female'  THEN 1 END) AS TotalFemalePatients,
		  SUM(CASE WHEN oP.Gender = 'Male' THEN 1 END) AS TotalMalePatients
		FROM (
			 SELECT DISTINCT a.PatientId,a.Gender FROM PAT_Patient a
			 INNER JOIN BIL_TXN_BillingTransactionItems b
			 ON a.PatientId = b.PatientId
			 WHERE b.RequisitionDate BETWEEN @FromDate AND @ToDate 
			 ) iP, PAT_Patient oP
		WHERE ip.PatientId=op.PatientId 
			 GROUP BY dbo.GetDobAgeRange(DateOfBirth,@FromDate)
	    
	) B
	ON A.AgeRange=B.AgeRange
	LEFT JOIN
	(
		SELECT  dbo.GetDobAgeRange(DateOfBirth,@FromDate) AgeRange, 
			 -------New Client Served-----------------
			  SUM(CASE WHEN op.Gender = 'Female'  THEN 1 ELSE 0 END) AS Female,
			  SUM(CASE WHEN op.Gender = 'Male'  THEN 1 ELSE 0 END) AS Male

			FROM (
				 SELECT DISTINCT a.PatientId,a.Gender FROM PAT_Patient a
				 INNER JOIN BIL_TXN_BillingTransactionItems b
				 ON a.PatientId = b.PatientId
				 WHERE convert(date,b.RequisitionDate) BETWEEN @FromDate AND @ToDate 
				 and b.ItemName='ER Ticket' and b.ServiceDepartmentName='Emergency'
				 ) iP, PAT_Patient oP
			WHERE ip.PatientId=op.PatientId 
				 GROUP BY dbo.GetDobAgeRange(DateOfBirth,@FromDate)   
		) C

		on A.AgeRange=C.AgeRange
		 ORDER BY A.Seq
--------------------------------------------------------------------------------
	 
	-----table 2--Diagnistic Services--
	Select a.ServiceDepartmentName AS DiagnosticServices,Unit='Number',
		   SUM( CASE WHEN BillingTransactionItemId IS NULL THEN 0 ELSE 1 END) 'Number'
	 FROM BIL_MST_ServiceDepartment a LEFT JOIN BIL_TXN_BillingTransactionItems b
		   ON a.ServiceDepartmentId=b.ServiceDepartmentId
	 WHERE a.ServiceDepartmentName IN ('X-Ray','Ultrasonogram(USG)','Magnetic Resonance Imaging(MRI)',
		  'Computed Tomographic(CT) Scan','Electro Encephalo Gram(EEG)','Electrocardiogram(ECG)','Trademill','Echocardiogram(Echo)') 
		   AND ( b.PaidDate IS NULL 
		   OR ( b.PaidDate BETWEEN  @FromDate AND @ToDate)
		  )
		  GROUP BY a.ServiceDepartmentName

	 UNION ALL

	 SELECT a.ServiceDepartmentName AS DiagnosticServices,Unit='Person',COUNT(b.BillingTransactionItemId) AS Number
	 FROM BIL_MST_ServiceDepartment a LEFT JOIN BIL_TXN_BillingTransactionItems b
		   ON a.ServiceDepartmentId=b.ServiceDepartmentId
	 WHERE a.ServiceDepartmentName IN ('Endoscopy','Colonoscopy','Nuclear Medicine') AND ( b.PaidDate IS NULL 
		   OR ( b.PaidDate BETWEEN  @FromDate AND @ToDate)
		  )
		   GROUP BY a.ServiceDepartmentName

-------------------------------------------------------------------------------
END	
GO
---- END: Ramavtar 12Nov'18 : SP changes doctor-summary, custom-report, gov-summary report ----

---START: Ashim: 2018-11-13 : Build_HotFix_1.3.2_IpBilling----


---Start: Yubaraj: 2018-11-12 --- Updated ServiceDepartment Name for OT and Miscellenous
/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts]    Script Date: 11/12/2018 6:14:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LAB CHARGES')  THEN ('LAB Charges')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY Charges')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'BED CHARGES'))  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGE'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		   WHEN(@ServiceDeptName='OT') then ('OT Procedure Charges ')
		   WHEN(@ServiceDeptName='MISCELLENOUS CHARGES') OR (@ServiceDeptName='MISCELLANEOUS') then ('Miscellenous Charges')
		  ELSE (@ServiceDeptName) END 
		 )
END
GO
---End: Yubaraj: 2018-11-12 ---Updated ServiceDepartment Name for OT and Miscellenous


---END: Ashim: 2018-11-13 : Build_HotFix_1.3.2_IpBilling----


---Start: Yubaraj: 2018-11-13 : Build_HotFix_1.3.3_IpBilling----
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER FUNCTION [dbo].[FN_BIL_GetSrvDeptFormattedName_ForBillingReceipts] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

AS
BEGIN
  RETURN ( CASE when (@ServiceDeptName='LABORATORY' and @ItemName='PAP Smear')  THEN ('PAP Smear') 
  when (@ServiceDeptName='LABORATORY' and @ItemName='Slide Consultation')  THEN ('Slide Consultation') 
 when ((@ServiceDeptName='EXTERNAL LAB - 1' or @ServiceDeptName='LABORATORY') and @ItemName like '%FNAC%')  THEN ('FNAC') 
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
					OR(@ServiceDeptName='LAB CHARGES')  THEN ('LAB Charges')	
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
					OR(@ServiceDeptName='IMAGING')  THEN ('RADIOLOGY Charges')

          WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'INDOOR-DOCTOR''S VISIT FEE (PER DAY)' OR @ItemName='DOCTOR ROUND CHARGES'))  THEN ('DOCTOR VISIT CHARGES') 
		  WHEN (@ServiceDeptName='CHARGES FOR BED DR.VISIT & ADMISSION FEE' AND ( @ItemName = 'BED CHARGES'))  THEN ('BED CHARGES') 
		  WHEN (@ServiceDeptName = 'IPD' AND @ItemName='ADMISSION CHARGES (INDOOR)') THEN 'ADMISSION CHARGE'
		  WHEN (@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' AND @ItemName = 'BED SIDE ECHO')  THEN ('BED SIDE ECHO') 
		  WHEN(@ServiceDeptName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS') OR(@ServiceDeptName='CARDIOVASCULAR SURGERY') 	then ('CTVS')
		  WHEN(@ServiceDeptName='OT') then ('OPERATION Charges')
		  WHEN(@ServiceDeptName='MISCELLENOUS CHARGES') OR (@ServiceDeptName='MISCELLANEOUS') then ('MISCELLANEOUS CHARGES')
		  ELSE (@ServiceDeptName) END 
		 )
END
GO
---End: Yubaraj: 2018-11-13 --- Build_HotFix_1.3.3 --


---Start: 11 Nov 2018, WardName Added in LabRequisition Table---
alter table [dbo].[LAB_TestRequisition]
add WardName varchar(50);
Go
--End: Anish 11 Nov 2018--

--Start: Nov 16, 2018 Merged from R2V1-Feature-Labs_Nursing to R2V1-Dev branch---
--Start: Anish 12 Nov 2018, Data Correction after WardName addition in each page of Lab--
update [dbo].[LAB_TestRequisition]
set WardName='outpatient' where VisitType = 'outpatient';

update [dbo].[LAB_TestRequisition]
set WardName='emergency' where VisitType = 'emergency';

SELECT req.PatientVisitId, ward.WardName  
FROM [dbo].[LAB_TestRequisition] req
Inner Join
	( Select * from 
		 ( SELECT PatientId, PatientVisitId, CreatedOn, WardId
			,ROW_NUMBER() OVER (PARTITION BY PatientId, PatientVisitId ORDER BY CreatedOn DESC) AS RowNum
			FROM [dbo].adt_txn_patientBedinfo
		) orderedBedInfo
	where RowNum=1
   ) bed 
ON req.PatientVisitId = bed.PatientVisitId
INNER JOIN [dbo].[ADT_MST_Ward] ward on bed.WardId = ward.WardID
WHERE req.VisitType = 'inpatient' and req.PatientVisitId Is not Null;
GO
Update req
set req.WardName=ward.WardName 
FROM [dbo].[LAB_TestRequisition] req
Inner Join
	( Select * from 
		 ( SELECT PatientId, PatientVisitId, CreatedOn, WardId
			,ROW_NUMBER() OVER (PARTITION BY PatientId, PatientVisitId ORDER BY CreatedOn DESC) AS RowNum
			FROM [dbo].adt_txn_patientBedinfo
		) orderedBedInfo
	where RowNum=1
   ) bed 
ON req.PatientVisitId = bed.PatientVisitId
INNER JOIN [dbo].[ADT_MST_Ward] ward on bed.WardId = ward.WardID
WHERE req.VisitType = 'inpatient' and req.PatientVisitId Is not Null;
GO
--End: Anish 12 Nov 2018--
--End: Nov 16, 2018 Merged from R2V1-Feature-Labs_Nursing to R2V1-Dev branch---


---start: sud:16Nov-18--Billing-Sales-Reports correction---
GO
/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 11/16/2018 3:30:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-10-09','2018-10-09',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.      sud/2018-11-16                      ReturnDeposit handled for Inpatient-Discharge case, 
                                            here DepositType comes as 'ReturnDeposit', and there's no settlementId or billingTransactionid. 
-----------------------------------------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)
  BEGIN
    SELECT
      *
    FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks,'') 'ReturnRemark'
		FROM ((SELECT
					Dates 'ReportDate'
				FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

    LEFT JOIN (
    --- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
    ---Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
    SELECT
      CONVERT(date, CreatedOn) 'TxnDate',
      BillingTransactionId,
      InvoiceCode,
      InvoiceNo,
      PatientID,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_BillingTransaction
    WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())

    UNION

    SELECT DISTINCT
      CONVERT(date, CreatedOn) AS TxnDate,
      BillingTransactionId,
      InvoiceCode,
      RefInvoiceNum,
      PatientId,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r
    WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
      ON dates.ReportDate = txnInfo.TxnDate
    ---Join with Patient and Employee Table to get their names etc---
    INNER JOIN PAT_Patient pat
      ON txnInfo.PatientId = pat.PatientId
    INNER JOIN EMP_Employee emp
      ON txnInfo.CreatedBy = emp.EmployeeId

    LEFT JOIN BIL_TXN_BillingTransaction txn
      ON dates.ReportDate = CONVERT(date, txn.CreatedOn)
      AND txnInfo.BillingTransactionId = txn.BillingTransactionId
      AND txnInfo.CounterId = txn.CounterId
      AND txnInfo.CreatedBy = txn.CreatedBy

    LEFT OUTER JOIN (
    --- deposit deduct happens both from Transaction and settlement
    -- take only those from Transaction in this query..
    -- condition is: BillingTransaction Is NOT NULL--
    SELECT
      CONVERT(date, CreatedOn) AS DepositRetDate,
      Amount,
      BillingTransactionId,
      CounterId,
      CreatedBy
    FROM BIL_TXN_Deposit
    WHERE DepositType = 'depositdeduct'
    AND BillingTransactionId IS NOT NULL) depRet
      ON dates.ReportDate = depRet.DepositRetDate
      AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
      AND txnInfo.CounterId = depRet.CounterId
      AND txnInfo.CreatedBy = depRet.CreatedBy
    LEFT JOIN (

    ---Sud: 9May'18--our return table is now changed--
    ---get only returned bills---
    SELECT
      CONVERT(date, CreatedOn) AS bilReturnDate,
      BillingTransactionId,
      RefInvoiceNum,
      TotalAmount 'ReturnAmount',
      TaxTotal AS 'ReturnedTax',
      CounterId,
      CreatedBy,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r) bilRet
      ON dates.ReportDate = bilret.bilReturnDate
      AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
      AND txnInfo.CounterId = bilRet.CounterId
      AND txnInfo.CreatedBy = bilRet.CreatedBy
    )
    WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
    AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

    UNION ALL

    SELECT
      CONVERT(date, deposits.DepositDate) 'DepositDate',
      deposits.ReceiptNo 'ReceiptNo',
      pat.PatientCode 'HospitalNo',
      pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
      0 'Price',
      0 'DiscountAmount',
      0 'ReturnedAmount',
      deposits.AdvanceReceived 'AdvanceReceived',
      deposits.AdvancedSettled 'AdvancedSettled',
      0 'Tax',
      deposits.TotalAmount 'TotalAmount',
      emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
      deposits.CounterId 'CounterId',
      0 'ReturnedTax',
	  '' 'ReturnRemark'
    FROM (SELECT
           CONVERT(date, CreatedOn) 'DepositDate',
           'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
           PatientId,
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             ELSE 0
           END AS 'AdvanceReceived',
           CASE
             WHEN DepositType = 'ReturnDeposit' THEN Amount
             ELSE 0
           END AS 'AdvancedSettled',
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             WHEN DepositType = 'ReturnDeposit' THEN -Amount
             ELSE 0
           END AS 'TotalAmount',
           CreatedBy 'CreatedBy',
           CounterId 'CounterId'
         FROM BIL_TXN_Deposit
         WHERE ReceiptNo IS NOT NULL
         AND (DepositType = 'DEPOSIT'
         OR DepositType = 'ReturnDeposit')

         UNION ALL
     
	    Select Convert(Date,CreatedOn) 'DepositDate',
			--we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			CASE WHEN SettlementId IS NOT NULL THEN  'SR'+Convert(varchar(20),SettlementId) 
			ELSE 'SR' END AS 'ReceiptNo', 

				   PatientId,
				   0 AS 'AdvanceReceived',
				   Amount AS 'AdvancedSettled',
				   -Amount AS 'TotalAmount',
				   CreatedBy  'CreatedBy',
				   CounterId 'CounterId'
			from BIL_TXN_Deposit
			----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			WHERE (( DepositType='depositdeduct'  AND  SettlementId IS NOT NULL ) OR DepositType='ReturnDeposit')
			and Convert(Date,CreatedOn)  BETWEEN  ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE()) 

		 
		 ) deposits,


         EMP_Employee emp,
         PAT_Patient pat,
         BIL_CFG_Counter cntr
    WHERE deposits.PatientId = pat.PatientId
    AND emp.EmployeeId = deposits.CreatedBy
    AND deposits.CounterId = cntr.CounterId
    AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
    AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	) dum
    ORDER BY dum.ReceiptNo
  END
END
GO
---end: sud:16Nov-18--Billing-Sales-Reports correction---

---END: Ashim : 2018-10-29 --- Merged IpBillingIncremental_8Sep+----
--End :Anish 2018-10-22--- 


--Start: Abhishek :06 oct, CounterId on return--
alter table PHRM_TXN_InvoiceReturnItems
add CounterId int null
GO
update PHRM_TXN_InvoiceReturnItems
set CounterId =
inv.CounterId from PHRM_TXN_InvoiceReturnItems as invRet
inner join  PHRM_TXN_InvoiceItems as inv on invRet.InvoiceItemId = inv.InvoiceItemId 
GO
--End: Abhishek :06 oct, CounterId on return--
---Start: sud-19Nov-18--Lab-Tests Component Updates----
---To add new antibiotics Amoxyclav (AMC)  and Colony Count to All Culture and sensitivity reports--
Update [dbo].[LAB_LabTests]
set LabTestComponentsJSON = '[{"Component":"Isolated Organism","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":"","ValueLookup":"Isolated-Organism","DisplaySequence":1,"Indent":false},{"Component":"Colony Count","Unit":null,"ValueType":"string","ControlType":"TextBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":null,"DisplaySequence":2,"Indent":false},{"Component":"Amikacin (AK)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":"","ValueLookup":"Culture-Sensitivity","DisplaySequence":3,"Indent":false},{"Component":"Amoxycillin (AMX)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":6,"Indent":false},{"Component":"Amoxyclav (AMC)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":9,"Indent":false},{"Component":"Azithromycin (AZM)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":12,"Indent":false},{"Component":"Carbenicillin (CB)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":15,"Indent":false},{"Component":"Cefazolin (CZ)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":18,"Indent":false},{"Component":"Cefixime (CFM)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":21,"Indent":false},{"Component":"Ceftazidime (CAZ)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":24,"Indent":false},{"Component":"Ceftizoxime","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":27,"Indent":false},{"Component":"Ceftriaxone (CTR)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":30,"Indent":false},{"Component":"Cefuroxime Sodium","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":33,"Indent":false},{"Component":"Cephalexin (CN)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":36,"Indent":false},{"Component":"Cephotaxime (CTX)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":39,"Indent":false},{"Component":"Cephoxitin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":42,"Indent":false},{"Component":"Cefepime (CPM)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":45,"Indent":false},{"Component":"Chloramphenical","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":48,"Indent":false},{"Component":"Ciprofloxacin (CIP)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":51,"Indent":false},{"Component":"Clarithromycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":54,"Indent":false},{"Component":"Clindamycin (CD)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":57,"Indent":false},{"Component":"Cloxacillin (COX)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":60,"Indent":false},{"Component":"Co-trimoxazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":63,"Indent":false},{"Component":"Colistin (CL)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":66,"Indent":false},{"Component":"Doxycycline","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":69,"Indent":false},{"Component":"Erythromycin (E)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":72,"Indent":false},{"Component":"Fluconazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":75,"Indent":false},{"Component":"Gentamycin (G)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":78,"Indent":false},{"Component":"Imipenum (IPM)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":81,"Indent":false},{"Component":"Kanamycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":84,"Indent":false},{"Component":"Ketokonazole","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":87,"Indent":false},{"Component":"Levofloxacin (LE)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":90,"Indent":false},{"Component":"Meropenum (MRP)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":93,"Indent":false},{"Component":"Methicillin (MET)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":96,"Indent":false},{"Component":"Nalidixic Acid","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":99,"Indent":false},{"Component":"Nalidixic Acid (NA)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":102,"Indent":false},{"Component":"Neomycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":105,"Indent":false},{"Component":"Nitrofurantoin (NIT)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":108,"Indent":false},{"Component":"Norfloxacin (NX)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":111,"Indent":false},{"Component":"Novobiocin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":114,"Indent":false},{"Component":"Ofloxacin (OF)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":117,"Indent":false},{"Component":"Oxacillin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":120,"Indent":false},{"Component":"Oxacillin (OX)","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":123,"Indent":false},{"Component":"Piperacillin/Tazobactum","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":126,"Indent":false},{"Component":"Pipercillin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":129,"Indent":false},{"Component":"Polymycin b","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":132,"Indent":false},{"Component":"Polymyxin-b","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":135,"Indent":false},{"Component":"Ticarcillin/Clavulanic Acid","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":138,"Indent":false},{"Component":"Tetracycline","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":141,"Indent":false},{"Component":"Trimethopim","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":144,"Indent":false},{"Component":"Vancomycin","Unit":null,"ValueType":"string","ControlType":"SearchBox","Range":null,"RangeDescription":null,"Method":null,"ValueLookup":"Culture-Sensitivity","DisplaySequence":147,"Indent":false}]'
where LabTestName like '%c/s%' OR LabTestName ='CULTURE AND SENSITIVITY'
GO
----End: sud-19Nov-18--Lab-Tests Component Updates----
-- START: Ramavtar: change URL of report daily sales to UserCollection ---
  UPDATE RBAC_RouteConfig
	SET RouterLink='UserCollectionReport',
		DisplayName='User Collection',
		UrlFullPath='Reports/BillingMain/UserCollectionReport'
  WHERE UrlFullPath = 'Reports/BillingMain/DailySalesReport'
  GO

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 20-11-2018 16:50:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-10-09','2018-10-09',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.		ramavtar/2018-11-20					filterout unpaid records
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
  SELECT
    *
  FROM (SELECT DISTINCT
    CONVERT(varchar(20), dates.ReportDate) AS [Date],
    txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
    pat.PatientCode AS HospitalNo,
    pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
    ISNULL(txn.SubTotal, 0) AS 'Price',
    ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
    ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
    0 AS 'AdvanceReceived',
    ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
    ISNULL(txn.TaxTotal, 0) AS 'Tax',
    ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
    emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
    txnInfo.CounterId AS 'CounterId',
    ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
    ISNULL(bilRet.Remarks, '') 'ReturnRemark'
  FROM ((SELECT
    Dates 'ReportDate'
  FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

	LEFT JOIN (
  --- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
  ---Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
		SELECT
			CONVERT(date, CreatedOn) 'TxnDate',
			BillingTransactionId,
			InvoiceCode,
			InvoiceNo,
			PatientID,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_BillingTransaction
		WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
			AND BillStatus != 'unpaid'			--ramavtar:20-nov-18 filterring out unpaid (credit bills)

		UNION

		SELECT DISTINCT
			CONVERT(date, CreatedOn) AS TxnDate,
			BillingTransactionId,
			InvoiceCode,
			RefInvoiceNum,
			PatientId,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_InvoiceReturn r
		WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
	) txnInfo ON dates.ReportDate = txnInfo.TxnDate
  ---Join with Patient and Employee Table to get their names etc---
  INNER JOIN PAT_Patient pat ON txnInfo.PatientId = pat.PatientId
  INNER JOIN EMP_Employee emp ON txnInfo.CreatedBy = emp.EmployeeId

  LEFT JOIN BIL_TXN_BillingTransaction txn ON dates.ReportDate = CONVERT(date, txn.CreatedOn)
    AND txnInfo.BillingTransactionId = txn.BillingTransactionId
    AND txnInfo.CounterId = txn.CounterId
    AND txnInfo.CreatedBy = txn.CreatedBy

  LEFT OUTER JOIN (
  --- deposit deduct happens both from Transaction and settlement
  -- take only those from Transaction in this query..
  -- condition is: BillingTransaction Is NOT NULL--
  SELECT
    CONVERT(date, CreatedOn) AS DepositRetDate,
    Amount,
    BillingTransactionId,
    CounterId,
    CreatedBy
  FROM BIL_TXN_Deposit
  WHERE DepositType = 'depositdeduct'
  AND BillingTransactionId IS NOT NULL) depRet
    ON dates.ReportDate = depRet.DepositRetDate
    AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
    AND txnInfo.CounterId = depRet.CounterId
    AND txnInfo.CreatedBy = depRet.CreatedBy
  LEFT JOIN (

  ---Sud: 9May'18--our return table is now changed--
  ---get only returned bills---
  SELECT
    CONVERT(date, CreatedOn) AS bilReturnDate,
    BillingTransactionId,
    RefInvoiceNum,
    TotalAmount 'ReturnAmount',
    TaxTotal AS 'ReturnedTax',
    CounterId,
    CreatedBy,
    Remarks
  FROM BIL_TXN_InvoiceReturn r) bilRet
    ON dates.ReportDate = bilret.bilReturnDate
    AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
    AND txnInfo.CounterId = bilRet.CounterId
    AND txnInfo.CreatedBy = bilRet.CreatedBy
  )
  WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
  AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

  UNION ALL

  SELECT
    CONVERT(date, deposits.DepositDate) 'DepositDate',
    deposits.ReceiptNo 'ReceiptNo',
    pat.PatientCode 'HospitalNo',
    pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
    0 'Price',
    0 'DiscountAmount',
    0 'ReturnedAmount',
    deposits.AdvanceReceived 'AdvanceReceived',
    deposits.AdvancedSettled 'AdvancedSettled',
    0 'Tax',
    deposits.TotalAmount 'TotalAmount',
    emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
    deposits.CounterId 'CounterId',
    0 'ReturnedTax',
    '' 'ReturnRemark'
  FROM (SELECT
         CONVERT(date, CreatedOn) 'DepositDate',
         'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
         PatientId,
         CASE
           WHEN DepositType = 'Deposit' THEN Amount
           ELSE 0
         END AS 'AdvanceReceived',
         CASE
           WHEN DepositType = 'ReturnDeposit' THEN Amount
           ELSE 0
         END AS 'AdvancedSettled',
         CASE
           WHEN DepositType = 'Deposit' THEN Amount
           WHEN DepositType = 'ReturnDeposit' THEN -Amount
           ELSE 0
         END AS 'TotalAmount',
         CreatedBy 'CreatedBy',
         CounterId 'CounterId'
       FROM BIL_TXN_Deposit
       WHERE ReceiptNo IS NOT NULL
       AND (DepositType = 'DEPOSIT'
       OR DepositType = 'ReturnDeposit')

       UNION ALL
       SELECT
         CONVERT(date, CreatedOn) 'DepositDate',
         'SR' + CONVERT(varchar(20), SettlementId) 'ReceiptNo',
         PatientId,
         0 AS 'AdvanceReceived',
         Amount AS 'AdvancedSettled',
         -Amount AS 'TotalAmount',
         CreatedBy 'CreatedBy',
         CounterId 'CounterId'
       FROM BIL_TXN_Deposit
       WHERE DepositType = 'depositdeduct'
       AND SettlementId IS NOT NULL) deposits,
       EMP_Employee emp,
       PAT_Patient pat,
       BIL_CFG_Counter cntr
  WHERE deposits.PatientId = pat.PatientId
  AND emp.EmployeeId = deposits.CreatedBy
  AND deposits.CounterId = cntr.CounterId
  AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
  AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
  AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')) dum
  ORDER BY dum.ReceiptNo
END
END
GO
  ---END: ramavtar: change name of report daily sales to UserCollection ---

----start: 21Nov'18--Reverse integration from R2V1/Features/Pharmacy_NursingRequisition branch---



---START: Vikas : 2018-11-02 --- Script of pharmacy Drugs Requisition & Drugs Requisition Items.

IF OBject_ID('PHRM_RequisitionItems') IS NOT NULL
BEGIN
 DroP TABLE PHRM_RequisitionItems
END
GO
IF OBject_ID('PHRM_Requisition') IS NOT NULL
BEGIN
 DroP TABLE PHRM_Requisition
END

/****** Object:  Table [dbo].[PHRM_Requisition]    Script Date: 02-11-2018 15:24:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_Requisition](
  [RequisitionId] [int] IDENTITY(1,1) NOT NULL,
  [VisitId] [int] NOT NULL,
  [PatientId] [int] NOT NULL,
  [Status] [varchar](50) NULL,
  [ReferenceId] [bit] NULL,
  [CreatedBy] [int] NOT NULL,
  [CreatedOn] [date] NOT NULL,
 CONSTRAINT [PK_PHRM_Requisition] PRIMARY KEY CLUSTERED 
(
  [RequisitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PHRM_Requisition]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_Requisition_PAT_Patient] FOREIGN KEY([PatientId])
REFERENCES [dbo].[PAT_Patient] ([PatientId])
GO

ALTER TABLE [dbo].[PHRM_Requisition] CHECK CONSTRAINT [FK_PHRM_Requisition_PAT_Patient]
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Comman seperated id of table PHRM_SaleItems' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'PHRM_Requisition', @level2type=N'COLUMN',@level2name=N'ReferenceId'
GO
----

/****** Object:  Table [dbo].[PHRM_RequisitionItems]    Script Date: 02-11-2018 15:31:58 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[PHRM_RequisitionItems](
  [RequisitionItemId] [int] IDENTITY(1,1) NOT NULL,
  [RequisitionId] [int] NOT NULL,
  [ItemId] [int] NOT NULL,
  [Quantity] [int] NOT NULL,
 CONSTRAINT [PK_PHRM_RequisitionItems] PRIMARY KEY CLUSTERED 
(
  [RequisitionItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_Requisition] FOREIGN KEY([RequisitionId])
REFERENCES [dbo].[PHRM_Requisition] ([RequisitionId])
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems] CHECK CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_Requisition]
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems]  WITH CHECK ADD  CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_RequisitionItems] FOREIGN KEY([RequisitionItemId])
REFERENCES [dbo].[PHRM_RequisitionItems] ([RequisitionItemId])
GO

ALTER TABLE [dbo].[PHRM_RequisitionItems] CHECK CONSTRAINT [FK_PHRM_RequisitionItems_PHRM_RequisitionItems]
GO
---END: Vikas : 2018-11-02 --- Script of pharmacy Drugs Requisition & Drugs Requisition Items.

---START: Vikas : 2018-11-02 --- Script of pharmacy Provisional Item Permission and Router config. 
---- insert permission for pharmacy Provisional Item-----
DECLARE @appId INT
SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'PHRM')
INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES('pharmacy-provisional-item-view', @appId, 1, GETDATE(), 1)

----------------------------------------------------------------------------------------
---- insert router link for pharmacy Provisional Item-----
Insert into RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,DisplaySeq,IsActive)
values('Drug Requisition','Pharmacy/ProvisionalItems','ProvisionalItems',
(select permissionid from RBAC_Permission where PermissionName='pharmacy-provisional-item-view'),
(select RouteId from RBAC_RouteConfig where UrlFullPath='Pharmacy' and RouterLink='Pharmacy'),
1,9,1
)
---END: Vikas : 2018-11-02 --- Script of pharmacy Provisional Item Permission and Router config.

GO
--- START: Mahesh: 2018-11-18 -- alter referenceid from bool to varchar --
alter table PHRM_Requisition alter column ReferenceId varchar(50); 
GO 
--- END: Mahesh: 2018-11-18 -- alter referenceid from bool to varchar --
----END: 21Nov'18--Reverse integration from R2V1/Features/Pharmacy_NursingRequisition branch---

----START: 23 Nov 2018--Reverse integration from R2V1/Features/IRD_Pharmacy branch to DEV branch---

---START: Vikas 2018-10-23 Add Column in Pharmacy Invoice Transaction Table.
  ALTER TABLE PHRM_TXN_Invoice ADD IsRealtime BIT NULL
  ALTER TABLE PHRM_TXN_Invoice ADD IsRemoteSynced BIT NULL
---END: Vikas 2018-10-23 Add Column in Pharmacy Invoice Transaction Table.


--- START :Vikas/2018-10-25 :StoredProcedure fro Pharmacy sales Book 
/****** Object:  StoredProcedure [dbo].[SP_IRD_PHRM_InvoiceDetails]    Script Date: 24-10-2018 17:23:58 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[SP_IRD_PHRM_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null	
AS
/*
FileName: [SP_IRD_PHRM_InvoiceDetails]
CreatedBy/date: Vikas/2018-10-24
Description: to get the Pharmacy Invoice Details as per IRD requirements 
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
select 
		Convert(varchar(20),inv.InvoiceId) as Bill_No,
		pat.FirstName+' '+pat.LastName as Customer_name,	
		pat.PANNumber,		
	    CONVERT(VARCHAR(10), inv.CreateOn, 120) As BillDate,
	    inv.SubTotal AS Amount,
        inv.DiscountAmount as DiscountAmount,
	   ((inv.SubTotal-inv.DiscountAmount)+inv.VATAmount) As Total_Amount,
	   (inv.VATAmount) as Tax_Amount ,
	   case when inv.VATAmount >0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As Taxable_Amount ,
	   case when inv.VATAmount <=0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As  NonTaxable_Amount  ,
	   CASE When inv.IsRemoteSynced=1 then 'Yes' else 'No' END AS SyncedWithIRD,
       CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active,
	   emp.FirstName+' '+emp.LastName as Entered_By,				   
	   emp.FirstName+' '+emp.LastName  as Printed_by
  from PHRM_TXN_Invoice inv 
	 inner join	EMP_Employee emp on emp.EmployeeId=inv.CreatedBy
	 inner join    PAT_Patient pat on pat.PatientId=inv.PatientId
  WHERE (  
        CONVERT(DATE,inv.CreateOn) BETWEEN CONVERT(DATE,@FromDate) 
     AND CONVERT(DATE,@ToDate) 
     ) 
	  END
END

GO
--- END :Vikas/2018-10-25 :StoredProcedure fro Pharmacy sales Book

---Start: Vikas/2018-18-25: Script for pharmacy sales book permission and routeconfig.

------create permission for pharmacy invoicedetails view------
DECLARE @appId INT
SET @appId = (SELECT TOP (1) ApplicationId FROM RBAC_Application WHERE ApplicationCode = 'SYSADM')
INSERT INTO RBAC_Permission (PermissionName, ApplicationId, CreatedBy, CreatedOn, IsActive)
    VALUES('systemadmin-pharmacy-invoicedetails-view', @appId, 1, GETDATE(), 1)

----------------------------------------------------------------------------------------
---- inser router link for pharmacy sales book-----
Insert into RBAC_RouteConfig(DisplayName,UrlFullPath,RouterLink,PermissionId,ParentRouteId,DefaultShow,IsActive)
values('Pharmacy Sales Book','SystemAdmin/PharmacySalesBook','PHRMSalesBook',
(select permissionid from RBAC_Permission where PermissionName='systemadmin-pharmacy-invoicedetails-view'),
(select RouteId from RBAC_RouteConfig where UrlFullPath='SystemAdmin' and RouterLink='SystemAdmin'),
1,1
)

---End: Vikas/2018-18-25: Script for pharmacy sales book permission and routeconfig.

--START: Nagesh/2018 Nov 22: Script for alter Ird report changed, function for return fiscal year name
 --now bililng and pharmacy combined for ird reporting so remove this route from database
 Delete from [RBAC_RouteConfig] where DisplayName='Pharmacy Sales Book'
 Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create FUNCTION [dbo].[FN_COMMON_GetFormattedFiscalYearByDate] (@Date Datetime)
RETURNS Varchar(200)
/*
 File: FN_COMMON_GetFormattedFiscalYearByDate  Created: 22 Nov 2018 By NageshBB
 Description: This function will return formatted fiscal Year name . We can give input parameter as date
 Remarks:
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       22 Nov 2018 By NageshBB                       created function
 
 ------------------------------------------------------------------------------
*/
AS
BEGIN
  
	Declare @formattedFiscalYearName varchar(200)	
			                          
	Select @formattedFiscalYearName= (select FiscalYearFormatted from BIL_CFG_FiscalYears where @Date > StartYear and @Date <EndYear);
		 		   
     IF (@formattedFiscalYearName IS NULL)    
        SET @formattedFiscalYearName =''; 
		 
    RETURN @formattedFiscalYearName;  
END
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_IRD_PHRM_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null	
AS
/*
FileName: [SP_IRD_PHRM_InvoiceDetails]
CreatedBy/date: Vikas/2018-10-24
Description: to get the Pharmacy Invoice Details as per IRD requirements 
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.			Vikas/2018-10-24					Created
 2.       22 Nov 2018 By NageshBB                Update for fiscal year, and other columns
 
 ------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
select 
        dbo.FN_COMMON_GetFormattedFiscalYearByDate(inv.CreateOn) as Fiscal_Year,
		Convert(varchar(20),inv.InvoiceId) as Bill_No,
		pat.FirstName+' '+pat.LastName as Customer_name,	
		pat.PANNumber,		
	    CONVERT(VARCHAR(10), inv.CreateOn, 120) As BillDate,
		'ItemTransaction' as BillType, --here only for ird details need to handle into pharmacy table also
	    inv.SubTotal AS Amount,
        inv.DiscountAmount as DiscountAmount,
	   ((inv.SubTotal-inv.DiscountAmount)+inv.VATAmount) As Total_Amount,
	   (inv.VATAmount) as Tax_Amount ,
	   case when inv.VATAmount >0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As Taxable_Amount ,
	   case when inv.VATAmount <=0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As  NonTaxable_Amount  ,
	   CASE When inv.IsRemoteSynced=1 then 'Yes' else 'No' END AS SyncedWithIRD,
	   CASE WHEN inv.PrintCount > 0  THEN 'Yes' ELSE 'No' END AS Is_Printed,	
	   CASE WHEN inv.PrintCount >0 Then   convert(varchar(20),convert(time,inv.CreateOn),100) Else '' END AS Printed_Time,
       CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active,
	   emp.FirstName+' '+emp.LastName as Entered_By,				   
	   emp.FirstName+' '+emp.LastName  as Printed_by,
	   inv.PrintCount as Print_Count,
	   CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,				  
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active
  from PHRM_TXN_Invoice inv 
	 inner join	EMP_Employee emp on emp.EmployeeId=inv.CreatedBy
	 inner join    PAT_Patient pat on pat.PatientId=inv.PatientId
  WHERE (  
        CONVERT(DATE,inv.CreateOn) BETWEEN CONVERT(DATE,@FromDate) 
     AND CONVERT(DATE,@ToDate) 
     ) 
	  END
END

GO
--END: Nagesh/2018 Nov 22: Script for alter Ird report changed, function for return fiscal year name
----END: 23 Nov 2018--Reverse integration from R2V1/Features/IRD_Pharmacy branch to DEV branch---

----Start: Abhishek/2018 Nov 27: Pharmacy Counter wise Collection

/****** Object:  StoredProcedure [dbo].[SP_PHRM_CounterCollectionReport]    Script Date: 11/27/2018 2:51:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_PHRM_CounterCollectionReport] 
@FromDate datetime=null,
 @ToDate datetime=null
 AS
 /*
FileName: [SP_PHRM_CounterCollectionReport] '05/01/2018','08/08/2018'
CreatedBy/date: Nagesh/Vikas/2018-07-31
Description: .
Remarks:    
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-------------------------------------------------------
1      Nagesh/Vikas/2018-08-01	              created the script

--------------------------------------------------------
*/
-- BEGIN
--  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
--		BEGIN
			
--			select convert(date,inv.CreatedOn) as [Date], usr.UserName as UserName,cnt.CounterName as CounterName, 
--			sum(inv.TotalAmount)as TotalAmount, sum(inv.SubTotal*inv.DiscountPercentage / 100.0) as [DiscountAmount]
--			 from PHRM_TXN_InvoiceItems inv
--				join RBAC_User usr
--				on inv.CreatedBy=usr.EmployeeId
--				join PHRM_MST_Counter cnt on inv.CounterId=cnt.CounterId
--				where CONVERT(date,inv.CreatedOn) Between ISNULL(@FromDate,GETDATE()) AND ISNULL(@ToDate,GETDATE())+1
--			    group by  UserName,CounterName,convert(date,inv.CreatedOn)
--				order by [Date]
					
--		End
--End

BEGIN
  IF ((@FromDate IS NOT NULL) and (@ToDate IS NOT NULL)) 
    BEGIN
	select [Date], CounterName,UserName, sum(TotalAmount) as TotalAmount, sum(ReturnAmount) as ReturnedAmount, sum(TotalAmount-ReturnAmount) as NetAmount, 
	sum(DiscountAmount) as DiscountAmount
	from ( 
          SELECT convert(date,inv.CreateOn) as [Date], phrmCnt.CounterName,usr.UserName,sum(inv.TotalAmount)as TotalAmount, 0 as ReturnAmount,sum(inv.DiscountAmount)as DiscountAmount
            FROM [PHRM_TXN_Invoice] inv
              INNER JOIN RBAC_User usr
             on inv.CreatedBy=usr.EmployeeId  
			 left Join PHRM_TXN_InvoiceItems as item
			  on inv.InvoiceId= item.InvoiceId
			 INNER JOIN PHRM_MST_Counter phrmCnt
			 on item.CounterId = phrmCnt.CounterId    
              where  convert(datetime, inv.CreateOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1 
              group by convert(date,inv.CreateOn),UserName, CounterName
			  
			  union all
			 
			  select convert(date,invRet.CreatedOn) as [Date], phrmCnt.CounterName, usr.UserName, 0 as TotalAmount,sum(invRet.TotalAmount ) as ReturnAmount,  sum(-(invRet.DiscountPercentage/100)*invRet.SubTotal ) as DiscountPercentage
			  From[PHRM_TXN_InvoiceReturnItems] invRet
			  INNER JOIN RBAC_User usr
			  on invRet.CreatedBy = usr.EmployeeId
			  INNER JOIN PHRM_MST_Counter phrmCnt
			 on invRet.CounterId = phrmCnt.CounterId  
			  where convert(datetime, invRet.CreatedOn)   BETWEEN ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE())+1
			  group by convert(date,invRet.CreatedOn),UserName, CounterName
			  )	  tabletotal
			  Group BY [Date], UserName, CounterName
      End
End
Go

----End: Abhishek/2018 Nov 27: Pharmacy Counter wise Collection

---START: Ashim: 28Nov2018 ---- Changes of IpBilling Version 1.6.0---

---Start: Yubraj: 2018-11-19 --- Adding Column in Patient Admission Table----
Alter table ADT_PatientAdmission
	Add CancelledOn datetime null
	Go

Alter table ADT_PatientAdmission
	Add CancelledBy int null
	Go

	Alter table ADT_PatientAdmission
	Add CancelledRemark varchar(200) null
	Go
---END: Yubraj : 2018-11-19 --- Adding Column in Patient Admission Table----

---START: Ashim: 28Nov2018 ---- Changes of IpBilling Version 1.6.0---


--STart: Anish 28 Nov 2018 for default signatory for Histo/Cyto--
Insert into [dbo].[CORE_CFG_Parameters] (ParameterGroupName,ParameterName,ParameterValue,ValueDataType,Description)
values ('LAB','DefaultHistoCytoSignatoriesEmpId','{"empIdList":[93,108]}','JSON','Default employees for lab signatories in Histo/Cyto Report');
--End: Anish 28 Nov 2018--


----Start:Dinesh  29th Nov 2018 : Income Segregation and Usercollection SP changes -----------------


/****** Object:  UserDefinedFunction [dbo].[FN_BIL_GetTxnItemInfo_Income_Segregation]    Script Date: 11/29/2018 12:06:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


Create FUNCTION [dbo].[FN_BIL_GetTxnItemInfo_Income_Segregation]()
RETURNS TABLE
AS

/*
 FileName: [FN_BIL_GetTxnItemInfo_Income_Segregation]
 Description: This function returns distinct information of transactionitems along with its CreatedOn, CancelledOn, ReturnedOn, etc..
 Remarks: This Function is created for to fetch the paid, unpaid , cancel and return transactions 
 Created: 29Nov'17 <Dinesh>
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      29Nov'18 Dinesh         created         To be used as common function for almost all billing reports.
 -------------------------------------------------------------------------
*/
RETURN
(
  -- get distinct CreatedDate and other informations about all transactionsItems--
  -- when an item is Unpaid, it's transactionid will always be null--
	Select Convert(date, CreatedOn) 'BillingDate',NULL AS BillingTransactionId,'unpaid' AS BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	Price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks
	FROM BIL_TXN_BillingTransactionItems
	WHERE PaidDate is null or Convert(Date,PaidDate) != Convert(Date,CreatedOn)
	UNION
	 -- get distinct CreatedDate and other informations about only paid transactionsItems--
	Select Convert(date, PaidDate) 'BillingDate',BillingTransactionId,'paid' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,Remarks
	FROM BIL_TXN_BillingTransactionItems
	where BillStatus='Paid'
		UNION
   Select Convert(date,br.CreatedOn)'BillingDate',bi.BillingTransactionId,'return' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId,
	     SUM(IsNULL(Price,0)) Price,SUM(IsNULL(Quantity,0)) Quantity ,SUM(IsNULL(bi.SubTotal,0)) SubTotal  ,SUM(IsNULL(bi.DiscountAmount,0)) DiscountAmount ,
		SUM(IsNULL(Tax,0)) Tax ,SUM(IsNULL(bi.TotalAmount,0)) TotalAmount, 
		MAX(br.Remarks) 'Remarks'  -- find a way to concatenate remarks if possible. this might be incorrect when 1 item is returned multiple times 
  from BIL_TXN_BillingTransactionItems bi join BIL_TXN_InvoiceReturn br on bi.BillingTransactionId=br.BillingTransactionId
	  where ReturnStatus=1
   Group By Convert(date, br.CreatedOn),bi.BillingTransactionId, BillingTransactionItemId, ServiceDepartmentId, bi.PatientId, ItemId, ProviderId
		UNION
    -- get distinct CreatedDate and other informations of Cancelled transactionsItems--
	Select Convert(date, CancelledOn) 'CancelledDate',BillingTransactionId,'cancel' as BillStatus, BillingTransactionItemId, ServiceDepartmentId, PatientId, ItemId, ProviderId,
	price, Quantity, SubTotal,DiscountAmount,Tax,TotalAmount,CancelRemarks
	from BIL_TXN_BillingTransactionItems
	where CancelledOn is not null
)

GO


----------------------------------
/****** Object:  View [dbo].[VW_BIL_TxnItemsInfo_Income_Segregation]    Script Date: 11/29/2018 12:02:50 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VW_BIL_TxnItemsInfo_Income_Segregation]
  AS
/*
 FileName: VW_BIL_TxnItemsInfo_Income_Segregation
 Description: This view returns all transcationitems and their Paid/Unpaid/Cancelled/Returned Information grouped by date.
 Remarks: This view doesn't contain information of Counter, CreatedBy so cannot be used for Counter/User-Collections.
 Created: 29Nov'18 <Dinesh>
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.      29Nov'18 Dinesh     created         Created for Income Segregation Report 
 -------------------------------------------------------------------------
*/
  SELECT 
	txnItmInfo.BillingDate,
	txnItmInfo.BillingTransactionItemId,
	txnItmInfo.BillingTransactionId,
	txnItmInfo.BillStatus,
	txnitmInfo.ServiceDepartmentId,
	txnItmInfo.ItemId,
	txnItmInfo.PatientId,
	txnItmInfo.ProviderId,
    
	paid.Price 'PaidPrice',
	paid.Quantity 'PaidQuantity',
	paid.SubTotal 'PaidSubTotal',
	paid.DiscountAmount 'PaidDiscountAmount',
	paid.Tax 'PaidTax',
	paid.TotalAmount 'PaidTotalAmount',

	unpaid.Price 'UnpaidPrice',
	unpaid.Quantity 'UnpaidQuantity',
	unpaid.SubTotal 'UnpaidSubTotal',
	unpaid.DiscountAmount 'UnpaidDiscountAmount',
	unpaid.Tax 'UnpaidTax',
	unpaid.TotalAmount 'UnpaidTotalAmount',

	cancel.Price 'CancelPrice',
	cancel.Quantity 'CancelQuantity',
	cancel.SubTotal 'CancelSubTotal',
	cancel.DiscountAmount 'CancelDiscountAmount',
	cancel.Tax 'CancelTax',
	cancel.TotalAmount 'CancelTotalAmount',
	cancel.CreatedOn 'CreatedOn',
	
	--bilRet.Price 'ReturnPrrice',
	bilRet.Quantity 'ReturnQuantity',
	bilRet.SubTotal 'ReturnSubTotal',
	bilRet.DiscountAmount 'ReturnDiscountAmount',
	bilRet.Tax 'ReturnTax',
	bilRet.TotalAmount 'ReturnTotalAmount'

 from  FN_BIL_GetTxnItemInfo_Income_Segregation() txnItmInfo

LEFT JOIN
(
	SELECT Convert(date,txnItm.PaidDate) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, txnItm.BillStatus
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'paid'
) paid

ON txnItmInfo.BillingDate = paid.BillingDate
  and txnItmInfo.BillingTransactionItemId = paid.BillingTransactionItemId and txnItmInfo.BillStatus = paid.BillStatus

LEFT JOIN
(

	SELECT Convert(date,txnItm.CreatedOn) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, 'unpaid' AS BillStatus
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'unpaid' OR (BillStatus = 'paid' AND Convert(date,CreatedOn) != CONVERT(date, PaidDate))
	  OR (BillStatus = 'cancel' )
) unpaid
ON txnItmInfo.BillingDate = unpaid.BillingDate
  and txnItmInfo.BillingTransactionItemId = unpaid.BillingTransactionItemId and txnItmInfo.BillStatus = unpaid.BillStatus

LEFT JOIN
(

	SELECT Convert(date,txnItm.CancelledOn) 'BillingDate', txnItm.BillingTransactionItemId, txnItm.BillingTransactionId, txnItm.PatientId, txnItm.ProviderId, 
		txnItm.ServiceDepartmentId, txnItm.ItemId,txnItm.Price, txnItm.Quantity, txnItm.SubTotal,  txnItm.DiscountAmount, txnItm.Tax,
		txnItm.TotalAmount, txnItm.BillStatus,txnItm.CancelledOn,txnItm.CreatedOn
	FROM BIL_TXN_BillingTransactionItems txnItm 
	 WHERE  BillStatus = 'cancel'
) cancel
ON txnItmInfo.BillingDate = cancel.BillingDate
  and txnItmInfo.BillingTransactionItemId = cancel.BillingTransactionItemId and txnItmInfo.BillStatus = cancel.BillStatus

LEFT JOIN
(

	 SELECT CONVERT(date,br.CreatedOn) 'BillingDate',
	  BillingTransactionItemId, br.BillingTransactionId,SUM(ISNULL(br.Quantity,0)) Quantity, 
	   SUM(ISNULL(br.SubTotal,0)) SubTotal, SUM(ISNULL( br.DiscountAmount,0)) DiscountAmount, SUM(ISNULL(Tax,0)) Tax, SUM(ISNULL(br.TotalAmount,0)) TotalAmount,'return' as BillStatus
	  from BIL_TXN_BillingTransactionItems br where ReturnStatus=1
	  Group BY BillingTransactionItemId, br.BillingTransactionId, CONVERT(date,br.CreatedOn),br.CreatedBy,  br.CounterId
) bilRet
ON txnItmInfo.BillingDate = bilRet.BillingDate
  and txnItmInfo.BillingTransactionItemId = bilRet.BillingTransactionItemId and txnItmInfo.BillStatus = bilRet.BillStatus

GO
------------------------------------------------------------------------------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 11/29/2018 12:10:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
--	SP_Report_BIL_IncomeSegregation '2018-11-27','2018-11-27' 
@FromDate Date=null ,
@ToDate Date=null	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2017-07-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
-------------------------------------------------------------------------------
*/
BEGIN
  ----start of IncomeSeggCTE
  ;
  WITH IncomeSegCTE
  AS (SELECT
    vwTxnItm.BillingDate 'Date',
	BillingTransactionItemId,
    sd.ServiceDepartmentName,
    itms.ItemName,
    CASE
      WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' and ItemName like '%ECHO%' ) 
	then 'ECHO'
	when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY' 
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
      ELSE sd.ServiceDepartmentName
    END AS 'ServDeptName',
    ISNULL(vwTxnItm.PaidQuantity, 0) + ISNULL(vwTxnItm.UnpaidQuantity, 0) 'Quantity',
    ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
    ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
    ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
    ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
    ISNULL(vwTxnItm.UnpaidSubTotal, 0) 'UnpaidSubTotal',
    ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
    ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
    ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
    ISNULL(vwTxnItm.CancelSubTotal, 0) 'CancelSubTotal',
    ISNULL(vwTxnItm.CancelDiscountAmount, 0) 'CancelDiscount',
    ISNULL(vwTxnItm.CancelTax, 0) 'CancelHST',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) 'CancelTotalAmount',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) - ISNULL(vwTxnItm.CancelTax, 0) 'CancelAmount',
    ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
    ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
    ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnAmount'
  FROM BIL_MST_ServiceDepartment sd,
       BIL_CFG_BillItemPrice itms,
      VW_BIL_TxnItemsInfo_Income_Segregation vwTxnItm
  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
	AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
	AND vwTxnItm.ItemId = itms.ItemId
	AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
	
	AND BillingTransactionItemId NOT IN (
		SELECT
			BillingTransactionItemId
		FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
		GROUP BY BillingTransactionItemId
		HAVING COUNT(BillingTransactionItemId) > 2)

	AND BillingTransactionItemId NOT IN (
		SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2))
  -----end of IncomeSeggCTE
  -----start of CreditReturnedCTE
  ,
  IncomeSegCreditReturnedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount', 
		SUM(ReturnSubTotal) 'ReturnSubTotal', 
		SUM(ReturnHST) 'ReturnHST', 
		SUM(ReturnDiscount) 'ReturnDiscount', 
		SUM(ReturnTotalAmount) 'ReturnTotalAmount',
		SUM(ReturnAmount) 'ReturnAmount'
FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		 WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
		ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
		ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
		ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) > 2)
) CreRet
GROUP BY BillingTransactionItemId,
ServDeptName
  )
  ----end of CreditReturnedCTE
  ----start of CreditReceivedCTE
  ,
  IncomeSegCreditReceivedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount'
 FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY'
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2)
) creRec
GROUP BY BillingTransactionItemId, ServDeptName
)
  ----end of CreditReceivedCTE



  SELECT
    CONVERT(date, @FromDate) 'FromDate',
    CONVERT(date, @ToDate) 'ToDate',
    ServDeptName,
	SUM(Quantity) 'Quantity',
    SUM(PaidSubTotal) 'PaidSubTotal',
    --ROUND(SUM(PaidHST), 2) AS 'PaidHST',
    SUM(PaidDiscount) 'PaidDiscount',
    SUM(UnpaidSubTotal) 'UnpaidSubTotal',
    --ROUND(SUM(UnpaidHST), 2) AS 'UnpaidHST',
	SUM(UnpaidDiscount) 'UnpaidDiscount',
    SUM(ReturnAmount) 'ReturnAmount',
    --SUM(ReturnHST) 'ReturnHST',
    SUM(ReturnDiscount) 'ReturnDiscount',
    SUM(CancelAmount) 'CancelAmount',
    --SUM(CancelHST) 'CancelHST',
    SUM(CancelDiscount) 'CancelDiscount',
    SUM(PaidTotalAmount) + SUM(UnpaidTotalAmount) - SUM(ReturnTotalAmount) - SUM(CancelTotalAmount) 'NetSales',
    SUM(PaidSubTotal) + SUM(UnpaidSubTotal) - SUM(ReturnSubTotal) - SUM(CancelSubTotal) 'AccPrice',
	SUM(PaidDiscount) + SUM(UnpaidDiscount) - SUM(ReturnDiscount) - SUM(CancelDiscount) 'AccDiscount'
    --ROUND(SUM(PaidHST) + SUM(UnpaidHST) - SUM(ReturnHST) - SUM(CancelHST), 2) 'AccHST'

  FROM (
		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			SUM(CancelSubTotal) 'CancelSubTotal',
			SUM(CancelDiscount) 'CancelDiscount',
			SUM(CancelHST) 'CancelHST',
			SUM(CancelTotalAmount) 'CancelTotalAmount',
			SUM(CancelAmount) 'CancelAmount'
		FROM IncomeSegCTE
		GROUP BY ServDeptName
		

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReturnedCTE
		GROUP BY ServDeptName

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			0 'ReturnSubTotal',
			0 'ReturnDiscount',
			0 'ReturnHST',
			0 'ReturnTotalAmount',
			0 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReceivedCTE
		GROUP BY ServDeptName
) x1
group by ServDeptName
END

GO
-----------------------------------------------------------------------------------------

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_DailySales]    Script Date: 11/27/2018 10:52:43 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-10-09','2018-10-09',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.      sud/2018-11-16                      ReturnDeposit handled for Inpatient-Discharge case, 
                                            here DepositType comes as 'ReturnDeposit', and there's no settlementId or billingTransactionid. 
-----------------------------------------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)
  BEGIN
    SELECT
      *
    FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks,'') 'ReturnRemark'
		FROM ((SELECT
					Dates 'ReportDate'
				FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

    LEFT JOIN (
    --- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
    ---Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
    SELECT
      CONVERT(date, PaidDate) 'TxnDate',
      BillingTransactionId,
      InvoiceCode,
      InvoiceNo,
      PatientID,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_BillingTransaction
    WHERE CONVERT(date, PaidDate) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
AND BillStatus != 'unpaid' ---ramavtar:20-nov-18 filterring out unpaid (credit bills)
    UNION

    SELECT DISTINCT
      CONVERT(date, CreatedOn) AS TxnDate,
      BillingTransactionId,
      InvoiceCode,
      RefInvoiceNum,
      PatientId,
      CreatedBy,
      CounterId,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r
    WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
      ON dates.ReportDate = txnInfo.TxnDate
    ---Join with Patient and Employee Table to get their names etc---
    INNER JOIN PAT_Patient pat
      ON txnInfo.PatientId = pat.PatientId
    INNER JOIN EMP_Employee emp
      ON txnInfo.CreatedBy = emp.EmployeeId

    LEFT JOIN BIL_TXN_BillingTransaction txn
      ON dates.ReportDate = CONVERT(date, txn.PaidDate)
      AND txnInfo.BillingTransactionId = txn.BillingTransactionId
      AND txnInfo.CounterId = txn.CounterId
      AND txnInfo.CreatedBy = txn.CreatedBy

    LEFT OUTER JOIN (
    --- deposit deduct happens both from Transaction and settlement
    -- take only those from Transaction in this query..
    -- condition is: BillingTransaction Is NOT NULL--
    SELECT
      CONVERT(date, CreatedOn) AS DepositRetDate,
      Amount,
      BillingTransactionId,
      CounterId,
      CreatedBy
    FROM BIL_TXN_Deposit
    WHERE DepositType = 'depositdeduct'
    AND BillingTransactionId IS NOT NULL) depRet
      ON dates.ReportDate = depRet.DepositRetDate
      AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
      AND txnInfo.CounterId = depRet.CounterId
      AND txnInfo.CreatedBy = depRet.CreatedBy
    LEFT JOIN (

    ---Sud: 9May'18--our return table is now changed--
    ---get only returned bills---
    SELECT
      CONVERT(date, CreatedOn) AS bilReturnDate,
      BillingTransactionId,
      RefInvoiceNum,
      TotalAmount 'ReturnAmount',
      TaxTotal AS 'ReturnedTax',
      CounterId,
      CreatedBy,
	  Remarks
    FROM BIL_TXN_InvoiceReturn r) bilRet
      ON dates.ReportDate = bilret.bilReturnDate
      AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
      AND txnInfo.CounterId = bilRet.CounterId
      AND txnInfo.CreatedBy = bilRet.CreatedBy
    )
    WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
    AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

    UNION ALL

    SELECT
      CONVERT(date, deposits.DepositDate) 'DepositDate',
      deposits.ReceiptNo 'ReceiptNo',
      pat.PatientCode 'HospitalNo',
      pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
      0 'Price',
      0 'DiscountAmount',
      0 'ReturnedAmount',
      deposits.AdvanceReceived 'AdvanceReceived',
      deposits.AdvancedSettled 'AdvancedSettled',
      0 'Tax',
      deposits.TotalAmount 'TotalAmount',
      emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
      deposits.CounterId 'CounterId',
      0 'ReturnedTax',
	  '' 'ReturnRemark'
    FROM (SELECT
           CONVERT(date, CreatedOn) 'DepositDate',
           'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
           PatientId,
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             ELSE 0
           END AS 'AdvanceReceived',
           CASE
             WHEN DepositType = 'ReturnDeposit' THEN Amount
             ELSE 0
           END AS 'AdvancedSettled',
           CASE
             WHEN DepositType = 'Deposit' THEN Amount
             WHEN DepositType = 'ReturnDeposit' THEN -Amount
             ELSE 0
           END AS 'TotalAmount',
           CreatedBy 'CreatedBy',
           CounterId 'CounterId'
         FROM BIL_TXN_Deposit
         WHERE ReceiptNo IS NOT NULL
         AND (DepositType = 'DEPOSIT'
         OR DepositType = 'ReturnDeposit')

         UNION ALL
     
	    Select Convert(Date,CreatedOn) 'DepositDate',
			--we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			CASE WHEN SettlementId IS NOT NULL THEN  'SR'+Convert(varchar(20),SettlementId) 
			ELSE 'SR' END AS 'ReceiptNo', 

				   PatientId,
				   0 AS 'AdvanceReceived',
				   Amount AS 'AdvancedSettled',
				   -Amount AS 'TotalAmount',
				   CreatedBy  'CreatedBy',
				   CounterId 'CounterId'
			from BIL_TXN_Deposit
			----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			WHERE (( DepositType='depositdeduct'  AND  SettlementId IS NOT NULL ) OR DepositType='ReturnDeposit')
			and Convert(Date,CreatedOn)  BETWEEN  ISNULL(@FromDate,GETDATE())  AND ISNULL(@ToDate,GETDATE()) 

		 
		 ) deposits,


         EMP_Employee emp,
         PAT_Patient pat,
         BIL_CFG_Counter cntr
    WHERE deposits.PatientId = pat.PatientId
    AND emp.EmployeeId = deposits.CreatedBy
    AND deposits.CounterId = cntr.CounterId
    AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
    AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
    AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')
	) dum
    ORDER BY dum.ReceiptNo
  END
END
GO

----End:Dinesh 29th Nov 2018 : Income Segregation and Usercollection SP changes -----------------

--- START: Ramavtar: 29Nov'18 : DailYsales report changes  ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DailySales] --- [SP_Report_BIL_DailySales] '2018-11-29','2018-11-29',null,null
		@FromDate Datetime=null ,
		@ToDate DateTime=null,
		@CounterId varchar(max)=null,
		@CreatedBy varchar(max)=null
AS
/*
FileName: [sp_Report_BIL_DailySales]
CreatedBy/date: sud/2018-07-27
Description: to get the price, Tax, total,along with recipt number between given date input
Remarks:    
Change History
-----------------------------------------------------------------------------------------
S.No.    UpdatedBy/Date                        Remarks
-----------------------------------------------------------------------------------------
1.      sud/2018-07-26                      modified after HAMS Deployment (NEEDS REVISION)\
2.		ramavtar/2018-10-09					added return remark
3.		ramavtar/2018-11-29					calculating summary amounts
-----------------------------------------------------------------------------------------
*/
BEGIN
 IF (@FromDate IS NOT NULL)
  OR (@ToDate IS NOT NULL)
BEGIN
	SELECT
		*
	FROM (
		SELECT DISTINCT
			CONVERT(varchar(20), dates.ReportDate) AS [Date],
			txnInfo.InvoiceCode + CONVERT(varchar(20), txnInfo.InvoiceNo) 'ReceiptNo',
			pat.PatientCode AS HospitalNo,
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			ISNULL(txn.SubTotal, 0) AS 'Price',
			ISNULL(txn.DiscountAmount, 0) AS 'DiscountAmount',
			ISNULL(bilRet.ReturnAmount, 0) AS 'ReturnedAmount',
			0 AS 'AdvanceReceived',
			ISNULL(depRet.Amount, 0) AS 'AdvanceSettlement',
			ISNULL(txn.TaxTotal, 0) AS 'Tax',
			ISNULL(txn.TotalAmount, 0) - ISNULL(depRet.Amount, 0) - ISNULL(bilRet.ReturnAmount, 0) AS 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			txnInfo.CounterId AS 'CounterId',
			ISNULL(bilRet.ReturnedTax, 0) AS 'ReturnedTax',
			ISNULL(bilRet.Remarks, '') 'ReturnRemark'
		FROM ((
			SELECT
				Dates 'ReportDate'
			FROM [FN_COMMON_GetAllDatesBetweenRange](ISNULL(@FromDate, GETDATE()), ISNULL(@ToDate, GETDATE()))) dates

		LEFT JOIN (
--- These two tables works as an Anchor Table (LEFT Table) to join with other tables--
--- Need BillingTransactionId, CreatedBy, CounterID to be joined with all other Right side tables---
		SELECT
			CONVERT(date, PaidDate) 'TxnDate',
			BillingTransactionId,
			InvoiceCode,
			InvoiceNo,
			PatientID,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_BillingTransaction
		WHERE CONVERT(date, PaidDate) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND BillStatus != 'unpaid' ---ramavtar:20-nov-18 filterring out unpaid (credit bills)

		UNION

		SELECT DISTINCT
			CONVERT(date, CreatedOn) AS TxnDate,
			BillingTransactionId,
			InvoiceCode,
			RefInvoiceNum,
			PatientId,
			CreatedBy,
			CounterId,
			Remarks
		FROM BIL_TXN_InvoiceReturn r
		WHERE CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) txnInfo
			ON dates.ReportDate = txnInfo.TxnDate
--- Join with Patient and Employee Table to get their names etc---
		INNER JOIN PAT_Patient pat
			ON txnInfo.PatientId = pat.PatientId
		INNER JOIN EMP_Employee emp
			ON txnInfo.CreatedBy = emp.EmployeeId

		LEFT JOIN BIL_TXN_BillingTransaction txn
			ON dates.ReportDate = CONVERT(date, txn.PaidDate)
		AND txnInfo.BillingTransactionId = txn.BillingTransactionId
		AND txnInfo.CounterId = txn.CounterId
		AND txnInfo.CreatedBy = txn.CreatedBy

		LEFT OUTER JOIN (
--- deposit deduct happens both from Transaction and settlement
--- take only those from Transaction in this query..
--- condition is: BillingTransaction Is NOT NULL--
		SELECT
			CONVERT(date, CreatedOn) AS DepositRetDate,
			Amount,
			BillingTransactionId,
			CounterId,
			CreatedBy
		FROM BIL_TXN_Deposit
		WHERE DepositType = 'depositdeduct'
		AND BillingTransactionId IS NOT NULL) depRet
			ON dates.ReportDate = depRet.DepositRetDate
		AND txnInfo.BillingTransactionId = depRet.BillingTransactionId
		AND txnInfo.CounterId = depRet.CounterId
		AND txnInfo.CreatedBy = depRet.CreatedBy
		LEFT JOIN (

---Sud: 9May'18--our return table is now changed--
---get only returned bills---
		SELECT
			CONVERT(date, CreatedOn) AS bilReturnDate,
			BillingTransactionId,
			RefInvoiceNum,
			TotalAmount 'ReturnAmount',
			TaxTotal AS 'ReturnedTax',
			CounterId,
			CreatedBy,
			Remarks
		FROM BIL_TXN_InvoiceReturn r) bilRet
			ON dates.ReportDate = bilret.bilReturnDate
		AND txnInfo.BillingTransactionId = bilRet.BillingTransactionId
		AND txnInfo.CounterId = bilRet.CounterId
		AND txnInfo.CreatedBy = bilRet.CreatedBy
		)
		WHERE dates.ReportDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE()) + 1
		AND (txnInfo.CounterId LIKE '%' + ISNULL(@CounterId, txnInfo.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')

		UNION ALL

		SELECT
			CONVERT(date, deposits.DepositDate) 'DepositDate',
			deposits.ReceiptNo 'ReceiptNo',
			pat.PatientCode 'HospitalNo',
			pat.FirstName + ISNULL(' ' + pat.MiddleName, '') + ' ' + pat.LastName AS PatientName,
			0 'Price',
			0 'DiscountAmount',
			0 'ReturnedAmount',
			deposits.AdvanceReceived 'AdvanceReceived',
			deposits.AdvancedSettled 'AdvancedSettled',
			0 'Tax',
			deposits.TotalAmount 'TotalAmount',
			emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName AS CreatedBy,
			deposits.CounterId 'CounterId',
			0 'ReturnedTax',
			'' 'ReturnRemark'
		FROM (SELECT
				CONVERT(date, CreatedOn) 'DepositDate',
				'DR' + CONVERT(varchar(20), ReceiptNo) 'ReceiptNo',
				PatientId,
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  ELSE 0
				END AS 'AdvanceReceived',
				CASE
				  WHEN DepositType = 'ReturnDeposit' THEN Amount
				  ELSE 0
				END AS 'AdvancedSettled',
				CASE
				  WHEN DepositType = 'Deposit' THEN Amount
				  WHEN DepositType = 'ReturnDeposit' THEN -Amount
				  ELSE 0
				END AS 'TotalAmount',
				CreatedBy 'CreatedBy',
				CounterId 'CounterId'
			FROM BIL_TXN_Deposit
			WHERE ReceiptNo IS NOT NULL
			AND (DepositType = 'DEPOSIT'
			OR DepositType = 'ReturnDeposit')

		UNION ALL

		SELECT
			CONVERT(date, CreatedOn) 'DepositDate',
       --we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
			CASE
			WHEN SettlementId IS NOT NULL THEN 'SR' + CONVERT(varchar(20), SettlementId)
			ELSE 'SR'
			END AS 'ReceiptNo',
			PatientId,
			0 AS 'AdvanceReceived',
			Amount AS 'AdvancedSettled',
			-Amount AS 'TotalAmount',
			CreatedBy 'CreatedBy',
			CounterId 'CounterId'
		FROM BIL_TXN_Deposit
     ----we don't have settlement id for Inpatient-ReturnDeposit (automatic) case--sud:16Nov'18
		WHERE ((DepositType = 'depositdeduct'
		AND SettlementId IS NOT NULL)
		OR DepositType = 'ReturnDeposit')
		AND CONVERT(date, CreatedOn) BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())) deposits,


		EMP_Employee emp,
		PAT_Patient pat,
		BIL_CFG_Counter cntr
		WHERE deposits.PatientId = pat.PatientId
		AND emp.EmployeeId = deposits.CreatedBy
		AND deposits.CounterId = cntr.CounterId
		AND deposits.DepositDate BETWEEN ISNULL(@FromDate, GETDATE()) AND ISNULL(@ToDate, GETDATE())
		AND (deposits.CounterId LIKE '%' + ISNULL(@CounterId, deposits.CounterId) + '%')
		AND (emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName LIKE '%' + ISNULL(@CreatedBy, emp.FirstName + ISNULL(' ' + emp.MiddleName, '') + ' ' + emp.LastName) + '%')) dum
		ORDER BY dum.ReceiptNo

  ---getting addional summary amounts for report
		SELECT
			SUM(ISNULL(AdvanceReceived, 0)) 'AdvanceReceived',
			SUM(ISNULL(AdvanceSettled, 0)) 'AdvanceSettled',
			SUM(ISNULL(ProvisionalAmount,0)) 'Provisional',
			ISNULL((SELECT SUM(TotalAmount) FROM BIL_TXN_BillingTransaction
		WHERE BillStatus = 'unpaid'
		AND CONVERT(DATE,CreatedOn) BETWEEN @FromDate AND @ToDate),0) 'CreditAmount'
		FROM [FN_BIL_GetDepositNProvisionalBetnDateRange](@FromDate, @ToDate)
END
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
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorSummary]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.    UpdatedBy/Date					Remarks
----------------------------------------------------------
1		Sud/02Sept'18			     Initial Draft
2.		Ramavtar/12Nov'18			 sorting by doctorname
3	    Ramavtar/30Nov'18			 summary added 
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
	WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional'
    GROUP BY ISNULL(Providerid, 0),
             E.FirstName,
             E.MiddleName,
             E.LastName
	ORDER BY 2 

	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptSummary]	--SP_Report_BIL_DoctorDeptSummary '2018-07-01', '2018-11-22'
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
2	 Ramavtar/30Nov'18		 summary added 
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
		AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
    GROUP BY fnItems.ServiceDepartmentName,
             ISNULL(fnItems.ProviderId, 0),
             ISNULL(fnItems.ProviderName, 'NoDoctor')
			 order by 2

    ---Table:2 Get Provisional Amount in above Date Filter---
    SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE (ISNULL(@DoctorId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DoctorDeptItemsSummary] @FromDate datetime = NULL,
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
2	 Ramavtar/30Nov'18			summary added 
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
		AND BillStatus != 'cancelled' AND BillStatus != 'provisional'
	ORDER BY COALESCE(fnItems.ReturnDate, fnItems.CancelledDate, fnItems.PaidDate, fnItems.CreditDate, fnItems.ProvisionalDate) DESC

	---Table 2: returning provisional amount---
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
		AND ISNULL(ProviderId,0) = @DoctorId
END
GO
---END: Ramavtar:29Nov'18: DailYsales and doctorSummary report changes ---
---START: Ramavtar:30Nov'18	department/dept-item summary report changes ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentSummary] -- SP_Report_BIL_DepartmentSummary '2018-08-01','2018-09-11'
  @FromDate DATETIME = NULL,
  @ToDate DATETIME = NULL
AS
/*
Change History
----------------------------------------------------------
S.No.	UpdatedBy/Date			Remarks
----------------------------------------------------------
1		Ramavtar/11Sept'18      Initial Draft
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
----------------------------------------------------------
*/
BEGIN
	--table1: report data
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
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	GROUP BY fnItems.ServiceDepartmentName
	ORDER BY 1
	--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_DepartmentItemSummary]
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
2		Ramavtar/30Nov'18		added summary and filtered report data for provisional and cancel
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
		FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
		WHERE BillStatus != 'cancelled' AND BillStatus != 'provisional') fnItems
	JOIN PAT_Patient pat ON fnItems.PatientId = pat.PatientId
	WHERE fnItems.ServiceDepartmentName = @SrvDeptName
	ORDER BY 1 DESC
--table2: provisional, cancel, credit amounts for summary
	SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE ServiceDepartmentName = @SrvDeptName
END
GO
---END: Ramavtar:30Nov'18	department/dept-item summary report changes ---
---START: Ramavtar:30Nov'18	doctorwise income summary report ---
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
	@ToDate DATETIME = NULL,
	@ProviderId INT = NULL
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

SELECT
  ISNULL(OPD.ProviderName, IPD.ProviderName) 'DoctorName',
  ISNULL(OPD.SubTotal, 0) 'OP_Collection',
  ISNULL(OPD.Discount, 0) 'OP_Discount',
  ISNULL(OPD.Refund, 0) 'OP_Refund',
  ISNULL(OPD.NetTotal, 0) 'OP_NetTotal',
  ISNULL(IPD.SubTotal, 0) 'IP_Collection',
  ISNULL(IPD.Discount, 0) 'IP_Discount',
  ISNULL(IPD.Refund, 0) 'IP_Refund',
  ISNULL(IPD.NetTotal, 0) 'IP_NetTotal',
  ISNULL(OPD.NetTotal, 0) + ISNULL(IPD.NetTotal, 0) 'Grand_Total'
FROM (SELECT
		CASE
			WHEN ProviderId IS NOT NULL THEN ProviderName
			ELSE 'NoDoctor'
		END AS 'ProviderName',
		SUM(ISNULL(SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
		SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
		SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE BillingType = 'OutPatient' AND BillStatus != 'cancelled'
		AND (ISNULL(@ProviderId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
	GROUP BY ProviderId,ProviderName) OPD
FULL OUTER JOIN (
	SELECT
		CASE
			WHEN ProviderId IS NOT NULL THEN ProviderName
			ELSE 'NoDoctor'
		END AS 'ProviderName',
		SUM(ISNULL(SubTotal, 0)) 'SubTotal',
		SUM(ISNULL(DiscountAmount, 0)) AS 'Discount',
		SUM(ISNULL(ReturnAmount, 0)) AS 'Refund',
		SUM(ISNULL(TotalAmount, 0) - ISNULL(ReturnAmount, 0)) AS 'NetTotal'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE BillingType = 'Inpatient' AND BillStatus != 'cancelled'
		AND (ISNULL(@ProviderId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
	GROUP BY ProviderId,ProviderName) IPD
ON OPD.ProviderName = IPD.ProviderName
ORDER BY DoctorName

---- table2: summary
SELECT 
		SUM(CASE WHEN BillStatus='provisional' THEN ProvisionalAmount ELSE 0 END) 'ProvisionalAmount',
		SUM(CASE WHEN BillStatus='cancelled' THEN CancelledAmount ELSE 0 END) 'CancelledAmount',
		SUM(CASE WHEN BillStatus='credit' THEN CreditAmount ELSE 0 END) 'CreditAmount',
		(SELECT SUM(ISNULL(AdvanceReceived,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceReceived',
		(SELECT SUM(ISNULL(AdvanceSettled,0)) FROM FN_BIL_GetDepositNProvisionalBetnDateRange(@FromDate,@ToDate)) 'AdvanceSettled'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate, @ToDate)
	WHERE (ISNULL(@ProviderId, ISNULL(ProviderId, 0)) = ISNULL(ProviderId, 0))
END
GO
---END: Ramavtar:30Nov'18	doctorwise income summary report ---

---Start: Dinesh:2ndDec'18	Income segregation according to account terminologies changes (change request by Dilip sir)  ---

/****** Object:  StoredProcedure [dbo].[SP_Report_BIL_IncomeSegregation]    Script Date: 12/2/2018 6:19:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Alter PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
--	SP_Report_BIL_IncomeSegregation '2018-11-27','2018-11-27' 
@FromDate Date=null ,
@ToDate Date=null	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2017-07-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
-------------------------------------------------------------------------------
*/
BEGIN
  ----start of IncomeSeggCTE
  ;
  WITH IncomeSegCTE
  AS (SELECT
    vwTxnItm.BillingDate 'Date',
	BillingTransactionItemId,
    sd.ServiceDepartmentName,
    itms.ItemName,
    CASE
      WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' and ItemName like '%ECHO%' ) 
	then 'ECHO'
	when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY' 
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
      ELSE sd.ServiceDepartmentName
    END AS 'ServDeptName',
    ISNULL(vwTxnItm.PaidQuantity, 0) + ISNULL(vwTxnItm.UnpaidQuantity, 0) 'Quantity',
    ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
    ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
    ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
    ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
    ISNULL(vwTxnItm.UnpaidSubTotal, 0) 'UnpaidSubTotal',
    ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
    ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
    ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
    ISNULL(vwTxnItm.CancelSubTotal, 0) 'CancelSubTotal',
    ISNULL(vwTxnItm.CancelDiscountAmount, 0) 'CancelDiscount',
    ISNULL(vwTxnItm.CancelTax, 0) 'CancelHST',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) 'CancelTotalAmount',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) - ISNULL(vwTxnItm.CancelTax, 0) 'CancelAmount',
	ISNULL(vwTxnItm.ReturnQuantity, 0) 'ReturnQuantity',
    ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
    ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
    ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0)+ISNULL(vwTxnItm.ReturnDiscountAmount,0) 'ReturnAmount'
  FROM BIL_MST_ServiceDepartment sd,
       BIL_CFG_BillItemPrice itms,
      VW_BIL_TxnItemsInfo_Income_Segregation vwTxnItm
  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
	AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
	AND vwTxnItm.ItemId = itms.ItemId
	AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
	
	AND BillingTransactionItemId NOT IN (
		SELECT
			BillingTransactionItemId
		FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
		GROUP BY BillingTransactionItemId
		HAVING COUNT(BillingTransactionItemId) > 2)

	AND BillingTransactionItemId NOT IN (
		SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2))
  -----end of IncomeSeggCTE
  -----start of CreditReturnedCTE
  ,
  IncomeSegCreditReturnedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount', 
		SUM(ReturnQuantity) 'ReturnQuantity',
		SUM(ReturnSubTotal) 'ReturnSubTotal', 
		SUM(ReturnHST) 'ReturnHST', 
		SUM(ReturnDiscount) 'ReturnDiscount', 
		SUM(ReturnTotalAmount) 'ReturnTotalAmount',
		SUM(ReturnAmount)+ SUM(ReturnDiscount) 'ReturnAmount'
FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		 WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
		ISNULL(vwTxnItm.ReturnQuantity, 0) 'ReturnQuantity',
		ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
		ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
		ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0)+ISNULL(vwTxnItm.ReturnDiscountAmount,0) 'ReturnAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) > 2)
) CreRet
GROUP BY BillingTransactionItemId,
ServDeptName
  )
  ----end of CreditReturnedCTE
  ----start of CreditReceivedCTE
  ,
  IncomeSegCreditReceivedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount'
 FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY'
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2)
) creRec
GROUP BY BillingTransactionItemId, ServDeptName
)
  ----end of CreditReceivedCTE



  SELECT
    --CONVERT(date, @FromDate) 'FromDate',
    --CONVERT(date, @ToDate) 'ToDate',
    ServDeptName,
	SUM(Quantity)-SUM(ReturnQuantity) 'Unit',
    SUM(PaidSubTotal) 'CashSales',
    --ROUND(SUM(PaidHST), 2) AS 'PaidHST',
    SUM(PaidDiscount) 'CashDiscount',
    SUM(UnpaidSubTotal) 'CreditSales',
    --ROUND(SUM(UnpaidHST), 2) AS 'UnpaidHST',
	SUM(UnpaidDiscount) 'CreditDiscount',
	SUM(ReturnQuantity) 'ReturnQuantity',
    SUM(ReturnAmount) 'ReturnAmount',
    --SUM(ReturnHST) 'ReturnHST',
    SUM(ReturnDiscount) 'ReturnDiscount',
    --SUM(CancelAmount) 'CancelAmount',
    --SUM(CancelHST) 'CancelHST',
    --SUM(CancelDiscount) 'CancelDiscount',
	SUM(PaidSubTotal)+SUM(UnpaidSubTotal)-SUM(ReturnAmount) 'GrossSales',
	SUM(PaidDiscount)+ SUM(UnpaidDiscount)- SUM(ReturnDiscount) 'Discount',
    SUM(PaidTotalAmount) + SUM(UnpaidTotalAmount) - SUM(ReturnTotalAmount) - SUM(CancelTotalAmount) 'NetSales'
	
    --SUM(PaidSubTotal) + SUM(UnpaidSubTotal) - SUM(ReturnSubTotal) - SUM(CancelSubTotal) 'AccPrice',
	--SUM(PaidDiscount) + SUM(UnpaidDiscount) - SUM(ReturnDiscount) - SUM(CancelDiscount) 'AccDiscount'
    --ROUND(SUM(PaidHST) + SUM(UnpaidHST) - SUM(ReturnHST) - SUM(CancelHST), 2) 'AccHST'

  FROM (
		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnQuantity) 'ReturnQuantity',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			SUM(CancelSubTotal) 'CancelSubTotal',
			SUM(CancelDiscount) 'CancelDiscount',
			SUM(CancelHST) 'CancelHST',
			SUM(CancelTotalAmount) 'CancelTotalAmount',
			SUM(CancelAmount) 'CancelAmount'
		FROM IncomeSegCTE
		GROUP BY ServDeptName
		

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnQuantity) 'ReturnQuantity',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReturnedCTE
		GROUP BY ServDeptName

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			0 'ReturnQuantity',
			0 'ReturnSubTotal',
			0 'ReturnDiscount',
			0 'ReturnHST',
			0 'ReturnTotalAmount',
			0 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReceivedCTE
		GROUP BY ServDeptName
) x1
group by ServDeptName
END
GO


---END: Dinesh:2ndDec'18	Income segregation according to account terminologies changes (change request by Dilip sir)  ---

---START: Ramavtar:3rdDec'18	PatientCensus report -- revamp the SP as per new requirements ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2018-09-23','2018-09-23'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@ProviderId int = NULL
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
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
6.		ramavtar/03Dec'18		revamp of SP -> as per new requirement
----------------------------------------------------------
*/
BEGIN
	SELECT 
		ISNULL(ProviderName,'NoDoctor') AS 'Provider',
		ServiceDepartmentName,
		SUM(CASE
				WHEN (BillStatus = 'paid' OR BillStatus = 'credit') AND ProvisionalDate IS NULL
				THEN 1 ELSE 0
			END) AS 'C1',
		SUM(CASE 
				WHEN BillStatus = 'paid' AND ProvisionalDate IS NULL THEN PaidAmount 
				WHEN BillStatus = 'credit' AND ProvisionalDate IS NULL THEN CreditAmount
				ELSE 0
			END) AS 'A1',
		SUM(CASE
				WHEN BillStatus = 'provisional' THEN 1 ELSE 0
			END) AS 'C2',
		SUM(CASE WHEN BillStatus = 'provisional' THEN ProvisionalAmount ELSE 0 END) AS 'A2',
		SUM(CASE 
				WHEN (BillStatus = 'paid' OR BillStatus = 'credit') AND ProvisionalDate IS NOT NULL
				THEN 1 ELSE 0
			END) AS 'C3',
		SUM(CASE
				WHEN BillStatus = 'paid' AND ProvisionalDate IS NOT NULL THEN PaidAmount 
				WHEN BillStatus = 'credit' AND ProvisionalDate IS NOT NULL THEN CreditAmount
				ELSE 0
			END) AS 'A3',
		SUM(CASE
				WHEN BillStatus = 'paid' OR BillStatus = 'credit' THEN 1 ELSE 0 
			END) AS 'TC',
		SUM(CASE 
				WHEN BillStatus = 'paid' THEN PaidAmount
				WHEN BillStatus = 'credit' THEN CreditAmount
				ELSE 0
			END) AS 'TA'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate)
	WHERE ISNULL(@ProviderId,ISNULL(ProviderId,0)) = ISNULL(ProviderId,0)
	GROUP BY ProviderName,ServiceDepartmentName
	ORDER BY 1,2

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
---END: Ramavtar:3rdDec'18	PatientCensus report -- revamp the SP as per new requirements ---

---START Ajay:04-Dec-2018 SystemAdmin-SalesBook Report --changed InvoiceId to InvoicePrintId
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[SP_IRD_PHRM_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null	
AS
/*
FileName: [SP_IRD_PHRM_InvoiceDetails]
CreatedBy/date: Vikas/2018-10-24
Description: to get the Pharmacy Invoice Details as per IRD requirements 
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.			Vikas/2018-10-24					Created
 2.       22 Nov 2018 By NageshBB               Update for fiscal year, and other columns
 3.			Ajay/04 Dec 2018					Changed InvoiceId to InvoicePrintId
 
 ------------------------------------------------------------------------------
*/

BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
select 
        dbo.FN_COMMON_GetFormattedFiscalYearByDate(inv.CreateOn) as Fiscal_Year,
		Convert(varchar(20),inv.InvoicePrintId) as Bill_No,
		pat.FirstName+' '+pat.LastName as Customer_name,	
		pat.PANNumber,		
	    CONVERT(VARCHAR(10), inv.CreateOn, 120) As BillDate,
		'ItemTransaction' as BillType, --here only for ird details need to handle into pharmacy table also
	    inv.SubTotal AS Amount,
        inv.DiscountAmount as DiscountAmount,
	   ((inv.SubTotal-inv.DiscountAmount)+inv.VATAmount) As Total_Amount,
	   (inv.VATAmount) as Tax_Amount ,
	   case when inv.VATAmount >0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As Taxable_Amount ,
	   case when inv.VATAmount <=0 or inv.VATAmount is null then inv.SubTotal-inv.DiscountAmount else 0 end As  NonTaxable_Amount  ,
	   CASE When inv.IsRemoteSynced=1 then 'Yes' else 'No' END AS SyncedWithIRD,
	   CASE WHEN inv.PrintCount > 0  THEN 'Yes' ELSE 'No' END AS Is_Printed,	
	   CASE WHEN inv.PrintCount >0 Then   convert(varchar(20),convert(time,inv.CreateOn),100) Else '' END AS Printed_Time,
       CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active,
	   emp.FirstName+' '+emp.LastName as Entered_By,				   
	   emp.FirstName+' '+emp.LastName  as Printed_by,
	   inv.PrintCount as Print_Count,
	   CASE When ISNULL(inv.IsRealtime,0)=1 then 'Yes' ELSE 'No' END as Is_Realtime,				  
	   CASE WHEN ISNULL(inv.IsReturn,0)= 0  THEN 'True' ELSE 'False' END AS Is_Bill_Active
  from PHRM_TXN_Invoice inv 
	 inner join	EMP_Employee emp on emp.EmployeeId=inv.CreatedBy
	 inner join    PAT_Patient pat on pat.PatientId=inv.PatientId
  WHERE (  
        CONVERT(DATE,inv.CreateOn) BETWEEN CONVERT(DATE,@FromDate) 
     AND CONVERT(DATE,@ToDate) 
     ) 
	  END
END
GO
---END Ajay:04-Dec-2018 SystemAdmin-SalesBook Report --changed InvoiceId to InvoicePrintId
---START: Ramavtar: 04Dec'18 patient census report return/cancel scenarios handled ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2018-12-04','2018-12-04'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@ProviderId int = NULL
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
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
6.		ramavtar/03Dec'18		revamp of SP -> as per new requirement
----------------------------------------------------------
*/
BEGIN
	SELECT 
		tbl.Provider,
		tbl.ServiceDepartmentName,
		tbl.totC1,
		tbl.retC1,
		tbl.totA1,
		tbl.retA1,
		tbl.totC2,
		tbl.totA2,
		tbl.totC3,
		tbl.retC3,
		tbl.totA3,
		tbl.retA3,
		(tbl.totC1 - tbl.retC1) + (tbl.totC3 - tbl.retC3) AS 'totTC',
		(tbl.totA1 - tbl.retA1) + (tbl.totA3 - tbl.retA3) AS 'totTA' 
	FROM (
	SELECT 
		ISNULL(fn.ProviderName,'NoDoctor') AS 'Provider',
		fn.ServiceDepartmentName,
		SUM(CASE
				WHEN (fn.BillStatus = 'paid' OR fn.BillStatus = 'credit') AND vm.ProvisionalDate IS NULL THEN 1 
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL AND (fn.CreditDate IS NOT NULL OR fn.PaidDate IS NOT NULL) THEN 1 
				ELSE 0
			END) AS 'totC1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN 1 ELSE 0
			END) AS 'retC1',
		SUM(CASE 
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NULL THEN fn.PaidAmount 
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NULL THEN fn.CreditAmount
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL AND (fn.CreditDate IS NOT NULL OR fn.PaidDate IS NOT NULL)  THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA1',
		SUM(CASE
				WHEN fn.BillStatus = 'provisional' THEN 1
				ELSE 0
			END) AS 'totC2',
		SUM(CASE 
				WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount 
				ELSE 0 
			END) AS 'totA2',
		SUM(CASE 
				WHEN (fn.BillStatus = 'paid' OR fn.BillStatus = 'credit') AND vm.ProvisionalDate IS NOT NULL THEN 1 
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaidDate IS NOT NULL OR fn.CreditDate IS NOT NULL) THEN 1
				ELSE 0
			END) AS 'totC3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL
				THEN 1 ELSE 0 
			END) AS 'retC3',
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL THEN fn.PaidAmount 
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.CreditAmount
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaidDate IS NOT NULL OR fn.CreditDate IS NOT NULL) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA3'
		--,
		--SUM(CASE
		--		WHEN fn.BillStatus = 'paid' OR fn.BillStatus = 'credit' THEN 1 ELSE 0 
		--	END) AS 'totTC',
		--SUM(CASE 
		--		WHEN fn.BillStatus = 'paid' THEN fn.PaidAmount
		--		WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount
		--		ELSE 0
		--	END) AS 'totTA'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
	JOIN VW_BIL_TxnItemsInfoWithDateSeparation vm ON fn.BillingTransactionItemId = vm.BillingTransactionItemId
	WHERE ISNULL(@ProviderId,ISNULL(fn.ProviderId,0)) = ISNULL(fn.ProviderId,0)
	GROUP BY fn.ProviderName,fn.ServiceDepartmentName
	--ORDER BY 1,2
	) tbl
	order by tbl.Provider,tbl.ServiceDepartmentName

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
---END: Ramavtar: 04Dec'18 patient census report return/cancel scenarios handled ---

----START: NageshBB: 05 DEc 2018:Merged ACC_IncrementalOn03Sep+ and Inventory Incremental script file with  3.IncrementalScript30Sep+ (Reverse integration done by Dinesh sir on 25 Nov 2018)
-------START:Accounting Incremental Script Merge
--START: 08-Sep-2018: Nagesh/salakha : Changed accounting tables schema and changes in master data
Alter Table INV_TXN_WriteOffItems
Drop Column CreatedBy
Go
ALTER TABLE  INV_TXN_WriteOffItems
Add  CreatedBy int;
GO
------ Add IsTransferredToACC in INV_TXN_WriteOffItems
ALTER TABLE INV_TXN_WriteOffItems
ADD IsTransferredToACC bit;
GO
------ Add IsTransferredToACC in INV_TXN_ReturnToVendorItems
ALTER TABLE INV_TXN_ReturnToVendorItems
ADD IsTransferredToACC bit;
GO
------ Add VAT in INV_TXN_ReturnToVendorItems

ALTER TABLE INV_TXN_ReturnToVendorItems
ADD VAT decimal(16, 4);
GO

--IsTransferredToACC column removed from INV_TXN_GoodsReceipt
ALTER TABLE INV_TXN_GoodsReceipt
DROP COLUMN IsTransferredToACC 
go

-- Adding Column to INV_TXN_GoodsReceiptItems
ALTER TABLE INV_TXN_GoodsReceiptItems
ADD IsTransferredToACC bit;
go

-- Adding Column to PHRM_TXN_InvoiceItems
alter table [dbo].[PHRM_TXN_InvoiceItems]
add IsTransferredToACC bit
go
-- Adding Column to PHRM_GoodsReceipt
alter table [PHRM_GoodsReceipt]
add IsTransferredToACC bit
go
alter table [PHRM_GoodsReceiptItems]
add IsTransferredToACC bit
go
-- Adding Column to PHRM_ReturnToSupplierItems
 alter table [dbo].[PHRM_ReturnToSupplierItems]
add IsTransferredToACC bit
Go
-- Adding Column to PHRM_WriteOffItems
alter table [PHRM_WriteOffItems]
add IsTransferredToACC bit
  go 
ALTER TABLE [dbo].[ACC_TransactionItems] DROP  CONSTRAINT If Exists [FK_ACC_TransactionItems_ACC_Ledger]
GO

Drop Table If Exists ACC_MST_MappingDetail
Go
Drop Table If Exists ACC_MST_GroupMapping
Go
Drop table If exists ACC_Ledger 
Go
Drop Table If exists ACC_MST_LedgerGroup
Go
Drop Table If Exists ACC_MST_CostCentricItems
Go
-----Creating table ACC_MST_GroupMappingl

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
-----Creating table ACC_MappingDetail

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_MappingDetail](
	[AccountingMappingDetailId] [int] IDENTITY(1,1) NOT NULL,
	[GroupMappingId] [int] NULL,
	[LedgerGroupId] [int] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_MappingDetail] PRIMARY KEY CLUSTERED 
(
	[AccountingMappingDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-----Creating table LedgerGroup
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_MST_LedgerGroup](
	[LedgerGroupId] [int] IDENTITY(1,1) NOT NULL,
	[PrimaryGroup] [varchar](100) NULL,
	[COA] [varchar](100) NULL,
	[LedgerGroupName] [varchar](100) NULL,
	[Description] [varchar](200) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_ACC_MST_LedgerGroup] PRIMARY KEY CLUSTERED 
(
	[LedgerGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
-----Drop and create table Acc_Ledger

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ACC_Ledger](
	[LedgerId] [int] IDENTITY(1,1) NOT NULL,
	[LedgerGroupId] [int] NULL,
	[LedgerName] [varchar](100) NULL,
	[Description] [varchar](500) NULL,
	[SectionId] [int] NULL,
	[LedgerReferenceId] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_Ledger] PRIMARY KEY CLUSTERED 
(
	[LedgerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO

ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_LedgerGroup] FOREIGN KEY([LedgerGroupId])
REFERENCES [dbo].[ACC_MST_LedgerGroup] ([LedgerGroupId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_LedgerGroup]
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping] FOREIGN KEY([GroupMappingId])
REFERENCES [dbo].[ACC_MST_GroupMapping] ([GroupMappingId])
GO
ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
GO

--Data Insertion
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Assets', N'Current Assets', N'Inventory', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Assets', N'Current Assets', N'Cash', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Liabilities', N'Current Liabilities', N'Duties and Taxes', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Assets', N'Current Assets', N'Bank', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Revenue', N'Direct Income', N'Sales', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Assets', N'Investments', N'Short Term Investments', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES (N'Assets', N'Current Assets', N'Marketable Securities', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Assets', N'Current Assets', N'Sundry Debtors', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Assets', N'Current Assets', N'Prepaids', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Assets', N'Current Assets', N'Short Term Advance', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Assets', N'Non Current Assets', N'Fixed Assets', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Assets', N'Non Current Assets', N'Advance Long Term', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Assets', N'Investments', N'Long Term Investments', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Assets', N'Other Assets', N'Other Assets', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Current Liabilities', N'Sundry Creditors', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Current Liabilities', N'Accured Liabilities', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Current Liabilities', N'Bank OD', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Current Liabilities', N'Provisions', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Current Liabilities', N'Patient Deposits (Liability)', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Liabilities', N'Current Liabilities', N'Unearned Revenue', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Liabilities', N'Capital and Equity', N'Reserves and Surplus', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Liabilities', N'Capital and Equity', N'Retained Earnings', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Capital and Equity', N'Stockholder''s Equity', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Capital and Equity', N'Profit and Loss Account', NULL, 1, GETDATE(), 0)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Expenses', N'Direct Expense', N'Cost of Goods Sold', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Revenue', N'Indirect Incomes', N'Other Income', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( N'Expenses', N'Indirect Expenses', N'Administration Expenses', NULL, 1, GETDATE(), 1)
GO
INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive]) 
VALUES ( N'Liabilities', N'Long Term Liabilities', N'LOAN from Banks', NULL, 1, GETDATE(), 1)
GO




---START:==============Inserting Mapping Rule=================== 
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('BillingToACCTransferRule', 2)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section])
 VALUES ('INVToACCTransferRule', 1)
 GO
 
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section])
 VALUES ('BillingToACCCreditTransfer',2)
 GO
 
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('BillingToACCCreditReturn', 2)
GO
 
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('BillingToACCBilPaidReturn', 2)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('BillingToACCBilUnpaidReturn', 2)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('INVCreditTransferRule', 1)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section])
 VALUES ('INVGoodReceiptCreditReturn', 1)
 GO
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section])
 VALUES ('INVReturnToVendor', 1)
 GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('INVDispatchToDept', 1)
GO
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('INVWriteOff', 1)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMInvoiceOnPaid', 3)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section])
 VALUES ('PHRMGoodReceiptOnPaid', 3)
 GO
 
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section])
 VALUES ('PHRMReturnToSupplier', 3)
 GO
 
 INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMWriteOff', 3)
GO
 
INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMGoodReceiptOnCredit', 3)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMGoodReceiptCreditReturn', 3)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMInvoiceOnCredit', 3)
GO

INSERT [dbo].[ACC_MST_GroupMapping] ( [Description], [Section]) 
VALUES ('PHRMInvoiceCreditReturn', 3)
GO
---END:==============Inserting Mapping Rule=================== 

---START:============Inserting Maping Rule Details===========
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where LedgerGroupName='sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='cash' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCTransferRule'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'),
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Inventory' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='INVToACCTransferRule'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'),
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --


INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditTransfer'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCCreditReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilPaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (  (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillingToACCBilUnpaidReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVCreditTransferRule'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVCreditTransferRule'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVCreditTransferRule'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 1) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVGoodReceiptCreditReturn'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash'), 0) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVGoodReceiptCreditReturn'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVGoodReceiptCreditReturn'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVReturnToVendor'), 
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 1) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVReturnToVendor'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVReturnToVendor'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] 
( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVDispatchToDept'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Expenses' and COA = 'Direct Expense' and LedgerGroupName = 'Cost of Goods Sold'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVDispatchToDept'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVWriteOff'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Expenses' and COA = 'Direct Expense' and LedgerGroupName = 'Cost of Goods Sold'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'INVWriteOff'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnPaid'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Revenue' and COA = 'Direct Income' and LedgerGroupName = 'Sales'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnPaid'), 
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnPaid'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnPaid'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnPaid'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES (( select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnPaid'), 
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 1) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMReturnToSupplier'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 1) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMReturnToSupplier'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMReturnToSupplier'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMWriteOff'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Expenses' and COA = 'Direct Expense' and LedgerGroupName = 'Cost of Goods Sold'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMWriteOff'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnCredit'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 0) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnCredit'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Inventory'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptOnCredit'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptCreditReturn'), 
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Cash'), 0) 
 GO
  --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptCreditReturn'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])

VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMGoodReceiptCreditReturn'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Sundry Creditors'), 1) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnCredit'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'), 1) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnCredit'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Revenue' and COA = 'Direct Income' and LedgerGroupName = 'Sales'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceOnCredit'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 0) 
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr])
 VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceCreditReturn'), 
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Assets' and COA = 'Current Assets' and LedgerGroupName = 'Sundry Debtors'), 0) 
 GO --
 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceCreditReturn'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Liabilities' and COA = 'Current Liabilities' and LedgerGroupName = 'Duties and Taxes'), 1)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ([GroupMappingId], [LedgerGroupId], [DrCr])

VALUES ((  select GroupMappingId from ACC_MST_GroupMapping where Description = 'PHRMInvoiceCreditReturn'), 
(select [LedgerGroupId] from [ACC_MST_LedgerGroup] where PrimaryGroup = 'Revenue' and COA = 'Direct Income' and LedgerGroupName = 'Sales'), 1) 
GO --
---END:============Inserting Maping Rule Details===========
--END: 08-Sep-2018: Nagesh/salakha : Changed accounting tables schema and changes in master data


-- START: 12-Sep-2018: Mahesh : Added additional columns in vendor and item tables --

ALTER TABLE INV_MST_Vendor
  ADD VendorCode VARCHAR(50), ContactPerson VARCHAR(50),
  Tds INT, GovtRegDate DATE Null, PanNo VARCHAR(50);
  go
  
ALTER TABLE INV_MST_Item
	ADD Code VARCHAR(50);
	go

UPDATE INV_MST_Vendor set Tds = 0;
go

-- END: 12-Sep-2018: Mahesh : Added additional columns in vendor and item tables --




-- START: 14-Sep-2018: Mahesh : Added company table --
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[INV_MST_Company](
	[CompanyId] [int] IDENTITY(1,1) NOT NULL,
	[CompanyName] [varchar](200) NOT NULL,
	[ContactNo] [nvarchar](20) NULL,
	[Description] [varchar](200) NULL,
	[ContactAddress] [nvarchar](200) NULL,
	[Email] [nvarchar](50) NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[IsActive] [bit] NULL,
	[Code] [nvarchar](50) NULL,
 CONSTRAINT [PK_INV_MST_Company] PRIMARY KEY CLUSTERED 
(
	[CompanyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[INV_MST_Company]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_Company_CreatedBy_EMP_Employee_EmployeeId] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[INV_MST_Company] CHECK CONSTRAINT [FK_INV_MST_Company_CreatedBy_EMP_Employee_EmployeeId]
GO
-- END: 14-Sep-2018: Mahesh : Added company table --


--START: 19/09/2018: salakha : Added ledgers in ACC_Ledger

------------------------------------Hardcoded ledgers--------------------------------
INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
  where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Inventory'), 'Inventory Pharmacy', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Cash'), 'Cash In Hand', NULL, NULL, NULL, getdate(), 1, 1)
  go

INSERT [dbo].[ACC_Ledger] ([LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Liabilities' and [COA]='Current Liabilities' and 
  [LedgerGroupName]='Duties and Taxes'), 'VAT', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId], 
[LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId] FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Inventory'), 'Inventory Hospital', NULL, NULL, NULL, getdate(), 1, 1)
  go

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
  [LedgerGroupName]='Sales'), 'Sales Inventory', NULL, NULL, NULL, getdate(), 1, 1)
  go

INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
  [LedgerGroupName]='Sales'), 'Sales Pharmacy', NULL, NULL, NULL, getdate(), 1, 1)
  go

INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Expenses' and [COA]='Direct Expense' and [LedgerGroupName]='Cost of Goods Sold'
), 'Cost of Goods Sold', NULL, NULL, NULL, getdate(), 1, 1)
go


INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
  [LedgerGroupName]='Sales'), 'Sales Return', NULL, NULL, NULL, getdate(), 1, 1)
  go

INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId], 
[LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup]
 where [PrimaryGroup]='Expenses' and [COA]='Direct Expense' and [LedgerGroupName]='Cost of Goods Sold'),
  'Purchase Return', NULL, NULL, NULL, getdate(), 1, 1)
  go
  

 --------------vendornames as an inventory Ledgers from INV_MST_Vendor
   Insert into ACC_Ledger (LedgerGroupId, LedgerName,[Description],SectionId,LedgerReferenceId,CreatedOn,
  CreatedBy,IsActive)
select 
 (SELECT  [LedgerGroupId] FROM [ACC_MST_LedgerGroup] where PrimaryGroup= 'Liabilities' 
 and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors') as LedgerGroupId, vd.VendorName, 
 'VendorName as inventory Ledger from INV_MST_Vendor' as [Description], 1 as SectionId, vd.VendorId ,GETDATE(),
 1,1 as IsActive from INV_MST_Vendor vd order by vd.VendorId
 go
 -----------------------------------------------------------------------
 
   -------------Billing ledgers from Service department table----------
  Insert into ACC_Ledger (LedgerGroupId, LedgerName,[Description],SectionId,LedgerReferenceId,CreatedOn,CreatedBy,IsActive)
select 
(select LedgerGroupId from ACC_MST_LedgerGroup 
where PrimaryGroup='Revenue' and COA='Direct Income' and LedgerGroupName='Sales') as LedgerGroupId,
 sd.ServiceDepartmentName,'ServiceDeptName as Billing income Ledger from Bil_MST_ServiceDepartment table for Hams ' as [Description],
 2 as SectionId, sd.ServiceDepartmentId as LedgerReferenceId,GETDATE() as CreatedOn,
 1 as CreatedBy, 1 as IsActive 
 from BIL_MST_ServiceDepartment sd order by sd.ServiceDepartmentId
 go
 ----------------------------------------------------------------------
 
 
 ----------------SupplierName as a pharmacy ledgers from PHRM_MST_Supplier
   Insert into ACC_Ledger (LedgerGroupId, LedgerName,[Description],SectionId,LedgerReferenceId,CreatedOn,
  CreatedBy,IsActive)
select 
 (SELECT  [LedgerGroupId] FROM [ACC_MST_LedgerGroup] where PrimaryGroup= 'Liabilities' 
 and COA='Current Liabilities' and LedgerGroupName='Sundry Creditors') as LedgerGroupId, sd.SupplierName, 
 'SupplierName as Pharmacy Ledger from PHRM_MST_Supplier' as [Description], 3 as SectionId, sd.SupplierId,
 GETDATE(),
 1,1 as IsActive from PHRM_MST_Supplier sd order by sd.SupplierId
 go
 ---------------------------------------------------------------------
 -- ---------------------------End :  19/09/2018: Added ledgers in ACC_Ledger----------------------

 --START: 28/09/2018: salakha : Added billing ledger in ACC_Ledger

 INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId], 
[LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (    SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup]
 where [PrimaryGroup]='Assets' and [COA]='Current Assets' and [LedgerGroupName]='Sundry Debtors'),
  'Receivables', NULL, NULL, NULL, getdate(), 1, 1)
  go

   -- ---------------------------End :  28/09/2018: Added ledger in ACC_Ledger----------------------

 --- Start Mahesh: 25/9/2018 ALter Good Receipt Items ------------------
 alter table INV_TXN_GoodsReceiptItems add SubTotal decimal(10,2);
 go
 alter table INV_TXN_GoodsReceiptItems add MRP decimal(10,2);
 go
 alter table INV_TXN_GoodsReceiptItems add DiscountPercent float;
 go
 alter table INV_TXN_GoodsReceiptItems add CcCharge decimal(10,2);
 go
 alter table INV_TXN_GoodsReceiptItems add CounterId int;
 go
 -- start alter Good Receipt Table --
 alter table INV_TXN_GoodsReceipt add SubTotal decimal(10,2);
 go
 alter table INV_TXN_GoodsReceipt add VATTotal decimal(10,2);
 go
 alter table INV_TXN_GoodsReceipt add CcCharge float;
 go
 alter table INV_TXN_GoodsReceipt add Discount float;
 go
 alter table INV_TXN_GoodsReceipt add DiscountAmount decimal(10,2);
 go
 -- end alter Good Receipt Table -- 
 
 --- End Mahesh: 25/9/2018 ALter Good Receipt Items ------------------


  --- Start Mahesh: 27/9/2018 ALter Good Receipt Items ------------------

 alter table INV_TXN_GoodsReceiptItems add DiscountAmount decimal (10,2);
 alter table INV_TXN_GoodsReceiptItems add  VAT float;
 alter table INV_TXN_GoodsReceiptItems add  CcAmount decimal(10,2);
 ALTER TABLE INV_TXN_GoodsReceipt ALTER COLUMN CcCharge decimal (10,2);
 alter table INV_TXN_GoodsReceipt add PrintCount int;
  --- End Mahesh: 27/9/2018 ALter Good Receipt Items ------------------

  --- Start Mahesh: 1/10/2018 ALter Good Receipt ------------------

  alter table INV_TXN_GoodsReceipt add BillNo varchar(50);
  Go
  alter table INV_TXN_GoodsReceipt add ReceiptNo varchar(50);
  Go
  alter table INV_TXN_GoodsReceipt add ReceivedDate date;
  Go
  alter table INV_TXN_GoodsReceipt add OrderDate varchar(50);
  Go
   ALTER TABLE INV_TXN_GoodsReceipt ALTER COLUMN PurchaseOrderId int Null;
   Go
  --- End Mahesh: 1/10/2018 ALter Good Receipt  ------------------

    --- Start Salakha Gawas: 5/10/2018 Add Route of ledgerlist--------
  INSERT INTO [RBAC_Permission]([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive]) 
	VALUES
     ('accounting-settings-ledger-group-list-view',
	 (SELECT [ApplicationId] FROM [RBAC_Application] 
	 where [ApplicationName]='Accounting'),1,GETDATE(),1)
GO
INSERT INTO [RBAC_RouteConfig]([DisplayName],[UrlFullPath],[RouterLink] ,
     [PermissionId],[ParentRouteId] ,[DefaultShow],[DisplaySeq],[IsActive])
     VALUES
    ('Ledger Groups','Accounting/Settings/LedgerGroupList','LedgerGroupList',
	(SELECT  [PermissionId] FROM [RBAC_Permission] 
	where PermissionName = 'accounting-settings-ledger-group-list-view'),
	(SELECT  [RouteId] FROM [RBAC_RouteConfig] 
	where UrlFullPath='Accounting/Settings'),1,2,1)
GO
  --- End Salakha: 5/10/2018 Add Route of ledgerlist--------
  --START: NageshBB: 09 Sep 2018 Add column for cost center application in ledger and mapping for accTxnItem and cost center item 
--check and add cost center applicable or not flag in ledger table
If Exists(select 1 from sys.columns where name ='IsCostCenterApplicable' and Object_Id=Object_ID('ACC_Ledger'))
    print 'column exist'
else
	Alter Table ACC_Ledger
	Add IsCostCenterApplicable bit null
Go

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ACC_Map_TxnItemCostCenterItem](
	[TxnItemCostCenterItemId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionItemId] [int] NULL,
	[CostCenterItemId] [int] NULL,
	[Amount] [float] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
 CONSTRAINT [PK_ACC_Map_TxnItemCostCenterItem] PRIMARY KEY CLUSTERED 
(
	[TxnItemCostCenterItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

  --START: NageshBB: 09 Sep 2018 Add column for cost center application in ledger and mapping for accTxnItem and cost center item 
  
  --START: Ajay/Salakha: 15 Oct 2018 Added voucher head(add new voucher head and edit voucher head)
  -----Creating Voucher Head table in database

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE ACC_MST_VoucherHead(
  VoucherHeadId [int] IDENTITY(1,1) NOT NULL,
  VoucherHeadName [varchar](100) not null unique,
  [Description] [varchar](500) NULL,
  [CreatedOn] [datetime] not NULL,
  [CreatedBy] [int]not NULL,
  [ModifiedOn] [datetime] NULL,
  [ModifiedBy] [int] NULL,
  [IsActive] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_VoucherHead] PRIMARY KEY CLUSTERED 
(
  [VoucherHeadId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


--------- routing of voucher head

INSERT INTO [RBAC_Permission]([PermissionName],[ApplicationId],[CreatedBy],[CreatedOn] ,[IsActive]) 
  VALUES
     ('accounting-settings-voucher-head-list-view',
   (SELECT [ApplicationId] FROM [RBAC_Application] 
   where [ApplicationName]='Accounting'),1,GETDATE(),1)
GO
INSERT INTO [RBAC_RouteConfig]([DisplayName],[UrlFullPath],[RouterLink] ,
     [PermissionId],[ParentRouteId] ,[DefaultShow],[DisplaySeq],[IsActive])
     VALUES
    ('Voucher Head','Accounting/Settings/VoucherHeadList','VoucherHeadList',
  (SELECT  [PermissionId] FROM [RBAC_Permission] 
  where PermissionName = 'accounting-settings-voucher-head-list-view'),
  (SELECT  [RouteId] FROM [RBAC_RouteConfig] 
  where UrlFullPath='Accounting/Settings'),1,3,1)
GO


----------Adding Voucherheadid into ACC_Transactions

ALTER TABLE [ACC_Transactions]
add VoucherHeadId int;
go

------ Insert Voucherheads into ACC_MST_VoucherHead

INSERT INTO [dbo].[ACC_MST_VoucherHead]  ([VoucherHeadName]  ,[CreatedOn]  ,[CreatedBy],[IsActive])
     VALUES  
   ('Nursing College'  ,GETDATE()  ,1  ,1),
     ('Hospital'  ,GETDATE()  ,1  ,1),
     ('Pharmacy'  ,GETDATE()  ,1  ,1)
GO
  --END: Ajay/Salakha: 15 Oct 2018 Added voucher head(add new voucher head and edit voucher head)

  
  ---Ajay: 16 Oct 2018 Wrongly added in 3. Incremental Scripts 30Sept+ 
  --removed from 3. Incremental Scripts 30Sept+ and adedd in ACC_incremental
    --- Start Salakha Gawas: 12/10/2018 Add Column in Ledger table --------
ALTER TABLE [ACC_Ledger]
ADD OpeningBalance float;
go

    --- End:  Salakha Gawas: 12/10/2018 Add Column in Ledger table --------

---START: Ajay:19 Oct 2018 -Added Opening balance type in create/update ledger and Update Ledger Group Functionalty
--Added Opening balance type in create/update ledger
ALTER TABLE [ACC_Ledger]
ADD DrCr bit;
GO
-- Added Update Ledger Group Functionalty
ALTER TABLE [ACC_MST_LedgerGroup]
ADD ModifiedOn datetime;
GO

ALTER TABLE [ACC_MST_LedgerGroup]
ADD ModifiedBy int;
GO
---End: Ajay:19 Oct 2018 -Added Opening balance type in create/update ledger and Update Ledger Group Functionalty

--- Start Salakha Gawas: 12/10/2018 Added Column in ACC_Transactions for Back Date entry--------

ALTER TABLE ACC_Transactions
ADD IsBackDateEntry bit;
GO
--- End Salakha Gawas: 12/10/2018 Added Column in ACC_Transactions --------


--- Start Salakha Gawas: 23/10/2018 Added Billing Rules, Mapping, And Ledgers in tables-------


--------------------Drop table ACC_MST_MappingDetail

ALTER TABLE [dbo].[ACC_MST_MappingDetail] DROP CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_LedgerGroup]
GO

ALTER TABLE [dbo].[ACC_MST_MappingDetail] DROP CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
GO

DROP TABLE [dbo].[ACC_MST_MappingDetail]
GO

---------------------truncate table ACC_MST_GroupMapping
truncate table ACC_MST_GroupMapping

-------------------Create table ACC_MST_MappingDetail

CREATE TABLE [dbo].[ACC_MST_MappingDetail](
	[AccountingMappingDetailId] [int] IDENTITY(1,1) NOT NULL,
	[GroupMappingId] [int] NULL,
	[LedgerGroupId] [int] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_MST_MappingDetail] PRIMARY KEY CLUSTERED 
(
	[AccountingMappingDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping] FOREIGN KEY([GroupMappingId])
REFERENCES [dbo].[ACC_MST_GroupMapping] ([GroupMappingId])
GO

ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_GroupMapping]
GO

ALTER TABLE [dbo].[ACC_MST_MappingDetail]  WITH CHECK ADD  CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_LedgerGroup] FOREIGN KEY([LedgerGroupId])
REFERENCES [dbo].[ACC_MST_LedgerGroup] ([LedgerGroupId])
GO

ALTER TABLE [dbo].[ACC_MST_MappingDetail] CHECK CONSTRAINT [FK_ACC_MST_MappingDetail_ACC_MST_LedgerGroup]
GO

-----------Droping Constraint 
ALTER TABLE [dbo].[ACC_TransactionItems] DROP CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
GO

-----------Drop Table Acc_Ledger
DROP TABLE [dbo].[ACC_Ledger]
GO

-----------Create Table ACC_Ledger

CREATE TABLE [dbo].[ACC_Ledger](
	[LedgerId] [int] IDENTITY(1,1) NOT NULL,
	[LedgerGroupId] [int] NULL,
	[LedgerName] [varchar](100) NULL,
	[Description] [varchar](500) NULL,
	[SectionId] [int] NULL,
	[LedgerReferenceId] [int] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[IsActive] [bit] NULL,
	[IsCostCenterApplicable] [bit] NULL,
	[OpeningBalance] [float] NULL,
	[DrCr] [bit] NULL,
 CONSTRAINT [PK_ACC_Ledger] PRIMARY KEY CLUSTERED 
(
	[LedgerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

---------Creating Constraint
ALTER TABLE [dbo].[ACC_TransactionItems]  WITH CHECK ADD  CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO

ALTER TABLE [dbo].[ACC_TransactionItems] CHECK CONSTRAINT [FK_ACC_TransactionItems_ACC_Ledger]
GO


------------------Insert data in ACC_MST_GroupMapping

INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CashBill', 2) 
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CreditBill', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CreditBillPaid', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CashBillReturn', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CreditBillReturn', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'DepositAdd', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'BillPaidFromDeposit', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'DepositReturn', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'CreditBillFromDeposit', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'BillFromDepositAndCash', 2)
Go
INSERT [dbo].[ACC_MST_GroupMapping] ([Description], [Section]) VALUES (N'BillFromDepositAndCredit', 2)
Go

----------Updating LedgerGroupName in ACC_MST_LedgerGroup

UPDATE [dbo].[ACC_MST_LedgerGroup]
   SET [LedgerGroupName] = 'Stockholders Equity'
 WHERE [PrimaryGroup] ='Liabilities' and [COA]='Capital and Equity'and [LedgerGroupName] = 'Stockholder''s Equity'
GO

UPDATE [dbo].[ACC_MST_LedgerGroup]
   SET [LedgerGroupName] = 'Cash In Hand'
 WHERE [PrimaryGroup] ='Assets' and [COA]='Current Assets'and [LedgerGroupName] = 'Cash'
GO

UPDATE [dbo].[ACC_MST_LedgerGroup]
   SET [COA] = 'Purchase'
 WHERE [PrimaryGroup] ='Expenses' and [COA]='Direct Expense'and [LedgerGroupName] = 'Cost of Goods Sold'
GO

----------- Insert Ledgers in ACC_Ledger

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
  where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Inventory'), 'Inventory Pharmacy', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Cash In Hand'), 'Cash', NULL, NULL, NULL, getdate(), 1, 1)
  go
  
  INSERT [dbo].[ACC_Ledger] ([LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Liabilities' and [COA]='Current Liabilities' and 
  [LedgerGroupName]='Duties and Taxes'), 'VAT', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId], 
[LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId] FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Inventory'), 'Inventory-Hospital', NULL, NULL, NULL, getdate(), 1, 1)
  go

  INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
  [LedgerGroupName]='Sales'), 'Sales-Inventory', NULL, NULL, NULL, getdate(), 1, 1)
  go
  
  INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
  [LedgerGroupName]='Sales'), 'Sales-Pharmacy', NULL, NULL, NULL, getdate(), 1, 1)
  go
  
 INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId], 
[LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup]
 where [PrimaryGroup]='Assets' and [COA]='Current Assets' and [LedgerGroupName]='Sundry Debtors'),
  'Receivables', NULL, NULL, NULL, getdate(), 1, 1)
  go
  
  INSERT [dbo].[ACC_Ledger] ([LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Liabilities' and [COA]='Current Liabilities' and 
  [LedgerGroupName]='Patient Deposits (Liability)'), 'Advance From Patient', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Expenses' and [COA]='Indirect Expenses' and [LedgerGroupName]='Administration Expenses'
), 'Trade Discount', NULL, NULL, NULL, getdate(), 1, 1)
go

INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
 where [PrimaryGroup]='Expenses' and [COA]='Indirect Expenses' and [LedgerGroupName]='Administration Expenses'
), 'Cash Discount', NULL, NULL, NULL, getdate(), 1, 1)
go

  INSERT [dbo].[ACC_Ledger] ([LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Liabilities' and [COA]='Current Liabilities' and 
  [LedgerGroupName]='Duties and Taxes'), 'TDS Payable', NULL, NULL, NULL, getdate(), 1, 1)
go

  INSERT [dbo].[ACC_Ledger] ([LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive]) 
VALUES ( ( SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
where [PrimaryGroup]='Liabilities' and [COA]='Capital and Equity' and 
  [LedgerGroupName]='Stockholders Equity'), 'Share Capital', NULL, NULL, NULL, getdate(), 1, 1)
go
  
  INSERT [dbo].[ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description], [SectionId],
 [LedgerReferenceId], [CreatedOn], [CreatedBy], [IsActive])
 VALUES ( (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
  where [PrimaryGroup]='Assets' and [COA]='Current Assets' and 
  [LedgerGroupName]='Bank'), 'Hams Bank', NULL, NULL, NULL, getdate(), 1, 1)
go


-------------inserting Billing Rules mapping in ACC_MST_MappingDetail

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBill'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where LedgerGroupName='sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 0)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBill'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBill'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBill'),
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBill'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBill'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillPaid'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --
--INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
--VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillPaid'), 
--(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
--GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillPaid'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBillReturn'),
 (select [LedgerGroupId] from [ACC_MST_LedgerGroup] where LedgerGroupName='sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBillReturn'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CashBillReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillReturn'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sales' and PrimaryGroup='Revenue' and COA='Direct Income'), 1)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Duties and Taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ( (select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositAdd'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO 
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositAdd'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillPaidFromDeposit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillPaidFromDeposit'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillPaidFromDeposit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Administration Expenses' and PrimaryGroup='Expenses' and COA='Indirect Expenses'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='DepositReturn'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Administration Expenses' and PrimaryGroup='Expenses' and COA='Indirect Expenses'), 1)
GO --


INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='CreditBillFromDeposit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 0)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCash'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCash'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Administration Expenses' and PrimaryGroup='Expenses' and COA='Indirect Expenses'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCash'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Cash In Hand' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCash'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Patient Deposits (Liability)' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 1)
GO --
INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Sundry Debtors' and PrimaryGroup='Assets' and COA='Current Assets'), 1)
GO 

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit'), 
(select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='Administration Expenses' and PrimaryGroup='Expenses' and COA='Indirect Expenses'), 1)
GO --

INSERT [dbo].[ACC_MST_MappingDetail] ( [GroupMappingId], [LedgerGroupId], [DrCr]) 
VALUES ((select GroupMappingId from ACC_MST_GroupMapping where [Description]='BillFromDepositAndCredit'),
 (select LedgerGroupId from ACC_MST_LedgerGroup where LedgerGroupName='duties and taxes' and PrimaryGroup='Liabilities' and COA='Current Liabilities'), 0)
GO --

--- End Salakha Gawas: 23/10/2018 Added Billing Rules, Mapping, And Ledgers in tables--------



---START Ajay 24-10-2018 fiscal year closure
----add nepali fiscal year name 
ALTER TABLE [ACC_MST_FiscalYears]
ADD NpFiscalYearName varchar(50);
GO

----add new table LedgerBalanceHistory
CREATE TABLE [dbo].[ACC_LedgerBalanceHistory](
	[LedgerBalanceHistoryId] [int] IDENTITY(1,1) NOT NULL,
	[FiscalYearId] [int] NULL,
	[LedgerId] [int] NULL,
	[OpeningBalance] [float] NULL,
	[OpeningDrCr] [bit] NULL,
	[ClosingBalance] [float] NULL,
	[ClosingDrCr] [bit] NULL,
	[CreatedBy] [int] NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK_ACC_LedgerBalanceHistory] PRIMARY KEY CLUSTERED 
(
	[LedgerBalanceHistoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ACC_LedgerBalanceHistory]  WITH CHECK ADD  CONSTRAINT [FK_ACC_LedgerBalanceHistory_FiscalYear] FOREIGN KEY([FiscalYearId])
REFERENCES [dbo].[ACC_MST_FiscalYears] ([FiscalYearId])
GO

ALTER TABLE [dbo].[ACC_LedgerBalanceHistory] CHECK CONSTRAINT [FK_ACC_LedgerBalanceHistory_FiscalYear]
GO

ALTER TABLE [dbo].[ACC_LedgerBalanceHistory]  WITH CHECK ADD  CONSTRAINT [FK_ACC_LedgerBalanceHistory_Ledger] FOREIGN KEY([LedgerId])
REFERENCES [dbo].[ACC_Ledger] ([LedgerId])
GO

ALTER TABLE [dbo].[ACC_LedgerBalanceHistory] CHECK CONSTRAINT [FK_ACC_LedgerBalanceHistory_Ledger]
GO

----adding permission
INSERT INTO [RBAC_Permission]
           ([PermissionName]
           ,[ApplicationId]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive])
     VALUES
           ('accounting-transaction-account-closure-view'
           ,(select ApplicationId from RBAC_Application where ApplicationName='Accounting')
           ,1
           ,GETDATE()
           ,1)
GO
-------------------------------------
INSERT INTO [RBAC_Permission]
           ([PermissionName]
           ,[ApplicationId]
           ,[CreatedBy]
           ,[CreatedOn]
           ,[IsActive])
     VALUES
           ('accounting-transaction-transfertoacc-view'
           ,(select ApplicationId from RBAC_Application where ApplicationName='Accounting')
           ,1
           ,GETDATE()
           ,1)
GO
---adding route config
INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName]
           ,[UrlFullPath]
           ,[RouterLink]
           ,[PermissionId]
           ,[ParentRouteId]
           ,[DefaultShow]
           ,[DisplaySeq]
           ,[IsActive])
     VALUES
           ('Account Closure'
           ,'Accounting/Transaction/AccountClosure'
           ,'AccountClosure'
           ,(select PermissionId from RBAC_Permission where PermissionName='accounting-transaction-account-closure-view')
           ,(select RouteId from RBAC_RouteConfig where RouterLink='Transaction')
           ,1
           ,5
           ,1)
GO
-------------------------------------------------
INSERT INTO [dbo].[RBAC_RouteConfig]
           ([DisplayName]
           ,[UrlFullPath]
           ,[RouterLink]
           ,[PermissionId]
           ,[ParentRouteId]
           ,[DefaultShow]
           ,[DisplaySeq]
           ,[IsActive])
     VALUES
           ('Transfer To Accounting'
           ,'Accounting/Transaction/TransferToACC'
           ,'TransferToACC'
           ,(select PermissionId from RBAC_Permission where PermissionName='accounting-transaction-transfertoacc-view')
           ,(select RouteId from RBAC_RouteConfig where RouterLink='Transaction')
           ,1
           ,2
           ,1)
GO
---END Ajay 24-10-2018 fiscal year closure


--- Start Salakha Gawas: 25/10/2018 Added Income Ledgers in ACC_Ledger-------
    Declare @LedgerGroupId int
  set @LedgerGroupid= (SELECT [LedgerGroupId]  FROM [dbo].[ACC_MST_LedgerGroup] 
                      where [PrimaryGroup]='Revenue' and [COA]='Direct Income' and 
                      [LedgerGroupName]='Sales')
					  
  INSERT [ACC_Ledger] ( [LedgerGroupId], [LedgerName], [Description],[CreatedOn], [CreatedBy], [IsActive])
 VALUES  ( @LedgerGroupId, 'PAP Smear', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'Slide Consultation', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'HISTO', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'FNAC', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PATHOLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'RADIOLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MISCELLANEOUS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'CTVS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'AMPUTATIONS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ANASTHESIA', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'ARTHROPLASTY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'BIRIATRIC SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'BLOOD BANK', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'BREAST', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'BURN SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'CHARGES FOR BED DR.VISIT & ADMISSION FEE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'CONSULTATION CHARGES FOR PRIVATE PATIENT', 'Income Ledger for Hams', getdate(), 1, 1),
   	     ( @LedgerGroupId, 'CONSUMEABLES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'CORONARY/PERIPHERAL ANGIOGPRAPHY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'CRANIAL SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'DAY CARE OPERATION', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'DENTISTRY (APICOCTOMY)', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'DEVICE IMPLANTATION', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EARS SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ELECTROPHYSIOLOGY STUDIES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EMERGENCY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ENT OPERATION', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ENT PROCEDURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ENT Surgeries under G.A.', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ENT Surgeries under L.A.', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EXTERNAL FIXATOR APP', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EXTERNAL LAB-1', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EYE PROCEDURE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'EYE SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'FACE LIFT', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'FACIAL NERVE (UNILATERAL)', 'Income Ledger for Hams', getdate(), 1, 1),
  		 ( @LedgerGroupId, 'FIXED ORTHODONTIC TREATMENT', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'G.I.T.', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'GASTROENTEROLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'GENERAL PLASTIC SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'General Surgery', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'GENITALS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'GYNAECOLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'GYNAECOLOGY PROCEDURE(OPD ONLY)', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'HAND SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'IPD', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'LAPROSCOPIC SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'LIPS & PALATE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'LITHOTRIPSYS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'LYMPHOEDEMA', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MANDIBLE FRACTURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MANDIBULAR DEFORMITY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MAXILLA FRACTURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MAXILO FACIAL', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'MEDICINE PROCEDURE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'NEPHROLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'NEPHROLOGY/ PACKAGES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'NEUROLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'NOSE SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
  		 ( @LedgerGroupId, 'OPD', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'OPD CONSULTATION', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'OPHTHALMOLOGY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'Ortho Procedures', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'OT', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'OT GYNAE PROCEDURE INDOOR', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PAEDIATRIC', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PHYSIOTHERAPY', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'PLASTIC SURGERY, BODY SCULPTURE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PROCEDURES IN CATH LAB', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PSYCHO TEST: PAPER PENCIL TEST', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'PULMONOLOGY BRONCHO-SCOPY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'RECONSTRUCTIVE PROCEDURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'RHINOPLASTY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'ROOM CHARGES', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'SIMPLE EXTRACTION', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SKIN PROCEDURE', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SOFT TISSUE TUMOR SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SPINAL SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'SPINE SURGERY', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SURGERY CHARGES (PAEDIATRIC)', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SURGICAL OPERATIONS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'SURGICAL PROCEDURES', 'Income Ledger for Hams', getdate(), 1, 1),
  		 ( @LedgerGroupId, 'THERAPY CHARGES', 'Income Ledger for Hams', getdate(), 1, 1),
	     ( @LedgerGroupId, 'THORACIC SURGICAL PROCEDURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'THORAX', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'TISSUE EXPANDERS', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'TRANSPORT', 'Income Ledger for Hams', getdate(), 1, 1),
    	 ( @LedgerGroupId, 'URETHRAL STRICTURES', 'Income Ledger for Hams', getdate(), 1, 1),
		 ( @LedgerGroupId, 'UROLOGICAL OPERATION', 'Income Ledger for Hams', getdate(), 1, 1)
		go

  -----------------------Creating new table ACC_TransactionItemDetail
  
  SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [ACC_TransactionItemDetail](
	[TransactionItemDetailId] [int] IDENTITY(1,1) NOT NULL,
	[TransactionItemId] [int] NULL,
	[PatientId] [int] NULL,
	[Amount] [float] NULL,
	[Description] [varchar] NULL
 CONSTRAINT [PK_ACC_TransactionItemDetail] PRIMARY KEY CLUSTERED 
(
	[TransactionItemDetailId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO



--- End Salakha Gawas: 25/10/2018 Added Income Ledgers in ACC_Ledger and created table-------


--- Start Salakha Gawas: 30/10/2018 Added Direct Expense in ACC_MST_LedgerGroup-------

  INSERT [dbo].[ACC_MST_LedgerGroup] ( [PrimaryGroup], [COA], [LedgerGroupName], [Description], [CreatedBy], [CreatedOn], [IsActive])
 VALUES ( 'Expenses', 'Direct Expense', 'Direct Expense', NULL, 1, GETDATE(), 1)
GO

--- End Salakha Gawas: 30/10/2018 Added Direct Expense in ACC_MST_LedgerGroup-------

----01 Nov 2018: NageshBB: added sync table , trigger for post billing records into sync table, transfer rule added for discount
Drop Table If Exists BIL_SYNC_BillingAccounting
go
Drop Trigger if Exists TRG_BillingTransaction_BillToAccSync
Go
Drop Trigger if Exists TRG_BillToAccSync_DepositTxn
Go
Drop Trigger if Exists TRG_BillToAcc_BillingTxnItem
Go
Drop Trigger if Exists TRG_BillToAcc_BillingTxn
Go
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BIL_SYNC_BillingAccounting](
	[BillingAccountingSyncId] [int] IDENTITY(1,1) NOT NULL,
	[ReferenceId] [int] NULL,
	[ReferenceModelName] [varchar](100) NULL,
	[ServiceDepartmentId] [int] NULL,
	[ItemId] [int] NULL,
	[IncomeLedgerName] varchar(100) NULL,
	[PatientId] [int] NULL,
	[TransactionType] [varchar](50) NULL,
	[PaymentMode] [varchar](20) NULL,
	[SubTotal] [float] NULL,
	[TaxAmount] [float] NULL,
	[DiscountAmount] [float] NULL,
	[TotalAmount] [float] NULL,
	[IsTransferedToAcc] [bit] NULL,
	[TransactionDate] [datetime] NULL,
	[CreatedOn] [datetime] NULL,
	[CreatedBy] [int] NULL,
 CONSTRAINT [PK_BIL_SYNC_BillingAccounting] PRIMARY KEY CLUSTERED 
(
	[BillingAccountingSyncId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


Delete from ACC_MST_FiscalYears
GO
--current fiscal Year insert script 
Insert into ACC_MST_FiscalYears
values('2075/2076',	'2018-07-17 00:00:10.000',	'2019-07-16 23:59:55.000',	'Nepali fiscal year current', 	'2018-09-03 12:45:43.253',	1,	1,	'2075/76')
Go




SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create TRIGGER [dbo].[TRG_BillToAccSync_DepositTxn]
ON [dbo].[BIL_TXN_Deposit]
AFTER INSERT
AS
BEGIN
  IF EXISTS (SELECT 1 FROM inserted)
  BEGIN
  --INSERTING VALUES TO SYNC TABLE
    INSERT INTO BIL_SYNC_BillingAccounting
		(ReferenceId,ReferenceModelName,PatientId,TransactionType,TotalAmount,PaymentMode,TransactionDate,CreatedOn,CreatedBy)
	VALUES
		(
			(SELECT DepositId FROM inserted),		--ReferenceId
			'Deposit',								--ReferenceModelName
			(SELECT PatientId FROM inserted),		--PatientId
			(SELECT 
				CASE 
					WHEN DepositType = 'Deposit' THEN 'DepositAdd' 
					WHEN DepositType = 'depositdeduct' THEN 'DepositReturn'
				END FROM inserted),					--TransactionType
			(SELECT Amount FROM inserted),			--TotalAmount
			(SELECT PaymentMode FROM inserted),     --PaymentMode
			(select CreatedOn from inserted),
			GETDATE(),
			(select CreatedBy from inserted)
		)
  END
END

Go


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create TRIGGER [dbo].[TRG_BillToAcc_BillingTxnItem]
   ON [dbo].[BIL_TXN_BillingTransactionItems]
   AFTER INSERT,UPDATE
AS
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ramavtar/2018-10-29			created the script

=======================================================
*/
BEGIN
	--ignoring provisional records
	IF (SELECT BillingTransactionId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20), @ReportingDeptName varchar(100)

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_BillingTransaction WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted))
		SET @ReportingDeptName = (SELECT dbo.FN_BIL_GetSrvDeptReportingName(ServiceDepartmentName,ItemName) FROM inserted)
		--Inserting Values
		INSERT INTO BIL_SYNC_BillingAccounting 
			(ReferenceId, ReferenceModelName, ServiceDepartmentId, ItemId, PatientId,
			 TransactionType, PaymentMode, SubTotal, TaxAmount, DiscountAmount, TotalAmount,IncomeLedgerName,TransactionDate,CreatedOn,CreatedBy)
		VALUES 
		(
			(SELECT BillingTransactionItemId FROM inserted),		--ReferenceId
			'BillingTransactionItem',								--ReferenceModelName
			(SELECT ServiceDepartmentId FROM inserted),				--ServiceDepartmentId
			(SELECT ItemId FROM inserted),							--ItemId
			(SELECT PatientId FROM inserted),						--PatientId
			(SELECT 
				CASE
					WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode = 'credit' THEN 'CreditBillPaid'
					WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode != 'credit' THEN 'CashBill'
					WHEN ReturnStatus IS NULL AND BillStatus = 'unpaid' THEN 'CreditBill'
					WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'paid' THEN 'CashBillReturn'
					WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'unpaid' THEN 'CreditBillReturn'
				END FROM inserted),									--TransactionType
			@PaymentMode,											--PaymentMode
			(SELECT SubTotal FROM inserted),						--SubTotal
			(SELECT Tax FROM inserted),								--TaxAmount
			(SELECT DiscountAmount FROM inserted),					--DiscountAmount
			(SELECT TotalAmount FROM inserted),						--TotalAmount
			@ReportingDeptName ,
			(select CreatedOn from inserted),
			GETDATE(),
			(select CreatedBy from inserted)
		)
	END
END
Go

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create TRIGGER [dbo].[TRG_BillToAcc_BillingTxn]
   ON  [dbo].[BIL_TXN_BillingTransaction]
   AFTER UPDATE
AS 
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ramavtar/2018-10-29			created the script

=======================================================
*/
BEGIN
	--perform only if settlementid is found
	IF (SELECT SettlementId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20)

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_Settlements WHERE SettlementId = (SELECT SettlementId FROM inserted))

		--Updating Values
		UPDATE BIL_SYNC_BillingAccounting
		SET PaymentMode = @PaymentMode
		WHERE TransactionType = 'CreditBillPaid'
			AND ReferenceId IN (SELECT BillingTransactionItemId FROM BIL_TXN_BillingTransactionItems WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted) )

	END
END
Go

insert into ACC_MST_MappingDetail(GroupMappingId,LedgerGroupId,DrCr) 
values(
(select GroupMappingId from ACC_MST_GroupMapping where Description='CashBill'),
(select Ledgergroupid from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'),
1),
(
(select GroupMappingId from ACC_MST_GroupMapping where Description='CreditBill'),
(select Ledgergroupid from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'),
1),
(
(select GroupMappingId from ACC_MST_GroupMapping where Description='CashBillReturn'),
(select Ledgergroupid from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'),
0),

(
(select GroupMappingId from ACC_MST_GroupMapping where Description='CreditBillReturn'),
(select Ledgergroupid from ACC_MST_LedgerGroup where PrimaryGroup='Expenses' and COA='Indirect Expenses' and LedgerGroupName='Administration Expenses'),
0)
Go

----01 Nov 2018: NageshBB: added sync table , trigger for post billing records into sync table, transfer rule added for discount

---START: 19-Nov-2018 Ajay Patil : changed size of description column in transactionItemDetails
ALTER TABLE [ACC_TransactionItemDetail]
ALTER COLUMN [Description] VARCHAR(200);
GO
---END: 19-Nov-2018 Ajay Patil : changed size of description column in transactionItemDetails

---START: 20-Nov-2018 Salakha: changed datatype of column in ACC_TXN_Link
ALTER TABLE ACC_TXN_Link
ALTER COLUMN ReferenceId varchar(max);
Go
ALTER TABLE [ACC_Transactions]
ADD TransactionType Varchar(100);
Go
---END: 20-Nov-2018 Salakha : changed datatype of column in ACC_TXN_Link

--START: Ajay: 21 Nov 2018 : added permission for back date entry
INSERT INTO [dbo].[RBAC_Permission]
([PermissionName], [ApplicationId], [CreatedBy], [CreatedOn], [IsActive])
 VALUES
 ( 'accounting-transaction-backdate-voucherentry-btn',
	(select ApplicationId from RBAC_Application where ApplicationName like 'Accounting'),
    1,GETDATE(),1)
GO
--END: Ajay: 21 Nov 2018 : added permission for back date entry

--START: Salakha: 22 Nov 2018 : added VoucherId Column in ACC_MST_GroupMapping and update table
ALTER TABLE ACC_MST_GroupMapping
ADD Details varchar(max);
Go

 ALTER TABLE ACC_MST_GroupMapping
ADD VoucherId int;
Go

-- Adding VoucherId in table ACC_MST_GroupMapping
update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Sales Voucher' )
 where [Description] ='CashBill'
 go
 
update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Sales Voucher' )
 where [Description] ='CreditBill'
 go
 
update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Credit Note' )
 where [Description] ='CashBillReturn'
go


 update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Credit Note' )
 where [Description] ='CreditBillReturn'
go

 update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher' )
 where [Description] ='CreditBillPaid'
 go
 
 update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Payment Voucher' )
 where [Description] ='DepositReturn'
go

 update ACC_MST_GroupMapping
 set [VoucherId] = ( select VoucherId from ACC_MST_Vouchers where [VoucherName]='Receipt Voucher' )
 where [Description] ='DepositAdd'
 go
 
--END: Salakha: 22 Nov 2018 : added ACC_MST_GroupMapping and update table 

--START: Ajay 23 Nov 2018 : changed trigger for deposit and added column in ACC_MST_MappingDetail
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAccSync_DepositTxn]
ON [dbo].[BIL_TXN_Deposit]
AFTER INSERT
AS
BEGIN
  IF EXISTS (SELECT 1 FROM inserted)
  BEGIN
  --INSERTING VALUES TO SYNC TABLE
    INSERT INTO BIL_SYNC_BillingAccounting
		(ReferenceId,ReferenceModelName,PatientId,TransactionType,TotalAmount,PaymentMode,TransactionDate,CreatedOn,CreatedBy)
	VALUES
		(
			(SELECT DepositId FROM inserted),		--ReferenceId
			'Deposit',								--ReferenceModelName
			(SELECT PatientId FROM inserted),		--PatientId
			(SELECT 
				CASE 
					WHEN DepositType = 'Deposit' THEN 'DepositAdd' 
					WHEN DepositType = 'depositdeduct' THEN 'DepositReturn'
					WHEN DepositType = 'ReturnDeposit' THEN 'DepositReturn'
				END FROM inserted),					--TransactionType
			(SELECT Amount FROM inserted),			--TotalAmount
			(SELECT 
				CASE
				  WHEN DepositType='depositdeduct' and PaymentMode IS NULL THEN 'cash'
				  WHEN PaymentMode IS NOT NULL THEN PaymentMode
				END
			  FROM inserted),     --PaymentMode
			(SELECT CreatedOn FROM inserted),
			GETDATE(),
			(SELECT CreatedBy FROM inserted)
		)
  END
END
GO

--added column in ACC_MST_MappingDetail and updated its values

--adding column
ALTER TABLE ACC_MST_MappingDetail
ADD Description varchar(max);
GO

--updating added column values
DECLARE @cnt INT = 1;

WHILE @cnt <= (select count(*) from ACC_MST_MappingDetail)
BEGIN
   UPDATE ACC_MST_MappingDetail
	SET Description=(
		select REPLACE(gm.Description+LedgerGroupName,' ','')
		from ACC_MST_MappingDetail md 
		join ACC_MST_GroupMapping gm on md.GroupMappingId = gm.GroupMappingId 
		join ACC_MST_LedgerGroup lg on md.LedgerGroupId = lg.LedgerGroupId
		where md.AccountingMappingDetailId=@cnt)
		where AccountingMappingDetailId=@cnt
   SET @cnt = @cnt + 1;
END;
GO
--END: Ajay 23 Nov 2018 : changed trigger for deposit and added column in ACC_MST_MappingDetail


--START Salakha 23 Nov 2018 : created function to get income ledger for accounting 
---- Added New function to get income ledgername for accounting
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<salakha>
-- Create date: <23 Nov 2018>
-- Description:	<get income ledgers>
-- =============================================
CREATE FUNCTION [dbo].[FN_ACC_GetIncomeLedgerName] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

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


--changed function in trigger TRG_BillToAcc_BillingTxnItem
/****** Object:  Trigger [dbo].[TRG_BillToAcc_BillingTxnItem]    Script Date: 23-11-2018 17:13:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[TRG_BillToAcc_BillingTxnItem]
   ON [dbo].[BIL_TXN_BillingTransactionItems]
   AFTER INSERT,UPDATE
AS
/* 
Change History
=======================================================
S.No.	UpdatedBy/Date              Remarks
=======================================================
1		Ramavtar/2018-10-29			created the script

2       Salakha/2018-11-23          Changed function for accounting

=======================================================
*/
BEGIN
	--ignoring provisional records
	IF (SELECT BillingTransactionId FROM inserted) IS NOT NULL
	BEGIN
		--Declare Variables
		DECLARE @PaymentMode varchar(20), @ReportingDeptName varchar(100)

		--Initializing
		SET @PaymentMode = (SELECT PaymentMode FROM BIL_TXN_BillingTransaction WHERE BillingTransactionId = (SELECT BillingTransactionId FROM inserted))
		SET @ReportingDeptName = (SELECT dbo.FN_ACC_GetIncomeLedgerName(ServiceDepartmentName,ItemName) FROM inserted)
		--Inserting Values
		INSERT INTO BIL_SYNC_BillingAccounting 
			(ReferenceId, ReferenceModelName, ServiceDepartmentId, ItemId, PatientId,
			 TransactionType, PaymentMode, SubTotal, TaxAmount, DiscountAmount, TotalAmount,IncomeLedgerName,TransactionDate,CreatedOn,CreatedBy)
		VALUES 
		(
			(SELECT BillingTransactionItemId FROM inserted),		--ReferenceId
			'BillingTransactionItem',								--ReferenceModelName
			(SELECT ServiceDepartmentId FROM inserted),				--ServiceDepartmentId
			(SELECT ItemId FROM inserted),							--ItemId
			(SELECT PatientId FROM inserted),						--PatientId
			(SELECT 
				CASE
					WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode = 'credit' THEN 'CreditBillPaid'
					WHEN ReturnStatus IS NULL AND BillStatus = 'paid' AND @PaymentMode != 'credit' THEN 'CashBill'
					WHEN ReturnStatus IS NULL AND BillStatus = 'unpaid' THEN 'CreditBill'
					WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'paid' THEN 'CashBillReturn'
					WHEN ReturnStatus IS NOT NULL AND  BillStatus = 'unpaid' THEN 'CreditBillReturn'
				END FROM inserted),									--TransactionType
			@PaymentMode,											--PaymentMode
			(SELECT SubTotal FROM inserted),						--SubTotal
			(SELECT Tax FROM inserted),								--TaxAmount
			(SELECT DiscountAmount FROM inserted),					--DiscountAmount
			(SELECT TotalAmount FROM inserted),						--TotalAmount
			@ReportingDeptName ,
			(select CreatedOn from inserted),
			GETDATE(),
			(select CreatedBy from inserted)
		)
	END
END
GO
--END Salakha 23 Nov 2018 : created function to get income ledger for accounting 
-------END:Accounting Incremental Script Merge
-------START:Inventory Incremental Script Merge

-- START 10-05-2018 Mahesh -- alter item table and store procedure for stock report --

alter table INV_MST_Item add CompanyId int Null;
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Mahesh>
-- Create date: <2018 Sept 10>
-- Description:	<To get the current stock level report as per item id>
-- =============================================

CREATE PROCEDURE [dbo].[SP_Report_Inventory_CurrentStockLevel_ItemId] 
@ItemId int=0 

AS

BEGIN
		If(@ItemId > 0)
			BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						itm.MinStockQuantity,
						itm.BudgetedQuantity, 
							gdrp.ItemRate
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				WHERE stk.ItemId = @ItemId
				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate
			END
        ELSE 
		    BEGIN
				SELECT itm.ItemName,
						stk.BatchNO,
						SUM(stk.AvailableQuantity) AS AvailableQuantity,
						itm.MinStockQuantity,
						itm.BudgetedQuantity, 
							gdrp.ItemRate
					FROM INV_TXN_Stock stk
				INNER JOIN INV_MST_Item itm ON itm.ItemId = stk.ItemId 
				INNER JOIN INV_TXN_GoodsReceiptItems gdrp ON gdrp.GoodsReceiptItemId = stk.GoodsReceiptItemId
				GROUP BY stk.ItemId, stk.BatchNO, itm.MinStockQuantity, itm.ItemName, itm.BudgetedQuantity,itm.StandardRate , gdrp.ItemRate
			END 
END
GO
-- END 10-05-2018 Mahesh -- alter item table and store procedure for stock report --


-- START 10-07-2018 Mahesh -- alter vendor and gr table --

alter table INV_MST_Vendor alter column Tds float;
GO

alter table INV_MST_Vendor add CreditPeriod float;
GO

alter table INV_TXN_GoodsReceipt add CreditPeriod int;
GO

alter table INV_TXN_GoodsReceipt add PaymentMode varchar(50);
GO

-- END 10-07-2018 Mahesh -- alter vendor and gr table --


-- Start 21st november 2018 | Suraj | Created a table --

CREATE TABLE [dbo].[INV_MST_Terms](
  [TermsId] [int] IDENTITY(1,1) NOT NULL,
  [Text] [text] NOT NULL,
  [Type] [varchar](50) NOT NULL,
  [OrderBy] [int] NULL,
  [IsActive] [bit] NOT NULL,
  [CreatedBy] [int] NOT NULL,
  [CreatedOn] [datetime] NOT NULL,
 CONSTRAINT [PK_INV_MST_Terms] PRIMARY KEY CLUSTERED 
(
  [TermsId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[INV_MST_Terms] ADD  CONSTRAINT [DF_INV_MST_Terms_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[INV_MST_Terms]  WITH CHECK ADD  CONSTRAINT [FK_INV_MST_Terms_EMP_Employee] FOREIGN KEY([TermsId])
REFERENCES [dbo].[EMP_Employee] ([EmployeeId])
GO

ALTER TABLE [dbo].[INV_MST_Terms] CHECK CONSTRAINT [FK_INV_MST_Terms_EMP_Employee]
GO

-- End 21st november 2018 | Suraj | Created a table --
-------END:Inventory Incremental Script Merge
----END: NageshBB: 05 DEc 2018:Merged ACC_IncrementalOn03Sep+ and Inventory Incremental script file with  3.IncrementalScript30Sep+  (Reverse integration done by Dinesh sir on 25 Nov 2018)--

---START: Ramavtar: 06Dec'18: alter of PatientCensus report
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2018-12-04','2018-12-04'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@ProviderId int = NULL
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
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
6.		ramavtar/03Dec'18		revamp of SP -> as per new requirement
7.		ramavtar/05Dec'18		filter more case of paid/credit bills
----------------------------------------------------------
*/
BEGIN
	SELECT 
		tbl.Provider,
		tbl.ServiceDepartmentName,
		tbl.totC1,
		tbl.retC1,
		tbl.totA1,
		tbl.retA1,
		tbl.totC2,
		tbl.totA2,
		tbl.totC3,
		tbl.retC3,
		tbl.totA3,
		tbl.retA3,
		(tbl.totC1 - tbl.retC1) + (tbl.totC3 - tbl.retC3) AS 'totTC',
		(tbl.totA1 - tbl.retA1) + (tbl.totA3 - tbl.retA3) AS 'totTA' 
	FROM (
	SELECT 
		ISNULL(fn.ProviderName,'NoDoctor') AS 'Provider',
		fn.ServiceDepartmentName,
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NULL AND vm.CreditDate IS NULL THEN 1
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NULL AND vm.CreditDate BETWEEN @FromDate AND @ToDate THEN 1
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NULL THEN 1
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL AND (fn.CreditDate IS NOT NULL OR fn.PaidDate IS NOT NULL) THEN 1 
				ELSE 0
			END) AS 'totC1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN 1 ELSE 0
			END) AS 'retC1',
		SUM(CASE 
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'paid' AND vm.CreditDate IS NULL THEN fn.PaidAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'paid' AND  vm.CreditDate BETWEEN @FromDate AND @ToDate THEN fn.PaidAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'credit' THEN fn.CreditAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'return' AND (fn.CreditDate IS NOT NULL OR fn.PaidDate IS NOT NULL)  THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA1',
		SUM(CASE
				WHEN fn.BillStatus = 'provisional' THEN 1
				ELSE 0
			END) AS 'totC2',
		SUM(CASE 
				WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount 
				ELSE 0 
			END) AS 'totA2',
		SUM(CASE 
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN 1
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND vm.CreditDate IS NULL THEN 1
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND vm.CreditDate BETWEEN @FromDate AND @ToDate THEN 1
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaidDate IS NOT NULL OR fn.CreditDate IS NOT NULL) THEN 1
				ELSE 0
			END) AS 'totC3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL
				THEN 1 ELSE 0 
			END) AS 'retC3',
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND vm.CreditDate IS NULL THEN fn.PaidAmount
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND vm.CreditDate BETWEEN @FromDate AND @ToDate THEN fn.PaidAmount
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.CreditAmount
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaidDate IS NOT NULL OR fn.CreditDate IS NOT NULL) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA3'
		--,
		--SUM(CASE
		--		WHEN fn.BillStatus = 'paid' OR fn.BillStatus = 'credit' THEN 1 ELSE 0 
		--	END) AS 'totTC',
		--SUM(CASE 
		--		WHEN fn.BillStatus = 'paid' THEN fn.PaidAmount
		--		WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount
		--		ELSE 0
		--	END) AS 'totTA'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
	JOIN VW_BIL_TxnItemsInfoWithDateSeparation vm ON fn.BillingTransactionItemId = vm.BillingTransactionItemId
	WHERE ISNULL(@ProviderId,ISNULL(fn.ProviderId,0)) = ISNULL(fn.ProviderId,0)
	GROUP BY fn.ProviderName,fn.ServiceDepartmentName
	--ORDER BY 1,2
	) tbl
	order by tbl.Provider,tbl.ServiceDepartmentName

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
--- END:Ramavtar:06Dec'18 _ alter of PatientCensus report
--START: Ramavtar:06Dec'18 --> changes in VW table for provisionalDate
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
 4.		Ramavtar/06Dec			alter		change in ProvisionalDate case statements
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
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
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
--- END: Ramavtar:06Dec'18 --> changes in VW table for provisionalDate


---START: Ashim 06Dec2018 -- Version 1.7.0 Changes Billing------

----START: Ashim: 06Dec2018 ----Added ProcedureType in ADT_PatientAdmission---
alter table [dbo].[ADT_PatientAdmission]
add ProcedureType varchar(150) null
go
----END: Ashim: 06Dec2018 ----Added ProcedureType in ADT_PatientAdmission---

---END: Ashim 06Dec2018 -- Version 1.7.0 Changes Billing------


----START: Vikas: 2018-12-06 ----Added columns into pharmacy invoice and invoice return items table---
Alter Table PHRM_TXN_Invoice ADD FiscalYearId int null
Go
ALTER TABLE PHRM_TXN_InvoiceReturnItems ADD CreditNoteNumber int null
Go
ALTER TABLE PHRM_TXN_InvoiceReturnItems ADD FiscalYearId int NULL
Go
----END: Vikas: 2018-12-06 ----Added columns into pharmacy invoice and invoice return items table---
---START : Ramavtar:2018-12-07	incl. credit bills in SP ---
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_IRD_InvoiceDetails]
		@FromDate Datetime=null ,
		@ToDate DateTime=null
AS
/*
FileName: [SP_IRD_InvoiceDetails]
CreatedBy/date: Umed/2017-09-294
Description: to get the Invoice Details as per IRD requirements 
Change History
-------------------------------------------------------
S.No.    UpdatedBy/Date         Remarks
-------------------------------------------------------
1       Sud/2018-May-7          revised as per new ird requirements    
2		Ramavtar/07Dec			applying filter on CreatedOn instead of PaidDate                                       
-------------------------------------------------------
*/
BEGIN
  IF (@FromDate IS NOT NULL) OR (@ToDate IS NOT NULL)  
	 BEGIN
	 SET NOCOUNT ON
			
	SELECT
		--convert(varchar(20),year(biltxn.PaidDate)) as Fiscal_Year,
		fiscYr.FiscalYearFormatted AS Fiscal_Year,  --remove this and take from parameter table
		ISNULL(biltxn.InvoiceCode, 'BL') + CONVERT(varchar(20), biltxn.InvoiceNo) AS Bill_No,
		pats.FirstName + ' ' + pats.LastName AS Customer_name,
		pats.PANNumber,
		CONVERT(varchar(10), biltxn.CreatedOn, 120) AS BillDate,
		biltxn.TransactionType AS BillType,
		biltxn.SubTotal AS Amount,
		--CASE When biltxn.TransactionType!='DEPOSIT RETURN' then ((biltxn.PaidAmount-biltxn.TaxTotal)+biltxn.DiscountAmount) else biltxn.DepositReturnAmount END AS Amount,
		biltxn.DiscountAmount AS DiscountAmount,
		(biltxn.TaxableAmount) AS Taxable_Amount,
		(biltxn.TaxTotal) AS Tax_Amount,
		((biltxn.SubTotal - biltxn.DiscountAmount) + biltxn.TaxTotal) AS Total_Amount,
		CASE
			WHEN biltxn.IsRemoteSynced = 1 THEN 'Yes'
			ELSE 'No'
		END AS SyncedWithIRD,
		CASE
			WHEN biltxn.PrintCount > 0 THEN 'Yes'
			ELSE 'No'
		END AS Is_Printed,
		CONVERT(varchar(20), CONVERT(time, biltxn.CreatedOn), 100) AS Printed_Time,
		emp.FirstName + ' ' + emp.LastName AS Entered_By,
		emp.FirstName + ' ' + emp.LastName AS Printed_by,
		biltxn.PrintCount AS Print_Count,
		--might need to change logic for isrealtime--: sud:9May'18--
		CASE
			WHEN ISNULL(biltxn.IsRealtime, 0) = 1 THEN 'Yes'
			ELSE 'No'
		END AS Is_Realtime,
		--CASE When biltxn.IsRemoteSynced=1 then 'Yes' else 'No' END as Is_Realtime,
		CASE
			WHEN ISNULL(biltxn.ReturnStatus, 0) = 0 THEN 'True'
			ELSE 'False'
		END AS Is_Bill_Active
	FROM BIL_TXN_BillingTransaction biltxn
		INNER JOIN EMP_Employee emp ON emp.EmployeeId = biltxn.CreatedBy
		INNER JOIN PAT_Patient pats ON pats.PatientId = biltxn.PatientId
		INNER JOIN BIL_CFG_FiscalYears fiscYr ON biltxn.FiscalYearId = fiscYr.FiscalYearId
	WHERE CONVERT(date, biltxn.CreatedOn) BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)		
     END
END
GO
---END : Ramavtar:2018-12-07	incl. credit bills in SP ---


---START: NageshBB: 09-12-2018 : Income Segregation Report sp changes , fixed 0 values record bug and credit amount mismatch

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
@FromDate Date=null ,
@ToDate Date=null	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2017-07-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
5.		Nagesh/09Dec'18				changes for remove 0 values record and Credit Amount mismatch
-------------------------------------------------------------------------------
*/
BEGIN
  ----start of IncomeSeggCTE
  ;
  WITH IncomeSegCTE 
  AS (SELECT
    vwTxnItm.BillingDate 'Date',
	BillingTransactionItemId,
    sd.ServiceDepartmentName,
    itms.ItemName,
    CASE
      WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='NON INVASIVE CARDIO VASCULAR INVESTIGATIONS' and ItemName like '%ECHO%' ) 
	then 'ECHO'
	when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY' 
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
      ELSE sd.ServiceDepartmentName
    END AS 'ServDeptName',
    ISNULL(vwTxnItm.PaidQuantity, 0) + ISNULL(vwTxnItm.UnpaidQuantity, 0) 'Quantity',
    ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
    ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
    ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
    ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
    ISNULL(vwTxnItm.UnpaidSubTotal, 0) 'UnpaidSubTotal',
    ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
    ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
    ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
    ISNULL(vwTxnItm.CancelSubTotal, 0) 'CancelSubTotal',
    ISNULL(vwTxnItm.CancelDiscountAmount, 0) 'CancelDiscount',
    ISNULL(vwTxnItm.CancelTax, 0) 'CancelHST',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) 'CancelTotalAmount',
    ISNULL(vwTxnItm.CancelTotalAmount, 0) - ISNULL(vwTxnItm.CancelTax, 0) 'CancelAmount',
	ISNULL(vwTxnItm.ReturnQuantity, 0) 'ReturnQuantity',
    ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
    ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
    ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
    ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0)+ISNULL(vwTxnItm.ReturnDiscountAmount,0) 'ReturnAmount'
  FROM BIL_MST_ServiceDepartment sd,
       BIL_CFG_BillItemPrice itms,
      VW_BIL_TxnItemsInfo_Income_Segregation vwTxnItm
  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
	AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
	AND vwTxnItm.ItemId = itms.ItemId
	AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
	
	AND BillingTransactionItemId NOT IN (
		SELECT
			BillingTransactionItemId
		FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
		GROUP BY BillingTransactionItemId
		HAVING COUNT(BillingTransactionItemId) > 2)

	AND BillingTransactionItemId NOT IN (
		SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2))
  -----end of IncomeSeggCTE
  -----start of CreditReturnedCTE
  ,
  IncomeSegCreditReturnedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount', 
		SUM(ReturnQuantity) 'ReturnQuantity',
		SUM(ReturnSubTotal) 'ReturnSubTotal', 
		SUM(ReturnHST) 'ReturnHST', 
		SUM(ReturnDiscount) 'ReturnDiscount', 
		SUM(ReturnTotalAmount) 'ReturnTotalAmount',
		SUM(ReturnAmount)'ReturnAmount'--+ SUM(ReturnDiscount) 'ReturnAmount'
FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		 WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount',
		ISNULL(vwTxnItm.ReturnQuantity, 0) 'ReturnQuantity',
		ISNULL(vwTxnItm.ReturnSubTotal, 0) 'ReturnSubTotal',
		ISNULL(vwTxnItm.ReturnDiscountAmount, 0) 'ReturnDiscount',
		ISNULL(vwTxnItm.ReturnTax, 0) 'ReturnHST',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) 'ReturnTotalAmount',
		ISNULL(vwTxnItm.ReturnTotalAmount, 0) - ISNULL(vwTxnItm.ReturnTax, 0)+ISNULL(vwTxnItm.ReturnDiscountAmount,0) 'ReturnAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) > 2)
) CreRet
GROUP BY BillingTransactionItemId,
ServDeptName
  )
  ----end of CreditReturnedCTE
  ----start of CreditReceivedCTE
  ,
  IncomeSegCreditReceivedCTE
  AS (SELECT BillingTransactionItemId,
		ServDeptName,
		CASE WHEN SUM(PaidQuantity) = SUM(UnpaidQuantity) THEN SUM(PaidQuantity)
			 WHEN SUM(PaidQuantity) < SUM(UnpaidQuantity) THEN SUM(UnpaidQuantity)
			 ELSE 0 END 'Quantity',
		CASE WHEN SUM(PaidSubTotal) = SUM(UnpaidSubTotal) THEN SUM(PaidSubTotal) ELSE 0 END 'PaidSubTotal',
		CASE WHEN SUM(PaidDiscount) = SUM(UnpaidDiscount) THEN SUM(PaidDiscount) ELSE 0 END 'PaidDiscount',
		CASE WHEN SUM(PaidHST) = SUM(UnpaidHST) THEN SUM(PaidHST) ELSE 0 END 'PaidHST',
		CASE WHEN SUM(PaidTotalAmount) = SUM(UnpaidTotalAmount) THEN SUM(PaidTotalAmount) ELSE 0 END 'PaidTotalAmount',
		CASE WHEN SUM(PaidSubTotal) < SUM(UnpaidSubTotal) THEN SUM(UnpaidSubTotal) ELSE 0 END  'UnpaidSubTotal',
		CASE WHEN SUM(PaidDiscount) < SUM(UnpaidDiscount) THEN SUM(UnpaidDiscount) ELSE 0 END 'UnpaidDiscount',
		CASE WHEN SUM(PaidHST) < SUM(UnpaidHST) THEN SUM(UnpaidHST) ELSE 0 END 'UnpaidHST',
		CASE WHEN SUM(PaidTotalAmount) < SUM(UnpaidTotalAmount) THEN SUM(UnpaidTotalAmount) ELSE 0 END 'UnpaidTotalAmount'
 FROM (
	SELECT
		vwTxnItm.BillingDate 'Date',
		BillingTransactionItemId,
		sd.ServiceDepartmentName,
		itms.ItemName,
		CASE
		WHEN (sd.ServiceDepartmentName = 'MISCELLANEOUS' AND itms.ItemName = 'NEBULIZOR CHARGES (PER DAY)' OR
        itms.ItemName = 'OXYGEN THERAPY (PER HOUR)') THEN 'Hospital Other Charges'
		when (sd.ServiceDepartmentName='Biochemistry' ) 
       OR(sd.ServiceDepartmentName='HEMATOLOGY' )
       OR(sd.ServiceDepartmentName='ATOMIC ABSORTION') 
       OR(sd.ServiceDepartmentName='CLNICAL PATHOLOGY' )
       OR(sd.ServiceDepartmentName='CYTOLOGY'  )
       OR(sd.ServiceDepartmentName='KIDNEY BIOPSY'  )
       OR(sd.ServiceDepartmentName='SKIN BIOPSY'  )
       OR(sd.ServiceDepartmentName='CONJUNCTIVAL BIOPSY' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB-3' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 1' )
	   OR(sd.ServiceDepartmentName='EXTERNAL LAB - 2'  )
	   OR(sd.ServiceDepartmentName='HISTOPATHOLOGY'  )
	   OR(sd.ServiceDepartmentName='IMMUNOHISTROCHEMISTRY'  )
	   OR(sd.ServiceDepartmentName='MOLECULAR DIAGNOSTICS'  )
	   OR(sd.ServiceDepartmentName='SPECIALISED BIOPHYSICS ASSAYS'  )
	   OR(sd.ServiceDepartmentName='SEROLOGY'  )
	   OR(sd.ServiceDepartmentName='LABORATORY'  )
	   OR(sd.ServiceDepartmentName='LAB CHARGES')
	   OR(sd.ServiceDepartmentName='MICROBIOLOGY')
    then 'PATHOLOGY'
	WHEN(sd.ServiceDepartmentName='OT') then ('OPERATION CHARGES')
		  WHEN(sd.ServiceDepartmentName='MISCELLENOUS CHARGES') OR (sd.ServiceDepartmentName='MISCELLANEOUS') then ('Hospital Other Charges')
		  ELSE sd.ServiceDepartmentName
		END AS 'ServDeptName',
		ISNULL(vwTxnItm.PaidQuantity, 0) 'PaidQuantity',
		ISNULL(vwTxnItm.PaidSubTotal, 0) 'PaidSubTotal',
		ISNULL(vwTxnItm.PaidDiscountAmount, 0) 'PaidDiscount',
		ISNULL(vwTxnItm.PaidTax, 0) 'PaidHST',
		ISNULL(vwTxnItm.PaidTotalAmount, 0) 'PaidTotalAmount',
		ISNULL(vwTxnItm.UnpaidQuantity, 0) 'UnpaidQuantity',
		ISNULL(vwTxnItm.UnpaidSubTotal, 0)  'UnpaidSubTotal',
		ISNULL(vwTxnItm.UnpaidDiscountAmount, 0) 'UnpaidDiscount',
		ISNULL(vwTxnItm.UnpaidTax, 0) 'UnpaidHST',
		ISNULL(vwTxnItm.UnpaidTotalAmount, 0) 'UnpaidTotalAmount'
	  FROM BIL_MST_ServiceDepartment sd,
		   BIL_CFG_BillItemPrice itms,
		   [VW_BIL_TxnItemsInfo_Income_Segregation] vwTxnItm
	  WHERE vwTxnItm.BillingDate BETWEEN CONVERT(date, @FromDate) AND CONVERT(date, @ToDate)
		AND vwTxnItm.ServiceDepartmentId = sd.ServiceDepartmentId
		AND vwTxnItm.ItemId = itms.ItemId
		AND sd.ServiceDepartmentId = itms.ServiceDepartmentId
		AND BillingTransactionItemId IN (
			SELECT
				BillingTransactionItemId
			FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
			WHERE BillStatus = 'unpaid' OR BillStatus = 'paid'
				AND BillingTransactionItemId NOT IN (
					SELECT
						BillingTransactionItemId
					FROM [VW_BIL_TxnItemsInfo_Income_Segregation]
					GROUP BY BillingTransactionItemId
					HAVING COUNT(BillingTransactionItemId) > 2)
			GROUP BY BillingTransactionItemId
			HAVING COUNT(BillingTransactionItemId) = 2)
) creRec
GROUP BY BillingTransactionItemId, ServDeptName
)
  ----end of CreditReceivedCTE



  SELECT
    --CONVERT(date, @FromDate) 'FromDate',
    --CONVERT(date, @ToDate) 'ToDate',
    ServDeptName,
	SUM(Quantity)-SUM(ReturnQuantity) 'Unit',
    SUM(PaidSubTotal) 'CashSales',
    --ROUND(SUM(PaidHST), 2) AS 'PaidHST',
    SUM(PaidDiscount) 'CashDiscount',
    SUM(UnpaidSubTotal) 'CreditSales',
    --ROUND(SUM(UnpaidHST), 2) AS 'UnpaidHST',
	SUM(UnpaidDiscount) 'CreditDiscount',
	SUM(ReturnQuantity) 'ReturnQuantity',
    SUM(ReturnAmount) 'ReturnAmount',
    --SUM(ReturnHST) 'ReturnHST',
    SUM(ReturnDiscount) 'ReturnDiscount',
    --SUM(CancelAmount) 'CancelAmount',
    --SUM(CancelHST) 'CancelHST',
    --SUM(CancelDiscount) 'CancelDiscount',
	SUM(PaidSubTotal)+SUM(UnpaidSubTotal)-SUM(ReturnAmount) 'GrossSales',
	SUM(PaidDiscount)+ SUM(UnpaidDiscount)- SUM(ReturnDiscount) 'Discount',
    SUM(PaidTotalAmount) + SUM(UnpaidTotalAmount) - SUM(ReturnTotalAmount) - SUM(CancelTotalAmount) 'NetSales'
	
    --SUM(PaidSubTotal) + SUM(UnpaidSubTotal) - SUM(ReturnSubTotal) - SUM(CancelSubTotal) 'AccPrice',
	--SUM(PaidDiscount) + SUM(UnpaidDiscount) - SUM(ReturnDiscount) - SUM(CancelDiscount) 'AccDiscount'
    --ROUND(SUM(PaidHST) + SUM(UnpaidHST) - SUM(ReturnHST) - SUM(CancelHST), 2) 'AccHST'

  FROM (
		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnQuantity) 'ReturnQuantity',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			SUM(CancelSubTotal) 'CancelSubTotal',
			SUM(CancelDiscount) 'CancelDiscount',
			SUM(CancelHST) 'CancelHST',
			SUM(CancelTotalAmount) 'CancelTotalAmount',
			SUM(CancelAmount) 'CancelAmount'
		FROM IncomeSegCTE
		GROUP BY ServDeptName
		

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			SUM(ReturnQuantity) 'ReturnQuantity',
			SUM(ReturnSubTotal) 'ReturnSubTotal',
			SUM(ReturnDiscount) 'ReturnDiscount',
			SUM(ReturnHST) 'ReturnHST',
			SUM(ReturnTotalAmount) 'ReturnTotalAmount',
			SUM(ReturnAmount) 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReturnedCTE
		GROUP BY ServDeptName

	UNION ALL

		SELECT
			ServDeptName,
			SUM(Quantity) 'Quantity',
			SUM(PaidSubTotal) 'PaidSubTotal',
			SUM(PaidDiscount) 'PaidDiscount',
			SUM(PaidHST) 'PaidHST',
			SUM(PaidTotalAmount) 'PaidTotalAmount',
			SUM(UnpaidSubTotal) 'UnpaidSubTotal',
			SUM(UnpaidDiscount) 'UnpaidDiscount',
			SUM(UnpaidHST) 'UnpaidHST',
			SUM(UnpaidTotalAmount) 'UnpaidTotalAmount',
			0 'ReturnQuantity',
			0 'ReturnSubTotal',
			0 'ReturnDiscount',
			0 'ReturnHST',
			0 'ReturnTotalAmount',
			0 'ReturnAmount',
			0 'CancelSubTotal',
			0 'CancelDiscount',
			0 'CancelHST',
			0 'CancelTotalAmount',
			0 'CancelAmount'
		FROM IncomeSegCreditReceivedCTE
		GROUP BY ServDeptName
) x1 
group by ServDeptName
having (SUM(x1.Quantity)-SUM(x1.ReturnQuantity) )>0 or
SUM(x1.PaidSubTotal) >0 or
SUM(x1.UnpaidSubTotal) >0 or
SUM(x1.ReturnAmount) >0 or
SUM(x1.ReturnQuantity) >0
END
GO

---END: NageshBB: 09-12-2018 : Income Segregation Report sp changes , fixed 0 values record bug and credit amount mismatch

---START: NageshBB:12-12-2018: Income segregation report sp changed, fixed issues

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[SP_Report_BIL_IncomeSegregation]
	--SP_Report_BIL_IncomeSegregation '2018-12-09','2018-12-09' 
@FromDate Date=null ,
@ToDate Date=null	
AS
/*
FileName: [SP_Report_BIL_IncomeSegregation]
CreatedBy/date: Dinesh/2018-0-03
Description: to get the income head of different department and sales related data
Remarks:    
Change History
--------------------------------------------------------------------------------
S.No.    UpdatedBy/Date				Remarks
---------------------------------------------------------------------------------
1.		Ramavtar/23Sep'18			initial draft
2		Dinesh / 24th Sep'18		Manakamana hospital requirement changes
3.		Ramavar/24Sep'18			corrected report 
4.		Dinesh/29Nov'18				customizing for Hams Hospital
5.		Nagesh/09Dec'18				changes for remove 0 values record and Credit Amount mismatch
6.		Nagesh/12Dec'18				totally changed code of sp, here i'm removed all old logic and code
								    because it was 400 line query and not showing correct result for provisional -> Credit Bill
									here we are using View and Function (VW_BIL_TxnItemsInfoWithDateSeparation,FN_BIL_GetSrvDeptReportingName)
-------------------------------------------------------------------------------
*/
BEGIN
 ;
  WITH IncomeSegCTE As (
--Cash Sale  which has paidDate, here paid date as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,PaidDate as BillingDate,Quantity as Unit, SubTotal as CashSales,DiscountAmount as CashDiscount,0 as CreditSales,0 as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where PaidDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and PaidDate is not null
),
 IncomeSegCreditCTE
  AS(
--Credit Sale, which has CreditDate, here CreditDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,CreditDate as BillingDate,Quantity as Unit, 0 as CashSales,0 as CashDiscount,SubTotal as CreditSales,DiscountAmount as CreditDiscount, 0 as ReturnQuantity, 0 as ReturnAmount, 0 as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where CreditDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and CreditDate is not null
),
 IncomeSegCreditReturnedCTE
  AS(
--Return Sale, which has Return Date, here ReturnDate as BillingDate
select [dbo].[FN_BIL_GetSrvDeptReportingName](ServiceDepartmentName,ItemName) as ServDeptName
,ReturnDate as BillingDate,0 as Unit, 0 as CashSales,0 as CashDiscount,0 as CreditSales,0 as CreditDiscount, Quantity as ReturnQuantity, SubTotal as ReturnAmount, DiscountAmount as ReturnDiscount
from VW_BIL_TxnItemsInfoWithDateSeparation where ReturnDate between  CONVERT(date, @FromDate) AND CONVERT(date, @ToDate) and ReturnDate is not null
)SELECT   
    ServDeptName,
	SUM(Unit)-SUM(ReturnQuantity) 'Unit',
    SUM(CashSales) 'CashSales',   
    SUM(CashDiscount) 'CashDiscount',
    SUM(CreditSales) 'CreditSales',    
	SUM(CreditDiscount) 'CreditDiscount',
	SUM(ReturnQuantity) 'ReturnQuantity',
    SUM(ReturnAmount) 'ReturnAmount',   
    SUM(ReturnDiscount) 'ReturnDiscount',  
	SUM(CashSales)+SUM(CreditSales)-SUM(ReturnAmount) 'GrossSales'--,
	,(SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount) 'Discount'
   , ((sum(CashSales)+sum(CreditSales)-sum(ReturnAmount))) - ((SUM(CashDiscount)+ SUM(CreditDiscount))- SUM(ReturnDiscount))  'NetSales'	    
  FROM (select *from IncomeSegCTE union all select *from IncomeSegCreditCTE union all select *from IncomeSegCreditReturnedCTE)
  x1 group by ServDeptName
  End
  Go

---END: NageshBB:12-12-2018: Income segregation report sp changed, fixed issues

--START: Ajay: 12-Dec-2018: DailyMISReport SP, [FN_BIL_GetTxnItemsInfoWithDateSeparation] and [VW_BIL_TxnItemsInfoWithDateSeparation] change

---View VW_BIL_TxnItemsInfoWithDateSeparation
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
 4.		Ramavtar/06Dec			alter		change in ProvisionalDate case statements
 5.		Ajay/12Dec'18			alter		getting payment mode
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
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
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
	 txn.PaymentMode as 'PaymentMode',
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

--Function FN_BIL_GetTxnItemsInfoWithDateSeparation
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
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
 7.		 Ajay/12Dec'18			getting payment mode
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
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
				BillingType, 
				RequestingDeptId,
				PaymentMode,
					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
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

--SP SP_Report_BILL_DailyMISReport
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
3		Ajay/2018-12-12			getting data for SummaryView
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
	ISNULL(bil.BillingType,'OutPatient')
	 AS BillingType
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

--OPD----
--select provider,OPDCount and TotalAmount
SELECT
		ISNULL(bil.ProviderId,0) 'ProviderId',
		ISNULL(bil.ProviderName,'NoDoctor') 'ProviderName',
		COUNT(DISTINCT bil.PatientId) 'Count',
		SUM(bil.TotalAmount) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation](@FromDate,@ToDate) bil
	WHERE bil.ItemName LIKE '%Consultation%' AND bil.BillStatus != 'return' AND (bil.PaymentMode != 'credit' OR bil.CreditDate IS NOT NULL)
	GROUP BY bil.ProviderId, bil.ProviderName
	ORDER BY 2

--Health Card----
SELECT
		ItemName as 'ItemName',
		Count (Quantity) 'Count',
		SUM(TotalAmount) 'TotalAmount' 
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation]  (@FromDate,@ToDate) bil
	WHERE ItemName LIKE '%Health Card%' AND bil.BillStatus != 'return' AND (bil.PaymentMode != 'credit' OR bil.CreditDate IS NOT NULL)
	GROUP BY ItemName

--LAB--
select  
	VisitType ,-------VisitType
	ai.ServiceDepartmentName,-----ServiceDepartmentName
	sum(count) 'Count',-----------Count
	sum([TotalAmount]) 'TotalAmount'--TotalAmount
	from (select 
		case when bt.visitType = 'inpatient' then 'IPD'
			when bt.visitType= 'outpatient' then 'OPD'
		ELSE bt.VisitType END AS VisitType,---VisitType

		fn.ServiceDepartmentName,

		Count(fn.Quantity)'Count',--Count
		SUM(fn.TotalAmount)'TotalAmount' --Total Amount

		from FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
		inner join BIL_TXN_BillingTransactionItems bt on fn.BillingTransactionItemId = bt.BillingTransactionItemId
		inner join BIL_MST_ServiceDepartment sd on bt.ServiceDepartmentId = sd.ServiceDepartmentId
		where sd.IntegrationName = 'LAB' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
		group by bt.VisitType,fn.ServiceDepartmentName
		) ai
	group by ai.ServiceDepartmentName,VisitType
UNION ALL
select
		' ' ,
		'Total',
		Count(Quantity)'Total Count',
		SUM(TotalAmount) 
	from FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn 
	inner join BIL_MST_ServiceDepartment sd on fn.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'LAB' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	order by VisitType

--Radiology--
select 
		case when bt.visitType = 'inpatient' then 'IPD'
			when bt.visitType= 'outpatient' then 'OPD'
		ELSE bt.VisitType END AS VisitType,
		fn.ServiceDepartmentName,
		Count(fn.Quantity)'Count',
		SUM(fn.TotalAmount)'TotalAmount'
	from FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn 
	inner join BIL_TXN_BillingTransactionItems bt on fn.BillingTransactionItemId = bt.BillingTransactionItemId
	inner join BIL_MST_ServiceDepartment sd on bt.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'Radiology' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	group by bt.VisitType,fn.ServiceDepartmentName
UNION ALL
select
		' ' ,
		'Total',
		Count(fn.Quantity)'Total Count',
		SUM(fn.TotalAmount)
	from FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
	inner join BIL_MST_ServiceDepartment sd on fn.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'Radiology' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	order by VisitType

--Health Clinic--
select
		x.ItemName,
		Sum(Quantity) 'Unit',
		Sum(TotalAmount) 'TotalAmount'
		from (SELECT
			case when fn.ItemName like '%ECHO%' then 'ECHO'
				when fn.ItemName like '%TMT%' then 'TMT'
				when fn.ItemName like '%ECG%' then 'ECG'
				when fn.ItemName like '%Holter%' then 'Holter'
			ELSE 'Unknown' END as ItemName ,
			SUM(ISNULL(fn.Quantity, 0))  'Quantity',
			SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
		FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
		WHERE fn.BillStatus != 'return' and fn.BillStatus!='provisional'
		group by fn.ItemName
		)as x
	where x.ItemName !='Unknown'
	group by x.ItemName

--OT--
select
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		Count (fn.Quantity) 'Quantity',
		SUM(fn.TotalAmount) 'TotalAmount'
	from FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
	inner join EMP_Employee emp on fn.ProviderId=emp.EmployeeId
	inner join MST_Department dept on emp.DepartmentId=dept.DepartmentId
	where fn.ItemName like '%operation%' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	group by fn.ProviderId, fn.ProviderName, dept.DepartmentName, fn.ItemName, fn.ServiceDepartmentName

--Labor--
select 
		x.ItemName,
		Sum(Quantity) 'Unit',
		Sum(TotalAmount) 'TotalAmount' 
		from (SELECT
				case  when fn.ItemName like '%labor%' then 'LABOR Normal'
					when fn.ItemName like '%LSCS%' then 'LABOR LSCS'
				ELSE 'Unknown' END as ItemName ,
				SUM(ISNULL(fn.Quantity, 0))  'Quantity',
				SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
			FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
			WHERE fn.BillStatus != 'return' and fn.BillStatus!='provisional'
			group by fn.ItemName
			)as x
	where x.ItemName !='Unknown'
	group by x.ItemName
	
--IPD--
--count of Admitted, Discharged Patient
SELECT  
		'No. of Admitted Patient' as 'PatientType' ,
		 COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date,AdmissionDate) BETWEEN @FromDate AND @ToDate AND DischargeDate IS NULL
UNION ALL
SELECT 
		'No. of Discharged Patient',
		COUNT(patientAdmissionId) 
	FROM ADT_PatientAdmission
	WHERE CONVERT(date,DischargeDate) BETWEEN @FromDate AND @ToDate AND DischargeDate IS NOT NULL

--rest other servicedepartments count and income list--
select 
	x.ItemName,
	Sum(Quantity) 'Unit',
	Sum(TotalAmount) 'TotalAmount' 
	from (SELECT
			case when fn.ItemName like '%ECHO%' then 'ECHO'
				when fn.ItemName like '%TMT%' then 'TMT'
				when fn.ItemName like '%ECG%' then 'ECG'
				when fn.ItemName like '%Holter%' then 'Holter'
				when fn.ItemName like '%CONSULTATION%' then 'OPD'
				when fn.ItemName like '%Health Card%' then 'Health Card'
				when sd.IntegrationName like 'LAB' then 'LABS'
				when sd.IntegrationName like 'RADIOLOGY' then 'RADIOLOGY'
				when fn.ItemName like '%Operation%' then 'OPERATION CHARGES'
			ELSE 'Hospital Other Charges' END as ItemName,
			SUM(ISNULL(fn.Quantity, 0))  'Quantity',
			SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
		FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
		inner join BIL_MST_ServiceDepartment sd on sd.ServiceDepartmentId= fn.ServiceDepartmentId
		WHERE  fn.BillStatus != 'return' and fn.BillStatus!='provisional'
		group by fn.ItemName,sd.IntegrationName
		)as x
	group by x.ItemName
	UNION ALL
	-----To deduct return amount from the previous days 
	select 
		'Earlier Return Amount' 'Item Name',
		' 'as ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
		 from (select
					Distinct(ret.BillReturnId),
					ret.TotalAmount
				from (select
						br.CreatedOn 'Ret Date',
						bt.ItemName,
						bt.Quantity 'Unit',
						bt.PaidDate 'PaidDate',
						br.BillReturnId 'BillReturnId',
						br.TotalAmount 'TotalAmount' 
					from BIL_TXN_InvoiceReturn br inner join BIL_TXN_BillingTransactionItems bt on br.BillingTransactionId=bt.BillingTransactionId 
					where convert(date,br.createdon) between @FromDate and @ToDate and convert(date,bt.CreatedOn) !=convert(date,br.CreatedOn) 
					)ret
				)sum
		UNION ALL
		select 
			'Advance Received' as 'ItemName',
			' ',
			ISNULL(SUM(Amount),0) 'Total Amount'
			from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='Deposit'
	UNION ALL
		select 
			'Advance Settled' as 'ItemName',
			' ',
			ISNULL(-SUM(Amount),0) 
		from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='depositdeduct' 
	UNION ALL
		select 
			'Advance Returned' as 'ItemName',
			' ',
			-ISNULL(SUM(Amount),0)
		from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='ReturnDeposit' 

--Pharmacy--
select 
		'OPD' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where inv.IsOutdoorPat=1 and (inv.IsReturn!=1 or inv.IsReturn IS NULL) 
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
union all
select 
		'IPD' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where (inv.IsOutdoorPat=0 or inv.IsOutdoorPat is NULL) and (inv.IsReturn!=1 or inv.IsReturn IS NULL)
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
union all
select 
		'Total' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where (inv.IsReturn!=1 or inv.IsReturn IS NULL)
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
END
GO
--END: Ajay: 12-Dec-2018: DailyMISReport SP, [FN_BIL_GetTxnItemsInfoWithDateSeparation] and [VW_BIL_TxnItemsInfoWithDateSeparation] change
---START: ramavtar 13Dec'18	alter of PatientCensus reportSP, vwtable and fn ---
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
 4.		Ramavtar/06Dec			alter		change in ProvisionalDate case statements
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
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
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
	 txn.PaymentMode as 'PaymentMode',
	 txnItm.VisitType AS 'VisitType',
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
 4.      Dinesh/10Sept'18		passing itemname along with srvDeptName to the function
 5.      Dinesh/14Sept'18		added Provisional amount for doctor summary report
 6.		 Ramavtar/12Nov'18		getting providerName from employee table
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
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
				BillingType, 
				RequestingDeptId,
				PaymentMode,
				VisitType,
					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
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

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author/Date:		RAMAVTAR/03Aug2018
-- Description:		report shows doctor-department wise income and patient's count
-- =============================================
ALTER PROCEDURE [dbo].[SP_Report_BILL_PatientCensus] -- [SP_Report_BILL_PatientCensus] '2018-12-04','2018-12-04'
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL,
	@ProviderId int = NULL
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
5.		ramavtar/05Oct'18		getting provider name from employee table instead of txn table
6.		ramavtar/03Dec'18		revamp of SP -> as per new requirement
7.		ramavtar/05Dec'18		filter more case of paid/credit bills
8.		ramavtar/13Dec'18		taking quantity
----------------------------------------------------------
*/
BEGIN
	SELECT 
		tbl.Provider,
		tbl.ServiceDepartmentName,
		tbl.totC1,
		tbl.retC1,
		tbl.totA1,
		tbl.retA1,
		tbl.totC2,
		tbl.totA2,
		tbl.totC3,
		tbl.retC3,
		tbl.totA3,
		tbl.retA3,
		(tbl.totC1 - tbl.retC1) + (tbl.totC3 - tbl.retC3) AS 'totTC',
		(tbl.totA1 - tbl.retA1) + (tbl.totA3 - tbl.retA3) AS 'totTA' 
	FROM (
	SELECT 
		ISNULL(fn.ProviderName,'NoDoctor') AS 'Provider',
		fn.ServiceDepartmentName,
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.Quantity
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NULL THEN fn.Quantity
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.Quantity
				ELSE 0
			END) AS 'totC1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.Quantity ELSE 0
			END) AS 'retC1',
		SUM(CASE 
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'paid' AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.PaidAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'credit' THEN fn.CreditAmount
				WHEN vm.ProvisionalDate IS NULL AND fn.BillStatus = 'return' AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA1',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA1',
		SUM(CASE
				WHEN fn.BillStatus = 'provisional' THEN fn.Quantity
				ELSE 0
			END) AS 'totC2',
		SUM(CASE 
				WHEN fn.BillStatus = 'provisional' THEN fn.ProvisionalAmount 
				ELSE 0 
			END) AS 'totA2',
		SUM(CASE 
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.Quantity
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.Quantity
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL))  THEN fn.Quantity
				ELSE 0
			END) AS 'totC3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL
				THEN fn.Quantity ELSE 0 
			END) AS 'retC3',
		SUM(CASE
				WHEN fn.BillStatus = 'paid' AND vm.ProvisionalDate IS NOT NULL AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL) THEN fn.PaidAmount
				WHEN fn.BillStatus = 'credit' AND vm.ProvisionalDate IS NOT NULL THEN fn.CreditAmount
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL AND ((fn.PaymentMode = 'credit' AND fn.CreditDate IS NOT NULL) OR (fn.PaymentMode != 'credit' AND fn.PaidDate IS NOT NULL)) THEN fn.ReturnAmount
				ELSE 0
			END) AS 'totA3',
		SUM(CASE
				WHEN fn.BillStatus = 'return' AND vm.ProvisionalDate IS NOT NULL THEN fn.ReturnAmount
				ELSE 0
			END) AS 'retA3'
		--,
		--SUM(CASE
		--		WHEN fn.BillStatus = 'paid' OR fn.BillStatus = 'credit' THEN 1 ELSE 0 
		--	END) AS 'totTC',
		--SUM(CASE 
		--		WHEN fn.BillStatus = 'paid' THEN fn.PaidAmount
		--		WHEN fn.BillStatus = 'credit' THEN fn.CreditAmount
		--		ELSE 0
		--	END) AS 'totTA'
	FROM FN_BIL_GetTxnItemsInfoWithDateSeparation(@FromDate,@ToDate) fn
	JOIN VW_BIL_TxnItemsInfoWithDateSeparation vm ON fn.BillingTransactionItemId = vm.BillingTransactionItemId
	WHERE ISNULL(@ProviderId,ISNULL(fn.ProviderId,0)) = ISNULL(fn.ProviderId,0)
	GROUP BY fn.ProviderName,fn.ServiceDepartmentName
	--ORDER BY 1,2
	) tbl
	order by tbl.Provider,tbl.ServiceDepartmentName

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
---END: ramavtar 13Dec'18	alter of PatientCensus reportSP, vwtable and fn ---


--START: Ajay 14 Dec 2018 changes for DailyMISReport

--created FN_BIL_GetSrvDeptReportingName_MIS_Report, FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report, VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report
--altered sp of DailyMISReport
--[FN_BIL_GetSrvDeptReportingName_MIS_Report]
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_BIL_GetSrvDeptReportingName_MIS_Report] (@ServiceDeptName Varchar(200),@ItemName Varchar(200))
RETURNS Varchar(200)

/*
 File: [FN_BIL_GetSrvDeptReportingName_MIS_Report]  Created: 14Dec2018
 Description: created for Daily MIS report reffered from FN_BIL_GetSrvDeptReporingName
 Change History:
 -------------------------------------------------------------------------------
 S.No      ModifiedBy/Date                     Remarks
 -------------------------------------------------------------------------------
 1.       Ajay/14-12-2018					created the script
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

--[VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report]
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report]
  AS
/*
 FileName    : [VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report]
 Description : 
 -------------------------------------------------------------------------
 Change History
 -------------------------------------------------------------------------
 S.No.    Date/User              Change          Remarks
 -------------------------------------------------------------------------
 1.     14Dec18 Ajay			created		reffered from [VW_BIL_TxnItemsInfoWithDateSeparation]
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
  CASE 
	WHEN txnItm.BillStatus = 'provisional' 
		THEN Convert(DATE, txnItm.CreatedOn) 
	WHEN (txnItm.BillStatus='cancel' AND Convert(Date,txnItm.CreatedOn) != Convert(Date,txnItm.CancelledOn) )
		THEN Convert(DATE,txnItm.CreatedOn)
	WHEN (txnItm.BillingTransactionId IS NOT NULL
			AND ( 
					(txn.PaymentMode != 'credit' AND CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn))
				OR  (txnItm.BillStatus='unpaid' AND  CONVERT(Date,txnItm.CreatedOn) !=  COnvert(Date,txn.CreatedOn)) 
				OR  (txnItm.BillStatus='paid' and  CONVERT(Date,txnItm.CreatedOn) !=  CONVERT(Date,txnItm.PaidDate) AND txn.PaymentMode != 'credit')
				OR (txnItm.BillStatus = 'paid' AND CONVERT(date,txnItm.CreatedOn) != CONVERT(date,txn.CreatedOn) AND txn.PaymentMode = 'credit')	--ramavtar:06Dec'18	checking paymentMode!='credit'
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
	 txn.PaymentMode as 'PaymentMode',
	 txnItm.VisitType AS 'VisitType',
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

--[FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report] 
(@StartDate DATE, @EndDate DATE)
RETURNS TABLE
/*
 File: [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
 Created: 14Dec 2018
 Description: created for Daily MIS report reffered from FN_BIL_GetTxnItemsInfoWithDateSeparation

 ------------Change History------------
 S.No.   ModifiedBy/Date         Remarks
 ----------------------------------------
 1.      Ajay/14Dec2018			Created the script
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
				[dbo].[FN_BIL_GetSrvDeptReportingName_MIS_Report] (itmInfo.ServiceDepartmentName,itmInfo.ItemName) AS ServiceDepartmentName,
				ProviderId,
				CASE WHEN ProviderId IS NOT NULL
					THEN emp.Salutation + '. ' + emp.FirstName + ' ' + ISNULL(emp.MiddleName + ' ','') + emp.LastName
					ELSE NULL 
				END AS ProviderName,
				BillingType, 
				RequestingDeptId,
				PaymentMode,
				VisitType,
					CASE WHEN ProvisionalDate BETWEEN @StartDate AND @EndDate THEN ProvisionalDate ELSE NULL END AS ProvisionalDate,
					CASE WHEN CancelledDate BETWEEN @StartDate AND @EndDate THEN CancelledDate ELSE NULL END AS CancelledDate,
					CASE WHEN CreditDate BETWEEN @StartDate AND @EndDate THEN CreditDate ELSE NULL END AS CreditDate,
					CASE WHEN PaidDate BETWEEN @StartDate AND @EndDate THEN PaidDate ELSE NULL END AS PaidDate,
					CASE WHEN ReturnDate BETWEEN @StartDate AND @EndDate THEN ReturnDate ELSE NULL END AS ReturnDate
				FROM [dbo].[VW_BIL_TxnItemsInfoWithDateSeparation_MIS_Report] itmInfo
					LEFT JOIN [dbo].[EMP_Employee] emp ON itmInfo.ProviderId = emp.EmployeeId
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


--[SP_Report_BILL_DailyMISReport]
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
3		Ajay/2018-12-12			getting data for SummaryView
4		Ajay/2018-12-14			getting data from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]
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
	ISNULL(bil.BillingType,'OutPatient')
	 AS BillingType
FROM (Select * from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report]  (@FromDate,@ToDate)) bil
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

--OPD----
--select provider,OPDCount and TotalAmount
SELECT
		ISNULL(bil.ProviderId,0) 'ProviderId',
		ISNULL(bil.ProviderName,'NoDoctor') 'ProviderName',
		COUNT(DISTINCT bil.PatientId) 'Count',
		SUM(bil.TotalAmount) 'TotalAmount'
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) bil
	WHERE bil.ItemName LIKE '%Consultation%' AND bil.BillStatus != 'return' AND (bil.PaymentMode != 'credit' OR bil.CreditDate IS NOT NULL)
	GROUP BY bil.ProviderId, bil.ProviderName
	ORDER BY 2

--Health Card----
SELECT
		ItemName as 'ItemName',
		Count (Quantity) 'Count',
		SUM(TotalAmount) 'TotalAmount' 
	FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report] (@FromDate,@ToDate) bil
	WHERE ItemName LIKE '%Health Card%' AND bil.BillStatus != 'return' AND (bil.PaymentMode != 'credit' OR bil.CreditDate IS NOT NULL)
	GROUP BY ItemName

--LAB--
select  
	VisitType ,-------VisitType
	ai.ServiceDepartmentName,-----ServiceDepartmentName
	sum(count) 'Count',-----------Count
	sum([TotalAmount]) 'TotalAmount'--TotalAmount
	from (select 
		case when bt.visitType = 'inpatient' then 'IPD'
			when bt.visitType= 'outpatient' then 'OPD'
		ELSE bt.VisitType END AS VisitType,---VisitType

		fn.ServiceDepartmentName,

		Count(fn.Quantity)'Count',--Count
		SUM(fn.TotalAmount)'TotalAmount' --Total Amount

		from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
		inner join BIL_TXN_BillingTransactionItems bt on fn.BillingTransactionItemId = bt.BillingTransactionItemId
		inner join BIL_MST_ServiceDepartment sd on bt.ServiceDepartmentId = sd.ServiceDepartmentId
		where sd.IntegrationName = 'LAB' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
		group by bt.VisitType,fn.ServiceDepartmentName
		) ai
	group by ai.ServiceDepartmentName,VisitType
UNION ALL
select
		' ' ,
		'Total',
		Count(Quantity)'Total Count',
		SUM(TotalAmount) 
	from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn 
	inner join BIL_MST_ServiceDepartment sd on fn.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'LAB' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	order by VisitType

--Radiology--
select 
		case when bt.visitType = 'inpatient' then 'IPD'
			when bt.visitType= 'outpatient' then 'OPD'
		ELSE bt.VisitType END AS VisitType,
		bt.ServiceDepartmentName,
		Count(fn.Quantity)'Count',
		SUM(fn.TotalAmount)'TotalAmount'
	from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn 
	inner join BIL_TXN_BillingTransactionItems bt on fn.BillingTransactionItemId = bt.BillingTransactionItemId
	inner join BIL_MST_ServiceDepartment sd on bt.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'Radiology' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	group by bt.VisitType,bt.ServiceDepartmentName
UNION ALL
select
		' ' ,
		'Total',
		Count(fn.Quantity)'Total Count',
		SUM(fn.TotalAmount)
	from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
	inner join BIL_MST_ServiceDepartment sd on fn.ServiceDepartmentId = sd.ServiceDepartmentId
	where sd.IntegrationName = 'Radiology' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	order by VisitType

--Health Clinic--
select
		x.ItemName,
		Sum(Quantity) 'Unit',
		Sum(TotalAmount) 'TotalAmount'
		from (SELECT
			case when fn.ItemName like '%ECHO%' then 'ECHO'
				when fn.ItemName like '%TMT%' then 'TMT'
				when fn.ItemName like '%ECG%' then 'ECG'
				when fn.ItemName like '%Holter%' then 'Holter'
			ELSE 'Unknown' END as ItemName ,
			SUM(ISNULL(fn.Quantity, 0))  'Quantity',
			SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
		WHERE fn.BillStatus != 'return' and fn.BillStatus!='provisional'
		group by fn.ItemName
		)as x
	where x.ItemName !='Unknown'
	group by x.ItemName

--OT--
select
		fn.ProviderID,
		fn.ProviderName,
		dept.DepartmentName,
		fn.ItemName,
		Count (fn.Quantity) 'Quantity',
		SUM(fn.TotalAmount) 'TotalAmount'
	from [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
	inner join EMP_Employee emp on fn.ProviderId=emp.EmployeeId
	inner join MST_Department dept on emp.DepartmentId=dept.DepartmentId
	where fn.ItemName like '%operation%' and fn.BillStatus != 'return' and fn.BillStatus!='provisional'
	group by fn.ProviderId, fn.ProviderName, dept.DepartmentName, fn.ItemName, fn.ServiceDepartmentName

--Labor--
select 
		x.ItemName,
		Sum(Quantity) 'Unit',
		Sum(TotalAmount) 'TotalAmount' 
		from (SELECT
				case  when fn.ItemName like '%labor%' then 'LABOR Normal'
					when fn.ItemName like '%LSCS%' then 'LABOR LSCS'
				ELSE 'Unknown' END as ItemName ,
				SUM(ISNULL(fn.Quantity, 0))  'Quantity',
				SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
			FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
			WHERE fn.BillStatus != 'return' and fn.BillStatus!='provisional'
			group by fn.ItemName
			)as x
	where x.ItemName !='Unknown'
	group by x.ItemName
	
--IPD--
--count of Admitted, Discharged Patient
SELECT  
		'No. of Admitted Patient' as 'PatientType' ,
		 COUNT(patientAdmissionId) 'Count'
	FROM ADT_PatientAdmission
	WHERE CONVERT(date,AdmissionDate) BETWEEN @FromDate AND @ToDate AND DischargeDate IS NULL
UNION ALL
SELECT 
		'No. of Discharged Patient',
		COUNT(patientAdmissionId) 
	FROM ADT_PatientAdmission
	WHERE CONVERT(date,DischargeDate) BETWEEN @FromDate AND @ToDate AND DischargeDate IS NOT NULL

--rest other servicedepartments count and income list--
select 
	x.ItemName,
	Sum(Quantity) 'Unit',
	Sum(TotalAmount) 'TotalAmount' 
	from (SELECT
			case when fn.ItemName like '%ECHO%' then 'ECHO'
				when fn.ItemName like '%TMT%' then 'TMT'
				when fn.ItemName like '%ECG%' then 'ECG'
				when fn.ItemName like '%Holter%' then 'Holter'
				when fn.ItemName like '%CONSULTATION%' then 'OPD'
				when fn.ItemName like '%Health Card%' then 'Health Card'
				when sd.IntegrationName like 'LAB' then 'LABS'
				when sd.IntegrationName like 'RADIOLOGY' then 'RADIOLOGY'
				when fn.ItemName like '%Operation%' then 'OPERATION CHARGES'
			ELSE 'Hospital Other Charges' END as ItemName,
			SUM(ISNULL(fn.Quantity, 0))  'Quantity',
			SUM(ISNULL(fn.TotalAmount, 0)) 'TotalAmount'
		FROM [FN_BIL_GetTxnItemsInfoWithDateSeparation_MIS_Report](@FromDate,@ToDate) fn
		inner join BIL_MST_ServiceDepartment sd on sd.ServiceDepartmentId= fn.ServiceDepartmentId
		WHERE  fn.BillStatus != 'return' and fn.BillStatus!='provisional'  AND (fn.PaymentMode != 'credit' OR fn.CreditDate IS NOT NULL)
		group by fn.ItemName,sd.IntegrationName
		)as x
	group by x.ItemName
	UNION ALL
	-----To deduct return amount from the previous days 
	select 
		'Earlier Return Amount' 'Item Name',
		' 'as ' ',
		-SUM(sum.TotalAmount) 'Total Amount'
		 from (select
					Distinct(ret.BillReturnId),
					ret.TotalAmount
				from (select
						br.CreatedOn 'Ret Date',
						bt.ItemName,
						bt.Quantity 'Unit',
						bt.PaidDate 'PaidDate',
						br.BillReturnId 'BillReturnId',
						br.TotalAmount 'TotalAmount' 
					from BIL_TXN_InvoiceReturn br inner join BIL_TXN_BillingTransactionItems bt on br.BillingTransactionId=bt.BillingTransactionId 
					where convert(date,br.createdon) between @FromDate and @ToDate and convert(date,bt.CreatedOn) !=convert(date,br.CreatedOn) 
					)ret
				)sum
		UNION ALL
		select 
			'Advance Received' as 'ItemName',
			' ',
			ISNULL(SUM(Amount),0) 'Total Amount'
			from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='Deposit'
	UNION ALL
		select 
			'Advance Settled' as 'ItemName',
			' ',
			ISNULL(-SUM(Amount),0) 
		from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='depositdeduct' 
	UNION ALL
		select 
			'Advance Returned' as 'ItemName',
			' ',
			-ISNULL(SUM(Amount),0)
		from BIL_TXN_Deposit
		where convert(date,createdon) between @FromDate and @ToDate and DepositType='ReturnDeposit' 

--Pharmacy--
select 
		'OPD' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where inv.IsOutdoorPat=1 and (inv.IsReturn!=1 or inv.IsReturn IS NULL) 
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
union all
select 
		'IPD' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where (inv.IsOutdoorPat=0 or inv.IsOutdoorPat is NULL) and (inv.IsReturn!=1 or inv.IsReturn IS NULL)
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
union all
select 
		'Total' as Type,
		count(itm.Quantity) 'Quantity',
		sum(itm.TotalAmount) 'TotalAmount'
	from PHRM_TXN_Invoice inv inner join PHRM_TXN_InvoiceItems itm on inv.InvoiceId=itm.InvoiceId
	where (inv.IsReturn!=1 or inv.IsReturn IS NULL)
		and convert(date,inv.CreateOn) between @FromDate and @ToDate
END
GO

--END: Ajay 14 Dec 2018 changes for DailyMISReport

--START: Salakha 14 Dec 2018 changed strings credit to provisional
UPDATE PHRM_TXN_InvoiceItems
set BilItemStatus ='provisional'
where BilItemStatus ='credit'
go

update PHRM_StockTxnItems
set TransactionType ='provisionalsale'
where TransactionType ='Creditsale'
go

update PHRM_StockTxnItems
set TransactionType ='provisionalsalereturn'
where TransactionType ='creditsalereturn'
go
--END: Salakha 14 Dec 2018 changed strings credit to provisional


--START: VIKAS: 14Dec2018 - Created  stored procedure for daily stock value in pharmacy.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_Report_PHRM_Daily_StockValue]
AS
/*
*/
BEGIN
  Declare @Today date= Convert(date,getdate()) ,@StartDate datetime = Convert(date,getdate()-6)

  select d.Dates as 'Date',ISNULL(inv.Quantity,0) 'Quantity'
  from [FN_COMMON_GetAllDatesBetweenRange] (@StartDate,@Today) d
  LEFT JOIN   
	   (   select convert(date,createdOn) BillDate, Sum(isnull(Quantity,0)) Quantity
			from PHRM_StockTxnItems
			where InOut='out'
			group by convert(date,createdOn)
			
	  ) inv
ON d.Dates = inv.BillDate
  order by d.Dates DESC
End--end of SP
GO
--END: VIKAS: 14Dec2018 - Created  stored procedure for daily stock value in pharmacy.
