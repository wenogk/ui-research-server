# UI Research Server

This research project aims to develop a tool that allows the identification of the interactive elements of the webpage by event listeners.

The tool outputs the x-path and visual position of the interactive elements.

## API Call

The API call is a GET request to the /run directory with 5 params

| parameter    | information                                                                                       |
|--------------|---------------------------------------------------------------------------------------------------|
| api_key      | For authentication, please get this key from the person running the server                        |
| url          | The exact url to find the interactive element from                                                |
| filtered     | boolean value of "true" or "false" whether you want the results to be filtered or get all results |
| screenHeight | An integer value of the height of the chromium screen puppeteer will use                          |
| screenWidth  | An integer value of the width of the chromium screen puppeteer will use                           |

An example URL call is _https://ui-research-romeno.glitch.me/run?api_key=nyuaddauyn&url=https://google.com&filtered=false&screenHeight=700&screenWidth=1000_

The call would return a json object with an key called "listeners" that contains the array of listeners. A sample response is below with only one interactive element in the array:
```json
{
   "listeners":[
      {
         "type":"mousedown",
         "useCapture":false,
         "passive":false,
         "once":false,
         "scriptId":"23",
         "lineNumber":116,
         "columnNumber":923,
         "handler":{
            "type":"function",
            "className":"Function",
            "description":"function onmousedown(event) {\nreturn rwt(this,'','','','','AOvVaw13L0SpN0L7ycx9R0_i4R2S','','0ahUKEwiyh6fe44vtAhWBGVkFHcrsBLYQkNQCCAM','','',event)\n}",
            "objectId":"{\"injectedScriptId\":3,\"id\":2}"
         },
         "originalHandler":{
            "type":"function",
            "className":"Function",
            "description":"function onmousedown(event) {\nreturn rwt(this,'','','','','AOvVaw13L0SpN0L7ycx9R0_i4R2S','','0ahUKEwiyh6fe44vtAhWBGVkFHcrsBLYQkNQCCAM','','',event)\n}",
            "objectId":"{\"injectedScriptId\":3,\"id\":3}"
         },
         "backendNodeId":4,
         "indentifierInfo":{
            "nodeId":0,
            "backendNodeId":4,
            "nodeType":1,
            "nodeName":"A",
            "localName":"a",
            "nodeValue":"",
            "childNodeCount":1,
            "attributes":{
               "href":"https://about.google/?fg=1&utm_source=google-US&utm_medium=referral&utm_campaign=hp-header",
               "onmousedown":"return rwt(this,'','','','','AOvVaw13L0SpN0L7ycx9R0_i4R2S','','0ahUKEwiyh6fe44vtAhWBGVkFHcrsBLYQkNQCCAM','','',event)"
            }
         },
         "xpathInfo":"id(\"hptl\")/a[1]",
         "locationInfo":{
            "x":10,
            "y":23,
            "width":48.984375,
            "height":15,
            "top":23,
            "right":58.984375,
            "bottom":38,
            "left":10
         }
      }
   }
```

## Requirements to run the server

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
