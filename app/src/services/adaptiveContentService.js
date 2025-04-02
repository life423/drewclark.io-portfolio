class InteractionTracker {
    // ...existing code...

    trackSectionView(sectionId, duration = null) {
        try {
            // ...existing code...
        } catch (error) {
            console.warn('Error tracking section view:', error)
            // Continue without breaking the application
        }
    }

    // Make sure your analytics don't break the app if they fail
    finalizeSession() {
        try {
            // Process end-of-session analytics
            const sessionData = this.getSessionData()

            // Optional: store anonymized data for future reference
            if (window.localStorage) {
                const sessionSummary = {
                    timestamp: Date.now(),
                    topSections: Object.keys(
                        sessionData.sectionEngagement
                    ).slice(0, 3),
                    duration: Date.now() - sessionData.entryTimestamp,
                }

                // Store only limited data
                this.storeAnonymizedSession(sessionSummary)
            }
        } catch (error) {
            console.warn('Error finalizing session:', error)
        }
    }
}
