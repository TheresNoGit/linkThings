/**
* linkThings - a script to let you control + click on
* [[wiki links]] and {{template links}} in the CodeMirror
* and visual source editor
*
* @version 1.2.1
* @license https://opensource.org/licenses/MIT MIT
* @author Sam (User:TheresNoTime)
* @link https://github.com/TheresNoGit/linkThings
*/
/* global $, mw, ve */
/*jshint esversion: 6 */

// Configure
let version = "1.2.1";

// Init
mw.loader.using(["mediawiki.Title"], setup);

/**
 * Gets the URL of the page, irrespective of the wiki this is on.
 * @param {string} page The page to get the URL of.
 */
function getUrl(page) {
    return new URL(
        mw.config.get("wgArticlePath").replace(/\$1/g, page),
        window.location.href
    ).toString();
}

/**
 * Set up the event listener
 * 
 * @returns bool
 */
function setup() {
    // Only care if we're editing
    if (/[?&]action=(edit|submit)/.test(window.location.search)) {
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
                            $(".cm-mw-pagename").each((i, e) => {
                                // Click "raycasting" in order to detect the click even if the VE
                                // elemnent is overhead.
                                if (isClickAboveElement(e, event)) {
                                    if (parseLink(e)) {
                                        return true;
                                    } else {
                                        // Assume the user ctrl + clicked on something they thought would work, and give error
                                        console.error(`linkThings v${version}: Clicked element was not detected as a page or template link`);
                                        return false;
                                    }
                                }
                            });
                        }
                    });
                    console.info(`linkThings v${version}: Initialized OK, using ${getUrl("")} in VE mode`);
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
                $('.cm-mw-pagename').on('click', function (event) {
                    if (event.ctrlKey) {
                        if (parseLink(event.target)) {
                            return true;
                        } else {
                            // Assume the user ctrl + clicked on something they thought would work, and give error
                            console.error(`linkThings v${version}: Clicked element was not detected as a page or template link`);
                            return false;
                        }
                    }
                });
                console.info(`linkThings v${version}: Initialized OK, using ${getUrl("")} in CodeMirror mode`);
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
 * @param {HTMLElement} element Clicked HTML element
 * @returns bool
 */
function parseLink(element) {
    // Check if this is a page/template link
    if (!element.classList.contains("cm-mw-pagename")) {
        // Neither a template link nor a page link
        return false;
    } else if (
        element.classList.contains("cm-mw-template-name")
        || element.classList.contains("cm-mw-link-pagename")
    ) {
        // Get the page link
        const page = new mw.Title(
            element.innerHTML,
            element.classList.contains("cm-mw-template-name") ?  //
                mw.config.get("wgNamespaceIds")["template"] : undefined
        );
        const url = getUrl(page.getPrefixedDb());
        console.debug(`linkThings v${version}: opening ${url}`);
        openInTab(url);
        return true;
    }
}

/**
 * Check if a click was above an element.
 * 
 * @param {HTMLElement} element The element to check for
 * @param {MouseEvent} event The event to check against
 * @returns {boolean} Whether or not the click was above the element or not
 */
function isClickAboveElement(element, event) {
    const $e = $(element), $w = $(window);
    const { clientY: cTop, clientX: cLeft } = event;
    const { top: eTop, left: eLeft } = $e.offset();
    const eHeight = $e.height(), eWidth = $e.width();
    const scrollTop = $w.scrollTop(), scrollLeft = $w.scrollLeft();

    return (
        // Within bounds, top
        eTop - scrollTop <= cTop && eTop - scrollTop + eHeight >= cTop &&
        // Within bounds, left
        eLeft - scrollLeft <= cLeft && eLeft - scrollLeft + eWidth >= cLeft
    );
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