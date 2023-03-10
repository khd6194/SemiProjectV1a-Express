const oracledb = require('../models/Oracle');

let membersql = {insertsql : 'insert into member(mno,userid,passwd,name,email)values (mno.nextval,:1,:2,:3,:4)',
                loginsql : 'select count(userid) cnt from member where userid = :1 and passwd = :2',
                selectOne : "select userid,passwd,name,email,to_char(regdate,'YYYY-MM-DD HH24:MI:SS')regdate from member where userid = :1 "
}
// sql 자리에 membersql.insertsql이라고 작서하면 적용됨
class Member{
    constructor(userid,passwd,name,email) {
        // insertsql = 'insert into member(mno,userid,passwd,name,email)values (mno.nextval,:1,:2,:3,:4)'
        //  sql 자리에 this.insertsql이라고 작서하면 적용됨
        // 이렇게 쓰니 할때마다 출력되서 지저분해보임

        this.userid = userid
        this.passwd = passwd
        this.name = name
        this.email = email
    }

    async insert () {
        let conn = null;
        // let sql = 'insert into member(mno,userid,passwd,name,email)values (mno.nextval,:1,:2,:3,:4)'
        let params = [this.userid,this.passwd,this.name,this.email]
        try{
            conn = await oracledb.makeConn();
            let result = await conn.execute(membersql.insertsql,params);
            if (result.rowsAffected > 0) {console.log('회원정보 저장 성공')}//동작 확인용
            await conn.commit();
            // commit;이라고 작성해도 동작은 하지만
            // commit();으로 작성하지 않으면 값이 들어가더라도 데이터베이스에 저장이 되지않는다
            console.log(result)
        }catch(e){console.log(e)}
        finally {
          await oracledb.closeConn(conn)
            console.log('오라클db 접속 종료')
        }

    }
    async login(uid,pwd) { // 로그인 처리
        let conn = null;
        let params = [uid,pwd];
        let islogin = 0;

        try {
            conn = await oracledb.makeConn();
            let result = await conn.execute(membersql.loginsql,params,oracledb.options)

            let rs = result.resultSet
            let row = null;
            while((row = await rs.getRow())){
                islogin = row.CNT
            }
        }
        catch (e){ console.log(e); }
        finally { await oracledb.closeConn(conn); }

        return islogin;
    }
    async selectOne(uid){
        let conn = null;
        let params = [uid];
        let isLogin = [];

        try {
            conn = await oracledb.makeConn();
            let result = await conn.execute(membersql.selectOne,params,oracledb.options);

            let rs = result.resultSet;
            let row = null;
            while ((row = await rs.getRow())){
                let info = new Member(row.USERID,null,row.NAME,row.EMAIL)
                info.regdate = row.REGDATE
                //info 안에 row.REGDATE를 작성했지만 인식을 하지못했다
                //regdate를 인식 시키기 위해서 따로 뽑아서 값을 저장
              isLogin.push(info)
            }
        }catch(e){console.log(e)}
        finally {await oracledb.closeConn()}
        return await isLogin;
    }
}
module.exports = Member;