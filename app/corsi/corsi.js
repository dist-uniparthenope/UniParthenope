const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const modalViewModule = "modal-corsi/modal-corsi";
const appSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const frame = require("tns-core-modules/ui/frame");


let page;
let sideDrawer;
let items;
let esamiList;

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    page.getViewById("selected_col").col = "1";

    items = new ObservableArray();
    esamiList = page.getViewById("listview");
    let viewModel = Observable.fromObject({
        items:items
    });

    getCourses();

    global.getAllBadge(page);
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function getCourses() {
    let courses = global.freqExams;
    const act_sem = appSettings.getString("semestre");

    let x = 0;

    for (let i=0; i<courses.length; i++)
    {
        if (act_sem === "Secondo Semestre" && (courses[i].semestre === "S2" ||courses[i].semestre === "A2" || courses[i].semestre === "N/A"))
        {
            items.push({
                "anno": drawYear(courses[i].annoId),
                "esame": courses[i].nome,
                "prof": courses[i].docente,
                "data_inizio": "Dal " + courses[i].inizio,
                "data_fine": " al " + courses[i].fine,
                "ult_mod": courses[i].modifica,
                "adLogId": courses[i].adLogId
            });
            esamiList.refresh();
            x++;
        }
        else if (act_sem === "Primo Semestre" && (courses[i].semestre === "S1" || courses[i].semestre === "A1" || courses[i].semestre === "N/A"))
        {
            items.push({
                "anno": drawYear(courses[i].annoId),
                "esame": courses[i].nome,
                "prof": courses[i].docente,
                "data_inizio": "Dal " + courses[i].inizio,
                "data_fine": " al " + courses[i].fine,
                "ult_mod": courses[i].modifica,
                "adLogId": courses[i].adLogId
            });
            esamiList.refresh();
            x++;
        }
        else if (act_sem === undefined){
            items.push({
                "anno": drawYear(courses[i].annoId),
                "esame": courses[i].nome,
                "prof": courses[i].docente,
                "data_inizio": "Dal " + courses[i].inizio,
                "data_fine": " al " + courses[i].fine,
                "ult_mod": courses[i].modifica,
                "adLogId": courses[i].adLogId
            });
            esamiList.refresh();
            x++;
        }
        else
        {
            console.log(courses[i].nome + " :Esame non aggiunto al semestre attuale!!");
        }
    }

    appSettings.setNumber("examsBadge",x);
}

function drawYear(year) {
    if (year === 1)
        return "I";
    else if (year === 2)
        return "II";
    else if (year === 3)
        return "III";
    else
        return "SCE";
}

function onGeneralMenu() {
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;

    const adLogId = { adLogId: items.getItem(index).adLogId, esame: items.getItem(index).esame, docente: items.getItem(index).prof};

    mainView.showModal(modalViewModule, adLogId, false);
}

function drawTitle() {
    if (appSettings.getString("aa_accad") !== undefined)
        page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad");
    else
    {
        console.log("CORSI.AA_ACCAD = undefined (A.A non recuperato!)");
        page.getViewById("aa").text = "A.A. Non Disponibile";
    }

    if (appSettings.getString("semestre") !== undefined)
        page.getViewById("semestre").text = appSettings.getString("semestre");
    else
    {
        console.log("CORSI.SEMESTRE = undefined (Semestre non recuperato!)");
        page.getViewById("semestre").text = "Semestre Non Disponibile";
    }
}

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapFood = function(){
    const nav =

        {
            moduleName: "menu/menu",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapAppello = function(){
    const nav =
        {
            moduleName: "prenotazioni/prenotazioni",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.onItemTap = onItemTap;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
