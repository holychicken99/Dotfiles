"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const DocommentControllerBlazor_1 = require("./Controller/Lang/DocommentControllerBlazor");
const DocommentControllerCSharp_1 = require("./Controller/Lang/DocommentControllerCSharp");
const DocommentDomainBlazor_1 = require("./Domain/Lang/DocommentDomainBlazor");
const DocommentDomainCSharp_1 = require("./Domain/Lang/DocommentDomainCSharp");
function activate(context) {
    {
        const domainCSharp = new DocommentDomainCSharp_1.DocommentDomainCSharp();
        const controllerCSharp = new DocommentControllerCSharp_1.DocommentControllerCSharp(domainCSharp);
        context.subscriptions.push(controllerCSharp);
        context.subscriptions.push(domainCSharp);
    }
    {
        const domainBlazor = new DocommentDomainBlazor_1.DocommentDomainBlazor();
        const controllerBlazor = new DocommentControllerBlazor_1.DocommentControllerBlazor(domainBlazor);
        context.subscriptions.push(controllerBlazor);
        context.subscriptions.push(domainBlazor);
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map