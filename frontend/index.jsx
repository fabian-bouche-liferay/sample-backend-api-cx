import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

class SampleWebComponent extends HTMLElement {
    connectedCallback() {
        if (!this.querySelector('.react-root')) {
            const reactRoot = document.createElement('div');
            reactRoot.className = 'react-root';
            this.appendChild(reactRoot);
        }

        ReactDOM.render(<App 
            />, this.querySelector('.react-root'));
    }

    disconnectedCallback() {
        ReactDOM.unmountComponentAtNode(this.querySelector('.react-root'));
    }
}

const LIFERAY_SLIDER_INPUT_ELEMENT_ID = 'sample-web-component';

if (!customElements.get(LIFERAY_SLIDER_INPUT_ELEMENT_ID)) {
    customElements.define(LIFERAY_SLIDER_INPUT_ELEMENT_ID, SampleWebComponent);
}