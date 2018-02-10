import React, {Component} from "react";
import "rc-slider/assets/index.css";
import CommentList from "./components/CommentList"
import 'react-weui'
import "weui";
import 'react-weui/build/packages/react-weui.css';
import "./App.css";
import request from 'superagent';
import musicList from "./img/musicList.png";
import timeIcon from "./img/timeIcon.png";
import nextPlay from "./img/nextPlay.png";
import play from "./img/play.png";
import pause from "./img/pause.png";
import prePlay from "./img/prePlay.png";
import pre from "./img/pre.png";
import next from "./img/next.png";
import houtui from "./img/houtui.png";
import qianjin from "./img/qianjin.png";
import TimeCounter from "./components/TimeCounter";
import CommentInput from "./components/CommentInput"
import CommentImputArea from "./components/CommentImputArea"
import FmList from "./components/FmList"
import Slider from "rc-slider";
import {Helmet} from "react-helmet"
import {
    ActionSheet,
    Article,
    NavBar,
    NavBarItem,
    Tab,
    TabBody,
    Dialog,
} from "react-weui";


class App extends Component {
    constructor(props) {
        super(props);

        //fm接口数据参数?=19862
        this.courseId = window._fm.courseId;

        //传过来的sectionId是多少，就优先播放该音频
        this.sectionId = window._fm.sectionId;

        //fM数据接口前缀
        this.getFmApi = window._fm.getFmApi;
        this.state = {
            // FM资源music,
            music: [],

            //初始音频索引
            currentFm: 0,
            //test
            //当前时间
            currentTime: "00:00",

            //音频总时间
            duration: '--:--',

            //默认播放状态
            ended: 'true',

            //滑动条的实时值
            slideValue: 0,
            //tab索引
            tab: 1,

            //从定时器组件传递过来的一个实时值
            count: 0,

            //从多少秒开始倒计时
            countDown: 0,

            //初始化计时器
            startCountDownTime: false,

            //自动改变进度条
            canAutoChangeProgress: true,

            //显示ActionSheet
            auto_show: false,

            //控制播放速度选择的Dialog是否显示
            speedListShow: false,

            //控制是否显示评论内容输入框
            isShowInputArea: false,

            //控制是否显示FM列表的Dialog
            isShowFmList: false,

            // 主题Id
            commentID: "",

            //主题评论数目
            subCommentCount: 0,

            //主题被喜欢的数目
            subGoodCount: 0,

            //主题是否被喜欢
            goodMarkedByMe: false,

            //接口错误测试
            errTest: "",

            //定时器选择项
            menus: [{
                label: '不开启',
                onClick: () => {
                    this.setState({auto_show: false, startCountDownTime: false});
                }
            }, {
                label: '15分钟',
                onClick: () => {
                    if (this.state.startCountDownTime) {//是否初始化计时器
                        this.setState({startCountDownTime: false})
                    }

                    setTimeout(() => {
                        this.refs.timeCounter.start()
                    }, 10)
                    setTimeout(() => {
                        this.setState({countDown: 900, auto_show: false, startCountDownTime: true});
                    }, 0)
                }
            }, {
                label: '30分钟',
                onClick: () => {
                    if (this.state.startCountDownTime) {
                        this.setState({startCountDownTime: false})
                    }
                    setTimeout(() => {
                        this.setState({countDown: 1800, auto_show: false, startCountDownTime: true});
                    }, 0)
                    setTimeout(() => {
                        this.refs.timeCounter.start()
                    }, 10)
                }
            }, {
                label: '45分钟',
                onClick: () => {
                    if (this.state.startCountDownTime) {
                        this.setState({startCountDownTime: false})
                    }
                    setTimeout(() => {
                        this.setState({countDown: 2700, auto_show: false, startCountDownTime: true});
                    }, 0)
                    setTimeout(() => {
                        this.refs.timeCounter.start()
                    }, 10)
                }
            }, {
                label: '90分钟',
                onClick: () => {
                    if (this.state.startCountDownTime) {
                        this.setState({startCountDownTime: false})
                    }
                    setTimeout(() => {
                        this.setState({countDown: 5400, auto_show: false, startCountDownTime: true});
                    }, 0)
                    setTimeout(() => {
                        this.refs.timeCounter.start()
                    }, 10)
                }
            }],
            //actionSheet的取消按钮
            actions: [
                {
                    label: '取消',
                    onClick: this.hide.bind(this)
                }
            ],

            //播放速度选择项
            speedList: [
                {
                    label: '0.75倍速度播放',
                    onClick: () => {
                        setTimeout(() => {
                            this.refs.audio.playbackRate = 0.75;
                            this.setState({speedListShow: false})
                        }, 30)

                    }
                }, {
                    label: '正常速度播放',
                    onClick: () => {
                        this.refs.audio.playbackRate = 1.0;
                        this.setState({speedListShow: false})
                    }
                }, {
                    label: '1.25倍速度播放',
                    onClick: () => {
                        this.refs.audio.playbackRate = 1.25;
                        this.setState({speedListShow: false})
                    }
                }, {
                    label: '1.5倍速度播放',
                    onClick: () => {
                        this.refs.audio.playbackRate = 1.5;
                        this.setState({speedListShow: false})
                    }
                }
            ],
            //播放速率调节的取消按钮
            cancelSpeedList: [{
                label: '取消',
                onClick: this.hide.bind(this)
            }],
            //调用接口通讯异常的dialog样式
            dialogStyle: {
                buttons: [
                    {
                        label: '确认',
                        onClick: this.hideDialog.bind(this)
                    }
                ],
                title: ""
            },
            //接口调用失败以后提示“通讯异常，请稍后重试”
            // isShowDialog: false,
            isShowDialog: false,
            //主题详情
            subjectContent: "",
            commentSubjectKey: ""
        }
    }

