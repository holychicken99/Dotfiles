"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentSyntax = exports.Configuration = void 0;
class Configuration {
}
exports.Configuration = Configuration;
/*-------------------------------------------------------------------------
 * docomment
 *-----------------------------------------------------------------------*/
Configuration.KEY_DOCOMMENT = 'docomment';
Configuration.SYNTAX = 'syntax';
Configuration.ACTIVATE_ON_ENTER = 'activateOnEnter';
Configuration.ADVANCED = 'advanced';
/*-------------------------------------------------------------------------
 * files
 *-----------------------------------------------------------------------*/
Configuration.KEY_FILES = 'files';
Configuration.EOL = 'eol';
/*-------------------------------------------------------------------------
 * editor
 *-----------------------------------------------------------------------*/
Configuration.KEY_EDITOR = 'editor';
Configuration.INSERT_SPACES = 'insertSpaces';
Configuration.DETECT_IDENTATION = 'detectIndentation';
var CommentSyntax;
(function (CommentSyntax) {
    CommentSyntax["single"] = "single";
    CommentSyntax["delimited"] = "delimited";
})(CommentSyntax = exports.CommentSyntax || (exports.CommentSyntax = {}));
//# sourceMappingURL=Configuration.js.map