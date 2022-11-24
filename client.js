// ==UserScript==
// @name        Where was I?
// @namespace   Violentmonkey Scripts
//
// #####################################
// ####### ADD THE SITE YOU WANT #######
// @match       https://example.com/* ## <-- add the site you want, you can add multiple sites by adding multiple @match lines
// #####################################
//
// @grant       none
// @version     1.0
// @author      Philip2809 - phma.dev
// @description Where was I? - Watching a movie or series, maybe on multiple devices, on a site that does not store your progress? Fear not! Where Was I? is a simple client side script that stores where you were on a server 
// ==/UserScript==


const SERVER_URL = "";
const USER = "";


function waitForElm(selector) {
    return new Promise((resolve, reject) => {
        if (document.getElementsByTagName(selector).length) {
            return resolve(document.getElementsByTagName(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.getElementsByTagName(selector).length) {
                resolve(document.getElementsByTagName(selector));
                observer.disconnect();
            }
        });

        setTimeout(() => {
            reject();
            observer.disconnect();
        }, 2500)

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function api(method, data) {
    return new Promise(resolve => {
        fetch(`${SERVER_URL}/${USER}`, {
            method, headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body: data
        }).then(res => res.json()).then(res => {
            resolve(res);
        })
    })
}

const url = api('POST', JSON.stringify({ host: location.host })); // get last page

const goToLastPage = async () => {
    url.then(url => {
        if (url && url.page) window.location.href = url.page || location.href;
    });
};

const logTime = (time) => {
    api('PUT', JSON.stringify({ time, url: location.href })); // save time in db
}

async function main() {


    if (!(location.pathname === '/')) {
        const video = api('POST', JSON.stringify({ url: location.href })); // get last time
        waitForElm('video').then((elms) => {
            api('PUT', JSON.stringify({ url: location.href })); // save page in db
            video.then(video => {
                Array.from(elms).forEach(e => {
                    e.currentTime = +video.time || 0;
                    e.onplay = () => logTime(e.currentTime);
                    e.onpause = () => logTime(e.currentTime);
                    e.onseeked = () => logTime(e.currentTime);
                });
            });
        });
    } else goToLastPage();

}



main();









