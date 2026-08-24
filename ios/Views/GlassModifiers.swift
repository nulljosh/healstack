import SwiftUI

struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.ultraThinMaterial)
            }
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.white.opacity(0.08), lineWidth: 1)
            }
    }
}

struct GlowText: ViewModifier {
    func body(content: Content) -> some View {
        content
            .shadow(color: Color.blue.opacity(0.35), radius: 8, x: 0, y: 0)
            .shadow(color: Color.blue.opacity(0.2), radius: 2, x: 0, y: 0)
    }
}

extension View {
    func glassCard() -> some View {
        modifier(GlassCard())
    }

    func glowText() -> some View {
        modifier(GlowText())
    }
}

// ponytail: one helper, not a glass design system.
// Liquid Glass on 26+; the pre-26 material is the fallback. Floating controls only —
// glassCard() above stays material on purpose.
extension View {
    @ViewBuilder
    func liquidGlass(in shape: some Shape,
                     interactive: Bool = false,
                     fallback: Material = .regularMaterial) -> some View {
        if #available(iOS 26, macOS 26, *) {
            self.glassEffect(interactive ? .regular.interactive() : .regular, in: shape)
        } else {
            self.background(fallback, in: shape)
        }
    }
}
