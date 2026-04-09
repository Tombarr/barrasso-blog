+++
title = 'Building an on-device Swift coding agent using Apple Intelligence'
date = 2026-04-09
draft = false
categories = ['Lessons', 'AI', 'Apple Intelligence']
tags = ['Software', 'macOS', 'Apple', 'AI']
summary = 'Lessons and limitations developing a local coding agent using the Apple Foundation Model'
banner = 'anish-lakkapragada-wYABQVRF3hQ-unsplash.jpg'
bannerCaption = 'A Dark-Eyed Junco resting on a few twigs while looking up. Photo by <a href="https://unsplash.com/@anishlk">Anish Lakkapragada</a> on <a href="https://unsplash.com/photos/a-small-bird-perched-on-top-of-a-tree-branch-wYABQVRF3hQ">Unsplash</a>'
showBanner = true
+++

I built a fully on-device coding agent called [Junco](https://github.com/LastByteLLC/junco), using Apple Intelligence, the [Apple Foundation Model](https://machinelearning.apple.com/research/introducing-apple-foundation-models) (AFM), in [Swift](https://www.swift.org/).

Why? To learn, but also to build a tool I want to use myself.

Why call it "[Junco](https://www.allaboutbirds.org/guide/Dark-eyed_Junco/overview)?" Because nothing else was named "Junco," it fits the Swift-related bird theme, and, to be honest, it's kind of _junky_ compared to [Claude Code](https://claude.ai/referral/1is-TiX1TQ).

Does Junco work? ~~Kind of!~~ Honestly, not well. It has some _very_ rough edges, but you can try it yourself. Install Junco with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/LastByteLLC/junco/master/install.sh | bash
```

## What is Junco?

[Junco](https://github.com/LastByteLLC/junco) is a free and open-source (MIT-licensed), fully on-device coding agent built _in_ Swift _for_ Swift. It's a single Mach-O binary that includes a terminal user interface (TUI) and leverages Apple Intelligence's [`LanguageModelSession`](https://developer.apple.com/documentation/foundationmodels/languagemodelsession), or other on-device models via [Ollama](https://ollama.com/) and [`AnyLanguageModel`](https://github.com/huggingface/AnyLanguageModel).

```text
────────────────────────────────────────────────────────────
  junco v0.6.0 — on-device AI coding agent

  Domain: Swift / Apple  │  Git: branch: master | 14 files changed
  Dir: ~/Documents/GitHub/junco
  Files: 148  │  Reflections: 61
  Model: Apple Foundation Models (Neural Engine)

  /help for commands  │  @file to target  │  exit to quit
────────────────────────────────────────────────────────────
```

## Why build Junco?

I was inspired by Ivan Magda's [`swift-claude-code`](https://github.com/ivan-magda/swift-claude-code) and his [8-part series](https://ivanmagda.dev/) on developing a Claude Code-like command line interface (CLI) tool in Swift that covers agentic loop, tool calls, subagents, and task planning.

Generally, local models are worse at reasoning, worse at following instructions, more likely to hallucinate, and lack up-to-date world knowledge when compared to state of the art (SOTA) frontier models. Nonetheless, local models like [Gemma 4](https://deepmind.google/models/gemma/gemma-4/) and [Qwen 3.5](https://huggingface.co/collections/Qwen/qwen35) continue to get better. Local models have their own benefits like:

- Work offline
- Better privacy
- Lower energy use
- No subscription fees

Claude Code launched just over a year ago in February 2025. Now we're in a [Code Overload](https://www.nytimes.com/2026/04/06/technology/ai-code-overload.html). I believe local models are on the same, albeit delayed, exponential trajectory.

### Why fully local?

Claude Code and Codex are incredibly powerful, but are limited by cost, privacy, and connectivity. A fully local coding agent has several advantages.

- **Unit economics**: build once, sell many times without the up-front capital for advanced GPUs or operating expense of inference-as-a-service
- **Trade secret preservation**: local inference means intellectual property isn't revealed to providers like Anthropic or OpenAI
- **Data privacy**: protected health information (PHI), personally-identifiable information (PII), and other sensitive data doesn't get sent to AI providers

In high-stakes industries like Defense, High-Frequency Trading, and Medical Research, sending source code to a third-party API is often a serious offense. Cloud inference always has a **marginal cost**, either _per token_ or amortized into a subscription. A local agent could run air-gapped without fear it will train on your trade secrets or [leak your `.env` secrets](https://bitwarden.com/blog/secure-ai-agent-access-with-secrets-manager/). Imagine agentic coding on an intercontinental flight without WiFi, or automatic agentic code review on a Self-Hosted GitHub Runner (without paying [$15-25 per pull request](https://code.claude.com/docs/en/code-review)).

### Why not use OpenCode?

[OpenCode](https://opencode.ai/) is great. I use it to [reverse-engineer Android APIs]({{< relref "2026-01-11-android-reverse-engineering-with-opencode" >}}), for [JavaScript-to-TypeScript migrations]({{< relref "2025-12-22-large-scale-typescript-migration-in-opencode" >}}), and much more. However, it's not designed to work with the AFM's miniscule [4K context window](https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window). In my limited testing, OpenCode with the Apple Foundation Model almost never succeeded without overflowing the context window, and rarely produced valid code.

## Junco at a glance

{{< responsive-image src="junco-ghostty-screenshot.png" alt="Screenshot of Junco in Ghostty" caption="Screenshot of Junco in Ghostty terminal" class="w-full no-border contain" >}}

- Completely free and open source under the [MIT license](https://github.com/LastByteLLC/junco/blob/master/LICENSE)
- A single signed & notarized Mach-O binary (~9MB)
- Written entirely in Swift 6.2+
- Works exclusively on macOS 26+ with Apple Silicon (M1+)
- Trained specifically to edit and generate Swift code

## Lessons & Limitations

Apple Intelligence [isn't very intelligent](https://www.macworld.com/article/3008896/this-test-shows-how-bad-apple-intelligence-is-and-how-much-better-its-going-to-get.html). In my experience, Apple's 3B model performs worse than just about any similarly-sized model.

So why work with it?

1. **It comes pre-installed**. Go to Settings > Apple Intelligence & Siri > Enable, that's it! This is a huge win for user onboarding.
2. **It's highly optimized**. I get ~40-80+ tokens per second on an M4 Air. The AFM uses less energy and respond faster than most local 2-4B INT4 quantized models in Ollama.
3. **It can be taught**. You can [train a custom adapter](https://developer.apple.com/apple-intelligence/foundation-models-adapter/) for the AFM, augmenting its style, format, and (to some extent) knowledge.

So what did I learn?

### Ask not what your model can do for you

{{< responsive-image src="afm-trump-prompt.png" alt="Apple Foundation Model summarizing Donald Trump" caption="Apple Foundation Model summarizing Donald Trump" class="w-full no-border contain" >}}

Ask what you can do for your model. Help local models help you: train a text classifier, use named-entity recognition (NER), parse prompts with regular expressions, and search the web. Don't ask a tiny model to do everything because they're slow, they hallucinate, and they lack world knowledge.

This screenshot is from [`maclocal-api`](https://github.com/scouzi1966/maclocal-api), using the [Llama.cpp](https://github.com/ggml-org/llama.cpp) Web UI. Clearly the AFM has a knowledge cutoff before the 2024 US Presidential Election.

Set the model up for success by giving it concise, recent, and relevant information, validate its output, and ask it to try again. For Junco, one of the single most important components was the **Compile-Verify-Fix (CVF) Loop**. This applies `swift-format` styles, runs a linter, then executes `swiftc -typecheck` on all LLM-generated code.

### One thing at a time

Language models, especially small language models (SLMs), get ["Lost in the Middle"](https://arxiv.org/abs/2307.03172). The best thing you can do is to have **one instruction per prompt**, and to put the critical task instruction at the _very end_.

Claude can handle, "go fix this bug and also check out these logs and then update @README.md," but SLMs can't reliably decompose multiple instructions. So give them exactly **one task at a time**.

### Happy little trees

Both SLMs and Bob Ross love, "Happy Little Trees." Specially, **abstract syntax trees (ASTs) and file trees**. These represent token-dense model context that supports cross-file references, symbol extraction, and context compression.

With 1M tokens you might include an entire file plus its call sites. But with 4K tokens, you can only request edits on focused 30 +/- lines of code around the deepest named declaration (i.e. function, class, module) that correspond to a specific error.

### Teach a model how to fish

> Give a model a fish and you feed it for one prompt.
>
> Teach a model how to fish and you feed it for a lifetime.

Prompt engineering can only take you so far. For Junco, to generate somewhat-consistently valid and up-to-date Swift code I needed to train a [custom model adapter](https://developer.apple.com/apple-intelligence/foundation-models-adapter/) using Low-Rank Adaption (LoRA).

LoRAs are a form of fine tuning where you train a tiny ~60M parameter model. In the case of AFM, you generate a ~160MB `.fmadapter` file (itself a folder with model weights & metadata). I trained several [LoRA iterations for Junco](https://github.com/LastByteLLC/junco/releases/tag/v0.6.0-lora) using permissively-licensed code samples, synthetic code, and API signatures. Although initially challenging, the **LoRA was the most effective AFM enhancement**. It's difficult to quantize because it's inherently stochastic, but before the LoRA I almost never got the AFM to generate valid, modern Swift code.

Keep in mind, Apple says you need, "at least 32GB RAM," to train an adapter. You also need to submit a [request form](https://developer.apple.com/contact/request/foundation-models-framework-adapter-entitlement/) for access, to accept a separate agreement, and to include the [`com.apple.developer.foundation-model-adapter`](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.foundation-model-adapter) entitlement in your application. Because this is a `com.apple.*` restricted namespaced entitlement, you'll also need to set up a [Provisioning Profile](https://developer.apple.com/help/account/provisioning-profiles/edit-download-or-delete-profiles/), otherwise users will see, "The application “...” can’t be opened." Apple Mobile File Integrity (AMFI) will log an error like, "Unsatisfied Entitlements: Code has restricted entitlements."

I managed to train my first adapter on a MacBook Air with 24GB RAM. However, it took ~18 hours on just a single epoch across ~1,000 samples. I've since moved to [RunPod](https://runpod.io?ref=o0vjyqx6) where I rent an NVIDIA L40S for ~$0.89/hour, and can train several epochs across ~10,000 samples in under an hour! CUDA, Flash Attention, and 48GB VRAM really make a difference.

### Fewer guardrails

Apple wants you to talk nicely to its AI. Don't swear or get political, otherwise you'll trigger a [guardrail violation](https://developer.apple.com/documentation/FoundationModels/improving-the-safety-of-generative-model-output)! Apple says, "Guardrails aim to block harmful or sensitive content, such as self-harm, violence, and adult materials, from both model input and output."

In practice, Apple's guardrails feel _too safe_. Violations get triggered by aggressive prompts, but also by code, and sometimes mixed-language input. Fortunately, you can turn these guardrails off with [`SystemLanguageModel(guardrails: .permissiveContentTransformations)`](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/guardrails/permissivecontenttransformations).

Fun fact: Apple's original codename for the AFM was ["Project Greymatter"](https://www.linkedin.com/pulse/what-apples-project-graymatter-taught-me-management-bhatnagar-pmp--x67sc/), which you'll see signs of in macOS app logs like `AFIsDeviceGreymatterEligible`.

### Count your tokens

4,096 tokens do not go far when you're generating code! macOS 26.4+ finally introduces a [`tokenCount`](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/tokencount(for:)) method and [`contextSize`](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/contextsize) property to avoid context overflows. Presumably, this is in preparation for future model releases where context window size might vary based on device hardware and available memory.

Hopefully future versions of macOS support more features like grammar-constrained decoding. Currently the only output options are `maximumResponseTokens` and `temperature`, and the use of `@Generable` for structured JSON output. These constrain the schema (JSON) but not the syntax.

If you want to go deeper into the technology, check out the [Apple Foundation Model Tech Report](https://arxiv.org/abs/2507.13575) or poke around `/System/Library/PrivateFrameworks/GenerativeModels.framework/` on any Apple Silicon Mac running macOS 26+, although it's saved in Apple Encrypted Archives (AEA) format.

#### Stochastic Parroting

Another weakness of the AFM is [stochastic parroting](https://arxiv.org/html/2505.05298v1). If you provide exemplar context, you'll almost certainly get it back _verbatim_. The best mitigation is to set [`temperature`](https://developer.apple.com/documentation/foundationmodels/generationoptions/temperature) to `1.0` and do NOT provide example data. If you do not explicitly set the temperature, "the system chooses a reasonable default on your behalf."

### Model of the week

The past few weeks saw unbelievable development in local models.

- Google's [Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- PrismML's [1-Bit Bonsai](https://prismml.com/news/bonsai-8b)
- Liquid AI's [LFM2.5-350M](https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind)
- Rta AI Lab's [Nandi-Mini-150M](https://huggingface.co/Rta-AILabs/Nandi-Mini-150M)

All of these are small enough to run on a MacBook Air. Every week, a new model is released. Technologies like ternary quantization and techniques like TurboQuant compression enable smaller, more capable local models with larger context windows and lower memory usage.

**Local models keep getting better**. The technology isn't perfect today, but projects like [Junco](https://github.com/LastByteLLC/junco), [Agent!](https://github.com/macOS26/Agent), and [iClaw](https://github.com/LastByteLLC/iClaw), along with companies like [Rig](https://rig.ai/?rc=nlf46l) demonstrate that **fully-local agents are possible**. With the right deterministic harness, proper safeguards, quality training data, and enough investment, local coding agents will get good enough for regular use. It's only a matter of time.

## What's Next?

{{< responsive-image src="iClaw-preview-screenshot.png" alt="Screenshot of iClaw AI agent" caption="Screenshot of iClaw, an on-device AI agent for macOS" class="mx-auto no-border contain" fullBleed="false" >}}

I'm continuing to explore on-device agents with a soon-to-be-released project called **[iClaw](https://github.com/LastByteLLC/iClaw)**. Many of the same techniques: auto-compacted context, custom LoRA adapter, and MaxEnt tool routing classifier all apply. My goal is to build a safe, helpful, local AI agent. More on iClaw coming soon at [geticlaw.com](https://geticlaw.com/).

**Affiliate Disclosure**: this article contains affiliate links to RunPod and Claude Code. If you click them and make a purchase, I may receive a small commission at no extra cost to you.
