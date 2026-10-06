import { CtfItem } from '../types/dexter';

export const CTF_SCHEDULE: CtfItem[] = [
  // Week 1
  {
    id: 'ctf-w1-1',
    weekNumber: 1,
    boxName: 'Busqueda',
    dayScheduled: 'Sunday',
    date: '2026-09-27',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Flask, Searchor 2.4.0 eval() code injection, Git repo credentials, system-check sudo privilege escalation',
    solved: true,
    writeupCompleted: true,
    writeupUrl: 'https://notes.dexter.local/writeups/htb-busqueda.md',
    evidenceNotes: 'User flag proof: 7a8... / Root flag proof: 4c9...; Searchor eval() injection chain fully documented.'
  },
  {
    id: 'ctf-w1-2',
    weekNumber: 1,
    boxName: 'Bashed',
    dayScheduled: 'Tuesday',
    date: '2026-09-29',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Web enumeration, phpbash shell, sudo rights to scriptmanager, cron job python file hijacking',
    solved: true,
    writeupCompleted: true,
    writeupUrl: 'https://notes.dexter.local/writeups/htb-bashed.md',
    evidenceNotes: 'phpbash discovered at /dev/phpbash.php; cronjob script.py hijacked to spawn root reverse shell.'
  },
  {
    id: 'ctf-w1-3',
    weekNumber: 1,
    boxName: 'Nibbles',
    dayScheduled: 'Thursday',
    date: '2026-10-01',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Nibbleblog exploitation, arbitrary image file upload, monitor.sh sudo shell script escalation',
    solved: true,
    writeupCompleted: true,
    writeupUrl: 'https://notes.dexter.local/writeups/htb-nibbles.md',
    evidenceNotes: 'Nibbleblog admin password brute force via dictionary; monitor.sh writeable sudo script abused for root.'
  },

  // Week 2
  {
    id: 'ctf-w2-1',
    weekNumber: 2,
    boxName: 'Sau',
    dayScheduled: 'Sunday',
    date: '2026-10-04',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Request Baskets SSRF (CVE-2023-27159), Maltrail v0.54 command injection, systemctl status pager sudo escape',
    solved: true,
    writeupCompleted: true,
    writeupUrl: 'https://notes.dexter.local/writeups/htb-sau.md',
    evidenceNotes: 'SSRF via forward_url in Request Baskets proxying to Maltrail 127.0.0.1:80; systemctl !sh root escape.'
  },
  {
    id: 'ctf-w2-2',
    weekNumber: 2,
    boxName: 'OpenAdmin',
    dayScheduled: 'Tuesday',
    date: '2026-10-06',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'OpenNetAdmin RCE, config file password reuse, crack RSA private key with john, nano sudo privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w2-3',
    weekNumber: 2,
    boxName: 'Precious',
    dayScheduled: 'Thursday',
    date: '2026-10-08',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'pdfkit command injection via URI, bundle config YAML deserialization vulnerability',
    solved: false,
    writeupCompleted: false
  },

  // Week 3
  {
    id: 'ctf-w3-1',
    weekNumber: 3,
    boxName: 'Soccer',
    dayScheduled: 'Sunday',
    date: '2026-10-11',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Subdomain discovery, WebSocket blind SQL injection, doas dstat privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w3-2',
    weekNumber: 3,
    boxName: 'Pilgrimage',
    dayScheduled: 'Tuesday',
    date: '2026-10-13',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Git dumper (.git exposed), ImageMagick CVE-2022-44268 arbitrary file read, malice script escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w3-3',
    weekNumber: 3,
    boxName: 'BoardLight',
    dayScheduled: 'Thursday',
    date: '2026-10-15',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Dolibarr ERP exploitation (CVE-2023-30253), Enlighten Linux desktop root privilege escalation',
    solved: false,
    writeupCompleted: false
  },

  // Week 4
  {
    id: 'ctf-w4-1',
    weekNumber: 4,
    boxName: 'Devvortex',
    dayScheduled: 'Sunday',
    date: '2026-10-18',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Joomla CVE-2023-23752 information disclosure, password hash cracking, apport-cli crash escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w4-2',
    weekNumber: 4,
    boxName: 'Editorial',
    dayScheduled: 'Tuesday',
    date: '2026-10-20',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'SSRF via book cover URL upload, internal API enumeration, Git history secrets, clone repo sudo escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w4-3',
    weekNumber: 4,
    boxName: 'LinkVortex',
    dayScheduled: 'Thursday',
    date: '2026-10-22',
    os: 'Linux',
    difficulty: 'Easy',
    skillsFocus: 'Symlink traversal, Ghostscript image processing RCE, custom daemon root takeover',
    solved: false,
    writeupCompleted: false
  },

  // Week 5
  {
    id: 'ctf-w5-1',
    weekNumber: 5,
    boxName: 'Jerry',
    dayScheduled: 'Sunday',
    date: '2026-10-25',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Apache Tomcat default credentials, malicious WAR application deployment, direct SYSTEM compromise',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w5-2',
    weekNumber: 5,
    boxName: 'Netmon',
    dayScheduled: 'Tuesday',
    date: '2026-10-27',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Anonymous FTP enumeration, PRTG Network Monitor config backup creds, CVE-2018-9276 authenticated RCE',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w5-3',
    weekNumber: 5,
    boxName: 'ServMon',
    dayScheduled: 'Thursday',
    date: '2026-10-29',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'NVMS-1000 directory traversal, NSClient++ API privilege escalation and command execution',
    solved: false,
    writeupCompleted: false
  },

  // Week 6
  {
    id: 'ctf-w6-1',
    weekNumber: 6,
    boxName: 'Bounty',
    dayScheduled: 'Sunday',
    date: '2026-11-01',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'IIS web server file upload bypass (web.config), JuicyPotato SeImpersonatePrivilege exploitation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w6-2',
    weekNumber: 6,
    boxName: 'Arctic',
    dayScheduled: 'Tuesday',
    date: '2026-11-03',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Adobe ColdFusion 8 path traversal file upload, Chimichurri / MS10-059 privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w6-3',
    weekNumber: 6,
    boxName: 'Buff',
    dayScheduled: 'Thursday',
    date: '2026-11-05',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Gym Management System 1.0 unauthenticated RCE, CloudMe 1.11.2 buffer overflow via local port forward',
    solved: false,
    writeupCompleted: false
  },

  // Week 7
  {
    id: 'ctf-w7-1',
    weekNumber: 7,
    boxName: 'Love',
    dayScheduled: 'Sunday',
    date: '2026-11-08',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Voting System SQLi & file upload, SSRF via Voting demo, AlwaysInstallElevated MSI execution to SYSTEM',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w7-2',
    weekNumber: 7,
    boxName: 'Access',
    dayScheduled: 'Tuesday',
    date: '2026-11-10',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'FTP zip/access db passwords, PST email file analysis, runas stored credentials abuse',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w7-3',
    weekNumber: 7,
    boxName: 'Heist',
    dayScheduled: 'Thursday',
    date: '2026-11-12',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Cisco type 7 password decryption, RPC user enum, memory dump analysis of browser process',
    solved: false,
    writeupCompleted: false
  },

  // Week 8
  {
    id: 'ctf-w8-1',
    weekNumber: 8,
    boxName: 'Active',
    dayScheduled: 'Sunday',
    date: '2026-11-15',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Active Directory SMB enumeration, Groups.xml cpassword decryption, Kerberoasting attack',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w8-2',
    weekNumber: 8,
    boxName: 'Forest',
    dayScheduled: 'Tuesday',
    date: '2026-11-17',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'Active Directory AS-REP roasting, BloodHound path analysis, Exchange Windows Permissions DACL abuse',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w8-3',
    weekNumber: 8,
    boxName: 'Sauna',
    dayScheduled: 'Thursday',
    date: '2026-11-19',
    os: 'Windows',
    difficulty: 'Easy',
    skillsFocus: 'AD user enumeration with kerbrute, AS-REP roast, BloodHound path finding, DCSync attack with secretsdump',
    solved: false,
    writeupCompleted: false
  },

  // Week 9
  {
    id: 'ctf-w9-1',
    weekNumber: 9,
    boxName: 'Monitored',
    dayScheduled: 'Sunday',
    date: '2026-11-22',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'Nagios XI unauthenticated SQL injection, authenticated command injection, NRPE root escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w9-2',
    weekNumber: 9,
    boxName: 'Jarvis',
    dayScheduled: 'Tuesday',
    date: '2026-11-24',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'SQL injection file write into web directory, sudo systemctl script abuse, SimpSimple privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w9-3',
    weekNumber: 9,
    boxName: 'Poison',
    dayScheduled: 'Thursday',
    date: '2026-11-26',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'FreeBSD LFI via PHP script, Apache log poisoning, VNC port tunnel and secret file decryption',
    solved: false,
    writeupCompleted: false
  },

  // Week 10
  {
    id: 'ctf-w10-1',
    weekNumber: 10,
    boxName: 'SolidState',
    dayScheduled: 'Sunday',
    date: '2026-11-29',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'Apache James 2.3.2 RCE, POP3/SMTP mailbox snooping, restricted bash escape, writable cron job script',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w10-2',
    weekNumber: 10,
    boxName: 'TartarSauce',
    dayScheduled: 'Tuesday',
    date: '2026-12-01',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'WordPress plugin RCE, Monstra CMS exploit, sudo tar wildcards privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w10-3',
    weekNumber: 10,
    boxName: 'Nineveh',
    dayScheduled: 'Thursday',
    date: '2026-12-03',
    os: 'Linux',
    difficulty: 'Medium',
    skillsFocus: 'SNMP enumeration, hydra brute-force on phpLiteAdmin, chkrootkit 0.49 local root exploit',
    solved: false,
    writeupCompleted: false
  },

  // Week 11
  {
    id: 'ctf-w11-1',
    weekNumber: 11,
    boxName: 'Chatterbox',
    dayScheduled: 'Sunday',
    date: '2026-12-06',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'Achat buffer overflow without shellcode space constraints, access control list permission modification',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w11-2',
    weekNumber: 11,
    boxName: 'Jeeves',
    dayScheduled: 'Tuesday',
    date: '2026-12-08',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'Jenkins groovy script console execution, alternate data streams (ADS) hidden flag, JuicyPotato privilege escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w11-3',
    weekNumber: 11,
    boxName: 'Querier',
    dayScheduled: 'Thursday',
    date: '2026-12-10',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'Macro-enabled Excel sheet credentials in SMB, MSSQL xp_dirtree NTLM hash capture, xp_cmdshell execution',
    solved: false,
    writeupCompleted: false
  },

  // Week 12
  {
    id: 'ctf-w12-1',
    weekNumber: 12,
    boxName: 'Giddy',
    dayScheduled: 'Sunday',
    date: '2026-12-13',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'MSSQL injection out-of-band SMB hash capture, responder, unquoted service path escalation',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w12-2',
    weekNumber: 12,
    boxName: 'Remote',
    dayScheduled: 'Tuesday',
    date: '2026-12-15',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'Umbraco CMS authenticated RCE, TeamViewer password decryption, RoguePotato or service takeover',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w12-3',
    weekNumber: 12,
    boxName: 'SecNotes',
    dayScheduled: 'Thursday',
    date: '2026-12-17',
    os: 'Windows',
    difficulty: 'Medium',
    skillsFocus: 'SQL injection password reset, SMB file share reconnaissance, WSL bash.exe sub-environment privilege escalation',
    solved: false,
    writeupCompleted: false
  },

  // Week 13
  {
    id: 'ctf-w13-1',
    weekNumber: 13,
    boxName: 'Administrator',
    dayScheduled: 'Sunday',
    date: '2026-12-20',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Joomla RCE, BloodHound Active Directory path traversal, generic all write abuse on domain groups',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w13-2',
    weekNumber: 13,
    boxName: 'Certified',
    dayScheduled: 'Tuesday',
    date: '2026-12-22',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Active Directory Certificate Services (AD CS) ESC1 template vulnerability, Certipy certificate forge & PKINIT',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w13-3',
    weekNumber: 13,
    boxName: 'TheFrizz',
    dayScheduled: 'Thursday',
    date: '2026-12-24',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'AD CS ESC6 SAN flag exploitation, Domain Controller certificate authentication, shadow credentials',
    solved: false,
    writeupCompleted: false
  },

  // Week 14
  {
    id: 'ctf-w14-1',
    weekNumber: 14,
    boxName: 'Escape',
    dayScheduled: 'Sunday',
    date: '2026-12-27',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'MSSQL server linked queries, xp_dirtree coercion, AD CS ESC8 NTLM relay to HTTP enrollment',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w14-2',
    weekNumber: 14,
    boxName: 'Blackfield',
    dayScheduled: 'Tuesday',
    date: '2026-12-29',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'RPC user enum, AS-REP roast, BloodHound ForceChangePassword rights, SeBackupPrivilege NTDS.dit dump',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w14-3',
    weekNumber: 14,
    boxName: 'Flight',
    dayScheduled: 'Thursday',
    date: '2026-12-31',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Web LFI NTLM coercion, IIS credential harvesting, gMSA password retrieval with readGMSAPassword',
    solved: false,
    writeupCompleted: false
  },

  // Week 15
  {
    id: 'ctf-w15-1',
    weekNumber: 15,
    boxName: 'Magic',
    dayScheduled: 'Sunday',
    date: '2027-01-03',
    os: 'Linux',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Magic byte image file upload bypass, MySQL database dump, SUID sysinfo command path hijacking',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w15-2',
    weekNumber: 15,
    boxName: 'Builder',
    dayScheduled: 'Tuesday',
    date: '2027-01-05',
    os: 'Linux',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Jenkins CVE-2024-23897 arbitrary file read, user master key recovery, SSH credential decrypt, sudo docker container escape',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w15-3',
    weekNumber: 15,
    boxName: 'Manager',
    dayScheduled: 'Thursday',
    date: '2027-01-07',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'MSSQL xp_dirtree, web backup zip download, AD CS ESC7 vulnerable CA permissions to issue administrator cert',
    solved: false,
    writeupCompleted: false
  },

  // Week 16
  {
    id: 'ctf-w16-1',
    weekNumber: 16,
    boxName: 'Hospital',
    dayScheduled: 'Sunday',
    date: '2027-01-10',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Ghostscript EPS RCE via webmail upload, shadow credentials or SeImpersonatePrivilege, Domain Controller pivot',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w16-2',
    weekNumber: 16,
    boxName: 'Vintage',
    dayScheduled: 'Tuesday',
    date: '2027-01-12',
    os: 'Windows',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Legacy protocol exploitation, token impersonation, Active Directory trust exploitation across domains',
    solved: false,
    writeupCompleted: false
  },
  {
    id: 'ctf-w16-3',
    weekNumber: 16,
    boxName: 'Reddish',
    dayScheduled: 'Thursday',
    date: '2027-01-14',
    os: 'Linux',
    difficulty: 'Medium-Hard',
    skillsFocus: 'Multi-network container pivoting, Redis unauthenticated cron execution, rsync backup hijacking to host root',
    solved: false,
    writeupCompleted: false
  }
];
