### JARLIB - Just another react-like library

This project was made using the amazing tutorial here: 
https://engineering.hexacta.com/didact-learning-how-react-works-by-building-it-from-scratch-51007984e5c5

This is a project that acts like react, with all of its properties: JSX, components, props, state, etc.

We will create a JARLIB element
Every JARLIB Element has 2 mandatory properties:
1. Type - a string represting the type of the Element
2. Props - an object of the properties of this element. Will be an empty object if no properties are attached to it. 
Props will also have a special property called _children_ which will be an array of *JARLIB Elements*, which will represent the inner HTML of this Element.