    //隐藏ActionSheet
    hide() {
        this.setState({
            auto_show: false,
            speedListShow: false
        })
    }

    //隐藏Dialog
    hideDialog() {
        this.setState({
            isShowDialog: false,
        });
    }

    componentDidMount() {


        // console.log(this);
        //监听音频当前的时间
        this.refs.audio.ontimeupdate = () => {
            //音频当前的时间
            // console.log(this.refs.audio.currentTime,this.refs.audio.duration)
            //滚动条上的时间（百分制）
            //当前时间
            if (this.refs.audio) {
                let currentTime = this.time(this.refs.audio.currentTime)
                //滑动条是上的值 （百分制）
                let slideValue = parseInt(this.refs.audio.currentTime / this.refs.audio.duration * 100) || 0;
                //可以自动改变进度条的情况下
                if (this.state.canAutoChangeProgress) {
                    this.setState({currentTime, slideValue})
                } else {
                    this.setState({currentTime})
                }
            }


        };
        /* this.refs.audio.oncanplay = () => {
         console.log(this.refs.audio.currentTime);
         /!*  console.dir(this.refs.audio.duration);*!/
         this.setState({
         duration: this.time(this.refs.audio.duration),
         })
         }*/
        //监听音频的总时间
        this.refs.audio.ondurationchange = () => {
            this.setState({
                duration: this.time(this.refs.audio.duration),
            })
        }
        //已经开始播放但是音频网络资源没有加载到的时候，当前时间显示 “加载中......”
        this.refs.audio.onloadstart = () => {
            if (!this.state.ended) {
                this.setState({currentTime: "加载中..."})
            }
        }
    }

    componentWillMount() {
        //获取fm接口数据
        this.getFmData()
    }

