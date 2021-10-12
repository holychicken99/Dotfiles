# Thunder Client

Thunder Client is a lightweight Rest API Client Extension for Visual Studio Code, hand-crafted by [Ranga Vadhineni](https://twitter.com/ranga_vadhineni) with simple and clean design.

- Voted as **#10 Product of the day** on [Product Hunt](https://www.producthunt.com/posts/thunder-client)
- Website - [www.thunderclient.io](https://www.thunderclient.io)
- Follow Twitter for updates - [twitter.com/thunder_client](https://twitter.com/thunder_client)
- Support: [github.com/rangav/thunder-client-support](https://github.com/rangav/thunder-client-support)

### Story behind Thunder Client

- Read Launch Blog Post on [Medium](https://rangav.medium.com/thunder-client-alternative-to-postman-68ee0c9486d6)

## Usage

- Install the Extension, Click Thunder Client icon on the Action Bar.
- From Command Palette (Cm+Sh+P) type `thunder` and select `Thunder Client: New Request`

![](https://github.com/rangav/thunder-client-support/blob/master/images/thunder-client.gif?raw=true)

### Videos

- Why use Thunder Client over other API Client by [James Quick](https://www.youtube.com/watch?v=AbCTlemwZ1k)
- Basic Thunder Client Introduction video on [Youtube](https://www.youtube.com/watch?v=NKZ0ahNbmak)

## Documentation

- For updated documentation please visit our [github](https://github.com/rangav/thunder-client-support) page

## Tech

- Thunder Client is built with **Javascript, Flexbox, Typescript, Ace Editor, Got, Nedb**. No javascript or bootstrap frameworks used.

## Features

- **Lightweight** http client with simple and clean UI.
- **Activity, Collections and Environment** Tabs in the Action Bar View for quick access.
- **Graphql:** Send Graphql Query & Variables has syntax highlighting support.
- The Response data supports **syntax hightlighting using ACE Editor** which can handle large responses easily, you can also view response in **Full Screen**
- **Environment Variables:** Syntax highlighting support for environment variables just use `{{variable}}` syntax in most fields
- **Scriptless Testing:** Test APIs with GUI based functionality, no scripting knowledge needed.
- **Themes:** The extension also supports VS Code themes.

## Team Features

- Team features allow you to store request data in git folder, for details visit [github](https://github.com/rangav/thunder-client-support#team) page.

## Import/Export

- You can import from Postman and Curl, for more details visit [github](https://github.com/rangav/thunder-client-support#import) page.

## Run Collection

- You can test multiple requests using Collection, select `Run All` option from the collection menu.
- The collection runner will execute all requests and test cases and display the result.

## Proxy

- Proxy is supported using vscode proxy setting. for details visit [github](https://github.com/rangav/thunder-client-support#proxy) page.

## Scriptless Testing

![](https://github.com/rangav/thunder-client-support/blob/master/images/thunder-client-tests.png?raw=true)

- We need to write lot of boilerplate code in Postman and other api clients to do basic testing using scripting like status code equal 200. So I implemented GUI based tests, where you select couple of dropdowns to do most standard tests very easily without any scripting knowledge.
- **Set Environment Variable** from response, Headers, Cookie in Tests tab is now supported, see our [github](https://github.com/rangav/thunder-client-support#testing) page for details.

## Privacy

- Basic anonymised telemetry data of extension usage is collected using [vscode-extension-telemetry](https://github.com/Microsoft/vscode-extension-telemetry), No Personal or request data is collected. You can opt out using VS Code Settings [details here](https://code.visualstudio.com/docs/getstarted/telemetry)
- There is no backend or cloud sync currently, all the data is stored locally on your computer.
