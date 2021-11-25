# FMOD Service API

This node module interfaces with an FMOD Service to start/stop events and set
parameters. Currently, a [ZeroMQ based service][service] is supported.

A code generator additionally generates an API specifically for a project,
which supports code like this:

```ts
await player.musicLevel01.start();
await player.musicLevel01.stinger.setValue(1);
await player.uiCancel.play();
```

[service]: https://github.com/Granjow/fmod-service

## Changelog

* **0.1.0:** Initial release
