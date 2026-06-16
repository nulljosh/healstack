import SwiftUI

struct NewPasswordView: View {
    var authService: AuthService

    @State private var password = ""
    @State private var confirm = ""
    @State private var loading = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 28) {
                VStack(spacing: 8) {
                    Image(systemName: "lock.rotation")
                        .font(.system(size: 36, weight: .medium))
                        .foregroundStyle(.tint)

                    Text("Set new password")
                        .font(.title2.weight(.semibold))

                    Text("Enter a new password for your account")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                VStack(spacing: 12) {
                    SecureField("New password", text: $password)
                        .textContentType(.newPassword)
                        .textFieldStyle(.roundedBorder)

                    SecureField("Confirm password", text: $confirm)
                        .textContentType(.newPassword)
                        .textFieldStyle(.roundedBorder)
                }

                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task { await submit() }
                } label: {
                    HStack {
                        if loading { ProgressView() }
                        Text("Update password")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .disabled(loading || password.isEmpty || confirm.isEmpty)
            }
            .padding(28)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20))
            .padding(.horizontal, 20)

            Spacer()
        }
    }

    private func submit() async {
        guard !loading else { return }
        guard password == confirm else {
            errorMessage = "Passwords do not match"
            return
        }
        errorMessage = nil
        loading = true
        defer { loading = false }

        do {
            try await authService.updatePassword(password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
