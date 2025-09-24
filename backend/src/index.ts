import { startApi } from './api/server';
import { log } from './utils/log';

function main() {
    const apiStarted = startApi();
    if (!apiStarted) {
        log("error", "Failed to start API");
        return;
    }
}

main();