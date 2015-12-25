#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var program = require('commander');

var cwd = process.cwd();
var templatePath = path.dirname(__dirname) + '/template';
var projectRootPath = './'; //project root path
var APP_PATH = cwd + '/' + projectRootPath + '/src';

/**
 * get date time
 * @return {} []
 */
var getDateTime = function(){
    var fn = function(d) {
        return ('0' + d).slice(-2);
    };
    var d = new Date();
    var date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
    var time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
    return date + ' ' + time;
};

var isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
    return stats.isFile();
};

var isBoolean = function (obj) {
    return toString.call(obj) === '[object Boolean]';
};

var isDir = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
    return stats.isDirectory();
};

var chmod = function (p, mode) {
    mode = mode || '0777';
    if (!fs.existsSync(p)) {
        return true;
    }
    return fs.chmodSync(p, mode);
};

/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
var mkdir = function (p, mode) {
    mode = mode || '0777';
    if (fs.existsSync(p)) {
        chmod(p, mode);
        return true;
    }
    var pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    } else {
        mkdir(pp, mode);
        mkdir(p, mode);
    }
    return true;
};

/**
 * get version
 * @return {String} []
 */
var getVersion = function(){
    var filepath = path.resolve(__dirname, '../package.json');
    var version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
};

/**
 * get app root path
 * @return {} []
 */
var getProjectAppPath = function(){
    var path = projectRootPath;
    path += 'src';
    return path;
};

/**
 * get app name
 * @return {} []
 */
