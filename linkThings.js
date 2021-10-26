$(document).ready(setup());

/**
 * Set up the event listener
 * 
 * @returns bool
 */
function setup() {
    if (/action=edit/.test(window.location.href)) {
        mw.hook('ext.CodeMirror.switch').add(function() {
            if ($(".CodeMirror").length) {
                $('.CodeMirror').on( 'click', function( event ) {
                    if (event.ctrlKey) {
                        if (!parseLink(event.target.outerHTML)) {
                            console.error('linkThings v1.0: Clicked element was not a page or template');
                        }
                    }
                });
            } else {
                console.error('linkThings v1.0: Could not initialize');
            }
		});
    }
}

/**
 * Parse a ctrl clicked *anything*
 * 
 * @returns bool
 */
function parseLink(outerHTML) {
    let linkRegex = new RegExp('<span class=".*?cm-mw-pagename">(?<title>.*?)<\/span>', 'i');

    if (outerHTML.includes("cm-mw-template-name cm-mw-pagename")) {
        // Template, so check if its a non-templatespace template
        console.debug('Template link');
        if (outerHTML.includes(":")) {
            // Non-templatespace
            console.debug('Non-templatespace template link');
            let match = linkRegex.exec(outerHTML);
            let url = 'https://en.wikipedia.org/wiki/' + match.groups.title;
            console.debug(url);
            openInTab(url);
            return true;
        } else {
            // Not
            console.debug('Template space template link');
            let match = linkRegex.exec(outerHTML);
            let url = 'https://en.wikipedia.org/wiki/Template:' + match.groups.title;
            console.debug(url);
            openInTab(url);
            return true;
        }
    } else if (outerHTML.includes("cm-mw-link-pagename cm-mw-pagename")) {
        // Page
        console.debug('Page link');
        let match = linkRegex.exec(outerHTML);
        let url = 'https://en.wikipedia.org/wiki/' + match.groups.title;
        console.debug(url);
        openInTab(url);
        return true;
    } else {
        // Neither
        return false;
    }
}

function openInTab(url) {
    var newTab = window.open(url, '_blank');
    if (newTab) {
        newTab.focus();
    } else {
        console.error('linkThings v1.0: Browser did not open new tab');
        alert('Please allow popups for this website');
    }
}