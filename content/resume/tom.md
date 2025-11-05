+++
title = 'Tom Barrasso'
date = 2025-11-05
draft = false
type = 'resume'

# Contact Information
name = 'Tom Barrasso'
email = 'tom@barrasso.me'
phone = '617-894-7466'
location = 'Boston, MA'
summary = 'I built stuff'

# Section Toggles
showWorkExperience = true
showEducation = true
showProjects = true
showSkills = true
showTechnologies = true
showLinks = true

# Skills (displayed in sidebar)
skills = ['Software Architecture', 'Leadership', 'Technical Writing']

# Technologies
technologies = ["JavaScript", "React", "Node.js", "Python", "Docker"]

# Links (displayed in sidebar with icons)
[links]
github = 'https://github.com/Tombarr'
linkedin = 'https://linkedin.com/in.tombarrasso'
portfolio = 'https://barrasso.me'

# Footer
resumeGitLink = 'git.io/resume'
+++

<!-- Use shortcodes to structure your resume content -->

{{< work-experience >}}

{{< job
  title="Senior Software Engineer"
  company="Company Name"
  location="City, State"
  dates="Jan 2020 - Present"
>}}
- Led development of key features
- Improved system performance by 50%
- Mentored junior developers
{{< /job >}}

{{< job
  title="Software Engineer"
  company="Previous Company"
  location="City, State"
  dates="Jun 2018 - Dec 2019"
>}}
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
/>}}

{{< /education >}}

{{< resume-projects >}}

{{< resume-project
  title="Open Source Contribution"
  dates="2023"
>}}
Contributed features and bug fixes to popular open-source projects
{{< /resume-project >}}

{{< /resume-projects >}}
