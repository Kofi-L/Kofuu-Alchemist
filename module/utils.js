const kofuuAlchemist = {}
const moduleID = "kofuu-alchemist"

//#region Hooks
kofuuAlchemist.hooks = {}

kofuuAlchemist.hooks.ready = Hooks.once("ready", () => {
	console.log("Kofuu Alchemist v" + game.modules.get(moduleID).version + " loaded.");
	// Warn if no JB2A is found.
	if (!game.modules.get("JB2A_DnD5e")?.active && !game.modules.get("jb2a_patreon")?.active) {
		ui.notifications.error(kofuuAlchemist.localize("kofuu-alchemist.notifications.noJB2A"), { permanent: true });
	}

	// Warn if one of the required modules is disabled.
	if (!(game.modules.get(moduleID).relationships.requires.toObject().map(i => i.id).every(i => game.modules.get(i)?.active))) {
		ui.notifications.error(kofuuAlchemist.localize(
			"kofuu-alchemist.notifications.noDependencies",
			{
				modules:
					game.modules.get(moduleID).relationships.requires.toObject()
						.filter(i => !game.modules.get(i.id)?.active).map(i => i.id).join(", ") || "Unknown"
			}
		), { permanent: true });
	} else {
		const wrongVersions = game.modules.get(moduleID).relationships.requires.toObject()
			.map(i => { return { id: i.id, title: game.modules.get(i.id).title, version: i.compatibility.minimum } })
			.filter(i => isNewerVersion(i.version, game.modules.get(i.id).version?.replace("v", "")));

		if (wrongVersions.length > 0) {
			ui.notifications.error(kofuuAlchemist.localize(
				"kofuu-alchemist.notifications.wrongVersion",
				{
					modules:
						wrongVersions.map(i => `${i.title} v${i.version}`).join(", ") || "Unknown"
				}
			), { permanent: true });
		}
	}

	if (game.settings.get(moduleID, "version-previous") !== game.modules.get(moduleID).version) {
		ui.notifications.info(kofuuAlchemist.localize("kofuu-alchemist.notifications.update", { version: game.modules.get(moduleID).version }))
		game.settings.set(moduleID, "version-previous", game.modules.get(moduleID).version)
		if (game.user.isGM && game.settings.get(moduleID, "autoUpdate")) new autorecUpdateFormApplication().render(true)
	}

	// GM-Only stuff.
	if (!game.user.isGM) return;
});

// Create a hook for metadata modification menu.
kofuuAlchemist.hooks.AutomatedAnimations = {}
kofuuAlchemist.hooks.AutomatedAnimations.metaData = Hooks.on("AutomatedAnimations.metaData", async (data) => {
	if (game.settings.get(moduleID, "debug")) {
		kofuuAlchemist.debug("AutomatedAnimations.metaData hook", data);
		let metaData = data.metaData;
		await warpgate.menu(
			{
				inputs: [
					{
						label: `name${metaData.name ? "" : " (auto)"}`,
						type: 'text',
						options: metaData.name || "5e Animations"
					},
					{
						label: `moduleVersion${metaData.moduleVersion ? "" : " (auto)"}`,
						type: 'text',
						options: metaData.moduleVersion || game.modules.get(moduleID).version
					},
					{
						label: `version${metaData.version ? "" : " (auto)"}`,
						type: 'number',
						options: metaData.version || Number(game.modules.get(moduleID).version.replaceAll(".", ""))
					}
				],
				buttons: [
					{
						label: 'Apply',
						value: 1,
						callback: async (options) => {
							let settings = await game.settings.get("autoanimations", `aaAutorec-${data.menu}`);
							let entry = settings.findIndex(obj => obj.label === data.label);
							settings[entry].metaData.name = options.inputs[0] ?? settings[entry].metaData.name;
							settings[entry].metaData.moduleVersion = options.inputs[1] ?? settings[entry].metaData.moduleVersion;
							settings[entry].metaData.version = options.inputs[2] ?? settings[entry].metaData.version;
							await AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify({ version: await game.settings.get('autoanimations', 'aaAutorec').version, [data.menu]: settings }), { [data.menu]: true });
						}
					},
					{
						label: 'Update',
						value: 1,
						callback: async (options) => {
							let settings = await game.settings.get("autoanimations", `aaAutorec-${data.menu}`);
							let entry = settings.findIndex(obj => obj.label === data.label);
							settings[entry].metaData.name = "5e Animations";
							settings[entry].metaData.moduleVersion = game.modules.get(moduleID).version;
							settings[entry].metaData.version = (options.inputs[2] ?? settings[entry].metaData.version) + 1;
							await AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify({ version: await game.settings.get('autoanimations', 'aaAutorec').version, [data.menu]: settings }), { [data.menu]: true });
						}
					},
					{
						label: 'Delete MetaData',
						value: 1,
						callback: async (options) => {
							let settings = await game.settings.get("autoanimations", `aaAutorec-${data.menu}`);
							let entry = settings.findIndex(obj => obj.label === data.label);
							settings[entry].metaData = {};
							await AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify({ version: await game.settings.get('autoanimations', 'aaAutorec').version, [data.menu]: settings }), { [data.menu]: true });
						}
					}
				]
			},
			{
				title: `DEBUG | Add Metadata to ${data.label}.`
			}
		)
	}
});
//#endregion

kofuuAlchemist.debug = function debug(msg, args) {
	[msg, ...args] = arguments
	if (game.settings.get(moduleID, "debug")) console.log(`DEBUG | Kofuu Alchemist | ${msg}`, args);
}

kofuuAlchemist.localize = function localize(string = String, format = Object) {
	if (!string.includes("kofuu-alchemist.")) string = "kofuu-alchemist." + string;
	if (Object.keys(format).length > 0) {
		return game.i18n.format(string, format);
	} else {
		return game.i18n.localize(string);
	}
}

self.kofuuAlchemist = kofuuAlchemist