    //获取FM数据
    getFmData = () => {
        // http://test.gankao.com/api/fm/showGrowCourse?id=19862
        try {
            request.get(this.getFmApi + "/api/fm/showGrowCourse?id=" + this.courseId).then(
                res => {
                    try {
                        // console.log("请求FM数据的全部返回内容........")
                        // console.log(res.body)
                        let {fmSections, type} = res.body;
                        // console.log("music数据资源[].......")
                        // console.log(fmSections)
                        if (type === 'fm') {
                            this.sectionId = this.courseId;
                        }
                        let currentFm = 0;
                        let state = {
                            //FM音频资源[]
                            music: fmSections,
                            //每个FM详情信息
                            subjectContent: fmSections[currentFm].descriptionUrl,
                            //每个FM文件的commentSubjectKey
                            commentSubjectKey: fmSections[currentFm].commentSubjectKey
                        };
                        for (let i = 0, len = fmSections.length; i < len; i++) {
                            if (this.sectionId == fmSections[i].id) {
                                currentFm = i;
                                break;
                            }
                        }
                        state.currentFm = currentFm;
                        if (!this.isVideo(fmSections[currentFm])) {
                            this.setState(state)
                        }
                        // console.log("当前索引音频的commentSubjectKey.......")
                        // console.log(fmSections[currentFm].commentSubjectKey)
                        // console.log(this.state.commentSubjectKey)
                    } catch (err) {
                        // console.log(err)
                        this.setState({isShowDialog: true})
                    }
                }
            ).catch(
                res => {
                    if (res) {
                        console.log(res)
                        this.setState({isShowDialog: true})
                    }

                }
            )
        } catch (err) {
            // console.log(err.message)
            alert("通讯异常，请稍后再试！");
        }

    }


    //转化时间格式为00：00
    time = (changeTime) => {//把这种格式的时间26.091728  转换成 00:00
        if (!changeTime && changeTime !== Number(changeTime)) {
            changeTime = 0
        }
        let m = this.zero(Math.floor(changeTime % 3600 / 60)); //分
        let s = this.zero(Math.floor(changeTime % 60)); //秒
        return m + ':' + s;
    }
    //小于10的数字前面拼接“0”
    zero = (num) => {  // 小于10，补0
        if (num < 10) {
            return '0' + num;
        } else {
            return '' + num;
        }
    }
    //播放上一个音频
    prePlay = () => {
        let {currentFm, music} = this.state;
        let currentMusic = music[currentFm];
        //当前音频索引
        currentFm--;
        if (currentFm < 0) {
            // currentFm = music.length - 1
            return
        }
        this.playAudio(currentFm);
    }
    //播放结束
    playDone = () => {
        this.setState({ended: true})
    }
    //播放
    play = () => {
        if (this.state.ended) {//播放结束的情况下
            this.refs.audio.play();
            this.setState({ended: this.refs.audio.ended})
        } else {
            this.refs.audio.pause();
            this.setState({ended: true})
        }
    };

    //播放下一个
    nextPlay = () => {
        let {currentFm, music} = this.state;
        let currentMusic = music[currentFm];
        currentFm++;
        if (currentFm === music.length) {
            // currentFm = 0
            return
        }
        this.playAudio(currentFm);

    };
    // 控制播放进度（直接拖动的时候）
    changeProgress = (value) => {
        console.log("进度条的valu......")
        //1---100
        console.log(value)
        /*let {slideValue} = this.state*/
        let {duration} = this.refs.audio
        let currentTime = value / 100 * duration
        if (this.refs.audio) {
            this.refs.audio.currentTime = parseInt(currentTime)
            this.setState({canAutoChangeProgress: true})
        }
    };
    //前进15秒—
    handleSkip = () => {
        let {currentTime} = this.refs.audio;
        currentTime += 15;
        this.refs.audio.currentTime = parseInt(currentTime)
        this.setState({canAutoChangeProgress: true})
    };

    //后退15秒
    handleR = () => {
        let {currentTime} = this.refs.audio;
        currentTime -= 15;
        this.refs.audio.currentTime = parseInt(currentTime);
        this.setState({canAutoChangeProgress: true})
    };

    //更新评论列表
    onUpdateList = () => {
        this.refs.commentList.upCheckFmlist()
    }


    //显示FM列表
    showFmList() {
        this.setState({isShowFmList: true})
    }

