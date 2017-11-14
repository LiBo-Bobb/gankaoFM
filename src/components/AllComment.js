/**
 * Created by libo on 2017/8/30.
 */
import React, {Component} from "react";
import likeIcon from "../img/likeIcon.png"
import request from "superagent"
import blueHert from "../img/blueHert.png";
import CommentImputArea from "./CommentImputArea"
import {hashHistory} from 'react-router'
import {Toast, Dialog} from "react-weui"
import {Helmet} from "react-helmet"
import * as config from './config'
import {checkIsNeedLogin} from './lib'




export default class SingleComment extends Component {
    constructor(props) {
        super(props);
        //根据该字段判断评论是不是自己发送的，是否显示【删除】按钮
        this.currentUserId = window._fm.currentUserId

        //token (确认用户身份)
        this.authTokenForFM = window._fm.authTokenForFM;

        this.state = {
            //单个品论详情
            comment: "",
            //单个评论详情的回复内容[]
            subComment: [],
            ///是否显示发表评论的输入框
            isShowInputArea: false,
            showToast: false,
            showLoading: false,
            toastTimer: null,
            loadingTimer: null,
            //单个评论的Id
            replayComentId: "",
            //接口调用失败以后Dialog提示用户
            showDialogInfo: false,
            err: null,
            style1: {
                buttons: [
                    {
                        label: 'Ok',
                        onClick: this.hideDialog.bind(this)
                    }
                ]
            },
        }
    }

