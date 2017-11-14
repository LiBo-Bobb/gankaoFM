/**
 * Created by libo on 2017/8/25.
 */
import React, {Component} from "react";
import infoIcon from "../img/infoIcon.png"
import likeIcon from "../img/likeIcon.png";
import blueHert from "../img/blueHert.png";
import request from "superagent";
import {hashHistory} from 'react-router'
import {Toast, Article, LoadMore} from "react-weui"
import {Helmet} from "react-helmet"
import * as config from './config'
import {checkIsNeedLogin} from './lib'


// 查询指定主题的评论信息，包含主题的赞、踩、评论列表信息
export default class CommentList extends Component {
    constructor(props) {
        super(props);
        // console.log('CommentList extends Component: ');
        // console.log(props)
        let {model = 'all', subjectKey, showDialogInfo} = props;

        //通讯异常显示dialog的回调函数
        this.showDialogInfo = showDialogInfo;
        if (!subjectKey) {
            //通过点击【查看更多评论】通过路由进入到全部评论页面
            if (this.props.params) {
                subjectKey = this.props.params.subjectId
                // console.log("this.props.params.subjectId.....")
                // console.log(subjectKey)
                if (!subjectKey)
                    throw '评论组件未指定主题subjectKey'
            } else {
                throw '评论组件未指定主题subjectKey 2'
            }
        }

        //根据该字段判断评论是不是自己发送的，是否显示【删除】按钮
        this.currentUserId = window._fm.currentUserId;

        //组件先传递过来的subjectKey
        this.subjectKey = subjectKey

        //评论接口的token
        this.authTokenForFM = window._fm.authTokenForFM;

        this.state = {
            //主题创建时间
            created_at: "",

            //主题点赞数目
            subjectGoodCount: "",

            //以及评论的第一页总数目（10条）
            subComment: [],

            //该字段如果是空字符串，即表示一级评论不超过10条，不用翻页
            nextPageFromTime: "",

            //主题Id
            subjectId: "",

            //主题评论总条数
            replyCount: 0,

            showToast: false,
            showAjaxLoading: false,
            toastTimer: null,
            loadingTimer: null,
            model,
            showCommentInitLoading: false,
            isLoading: false
        };
    }


    //Toast退出设置
    componentWillUnmount() {
        this.state.toastTimer && clearTimeout(this.state.toastTimer);
        this.state.loadingTimer && clearTimeout(this.state.loadingTimer);
    }

    //点击评论的Icon 路由跳转到评论回复界面
    clickHandler = (id) => {
        hashHistory.push("/detail/" + id)
    }

