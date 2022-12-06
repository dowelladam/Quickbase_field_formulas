// determine if coachesAgreement is valid
var number currentSy = If(Month(Today())<=7, Year(Today()), Month(Today())>=8, Year(Today())+1);
var number futureSy = If(Month(Today())<=7, Year(Today())+1, Month(Today())>=8, Year(Today())+2);
var number seasonCertsDeadlineSy = If(Month([season - Certifications Due])<=7, Year([season - Certifications Due]), Month([season - Certifications Due])>=8, Year([season - Certifications Due])+1);
var number coachesAgreementSy = ToNumber(Right([Coaches Agreement], 2)) + 2000;

// Coach clearance rules
var bool clearedCoach =
If(IsNull([CPR/AED Certification]) or [CPR/AED Certification]<(Today()-Days(730)), false,
   [Coaches Agreement] = "" or ($coachesAgreementSy != $currentSy and $coachesAgreementSy != $futureSy), false,
   IsNull([Concussion Training]) or [Concussion Training]<(Today()-Days(730)), false,
   IsNull([DCIAA Coaches Test]) or [DCIAA Coaches Test]<(Today()-Days(730)), false,
   IsNull([Fingerprint Clearance (most recent)]) or [Fingerprint Clearance (most recent)]<(Today()-Days(730)), false,
   IsNull([Heat Acclimatization]) or [Heat Acclimatization]<(Today()-Days(730)), false,
   IsNull([Coaches Meeting]), false,
   true);

// AD clearance rules -- same as coaches but don't need to attend a coaches meeting
var bool clearedAD =
If(IsNull([CPR/AED Certification]) or [CPR/AED Certification]<(Today()-Days(730)), false,
  [Coaches Agreement] = "" or   $coachesAgreementSy != $currentSy, false,
  IsNull([Concussion Training]) or [Concussion Training]<(Today()-Days(730)), false,
  IsNull([DCIAA Coaches Test]) or [DCIAA Coaches Test]<(Today()-Days(730)), false,
  IsNull([Fingerprint Clearance (most recent)]) or [Fingerprint Clearance (most recent)]<(Today()-Days(730)), false,
  IsNull([Heat Acclimatization]) or [Heat Acclimatization]<(Today()-Days(730)), false,
  true);

var text status =
If( [Coaches Reference Field - Override - Overall]=true and [Coaches Reference Field - Override - Overall - Expiration Date]>=Today(), "banned",
    [Position - Role] = "Athletic Director" and $clearedAD = true, "cleared",
    [Position - Role] = "Athletic Director" and $clearedAD = false, "not cleared",
    [Position - Role] = "Head" and $clearedCoach = true, "cleared",
    [Position - Role] = "Head" and $clearedCoach = false, "not cleared",
    [Position - Role] = "Assistant" and $clearedCoach = true, "cleared",
    [Position - Role] = "Assistant" and $clearedCoach = false, "not cleared",
    [Position - Role] = "Volunteer" and $clearedCoach = true, "cleared",
    [Position - Role] = "Volunteer" and $clearedCoach = false, "not cleared",
    "NA");

If(
  $status = "banned",
  "<div style=font-weight:bold;color:#a10000;>" & "Not cleared to coach - DCIAA Decision" & "</div>",
  $status = "not cleared",
  "<div style=font-weight:bold;color:#e60000;>" & "Not cleared to coach" & "</div>",
  $status = "cleared",
  "<div style=color:#009900;font-weight:bold;>" & "Cleared to coach" & "</div>",
  $status = "NA",
  "<div style=font-weight:bold;color:#7a7a7a;>" & "NA" & "</div>",
  "<div style=font-weight:bold;color:#7a7a7a;>" & "Error" & "</div>"
)
