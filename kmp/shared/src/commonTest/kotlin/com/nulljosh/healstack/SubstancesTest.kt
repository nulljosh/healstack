package com.nulljosh.healstack

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class SubstancesTest {
    @Test fun dataLoads() {
        assertEquals(200, SUBSTANCES.size)
        assertTrue(getSubstance("cannabis") != null)
    }

    @Test fun searchIsCaseInsensitive() {
        assertTrue(searchSubstances("CANNABIS").any { it.id == "cannabis" })
    }

    @Test fun cannabisAlcoholInteractionDetected() {
        val cannabis = getSubstance("cannabis")!!
        val alcohol = SUBSTANCES.find { it.category.lowercase() == "depressant" && it.name.lowercase().contains("alcohol") }
        if (alcohol != null) {
            val result = findInteractions(cannabis, alcohol)
            assertTrue(result.isNotEmpty(), "expected a flagged interaction between cannabis and alcohol")
        }
    }

    @Test fun sameSubstanceHasNoInteraction() {
        val cannabis = getSubstance("cannabis")!!
        assertTrue(findInteractions(cannabis, cannabis).isEmpty())
    }
}