var getAppName = function(){
    var filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
    var matched = filepath.match(/([^\/]+)\/?$/);
    return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
var copyFile = function(source, target, replace, showWarning){

    if(showWarning === undefined){
        showWarning = true;
    }

    if(isBoolean(replace)){
        showWarning = replace;
        replace = '';
    }

    //if target file is exist, ignore it
    if(isFile(target)){
        if(showWarning){
            console.log('exist' + ' : ' + path.normalize(target));
        }
        return;
    }

    mkdir(path.dirname(target));

    //if source file is not exist
    if(!isFile(templatePath + '/' + source)){
        return;
    }

    var content = fs.readFileSync(templatePath + '/' + source, 'utf8');
    //replace content
    if(replace){
        for(var key in replace){
            while(true){
                var content1 = content.replace(key, replace[key]);
                if(content1 === content){
                    content = content1;
                    break;
                }
                content = content1;
            }
        }
    }

    fs.writeFileSync(target, content);
    console.log('create' + ' : ' + path.normalize(target));
};

/**
 * check is thinkjs app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
var isThinkApp = function(projectRootPath){
    if(isDir(projectRootPath)){
        var filepath = projectRootPath + '.thinksrc';
        if(isFile(filepath)){
            return true;
        }
    }
    return false;
};

/**
 * is module exist
 * @param  {String}  module []
 * @return {Boolean}        []
 */
var isModuleExist = function(module){
    var modelPath = projectRootPath + 'src/' + module;
    return isDir(modelPath);
};

/**
 * check env
 * @return {} []
 */
var _checkEnv = function(){
    if(!isThinkApp('./')){
        console.log();
        console.log('current path is not thinknode project.');
        process.exit();
    }
    console.log();
};

var createProject = function () {
    if(isThinkApp(projectRootPath)){
        console.log('path `' + projectRootPath + '` is already exist');
        process.exit();
    }
    mkdir(projectRootPath);

    copyFile('package.json', projectRootPath + 'package.json');
    copyFile('.thinksrc', projectRootPath + '.thinksrc', {
        '<createAt>': getDateTime()
    });

    mkdir(cwd + '/' + projectRootPath + 'App');

    var ROOT_PATH = cwd + '/' + projectRootPath + 'www';
    mkdir(ROOT_PATH);
    copyFile('pm2.json', projectRootPath + 'pm2.json', {
        '<ROOT_PATH>': path.dirname(ROOT_PATH),
        '<APP_NAME>': getAppName()
    });

    copyFile('README.md', projectRootPath + 'README.md');

    copyFile('www/index.js', projectRootPath + 'www/index.js');

    var APP_PATH = cwd + '/' + projectRootPath + '/src';

    console.log('create' + ' : ' + APP_PATH + '/Common');
    mkdir(APP_PATH + '/Common');
    mkdir(APP_PATH + '/Common/Common');
    mkdir(APP_PATH + '/Common/Conf');
    mkdir(APP_PATH + '/Common/Controller');
    mkdir(APP_PATH + '/Common/Logic');
    mkdir(APP_PATH + '/Common/Model');
    mkdir(APP_PATH + '/Common/Service');
    copyFile('config.js', APP_PATH + '/Common/Conf/config.js');

    console.log('create' + ' : ' + APP_PATH + '/Home');
    mkdir(APP_PATH + '/Home');
    mkdir(APP_PATH + '/Home/Config');
    mkdir(APP_PATH + '/Home/Controller');
    mkdir(APP_PATH + '/Home/Logic');
    mkdir(APP_PATH + '/Home/Model');
    mkdir(APP_PATH + '/Home/Service');
    mkdir(APP_PATH + '/Home/View/default');
    copyFile('IndexController.js', APP_PATH + '/Home/Controller/IndexController.js');
    mkdir(cwd + '/' + projectRootPath + '/App/Home/View');

    mkdir(projectRootPath + 'www/static/');
    mkdir(projectRootPath + 'www/static/js');
    mkdir(projectRootPath + 'www/static/css');
    mkdir(projectRootPath + 'www/static/img');

    console.log();
    console.log('  enter path:');
    console.log('  $ cd ' + projectRootPath);
    console.log();

    console.log('  install dependencies:');
    console.log('  $ npm install');
    console.log();

    console.log('  run the app:');
    console.log('  $ npm start');

    console.log();
};

var createModule = function (module) {
    _checkEnv();

    if(isModuleExist(module)){
        return console.log('module `' + module + '` is exist.\n');
        process.exit();
    }

    console.log('create' + ' : ' + APP_PATH + '/' + module);
    mkdir(APP_PATH + '/' + module);
    mkdir(APP_PATH + '/' + module +'/Config');
    mkdir(APP_PATH + '/' + module +'/Controller');
    mkdir(APP_PATH + '/' + module +'/Logic');
    mkdir(APP_PATH + '/' + module +'/Model');
    mkdir(APP_PATH + '/' + module +'/Service');
    mkdir(APP_PATH + '/' + module +'/View');
    mkdir(APP_PATH + '/' + module +'/View/default');
    copyFile('IndexController.js', APP_PATH + '/' + module +'/Controller/IndexController.js');
    console.log();
};

var createController = function (controller) {
    _checkEnv();

    var module = 'Common';
    controller = controller.split('/');
    if(controller.length === 2){
        module = controller[0];
        controller = controller[1];
    }else{
        controller = controller[0];
    }

    if(!isModuleExist(module)){
        createModule(module);
    }

    copyFile('IndexController.js', APP_PATH + '/' + module +'/Controller/'+ controller +'Controller.js');
    console.log();
};

var createModel = function (model) {
    _checkEnv();

    var module = 'Common';
    model = model.split('/');
    if(model.length === 2){
        module = model[0];
        model = model[1];
    }else{
        model = model[0];
    }

    if(!isModuleExist(module)){
        createModule(module);
    }

    copyFile('Model.js', APP_PATH + '/' + module +'/Model/'+ model +'Model.js');
    console.log();
};

var createLogic = function (logic) {
    _checkEnv();

    var module = 'Common';
    logic = logic.split('/');
    if(logic.length === 2){
        module = logic[0];
        logic = logic[1];
    }else{
        logic = logic[0];
    }

    if(!isModuleExist(module)){
        createModule(module);
    }

    copyFile('Logic.js', APP_PATH + '/' + module +'/Logic/'+ logic +'Logic.js');
    console.log();
};

var createService = function (service) {
    _checkEnv();

    var module = 'Common';
    service = service.split('/');
    if(service.length === 2){
        module = service[0];
        service = service[1];
    }else{
        service = service[0];
    }

    if(!isModuleExist(module)){
        createModule(module);
    }

    copyFile('Service.js', APP_PATH + '/' + module +'/Service/'+ service +'Service.js');
    console.log();
};


var createBehavior = function (behavior) {
    _checkEnv();

    var module = 'Common';
    behavior = behavior.split('/');
    if(behavior.length === 2){
        module = behavior[0];
        behavior = behavior[1];
    }else{
        behavior = behavior[0];
    }

    if(!isModuleExist(module)){
        createModule(module);
    }

    copyFile('Behavior.js', APP_PATH + '/' + module +'/Behavior/'+ behavior +'Behavior.js');
    console.log();
};

program.version(getVersion()).usage('[command] <options ...>');
//create project
program.command('new <projectPath>').description('create project').action(function(projectPath){
    projectRootPath = path.normalize(projectPath + '/');
    createProject();
});

//create module
program.command('module <moduleName>').description('add module').action(function(module){
    createModule(module);
});

//create controlelr
program.command('controller <controllerName>').description('add controller').action(function(controller){
    createController(controller);
});

//create service
program.command('service <serviceName>').description('add service').action(function(service){
    createService(service);
});

//create model
program.command('model <modelName>').description('add model').action(function(model){
    createModel(model);
});

//create service
program.command('logic <serviceName>').description('add logic').action(function(logic){
    createLogic(logic);
});

//create behavior
program.command('behavior <behaviorName>').description('add behavior').action(function(behavior){
    createBehavior(behavior);
});

program.parse(process.argv);