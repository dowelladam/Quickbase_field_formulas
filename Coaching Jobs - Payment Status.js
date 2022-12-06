// Part 1: Checking Certifications

// Certifications record the date the certificate was earned. Certificates are generally good for two years. But the Coaching Agreement only lasts one school year and the Coaches Meeting happens once/season. Coaches are eligible for payment if their certs are complete right now OR if their certs were complete as of the season due date. Some positions that require certifications do not require attendance at a coaches meeting.

var number currentSy = If(Month(Today())<=7, Year(Today()), Month(Today())>=8, Year(Today())+1);
var number seasonCertsDeadlineSy = If(Month([season - Certifications Due])<=7, Year([season - Certifications Due]), Month([season - Certifications Due])>=8, Year([season - Certifications Due])+1);
var number coachesAgreementSy = ToNumber(Right([Coaches Agreement], 2)) + 2000;

var bool allCertsNow = If(
  [Requires Coaches Meeting?] = true and IsNull([Coaches Meeting]), false,
  [Coaches Agreement] = "", false,
  IsNull([CPR/AED Certification]), false,
  IsNull([Concussion Training]), false,
  IsNull([DCIAA Coaches Test]), false,
  IsNull([Fingerprint Clearance (most recent)]), false,
  IsNull([Heat Acclimatization]), false,
  [Fingerprint Clearance (most recent)] < (Today()-Days(365*2)), false,
  [DCIAA Coaches Test] < (Today()-Days(365*2)), false,
  [Concussion Training] < (Today()-Days(365*2)), false,
  $coachesAgreementSy != $currentSy, false,
  [CPR/AED Certification] < (Today()-Days(365*2)), false,
  [Heat Acclimatization] < (Today()-Days(365*2)), false,
  true
);

var bool allCertsByDeadline = If(
  [Requires Coaches Meeting?] = true and IsNull([Coaches Meeting]), false,
  IsNull([CPR/AED Certification]), false,
  [Coaches Agreement] = "", false,
  IsNull([Concussion Training]), false,
  IsNull([DCIAA Coaches Test]), false,
  IsNull([Fingerprint Clearance (most recent)]), false,
  IsNull([Heat Acclimatization]), false,
  [Fingerprint Clearance (most recent)] + Days(365*2) <= [season - Certifications Due], false,
  [DCIAA Coaches Test] + Days(365*2) <= [season - Certifications Due], false,
  [Concussion Training] + Days(365*2) <= [season - Certifications Due], false,
  $coachesAgreementSy < $seasonCertsDeadlineSy, false,
  [CPR/AED Certification] + Days(365*2) <= [season - Certifications Due], false,
  [Heat Acclimatization] + Days(365*2) <= [season - Certifications Due], false,
  true
);



// Part 2 (current): Checking Financial Paperwork

// Applies to jobs in FY20 (SY19-20) and later. Starting in FY20, ADs uploaded a PDF pay packet. Previously, they emailed files to a DCIAA staff member who logged their receipt as individual date fields in Quickbase.

var bool readyForReview = If(
  [Pay Forms]!="" and [Pay Forms Ready for Review?]=true, true,
  false
);

var bool approved = If(
  [Pay Forms]!="" and [Pay Forms Approved By]!="" and not IsNull([Pay Forms Approved Date]), true,
  false
);



// Part 2 (old): Checking Financial Paperwork

// Applies to jobs from FY19 (SY18-19) and earlier. Coaches must complete different types of paperwork depending on the way they are paid (stipend, extra-duty, or hourly) and their role (coach, advisor, or support). 7 of the 9 combinations that are actually in use are specified below and given their own logic. Advisors work with students but do not lead teams (ex. Athletic Directors, strength and conditioning coaches). Support personnel fill roles like photographer, doctor, event worker, etc.

