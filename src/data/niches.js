const HVAC_ELECTRICAL_TASKS = [
  { id: 'proposals',  label: 'Writing proposals and work orders by hand',      defaultHours: 5, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.65 },
  { id: 'scheduling', label: 'Scheduling and dispatching technicians',          defaultHours: 4, impact: 'High',   laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.55 },
  { id: 'invoices',   label: 'Generating invoices after job completion',        defaultHours: 3, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.80 },
  { id: 'followup',   label: 'Following up with past clients for maintenance',  defaultHours: 2, impact: 'High',   laborCategory: 'admin',      valueBucket: 'revenue_recovery', efficiencyFactor: 0.70 },
  { id: 'jobstatus',  label: 'Tracking job status across multiple crews',       defaultHours: 3, impact: 'Medium', laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.60 },
  { id: 'reports',    label: 'Compiling weekly/monthly reports for the owner',  defaultHours: 2, impact: 'Low',    laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.75 },
]

const LEGAL_TASKS = [
  { id: 'intake',      label: 'Drafting client intake documents',                 defaultHours: 4, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.65 },
  { id: 'summaries',   label: 'Writing case status summaries',                    defaultHours: 3, impact: 'Low',    laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.70 },
  { id: 'deadlines',   label: 'Tracking court filing deadlines',                  defaultHours: 2, impact: 'High',   laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.75 },
  { id: 'billing',     label: 'Generating billing summaries and invoices',        defaultHours: 3, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.80 },
  { id: 'docfollowup', label: 'Following up with clients on document requests',   defaultHours: 2, impact: 'High',   laborCategory: 'admin',      valueBucket: 'revenue_recovery', efficiencyFactor: 0.70 },
  { id: 'caseload',    label: 'Compiling weekly caseload reports',                defaultHours: 2, impact: 'Low',    laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.75 },
]

const GENERIC_TASKS = [
  { id: 'proposals',  label: 'Writing and sending proposals',   defaultHours: 4, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.65 },
  { id: 'invoices',   label: 'Generating invoices',             defaultHours: 3, impact: 'Medium', laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.80 },
  { id: 'scheduling', label: 'Scheduling and coordination',     defaultHours: 3, impact: 'High',   laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.55 },
  { id: 'followup',   label: 'Client follow-up and outreach',   defaultHours: 2, impact: 'High',   laborCategory: 'admin',      valueBucket: 'revenue_recovery', efficiencyFactor: 0.70 },
  { id: 'reporting',  label: 'Internal reporting',              defaultHours: 2, impact: 'Low',    laborCategory: 'operations',  valueBucket: 'operational',      efficiencyFactor: 0.75 },
  { id: 'filing',     label: 'Document filing and tracking',    defaultHours: 2, impact: 'Low',    laborCategory: 'admin',      valueBucket: 'operational',      efficiencyFactor: 0.70 },
]

