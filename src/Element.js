
/**
 * This function is creating an element. An element is a simple object which has 2 properties:
 * type - the type of the element. Can be either string (if a regular HTML element) or an Object, 
 *  if it is a custom element (which extends Component)
 * 
 * properties - the props which will be assigned to this element
 * 
 * args - the children of the element. will be put under "props.children"
 * 
 * @param {*} type 
 * @param {*} properties 
 * @param  {...any} args 
 */
export default function createElement(type, properties, ...args) {
    let props = Object.assign({}, properties);
    const hasChildren = args.length;
    let children = hasChildren ? Object.assign([], args) : [];
    props.children = children.filter(child => child).map(child => {
      return child instanceof Object ? child : createElement('TEXT', { nodeValue: child });
    });
    return { type, props };
}