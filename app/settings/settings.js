const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    let remember = appSettings.getBoolean("rememberMe",false);

    if (global.isConnected) //If im logged in, show user settings
    {
        page.getViewById("appello_futuro").visibility = "visible";
    }

    if (remember)
        page.getViewById("deleteBtn").visibility = "visible";
    else
        page.getViewById("deleteBtn").visibility = "collapsed";

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

function onTapDelete(){
    dialogs.confirm({
        title: "Rimozione Account",
        message: "Dimenticare tutti i dati?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        if (result){
            global.clearAll();
            sideDrawer.getViewById("userForm").visibility="collapsed";
            sideDrawer.getViewById("userDocente").visibility="collapsed";
            sideDrawer.getViewById("userTecnico").visibility="collapsed";
            sideDrawer.getViewById("userAdmin").visibility="collapsed";
            sideDrawer.getViewById("topName").text = "Benvenuto!";
            sideDrawer.getViewById("loginForm").visibility="visible";
            //Default foto (se aggiunta)
            page.getViewById("deleteBtn").visibility = "collapsed";

            page.frame.navigate("home/home-page");
        }
    });
}
exports.onTapDelete = onTapDelete;

// Check per mostrare nella pagina APPELLI.JS anche gli appelli non ancora prenotabili, ma disponibili.
function onSwitchLoaded_appello(args) {
    page.getViewById("switch_appello").checked = appSettings.getBoolean("esami_futuri",false);
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean("esami_futuri",isChecked);
    });
}
exports.onSwitchLoaded_appello = onSwitchLoaded_appello;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
