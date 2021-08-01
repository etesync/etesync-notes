<p align="center">
  <img width="120" src="assets/icon.png" />
  <h1 align="center">EteSync - Encrypt Everything</h1>
</p>

Secure, end-to-end encrypted, and privacy-respecting notes application.

[<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
     alt="Get it on F-Droid"
     height="80">](https://f-droid.org/packages/com.etesync.notes/)
[<img src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png"
     alt="Get it on Google Play"
     height="80">](https://play.google.com/store/apps/details?id=com.etesync.notes)
[<img src="https://www.etesync.com/static/img/app-store-badge.c31e7b1c6a83.png"
     alt="Download on the App Store"
     height="80">](https://apps.apple.com/us/app/etesync-notes/id1533806351)

![GitHub tag](https://img.shields.io/github/tag/etesync/etesync-notes.svg)
[![Chat on freenode](https://img.shields.io/badge/irc.freenode.net-%23EteSync-blue.svg)](https://webchat.freenode.net/?channels=#etesync)

# Overview

Please see the [EteSync website](https://www.etesync.com) for more information.

EteSync is licensed under the [GPLv3 License](LICENSE).

The App is a react native app that uses the react-native-web library to run in the browser.

# Usage

A live instance is available on https://notes.etesync.com/

# Support Developing the App

Find more information about setting up the development environments here https://reactnative.dev/docs/environment-setup.

## Prerequisites

Before you can build the App from source, you need to make sure you have `yarn` and `node` installed.

- Clone this repository `git clone https://github.com/etesync/etesync-notes.git`
- Enter the newly created folder `cd etesync-notes`
- Run `yarn` and wait until all of the deps are installed

## Run the Web App

- Install expo `npm install -g expo-cli`
- Run `yarn add expo`
- Run `yarn web`

## Run the iOS App (OS X only)

Make sure XCode and developer tools are installed.

- Install cocoapods `brew install cocoapods`
- Enter the root directory of the project and then the iOS directory `cd ios`
- Run `pod install` and wait for it to complete
- exit the iOS directory `cd ..`
- Run `yarn start` in one shell
- And run `yarn ios` in another shell (this will start the simulator)

## Run the Android App

- Install all tools for your environment https://reactnative.dev/docs/environment-setup
- Start your virtual device by opening Android studio and in the bottom right corner click "Configure" and select "AVD Manager"
- If no device for the required build environment is available, create a new one
- Run `yarn start` in one shell
- And run `yarn android` in another shell (this will connect the emulator) - the first build may take some time
- If you run into this issue `Task :app:validateSigningDebug FAILED` download the [debug.keystore](https://raw.githubusercontent.com/facebook/react-native/master/template/android/app/debug.keystore) and copy it into your `android/app` folder
