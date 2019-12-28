/**
 * Browser DOM API Reference: https://devdocs.io/dom/ 
 * Note: This script will show the tooltip definition if there is only one 
 *      word in the JSON data file's word key value.
 * @author Sina Lyon
 * @description 
 *   Given a JSON dictionary, create a JavaScript API script that reads 
 *   all the matching terms in the rendered HTML page, highlights them, 
 *   and creates a hovering tooltip on them (populated with the corresponding 
 *   word’s definition).   
 * /

/*######################--Start of Main--######################*/
let main = (list) => {
    console.log(list); //Testing the newly extracted JSON list
    /* Execute an enhanced loop to go through the childNodes array of body */
    for (let search of document.body.childNodes) {
        listIteration(list, search, false);
    }
    /* Reference to event deligation approach: 
        https://elliotekj.com/2016/11/05/jquery-to-pure-js-event-listeners-on-dynamically-created-elements/ */
    document.body.addEventListener("mouseover", (e) => listIteration(list, e.target, true), true);
    document.body.addEventListener("mouseout", (e) => tooltip(null, e.target, false));
}
/*######################--End of Main--######################*/

/**
 * @function listIteration exists to reuse the enhanced for loop that iterates over the JSON array 
 *           that was retrieved from the AJAX call.
 * @param list contains keyword and definition from JSON file.
 * @param node is the DOM element being searched within document.body.childNodes
 * @param isEvent is true if called from an event handler and false if not.
 */
function listIteration(list, node, isEvent) {
    let wordCap = null;
    for (let item of list) {
        wordCap = item.word.substring(0, 1).toUpperCase() + item.word.substring(1); //Substituting for capital letter at first char.
        if (node.hasChildNodes() && !isEvent) { // Node.hasChildNodes() : boolean
            makeTargetable(node, item.word, wordCap);
        }
        if (isEvent) { // Exception occurs if condition is included with node.classList, it must be the parent if statement.
            if (node.classList.contains(item.word) || node.classList.contains(wordCap))
                tooltip(item.definition, node, true)
        }
    }
}

/**
 * @function makeTargetable is supposed to add span tags between keywords identified
 *              from the JSON data.
 * @param node is a DOM node of any childNode of body that has more children.
 * @param word contains the JSON array's keyword from the listIteration function.
 * @param wordCap is the same keyword as word param, only with the first character as uppercase.
 */
function makeTargetable(node, word, wordCap) {
    const REGEXLOWER = new RegExp(word, 'g'), //prepping regex values within constants
        REGEXCAP = new RegExp(wordCap, 'g');
    if (node.innerText.match(REGEXCAP) || node.innerText.match(REGEXLOWER) !== null) { //Checking if there's any keywords inside node
        let insertSpan = node.innerHTML;
        insertSpan = insertSpan.replace(REGEXLOWER, `<span style='background: orange; border-radius: 3px' class=${word}>${word}</span>`);
        node.innerHTML = insertSpan; // Inserting span tags for lowercase keywords
        insertSpan = node.innerHTML; // Setting up second html string search
        insertSpan = insertSpan.replace(REGEXCAP, `<span style='background: orange; border-radius: 3px' class=${wordCap}>${wordCap}</span>`);
        node.innerHTML = insertSpan; // Inserting span tags for uppercase keywords
    }
}


/**
 * @function tooltip is called during a mouseover or mouseout event listener and generates/removes
 *           the web tooltip as a response to that listener.
 * @param tip contains a list item's definition property from the JSON data as
 *          an argument. Value is null if called from the mouseout event.
 * @param target has the event target of a mouseover event which typically should
 *              only be a keyword.
 * @param isHovering is true if called from the mouseover event and false if called
 *          from mouseout's event handling.
 */
function tooltip(tip, target, isHovering) {
    if (isHovering) {
        console.log(target);
        const TIPSPAN = document.createElement("span"),
            TIPSTYLE = document.createElement("style"), //adding id in case another style tag exists 
            STYLEID = document.createAttribute("id"),
            TIPID = document.createAttribute("id"); //Creating div and id attribute for removing later
        TIPID.value = "tooltip";
        STYLEID.value = "tipstyle";
        TIPSPAN.setAttributeNode(TIPID);
        TIPSTYLE.setAttributeNode(STYLEID);
        TIPSPAN.textContent = tip; // adding in definition to created span element

        /*All Tooltip Styles Within textContent below*/
        TIPSTYLE.textContent = `
            @keyframes slideInFromLeft {
                0% {
                transform: translateX(20%);
                }
            }
            #tooltip { 
                animation: 0.5s slideInFromLeft;
                margin: 10px;
                position:absolute;
                background-color:#eeeefe;
                white-space: normal;  /* For word-wrapping inside tooltip. */
                font-size: 13px;
                font-weight: normal;
                width: 80%;
                z-index: 2000;
                color: black;
                border-radius: 10px;
                border: 1px solid #aaaaca;
                padding:10px;
                box-shadow: 15px 50px 50px rgba(0, 0, 0, 0.5);
                -moz-box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
                -webkit-box-shadow: 5px 5px 3px rgba(0, 0, 0, 0.1);
            }
        `;
        target.insertAdjacentElement('afterend', TIPSPAN); // finally, inserting the tooltip node for displaying definition
        document.querySelector('head').insertAdjacentElement('beforeend', TIPSTYLE);
    } else if (document.getElementById("tooltip") !== null) { // if the tooltip element exists then...
        document.getElementById("tooltip").remove();
        document.getElementById("tipstyle").remove(); // style tag for tooltip removed with span tag
    }

}

/** AJAX request below
 * Anonymous function contains the HTTPRequest sequence to grab data from 
 * a local JSON file.
 * Vanilla JS AJAX MDN Reference:
 * https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX
 */
(function () {
    let httpRequest = new XMLHttpRequest;

    if (!httpRequest) { //if false..
        console.error("Cannot create XMLHTTP instance.");
    }

    //Make the request & use onreadystatechange to point to anonymous function
    httpRequest.onreadystatechange = function () { // processing server response below...
        // try { // If request is ready and resource was located...
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            main(JSON.parse(httpRequest.responseText)); //Sending data list to the main fat arrow function.
        }
        // } catch (e) {
        //     console.error('Exception when grabbing JSON data.\nException Details:\n' + e.description);
        // }
    }
    httpRequest.open('GET', './definitions.json', true); // open(serverMethod, URL, isAsync)
    httpRequest.send(); //Sends json data to be read in onreadystatechange's anonymous function
})();