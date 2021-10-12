# XML Documentation Comments Support for Visual Studio Code

[![Build Status](https://travis-ci.org/kasecato/vscode-docomment.svg?branch=master)](https://travis-ci.org/kasecato/vscode-docomment) [![Coverage Status](https://coveralls.io/repos/kasecato/vscode-docomment/badge.svg?branch=master&service=github)](https://coveralls.io/github/kasecato/vscode-docomment?branch=master) [![License: MIT](https://img.shields.io/badge/license-MIT-orange.svg)](https://github.com/kasecato/vscode-docomment/blob/master/LICENSE) [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/k--kato.docomment.svg)](https://marketplace.visualstudio.com/items?itemName=k--kato.docomment) [![Install](https://vsmarketplacebadge.apphb.com/installs-short/k--kato.docomment.svg)](https://marketplace.visualstudio.com/items?itemName=k--kato.docomment)

Generate XML documentation comments for Visual Studio Code.

## Deprecated Announcement

`C# for Visual Studio Code (powered by OmniSharp)` now officially supports the documentation comment from [v1.23.8](https://github.com/OmniSharp/omnisharp-vscode/releases/tag/v1.23.8) (December 18th, 2020). You can use the official one by turning on `Editor: Format On Type`.

This extension will be deprecated in the future. Thanks to the users who have supported me so far.

## Usage

Type "///", it auto-generates an XML documentation comment like this:

![docomment](https://github.com/kasecato/vscode-docomment/raw/master/images/docomment.gif)


## Configuration

The menu under File > Preferences (Code > Preferences on Mac) provides entries to configure user and workspace settings. You are provided with a list of Default Settings. Copy any setting that you want to change to the related `settings.json` file.

### settings.json

```js
{
	// single: Comments are single-line comments that start with three slashes (///) (Default)
	// delimited: Delimited comments that start with a slash and two stars (/**)
	"docomment.syntax": "single",
	// Press the Enter key to activate a command (Default: false)
	"docomment.activateOnEnter": false,
	// User-controllable options
	"docomment.advanced": {
		"cs": {
			"namespace" : {
				"attributes" : ["summary"]
			},
			"class" : {
				"attributes" : ["summary", "typeparam"]
			},
			"interface" : {
				"attributes" : ["summary", "typeparam"]
			},
			"struct" : {
				"attributes" : ["summary"]
			},
			"enum" : {
				"attributes" : ["summary"]
			},
			"delegate" : {
				"attributes" : ["summary", "param", "typeparam", "returns"]
			},
			"field" : {
				"attributes" : ["summary"]
			},
			"property" : {
				"attributes" : ["summary", "value"]
			},
			"method" : {
				"attributes" : ["summary", "param", "typeparam", "returns"]
			},
			"event" : {
				"attributes" : ["summary"]
			}
		}
	},
	// Insert spaces when pressing Tab.
	"editor.insertSpaces": true,
	// The number of spaces a tab is equal to.
	"editor.tabSize": 4
}
```

To enable publishing XML documentation:

### project.csproj

```xml
  <PropertyGroup>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <DocumentationFile>bin\YourApi.XML</DocumentationFile>
  </PropertyGroup>
```

## Installation

1. Install Visual Studio Code 1.40.0 or higher
1. Launch Code
1. From the extension view `Ctrl`-`Shift`-`X` (Windows, Linux) or `Cmd`-`Shift`-`X` (macOS)
1. Search and Choose the extension `C# XML Documentation Comments`
1. Reload Visual Studio Code


## Supported Languages

- C#
- Blazor


## Contributing to the Code

Clone a copy of the repo:

```
git clone https://github.com/kasecato/vscode-docomment.git
```

### Building the code

First, install the package dependencies:

```
npm install
```

Now you can compile the code:

```
npm run compile
```

After the initial compile, the source files will be watched and recompiled
when changes are saved.

## Contributors

* [@kasecato](https://github.com/kasecato)
* [@ivanz](https://github.com/ivanz)
* [@PJB3005](https://github.com/PJB3005)
* [@Acid147](https://github.com/Acid147)


## License

This extension is [licensed under the MIT License](https://github.com/kasecato/vscode-docomment/blob/master/LICENSE.txt).
