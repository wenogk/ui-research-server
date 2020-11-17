# UI Research Server

This research project aims to develop a tool that allows the identification of the interactive elements of the webpage by event listeners.

The tool outputs the x-path and visual position of the interactive elements.


## Requirements

The server is run on a node.js environment and requires the puppeteer package to be installed.

## How it works?
On the back-end, the tool uses puppeteer to open a ["Chrome Developer Tools Protocol"](https://chromedevtools.github.io/devtools-protocol/) session.

It then carries out the following:

- Inspects the event listeners using the [DomDebugger API](https://chromedevtools.github.io/devtools-protocol/tot/DOMDebugger/) and gets all the event listeners on the web page
- Iterates through all event listeners and for every event listener it:
  - Modifies the "style" attribute to a colored border based on the type of event listener. This uses the [Dom API](https://chromedevtools.github.io/devtools-protocol/tot/DOM/)
  - Converts the backend node that the Chrome Dev Tools protocol provides to an "objectID" which can be used to identify the element using the [resolveNode](https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-resolveNode) function in the Dom API
  - Executes a snippet of Javascript binded to the context of the objectID recieved that gets the exact visual position of the element using the browsers native function: [getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
  - Executes a snippet of Javascript binded to the context of the objectID recieved that calculates the xpath of the element.
    - This xpath is calculated using a function taken from [stackoverflow](https://stackoverflow.com/a/5178132)
  - visual coordinates, dimensions and xpath is added to the attributes of the element object
- The array of element objects is output that has the event listener type, visual coordinates, dimensions and xpath and more info of each interactive element

( ᵔ ᴥ ᵔ )