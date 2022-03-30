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

* **2.2.0** (2022-03-30)
  * Fixed: Banks are correctly initialised when the FMOD Service has already loaded localised banks.
  * Added: An event can specify additional banks (like dialogue banks with audio tables) which it requires.
    They will also be auto-loaded when playing the event.
* **2.1.0** (2022-03-29)
  * Added: Get events by name with `getEvent(eventName)`
* **2.0.0** (2022-03-27) – Breaking change; FmodCodegen constructor parameters have changed.
  * Added: Code generator supports localisation and automatically loads/unloads banks depending on the language.
* **1.2.0** (2022-03-26)
  * API: Support `unloadBank` and `playVoice` to play localised voice files
* **1.1.0** (2022-03-23)
  * FMOD player now treats reconnect signal correctly and marks all banks as unloaded.
    When the FMOD service is restarted, events will therefore be loaded from the bank again.
  * Custom logger (like e.g. `pino`) can be passed to the API.
* **1.0.1** (2022-02-17)
  * Fix socket status check which incorrectly caused disconnected state
* **1.0.0** (2022-02-10)
  * Fix package.json to point to the correct `index.js` file
  * Fix name clashes when parameters from different events have the same name
  * Fix sending values of labeled parameters
  * Track connection status. `connect()` now returns immediately and a `connect` event is emitted on connection.
  * Handle some umlauts (`ä` becomes `ae`) instead of removing them in class/variable names
  * Add additional properties/parameters with the same name as in the FMOD project.
    This can be used for automated access to the generated API based on the input data that was used
    for generating the API.
  * Use a user-provided logger (like `pino`) to log messages instead of `console.log`
* **0.1.0** (2021-11-25) Initial release
