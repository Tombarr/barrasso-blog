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

For years, I've built websites using [Hugo](https://gohugo.io/). It powers [this blog](https://barrasso.me), [Cloud Phone for Developers]({{< relref "projects/cloud-phone" >}}), and now my personal real estate website, [Unique Homes Massachusetts](https://uniquehomesma.com). Even early versions of the [PodLP](https://podlp.com) Podcast API were architected as static websites, where the podcatcher crawled RSS feeds and, when the feed content changed, pre-computed API payloads as JSON fragments stored in S3 and hosted by CloudFront.

Simply put, **any website that can be statically-generated, should be**. With coding agents like [Claude Code](https://claude.ai/referral/1is-TiX1TQ), and serverless platform-as-a-service (PaaS) hosting services like Cloudflare Workers, it's trivial to build frequently-updated, information-dense, custom-designed, affordable static websites. I'll share more context on Unique Homes MA, its architecture, and how I've validated and shifted AI to build time for reproducible, daily builds on Cloudflare Pages.

## Carving out a niche in real estate

As one of the original thirteen colonies, my home state of Massachusetts (MA) has a long and rich history dating back hundreds of years. Despite its size and population, MA punches above its weight when it comes to architectural influence. MA is also a great state to practice real estate, because it has a healthy and growing economy driven by biotech/tech and education. For my niche, I chose to focus on MA's unique historical inventory.

### Massachusetts History & Architecture

The Bay State has had an outsized impact on housing and architecture, where many homes continue to be built to this day in styles originating in MA. A few notable styles include:

#### The Cape Cod

{{< responsive-image src="Oldest_House_in_Brockton_Heights,_MA.jpg" alt="The oldest house in Brockton Heights, a Cape Cod cottage, on a 1910 postcard" caption="The oldest house in Brockton Heights, Brockton, MA, a classic Cape Cod (1910 postcard). [Public domain](https://commons.wikimedia.org/wiki/File:Oldest_House_in_Brockton_Heights,_MA.jpg), via Wikimedia Commons." class="mx-auto" >}}

First built in the late 17th century, the Cape Cod style is attributed to Massachusetts' coastal region. The Cape Cod House is one of the US' most recognizable styles, with its steep roof to shed snow, central chimney, and iconic cedar shingles worn to a gray tone.

#### The Saltbox

{{< responsive-image src="Comfort_Starr_House.jpg" alt="The Comfort Starr House, a colonial saltbox with a long sloping rear roof" caption="The Comfort Starr House in Guilford, CT, a colonial saltbox. Photo from the [Historic American Buildings Survey](https://commons.wikimedia.org/wiki/File:Comfort_Starr_House.jpg) (National Park Service), public domain." class="mx-auto" >}}

Named after wooden boxes used to store salt, the Saltbox is an asymmetric Cape: a steep rear roofline that sweeps down to a single story at the back.

#### New England Triple-Decker

{{< responsive-image src="CambridgeTripleDecker.jpg" alt="A three-story triple-decker house in Cambridge with stacked front porches" caption="A triple-decker in Cambridge, MA, with stacked porches on each floor. Photo by [Bcorr](https://commons.wikimedia.org/wiki/File:CambridgeTripleDecker.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)." class="mx-auto" >}}

Built in communities like Worcester, Boston, and Fall River to house immigrant workers, the Triple-Decker with matching front and rear porches is another MA contribution to affordable, dense housing.

#### Walter Gropius & Modernists

{{< responsive-image src="TAC-designed_Five_Field_House.jpg" alt="A low, flat-roofed midcentury modern house designed by The Architects Collaborative" caption="A TAC-designed house (1954) in the Five Fields neighborhood of Lexington, MA. Photo by [Fothergilla](https://commons.wikimedia.org/wiki/File:TAC-designed_Five_Field_House.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)." class="mx-auto" >}}

Walter Gropius, founder of the Bauhaus, brought Modernism to Massachusetts when he joined the Harvard Graduate School of Design in 1937. Along with Carl Koch and fellow members of The Architects Collaborative (TAC), Modernism took shape in Boston suburbs like Lincoln.

## A primer on real estate data

Websites like Zillow and Redfin access property listings through Multiple Listing Services (MLS), which share and vend data to brokerages using the Internet Data Exchange (IDX) format. From a technical perspective, data is typically served in comma-separated value (CSV) format, delimited using the pipe character (`|`), with column names like `LOT_SIZE` in upper-snake case. Booleans are stored as `Yes` and `No`, and IDX consumers need to honor office-level opt out requests or visibility controls like `DisplayOnInternet = No` or `ShowAddress = No`.

Fortunately, these files are manageable in both format and size. The total records for all single-family homes sold in MA in the past year are only ~65MB. The challenge is in reliably stitching together data from a variety of sources accurately and with minimal loss.

### Alternative approaches

Other than IDX feeds, the Real Estate Standards Organization (RESO) maintains a standard for the [RESO Web API](https://www.reso.org/reso-web-api/), including [public specifications](https://github.com/RESOStandards/transport/blob/a99fb6ca307208280ac51bca1f573e89cb67b202/proposals/web-api-core.md). The RESO Web API is RESTful, serves data in real time, supports reads and writes, and uses OAuth 2.0 & OpenID Connect exchanged in JSON format. The RESO Data Dictionary standardizes fields like `BedroomsTotal` to avoid localized MLS variations.

Compared to IDX feeds, the RESO Web API has more (often non-public) data fields, but comes at a greater cost and with stricter compliance requirements. For lead generation, public IDX data offers enough information to entice prospective buyers.

### Stitching data together

{{< responsive-image src="unique-homes-ma-architecture.png" alt="Data flow diagram showing sources feeding Python pipelines into DuckDB, then Hugo, then Cloudflare Pages" caption="Architecture of UniqueHomesMA.com" class="no-border contain w-full" >}}

[Unique Homes MA](https://uniquehomesma.com) pulls parcels, address, deed, location, historical designation, and other data from sources including MLS PIN, Massachusetts Geographic Information Systems (GIS), Massachusetts Cultural Resource Information System (MACRIS), the National Registry of Historic Places (NRHP), and Wikidata. Next, addresses need to be normalized including town suffix (e.g. "Southboro" vs "Southborough"), unit designation, and road abbreviations (e.g. "St" vs "Street").

Some sources provide latitude, longitude, and a radius, while others give specific bounding boxes to identify parcel boundaries. The configuration and logic needed to test and stitch all of this together gets very messy, and is certainly the type of job I'll happily offload to a coding assistant.

Most of the Unique Homes MA pipelines are written in Python. Python has an extensive catalog of libraries for handling data manipulation and transformation. DuckDB is used to store and query listings and property data. It's embedded (no server to run, so it's cheap), open-source, and reads CSV, Parquet, and time-series data efficiently. Its columnar engine handles full table scans far better than SQLite, which lets me test different categorizations quickly without reshaping the underlying data. Lastly, as I mentioned at the start, I'm using [Hugo](https://gohugo.io) as the static-site generator because it's familiar, fast, and flexible. End-to-end pipeline takes ~5 minutes, ~30 seconds of which is `hugo --minify` generating 13,000+ pages.

### Daily updates

Balancing cost and freshness, Unique Homes MA runs a daily cron job using an EventBridge Scheduler that triggers an EC2 instance to run a `systemd` service. When the pipeline and `hugo --minify` build finish, the service publishes HTML documents to Cloudflare Pages using `wrangler deploy`, then stops itself. Data is stored on Elastic Block Storage (EBS) to preserve state across execution runs.

At $0.034/hour for a `t4g.medium` EC2 instance, $0.05 per GB-month of EBS, and $0.023 per GB-month on S3 (for backups), the **total cost is ~$2.35 per month**, or about **$39 per year** including .com domain registration fees. That's well below common real estate expenses like annual licensure renewal fees, MLS membership dues, or broker desk fees. Compare that to services like [AgentWebsite](https://www.agentwebsite.net/plans-and-prices) that start at $39 _per month_.

### Irregular expressions

I've never enjoyed writing regular expressions (regex), but they're a powerful tool for pattern-matching and extracting information from raw text. Unique Homes MA uses regex extensively to match words and phrases in the listing broker remarks. Claude proposes and validates each expression against historical data, identifies outliers, and continuously improves coverage and accuracy. Unlike calls to `claude -p` from the terminal, regular expressions are deterministic, don't require network access, and cost (effectively) nothing to execute. Combined with other pattern-recognition techniques, this allows Unique Homes MA to quickly identify, catalog, and sort over ten thousand homes by style, builder, and feature.

```python
_ARTS_CRAFTS_STYLE_RE: Final = re.compile(
    r"\barts\s*(?:&|and)\s*crafts[-\s]+"
    r"(?:(?!or\b|and\b|for\b|with\b|studio|rooms?|space|area|office|nook|corner|"
    r"station|closet|loft|den|table)[a-z][\w-]*\s+)?"
    r"(?:home|house|bungalow|colonial|cottage|residence|cape|victorian|tudor|foursquare|"
    r"styled?|movement|period|era|design|architectur\w+|aesthetic|character|charm|"
    r"influenced?|inspired|revival|interior|woodwork|built[\s-]?ins?|detail\w*|trim|"
    r"millwork|gem|beaut\w+|masterpiece|pedigree|flair|grandeur|elements?)\b",
    re.IGNORECASE,
)
```

For example, this gnarly regular expression is used as a signal to classify a property as [Arts and Crafts style](https://en.wikipedia.org/wiki/Arts_and_Crafts_movement). Combined with other signals like build year and MLS style codes, this categorizes properties described as "historic Arts & Crafts Colonial built by F.A. Day," while ignoring descriptions like "extra space for arts & crafts or office."

<u>Note:</u> listing broker remarks are notoriously inconsistent. Character count limits encourage agents to use nicknames (e.g. "Nab Lake" vs "Nabnasset Lake") and abbreviations (e.g. "FHA" instead of "forced hot air"). It's not uncommon to see exaggerations (e.g. "lakefront" vs "lake view"), or typos (e.g. "Sears & Robuck"). No regular expression or deterministic solution will work perfectly across tens of thousands of listings. Rules must be validated against live listings regularly for accuracy and precision.

## Why go static?

Static websites have lower costs and fewer security concerns since there's no server to compromise, and no database exposed to internet traffic. They're inherently fast without just-in-time processing.

### Static considerations

Static sites can be hosted just about anywhere including bucket storage like AWS S3 and Cloudflare R2, hosting services like GitHub Pages or Cloudflare Pages, or even a Raspberry Pi running Apache or NGINX. Each comes with trade-offs in terms of cost, content freshness, complexity, and maintenance.

### Why Hugo?

I chose Hugo because I'm familiar with it and it's portable, mature, lightweight, and _fast_. That said, there are dozens of static site generators, so pick one you're familiar with.

### Testing and validation

AI-generated code for a static site isn't inherently safer. "Safe to ship" in a static context still requires you to tell the agent what "good" looks like, write tests against that outcome, iterate, build, and ship. To keep token cost low and builds deterministic, an LLM doesn't evaluate and classify listings at build time. Instead, it authors rules inside of a pipeline, gated by tests, that ultimately produce a set of artifacts (namely, Markdown and HTML).

Every change to Unique Homes MA runs a number of checks including:

* `pytest` unit tests, including [VCR-like](https://anaynayak.medium.com/eliminating-flaky-tests-using-vcr-tests-for-llms-a3feabf90bc5) network replay tests
* `mypy` and `ruff` linting & code formatting
* `hugo --minify` build completion
* HTML validation
* Drop [orphaned links](https://burgeonlab.com/blog/find-orphan-pages-using-python/)

Although dynamic websites might crash or return an HTTP 500 if there's a bug, **static sites can silently "fail."** A visitor won't hit an error page and complain. Instead, they won't realize a listing is missing or know when a property goes under contract. Users might click a broken link, notice a discrepancy against Zillow or Redfin, and ultimately leave. Silent failures aren't a blocker, but they do require a different strategy: **detection and validation at build time, before anything ships**. Each build of Unique Homes MA sends me an email through AWS SES so I can keep an eye on whether builds succeed, fail, or stall, instead of quietly serving broken or stale information.

### Mostly static

With PaaS services like Cloudflare Workers, static websites don't have to be 100% static. Workers lets you write small functions for things like handling a contact form or subscribing to an email list. Serverless platforms can then integrate with:

* [Cloudflare Email](https://developers.cloudflare.com/email-service/get-started/send-emails/) – Workers Paid ($5/m) + $0.35/1,000 emails
* AWS Simple Email Service (SES) – $0.10/1000 emails (see [pricing](https://aws.amazon.com/ses/pricing/))
* Third-party APIs – Resend, SendGrid, etc
* Webhooks – [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks), Slack, etc
* Bots – [Telegram](https://core.telegram.org/bots/api)

### Remembering state

While dynamic websites primarily use session cookies to store detailed user information, static websites can still "remember" visitor data using `localStorage`, `sessionStorage`, `indexedDB`, URL query parameters, and other storage technologies.

When visitors to Unique Homes MA click "Request more info" they are taken to a static page that pulls information from `URLSearchParams` about the previous listing. The homepage also displays "Recently viewed" properties stored in `localStorage`, so visitors can quickly find properties they previously considered.

[Never store sensitive information in browser storage](https://snyk.io/blog/is-localstorage-safe-to-use/), like identification numbers, passwords, or names. It may be vulnerable to cross-site scripting (XSS), is likely stored unencrypted, and can be cleared at any time.

## Closing thoughts

### Crawl then walk

Websites need to be crawled by search engines like Google, Yandex, and Bing in order to be discovered. Don't forget to create a [`sitemap.xml`](https://www.sitemaps.org/protocol.html), [`robots.txt`](https://www.robotstxt.org/robotstxt.html), [`llms.txt`](https://llmstxt.org/), include [JSON-LD](https://json-ld.org/) tags, and register your website in [Google Search Console](https://search.google.com/search-console/about) and [Bing Webmaster Tools](https://www.bing.com/webmasters/) if you want to be discovered.

### When to NOT go static

Static websites are great! But they are _not_ the right solution whenever you regularly store sensitive information or require real-time content updates. If you primarily host user-generated content (UGC), need to control content access, or publish minute-by-minute updates, a dynamic website is almost certainly required.

### What I'd do differently

Static websites aren't totally pain free. For me the hardest part was getting started. It would have been far easier to create a website with an embedded `<iframe>` that links to an existing IDX service provider. Regex still misses some listings and misclassifies others. Image classification would almost certainly do better at determining architectural style. Testing Terraform was a huge pain, and right-sizing the EC2 instance was tricky because the workload is spiky (idle stretches waiting on network downloads followed by heavy CPU usage computing nearest-neighbor membership). That said, most of these frustrations and costs are paid one-time for the benefit of low ongoing expenses and creative control.

### Takeaway

This pattern works well: it's cheap, fast, secure, and easy to maintain. Coding agents handle the messy work of stitching data, matching addresses, writing regular expressions, and gluing pipelines together, while static generation keeps the result lean and safe to host just about anywhere. Real estate is only one domain where this pattern proves valuable. Running an LLM at build time would be more flexible, but substantially increase cost and result in non-deterministic builds.

My takeaway is this: start static, then add dynamic APIs only when necessary because any website that can be statically-generated, should be.
