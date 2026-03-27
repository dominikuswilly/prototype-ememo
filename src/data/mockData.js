export const mockMemos = [
  {
    id: 1,
    title: "Q3 Marketing Campaign Proposal",
    description: "Overview and budget request for the upcoming Q3 product launch campaign across digital channels.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    requesterDepartment: "Marketing",
    targetDepartment: "Finance",
    createdAt: "2026-03-10T09:00:00Z",
    requester: "John Doe",
    status: "Approved",
    externalSystem: "Finance System",
    externalStatus: "Sent",
    externalReceiptNumber: "RCT-FIN-001",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Sarah Connor", role: "CMO", status: "Approved" }]
      },
      {
        tier: 2,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "CTO", status: "In Review" }]
      }
    ],
    attachmentsCount: 3,
    memoNumber: "FIN-2026-001",
    history: [
      { at: "2026-03-10T09:00:00Z", action: "Created", user: "John Doe", note: "Initial request for Q3 marketing budget." },
      { at: "2026-03-10T11:30:00Z", action: "Approved Tier 1", user: "Sarah Connor", note: "Approved. Budget aligns with campaign goals." },
      { at: "2026-03-11T10:00:00Z", action: "Reminded", user: "John Doe", note: "Sent reminder to Willy (CTO) for Tier 2 approval." }
    ]
  },
  {
    id: 2,
    title: "Server Migration SSD Purchase",
    description: "Purchase of high-performance SSDs for the upcoming server migration project.",
    category: "IT",
    categoryType: "Pembelian Hardware/Software",
    requesterDepartment: "Engineering",
    targetDepartment: "IT",
    createdAt: "2026-03-08T14:30:00Z",
    requester: "Willy",
    status: "Approved",
    externalSystem: "Finance System",
    externalStatus: "Sent",
    externalReceiptNumber: "RCT-FIN-042",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Alan Turing", role: "CTO", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "IT-2026-042",
    history: [
      { at: "2026-03-08T14:30:00Z", action: "Created", user: "Willy", note: "Urgent hardware requirement for migration." },
      { at: "2026-03-09T09:00:00Z", action: "Approved", user: "Alan Turing", note: "Approved. Proceed with procurement." }
    ]
  },
  {
    id: 3,
    title: "New Employee Onboarding - Staff Level",
    description: "Request for hiring 3 new staff members for the customer support team.",
    category: "HRD",
    categoryType: "Pengangkatan/Pengajuan Karyawan (Staff)",
    requesterDepartment: "Customer Service",
    targetDepartment: "HR",
    createdAt: "2026-03-11T11:15:00Z",
    requester: "Pam Beesly",
    status: "Approved",
    externalSystem: "HRD System",
    externalStatus: "Waiting",
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "In Review",
        requiredApprovals: 2,
        approvers: [
          { name: "Michael Scott", role: "Regional Manager", status: "Approved" },
          { name: "Toby Flenderson", role: "HR Lead", status: "In Review" },
          { name: "Willy", role: "CTO", status: "In Review" }
        ]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "HR-2026-015",
    hrEmployeeType: 'Existing',
    hrName: 'Kevin Malone',
    hrID: 'EMP-055',
    hrDOB: '1972-06-01',
    hrStartWork: '2015-01-01',
    hrDivision: 'Accounting',
    hrBranch: 'Scranton',
    hrJobTitle: 'Accountant',
    hrStatus: 'Single',
    hrChildren: 0,
    hrSalaryChange: 'no',
    oldSalary: { basic: 0, allowance: 0, position: 0 },
    newSalary: { basic: 0, allowance: 0, position: 0 },
    hrEffectiveDate: '',
    history: [
      { at: "2026-03-11T11:15:00Z", action: "Created", user: "Pam Beesly", note: "Budget for CS expansion approved." },
      { at: "2026-03-12T08:30:00Z", action: "Approved (Quorum)", user: "Michael Scott", note: "We need more people!" },
      { at: "2026-03-13T09:00:00Z", action: "Reminded", user: "Pam Beesly", note: "Reminded pending approvers (Toby and Willy) to reach quorum." }
    ]
  },
  {
    id: 4,
    title: "Client Entertainment - Q1 Review",
    description: "Reimbursement for dinner with key clients following the Q1 business review meeting.",
    category: "Accounting & Finance",
    categoryType: "Reimburse Entertain Rp. 500.000,- s/d Rp. 2.500.000,-",
    requesterDepartment: "Sales",
    targetDepartment: "Finance",
    createdAt: "2026-03-05T16:45:00Z",
    requester: "Jim Halpert",
    status: "Rejected",
    rejectionConcern: "Budget / Finance",
    rejectionReason: "Expense exceeds the approved threshold for this category without prior authorization.",
    rejectedFields: ["Amount", "Description"],
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Rejected",
        requiredApprovals: 1,
        approvers: [{ name: "Dwight Schrute", role: "Assistant Regional Manager", status: "Rejected" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "FIN-2026-088",
    history: [
      { at: "2026-03-05T16:45:00Z", action: "Created", user: "Jim Halpert", note: "Client dinner at Dorsia." },
      { at: "2026-03-06T10:00:00Z", action: "Rejected", user: "Dwight Schrute", note: "REJECTED. I don't see the receipt for the wine." }
    ]
  },
  {
    id: 5,
    title: "Adobe Creative Cloud License Renewal",
    description: "Annual renewal for the design team's software licenses.",
    category: "IT",
    categoryType: "Pengajuan/Perpanjangan Lisensi",
    requesterDepartment: "Design",
    targetDepartment: "IT",
    createdAt: "2026-03-01T10:00:00Z",
    requester: "Angela Moss",
    status: "Approved",
    externalSystem: "IT System",
    externalStatus: "Sent",
    externalReceiptNumber: "RCT-IT-004",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Gideon Goddard", role: "IT Manager", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "IT-2026-004",
    history: [
      { at: "2026-03-01T10:00:00Z", action: "Created", user: "Angela Moss", note: "Annual subscription renewal." },
      { at: "2026-03-01T11:00:00Z", action: "Approved", user: "Gideon Goddard", note: "Approved. License keys allocated." }
    ]
  },
  {
    id: 6,
    title: "NDA for Project E-Corp Partner",
    description: "Request for a standard Non-Disclosure Agreement for the new partnership negotiations.",
    category: "Legal",
    categoryType: "Permintaan NDA",
    requesterDepartment: "Business Development",
    targetDepartment: "Legal",
    createdAt: "2026-03-12T14:20:00Z",
    requester: "Willy",
    status: "Requested Changes",
    rejectionReason: "The entity name in Section 1.2 is incorrect. Please update to the full legal name.",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Requested Changes",
        requiredApprovals: 1,
        approvers: [{ name: "Susan Jacobs", role: "General Counsel", status: "Requested Changes" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "LGL-2026-012",
    history: [
      { at: "2026-03-12T14:20:00Z", action: "Created", user: "Willy", note: "Urgent NDA for Monday's meeting." },
      { at: "2026-03-12T16:00:00Z", action: "Requested Changes", user: "Susan Jacobs", note: "Correct the legal entity name." }
    ]
  },
  {
    id: 7,
    title: "Cash Advance for Travel - Willy",
    description: "Advance payment for travel expenses for the upcoming tech conference.",
    category: "Accounting & Finance",
    categoryType: "Cash Advance",
    requesterDepartment: "Engineering",
    targetDepartment: "Finance",
    createdAt: "2026-03-13T08:00:00Z",
    requester: "Willy",
    status: "Draft",
    approvalChain: [],
    attachmentsCount: 0,
    memoNumber: "FIN-DRAFT-005",
    history: [
      { at: "2026-03-13T08:00:00Z", action: "Draft Created", user: "Willy", note: "Estimated costs for hotel and flights." }
    ]
  },
  {
    id: 8,
    title: "Office Stationery Purchase - Q2",
    description: "Restocking office supplies for the second quarter.",
    category: "General Affair",
    categoryType: "Pembelian Barang",
    requesterDepartment: "Operations",
    targetDepartment: "GA",
    createdAt: "2026-03-09T09:00:00Z",
    requester: "Jim Halpert",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "CTO", status: "In Review" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "GA-2026-055",
    history: [
      { at: "2026-03-09T09:00:00Z", action: "Created", user: "Jim Halpert", note: "Monthly supply request." }
    ]
  },
  {
    id: 9,
    title: "Tech Conference 2026 - SF",
    description: "Approval for attending the SF tech conference in May.",
    category: "HRD",
    categoryType: "Pengajuan Perjalanan Dinas",
    requesterDepartment: "Engineering",
    targetDepartment: "HR",
    createdAt: "2026-03-10T11:00:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Phillip Price", role: "CEO", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "HR-2026-058",
    history: [
      { at: "2026-03-10T11:00:00Z", action: "Created", user: "Willy", note: "Conference attendance request." },
      { at: "2026-03-10T12:00:00Z", action: "Approved", user: "Phillip Price", note: "Representing the company." }
    ]
  },
  {
    id: 10,
    title: "Medical Claim - Willy",
    description: "Reimbursement for annual checkup expenses.",
    category: "Technical",
    categoryType: "Self Insurance",
    requesterDepartment: "Engineering",
    targetDepartment: "Medical",
    createdAt: "2026-03-04T10:00:00Z",
    requester: "Willy",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Darlene Alderson", role: "Medical Admin", status: "In Review" }]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "TEC-2026-009",
    history: [
      { at: "2026-03-04T10:00:00Z", action: "Created", user: "Willy", note: "Annual checkup receipts." }
    ]
  },
  {
    id: 11,
    title: "Internal Memo - Claim Processing Update",
    description: "Announcement regarding new simplified claim procedures for all employees.",
    category: "Claim",
    categoryType: "Internal Memo",
    requesterDepartment: "Human Resources",
    targetDepartment: "HR",
    createdAt: "2026-03-13T14:30:00Z",
    requester: "Angela Moss",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Phillip Price", role: "CEO", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "CLM-2026-002",
    history: [
      { at: "2026-03-13T14:30:00Z", action: "Created", user: "Angela Moss", note: "New policy rollout." },
      { at: "2026-03-14T09:00:00Z", action: "Approved", user: "Phillip Price", note: "Streamlining operations is key." }
    ]
  },
  {
    id: 12,
    title: "Employee Health Insurance - Q2",
    description: "Renewal of the group health insurance policy for all staff.",
    category: "Employee Benefit",
    categoryType: "Penggunaan Asuransi",
    requesterDepartment: "Operations",
    targetDepartment: "HR",
    createdAt: "2026-03-15T09:00:00Z",
    requester: "Willy",
    status: "Approved",
    externalSystem: "HRD System",
    externalStatus: "Waiting",
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "In Review",
        requiredApprovals: 2,
        approvers: [
          { name: "John Smith", role: "Benefits Lead", status: "Approved" },
          { name: "Sarah Connor", role: "HR Dir", status: "In Review" },
          { name: "Willy", role: "CTO", status: "In Review" }
        ]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "EB-2026-001",
    hrEmployeeType: 'Existing',
    hrName: 'Willy',
    hrID: 'EMP-001',
    hrDOB: '1990-01-01',
    hrStartWork: '2020-01-01',
    hrDivision: 'Engineering',
    hrBranch: 'Main',
    hrJobTitle: 'VP Tech',
    hrStatus: 'Single',
    hrChildren: 0,
    hrSalaryChange: 'no',
    oldSalary: { basic: 0, allowance: 0, position: 0 },
    newSalary: { basic: 0, allowance: 0, position: 0 },
    hrEffectiveDate: '',
    history: [
      { at: "2026-03-15T09:00:00Z", action: "Created", user: "Willy", note: "Q2 policy renewal terms." }
    ]
  },
  {
    id: 13,
    title: "Company Car - Maintenance Request",
    description: "Engine service and tire replacement for the operational vehicle B-1234-XYZ.",
    category: "General Affair",
    categoryType: "Peminjaman Kendaraan",
    requesterDepartment: "Operations",
    targetDepartment: "GA",
    createdAt: "2026-03-12T10:00:00Z",
    requester: "Jim Halpert",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Michael Scott", role: "Regional Manager", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "GA-2026-101",
    history: [
      { at: "2026-03-12T10:00:00Z", action: "Created", user: "Jim Halpert", note: "Vehicle maintenance." },
      { at: "2026-03-12T11:00:00Z", action: "Approved", user: "Michael Scott", note: "Safety first!" }
    ]
  },
  {
    id: 14,
    title: "New Developer Onboarding - IT Specialist",
    description: "Hiring request for an experienced IT security specialist for the infrastructure team.",
    category: "HRD",
    categoryType: "Pengangkatan/Pengajuan Karyawan (Diatas Staff)",
    requesterDepartment: "Engineering",
    targetDepartment: "HR",
    createdAt: "2026-03-11T16:00:00Z",
    requester: "Willy",
    status: "Approved",
    externalSystem: "HRD System",
    externalStatus: "Waiting",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Alan Turing", role: "CTO", status: "Approved" }]
      },
      {
        tier: 2,
        type: "quorum",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [
          { name: "Sarah Connor", role: "HR Dir", status: "In Review" },
          { name: "Phillip Price", role: "CEO", status: "In Review" }
        ]
      }
    ],
    attachmentsCount: 3,
    memoNumber: "HR-2026-092",
    hrEmployeeType: 'New',
    hrName: 'Jane Smith',
    hrID: 'NEW-001',
    hrDOB: '1995-05-15',
    hrStartWork: '2026-04-01',
    hrDivision: 'Engineering',
    hrBranch: 'Building B',
    hrJobTitle: 'Security Specialist',
    hrStatus: 'Single',
    hrChildren: 0,
    hrSalaryChange: 'no',
    oldSalary: { basic: 0, allowance: 0, position: 0 },
    newSalary: { basic: 0, allowance: 0, position: 0 },
    hrEffectiveDate: '',
    history: [
      { at: "2026-03-11T16:00:00Z", action: "Created", user: "Willy", note: "Infrastructure security lead hire." },
      { at: "2026-03-12T09:00:00Z", action: "Approved Tier 1", user: "Alan Turing", note: "Critical hire for Project 505." },
      { at: "2026-03-13T14:00:00Z", action: "Reminded", user: "Willy", note: "Sent reminder to Tier 2 (Sarah Connor and Phillip Price)." }
    ]
  },
  {
    id: 15,
    title: "Software Subscription - IDE Pro",
    description: "Renewal for JetBrains IDE licenses for the engineering team.",
    category: "IT",
    categoryType: "Pengajuan/Perpanjangan Lisensi",
    requesterDepartment: "Engineering",
    targetDepartment: "IT",
    createdAt: "2026-03-13T10:00:00Z",
    requester: "Elliot Alderson",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "CTO", status: "In Review" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "IT-2026-103",
    history: [
      { at: "2026-03-13T10:00:00Z", action: "Created", user: "Elliot Alderson", note: "Annual IDE renewal." }
    ]
  },
  {
    id: 16,
    title: "Legal Review - E-Corp Master Service Agreement",
    description: "Review and drafting updates for the MSA with our largest partner.",
    category: "Legal",
    categoryType: "Review / Drafting PKS",
    requesterDepartment: "Legal",
    targetDepartment: "Legal",
    createdAt: "2026-03-14T11:00:00Z",
    requester: "Susan Jacobs",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "quorum",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [
          { name: "Phillip Price", role: "CEO", status: "In Review" },
          { name: "Willy", role: "CTO", status: "In Review" }
        ]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "LGL-2026-045",
    history: [
      { at: "2026-03-14T11:00:00Z", action: "Created", user: "Susan Jacobs", note: "MSA version 3.4 draft." }
    ]
  },
  {
    id: 17,
    title: "Self Insurance Reimbursement - Willy Dental",
    description: "Claim for dental work completed last week.",
    category: "Technical",
    categoryType: "Self Insurance",
    requesterDepartment: "Engineering",
    targetDepartment: "Medical",
    createdAt: "2026-03-08T09:00:00Z",
    requester: "Willy",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Darlene Alderson", role: "Medical Admin", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "TEC-2026-015",
    history: [
      { at: "2026-03-08T09:00:00Z", action: "Created", user: "Willy", note: "Dental receipt." },
      { at: "2026-03-09T14:00:00Z", action: "Approved", user: "Darlene Alderson", note: "Approved based on policy limits." }
    ]
  },
  {
    id: 18,
    title: "LPJ Cash Advance - TechConf Exhibition",
    description: "Accountability report for the exhibition costs at the SF Tech Conference.",
    category: "Accounting & Finance",
    categoryType: "LPJ Cash Advance diatas Rp. 10.000.000,-",
    requesterDepartment: "Marketing",
    targetDepartment: "Finance",
    createdAt: "2026-03-14T15:30:00Z",
    requester: "Willy",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Sarah Connor", role: "Marketing Dir", status: "In Review" }]
      },
      {
        tier: 2,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "John Smith", role: "Finance Dir", status: "In Review" }]
      }
    ],
    attachmentsCount: 5,
    memoNumber: "FIN-2026-112",
    history: [
      { at: "2026-03-14T15:30:00Z", action: "Created", user: "Willy", note: "Exhibition costs detailed list." }
    ]
  },
  {
    id: 19,
    title: "Office Space Rental - Expansion Floor 3",
    description: "Renewal of the lease agreement for the new expansion area.",
    category: "Accounting & Finance",
    categoryType: "Pengajuan Sewa Kantor",
    requesterDepartment: "Operations",
    targetDepartment: "Finance",
    createdAt: "2026-03-12T09:00:00Z",
    requester: "Jim Halpert",
    status: "In Review",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Phillip Price", role: "CEO", status: "In Review" }]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "FIN-2026-055",
    history: [
      { at: "2026-03-12T09:00:00Z", action: "Created", user: "Jim Halpert", note: "Floor 3 lease terms." }
    ]
  },
  {
    id: 20,
    title: "IT Support Kit - New Hire Refresh",
    description: "Purchase of basic IT kits (laptops, monitors, cables) for the upcoming summer interns.",
    category: "IT",
    categoryType: "Service Hardware/Software",
    requesterDepartment: "IT Support",
    targetDepartment: "IT",
    createdAt: "2026-03-05T10:00:00Z",
    requester: "Angela Moss",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Gideon Goddard", role: "IT Manager", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "IT-2026-015",
    history: [
      { at: "2026-03-05T10:00:00Z", action: "Created", user: "Angela Moss", note: "Intern hardware provisioning." },
      { at: "2026-03-06T09:00:00Z", action: "Approved", user: "Gideon Goddard", note: "Laptops ordered." }
    ]
  },
  {
    id: 21,
    title: "Drafting Partner Agreement - Allsafe",
    description: "New partner agreement draft for the Allsafe collaboration project.",
    category: "Legal",
    categoryType: "Review / Drafting PKS",
    requesterDepartment: "Legal",
    targetDepartment: "Legal",
    createdAt: "2026-03-13T11:00:00Z",
    requester: "Susan Jacobs",
    status: "Approved",
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Approved",
        requiredApprovals: 1,
        approvers: [{ name: "Phillip Price", role: "CEO", status: "Approved" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "LGL-2026-031",
    history: [
      { at: "2026-03-13T11:00:00Z", action: "Created", user: "Susan Jacobs", note: "Allsafe PKS draft." },
      { at: "2026-03-14T10:00:00Z", action: "Approved", user: "Phillip Price", note: "Ready for signing." }
    ]
  },

  {
    id: 23,
    title: "Project Alpha Budget Update",
    description: "Request for additional budget for the Project Alpha development phase.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    requesterDepartment: "Engineering",
    targetDepartment: "Finance",
    createdAt: "2026-03-18T10:00:00Z",
    requester: "Willy",
    status: "Requested Changes",
    rejectionConcern: "Scope / Objective",
    rejectionReason: "The budget allocation is not clear enough. Please specify the breakdown for each sub-module.",
    markerDescriptions: {
      'Title': 'Please ensure the project code is included in the title.',
      'Description': 'This section needs a more granular breakdown of the requested funds per developer role. We need to see how much is allocated for frontend, backend, and DevOps individually to ensure budget alignment with the Q3 roadmap. Please also include the justification for any hardware-related expenses mentioned in the sub-tasks.'
    },
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "Requested Changes",
        requiredApprovals: 1,
        approvers: [{ name: "Phillip Price", role: "CEO", status: "Requested Changes" }]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "FIN-2026-115",
    history: [
      { at: "2026-03-18T10:00:00Z", action: "Created", user: "Willy", note: "Initial budget request." },
      { at: "2026-03-18T14:00:00Z", action: "Requested Changes", user: "Phillip Price", note: "Please refine the description with more details." }
    ]
  },
  {
    id: 25,
    title: "Software License Upgrade - Windows 11 Enterprise",
    description: "Upgrade request for the development team to ensure compatibility with new security protocols.",
    category: "IT",
    categoryType: "Pengajuan Hardware/Software",
    requesterDepartment: "Engineering",
    targetDepartment: "IT",
    createdAt: "2026-03-20T09:00:00Z",
    requester: "Willy",
    status: "In Review",
    isReminded: true,
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Sarah Connor", role: "IT Dir", status: "In Review" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "IT-2026-155",
    history: [
      { at: "2026-03-20T09:00:00Z", action: "Created", user: "Willy", note: "Need enterprise features for virtualization." },
      { at: "2026-03-21T10:00:00Z", action: "Reminded", user: "Willy", note: "Sent follow-up reminder to Sarah Connor." }
    ]
  },
  {
    id: 26,
    title: "Team Building Dinner - Q2 Engineering",
    description: "Budget request for the quarterly team building dinner scheduled for next month.",
    category: "Accounting & Finance",
    categoryType: "Internal Memo Accounting & Finance",
    requesterDepartment: "Engineering",
    targetDepartment: "Finance",
    createdAt: "2026-03-22T14:00:00Z",
    requester: "Elliot Alderson",
    status: "In Review",
    isReminded: true,
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Angela Moss", role: "Manager", status: "In Review" }]
      }
    ],
    attachmentsCount: 1,
    memoNumber: "FIN-2026-201",
    history: [
      { at: "2026-03-22T14:00:00Z", action: "Created", user: "Elliot Alderson", note: "Proposed venue: The Red Wheelbarrow." },
      { at: "2026-03-23T09:30:00Z", action: "Reminded", user: "Elliot Alderson", note: "Requested approval from Angela for venue booking." }
    ]
  },
  {
    id: 27,
    title: "Ergonomic Office Equipment - Standing Desks",
    description: "Request for 5 ergonomic standing desks for the operations team to improve workplace wellness.",
    category: "General Affair",
    categoryType: "Pembelian Barang",
    requesterDepartment: "Operations",
    targetDepartment: "GA",
    createdAt: "2026-03-24T11:00:00Z",
    requester: "Pam Beesly",
    status: "In Review",
    isReminded: true,
    approvalChain: [
      {
        tier: 1,
        type: "single",
        status: "In Review",
        requiredApprovals: 1,
        approvers: [{ name: "Willy", role: "CTO", status: "In Review" }]
      }
    ],
    attachmentsCount: 2,
    memoNumber: "GA-2026-305",
    history: [
      { at: "2026-03-24T11:00:00Z", action: "Created", user: "Pam Beesly", note: "Based on team feedback for better ergonomics." },
      { at: "2026-03-25T08:00:00Z", action: "Reminded", user: "Pam Beesly", note: "Sent reminder to Willy for procurement approval." }
    ]
  }
];
