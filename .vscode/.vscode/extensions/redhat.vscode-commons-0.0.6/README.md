[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/redhat.vscode-commons.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-commons)

# Red Hat Commons
Red Hat Commons provides services common to extensions published by Red Hat. It's an extension library that has no use being installed on its own.

## Telemetry reporting
With your approval, extensions published by Red Hat collect anonymous [usage data](https://github.com/redhat-developer/vscode-commons/blob/master/USAGE_DATA.md) and send it to Red Hat servers to help improve our products and services. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more about it.

The first time one of Red Hat extension engaging in telemetry collection runs, you will be asked to opt-in Red Hat's telemetry collection program:

![Opt-in request](https://github.com/redhat-developer/vscode-commons/raw/HEAD/images/optin-request.png)

Whether you accept or deny the request, this pop up will not show again.

You can also opt-in later, by setting the `redhat.telemetry.enabled` user setting to `true`.

From File > Preferences > Settings (On macOS: Code > Preferences > Settings), search for telemetry, and check the `Redhat > Telemetry : Enabled` setting. This will enable all telemetry events from Red Hat extensions going forward.


## How to disable telemetry reporting?
If you want to stop sending usage data to Red Hat, you can set the `redhat.telemetry.enabled` user setting to `false`.

From File > Preferences > Settings (On macOS: Code > Preferences > Settings), search for telemetry, and uncheck the `Redhat > Telemetry : Enabled` setting. This will silence all telemetry events from Red Hat extensions going forward.

## Development
Follow the [instructions](https://github.com/redhat-developer/vscode-commons/blob/master/INSTRUCTIONS.md) to learn how to leverage Red Hat Commons' features.

