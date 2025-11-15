+++
title = 'Deploy an Elixir + Phoenix web app on AWS EC2'
date = 2025-11-14T00:00:00-00:00
draft = false
categories = ['Elixir', 'Phoenix', 'AWS']
tags = ['Elixir', 'Phoenix', 'AWS', 'EC2']
summary = 'Using GitHub Actions to automatically build and deploy an Elixir + Phoenix web app on AWS EC2 running Amazon Linux 2023'
showBanner = false
+++

Using GitHub Actions to automatically build and deploy an Elixir + Phoenix web app on AWS EC2 running Amazon Linux 2023

## At a glance

Below is a GitHub Action with two steps that builds an Elixir + Phoenix release binary using [Docker](https://www.docker.com/) and deploys the binary onto an AWS EC2 instance running Amazon Linux 2023. This approach worked fairly well for my hackathon project, but be warned that single-instance deployments like this are not horizontally scalable or highly available.

## Why Elixir?

I chose to build [Backyard Birds]({{< relref "projects/backyard-birds" >}}) in [Elixir](https://elixir-lang.org/) because Hackathons are a good opportunity to explore new technology. I [first learned](https://itnext.io/hello-elixir-the-first-month-d24255860b) about Elixir back in 2019 and generally liked the functional syntax and "let it crash" ethos, centralizing error and retry logic inside a supervisor process.

Given 6 years had passed since I first tried Elixir, I assumed it would be smooth sailing. Initially setting up a [Phoenix](https://phoenixframework.org/) web app and running it locally was very easy. Installing dependencies using the Elixir build tool, `mix`, was just as simple as `npm`.

The first obstacle I faced was the **lack of official [Hex](https://hex.pm/) packages**. Most notably, there was no AWS SDK. I choose to use [`aws-elixir`](https://hexdocs.pm/aws/readme.html) which worked well enough, but it was poorly documented, didn't feel very idiomatic, and annoying didn't have separate packages for each service so I had to compile hundreds of modules.

Second, coming from TypeScript, **I missed static types**. [`jason`](https://hexdocs.pm/jason/Jason.html) made it easy to parse JSON responses, but I just got back tuples `{:ok, %{}}` with a `Map` as the I had to manually extract values from. Folks on the [Elixir Discord](https://discord.com/invite/elixir) were incredibly helpful and suggested I consider making structs to represent API responses. This was a bit cumbersome but gave me a bit more structural safety when handling various JSON payloads.

```elixir
defmodule Yoto.Models.DisplayIcon do
  @moduledoc "Represents a display icon uploaded for a Card."

  @derive {Jason.Encoder, only: [:mediaId, :userId, :displayIconId, :url, :new]}
  defstruct [
    :mediaId,
    :userId,
    :displayIconId,
    :url,
    :new
  ]
end
```

I had mixed luck using LLMs like ChatGPT and agentic coding tools like Claude Code with Elixir. As a beginner, it robbed me of the experience (sometimes painful) that comes when you learn a new language. Worse, it often gaslit me by making up non-existent functions in the Elixir standard library or suggesting the language had features that it did not. I often **got syntactically invalid "Elixir" from ChatGPT or Claude**.

## Deploying to AWS

After much struggle, I finally had an Elixir app running locally that I was happy with. This is when things got surprisingly difficult. I develop on an M-series MacBook (arm64), and I wanted to build and deploy on AWS since I already had an account and domain name in Route53. Yet there's surprisingly little prior art showing how to deploy Elixir on AWS EC2, and even less showing how to do automated, continuous deployments using GitHub Actions.

My preference was to automatically build my Elixir app an AWS EC2 instance with a Gravitron3 (arm64) CPU running Amazon Linux 2023 because this was the cheapest, and likely most secure, default configuration. With great help from the folks on Discord, I tried:

**⛔ GitHub Action + arm64 = Dead End**

Building on an `arm64` runner (in [Public Beta](https://github.blog/news-insights/product-news/arm64-on-github-actions-powering-faster-more-efficient-build-systems/)) using `ubuntu-24.04-arm` in the hopes of deploying to an EC2 instance with a Gravitron CPU. My Actions sat idle for a day before hitting a timeout. `arm64` runners were never available to pick up my Action.

**⛔ GitHub Action + Ubuntu (default) = Dead End**

GitHub generously provides free compute for Actions which defaults to Ubuntu 22 running on an x86_64 CPU. Building directly within GitHub Actions and running on Amazon Linux 2023 resulted in a discrepancy between the `glibc` version used to compile the service and the server running it.

**🏆 Build and deploy on the same environment**

The best solution was to ensure the build and runtime environments matched as closely as possible. In order to do that, I used Docker to build from a [`amazonlinux:2023`](https://hub.docker.com/_/amazonlinux) base image, then download and install Elixir, Erlang, and OTP. Amazon Linux is based on Fedora, but Elixir and Erlang aren't available via the `dnf` package manager using it's default repositories so they had to be build from source and installed manually.

The resulting binary is then copied using Secure File Copy (SCP) onto my EC2 instance using a private key stored in GitHub Secrets. Then a script is run to create a `systemd` unit file, and the service is started.

This approach actually worked quite well for a single, small EC2 instance. Presumably there's some downtime during deployments when the running service is stopped and the new service is started. This was too short to actually perceive, and more than acceptable for a hackathon project.

### `tmpfs` Missteps

I picked the smallest EC2 instance size because I didn't expect significant traffic, and I reviewed my app as primarily I/O bound. However, I forgot that there was a single step in a workflow I wrote where [ImageMagick](https://imagemagick.org/) is used to scale down and pixelate a 1024x1024 image from ChatGPT into a 16x16 pixel art icon for Yoto. All **data in Elixir is immutable** and passed via value. I was probably overly cautious, so to avoid keeping the PNG file in memory throughout the workflow, I instead wrote it to a temporary file and passed the file name instead.

A problem arose when temporary files appeared to not get deleted, and the partition ran out of disk space. Calls to the [`mogrify`](https://github.com/elixir-mogrify/mogrify) library (which in turn just runs system commands to `System.cmd`) failed due to insufficient space. After some research, I realized the default `tmpfs` size is half of physical RAM without swap. That didn't leave a lot of space on my `t3.nano` instance with just 0.5GB of memory.

I ended up using `PrivateTmp`, a `systemd` setting for sandboxing, to create a new namespace for `/tmp` and `/var/tmp`. This seems like best practice, and make sure no other process was contributing to this issue. I also used the [`briefly`](https://github.com/CargoSense/briefly) library to ensure temporary files were deleted shortly after the workflow execution completed.

### Cloudfront VPC Origin doesn't play nice with WebSockets

Perhaps the biggest dead end I faced was with AWS Cloudfront's [VPC Origin](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-cloudfront-virtual-private-cloud-vpc-origins-shield-your-web-applications-from-public-internet/) configurations. This let me set my EC2 instance, inside of a private subnet in a Virtual Private Cloud (VPC), as an origin server for a Cloudfront distribution. It seemed like a great solution: I could use ACM to auto-renew my SSL certificates, Route53 to manage the DNS entries, and I had a Content Delivery Network (CDN) in front of my small EC2 instance to reduce load via caching.

However, I quickly realized that my app didn't work as expected because the Phoenix client couldn't establish a WebSockets connection to my server. I enabled Cloudfront logging and saw the HTTP 502 Bad Gateway errors showed log entries for `OriginDnsError` in CloudWatch. I found several [similar issues](https://repost.aws/questions/QU9RNe5fD_SsK7UIGGG26yOA/origindnserror-from-cloudfront-vpc-origin-when-websocket-is-used), and after some consultation on the [AWS Discord](https://discord.com/invite/aws), realized this was a fundamental limitation within Cloudfront that I could not overcome. In the end, I swapped WebSockets for HTTP polling during wait states when a Yoto card was being generated.

Lesson learned: **CloudFront does not support WebSockets for VPC Origins pointing to an EC2 instance**. It _may_ work if you're using a load balancer.

## GitHub Action to Build + Deploy an Elixir service on AWS EC2 running AL2023

This GitHub Action uses Docker to build a release binary of an Elixir + Phoenix web app on Amazon Linux 2023 (AL2023). GitHub Container Registry (GHCR) is used to cache intermediate build steps to reduce subsequent build times. The second step uses SCP to copy a tarball of the binary onto an EC2 host, then uses Secure Shell (SSH) to start a `systemd` service of the Phoenix web app.

### Secrets

The following values need to be added to your GitHub repository under Settings > Secrets and variables > Actions.

{{< img src="github-action-secrets.png" >}}

| Secret Name | Description | Example Values |
|-------------|-------------|----------------|
| `EC2_HOST` | The SSH host with port | `172.32.18.129` or `ec2-172-32-18-129.us-east-2.compute.amazonaws.com` |
| `EC2_SSH_KEY` | The private SSH key, in `.pem` file format | Contents of your `.pem` key file |
| `EC2_USER` | The SSH user | `ec2-user` (default for Amazon Linux) |
| `ENV_VARS` | Environment variables in `.env` format | `DATABASE_URL=postgres://...`{{< br >}}`API_KEY=abc123` |
| `RELEASE_COOKIE` | The release cookie for distributed Erlang | Value from `releases/COOKIE` or generate with `mix release.init` |
| `SECRET_KEY_BASE` | Phoenix secret key base | Run `mix phx.gen.secret` to generate |

{{< gist "Tombarr" "17b94f79ccfc698792a2abafb8955409" >}}
