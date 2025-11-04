+++
title = 'Vipaso'
date = 2024-05-01
draft = false
type = 'projects'

# Project metadata
summary = 'Secure Bluetooth Low Energy (BLE) payments for feature phones'
icon = '/images/icons/vipaso.png'
technologies = ['TypeScript', 'KaiOS', 'Svelte', 'Bluetooth']
dateRange = '2023 - 2024'
featured = true

# Images
featureImage = '/images/features/vipaso-poster.png'
featureImagePosition = 'none'
screenshots = []

# External links
projectUrl = ''
githubUrl = ''
+++

{{< youtube "eZrcJxmX8uY" >}}

{{< br >}}
Vipaso provides secure mobile payments using Bluetooth Low Energy (BLE) to connect merchants and buyers without the need for expensive terminals or specialized hardware. I was contacted via [KaiOS.dev](https://kaios.dev) to research and develop the Vipaso app for [KaiOS](https://kaiostech.com). The app uses the [Bluetooth Web API](https://wiki.mozilla.org/B2G/Bluetooth), a Firefox OS-specific predecessor to [WebBluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API), to expose Generic Attribute Profile (GATT) services to discover payment intents.

{{< br >}}
Vipaso is a cross-platform payment app that supports payments on Bluetooth-enabled mobile devices running iOS, Android, or KaiOS.
