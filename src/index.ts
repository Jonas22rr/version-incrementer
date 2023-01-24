#!/usr/bin/env node
import { incrementVersion } from "./incrementer.js";

(async () => {
    await incrementVersion();
})();