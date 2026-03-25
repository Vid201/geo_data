/**
 * Publishing AI Papers to the Knowledge Graph
 *
 * This script demonstrates how to:
 *   1. Read AI paper data from JSON files
 *   2. Convert them into Graph operations using the Geo SDK
 *   3. Publish the operations to a space on the Geo testnet
 *
 * Usage:
 *   bun run publish
 *
 * Prerequisites:
 *   - Set DEMO_SPACE_ID in .env to the space you want to publish to
 *   - Set PK_SW to the private key of your smart wallet
 */

import * as fs from "fs";
import dotenv from "dotenv";
import { Graph, type Op } from "@geoprotocol/geo-sdk";
import { printOps, publishOps } from "../src/functions";
import { TYPES, PROPERTIES } from "../src/constants";

dotenv.config();

// ─── Property Registry ──────────────────────────────────────────────────────
// Maps JSON field names to their property ID and value type.
// To add a new property, just add an entry here — no other code changes needed.

const VALUE_PROPERTIES: Record<string, { id: string; type: "text" | "date" }> = {
    // name: { id: PROPERTIES.name, type: "text" },
    // description: { id: PROPERTIES.description, type: "text" },
    // cover (TODO)
    // authors: { id: PROPERTIES.authors, type: "text" },
    publish_date: { id: PROPERTIES.publish_date, type: "date" },
    // published_in: { id: PROPERTIES.published_in, type: "text" },
    web_url: { id: PROPERTIES.web_url, type: "text" },
    // abstract: { id: PROPERTIES.abstract, type: "text" },
    // related_topics: { id: PROPERTIES.related_topics, type: "text" },
    // related_spaces: { id: PROPERTIES.related_spaces, type: "text" },
    // tags: { id: PROPERTIES.tags, type: "text" },
};

// Build a values array from any entity data object using the registry above.
// Date values should be RFC 3339 strings (e.g. "2023-01-01") — the SDK parses them internally.
function extractValues(data: Record<string, any>) {
    const values: any[] = [];
    for (const [field, meta] of Object.entries(VALUE_PROPERTIES)) {
        if (data[field] != null) {
            values.push({ property: meta.id, type: meta.type, value: data[field] });
        }
    }
    return values;
}

// ─── JSON Data Types ─────────────────────────────────────────────────────────

type PersonData = {
    name: string;
};

type PaperData = {
    name: string;
    description: string;
    // cover (TODO)
    authors: string[];
    publish_date: string;
    published_in: string;
    web_url: string;
    abstract: string;
    related_topics: string;
    related_spaces: string;
    tags: string;
};

// ─── Main: Build Entities & Publish ──────────────────────────────────────────

async function main() {
    console.log("=== Geo SDK Demo: Publishing Entities ===\n");

    // ── Step 1: Read JSON data ──────────────────────────────────────────────
    console.log("Step 1: Reading entity data from JSON files...");

    const people: PersonData[] = JSON.parse(
        fs.readFileSync("./data/people_to_publish.json", "utf-8")
    );

    const papers: PaperData[] = JSON.parse(
        fs.readFileSync("./data/paper_to_publish.json", "utf-8")
    );

    console.log(`  Loaded: ${papers.length} papers, ${people.length} people\n`);

    const allOps: Op[] = [];

    // ── Step 2: Create all entities ───────────────────────────────────────
    console.log("Step 2: Creating all entities...");

    // First we should handle dependencies (authors, ...)
    const peopleIdsByName: Record<string, string> = {};
    for (const person of people) {
        const { id, ops } = Graph.createEntity({
            name: person.name,
            types: [TYPES.person],
            values: extractValues(person),
        });

        peopleIdsByName[person.name] = id;
        allOps.push(...ops);
        console.log(`  Created person: "${person.name}" → ${id}`);
    }

    const paperIdsByName: Record<string, string> = {};

    for (const paper of papers) {
        const values = extractValues(paper);

        // Build people relations
        const peopleRelations = (paper.authors || [])
            .filter((t) => peopleIdsByName[t])
            .map((t) => ({ toEntity: peopleIdsByName[t] }));

        const relations: Record<string, Array<{ toEntity: string }>> = {};
        if (peopleRelations.length > 0) {
            relations[PROPERTIES.authors] = peopleRelations;
        }

        const { id, ops } = Graph.createEntity({
            name: paper.name,
            description: paper.description,
            types: [TYPES.paper],
            values,
            relations,
        });

        paperIdsByName[paper.name] = id;
        allOps.push(...ops);
        console.log(`  Created paper: "${paper.name}" → ${id}`);
    }

    // ── Step 3: Summary ───────────────────────────────────────────────────────
    console.log(`\n--- Step 3: Summary ---`);
    console.log(`Total operations generated: ${allOps.length}`);
    console.log(`Operation breakdown:`);

    const opCounts: Record<string, number> = {};
    for (const op of allOps) {
        opCounts[op.type] = (opCounts[op.type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(opCounts)) {
        console.log(`  ${type}: ${count}`);
    }

    // ── Step 4: Publish ───────────────────────────────────────────────────────
    console.log("\nStep 4: Publishing to the Geo knowledge graph...");
    printOps(allOps, "data", "demo_publish_ops.json")
    const txHash = await publishOps(allOps, "Demo: publish AI papers");
    console.log(`\nDone! Transaction: ${txHash}`);

    // // ── Step 5: How to verify ─────────────────────────────────────────────────
    const spaceId = process.env.DEMO_SPACE_ID;
    console.log(`\nStep 5: Verify your entities at:`);
    console.log(`  https://geobrowser.io/space/${spaceId}`);
    console.log(`\nOr query the API with: bun run api`);
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});