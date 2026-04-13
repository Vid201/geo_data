/**
 * Known Entity IDs from the Knowledge Graph Ontology
 *
 * These are system properties and types defined in the root space.
 * See knowledge-graph-ontology.md for the full registry.
 */

export const ROOT_SPACE_ID = "a19c345ab9866679b001d7d2138d88a1";
export const AI_SPACE_ID = "41e851610e13a19441c4d980f2f2ce6b";

// ─── Type IDs ────────────────────────────────────────────────────────────────

export const TYPES = {
    type: "e7d737c536764c609fa16aa64a8c90ad",  // Type — meta-type for type definitions
    property: "808a04ceb21c4d888ad12e240613e5ca",  // Property — meta-type for property definitions
    paper: "5e24fb52856c4189a9716af4387b1b89",
    person: "7ed45f2bc48b419e8e4664d5ff680b0d",
    space: "362c1dbddc6444bba3c4652f38a642d7",
    project: "484a18c5030a499cb0f2ef588ff16d50",
};

export const AI_TYPES = {
    dataset: "0c4babfb43893486af827341bbf32e09",
    model: "c7a4fc6d1afc53250a22d4209391dc79",
};

// ─── Property IDs ────────────────────────────────────────────────────────────

export const PROPERTIES = {
    name: "a126ca530c8e48d5b88882c734c38935",
    description: "9b1f76ff9711404c861e59dc3fa7d037",
    cover: "34f535072e6b42c5a84443981a77cfa2",
    abstract: "1d274ed52372471289614a50168a37aa",
    authors: "91a9e2f6e51a48f7997661de8561b690",
    tags: "257090341ba5406f94e4d4af90042fba",
    web_url: "412ff593e9154012a43d4c27ec5c68b6",
    doi: "7cb59354e30c48119e99ff62fcf61646",
    citation_count: "47ee87d8fac606d73e69d4c212804ffb",
    arxiv: "b1417e3a509237b8f32970b6bf6f227e",
    publish_date: "94e43fe8faf241009eb887ab4f999723",
    published_in: "8b87530a67774d93a9aa8321b7f10019",
    topics: "806d52bc27e94c9193c057978b093351",
    related_spaces: "5b722cd361d6494e88871310566437ba",
    // blocks: "beaba5cba67741a8b35377030613fc70",  // Blocks relation — attaches blocks to a parent entity
    // markdown_content: "e3e363d1dd294ccb8e6ff3b76d99bc33",  // Markdown body for a text block
    // data_source_type: "1f69cc9880d444abad493df6a7b15ee4",  // Declares query vs collection data source
    // filter: "14a46854bfd14b1882152785c2dab9f3",  // JSON-encoded filter for data blocks
    // collection_item: "a99f9ce12ffa4dac8c61f6310d46064a",  // Points to an entity in a collection
    // view: "1907fd1c81114a3ca378b1f353425b65",  // View preference on a Blocks relation
};

// ─── Data Source Singletons ──────────────────────────────────────────────────

export const QUERY_DATA_SOURCE = "3b069b04adbe4728917d1283fd4ac27e";
export const COLLECTION_DATA_SOURCE = "1295037a5d9c4d09b27c5502654b9177";

// ─── View Type IDs ───────────────────────────────────────────────────────────

export const VIEWS = {
    table: "cba271cef7c140339047614d174c69f1",  // Table view (default)
    list: "7d497dba09c249b8968f716bcf520473",  // List view
    gallery: "ccb70fc917f04a54b86e3b4d20cc7130",  // Gallery / grid view
    bullets: "0aaac6f7c916403eaf6d2e086dc92ada",  // Bulleted list view
};