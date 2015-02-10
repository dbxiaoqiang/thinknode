/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <ric3000(at)163.com>
 * @license    CC BY-NC-ND
 * @version    14/10/31
 */
module.exports = Controller("Common/AdminBaseController", function () {
    "use strict";
    return {

        publicIndexAction: function () {
            var self = this;
            var info = [];
            var username = '';
            return this.session("userInfo").then(function (user) {
                return Promise.all([self.getDbVersion(),X("Admin/AdminMenu",user.id).getAdminMenu()]).then(function (data) {
                    if(user){
                        username = user.nickname ? user.nickname : user.username;
                    }
                    var os = thinkRequire("os");
                    info.platform = os.platform();
                    info.nodeVersion = process.version;
                    info.serverTime = new Date().Format('YYYY-MM-DD HH:mi:ss');
                    info.runTime = 'Node.js';
                    info.dbVersion = data[0][0].ver;
                    info.version = C("app_version");
                    info.versionCode = C("app_version_code");

                    self.assign("adminMenu",data[1]);
                    self.assign("username", username);
                    self.assign("info", info);
                    return self.display();
                });
            });
        },

        getDbVersion: function () {
            if(C("db_type") == "mysql"){
                return M().query("SELECT version() AS ver");
            }else{
                return "";
            }

        }
    };
});