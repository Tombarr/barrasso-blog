+++
title = 'reClock'
date = 2014-02-24
draft = false
type = 'projects'

summary = 'An Android clock widget designed to make you think'
icon = '/images/icons/reclock.png'
technologies = ['Android', 'Java', 'AppWidgetProvider', 'Gradle']
dateRange = '2013 - 2014'
featured = false

featureImage = '/images/features/reclock-feature.png'
featureImageCaption = 'Screenshot of reClock on the homescreen of an Android tablet'
featureImagePosition = 'bottom'
screenshots = []
projectUrl = 'http://www.droid-life.com/2013/06/11/reclock-text-widget-bringing-the-minimal-back-to-our-homescreens/'
githubUrl = ''
+++

{{< youtube id="P9W0jKnOMyA" start="654" end="705" >}}

{{< br >}}
reClock was a small experiment developed in collaboration with [Graham Macphee](https://grahammacphee.com/), designed to be the minimalist clock widget that you actually _have_ to read. Attention is in short supply and this often often leads to a form of amnesia where you forget what you just read. reClock used random offsets to indicate the time in a format like "six until twelve twenty five" or "quarter past nine o'two."

{{< br >}}
Far from the most complex widget, reClock still presented a challenge both in human psychology and efficient rasterization. At the time, [`JobScheduler`](https://developer.android.com/reference/android/app/job/JobScheduler) was not available and the simplest (but least efficient) way to render a widget was to run a background service. reClock pre-rendered several updates for each minute until the countdown occured, and simply called into [`AppWidgetManager`](https://developer.android.com/reference/android/appwidget/AppWidgetManager) to cycle through pre-renders.

{{< br >}}
{{< img src="reclock-panel.png" alt="reClock Screenshots" >}}
