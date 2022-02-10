# FMOD Service API

This node module interfaces with an FMOD Service to start/stop events and set parameters. Currently,
a [ZeroMQ based service][service] is supported.

A code generator additionally generates an API specifically for a project, which supports code like this:

```ts
await player.musicLevel01.start();
await player.musicLevel01.stinger.setValue( 1 );
await player.uiCancel.play();
```

[service]: https://github.com/Granjow/fmod-service

## Changelog

* **0.2.0**
  * Fix package.json to point to the correct `index.js` file
  * Fix name clashes when parameters from different events have the same name
  * Fix sending values of labeled parameters
  * Handle some umlauts (`ä` becomes `ae`) instead of removing them in class/variable names
  * In case the backend restarted for some reason, the API restores the events that were playing.
    (Rudimentary support only.)
* **0.1.0:** Initial release
