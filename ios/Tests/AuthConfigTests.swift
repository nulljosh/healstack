import XCTest
@testable import Dose

/// Guards the two things that shipped broken and got the app rejected: a bundle without
/// Supabase config (which used to `fatalError` at launch) and a nonce-less Apple sign-in.
@MainActor
final class AuthConfigTests: XCTestCase {
    func testBundleCarriesSupabaseConfig() {
        XCTAssertNil(supabaseConfigError, supabaseConfigError ?? "")
    }

    func testNonceIsUniqueAndCorrectLength() {
        let nonces = (0..<200).map { _ in AuthService.randomNonce() }
        XCTAssertTrue(nonces.allSatisfy { $0.count == 32 })
        XCTAssertEqual(Set(nonces).count, nonces.count)
    }
}
