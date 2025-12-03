+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
draft = true
type = 'resume'

# Contact Information
name = ''
email = ''
phone = ''
location = ''
summary = ''

# Section Toggles
showWorkExperience = true
showEducation = true
showProjects = true
showSkills = true
showTechnologies = true
showLinks = true

# Skills (displayed in sidebar)
skills = []

# Technologies (displayed in sidebar)
technologies = []

# Links (displayed in sidebar with icons)
[links]
github = ''
linkedin = ''
portfolio = ''

# Footer
resumeGitLink = 'git.io/resume'
+++

<!-- Use shortcodes to structure your resume content -->

<!-- Sidebar content (Skills, Technologies, etc.) -->
<!-- You can use the new shortcode-based approach OR the legacy frontmatter approach above -->

{{< sidebar >}}

{{< sidebar-section title="Skills" style="list" headingSize="lg" spacing="compact" >}}
JavaScript
TypeScript
React
Node.js
Python
{{< /sidebar-section >}}

{{< sidebar-section title="Technologies" style="pills" >}}
PostgreSQL
Docker
Kubernetes
AWS
Git
{{< /sidebar-section >}}

{{< /sidebar >}}

<!-- Main content sections -->

{{< work-experience >}}

{{< job
title="Senior Software Engineer"
company="Company Name"
location="City, State"
dates="Jan 2020 - Present"
employerUrl="https://example.com"
companyIcon="meta"

> }}

- Led development of key features
- Improved system performance by 50%
- Mentored junior developers
  {{< /job >}}

{{< job
title="Software Engineer"
company="Previous Company"
location="City, State"
dates="Jun 2018 - Dec 2019"

> }}

- Built scalable web applications
- Implemented CI/CD pipelines
- Collaborated with cross-functional teams
  {{< /job >}}

{{< /work-experience >}}

{{< education >}}

{{< degree
school="University Name"
subject="Computer Science, B.S."
location="City, State"
dates="2014 - 2018"

> }}

{{< /education >}}

{{< resume-projects >}}

{{< resume-project
title="Open Source Contribution"
dates="2023"

> }}
> Contributed features and bug fixes to popular open-source projects
> {{< /resume-project >}}

{{< /resume-projects >}}
