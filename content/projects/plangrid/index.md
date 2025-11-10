+++
title = 'PlanGrid'
company = 'PlanGrid'
date = 2013-06-10
draft = false
type = 'projects'

# Project metadata
summary = 'Developed the first PlanGrid blueprint reader app for Android tablets'
icon = 'images/icons/plangrid.png'
technologies = ['Android', 'Java', 'Ant', 'Eclipse']
dateRange = '2012 - 2013'
featured = false

# Images
featureImage = '/images/features/plangrid-android-2013.png'
featureImageCaption = 'Early screenshot of PlanGrid for Android on a tablet running Android 4.0 Ice Cream Sandwich (ICS)'
featureImagePosition = 'top'
screenshots = []

# External links
projectUrl = 'https://plangrid.com'
githubUrl = ''
+++

After releasing several notable Android apps including [StatusBar+]({{< relref "projects/statusbarplus" >}}) and [ChargeBar]({{< relref "projects/chargebar" >}}), I was contacted in 2012 by [PlanGrid](https://plangrid.com) to develop the first version of their blueprint reader for Android tablets. At this time, the Android ecosystem was nascent, fragmented, and unstable. I developed several components including [GridFragment](https://github.com/Tombarr/GridFragment) and a tile rendering engine to display high-fidelity blueprints on resource-constrained devices (similar to [TileView](https://github.com/moagrius/TileView)).

{{< br >}}
Android Studio wasn't officially released until December 2014, so early versions of PlanGrid for Android used [Ant](https://ant.apache.org/), [Eclipse](https://eclipseide.org/), and integrated with [Bugsnag](https://www.bugsnag.com/) for crash detection. PlanGrid for Android Beta (v0.1.1) was publicly released in February 2014

{{< br >}}
{{< img src="plangrid-android-release.png" alt="PlanGrid for Android Release Email" class="narrow-img" >}}
