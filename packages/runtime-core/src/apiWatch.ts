import { ReactiveEffect } from "@mini-vue/reactivity";
import { queueFlushCb } from "./scheduler";

export function watchEffect(source: any){
    function job() {
        effect.run()
    }

    let cleanup: any;
    const onCleanup = function (fn: any){
        cleanup = effect.onStop = () => {
            fn()
        }
    }

    function getter() {
        if (cleanup){
            cleanup()
        }

        source(onCleanup)
    }

    const effect = new ReactiveEffect(getter,()=> {
        queueFlushCb(job)
    })

    effect.run()

    return () => {
        effect.stop()
    }
}