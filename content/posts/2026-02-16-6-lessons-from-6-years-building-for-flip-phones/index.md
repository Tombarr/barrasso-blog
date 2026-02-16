+++
title = '6 lessons from 6 years building software for flip phones'
date = 2026-02-16
draft = false
categories = ['Lessons', 'Software', 'PodLP']
tags = ['Software', 'Business', 'Flip Phones', 'PodLP']
summary = 'Lessons navigating the small, the fragmented, and the persistent'
banner = 'road-yellowstone.jpeg'
bannerCaption = 'Big sky and open road near Yellowstone National Park'
showBanner = true
+++

I started [PodLP](https://podlp.com) in 2020 with no clue it would lead me give talks with 20,000+ aspiring Indian developers and take calls from a New Zealand campground with Bangladesh's largest telecom company. It's now 2026, I just launched [PodLP for Android](https://www.podcastvideos.com/articles/dumbphones-podlp-podcast-app/), and I still don't know where it all ends.

Like many, the COVID-19 pandemic gave me sudden free time. Curious to try a "digital detox," I wanted a flip phone for camping trips. However, the phones then on the market (like the [Go Flip 3](https://amzn.to/3MbIom8)) didn't have a podcast app, so I built one.

Fast forward to 2026, I've built (and rebuilt) PodLP for three very different platforms: [KaiOS](https://www.kaiostech.com/), [Cloud Phone](https://developer.cloudfone.com/), and [Android](https://developer.android.com/). It's been downloaded over 10 million times across 175+ countries. For many, it was their introduction to podcasts. While its growth has ebbed and flowed, PodLP has proved to be both a successful side hustle and technical playground.

These lessons might apply to starting a one-person billion-dollar company, but they are relevant for bootstrapping an impactful consumer-facing application without quitting your day job.

## 1. Leave the crowds

Podcast apps are a popular genre for burgeoning programmers; building one requires learning networking, parsing, UX, data storage, and media playback. While it's a valid way to grow as an engineer, most podcast apps never leave GitHub. If you do publish on Google Play or the Apple App Store, yours is often lost in a sea of apps.

{{< responsive-image src="podlp-installs-2020.png" alt="Google Analytics for PodLP" caption="PodLP launches on the JioStore" class="no-border contain mx-auto" >}}

Skip the crowds and launch somewhere you can get organic installs. When I launched PodLP on the JioStore for the JioPhone in India, I saw 100,000+ installs on the first day. Within days there were [dozens of YouTube videos](https://www.youtube.com/results?search_query=PodLP) featuring PodLP. All with $0 in ad spend.

The challenge is picking the *right* app store when there are so many. For Android there's [F-Droid](https://f-droid.org/en/) (if your app is open source), [Huawei AppGallery](https://consumer.huawei.com/en/mobileservices/appgallery/) in China, [Tencent Appstore](https://appstore.tencent.com/), and [Palm Store](https://dev.dlightek.com/services/app) from Transsion. For browser extensions there's the [Naver Whale Store](https://store.whale.naver.com) in Korea and [Opera add-ons](https://addons.opera.com/en/). For TVs and set-top boxes (STBs) there's the [Jio Developer Program](https://developer.jio.com/), [LG's Content Store](https://us.lgappstv.com/main/tvapp) for webOS, and the [Foxxum App Store](https://foxxum.com/). For games there's [JioGames](https://developer.jiogames.com/). For web apps there's [KaiOS](https://developer.kaiostech.com/) and [Cloud Phone](https://developer.cloudfone.com/). Even the [Yoto kids speaker](https://yoto.dev/) has an API! This list isn't remotely exhaustive.

The lessons you'll learn measuring engagement, debugging crashes, localizing for diverse markets, generating marketing material, and responding to real user feedback are irreplaceable.

## 2. The riches are (still) in the niches

Ask AI to write a KaiOS app, then try to run it on a [TCL Flip 4 5G](https://amzn.to/4tzfpcx). There's a good chance it will hallucinate non-existent APIs, and it won't natively handle directional pad or soft-key navigation unless prompted. You still can't effectively "vibe code" a decent flip phone app.

In the process of building apps for niche platforms, you'll learn that **documentation lies**. Maybe the docs are out of date. Maybe that feature was never built. Maybe its behind an undocumented permission or feature flag. Maybe it only works on one model. You might have to [reverse engineer]({{< relref "posts/2026-01-11-android-reverse-engineering-with-opencode" >}}) hidden APIs and while you're looking, stumble upon an "undocumented API" that accidentally grants you [root shell access from the browser](https://kaios.dev/2023/05/cve-2023-33294-kaios-3.0-root-command-line-in-browser-via-tct-web-server/). These things happen.

This mess is infuriating, but it is exactly why AI has little hope of displacing human labor here. **The real world is messy**. It requires forging relationships, compliance with arcane rules, and access to hard-to-obtain physical devices.

Despite selling ~150M units, good luck buying a [JioPhone](https://kaios.dev/2023/08/whats-next-for-the-jiophone/) in the United States. Yet somehow I built a JioPhone collection including the JioPhone 1, 2 & Next thanks to serendipity, relationships, and perseverance. One from a [r/KaiOS Discord](https://www.reddit.com/r/KaiOS/) member, one via an eBay alert, and one shipped on trust from a translator in India.

Knowing this gives me hope. The future remains full of niches that AI agents can't or won't touch because the opportunities are too small, too fragmented, too messy, and too physical.

## 3. Stick with it

The full picture requires a focus to ignore "the next thing," a time horizon in years not minutes, and a psychological "context window" well beyond one million tokens.

{{< responsive-image src="podlp-white-board.jpeg" alt="PodLP Whiteboard" caption="Outlining PodLP.com on a whiteboard" class="w-full no-border contain" >}}

It's easy to get **[shiny object syndrome](https://en.wikipedia.org/wiki/Shiny_object_syndrome)**. Trends come and go. One minute everyone is "cloud native", then suddenly everyone is moving back on-prem. IoT, Big Data, and Edge Computing all had their 15 minutes. Now the talk of the Gas Town is AI. Surprisingly few people stick with someone long enough to see it through before getting caught in the next hype cycle.

Because of PodLP and my blog ([KaiOS.dev](https://kaios.dev)), I was contacted to build [Vipaso]({{< relref "projects/vipaso" >}}), a Bluetooth payment app, and support Developer Relations for [CloudMosa]({{< relref "projects/cloud-phone" >}}). I recognize it sounds egotistical, but in some ways, these opportunities were created *for me*. Had I (or someone like me) not turned up in a search result, these opportunities likely would've never appeared on a job board.

You can't know where it will go unless you stick with it.

## 4. The power of "Wow!"

It has never been easier to bake the same cookies everyone else is baking. Using AI, you can generated a polished set of Tailwind landing pages in seconds, but with results that look nearly identical to everyone else.

Not every application needs a custom component library, but don't overlook the power of "wow!" People remember something distinct, something they never thought was possible. As one Reddit user [commented](https://www.reddit.com/r/dumbphones/comments/1r2zkmf/comment/o58myp6/), I'm "surprised you got the native menu row to work on the Kyocera... impressive, it actually feels almost native."

Spend the extra minute: **prompt something novel into existence**, preferably not in [AI purple](https://dev.to/jaainil/ai-purple-problem-make-your-ui-unmistakable-3ono).

## 5. Technical lesson: memory matters

{{< responsive-image src="lg-oom.png" alt="PodLP Crash Screenshot" caption="OutOfMemoryError from PodLP on the LG Wine 2" class="no-border contain mx-auto" >}}

Now for some nerd talk. Most of what I've built is I/O bound. For flip phones, a major hurdle is out-of-memory (OOM) errors. I soon discovered how big podcasts get. Take Blue Wire's [Pack-a-Day Podcast](https://podnews.net/podcast/i4u97) as an example.

* The RSS feed on Simplecast is 12.97MB of XML!
* The artwork is a 3000x3000 PNG totalling 251KB
* There are 4,275+ episodes averaging ~56MB

Now consider the `build.prop` from my [LG Wine 2](https://amzn.to/4bXyO0D) (2020), a flip phone with 1GB RAM running Android Go.

```text
[dalvik.vm.heapgrowthlimit]: [128m]
[dalvik.vm.heapsize]: [36m]
```

With a 36MB heap limit, every byte counts. I probably should have ignored the LG Wine 2, but I wanted PodLP to work well on low-end phones. I implemented:

* **Chunking & streaming**. I moved away from `JSON.parse` or `responseXML`, which loads the whole document into memory. Instead, I used stream parsing and tools like [Kotlin Flows](https://developer.android.com/kotlin/flow). For audio I used [`Range` requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests), chunking, or streaming (based on what's available).
* **Don't be transparent**. Images are collections of pixels. Android's default `ARGB_8888` format uses 32 bits per pixel, but, flip phones don't exactly have Retina displays. Switching to [`RGB_565`](https://developer.android.com/reference/android/graphics/Bitmap.Config#RGB_565) uses only 16 bits, doubling the number of images I can display.
* **Take control**. On native platforms like Android, I switched from the default to [OkHttpDataSource](https://developer.android.com/media/media3/exoplayer/network-stacks) to share the same connect and thread pools, add interceptors for Brotli and GZIP compression, support HTTP/2 multiplexing, and have more consistent buffer size control.

In the end, getting PodLP to work on low-end phones like the LG Wine 2 meant it ran faster on newer devices with better hardware like the Sonim XP3+ and Kyocera DuraXV.

## 6. It only gets easier

When I started PodLP, podcast APIs were paid. I built my own directory, and now there's a free and open source [Podcast Index](https://podcastindex.org/).

When I started, low-cost distributed databases didn't exist. I made my own SQLite on Elastic File Service (EFS) that supported millions of users for pennies per month. Now services like Amazon Aurora Serverless and Cloudflare D1 are easy to use and scale to zero.

My first Cloud Phone was a Nokia 110 4G with a QQVGA (128x160) screen using a 4G SIM card from Red Pocket. I would debug remotely using tools like [RemoteJS](https://remotejs.com/). Now there's a [Cloud Phone Simulator](https://developer.cloudfone.com/docs/guides/developer-tools/#cloud-phone-debugger) that runs a full developer console in your browser.

In 2024, I wrote the first–and only–guide to [publishing on the JioStore](https://kaios.dev/2024/11/the-definitive-guide-to-publishing-kaios-apps-on-the-jiostore/) for JioPhone. After having nearly a dozen builds rejected were the complete set of rules and requirements shared with me. Things like using a four digit version code, supporting IPv6-only networks (without NAT64), and displaying an exit confirmation dialog.

As time moves on, eventually someone else will share your problem, and eventually someone else fix it. Each problem could itself become a new product or pivot. Either way, you can make it easier for someone else, or someone else can make it easier for you. But it only gets easier.

### Closing thoughts

{{< responsive-image src="marked-access-ends.jpeg" alt="Marked Access Ends Here" caption="Marked Access Ends Here" class="w-full no-border contain" >}}

I find [writing *creates* clarity](https://www.psypost.org/neuroscience-explains-why-writing-creates-mental-clarity/). This article scratches the surface of a journey that's taken me–and continues to take me–around the world. It's taught me the immense value of the small, the fragmented, and the persistent.
