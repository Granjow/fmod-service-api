# FMOD Service API

This node module interfaces with an FMOD Service to start/stop events and set parameters. Currently,
a [ZeroMQ based service][service] is supported.

A code generator additionally generates an API specifically for a project, which supports code like this:

```ts
await player.musicLevel01.start();
await player.musicLevel01.stinger.setValue( 1 );
await player.uiCancel.play();
```

To get started, check the [demo][demos] directory in the code. Also, the code is documented,
so your IDE should provide some support.

[service]: https://github.com/Granjow/fmod-service
[demos]: https://github.com/Granjow/fmod-service-api/tree/master/src/demo

## Changelog

* **2.13.0** (2023-05-05)
  * Changed: `FmodPlayer.resetAllParameters()` also resets global parameters
* **2.12.0** (2023-01-24)
  * Added: Logging can be set to non-verbose with `FmodZeromqApi.verboseLogging`
  * Changed: In case a connect/reconnect fails, an error is logged to prevent uncaught exceptions.
* **2.11.0** (2022-12-30)
  * Added: Stop all events which have been started with `start()` before. (This requires FMOD Service 1.2.0 or newer.)
* **2.10.1** (2022-12-10)
  * Added: When using the code generator, the raw data is now exposed in the generated player.
* **2.9.1** (2022-09-27)
  * Changed: Minor code style issue (if global parameters are empty, a comment is inserted to prevent space-only line)
* **2.9.0** (2022-07-25)
  * Added: Support for global FMOD parameters. (This requires FMOD Service 1.1.0 or newer.)
* **2.8.0** (2022-07-13)
  * Added: Basic support for playing mixer snapshots.
    This feature will be improved in future, at the moment snapshots are defined as normal events
    and have to be assigned to a bank.
* **2.7.0** (2022-07-12)
  * Added: `FmodPlayer.allEvents` returns all configured events
* **2.6.0** (2022-05-30)
  * Added: `FmodPlayer.resetAllParameters()` resets all parameters to default values
    (`0` by default, can be customised)
* **2.5.0** (2022-04-27)
  * Changed: The `connect`, `reconnect`, and `disconnect` events are now sent in a next
    Node.js [Event Loop](https://nodejs.dev/learn/the-nodejs-event-loop)
    which ensures that e.g. the connection ID is already updated when the event is received.
  * Changed: Improved logging and remaining `console.log` statements migrated to `ILogger`
* **2.4.0** (2022-04-07)
  * Added: `FmodPlayer.close()` to disconnect the ZeroMQ socket
* **2.3.0** (2022-03-30) – requires FMOD service v1.0.0
  * Added: A `reconnect` event is now fired when the player reconnects. `init` is only fired for the first connection.
  * Changed: When initialising or reconnecting, the API first retrieves the loaded banks and only (re-)loads
    those necessary (e.g. missing banks and localised banks).
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
