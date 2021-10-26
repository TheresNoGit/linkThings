/**
* linkThings - a script to let you control + click on
* [[wiki links]] and {{template links}} in the CodeMirror
* editor
*
* @version 1.2.0
* @license https://opensource.org/licenses/MIT MIT
* @author Sam (User:TheresNoTime)
* @link https://github.com/TheresNoGit/linkThings
*/
/* global $, mw, ve */
/*jshint esversion: 6 */

// Configure
let version = "1.2.0";
let siteUrl = "https://en.wikipedia.org/wiki/";

// Init
$(setup());

/**
 * Set up the event listener
 * 
 * @returns bool
 */
function setup() {
    // Only care if we're editing
    if (/action=edit/.test(window.location.href)) {
        // Wait for VE Source to load
        mw.hook('ve.activationComplete').add(function () {
            if ($(".ve-ui-surface").length) {
                // Get VE object
                var surface = ve.init.target.getSurface();
                // Only run in source mode
                if (surface.getMode() === 'source') {
                    // Set up event listener for a ctrl + click
                    $('.ve-ui-surface').on('click', function (event) {
                        if (event.ctrlKey) {
                            if (parseLinkVE(event.target.innerText)) {
                                return true;
                            } else {
                                // Assume the user ctrl + clicked on something they thought would work, and give error
                                console.error(`linkThings v${version}: Clicked element was not detected as a page or template link`);
                                return false;
                            }
                        }
                    });
                    console.info(`linkThings v${version}: Initialized OK, using ${siteUrl} in VE mode`);
                } else {
                    console.debug(`linkThings v${version}: VE is not in source mode`);
                }
            } else {
                console.error(`linkThings v${version}: Could not initialize script - ve-ui-surface element not found?`);
                return false;
            }
        });

        // Wait for CodeMirror to load
        mw.hook('ext.CodeMirror.switch').add(function () {
            if ($(".CodeMirror").length) {
                // Set up event listener for a ctrl + click
                $('.CodeMirror').on('click', function (event) {
                    if (event.ctrlKey) {
                        if (parseLink(event.target.outerHTML)) {
                            return true;
                        } else {
                            // Assume the user ctrl + clicked on something they thought would work, and give error
                            console.error(`linkThings v${version}: Clicked element was not detected as a page or template link`);
                            return false;
                        }
                    }
                });
                console.info(`linkThings v${version}: Initialized OK, using ${siteUrl} in CodeMirror mode`);
            } else {
                console.error(`linkThings v${version}: Could not initialize script - CodeMirror element not found?`);
                return false;
            }
        });
    }
}

/**
 * Parse a ctrl clicked *anything* (CodeMirror)
 * 
 * @param {string} outerHTML Clicked HTML element
 * @returns bool
 */
function parseLink(outerHTML) {
    const linkRegex = new RegExp('<span class=".*?cm-mw-pagename">(?<title>.*?)<\/span>', 'i'); // eslint-disable-line

    // Use .includes first, as its quicker than regex
    if (outerHTML.includes("cm-mw-template-name cm-mw-pagename")) {
        // This is a template link of some sort
        if (outerHTML.includes(":")) {
            // Template is not in the template namespace
            let match = linkRegex.exec(outerHTML);
            let url = `${siteUrl}${match.groups.title}`;
            console.debug(`linkThings v${version}: [!T] opening ${url}`);
            openInTab(url);
            return true;
        } else {
            // Template is in the template namespace
            let match = linkRegex.exec(outerHTML);
            let url = `${siteUrl}Template:${match.groups.title}`;
            console.debug(`linkThings v${version}: [T] opening ${url}`);
            openInTab(url);
            return true;
        }
    } else if (outerHTML.includes("cm-mw-link-pagename cm-mw-pagename")) {
        // This is a page link
        let match = linkRegex.exec(outerHTML);
        let url = `${siteUrl}${match.groups.title}`;
        console.debug(`linkThings v${version}: [P] opening ${url}`);
        openInTab(url);
        return true;
    } else {
        // Neither a template link nor a page link
        return false;
    }
}

/**
 * Parse a ctrl clicked *anything* (VE)
 * 
 * @param {string} innerText Clicked HTML element
 * @returns bool
 */
 function parseLinkVE(innerText) {
    const linkRegexVE = new RegExp(/\W{2}(?<title>.*?)\W{2}/, 'i'); // eslint-disable-line

    // Use .includes first, as its quicker than regex
    if (innerText.includes("{{")) {
        // This is a template link of some sort
        if (innerText.includes(":")) {
            // Template is not in the template namespace
            let match = linkRegexVE.exec(innerText);
            let url = `${siteUrl}${match.groups.title}`;
            console.debug(`linkThings v${version}: [!T] opening ${url}`);
            openInTab(url);
            return true;
        } else {
            // Template is in the template namespace
            let match = linkRegexVE.exec(innerText);
            console.log(match);
            let url = `${siteUrl}Template:${match.groups.title}`;
            console.debug(`linkThings v${version}: [T] opening ${url}`);
            openInTab(url);
            return true;
        }
    } else if (innerText.includes("[[")) {
        // This is a page link
        let match = linkRegexVE.exec(innerText);
        let url = `${siteUrl}${match.groups.title}`;
        console.debug(`linkThings v${version}: [P] opening ${url}`);
        openInTab(url);
        return true;
    } else {
        // Neither a template link nor a page link
        return false;
    }
}

/**
 * Opens a URL in a new tab
 * 
 * @param {string} url URL to open
 * @returns bool
 */
function openInTab(url) {
    var newTab = window.open(url, '_blank');
    if (newTab) {
        newTab.focus();
        return true;
    } else {
        console.error(`linkThings v${version}: Browser did not open new tab. Check settings?`);
        alert('Please ensure popups are enabled for this site');
        return false;
    }
}