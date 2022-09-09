const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.use('/public', express.static('public'));

MongoClient.connect(
  'mongodb+srv://minjung:dlalswjd8033!@cluster0.ps57gw4.mongodb.net/?retryWrites=true&w=majority',
  function (에러, client) {
    if (에러) {
      return console.log(에러);
    }

    db = client.db("todoapp");

    app.listen(4000, function () {
      console.log("listening on 4000");
    });
  }
);

// FIRST PAGE 불러오기
app.get("/", function (요청, 응답) {
  응답.render("index.ejs");
});

// WRITING PAGE 불러오기
app.get("/write", function (요청, 응답) {
  응답.render("write.ejs");
});

// MAIN BOARD PAGE 불러오기
app.get("/list", function (요청, 응답) {
  db.collection("post").find().toArray(function (에러, 결과) {
      console.log(결과);
      응답.render("list.ejs", { posts: 결과 });
    });
});

// DETAIL PAGE 불러오기
app.get('/detail/:id', function(요청, 응답){
  db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
      console.log(결과);
      응답.render('detail.ejs', { data : 결과})
  });
});

// EDITING PAGE 불러오기
app.get('/edit/:id', function(요청, 응답){
  db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
    console.log(결과);
    응답.render('edit.ejs', { post : 결과})
  });
});

app.put('/edit', function(요청, 응답){
  db.collection('post').updateOne({ _id: parseInt(요청.body.id) }, {$set : { 할일: 요청.body.title, 날짜: 요청.body.date }}, function(에러, 결과){
    console.log(결과);
    응답.redirect('/list');
  });
});


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// LOGIN PAGE 불러오기
app.get('/login', function(요청, 응답){
  응답.render('login.ejs');
});

// SIGN UP PAGE 불러오기
app.get('/signup', function(요청, 응답){
  응답.render('signup.ejs');
});

app.post('/signup', function(요청, 응답){
  db.collection('login').insertOne({id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
    if (에러) {
      return console.log(에러);
    } else {
      console.log(결과);
      응답.redirect('/login');
    }
  })
});


// 로그인 시도를 할 경우 passport는 성공여부와 관계없이 session을 생성함.
// 해당 session에 object 형식으로 message라는 키와 각 조건에 맞는 value가 추가 됨.
passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
    if (!결과) return done(null, false, { message: '회원가입 해주세요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '유효하지 않은 비밀번호입니다.' })
    }
  })
}));


// PASSPORT
passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(아이디, done){
  db.collection('login').findOne({id: 아이디}, function(에러, 결과){
    done(null, 결과)
  })
});


//로그인하지 않고 mypage로 넘어갈 시 로그인화면으로 보내기
app.get('/mypage', 로그인했니, function(요청, 응답){
  console.log(요청.user);
  응답.render('mypage.ejs', 사용자 = 요청.user);
});

function 로그인했니(요청, 응답, next){
  if(요청.user){
    next();
  }else{
    응답.redirect('/login');
  }
}



app.post('/register', function(요청,응답) {
  db.collection('login').insertOne({id:요청.body.id, pw: 요청.body.pw}, function(에러, 결과) {
    응답.redirect('/login')
  })
})

app.post("/add", function (요청, 응답) {
  // 응답.send("전송완료");
  db.collection("counter").findOne({ name: "게시물갯수" }, function (에러, 결과) {
      console.log(결과.totalPost);
      var 총게시물갯수 = 결과.totalPost;

      var 저장할거 = { _id: 총게시물갯수 + 1, 할일: 요청.body.title, 날짜: 요청.body.date, 작성자: 요청.user._id }

      db.collection("post").insertOne(
        저장할거,
        function (에러, 결과) {
          console.log("저장완료");
          db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
              if (에러) {
                return console.log(에러);
              } else {
                console.log(결과);
                응답.redirect('/list');
              }
            });
        });
    });
});



app.delete('/delete', function(req, res) {
  console.log('삭제요청들어옴')
  console.log(req.body);
  req.body._id = parseInt(req.body._id);

  var 삭제할데이터 = {_id : req.body._id, 작성자 : req.user._id}

  //req.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
  db.collection('post').deleteOne(삭제할데이터, function(에러, 결과) {
      console.log('삭제완료');
      if (결과) {console.log(결과)}
      res.status(200).send({ message : '성공했습니다' });
  })
});




// 사용자가 /login에서 로그인을 시도할 경우 session에 정보가 저장되는데
// 아래 코드에서는 info가 세션정보임.
// console로 info를 출력해보면 쿠키를 비롯해 로그인 시도 결과에 대해서 message로 알려줌. 성공시에는 undefined.
// info.message에는 로그인에 실패한 이유가 담기게 되고, 이 결과를 각 조건에 맞게 alert 창이나 html에 추가해 뿌려주면 됨.
app.post('/login', function (요청, 응답, next) {
  passport.authenticate('local', function (에러, user, info) {
      console.log('info', info);
      if (에러) {
          return next(에러);
      }
      if (!user) {
          요청.session.save(function () {
            응답.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            응답.write(`<script>alert(' ${info.message} ')</script>`);
            응답.write("<script>window.location=\"/login\"</script>");
          });
          return;
      }
      요청.logIn(user, function (에러) {
          if (에러) { return next(에러); }
          요청.session.save(function () {
              응답.redirect('/mypage');
          });
      });
  })(요청, 응답, next);
});


// LOGOUT
app.get('/logout', function(req,res){
  console.log('logout')
  req.logout(function(에러) {
    if(에러) {
      return next(에러)
    } req.session.destroy(function(){
      res.cookie('connect.sid','',{maxAge:0})
      res.redirect('/');
    })
  });
});


