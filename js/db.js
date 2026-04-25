class DBService {
    constructor() {
        this.db = null;
        this.isReady = false;
        this.config = null;
    }

    initialize(firebaseConfig) {
        if (!window.firebaseSDK || !firebaseConfig) return;
        
        try {
            const app = window.firebaseSDK.initializeApp(firebaseConfig);
            this.db = window.firebaseSDK.getFirestore(app);
            this.isReady = true;
            console.log("Firebase initialized successfully");
        } catch (err) {
            console.error("Firebase initialization failed:", err);
        }
    }

    async getTasks() {
        if (!this.isReady) return [...mockTasks];
        // Logic for fetching from Firestore
        return [...mockTasks]; // Fallback for now
    }

    async saveTask(task) {
        if (!this.isReady) {
            mockTasks.push(task);
            return;
        }
        
        try {
            const { collection, addDoc } = window.firebaseSDK;
            await addDoc(collection(this.db, "tasks"), task);
        } catch (err) {
            console.error("Error saving task:", err);
        }
    }

    // Real-time listener
    onTasksUpdate(callback) {
        if (!this.isReady) return;
        
        const { collection, onSnapshot, query, orderBy } = window.firebaseSDK;
        const q = query(collection(this.db, "tasks"), orderBy("timestamp", "desc"));
        
        return onSnapshot(q, (snapshot) => {
            const tasks = [];
            snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));
            callback(tasks);
        });
    }
}
