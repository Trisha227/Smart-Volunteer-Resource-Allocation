/**
 * ImpactConnect Voice Service
 * Uses the Web Speech API (100% FREE, no API key needed) to capture
 * field worker voice notes and auto-fill the Ingest form via Gemini.
 */
class VoiceService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Starts the microphone and returns a Promise that resolves with transcript.
     */
    startListening(onInterimResult, onFinalResult, onError) {
        if (!this.isSupported) {
            onError('Voice input is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) onInterimResult(interimTranscript);
            if (finalTranscript) {
                this.isListening = false;
                onFinalResult(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            const errorMessages = {
                'not-allowed': 'Microphone access denied. Please allow microphone in browser settings.',
                'no-speech': 'No speech detected. Please try again.',
                'network': 'Network error. Please check your connection.',
                'aborted': 'Recording was stopped.'
            };
            onError(errorMessages[event.error] || `Voice error: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.start();
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}
