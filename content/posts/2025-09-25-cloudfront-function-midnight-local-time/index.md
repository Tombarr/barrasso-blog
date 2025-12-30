+++
title = 'Rotating content daily with Cloudfront Functions'
date = 2025-09-25
draft = false
categories = ['JavaScript', 'AWS', 'Cloudfront']
tags = ['AWS', 'JavaScript', 'Cloudfront']
summary = 'How to use Cloudfront Functions to rotate content daily at (roughly) midnight local time.'
banner = 'time-zone-offsets.png'
bannerCaption = 'Mapping IANA time zone names to UTC offsets in a Cloudfront Function'
showBanner = false
+++

How to use Cloudfront Functions to rotate content daily at _roughly_ midnight local time.

## Content Rotation

I built two projects for the [Yoto Hackathon](https://yoto.space/news/post/build-a-yoto-app-and-you-could-win-up-to-5-000-hQVNmKqCsfLNoj0): [Backyard Birds]({{< relref "projects/backyard-birds" >}}) and [Fez the Cat](https://yoto.space/developers/post/fez-the-cat-7XbFLVY7sXNlNVA). Fez tells a new story each each that contains every letter of the alphabet, except for one letter that listeners need to guess.

Fez's stories are _almost_ **[pangrams](https://en.wikipedia.org/wiki/Pangram)**, the most famous pangram being:

> The quick brown fox jumps over the lazy dog

After writing and editing 26 scripts (one for each letter A-Z), I used [ElevenLabs](https://elevenlabs.io/) to generate audio using a custom voice. Now with 26 MP3 files, I needed to automatically change the story of the day. Yoto allows playlists to include [streaming tracks](https://yoto.dev/myo/streaming-tracks/) where the device makes an HTTP requests to a static URL each time the user inserts the card.

To rotate content daily I considered:

- Serving fully static using Cloudfront with an S3 origin, then using a Lambda function on a daily [EventBridge scheduler](https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html) to copy one of the 26 stories as "today's story"
- Serving static content using either a [Cloudfront Function](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) or Lambda@Edge function to select an S3 object based on the current day in the user's local time using the [`CloudFront-Viewer-Time-Zone` header](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/adding-cloudfront-headers.html)

I choose the second option because it's cumbersome to explain that, "the story updates every day at Midnight UTC." I opted instead for a Cloufront Function because they are very low latency and _much cheaper_ than Lambda@Edge. Cloudfront Functions cost a flat $0.10 per 1 million invocations vs. Lambda@Edge which costs approximately $0.60 per 1 million invocations (price depends on region) plus execution time and memory measured in GB-seconds.

There's nothing wrong with Lambda@Edge, I was just feeling frugal plus **What Could Go Wrong?™**

### Limited Runtime

Cloudfront Functions has a [very limited runtime](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-features.html). The more recent `cloudfront-js-2.0` runtime supports ECMAScript 5.1 and _some_ ES6 features. Notably, it lacks networking (no `fetch`), file system access (no `fs`), environment variables, or timers.

Important for me, the [`Date.toLocaleString` implementation](https://repost.aws/questions/QUjbND1VmvQp2LLe1K211Fwg/is-date-tolocalestring-supported-in-cloudfrontfunctions) supported in Cloudfront Functions follows the ECMAScript 5.1 standard where it accepts no arguments. What could have just been a single line with `now.toLocaleString("de-DE", { timeZone: 'Europe/Berlin'})` got a lot more complicated.

### Ask ChatGPT

TLDR - Don't ask AI when there is lot of nuance in a specific runtime environment.

I made the mistake of asking ChatGPT, Claude, and Gemini for help. Each gave me a convincing option. One response suggested I use the **non-existent `CloudFront-Viewer-Time-Offset` header** to calculate time in UTC and offset it according to the user's local time. This would have been great, except a [GitHub search](https://github.com/search?q=%22CloudFront-Viewer-Time-Offset%22&type=code) yielded exactly 0 results.

Another response indicated that I could use the [`Date.toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString) function which, "returns a string with a language-sensitive representation of the date portion of this date in the local timezone." _Spoiler alert_: The Cloudfront Functions runtime doesn't support the `Intl` API, and **"local time" is function start time**, always in UTC. This makes sense since all Cloudfront Functions have a **strict 1ms execution limit**!

### Time to Pivot?

At this point, it would have been much simpler to just migrate over to Lambda@Edge which supports the [`nodejs22.x` runtime](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-edge-function-restrictions.html#lambda-at-edge-restrictions-runtime), but I was determined to shoehorn a solution using Cloudfront Functions! I could calculate Midnight UTC, and I knew the IANA name of the user's timezone, so I just needed to map IANA names to UTC offsets to calculate midnight local time.

To map IANA timezones to UTC offsets I considered:

- Storing timezone name to UTC offsets in [Cloudfront KeyValueStore](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/kvs-with-functions.html)
- Using an NPM package that contained the mappings
- Inlining the mappings within my application code

Another important limitation of Cloudfront Functions is that the [maximum function size](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html) is just 10 KB! Unfortunately, I could not find any NPM packages that would comfortably fit within that limit. Cloudfront KeyValueStore isn't too expensive at [$0.03 per 1 million reads](https://aws.amazon.com/cloudfront/pricing/), and probably would have been a convenient long-term solution, especially if I had multiple functions rotating content and reading from the same KV store.

### Time Zone Mappings

I opted to have Gemini create a map from IANA time zone name to UTC offset. To keep the mapping well within the 10 KB limit, I adjusted the mapping structure for the smallest file size. The original mapping was a single map like `{ "Africa/Kigali": 120 }`, but it was well above 10 KB. Smaller was a nested variant representing IANA time zone names like `Africa/Kigali` mapping to `Africa.Kigali` with the timezone offset at index `17` in the `UTC_OFFSETS_IN_MINUTES` array.

```js
const UTC_OFFSETS_IN_MINUTES = [
  -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180,
  -150, -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360,
  390, 420, 480, 525, 540, 570, 600, 630, 660, 720, 765, 780, 840
];

const TIMEZONES = {
  Africa: {
    Abidjan: 15, Accra: 15, Addis_Ababa: 18, Algiers: 16, Asmara: 18, Asmera: 18,
    Bamako: 15, Bangui: 16, Banjul: 15, Bissau: 15, Blantyre: 17, Brazzaville: 16,
    Bujumbura: 17, Cairo: 17, Casablanca: 16, Ceuta: 16, Conakry: 15, Dakar: 15,
    Dar_es_Salaam: 18, Djibouti: 18, Douala: 16, El_Aaiun: 16, Freetown: 15,
    Gaborone: 17, Harare: 17, Johannesburg: 17, Juba: 17, Kampala: 18, Khartoum: 17,
    Kigali: 17, Kinshasa: 16, Lagos: 16, Libreville: 16, Lome: 15, Luanda: 16,
    Lubumbashi: 17, Lusaka: 17, Malabo: 16, Maputo: 17, Maseru: 17, Mbabane: 17,
    Mogadishu: 18, Monrovia: 15, Nairobi: 18, Ndjamena: 16, Niamey: 16,
    Nouakchott: 15, Ouagadougou: 15, 'Porto-Novo': 16, Sao_Tome: 15, Timbuktu: 15,
    Tripoli: 17, Tunis: 16, Windhoek: 17
  },
  // ...
];
```

Still fairly clean, this version was 9.98 KB (7.1 KB minified), and I still needed space for my function code. After a few more attempts, I landed on:

```js
const offsets = [
  -720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180,
  -150, -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360,
  390, 420, 480, 525, 540, 570, 600, 630, 660, 720, 765, 780, 840
];

const zones = {
  Africa: {
    15: 'Abidjan Accra Bamako Banjul Bissau Conakry Dakar Freetown Lome Monrovia Nouakchott Ouagadougou Sao_Tome Timbuktu',
    16: 'Algiers Bangui Brazzaville Casablanca Ceuta Douala El_Aaiun Kinshasa Lagos Libreville Luanda Malabo Ndjamena Niamey Porto-Novo Tunis',
    17: 'Blantyre Bujumbura Cairo Gaborone Harare Johannesburg Juba Khartoum Kigali Lubumbashi Lusaka Maputo Maseru Mbabane Tripoli Windhoek',
    18: 'Addis_Ababa Asmara Asmera Dar_es_Salaam Djibouti Kampala Mogadishu Nairobi'
  },
  // ...
];
```

I estimated that I needed about ~3.5 KB for my function code unminified, and this representation got down to 6.4 KB minified so it fit! The full mapping is available below as a [GitHub Gist](https://gist.github.com/Tombarr/376c057b7adc2e3df74aaee031b4c637).

## What about Daylight Savings?

This static timezone mapping has several obvious ~flaws~ limitations, most notably:

- It's static: sometimes countries or territories change timezones
- It doesn't account for Daylight Savings Time (DST)

That said, countries changing timezones isn't a frequent occurrence. It's even less likely that I'll have many users in such countries. Plus, there's growing evidence that [daylight savings is unhealthy](https://www.health.harvard.edu/staying-healthy/the-dark-side-of-daylight-saving-time).

So this approach doesn't really rotate content at mightnight local time. Instead, it adjusts at approximately **midnight ±1 hour local time**, which I'd say is Good Enough™.

## Complete Timezone Mapping

This function is intended to map timezone names to UTC offsets (in minutes), and fit within the constraints of the Cloudfront Function runtime environment without any external dependencies.

{{< gist "Tombarr" "376c057b7adc2e3df74aaee031b4c637" >}}
