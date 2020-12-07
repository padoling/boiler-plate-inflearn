const express = require('express')  // express 모듈 가져옴
const app = express()   // 새로운 express app 생성
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key')
const { User } = require('./models/User')
const { auth } = require('./middleware/auth')

// application/x-www-form-urlencoded 데이터를 파싱
app.use(bodyParser.urlencoded({extended: true}));
// application/json 데이터를 파싱
app.use(bodyParser.json());
// cookie에 정보 저장하기 위한 라이브러리
app.use(cookieParser());

// mongoose로 mongoDB에 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

// '/'로 접속하면 아래 응답을 전송함
app.get('/', (req, res) => {
    res.send('Hello World!~~~하이~~~~')
})

// 회원가입 엔드포인트
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) {
            return res.json({ success: false, err })
        }
        return res.status(200).json({
            success: true
        })
    })
})

// 로그인 엔드포인트
app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 db에서 조회
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message : "이메일에 해당하는 유저가 없습니다."
            })
        }
        // 이메일이 존재한다면 비밀번호 일치하는지 검사
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({ 
                    loginSuccess: false, 
                    message: "비밀번호가 틀렸습니다."
                })
            }
            // 비밀번호도 일치하다면 토큰 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                // 토큰을 저장(cookie, localStorage 등)
                return res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// 인증 엔드포인트
app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해왔다는 얘기는 auth가 true라는 의미
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findByIdAndUpdate({ _id: req.user._id }, 
        { token: "" }, 
        (err, user) => {
            if(err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
    })
})


// 해당 port의 연결을 listen하면 콜백함수를 리턴함
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})