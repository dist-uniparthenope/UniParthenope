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
            let result = response.content.toJSON();
            result = result.response;
            console.log(result);
            if (result.statusCode === 401 || result.statusCode === 500)
            {
                dialogs.alert({
                    title: "Autenticazione Fallita!",
                    message: result.retErrMsg,
                    okButtonText: "OK"
                });
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
//TODO Social Buttons
//TODO Notizie
//TODO Trasporti
//TODO Ateneo
//TODO Convenzioni
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
