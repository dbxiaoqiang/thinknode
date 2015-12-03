/**
 * 定位模版路径
 * @return {[type]} [description]
 */
import path from 'path';

export default class extends THINK.Behavior {
    init(http) {
        this.http = http;
    }

    run(templateFile = '') {
        if (!templateFile) {//根据group, controller, action自动生成
            templateFile = [
                THINK.APP_PATH, '/',
                this.http.group,
                '/View/',
                C('tpl_default_theme') || 'default',
                '/',
                this.http.controller.toLowerCase(),
                C('tpl_file_depr'),
                this.http.action.toLowerCase(),
                C('tpl_file_suffix')
            ].join('');
        } else if (templateFile.indexOf('./') > -1) {//相对路径解析
            templateFile = path.resolve(path.normalize(templateFile));
        } else if (templateFile.indexOf('/') > 0){//模块式访问 group/controller/view
            let path = templateFile.split('/');
            let action = path.pop();
            let controller = path.pop() || this.http.controller.toLowerCase();
            let group = ucfirst(path.pop() || this.http.group);
            templateFile = [
                THINK.APP_PATH,
                '/',
                group,
                '/View/',
                C('tpl_default_theme') || 'default',
                '/',
                controller,
                C('tpl_file_depr'),
                action,
                C('tpl_file_suffix')
            ].join('');
        }

        return templateFile;
    }
}