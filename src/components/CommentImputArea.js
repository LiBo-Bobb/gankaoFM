/**
 * Created by libo on 2017/8/30.
 */
import React, {Component} from "react";
import {checkIsNeedLogin} from './lib'
import {
    Form,
    FormCell,
    TextArea,
    CellBody
} from "react-weui";
import request from "superagent";
import * as config from './config'


export default class CommentImputArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //评论输入框的内容
            commentContent: ""
        };
        //评论接口的token
        this.authTokenForFM = window._fm.authTokenForFM;
    }

    componentDidMount() {
    }


    //发布评论
    handlePublishComment = () => {
       /* if(checkIsNeedLogin()){
            return
        }*/
        request.post(config.API_publishApi)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                "commentId": this.props.id,
                "message": this.state.commentContent
            })
            .set('token', this.authTokenForFM)
            .end(
                (err, res) => {
                    if (err === null) {
                        this.props.onUpdateList()
                        this.props.changeTab&&this.props.changeTab(1)
                    } else {
                        alert("通讯异常，请稍后重试!")
                       /* alert(err.message)
                        alert(JSON.stringify(err))*/
                    }
                }
            )
        this.props.hide(false)
    }
    render() {
        return (
            <div>
                <div className="weui-mask" onClick={() => {
                    this.props.hide(false)
                }}>
                </div>
                <div style={{
                    width: "100%",
                    height: "200px",
                    background: "white",
                    position: "fixed",
                    top: "100px",
                    left: "0",
                    right: "0",
                    zIndex: "100000000"
                }}>
                    <div style={{
                        margin: "0 15px",
                        height: "44px",
                        border: "0px solid red",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div className="cancel_LI" onClick={() => {
                            this.props.hide(false)
                        }} style={{fontSize: "14px", color: "#969696"}}>取消
                        </div>
                        <div onClick={this.handlePublishComment} className="release_LI"
                             style={{fontSize: "14px", color: "#3CC51F"}}>发布
                        </div>
                    </div>
                    <Form>
                        <FormCell>
                            <CellBody>
                            <TextArea
                                onChange={e => {
                                    this.setState({commentContent: e.target.value})
                                }}
                                placeholder="请输入..."
                                rows="4"
                                maxlength="255"
                                autoFocus={true}>
                            </TextArea>
                            </CellBody>
                        </FormCell>
                    </Form>

                </div>
            </div>
        )
    }
}