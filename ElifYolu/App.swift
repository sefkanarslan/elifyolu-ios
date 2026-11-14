import SwiftUI
import WebKit
import AVFoundation
import Speech
import UIKit

@main
struct ElifYoluApp: App {
    init() {
        // Recitations play even when the silent switch is on, like a media app.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
    var body: some Scene {
        WindowGroup {
            GameView()
                .ignoresSafeArea()
                .background(Color.white)
                .preferredColorScheme(.light)
        }
    }
}

/// Hosts the bundled game (www/) in a WKWebView and gives it native services:
/// Arabic speech recognition (recitation check) and haptic feedback.
struct GameView: UIViewRepresentable {
    func makeCoordinator() -> NativeBridge { NativeBridge() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .default()   // keeps progress (localStorage)

        // The game calls Android.exitApp() for the back button; iOS has none, so give it a no-op.
        // __iosSpeech tells recite.js that native recognition is available.
        let speechOK = SFSpeechRecognizer(locale: Locale(identifier: "ar-SA")) != nil
        let shim = "window.Android = { exitApp: function () {} }; window.__iosSpeech = \(speechOK);"
        config.userContentController.addUserScript(
            WKUserScript(source: shim, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        config.userContentController.add(context.coordinator, name: "native")

        let web = WKWebView(frame: .zero, configuration: config)
        context.coordinator.web = web
        web.isOpaque = false
        web.backgroundColor = .white
        web.scrollView.backgroundColor = .white
        web.scrollView.bounces = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsBackForwardNavigationGestures = false

        if let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            web.loadFileURL(index, allowingReadAccessTo: index.deletingLastPathComponent())
        }
        return web
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

final class NativeBridge: NSObject, WKScriptMessageHandler {
    weak var web: WKWebView?
    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ar-SA"))
    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var lastTexts: [String] = []
    private var finished = true

    func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let cmd = body["cmd"] as? String else { return }
        switch cmd {
        case "speechStart": start()
        case "speechStop": stop()
        case "haptic": haptic(body["style"] as? String ?? "light")
        default: break
        }
    }

    // MARK: haptics
    private func haptic(_ style: String) {
        DispatchQueue.main.async {
            switch style {
            case "success": UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "error": UINotificationFeedbackGenerator().notificationOccurred(.error)
            case "star": UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
            default: UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        }
    }

    // MARK: speech
    private func send(_ type: String, _ extra: [String: Any] = [:]) {
        var o = extra; o["type"] = type
        guard let data = try? JSONSerialization.data(withJSONObject: o),
              let json = String(data: data, encoding: .utf8) else { return }
        DispatchQueue.main.async { self.web?.evaluateJavaScript("window.__speech && window.__speech(\(json))") }
    }

    private func start() {
        guard let recognizer = recognizer else { send("error", ["error": "language"]); return }
        SFSpeechRecognizer.requestAuthorization { status in
            guard status == .authorized else { self.send("error", ["error": "permission"]); return }
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                guard granted else { self.send("error", ["error": "permission"]); return }
                DispatchQueue.main.async {
                    guard recognizer.isAvailable else { self.send("error", ["error": "network"]); return }
                    self.begin(recognizer)
                }
            }
        }
    }

    private func begin(_ recognizer: SFSpeechRecognizer) {
        stopEngine()
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker, .allowBluetooth])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch { send("error", ["error": "busy"]); return }

        let req = SFSpeechAudioBufferRecognitionRequest()
        req.shouldReportPartialResults = true
        if recognizer.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = false }
        request = req
        lastTexts = []
        finished = false

        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        input.removeTap(onBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in req.append(buffer) }
        engine.prepare()
        do { try engine.start() } catch { send("error", ["error": "busy"]); restorePlayback(); return }
        send("start"); send("ready")

        task = recognizer.recognitionTask(with: req) { [weak self] result, error in
            guard let self = self, !self.finished else { return }
            if let result = result {
                var texts = [result.bestTranscription.formattedString]
                for t in result.transcriptions where t.formattedString != texts[0] { texts.append(t.formattedString) }
                self.lastTexts = Array(texts.prefix(5))
                if result.isFinal { self.finish(final: true); return }
                self.send("partial", ["texts": self.lastTexts])
            }
            if let error = error as NSError? {
                if !self.lastTexts.isEmpty { self.finish(final: true) }
                else { self.finished = true; self.stopEngine(); self.restorePlayback()
                       self.send("error", ["error": error.code == 1110 ? "silence" : "nomatch"]) }
            }
        }
    }

    private func stop() {
        guard !finished else { return }
        request?.endAudio()          // the recogniser then delivers a final result
        engine.stop()
        engine.inputNode.removeTap(onBus: 0)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self, !self.finished else { return }
            self.finish(final: true)  // no final callback came: use what we heard
        }
    }

    private func finish(final: Bool) {
        if finished { return }
        finished = true
        stopEngine()
        restorePlayback()
        send(lastTexts.isEmpty ? "end" : "final", ["texts": lastTexts])
    }

    private func stopEngine() {
        if engine.isRunning { engine.stop() }
        engine.inputNode.removeTap(onBus: 0)
        task?.cancel(); task = nil
        request = nil
    }

    private func restorePlayback() {
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
}
