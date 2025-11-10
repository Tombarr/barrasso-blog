+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
draft = true
type = 'projects'

# Project metadata
summary = ''
icon = ''
technologies = []
dateRange = ''
company = ''
featured = false

# Images
featureImage = ''
featureImageCaption = ''  # Optional caption displayed below the feature image
featureImagePosition = 'top'  # Options: 'top' (before content), 'bottom' (after content), 'none' (not rendered on single page)
screenshots = []  # Array of image paths (loaded as Hugo resources with width, height, and alt attributes)

# External links
projectUrl = ''
githubUrl = ''
+++

Project description goes here.

## Features

- Feature 1
- Feature 2
- Feature 3

## Technical Details

Add technical details about the project here.
