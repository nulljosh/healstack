import XCTest

@MainActor
final class PreviewScreenshot: XCTestCase {
    func testSnapshots() {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments.append("UITEST_SNAPSHOT")
        app.launch()

        sleep(3)
        snapshot("0Home")

        app.buttons["tab.Library"].tap()
        sleep(2)
        snapshot("1Library")

        app.buttons["tab.Insights"].tap()
        sleep(2)
        snapshot("2Insights")

        app.buttons["tab.Body"].tap()
        sleep(2)
        snapshot("3Body")

        app.buttons["tab.Labs"].tap()
        sleep(2)
        snapshot("4Labs")
    }
}
