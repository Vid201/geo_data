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

const VALUE_PROPERTIES: Record<string, { id: string; type: "text" | "date" | "integer" }> = {
    // name: { id: PROPERTIES.name, type: "text" }, -- this is automatically
    // description: { id: PROPERTIES.description, type: "text" }, -- this is automatically
    publish_date: { id: PROPERTIES.publish_date, type: "date" },
    web_url: { id: PROPERTIES.web_url, type: "text" },
    abstract: { id: PROPERTIES.abstract, type: "text" },
    doi: { id: PROPERTIES.doi, type: "text" },
    citation_count: { id: PROPERTIES.citation_count, type: "integer" },
    arxiv: { id: PROPERTIES.arxiv, type: "text" },
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

type ProjectData = {
    name: string;
};

type PaperData = {
    name: string;
    description: string;
    cover: string;
    authors: string[];
    publish_date: string;
    published_in: string[];
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

    const projects: ProjectData[] = JSON.parse(
        fs.readFileSync("./data/project_to_publish.json", "utf-8")
    );

    const papers: PaperData[] = JSON.parse(
        fs.readFileSync("./data/paper_to_publish.json", "utf-8")
    );

    console.log(`  Loaded: ${papers.length} papers, ${people.length} people\n`);

    const allOps: Op[] = [];

    // ── Step 2: Create all entities ───────────────────────────────────────
    console.log("Step 2: Creating all entities...");

    // First we should handle dependencies (authors, related_spaces, published_in, etc.)
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
    const projectsIdsByName: Record<string, string> = {};
    for (const project of projects) {
        const { id, ops } = Graph.createEntity({
            name: project.name,
            types: [TYPES.project],
            values: extractValues(project),
        });
        projectsIdsByName[project.name] = id;
        allOps.push(...ops);
        console.log(`  Created project: "${project.name}" → ${id}`);
    }

    const paperIdsByName: Record<string, string> = {};
    for (const paper of papers) {
        const values = extractValues(paper);

        // Build people relations
        const peopleRelations = (paper.authors || [])
            .filter((t) => peopleIdsByName[t])
            .map((t) => ({ toEntity: peopleIdsByName[t] }));

        // Build project relations
        const projectRelations = (paper.published_in || [])
            .filter((t) => projectsIdsByName[t])
            .map((t) => ({ toEntity: projectsIdsByName[t] }));

        const relations: Record<string, Array<{ toEntity: string }>> = {};
        if (peopleRelations.length > 0) {
            relations[PROPERTIES.authors] = peopleRelations;
        }
        if (projectRelations.length > 0) {
            relations[PROPERTIES.published_in] = projectRelations;
        }

        const { id: paperId, ops } = Graph.createEntity({
            name: paper.name,
            description: paper.description,
            types: [TYPES.paper],
            values,
            relations,
        });

        paperIdsByName[paper.name] = paperId;
        allOps.push(...ops);
        console.log(`  Created paper: "${paper.name}" → ${paperId}`);

        if (paper.cover) {
            const { id: imageId, ops: imageOps } = await Graph.createImage({
                url: paper.cover, // must be a URL, not a local path
                name: `${paper.name} Cover`,
                network: "TESTNET",
            });
            allOps.push(...imageOps);
            // Attach as cover relation
            const { ops: coverOps } = Graph.createRelation({
                fromEntity: paperId,
                toEntity: imageId,
                type: PROPERTIES.cover, // need to add cover property ID to constants
            });
            allOps.push(...coverOps);
        }
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