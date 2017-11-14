/**
 * Created by libo on 2017/9/28.
 */
//检测用户有没有登录
export const checkIsNeedLogin =()=> {
    let flag = window._fm.authTokenForFM === ''
    if(flag && window.confirm("你目前是游客身份，是否要登录？")){
        window.location.href = window._fm.getFmApi+"/user/login?redirect=" + encodeURIComponent(window.location.href)
    }
    return flag;
}

