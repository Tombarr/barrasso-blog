+++
title = 'AI-Assisted Development And Its Limits'
date = 2025-12-03
draft = true
categories = ['AI', 'Claude', 'OpenCode']
tags = ['AI', 'Claude', 'OpenCode']
summary = 'Where agentic coding tools shine, and where they fall short'
showBanner = false
+++

I'm increasingly impressed with agentic coding tools like Claude Code, Codex, and [OpenCode](https://opencode.ai/). They've helped me build this blog, a [KaiOS type declaration](https://github.com/Tombarr/kaios-types) library, a [micro-game platform](https://github.com/Tombarr/ai-microgames), an authenticator app for [Cloud Phone]({{< relref "projects/cloud-phone" >}}), and much more. Used effectively, hours of work compresses into minutes. But I'm also increasingly aware of the limits–temporary and fundamental–in these tools.

## Expert Mode

Agentic coding tools shine when the following conditions are met:

- You _can_ read and write the code they generate
- You are working with popular languages, frameworks, and runtimes
- Your use case can tolerate a margin of error

Why these criteria?

## Learning = Doing

I initially saw the Yoto 2025 Developer Challenge as an opportunity to learn Elixir, so I built [Backyard Birds]({{< relref "projects/backyard-birds" >}}) using [Phoenix](https://www.phoenixframework.org/). As with any new language, I soon hit issues and found some aspects of the language or framework to be insufficiently documented.

So I turned to ChatGPT. At first I was impressed. I asked the LLMs to explain the motivation and impact of each change. As it spit out one module after another, it felt like I was learning on fast mode.

Although I quickly had a working codebase, I barely knew any more about Elixir, Phoenix Channels, or LiveView. What it had done was rob me of the chance to _really_ learn. I had lots of code, but a sense that this wasn't idiomatic. I wasn't doing things "the Elixir way." And then I was thrown into reverse!

##

The more I trusted Claude, the more I was disappointed. It made up functions that weren't found, language features that didn't exist, and runtime assumptions that didn't hold up.

## Non-Promotable Work

Non-promotable work is everywhere. It's the things you have to do, but don't help you learn, grow, or advance in your career. In software, this takes many forms but most often it's "glue" work: setting up a new project or writing boilerplate code to connect systems and tools.

I built a Currency Converter for Cloud Phone, but quickly realized that I needed a currency dataset available under a permissive license. Beyond scrapping Wikipedia, I didn't know where to look. But this type of task is perfect for trillion parameter models that have already digested the entire world's knowledge!

With just two prompts, I got [`currencies.json`](https://github.com/cloudmosa/cloudphone-currency/blob/main/src/data/currencies.json): a dataset with active currency codes, names, country codes, flags, and minimum denominations. This would have taken several monotonous hours, but instead took just a minute.
