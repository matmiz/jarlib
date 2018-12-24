let rootInstance = null;

/**
 * The main render function. It gets an element and a parent element, and then calls the 
 * reconsile function, to decide how to render the element
 * 
 * @param {*} element - the element to render
 * @param {*} parentDomEl  - the element on the DOM which be the parent of @element 
 * 
 * @returns undefined. The function is not returning a value, as the reconsile function does the rendering itself.
 */
export default function render(element, parentDomEl) {
    const prevInstance = rootInstance;
    const nextInstance = reconcile(parentDomEl, prevInstance, element);
    rootInstance = nextInstance;
}


/**
 * In order not to change the DOM on every change, we use this function to decide what needs to be done.
 * There are 5 possible scenarios:
 *  1. There is no instance. In this case, we create a new one and append it to parent element.
 *  2. The elemnent doesn't exist in the DOM anymore, so we remove it.
 *  3. The intance's type is different than the element type, we replace the element in the DOM
 *  4. The element's type is string i.e. it's not a Component. In this case we just update it's properties and not touching the DOM.
 *  5. The instance is a Component. we update it as a Component. 
 * 
 * @param {*} parentDomEl - the parent element to which we want to append the element.
 * @param {*} instance - a representation of the element, containing the element, it's child instances and the DOM representation of the element
 * @param {*} element - an object which represents a DOM element. Contains type and props, wehre type can be string or Component constructor
 * 
 * @returns and instance (see intanstiate function for details)
 *
 * If element is null or undefined, the function returns null
 */
export function reconcile(parentDomEl, instance, element, publicInstance) {
    if(!instance) {
        const newInstance = instantiate(element);
        const component = newInstance.publicInstance;
        component && component.componentWillMount && component.componentWillMount();
        parentDomEl.appendChild(newInstance.dom);
        component && component.componentWillMount && component.componentDidMount();
        return newInstance;
    }
    else if (!element) {
        publicInstance && publicInstance.componentWillUnmount && publicInstance.componentWillUnmount();
        parentDomEl.removeChild(instance.dom);
        return null;
    }
    else if(element.type !== instance.element.type) {
        const newInstance = instantiate(element);
        parentDomEl.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    }
    else if(typeof element.type === 'string') {         
        updateDomProperties(instance.dom, instance.element.props, element.props, publicInstance);
        instance.childInstances = reconcileChildren(instance, element);
        instance.element = element;
        return instance;
    }
    else {
        instance.publicInstance.props = element.props;
        const childElement = instance.publicInstance.render();
        const oldChildInstance = instance.childInstance;
        const childInstance = reconcile(parentDomEl, oldChildInstance, childElement, instance.publicInstance);
        instance.dom = childInstance.dom;
        instance.childInstance = childInstance;
        instance.element = element;
        return instance;
    }
}

/**
 * For cusotm elements (one which extends the Component class), we need to create a public instance.
 * A public instance is an instance of custom elements (which are not the standard HTML ones).
 * A public instance has a reference to the instance of the element. 
 * 
 * For custom elements, type is the constructor function of Component class(hence the "new"). 
 * 
 * @param {*} element 
 * @param {*} internalInstance 
 */
function createPublicInstance(element, internalInstance) {
    const { type, props } = element;
    const publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
}

/**
 * For every element, we cannot just copy the cholder nor we can render them as new.
 * So we go over every child and call the reconsile differently. 
 * 
 * When comparing previous and next children, we iterate over the longer array,
 * becuase we already know how to handle undefined elements and instances:
 *  ** If there are more nextChildElements, then after {childInstances.length}, for each child we will 
 *     pass 'undefined' for the instance, which will result creation of new instance.
 *  ** If there are more childInstances, then then after {nextChildElements.length}, for each child we will
 *     pass 'undefined' for the element, which will remove the corresponding childElement, and return null
 *     and therefore not added to the array of new childInstances.
 * 
 * @param {*} instance - The instance of the current element on the DOM
 * @param {*} element - the element whos childern needs to be checked
 * 
 * @returns an aray of the next children instances.
 */
function reconcileChildren(instance, element) {
    const dom = instance.dom;
    const childInstances = instance.childInstances;
    const nextChildElements = element.props.children || [];
    const newChildInstances = [];
    const count = Math.max(childInstances.length, nextChildElements.length);
    for (let i = 0; i < count; i++) {
      const childInstance = childInstances[i];
      const childElement = nextChildElements[i];
      const newChildInstance = reconcile(dom, childInstance, childElement);
      newChildInstance && newChildInstances.push(newChildInstance);
    }
    return newChildInstances;
}


/**
 * Creates a new instance from an element. 
 * 
 * @param {*} element 
 * 
 * @returns an object which represents the element: 
 *  
 * If the object is of known HTML type (div, span, h1, etc.), the structure is as follows:
 *  dom - the DOM element representing the element itself
 *  element - the element itself
 *  childInstances - an array which contains instances of the element's children
 * 
 * If the type is not a string, then this is a custom element, created from the Component class,
 * and then the structure is:
 *  dom - the DOM element representing the element itself
 *  element - the element itself
 *  childInstance - an instance of this Element's child
 *  publicInstance - an instance of COmponent based elements
 *  
 */
function instantiate(element) {

    const {type, props} = element;
    const isDomElement = typeof type === "string";

    if(isDomElement) {
        const dom = type === 'TEXT' ? document.createTextNode('') : document.createElement(type);

        updateDomProperties(dom, [], props);

        const children = props.children || [];
        const childInstances = children.map(instantiate);
        const childDoms = childInstances.map(childInstance => childInstance.dom);
        childDoms.forEach(childDom => dom.appendChild(childDom));

        return {dom, element, childInstances};
    }
    else {
        const instance = {};
        const publicInstance = createPublicInstance(element, instance);
        const childElement = publicInstance.render();
        const childInstance = instantiate(childElement);
        const dom = childInstance.dom;
    
        Object.assign(instance, { dom, element, childInstance, publicInstance });
        return instance;
    }
    
}


/**
 * Updates the properties of a dom element, removing the previous props from
 * the element, and adding new ones. The function does not change the children of the 
 * element , they are channge in "reconcileChildren" function
 * 
 * @param {*} dom - the dom element which is changed
 * @param {*} prevProps - the old properties before the change
 * @param {*} nextProps  - the new properties to apply after the change
 */
function updateDomProperties(dom, prevProps, nextProps, publicInstance) {   
    publicInstance && publicInstance.componentWillRecieveProps && publicInstance.componentWillRecieveProps(prevProps, nextProps);
    const isListener = el => el.startsWith('on');
    const isAttribute = name => !isListener(name) && name != "children";

    Object.keys(prevProps).filter(isListener).forEach(listenerName => {
        dom.removeEventListener(listenerName.toLowerCase().substring(2), prevProps[listenerName]);
    });
    Object.keys(prevProps).filter(isAttribute).forEach(propName => {
        dom[propName] = null;
    });
    
    Object.keys(nextProps).filter(isListener).forEach(listenerName => {
        dom.addEventListener(listenerName.toLowerCase().substring(2), nextProps[listenerName]);
    });
    Object.keys(nextProps).filter(isAttribute).forEach(propName => {
        dom[propName] = nextProps[propName];
    });
}