var text employeePositionComboType = If(
	[Payment Method]="Extra-Duty" and [Requires Certifications?]=true and [Requires Coaches Meeting?]=true,
    "DCPScoach",
  [Payment Method]="Extra-Duty" and [Requires Certifications?]=true and [Requires Coaches Meeting?]=false,
    "DCPSadvisor",
  [Payment Method]="Extra-Duty" and [Requires Certifications?]=false and [Requires Coaches Meeting?]=false,
    "DCPSsupport",
  [Payment Method]="Stipend" and [Requires Certifications?]=true and [Requires Coaches Meeting?]=true,
    "nonDCPScoach",
  [Payment Method]="Stipend" and [Requires Certifications?]=true and [Requires Coaches Meeting?]=false,
    "nonDCPSadvisor",
  [Payment Method]="Stipend" and [Requires Certifications?]=false and [Requires Coaches Meeting?]=false,
    "nonDCPSsupport",
  [Payment Method]="Overtime" and [Requires Certifications?]=false and [Requires Coaches Meeting?]=false,
    "hourlysupport"
);

var bool DCPScoachPaperworkComplete = If(
  IsNull([Participants Roster - RETIRED]), false,
  IsNull([Extra-Duty Authorization - RETIRED]), false,
  IsNull([Payroll Registration - RETIRED]), false,
  true
);

var bool DCPSadvisorPaperworkComplete = If(
  IsNull([Extra-Duty Authorization - RETIRED]), false,
  IsNull([Payroll Registration - RETIRED]), false,
  true
);

var bool DCPSsupportPaperworkComplete = If(
  IsNull([Invoice - RETIRED]), false,
  IsNull([W-9 - RETIRED]), false,
  true
);

var bool nonDCPScoachPaperworkComplete = If(
  IsNull([Extra-Duty Authorization - RETIRED]), false,
  IsNull([Participants Roster - RETIRED]), false,
  IsNull([Form A - RETIRED]), false,
  IsNull([Form B - RETIRED]), false,
  IsNull([W-9 - RETIRED]), false,
  true
);

var bool nonDCPSadvisorPaperworkComplete = If(
  IsNull([Extra-Duty Authorization - RETIRED]), false,
  IsNull([Form A - RETIRED]), false,
  IsNull([Form B - RETIRED]), false,
  IsNull([W-9 - RETIRED]), false,
  true
);

var bool nonDCPSsupportPaperworkComplete = If(
  IsNull([W-9 - RETIRED]), false,
  IsNull([Invoice - RETIRED]), false,
  true
);

var bool hourlyDCPSsupportPaperworkComplete = If(
  IsNull([Overtime Pay Request - RETIRED]), false,
  true
);

// Now we'll put it all together and evaluate if the coach has all their finacial paperwork
var bool allPaperwork = If(
  $employeePositionComboType = "DCPScoach" and $DCPScoachPaperworkComplete = true, true,
  $employeePositionComboType = "DCPSadvisor" and $DCPSadvisorPaperworkComplete = true, true,
  $employeePositionComboType = "DCPSsupport" and $DCPSsupportPaperworkComplete = true, true,
  $employeePositionComboType = "nonDCPScoach" and $nonDCPScoachPaperworkComplete = true, true,
  $employeePositionComboType = "nonDCPSadvisor" and $nonDCPSadvisorPaperworkComplete = true, true,
  $employeePositionComboType = "nonDCPSsupport" and $nonDCPSsupportPaperworkComplete = true, true,
  $employeePositionComboType = "hourlyDCPSsupport" and $hourlyDCPSsupportPaperworkComplete = true, true,
  false
);



// Part 3: Sent to OCFO

var bool sentToOCFO = If(IsNull([Submitted to OCFO]), false, true);



// Part 4: Final Composition

var text status = If(
  [Position Name] = "Volunteer coach", "6 - Volunteer",
  [Denied Payment?] = true, "5 - Denied Payment",
  $sentToOCFO = true, "4 - Submitted to OCFO",
  [Requires Certifications?] = true and $allCertsNow = false and $allCertsByDeadline = false,
    "1 - Missing Coaching Certifications",
  ToNumber([Fiscal Year (expected)])<2020 and $allPaperwork = false, "2 - Missing Pay Forms",
  ToNumber([Fiscal Year (expected)])>=2020 and $readyForReview = false and $approved=false, "2 - Missing Pay Forms",
  ToNumber([Fiscal Year (expected)])>=2020 and $readyForReview = true and $approved=false, "2 - Ready for Review",
  $sentToOCFO = false, "3 - Needs Submitted to OCFO",
  "Error"
);

$status
