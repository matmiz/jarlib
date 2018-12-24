import {reconcile} from './reconciler';

export default class Component {
    constructor(props) {
        this.componentWillReceiveProps && this.componentWillReceiveProps(props);
        this.props = props;
        this.state = this.state || {};
        this.prevState = this.prevState || {};
    }

    setState(partialState) {
        this.prevState = Object.assign({}, this.state);
        this.state = Object.assign({}, this.state, partialState);
        (!this.shouldComponentUpdate || this.shouldComponentUpdate()) && updateInstance.call(this,this.__internalInstance);
    }
}

function updateInstance(internalInstance) {
    this.componentWillUpdate && this.componentWillUpdate(this.props, this.state);
    const parentDom = internalInstance.dom.parentNode;
    const element = internalInstance.element;
    reconcile(parentDom, internalInstance, element);
    this.componentDidUpdate && this.componentDidUpdate(element.props, this.prevState);
}

