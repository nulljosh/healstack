import AuthenticationServices
import SwiftUI

struct MacAuthView: View {
    var authService: AuthService

    @State private var tab: Tab = .signIn
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var errorMessage: String?

    enum Tab { case signIn, register }

    var body: some View {
        VStack(spacing: 28) {
            VStack(spacing: 8) {
                Image(systemName: "cross.vial.fill")
                    .font(.system(size: 32, weight: .medium))
                    .foregroundStyle(.tint)
                Text("Healstack")
                    .font(.title2.weight(.semibold))
                Text("Health tracker")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 8)

            Picker("", selection: $tab) {
                Text("Sign in").tag(Tab.signIn)
                Text("Register").tag(Tab.register)
            }
            .pickerStyle(.segmented)
            .onChange(of: tab) { _, _ in
                errorMessage = nil
            }

            VStack(spacing: 10) {
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                SecureField("Password", text: $password)
                    .textContentType(tab == .signIn ? .password : .newPassword)
            }

            if let error = errorMessage {
                Text(error).font(.caption).foregroundStyle(.red).multilineTextAlignment(.center)
            }
            Button {
                Task { await submit() }
            } label: {
                HStack {
                    if loading { ProgressView().controlSize(.small) }
                    Text(tab == .signIn ? "Sign in" : "Create account").fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(loading || email.isEmpty || password.isEmpty)

            HStack {
                Rectangle().frame(height: 1).foregroundStyle(.quaternary)
                Text("or").font(.caption).foregroundStyle(.secondary)
                Rectangle().frame(height: 1).foregroundStyle(.quaternary)
            }

            SignInWithAppleButton(.signIn) { request in
                authService.prepareAppleRequest(request)
            } onCompletion: { result in
                Task { await completeAppleSignIn(result) }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 40)

            Button {
                Task { await completeGoogleSignIn() }
            } label: {
                Text("Continue with Google")
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity)
            }
            .controlSize(.large)
            .disabled(loading)

            Spacer()
        }
        .padding(32)
    }

    private func submit() async {
        guard !loading else { return }
        errorMessage = nil
        loading = true
        defer { loading = false }
        do {
            if tab == .signIn {
                try await authService.signIn(email: email, password: password)
            } else {
                try await authService.signUp(email: email, password: password)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func completeGoogleSignIn() async {
        errorMessage = nil
        loading = true
        defer { loading = false }
        do {
            try await authService.signInWithGoogle()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func completeAppleSignIn(_ result: Result<ASAuthorization, Error>) async {
        errorMessage = nil
        loading = true
        defer { loading = false }
        do {
            try await authService.signInWithApple(result: result)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
