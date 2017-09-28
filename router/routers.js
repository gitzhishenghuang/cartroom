/**
 * Created by Administrator on 2017/8/14.
 */
var db=require('../models/db.js');
var formidable=require('formidable');
var path = require("path");
var fs = require("fs");
var gm = require("gm");



//注册
exports.doRegister=function(req,res,next){
    var form=new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../public/images");
    form.parse(req, function (err, fields,files) {
        if(err){
            res.json({"msg":"ajax传值出错"});//服务器错误
            return
        }
        var username=fields.username;
        var pwd=fields.password;
        var oldPath=files.img.path;
        if(files.img.size==0){
            db.insertOne("users",{
                "username":username,
                "pwd":pwd,
                "img":"images/danny2.jpg"
            },(err,result)=> {
                if (err) {
                    res.json({"msg": "插入出错"});//服务器错误
                    return
                }
                fs.unlink(oldPath,(err)=>{
                    //console.log('删除成功');
                    res.json({"msg":"1"});//注册成功
                });
            })
        }else{
            var x=fields.x||0;
            var y=fields.y||0;
            var w=fields.w||0;
            var h=fields.h||0;
            var fileName=files.img.name;
            var fileType=fileName.substr(fileName.lastIndexOf(".")+1);
            var newPath=path.normalize(oldPath+'/../'+username+'.'+fileType);
            fs.rename(oldPath,newPath,(err)=>{
                //console.log(err);
                if(err){
                    res.json({"msg":"改名出错"});//改名错误
                    return
                }
                gm(newPath)
                    .crop(w, h, x, y)
                    .resize(200, 200)
                    .write(newPath, function (err) {
                        //console.log(err);
                        if (err) {
                            res.json({"msg":"裁剪出错"});//裁剪错误
                            return;
                        }
                        db.insertOne("users",{
                            "username":username,
                            "pwd":pwd,
                            "img":"images/"+username+'.'+fileType
                        },(err,result)=> {
                            if (err) {
                                res.json({"msg": "插入出错"});//服务器错误
                                return
                            }
                            res.json({"msg":"1"});//注册成功
                        });

                        //req.session.username = username;
                    });
            });
        }
        /*db.insertOne("users",{
            "username":username,
            "pwd":pwd
        },(err,result)=>{
            if(err){
                res.json({"msg":"插入出错"});//服务器错误
                return
            }
            fs.rename(oldPath,newPath,(err)=>{
                //console.log(err);
                if(err){
                    res.json({"msg":"改名出错"});//改名错误
                    return
                }
                gm(newPath)
                    .crop(w, h, x, y)
                    .resize(200, 200)
                    .write(newPath, function (err) {
                        //console.log(err);
                        if (err) {
                            res.json({"msg":"裁剪出错"});//裁剪错误
                            return;
                        }

                        res.json({"msg":"1"});//注册成功
                        //req.session.username = username;
                    });
            });

        })*/
    })
};
//验证用户名是否存在
exports.findUser=function(req,res,next){
    var form=new formidable.IncomingForm();
    form.parse(req, function (err, fields,files) {
        if(err){
            res.json({"msg":"ajax传值出错"});//服务器错误
            return
        }
        var username=fields.username;
        db.find('users',{"username":username},(err,docs)=> {
            if (err) {
                res.json({"msg": "查询出错"});//服务器错误
                return
            }
            if (docs.length !== 0) {
                res.json({"msg": -1}); //被占用
            }else{
                res.json({"msg":1}); //用户名可以用
            }
        })
    });
};

//登陆
exports.doLogin=function(req,res,next){
    var form=new formidable.IncomingForm();
    form.parse(req, function (err, fields,files) {
        if(err){
            res.json({"msg":"ajax传值出错"});//服务器错误
            return
        }
        var username=fields.username;
        var pwd=fields.password;
        db.find('users',{"username":username},(err,docs)=> {
            if (err) {
                res.json({"msg": "查询出错"});//服务器错误
                return
            }
            if (docs.length === 0) {
                res.json({"msg": -1}); // 没找到用户
            }else{
                if(docs[0].pwd==pwd){
                    req.session.login = "1";
                    req.session.username=username;
                    var onlineUsers=require('../server.js');
                    for(let i=0;i<onlineUsers.length;i++){
                        if(onlineUsers[i].username==username){
                            res.json({"msg":-2}); //登陆失败
                            return
                        }
                    }
                    res.json({"msg":1}); //登陆成功
                }else{
                    res.json({"msg":-1}); //登陆失败
                }
            }
        })
    });
};

exports.isLogin=function(req,res,next){
    if(req.session.login!=1){
        res.json({"msg":-1}); //登陆失败
        return
    }
    db.find('users',{"username":req.session.username},(err,docs)=>{
        if(err){
            console.log('登录失败');
            return
        }
        res.json({"msg":1,"username":docs[0].username,"img":docs[0].img})
    });
};

/*exports.close=function(req,res,next){
    var username=req.query.username;
    for(var i=0;i<onlineUsers.length;i++){
        if(onlineUsers[i].username==username){
            onlineUsers.splice(i,1);
        }
    }
    res.send('走了');
};*/
//查询用户的头像
/*exports.findImage=function(username,callback){
    db.find('users',{"username":username},(err,docs)=>{
        callback(err,docs);
    });
};*/
