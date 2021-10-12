"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigAdvancedCSharp = exports.Attribute = void 0;
var Attribute;
(function (Attribute) {
    Attribute["summary"] = "summary";
    Attribute["param"] = "param";
    Attribute["typeparam"] = "typeparam";
    Attribute["returns"] = "returns";
    Attribute["value"] = "value";
})(Attribute = exports.Attribute || (exports.Attribute = {}));
class ConfigAdvancedCSharp {
    static GetInline(advanced, codeType) {
        if (!advanced.hasOwnProperty(ConfigAdvancedCSharp.KEY))
            return true;
        if (!advanced[ConfigAdvancedCSharp.KEY].hasOwnProperty(codeType))
            return true;
        if (!advanced[ConfigAdvancedCSharp.KEY][codeType].hasOwnProperty(ConfigAdvancedCSharp.INLINE))
            return true;
        return advanced[ConfigAdvancedCSharp.KEY][codeType][ConfigAdvancedCSharp.INLINE];
    }
    static HasAttribute(advanced, codeType, attribute) {
        if (!advanced.hasOwnProperty(ConfigAdvancedCSharp.KEY))
            return true;
        if (!advanced[ConfigAdvancedCSharp.KEY].hasOwnProperty(codeType))
            return true;
        if (!advanced[ConfigAdvancedCSharp.KEY][codeType].hasOwnProperty(ConfigAdvancedCSharp.ATTRIBUTES))
            return true;
        const attributes = advanced[ConfigAdvancedCSharp.KEY][codeType][ConfigAdvancedCSharp.ATTRIBUTES];
        return 0 <= attributes.findIndex(x => x === attribute);
    }
}
exports.ConfigAdvancedCSharp = ConfigAdvancedCSharp;
ConfigAdvancedCSharp.KEY = 'cs';
ConfigAdvancedCSharp.ATTRIBUTES = 'attributes';
ConfigAdvancedCSharp.INLINE = 'inline';
//# sourceMappingURL=ConfigAdvancedCSharp.js.map