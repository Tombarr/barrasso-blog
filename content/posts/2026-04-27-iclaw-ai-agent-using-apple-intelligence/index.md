+++
title = 'Introducing iClaw, a safe, private, on-device AI agent using Apple Intelligence'
date = 2026-04-27
draft = false
categories = ['iClaw', 'AI', 'Apple Intelligence']
tags = ['Software', 'macOS', 'Apple', 'AI']
summary = "Today I'm announcing iClaw, an on-device AI agent for macOS, and explaining why you can't replicate OpenClaw with Apple's 3B Foundation Model."
banner = 'iClaw-Banner.png'
bannerCaption = 'iClaw AI agent welcome screen on macOS 26'
showBanner = true
+++

I recently shared [Junco]({{< relref "2026-04-09-on-device-coding-with-apple-intelligence" >}}), an on-device AI agent that uses Apple Intelligence to write and edit Swift code. Today I'm sharing [iClaw](https://geticlaw.com), an _experimental_ local AI agent for macOS designed around safety and privacy.

{{< responsive-image src="iClaw-London-Screenrecord.gif" alt="Screen recording of iClaw on macOS" caption="Screen recording of iClaw local AI agent on macOS" class="no-border contain mx-auto" >}}

iClaw started as a [SundAI hackathon project](https://www.sundai.club/projects/aef4852e-7089-4fa0-8780-d45008f8d791) in March. Although our [demo failed](https://www.youtube.com/live/YM7Oe-I8hIw?t=36204), we learned many lessons I'll share. But first:

## Why Build iClaw?

Technologies like [OpenClaw](https://openclaw.ai/) are transformative, and while it's among the fastest-growing GitHub repositories, it hasn't [crossed the chasm](https://en.wikipedia.org/wiki/Crossing_the_Chasm) into mainstream use. I suspect non-technical users lack the time, knowledge, patience, and risk appetite to purchase a Mac Mini and AI credits, configure agents, and give them access to their personal accounts.

iClaw is fundamentally different. It's designed to use the AI you already have (Apple Intelligence), without buying credits or a subscription. Built inside Apple's [App Sandbox](https://developer.apple.com/documentation/security/app-sandbox), iClaw focuses on safety, security, and privacy: it only accesses files, data, and accounts you give it explicit permission to. As a bonus, [on-device AI is green](https://www.weforum.org/stories/2025/03/on-device-ai-energy-system-chatgpt-grok-deepx/)—using orders of magnitude less energy than frontier data centers.

## What can iClaw do?

At present, **iClaw is basically a bad Siri**. Ask it for the weather, a stock quote, a Wikipedia summary, or some basic math. It uses Apple's tools to read calendar events, search through email, transcribe a podcast, or translate a document. But iClaw (and general-purpose on-device AI) has some major limits today. Small models excel at executing a single, narrowly defined task, but they fail at task decomposition and "reading between the lines." If you don't spell out exactly what you want, on-device AI models are much more likely to make mistakes.

What's more exciting is what iClaw _could_ do with an updated model and an improved harness.

### What _could_ iClaw do?

iClaw suffers because it tries to augment a constrained model (Apple's 3B Foundation Model) with natural language processing (NLP) and machine learning (ML) classifiers. As a task gets more complex, or the number of tools expands, the model gets distracted, makes mistakes, or outright refuses to do anything!

In building iClaw, I've explored lots of applications and integration surfaces. Of the many ideas I had for iClaw, a few still hold promise.

- **Personalized Email Triage**: use [MailKit](https://developer.apple.com/documentation/mailkit) and Apple Intelligence to privately and securely triage, tag, filter, forward, and delete incoming emails
- **Mac-iPhone Continuity**: use Apple Intelligence and iCloud Sync to search your MacBook's files via [Spotlight](https://developer.apple.com/documentation/foundation/spotlight) on the go from your iPhone
- **Automate Everything**: use Apple Intelligence to author custom [AppleScript automation](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html) for transcription, conversion, batch image editing, and more
- **Background Browsing**: natively bridge a [Safari Extension](https://developer.apple.com/safari/extensions/) to Apple Intelligence so AI can browse real estate listings, classifieds, and social media on your behalf

Apple itself may be exploring similar applications, with rumors of ["Campos"](https://www.powerpage.org/rumor-apple-developing-ai-based-siri-chatbot-for-ios-27-ipados-27-and-macos-27/), an AI-powered Siri chatbot with access to Photos, Mail, Messages, and more.

### Why On-Device?

Local models aren't just about privacy — they're about [business strategy](https://www.youtube.com/watch?v=RaAFquzj5B8), unit economics, and [experiments](https://www.theregister.com/2026/04/22/anthropic_removes_claude_code_pro/) that indicate venture capital subsidies are ending. It will always be more cost-effective in the long run to use the compute you already have, rather than lease it from someone else.

#### Local Tradeoffs

There's no such thing as a [free lunch](https://en.wikipedia.org/wiki/No_free_lunch_theorem). Apple's [3B Foundation Model](https://machinelearning.apple.com/research/apple-foundation-models-2025-updates) is arguably one of the _worst_ contenders for an on-device agent. It's terrible at following instructions, has a miniscule 4,096 context window, doesn't offer a [native thinking mode](https://rockyshikoku.medium.com/building-a-thinking-mode-with-apples-foundation-models-5601ff5bd430), has aggressive [safety guardrails](https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output), and can be [extremely flakey](https://www.reddit.com/r/swift/comments/1nrv3lo/swiftfoundation_models_framework_missing_single_a/). Then there are concerns related to how AI affects battery life, uses tons of memory, and serves inference sequentially (so your app might have to wait its turn). Despite these shortcomings, Apple Intelligence can still be quite useful for tasks like summarization, redaction, pattern matching, and search augmentation.

#### What about other models?

My laptop is a [24GB M4 MacBook Air](https://amzn.to/3OyFKru), which by most standards is fairly capable. Yet when it comes to local models, 24GB really limits what's possible. iClaw natively supports [Ollama](https://ollama.com/), so you can bring-your-own-model (BYOM). I've tested quantized (Q4_K_M) versions of [Gemma 4 E4B](https://deepmind.google/models/gemma/gemma-4/) and [Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B). Both generally performed better than the AFM at routing, judging, and responding in a conversational way. However, both were noticeably slower and had a tendency to ramble. This is of course subjective and likely hardware-dependent, but for most macOS users, the fastest and most efficient on-device AI model is almost certainly Apple's Foundation Models.

## What I Learned

### 1. Just a few tools

{{< responsive-image src="iClaw-Podcast-Ollama.png" alt="Early screenshot of iClaw listing podcasts using Gemma 4 E2B with Ollama" caption="Early screenshot of iClaw listing podcasts using Gemma 4 E2B with Ollama" class="no-border contain mx-auto" >}}

Arguably it's better to **[do one thing well](https://zenhabits.net/one-thing/)**, rather than many things poorly.

[Tool calling](https://developer.apple.com/documentation/foundationmodels/tool) is an important capability that allows AI models to access your files, contacts, messages, or the web. Early versions of iClaw actually worked well, but when our tool count ballooned from 4 to 14, we quickly realized that the AFM was basically calling tools at random, or not at all.

Small models like the Apple Foundation Model (AFM) get [easily distracted](https://tldr.takara.ai/p/2302.00093), so if you're building on Apple Intelligence it's best to **limit the model's tool choice** to just 2 or 3. A major challenge in AI is testability and reproducibility. If your app has fewer tools, fewer settings, and fewer features, there are fewer state combinations to worry about.

### 2. No context snowballs

All AI models, including frontier models, get [lost in the middle](https://arxiv.org/abs/2307.03172). On small models, [context rot](https://redis.io/blog/context-rot/) and bloat will completely derail an agent. OpenClaw has [session pruning](https://docs.openclaw.ai/concepts/session-pruning), OpenCode has a [`/compact` command](https://opencode.ai/docs/tui/#compact), and [Claude can dream](https://claudefa.st/blog/guide/mechanics/auto-dream). These are all strategies for pruning context to keep it relevant and stay within context window limits.

For small models like the AFM, don't let your context snowball. Instead, build scaffolding that keeps you well within the 4,096-token window and avoids the most devastating failure modes. iClaw ships with several [text classifiers](https://developer.apple.com/documentation/createml/creating-a-text-classifier-model) that act as tool routers.

Rather than ask the model which of 40+ tools to use, iClaw uses a small classifier that runs in milliseconds. This too can fail, but it will do so deterministically. Sometimes deterministic failure can be an advantage. Consider [ShellTalk]({{< relref "2026-04-22-text-to-bash-with-shell-talk" >}}), a text-to-bash utility I built. Changes can be tested against hundreds of cases in minutes. If you can reliably measure accuracy, you can use a technique like [Meta-Harness](https://arxiv.org/pdf/2603.28052) or [Autoresearch](https://github.com/karpathy/autoresearch) to autonomously and continuously drive improvements.

### 3. Lower your expectations

{{< responsive-image src="iClaw-Early-Comparison.png" alt="Early screenshot of iClaw dynamically generating a comparison table" caption="Early screenshot of iClaw dynamically generating a comparison table" class="no-border contain mx-auto" >}}

I had dozens of ideas for iClaw. One notable idea took inspiration from [Agent-to-UI (A2UI)](https://a2ui.org/): dynamically rendering widgets, rather than a wall of text. Early tests worked! The AFM could output a custom, token-efficient, XML-like domain-specific language (DSL) to render lists, tables, images, and chips. But it wasn't long before the model started spitting out tables with strange layouts: duplicating headers, misaligning columns, or omitting key data.

My second approach involved [training a custom adapter](https://developer.apple.com/documentation/foundationmodels/loading-and-using-a-custom-adapter-with-foundation-models) and pre-generating templates for a slot-fill strategy. This worked _better_ in that it prevented the most egregious failure modes, but it was still far from consistent.

My advice: lower your expectations. On-device AI _will_ make more mistakes, so give it fewer tasks to mess up. For now, this is the price you pay when your cost per million tokens is $0.

### Tactical advice

The AFM does not have a lot of levers: no public weights to adjust, no thinking or reasoning modes, and no constrained grammar. What it does have, you _should_ use:

- Limit response size (and lower response time) with [`maximumResponseTokens`](https://developer.apple.com/documentation/foundationmodels/generationoptions/maximumresponsetokens)
- Make responses more predictable by adjusting the [`temperature`](https://developer.apple.com/documentation/foundationmodels/generationoptions/temperature)
- Make diverse but constrained choices by setting the [`sampling`](https://developer.apple.com/documentation/foundationmodels/generationoptions/sampling) mode
- Call [`prewarm`](https://developer.apple.com/documentation/foundationmodels/languagemodelsession/prewarm(promptprefix:)) to reduce latency, cache a prompt prefix, and affect memory residency
- Use [`InstructionsBuilder`](https://developer.apple.com/documentation/foundationmodels/instructionsbuilder) to increase instruction compliance

The right prompt and appropriate settings can actually produce dramatic improvements!

## What's Next?

[iClaw](https://geticlaw.com) is available for free with [code on GitHub](https://github.com/LastByteLLC/iClaw). I'll be applying these lessons, and learning many more, as I continue building iClaw and local-first AI products. Stay tuned for more!
