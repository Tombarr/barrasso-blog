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
summary = '<b>Technical Program Leader • Cross-Functional Delivery • Metrics-Driven Architect</b><br />10+ years launching zero-to-one products with experience coordinating researchers, engineers, designers, and product teams across privacy compliance, healthcare, and consumer applications.'

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

<!-- prettier-ignore -->
{{< job
title="Head of Developer Relations"
company="CloudMosa"
location="Remote"
dates="Sept 2024 - Dec 2025"
employerUrl="https://www.cloudphone.tech"
companyIcon="cloudmosa" >}}

- Authored, designed, and developed the [Cloud Phone for Developers]({{< relref "projects/cloud-phone" >}}) website
- **Published 5 open-source reference applications**, libraries, and accompanying tutorials
- Drove platform adoption via podcasts, video, guest articles, and developer talks in 4 countries
- Captured and analyzed developer signals to define product needs around platform usability
- Built and grew developer communities across Reddit, Discord, Bluesky, and X
- Prospected regional brands, resulting in **6 enterprise applications published** to the platform

{{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Staff Technical Program Manager"
company="Meta"
location="Bellevue, WA"
dates="Feb 2022 - Sept 2024"
employerUrl="https://meta.com"
companyIcon="meta" >}}

- Executed **company-wide data governance programs** ensuring compliance with international privacy regulations including GDPR, DMA, DSA, CCPA, and ePD
- Architected a scalable metrics framework with Privacy Data Science, **quantifying developer productivity and onboarding cost** using time-to-proficiency and time-in-motion analysis
- Led execution to integrate and scale [Privacy Aware Infrastructure]({{< relref "projects/policy-zones" >}}) (PAI) across 150+ use cases in under 1 year, **mitigating €14B+ in regulatory risk**
- Automated annual compliance audits, reducing operational costs by 75% {{< abbr title="Year-on-Year" >}}YoY{{< /abbr >}}

  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Technical Program Manager II"
company="Amazon"
location="Seattle, WA"
dates="Apr 2020 - Jan 2022"
employerUrl="https://amazon.com"
companyIcon="amazon" >}}

- Unblocked [Amazon Pharmacy]({{< relref "projects/amazon-pharmacy" >}}) launch by **orchestrating security certification** across 54 services, 25 teams, and 1 external vendor in a single quarter
- Reduced user-facing SEV1 volume by 60% leading critical data replication system improvements
- Drove development of [Supply Chain Standards](https://sustainability.aboutamazon.com/amazon-supply-chain-standards-english.pdf) auditing tool for global compliance initiatives

{{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Software Development Engineer II"
company="PillPack/ Amazon Pharmacy"
location="Boston, MA"
dates="Dec 2018 - Apr 2020"
employerUrl="https://pharmacy.amazon.com"
companyIcon="amazon" >}}

- Architected sales tax calculation and reporting engine, processing 10M+ {{< abbr title="Transactions per Month" >}}txn/month{{< /abbr >}}
- Refactored insurance claim adjudication service for high availability (five nines: 99.999%)
  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="UX Engineer"
company="MAARK"
location="Boston, MA"
dates="Aug 2017 - Dec 2018"
employerUrl="https://maark.com"
companyIcon="maark" >}}

- **Led front-end engineering team** launching redesigned [John Hancock Investments]({{< relref "projects/jhinvestments" >}}) website
- Developed interactive prototypes and component libraries for Marriott, Manulife, and Merck

{{< /job >}}

{{< section class="new-page print-only" >}} {{< / section >}}

<!-- prettier-ignore -->
{{< job
title="Research Associate"
company="Finch Therapeutics"
location="Boston, MA"
dates="Jan 2017 - Aug 2017" >}}

- Standardized {{< abbr title="Gas Chromatography-Mass Spectrometry" >}}GC-MS{{< /abbr >}} methodology for short-chain fatty acid (SCFA) analysis, improving analytical consistency and throughput by shortening run times more than 80%
  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Research Assistant"
company="UMass Biogeochemistry"
location="Amherst, MA"
dates="Sept 2014 - May 2016" >}}

- Conducted [undergraduate thesis](https://gsa.confex.com/gsa/2016NE/webprogram/Paper272194.html) research linking fecal biomarkers to paleoclimate patterns and human habitation, presented at [2015 {{< abbr title="Geological Society of America" >}}GSA{{< /abbr >}} Conference](https://gsa.confex.com/gsa/2015NE/webprogram/Paper253007.html)
  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Software Engineer"
company="PlanGrid"
location="San Francisco, CA"
dates="July 2012 - July 2013"
employerUrl="https://plangrid.com"
companyIcon="plangrid" >}}

- Independently developed the first version of the blueprint reader [PlanGrid for Android]({{< relref "projects/plangrid" >}}) tablets
  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="CSAIL Teaching Fellow"
company="Harvard University"
location="Cambridge, MA"
companyIcon="harvard"
dates="Sept 2011 - June 2012"
employerUrl="https://pll.harvard.edu/course/cs50-introduction-computer-science" >}}

- Lectured & graded for CS50 & CS75: Introduction to Computer Science and Web Development
  {{< /job >}}

<!-- prettier-ignore -->
{{< job
title="Software Intern"
company="inTouch Corp"
location="Cambridge, MA"
dates="May 2010 - Aug 2011"
companyIcon="intouch"
employerUrl="https://www.intouchcorp.com/" >}}

- Developed the [TextMyFood]({{< relref "projects/textmyfood" >}}) prototype, a service for restaurants to receive orders via {{< abbr title="Short Message Service" >}}SMS{{< /abbr >}}
  {{< /job >}}

{{< /work-experience >}}

{{< education >}}

{{< degree
  school="University of Massachusetts Amherst"
  subject="Chemistry, BS"
  location="Amherst, MA"
/>}}

{{< /education >}}

{{< resume-projects >}}

<!-- prettier-ignore -->
{{< resume-project
title="Founder, PodLP"
dates="2020 - Present" >}}
Built and monetized [PodLP]({{< relref "projects/podlp" >}}), a podcast app for flip phones surpassing **10M+ installs** across **175+ countries** generating **$100K+ lifetime revenue**
{{< /resume-project >}}

<!-- prettier-ignore -->
{{< resume-project
title="Android Developer"
dates="2010 - 2015" >}}
Developed and published 12+ Android applications including [StatusBar+]({{< relref "projects/statusbarplus" >}}), [ChargeBar]({{< relref "projects/chargebar" >}}), and [Noyze]({{< relref "projects/noyze" >}}), totaling **2M+ installs** resulting in **2 successful acquisitions**
{{< /resume-project >}}

{{< /resume-projects >}}

{{< sidebar >}}

{{< sidebar-section title="Skills" style="list" headingSize="lg" >}}
Cross-Functional Program Management
Product Strategy & Roadmapping
Technical Documentation
Developer Relations & Advocacy
Cloud Architecture
Security & Privacy Compliance
Agile Development
Team Leadership & Mentorship
Change Management
Test-Driven Development
AI-Assisted Development
{{< /sidebar-section >}}

{{< sidebar-section title="Technologies" style="pills" >}}
TypeScript
JavaScript
Node.js
Java
PHP
Ruby on Rails
Python
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
