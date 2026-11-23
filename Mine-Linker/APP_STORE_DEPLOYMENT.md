# CryptoMiner App Store Deployment Guide

This guide walks you through deploying CryptoMiner to the Apple App Store and Google Play Store using Expo Application Services (EAS).

## Prerequisites

1. **Expo Account**: Create an account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally with `npm install -g eas-cli`
3. **Apple Developer Account**: Required for iOS ($99/year) - [developer.apple.com](https://developer.apple.com)
4. **Google Play Developer Account**: Required for Android ($25 one-time) - [play.google.com/console](https://play.google.com/console)

## Initial Setup

### 1. Login to Expo

```bash
eas login
```

### 2. Configure Project

Link your project to Expo:

```bash
eas init
```

This will create a project on Expo's servers and update `app.json` with your `projectId`.

### 3. Update Configuration

After running `eas init`, update these placeholders in your config files:

**app.json:**
- Replace `YOUR_EAS_PROJECT_ID` with your actual project ID
- Replace `YOUR_PROJECT_ID` in the updates URL

**eas.json:**
- Replace `YOUR_APPLE_ID@email.com` with your Apple ID
- Replace `YOUR_APP_STORE_CONNECT_APP_ID` with your App Store Connect app ID
- Replace `YOUR_APPLE_TEAM_ID` with your Apple Team ID

## Building for App Stores

### Development Build (Testing)

Creates a development build for internal testing:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Preview Build (Internal Distribution)

Creates a preview build for beta testing:

```bash
# iOS (requires Ad Hoc provisioning)
eas build --profile preview --platform ios

# Android (APK for direct installation)
eas build --profile preview --platform android
```

### Production Build (App Store)

Creates production-ready builds:

```bash
# iOS (IPA for App Store)
eas build --profile production --platform ios

# Android (AAB for Google Play)
eas build --profile production --platform android
```

## iOS App Store Submission

### 1. Apple Developer Setup

1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with bundle ID: `com.cryptominer.app`
3. Note your App Store Connect App ID

### 2. Configure Credentials

EAS will prompt you to configure credentials during your first build:

```bash
eas credentials
```

Options:
- **Automatic**: Let EAS manage certificates and provisioning profiles
- **Manual**: Use your own certificates

### 3. Submit to App Store

```bash
eas submit --platform ios
```

Or submit automatically after build:

```bash
eas build --profile production --platform ios --auto-submit
```

### 4. App Store Review

1. Complete App Store Connect metadata (description, screenshots, privacy policy)
2. Submit for review
3. Review typically takes 24-48 hours

## Google Play Store Submission

### 1. Google Play Console Setup

1. Log into [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Complete store listing and content rating

### 2. Service Account Setup

1. Go to Google Cloud Console
2. Create a service account with "Service Account User" role
3. Download the JSON key file
4. Save as `google-service-account.json` in your project root
5. In Play Console, grant the service account access to your app

### 3. Submit to Play Store

```bash
eas submit --platform android
```

Or submit automatically:

```bash
eas build --profile production --platform android --auto-submit
```

### 4. Play Store Review

1. Complete Play Console metadata
2. Submit for review (internal track first recommended)
3. Promote from internal → closed testing → open testing → production

## Version Management

### Incrementing Versions

Before each release, update in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

- `version`: User-facing version (semver)
- `buildNumber` (iOS): Must increment for each upload
- `versionCode` (Android): Must increment for each upload

## Over-the-Air Updates

CryptoMiner is configured for OTA updates using `expo-updates`.

### Publishing Updates

```bash
eas update --branch production --message "Bug fixes and improvements"
```

### Update Channels

- `development`: For development builds
- `preview`: For preview/beta builds  
- `production`: For production app store builds

## Environment Variables

Set environment variables for builds in `eas.json` or through EAS Secrets:

```bash
eas secret:create --name API_KEY --value "your-api-key"
```

## Troubleshooting

### Build Failures

1. Check build logs on [expo.dev](https://expo.dev)
2. Ensure all native dependencies are compatible
3. Verify credentials are correctly configured

### Submission Failures

1. Verify bundle ID matches App Store Connect / Play Console
2. Check version codes are incremented
3. Ensure all metadata is complete

### Common Issues

- **iOS: Invalid provisioning profile**: Run `eas credentials` to reconfigure
- **Android: Upload failed**: Verify service account permissions
- **Build queued too long**: Consider upgrading EAS plan for priority builds

## App Store Assets Required

### iOS

- App Icon: 1024x1024px (no alpha channel)
- Screenshots: Various sizes for different devices
- App Preview videos (optional)

### Android

- App Icon: 512x512px
- Feature Graphic: 1024x500px
- Screenshots: Various sizes
- Promo video (optional)

## Privacy & Compliance

Ensure you have:

1. **Privacy Policy**: Required for both stores
2. **Terms of Service**: Recommended
3. **Data Collection Disclosure**: Required for App Store
4. **Content Rating**: Required for Play Store

## Support

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
