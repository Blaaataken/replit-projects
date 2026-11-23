# App Store Submission Guide

This guide provides comprehensive instructions for submitting the SHAWNSWORKS app to various Android app stores and distribution platforms.

## Table of Contents

1. [Android Build Commands](#android-build-commands)
2. [Google Play Store Submission](#google-play-store-submission)
   - [Privacy Policy Requirements](#privacy-policy-requirements)
   - [Data Safety Form](#data-safety-form-required)
3. [F-Droid Submission](#f-droid-submission)
4. [APK Mirror](#apk-mirror)
5. [Required Assets Checklist](#required-assets-checklist)
   - [Asset Generation Commands](#asset-generation-commands)

---

## Android Build Commands

### Prerequisites

- Node.js 18+ installed
- Android Studio installed with SDK 35
- Java JDK 17+ installed
- Capacitor CLI installed (`@capacitor/cli`)

### Build Process

#### Step 1: Build the Web App

```bash
npm run build
```

This compiles the frontend application and outputs it to `dist/public/` as configured in `capacitor.config.ts`.

#### Step 2: Sync with Android

```bash
npx cap sync android
```

This command:
- Copies the built web assets to `android/app/src/main/assets/public/`
- Updates the native Android project with any Capacitor plugin changes
- Syncs the `capacitor.config.ts` settings

#### Step 3: Open in Android Studio

```bash
npx cap open android
```

This opens the `android/` project in Android Studio for building and testing.

### Generating Signed APK/AAB

#### Option A: Using Android Studio (Recommended)

1. Open the project in Android Studio: `npx cap open android`
2. Go to **Build → Generate Signed Bundle / APK**
3. Select **Android App Bundle** for Play Store or **APK** for direct distribution
4. Create or select your keystore (see [Keystore Generation](#keystore-generation))
5. Select **release** build variant
6. Click **Create** to generate the signed build

Output locations:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

#### Option B: Using Command Line

```bash
cd android

# For release AAB (Play Store)
./gradlew bundleRelease

# For release APK (direct distribution)
./gradlew assembleRelease
```

### Keystore Generation

Generate a new keystore for app signing:

```bash
keytool -genkey -v -keystore shawnsworks-release.keystore \
  -alias shawnsworks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important:** Store your keystore file and passwords securely. Losing them means you cannot update your app.

Create `android/keystore.properties` (do not commit to version control):

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=shawnsworks
storeFile=../shawnsworks-release.keystore
```

Update `android/app/build.gradle` to use the keystore:

```gradle
android {
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Google Play Store Submission

### Developer Account Requirements

1. **Create a Google Play Developer Account**
   - Visit: https://play.google.com/console
   - Pay one-time registration fee: **$25 USD**
   - Complete identity verification (may take 48 hours)
   - Accept the Developer Distribution Agreement

2. **Account Requirements**
   - Valid Google account
   - Government-issued ID for verification
   - Payment method for registration fee
   - Contact information (displayed publicly)

### App Bundle (.aab) Generation

1. Build and sync the web app:
   ```bash
   npm run build
   npx cap sync android
   ```

2. Open in Android Studio:
   ```bash
   npx cap open android
   ```

3. Generate signed AAB:
   - **Build → Generate Signed Bundle / APK**
   - Select **Android App Bundle**
   - Use your release keystore
   - Select **release** build variant

### Store Listing Requirements

#### App Details

| Field | Requirement | SHAWNSWORKS Example |
|-------|-------------|---------------------|
| **App Name** | Max 30 characters | SHAWNSWORKS |
| **Short Description** | Max 80 characters | AI-Powered Multi-Chain Crypto Trading Platform |
| **Full Description** | Max 4000 characters | See [Long Description Template](#long-description-template) |
| **App Category** | Primary + Secondary | Finance / Business |
| **Content Rating** | Complete questionnaire | See [Content Rating](#content-rating-questionnaire) |

#### Long Description Template

```
SHAWNSWORKS - AI-Powered Multi-Chain Cryptocurrency Platform

Trade, bridge, and stake across multiple blockchain networks with AI-powered insights.

KEY FEATURES:

📊 AI Trading Signals
Get intelligent trading recommendations powered by advanced AI analysis. Our algorithms analyze market trends, on-chain data, and sentiment to provide actionable insights.

🌉 Cross-Chain Bridge
Seamlessly transfer tokens between Ethereum, Polygon, Base, Arbitrum, Optimism, and Avalanche. Our AI optimizes routes for the lowest fees and fastest transactions.

💰 Multi-Chain Staking
Stake your tokens across multiple networks from a single interface. Compare APY rates and maximize your rewards with AI-recommended strategies.

📈 Portfolio Dashboard
Track your entire portfolio across all supported networks. Real-time balance updates, price changes, and performance analytics.

⛓️ Supported Networks:
• Ethereum Mainnet
• Polygon
• Base
• Arbitrum One
• Optimism
• Avalanche C-Chain

🔒 Security First
• Non-custodial - you control your keys
• Secure wallet connection via WalletConnect
• Open-source smart contracts

DISCLAIMER: This app provides informational content only. Cryptocurrency trading involves significant risk. Always do your own research before making investment decisions.
```

#### Screenshots

Required screenshots:
- **Phone**: Minimum 2, maximum 8 (16:9 or 9:16 aspect ratio)
- **7-inch Tablet**: Optional but recommended
- **10-inch Tablet**: Optional but recommended

Recommended screenshot dimensions:
- Phone: 1080 x 1920 pixels (portrait) or 1920 x 1080 (landscape)
- Tablet 7": 1200 x 1920 pixels
- Tablet 10": 1600 x 2560 pixels

**Screenshot suggestions for SHAWNSWORKS:**
1. Dashboard overview with portfolio balance
2. AI Trading signals view
3. Cross-chain bridge interface
4. Staking rewards calculator
5. Network status dashboard
6. Wallet connection flow

#### Feature Graphic

- **Dimensions**: 1024 x 500 pixels
- **Format**: PNG or JPEG
- **No transparency**
- Should clearly represent the app brand

Design recommendations:
- Use the SHAWNSWORKS purple gradient (#6d28d9)
- Include app logo and tagline
- Show key features visually (network icons, AI, charts)

### Content Rating Questionnaire

Navigate to **Policy → App content → Content rating** in Play Console.

For SHAWNSWORKS, answer the questionnaire as follows:

| Category | Response |
|----------|----------|
| Violence | No |
| Sexual Content | No |
| Language | No offensive language |
| Controlled Substance | No |
| Gambling | No (trading is not gambling) |
| User-Generated Content | No (if no user posts) |
| Personal Information | Yes (wallet addresses) |
| Financial Transactions | Yes |

**Expected Rating**: PEGI 3 / Everyone

### Privacy Policy Requirements

Google Play requires a privacy policy for apps that:
- Request sensitive permissions
- Handle personal or sensitive user data
- Are designed for children

**Privacy Policy must include:**
1. What data is collected (wallet addresses, transaction history)
2. How data is used
3. Third-party services used (blockchain networks, APIs)
4. Data retention policies
5. User rights (access, deletion)
6. Contact information

**Privacy Policy URL**: Host on your website and add to:
- Play Console: **Store settings → Privacy policy**
- App: Settings/About section

**Sample privacy policy sections for SHAWNSWORKS:**

```
DATA WE COLLECT:
- Wallet addresses you connect
- Transaction history (from public blockchain)
- App usage analytics (anonymous)

DATA WE DO NOT COLLECT:
- Private keys
- Seed phrases
- Personal identification information

THIRD-PARTY SERVICES:
- Blockchain RPC providers
- Price data APIs
- Analytics services
```

### Data Safety Form (Required)

Google Play requires all apps to complete the Data Safety Form in Play Console. This is especially important for finance/crypto apps that handle sensitive financial data.

Navigate to **Policy → App content → Data safety** in Play Console.

#### Data Collection Disclosure

For SHAWNSWORKS, declare the following data types as collected:

| Data Type | Collected | Purpose | Required |
|-----------|-----------|---------|----------|
| **Wallet addresses** | Yes | App functionality | Yes |
| **Transaction data** | Yes | App functionality, Analytics | Yes |
| **Device identifiers** | Yes | Analytics, Fraud prevention | No |
| **App interactions** | Yes | Analytics | No |
| **Crash logs** | Yes | App functionality | No |

#### Data Sharing Disclosure

Declare third-party data sharing:

| Data Type | Shared With | Purpose |
|-----------|-------------|---------|
| **Wallet addresses** | Blockchain RPC providers | Transaction processing |
| **Transaction data** | Blockchain explorers | Transaction verification |
| **Trading patterns** | OpenAI API | AI trading signal generation |
| **Anonymous analytics** | Analytics providers | App improvement |

#### Security Practices Checklist

Answer the following in the Data Safety Form:

| Question | Answer | Notes |
|----------|--------|-------|
| Is data encrypted in transit? | **Yes** | All API calls use HTTPS/TLS |
| Is data encrypted at rest? | **Yes** | Local storage encrypted |
| Can users request data deletion? | **Yes** | Via app settings or email |
| Does app follow Google Play Families Policy? | **No** | Not designed for children |
| Is app a financial service? | **Yes** | Cryptocurrency trading platform |

#### Data Deletion Process

Users must be able to request deletion of their data. For SHAWNSWORKS:

1. **In-App Option**: Settings → Privacy → Delete My Data
2. **Email Request**: Contact support@shawnsworks.com
3. **Response Time**: Within 30 days
4. **What Gets Deleted**:
   - Local wallet connection data
   - App preferences and settings
   - Usage analytics associated with device
5. **What Cannot Be Deleted**:
   - Blockchain transactions (immutable, public)
   - Data already shared with third parties

**Important Notes for Crypto Apps:**
- Clearly state that blockchain transactions are permanent and public
- Explain that wallet addresses are pseudonymous, not anonymous
- Disclose that AI features send data to external APIs
- Emphasize that private keys and seed phrases are never collected

#### Recommended Form Answers for Crypto Trading App

**Section: Data Types**
- [x] Financial info → User payment info (wallet addresses)
- [x] Financial info → Purchase history (transaction history)
- [x] App activity → App interactions
- [x] App info and performance → Crash logs
- [x] Device or other IDs

**Section: Data Usage and Handling**
- [x] Data is encrypted in transit
- [x] Data is encrypted at rest
- [x] Users can request that data be deleted
- [x] Data is processed ephemerally (for AI signals)

**Section: Data Sharing**
- [x] Data is shared with third parties for app functionality
- Third parties: Blockchain networks, OpenAI API, RPC providers

### App Signing

Google Play manages app signing by default (Google Play App Signing).

**Enrollment options:**
1. **New apps**: Automatically enrolled - upload signing key or let Google generate one
2. **Existing apps**: Can enroll later, but recommended

**Upload key vs Signing key:**
- **Upload key**: Used to sign the AAB you upload (you keep this)
- **Signing key**: Used by Google to sign the final APK (managed by Google)

---

## F-Droid Submission

F-Droid is an open-source Android app repository. Submission requires your app to be fully open-source.

### Open-Source Compliance Requirements

1. **License**: Must use an OSI-approved license (GPL, MIT, Apache 2.0, etc.)
2. **Source Code**: Complete source must be publicly available
3. **No Proprietary Dependencies**: All dependencies must be open-source
4. **No Tracking**: Remove analytics, crash reporting, or tracking SDKs
5. **No Non-Free Network Services**: Should work with self-hosted alternatives

**For SHAWNSWORKS:**
- Ensure all smart contracts are open-source
- Use open-source RPC providers or allow custom RPC configuration
- Remove any proprietary analytics

### F-Droid Metadata Requirements

Create metadata file at: `fastlane/metadata/android/en-US/`

```
fastlane/
└── metadata/
    └── android/
        └── en-US/
            ├── full_description.txt    (max 4000 chars)
            ├── short_description.txt   (max 80 chars)
            ├── title.txt               (max 30 chars)
            ├── changelogs/
            │   └── 1.txt               (changelog for versionCode 1)
            └── images/
                ├── icon.png            (512x512)
                ├── featureGraphic.png  (1024x500)
                ├── phoneScreenshots/
                │   ├── 1.png
                │   └── 2.png
                └── sevenInchScreenshots/
                    └── 1.png
```

### Build Reproducibility Requirements

F-Droid builds apps from source. Your build must be reproducible.

**Requirements:**
1. **Build instructions**: Clear documentation for building from source
2. **Deterministic builds**: Same source should produce identical output
3. **No network during build**: Build must work offline
4. **Version pinning**: Lock all dependency versions

Create `.fdroid.yml` in your repository root:

```yaml
Categories:
  - Money
License: MIT
AuthorName: SHAWNSWORKS
AuthorEmail: contact@shawnsworks.com
SourceCode: https://github.com/shawnsworks/swc-app
IssueTracker: https://github.com/shawnsworks/swc-app/issues

RepoType: git
Repo: https://github.com/shawnsworks/swc-app.git

Builds:
  - versionName: '1.0.0'
    versionCode: 1
    commit: v1.0.0
    subdir: android/app
    gradle:
      - yes
    prebuild:
      - npm install
      - npm run build
      - npx cap sync android

AutoUpdateMode: Version v%v
UpdateCheckMode: Tags
CurrentVersion: '1.0.0'
CurrentVersionCode: 1
```

### Submission Process

#### Option 1: Request for Packaging (RFP)

1. Open an issue at: https://gitlab.com/fdroid/rfp/-/issues
2. Use the RFP template
3. Provide:
   - App name and description
   - Source code URL
   - License
   - Build instructions

#### Option 2: Merge Request to fdroiddata

1. Fork https://gitlab.com/fdroid/fdroiddata
2. Create metadata file: `metadata/com.shawnsworks.swc.yml`
3. Submit merge request

**Sample metadata file:**

```yaml
Categories:
  - Money
License: MIT
AuthorName: SHAWNSWORKS
AuthorEmail: contact@shawnsworks.com
WebSite: https://shawnsworks.com
SourceCode: https://github.com/shawnsworks/swc-app
IssueTracker: https://github.com/shawnsworks/swc-app/issues
Changelog: https://github.com/shawnsworks/swc-app/releases

AutoName: SHAWNSWORKS
Description: |
  AI-Powered Multi-Chain Cryptocurrency Trading Platform.
  
  Features:
  * AI trading signals
  * Cross-chain bridging
  * Multi-chain staking
  * Portfolio tracking

RepoType: git
Repo: https://github.com/shawnsworks/swc-app.git

Builds:
  - versionName: '1.0.0'
    versionCode: 1
    commit: v1.0.0
    subdir: android
    gradle:
      - yes
    prebuild:
      - cd ..
      - npm install
      - npm run build
      - npx cap sync android

AutoUpdateMode: Version
UpdateCheckMode: Tags
CurrentVersion: '1.0.0'
CurrentVersionCode: 1
```

---

## APK Mirror

APK Mirror is a popular third-party APK hosting site. It's useful for distribution outside Play Store.

### APK Signing Requirements

All APKs must be signed with a valid keystore:

```bash
# Build signed APK
cd android
./gradlew assembleRelease

# Verify signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

**Requirements:**
- Must use the same keystore for all versions
- APK must pass verification
- Signature must be consistent across updates

### Version Naming Conventions

Follow semantic versioning: `MAJOR.MINOR.PATCH`

| Version | versionCode | When to Use |
|---------|-------------|-------------|
| 1.0.0 | 1 | Initial release |
| 1.0.1 | 2 | Bug fixes |
| 1.1.0 | 3 | New features |
| 2.0.0 | 4 | Major changes |

Update versions in `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.shawnsworks.swc"
    versionCode 1        // Increment for each release
    versionName "1.0.0"  // User-visible version
}
```

### Upload Process

1. **Visit**: https://www.apkmirror.com/apk-upload/
2. **Account**: Create account or login
3. **Upload**: Submit signed APK file
4. **Verification**: APK Mirror verifies the signature
5. **Review**: Manual review before publishing (usually 24-48 hours)

**Requirements for APK Mirror:**
- APK must be signed
- Package name must be unique
- Version must be higher than existing uploads
- No malware or policy violations

---

## Required Assets Checklist

### App Icons (Already Generated)

| Size | Location | Platform |
|------|----------|----------|
| 72x72 | `client/public/icons/icon-72x72.png` | Android hdpi |
| 96x96 | `client/public/icons/icon-96x96.png` | Android xhdpi |
| 120x120 | `client/public/icons/icon-120x120.png` | iOS iPhone |
| 128x128 | `client/public/icons/icon-128x128.png` | Web |
| 144x144 | `client/public/icons/icon-144x144.png` | Android xxhdpi |
| 152x152 | `client/public/icons/icon-152x152.png` | iOS |
| 167x167 | `client/public/icons/icon-167x167.png` | iOS iPad Pro |
| 180x180 | `client/public/icons/icon-180x180.png` | iOS |
| 192x192 | `client/public/icons/icon-192x192.png` | Android/PWA |
| 384x384 | `client/public/icons/icon-384x384.png` | PWA |
| 512x512 | `client/public/icons/icon-512x512.png` | Play Store / PWA |
| SVG | `client/public/icons/icon.svg` | Vector source |

### Android Launcher Icons (Already Generated)

Located in `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)
- `mipmap-anydpi-v26/ic_launcher.xml` (Adaptive icon)

### Assets Still Needed

#### Feature Graphic (Required for Play Store)

- **Dimensions**: 1024 x 500 pixels
- **Format**: PNG or JPEG (no transparency)
- **Location**: Create and save to `assets/store/feature-graphic.png`

**Design suggestions:**
- Purple gradient background (#6d28d9 to #4c1d95)
- SHAWNSWORKS logo on left
- Key feature icons (networks, AI, charts) on right
- Tagline: "AI-Powered Multi-Chain Trading"

#### Screenshots (Required for Play Store)

Minimum 2, recommended 5-8 screenshots per device type.

**Phone Screenshots** (1080 x 1920 or 1920 x 1080):
- [ ] Dashboard with portfolio overview
- [ ] AI Trading signals view
- [ ] Cross-chain bridge interface
- [ ] Staking calculator
- [ ] Network status view
- [ ] Wallet connection flow
- [ ] Transaction history
- [ ] Settings page

**7-inch Tablet Screenshots** (1200 x 1920):
- [ ] Dashboard (tablet layout)
- [ ] Trading view (tablet layout)

**10-inch Tablet Screenshots** (1600 x 2560):
- [ ] Dashboard (tablet layout)
- [ ] Bridge interface (tablet layout)

### Asset Generation Commands

Use the following methods to generate the required store assets.

#### Screenshot Capture with Playwright

Install Playwright for automated screenshot capture:

```bash
npm install -D playwright @playwright/test
npx playwright install chromium
```

Create a screenshot script at `scripts/capture-screenshots.ts`:

```typescript
import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  
  // Navigate to your app
  await page.goto('http://localhost:5000');
  
  // Capture dashboard
  await page.screenshot({ 
    path: 'assets/store/screenshots/phone/01-dashboard.png',
    fullPage: false 
  });
  
  // Navigate to trading page
  await page.goto('http://localhost:5000/trading');
  await page.screenshot({ 
    path: 'assets/store/screenshots/phone/02-trading.png' 
  });
  
  // Navigate to bridge page
  await page.goto('http://localhost:5000/bridge');
  await page.screenshot({ 
    path: 'assets/store/screenshots/phone/03-bridge.png' 
  });
  
  // Navigate to staking page
  await page.goto('http://localhost:5000/staking');
  await page.screenshot({ 
    path: 'assets/store/screenshots/phone/04-staking.png' 
  });
  
  await browser.close();
  console.log('Screenshots captured successfully!');
}

captureScreenshots();
```

Run the script:

```bash
# Start the app first
npm run dev &

# Run screenshot capture
npx tsx scripts/capture-screenshots.ts
```

#### Screenshot Capture for Different Device Sizes

```bash
# Phone (1080x1920)
npx playwright screenshot http://localhost:5000 screenshot.png \
  --viewport-size="1080,1920"

# 7-inch Tablet (1200x1920)
npx playwright screenshot http://localhost:5000 tablet-7.png \
  --viewport-size="1200,1920"

# 10-inch Tablet (1600x2560)
npx playwright screenshot http://localhost:5000 tablet-10.png \
  --viewport-size="1600,2560"
```

#### Feature Graphic Generation

Option 1: Using ImageMagick (command line):

```bash
# Create a purple gradient background (1024x500)
convert -size 1024x500 \
  gradient:'#6d28d9'-'#4c1d95' \
  -gravity center \
  -font Arial-Bold -pointsize 48 -fill white \
  -annotate +0-50 'SHAWNSWORKS' \
  -pointsize 24 \
  -annotate +0+50 'AI-Powered Multi-Chain Trading' \
  assets/store/feature-graphic.png
```

Option 2: Using Sharp (Node.js):

```bash
# Create script: scripts/generate-feature-graphic.js
node -e "
const sharp = require('sharp');

const width = 1024;
const height = 500;

const svg = \`
<svg width=\"\${width}\" height=\"\${height}\">
  <defs>
    <linearGradient id=\"grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">
      <stop offset=\"0%\" style=\"stop-color:#6d28d9;stop-opacity:1\" />
      <stop offset=\"100%\" style=\"stop-color:#4c1d95;stop-opacity:1\" />
    </linearGradient>
  </defs>
  <rect width=\"100%\" height=\"100%\" fill=\"url(#grad)\"/>
  <text x=\"512\" y=\"220\" font-family=\"Arial\" font-size=\"48\" font-weight=\"bold\" fill=\"white\" text-anchor=\"middle\">SHAWNSWORKS</text>
  <text x=\"512\" y=\"280\" font-family=\"Arial\" font-size=\"24\" fill=\"white\" text-anchor=\"middle\">AI-Powered Multi-Chain Trading</text>
</svg>
\`;

sharp(Buffer.from(svg))
  .png()
  .toFile('assets/store/feature-graphic.png')
  .then(() => console.log('Feature graphic created!'));
"
```

#### Manual Screenshot Capture (Alternative)

If automated tools are unavailable:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open Chrome DevTools** (F12 or Cmd+Option+I)

3. **Enable device emulation** (Cmd+Shift+M or Ctrl+Shift+M)

4. **Set custom dimensions**:
   - Phone: 1080 x 1920
   - 7" Tablet: 1200 x 1920
   - 10" Tablet: 1600 x 2560

5. **Capture screenshot**:
   - Open DevTools menu (three dots)
   - Select "Capture screenshot" or "Capture full size screenshot"

6. **Save to the correct location**:
   ```
   assets/store/screenshots/phone/01-dashboard.png
   ```

#### Batch Screenshot Script

Create `scripts/capture-all-screenshots.sh`:

```bash
#!/bin/bash

# Ensure assets directory exists
mkdir -p assets/store/screenshots/phone
mkdir -p assets/store/screenshots/tablet-7
mkdir -p assets/store/screenshots/tablet-10

PAGES=("/" "/trading" "/bridge" "/staking" "/dashboard")
NAMES=("01-dashboard" "02-trading" "03-bridge" "04-staking" "05-wallet")

BASE_URL="http://localhost:5000"

# Phone screenshots
for i in "${!PAGES[@]}"; do
  npx playwright screenshot "${BASE_URL}${PAGES[$i]}" \
    "assets/store/screenshots/phone/${NAMES[$i]}.png" \
    --viewport-size="1080,1920" \
    --wait-for-timeout=2000
done

# 7-inch tablet screenshots  
for i in "${!PAGES[@]}"; do
  npx playwright screenshot "${BASE_URL}${PAGES[$i]}" \
    "assets/store/screenshots/tablet-7/${NAMES[$i]}.png" \
    --viewport-size="1200,1920" \
    --wait-for-timeout=2000
done

# 10-inch tablet screenshots
for i in "${!PAGES[@]}"; do
  npx playwright screenshot "${BASE_URL}${PAGES[$i]}" \
    "assets/store/screenshots/tablet-10/${NAMES[$i]}.png" \
    --viewport-size="1600,2560" \
    --wait-for-timeout=2000
done

echo "All screenshots captured!"
```

Run with:
```bash
chmod +x scripts/capture-all-screenshots.sh
./scripts/capture-all-screenshots.sh
```

#### Store Descriptions

**Short Description** (max 80 characters):
```
AI-Powered Multi-Chain Crypto Trading, Bridging & Staking Platform
```

**Full Description**: See [Long Description Template](#long-description-template) above.

### Asset Storage Structure

Create the following directory structure:

```
assets/
└── store/
    ├── feature-graphic.png           (1024x500)
    ├── screenshots/
    │   ├── phone/
    │   │   ├── 01-dashboard.png
    │   │   ├── 02-trading.png
    │   │   ├── 03-bridge.png
    │   │   ├── 04-staking.png
    │   │   └── 05-wallet.png
    │   ├── tablet-7/
    │   │   ├── 01-dashboard.png
    │   │   └── 02-trading.png
    │   └── tablet-10/
    │       ├── 01-dashboard.png
    │       └── 02-bridge.png
    ├── descriptions/
    │   ├── short-description.txt
    │   └── full-description.txt
    └── privacy-policy.md
```

---

## Quick Reference Commands

```bash
# Full build and sync process
npm run build && npx cap sync android

# Open in Android Studio
npx cap open android

# Build release APK (command line)
cd android && ./gradlew assembleRelease

# Build release AAB (command line)
cd android && ./gradlew bundleRelease

# Generate keystore
keytool -genkey -v -keystore shawnsworks-release.keystore -alias shawnsworks -keyalg RSA -keysize 2048 -validity 10000

# Verify APK signature
jarsigner -verify -verbose -certs app-release.apk
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | TBD | Initial release |

---

## Support

For questions about the submission process:
- Google Play: https://support.google.com/googleplay/android-developer
- F-Droid: https://f-droid.org/docs/
- APK Mirror: https://www.apkmirror.com/faq/
