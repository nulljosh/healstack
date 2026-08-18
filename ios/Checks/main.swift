// LabPanel entry-row self-check.
//
// Run with no build system, no framework:
//   swiftc -o /tmp/hscheck ios/Models/LabResult.swift ios/Checks/main.swift && /tmp/hscheck
//
// ponytail: plain asserts — LabResult.swift is pure Foundation, so a test target would only
// add a build graph to maintain.

import Foundation


var checks = 0
func check(_ c: @autoclosure () -> Bool, _ label: String) {
    checks += 1
    guard c() else {
        FileHandle.standardError.write("FAIL: \(label)\n".data(using: .utf8)!); exit(1)
    }
}

check(!LabPanel.all.isEmpty, "panels exist")
for panel in LabPanel.all {
    let entries = panel.entries
    check(entries.count == panel.markers.count, "\(panel.name): one entry per marker")
    check(entries.allSatisfy { $0.value.isEmpty }, "\(panel.name): entries start blank")
    check(Set(entries.map(\.id)).count == entries.count, "\(panel.name): entry ids are unique")
    for (entry, marker) in zip(entries, panel.markers) {
        check(entry.name == marker.name, "\(panel.name): name carried over")
        check(entry.unit == marker.unit, "\(panel.name): unit carried over")
        check(entry.refLow == (marker.refLow.map { String($0) } ?? ""), "\(panel.name)/\(marker.name): refLow")
        check(entry.refHigh == (marker.refHigh.map { String($0) } ?? ""), "\(panel.name)/\(marker.name): refHigh")
    }
}

// The crash this refactor removes: panel switching shrinks the array while rows are on screen.
let big = LabPanel.all.max { $0.markers.count < $1.markers.count }!
let small = LabPanel.all.min { $0.markers.count < $1.markers.count }!
check(big.markers.count > small.markers.count, "panels differ in length (\(big.name)=\(big.entries.count), \(small.name)=\(small.entries.count))")

// Identity is per-entry now, so a shrink cannot leave a row addressing a dead index.
var rows = big.entries
let survivor = rows[0].id
rows = small.entries
check(!rows.contains { $0.id == survivor }, "a panel switch replaces identities outright")

print("ok — \(checks) checks passed (\(big.name) \(big.entries.count) -> \(small.name) \(small.entries.count))")
