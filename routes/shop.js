var router = require('express').Router();

function 로그인했니(요청, 응답, next){
    if(요청.user){
      next();
    }else{
      응답.send('로그인 안하셨는데요?');
    }
  }

//미들웨어를 하나하나 쓰지 않고 한 번에 모두 적용시키는 방법
router.use(로그인했니);

router.get('/shirts', function(req, res) {
    res.send('셔츠 파는 페이지입니다.');
});
  
router.get('/pants', function(req, res) {
    res.send('바지 파는 페이지입니다.');
});

module.exports = router;