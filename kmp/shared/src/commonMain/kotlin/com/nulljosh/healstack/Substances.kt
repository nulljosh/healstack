package com.nulljosh.healstack

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Substance(
    val id: String,
    val name: String,
    val category: String,
    val halfLife: String = "",
    val effects: List<String> = emptyList(),
    val interactions: List<String> = emptyList(),
    val harmReduction: List<String> = emptyList(),
    val routes: List<String> = emptyList(),
    val unit: String = "",
    val notes: String = "",
)

private val json = Json { ignoreUnknownKeys = true }

// Parsed once, lazily -- this is a 200-entry static reference corpus, not a
// network fetch. Mirrors src/hooks/useSubstances.js's role without the
// personal-log tools that hook also carries.
val SUBSTANCES: List<Substance> by lazy { json.decodeFromString(SUBSTANCES_JSON) }

fun searchSubstances(query: String): List<Substance> {
    if (query.isBlank()) return SUBSTANCES
    val q = query.trim().lowercase()
    return SUBSTANCES.filter { it.name.lowercase().contains(q) || it.category.lowercase().contains(q) }
}

fun getSubstance(id: String): Substance? = SUBSTANCES.find { it.id == id }

// Ported from src/components/InteractionChecker.jsx.

enum class Severity { MAJOR, MODERATE, MINOR }

fun severityLabel(s: Severity): String = when (s) {
    Severity.MAJOR -> "Major"; Severity.MODERATE -> "Moderate"; Severity.MINOR -> "Minor"
}

private val MAJOR_KEYWORDS = listOf("fatal", "dangerous", "avoid", "seizure")
private val MODERATE_KEYWORDS = listOf("potentiates", "reduces", "increases")

private fun classifySeverity(text: String): Severity {
    val lower = text.lowercase()
    if (MAJOR_KEYWORDS.any { lower.contains(it) }) return Severity.MAJOR
    if (MODERATE_KEYWORDS.any { lower.contains(it) }) return Severity.MODERATE
    return Severity.MINOR
}

data class InteractionResult(val text: String, val source: String, val severity: Severity)

private val LEADING_CLAUSE = Regex("^([^(]+)")

fun findInteractions(a: Substance?, b: Substance?): List<InteractionResult> {
    if (a == null || b == null || a.id == b.id) return emptyList()
    val results = mutableListOf<InteractionResult>()

    for (interaction in a.interactions) {
        val lower = interaction.lowercase()
        if (lower.contains(b.name.lowercase()) || lower.contains(b.category.lowercase())) {
            results.add(InteractionResult(interaction, a.name, classifySeverity(interaction)))
        }
    }

    for (interaction in b.interactions) {
        val lower = interaction.lowercase()
        if (lower.contains(a.name.lowercase()) || lower.contains(a.category.lowercase())) {
            val alreadyFound = results.any { it.text.lowercase() == interaction.lowercase() }
            if (!alreadyFound) results.add(InteractionResult(interaction, b.name, classifySeverity(interaction)))
        }
    }

    fun leadingClause(s: String) = LEADING_CLAUSE.find(s)?.groupValues?.get(1)?.trim()?.lowercase() ?: s.lowercase()
    val aSet = a.interactions.map(::leadingClause)
    val bSet = b.interactions.map(::leadingClause)
    for (i in aSet.indices) {
        for (j in bSet.indices) {
            if (aSet[i] != bSet[j]) continue
            val sharedTarget = aSet[i]
            if (sharedTarget == a.name.lowercase() || sharedTarget == b.name.lowercase()) continue
            val alreadyFound = results.any { it.text.lowercase().contains(sharedTarget) }
            if (!alreadyFound) {
                val text = "Both interact with $sharedTarget: \"${a.interactions[i]}\" / \"${b.interactions[j]}\""
                results.add(InteractionResult(text, "shared", classifySeverity(a.interactions[i] + " " + b.interactions[j])))
            }
        }
    }

    val order = mapOf(Severity.MAJOR to 0, Severity.MODERATE to 1, Severity.MINOR to 2)
    return results.sortedBy { order.getValue(it.severity) }
}
