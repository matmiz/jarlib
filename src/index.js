/** @jsx createElement */
import {render, createElement, Component} from './jarlib';


class MyComp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            shouldHelloChen: false
        }
        this.updateCounter = this.updateCounter.bind(this);
    }

    updateCounter() {
        this.setState({
            count: this.state.count+1,
            shouldHelloChen: !this.state.shouldHelloChen
        });
    }

    componentWillReceiveProps(props) {
        console.log('component Will Recieve Props!!', props);
    }

    componentWillUpdate(props) {
        console.log('component Will update!!', props);
    }

    componentDidUpdate(props) {
        console.log('component Did update!!', props);
    }

    componentWillMount(props) {
        console.log('component Will Mount!!', props);
    }

    componentWillUnmount(props) {
        console.log('component Will UnMount!!', props);
    }

    componentDidMount(props) {
        console.log('component Did mount!!', props);
    }

    componentWillReceiveProps(props) {
        console.log('component Recieved Props!!', props);
    }

    shouldComponentUpdate() {
        console.log('component should update!!');
        return true;
    }

    render() {
        return (
            <div>
                Hello World!
                <div>Counter: {this.state.count}</div>
                <button onClick={this.updateCounter}>Click Me!</button>
            </div>
        )
    }
}

render(<MyComp/>, document.getElementById('root'));
