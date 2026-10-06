import { VulnexMilestone } from '../types/dexter';

export const VULNEX_SCHEDULE: VulnexMilestone[] = [
  {
    weekNumber: 1,
    date: '2026-10-02',
    milestone: 'Environment + lab',
    expectedOutput: 'Containerized testing sandbox with isolated vulnerability target repos, AST parser scaffolding, and test harness.',
    definitionOfDone: 'Docker compose testbed boots clean; sample vulnerable repositories cloned and parsed into AST representation without errors.',
    actualResult: 'Completed sandbox container, tree-sitter AST parser initialized, verified on 3 vulnerable test fixtures.',
    evidenceUrl: 'https://github.com/vulnex/core/commit/8b72e1a',
    status: 'done'
  },
  {
    weekNumber: 2,
    date: '2026-10-09',
    milestone: 'GitHub integration',
    expectedOutput: 'GitHub App authentication, repository cloning via token, branch management, and webhook ingress dispatcher.',
    definitionOfDone: 'Webhook triggers scan workflow automatically upon mock PR push event; authenticated GitHub API client tested.',
    actualResult: 'In progress — GitHub App manifest drafted, branch manager service under integration test.',
    status: 'in-progress'
  },
  {
    weekNumber: 3,
    date: '2026-10-16',
    milestone: 'LLM normalization',
    expectedOutput: 'Structured schema prompt pipeline converting raw AST/SAST outputs into normalized vulnerability candidates.',
    definitionOfDone: 'Zero schema drift across 50 test inputs; JSON-schema validator passes all candidates with CWE mappings.',
    status: 'not-started'
  },
  {
    weekNumber: 4,
    date: '2026-10-23',
    milestone: 'Integration',
    expectedOutput: 'End-to-end integration between AST scanner, normalization pipeline, and candidate storage ledger.',
    definitionOfDone: 'Single CLI invocation runs scan pipeline through candidate ledger output in <30 seconds on 50k LOC repo.',
    status: 'not-started'
  },
  {
    weekNumber: 5,
    date: '2026-10-30',
    milestone: 'Data-flow analysis',
    expectedOutput: 'Taint tracking engine connecting user input sources to dangerous sinks (SQL, command execution, path traversal).',
    definitionOfDone: 'Taint propagation tests pass for source-to-sink flow through 3+ function calls with sanitization recognition.',
    status: 'not-started'
  },
  {
    weekNumber: 6,
    date: '2026-11-06',
    milestone: 'CVSS scoring',
    expectedOutput: 'Automated CVSS v3.1 vector calculation engine based on attack vector, complexity, and privileges required.',
    definitionOfDone: 'CVSS vector calculations accurately match 100 historical CVE benchmarks within ±0.3 score variance.',
    status: 'not-started'
  },
  {
    weekNumber: 7,
    date: '2026-11-13',
    milestone: 'Evidence object',
    expectedOutput: 'Cryptographically signed evidence package generator containing call stack, source snippet, PoC payload, and remediation advice.',
    definitionOfDone: 'Self-contained JSON/Markdown evidence artifact generated containing full reproducible proof of concept.',
    status: 'not-started'
  },
  {
    weekNumber: 8,
    date: '2026-11-20',
    milestone: 'CLI MVP + benchmark',
    expectedOutput: 'Standalone compiled CLI binary `vulnex-cli` with benchmarking suite run against OWASP Benchmark repository.',
    definitionOfDone: 'Benchmark report outputted with precision/recall statistics; CLI runs cleanly with flags `--repo`, `--out`, `--format`.',
    status: 'not-started'
  },
  {
    weekNumber: 9,
    date: '2026-11-27',
    milestone: 'Fix generation',
    expectedOutput: 'LLM-powered contextual code patch synthesis applying secure coding patterns to vulnerable AST nodes.',
    definitionOfDone: 'Generates valid diffs that compile without syntax errors and resolve vulnerability without breaking unit tests.',
    status: 'not-started'
  },
  {
    weekNumber: 10,
    date: '2026-12-04',
    milestone: 'GitHub PR creation',
    expectedOutput: 'Automated Pull Request creation engine pushing patch branch and posting detailed technical review comments.',
    definitionOfDone: 'Bot autonomously opens PR on target GitHub repository containing patch diff, explanation, and risk assessment.',
    status: 'not-started'
  },
  {
    weekNumber: 11,
    date: '2026-12-11',
    milestone: 'Re-verification',
    expectedOutput: 'Autonomous re-test orchestrator that executes test suite against generated fix branch to confirm remediation.',
    definitionOfDone: 'Scanner re-scans patched AST branch; confirms vulnerability sink is neutral while regression test suite passes.',
    status: 'not-started'
  },
  {
    weekNumber: 12,
    date: '2026-12-18',
    milestone: 'Developer ticket',
    expectedOutput: 'Integration with Jira/Linear/GitHub Issues generating developer-friendly actionable bug tickets with priority scoring.',
    definitionOfDone: 'Issues synced to ticketing webhook with reproducible code snippets, impact, and pre-generated PR links.',
    status: 'not-started'
  },
  {
    weekNumber: 13,
    date: '2026-12-25',
    milestone: 'Robustness',
    expectedOutput: 'Resilience hardening: rate limit handling, large repository chunking (>500k LOC), timeout safeguards, and error recovery.',
    definitionOfDone: '100% graceful recovery across network disconnections and token rate limits during sustained 4-hour batch scans.',
    status: 'not-started'
  },
  {
    weekNumber: 14,
    date: '2027-01-01',
    milestone: 'Demo UI',
    expectedOutput: 'Lightweight web dashboard visualizing scanned repositories, findings, CVSS distribution, and active auto-fixes.',
    definitionOfDone: 'Dashboard displays scan history, interactive finding details, and one-click PR approval workflow.',
    status: 'not-started'
  },
  {
    weekNumber: 15,
    date: '2027-01-08',
    milestone: 'Metrics',
    expectedOutput: 'Quantitative accuracy audit report: false positive rate, time-to-remediate metric, and token cost telemetry.',
    definitionOfDone: 'Formal metrics summary generated across 20 open-source testbeds demonstrating <10% false positive rate.',
    status: 'not-started'
  },
  {
    weekNumber: 16,
    date: '2027-01-15',
    milestone: 'Final delivery',
    expectedOutput: 'Final production release package: open-source core release, documentation site, demo video, and technical paper.',
    definitionOfDone: 'VULNEX 1.0 tag published to GitHub with complete installation instructions, sample report, and public architecture case study.',
    status: 'not-started'
  }
];
