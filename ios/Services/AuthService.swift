import AuthenticationServices
import Supabase
import Foundation

private func infoPlistValue(_ key: String) -> String {
    guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String, !value.isEmpty else {
        fatalError("Missing \(key) in Info.plist")
    }
    return value
}

let supabaseClient = SupabaseClient(
    supabaseURL: URL(string: infoPlistValue("SUPABASE_URL"))!,
    supabaseKey: infoPlistValue("SUPABASE_ANON_KEY")
)

@Observable
@MainActor
final class AuthService {
    var user: User? = nil
    var isLoading = true
    var isPasswordRecovery = false

    init() {
        Task { @MainActor in
            for await (event, session) in supabaseClient.auth.authStateChanges {
                switch event {
                case .initialSession:
                    user = session?.user
                    isLoading = false
                case .signedIn:
                    user = session?.user
                case .signedOut:
                    user = nil
                    isPasswordRecovery = false
                case .passwordRecovery:
                    user = session?.user
                    isPasswordRecovery = true
                default:
                    break
                }
            }
        }
    }

    func signIn(email: String, password: String) async throws {
        let session = try await supabaseClient.auth.signIn(email: email, password: password)
        user = session.user
    }

    func signUp(email: String, password: String) async throws {
        try await supabaseClient.auth.signUp(email: email, password: password)
    }

    func signOut() async throws {
        try await supabaseClient.auth.signOut()
        user = nil
    }

    /// Calls the shared `delete-account` Edge Function on the spark Supabase project,
    /// which uses the service-role key to delete the authenticated user server-side
    /// (the anon-key client SDK has no permission to delete its own auth user).
    func deleteAccount() async throws {
        let session = try await supabaseClient.auth.session
        var request = URLRequest(url: URL(string: "https://tjsxsqlxjmanwvmywwvw.supabase.co/functions/v1/delete-account")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw NSError(domain: "AuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Couldn't delete account. Try again."])
        }
        try await signOut()
    }

    func resetPassword(email: String) async throws {
        try await supabaseClient.auth.resetPasswordForEmail(
            email,
            redirectTo: URL(string: "dose://")!
        )
    }

    func signInWithApple(result: Result<ASAuthorization, Error>) async throws {
        let auth = try result.get()
        guard let cred = auth.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = cred.identityToken,
              let token = String(data: tokenData, encoding: .utf8) else {
            throw URLError(.badServerResponse)
        }
        try await supabaseClient.auth.signInWithIdToken(
            credentials: .init(provider: .apple, idToken: token)
        )
    }

    func updatePassword(_ newPassword: String) async throws {
        try await supabaseClient.auth.update(
            user: UserAttributes(password: newPassword)
        )
        isPasswordRecovery = false
    }
}
