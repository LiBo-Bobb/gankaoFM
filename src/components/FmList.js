/**
 * Created by libo on 2017/9/1.
 */
import React, {Component} from "react";
import orderImg from "../img/orderImg.png"

export default class FmList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let {musicLists, currentMusic} = this.props;
        // alert(typeof musicLists.map)
        // console.log(`currentMusic: ${currentMusic}`)
        return (<div style={{position: "fixed", bottom: "0", left: "0", right: "0", zIndex: "9999999999"}}>
                <div className="weui-mask" onClick={() => {
                    this.props.hideList(false)
                }}>
                </div>
                <div style={{
                    background: "#F8F8F8",
                    height: "362px",
                    width: "100%",
                    position: "relative",
                    zIndex: "10000"
                }}>
                    {/*顶部栏目*/}
                    <div style={{
                        height: "36px",
                        borderBottom: "1px solid #F0F0F0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{
                            width: "35px",
                            height: "20px",
                            border: "0px solid red",
                            marginLeft: "15px",
                            fontSize: "12px",
                            color: "#646464",
                            textAlign: "center",
                            lineHeight: "20px"
                        }}>{this.props.currentFm + 1}/{musicLists.length}
                        </div>
                        <div onClick={() => {
                            this.props.sortFmList()
                        }} style={{
                            width: "45px",
                            height: "20px",
                            border: "0px solid red",
                            marginRight: "15px",
                            // display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            display: "none"
                        }}>
                            <div style={{color: "#646464", fontSize: "12px"}}>排序</div>
                            <div style={{color: "#646464", fontSize: "12px", width: "13px", height: "15px"}}>
                                <img src={orderImg}
                                     style={{
                                         width: "13px",
                                         height: "15px"
                                     }} alt=""/>
                            </div>
                        </div>
                    </div>
                    {/*顶部栏结束*/}

                    {/*音乐列表区域开始*/}
                    <div style={{height: "278px", overflowY: "scroll", position: "relative"}}>
                        {musicLists.map((musicItem, index) => {
                            return <div key={index} onClick={() => {
                                this.props.changeCurrentFm(index)
                            }} style={{
                                height: "44px",
                                borderBottom: "1px solid #ECECEC",
                                color: musicItem.name === currentMusic.name ? "#15B8FF" : "#646464",
                                fontSize: "12px",
                                textIndent: "15px",
                                lineHeight: "44px",
                                background: "white",
                            }}>
                                {musicItem.name}
                            </div>
                        })}
                    </div>
                    {/*音乐列表区域结束*/}


                    {/*列表关闭按钮开始*/}
                    <div onClick={() => {
                        this.props.hideList(false)
                    }} style={{
                        heightL: "44px",
                        borderTop: "1px solid #ECECEC",
                        textAlign: "center",
                        lineHeight: "44px",
                        color: "#646464",
                        fontSize: "17px",
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        background: "#ECECEC"
                    }}>
                        关闭
                    </div>
                    {/*列表按钮结束*/}
                </div>
            </div>
        )
    }
}