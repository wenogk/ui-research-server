# UI Research Server

This research project aims to develop a tool that allows the identification of the interactive elements of the webpage by event listeners.

The tool outputs the x-path and visual position of the interactive elements.


## Requirements

The server is run on a node.js environment and requires the puppeteer package to be installed.

## How it works?
On the back-end, the tool uses puppeteer to open a ["Chrome Developer Tools Protocol" session](https://chromedevtools.github.io/devtools-protocol/)

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)

Click `Show` in the header to see your app live. Updates to your code will instantly deploy.


## Made by [Glitch](https://glitch.com/)

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

( ᵔ ᴥ ᵔ )