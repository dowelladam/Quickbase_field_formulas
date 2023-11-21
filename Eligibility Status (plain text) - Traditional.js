////////////////////////// Age

// Chooses August 1st of the current year based on current date
var text recentAugust = "August 1, " & (If(Month(Today())>=8, Year(Today()), Month(Today())<=7, Year(Today())-1));

// Calculates the age of a student as of correct August 1st date.
var number age = Floor((Year(ToDate($recentAugust))-Year([Date of Birth])-1)+
If(Month(ToDate($recentAugust))>Month([Date of Birth]),1,0)+
If(Month(ToDate($recentAugust))=Month([Date of Birth]) and Day(ToDate($recentAugust))>=Day([Date of Birth]),1,0));

// Determines eligibility under age rule
// HS must be <=18. MS must be <=14. OL must be between 16-22. ES must be in grades 4-5
var bool ageOverride = If([Override - Age] = true and [Override - Age - Expiration]>=Today(), true, false);

var bool ageEligibilityHS = If($ageOverride=true or $age<=18, true, false);
var bool ageEligibilityMS = If($ageOverride=true or $age<=14, true, false);
var bool ageEligibilityES = If($ageOverride=true or [Grade]="4" or [Grade]="5", true, false);
var bool ageEligibilityOL = If(
  $ageOverride=true, true,
  $age>=16 and $age<=22, true,
  false);




////////////////////// Semesters

// Converts SYs to an actual year (ex. SY2016-17 --> 2017)
var number firstNinthSy = ToNumber(Right([First Ninth Grade Year], 2)) + 2000;
var number firstSixthSy = ToNumber(Right([First Sixth Grade Year], 2)) + 2000;
var number currentSy = If(Month(Today())<=7, Year(Today()), Month(Today())>=8, Year(Today())+1);
var number nextSy = $currentSy + 1;

// Calculates the number of years in HS or MS as a proxy for number of semesters.
// Assumes continuous enrollment from beginning of First 6th/9th grade year. If this assumption is not true, the student will need a manual override
var number yearsHS = $currentSy - $firstNinthSy + 1;
var number yearsMS = $currentSy - $firstSixthSy + 1;

// Determines age & semesters eligibility
// MS kids are assumed eligible if they're <=13. MS students age=14 must be hand-verified
// The overall status field will catch MS kids that are age=14 for closer review
var bool semesterOverride = If(
  [Override - Semesters] = true and [Override - Semesters - Expiration Date]>=Today(), true,
  false);

var bool semesterEligibilityHS = If(
  $semesterOverride=true or $yearsHS<=4, true,
  false);
var text semesterEligibilityMS = If(
  $semesterOverride=true or $age<=13, "eligible",
  $yearsMS>=4, "ineligible",
  "requires hand verification");




//////////////////// Academics

// Determines which term's grades should be evaluated based on the current date.
// Values below are based mark entry deadlines for SY23-24
// QB generally looks at a new term 10 school days after the end-of-term date
// Term 4 = Jul 1 - Nov 26
// Term 1 = Nov 27 - Feb 10
// Term 2 = Feb 11 - Apr 27
// Term 3 = Apr 28 - Jun 30
var text currentTerm = If(
  Month(Today())=7 or Month(Today())=8 or Month(Today())=9 or Month(Today())=10 or Month(Today())=11 and Day(Today())<=26, "Term 4",
  Month(Today())=11 and Day(Today())>=27 or Month(Today())=12 or Month(Today())=1 or Month(Today())=2 and Day(Today())<=10, "Term 1",
  Month(Today())=2 and Day(Today())>=11 or Month(Today())=3  or Month(Today())=4 and Day(Today())<=27, "Term 2",
  Month(Today())=4 and Day(Today())>=28 or Month(Today())=5 or Month(Today())=6, "Term 3");

// Check for academic eligibility.
// HS: Students with a value of null/NA will be determined academically eligible. This is because Aspen typically does not calculate grades from prior schools into the GPA fields until after the student's first full term in DCPS. Any students in the beginning of their first year of HS will be determined academically eligible. This is also necessary in 2021-22 because students may have final term grades of only "P" which means that no GPA can be calculated, but the student should be academically eligible.
// MS: Students will determine by the numeric count fields of [# of Fs]. Students must have 1 of fewer F's to be academically eligible.
// OL: Students must have no F's on prior report card
// 20220818 update: academic eligibility is looking at the 'static' 2021-22 fields for Term 4 and Final Year GPA/# of F's. This is a temporary measure to allow Aspen/OCTO to continue experimenting with the datafeed to give us accurate GPA/grades data. The 'static' fields were uploaded from a csv of known correct values. This modification should be reversed after the feed is working. It must be corrected prior to mid-August 2023.


