from fastapi import APIRouter
from app.models.schemas import PRRequest, PRPathway

router = APIRouter(prefix="/pr", tags=["PR"])

PR_DATA = {
    "us": {
        "visa_path":"F-1 Student → OPT/STEM OPT → H-1B → EB-2/EB-3 Green Card",
        "post_study":{"cs":3,"engineering":3,"medicine":1,"business":1,"nursing":1,"law":1,"psychology":1,"education":1,"arts":1,"english":1},
        "post_study_grad":{"cs":3,"engineering":3,"medicine":1,"business":1,"nursing":1,"law":1,"psychology":1,"education":1,"arts":1,"english":1},
        "lottery":True,
        "timeline":{"in":"10-30+ yrs","cn":"10-20+ yrs","ph":"5-10 yrs","ng":"5-10 yrs","br":"3-6 yrs","other":"3-7 yrs"},
        "ease":{"in":28,"cn":35,"ph":55,"ng":60,"br":65,"other":62},
        "ease_grad":{"in":32,"cn":40,"ph":58,"ng":63,"br":68,"other":65},
        "top_majors":["cs","engineering","nursing"],
        "min_salary":"$60,000+","residency":"5 yrs as Green Card holder","citizenship":"5 yrs after Green Card",
        "notes":"H-1B lottery is 85K/yr cap. EB-2 National Interest Waiver available for graduate degree holders. India EB-2 backlog still very long.",
        "notes_grad":"Masters/PhD holders may qualify for EB-2 NIW (National Interest Waiver) which skips employer sponsorship. Still subject to per-country caps.",
    },
    "uk": {
        "visa_path":"Student Visa → Graduate Visa (2yr) → Skilled Worker → ILR",
        "post_study":{m:2 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "post_study_grad":{m:3 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "lottery":False,
        "timeline":{o:"5-6 yrs" for o in ["in","cn","ph","ng","br","other"]},
        "ease":{"in":70,"cn":70,"ph":72,"ng":65,"br":72,"other":72},
        "ease_grad":{"in":76,"cn":76,"ph":78,"ng":71,"br":78,"other":78},
        "top_majors":["nursing","engineering","cs"],
        "min_salary":"£26,200+","residency":"5 yrs UK residence","citizenship":"1 yr after ILR",
        "notes":"Graduate Visa gives 2yr work rights after bachelor's graduation. No lottery.",
        "notes_grad":"PhD graduates get 3yr Graduate Visa instead of 2yr. Masters holders get 2yr. Global Talent Visa available for exceptional graduates.",
    },
    "de": {
        "visa_path":"Student Visa → Job Seeker Visa (18mo) → Work Permit → Settlement Permit",
        "post_study":{m:1.5 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "post_study_grad":{m:1.5 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "lottery":False,
        "timeline":{o:"4-5 yrs" for o in ["in","cn","ph","ng","br","other"]},
        "ease":{"in":78,"cn":78,"ph":80,"ng":75,"br":80,"other":80},
        "ease_grad":{"in":83,"cn":83,"ph":85,"ng":80,"br":85,"other":85},
        "top_majors":["engineering","cs","medicine"],
        "min_salary":"€45,552","residency":"4 yrs permanent residence","citizenship":"3-5 yrs",
        "notes":"No quota or lottery. 18-month job seeker visa after graduation. 2024 citizenship reform allows 3yr naturalisation.",
        "notes_grad":"Masters/PhD holders often qualify for accelerated Blue Card (EU work permit for graduates). Higher salary threshold but much faster path.",
    },
    "au": {
        "visa_path":"Student Visa → Graduate Visa (2-6yr) → Skilled Independent (189) → PR",
        "post_study":{"cs":4,"engineering":4,"medicine":4,"business":2,"nursing":4,"law":2,"psychology":2,"education":4,"arts":2,"english":2},
        "post_study_grad":{"cs":4,"engineering":4,"medicine":4,"business":3,"nursing":4,"law":3,"psychology":3,"education":4,"arts":3,"english":3},
        "lottery":False,
        "timeline":{o:"2-4 yrs" for o in ["in","cn","ph","ng","br","other"]},
        "ease":{"in":82,"cn":80,"ph":83,"ng":78,"br":83,"other":83},
        "ease_grad":{"in":85,"cn":83,"ph":86,"ng":81,"br":86,"other":86},
        "top_majors":["nursing","engineering","education"],
        "min_salary":"A$73,150","residency":"2 yrs as PR","citizenship":"4 yrs total residence",
        "notes":"Points-based SkillSelect system. Graduate Visa 2-6yr depending on study region.",
        "notes_grad":"Masters/PhD holders receive additional points in SkillSelect (5 extra for Masters, 10 for PhD). Significantly faster pathway to 189 visa invitation.",
    },
    "in": {
        "visa_path":"Student Visa → OCI Card (Indian origin only) or Long-Term Visa",
        "post_study":{m:1 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "post_study_grad":{m:1 for m in ["cs","engineering","medicine","business","nursing","law","psychology","education","arts","english"]},
        "lottery":False,
        "timeline":{"in":"N/A","cn":"5-10 yrs (rare)","ph":"5-10 yrs (rare)","ng":"5-10 yrs (rare)","br":"5-10 yrs (rare)","other":"5-10 yrs (rare)"},
        "ease":{"in":100,"cn":25,"ph":25,"ng":25,"br":25,"other":25},
        "ease_grad":{"in":100,"cn":28,"ph":28,"ng":28,"br":28,"other":28},
        "top_majors":["cs","engineering","medicine"],
        "min_salary":"₹4,00,000+","residency":"Very limited for foreigners","citizenship":"Not available to most foreigners",
        "notes":"India has very limited permanent residency for foreign nationals. Most international graduates leave after their degree. OCI card only for people of Indian origin.",
        "notes_grad":"Same as undergraduate — India does not have a structured PR pathway for most foreign nationals regardless of degree level.",
    },
}

def ease_label(s):
    if s >= 75: return "EASY"
    if s >= 50: return "MODERATE"
    return "HARD"

@router.post("/pathways", response_model=list[PRPathway])
def pr_pathways(req: PRRequest):
    results = []
    is_grad = req.degree_level == "graduate"

    for code in req.countries:
        pr = PR_DATA[code]
        ease_key     = "ease_grad" if is_grad else "ease"
        post_key     = "post_study_grad" if is_grad else "post_study"
        notes_key    = "notes_grad" if is_grad and "notes_grad" in pr else "notes"

        ease     = pr[ease_key].get(req.origin, pr[ease_key].get("other", 60))
        timeline = pr["timeline"].get(req.origin, pr["timeline"].get("other", "N/A"))
        post     = pr[post_key].get(req.major, 2)
        notes    = pr.get(notes_key, pr["notes"])

        results.append(PRPathway(
            country=code,
            visa_path=pr["visa_path"],
            post_study_work_years=post,
            pr_timeline=timeline if timeline else "N/A",
            has_lottery=pr["lottery"],
            min_salary=pr["min_salary"],
            residency_req=pr["residency"],
            citizenship=pr["citizenship"],
            ease_score=ease,
            ease_label=ease_label(ease),
            is_priority_major=req.major in pr["top_majors"],
            notes=notes,
        ))
    return results
