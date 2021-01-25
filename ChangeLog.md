# Changelog
*NOTE:* may be removed in the future in favor of the fastlane changelog.

## Version 1.7.0
* A lot of cosmetic improvements
* Web: Do heavy cryptographic operations in a web worker
* Set up linking for web and add 404 page
* Add a font setting for editor and viewer
* Handle better refresh token errors
* Add setting for default view mode
* Sort notebooks by name
* Replace the note edit dialog with a screen
* Upgrade react native deps
* Add feature to share a note
* Add offline support for PWA
* Make ConfirmationDialog scrollable in case content is too long
* Improve light/dark themes' contrast for accessibility
* Use darker color for splash screen

## Version 1.6.0
* Add task (checkbox) support to note preview (including toggling them)
* Make the Android icon adaptive (much nicer looking)
* Fix FAB positioning on the web

## Version 1.5.1
* Markdown: fix lists not wrapping at the end of screen
* Fix editing the bottom of notes on iOS
* Note editing: fix padding issues

## Version 1.5.0
* Main page: fix the "home" title flashing on launch.
* LoginForm: make it more clear that people should use usernames, not emails.
* Allow clear-text traffic (HTTP).
* Fix automatic sync when apps move to foreground + launch
* Update etebase dep.
* Settings: add font size setting.

## Version 1.4.4
* Login: add an error when trying to use EteSync 1.0 accounts with EteSync Notes

## Version 1.4.3
* Remove mistakingly added extra permissions (due to Expo being added as a dev dep)

## Version 1.4.2
* Make it possible to set dark mode from settings
* Android: fix update checking

## Version 1.4.1
* Orientation: don't lock the screen orientation to portrait.
* Improve the drawer layout in landscape mode
* Fix text input issues in note name creation/editing on Android
* Autorefresh: fix to only happen in the main notes list screen.
* Note editing: fix scrolling when keyboard is open to not hide content.
* Markdown display: fix inline code in browsers.
* Logout: fix navigation to login screen on logout.
* Collection deletion: fix empty collection list after removing collections.
* Signup page: add a notice about signing up for trial.
* Fix flashing Drawer on launch on Android

## Version 1.4.0
* Update etebase dep - improves support for self-hosting + new collection type changes

## Version 1.3.1
* Improve look and feel
* Make it possible to delete notes
* iOS: enable expo-updates for OTA updates

## Version 1.3.0
* Improve look and feel
* Disable Expo-updates.
* Signup: show field-specific errors
* Set mtime when creating collections

## Version 1.2.0
* Remove Expo dependency as it was pulling a lot of unneeded stuff
* Change the title of the "all notes" page to "All Notes".
* Fix collection deletion

## Version 1.1.0
* First version released to Google Play and Apple App Store
