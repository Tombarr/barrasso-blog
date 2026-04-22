+++
title = 'Deterministic text-to-bash with ShellTalk'
date = 2026-04-22
draft = false
categories = ['Bash', 'Shell', 'NLP']
tags = ['Bash', 'zsh', 'Swift', 'NLP']
summary = "Mapping natural language to Bash commands deterministically with a Swift CLI called ShellTalk"
banner = 'screenshot-shelltalk-ghostty.png'
bannerCaption = 'Screenshot of ShellTalk in Ghostty terminal'
showBanner = true
+++

I recently released [ShellTalk](https://github.com/LastByteLLC/ShellTalk), an Apache 2.0 licensed CLI and library that converts natural language English text into the Bash commands.

```bash
shelltalk "find all images in this folder"
find . -type f \( \
  -name '*.jpg' -o \
  -name '*.jpeg' -o \
  -name '*.png' -o \
  -name '*.gif' -o \
  -name '*.webp' -o \
  -name '*.svg' \
\)
```

While building [Junco]({{< relref "2026-04-09-on-device-coding-with-apple-intelligence" >}}), I discovered [Hunch](https://github.com/es617/hunch), an on-device CLI that uses [Apple Intelligence](https://www.apple.com/apple-intelligence/) and few-shot dynamic retrieval to convert text to bash. The concept was fascinating, and proved that even a small non-coding model like the 3B Apple Foundation Model (AFM), with guardrails, is capable of producing valid Bash scripts from natural language input.

Using the AFM is ideal because it's incredibly optimized and comes pre-installed on many Macs with macOS 26 Tahoe. However, it's not truly portable since it has a runtime dependency on a limited-availability small language model (SLM). Given that single-command bash is a pretty constrained space, I hypothesized that this might be possible without LLMs at all. My approach for ShellTalk was leveraging **Semantic Template Matching (STM)** to map **intent → command**.

## Why no LLMs?

On-device AI keeps getting better, cheaper, and more efficient, but it's not a panacea. It's still not easily accessible on many environments like embedded devices, older mobiles, or the web. Beyond LLMs, Natural Language Processing (NLP) has continued to advance with more efficient embedding models that come pre-packaged into many runtimes like Apple's [`NLEmbedding`](https://developer.apple.com/documentation/naturallanguage/nlembedding) introduced in macOS/ iOS 13.

Moreover, deterministic approaches are typically faster and easier to reproduce, resulting in shorter testing and iteration cycles. Given text-to-bash has relatively constrained inputs and outputs, I figured a tool like [Claude Code](https://claude.ai/referral/1is-TiX1TQ) could quickly prototype and iterate autonomously towards a working solution similar to [Meta-Harness](https://arxiv.org/pdf/2603.28052). Effectively, this technique **builds a system that build systems**.

## How ShellTalk works

ShellTalk has a sequential pipeline:

1. **Entity recognition** - regular expressions (file paths, URLs), lexicon (installed commands), preposition framing ("in X" or "on Y"), and (optionally) [`NLTagger`](https://developer.apple.com/documentation/naturallanguage/nltagger) on macOS for parts of speech (POS) recognition
2. **Category matching** - Best Matching 25 (BM25) picks the most probable category (Git, ImageMagick, File I/O)
3. **Template match** - Score candidates across 167+ templates using BM25, Term Frequency-Inverse Document Frequency (TF-IDF), and `NLEmbedding` cosine distance on macOS
4. **Slot extraction** - entity & regex slot-fill replaces placeholders with actual file names, extension suffixes, URLs, etc
5. **Path resolution** - BSD vs GNU adapts commands and flags between macOS (BSD `coreutils`) and Linux (GNU)
6. **Validation** - confirm command existence, `bash -n` syntax validation, and safety scoring

## Testing ShellTalk

{{< responsive-image src="screenshot-shelltalk-wasm.png" alt="Screenshot of ShellTalk in the browser" caption="Screenshot of ShellTalk in the browser" class="mx-auto no-border contain" fullBleed="true" >}}

You can test ShellTalk yourself on [GitHub Pages](https://lastbytellc.github.io/ShellTalk/). This version compiles and optimizes the Swift library into WebAssembly (Wasm) using [Binaryen](https://github.com/WebAssembly/binaryen). It works fully offline, although it lacks a few features including command healing–matching output to which commands and versions are installed on your device–and typo correction since [`NSSpellChecker`](https://developer.apple.com/documentation/appkit/nsspellchecker) is only available on macOS. Nonetheless, once the ~45 MB Wasm binary is loaded & cached, you should see near-instant results with safety and confidence scores.

ShellTalk is not perfect. Although it can detect and leverage installed commands, it works best on pre-trained commands bundled in the tool's corpus. ShellTalk also struggles with ambiguous intent or complex pattern matching for file names, paths, and URLs. But it's failure modes are deterministic, so they are easy to reproduce and debug. This gives ShellTalk the ability to be quickly and autonomously improved by AI agents.

### Limitations

One of the biggest limitations of ShellTalk is that it intentionally doesn't synthesize pipelines from user input. The following inputs won't work:

- _list swift files, filter by mtime, then wc -l_
- _find all png images then convert jpeg and copy to ~/Downloads_

ShellTalk maps **one query to one template**, so pipes are only used in a stable way for a single intent (counting matches or `pbcopy` clipboard sink). Generalizing multi-step decomposition would almost certainly require some kind of domain specific language (DSL) or an LLM planner which risks breaking the, "same query, same machine, same result," contract.

## What's Next?

[ShellTalk](https://github.com/LastByteLLC/ShellTalk) is available for free on GitHub, including [pre-built binaries](https://github.com/LastByteLLC/ShellTalk/releases/tag/v1.0.0) for macOS (Universal), Linux (x86_64), and Wasm. The same techniques might work for [AppleScript](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/introduction/ASLR_intro.html) or [PowerShell](https://en.wikipedia.org/wiki/PowerShell). ShellTalk might prove useful inside of another agentic harness, where it's deterministic output could spare some tokens.
