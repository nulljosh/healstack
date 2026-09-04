package com.nulljosh.healstack

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HealstackTheme(content: @Composable () -> Unit) =
    MaterialTheme(colorScheme = lightColorScheme(), content = content)

// ponytail: read-only reference lookup + interaction checker. The 14
// personal/session tools (dose log, active stack, reminders) are Supabase
// auth-gated and out of scope here -- see roadmap.md.
@Composable
fun AppScreen() {
    var query by remember { mutableStateOf("") }
    var pickA by remember { mutableStateOf<Substance?>(null) }
    var pickB by remember { mutableStateOf<Substance?>(null) }
    val results = remember(query) { searchSubstances(query) }
    val interactions = remember(pickA, pickB) { findInteractions(pickA, pickB) }

    Surface {
        Column(Modifier.fillMaxSize().padding(24.dp)) {
            Text("Healstack", style = MaterialTheme.typography.headlineMedium)
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text("Search substances") },
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            )
            if (pickA != null || pickB != null) {
                Text(
                    "Checking: ${pickA?.name ?: "-"} + ${pickB?.name ?: "-"}",
                    modifier = Modifier.padding(top = 8.dp),
                )
                interactions.forEach { r ->
                    Text("[${severityLabel(r.severity)}] ${r.text}", modifier = Modifier.padding(top = 4.dp))
                }
                if (pickA != null && pickB != null && interactions.isEmpty()) {
                    Text("No known interactions found.", modifier = Modifier.padding(top = 4.dp))
                }
            }
            LazyColumn(
                modifier = Modifier.padding(top = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(results) { s ->
                    Column {
                        Text(s.name, style = MaterialTheme.typography.titleMedium)
                        Text(s.category)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { pickA = s }) { Text("Set A") }
                            Button(onClick = { pickB = s }) { Text("Set B") }
                        }
                    }
                }
            }
        }
    }
}
