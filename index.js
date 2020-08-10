const express = require('express')  // express 모듈 가져옴
const app = express()   // 새로운 express app 생성
const port = 5000
const bodyParser = require('body-parser')

const config = require('./config/key')
const { User } = require('./models/User')

// application/x-www-form-urlencoded 데이터를 파싱
app.use(bodyParser.urlencoded({extended: true}));
// application/json 데이터를 파싱
app.use(bodyParser.json());

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

// 해당 port의 연결을 listen하면 콜백함수를 리턴함
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})