    //点击确认，隐藏“通讯异常”Dialog
    hideDialog() {
        this.setState({
            showDialogInfo: false,
        });
    }

    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
        this.state.loadingTimer && clearTimeout(this.state.loadingTimer);
    }


    //跳转到App.js页面
    clickHandler = () => {
        hashHistory.push("/")
    }
    //加载回复评论内容（评论详情）
    checkReplyComment = () => {
        this.setState({isLoadingNow: true})
        request
            .post(config.API_loadComent)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({"commentId": this.props.params && this.props.params.id})
            .set('token', this.authTokenForFM)
            .end(
                (err, res) => {
                    if (err === null && res.body) {
                       /* console.log("单个评论详情post请求结果.....")
                        console.log(res.body)*/
                        if (res.body.result) {
                            let {comment} = res.body.result
                            let {err} = res.body
                            /*  console.log("单个评论详情.....")
                             console.log(comment)
                             console.log("单个评论的回复内容....[]")
                             console.log(comment.subComment)*/
                            // console.log(res.body)
                            // console.log(comment)
                            this.setState({
                                //单个品论详情{}
                                comment,
                                //单个评论详情的回复内容[]
                                subComment: comment.subComment,
                                //单个评论的Id
                                replayComentId: comment.id,
                                err
                            })
                            this.setState({isLoadingNow: false})
                        }
                    } else {
                        /* alert(JSON.stringify(err))
                         alert(err.message)*/
                        this.setState({showDialogInfo: true})
                    }
                }
            )
    }

    componentDidMount() {
        this.checkReplyComment()
    }
    componentWillMount() {
    }

    //点赞操作
    handleRemarkGood = (id) => {
        if (checkIsNeedLogin()) {
            return
        }
        // this.setState({showLoading: true});
        request
            .post(config.API_zan)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                "commentId": id,
                "remarkType": 1
            })
            .set('token', this.authTokenForFM)
            .end((err, res) => {
                if (err === null && res.body) {
                    /* console.log("二级评论点赞......")
                     console.log(res.body)*/
                    this.checkReplyComment()
                    this.setState({showLoading: false});
                } else {
                    this.setState({showDialogInfo: true})
                    /* alert(JSON.stringify(err))
                     alert(err.message)*/
                }

            })
    }

    //删除评论
    handleDeleteComment = (id) => {
        request
            .post(config.API_deleteComment)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({"commentId": id})
            .set('token', this.authTokenForFM)
            .end((err, res) => {
                if (err === null && res.body) {
                    /*console.log("删除子评论........")
                     console.log(res.body)*/
                    this.checkReplyComment()
                    setTimeout(() => {
                        this.clickHandler()
                    }, 30)
                } else {
                    this.setState({showDialogInfo: true})
                }
            })
    }

    //删除评论下级的回复内容
    handleDeleteCommentReply = (id) => {
        request
            .post(config.API_deleteComment)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({"commentId": id})
            .set('token', this.authTokenForFM)
            .end((err, res) => {
                if (err === null) {
                    if (res.body) {
                        this.checkReplyComment()
                    }
                } else {
                    this.setState({showDialogInfo: true})
                }
            })
    }

    onUpdateList = () => {
        this.checkReplyComment()
    }




    render() {
        let {comment, subComment, isShowInputArea, replayComentId, err} = this.state;
        let commentElement = <div>
            <div>
                <Dialog type="ios" title={this.state.style1.title} buttons={this.state.style1.buttons}
                        show={this.state.showDialogInfo}>
                    通讯异常，请稍后重试!
                </Dialog>
                <div style={{margin: "10px 15px 57px", border: "0px solid #ECECEC"}}>
                    <Helmet>
                        <title>评论回复详情({`${this.state.subComment.length}`})</title>
                    </Helmet>
                    <Toast icon="loading" show={this.state.showLoading}>加载中</Toast>
                    {/*评论输入发送区域*/}
                    {isShowInputArea &&
                    <CommentImputArea onUpdateList={this.onUpdateList} id={this.props.params.id} hide={(hide) => {
                        this.setState({isShowInputArea: hide})
                    }}/>}
                    {/* Detail页面，url的参数是{this.props.params.id}*/}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                    }}>
                        <div className="left" style={{
                            height: "100px",
                        }}>
                            <img src={comment.headimgurl} style={{width: "39px", borderRadius: "50%"}} alt=""/>
                        </div>
                        <div className="right" style={{
                            width: "calc(100% - 63px)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                        <span style={{
                            color: "rgb(21, 184, 255)",
                            fontSize: "14px",
                            display: "block",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            width: "100px"
                        }}>
                            {comment.username}
                        </span>
                                <span
                                    onClick={() => {
                                        this.handleDeleteComment(replayComentId)
                                    }}
                                    style={{
                                        color: "rgb(21, 184, 255)",
                                        fontSize: "12px",
                                        display: this.currentUserId !== parseInt(comment.reguserId) || this.currentUserId === 0 ? "none" : "block"
                                    }}>删除
                            </span>
                            </div>
                            <div style={{color: "#646464", fontSize: "14px"}}>{comment.content}</div>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div style={{
                                    width: "70%",
                                    color: "#969696",
                                    fontSize: "12px",
                                    textAlign: "left",
                                }}>
                                    {comment.created_at_display}
                                </div>
                                <div style={{
                                    height: "18px",
                                    border: "0px solid black",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <div className="right" onClick={() => {
                                        this.handleRemarkGood(comment.id)
                                    }} style={{
                                        width: "63px",
                                        height: "18px",
                                        display: "flex",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                        borderRadius: "100px",
                                        background: "#EDEDED"
                                    }}>
                                <span>
                                    <img src={comment.goodCount === 0 ? likeIcon : blueHert} style={{width: "11px"}}
                                         alt=""/>
                                </span>
                                        <span
                                            style={{
                                                color: "#969696",
                                                fontSize: "12px"
                                            }}>
                                        {comment.goodCount === 0 ? "赞" : comment.goodCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*评论回复*/}
                    {subComment.length === 0 ? "" : subComment.map((subItem, index1) => {
                        return <div key={index1} style={{background: "#F7F7F7"}}>
                            <div className="commentList_li"
                                 style={{
                                     margin: "0 10px",
                                     borderBottom: "1px solid #F0F0F0",
                                     display: "flex",
                                     justifyContent: "space-between",
                                     paddingTop: "10px"
                                 }}>
                                <div className="left">
                                    <img src={subItem.headimgurl} style={{width: "32px", borderRadius: "50%"}} alt=""/>
                                </div>
                                <div className="right" style={{
                                    width: "calc(100% - 53px)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}>
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                <span style={{
                                    fontSize: "12px",
                                    color: "rgb(21, 184, 255)",
                                    display: "block",
                                    width: "110px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}>{subItem.username}</span>
                                        <span onClick={() => {
                                            this.handleDeleteCommentReply(subItem.id)
                                        }} style={{
                                            color: "#15B8FF",
                                            fontSize: "10px",
                                            display: this.currentUserId !== parseInt(subItem.reguserId) || this.currentUserId === 0 ? "none" : "block"
                                        }}>删除</span>
                                    </div>
                                    <div style={{color: "#646464", fontSize: "12px"}}>{subItem.content}</div>
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        <div style={{
                                            color: "#969696",
                                            fontSize: "10px"
                                        }}>{subItem.created_at_display}</div>
                                        <div onClick={() => {
                                            this.handleRemarkGood(subItem.id)
                                        }} style={{
                                            color: "#969696",
                                            fontSize: "10px",
                                            width: "54px",
                                            height: "15px",
                                            background: "#EDEDED",
                                            borderRadius: "100px",
                                            display: "flex",
                                            justifyContent: "space-around",
                                            alignItems: "center"
                                        }}>
                                    <span><img src={subItem.goodCount === 0 ? likeIcon : blueHert}
                                               style={{width: "8px", height: "9px"}} alt=""/></span>
                                            <span>{subItem.goodCount === 0 ? "点赞" : subItem.goodCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    })}
                </div>


                <div onClick={() => {
                    if (checkIsNeedLogin()) {
                        return
                    }
                    this.setState({isShowInputArea: true})
                }} style={{
                    height: "56px",
                    background: "#F9F9F9",
                    position: "fixed",
                    left: "0",
                    right: "0",
                    bottom: '0',
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center"
                }}>
                    <div className="leftComment" style={{
                        width: "70%",
                        height: "36px",
                        border: "1px solid #ECECEC",
                        fontSize: "14px",
                        color: "#9F9F9F",
                        textIndent: "15px",
                        lineHeight: "36px",
                        borderRadius: "4px"
                    }}>回复评论...
                    </div>
                    <div className="rightBtn" style={{
                        width: "20%",
                        height: "36px",
                        background: "#15B8FF",
                        color: "white",
                        fontSize: "12px",
                        textAlign: "center",
                        lineHeight: "36px",
                        borderRadius: "4px"
                    }}>
                        评论
                    </div>
                </div>


            </div>
        </div>
        return (
            <div>
                {this.props.children}
                {!this.props.children && commentElement}
            </div>
        )
    }

}