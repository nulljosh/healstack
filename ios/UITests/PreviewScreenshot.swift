import XCTest

@MainActor
final class PreviewScreenshot: XCTestCase {
    // Launch straight into each tab rather than tapping the floating tab bar. The bar is drawn
    // over scrollable content, so a tap can be intercepted by whatever card sits beneath it.
    private static let screens = [
        (tab: 0, name: "0Home"),
        (tab: 1, name: "1Library"),
        (tab: 2, name: "2Insights"),
        (tab: 3, name: "3Body"),
        (tab: 4, name: "4Labs"),
    ]

    func testSnapshots() {
        for screen in Self.screens {
            let app = XCUIApplication()
            setupSnapshot(app)
            app.launchArguments += ["UITEST_SNAPSHOT", "-UITEST_TAB", String(screen.tab)]
            app.launch()

            sleep(3)
            snapshot(screen.name)

            app.terminate()
        }
    }
}
