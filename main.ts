// CLI Worker
const cliWorker = new Worker(new URL("./cli_worker.ts", import.meta.url).href, {
    type: "module",
    deno: { namespace: true }
});
