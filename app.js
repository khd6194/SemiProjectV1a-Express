// express 모듈과 기타 미들웨어 모듈 사용 선언
const express = require('express');
const path = require('path');
const logger = require('morgan');
const {engine} = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session')
const oracledb = require('./models/Oracle');

// 라우팅 설정 모듈화
const indexRouter = require('./routes/index');
const memberRouter = require('./routes/member');
const boardRouter = require('./routes/board');

// express 객체 생성 및 포트 변수 선언
const app = express();
const port = process.env.PORT || 3000;

app.engine('hbs',engine({
    extname: '.hbs', defaultLayout : 'layout',
    helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections = {}
            this._sections[name] = options.fn(this)
            return null
        },
    },
}));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');

// 세션
const maxAge = 1000 * 30;
const sessionObj = {resave: false, saveUninitialized: false,
    // secret: process.env.COOKIE_SECRET,
    secret: 'process.env.COOKIE_SECRET',
    cookie: { httpOnly: true, secure: false, },
    name: 'session-cookie',
    maxAge: maxAge
};
app.use(session(sessionObj));

//라우팅 없이 바로 호출 가능하도록 static 폴더 설정
app.use(express.static(path.join(__dirname,'static')));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json());
oracledb.initConn();

// 생성한 세션을 모든 페이지에서 접근 가능하게 함
app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});

app.use(logger('dev'));

// 라우팅 모듈 등록 - 클라이언트 요청 처리 핵심 파트
app.use('/',indexRouter);
app.use('/',memberRouter);
app.use('/',boardRouter);

// 기타 라우팅 처리 - 404 응답코드
app.use((req,res)=>{
    res.status(404);
    res.sendFile(path.join(__dirname,'public','404.html'));
});
// 기타 라우팅 처리 - 500 응답코드
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500);
    res.sendFile(path.join(__dirname,'public','500.html'));
});

// 위에서 설정한 사항을 토대로 express 서버 실행
app.listen(port,()=>{
    console.log('SemiProjectV1 서버 실행중...');
})
