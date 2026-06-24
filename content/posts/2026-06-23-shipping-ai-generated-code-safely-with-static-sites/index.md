+++
title = 'Shipping AI-Generated Code Safely with Static Sites'
date = 2026-06-23
draft = false
categories = ['AI', 'Static Sites', 'Real Estate']
tags = ['Hugo', 'Claude', 'DuckDB', 'Python', 'Cloudflare', 'Coding Agents']
summary = "Coding agents wrote the pipeline; static generation made it safe to ship. Building a daily-updated real estate site with Claude, Python, DuckDB, and Hugo."
aliases = ['/posts/2026-06-23-coding-agents-data-pipelines-and-static-site-generators/']
banner = 'frontend-backend-meme.png'
bannerCaption = 'Frontend: a clean ground fault circuit interrupter (GFCI) outlet, backend: DIY knob-and-tube electric panel'
showBanner = true
+++

For years, I've built websites using [Hugo](https://gohugo.io/). It powers [this blog](https://barrasso.me), [Cloud Phone for Developers]({{< relref "projects/cloud-phone" >}}), and now my personal real estate website, [Unique Homes Massachusetts](https://uniquehomesma.com). Even early versions of the [PodLP](https://podlp.com) Podcast API were architected as static websites, where the podcatcher crawled RSS feeds, and when the feed content changes, pre-computed API payloads as JSON fragments stored in S3 and hosted by Cloudfront.

