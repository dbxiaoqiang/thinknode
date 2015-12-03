/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <ric3000(at)163.com>
 * @license    MIT
 * @version    15/1/15
 */
import path from 'path';

global.THINK = {};
//网站根目录
THINK.ROOT_PATH = path.dirname(__dirname);
//开启调试模式，线上环境需要关闭调试功能
THINK.APP_DEBUG = true;
//加载框架
require('thinknode');