    //超过10条评论，点击更多去另一个路由
    checkAllComments = (subjectKey, nextPageFromTime) => {
        hashHistory.push("/commentList/" + subjectKey + "/" + nextPageFromTime)
    }
    //首次渲染界面，加载数据
    checkFmlist = () => {
        this.setState({showCommentInitLoading: true});
        request.post(config.API_loadSubject)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                "subjectKey": this.subjectKey,
                "nextPageFromTime": this.state.nextPageFromTime || ""
            })
            .set('token', this.authTokenForFM)
            .end(
                (err, res) => {
                    this.setState({showCommentInitLoading: false});
                    if (err === null) {
                        // console.log("评论列表请求结果.......")
                        // console.log(res.body)
                        let {subject} = res.body.result;
                        // console.log(subject)
                        /* console.log("-----nextPageFromTime")
                         console.log(res.body.result.nextPageFromTime)
                         console.log(subject.replyCount)
                         console.log(subject.goodMarkedByMe)*/
                        //获取主题Id 用来发表评论
                        let {getId} = this.props;
                        getId && getId(subject.id)

                        this.setState({
                            //主题创建时间
                            created_at: subject.created_at,
                            //主题评论[{},{}]
                            subComment: subject.subComment,
                            //主题Id   主题点赞使用，
                            subjectId: subject.id,
                            //是否翻页
                            nextPageFromTime: res.body.result.nextPageFromTime,
                            //评论总条数
                            replyCount: subject.replyCount,
                            //主题点赞数
                            subjectGoodCount: subject.goodCount
                        })

                        let {onDataSourceUpdate} = this.props
                        //使用回调函数的时候，需要判断一下该回调函数是否存在
                        if (onDataSourceUpdate) {
                            onDataSourceUpdate(subject)
                        }
                    } else {
                        // alert(JSON.stringify(err))
                        // window.document.write(JSON.stringify(err))
                        // window.document.write(err.message)
                        // return;
                        if (this.showDialogInfo) {
                            this.showDialogInfo(true, err)
                        }

                    }
                }
            )
    }
    //每次进行一次删除或者点赞操作以后需要重新调接口对界面数据更新
    upCheckFmlist = () => {
        // console.log("upCheckFmlist")
        // console.log(this.subjectKey)
        this.setState({isLoading: true})
        request
            .post(config.API_loadSubject)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                "subjectKey": this.subjectKey,
                "nextPageFromTime": ""
            })
            .set('token', this.authTokenForFM).end(
            (err, res) => {
                if (err === null) {
                    /* console.log("评论列表更新(不翻页).......")
                     console.log(res.body.result)*/
                    let {subject} = res.body.result;
                    /* console.log("-----nextPageFromTime")
                     console.log(res.body.result.nextPageFromTime)
                     console.log(subject.replyCount)
                     console.log(subject.goodMarkedByMe)*/
                    //获取主题Id
                    let {getId} = this.props;
                    if (getId) {
                        getId(subject.id)
                    }
                    this.setState({
                        //主题创建时间
                        created_at: subject.created_at,
                        //主题评论数目[]
                        subComment: subject.subComment,
                        //主题Id
                        subjectId: subject.id,
                        nextPageFromTime: res.body.result.nextPageFromTime,
                        //评论总条数
                        replyCount: subject.replyCount,
                        //是否翻页
                        subjectGoodCount: subject.goodCount
                    })
                    //根据实际项目需求有时候可以把一个对象当做一个参数传递
                    let {onDataSourceUpdate} = this.props
                    if (onDataSourceUpdate) {
                        onDataSourceUpdate(subject)
                    }
                } else {
                    if (this.showDialogInfo) {
                        this.showDialogInfo(true, err)
                    }
                }
                this.setState({isLoading: false})
            }
        )
    }


    //刚进入主界面————评论数据展示
    componentDidMount() {
        this.checkFmlist()
    }

    componentWillMount() {
    }
    //删除某一条评论的方法
    deleteComment = (deleteID) => {
        // this.setState({showAjaxLoading: true});
        request
            .post(config.API_deleteComment)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({"commentId": deleteID})
            .set('token', this.authTokenForFM)
            .end(
                (err, res) => {
                    if (err === null && res.body) {
                        /* console.log("删除指定评论.......")
                         console.log(res.body)*/
                        this.checkFmlist()
                        // this.setState({showAjaxLoading: false});
                    } else {
                        // alert(JSON.stringify(err))
                        // alert(err.message)
                        if (this.showDialogInfo) {
                            this.showDialogInfo(true, err)
                        }
                    }
                }
            )
    }
    //点赞的方法
    dianZan = (commentId) => {
        // this.setState({showAjaxLoading: true});
        if (checkIsNeedLogin()) {
            return
        }
        request.post(config.API_zan).set('Content-Type', 'application/x-www-form-urlencoded').send({
            "commentId": commentId,
            "remarkType": 1
        }).set('token', this.authTokenForFM).end(
            (err, res) => {
                if (err === null) {
                    // console.log("点赞.......")
                    // console.log(res.body)
                    if (res.body) {
                        this.upCheckFmlist()
                    }
                    // this.setState({showAjaxLoading: false});
                } else {
                    // alert(JSON.stringify(err))
                    // alert(err.message)
                    if (this.showDialogInfo) {
                        this.showDialogInfo(true, err)
                    }
                }
            }
        )
    }


    //当组件传入的 props 发生变化时调用，例如：父组件状态改变，给子组件传入了新的prop值。用于组件 props 变化后，更新state。
    componentWillReceiveProps(nextProps) {
        // console.log("nextProps.....")
        // console.log(nextProps)
        if (this.subjectKey !== nextProps.subjectKey) {
            this.subjectKey = nextProps.subjectKey;
            this.upCheckFmlist();
        }
        // this.checkFmlist()
    }

    //主题点赞
    likeSubject = () => {
        //传入的参数是当前主题的Id
        this.dianZan(this.state.subjectId)
    }

    render() {
        // console.log(this.props.subjectKey);
        let style = {
            borderBottom: "1px solid #F0F0F0",
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "10px"
        };


        let {subComment, nextPageFromTime, subjectId, subjectGoodCount} = this.state;
        // console.log("主题点赞数...."+subjectGoodCount)
        /* console.log("nextPageFromTime......")
         console.log(nextPageFromTime)*/
        let subComment_elems = subComment.map((item, index) => {
            return <div className="item" style={style} key={index}>
                <div className="left" style={{border: "0 solid blue"}}>
                    <img style={{borderRadius: "50%", width: "48px"}} src={item.headimgurl} alt=""/>
                </div>
                <div className="right" style={{width: "calc(100% - 63px)", border: "0px solid blue"}}>
                    <div style={{border: "0px solid pink", display: "flex", justifyContent: "space-between"}}>
                        <span style={{
                            fontSize: "14px",
                            color: "rgb(21, 184, 255)",
                            display: "block",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            width: "150px",
                        }}>{item.username}</span>
                        <div className="deleteOneGrade" style={{color: "#969696", fontSize: "12px", display: "block"}}
                             onClick={() => {
                                 this.deleteComment(item.id)
                             }}>{this.currentUserId !== parseInt(item.reguserId) || this.currentUserId === 0 ? "" : "删除"}</div>
                    </div>
                    <div className="test2" style={{
                        color: "#646464",
                        fontSize: "14px",
                        border: "0px solid black",
                        marginTop: "10px"
                    }}>
                        <div style={{display: "inline-block"}}>{item.content}</div>
                    </div>
                    <div style={{display: "flex", justifyContent: "space-between", marginTop: "10px"}}>
                        <div
                            style={{
                                height: "20px",
                                border: "0px solid black",
                                fontSize: "10px",
                                color: "#969696"
                            }}>
                            <span>{item.created_at_display}</span>
                        </div>
                        <div style={{
                            // height: "20px",
                            color: "#969696",
                            fontSize: "12px",
                            border: "0px solid black",
                            display: "flex",
                            justifyContent: "space-between",
                        }}>
                            <div style={{marginRight: "10px"}} onClick={() => {
                                this.clickHandler(item.id)
                            }}>
                                <img
                                    src={infoIcon}
                                    style={{width: "11px"}}
                                    alt=""/>
                                <span
                                    style={{
                                        marginLeft: "2px",
                                        fontSize: "12px"
                                    }}>
                                {item.replyCount === 0 ? "回复" : item.replyCount}
                                </span>
                            </div>
                            <div onClick={() => this.dianZan(item.id)}>
                                <img
                                    src={item.goodCount === 0 ? likeIcon : blueHert} style={{width: "11px"}} alt=""/>
                                <span
                                    style={{
                                        marginLeft: "2px",
                                        fontSize: "12px"
                                    }}>{item.goodCount === 0 ? "赞" : item.goodCount}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/*二级评论*/}
                    {item.subComment.length > 0 && <div
                        style={{
                            width: "100%",
                            marginTop: "20px",
                            background: "#F7F7F7",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px"
                        }}>
                        {item.subComment.map((subItem, index1) => {
                            if (index1 < 2) {
                                return <div key={index1} style={{
                                    height: "20px",
                                    border: "0px solid red",
                                    display: "flex",
                                    justifyContent: "space-between"
                                }}>
                                    <div className="left" style={{
                                        // width: "50%",
                                        height: "20px",
                                        border: "0px solid blue",
                                        color: "#646464",
                                        fontSize: "12px",
                                        textOverflow: "ellipsis",
                                        position: "relative",
                                        display: "flex",
                                    }}>
                                        <span style={{
                                            display: "block",
                                            width: "40px",
                                            overflow: "hidden",
                                            color: "rgb(21, 184, 255)",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>{subItem.username}:</span>
                                        <span style={{
                                            display: "block",
                                            width: "50px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>{subItem.content}</span>
                                    </div>
                                    <div className="right" style={{
                                        height: "20px",
                                        border: "0px solid blue",
                                        color: "#969696",
                                        fontSize: "10px",
                                        paddingRight: "10px"
                                    }}>
                                        <span style={{display: "block"}}>{item.created_at_display}</span>
                                    </div>
                                </div>
                            }
                        })}
                        {item.subComment.length > 2 && <div onClick={() => {
                            this.clickHandler(item.id)
                        }} style={{
                            color: "#15B8FF",
                            fontSize: "12px",
                            width: "91px",
                            margin: "10px auto 0",
                        }}>
                            查看全部回复>>
                        </div>}
                    </div>}


                </div>
            </div>
        })
        return (
            <Article>
                {this.props.model === "all" && <Helmet>
                    <title>所有评论</title>
                </Helmet>}
                <div style={{paddingBottom: "40px"}}>
                    <Toast icon="loading" show={this.state.showAjaxLoading}>加载中</Toast>
                    {this.state.showCommentInitLoading &&
                    <LoadMore loading>评论加载中......</LoadMore>
                    }
                    {subComment.length === 0 &&
                    <div style={{fontSize: "12px", color: "12px", textAlign: "center"}}>还没评论，快来说两句</div>}
                    {subComment.length > 0 && subComment_elems}
                    {this.state.model === "top" && nextPageFromTime !== "" &&
                    <div className="checkAllComments_li" onClick={() => {
                        this.checkAllComments(this.subjectKey, nextPageFromTime)
                    }} style={{
                        color: "#646464",
                        fontSize: "12px",
                        textAlign: "center",
                        height: "44px",
                        lineHeight: "44px",
                        textDecoration: "underline",
                        // display:"none"
                    }}>
                        查看所有评论
                    </div>
                    }
                    {this.state.model === "all" && nextPageFromTime !== "" && this.state.isLoading === true &&
                    <div style={{
                        color: "#646464",
                        fontSize: "12px",
                        textAlign: "center",
                        height: "44px",
                        lineHeight: "44px"
                    }}>
                        加载中 ...
                    </div>
                    }
                    {this.state.model === "all" && nextPageFromTime !== "" &&
                    <div className="lodeMore_li" style={{
                        color: "#646464",
                        fontSize: "12px",
                        textAlign: "center",
                        height: "44px",
                        lineHeight: "44px",
                        textDecoration: "underline"
                    }}
                         onClick={this.checkFmlist}>
                        加载更多
                    </div>
                    }
                </div>

            </Article>

        )
    }
}
