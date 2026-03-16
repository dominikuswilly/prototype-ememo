export const mockMemos = [
  {
    id: 1,
    title: "Q3 Marketing Campaign Proposal",
    description: "Overview and budget request for the upcoming Q3 product launch campaign across digital channels.",
    category: "Accounting & Finance",
    categoryType: "Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-",
    department: "Marketing",
    createdAt: "2026-03-10T09:00:00Z",
    requester: "John Doe",
    status: "Pending",
    isReminded: true,
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [
          { name: "Sarah Connor", role: "CMO", status: "Approved" }
        ]
      },
      {
        tier: 2,
        type: "single",
        status: "Pending",
        requiredApprovals: 1,
        approvers: [
          { name: "John Smith", role: "Finance Dir", status: "Pending" }
        ]
      }
    ],
    attachmentsCount: 3,
    memoNumber: "MKT-2026-089",
    history: [
      { at: "2026-03-10T09:00:00Z", action: "Created", user: "John Doe", note: "Initial request for Q3 marketing budget." },
      { at: "2026-03-10T11:30:00Z", action: "Approved Tier 1", user: "Sarah Connor", note: "Approved. Budget aligns with campaign goals." }
    ]
  },
  {
    id: 2,
    title: "Server Migration Schedule Update",
    description: "Revised timeline for migrating legacy databases to the new cloud infrastructure. Please review downtime windows.",
    category: "Operational",
    categoryType: "Infrastructure Change",
    department: "Engineering",
    createdAt: "2026-03-08T14:30:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [
          { name: "Alan Turing", role: "CTO", status: "Approved" }
        ]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "ENG-2026-042",
    history: [
      { at: "2026-03-08T14:30:00Z", action: "Created", user: "Willy", note: "Urgent migration plan." },
      { at: "2026-03-09T09:00:00Z", action: "Approved", user: "Alan Turing", note: "Migration windows confirmed with Ops." }
    ]
  },
  {
    id: 3,
    title: "New Employee Onboarding Policy",
    description: "Draft of the updated company-wide onboarding procedures for remote and hybrid employees.",
    category: "HRD",
    categoryType: "Pengangkatan/Pengajuan Karyawan (Staff)",
    department: "Engineering",
    createdAt: "2026-03-11T11:15:00Z",
    requester: "Willy",
    status: "Pending",
    isReminded: true,
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "Pending",
        requiredApprovals: 2,
        approvers: [
          { name: "Michael Scott", role: "Regional Manager", status: "Approved" },
          { name: "Toby Flenderson", role: "HR Lead", status: "Pending" },
          { name: "Pam Beesly", role: "Office Admin", status: "Pending" }
        ]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "HR-2026-015",
    history: [
      { at: "2026-03-11T11:15:00Z", action: "Created", user: "Willy", note: "Drafting new policy for Engineering." },
      { at: "2026-03-12T08:30:00Z", action: "Approved (Quorum)", user: "Michael Scott", note: "Looks good to me. Toby, please review." }
    ]
  },
  {
    id: 4,
    title: "Office Supplies Budget Cut",
    description: "Notification regarding the 15% reduction in departmental office supply budgets for Q4.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    department: "Operations",
    createdAt: "2026-03-05T16:45:00Z",
    requester: "Jim Halpert",
    status: "Rejected",
    rejectionConcern: "Budget / Finance",
    rejectionReason: "We cannot afford an additional 15% cut to the budget without affecting operations. Please revise.",
    rejectedFields: ["Title", "Description", "Amount"],
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Rejected",
        requiredApprovals: 1,
        approvers: [
          { name: "Dwight Schrute", role: "Assistant Regional Manager", status: "Rejected" }
        ]
      }
    ],
    attachmentsCount: 0,
    memoNumber: "OPS-2026-112",
    history: [
      { at: "2026-03-05T16:45:00Z", action: "Created", user: "Jim Halpert", note: "Requested 15% reduction." },
      { at: "2026-03-06T10:00:00Z", action: "Rejected", user: "Dwight Schrute", note: "OPERATIONS CANNOT BE COMPROMISED!" }
    ]
  },
  {
    id: 5,
    title: "Annual Security Audit Results",
    description: "Summary findings from the external security audit conducted last month. Action items required.",
    category: "Operational",
    categoryType: "Security Review",
    department: "IT Security",
    createdAt: "2026-03-01T10:00:00Z",
    requester: "Elliot Alderson",
    status: "Pending",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [
          { name: "Elliot Alderson", role: "Security Engineer", status: "Approved" }
        ]
      },
      {
        tier: 2,
        type: "quorum",
        status: "Pending",
        requiredApprovals: 1,
        approvers: [
          { name: "Willy", role: "VP Tech", status: "Pending" },
          { name: "Angela Moss", role: "SecOps", status: "Pending" }
        ]
      }
    ],
    attachmentsCount: 5,
    memoNumber: "SEC-2026-004",
    history: [
      { at: "2026-03-01T10:00:00Z", action: "Created", user: "Elliot Alderson", note: "Audit findings attached." },
      { at: "2026-03-01T10:05:00Z", action: "Approved Tier 1", user: "Elliot Alderson", note: "Self-approved primary tier." }
    ]
  },
  {
    id: 6,
    title: "Reimbursement for Client Dinner",
    description: "Reimbursement request for entertaining the E Corp executive team at Dorsia.",
    category: "Accounting & Finance",
    categoryType: "Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-",
    department: "Engineering",
    createdAt: "2026-03-09T20:15:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [
          { name: "Joanna Wellick", role: "Chief of Staff", status: "Approved" }
        ]
      },
      {
        tier: 2,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [
          { name: "Phillip Price", role: "CEO", status: "Approved" }
        ]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "FIN-2026-018",
    history: [
      { at: "2026-03-09T20:15:00Z", action: "Created", user: "Willy", note: "Client dinner." },
      { at: "2026-03-10T10:00:00Z", action: "Approved Tier 1", user: "Joanna Wellick", note: "Verified." },
      { at: "2026-03-11T14:30:00Z", action: "Approved", user: "Phillip Price", note: "Important client relationship." }
    ]
  },
  {
    id: 7,
    title: "Renewing Adobe Creative Cloud License",
    description: "Request to extend the design team's Adobe CC suite licenses for another 12 months.",
    category: "IT",
    categoryType: "Pengajuan/Perpanjangan Lisensi",
    department: "Design",
    createdAt: "2026-03-12T09:40:00Z",
    requester: "Angela Moss",
    status: "Pending",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Pending",
        requiredApprovals: 1,
        approvers: [
          { name: "Gideon Goddard", role: "IT Manager", status: "Pending" }
        ]
      }
    ],
    attachmentsCount: 0,
    memoNumber: "IT-2026-092",
    history: [
      { at: "2026-03-12T09:40:00Z", action: "Created", user: "Angela Moss", note: "Annual renewal." }
    ]
  },
  {
    id: 8,
    title: "Drafting NDA for Allsafe Cybersecurity",
    description: "Please review and finalize the Non-Disclosure Agreement for the upcoming Allsafe partnership.",
    category: "Legal",
    categoryType: "Permintaan NDA",
    department: "Engineering",
    createdAt: "2026-03-08T11:20:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "Approved",
        requiredApprovals: 2,
        approvers: [
          { name: "Susan Jacobs", role: "General Counsel", status: "Pending" },
          { name: "Lloyd Chung", role: "Legal Associate", status: "Approved" },
          { name: "Willy", role: "VP Tech", status: "Approved" }
        ]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "LGL-2026-031",
    history: [
      { at: "2026-03-08T11:20:00Z", action: "Created", user: "Willy", note: "Standard NDA draft." },
      { at: "2026-03-09T14:00:00Z", action: "Approved (Quorum)", user: "Lloyd Chung", note: "Terms look standard." },
      { at: "2026-03-10T09:15:00Z", action: "Approved (Quorum)", user: "Willy", note: "Ready for General Counsel." }
    ]
  },
  {
    id: 9,
    title: "Client Onboarding Document Refinement",
    description: "Please update the client onboarding documents to include the new data privacy clauses.",
    category: "Legal",
    categoryType: "Document Review",
    department: "Legal",
    createdAt: "2026-03-12T14:20:00Z",
    requester: "Susan Jacobs",
    status: "Requested Changes",
    rejectionReason: "Missing Clause 4.2 regarding GDPR compliance. Please add and resubmit.",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Requested Changes",
        requiredApprovals: 1,
        approvers: [
          { name: "Lloyd Chung", role: "Legal Associate", status: "Requested Changes" }
        ]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "LGL-2026-045",
    history: [
      { at: "2026-03-12T14:20:00Z", action: "Created", user: "Susan Jacobs", note: "Refinement draft." },
      { at: "2026-03-12T16:00:00Z", action: "Requested Changes", user: "Lloyd Chung", note: "GDPR compliance check failed." }
    ]
  },
  {
    id: 10,
    title: "Project Phoenix Budget Proposal",
    description: "Initial budget estimation for Project Phoenix implementation phase.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    department: "Engineering",
    createdAt: "2026-03-13T08:00:00Z",
    requester: "Willy",
    status: "Requested Changes",
    rejectionReason: "Travel expenses are over the limit. Please reduce by 20%.",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Requested Changes",
        requiredApprovals: 1,
        approvers: [
          { name: "Phillip Price", role: "CEO", status: "Requested Changes" }
        ]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "FIN-2026-055",
    history: [
      { at: "2026-03-13T08:00:00Z", action: "Created", user: "Willy", note: "New budget for Project Phoenix." },
      { at: "2026-03-13T09:15:00Z", action: "Requested Changes", user: "Phillip Price", note: "Travel expenses are over the limit. Please reduce by 20%." }
    ]
  },
  {
    id: 11,
    title: "Software License Renewal - IDEs",
    description: "Annual renewal for developer IDE licenses.",
    category: "IT",
    categoryType: "Pengajuan/Perpanjangan Lisensi",
    department: "Engineering",
    createdAt: "2026-03-13T10:00:00Z",
    requester: "Elliot Alderson",
    status: "Requested Changes",
    rejectionReason: "We need the exact list of users for these licenses. Please attach the CSV.",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Requested Changes",
        requiredApprovals: 1,
        approvers: [
          { name: "Willy", role: "VP Tech", status: "Requested Changes" }
        ]
      }
    ],
    attachmentsCount: 0,
    memoNumber: "IT-2026-103",
    history: [
      { at: "2026-03-13T10:00:00Z", action: "Created", user: "Elliot Alderson", note: "Renewal request." },
      { at: "2026-03-13T11:45:00Z", action: "Requested Changes", user: "Willy", note: "Missing user list." }
    ]
  },
  {
    id: 12,
    title: "Quarterly IT Security Training",
    description: "Mandatory security awareness training for all employees. Please enroll in the LMS.",
    category: "Operational",
    categoryType: "Security Review",
    department: "IT Security",
    createdAt: "2026-03-13T12:00:00Z",
    requester: "Elliot Alderson",
    status: "Approved",
    approvalChain: [{ tier: 1, type: "single", status: "Approved", requiredApprovals: 1, approvers: [{ name: "Gideon Goddard", role: "IT Manager", status: "Approved" }] }],
    attachmentsCount: 1,
    memoNumber: "SEC-2026-005",
    history: [
      { at: "2026-03-13T12:00:00Z", action: "Created", user: "Elliot Alderson", note: "Q1 training cycle." },
      { at: "2026-03-13T13:00:00Z", action: "Approved", user: "Gideon Goddard", note: "Deployment approved." }
    ]
  },
  {
    id: 13,
    title: "Office Renovation Plan - Phase 1",
    description: "Proposed layout changes for the first floor open office area.",
    category: "General Affair",
    categoryType: "Pembelian Barang",
    department: "Operations",
    createdAt: "2026-03-12T16:30:00Z",
    requester: "Pam Beesly",
    status: "Pending",
    isReminded: true,
    approvalChain: [{ tier: 1, type: "quorum", status: "Pending", requiredApprovals: 1, approvers: [{ name: "Michael Scott", role: "Regional Manager", status: "Pending" }] }],
    attachmentsCount: 4,
    memoNumber: "OPS-2026-115",
    history: [
      { at: "2026-03-12T16:30:00Z", action: "Created", user: "Pam Beesly", note: "Floor 1 blueprints." }
    ]
  },
  {
    id: 14,
    title: "New Marketing Analytics Tool Subscription",
    description: "Request for annual subscription to 'DataPulse' for marketing performance tracking.",
    category: "IT",
    categoryType: "Pengajuan/Perpanjangan Lisensi",
    department: "Marketing",
    createdAt: "2026-03-11T14:00:00Z",
    requester: "John Doe",
    status: "Pending",
    isReminded: true,
    approvalChain: [{ tier: 1, type: "single", status: "Pending", requiredApprovals: 1, approvers: [{ name: "Sarah Connor", role: "CMO", status: "Pending" }] }],
    attachmentsCount: 1,
    memoNumber: "MKT-2026-095",
    history: [
      { at: "2026-03-11T14:00:00Z", action: "Created", user: "John Doe", note: "Replacement for legacy tools." }
    ]
  },
  {
    id: 15,
    title: "Travel Request - Tech Conference 2026",
    description: "Flight and hotel booking request for the upcoming developer conference in San Francisco.",
    category: "HRD",
    categoryType: "Pengajuan Perjalanan Dinas",
    department: "Engineering",
    createdAt: "2026-03-10T11:00:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [{ tier: 1, type: "single", status: "Approved", requiredApprovals: 1, approvers: [{ name: "Phillip Price", role: "CEO", status: "Approved" }] }],
    attachmentsCount: 1,
    memoNumber: "ENG-2026-058",
    history: [
      { at: "2026-03-10T11:00:00Z", action: "Created", user: "Willy", note: "Conference attendance." },
      { at: "2026-03-10T12:00:00Z", action: "Approved", user: "Phillip Price", note: "Company representation." }
    ]
  },
  {
    id: 16,
    title: "Server Hardware Upgrade - Rack 4",
    description: "Purchase of 4 additional SSD units for the main production server rack.",
    category: "Operational",
    categoryType: "Infrastructure Change",
    department: "Engineering",
    createdAt: "2026-03-09T09:00:00Z",
    requester: "Willy",
    status: "Rejected",
    rejectionReason: "Budget already allocated for cloud migration. Defer to next quarter.",
    approvalChain: [{ tier: 1, type: "single", status: "Rejected", requiredApprovals: 1, approvers: [{ name: "Alan Turing", role: "CTO", status: "Rejected" }] }],
    attachmentsCount: 0,
    memoNumber: "ENG-2026-060",
    history: [
      { at: "2026-03-09T09:00:00Z", action: "Created", user: "Willy", note: "Required for performance." },
      { at: "2026-03-09T11:00:00Z", action: "Rejected", user: "Alan Turing", note: "Budget locked for cloud migration." }
    ]
  },
  {
    id: 17,
    title: "Company Picnic 2026 - Vendor Selection",
    description: "Review of catering options for the annual company outing in July.",
    category: "Accounting & Finance",
    categoryType: "Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-",
    department: "Human Resources",
    createdAt: "2026-03-08T15:00:00Z",
    requester: "Pam Beesly",
    status: "Pending",
    approvalChain: [{ tier: 1, type: "single", status: "Pending", requiredApprovals: 1, approvers: [{ name: "Toby Flenderson", role: "HR Lead", status: "Pending" }] }],
    attachmentsCount: 2,
    memoNumber: "HR-2026-020",
    history: [
      { at: "2026-03-08T15:00:00Z", action: "Created", user: "Pam Beesly", note: "Vendor proposal." }
    ]
  },
  {
    id: 18,
    title: "Legal Review of E Corp Contract",
    description: "Urgent review needed for the updated service level agreement with E Corp.",
    category: "Legal",
    categoryType: "Document Review",
    department: "Legal",
    createdAt: "2026-03-07T10:00:00Z",
    requester: "Susan Jacobs",
    status: "Approved",
    approvalChain: [{ tier: 1, type: "single", status: "Approved", requiredApprovals: 1, approvers: [{ name: "Phillip Price", role: "CEO", status: "Approved" }] }],
    attachmentsCount: 1,
    memoNumber: "LGL-2026-048",
    history: [
      { at: "2026-03-07T10:00:00Z", action: "Created", user: "Susan Jacobs", note: "Urgent E Corp SLA." },
      { at: "2026-03-07T11:00:00Z", action: "Approved", user: "Phillip Price", note: "Critical for Q2." }
    ]
  },
  {
    id: 19,
    title: "Internal Audit - Q1 Report",
    description: "Final draft of the Q1 financial internal audit report.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    department: "Accounting",
    createdAt: "2026-03-06T14:00:00Z",
    requester: "Angela Moss",
    status: "Pending",
    approvalChain: [{ tier: 1, type: "single", status: "Pending", requiredApprovals: 1, approvers: [{ name: "John Smith", role: "Finance Dir", status: "Pending" }] }],
    attachmentsCount: 1,
    memoNumber: "ACC-2026-012",
    history: [
      { at: "2026-03-06T14:00:00Z", action: "Created", user: "Angela Moss", note: "Q1 draft." }
    ]
  },
  {
    id: 20,
    title: "New Office Chair Purchase - Sales Department",
    description: "Replacement of 5 broken ergonomic chairs for the sales team.",
    category: "General Affair",
    categoryType: "Pembelian Barang",
    department: "Sales",
    createdAt: "2026-03-05T09:00:00Z",
    requester: "Jim Halpert",
    status: "Approved",
    approvalChain: [{ tier: 1, type: "single", status: "Approved", requiredApprovals: 1, approvers: [{ name: "Michael Scott", role: "Regional Manager", status: "Approved" }] }],
    attachmentsCount: 1,
    memoNumber: "SAL-2026-025",
    history: [
      { at: "2026-03-05T09:00:00Z", action: "Created", user: "Jim Halpert", note: "Safety concern." },
      { at: "2026-03-05T10:00:00Z", action: "Approved", user: "Michael Scott", note: "Safety first!" }
    ]
  },
  {
    id: 21,
    title: "API Documentation Refactor",
    description: "Improving documentation for the public developer API.",
    category: "IT",
    categoryType: "Template Test STD 1.76.8",
    department: "Engineering",
    createdAt: "2026-03-04T16:00:00Z",
    requester: "Willy",
    status: "Pending",
    isReminded: true,
    approvalChain: [{ tier: 1, type: "single", status: "Pending", requiredApprovals: 1, approvers: [{ name: "Alan Turing", role: "CTO", status: "Pending" }] }],
    attachmentsCount: 0,
    memoNumber: "ENG-2026-065",
    history: [
      { at: "2026-03-04T16:00:00Z", action: "Created", user: "Willy", note: "Migration to Slate." }
    ]
  },
  {
    id: 22,
    title: "Draft: Q2 Hardware Refresh Proposal",
    description: "Initial thoughts on the hardware upgrades needed for the dev team in Q2. Need to verify pricing with GA.",
    category: "Operational",
    categoryType: "Infrastructure Change",
    department: "Engineering",
    createdAt: "2026-03-14T10:00:00Z",
    requester: "Willy",
    status: "Draft",
    approvalChain: [],
    attachmentsCount: 0,
    memoNumber: "ENG-DRAFT-001",
    history: [
      { at: "2026-03-14T10:00:00Z", action: "Draft Created", user: "Willy", note: "Working on budget details." }
    ]
  },
  {
    id: 23,
    title: "Draft: New API Authentication Spec",
    description: "Drafting the transition from API keys to OAuth2.1 for all internal services.",
    category: "IT",
    categoryType: "Template Test STD 1.76.8",
    department: "Engineering",
    createdAt: "2026-03-14T15:30:00Z",
    requester: "Willy",
    status: "Draft",
    approvalChain: [],
    attachmentsCount: 1,
    memoNumber: "ENG-DRAFT-002",
    history: [
      { at: "2026-03-14T15:30:00Z", action: "Draft Created", user: "Willy", note: "Need to consult with Security first." }
    ]
  },
  {
    id: 23,
    title: "Scenario A: 1 of 2 Approved (Tier 2)",
    description: "This scenario shows a memo that has passed the first tier and is currently in the second tier with 1 out of 2 approvals completed.",
    category: "IT",
    categoryType: "Template Test STD 1.76.8",
    department: "Engineering",
    createdAt: "2026-03-14T09:00:00Z",
    requester: "Willy",
    status: "Pending",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Elliot Alderson", role: "Security Lead", status: "Approved" }]
      },
      {
        tier: 2,
        type: "quorum",
        status: "Pending",
        requiredApprovals: 2,
        approvers: [
          { name: "Angela Moss", role: "PR Manager", status: "Approved" },
          { name: "Willy", role: "Specialist", status: "Pending" }
        ]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "OPS-2026-001",
    history: [
      { at: "2026-03-14T09:00:00Z", action: "Created", user: "Willy" },
      { at: "2026-03-14T10:30:00Z", action: "Approved", user: "Elliot Alderson", note: "Tier 1 cleared." },
      { at: "2026-03-14T11:45:00Z", action: "Approved", user: "Angela Moss", note: "Waiting for Darlene." }
    ]
  },
  {
    id: 24,
    title: "Scenario B: 2 of 2 Approved (Tier 2, waiting Tier 3)",
    description: "This scenario shows a memo that is fully approved in Tier 2 and is now waiting for the final single approval in Tier 3.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    department: "Engineering",
    createdAt: "2026-03-13T08:00:00Z",
    requester: "Willy",
    status: "Pending",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Elliot Alderson", role: "Security Lead", status: "Approved" }]
      },
      {
        tier: 2,
        type: "all",
        status: "Approved",
        requiredApprovals: 2,
        approvers: [
          { name: "Angela Moss", role: "PR Manager", status: "Approved" },
          { name: "Darlene Alderson", role: "Specialist", status: "Approved" }
        ]
      },
      {
        tier: 3,
        type: "single",
        status: "Pending",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "CEO", status: "Pending" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "FIN-2026-002",
    history: [
      { at: "2026-03-13T08:00:00Z", action: "Created", user: "Willy" },
      { at: "2026-03-13T09:00:00Z", action: "Approved", user: "Elliot Alderson" },
      { at: "2026-03-13T10:00:00Z", action: "Approved", user: "Angela Moss" },
      { at: "2026-03-13T11:00:00Z", action: "Approved", user: "Darlene Alderson" }
    ]
  },
  {
    id: 25,
    title: "Scenario C: Single Tier Pending",
    description: "A simple scenario where there is only one tier and one approver, and it is still pending.",
    category: "General Affair",
    categoryType: "Internal Memo General Affair",
    department: "Engineering",
    createdAt: "2026-03-14T14:00:00Z",
    requester: "Willy",
    status: "Pending",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Pending",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "Security Lead", status: "Pending" }]
      }
    ],
    attachmentsCount: 0,
    memoNumber: "GEN-2026-003",
    history: [
      { at: "2026-03-14T14:00:00Z", action: "Created", user: "Willy" }
    ]
  }
];