var bool gpaNullsInCurrentTerm = If(
  $currentTerm="Term 1" and IsNull([GPA - Term 1]), true,
  $currentTerm="Term 2" and IsNull([GPA - Term 2]), true,
  $currentTerm="Term 3" and IsNull([GPA - Term 3]), true,
  // 20220818 modification - changed IsNull to Nz because nulls aren't registering properly (I made a mistake of importing null values to 'static' fields on the 'Aspen students' table; because QB read an import, it doesn't actually consider the value to be null)
  $currentTerm="Term 4" and Nz([GPA - Term 4 - 2022-23 Static])=0, true,
  $currentTerm="Term 4" and Nz([GPA - Full Year - 2022-23 Static])=0, true,
  false);

var bool academicOverride = If(
  [Override - Grades]=true and [Override - Grades - Expiration Date]>=Today(), true
);

var bool academicEligibilityHS = If(
  $academicOverride=true, true,
  $currentTerm="Term 1" and [GPA - Term 1]>=2, true,
  $currentTerm="Term 2" and [GPA - Term 2]>=2, true,
  $currentTerm="Term 3" and [GPA - Term 3]>=2, true,
  $currentTerm="Term 4" and [GPA - Term 4 - 2022-23 Static]>=2, true,
  $currentTerm="Term 4" and [GPA - Full Year - 2022-23 Static]>=2, true,
  $currentTerm="Term 4" and $yearsHS=1, true,
  false);

