+++
title = 'Tom Barrasso'
date = 2025-11-05
draft = false
type = 'resume'

# Contact Information
name = 'Tom Barrasso'
email = 'tom@barrasso.me'
phone = '(617) 894-7466'
location = 'Boston, MA'
summary = 'Technologist who has successfully launched multiple zero-to-one projects at scale. I work across the software development lifecycle where I bring technical depth, empathetic leadership, and a passion for connecting people with purpose-built technology.'

# Section Toggles
showWorkExperience = true
showEducation = true
showProjects = true
showSkills = false
showTechnologies = false
showLinks = true

# Links (displayed in sidebar with icons)
[links]
github = 'https://github.barrasso.me'
linkedin = 'https://linkedin.barrasso.me'
portfolio = 'https://barrasso.me'

# Footer
resumeGitLink = 'resume.barrasso.me'
+++

<!-- Use shortcodes to structure your resume content -->

{{< work-experience >}}

{{< job
title="Head of Developer Relations"
company="CloudMosa"
location="Remote"
dates="Sept 2024 - Present"
employerUrl="https://www.cloudphone.tech"
companyIcon="cloudmosa"

>}}

- Authored, designed, and developed the [Cloud Phone for Developers]({{< relref "projects/cloud-phone" >}}) website including 4 open source reference applications and tutorials
- Expanded platform reach with 4 podcast guest appearances, 4 promotional videos, 4 guest articles, and 3 presentations at developer Meetups
- Supported dozens of companies and developers via email, Discord, Zoom, and in-person
- Created and grew online communities across Reddit, Discord, Bluesky, and X
- Prospected several regional brands resulting in 6 significant apps published

{{< /job >}}

{{< job
title="Staff Technical Program Manager"
company="Meta"
location="Bellevue, WA"
dates="Feb 2022 - Sept 2024"
employerUrl="https://meta.com"
companyIcon="meta"

>}}

- Executed company-wide data use programs supporting compliance with international privacy regulations like {{< abbr title="General Data Protection Regulation" >}}GDPR{{< /abbr >}}, {{< abbr title="Digital Markets Act" >}}DMA{{< /abbr >}} & {{< abbr title="Digital Services Act" >}}DSA{{< /abbr >}}, {{< abbr title="California Consumer Privacy Act" >}}CCPA{{< /abbr >}}, and {{< abbr title="ePrivacy Directive" >}}ePD{{< /abbr >}}
- Led execution to pilot and scale [Privacy Aware Infrastructure]({{< relref "projects/policy-zones" >}}) (PAI) across 150+ use cases in under 1 year resulting in €14+ billion in fine avoidance
- Promoted in first year; automated annual audits reducing operational cost by 75% {{< abbr title="Year-on-Year" >}}YoY{{< /abbr >}}
  {{< /job >}}

{{< job
title="Technical Program Manager II"
company="Amazon"
location="Seattle, WA"
dates="Apr 2020 - Jan 2022"
employerUrl="https://amazon.com"
companyIcon="amazon"

>}}

