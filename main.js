const puppeteer = require('puppeteer');

async function runMain(settings) {
//https://wenogk.github.io/comlab-assignment-1/
//https://nyuad.nyu.edu/en/
  let COMPUTED_INTERACTIVE_NODES = []

function deInterleaveArray(arr) {

    //This function turns interleaved attribute array sent from chrome dev tools to an object of named attributes and values

    let index = 0
    let result = {}
    while(index<arr.length) {
        result[arr[index]] = arr[index+1]
        index+=2
    }
    return result;

}

  try {

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const [page] = await browser.pages();
    await page.setViewport({ width: settings.screenWidth, height: settings.screenHeight});
    await page.goto(settings.url, {
      waitUntil: 'networkidle2',
    });

    await page.evaluate( () => {

      window.scrollBy(0, window.innerHeight);

  });
    
    const cdp = await page.target().createCDPSession();

      await page.screenshot({path: `screenshot-1.png`});

    const nodeObject = (await cdp.send('Runtime.evaluate', {

      expression: "document.querySelector('body')",
      objectGroup: 'romeno',

    })).result;

    const completeListenerObject = (await cdp.send('DOMDebugger.getEventListeners', {

        objectId: nodeObject.objectId,
        depth: -1

      }))

      //find the locations
      for (let i = 0; i < completeListenerObject.listeners.length; i ++) {

        let node = completeListenerObject.listeners[i]
        const resolvedNode = (await cdp.send('DOM.resolveNode', {

            backendNodeId: node.backendNodeId,

          }))
        //  console.log(resolvedNode)
        
        //
          


          //get the description of the node element
          try {

            const nodeDescription = (await cdp.send('DOM.describeNode', {
              backendNodeId: node.backendNodeId,
            }))
          

//following function is to get xpath and is from https://stackoverflow.com/a/5178132
          let functionCode = `
          function() {
            elm = this;
            var allNodes = document.getElementsByTagName('*'); 
            for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
            { 
                if (elm.hasAttribute('id')) { 
                        var uniqueIdCount = 0; 
                        for (var n=0;n < allNodes.length;n++) { 
                            if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                            if (uniqueIdCount > 1) break; 
                        }; 
                        if ( uniqueIdCount == 1) { 
                            segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                            return segs.join('/'); 
                        } else { 
                            segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                        } 
                } else if (elm.hasAttribute('class')) { 
                    segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
                } else { 
                    for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                        if (sib.localName == elm.localName)  i++; }; 
                        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
                }; 
            }; 
            return segs.length ? '/' + segs.join('/') : null;
        }
          `
          //console.log("OBJECT ID " +(resolvedNode.object.objectId))
          completeListenerObject.listeners[i]["indentifierInfo"] = nodeDescription.node

          try {
            nodeDescription.node.attributes = deInterleaveArray(nodeDescription.node.attributes)
            let callXpathFunction = (await cdp.send('Runtime.callFunctionOn', {
              functionDeclaration : functionCode,
              objectId: resolvedNode.object.objectId,
            })) 
            completeListenerObject.listeners[i]['xpathInfo'] = callXpathFunction.result.value
          } catch(e) {
            console.log(e)
          }

          //start location info
          try {

            //node.getBoundingClientRect()
            //function to get bounding client rect
            let getBoundingClientRectFunction = `
            function() {
              let rect = this.getBoundingClientRect()
              result = {}
              for (var key in rect) {
                if(typeof rect[key] !== 'function') {
                  result[key] = rect[key]
                }
              }
              return JSON.stringify(result)
            }
            `
            /*
            const boxMod = (await cdp.send('DOM.getBoxModel', {

              backendNodeId: node.backendNodeId,

            }))
            //print(await cdp.send('DOM.highlightNode'))
            
            completeListenerObject.listeners[i]["locationInfo"] = boxMod.model
            */
           let callGetBoundingClientRectFunction = (await cdp.send('Runtime.callFunctionOn', {
            functionDeclaration : getBoundingClientRectFunction,
            objectId: resolvedNode.object.objectId,
          })) 

          completeListenerObject.listeners[i]["locationInfo"] = JSON.parse(callGetBoundingClientRectFunction.result.value)

          } catch(e) {
            console.log("bixmod error" + e)
            completeListenerObject.listeners[i]["locationInfo"] = null
            node = null

          }
          //end location info
         
          
        } catch (e) {
          //console.log(e)
            completeListenerObject.listeners[i]["indentifierInfo"] = null
            
        }

        //highlight the interactive elements
     try{

        await cdp.send('DOM.getDocument')
        
            const nodeIdarray = (await cdp.send('DOM.pushNodesByBackendIdsToFrontend', {
              backendNodeIds: [node.backendNodeId]
            }))

            //set border color based on event listener type
            
            let borderColor = settings.colors.defaultEventBorderColor
            let settingHrefCheck = true
            try {
            let hrefCheck = (nodeDescription.node.attributes["href"] != null)
            settingHrefCheck = ((settings.ignoreNormalLinks) || !hrefCheck);
            } catch {
              settingHrefCheck = true;
            }
            if(node.type == "click") { // 
              if(!settingHrefCheck) {
                borderColor = settings.colors.clickEventBorderColor
              } else {
                borderColor = "red"
              }
              

            } else if(node.type == "load") {
              borderColor = settings.colors.loadEventBorderColor
            }

            //set css style (should be changed to draw border over)
            await cdp.send('DOM.setAttributeValue', {
                nodeId: nodeIdarray.nodeIds[0],
                name: "style",
                value: "border: dashed " + borderColor + ";"
              })
           
           

     }  catch (err) {

        console.error(err);

      }

          //get the source of the script
          if(settings.getScriptSource && node != null) {

            try {

                await cdp.send('Debugger.enable')
                const scriptInfo = (await cdp.send('Debugger.getScriptSource', {
                    scriptId: node.scriptId,
                  }))
                  completeListenerObject.listeners[i]["scriptInfo"] = scriptInfo

              } catch {
    
              }
          }
          
      }

      //e.type == "click" && && e.locationInfo.width > 0 && e.locationInfo.height > 0

      const finalArr = completeListenerObject.listeners.filter(e => {
        if(e.locationInfo.width == 0 || e.locationInfo.height == 0) {
          return false;
        }

        let hrefCheck = (e.indentifierInfo.attributes["href"] != null)
        let settingHrefCheck = ((settings.ignoreNormalLinks) || !hrefCheck);

        return ( e.locationInfo != null && e.type == "click" && settingHrefCheck)

       });

      //count each type of event listener and put them in an object
      let counterObj = {}
      completeListenerObject.listeners.forEach(e => {

        //console.log(JSON.stringify(e,null, 2))
        if(counterObj[e.type] == null) {

          counterObj[e.type] = 1

        } else {

          counterObj[e.type] += 1

        }

      });

      //console.log(JSON.stringify(counterObj,null, 2))
      //console.log(JSON.stringify(finalArr, null, 2));
    

    await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'romeno' });
    if(settings.filtered) {
      return {
        "listeners" : finalArr
      }
    } 
    return completeListenerObject
    //await browser.close();
  } catch (err) {
    return err
  }
}

const settings = {

    url: "https://www.unicef.org/",
    getScriptSource : false,
    colors: {
      defaultEventBorderColor : "green",
      loadEventBorderColor: "red",
      clickEventBorderColor: "blue",
    },
    ignoreNormalLinks : true
}


module.exports = {
  runMain
};