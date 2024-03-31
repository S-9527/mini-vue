const queue: any[] = []
const activePreFlushCbs: any[] = []

const p = Promise.resolve()
let isFlushPending = false

export function nextTick(fn?: any) {
    return fn ? p.then(fn) : p
}

export function queueJobs(job: any) {
    if (!queue.includes(job)) {
        queue.push(job);
    }

    queueFlush();
}

export function queueFlushCb(job: any){
    activePreFlushCbs.push(job)

    queueFlush()
}

function queueFlush() {
    if (isFlushPending) return;
    isFlushPending = true;

    nextTick(flushJobs);
}

function flushPreFlushCbs(){
    for (let i = 0; i < activePreFlushCbs.length; i++) {
        activePreFlushCbs[i]()
    }
}

function flushJobs() {
    isFlushPending = false;

    flushPreFlushCbs()

    let job;
    while (job = queue.shift()) {
        job && job()
    }
}