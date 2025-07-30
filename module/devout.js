/**
 * Devout Battle Clerics System
 * Adapted from Simple Worldbuilding
 * Author: Serelith
 */

// Import Modules
import { DevoutActor } from "./actor.js";
import { DevoutItem } from "./item.js";
import { DevoutItemSheet } from "./item-sheet.js";
import { DevoutActorSheet } from "./actor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { createDevoutMacro } from "./macro.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Devout Battle Clerics System`);

  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  game.devout = {
    DevoutActor,
    createDevoutMacro
  };

  CONFIG.Actor.documentClass = DevoutActor;
  CONFIG.Item.documentClass = DevoutItem;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("devout", DevoutActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("devout", DevoutItemSheet, { makeDefault: true });

  game.settings.register("devout", "macroShorthand", {
    name: "DEVOUT.MacroShorthandN",
    hint: "DEVOUT.MacroShorthandL",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register("devout", "initFormula", {
    name: "DEVOUT.InitFormulaN",
    hint: "DEVOUT.InitFormulaL",
    scope: "world",
    type: String,
    default: "1d20",
    config: true,
    onChange: formula => _devoutUpdateInit(formula, true)
  });

  const initFormula = game.settings.get("devout", "initFormula");
  _devoutUpdateInit(initFormula);

  function _devoutUpdateInit(formula, notify = false) {
    const isValid = Roll.validate(formula);
    if (!isValid) {
      if (notify)
        ui.notifications.error(`${game.i18n.localize("DEVOUT.NotifyInitFormulaInvalid")}: ${formula}`);
      return;
    }
    CONFIG.Combat.initiative.formula = formula;
  }

  Handlebars.registerHelper('slugify', function(value) {
    return value.slugify({ strict: true });
  });

  await preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Additional Hooks                            */
/* -------------------------------------------- */

Hooks.on("hotbarDrop", (bar, data, slot) => createDevoutMacro(data, slot));

Hooks.on("getActorDirectoryEntryContext", (html, options) => {
  options.push({
    name: game.i18n.localize("DEVOUT.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: li => {
      const actor = game.actors.get(li.data("documentId"));
      return !actor.isTemplate;
    },
    callback: li => {
      const actor = game.actors.get(li.data("documentId"));
      actor.setFlag("devout", "isTemplate", true);
    }
  });

  options.push({
    name: game.i18n.localize("DEVOUT.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: li => {
      const actor = game.actors.get(li.data("documentId"));
      return actor.isTemplate;
    },
    callback: li => {
      const actor = game.actors.get(li.data("documentId"));
      actor.setFlag("devout", "isTemplate", false);
    }
  });
});

Hooks.on("getItemDirectoryEntryContext", (html, options) => {
  options.push({
    name: game.i18n.localize("DEVOUT.DefineTemplate"),
    icon: '<i class="fas fa-stamp"></i>',
    condition: li => {
      const item = game.items.get(li.data("documentId"));
      return !item.isTemplate;
    },
    callback: li => {
      const item = game.items.get(li.data("documentId"));
      item.setFlag("devout", "isTemplate", true);
    }
  });

  options.push({
    name: game.i18n.localize("DEVOUT.UnsetTemplate"),
    icon: '<i class="fas fa-times"></i>',
    condition: li => {
      const item = game.items.get(li.data("documentId"));
      return item.isTemplate;
    },
    callback: li => {
      const item = game.items.get(li.data("documentId"));
      item.setFlag("devout", "isTemplate", false);
    }
  });
});
