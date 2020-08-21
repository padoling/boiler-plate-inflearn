const express = require('express')  // express 모듈 가져옴
const app = express()   // 새로운 express app 생성
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key')
const { User } = require('./models/User')

// application/x-www-form-urlencoded 데이터를 파싱
app.use(bodyParser.urlencoded({extended: true}));
// application/json 데이터를 파싱
app.use(bodyParser.json());
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
app.post('/register', (req, res) => {
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

app.post('/login', (req, res) => {
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

// 해당 port의 연결을 listen하면 콜백함수를 리턴함
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})