const HVAC_ELECTRICAL_CAPABILITIES = [
  { title: 'Proposal and Work Order Automation',  tag: 'Operational Efficiency', description: 'Automatically draft proposals and work orders from job details, ready for staff review and approval in one click, eliminating manual document creation.' },
  { title: 'Scheduling and Dispatch Optimization', tag: 'Operational Efficiency', description: 'Match the right technician to the right job based on location, skill set, and availability, reducing drive time and maximizing jobs completed per day.' },
  { title: 'Automated Invoicing',                  tag: 'Operational Efficiency', description: 'Generate invoices automatically at job completion and send them without anyone on your team manually creating or chasing them.' },
  { title: 'Job Status Tracker',                   tag: 'Operational Efficiency', description: 'See every active job, crew assignment, and status update in one live view, without calling techs or checking multiple systems.' },
  { title: 'AI Owner Briefings',                   tag: 'Operational Efficiency', description: 'A daily or weekly summary delivered to your phone or email: overdue jobs, pending estimates, margin vs. last week, and anything that needs your attention, automatically generated from your live data.' },
  { title: 'Technician Profitability Dashboard',   tag: 'Revenue Intelligence',   description: 'See which technicians generate the most profit per hour worked, fully accounting for labor burden, callbacks, and parts, not just revenue.' },
  { title: 'Job Type Margin Analysis',             tag: 'Revenue Intelligence',   description: 'Understand which job types (installs, repairs, maintenance) are actually most profitable, broken down by business unit and technician.' },
  { title: 'Estimate Conversion Tracking',         tag: 'Revenue Intelligence',   description: 'Track how many estimates are sent, how long they sit, which close and which don\'t, and which technicians or job types convert best.' },
  { title: 'Maintenance Renewal Tracker',          tag: 'Revenue Intelligence',   description: 'Identify which service agreements are expiring, quantify the revenue at risk, and surface the right clients for follow-up automatically.' },
  { title: 'Automated Follow-Up Workflows',        tag: 'Revenue Intelligence',   description: 'Automatically contact past clients for maintenance reminders, estimate follow-ups, and seasonal outreach, without anyone on your team manually managing a list.' },
  { title: 'Missed Call Recovery',                 tag: 'Revenue Intelligence',   description: 'Capture after-hours and missed call information automatically, draft a follow-up response, and queue it for your team the next morning so no lead goes cold.' },
  { title: 'Callback and Warranty Tracking',       tag: 'Revenue Intelligence',   description: 'Track which completed jobs are generating callbacks or warranty claims, broken down by technician and job type, so you can identify and fix margin leaks.' },
  { title: '30/60/90 Capacity Forecast',           tag: 'Operational Efficiency', description: 'Combine your current pipeline, historical close rates, and crew availability to answer: can we take on more work next month?' },
  { title: 'Cross-System Reporting',               tag: 'Financial Clarity',      description: 'Pull your field service software and accounting platform into a single dashboard so your operational data and financial data tell the same story.' },
  { title: 'Lead Source Attribution',              tag: 'Financial Clarity',      description: 'Track which marketing channels, referral sources, and campaigns are actually producing closed jobs and revenue, not just calls.' },
  { title: 'AI Operations Assistant',              tag: 'Operational Efficiency', description: 'Ask plain-English questions about your business: which jobs are overdue, which clients haven\'t been contacted, what your margin was last month. Get instant answers from your live data.' },
  { title: 'Weekly Report Automation',             tag: 'Operational Efficiency', description: 'Automatically compile and deliver your weekly operational summary, pulling from your live data so no one has to manually build it.' },
  { title: 'Research Center',                      tag: 'Revenue Intelligence',   description: 'Automated monitoring of regulatory shifts, equipment recalls, and rebate or incentive changes, each tied to a specific account and a concrete dollar opportunity or compliance exposure so your team can act before the window closes.' },
]

const LEGAL_CAPABILITIES = [
  { title: 'Client Intake Automation',         tag: 'Operational Efficiency', description: 'Automatically generate intake documents and onboarding workflows from initial client information, ready for attorney review without manual drafting.' },
  { title: 'Caseload Intelligence Dashboard',  tag: 'Operational Efficiency', description: 'See all active matters, deadlines, and assigned staff in one live view, updated in real time from your practice management software.' },
  { title: 'Deadline and Compliance Tracker',  tag: 'Operational Efficiency', description: 'Centralize all court deadlines, filing requirements, and client commitments with automated alerts before anything is missed.' },
  { title: 'AI Owner Briefings',               tag: 'Operational Efficiency', description: 'A daily or weekly summary delivered to your phone or email: matters behind schedule, pending client responses, billing targets vs. actuals, automatically generated from your live data.' },
  { title: 'Automated Invoicing and Billing',  tag: 'Operational Efficiency', description: 'Generate billing summaries and invoices automatically at matter milestones, without anyone manually compiling time entries and drafting statements.' },
  { title: 'Weekly Report Automation',         tag: 'Operational Efficiency', description: 'Automatically compile and deliver your weekly caseload and billing summary, pulling from your practice management software so no one has to build it manually.' },
  { title: 'Billing Realization Tracker',      tag: 'Financial Clarity',      description: 'Understand which matters, practice areas, and attorneys are most profitable, billed hours versus collected revenue.' },
  { title: 'Client Follow-Up Automation',      tag: 'Revenue Intelligence',   description: 'Automatically surface clients who haven\'t been contacted recently, outstanding document requests, and upcoming renewal or filing deadlines.' },
  { title: 'Cross-System Reporting',           tag: 'Financial Clarity',      description: 'Reconcile your practice management software and accounting platform into one source of truth for revenue, receivables, and matter profitability.' },
  { title: 'AI Operations Assistant',          tag: 'Operational Efficiency', description: 'Ask plain-English questions about your caseload: which matters are behind, what is due this week, which clients have outstanding balances. Get instant answers from your live data.' },
  { title: 'Research Center',                  tag: 'Revenue Intelligence',   description: 'Automated monitoring of court rule, statutory, and compliance changes, each tied to a specific matter or client and a concrete opportunity or exposure so nothing surfaces too late to act on.' },
]

