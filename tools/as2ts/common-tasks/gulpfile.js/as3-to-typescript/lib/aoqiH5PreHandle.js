"use strict";
var AoqiH5PreHandle = /** @class */ (function () {
    function AoqiH5PreHandle() {
    }
    AoqiH5PreHandle.prototype.handle = function (content) {
        content = content.replace("/\r\n/g", "\n");
        content = content.replace(/\bNewDialogWithCallback\b/g, "NewDialog");
        content = content.replace(/\bProgressFullSprite\b/g, "Loading");
        content = content.replace(/\bLocalStore\b/g, "LocalCache");
        content = content.replace(/\bISceneCommand\b/g, "ICommand");
        content = content.replace(/\bSceneCommandEvent\b/g, "CommandEvent");
        content = content.replace(/\bSceneSimpleCommand\b/g, "SimpleCommand");
        content = content.replace(/\bSceneMacroCommand\b/g, "MacroCommand");
        content = content.replace(/\bCommonDialogBase\b/g, "DialogBase");
        content = content.replace(/\bCommonPanelBase\b/g, "DialogBase");
        content = content.replace(/\bInteractDialogBase\b/g, "DialogBase");
        content = content.replace(/ModalDialogManager.getInstance\(\)/g, "DialogManager.instance");
        content = content.replace(/ModalDialog/g, "Dialog");
        content = content.replace(/NewActivity/g, "Activity");
        content = content.replace(/clearFiltersWithTips/g, "clearFilters");
        content = content.replace(/applyGrayWithTips/g, "applyGray");
        content = content.replace(/ServiceContainer.getService\(I([a-zA-Z0-9_]+)\)/g, "ServiceContainer.getService(ServiceConfig.$1)");
        content = content.replace(/ServiceContainer.getService\("([a-zA-Z0-9_]+)"\)/g, "ServiceContainer.getService(ServiceConfig.$1)");
        content = content.replace(/ServiceContainer.tryGetService\(I([a-zA-Z0-9_]+)/g, "ServiceContainer.tryGetService(ServiceConfig.$1");
        content = content.replace(/ServiceContainer.tryGetService\("([a-zA-Z0-9_]+)"/g, "ServiceContainer.tryGetService(ServiceConfig.$1");
        content = content.replace(/forSvc\(I([a-zA-Z0-9_]+)/g, "forSvc(ServiceConfig.$1");
        content = content.replace(/forSvc\("([a-zA-Z0-9_]+)"/g, "forSvc(ServiceConfig.$1");
        content = content.replace(/\bApplicationDomain\b/g, "Domain");
        content = content.replace(/\bTranslator.translate/g, "");
        content = content.replace(/var([\s\t]+[\w]+):HashMap([\s\t]+=[\s\t]+new[\s\t]+)HashMap\(\)/, "var$1:Dictionary<any,any>$2Dictionary()");
        content = content.replace(/\bHashMap\b/, "Dictionary");
        content = content.replace(/\bint.MAX_VALUE/g, "Number.MAX_VALUE");
        return content;
    };
    return AoqiH5PreHandle;
}());
module.exports = AoqiH5PreHandle;
