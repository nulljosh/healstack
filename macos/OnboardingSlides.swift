import SwiftUI

/// The three screens a first-time, signed-out visitor sees. Shared by iOS and macOS.
let healstackOnboardingSlides = [
    OnboardingSlide(symbol: "pills",
                    title: "Track what you take",
                    body: "Log supplements and medications with the dose and timing you actually follow, not an idealised version."),
    OnboardingSlide(symbol: "checklist",
                    title: "Tick it off daily",
                    body: "A single daily list keeps the routine honest, and the streak shows where it slipped."),
    OnboardingSlide(symbol: "chart.line.uptrend.xyaxis",
                    title: "See what is working",
                    body: "Stack your notes and symptoms against the schedule to find out which additions earned their place."),
]
