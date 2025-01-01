const os = require('os');

const envVariables = {
    level: process.env.telemetry_log_level || 'info',
    localStorageEnabled: process.env.telemetry_local_storage_enabled || 'true',
    telemetryProxyEnabled: process.env.telemetry_proxy_enabled,
    dispatcher: process.env.TELEMETRY_LOCAL_STORAGE_TYPE || 'postgres',
    proxyURL: process.env.telemetry_proxy_url,
    proxyAuthKey: process.env.telemetry_proxy_auth_key,
    encodingType: process.env.telemetry_encoding_type,
    kafkaHost: process.env.telemetry_kafka_broker_list,
    topic: process.env.telemetry_kafka_topic,
    compression_type: process.env.telemetry_kafka_compression || 'none',
    filename: process.env.telemetry_file_filename || 'telemetry-%DATE%.log',
    maxSize: process.env.telemetry_file_maxsize || '100m',
    maxFiles: process.env.telemetry_file_maxfiles || '100',
    partitionBy: process.env.telemetry_cassandra_partition_by || 'hour',
    keyspace: process.env.telemetry_cassandra_keyspace,
    contactPoints: (process.env.telemetry_cassandra_contactpoints || 'localhost').split(','),
    cassandraTtl: process.env.telemetry_cassandra_ttl,
    port: process.env.telemetry_service_port || 9001,
    threads: process.env.telemetry_service_threads || os.cpus().length,
    host: process.env.TELEMETRY_PG_HOST || 'postgresql.aml-dev.svc.cluster.local',
    username: process.env.TELEMETRY_PG_USERNAME || 'postgres',
    password: process.env.TELEMETRY_PG_PASSWORD || 'postgres',
    db: process.env.TELEMETRY_PG_DB || 'aml_service',
    tableName: process.env.TELEMETRY_PG_TABLENAME || 'telemetry_data',
    dataExtract: process.env.TELEMETRY_DATAEXTRACT || 'true'
}
module.exports = envVariables;