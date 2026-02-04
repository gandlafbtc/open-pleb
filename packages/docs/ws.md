# Websocket API

Events emitted by the server, are sent to subscribed and authorized parties only. They have the following format:


```JSON
{
    "type": "<some:command>",
    "data": {
        ...
    }
}
```

Events emitted by the client, have a similar format, but they have an additional body for the authorization. Some commands may not require auth, in which cases the auth body can be left empty. Some commands are only permitted by admins. those commands require an additional jwt auth. Usually, BAT are required for client send commands:

```JSON
{
    "type": "<some:command>",
    "data": {
        ...
    },
    "auth": {
        "bat" : "<optional> (blind auth token)",
        "jwt" : "<optional> (clear auth token, for admin actions)"
    }
}
```

## Command handler

