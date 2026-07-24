/**
 * Catwalk's /balance/report doesn't return export-latest.json verbatim – it
 * serializes the plugin's internal object graph as a reflection tree:
 *
 *   object  → {"members": {key: node, …}}
 *   list    → {"elements": [node, …]}
 *   string  → {"value": "abyss"}
 *   boolean → {"value": true}
 *   number  → {"value": {"value": "28.0"}}   ← double-wrapped, digits as string
 *
 * This rebuilds the plain payload shape the parser expects. A body that is
 * already plain JSON (e.g. a future catwalk fix) passes through untouched, so
 * this stays safe to call unconditionally.
 */

const isObj = (x: unknown): x is Record<string, unknown> =>
    typeof x === 'object' && x !== null && !Array.isArray(x);

function decodeNode(node: unknown): unknown {
    if (!isObj(node)) return node;
    if ('members' in node && isObj(node.members)) {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(node.members)) out[k] = decodeNode(v);
        return out;
    }
    if ('elements' in node && Array.isArray(node.elements)) {
        return node.elements.map(decodeNode);
    }
    if ('value' in node) {
        const v = node.value;
        // double wrap = numeric (BigDecimal-style, stringified digits)
        if (isObj(v) && typeof v.value === 'string') {
            const n = Number(v.value);
            return Number.isFinite(n) ? n : v.value;
        }
        return isObj(v) ? decodeNode(v) : v;
    }
    return node; // plain object – never went through the tree serializer
}

/** Decode a /balance/report body if it carries the reflection tree, else pass through. */
export function decodeBalanceReport(data: unknown): unknown {
    return isObj(data) && 'members' in data ? decodeNode(data) : data;
}
