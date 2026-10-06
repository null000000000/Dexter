import { ProjectMilestone } from '../types/dexter';

export const PROJECTS_SCHEDULE: ProjectMilestone[] = [
  {
    projectNumber: 1,
    title: 'Adaptive Recon Framework',
    monthNumber: 1,
    weeks: [1, 2, 3, 4],
    definitionOfDone: 'Working tool + GitHub repo with clean modular architecture + verified execution evidence + technical case study document.',
    weeklyMilestones: [
      {
        week: 1,
        title: 'Design + Recon Engine',
        outputs: [
          'Project scope & supported network services definition',
          'Standardized JSON input/output data schema',
          'Nmap process wrapper and fast streaming XML/JSON parser',
          'Service dispatcher router mapping open ports to targeted enumerators'
        ]
      },
      {
        week: 2,
        title: 'Adaptive Enumeration',
        outputs: [
          'HTTP/S automated enumeration module (vhost discovery, tech stack fingerprinting)',
          'SMB share crawling & anonymous access verifier module',
          'SSH/FTP banner scraping & credential testing wrapper',
          'Multi-target concurrent execution loop with structured logging'
        ]
      },
      {
        week: 3,
        title: 'Reliability & Edge Cases',
        outputs: [
          'Architecture cleanup: decoupled plugins and async worker pool',
          'Network edge-case handling (firewall drops, rate-limiting, timeouts)',
          'Local SQLite/JSON result storage and query interface',
          'Automated unit and integration test suite passing against local test harness'
        ]
      },
      {
        week: 4,
        title: 'Portfolio & Case Study',
        outputs: [
          'Production-ready README with architecture diagram and CLI usage examples',
          'Recorded terminal demo / GIF and evidence screenshots against test machines',
          'Technical methodology documentation & design trade-offs writeup',
          'Public GitHub repository publishing and Month 1 portfolio showcase piece'
        ]
      }
    ],
    githubUrl: 'https://github.com/dexter-sec/adaptive-recon',
    caseStudyUrl: 'https://notes.dexter.local/case-studies/project-1-recon.md',
    status: 'In Progress'
  },
  {
    projectNumber: 2,
    title: 'Web Security Assessment Lab',
    monthNumber: 2,
    weeks: [5, 6, 7, 8],
    definitionOfDone: 'Full web application security assessment + supporting enumeration tool + professional pentest report + case study.',
    weeklyMilestones: [
      {
        week: 5,
        title: 'Scope + Recon',
        outputs: [
          'Target engagement scope, boundaries, and rules of engagement (RoE)',
          'Application crawl map detailing endpoints, parameters, and API routes',
          'Authentication mechanisms, role-based session states, and CSRF token analysis',
          'Comprehensive web attack surface matrix and testing blueprint'
        ]
      },
      {
        week: 6,
        title: 'Vulnerability Assessment',
        outputs: [
          'Input validation fuzzing across all discovered endpoints',
          'SQL injection and NoSQL injection manual testing and proof of concept',
          'Broken Object Level Authorization (BOLA) and IDOR verification',
          'Cross-Site Scripting (stored/reflected) and business logic flaw validation'
        ]
      },
      {
        week: 7,
        title: 'Validation + Remediation + Retest',
        outputs: [
          'Deterministic reproduction steps crafted for all verified findings',
          'Root-cause code analysis for each identified vulnerability',
          'Remediation patches applied to target application source code',
          'Retesting execution proving finding eradication without functionality regression'
        ]
      },
      {
        week: 8,
        title: 'Professional Assessment & Report',
        outputs: [
          'Executive summary formatted for C-level leadership reading',
          'Detailed technical findings with CVSS v3.1 ratings and raw HTTP evidence',
          'Actionable remediation guidance with before/after code snippets',
          'Portfolio case study packaging and assessment report showcase artifact'
        ]
      }
    ],
    status: 'Not Started'
  },
  {
    projectNumber: 3,
    title: 'Active Directory Assessment Toolkit',
    monthNumber: 3,
    weeks: [9, 10, 11, 12],
    definitionOfDone: 'AD assessment toolkit + lab evidence + automated attack-path analysis + technical case study.',
    weeklyMilestones: [
      {
        week: 9,
        title: 'AD Lab + Enumeration',
        outputs: [
          'Multi-tiered Active Directory lab environment verified (DC, servers, workstations)',
          'LDAP/RPC enumeration scripts querying domain users, groups, and computers',
          'Share permissions and Group Policy Object (GPO) inspection modules',
          'Normalized AD object baseline dataset exported for graph ingestion'
        ]
      },
      {
        week: 10,
        title: 'Assessment Engine',
        outputs: [
          'Object-relational schema mapping AD objects and security relationships',
          'Automated parser for BloodHound / SharpHound JSON telemetry',
          'Misconfiguration detection engine (unconstrained delegation, AS-REP roastable users)',
          'Structured vulnerability finding output with risk prioritization'
        ]
      },
      {
        week: 11,
        title: 'Attack-Path Analysis',
        outputs: [
          'Graph shortest-path traversal identifying shortest route to Domain Admins',
          'DACL abuse chain validation (GenericAll, WriteDacl, ForceChangePassword)',
          'Automated proof-of-concept execution in controlled lab environment',
          'Lab validation telemetry and screenshots captured for evidence'
        ]
      },
      {
        week: 12,
        title: 'Assessment Package',
        outputs: [
          'Toolkit CLI optimization and execution packaging',
          'Report generator producing visual attack-path diagrams',
          'Methodology documentation detailing AD hardening strategies',
          'Public GitHub release and technical case study published'
        ]
      }
    ],
    status: 'Not Started'
  },
  {
    projectNumber: 4,
    title: 'End-to-End Pentest Engagement',
    monthNumber: 4,
    weeks: [13, 14, 15, 16],
    definitionOfDone: 'End-to-end full scope pentest + professional deliverable report + raw evidence + retest verification + public case study.',
    weeklyMilestones: [
      {
        week: 13,
        title: 'Engagement Setup & Recon',
        outputs: [
          'Formal engagement scoping, legal rules of engagement, and threat model',
          'External perimeter reconnaissance and OSINT asset mapping',
          'Network port scanning and perimeter attack surface classification',
          'Target attack hypothesis list formulated and prioritized'
        ]
      },
      {
        week: 14,
        title: 'Exploitation & Lateral Movement',
        outputs: [
          'Initial foothold gained on target perimeter infrastructure',
          'Internal network enumeration and pivot tunneling established',
          'Privilege escalation path traversed from low-privilege user to domain root',
          'Full kill-chain execution captured with immutable timestamped evidence'
        ]
      },
      {
        week: 15,
        title: 'Evidence & Reporting',
        outputs: [
          'Consolidated raw logs, traffic dumps, and terminal capture evidence',
          'Commercial-grade penetration test report drafting (executive & technical)',
          'CVSS scoring, business impact analysis, and systemic root cause diagnosis',
          'Strategic and tactical remediation recommendations formulated'
        ]
      },
      {
        week: 16,
        title: 'Retest + Portfolio Packaging',
        outputs: [
          'Client mock remediation review and formal re-testing procedure executed',
          'Final retest verification report confirming threat neutralization',
          'Redacted public case study produced for professional portfolio showcase',
          'Final Dexter deliverables integration and portfolio presentation launch'
        ]
      }
    ],
    status: 'Not Started'
  }
];
