+++
title = 'Migrating PodLP from JavaScript to TypeScript using OpenCode'
date = 2025-12-22
draft = false
categories = ['OpenCode', 'TypeScript', 'PodLP']
tags = ['Claude', 'Gemini', 'TypeScript', 'JavaScript', 'Refactoring', 'PodLP']
summary = 'Getting AI to do the heavy lifting and migrate a substantial front-end application to TypeScript'
banner = 'shattered-ice.jpeg'
bannerCaption = 'Shattered ice on a hike up Mt. Watatic'
showBanner = true
+++

## At a Glance

I migrated [PodLP]({{< relref "projects/podlp" >}}), my podcast app for [KaiOS](https://kaiostech.com), from JavaScript to TypeScript.

- **Scale**. ~35,000 lines of code (LOC) across 160 JavaScript files, 67 Svelte components, and 28 JSON translation dictionaries
- **Cost**. $43 using [$300 free credit](https://cloud.google.com/free) for new Google Cloud customers
- **Time**. Two half days of background tasks, primarily baking cookies and working on other projects
- **Impact**. A codebase that's *completely* migrated to TypeScript
- **What didn't work?** Attempting a one-shot conversion
- **What did work?** Multiple well-scoped subagents and some patience

## Background and Motivation

I've maintained PodLP for 5+ years. As it grew, it became more complex and honestly a *bit messy*. It eventually morphed into a monorepo with several front-end versions: the original for KaiOS, one for the [JioPhone](https://www.jio.com/general/jiophone/) (India), and one for [Cloud Phone]({{< relref "projects/cloud-phone" >}}).

Moreover, when I started PodLP, I knew nothing about podcatchers or podcast indexing. I also had no experience with KaiOS or it's many quirks and undocumented APIs. Iteratively over several years, the app grew in size and complexity. Yet I still generated builds (ZIP files) locally on my [M1 MacBook Air](https://amzn.to/4p0N4s5) and uploaded them manually to the [KaiStore](https://developer.kaiostech.com/docs/distribution/submission-portal/).

I tried to keep up-to-date with processes and dependencies. I upgraded PodLP from Svelte 3 to Svelte 4, I rewrote  [offline downloads](https://kaios.dev/2023/02/the-download-on-kaios-downloads/) to used chunked streams (`moz-chunked-arraybuffer`) written not to `IndexedDB` but instead to [`DeviceStorage`](https://developer.kaiostech.com/docs/api/web-apis/deviceStorage/device-storage/), I added support for [KaiOS 3.0](https://blog.podlp.com/posts/podlp-kaios-3/) and I migrated PodLP's back-end to the [Podcast Index](https://blog.podlp.com/posts/podlp-podcast-index/).

Although there are tools like [jscodeshift](https://github.com/facebook/jscodeshift) and [`sv migrate`](https://svelte.dev/docs/cli/sv-migrate), large-scale refactoring of 200+ files and 30,000+ lines without ready-made scripts was too much time and effort to justify. Inspired by Simon Willison’s port of [JustHTML from Python to JavaScript](https://simonwillison.net/2025/Dec/15/porting-justhtml/), I decided to try a similar agentic approach.

## But First, A Types Library

{{< responsive-image src="paths-in-snow.jpeg" alt="Footpaths in snow on Mt. Watatic" caption="Many footpaths to choose on Mt. Watatic" class="w-full no-border contain" >}}

Before beginning this migration, I knew the biggest challenge would be the lack of type definitions for the many non-standard KaiOS APIs. Fortunately, large parts of KaiOS are built on top of [Firefox OS](https://en.wikipedia.org/wiki/Firefox_OS) (aka Boot2Gecko or B2G) and are [open source](https://github.com/kaiostech/gecko-b2g). This informed many of my articles on [KaiOS.dev](https://kaios.dev), since I often needed to `grep` the codebase to uncover implementation details or edge cases.

Many KaiOS APIs are written in [WebIDL](https://developer.mozilla.org/en-US/docs/Glossary/WebIDL) (Web Interface Description Language), which is very similar to TypeScript type declarations (`.d.ts` files).

Consider [`MozWakeLock.webidl`](https://github.com/kaiostech/gecko-b2g/blob/b2g48_v2_6/dom/webidl/MozWakeLock.webidl):

```ts
[Pref="dom.wakelock.enabled", Func="Navigator::HasWakeLockSupport"]
interface MozWakeLock
{
    readonly attribute DOMString topic;

    /**
     * Release the wake lock.
     * @throw NS_ERROR_DOM_INVALID_STATE_ERR if already unlocked.
     */
    [Throws]
    void unlock();
};
```

In TypeScript (see [`moz-wake-lock.d.ts`](https://github.com/Tombarr/kaios-types/blob/main/system/moz-wake-lock.d.ts)), the interface looks like:

```ts
/**
 * @preference dom.wakelock.enabled
 * Represents a lock that prevents the device from entering sleep mode.
 */
export interface MozWakeLock {
  readonly topic: string;

  /**
   * Releases the wake lock.
   * @throws
   */
  unlock(): void;
}
```

For clients like [Vipaso]({{< relref "projects/vipaso" >}}) I've done this conversion by hand. It's straightforward but tedious. So I decided to see if I could do this at scale using [OpenCode](https://opencode.ai/). From the onset, my approach looked like:

- Prompt through a few examples and summarize conversion steps
- Define a purpose-limited [subagent](https://opencode.ai/docs/agents/) for conversion
- Draft a set of quality & validation steps (i.e. files validates with `tsc`, formatted using `prettier`, etc)

I then had Gemini explore the codebase and decompose the process into a task list and begin conversion with the following agents:

- **Project Manager**: oversaw the process and provided status reports with checklists of tasks pending and completed; handled retries when issues were uncovered
- **Converter**: a narrowly-scoped subagent for converting WebIDL to TypeScript type declarations with clear instructions on converting types and handling annotations
- **Documenter**: a subagent to copy WebIDL comments and annotations into consistently-formatted [TSDoc](https://tsdoc.org/) comments with tags like `@see` for documentation links and `@throws` for errors

The entire process was remarkably smooth. In a few hours, I had dozens of type definitions spanning hundreds of interfaces. I then had the default `Build` agent write a set of tests and a GitHub Action to deploy to NPM, and my new [`kaios-types`](https://github.com/Tombarr/kaios-types) library for KaiOS 2.5 was ready to use! I considered publishing on [DefinitelyTypes](https://github.com/DefinitelyTyped/DefinitelyTyped), which runs the `@types/` NPM namespace, but figured as a first pass there would be many changes needed. Once it's more complete (esp. including KaiOS 3.0+ APIs) and tested in the real-world, it may make sense to bring to DefinitelyTyped.

### Aside: `webidl2ts`

I'm aware that there are several libraries like [`webidl2ts`](https://github.com/giniedp/webidl2ts) that convert WebIDL to TypeScript like [`webidl2`](https://www.npmjs.com/package/webidl2). In the past, I've tried this approach but ran into several issues.

1) Not all KaiOS APIs are defined in WebIDL files
2) Some WebIDL files that don't originate from Boot2Gecko are not open source
3) Parsers operate file-by-file without an understanding of module resolution
4) Parsers often fail for complex WebIDL files with inheritance or incomplete but similar types

KaiOS can be a mess. For example, asynchronous programming includes `DOMRequest` callbacks (KaiOS 2.5 only), `Promises` (partially supported on KaiOS 2.5 without the `finally` method), and the `async` keyword on KaiOS 3.0+. I probably could have taken a hybrid approach allowing an agent to make a tool call to `webidl2`, but I didn't find it necessary. Plus, it would have roughly doubled input token usage to send both a `.webidl` and `.d.ts` file in the context for each request. Perhaps a future attempt would use AI to write a custom parser using `webidl2` tested specifically against Firefox and KaiOS.

## Now With More Logic

Given how easy it was to create `kaios-types`, I decided to replicate the success with a JS to TS conversion for PodLP. This time, I asked Claude to come up with a plan. Here is an excerpt:

```md
# TypeScript Migration Plan - Fast Track

## Overview
Migrate JavaScript files to TypeScript using pragmatic typing with liberal `any` usage for speed. Testing on both KaiOS 2.5 and 3.0 devices available.

## Strategy
- **Speed First**: Use `any` liberally where KaiOS APIs lack complete type definitions
- **Follow Patterns**: Match existing migrated files' typing approach
- **Build Validation**: Verify TypeScript compiles and Babel transpiles correctly
- **No Babel Changes**: Preserve existing transpilation configuration

## Migration Workflow Per File

1. **Rename**: `mv file.js file.ts`
2. **Add Types**:
   - Function parameters: `function foo(param: type): returnType`
   - Use `any` for complex KaiOS APIs
   - Use `any` for Svelte stores unless trivial
3. **Import Types**: Add `import type` for type-only imports
4. **Build**: `npm run build` (fixes Babel issues)
5. **Type Check**: `npx tsc --noEmit` (optional, for catching errors)
6. **Commit**: `git add file.ts && git commit -m "Migrate file.js to TypeScript"`

## Validation Checklist

After completing all phases:

- [ ] `npx tsc --noEmit` passes (zero TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] All `.js` files in `src/` migrated (except rollup config)
- [ ] App loads without console errors
- [ ] Audio playback works
- [ ] Downloads work
- [ ] Settings persist
- [ ] Navigation works
- [ ] Test on KaiOS 2.5 device
- [ ] Test on KaiOS 3.0 device

## Estimated Timeline

- Phase 1: 30 min (type infrastructure)
- Phase 2: 1 hour (foundation)
- Phase 3: 1.5 hours (core infrastructure)
- Phase 4: 1 hour (KaiOS shims)
- Phase 5: 2 hours (audio system)
- Phase 6: 2.5 hours (downloads)
- Phase 7: 1.5 hours (push notifications)
- Phase 8: 45 min (transcripts)
- Phase 9: 1 hour (workers & entry)
- **Total: ~12 hours** (can be split across multiple sessions)

## Risk Mitigation

- **Babel Issues**: If Babel fails, check for `const enum` or `namespace` usage (not supported)
- **Circular Dependencies**: Use `import type` to break cycles
- **Runtime Errors**: Keep all existing runtime type checks (don't rely on TypeScript)
- **Type Errors**: When stuck, use `any` and add `// TODO: improve typing` comment
- **Build Size**: Verify bundle sizes don't increase significantly

## Success Criteria

Migration complete when:

1. Zero `.js` files remain in `src/` (excluding config)
2. TypeScript compilation succeeds
3. Production build works
4. All features tested on both KaiOS versions

```

At first glance, the plan seemed fine although I would prefer to not "use `any` liberally." For small files with few dependencies, this was sufficient. However, I exhausted my Claude Pro daily usage *very quickly* and found it got stuck far too often. Claude reinvented the wheel (didn't use `kaios-types`) and was **too liberal** with type assertions to `any`. For better results, I needed to be more specific about the changes I expected, more methodical in iterating across files, and narrower in scope with each prompt.

I noticed most failures came when converting highly-interconnected components (itself a code smell for refactor, but that's a problem for another day). My approach was similar to the [Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html): don't arbitrarily walk file-by-file, but instead focus on the "outermost" independent components with the least imports. As Gemini put it, "start with leaf utilities (e.g., `src/strings/`, `src/utils/`) and move up to components." For PodLP, this meant the parts of the code that handle transcripts, translations, push notifications, and downloads.

Moving back to Gemini, it ended up defining three agents:

- **Architect**: responsible for configuring the build pipeline (`tsconfig.json`, `rollup.config.js`, etc) to support TypeScript while maintaining KaiOS compatibility.
- **Gardener**: responsible for managing this project and it's configuration, dependencies, and code formatting standards
- **Migrator**: responsible for converting the codebase from JavaScript to TypeScript and porting application to ensure type safety

Here's an exercept of the revamped migration plan:

```md
# Upgrade Plan: Modernization & TypeScript Migration

## Overview

This document outlines the strategy to modernize the PodLP codebase by migrating from JavaScript to TypeScript. The goal is to improve developer experience and code safety while maintaining compatibility with KaiOS (Firefox 48 target).

## Phase 1: TypeScript Infrastructure

**Goal:** Enable TypeScript support in the build pipeline while **keeping Babel** for critical KaiOS down-leveling.

1.  **Install Dependencies:**

    - `typescript`
    - `tslib`
    - `svelte-preprocess`
    - `@tsconfig/svelte`
    - `svelte-check` (for type checking)
    - `@rollup/plugin-typescript` (to handle .ts files in Rollup)
    - `kaios-types` (already installed or ensure it is added)

2.  **Configuration:**

    - Create `tsconfig.json`:
      - Extend `@tsconfig/svelte/tsconfig.json`.
      - Set `target` to `ESNext` (let Babel handle the heavy lifting to ES5/ES6 for Firefox 48).
      - Include `kaios-types` in `compilerOptions.types`.
      - Ensure strict mode is enabled (can be loose initially).
    - Create `svelte.config.js`:
      - Configure `svelte-preprocess`.

3.  **Update Build System (`rollup.config.js`):**
    - **CRITICAL:** Do NOT remove Babel. The pipeline should be TS -> Babel -> Output.
    - Import and register `svelte-preprocess` in the `svelte` plugin options.
    - Add `@rollup/plugin-typescript` to the plugin list _before_ Babel.
    - Ensure source maps are configured correctly for debugging.

## Phase 2: Migration Execution

**Goal:** Convert codebase to TypeScript.

1.  **Iterative Conversion:**

    - Rename `.js` files to `.ts`.
    - Update `.svelte` files: `<script>` -> `<script lang="ts">`.
    - Fix immediate type errors.
    - Use `kaios-types` for `navigator.mozApps`, `navigator.volumeManager`, etc.
    - Start with leaf utilities (e.g., `src/strings/`, `src/utils/`) and move up to components.

2.  **Type Safety:**

    - Run `npm run check` (using `svelte-check`) to identify issues.
    - Define interfaces for API responses and core data structures (Podcast, Episode).
    - Replace `any` with specific types where possible.

3.  **Verification:**
    - Build the app (`npm run build`).
    - Verify the app runs in the KaiOS simulator or device (manual verification required by user).

## Phase 3: Cleanup & Documentation

1.  Update `README.md` with new build instructions and TS guidelines.
2.  Verify `package.json` scripts.

```

This process continued for several hours split across two days driven by rate limits and resource quotas. I began with Gemini 3 Pro to draft and vet the plan, then to Gemini 3 Flash and 2.5 Flash for the file-by-file conversion. Only a few highly-interconnected files caused issues, and even these were able to be converted with some manual intervention.

## Testing

When `npm run build` worked, I expected disaster: a bunch of mangled transpiled JavaScript that was not KaiOS compatible, littered with runtime errors, that did not resembled my app. What I got was a TypeScript codebase with just a few errors that were easy to fix.

Ironically, the very first issue I found after this TypeScript migration was a [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)!

```js
onAppError TypeError: _ref11.detail is undefined
Stack trace:
  onOptionClick@app://podlp.com/build/podlp.js:40504:10
  handleOptionClickEvent@app://podlp.com/build/podlp.js:60395:25
  createEventDispatcher/podlp/<@app://podlp.com/build/podlp.js:24887:10
  createEventDispatcher/podlp@app://podlp.com/build/podlp.js:24886:8
  onOptionClick@app://podlp.com/build/podlp.js:30579:10
  instance$G/click_handler_1@app://podlp.com/build/podlp.js:30623:41
  click_handler_1@app://podlp.com/build/podlp.js:30128:59
  prevent_default/podlp@app://podlp.com/build/podlp.js:24422:13
```

During the conversion process, liberal use of `any` or generic types like `Event` resulted in some event handlers being called with trusted user-generated events (lacking the [`detail`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) property). I fixed a few function signatures to use more specific types like `CustomEvent<{ action: string }>`, changed the caller, and that was that.

The second issue was with a single instance where the [`...` spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) was dropped, causing Svelte's reactivity statement to not trigger and a component to not render. This was incredibly easy to spot since it caused the entire page to be blank. One more fix, and it was resolved.

The only other issues I ran into were duplication of KaiOS API types (redefining APIs already present in `kaios-types`). Given how little training data is available for KaiOS, it's likely the model wasn't able to `grep` for the correct API and choose instead to redefine it. I addressed most of this with a single prompt listing where to find each duplicated type definition. In the end, I even spotted a few APIs *missing* from `kaios-types`!

## Results

{{< responsive-image src="mt-watatic-summit.jpeg" alt="Summit sign for Mt. Watatic" caption="Sign at the summit of Mt. Watatic" class="w-full no-border contain" >}}

After spending $43 (in Gemini credits) and an afternoon, PodLP is now fully written in TypeScript. Build stats show that the main artifact grew marginally, from 842.76 kB to 852.59 kB uncompressed (~1.2% increase). This definitely answered the question, "can AI agents migrate a non-trivial codebase from JavaScript to TypeScript?" However, I'm still reevaluating whether it **should**.

[Unlike DHH](https://world.hey.com/dhh/turbo-8-is-dropping-typescript-70165c01), I still see great value in TypeScript primarily in long-term maintainability and productivity. Yes, it takes more type to write type definitions (or have AI generate them from an existing codebase). Examples like [`ts-sql`](https://github.com/codemix/ts-sql) show just how complex TypeScript types can get.

For PodLP, I see the primary value being able to iterate more quickly on new features, and to have AI implement new features with greater confidence. However, TypeScript's value is somewhat stunted by the fact PodLP runs on a variety of KaiOS devices spanning 3 major OS versions (KaiOS 2.5, 3.0, and 4.0).

There are no KaiOS virtual machines to test against, and the [KaiOS Simulator](https://developer.kaiostech.com/docs/getting-started/env-setup/simulator/) is virtually useless since it lacks support for many features and has substantially different configurations than commercial devices. Base Gecko versions like Firefox 48 aren't good proxies either, since they have no [permission model](https://developer.kaiostech.com/docs/getting-started/main-concepts/permissions/), don't ship with system APIs, and lack newer features like `display: grid` cherry-picked from Firefox 52 into the corresponding KaiOS 2.5 version.

TypeScript won't solve OS fragmentation or reliance on undocumented or under-documented proprietary APIs. But for me this was a worthwhile exercise in leveraging AI to modernize a substantial, real-world codebase that helps me maintain and improve [PodLP](https://podlp.com) for years to come.
