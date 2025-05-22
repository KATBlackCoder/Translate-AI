use serde::Deserialize;
use crate::core::rpgmv::common::TranslatableStringEntry;

// --- Structs for deserializing System.json --- 

// Note on SystemMessages:
// Many string values within `terms.messages` (handled by the SystemMessages struct below)
// contain placeholders like %1, %2, %3, etc. These are dynamically replaced by
// the game engine at runtime with specific game data (e.g., actor names, item names,
// damage values).
//
// IMPORTANT FOR TRANSLATION:
// - These placeholders MUST be preserved exactly in the translated string.
// - The translated sentence structure should accommodate these placeholders.
// - The specific meaning of %1, %2, etc., is context-dependent based on the
//   message key (e.g., in 'actorDamage', %1 is the actor; in 'obtainItem', %1 is the item).
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SystemMessages {
    action_failure: Option<String>,
    actor_damage: Option<String>,
    actor_drain: Option<String>,
    actor_gain: Option<String>,
    actor_loss: Option<String>,
    actor_no_damage: Option<String>,
    actor_no_hit: Option<String>,
    actor_recovery: Option<String>,
    always_dash: Option<String>,
    bgm_volume: Option<String>,
    bgs_volume: Option<String>,
    buff_add: Option<String>,
    buff_remove: Option<String>,
    command_remember: Option<String>,
    counter_attack: Option<String>,
    critical_to_actor: Option<String>,
    critical_to_enemy: Option<String>,
    debuff_add: Option<String>,
    defeat: Option<String>,
    emerge: Option<String>,
    enemy_damage: Option<String>,
    enemy_drain: Option<String>,
    enemy_gain: Option<String>,
    enemy_loss: Option<String>,
    enemy_no_damage: Option<String>,
    enemy_no_hit: Option<String>,
    enemy_recovery: Option<String>,
    escape_failure: Option<String>,
    escape_start: Option<String>,
    evasion: Option<String>,
    exp_next: Option<String>,
    exp_total: Option<String>,
    file: Option<String>,
    level_up: Option<String>,
    load_message: Option<String>,
    magic_evasion: Option<String>,
    magic_reflection: Option<String>,
    me_volume: Option<String>,
    obtain_exp: Option<String>,
    obtain_gold: Option<String>,
    obtain_item: Option<String>,
    obtain_skill: Option<String>,
    party_name: Option<String>,
    possession: Option<String>,
    preemptive: Option<String>,
    save_message: Option<String>,
    se_volume: Option<String>,
    substitute: Option<String>,
    surprise: Option<String>,
    use_item: Option<String>,
    victory: Option<String>,
    // Add any other messages if they exist in other System.json variants
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SystemTerms {
    basic: Option<Vec<Option<String>>>,
    commands: Option<Vec<Option<String>>>,
    params: Option<Vec<Option<String>>>,
    messages: Option<SystemMessages>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct SystemData {
    game_title: Option<String>,
    currency_unit: Option<String>,
    armor_types: Option<Vec<Option<String>>>,
    skill_types: Option<Vec<Option<String>>>,
    weapon_types: Option<Vec<Option<String>>>,
    elements: Option<Vec<Option<String>>>,
    equip_types: Option<Vec<Option<String>>>,
    switches: Option<Vec<Option<String>>>,
    variables: Option<Vec<Option<String>>>,
    terms: Option<SystemTerms>,
    // Other fields are ignored
}

// --- Helper function to add entries --- 
fn add_entry_if_some(
    entries: &mut Vec<TranslatableStringEntry>,
    text_option: &Option<String>,
    source_file: &str,
    json_path: String,
) {
    if let Some(text) = text_option {
        if !text.trim().is_empty() {
            entries.push(TranslatableStringEntry {
                object_id: 0, // Using 0 as a convention for system-wide terms
                text: text.clone(),
                source_file: source_file.to_string(),
                json_path,
            });
        }
    }
}

fn add_entries_from_string_array(
    entries: &mut Vec<TranslatableStringEntry>,
    array_option: &Option<Vec<Option<String>>>,
    source_file: &str,
    base_json_path: &str,
) {
    if let Some(array) = array_option {
        for (index, text_option) in array.iter().enumerate() {
            if index == 0 && text_option.as_deref().map_or(true, |s| s.is_empty() && base_json_path != "terms.messages") {
                 // RPG Maker often has an empty or null string at index 0 for 1-based indexing in editor
                 // However, for messages, even an empty string might be significant if it was intentionally blanked.
                 // This check is a bit heuristic. The main check is !text.trim().is_empty() in add_entry_if_some.
            }
            add_entry_if_some(
                entries,
                text_option,
                source_file,
                format!("{}[{}]", base_json_path, index),
            );
        }
    }
}

// --- Main extraction function --- 
pub fn extract_strings(
    file_content: &str,
    source_file: &str,
) -> Result<Vec<TranslatableStringEntry>, String> {
    let system_data: SystemData = serde_json::from_str(file_content)
        .map_err(|e| format!("Failed to parse System.json: {}. Content snippet: {:.100}", e, file_content.chars().take(100).collect::<String>()))?;

    let mut entries = Vec::new();

    // Top-level direct strings
    add_entry_if_some(&mut entries, &system_data.game_title, source_file, "gameTitle".to_string());
    add_entry_if_some(&mut entries, &system_data.currency_unit, source_file, "currencyUnit".to_string());

    // Top-level arrays of strings
    add_entries_from_string_array(&mut entries, &system_data.armor_types, source_file, "armorTypes");
    add_entries_from_string_array(&mut entries, &system_data.skill_types, source_file, "skillTypes");
    add_entries_from_string_array(&mut entries, &system_data.weapon_types, source_file, "weaponTypes");
    add_entries_from_string_array(&mut entries, &system_data.elements, source_file, "elements");
    add_entries_from_string_array(&mut entries, &system_data.equip_types, source_file, "equipTypes");
    add_entries_from_string_array(&mut entries, &system_data.switches, source_file, "switches");
    add_entries_from_string_array(&mut entries, &system_data.variables, source_file, "variables");

    // Terms
    if let Some(terms) = &system_data.terms {
        add_entries_from_string_array(&mut entries, &terms.basic, source_file, "terms.basic");
        add_entries_from_string_array(&mut entries, &terms.commands, source_file, "terms.commands");
        add_entries_from_string_array(&mut entries, &terms.params, source_file, "terms.params");

        if let Some(messages) = &terms.messages {
            // Iterate over SystemMessages fields using reflection or by listing them manually
            // For simplicity and explicitness, listing manually based on struct definition:
            add_entry_if_some(&mut entries, &messages.action_failure, source_file, "terms.messages.actionFailure".to_string());
            add_entry_if_some(&mut entries, &messages.actor_damage, source_file, "terms.messages.actorDamage".to_string());
            add_entry_if_some(&mut entries, &messages.actor_drain, source_file, "terms.messages.actorDrain".to_string());
            add_entry_if_some(&mut entries, &messages.actor_gain, source_file, "terms.messages.actorGain".to_string());
            add_entry_if_some(&mut entries, &messages.actor_loss, source_file, "terms.messages.actorLoss".to_string());
            add_entry_if_some(&mut entries, &messages.actor_no_damage, source_file, "terms.messages.actorNoDamage".to_string());
            add_entry_if_some(&mut entries, &messages.actor_no_hit, source_file, "terms.messages.actorNoHit".to_string());
            add_entry_if_some(&mut entries, &messages.actor_recovery, source_file, "terms.messages.actorRecovery".to_string());
            add_entry_if_some(&mut entries, &messages.always_dash, source_file, "terms.messages.alwaysDash".to_string());
            add_entry_if_some(&mut entries, &messages.bgm_volume, source_file, "terms.messages.bgmVolume".to_string());
            add_entry_if_some(&mut entries, &messages.bgs_volume, source_file, "terms.messages.bgsVolume".to_string());
            add_entry_if_some(&mut entries, &messages.buff_add, source_file, "terms.messages.buffAdd".to_string());
            add_entry_if_some(&mut entries, &messages.buff_remove, source_file, "terms.messages.buffRemove".to_string());
            add_entry_if_some(&mut entries, &messages.command_remember, source_file, "terms.messages.commandRemember".to_string());
            add_entry_if_some(&mut entries, &messages.counter_attack, source_file, "terms.messages.counterAttack".to_string());
            add_entry_if_some(&mut entries, &messages.critical_to_actor, source_file, "terms.messages.criticalToActor".to_string());
            add_entry_if_some(&mut entries, &messages.critical_to_enemy, source_file, "terms.messages.criticalToEnemy".to_string());
            add_entry_if_some(&mut entries, &messages.debuff_add, source_file, "terms.messages.debuffAdd".to_string());
            add_entry_if_some(&mut entries, &messages.defeat, source_file, "terms.messages.defeat".to_string());
            add_entry_if_some(&mut entries, &messages.emerge, source_file, "terms.messages.emerge".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_damage, source_file, "terms.messages.enemyDamage".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_drain, source_file, "terms.messages.enemyDrain".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_gain, source_file, "terms.messages.enemyGain".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_loss, source_file, "terms.messages.enemyLoss".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_no_damage, source_file, "terms.messages.enemyNoDamage".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_no_hit, source_file, "terms.messages.enemyNoHit".to_string());
            add_entry_if_some(&mut entries, &messages.enemy_recovery, source_file, "terms.messages.enemyRecovery".to_string());
            add_entry_if_some(&mut entries, &messages.escape_failure, source_file, "terms.messages.escapeFailure".to_string());
            add_entry_if_some(&mut entries, &messages.escape_start, source_file, "terms.messages.escapeStart".to_string());
            add_entry_if_some(&mut entries, &messages.evasion, source_file, "terms.messages.evasion".to_string());
            add_entry_if_some(&mut entries, &messages.exp_next, source_file, "terms.messages.expNext".to_string());
            add_entry_if_some(&mut entries, &messages.exp_total, source_file, "terms.messages.expTotal".to_string());
            add_entry_if_some(&mut entries, &messages.file, source_file, "terms.messages.file".to_string());
            add_entry_if_some(&mut entries, &messages.level_up, source_file, "terms.messages.levelUp".to_string());
            add_entry_if_some(&mut entries, &messages.load_message, source_file, "terms.messages.loadMessage".to_string());
            add_entry_if_some(&mut entries, &messages.magic_evasion, source_file, "terms.messages.magicEvasion".to_string());
            add_entry_if_some(&mut entries, &messages.magic_reflection, source_file, "terms.messages.magicReflection".to_string());
            add_entry_if_some(&mut entries, &messages.me_volume, source_file, "terms.messages.meVolume".to_string());
            add_entry_if_some(&mut entries, &messages.obtain_exp, source_file, "terms.messages.obtainExp".to_string());
            add_entry_if_some(&mut entries, &messages.obtain_gold, source_file, "terms.messages.obtainGold".to_string());
            add_entry_if_some(&mut entries, &messages.obtain_item, source_file, "terms.messages.obtainItem".to_string());
            add_entry_if_some(&mut entries, &messages.obtain_skill, source_file, "terms.messages.obtainSkill".to_string());
            add_entry_if_some(&mut entries, &messages.party_name, source_file, "terms.messages.partyName".to_string());
            add_entry_if_some(&mut entries, &messages.possession, source_file, "terms.messages.possession".to_string());
            add_entry_if_some(&mut entries, &messages.preemptive, source_file, "terms.messages.preemptive".to_string());
            add_entry_if_some(&mut entries, &messages.save_message, source_file, "terms.messages.saveMessage".to_string());
            add_entry_if_some(&mut entries, &messages.se_volume, source_file, "terms.messages.seVolume".to_string());
            add_entry_if_some(&mut entries, &messages.substitute, source_file, "terms.messages.substitute".to_string());
            add_entry_if_some(&mut entries, &messages.surprise, source_file, "terms.messages.surprise".to_string());
            add_entry_if_some(&mut entries, &messages.use_item, source_file, "terms.messages.useItem".to_string());
            add_entry_if_some(&mut entries, &messages.victory, source_file, "terms.messages.victory".to_string());
        }
    }

    Ok(entries)
} 