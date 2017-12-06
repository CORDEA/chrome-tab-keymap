/**
 *
 * Copyright 2017 Yoshihiro Tanaka
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Yoshihiro Tanaka <contact@cordea.jp>
 * date  : 2017-12-06
 */

const background = {};

background.initialize = function() {
    background.waitCommands_();
    background.waitKeyPress_();
};

background.waitCommands_ = function() {
    chrome.commands.onCommand.addListener(function(command) {
        switch (command) {
            case 'move-left':
                // Ctrl+H
                background.moveNext_(true);
                break;
            case 'move-right':
                // Ctrl+L
                background.moveNext_(false);
                break;
            case 'close':
                // Ctrl+D
                background.closeTab_();
                break;
        }
    });
}

background.waitKeyPress_ = function() {
    chrome.runtime.onMessage.addListener(function(request, sender, optCallback) {
        switch (request.method) {
            case 'content.keys':
                const command = request.query
                // Ctrl+J
                if (command === 10) {
                    background.moveFirst_();
                }
                // Ctrl+K
                if (command === 11) {
                    background.moveLast_();
                }
                // Ctrl+T
                if (command === 20) {
                    background.newTab_(false);
                }
                break;
        }
    });
}

background.moveNext_ = function(isLeft) {
    chrome.windows.getCurrent({
        populate: true
    }, function(window) {
        let tabs = window.tabs;
        let isNext = false;
        if (isLeft) {
            tabs.reverse();
        }
        for (var i = 0; i < tabs.length; i++) {
            if (isNext) {
                chrome.tabs.update(tabs[i].id, {
                    active: true
                });
                break;
            }
            if (tabs[i].active) {
                isNext = true;
            }
        }
    });
}

background.moveFirst_ = function() {
    chrome.windows.getCurrent({
        populate: true
    }, function(window) {
        const tabs = window.tabs;
        chrome.tabs.update(tabs[0].id, {
            active: true
        });
    });
}

background.moveLast_ = function() {
    chrome.windows.getCurrent({
        populate: true
    }, function(window) {
        const tabs = window.tabs;
        chrome.tabs.update(tabs[tabs.length - 1].id, {
            active: true
        });
    });
}

background.newTab_ = function() {
    chrome.tabs.create({});
}

background.closeTab_ = function() {
    chrome.tabs.query({
        active: true
    }, function(tabs) {
        if (tabs.length > 0) {
            chrome.tabs.remove([tabs[0].id]);
        }
    });
}

background.initialize();