// Industry Intelligence / Research Center.
// Deliberately QUALITATIVE — framed as revenue opportunity and risk reduction,
// NOT recovered labor hours. Owners spend almost no time here today, which is
// exactly the gap. Never assigned a dollar figure or added to the financial
// projections; it sits alongside Revenue Recovery as a qualitative signal.
const INDUSTRY_INTELLIGENCE_HVAC = {
  badge: 'Revenue + Risk',
  headline: 'Industry changes you can act on before they pass you by',
  intro: 'Regulatory shifts, equipment recalls, rebate and incentive changes, and refrigerant-compliance rules each create both an obligation and a sales opportunity tied to your own accounts. Most owners have no system tracking these, so they surface late, or not at all.',
  items: [
    'Refrigerant and EPA compliance changes (e.g. R-410A phase-down, A2L transition) that create replacement and retrofit opportunities across your install base',
    'Manufacturer equipment recalls and safety notices tied to units you have already installed',
    'Rebate, tax-credit, and utility-incentive changes you can surface to the right customers while they still qualify',
    'Local code and licensing changes that affect how you bid, what you install, and what you are liable for',
  ],
  closing: 'The research center monitors these automatically and ties each one to a specific account and a dollar opportunity or compliance exposure, so your team can act in time rather than finding out after the window closes.',
}

const INDUSTRY_INTELLIGENCE_LEGAL = {
  badge: 'Revenue + Risk',
  headline: 'Rule and regulatory changes you can act on before they affect a matter',
  intro: 'Changes to court rules, filing requirements, statutes, and compliance obligations each create both risk and client-outreach opportunities. Most firms have no system surfacing these against their actual caseload, so they are caught reactively.',
  items: [
    'Court rule and filing-procedure changes that affect active matters and deadlines',
    'Statutory and regulatory changes relevant to your practice areas and existing clients',
    'Bar compliance, CLE, and licensing deadline changes that carry exposure if missed',
    'Developments that create a reason to proactively re-engage past or dormant clients',
  ],
  closing: 'The research center monitors these automatically and ties each one to a specific matter or client and a concrete opportunity or compliance exposure, so nothing surfaces too late to act on.',
}

const INDUSTRY_INTELLIGENCE_GENERIC = {
  badge: 'Revenue + Risk',
  headline: 'Industry changes you can act on before your competitors do',
  intro: 'Regulatory changes, recalls, and incentive or rebate changes each create both an obligation and a sales opportunity tied to your own accounts. Most owners have no system tracking these, so they surface late, or not at all.',
  items: [
    'Regulatory and compliance changes relevant to your industry and existing customers',
    'Product recalls and safety notices tied to what you have already sold or installed',
    'Rebate, tax-credit, and incentive changes you can surface to the right customers while they still qualify',
    'Licensing and code changes that affect how you operate and what you are liable for',
  ],
  closing: 'The research center monitors these automatically and ties each one to a specific account and a dollar opportunity or compliance exposure, so your team can act in time.',
}

export const INDUSTRY_INTELLIGENCE = {
  hvac:       INDUSTRY_INTELLIGENCE_HVAC,
  electrical: INDUSTRY_INTELLIGENCE_HVAC,
  legal:      INDUSTRY_INTELLIGENCE_LEGAL,
  other:      INDUSTRY_INTELLIGENCE_GENERIC,
}

export const NICHES = [
  { id: 'hvac',       label: 'HVAC Contractor',                    description: 'Heating, ventilation, and air conditioning services',  staffLabel: 'Number of field technicians' },
  { id: 'electrical', label: 'Commercial Electrical Contractor',    description: 'Commercial electrical installation and maintenance',   staffLabel: 'Number of field technicians' },
  { id: 'legal',      label: 'Legal Firm',                         description: 'Law firm or legal services practice',                  staffLabel: 'Number of billable attorneys' },
  { id: 'other',      label: 'Other',                              description: 'Enter your business type below',                       staffLabel: 'Number of billable staff'    },
]

export const TASK_LISTS = {
  hvac:       HVAC_ELECTRICAL_TASKS,
  electrical: HVAC_ELECTRICAL_TASKS,
  legal:      LEGAL_TASKS,
  other:      GENERIC_TASKS,
}

export const CAPABILITIES = {
  hvac:       HVAC_ELECTRICAL_CAPABILITIES,
  electrical: HVAC_ELECTRICAL_CAPABILITIES,
  legal:      LEGAL_CAPABILITIES,
  other:      HVAC_ELECTRICAL_CAPABILITIES,
}
