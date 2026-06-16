import Supabase
import Foundation

let supabaseClient = SupabaseClient(
    supabaseURL: URL(string: "https://tjsxsqlxjmanwvmywwvw.supabase.co")!,
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqc3hzcWx4am1hbnd2bXl3d3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc0MDEsImV4cCI6MjA4NjA3MzQwMX0.LphLfho3wdQC20MhtcnBpzQUNuBoTOobrugQbNGxc68"
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

    func resetPassword(email: String) async throws {
        try await supabaseClient.auth.resetPasswordForEmail(
            email,
            redirectTo: URL(string: "dose://")!
        )
    }

    func updatePassword(_ newPassword: String) async throws {
        try await supabaseClient.auth.update(
            user: UserAttributes(password: newPassword)
        )
        isPasswordRecovery = false
    }
}
