/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import path from 'path';

export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run([templateFile = '', tVar]) {
        if (THINK.isEmpty(templateFile)) {//根据group, controller, action自动生成
            templateFile = [
                THINK.APP_PATH, '/',
                this.http.group,
                '/View/',
                THINK.config('tpl_default_theme') || 'default',
                '/',
                this.http.controller.toLowerCase(),
                THINK.config('tpl_file_depr'),
                this.http.action.toLowerCase(),
                THINK.config('tpl_file_suffix')
            ].join('');
        } else {
            templateFile = templateFile + '';
            if (templateFile.indexOf('./') === 0) {//相对路径解析
                templateFile = path.resolve(path.normalize(templateFile));
            } else if (templateFile.indexOf('/') > 0){//模块式访问 group/controller/view
                let tplPath = templateFile.split('/');
                let action = tplPath.pop().toLowerCase();
                let controller = tplPath.pop().toLowerCase() || this.http.controller.toLowerCase();
                let group = THINK.ucFirst(tplPath.pop() || this.http.group);
                templateFile = [
                    THINK.APP_PATH,
                    '/',
                    group,
                    '/View/',
                    THINK.config('tpl_default_theme') || 'default',
                    '/',
                    controller,
                    THINK.config('tpl_file_depr'),
                    action,
                    THINK.config('tpl_file_suffix')
                ].join('');
            }
        }

        this.http.templateFile = templateFile;
        return Promise.resolve();
    }
}
