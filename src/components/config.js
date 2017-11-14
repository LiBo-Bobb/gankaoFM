
//# 发表新评论，可以是评论主题，或是回复评论 #
export const API_publishApi = window._fm.apiDomain+"/commentwrite/appendComment";
//加载主题评论
export const API_loadSubject = window._fm.apiDomain+"/commentreader/loadSubject";
//加载指定的子评论详情（分支）
export const API_loadComent = window._fm.apiDomain+"/commentreader/loadComment";
//点赞评论
export const API_zan = window._fm.apiDomain+"/commentwrite/remarkGoodOrBad";
//删除评论
export const API_deleteComment= window._fm.apiDomain+"/commentwrite/deleteComment";


