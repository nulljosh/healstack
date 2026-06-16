import SwiftUI

struct BodyMapView: View {
    let zones: [ReflexZone]
    let viewBox: CGRect
    let outlinePath: String
    @Binding var selectedZone: ReflexZone?

    var body: some View {
        GeometryReader { geo in
            let scale = min(geo.size.width / viewBox.width, geo.size.height / viewBox.height)
            let offsetX = (geo.size.width - viewBox.width * scale) / 2 - viewBox.minX * scale
            let offsetY = (geo.size.height - viewBox.height * scale) / 2 - viewBox.minY * scale

            ZStack {
                // Foot/hand outline
                SVGPath(pathData: outlinePath)
                    .fill(Color(white: 0.15))
                    .stroke(Color(white: 0.25), lineWidth: 1.5 / scale)

                // Interactive zones
                ForEach(zones) { zone in
                    let isSelected = selectedZone?.id == zone.id
                    SVGPath(pathData: zone.pathData)
                        .fill(zone.system.color.opacity(isSelected ? 0.7 : 0.3))
                        .stroke(isSelected ? .white : zone.system.color.opacity(0.5), lineWidth: (isSelected ? 2 : 1) / scale)
                        .onTapGesture {
                            withAnimation(.spring(response: 0.35)) {
                                selectedZone = selectedZone?.id == zone.id ? nil : zone
                            }
                        }
                }
            }
            .scaleEffect(scale, anchor: .topLeading)
            .offset(x: offsetX, y: offsetY)
        }
    }
}

struct SVGPath: Shape {
    let pathData: String

    func path(in rect: CGRect) -> Path {
        parseSVGPath(pathData)
    }
}

private func parseSVGPath(_ d: String) -> Path {
    var path = Path()
    let scanner = Scanner(string: d)
    scanner.charactersToBeSkipped = CharacterSet.whitespaces.union(CharacterSet(charactersIn: ","))

    var currentX: CGFloat = 0
    var currentY: CGFloat = 0
    var lastCommand: Character = "M"

    while !scanner.isAtEnd {
        var cmd: Character = lastCommand

        let saved = scanner.currentIndex
        if let ch = scanner.scanCharacter(), ch.isLetter {
            cmd = ch
        } else {
            scanner.currentIndex = saved
        }

        switch cmd {
        case "M":
            guard let x = scanner.scanDouble(), let y = scanner.scanDouble() else { break }
            currentX = CGFloat(x); currentY = CGFloat(y)
            path.move(to: CGPoint(x: currentX, y: currentY))
        case "L":
            guard let x = scanner.scanDouble(), let y = scanner.scanDouble() else { break }
            currentX = CGFloat(x); currentY = CGFloat(y)
            path.addLine(to: CGPoint(x: currentX, y: currentY))
        case "C":
            guard let x1 = scanner.scanDouble(), let y1 = scanner.scanDouble(),
                  let x2 = scanner.scanDouble(), let y2 = scanner.scanDouble(),
                  let x = scanner.scanDouble(), let y = scanner.scanDouble() else { break }
            currentX = CGFloat(x); currentY = CGFloat(y)
            path.addCurve(to: CGPoint(x: currentX, y: currentY),
                          control1: CGPoint(x: CGFloat(x1), y: CGFloat(y1)),
                          control2: CGPoint(x: CGFloat(x2), y: CGFloat(y2)))
        case "Z", "z":
            path.closeSubpath()
        default:
            break
        }
        lastCommand = cmd
    }
    return path
}
