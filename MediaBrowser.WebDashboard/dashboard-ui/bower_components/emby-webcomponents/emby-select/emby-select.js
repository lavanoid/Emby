﻿define(['layoutManager', 'browser', 'actionsheet', 'css!./emby-select'], function (layoutManager, browser, actionsheet) {

    var EmbySelectPrototype = Object.create(HTMLSelectElement.prototype);

    function enableNativeMenu() {

        if (browser.xboxOne) {
            return false;
        }

        // Take advantage of the native input methods
        if (browser.tv) {
            return true;
        }

        if (layoutManager.tv) {
            return false;
        }

        return true;
    }

    function triggerChange(select) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        select.dispatchEvent(evt);
    }

    function setValue(select, value) {

        select.value = value;
    }

    function showActionSheeet(select) {

        var labelElem = getLabel(select);
        var title = labelElem ? (labelElem.textContent || labelElem.innerText) : null;

        actionsheet.show({
            items: select.options,
            positionTo: select,
            title: title

        }).then(function (value) {
            setValue(select, value);
            triggerChange(select);
        });
    }

    function getLabel(select) {
        var elem = select.previousSibling;
        while (elem && elem.tagName != 'LABEL') {
            elem = elem.previousSibling;
        }
        return elem;
    }

    function onFocus(e) {
        var label = getLabel(this);
        if (label) {
            label.classList.add('selectLabelFocused');
            label.classList.remove('selectLabelUnfocused');
        }
    }

    function onBlur(e) {
        var label = getLabel(this);
        if (label) {
            label.classList.add('selectLabelUnfocused');
            label.classList.remove('selectLabelFocused');
        }
    }

    function onMouseDown(e) {

        // e.button=0 for primary (left) mouse button click
        if (!e.button && !enableNativeMenu()) {
            e.preventDefault();
            showActionSheeet(this);
        }
    }

    function onKeyDown(e) {

        switch (e.keyCode) {

            case 13:
                if (!enableNativeMenu()) {
                    e.preventDefault();
                    showActionSheeet(this);
                }
                return;
            case 37:
            case 38:
            case 39:
            case 40:
                if (layoutManager.tv) {
                    e.preventDefault();
                }
                return;
            default:
                break;
        }
    }

    EmbySelectPrototype.createdCallback = function () {

        var parent = this.parentNode;
        if (!parent.classList.contains('selectContainer')) {
            var div = this.ownerDocument.createElement('div');
            div.classList.add('selectContainer');
            parent.replaceChild(div, this);
            div.appendChild(this);
        }
        if (!this.id) {
            this.id = 'select' + new Date().getTime();
        }
        this.addEventListener('mousedown', onMouseDown);
        this.addEventListener('keydown', onKeyDown);
        this.addEventListener('focus', onFocus);
        this.addEventListener('blur', onBlur);
    };

    EmbySelectPrototype.attachedCallback = function () {

        var label = this.ownerDocument.createElement('label');
        label.innerHTML = this.getAttribute('label') || '';
        label.classList.add('selectLabel');
        label.classList.add('selectLabelUnfocused');
        label.htmlFor = this.id;
        this.parentNode.insertBefore(label, this);

        var div = document.createElement('div');
        div.classList.add('emby-select-selectionbar');
        div.innerHTML = '<div class="emby-select-selectionbarInner"></div>';
        this.parentNode.insertBefore(div, this.nextSibling);
    };

    document.registerElement('emby-select', {
        prototype: EmbySelectPrototype,
        extends: 'select'
    });
});