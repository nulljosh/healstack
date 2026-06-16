import Foundation
import HealthKit
import Observation

@MainActor
@Observable
final class HealthKitService {
    var heartRate: Double?
    var restingHeartRate: Double?
    var hrv: Double?
    var respiratoryRate: Double?
    var bloodOxygen: Double?
    var steps: Int?
    var activeEnergy: Double?
    var bodyMass: Double?
    var sleepHours: Double?
    var walkingDistance: Double?
    var systolicBP: Int?
    var diastolicBP: Int?
    var dietaryWater: Double?
    var dietaryCaffeine: Double?
    var bodyTemperature: Double?
    var environmentalAudioExposure: Double?
    var toothbrushingToday: Bool?
    var moodScore: Double?
    var isAuthorized = false
    var lastError: String?

    private let store: HKHealthStore?

    static var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    init() {
        store = Self.isAvailable ? HKHealthStore() : nil
    }

    func requestAuthorization() async {
        guard let store else { return }

        var readTypes: Set<HKObjectType> = [
            HKQuantityType(.heartRate),
            HKQuantityType(.restingHeartRate),
            HKQuantityType(.heartRateVariabilitySDNN),
            HKQuantityType(.respiratoryRate),
            HKQuantityType(.oxygenSaturation),
            HKQuantityType(.stepCount),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.bodyMass),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.bloodPressureSystolic),
            HKQuantityType(.bloodPressureDiastolic),
            HKQuantityType(.dietaryWater),
            HKQuantityType(.dietaryCaffeine),
            HKQuantityType(.bodyTemperature),
            HKQuantityType(.environmentalAudioExposure),
            HKCategoryType(.toothbrushingEvent),
            HKCategoryType(.sleepAnalysis),
            HKQuantityType(.appleExerciseTime),
        ]
        if #available(iOS 18.0, *) {
            readTypes.insert(HKSampleType.stateOfMindType())
        }

        do {
            try await store.requestAuthorization(toShare: [], read: readTypes)
            isAuthorized = true
        } catch {
            lastError = error.localizedDescription
        }
    }

    func fetchAll() async {
        guard let store, isAuthorized else { return }

        async let hr = latestQuantity(store: store, type: .heartRate, unit: HKUnit(from: "count/min"))
        async let rhr = latestQuantity(store: store, type: .restingHeartRate, unit: HKUnit(from: "count/min"))
        async let hrvVal = latestQuantity(store: store, type: .heartRateVariabilitySDNN, unit: .secondUnit(with: .milli))
        async let rr = latestQuantity(store: store, type: .respiratoryRate, unit: HKUnit(from: "count/min"))
        async let spo2 = latestQuantity(store: store, type: .oxygenSaturation, unit: .percent())
        async let energy = todaySum(store: store, type: .activeEnergyBurned, unit: .kilocalorie())
        async let dist = todaySum(store: store, type: .distanceWalkingRunning, unit: .mile())
        async let mass = latestQuantity(store: store, type: .bodyMass, unit: .pound())
        async let water = todaySum(store: store, type: .dietaryWater, unit: .literUnit(with: .milli))
        async let caffeine = todaySum(store: store, type: .dietaryCaffeine, unit: .gramUnit(with: .milli))
        async let temp = latestQuantity(store: store, type: .bodyTemperature, unit: .degreeFahrenheit())
        async let audio = latestQuantity(store: store, type: .environmentalAudioExposure, unit: .decibelAWeightedSoundPressureLevel())
        async let sysBP = latestQuantity(store: store, type: .bloodPressureSystolic, unit: .millimeterOfMercury())
        async let diaBP = latestQuantity(store: store, type: .bloodPressureDiastolic, unit: .millimeterOfMercury())

        heartRate = await hr
        restingHeartRate = await rhr
        hrv = await hrvVal
        respiratoryRate = await rr
        if let raw = await spo2 { bloodOxygen = raw * 100 } else { bloodOxygen = nil }
        activeEnergy = await energy
        walkingDistance = await dist
        bodyMass = await mass
        dietaryWater = await water
        dietaryCaffeine = await caffeine
        bodyTemperature = await temp
        environmentalAudioExposure = await audio
        if let sys = await sysBP { systolicBP = Int(sys) } else { systolicBP = nil }
        if let dia = await diaBP { diastolicBP = Int(dia) } else { diastolicBP = nil }

        steps = await todaySteps(store: store)
        sleepHours = await todaySleep(store: store)
        toothbrushingToday = await todayToothbrushing(store: store)
        moodScore = await todayMood(store: store)
    }

    // MARK: - Helpers

    private func latestQuantity(store: HKHealthStore, type: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        let quantityType = HKQuantityType(type)
        let predicate = HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: Date()), end: Date())
        let descriptor = HKSampleQueryDescriptor(
            predicates: [.quantitySample(type: quantityType, predicate: predicate)],
            sortDescriptors: [SortDescriptor(\.startDate, order: .reverse)],
            limit: 1
        )
        guard let sample = try? await descriptor.result(for: store).first else { return nil }
        return sample.quantity.doubleValue(for: unit)
    }

    private func todaySum(store: HKHealthStore, type: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        let quantityType = HKQuantityType(type)
        let predicate = HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: Date()), end: Date())
        let descriptor = HKStatisticsQueryDescriptor(
            predicate: .quantitySample(type: quantityType, predicate: predicate),
            options: .cumulativeSum
        )
        guard let result = try? await descriptor.result(for: store),
              let sum = result.sumQuantity() else { return nil }
        return sum.doubleValue(for: unit)
    }

    private func todaySteps(store: HKHealthStore) async -> Int? {
        guard let value = await todaySum(store: store, type: .stepCount, unit: .count()) else { return nil }
        return Int(value)
    }

    private func todaySleep(store: HKHealthStore) async -> Double? {
        let sleepType = HKCategoryType(.sleepAnalysis)
        let start = Calendar.current.date(byAdding: .day, value: -1, to: Calendar.current.startOfDay(for: Date()))!
        let predicate = HKQuery.predicateForSamples(withStart: start, end: Date())
        let descriptor = HKSampleQueryDescriptor(
            predicates: [.categorySample(type: sleepType, predicate: predicate)],
            sortDescriptors: [SortDescriptor(\.startDate)],
            limit: 100
        )
        guard let samples = try? await descriptor.result(for: store) else { return nil }
        let asleep = samples.filter { $0.value != HKCategoryValueSleepAnalysis.inBed.rawValue }
        let total = asleep.reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) }
        return total > 0 ? total / 3600.0 : nil
    }

    private func todayToothbrushing(store: HKHealthStore) async -> Bool? {
        let brushType = HKCategoryType(.toothbrushingEvent)
        let predicate = HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: Date()), end: Date())
        let descriptor = HKSampleQueryDescriptor(
            predicates: [.categorySample(type: brushType, predicate: predicate)],
            sortDescriptors: [SortDescriptor(\.startDate, order: .reverse)],
            limit: 1
        )
        guard let samples = try? await descriptor.result(for: store) else { return nil }
        return !samples.isEmpty
    }

    private func todayMood(store: HKHealthStore) async -> Double? {
        guard #available(iOS 18.0, *) else { return nil }
        let sampleType = HKSampleType.stateOfMindType()
        let predicate = HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: Date()), end: Date())
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: sampleType, predicate: predicate, limit: 1, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, samples, _ in
                guard let sample = samples?.first as? HKStateOfMind else {
                    continuation.resume(returning: nil)
                    return
                }
                // Valence ranges -1.0 to 1.0, map to 1-10 scale
                let score = ((sample.valence + 1.0) / 2.0) * 9.0 + 1.0
                continuation.resume(returning: score)
            }
            store.execute(query)
        }
    }
}