var bool academicEligibilityMS = If(
  $academicOverride=true, true,
  $currentTerm="Term 1" and [# of Fs in Term 1]<=1, true,
  $currentTerm="Term 2" and [# of Fs in Term 2]<=1, true,
  $currentTerm="Term 3" and [# of Fs in Term 3]<=1, true,
  $currentTerm="Term 4" and [# of Fs in Term 4]<=1, true,
  $currentTerm="Term 4" and [# of Fs in Final Marks]<=1, true,
  false);

var bool academicEligibilityOL = If(
  $academicOverride=true, true,
  $currentTerm="Term 1" and [# of Fs in Term 1]=0, true,
  $currentTerm="Term 2" and [# of Fs in Term 2]=0, true,
  $currentTerm="Term 3" and [# of Fs in Term 3]=0, true,
  $currentTerm="Term 4" and [# of Fs in Term 4]=0, true,
  $currentTerm="Term 4" and [# of Fs in Final Marks]=0, true,
  false);





/////////////////////// Participation Forms

// Converts current date to a SY value that can be matched against what is entered in the [Consent Form - Valid School Year] field. Example: "October 10, 2018" becomes "2018-19". The SY transitions on Aug 1. This variable is different from the one called earlier in the script ($currentSy)
var text currentSYwithHyphen = If(
  Month(Today())>=8, Year(Today()) &"-" & Right(ToText(Year(AdjustYear(Today(),1))), 2),
  Month(Today())<=7, Year(AdjustYear(Today(),-1)) & "-" & Right(ToText(Year(Today())),2)
  );
var text nextSYwithHyphen = If(
  Month(Today())>=8, AdjustYear(Today(),1) &"-" & Right(ToText(Year(AdjustYear(Today(),2))), 2),
  Month(Today())<=7, Year(AdjustYear(Today(),0)) & "-" & Right(ToText(AdjustYear(Today(),1)),2)
  );

// Must have a UHC <1 year old and an uploaded Consent and Medical Packet with a valid school year value. Students can be eligible with a Consent Packet from a future school year. In practice, this allows students to be eligilbe under the current or future SY form from roughly May-July.
var bool paperworkOverride = If(
  [Override - Missing Paperwork]=true and [Override - Missing Paperwork - Expiration]>=Today(), true,
  false);

var bool participationForms = If(
  $paperworkOverride=true, true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$currentSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  [Consent and Medical Packet]<>"" and [Consent Packet - Valid School Year]=$nextSYwithHyphen and [UHC Form - Date of Exam]>=(Today()-Days(365)), true,
  false);





/////////////////////// Transfer

// Checks if supporting documents for a transfer waiver have been uploaded in last 365 days
var bool hasAllTransferForms = If(
  [Supporting Documentation]<>"" and [Supporting Documentation - Upload Date]>=(Today()-Days(366)), true,
  false);

// Checks if a student has an override
var bool transferOverride = If(
  [Override - Transfer Status]=true and [Override - Transfer Status - Expiration Date]>=Today(), true,
  false);

// Checks if a student is a transfer
var bool isTransferStudent = If(
  // meet requiremnt if not HS-age student
  [Competition Level] <> "HS", false,
  // meet requirement if DCIAA has given a manual waiver
  $transferOverride=true, false,
  // meet requirement if true freshman enrolled before Sept 1 of current year
  $yearsHS<=1 and [Date First Enrolled at Current School]< Date($currentSY - 1, 9, 1), false,
  // meet requirement if enrolled at school for at least one calendar year
  [Date First Enrolled at Current School]<(Today()-Days(365)), false,
  // meet requirement if enrolled before Sept 1 of previous school year (avoids kids needing to sit out for a few weeks in August)
  [Date First Enrolled at Current School]< Date($currentSY - 2, 8, 1), false,
  true
  );




//////////////////// Attendance

// Determines which term's grades should be evaluated based on the current date.
// Values below are based mark entry deadlines for SY23-24. QB looks at exact dates.
// THESE ARE DIFFERENT TERM DATES THAN WHAT'S USED FOR ACADEMIC ELIGIBILITY.
// Term 1 = Sep 1 - Nov 2
// Term 2 = Nov 3 - Jan 25
// Term 3 = Jan 26 - Apr 4
// Term 4 = Apr 5 - Jun 30
// Summer = Jul 1 - Aug 31
// attendance is not factored during summer months while we wait for ASPEN to rollover and feed us zero values for Term 1 of the new school year
var text currentTermForAttendance = If(
  Month(Today())=9 or Month(Today())=10 or Month(Today())=11 and Day(Today())<=2, "Term 1",
  Month(Today())=11 and Day(Today())>=3 or Month(Today())=12 or Month(Today())=1 and Day(Today())<=25, "Term 2",
  Month(Today())=1 and Day(Today())>=26 or Month(Today())=2  or Month(Today())=3 or Month(Today())=4 and Day(Today())<=4, "Term 3",
  Month(Today())=5 and Day(Today())>=10 or Month(Today())=5 or Month(Today())=3, "Term 4",
  Month(Today())=7 or Month(Today())=8 or Month(Today())=9, "Summer Term");


// Calculate attendnace eligibility. Students may have <=6 unexcused absences per term.
var bool attendanceOverride = If(
  [Override - Absences]=true and [Override - Absences - Expiration Date]>=Today(), true,
  false);

var bool attendanceEligibility = If(
  $attendanceOverride=true, true,
  $currentTermForAttendance="Term 1" and [Unexcused Absences - Term 1]<=6, true,
  $currentTermForAttendance="Term 2" and [Unexcused Absences - Term 2]<=6, true,
  $currentTermForAttendance="Term 3" and [Unexcused Absences - Term 3]<=6, true,
  $currentTermForAttendance="Term 4" and [Unexcused Absences - Term 4]<=6, true,
  $currentTermforAttendance="Summer Term", true,
  false);




/////////////////////// Overall Status (traditional rules)

var text overallES = If(
  // ineligible
  $ageEligibilityES = false, "Ineligible",  //really checking for grades 4-5, not age
  // eligible
  $participationForms = true and $ageEligibilityES = true, "Eligible",
  // Ready for AT Review
  $participationForms = false and [Paperwork Ready for Review] = true and $ageEligibilityES = true, "Ready for AT Review",
  // Missing Paperwork
  $participationForms = false and $ageEligibilityES = true, "Missing Paperwork",
  // anything unexpected throws error
  "Error"
);

var text overallMS = If(
  // age, grades, or semesters will automatically make ineligible
  $ageEligibilityMS = false or $academicEligibilityMS = false or $semesterEligibilityMS = "ineligible", "Ineligible",
  // everything required to be eligible
  $participationForms = true and $ageEligibilityMS = true and $academicEligibilityMS = true and $semesterEligibilityMS = "eligible", "Eligible",
  // intermediary statuses
  $ageEligibilityMS = true and $academicEligibilityMS = true and $semesterEligibilityMS = "requires hand verification", "Age 14 - Requires DCIAA Approval",
  $participationForms = false and [Paperwork Ready for Review] = true and $ageEligibilityMS = true and $academicEligibilityMS = true, "Ready for AT Review",
  $participationForms = false and $ageEligibilityMS = true and $academicEligibilityMS = true, "Missing Paperwork",
  // anything unexpected throws error
  "Error"
);

var text overallHS = If(
  // age, grades, semesters, or attendance will automatically make ineligible
  $ageEligibilityHS = false or $semesterEligibilityHS = false or $attendanceEligibility = false, "Ineligible",
  // everything required to be eligible for W22 onwards. 7 things: forms, grades, attendance, age, transfer status, semesters
  $ageEligibilityHS = true and $semesterEligibilityHS = true and $academicEligibilityHS = true and $participationForms = true and  $attendanceEligibility = true and $isTransferStudent = false, "Eligible",
  // transfer student - missing Paperwork
  $ageEligibilityHS = true and $semesterEligibilityHS = true and $academicEligibilityHS = true and $attendanceEligibility = true and $isTransferStudent = true and $hasAllTransferForms = false, "Transfer Student - Missing Paperwork",
  // transfer student - missing Paperwork
  $ageEligibilityHS = true and $semesterEligibilityHS = true and $gpaNullsInCurrentTerm = true and $attendanceEligibility = true and $isTransferStudent = true and $hasAllTransferForms = false, "Transfer Student - Missing Paperwork",
  // paperwork ready for review
  $participationForms = false and [Paperwork Ready for Review] = true and $academicEligibilityHS = true and $attendanceEligibility = true and $ageEligibilityHS = true and $semesterEligibilityHS = true, "Ready for AT Review",
  // missing paperwork
  $ageEligibilityHS = true and $academicEligibilityHS = true and $semesterEligibilityHS = true and $attendanceEligibility = true and $participationForms = false, "Missing Paperwork",
  // transfer student - ready for review
  $ageEligibilityHS = true and $academicEligibilityHS = true and $semesterEligibilityHS = true and $attendanceEligibility = true and $participationForms = true and $isTransferStudent = true and $hasAllTransferForms = true, "Transfer Student - On Track",
  // transfer student - ready for review
  $ageEligibilityHS = true and $gpaNullsInCurrentTerm = true and $semesterEligibilityHS = true and $attendanceEligibility = true and $participationForms = true and $isTransferStudent = true and $hasAllTransferForms = true, "Transfer Student - On Track",
  // ineligible - check transcript because of null GPA Values
  $gpaNullsInCurrentTerm = true, "Ineligible - Null GPA",
  // full Ineligible
  $ageEligibilityHS = false or $semesterEligibilityHS = false or $academicEligibilityHS = false or $attendanceEligibility = false, "Ineligible",
  // anything unexpected throws error
  "Error"
);



var text plaintextStatus = If(
  // overall overrides that Mike uses for DCSAA Review process
  [Override - Overall Eligibility]="Eligible" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Eligible",
  [Override - Overall Eligibility]="Ineligible - Denied by DCIAA" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Denied by DCIAA",
  [Override - Overall Eligibility]="Ineligible - Approved for Select Sports" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Approved for Select Sports",
  [Override - Overall Eligibility]="Ineligible - Denied by DCSAA" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Denied by DCSAA",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today() and [DCSAA Packet - Ready for Central Office Review]=true, "Ineligible - Ready for DCSAA Review",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today() and [DCSAA Packet - Date Emailed to OSSE]>=Today()-Days(60), "Ineligible - Under Review By DCSAA",
  [Override - Overall Eligibility]="Ineligible - Must Apply for DCSAA Waiver" and [Override - Overall Eligibility - Expiration Date]>=Today(), "Ineligible - Must Apply for DCSAA Waiver",
  // If no overrides on global eligibilty status, use the algorithic ones depending on grade level
  [Competition Level]="HS", $overallHS,
  [Competition Level]="MS", $overallMS,
  [Competition Level]="ES", $overallES,
  [Competition Level]="Error", "Error",
  // Throw an error if any unexpected situation occurs. The combinations of different eligibilty criteria should be handled by the $overallXX variables. But any unexpected combination will also cause an error.
  "Error"
);

$plaintextStatus