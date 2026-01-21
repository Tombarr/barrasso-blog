+++
title = 'Quickly reverse engineer hidden Android APIs with Gemini and OpenCode'
date = 2026-01-11
draft = false
categories = ['OpenCode', 'Android', 'PodLP']
tags = ['Claude', 'Gemini', 'Android', 'Reverse Engineering', 'PodLP']
summary = 'Quickly disassemble and reconstruct proprietary Android APIs using APKTool, Gemini, and OpenCode'
banner = 'kyocera-podlp.jpeg'
bannerCaption = 'Early beta of PodLP on the Kyocera DuraXV Extreme using system soft keys via hidden APIs'
showBanner = true
+++

## Why Reverse Engineer an APK?

In the early days of Android more than a decade ago, I built UI customization apps like [StatusBar+]({{< relref "projects/statusbarplus" >}}), [ChargeBar]({{< relref "projects/chargebar" >}}), and [Noyze]({{< relref "projects/noyze" >}}). [Fragmentation](https://andrewzuo.com/has-android-fragmentation-finally-been-fixed-adf363c887c0) was a big problem. This was long before [Material UI](https://en.wikipedia.org/wiki/Material_Design) was released in 2014, and well before [Google certified](https://www.notebookcheck.net/Google-launches-Certified-Android-device-program.244974.0.html) original equipment manufacturer (OEMs) through [Play Protect](https://www.android.com/certified/) in 2017.

To build apps that looked and worked well on Samsung's [TouchWiz](https://en.wikipedia.org/wiki/TouchWiz), Xiaomi's [MIUI](https://en.wikipedia.org/wiki/MIUI), and HTC's [Sense](https://en.wikipedia.org/wiki/HTC_Sense), you needed to know how to reverse engineer preinstalled APKs and the SystemUI to understand what modifications had been made on each device. At runtime, this looked like a lot of [Java reflection](https://www.baeldung.com/java-reflection) checking for the availability of hidden APIs. Android Interface Definition Language (AIDL) files were reconstructed and imported from disassembled APKs to call into device-specific APIs and offer better features.

This is an example of code I wrote in 2014 for [Noyze]({{< relref "projects/noyze" >}}) used to call into [AudioFlinger](https://source.android.com/docs/core/audio/terminology#androidSpecificTerms) to determine the available volume streams and the associated number of steps. Some devices let you adjust in steps as few as 5, while others offered more gradations as high as 15. Many of these variations weren't yet standardized into higher-level APIs that developers could query.


```java
package me.barrasso.android.volume.media;

/**
 * Proxy to safely access android.media.IAudioFlinger methods.
 */
public class AudioFlingerProxy {
    // Values from IAudioFlinger.cpp
    public static final int CREATE_TRACK = IBinder.FIRST_CALL_TRANSACTION; // 1
    public static final int OPEN_RECORD = CREATE_TRACK + 1; // 2
    public static final int SAMPLE_RATE = OPEN_RECORD + 1; // 3
    public static final int CHANNEL_COUNT = SAMPLE_RATE + 1; // 4
    public static final int FORMAT = CHANNEL_COUNT + 1; // 5
    public static final int FRAME_COUNT = FORMAT + 1; // 6
    public static final int LATENCY = FRAME_COUNT + 1; // 7
    public static final int SET_MASTER_VOLUME = LATENCY + 1; // 8
    public static final int SET_MASTER_MUTE = SET_MASTER_VOLUME + 1; // 9
    public static final int MASTER_VOLUME = SET_MASTER_MUTE + 1; // 10
    public static final int MASTER_MUTE = MASTER_VOLUME + 1; // 11
    public static final int SET_STREAM_VOLUME = MASTER_MUTE + 1; // 12
    public static final int SET_STREAM_MUTE = SET_STREAM_VOLUME + 1; // 13
    public static final int STREAM_VOLUME = SET_STREAM_MUTE + 1; // 14
    public static final int STREAM_MUTE = STREAM_VOLUME + 1; // 15
    public static final int SET_MODE = STREAM_MUTE + 1; // 16

    public static final int DEFAULT = -1;
    public static final int VOICE_CALL = 0;
    public static final int SYSTEM = 1;
    public static final int RING = 2;
    public static final int MUSIC = 3;
    public static final int ALARM = 4;
    public static final int NOTIFICATION = 5;
    public static final int BLUETOOTH_SCO = 6;
    public static final int ENFORCED_AUDIBLE = 7;
    public static final int DTMF = 8;
    public static final int TTS = 9;

    // Values from errno.h
    public static final int NO_ERROR = 0;
    public static final int UNKNOWN_TRANSACTION = -74; // -EBADMSG;
    public static final int BAD_VALUE = -22; // -EINVAL;
    public static final int PERMISSION_DENIED = -1; // -EPERM;

    public static final int CALIBRATION_ERROR = -64;

    private static final String FLINGER_SERVICE = "media.audio_flinger";

    private final String mInterfaceDescriptor;
    private final IBinder mAudioFlinger;

    private final SparseArray<SparseArray<Float>> mStreamStepMap = new SparseArray<SparseArray<Float>>();

    public AudioFlingerProxy() {
        mAudioFlinger = ReflectionUtils.getServiceManager(FLINGER_SERVICE);

        String mID = "";
        {
            try {
                mID = mAudioFlinger.getInterfaceDescriptor();
            } catch (RemoteException e) {
                mID = "";
            }
        }
        mInterfaceDescriptor = mID;
    }

    public boolean isCalibrated(int stream) {
        SparseArray<Float> map = mStreamStepMap.get(stream);
        return (map != null && map.size() >= 2);
    }

    public void mapStreamIndex(int stream, int index) {
        SparseArray<Float> map = mStreamStepMap.get(stream);
        if (null == map) map = new SparseArray<Float>();

        try {
            float value = getStreamVolume(stream);
            map.put(index, value);
        } catch (RemoteException re) { }

        mStreamStepMap.put(stream, map);
    }

    /**
     * Set the volume_3 of a calibrated stream.
     * @see {@link #setStreamVolume(int, float)}
     * @throws RemoteException
     */
    public int adjustStreamVolume(int stream, int direction, int index, int max) throws RemoteException {
        if (null == mAudioFlinger || TextUtils.isEmpty(mInterfaceDescriptor) || !isCalibrated(stream)) {
            return BAD_VALUE;
        }

        float value = getStreamVolume(stream);
        float increment = getStreamIncrement(stream);

        float newValue = value;
        switch (direction) {
            case AudioManager.ADJUST_LOWER:
                newValue -= increment;
            case AudioManager.ADJUST_RAISE:
                newValue += increment;
        }
        newValue = Math.max(0, Math.min(newValue, max * increment));

        return setStreamVolume(stream, newValue);
    }

    // change this value to change volume_3 scaling
    protected static float dBPerStep = 0.5f;
    // shouldn't need to touch these
    protected static float dBConvert = -dBPerStep * 2.302585093f / 20.0f;
    protected static float dBConvertInverse = 1.0f / dBConvert;

    protected static float linearToLog(int volume) {
        if (volume == 0) return 0.0f;
        return (float) Math.exp(100 - volume * dBConvert);
    }

    protected static int logToLinear(float volume) {
        if (volume == 0.0f) return 0;
        return (int) (100 - (dBConvertInverse * Math.log(volume) + 0.5));
    }

    protected static float computeVolume(int index, int max) {
        int mIndexMin = 0;
        int volInt = (100 * (index - mIndexMin)) / (max - mIndexMin);
        return linearToLog(volInt);
    }

    protected float getStreamIncrement(int stream) throws RemoteException {
        // Figure out what the increment is.
        SparseArray<Float> map = mStreamStepMap.get(stream);
        int indexOne = map.keyAt(0);
        int indexTwo = map.keyAt(1);
        float valueOne = map.get(indexOne);
        float valueTwo = map.get(indexTwo);

        return  Math.abs(valueTwo - valueOne) /
                Math.abs(indexTwo - indexOne);
    }

    public int getStreamIndex(int stream) throws RemoteException {
        if (null == mAudioFlinger || TextUtils.isEmpty(mInterfaceDescriptor) || !isCalibrated(stream)) {
            return BAD_VALUE;
        }

        float value = getStreamVolume(stream);
        float increment = getStreamIncrement(stream);

        return Math.round(value / increment);
    }

    public int setStreamVolume(int stream, float value) throws RemoteException {
        if (null == mAudioFlinger || TextUtils.isEmpty(mInterfaceDescriptor)) {
            return BAD_VALUE;
        }

        Parcel data = Parcel.obtain();
        Parcel reply = Parcel.obtain();
        data.writeInterfaceToken(mInterfaceDescriptor);
        data.writeInt(stream);
        data.writeFloat(value);
        mAudioFlinger.transact(SET_STREAM_VOLUME, data, reply, 0);
        return reply.readInt();
    }

    public float getStreamVolume(int stream) throws RemoteException {
        if (null == mAudioFlinger || TextUtils.isEmpty(mInterfaceDescriptor)) {
            return BAD_VALUE;
        }

        Parcel data = Parcel.obtain();
        Parcel reply = Parcel.obtain();
        data.writeInterfaceToken(mInterfaceDescriptor);
        data.writeInt(stream);
        mAudioFlinger.transact(STREAM_VOLUME, data, reply, 0);
        float ret = Float.intBitsToFloat(reply.readInt());
        return ret;
    }
}
```

## Reverse Engineering Tools

There are tons of tools for reverse engineering Android apps. Back then, I primarily used [JD-GUI](https://java-decompiler.github.io/), [JADX](https://github.com/skylot/jadx), [Apktool](https://apktool.org/). Apktool is a powerful Android disassembler that rips apart an Android Package Kit (APK) file, itself just a ZIP archive, into its constituent parts. Java/ Kotlin code built for the Android Runtime (ART) is compiled into DEX bytecode, which can be disassembled into [Smali](https://github.com/google/smali), a human-readable text format that represents the complete structure of a Dex Virtual Machine (VM) class including all of its instructions.

In 2014, whenever these tools failed to disassemble certain classes I would manually reconstruct them through some informal deduction. I'd look at the various call sites, interface definitions, and available resources to mentally re-assemble API signatures. Then I'd run some reflection inside of an app to test what was and wasn't available. Some APIs were restricted to certain packages, permissions, or required proprietary features.

## Why Now?

In 2026, I find myself in the same situation as I was in 2014. I'm building my podcast app, **[PodLP]({{< relref "projects/podlp" >}}), for Android flip phones** and once again I am running into inconsistent behaviors. Some devices (i.e. Kyocera, Sonim, and Ketai) have custom APIs to control soft keys, some have special features like Push-to-Talk (PTT) and SOS hot keys, and some offer an Eco mode that interferes with foreground services and network access when the clamshell is closed or screen dims.

Because I'm targeting a niche set of highly-fragmented devices, once again I need to reverse engineer non-standard APIs in order to offer a high-quality, consistent experience across a large number of non-certified devices.

## Reverse Engineering in OpenCode

I'm pleasantly surprised that in order to reconstruct an APK (or at least several relevant APIs), there's virtually no prompt engineering needed.

First I **enable developer options** via Settings > About >, then click Build 7 times. Next, I query the installed packages

```bash
adb shell cmd package list packages
```

On my [Kyocera DuraXV Extreme E4810](https://amzn.to/49qb9nX) this returned:

```bash
jp.kyocera.hiddendebug
jp.kyocera.kyocerahome
com.android.cts.priv.ctsshim
com.vzw.apnlib
com.android.internal.display.cutout.emulation.corner
com.android.internal.display.cutout.emulation.double
com.android.providers.telephony
com.kyocera.diagnostic
com.verizon.mips.services
com.android.providers.calendar
com.android.providers.media
com.android.wallpapercropper
com.quicinc.cne.CNEService
jp.kyocera.filemanager.launcher
com.kyocera.flashlight
com.android.documentsui
com.android.externalstorage
com.android.frameworks.overlay
com.android.htmlviewer
com.android.companiondevicemanager
com.verizon.obdm_permissions
com.android.mms.service
com.kyocera.calculator2
com.android.providers.downloads
jp.kyocera.gallery.launcher
com.mobisystems.office.kyocera
com.qualcomm.qti.telephonyservice
com.kyocera.labtest
com.android.browser
com.vcast.mediamanager
com.android.defcontainer
jp.kyocera.oemsetupwizard
com.android.providers.downloads.ui
com.android.pacprocessor
com.android.simappdialog
jp.kyocera.datafolder
com.android.internal.display.cutout.emulation.tall
com.android.certinstaller
jp.kyocera.corp.manager
com.android.carrierconfig
com.google.android.marvin.talkback
jp.kyocera.kchandlenv
com.qti.qualcomm.datastatusnotification
jp.kyocera.LocationConsentApp
android
com.android.contacts
com.android.egg
com.android.mms
com.android.mtp
com.android.stk
com.android.backupconfirm
jp.kyocera.ecomode
com.kyocera.telephony
jp.kyocera.settings.nfp
com.android.provision
org.codeaurora.ims
com.android.statementservice
com.verizon.bootstrapclient
com.android.settings.intelligence
com.android.calendar
com.android.systemui.theme.dark
com.kyocera.kcPhoneService
jp.kyocera.WebViewer
jp.kyocera.kc_soundrecorder
com.qualcomm.qti.dynamicddsservice
com.qualcomm.qcrilmsgtunnel
com.android.providers.settings
jp.kyocera.kdfs
jp.kyocera.kerr
jp.kyocera.memo
com.android.sharedstoragebackup
com.android.printspooler
com.android.dreams.basic
com.android.webview
com.kyocera.kcTelecommService
com.android.inputdevices
jp.kyocera.selfprovisioning
jp.kyocera.customizekey
com.android.bips
jp.kyocera.providers.memo
com.android.musicfx
com.kyocera.worldclock
com.ffm.kyocera
com.kyocera.voicerecognition
jp.kyocera.poweronactivation
com.android.cellbroadcastreceiver
android.ext.shared
com.android.onetimeinitializer
com.skyhookwireless.provider
com.kyocera.telephonyextra
com.android.server.telecom
com.android.keychain
jp.kyocera.vzwextension.service
com.kyocera.stopwatch
com.android.printservice.recommendation
com.android.dialer
android.ext.services
com.android.calllogbackup
com.android.packageinstaller
com.android.carrierdefaultapp
com.svox.pico
com.android.proxyhandler
jp.kyocera.kitting
com.android.managedprovisioning
com.kyocera.wifiautoactivate
jp.kyocera.kc_fmradio
jp.kyocera.batterycare
com.kyocera.mediumkey
com.android.server.telecom.overlay
com.kyocera.PcoStatusReceiver
jp.kyocera.kcPhoneSettings
com.android.storagemanager
com.android.bookmarkprovider
com.android.settings
com.kyocera.calendar.localaccount
com.verizon.obdm
com.qualcomm.location
com.android.cts.ctsshim
com.kyocera.alarm
com.kyocera.omadm
com.kyocera.timer
com.android.vpndialogs
com.kyocera.musicplayer
com.android.email
com.android.phone
com.android.shell
com.android.wallpaperbackup
com.android.providers.blockednumber
com.android.providers.userdictionary
com.android.emergency
jp.kyocera.providers.settings
com.android.location.fused
com.android.systemui
jp.kyocera.devicecontrol
com.android.exchange
com.android.bluetoothmidiservice
com.qualcomm.qti.poweroffalarm
jp.kyocera.kclightsservice
com.kyocera.apnsetting
com.android.traceur
jp.kyocera.thermalmonitor
com.android.bluetooth
com.qualcomm.timeservice
com.qualcomm.atfwd
com.android.providers.contacts
com.android.captiveportallogin
com.verizon.mdm.xvlte
com.verizon.pushtotalkplus
jp.kyocera.sub.kitting
```

At this point, I can use my intuition or defer to an LLM which packages to search. I'll pull those packages to my computer and run Apktool to disassemble.

```bash
#!/usr/bin/env bash

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <package.name> [package.name ...]"
  exit 1
fi

OUT_DIR="decompiled"
APK_DIR="apks"

mkdir -p "$OUT_DIR" "$APK_DIR"

for pkg in "$@"; do
  # Query APK paths from device
  paths=$(adb shell pm path "$pkg" | sed 's/^package://')

  if [ -z "$paths" ]; then
    echo "  ! Package not found: $pkg"
    continue
  fi

  pkg_apk_dir="$APK_DIR/$pkg"
  mkdir -p "$pkg_apk_dir"

  # Pull base + split APKs
  for path in $paths; do
    apk_name=$(basename "$path")
    echo "  Pulling $apk_name"
    adb pull "$path" "$pkg_apk_dir/$apk_name"
  done

  # Prefer base.apk for apktool
  base_apk=$(ls "$pkg_apk_dir"/base*.apk 2>/dev/null | head -n 1)

  # Fallback for legacy single-apk installs
  if [ -z "$base_apk" ]; then
    base_apk=$(ls "$pkg_apk_dir"/*.apk 2>/dev/null | head -n 1)
  fi

  if [ -n "$base_apk" ]; then
    echo "  Decompiling $(basename "$base_apk")"
    apktool d -f "$base_apk" -o "$OUT_DIR/$pkg"
  else
    echo "  ! No APK found to decompile for $pkg"
  fi
done
```

From this point, I'll grep the resulting Smali for interfaces I'm interested in. Here's an snippet of an Activity in the Voice Recognition app that calls into `jp/kyocera/kcfp/util/KCfpSoftkeyGuide` which is a strong candidate.

```smali
.class public Lcom/kyocera/voicerecognition/TopHelpActivity;
.super Landroid/app/Activity;
.source "TopHelpActivity.java"

# static fields
.field public static final LOGTAG:Ljava/lang/String;


# instance fields
.field private final closeAppTask:Ljava/lang/Runnable;

.field private final handler:Landroid/os/Handler;

.field private mEngine:Lcom/kyocera/voicerecognition/ReadoutText;

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 3

    .line 32
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    .line 33
    sget-object p1, Lcom/kyocera/voicerecognition/TopHelpActivity;->LOGTAG:Ljava/lang/String;

    const-string v0, "onCreate[in]"

    // ...

    .line 38
    invoke-static {}, Ljp/kyocera/kcfp/util/KCfpWidgetUtil;->getInstance()Ljp/kyocera/kcfp/util/KCfpWidgetUtil;

    move-result-object v0

    invoke-virtual {p0}, Lcom/kyocera/voicerecognition/TopHelpActivity;->getActionBar()Landroid/app/ActionBar;

    move-result-object v1

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Ljp/kyocera/kcfp/util/KCfpWidgetUtil;->setDisplayShowOverflowMenuButtonEnabled(Landroid/app/ActionBar;Z)V

    const v0, 0x7f0d009f

    .line 39
    invoke-virtual {p0, v0}, Lcom/kyocera/voicerecognition/TopHelpActivity;->getString(I)Ljava/lang/String;

    move-result-object v0

    .line 40
    invoke-virtual {p0}, Lcom/kyocera/voicerecognition/TopHelpActivity;->getWindow()Landroid/view/Window;

    move-result-object v1

    invoke-static {v1}, Ljp/kyocera/kcfp/util/KCfpSoftkeyGuide;->getSoftkeyGuide(Landroid/view/Window;)Ljp/kyocera/kcfp/util/KCfpSoftkeyGuide;

    move-result-object v1

    if-eqz v1, :cond_0

    .line 43
    invoke-virtual {v1, v2, v0}, Ljp/kyocera/kcfp/util/KCfpSoftkeyGuide;->setText(ILjava/lang/CharSequence;)V

    .line 44
    invoke-virtual {v1}, Ljp/kyocera/kcfp/util/KCfpSoftkeyGuide;->invalidate()V

    :cond_0
    const v0, 0x7f080054

    .line 47
    invoke-virtual {p0, v0}, Lcom/kyocera/voicerecognition/TopHelpActivity;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/widget/TextView;

    .line 48
    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setText(I)V

    const p1, 0x7f080053

    .line 49
    invoke-virtual {p0, p1}, Lcom/kyocera/voicerecognition/TopHelpActivity;->findViewById(I)Landroid/view/View;

    move-result-object p1

    check-cast p1, Landroid/widget/TextView;

    const/16 v0, 0x8

    .line 50
    invoke-virtual {p1, v0}, Landroid/widget/TextView;->setVisibility(I)V

    .line 51
    sget-object p1, Lcom/kyocera/voicerecognition/TopHelpActivity;->LOGTAG:Ljava/lang/String;

    const-string v0, "onCreate[out]"

    invoke-static {p1, v0}, Lcom/kyocera/voicerecognition/util/LogUtils;->d(Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method
```

Then with a single prompt in [OpenCode](https://opencode.ai/), I have a Java class! I'm using [Gemini 3 Flash](https://blog.google/products-and-platforms/products/gemini/gemini-3/), which I've generally found to be the most effective model when working with Android. Plus Anthropic is sadly [blocking Claude subscriptions](https://github.com/anomalyco/opencode/issues/7410) inside OpenCode.

```text






                             █▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
                             █░░█ █░░█ █▀▀▀ █░░█ █░░░ █░░█ █░░█ █▀▀▀
                             ▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀


             ┃
             ┃  Reassemble the @smali/com/kyocera/voicerecognition/TopHelpActivity.
             ┃  smali Smali into its original Java class, with a focus on
             ┃  reconstructing APIs it calls into from the 'jp.kyocera.kcfp` package
             ┃
             ┃  Build  Gemini 3 Flash Preview Google
             ╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                           tab switch agent  ctrl+p commands






  ~/Kyocera/decompiled/VoiceRecognition                1.1.13
```

After a few seconds and 47,573 tokens (~$0.05), OpenCode wrote the full Java class and specifically re-constructed the interfaces to the APIs that I'm interested in.

> **Locating Dependent Smali Files**
>
> I'm now focusing on locating the necessary smali files for the `jp.kyocera.kcfp classes`. Specifically, I need the files for the package structure to ensure proper reconstruction of the dependent classes. I plan to begin by searching for the jp/kyocera/kcfp directory. This should provide the information needed for accurate reassembly.
>
> I've analyzed the `TopHelpActivity.smali` file. To accurately reassemble it and reconstruct the `jp.kyocera.kcfp APIs`, I'll first locate and examine the relevant smali files for the external libraries and inner classes.
>
> * `tool_call`: glob for pattern `'*/jp/kyocera/kcfp/util/.smali'`
> * `tool_call`: glob for pattern `'*/com/kyocera/voicerecognition/TopHelpActivity$.smali'`
> * `tool_call`: glob for pattern `'**/com/kyocera/voicerecognition/ReadoutText.smali'`
> * `tool_call`: glob for pattern `'**/com/kyocera/voicerecognition/VoiceRecognition.smali'`
> * `tool_call`: glob for pattern `'**/com/kyocera/voicerecognition/util/LogUtils.smali'`
>
> * ✱ Glob "**/jp/kyocera/kcfp/util/*.smali"
> * ✱ Glob "**/com/kyocera/voicerecognition/TopHelpActivity$*.smali" (3 matches)
> * ✱ Glob "**/com/kyocera/voicerecognition/ReadoutText.smali" (1 matches)
> * ✱ Glob "**/com/kyocera/voicerecognition/VoiceRecognition.smali" (1 matches)
> * ✱ Glob "**/com/kyocera/voicerecognition/util/LogUtils.smali" (1 matches)

Here's a snippet from the resulting Java file.

```java
package com.kyocera.voicerecognition;

// ...
import jp.kyocera.kcfp.util.KCfpSoftkeyGuide;
import jp.kyocera.kcfp.util.KCfpWidgetUtil;

/**
 * Activity for displaying top-level help information with voice readout.
 */
public class TopHelpActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(0x7f0a0023); // R.layout.top_help_activity
        setTitle(0x7f0d006e);      // R.string.help_title
        mEngine = ReadoutText.getInstance();

        // Initial voice readout: "Help Title, Help Description"
        String speakText = getString(0x7f0d006e) + "," + getString(0x7f0d006d);
        mEngine.speak(speakText, "INIT");

        // Kyocera Framework: Disable overflow menu button in ActionBar
        KCfpWidgetUtil.getInstance().setDisplayShowOverflowMenuButtonEnabled(getActionBar(), false);

        // Kyocera Framework: Set softkey guide text
        String softkeyText = getString(0x7f0d009f); // R.string.softkey_close
        KCfpSoftkeyGuide guide = KCfpSoftkeyGuide.getSoftkeyGuide(getWindow());
        if (guide != null) {
            guide.setText(0, softkeyText);
            guide.invalidate();
        }

        // Set UI text
        TextView titleView = (TextView) findViewById(0x7f080054); // R.id.help_title
        titleView.setText(0x7f0d006e);
        TextView subtitleView = (TextView) findViewById(0x7f080053); // R.id.help_subtitle
        subtitleView.setVisibility(8); // GONE
    }
```

As well as the soft key API that I care about:

```java
package jp.kyocera.kcfp.util;
import android.view.Window;

/**
 * Reconstructed utility for managing softkey guides on Kyocera devices.
 */
public class KCfpSoftkeyGuide {

    public static KCfpSoftkeyGuide getSoftkeyGuide(Window window) {
        // Implementation provided by Kyocera KCFP framework
    }

    /**
     * Sets the text for a specific softkey.
     * @param index The index of the softkey (e.g., 0 for left/center softkey).
     * @param text The text to display.
     */
    public void setText(int index, CharSequence text) {
        // Implementation provided by Kyocera KCFP framework
    }

    /**
     * Invalidates the guide view to trigger a redraw.
     */
    public void invalidate() {
        // Implementation provided by Kyocera KCFP framework
    }

    // ...
}
```

It turns out this API was already documented on [r/flipphones](https://www.reddit.com/r/flipphones/comments/1ncaub7/i_managed_to_sniff_out_the_hidden_api_to_show/) as well as the [timeweb blog](https://habr.com/ru/companies/timeweb/articles/844936/) (in Russian). Nonetheless, it illustrates just how quickly an LLM can reconstruct Java code from Smali. With a more thorough prompt, this could be applied to an entire APK, properly map resource IDs, and even apply reasonable variable names to code minified using Proguard!

After a bit more searching, I was able to reconsruct the entire API including the `setSoftkeyEventListener` method and corresponding listener. Before integrating these APIs into PodLP, clicking the physical volume keys would trigger the soft key bar to show and not hide with the system dialog. After integration, the app feels more native and no longer has the previous quirks.

## Part 2. Sonim and Beyond

{{< responsive-image src="kyocera-and-sonim-podlp.jpeg" alt="PodLP on Android Flip Phones" caption="PodLP on the Sonim XP3+ and Kyocera DuraXV" class="w-full no-border contain" >}}

Thanks to the folks on the [JTech Forum](https://forums.jtechforums.org/) and for several newly-acquired devices on eBay, I've been able to investigate the firmware on more models. For instance, on the [Sonim XP3+ XP3900](https://amzn.to/3ZmSW4u) soft keys are handled in a completely different way.

Unlike Kyocera, there are three soft keys (left, middle, and right). Soft middle is a separate key from `Enter` or `DPAD_CENTER`. The soft key UI cannot be hidden, and menu items can only be `Strings` (no `Drawables`). Setting soft keys is easy:

```kotlin
val softBarIntent = Intent("android.intent.action.CHANGE_NAV_BAR").apply {
    putExtra("left", "Menu")
    putExtra("center", "Select")
    putExtra("right", "Back")
    putExtra("from_package", context.packageName)
}

context.sendBroadcast(softBarIntent)
```

Unfortunately, it's not possible to detect this `Intent`'s receiver with `packageManager.queryBroadcastReceivers` because it's registered dynamically inside SystemUI using the centralized `BroadcastDispatcher`. There is no way to know whether the `Intent` was received and the UI updated.

```text
01-21 17:29:32.806  7704  7713 W dex2oat32: Accessing hidden method Landroid/content/Context;->isUiContext()Z (blacklist, linking, denied)
```

I've also been experimenting with other hidden APIs. In this instance, access via Android X or some compatability library was blocked from calling `Context.isUiContext`. Because the Sonim XP3+ runs Android 11 (the Kyocera DuraXV runs the much older Android 8), I've had to use [HiddenApiBypass](https://github.com/LSPosed/AndroidHiddenApiBypass) to circumvent the Android 9+ [restrictions on non-SDK interfaces](https://developer.android.com/guide/app-compatibility/restrictions-non-sdk-interfaces). Fortunately, LSPass works well on the Sonim XP3+ so I've been able to continue experimenting.

## Conclusion

Using Gemini via OpenCode for reverse engineering hidden Android APIs is much more efficient than doing it by hand. As I acquire more phone models, I'll expand this analysis to better integrate into these fragmented feature phones. I'm also exploring other uses of Gemini & OpenCode for Android development including:

* Constructing utility classes leveraging reflection to call hidden APIs
* Integrating hidden API utilities into my application's lifecycle
* Generating Vector Drawables and adaptive icons from Scalable Vector Graphics (SVG) files
* Writing Proguard rules to optimize release builds

Testing on physical devices is still critical, but I wish I had tools like Gemini and OpenCode back in 2012-2015 when I was actively reverse engineering many flagship Android phones for fun and profit.
