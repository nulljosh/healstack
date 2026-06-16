import SwiftUI

struct ScoreRingView: View {
    let score: Int
    let rank: HealthRank

    private var progress: Double {
        min(max(Double(score) / 100.0, 0), 1.0)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color(.quaternarySystemFill), lineWidth: 16)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(rank.color, style: StrokeStyle(lineWidth: 16, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.8), value: progress)

            VStack(spacing: 2) {
                Text("\(score)")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                Text("/ 100")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: 140, height: 140)
    }
}
