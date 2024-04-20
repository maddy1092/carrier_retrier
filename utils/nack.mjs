export function getNackUrl(merchant_id) {
    return `${merchant_id}/api/v1/eventbus/elasticsearch/retry`;
}