- Unblocked [Amazon Pharmacy]({{< relref "projects/amazon-pharmacy" >}}) launch by orchestrating and executing security certification for 54 services spanning 25 teams and an external vendor in a single quarter
- Prioritized & coordinated maintenance of data replication system to mitigate data loss
- Led development of [Supply Chain Standards](https://sustainability.aboutamazon.com/amazon-supply-chain-standards-english.pdf) auditing tool within Amazon Sustainability

{{< /job >}}

{{< job
title="Software Development Engineer II"
company="PillPack/ Amazon Pharmacy"
location="Boston, MA"
dates="Dec 2018 - Apr 2020"
employerUrl="https://pharmacy.amazon.com"
companyIcon="amazon"

>}}

- Architected sales tax calculation and reporting engine, processing 10M+ {{< abbr title="Transactions per Month" >}}txn/month{{< /abbr >}}
- Refactored insurance claim adjudication service for high availability (five nines: 99.999%)
  {{< /job >}}

{{< job
title="UX Engineer"
company="MAARK"
location="Boston, MA"
dates="Aug 2017 - Dec 2018"
employerUrl="https://maark.com"
companyIcon="maark"

>}}

- Lead front-end engineer launching the redesigned [John Hancock Investments]({{< relref "projects/jhinvestments" >}}) website
- Developed components & interactive prototypes for clients like Marriott, Manulife & Merck

{{< /job >}}

{{< section class="new-page print-only" >}} {{< / section >}}

{{< job
title="Research Associate"
company="Finch Therapeutics"
location="Boston, MA"
dates="Jan 2017 - Aug 2017"

>}}

- Developed and standardized methods for {{< abbr title="Gas Chromatography-Mass Spectrometry" >}}GC-MS{{< /abbr >}} short-chain fatty acid (SCFA) analysis
  {{< /job >}}

{{< job
title="Research Assistant"
company="UMass Biogeochemistry"
location="Amherst, MA"
dates="Sept 2014 - May 2016"

>}}

- Researched [undergraduate thesis](https://gsa.confex.com/gsa/2016NE/webprogram/Paper272194.html) linking fecal biomarkers to paleoclimate & human habitation
  {{< /job >}}

{{< job
title="Software Engineer"
company="PlanGrid"
location="San Francisco, CA"
dates="July 2012 - July 2013"
employerUrl="https://plangrid.com"
companyIcon="plangrid"

>}}

- Developed the first version of the blueprint reader [PlanGrid for Android]({{< relref "projects/plangrid" >}}) tablets
  {{< /job >}}

{{< job
title="CSAIL Teaching Fellow"
company="Harvard University"
location="Cambridge, MA"
companyIcon="harvard"
dates="Sept 2011 - June 2012"
employerUrl="https://pll.harvard.edu/course/cs50-introduction-computer-science"

>}}

- Lectured & graded for CS50 & CS75: Introduction to Computer Science and Web Development
  {{< /job >}}

{{< job
title="Software Intern"
company="inTouch Corp"
location="Cambridge, MA"
dates="May 2010 - Aug 2011"
companyIcon="intouch"
employerUrl="https://www.intouchcorp.com/"

>}}

- Developed the [TextMyFood]({{< relref "projects/textmyfood" >}}) prototype, a service for restaurants to receive orders via {{< abbr title="Short Message Service" >}}SMS{{< /abbr >}}
  {{< /job >}}

{{< /work-experience >}}

{{< education >}}

{{< degree
  school="University of Massachusetts Amherst"
  subject="Chemistry, BS"
  location="Amherst, MA"
  dates="2012 - 2016"
/>}}

{{< /education >}}

{{< resume-projects >}}

{{< resume-project
title="Founder, PodLP"
dates="2020 - Present"

>}}
> Developed & monetized [PodLP]({{< relref "projects/podlp" >}}), a flip phone podcast app surpassing **10M+ installs**; **>$100k** {{< abbr title="Lifetime Revenue" >}}**LTR**{{< /abbr >}}
> {{< /resume-project >}}

{{< resume-project
title="Android Developer"
dates="2010 - 2015"

>}}
> Built 12+ apps, notably [StatusBar+]({{< relref "projects/statusbarplus" >}}), [ChargeBar]({{< relref "projects/chargebar" >}}), & [Noyze]({{< relref "projects/noyze" >}}) totalling **2M+ installs**; **2 apps acquired**
> {{< /resume-project >}}

{{< /resume-projects >}}

{{< sidebar >}}

{{< sidebar-section title="Skills" style="list" headingSize="lg" >}}
{{< abbr title="Cross-Functional" >}}XFN{{< /abbr >}} Program Management
Product Strategy & Roadmapping
Documentation Writing
Developer Relations & Advocacy
Cloud Architecture
Security & Privacy Compliance
Agile Development
Development & Mentorship
Change Management
Test-Driven Development
Agentic Coding
{{< /sidebar-section >}}

{{< sidebar-section title="Technologies" style="pills" >}}
TypeScript
JavaScript
Node.js
Java
PHP
Ruby on Rails
RSpec
Svelte
React
SQL
REST
Vite
Git
Playwright
Babel
GraphQL
AWS
Cloudflare
Docker
CI/CD
HTML
CSS
{{< /sidebar-section >}}

{{< section class="new-page print-only" >}} {{< / section >}}

{{< sidebar-section title="Interests" style="list" >}}
Privacy by design
Digital accessibility (a11y)
Sustainable computation
Responsible innovation
Attention resilience
{{< /sidebar-section >}}

{{< /sidebar >}}
