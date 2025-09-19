import { startApi } from './api/server';

function main() {
    const apiStarted = startApi();
    if (!apiStarted) {
        console.error("Failed to start API");
        return;
    }
}

main();