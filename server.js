/**
 * Created by Administrator on 2017/8/9.
 */
var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var routers=require('./router/routers.js');
var session = require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


app.post('/doRegister',routers.doRegister);
app.post('/findUser',routers.findUser);
app.post('/doLogin',routers.doLogin);
app.post('/isLogin',routers.isLogin);


app.use(express.static("public"));

//在线用户
var onlineUsers = [];
module.exports=onlineUsers;
/*//当前在线人数
var onlineCount = 0;*/
io.on('connection',(socket)=>{

    socket.on('login',(obj)=>{
        socket.name=obj.username;
        onlineUsers.push(obj);
        io.emit('login',onlineUsers);
        io.emit('user',obj.username+'来了');
        console.log(onlineUsers);
    });
    socket.on('msg',(obj)=>{
        io.emit('msg',obj);
    });
    //监听用户退出
    socket.on('disconnect', function() {
        //将退出的用户从在线列表中删除
        for(var i=0;i<onlineUsers.length;i++){
            if(onlineUsers[i].username==socket.name){
                onlineUsers.splice(i,1);
            }
        }
        io.emit('login',onlineUsers);
        io.emit('user',socket.name+'走了');
    });
});


http.listen(80,'127.0.0.1',(err)=>{
    console.log('服务器启动成功');
});
