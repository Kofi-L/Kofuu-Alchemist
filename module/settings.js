Hooks.once("init", () => {
    // updateMenu.js
    game.settings.registerMenu("kofuu-alchemist", "autorecUpdate", {
        name: game.i18n.localize("kofuu-alchemist.settings.autorecUpdate.name"),
        label: game.i18n.localize("kofuu-alchemist.settings.autorecUpdate.label"),
        icon: "fa-solid fa-wrench",
        type: autorecUpdateFormApplication,
        restricted: true
    });

    //#region Settings
    game.settings.register("kofuu-alchemist", "autoUpdate", {
        scope: "world",
        config: true,
        name: game.i18n.localize("kofuu-alchemist.settings.autoUpdate.name"),
        hint: game.i18n.localize("kofuu-alchemist.settings.autoUpdate.hint"),
        type: Boolean,
        default: true
    });
    game.settings.register("kofuu-alchemist", "debug", {
        scope: "client",
        config: true,
        name: game.i18n.localize("kofuu-alchemist.settings.debug.name"),
        hint: game.i18n.localize("kofuu-alchemist.settings.debug.hint"),
        type: Boolean,
        default: false
    });
    // #endregion

    //#region Data Storage
    game.settings.register("kofuu-alchemist", "version-previous", {
        scope: "world",
        type: String,
        default: "0"
    });
    game.settings.register("kofuu-alchemist", "blacklist", {
        scope: "world",
        type: Object,
        default: {
            menu: [],
            entries: [],
        }
    });
    //#endregion
});