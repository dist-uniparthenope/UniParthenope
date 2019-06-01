const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
const frame = require("tns-core-modules/ui/frame");
const httpModule = require("http");
const base64= require('base-64');
const utf8 = require('utf8');
const dialogs = require("tns-core-modules/ui/dialogs");

let page;
let viewModel;
let sideDrawer;
let remember;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    remember = appSettings.getBoolean("rememberMe");
   if (!global.isConnected)
        autoconnect();
   else if (remember)
   {
       const nav =
           {
               moduleName: "userCalendar/userCalendar",
               clearHistory: true
           };
       frame.topmost().navigate(nav);
   }


    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
function autoconnect()
{
    console.log("REMEMBER= "+remember);
    if (remember){
        const sideDrawer = app.getRootView();
        let indicator = page.getViewById("activityIndicator");
        indicator.visibility = "visible";
        let user = appSettings.getString("username");
        let pass = appSettings.getString("password");
        console.log("USERNAME (old)= "+user);
        let token = user + ":" + pass;
        var bytes = utf8.encode(token);
        global.encodedStr = base64.encode(bytes);

        httpModule.request({
            url:  global.url + "login/" + global.encodedStr,
            method: "GET"
        }).then((response) => {
            let _result = response.content.toJSON();
            let result = _result.response;

            if(_result.statusCode === 401)
            {
                dialogs.alert({
                    title: "Autenticazione Fallita!",
                    message: _result.errMsg,
                    okButtonText: "OK"
                }).then(
                    args.object.closeModal()
                );
            }
            /* Se un utente è di tipo USER TECNICO (ristorante) */
            else if (_result.statusCode === 600)
            {
                let remember = sideDrawer.getViewById("rememberMe").checked;
                console.log("UserTecnico:" + _result.username);
                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("password",pass);
                    appSettings.setBoolean("rememberMe",true);
                }
                sideDrawer.getViewById("topName").text = _result.username;
                let userForm = sideDrawer.getViewById("userTecnico");
                let loginForm = sideDrawer.getViewById("loginForm");
                loginForm.visibility = "collapsed";
                userForm.visibility = "visible";

                const nav =
                    {
                        moduleName: "usertecnico/usertecnico",
                        clearHistory: true
                    };
                frame.topmost().navigate(nav);
            }
            else
            {
                let carriere = result.user.trattiCarriera;
                global.saveInfo(result);

                let index = appSettings.getNumber("carriera");
                global.saveCarr(carriere[index]);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                sideDrawer.getViewById("topName").text = nome + " " + cognome;
                let grpDes = appSettings.getString("grpDes");
                if (grpDes === "Studenti")
                {
                    let userForm = sideDrawer.getViewById("userForm");
                    let loginForm = sideDrawer.getViewById("loginForm");
                    loginForm.visibility = "collapsed";
                    userForm.visibility = "visible";
                    indicator.visibility = "collapsed";
                    const nav =
                        {
                            moduleName: "userCalendar/userCalendar",
                            clearHistory: true
                        };
                    frame.topmost().navigate(nav);
                }
            }

        },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Autenticazione Fallita!",
                message: e.retErrMsg,
                okButtonText: "OK"
            });
        });
        indicator.visibility = "collapsed";
    }
}

exports.onTapNotizie = function(){
  page.frame.navigate("notizie/notizie");
};

exports.onTapTrasporti = function(){
    page.frame.navigate("usertecnico/usertecnico");
};

exports.onTapAteneo = function(){
    const nav =
        {
            moduleName: "portale/portale",
            context: {link:"https://www.uniparthenope.it/"}
        };
        page.frame.navigate(nav);

};

exports.onTapDipartimento = function(){
    const nav =
        {
            moduleName: "portale/portale",
            context: {link:"http://www.scienzeetecnologie.uniparthenope.it/index.html"}
        };
    page.frame.navigate(nav);

};

//TODO Social Buttons
//TODO Trasporti
//TODO Ateneo
//TODO Convenzioni
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