Simply put, **any website that can be statically-generated, should be**. With coding agents like [Claude Code](https://claude.ai/referral/1is-TiX1TQ), and serverless platform-as-a-service (PaaS) hosting services like Cloudflare Workers, it's trivial to build frequently-updated, information-dense, custom-designed, affordable static websites. I'll share more context on Unique Homes MA, its architecture, and how I've validated and amortized the use of AI into reproducible, daily builds on Cloudflare Pages.

## Carving out a niche in real estate

As one of the original thirteen colonies, my home state of Massachusetts (MA) has a long and rich history dating back hundreds of years. Despite its size and population, MA punches above its weight when it comes to architectural influence. MA is also a great state to practice real estate, because it has a healthy and growing economy driven by biotech/tech and education. For my niche, I chose to focus on MA's unique historical inventory.

### Massachusetts History & Architecture

The Bay State has had an outsized impact on housing and architecture, where many homes continue to be built to this day in styles originating in MA. A few notable styles include:

#### The Cape Cod

First built in the late 17th century, the Cape Cod style is attributed to Massachusetts' coastal region. The Cape Cod House is one of the US' most recognizable styles, with its steep roof to shed snow, central chimney, and iconic cedar shingles worn to a gray tone.

#### The Saltbox

Named after wooden boxes used to store salt, the Saltbox is basically an asymmetric Cape.

#### New England Triple-Decker

Built in communities like Worcester, Boston, and Fall River to house immigrant workers, the Triple-Decker with matching front and rear porches is another MA contribution to affordable, dense housing.

#### Walter Gropius & Modernists

Walter Gropius, founder of the Bauhaus, brought Modernism to Massachusetts when he joined the Harvard Graduate School of Design in 1937. Along with Carl Koch and fellow members of The Architects Collaborative (TAC), Modernism took shape in Boston suburbs like Lincoln.

## A primer on real estate data

Websites like Zillow and Redfin access property listings through Multiple Listing Services (MLS), which share and vend data to brokerages using the Internet Data Exchange (IDX) format. From a technical perspective, data is typically served in comma-separated value (CSV) format, delimited using the pipe character (`|`), with column names like `LOT_SIZE` in upper-snake case. Booleans are stored as `Yes` and `No`, and IDX consumers need to honor office-level opt out requests or visibility controls like `DisplayOnInternet = No` or `ShowAddress = No`.

Fortunately, these files are manageable in both format and size. The total record for all single-family homes sold in MA in the past year is only ~65MB. The challenge is in reliably stitching together data from a variety of sources accurately and with minimal loss.

### Alternative approaches

Other than IDX feeds, the Real Estate Standards Organization (RESO) maintains a standard for the [RESO Web API](https://www.reso.org/reso-web-api/), including [public specifications](https://github.com/RESOStandards/transport/blob/a99fb6ca307208280ac51bca1f573e89cb67b202/proposals/web-api-core.md). The RESO Web is a RESTful API that serves data in real time, supports reads and writes, and uses OAuth 2.0 & OpenID Connect exchanged in JSON format. The RESO Data Dictionary standardizes fields like `BedroomsTotal` to avoid localized MLS variations.

Compared to IDX feeds, the RESO Web API has more (often non-public) data fields, but comes at a greater cost and with stricter compliance requirements. For lead generation, public IDX data offers enough information to entice prospective buyers.

### Stitching data together

{{< responsive-image src="unique-homes-ma-architecture.png" alt="Architecture of statically-generated website UniqueHomesMA.com" caption="Architecture of UniqueHomesMA.com" class="no-border contain mx-auto" >}}

[Unique Homes MA](https://uniquehomesma.com) pulls parcels, address, deed, location, historical designation, and other data from sources including MLS PIN, Massachusetts Geographic Information Systems (GIS), Massachusetts Cultural Resource Information System (MACRIS), the National Registry of Historic Places (NRHP), and Wikidata. Next, addresses need to be normalized including town suffix (i.e. "Southboro" vs "Southborough"), unit designation, and road abbreviations (i.e. "St" vs "Street").

Some sources provide latitude, longitude, and a radius, while others give specific bounding boxes to identify parcel boundaries. The configuration and logic needed to test and stitch all of this together gets very messy, and is certainly the type of job I'll happily offload to a coding assistant.

Most of the Unique Homes MA pipelines are written in Python. Python has an extensive catalog of libraries for handling data manipulation and transformation. DuckDB is used to store and query listings and property data, primarily driven by flexible query patterns. Lastly, as I mentioned at the start, I'm using [Hugo](https://gohugo.io) as the static-site generator because it's familiar, fast, and flexible. End-to-end pipeline takes ~5 minutes, ~30 seconds of which is `hugo --minify` generating 13,000+ pages.

### Daily updates

Balancing cost and freshness, Unique Homes MA runs a daily cron job using an EventBridge Scheduler that triggers an EC2 instance to run a `systemd` service. When the pipeline and `hugo --minify` build finish (typically in ~5 minutes), the service publishes HTML documents to Cloudflare Pages using `wrangler deploy`, then stops itself. Data is stored on Elastic Block Storage (EBS) to preserve state across execution runs.

### Irregular expressions

I've never enjoyed writing regular expressions (regex), but they're a powerful tool for pattern-matching and extracting information from raw text. Unique Homes MA uses regex extensively to match words and phrases in the listing broker remarks. Claude proposes and validates each expression against historical data, identifies outliers, and continuously improves coverage and accuracy. Unlike calls to `claude -p` from the terminal, regular expressions are deterministic, don't require network access, and cost (effectively) nothing to execute. Combined with other pattern-recognition techniques, this allows Unique Homes MA to quickly identify, catalog, and sort over ten thousand homes by style, builder, and feature.

<u>Note:</u> listing broker remarks are notoriously inconsistent. Character count limits encourage agents to use nicknames (i.e. "Nab Lake" vs "Nabnasset Lake") and abbreviations (i.e. "FHA" instead of "forced hot air"). It's not uncommon to see exaggerations (i.e. "lakefront" vs "lake view"), or typos (i.e. "Sears & Robuck"). Agents are the only sensible solution to identify and match these variations across tens of thousands of regularly-updated listings.

## Why go static?

Static websites have lower costs and fewer security concerns since there's no server to compromise, and no database exposed to internet traffic. They're inherently fast without just-in-time processing.

### Static considerations

Static sites can be hosted just about anywhere including bucket storage like AWS S3 and Cloudflare R2, hosting services like GitHub Pages or Cloudflare Pages, or even a Raspberry Pi running Apache or NGINX. Each comes with trade-offs in terms of cost, content freshness, complexity, and maintenance.

### Why Hugo?

I chose Hugo because I'm familiar with it and it's portable, mature, lightweight, and _fast_. That said, there are dozens of static site generators, so pick one you're familiar with.

### Testing and validation

Every change to Unique Homes MA runs a number of checks including:

* `pytest` unit tests, including [VCR-like](https://anaynayak.medium.com/eliminating-flaky-tests-using-vcr-tests-for-llms-a3feabf90bc5) network replay tests
* `mypy` and `ruff` linting & code formatting
* `hugo --minify` build completion
* HTML validation
* Drop [orphaned links](https://burgeonlab.com/blog/find-orphan-pages-using-python/)

Although dynamic websites might crash or return an HTTP 500 if there's a bug, static sites can silently "fail." Validation checks before and after each site build are important to ensure the website works correctly.

### Mostly static

With PaaS services like Cloudflare Workers, static websites don't have to be 100% static. Workers lets you write small functions for things like handling a contact form or subscribing to an email list. Serverless platforms can then integrate with:

* [Cloudflare Email Service](https://developers.cloudflare.com/email-service/get-started/send-emails/) – requires Workers Paid ($5/m) + $0.35 per 1,000 emails
* AWS Simple Email Service (SES) – $0.10/1000 emails (see [pricing](https://aws.amazon.com/ses/pricing/))
* Third-party APIs – Resend, SendGrid, etc
* Webhooks – [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks), Slack, etc
* Bots – [Telegram](https://core.telegram.org/bots/api)

### Remembering state

While dynamic websites primarily use session cookies to store detailed user information, static websites can still "remember" visitor data using `localStorage`, `sessionStorage`, `indexedDB`, URL query parameters, and other storage technologies.

When visitors to Unique Homes MA click "Request more info" they are taken to a static page that pulls information from `URLSearchParams` about the previous listing. The homepage also displays "Recently viewed" properties stored in `localStorage`, so visitors can quickly find properties they previously considered.

<u>Warning</u>: [do not store sensitive information](https://snyk.io/blog/is-localstorage-safe-to-use/) like identification numbers, passwords, or names in browser storage. It may be vulnerable to cross-site scripting (XSS), is likely stored unencrypted, and can be cleared at any time.

## Closing thoughts

### Crawl then walk

Websites need to be crawled by search engines like Google, Yandex, and Bing in order to be discovered. Don't forget to create a `robots.txt` and register your website in Google Search Console and Bing Webmaster Tools if you want to be discovered.

### When to NOT go static

Static websites are great! But they are _not_ the right solution whenever you regularly store sensitive information or require real-time content updates. If you primarily host user-generated content (UGC), need to control content access, or publish minute-by-minute updates, a dynamic website is almost certainly required.

### Takeaway

This pattern works well: it's cheap, fast, secure, and easy to maintain. Coding agents handle the messy work of stitching data, matching addresses, writing regular expressions, and gluing pipelines together, while static generation keeps the result lean and safe to host just about anywhere. Real estate is only one domain where this pattern proves valuable. Using AI at build time would be more flexible, but substantially increase cost and result in non-deterministic builds.

My takeaway is this: start static, then add dynamic APIs only when necessary because any website that can be statically-generated, should be.