    //显示计时器选择列表
    showTimerActionSheet() {
        this.setState({auto_show: true})
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.location.pathname)
        if (nextProps.location.pathname !== this.props.location.pathname) {
            this.refs.commentList.upCheckFmlist()
        }
    }

    //检测浏览器
    browserType = () => {
        let userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        // let isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
        // let isSafari = userAgent.indexOf("Safari") > -1; //判断是否Safari浏览器
        // let isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
        let isChrome = userAgent.toLowerCase().indexOf("chrome") > -1 //判断Chrome浏览器
        // if (isSafari) {
        //     return "Safari";
        // }
        if (isChrome) {
            return "Chrome";
        } else {
            return 'others'
        }
    }

    //判断是安卓机终端还是苹果终端
    isIOS = () => {
        let u = navigator.userAgent;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isiOS) {
            return "IOS"
        }
        /* if (isAndroid) {
             return "android"
         }*/
        return "other"
    }

    //判断当前资源是音频还是视频
    isVideo = (music) => {
        if (typeof music.redirectUrl !== 'undefined' && music.redirectUrl !== '') {
            window.location.href = music.redirectUrl;
            return true;
        }
        return false;
    }

    playAudio = (index) => {
        let currentMusic = this.state.music[index];
        if (!this.isVideo(currentMusic)) {
            let state = {
                currentFm: index,
                subjectContent: currentMusic.descriptionUrl,
                commentSubjectKey: currentMusic.commentSubjectKey
            };
            if (!this.state.ended) {
                state.ended = true;
            }
            if (this.state.isShowFmList) {
                state.isShowFmList = false;
            }
            this.setState(state);
            setTimeout(this.play, 30)
        }
    }

    render() {
        let {music, subjectContent, commentSubjectKey, currentFm, duration, currentTime, countDown, ended, isShowInputArea, isShowFmList, goodMarkedByMe} = this.state;
        let animationClassName = !this.state.ended ? 'rotate start' : 'rotate stop';

        //音频播放速率调节
        let isShowSpeed = <div className="speedPlay" onClick={e => this.setState({speedListShow: true})}>
                                <span
                                    style={{display: this.state.ended ? "block" : "none"}}>
                                    调速
                                </span>
            <span>
                                    {!this.state.ended && this.refs.audio.playbackRate + "X"}
                                </span>
        </div>
        // console.log("接口数据.....")
        // console.log(music)
        // console.log("commentSubjectKey... start")
        // console.log(commentSubjectKey);
        // console.log("commentSubjectKey...end")
        // console.log("浏览器.......")
        // console.log(BrowserType())
        // alert(BrowserType()

        //检测浏览器类型
        let browserType = this.browserType();
        //检测终端类型
        let isIOS = this.isIOS()
        // console.log("浏览器",browserType)
        //判断当前资源是音频还是视频】
        // console.log(isVideo)
        return (
            <div>
                <div className="App" style={{display: this.props.children ? "none" : "block"}}>
                    {/*<Link to="/AllComments">to List</Link>*/}
                    <div className="music">
                        {/*所有通讯异常显示该dialog*/}
                        <Dialog type="ios" title={this.state.dialogStyle.title} buttons={this.state.dialogStyle.buttons}
                                show={this.state.isShowDialog}>
                            通讯异常，请稍后重试!
                        </Dialog>
                        {/*音乐部分开始*/}
                        {/*  top栏目*/}
                        <div className="wrp">
                            {/* 播放器盒子*/}
                            <div className="playerWrp bg-blur"
                                 style={{backgroundImage: `url(${typeof music[currentFm] === 'object' ? music[currentFm].title_pic : ''})`}}>
                            </div>
                            <div className="wrp">
                                {/*根据浏览器类型决定是否显示调速功能，该功能只支持chrome&safari浏览器*/}
                                {/*{browserType == "Safari" || browserType == "Chrome" ? isShowSpeed : ""}*/}
                                {isIOS == "IOS" ? isShowSpeed : ""}
                                {/*标题*/}
                                <div className="fmTitle">
                                <span
                                    style={{display: ended ? "none" : "inlineBlock"}}>正在播放：</span>{typeof music[currentFm] === 'object' ? music[currentFm].name : ''}
                                </div>
                                {/*转圈的图片*/}
                                <div className="singer" style={{width: 240, height: 240, margin: '15px auto 0'}}>
                                    <div id='quan' className={animationClassName} style={{
                                        width: "100%",
                                        height: '100%',
                                        borderRadius: '50%',
                                        border: "2px solid #6F7576",
                                        background: `url(${typeof music[currentFm] === 'object' ? music[currentFm].title_pic_hd : ''}) center center / auto 100% no-repeat`,
                                        ...(() => {
                                            let result = {};
                                            if (this.state.ended) {
                                                result.animationPlayState = 'paused';
                                            }
                                            return result;
                                        })()
                                    }}>
                                        {/*<img src={typeof music[currentFm] === 'object' ? music[currentFm].title_pic : ''} alt=""/>*/}
                                    </div>
                                </div>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div className="houtui" onClick={this.handleR}><img src={houtui} style={{
                                        width: "21px",
                                        marginLeft: "15px"
                                    }} alt=""/></div>
                                    <div className="qianjin" onClick={this.handleSkip}><img src={qianjin} style={{
                                        width: "21px",
                                        marginRight: "15px"
                                    }} alt=""/></div>
                                </div>
                            </div>
                            {/* 音频播放器控件*/}
                            <div>
                                <audio onEnded={this.playDone} ref="audio"
                                       src={`${typeof music[currentFm] === 'object' ? music[currentFm].src : ""}`}>
                                </audio>
                            </div>
                        </div>
                        {/*进度条*/}
                        <div className="jindu">
                            <Slider value={this.state.slideValue}
                                    onChange={(slideValue) => {
                                        this.setState({slideValue, canAutoChangeProgress: false})
                                    }}
                                    onAfterChange={(value) => {
                                        this.changeProgress(value)
                                    }}/>
                        </div>
                        <div className="timeShow">
                            <div className="currentTime"
                                 style={{color: "#969696", fontSize: "12px"}}>{currentTime}</div>
                            <div className="duration"
                                 dangerouslySetInnerHTML={{__html: duration}}
                                 style={{color: "#969696", fontSize: "12px"}}>
                            </div>
                        </div>
                        <div className="iconBtn">
                            {/*弹出列表*/}
                            <div className="btn" onClick={this.showFmList.bind(this)}>
                                <img src={musicList} style={{width: "21px"}} alt=""/>
                                <div style={{fontSize: "10px", color: "#969696"}}>列表</div>
                            </div>
                            <div className="btn" onClick={this.prePlay}>
                                <img src={currentFm === 0 ? pre : prePlay} style={{width: "38px"}} alt=""/>
                            </div>
                            <div className="play" style={{width: "63px", height: "62px"}} onClick={this.play}>
                                <img src={this.state.ended ? play : pause} style={{width: "63px"}} alt=""/>
                            </div>
                            {/*commenting-o*/}
                            <div className="btn"
                                 onClick={this.nextPlay}>
                                <img src={currentFm === music.length - 1 ? next : nextPlay} style={{width: "38px"}}
                                     alt="下一曲"/>
                            </div>
                            {/*弹出定时器列表选择*/}
                            <div className="btn" onClick={this.showTimerActionSheet.bind(this)}>
                                <img style={{width: '21px'}} src={timeIcon} alt=""/>
                                <div style={{fontSize: "10px", color: "#969696"}}>
                                    {!this.state.startCountDownTime && "定时"}
                                    {this.state.startCountDownTime &&
                                    <TimeCounter
                                        ref="timeCounter"
                                        value={countDown}
                                        showMinute={true}
                                        onStep={({count, time}) => {
                                            this.setState({count});
                                            if (this.state.count === 0) {
                                                this.setState({startCountDownTime: false, ended: true})
                                                this.refs.audio.pause();
                                            }
                                        }}
                                    />}
                                </div>
                            </div>
                        </div>
                        {/*音乐部分结束*/}


                        <Tab>
                            <NavBar>
                                <NavBarItem
                                    active={this.state.tab === 0}
                                    onClick={e => this.setState({tab: 0})}>
                                    详情
                                </NavBarItem>
                                <NavBarItem
                                    active={this.state.tab === 1}
                                    onClick={e => this.setState({tab: 1})}>
                                    评论({this.state.subCommentCount})
                                </NavBarItem>
                            </NavBar>
                            <TabBody>
                                <Article style={{display: this.state.tab === 0 ? null : 'none'}}>
                                    <section className="detailSection_li" style={{marginBottom: "10.5em"}}>
                                        <div
                                            className="title"
                                            dangerouslySetInnerHTML={{__html: typeof music[currentFm] === 'object' ? music[currentFm].descriptionUrl : "暂无详情"}}>
                                        </div>
                                    </section>
                                </Article>

                                {/*  showReplyCount={(count) => {
                                this.setState({replyCount: count})
                                }}*/}
                                <div style={{display: this.state.tab === 1 ? 'block' : 'none'}}>
                                    {commentSubjectKey && <CommentList
                                        // subjectKey="course-2183120094"
                                        subjectKey={commentSubjectKey}
                                        model="top"
                                        //commentID :主题id  用来发表评论的
                                        getId={(id) => {
                                            this.setState({commentID: id})
                                        }}
                                        //接口调取失败，显示dialog（通讯异常，请稍后重试）
                                        showDialogInfo={(a, err) => {
                                            this.setState({isShowDialog: a, errTest: err.message})
                                        }}
                                        ref="commentList"
                                        //更新底部模块的主题评论数目和点赞数目，以及是否被点赞
                                        onDataSourceUpdate={(subject) => {
                                            this.setState({
                                                //主题评论数目
                                                subCommentCount: subject.replyCount,
                                                //主题点赞数目
                                                subGoodCount: subject.goodCount,
                                                //主题是否被我点赞
                                                goodMarkedByMe: subject.goodMarkedByMe
                                            })
                                        }}
                                    />}
                                </div>
                            </TabBody>
                        </Tab>

                        {/*定时器的ActionSheet*/}
                        <ActionSheet
                            menus={this.state.menus}
                            actions={this.state.actions}
                            show={this.state.auto_show}
                            onRequestClose={e => this.setState({auto_show: false})}
                        />

                        {/*调节播放速率的ActionSheet*/}
                        <ActionSheet
                            menus={this.state.speedList}
                            actions={this.state.cancelSpeedList}
                            show={this.state.speedListShow}
                            onRequestClose={e => this.setState({speedListShow: false})}/>
                    </div>
                    {/*评论输入发送区域*/}
                    {isShowInputArea &&
                    <CommentImputArea
                        //发表评论要用的主题id
                        id={this.state.commentID}

                        //发表评论成功以后tab跳转到评论模块
                        changeTab={(num) => {
                            this.setState({tab: num})
                        }}

                        //发表评论成功以后刷新评论列表
                        onUpdateList={this.onUpdateList}

                        //发表评论成功以后立刻隐藏评论内容输入dialog
                        hide={(hide) => {
                            this.setState({isShowInputArea: hide})
                        }}/>}

                    <CommentInput
                        onViewAllComment={() => {
                            this.refs.commentList.checkAllComments()
                        }}

                        //主题点赞数目
                        subGoodCount={this.state.subGoodCount}

                        //主题是否被点赞
                        goodMarkedByMe={goodMarkedByMe}

                        //主题评论数目
                        subCommentCount={this.state.subCommentCount}

                        //经典的reacr回调函数使用   主题点赞动作
                        likeSubject={() => {
                            this.refs.commentList.likeSubject()
                        }}
                        //点击该区域，传入一个bool值作为参数，显示发表评论的内容输入区域
                        show={(show) => {
                            this.setState({isShowInputArea: show})
                        }}/>
                    {/*FM列表父组件*/}
                    {isShowFmList && <FmList
                        //排序暂时忽略
                        sortFmList={() => {
                            this.setState({music: this.state.music.reverse()})
                            console.log(this.state.music)
                        }}
                        //改变当前播放的索引值
                        changeCurrentFm={(num) => {
                            //直接把当的对象传过来便于获取当前的commentSubjectKey
                            // console.log('FM音频列表当前的对象........');
                            // console.log(music[num]);
                            //{}当前索引的对象资源
                            this.playAudio(num);
                        }}
                        //当前状态音频对象资源
                        currentMusic={this.state.music[this.state.currentFm]}
                        //把FM当前播放的索引存到props中
                        currentFm={currentFm}
                        //FM数据
                        musicLists={this.state.music}
                        //点击取消，隐藏FM列表
                        hideList={(hide) => {
                            this.setState({isShowFmList: hide})
                        }}/>}
                </div>
                {this.props.children}
            </div>
        );
    }
}

export default App;
