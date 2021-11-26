const kDefaultThrottleMs = 1000;
class UpdateThrottler {
    constructor(minDurationMs, callback) {
        this.minDurationMs = minDurationMs;
        this.callback = callback;
        this.lastInvocationMs = 0;
        this.updatePending = false;
    }

    handleUpdate() {
        this.handleUpdateInner(/*fromTimer=*/false);
    }

    handleUpdateInner(fromTimer) {
        let nowMs = Date.now();
        let deltaMs = nowMs - this.lastInvocationMs;
        if (deltaMs >= this.minDurationMs) {
            this.lastInvocationMs = nowMs;
            this.updatePending = false;
            this.callback();
        } else if (!fromTimer && !this.updatePending
                 || fromTimer && this.updatePending) {
            // either:
            // 1. this is a true update that needs to be throttled and there is no
            //    timer check-in queued yet, or
            // 2. this is a timer check-in that raced with some true updates but there
            //    are still pending true updates that we need to queue for again
            this.updatePending = true;
            let desiredDelayMs = this.minDurationMs - deltaMs;
            setTimeout(() => { this.handleUpdateInner(/*fromTimer=*/true); }, desiredDelayMs);
        } else {
            // an update is already pending so drop this to throttle it
        }
    }
}

