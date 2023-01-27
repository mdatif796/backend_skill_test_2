# backend_skill_test_2

## This project needs Redis server ##
# steps to run this code on your local system
1. open console and go to the directory of your file
2. write "npm install" and then enter
3. create .env file in the root folder of the directory and add your value as
    * DATABASE_PASS={your database password}
    * MONGO_USER={your mongodb user name}
    * MONGO_DATABASE={your db name}
    * JWTSECRETKEY={your jwt secret}
    * SESSIONSECRETKEY={Your session secret key}
    * CLIENTID={Your client id of google oauth}
    * CLIENTSECRET={Your client secret of google oauth}
    * CALLBACKURL={Your callback url}
    * EMAILPASS={Your email password from which you are sending mail}
    * CAPTCHA_SITE_KEY={Your google captcha site key}
    * CAPTCHA_SECRET_KEY={Your google captcha secret key}
4. and then write "npm start" and then enter, it will start the server on port 8000.
