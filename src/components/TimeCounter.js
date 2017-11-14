import React from 'react'
import { Component} from 'react'
export default class TimeCounter extends Component {
    // 定义属性
    /*static propTypes = {
        onStep: PropTypes.func,
        value: PropTypes.number,
        step: PropTypes.number,
        showMinute: PropTypes.bool,
        style: PropTypes.object,
        autoStart:PropTypes.bool
    }*/
    constructor(...pa) {//更新
        super(...pa);
        this.initValue = this.props.value || 0;
        this.state = {
            count: this.initValue,
            time: "00:00"
        }
        this.interval = undefined;
        this.step = this.props.step || 1;
    }
    stop() {//清除计时器
        clearInterval(this.interval);
    }


    start() {//计时器开始
        this.stop();
        this.interval = setInterval(() => {
            let count = this.state.count - this.step;
            if (this.props.onStep) {
                this.props.onStep({count, time: this.state.time});
            }
            let minute = Math.floor(count / 60);
            if(minute<10){
                minute="0"+minute
            }
            let seconds = Math.floor(count % 60);
            if(seconds<10){
                seconds="0"+seconds
            }
            this.setState({count, time: `${minute}:${seconds}`});
        }, 1000);
    }
    restart() {//重新计时
        this.stop();
        this.setState({count: this.initValue});
        this.start();
    }
    componentDidMount() {
        this.props.autoStart && this.start();
    }
    componentWillUnmount() {
        this.stop();
    }
    render() {
        // let color = {color: "white",fontSize:'14px'}
        let { style } = this.props
        return (
            <span style={{...style }}>{this.props.showMinute ? this.state.time : this.state.count}</span>)
    }
}